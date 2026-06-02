"use client";

import React from 'react';
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { cn } from "../../lib/utils";
import { ROOM_NAMES, PURPOSES } from '../../constants/booking';

interface RoomDetailsSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  budgetOptions: any[];
  errors?: { room?: boolean; budget?: boolean; city?: boolean };
}

const sectionLabel = (active: boolean, error?: boolean) =>
  cn(
    "text-[13px] md:text-[14px] font-bold uppercase tracking-[0.18em]",
    error ? "text-red-500" : active ? "text-vugia-navy" : "text-vugia-gold"
  );

const RoomDetailsSection = ({ formData, setFormData, budgetOptions, errors = {} }: RoomDetailsSectionProps) => {
  return (
    <div className="space-y-7 md:space-y-8">
      {/* Loại căn hộ */}
      <div className="space-y-3 md:space-y-4">
        <Label className={sectionLabel(!!formData.room, errors.room)}>
          Loại căn hộ <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 md:gap-3">
          {Object.keys(ROOM_NAMES).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setFormData({ ...formData, room: id, budget: '' })}
              className={cn(
                "relative py-4 px-2 rounded-xl border-2 text-[14px] md:text-[14px] font-bold transition-all min-h-[56px] flex items-center justify-center text-center leading-tight",
                formData.room === id
                  ? "border-vugia-navy bg-vugia-navy/5 text-vugia-navy shadow-md ring-1 ring-vugia-navy/20"
                  : "border-vugia-sand bg-white text-vugia-navy hover:border-vugia-navy/40 hover:bg-vugia-accent/20 active:scale-95"
              )}
            >
              {ROOM_NAMES[id]}
              {formData.room === id && (
                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-vugia-navy rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Mục đích sử dụng */}
      <div className="space-y-3 md:space-y-4">
        <Label className={sectionLabel(!!formData.purpose)}>Mục đích sử dụng</Label>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {PURPOSES.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => setFormData({ ...formData, purpose: p.id, budget: '' })}
              className={cn(
                "relative p-4 md:p-5 rounded-2xl border-2 text-center transition-all",
                formData.purpose === p.id
                  ? "border-vugia-navy bg-vugia-navy/5 shadow-md ring-1 ring-vugia-navy/20"
                  : "border-vugia-sand bg-white hover:border-vugia-navy/40 hover:bg-vugia-accent/20 active:scale-[0.98]"
              )}
            >
              <div className="text-[28px] md:text-3xl mb-2">{p.icon}</div>
              <div className={cn(
                "text-[15px] md:text-[16px] font-bold transition-colors",
                formData.purpose === p.id ? "text-vugia-navy" : "text-vugia-navy"
              )}>{p.title}</div>
              {/* Nâng kích thước mô tả mục đích sử dụng lên text-[13px] md:text-[14px] */}
              <div className={cn(
                "text-[13px] md:text-[14px] mt-1 leading-snug transition-colors",
                formData.purpose === p.id ? "text-vugia-navy/70" : "text-slate-600"
              )}>{p.desc}</div>
              
              {formData.purpose === p.id && (
                <div className="absolute top-3 right-3 w-2 h-2 bg-vugia-navy rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Mức đầu tư */}
      <div className="space-y-3 md:space-y-4">
        <Label className={sectionLabel(!!formData.budget, errors.budget)}>
          Mức đầu tư dự kiến <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {formData.room ? budgetOptions.map(b => (
            <button
              key={b.id}
              type="button"
              onClick={() => setFormData({ ...formData, budget: b.id })}
              className={cn(
                "relative p-4 md:p-5 rounded-2xl border-2 text-center transition-all",
                formData.budget === b.id
                  ? "border-vugia-navy bg-vugia-navy/5 shadow-md ring-1 ring-vugia-navy/20"
                  : "border-vugia-sand bg-white hover:border-vugia-navy/40 hover:bg-vugia-accent/20 active:scale-[0.98]"
              )}
            >
              <div className="text-[26px] mb-2">{b.icon}</div>
              <div className={cn(
                "text-[15px] md:text-[16px] font-bold transition-colors",
                formData.budget === b.id ? "text-vugia-navy" : "text-vugia-navy"
              )}>{b.name}</div>
              <div className={cn(
                "text-[13px] md:text-[14px] font-bold mt-1 transition-colors",
                formData.budget === b.id ? "text-vugia-gold" : "text-vugia-gold"
              )}>{b.range}</div>

              {formData.budget === b.id && (
                <div className="absolute top-3 right-3 w-2 h-2 bg-vugia-navy rounded-full animate-pulse" />
              )}
            </button>
          )) : (
            <div className="sm:col-span-3 py-8 text-center text-slate-600 text-[14px] md:text-[15px] border-2 border-dashed border-vugia-sand rounded-2xl bg-vugia-sand/20 font-medium">
              👆 Hãy chọn loại căn hộ trước để xem mức đầu tư gợi ý
            </div>
          )}
        </div>
      </div>

      {/* Thành phố */}
      <div className="space-y-3">
        <Label className={cn(
          "text-[14px] md:text-[15px] font-bold tracking-wide",
          errors.city ? "text-red-500" : "text-vugia-navy"
        )}>
          Tỉnh / Thành phố <span className="text-red-500">*</span>
        </Label>
        <div className="space-y-3">
          <Select onValueChange={v => setFormData({ ...formData, city: v })} value={formData.city}>
            <SelectTrigger className={cn(
              "h-13 md:h-14 bg-white border-vugia-sand rounded-xl text-[16px] text-vugia-navy focus:ring-vugia-navy/10 focus:border-vugia-navy",
              errors.city && "border-red-400"
            )}>
              <SelectValue placeholder="Chọn tỉnh thành" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="hanoi">Hà Nội</SelectItem>
              <SelectItem value="hcm">TP. Hồ Chí Minh</SelectItem>
              <SelectItem value="danang">Đà Nẵng</SelectItem>
              <SelectItem value="other">Tỉnh thành khác</SelectItem>
            </SelectContent>
          </Select>

          {formData.city === 'other' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <Input
                placeholder="Nhập tên tỉnh / thành phố của bạn"
                className={cn(
                  "h-13 md:h-14 bg-white border-vugia-sand rounded-xl text-[16px] text-vugia-navy focus-visible:ring-vugia-navy/10 focus-visible:border-vugia-navy",
                  !formData.otherCity && "border-vugia-gold/50"
                )}
                value={formData.otherCity}
                onChange={e => setFormData({ ...formData, otherCity: e.target.value })}
              />
              {/* Nâng kích thước ghi chú hỗ trợ tỉnh thành lên text-[13px] */}
              <p className="text-[13px] text-slate-500 mt-1.5 ml-1 italic">
                SCONCEPT hỗ trợ tư vấn và thi công trên toàn quốc
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsSection;