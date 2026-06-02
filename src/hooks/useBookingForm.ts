"use client";

import { useState, useMemo, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import {
  BUDGET_DEFAULT, ROOM_NAMES, STAGES, PURPOSES, CONSULT_TYPES, PEAK_HOURS, TIMELINE_OPTIONS
} from '@/constants/booking';

interface UseBookingFormProps {
  onSuccess: (data: any) => void;
  stepCount: number;
}

export const useBookingForm = ({ onSuccess, stepCount }: UseBookingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

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

  // Fetch configuration on mount
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
  };

  const handleNext = () => {
    const result = validateStep(currentStep);
    if (!result.valid) {
      showError(result.message || "Vui lòng hoàn tất các trường bắt buộc");
      return;
    }
    setCompletedSteps(prev => new Set(prev).add(currentStep));
    if (currentStep < stepCount - 1) {
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

  return {
    isSubmitting,
    errors,
    currentStep,
    completedSteps,
    formData,
    setFormData,
    files,
    setFiles,
    dates,
    slots,
    budgetOptions,
    handleBlur,
    goToStep,
    handleNext,
    handleBack,
    handleSubmit
  };
};