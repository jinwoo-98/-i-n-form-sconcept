"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from "../ui/button";
import { Settings, Zap, Loader2, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import {
  BUDGET_DEFAULT, ROOM_NAMES, STAGES, PURPOSES, CONSULT_TYPES, PEAK_HOURS, TIMELINE_OPTIONS
} from '../../constants/booking';
import { showSuccess, showError, showLoading, dismissToast } from '../../utils/toast';
import { supabase } from "@/integrations/supabase/client";

import PersonalInfoSection from './PersonalInfoSection';
import StageSection from './StageSection';
import RoomDetailsSection from './RoomDetailsSection';
import AppointmentSection from './AppointmentSection';
import FileNoteSection from './FileNoteSection';
import StepIndicator from './StepIndicator';

interface BookingFormProps {
  onSuccess: (data: any) => void;
  onOpenSettings: () => void;
}

const STEP_LABELS = [
  'Thông tin cá nhân',
  'Giai đoạn của bạn',
  'Chi tiết căn hộ',
  'Lịch hẹn tư vấn',
  'Tài liệu & ghi chú'
];

const BookingForm = ({ onSuccess, onOpenSettings }: BookingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showScrollHint, setShowScrollHint] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    stage: '',
    timeline: '',
    room: '',
    purpose: 'live',
    budget: '',
    city: '',
    otherCity: '',
    consultType: '',
    date: '',
    time: '',
    note: ''
  });

  const [files, setFiles] = useState<File[]>([]);
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('tgh_bcfg');
    return saved ? JSON.parse(saved) : BUDGET_DEFAULT;
  });

  // Logic kiểm tra trạng thái cuộn
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isNotAtBottom = scrollHeight - scrollTop - clientHeight > 20;
      setShowScrollHint(isNotAtBottom);
    }
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'app_config')
          .maybeSingle();

        if (data && data.value) {
          setConfig(data.value);
          localStorage.setItem('tgh_bcfg', JSON.stringify(data.value));
        }
      } catch (err) {
        console.error("Lỗi khi đồng bộ cấu hình:", err);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', checkScroll);
      const timeoutId = setTimeout(checkScroll, 100); 
      const observer = new ResizeObserver(checkScroll);
      observer.observe(scrollEl);

      return () => {
        scrollEl.removeEventListener('scroll', checkScroll);
        observer.disconnect();
        clearTimeout(timeoutId);
      };
    }
  }, [currentStep, formData, errors]);

  const validateField = (name: string, value: string) => {
    let error = "";
    if (name === 'name' && !value.trim()) {
      error = "Vui lòng nhập họ và tên";
    } else if (name === 'phone') {
      const phoneRegex = /^0\d{9}$/;
      if (!value) error = "Vui lòng nhập số điện thoại";
      else if (!phoneRegex.test(value)) error = "Số điện thoại phải có 10 số và bắt đầu bằng 0";
    } else if (name === 'email') {
      if (value.trim()) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(value)) {
          error = "Email không hợp lệ";
        }
      }
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleBlur = (field: string) => {
    validateField(field, (formData as any)[field]);
  };

  const dates = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 0; i < 10; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      days.push({
        key: d.toISOString().split('T')[0],
        dow: i === 0 ? 'Hôm nay' : ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()],
        dom: d.getDate(),
        mon: `Th${d.getMonth() + 1}`,
        isWeekend: d.getDay() === 0 || d.getDay() === 6
      });
    }
    return days;
  }, []);

  const slots = useMemo(() => {
    if (!formData.date) return [];
    const duration = 30;
    const ranges = [
      { s: '09:00', e: '11:30', l: 'Sáng' },
      { s: '13:30', e: '17:00', l: 'Chiều' },
    ];

    const result: any[] = [];
    const now = new Date();
    const isToday = formData.date === now.toISOString().split('T')[0];

    ranges.forEach(range => {
      let [h, m] = range.s.split(':').map(Number);
      const [eh, em] = range.e.split(':').map(Number);
      while (h * 60 + m + duration <= eh * 60 + em) {
        const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        if (!isToday || (h * 60 + m > now.getHours() * 60 + now.getMinutes() + 30)) {
          result.push({ time, label: range.l, isPeak: PEAK_HOURS.includes(time) });
        }
        m += duration; if (m >= 60) { h++; m -= 60; }
      }
    });
    return result;
  }, [formData.date]);

  const formatMoney = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + ' tỉ';
    return Math.round(n) + ' triệu';
  };

  const budgetOptions = useMemo(() => {
    if (!formData.room) return [];
    const base = config[formData.room] || config.other || BUDGET_DEFAULT.other;
    const mult = formData.purpose === 'homestay' ? (config.hmMult || 0.7) : 1;
    const vals = base.map((v: number) => Math.round(v * mult));
    return [
      { id: 't0', icon: '🪑', name: 'Vài món chính', range: `Dưới ${formatMoney(vals[0])}` },
      { id: 't1', icon: '🛋️', name: 'Nội thất theo phòng', range: `${formatMoney(vals[0])} — ${formatMoney(vals[1])}` },
      { id: 't2', icon: '🏡', name: 'Trọn bộ', range: `Trên ${formatMoney(vals[1])}` }
    ];
  }, [formData.room, formData.purpose, config]);

  const validateStep = (step: number): { valid: boolean; message?: string } => {
    switch (step) {
      case 0: {
        const nameErr = validateField('name', formData.name);
        const phoneErr = validateField('phone', formData.phone);
        const emailErr = validateField('email', formData.email);
        if (nameErr || phoneErr || emailErr) {
          return { valid: false, message: "Vui lòng kiểm tra lại thông tin cá nhân" };
        }
        return { valid: true };
      }
      case 1:
        if (!formData.stage) return { valid: false, message: "Vui lòng chọn giai đoạn hiện tại của Anh/Chị" };
        if (!formData.timeline) return { valid: false, message: "Vui lòng chọn thời gian dự kiến sử dụng nội thất" };
        return { valid: true };
      case 2:
        if (!formData.room) return { valid: false, message: "Vui lòng chọn loại căn hộ" };
        if (!formData.budget) return { valid: false, message: "Vui lòng chọn mức đầu tư dự kiến" };
        if (!formData.city) return { valid: false, message: "Vui lòng chọn tỉnh / thành phố" };
        if (formData.city === 'other' && !formData.otherCity.trim()) {
          return { valid: false, message: "Vui lòng nhập tên tỉnh / thành phố của bạn" };
        }
        return { valid: true };
      case 3:
        if (!formData.consultType) return { valid: false, message: "Vui lòng chọn hình thức tư vấn" };
        if (!formData.date) return { valid: false, message: "Vui lòng chọn ngày mong muốn" };
        if (!formData.time) return { valid: false, message: "Vui lòng chọn khung giờ mong muốn" };
        return { valid: true };
      default:
        return { valid: true };
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };

  const handleNext = () => {
    const result = validateStep(currentStep);
    if (!result.valid) {
      showError(result.message || "Vui lòng hoàn tất các trường bắt buộc");
      return;
    }
    setCompletedSteps(prev => new Set(prev).add(currentStep));
    if (currentStep < STEP_LABELS.length - 1) {
      goToStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) goToStep(currentStep - 1);
  };

  const uploadFiles = async () => {
    const uploadedUrls = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const toastId = showLoading(`Đang tải lên tệp tin (${i + 1}/${files.length}): ${file.name}...`);
      
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, file);

        dismissToast(toastId);

        if (uploadError) {
          console.error("Lỗi tải file lên Storage:", uploadError);
          throw new Error(`Không thể tải lên tệp tin "${file.name}". Lỗi: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('attachments')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      } catch (err: any) {
        dismissToast(toastId);
        console.error("Lỗi hệ thống khi tải file:", err);
        throw err;
      }
    }
    return uploadedUrls;
  };

  const handleSubmit = async () => {
    const result = validateStep(currentStep);
    if (!result.valid) {
      showError(result.message || "Vui lòng hoàn tất các trường bắt buộc");
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedFiles = await uploadFiles();

      const stageTitle = STAGES.find(s => s.id === formData.stage)?.title || formData.stage;
      
      const timelineOption = TIMELINE_OPTIONS.find(t => t.id === formData.timeline);
      const timelineTitle = timelineOption 
        ? `${timelineOption.label} (${timelineOption.desc})` 
        : formData.timeline;

      const stageName = `${stageTitle} | Dự kiến: ${timelineTitle}`;

      const roomName = ROOM_NAMES[formData.room] || formData.room;
      const purposeName = PURPOSES.find(p => p.id === formData.purpose)?.title || formData.purpose;
      const consultName = CONSULT_TYPES.find(t => t.id === formData.consultType)?.title || formData.consultType;
      const budgetOption = budgetOptions.find(b => b.id === formData.budget);
      const budgetText = budgetOption ? `${budgetOption.name} (${budgetOption.range})` : formData.budget;

      const cityMap: Record<string, string> = { hanoi: 'Hà Nội', hcm: 'TP. Hồ Chí Minh', danang: 'Đà Nẵng' };
      const cityName = formData.city === 'other' ? formData.otherCity : (cityMap[formData.city] || formData.city);

      const roomWithPurpose = `${roomName} | Mục đích: ${purposeName}`;

      const { error: dbError } = await supabase
        .from('bookings')
        .insert([{
          customer_name: formData.name,
          phone: formData.phone,
          email: formData.email,
          city: cityName,
          room_type: roomWithPurpose,
          stage: stageName,
          budget_type: budgetText,
          consult_type: consultName,
          appointment_date: formData.date,
          appointment_time: formData.time,
          note: formData.note,
          attachments: uploadedFiles
        }]);

      if (dbError) throw dbError;

      showSuccess("Đặt lịch thành công!");
      onSuccess({ ...formData, city: cityName, files: uploadedFiles, timestamp: new Date().toISOString() });
    } catch (error: any) {
      console.error("Error submitting booking:", error);
      showError(`Không thể hoàn tất đặt lịch: ${error.message || error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = (step: number) => {
    switch (step) {
      case 0:
        return <PersonalInfoSection formData={formData} setFormData={setFormData} errors={errors} onBlur={handleBlur} />;
      case 1:
        return (
          <StageSection 
            selectedStage={formData.stage} 
            onSelectStage={(id) => setFormData({ ...formData, stage: id })} 
            selectedTimeline={formData.timeline}
            onSelectTimeline={(id) => setFormData({ ...formData, timeline: id })}
            errors={{
              stage: !formData.stage && completedSteps.has(1) ? "Vui lòng chọn giai đoạn" : "",
              timeline: !formData.timeline && completedSteps.has(1) ? "Vui lòng chọn thời gian" : ""
            }}
          />
        );
      case 2:
        return <RoomDetailsSection formData={formData} setFormData={setFormData} budgetOptions={budgetOptions} />;
      case 3:
        return (
          <AppointmentSection 
            formData={formData} 
            setFormData={setFormData} 
            dates={dates} 
            slots={slots} 
            errors={{
              consultType: !formData.consultType && completedSteps.has(3),
              date: !formData.date && completedSteps.has(3),
              time: !formData.time && completedSteps.has(3)
            }}
          />
        );
      case 4:
        return <FileNoteSection files={files} setFiles={setFiles} note={formData.note} setNote={(note) => setFormData({ ...formData, note })} />;
      default:
        return null;
    }
  };

  const isLastStep = currentStep === STEP_LABELS.length - 1;

  return (
    <div className="w-full h-full min-h-0 bg-white rounded-[24px] md:rounded-[32px] shadow-xl md:shadow-2xl relative border border-vugia-sand/60 flex flex-col [transform:translateZ(0)]">
      {/* Container phụ trách bo góc & cắt phần tràn (bao gồm bóng mờ của thanh điều hướng ở chân trang) */}
      <div className="relative w-full h-full flex flex-col overflow-hidden rounded-[23px] md:rounded-[31px]">
        
        <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-vugia-cream hover:bg-vugia-sand transition-colors h-8 w-8 md:h-9 md:w-9"
            onClick={onOpenSettings}
            aria-label="Cài đặt"
          >
            <Settings className="w-3.5 h-3.5 text-vugia-gold" />
          </Button>
        </div>

        <div className="h-1.5 w-full bg-gradient-to-r from-vugia-navy via-vugia-accent to-vugia-navy flex-shrink-0" />

        <div className="px-5 pt-4 md:px-8 md:pt-6 flex-shrink-0">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-1 bg-vugia-accent text-vugia-navy text-[10px] md:text-[11px] font-bold px-3 py-0.5 rounded-full mb-2 tracking-[0.1em] uppercase">
              <Zap className="w-3 h-3 fill-current" /> Miễn phí 100%
            </div>
            <h1 className="font-sans text-[20px] md:text-[26px] font-extrabold text-vugia-navy leading-tight tracking-tight">
              Đặt lịch tư vấn nội thất
            </h1>
          </div>

          <StepIndicator
            current={currentStep}
            total={STEP_LABELS.length}
            labels={STEP_LABELS}
            completedSteps={completedSteps}
            onStepClick={(s) => goToStep(s)}
          />
        </div>

        <div className="relative flex-1 overflow-hidden flex flex-col">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-5 md:px-8 pt-2 pb-6 md:pb-2 scrollbar-hide"
          >
            <div key={currentStep} className="animate-in fade-in slide-in-from-right-4 duration-300">
              {renderStep(currentStep)}
            </div>
          </div>

          {showScrollHint && (
            <>
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />
              
              <div className="absolute bottom-2 inset-x-0 flex justify-center z-20 pointer-events-none mobile-hide-on-focus">
                <div 
                  className="animate-bounce cursor-pointer pointer-events-auto"
                  onClick={() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })}
                >
                  <div className="bg-vugia-navy/10 backdrop-blur-sm border border-vugia-navy/20 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm hover:bg-vugia-navy/20 transition-colors">
                    <span className="text-[10px] font-bold text-vugia-navy uppercase tracking-wider">Cuộn xuống</span>
                    <ChevronDown className="w-3 h-3 text-vugia-navy" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Thanh nút bấm điều hướng được khóa ở đáy card bằng Flexbox, bo góc dưới khít với viền cha */}
        <div className="p-4 md:p-6 pt-3 border-t border-vugia-sand bg-white flex-shrink-0 relative z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.02)] safe-area-pb rounded-b-[23px] md:rounded-b-[31px]">
          <div className="flex items-center gap-3 max-w-2xl mx-auto w-full px-5 md:px-0">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="h-11 px-4 rounded-xl border-vugia-sand hover:bg-vugia-sand/50 text-vugia-navy font-bold text-[13px]"
                disabled={isSubmitting}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Quay lại
              </Button>
            )}
            {!isLastStep ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex-1 h-11 rounded-xl bg-vugia-navy hover:bg-vugia-navy/90 text-vugia-cream font-bold text-[14px] md:text-[15px] shadow-md"
              >
                Tiếp tục
                <ChevronRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 h-11 rounded-xl bg-vugia-navy hover:bg-vugia-navy/90 text-vugia-cream font-bold text-[14px] md:text-[15px] shadow-md"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Đang gửi...</>
                ) : (
                  'Xác nhận đặt lịch'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;