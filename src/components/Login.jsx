import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Smartphone, Mail, Lock, Eye, EyeOff, X, AlertCircle, ShieldCheck, Server, LockKeyhole, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Kirishda xatolik yuz berdi. Email yoki parol noto\'g\'ri');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f8] flex flex-col justify-center items-center p-4 font-sans text-slate-800">
      <div className="w-full max-w-[460px] bg-white rounded-3xl p-8 shadow-sm border border-slate-200/80">
        
        {/* Brand Icon Header */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center text-white shadow-md">
            <Smartphone className="w-7 h-7" />
          </div>
        </div>

        {/* Header Titles */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-1 uppercase">XON BAZZAR</h1>
          <p className="text-xs text-slate-500 font-medium">
            Mobil telefon va aksessuarlar – Boshqaruv tizimi
          </p>
        </div>

        {/* Error Banner Alert (Matches Image 1) */}
        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start justify-between gap-3 text-rose-700 animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="text-xs leading-relaxed">
                <div className="font-bold text-rose-800">Kirishda xatolik yuz berdi</div>
                <div className="text-rose-600">{error}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-600 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email manzili
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Parol
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-black focus:ring-black accent-black"
              />
              Eslab qolish
            </label>
            <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-slate-500 hover:text-slate-900 font-medium">
              Parolni unutdingizmi?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-black hover:bg-slate-900 text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mt-4 disabled:opacity-75 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Kirish</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            FAQAT VAKOLATLI XODIMLAR UCHUN
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5" />
          <span>Server: tsk-main-node-01</span>
        </div>
        <div className="flex items-center gap-1.5">
          <LockKeyhole className="w-3.5 h-3.5" />
          <span>SSL 256-bit shifrlangan</span>
        </div>
      </div>
    </div>
  );
}

