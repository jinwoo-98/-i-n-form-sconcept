"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ArrowLeft, Save, Lock, Send, Loader2 } from 'lucide-react';
import { BUDGET_DEFAULT, ROOM_NAMES } from '../../constants/booking';
import { showSuccess, showError } from '../../utils/toast';
import { supabase } from "@/integrations/supabase/client";
import { sendTelegramMessage } from '../../utils/telegram';

interface SettingsViewProps {
  onClose: () => void;
}

const SettingsView = ({ onClose }: SettingsViewProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('tgh_bcfg');
    return saved ? JSON.parse(saved) : { ...BUDGET_DEFAULT };
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        checkAdminRole(session.user.id);
      }
    };
    checkUser();
  }, []);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (data && data.role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error("Error checking admin role:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      const fetchRemoteConfig = async () => {
        try {
          const { data, error } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'app_config')
            .maybeSingle();
          
          if (error) throw error;
          
          if (data) {
            setConfig(data.value);
            localStorage.setItem('tgh_bcfg', JSON.stringify(data.value));
          }
        } catch (err: any) {
          console.error("Error fetching config:", err);
          if (err.code === '42501') {
            showError("Bạn không có quyền truy cập cấu hình này!");
          }
        }
      };
      fetchRemoteConfig();
    }
  }, [isAuthenticated, isAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setIsAuthenticated(true);
      if (data.user) {
        await checkAdminRole(data.user.id);
      }
      showSuccess("Đăng nhập thành công!");
    } catch (err: any) {
      showError("Tài khoản hoặc mật khẩu không chính xác!");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIsAdmin(false);
    onClose();
  };

  const handleSave = async () => {
    if (!isAdmin) {
      showError("Chỉ quản trị viên mới có quyền lưu thay đổi!");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({ 
          key: 'app_config', 
          value: config,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      localStorage.setItem('tgh_bcfg', JSON.stringify(config));
      showSuccess("Đã lưu cài đặt!");
      onClose();
    } catch (err: any) {
      if (err.code === '42501') {
        showError("Bạn không có quyền thay đổi cài đặt này!");
      } else {
        showError("Lỗi khi lưu dữ liệu!");
      }
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestTelegram = async () => {
    setIsTesting(true);
    const now = new Date().toLocaleString('vi-VN');
    const testMessage = `<b>🛠️ KIỂM TRA KẾT NỐI</b>\n✅ Trạng thái: Hoạt động tốt\n🕒 Thời gian: ${now}`;
    
    const success = await sendTelegramMessage(testMessage);
    if (success) {
      showSuccess("Gửi tin nhắn thử thành công!");
    } else {
      showError("Gửi thất bại. Vui lòng kiểm tra lại quyền hạn.");
    }
    setIsTesting(false);
  };

  const updateVal = (room: string, idx: number, val: string) => {
    const newConfig = { ...config };
    newConfig[room][idx] = parseFloat(val) || 0;
    setConfig(newConfig);
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full h-full min-h-0 bg-white rounded-[24px] md:rounded-[32px] shadow-sm md:shadow-2xl overflow-y-auto scrollbar-hide border border-vugia-sand p-6 sm:p-12 text-center [transform:translateZ(0)] flex flex-col justify-center items-center">
        <div className="w-16 h-16 bg-vugia-cream rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-vugia-navy" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Quản trị hệ thống</h2>
        <p className="text-[14px] text-vugia-gold mb-8">Đăng nhập để quản lý cấu hình</p>
        <form onSubmit={handleLogin} className="space-y-4 text-left w-full max-w-sm">
          <div className="space-y-2">
            <Label className="text-[12px] font-bold text-slate-600">Email quản trị</Label>
            <Input 
              type="email" 
              placeholder="admin@sophiaconcept.vn" 
              className="h-12 bg-vugia-cream border-vugia-sand rounded-xl focus:ring-vugia-navy/20 focus:border-vugia-navy"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[12px] font-bold text-slate-600">Mật khẩu</Label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              className="h-12 bg-vugia-cream border-vugia-sand rounded-xl focus:ring-vugia-navy/20 focus:border-vugia-navy"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-14 bg-vugia-navy hover:bg-vugia-navy/90 text-white rounded-2xl font-bold shadow-lg shadow-vugia-navy/20 transition-all active:scale-95 mt-4"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Đăng nhập"}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose} className="w-full text-vugia-gold hover:text-slate-800 hover:bg-transparent">
            Quay lại
          </Button>
        </form>
      </div>
    );
  }

  if (isAuthenticated && !isAdmin && !isLoading) {
    return (
      <div className="w-full h-full min-h-0 bg-white rounded-[24px] md:rounded-[32px] shadow-sm md:shadow-2xl overflow-y-auto scrollbar-hide border border-vugia-sand p-6 sm:p-12 text-center [transform:translateZ(0)] flex flex-col justify-center items-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Từ chối truy cập</h2>
        <p className="text-[14px] text-vugia-gold mb-8">Tài khoản của bạn không có quyền quản trị.</p>
        <Button onClick={handleLogout} className="w-full h-14 bg-vugia-navy text-white rounded-2xl font-bold max-w-sm">
          Đăng xuất
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-0 bg-white rounded-[24px] md:rounded-[32px] shadow-sm md:shadow-2xl overflow-y-auto scrollbar-hide border border-vugia-sand p-6 sm:p-10 [transform:translateZ(0)]">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <ArrowLeft className="w-5 h-5 text-vugia-gold" />
          </Button>
          <h2 className="text-2xl font-bold text-slate-800">Cấu hình</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl px-4 border-vugia-sand text-vugia-gold" onClick={handleLogout}>
            Đăng xuất
          </Button>
          <Button className="bg-vugia-navy hover:bg-vugia-navy/90 text-white rounded-xl px-6" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Lưu
          </Button>
        </div>
      </div>

      <div className="space-y-10">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-vugia-navy font-bold text-[13px] uppercase tracking-wider">
              <Send className="w-4 h-4" /> Thông báo Telegram
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-[11px] font-bold border-vugia-sand text-vugia-gold hover:bg-vugia-accent hover:text-vugia-navy hover:border-vugia-navy rounded-lg transition-all"
              onClick={handleTestTelegram}
              disabled={isTesting}
            >
              {isTesting ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Send className="w-3 h-3 mr-2" />} Gửi thử
            </Button>
          </div>
          <div className="p-6 bg-vugia-cream rounded-2xl border border-vugia-sand">
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-vugia-navy/10 p-2 rounded-full">
                <Lock className="w-4 h-4 text-vugia-navy" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-slate-800">Bảo mật hệ thống</p>
                <p className="text-[12px] text-vugia-gold mt-1 leading-relaxed">
                  Chế độ RBAC đang hoạt động. Chỉ tài khoản có vai trò 'admin' trong bảng profiles mới có thể thay đổi các thông số này.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-vugia-navy font-bold text-[13px] uppercase tracking-wider">Ngân sách (Triệu VNĐ)</div>
          <div className="overflow-x-auto border border-vugia-sand rounded-2xl">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-vugia-cream">
                <tr>
                  <th className="p-4 font-bold text-vugia-gold">Loại căn</th>
                  <th className="p-4 font-bold text-vugia-gold">Vài món</th>
                  <th className="p-4 font-bold text-vugia-gold">Theo phòng</th>
                  <th className="p-4 font-bold text-vugia-gold">Trọn bộ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vugia-sand">
                {Object.keys(ROOM_NAMES).map((id) => (
                  <tr key={id}>
                    <td className="p-4 font-bold text-slate-600">{ROOM_NAMES[id]}</td>
                    {[0, 1, 2].map(idx => (
                      <td key={idx} className="p-2">
                        <Input 
                          type="number" 
                          className="h-9 text-right border-vugia-sand rounded-lg" 
                          value={(config as any)[id]?.[idx] || 0} 
                          onChange={e => updateVal(id, idx, e.target.value)} 
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;