import React from 'react';
import { Clock, AlertTriangle, RefreshCw, LogIn } from 'lucide-react';

interface SessionTimeoutModalProps {
  isOpen: boolean;
  type: 'warning' | 'expired';
  remainingSeconds: number;
  onExtend: () => void;
  onConfirmLogout: () => void;
}

export const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  isOpen,
  type,
  remainingSeconds,
  onExtend,
  onConfirmLogout,
}) => {
  if (!isOpen) return null;

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeFormatted = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-200">
        {type === 'warning' ? (
          <>
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Peringatan Session Timeout
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Sesi login administrator Anda akan otomatis berakhir dalam:
            </p>
            <div className="my-3 font-mono text-2xl font-bold text-rose-600 bg-rose-50 py-2 px-4 rounded-xl inline-block border border-rose-200">
              {timeFormatted}
            </div>
            <p className="text-[11px] text-slate-400">
              Untuk alasan keamanan, sistem menerapkan batas sesi 15 menit. Anda dapat memperpanjang sesi jika masih ingin melanjutkan pekerjaan.
            </p>

            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={onConfirmLogout}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Logout Sekarang
              </button>
              <button
                type="button"
                onClick={onExtend}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs"
                style={{ backgroundColor: '#FF006E' }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Perpanjang Sesi (15 Menit)</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Sesi Telah Berakhir (Timeout 15 Menit)
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Sesi login Anda telah habis karena tidak ada aktivitas selama 15 menit sesuai kebijakan keamanan sistem. Silakan login kembali untuk melanjutkan akses portal.
            </p>

            <div className="mt-5">
              <button
                type="button"
                onClick={onConfirmLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-white font-semibold text-xs rounded-xl shadow-xs"
                style={{ backgroundColor: '#FF006E' }}
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Kembali ke Sistem</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
