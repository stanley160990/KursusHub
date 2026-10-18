import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Users, 
  Clock, 
  LogOut, 
  ShieldCheck, 
  RefreshCw,
  FolderTree,
  Building2,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  adminUsername: string;
  onLogout: () => void;
  sessionRemainingSeconds: number;
  onExtendSession: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  adminUsername,
  onLogout,
  sessionRemainingSeconds,
  onExtendSession,
}) => {
  const [isRefMenuOpen, setIsRefMenuOpen] = useState(false);
  const refMenuContainer = useRef<HTMLDivElement | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isWarning = sessionRemainingSeconds <= 120; // Last 2 minutes

  const navItems = [
    { id: 'courses', label: 'Kursus', icon: BookOpen },
    { id: 'students', label: 'Mahasiswa', icon: GraduationCap },
    { id: 'instructors', label: 'Instruktur & Asisten', icon: Users },
    { id: 'logins', label: 'Daftar Login', icon: Clock },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (refMenuContainer.current && !refMenuContainer.current.contains(e.target as Node)) {
        setIsRefMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isRefActive = currentTab === 'referensi-pt';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm"
              style={{ backgroundColor: '#FF006E' }}
            >
              KH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">KursusHub</span>
                <span 
                  className="text-xs px-2 py-0.5 rounded font-medium text-emerald-800"
                  style={{ backgroundColor: '#d1e7dd', border: '1px solid #badbcc' }}
                >
                  Admin Portal
                </span>
              </div>
              <p className="text-xs text-slate-500">Sistem Manajemen Pengguna Kursus</p>
            </div>
          </div>

          {/* Session Timer & User Controls */}
          <div className="flex items-center gap-3">
            {/* Session Timeout Watcher Pill */}
            <div 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                isWarning 
                  ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse' 
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
              title="Session Timeout 15 Menit otomatis logout jika idle"
            >
              <Clock className={`w-3.5 h-3.5 ${isWarning ? 'text-rose-600' : 'text-slate-500'}`} />
              <span>Sesi: </span>
              <span className="font-mono font-bold">{formatTime(sessionRemainingSeconds)}</span>
              <button
                type="button"
                onClick={onExtendSession}
                className="ml-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 p-1 rounded transition-colors"
                title="Perpanjang sesi 15 menit"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            {/* Admin Profile & Logout */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {adminUsername}
                </span>
                <span className="text-[10px] text-slate-400">Administrator</span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                title="Keluar dari sistem"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Top Navigation Menu Bar */}
        <nav className="flex items-center space-x-1 overflow-x-visible py-2 border-t border-slate-100">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCurrentTab(item.id);
                  setIsRefMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                style={isActive ? { backgroundColor: '#FF006E' } : {}}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Menu Referensi dengan Submenu Referensi Perguruan Tinggi */}
          <div className="relative" ref={refMenuContainer}>
            <button
              type="button"
              onClick={() => setIsRefMenuOpen(!isRefMenuOpen)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                isRefActive
                  ? 'text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              style={isRefActive ? { backgroundColor: '#FF006E' } : {}}
            >
              <FolderTree className={`w-4 h-4 ${isRefActive ? 'text-white' : 'text-slate-500'}`} />
              <span>Referensi</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isRefMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Submenu Dropdown Popover */}
            {isRefMenuOpen && (
              <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Daftar Master Referensi
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('referensi-pt');
                    setIsRefMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 text-xs flex items-start gap-2.5 hover:bg-slate-50 transition-colors ${
                    isRefActive ? 'bg-pink-50/70 text-pink-700 font-semibold' : 'text-slate-700'
                  }`}
                >
                  <Building2 className={`w-4 h-4 mt-0.5 shrink-0 ${isRefActive ? 'text-pink-600' : 'text-slate-500'}`} />
                  <div>
                    <span className="block font-semibold">Referensi Perguruan Tinggi</span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      Master kampus, fakultas & program studi
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
