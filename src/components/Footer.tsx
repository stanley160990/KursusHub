import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">KursusHub</span>
          <span>·</span>
          <span>Sistem Manajemen Pengguna Kursus</span>
        </div>

        <div className="text-slate-600 font-medium">
          Copyright 2026 - halkh-systems.com
        </div>
      </div>
    </footer>
  );
};
