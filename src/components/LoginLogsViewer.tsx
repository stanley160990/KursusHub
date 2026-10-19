import React, { useState } from 'react';
import { 
  Clock, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';
import { LoginRecord, Course } from '../types';

interface LoginLogsViewerProps {
  courses: Course[];
  logins: LoginRecord[];
  selectedCourseId: string;
  onSelectCourse: (courseId: string) => void;
  onRefresh: () => void;
}

export const LoginLogsViewer: React.FC<LoginLogsViewerProps> = ({
  courses,
  logins,
  selectedCourseId,
  onSelectCourse,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const activeCourseId = currentCourse ? currentCourse.id : '';

  const filteredLogins = logins
    .filter((l) => (activeCourseId ? l.courseId === activeCourseId : true))
    .filter(
      (l) =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.npm.includes(searchTerm) ||
        l.loginTimeGmt.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Pagination calculations
  const totalItems = filteredLogins.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedLogins = filteredLogins.slice(startIndex, startIndex + pageSize);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleCourseChange = (courseId: string) => {
    onSelectCourse(courseId);
    setCurrentPage(1);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Daftar Login</h2>
            <span 
              className="text-xs px-2.5 py-0.5 rounded-full font-semibold text-emerald-800"
              style={{ backgroundColor: '#d1e7dd' }}
            >
              {totalItems} Catatan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data login peserta kursus yang terintegrasi secara otomatis dari sistem eksternal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Course selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Pilih Kursus:</label>
            <select
              value={activeCourseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 text-slate-800"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.status === 'inactive' ? 'Inactive' : 'Active'})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleManualRefresh}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-pink-600' : 'text-slate-500'}`} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari NPM, nama, atau waktu..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>Kursus:</span>
            <span className="font-semibold text-slate-800">{currentCourse?.name || '-'}</span>
          </div>
        </div>

        {filteredLogins.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">Belum ada aktivitas login untuk kursus ini</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Aktivitas login akan muncul secara otomatis saat sistem luar mengirimkan data ke endpoint API.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">NPM</th>
                    <th className="py-3 px-4">Nama Mahasiswa</th>
                    <th className="py-3 px-4">Waktu Login</th>
                    <th className="py-3 px-4">Alamat IP Klien</th>
                    <th className="py-3 px-4 text-right">Sumber Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedLogins.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {item.npm}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700">
                            {item.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-800">{item.name}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-900 font-semibold bg-pink-50 text-pink-700 px-2.5 py-1 rounded-lg border border-pink-100">
                          <Clock className="w-3.5 h-3.5 text-pink-600" />
                          <span>{item.loginTimeGmt}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {item.clientIp || '127.0.0.1'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span 
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-800"
                          style={{ backgroundColor: '#d1e7dd' }}
                        >
                          <ShieldCheck className="w-3 h-3 text-emerald-700" />
                          <span>External API</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 bg-slate-50/30">
              <div className="flex items-center gap-2">
                <span>Baris per halaman:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-pink-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-slate-400">|</span>
                <span>
                  Menampilkan {startIndex + 1} - {Math.min(startIndex + pageSize, totalItems)} dari {totalItems} data
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={safeCurrentPage <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                  title="Halaman Pertama"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={safeCurrentPage <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <span className="px-3 py-1 font-medium text-slate-800">
                  Halaman <span className="font-bold">{safeCurrentPage}</span> dari {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={safeCurrentPage >= totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                  title="Halaman Berikutnya"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safeCurrentPage >= totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                  title="Halaman Terakhir"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
