import React, { useState, useEffect } from 'react';
import { Mail, X, CheckCircle2, History, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [recentEmails, setRecentEmails] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRecentEmails(authService.getRecentUsers());
      setError('');
      // Prefill with current user email if logged in
      const current = authService.getCurrentUser();
      if (current) {
        setEmail(current.email);
      } else {
        setEmail('');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('請輸入您的電子信箱');
      return;
    }

    if (!authService.isValidEmail(cleanEmail)) {
      setError('請輸入有效的信箱格式，例如：candidate@patent.tw');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // Perform login
      const profile = authService.login(cleanEmail);

      // Migrate any guest session wrong questions or answers
      const migration = storageService.migrateGuestDataToUser(profile.email);
      if (migration.migratedWrong > 0) {
        console.log(`Migrated ${migration.migratedWrong} wrong questions to ${profile.email}`);
      }

      onLoginSuccess(profile.email);
      onClose();
    } catch (err: any) {
      setError(err?.message || '登入失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickSelect = (selectedEmail: string) => {
    setEmail(selectedEmail);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="relative bg-linear-to-br from-blue-950 via-blue-900 to-indigo-900 text-white p-6 sm:p-7">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 p-1.5 rounded-full text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-amber-300 flex items-center justify-center mb-4">
            <Mail className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-bold tracking-tight">考生信箱登入 / 身分切換</h2>
          <p className="text-xs text-blue-100/90 mt-1 leading-relaxed">
            輸入信箱即可永久記錄專屬錯題本、模擬考歷史與學習成效，隨時換機練習不中斷。
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              電子郵件信箱 (Email)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="login-email-input"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="例如：patent.exam@gmail.com"
                autoFocus
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-700 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              無須繁瑣密碼，輸入信箱即可自動辨識並載入您的專屬錯題。
            </p>
          </div>

          {/* Quick Select from Recent Users */}
          {recentEmails.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <History className="w-3.5 h-3.5 text-slate-400" />
                <span>近期在此裝置登入過的帳號：</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentEmails.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleQuickSelect(item)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      email.toLowerCase() === item.toLowerCase()
                        ? 'bg-blue-50 text-blue-900 border-blue-300 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Benefits summary list */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-1.5">
            <div className="text-xs font-semibold text-slate-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              登入信箱專享特點：
            </div>
            <ul className="text-[11px] text-slate-500 space-y-1 pl-4 list-disc">
              <li>做測驗或模擬考答錯之題目自動歸檔至專屬錯題本</li>
              <li>針對未掌握題目進行循環重練，直至各考科全數精通</li>
              <li>支援多帳號切換，各考生之作答進度完全隔離</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
            >
              取消
            </button>
            <button
              id="submit-email-login-btn"
              type="submit"
              disabled={isSubmitting}
              className="py-3 px-4 rounded-xl text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all disabled:opacity-50"
            >
              <span>{authService.getCurrentUser()?.email === email.trim().toLowerCase() ? '確認登入' : '登入 / 開始記錄'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
