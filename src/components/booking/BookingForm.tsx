"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "../ui/button";
import { Settings, Zap, Loader2, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useBookingForm } from '@/hooks/useBookingForm';

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const {
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
  } = useBookingForm({
    onSuccess,
    stepCount: STEP_LABELS.length
  });

  // Handle auto-scroll-to-top when changing steps
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [currentStep]);

  // Handle scroll detection and bottom scroll hint
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isNotAtBottom = scrollHeight - scrollTop - clientHeight > 20;
      setShowScrollHint(isNotAtBottom);
    }
  };

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
    <div className="w-full h-full min-h-0 bg-white rounded-[24px] md:rounded-[32px] shadow-none relative border border-vugia-sand/60 flex flex-col [transform:translateZ(0)]">
      {/* Outer wrapper to handle rounded corner clipping for inner contents */}
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

        {/* Action Button Navigation Panel anchored to bottom */}
        <div className="p-4 md:p-6 pt-3 border-t border-vugia-sand bg-white flex-shrink-0 relative z-10 shadow-none safe-area-pb rounded-b-[23px] md:rounded-b-[31px]">
          <div className="flex items-center gap-3 max-w-2xl mx-auto w-full px-5 md:px-0">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="h-11 px-4 rounded-xl border-vugia-sand hover:bg-vugia-sand/50 text-vugia-navy font-bold text-[13px] shadow-none"
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
                className="flex-1 h-11 rounded-xl bg-vugia-navy hover:bg-vugia-navy/90 text-vugia-cream font-bold text-[14px] md:text-[15px] shadow-none"
              >
                Tiếp tục
                <ChevronRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 h-11 rounded-xl bg-vugia-navy hover:bg-vugia-navy/90 text-vugia-cream font-bold text-[14px] md:text-[15px] shadow-none"
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