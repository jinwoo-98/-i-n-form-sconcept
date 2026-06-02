"use client";

import React from 'react';
import { Button } from "../ui/button";
import { CheckCircle2, User, Phone, Mail, Calendar, Clock, Home, Briefcase, PhoneCall, RotateCcw, MapPin } from 'lucide-react';
import { ROOM_NAMES, STAGES, PURPOSES, CONSULT_TYPES, TIMELINE_OPTIONS } from '../../constants/booking';

interface SuccessViewProps {
  data: any;
  onReset: () => void;
}

const SuccessView = ({ data, onReset }: SuccessViewProps) => {
  const getStageName = (id: string) => STAGES.find(s => s.id === id)?.title || id;
  const getConsultName = (id: string) => CONSULT_TYPES.find(t => t.id === id)?.title || 'Linh hoạt';
  const getPurposeName = (id: string) => PURPOSES.find(p => p.id === id)?.title || id;
  const getTimelineName = (id: string) => TIMELINE_OPTIONS.find(t => t.id === id)?.label || id;

  const formattedDate = data.date ? data.date.split('-').reverse().join('/') : 'Sẽ liên hệ xác nhận';
  const hotlineDisplay = "0908.386.258";
  const hotlineLink = "tel:0908386258";

  return (
    <div className="w-full h-full min-h-0 bg-white rounded-[24px] md:rounded-[32px] shadow-sm md:shadow-2xl overflow-y-auto scrollbar-hide border border-vugia-sand p-6 sm:p-10 md:p-14 text-center [transform:translateZ(0)]">
      {/* Icon thành công */}
      <div className="w-20 h-20 md:w-24 md:h-24 bg-vugia-accent rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 animate-in zoom-in duration-500">
        <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-vugia-navy" strokeWidth={2.5} />
      </div>

      <h2 className="font-sans text-[26px] sm:text-3xl md:text-4xl font-extrabold text-vugia-navy mb-3 md:mb-4 tracking-tight">
        Đặt lịch thành công! 🎉
      </h2>
      <p className="text-[15px] md:text-[17px] text-vugia-gold mb-8 md:mb-10 leading-relaxed max-w-md mx-auto">
        Cảm ơn bạn đã tin tưởng <b className="text-vugia-navy">SCONCEPT</b>. Chuyên gia của chúng tôi sẽ liên hệ xác nhận trong vòng <b className="text-vugia-navy">30 phút</b> tới.
      </p>

      {/* Thẻ tóm tắt lịch hẹn */}
      <div className="bg-vugia-cream rounded-2xl md:rounded-[20px] p-5 md:p-7 text-left space-y-4 md:space-y-5 mb-7 md:mb-8 border border-vugia-sand">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 md:gap-4 text-[16px] md:text-[17px] text-vugia-navy min-w-0">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0">
              <User className="w-5 h-5 text-vugia-navy" />
            </div>
            <span className="font-bold truncate">{data.name}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-vugia-navy/5 px-3 py-1.5 rounded-full flex-shrink-0">
            <MapPin className="w-3.5 h-3.5 text-vugia-gold" />
            <span className="text-[13px] font-bold text-vugia-navy">{data.city}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="flex items-center gap-2.5 text-[14px] text-vugia-gold">
            <Phone className="w-4 h-4 flex-shrink-0" /> <span className="text-vugia-navy font-semibold">{data.phone}</span>
          </div>
          {data.email && (
            <div className="flex items-center gap-2.5 text-[14px] text-vugia-gold min-w-0">
              <Mail className="w-4 h-4 flex-shrink-0" /> <span className="text-vugia-navy font-semibold truncate">{data.email}</span>
            </div>
          )}
        </div>

        <div className="pt-4 md:pt-5 border-t border-vugia-sand grid grid-cols-2 gap-x-4 gap-y-4">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-vugia-gold uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" /> Giai đoạn & Tiến độ
            </div>
            <div className="text-[14px] md:text-[15px] text-vugia-navy font-bold leading-snug">
              {getStageName(data.stage)} {data.timeline && `· ${getTimelineName(data.timeline)}`}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-vugia-gold uppercase tracking-wider flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5" /> Loại căn
            </div>
            <div className="text-[14px] md:text-[15px] text-vugia-navy font-bold">
              {ROOM_NAMES[data.room]} · {getPurposeName(data.purpose)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-vugia-gold uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Ngày hẹn
            </div>
            <div className="text-[14px] md:text-[15px] text-vugia-navy font-bold tabular-nums">
              {formattedDate}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-vugia-gold uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {getConsultName(data.consultType)}
            </div>
            <div className="text-[14px] md:text-[15px] text-vugia-navy font-bold tabular-nums">
              {data.time || 'Sẽ thoả thuận'}
            </div>
          </div>
        </div>
      </div>

      {/* Gợi ý liên hệ ngay */}
      <div className="bg-vugia-accent/40 border border-vugia-accent rounded-2xl p-4 md:p-5 mb-6 md:mb-8 text-left">
        <p className="text-[14px] md:text-[15px] text-vugia-navy leading-relaxed">
          💡 <b>Cần hỗ trợ gấp?</b> Bạn có thể gọi trực tiếp hotline để được tư vấn ngay lập tức.
        </p>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          asChild
          className="flex-1 h-14 md:h-15 bg-vugia-navy hover:bg-vugia-navy/90 text-vugia-cream rounded-xl font-bold transition-all shadow-md text-[15px] md:text-[16px]"
        >
          <a href={hotlineLink} className="flex items-center justify-center gap-2">
            <PhoneCall className="w-4.5 h-4.5" />
            Gọi hotline {hotlineDisplay}
          </a>
        </Button>
        <Button
          variant="outline"
          className="flex-1 h-14 md:h-15 border-vugia-sand bg-white hover:bg-vugia-cream text-vugia-navy rounded-xl font-bold transition-all text-[15px] md:text-[16px]"
          onClick={onReset}
        >
          <RotateCcw className="w-4.5 h-4.5 mr-2" />
          Đặt lịch khác
        </Button>
      </div>
    </div>
  );
};

export default SuccessView;