"use client";

import React from 'react';
import { cn } from "../../lib/utils";
import { STAGES, TIMELINE_OPTIONS } from '../../constants/booking';

interface StageSectionProps {
  selectedStage: string;
  onSelectStage: (id: string) => void;
  selectedTimeline: string;
  onSelectTimeline: (id: string) => void;
  errors?: Record<string, string>;
}

const StageSection = ({ 
  selectedStage, 
  onSelectStage, 
  selectedTimeline, 
  onSelectTimeline,
  errors 
}: StageSectionProps) => {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Phần 1: Giai đoạn hiện tại */}
      <div>
        <h3 className="text-[15px] md:text-[16px] font-bold text-vugia-navy mb-3 flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-vugia-navy text-white text-[11px] font-bold">1</span>
          Hiện tại, Anh/Chị đang ở giai đoạn nào rồi ạ? <span className="text-red-500">*</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {STAGES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelectStage(s.id)}
              className={cn(
                "relative flex flex-col p-4 md:p-5 rounded-2xl border-2 transition-all duration-300 group text-left",
                selectedStage === s.id
                  ? "border-vugia-navy bg-vugia-navy/5 shadow-md ring-1 ring-vugia-navy/20"
                  : "border-vugia-sand bg-white hover:border-vugia-navy/30 hover:bg-vugia-accent/10 active:scale-[0.98]"
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="text-[24px] md:text-[26px] flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "text-[15px] md:text-[16px] font-extrabold leading-tight transition-colors truncate",
                    selectedStage === s.id ? "text-vugia-navy" : "text-slate-800"
                  )}>
                    {s.title}
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                    Lựa chọn 0{idx + 1}
                  </span>
                </div>
              </div>

              <p className="text-[13px] md:text-[14px] text-slate-500 leading-snug mb-3 line-clamp-2">
                {s.desc}
              </p>

              <div className={cn(
                "mt-auto pt-2.5 border-t border-dashed w-full text-[12px] md:text-[13px] font-bold flex items-center gap-1.5",
                selectedStage === s.id ? "text-vugia-gold border-vugia-navy/20" : "text-vugia-gold/80 border-vugia-sand"
              )}>
                {/* Sử dụng duy nhất 1 mũi tên đơn với style sắc nét của thương hiệu */}
                <span className="text-vugia-gold font-extrabold flex-shrink-0 text-[14px] leading-none">→</span>
                <span className="truncate">{s.inc}</span>
              </div>

              {selectedStage === s.id && (
                <div className="absolute top-3 right-3 w-2 h-2 bg-vugia-navy rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
        {errors?.stage && (
          <p className="text-red-500 text-[12px] mt-1.5 font-medium">{errors.stage}</p>
        )}
      </div>

      {/* Phần 2: Thời gian dự kiến sử dụng nội thất - Thiết kế 1 cột thông thoáng trên Mobile */}
      <div className="pt-4 border-t border-vugia-sand/40">
        <h3 className="text-[15px] md:text-[16px] font-bold text-vugia-navy mb-3 flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-vugia-navy text-white text-[11px] font-bold">2</span>
          Anh/Chị dự kiến sử dụng nội thất khi nào? <span className="text-red-500">*</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TIMELINE_OPTIONS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectTimeline(t.id)}
              className={cn(
                "relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 text-left group",
                selectedTimeline === t.id
                  ? "border-vugia-navy bg-vugia-navy/5 shadow-sm ring-1 ring-vugia-navy/10"
                  : "border-vugia-sand bg-white hover:border-vugia-navy/20 hover:bg-vugia-accent/5 active:scale-[0.98]"
              )}
            >
              <div className="text-[24px] md:text-[26px] flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                {t.icon}
              </div>
              <div className="min-w-0 flex-1">
                {/* Loại bỏ hoàn toàn class truncate để hiển thị đầy đủ văn bản */}
                <div className={cn(
                  "text-[15px] md:text-[16px] font-extrabold leading-tight",
                  selectedTimeline === t.id ? "text-vugia-navy" : "text-slate-800"
                )}>
                  {t.label}
                </div>
                <div className="text-[13px] md:text-[14px] text-slate-500 leading-snug mt-1">
                  {t.desc}
                </div>
              </div>

              {selectedTimeline === t.id && (
                <div className="absolute top-3 right-3 w-2 h-2 bg-vugia-navy rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
        {errors?.timeline && (
          <p className="text-red-500 text-[12px] mt-1.5 font-medium">{errors.timeline}</p>
        )}
      </div>
    </div>
  );
};

export default StageSection;