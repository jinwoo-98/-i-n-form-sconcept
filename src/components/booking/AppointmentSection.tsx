"use client";

import React from 'react';
import { Label } from "../ui/label";
import { cn } from "../../lib/utils";
import { CONSULT_TYPES } from '../../constants/booking';

interface AppointmentSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  dates: any[];
  slots: any[];
  errors?: { consultType?: boolean; date?: boolean; time?: boolean };
}

const AppointmentSection = ({ formData, setFormData, dates, slots, errors = {} }: AppointmentSectionProps) => {
  return (
    <div className="space-y-7 md:space-y-8">
      <div className="space-y-3 md:space-y-4">
        <Label className={cn(
          "text-[13px] md:text-[14px] font-bold uppercase tracking-[0.18em]",
          errors.consultType ? "text-red-500" : "text-vugia-gold"
        )}>
          Hình thức tư vấn <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-3 gap-2.5 md:gap-4">
          {CONSULT_TYPES.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFormData({ ...formData, consultType: t.id })}
              className={cn(
                "relative p-3 md:p-5 rounded-2xl border-2 text-center transition-all",
                formData.consultType === t.id
                  ? "border-vugia-navy bg-vugia-navy/5 shadow-md ring-1 ring-vugia-navy/20"
                  : "border-vugia-sand bg-white text-slate-600 hover:border-vugia-navy/40 hover:bg-vugia-accent/20 active:scale-95",
                errors.consultType && !formData.consultType && "border-red-200 bg-red-50/30"
              )}
            >
              <div className="text-[22px] md:text-[26px] mb-1 md:mb-2">{t.icon}</div>
              <div className={cn(
                "text-[13px] md:text-[15px] font-bold transition-colors leading-tight",
                formData.consultType === t.id ? "text-vugia-navy" : "text-vugia-navy"
              )}>{t.title}</div>
              {/* Nâng kích thước mô tả hình thức tư vấn lên text-[12px] md:text-[13px] */}
              <div className={cn(
                "text-[12px] md:text-[13px] opacity-85 mt-1 leading-tight transition-colors hidden sm:block",
                formData.consultType === t.id ? "text-vugia-navy/70" : "text-slate-600"
              )}>{t.desc}</div>
              
              {formData.consultType === t.id && (
                <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-vugia-navy rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 md:space-y-4">
        <Label className={cn(
          "text-[13px] md:text-[14px] font-bold uppercase tracking-[0.18em]",
          errors.date ? "text-red-500" : "text-vugia-gold"
        )}>
          Ngày mong muốn <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-2.5 md:gap-3 overflow-x-auto pb-3 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
          {dates.map(d => (
            <button
              key={d.key}
              type="button"
              onClick={() => setFormData({ ...formData, date: d.key, time: '' })}
              className={cn(
                "relative min-w-[78px] md:min-w-[84px] p-3 md:p-4 rounded-2xl border-2 text-center transition-all flex-shrink-0 snap-start",
                formData.date === d.key
                  ? "border-vugia-navy bg-vugia-navy/5 shadow-md ring-1 ring-vugia-navy/20"
                  : "border-vugia-sand bg-white hover:border-vugia-navy/40 hover:bg-vugia-accent/20 active:scale-95",
                errors.date && !formData.date && "border-red-200 bg-red-50/30"
              )}
            >
              {/* Nâng kích thước chữ hiển thị Thứ lên text-[12px] */}
              <div className={cn(
                "text-[12px] font-bold uppercase tracking-wider transition-colors",
                formData.date === d.key ? "text-vugia-navy/60" : "text-vugia-gold"
              )}>{d.dow}</div>
              <div className={cn(
                "text-[22px] md:text-[26px] font-extrabold my-0.5 md:my-1 transition-colors tabular-nums leading-none",
                formData.date === d.key ? "text-vugia-navy" : "text-vugia-navy"
              )}>{d.dom}</div>
              {/* Nâng kích thước chữ hiển thị Tháng lên text-[12px] */}
              <div className={cn(
                "text-[12px] font-medium transition-colors",
                formData.date === d.key ? "text-vugia-navy/50" : "text-slate-500"
              )}>{d.mon}</div>

              {formData.date === d.key && (
                <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-vugia-navy rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {formData.date && (
        <div className="space-y-3 md:space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <Label className={cn(
            "text-[13px] md:text-[14px] font-bold uppercase tracking-[0.18em]",
            errors.time ? "text-red-500" : "text-vugia-gold"
          )}>
            Khung giờ mong muốn <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2.5 md:gap-3">
            {slots.length > 0 ? slots.map((s: any) => (
              <button
                key={s.time}
                type="button"
                onClick={() => setFormData({ ...formData, time: s.time })}
                className={cn(
                  "px-3 md:px-6 py-3 md:py-3.5 rounded-xl border-2 text-[15px] md:text-[16px] font-bold transition-all relative tabular-nums",
                  formData.time === s.time
                    ? "border-vugia-navy bg-vugia-navy/5 text-vugia-navy shadow-md ring-1 ring-vugia-navy/20"
                    : "border-vugia-sand bg-white text-vugia-navy hover:border-vugia-navy/40 hover:bg-vugia-accent/20 active:scale-95",
                  errors.time && !formData.time && "border-red-200 bg-red-50/30"
                )}
              >
                {s.time}
                {s.isPeak && <span className="absolute -top-2 -right-1 text-[13px] animate-pulse">🔥</span>}
                
                {formData.time === s.time && (
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-vugia-navy rounded-full animate-pulse" />
                )}
              </button>
            )) : (
              <p className="col-span-3 text-[14px] text-slate-600 italic font-medium">
                Không còn khung giờ khả dụng trong ngày này.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentSection;