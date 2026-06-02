"use client";

import React from 'react';
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "../../lib/utils";
import { AlertCircle } from 'lucide-react';

interface PersonalInfoSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: Record<string, string>;
  onBlur: (field: string) => void;
}

const inputClass = (hasError: boolean) =>
  cn(
    "h-13 md:h-14 bg-white border-vugia-sand rounded-xl focus-visible:border-vugia-navy focus-visible:ring-vugia-navy/10 transition-all placeholder:text-slate-400 text-[16px] text-vugia-navy",
    hasError && "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/15 bg-red-50/30"
  );

const labelClass = "text-[14px] md:text-[15px] font-bold text-vugia-navy tracking-wide";

const ErrorText = ({ msg }: { msg: string }) => (
  <p className="text-[13px] text-red-500 mt-1.5 font-semibold flex items-center gap-1.5">
    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {msg}
  </p>
);

const PersonalInfoSection = ({ formData, setFormData, errors, onBlur }: PersonalInfoSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
      <div className="space-y-2">
        <Label className={labelClass}>Họ và tên <span className="text-red-500">*</span></Label>
        <Input
          placeholder="Nguyễn Văn A"
          className={inputClass(!!errors.name)}
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          onBlur={() => onBlur('name')}
          autoComplete="name"
        />
        {errors.name && <ErrorText msg={errors.name} />}
      </div>

      <div className="space-y-2">
        <Label className={labelClass}>Số điện thoại <span className="text-red-500">*</span></Label>
        <Input
          type="tel"
          inputMode="numeric"
          placeholder="0912 345 678"
          className={inputClass(!!errors.phone)}
          value={formData.phone}
          onChange={e => {
            const value = e.target.value.replace(/\D/g, '');
            if (value.length <= 10) {
              setFormData({ ...formData, phone: value });
            }
          }}
          onBlur={() => onBlur('phone')}
          autoComplete="tel"
        />
        {errors.phone && <ErrorText msg={errors.phone} />}
      </div>

      <div className="md:col-span-2 space-y-2">
        <Label className={labelClass}>
          Email <span className="font-normal text-slate-400">(Không bắt buộc)</span>
        </Label>
        <Input
          type="email"
          inputMode="email"
          placeholder="email@gmail.com"
          className={inputClass(!!errors.email)}
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
          onBlur={() => onBlur('email')}
          autoComplete="email"
        />
        {errors.email ? (
          <ErrorText msg={errors.email} />
        ) : (
          /* Nâng dòng gợi ý dưới ô Email lên text-[14px] */
          <p className="text-[14px] text-slate-500 italic mt-1.5">
            Báo giá và phối cảnh sẽ được gửi qua email này (nếu có)
          </p>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoSection;