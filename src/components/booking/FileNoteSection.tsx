"use client";

import React from 'react';
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Paperclip, X, FileVideo, FileImage, FileText } from 'lucide-react';
import { cn } from "../../lib/utils";
import { showError } from '../../utils/toast';

interface FileNoteSectionProps {
  files: File[];
  setFiles: (files: File[]) => void;
  note: string;
  setNote: (note: string) => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const FileNoteSection = ({ files, setFiles, note, setNote }: FileNoteSectionProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    
    for (const file of selectedFiles) {
      if (file.size > MAX_FILE_SIZE) {
        showError(`File "${file.name}" vượt quá giới hạn 50MB.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setFiles([...files, ...validFiles]);
    }
    e.target.value = '';
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('video/')) return <FileVideo className="w-4 h-4 text-blue-500" />;
    if (file.type.startsWith('image/')) return <FileImage className="w-4 h-4 text-green-500" />;
    return <FileText className="w-4 h-4 text-orange-500" />;
  };

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="space-y-2">
        <Label className="text-[14px] md:text-[15px] font-bold text-vugia-navy tracking-wide">
          Tài liệu đính kèm <span className="font-normal text-slate-500">(không bắt buộc)</span>
        </Label>
        <div
          className={cn(
            "border-2 border-dashed rounded-2xl p-5 md:p-7 text-center cursor-pointer transition-all",
            files.length > 0
              ? "border-vugia-navy bg-vugia-navy/5 ring-1 ring-vugia-navy/20"
              : "border-vugia-sand bg-vugia-sand/20 hover:border-vugia-navy/40 hover:bg-white"
          )}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <Paperclip className="w-8 h-8 md:w-9 md:h-9 mx-auto mb-2.5 md:mb-3 text-vugia-gold/70" />
          <div className="text-[14px] md:text-[15px] font-bold text-vugia-navy">
            Tải lên bản vẽ, ảnh hoặc video hiện trạng
          </div>
          {/* Nâng kích thước ghi chú giới hạn dung lượng lên text-[13px] md:text-[14px] */}
          <p className="text-[13px] md:text-[14px] text-slate-500 mt-1.5">
            Ảnh, Video, PDF (Tối đa 50MB/file)
          </p>
          <input
            id="file-upload"
            type="file"
            multiple
            accept="image/*,video/*,.pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          {files.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {files.map((f, i) => (
                <div
                  key={`${f.name}-${i}`}
                  className="bg-white px-3 py-2 rounded-lg text-[13px] border border-vugia-navy/20 flex items-center gap-2 shadow-sm"
                >
                  {getFileIcon(f)}
                  <span className="max-w-[140px] truncate font-medium text-vugia-navy">{f.name}</span>
                  <X
                    className="w-3.5 h-3.5 cursor-pointer text-red-400 hover:scale-110 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFiles(files.filter((_, idx) => idx !== i));
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[14px] md:text-[15px] font-bold text-vugia-navy tracking-wide">
          Mô tả thêm <span className="font-normal text-slate-500">(không bắt buộc)</span>
        </Label>
        <Textarea
          placeholder="VD: Căn hộ 65m² Vinhomes, vợ chồng trẻ, thích phong cách Japandi tối giản..."
          className="bg-white border-vugia-sand min-h-[120px] rounded-2xl p-4 focus-visible:border-vugia-navy focus-visible:ring-vugia-navy/10 transition-all placeholder:text-slate-400 text-[15px] text-vugia-navy leading-relaxed"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
      </div>
    </div>
  );
};

export default FileNoteSection;