import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  Trash2, 
  Edit3, 
  BookMarked, 
  GraduationCap, 
  X, 
  Check, 
  Search,
  School
} from 'lucide-react';
import { University, Faculty, StudyProgram } from '../types';

interface UniversityReferenceManagementProps {
  universities: University[];
  onAddUniversity: (univ: Omit<University, 'id' | 'createdAt'>) => void;
  onUpdateUniversity: (id: string, updates: Partial<Omit<University, 'id' | 'createdAt'>>) => void;
  onDeleteUniversity: (id: string) => void;
  onAddFaculty: (universityId: string, facultyName: string) => void;
  onDeleteFaculty: (universityId: string, facultyId: string) => void;
  onAddStudyProgram: (universityId: string, facultyId: string, programName: string) => void;
  onDeleteStudyProgram: (universityId: string, facultyId: string, programId: string) => void;
}

export const UniversityReferenceManagement: React.FC<UniversityReferenceManagementProps> = ({
  universities,
  onAddUniversity,
  onUpdateUniversity,
  onDeleteUniversity,
  onAddFaculty,
  onDeleteFaculty,
  onAddStudyProgram,
  onDeleteStudyProgram,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUnivIds, setExpandedUnivIds] = useState<Record<string, boolean>>({
    'univ-01': true,
    'univ-02': true,
  });

  // Modal States
  const [isUnivModalOpen, setIsUnivModalOpen] = useState(false);
  const [editingUnivId, setEditingUnivId] = useState<string | null>(null);
  const [univName, setUnivName] = useState('');
  const [univCode, setUnivCode] = useState('');
  const [univError, setUnivError] = useState('');

  // Add Faculty Modal
  const [facultyModalUnivId, setFacultyModalUnivId] = useState<string | null>(null);
  const [facultyName, setFacultyName] = useState('');
  const [facultyError, setFacultyError] = useState('');

  // Add Study Program Modal
  const [prodiModal, setProdiModal] = useState<{ univId: string; facultyId: string; facultyName: string } | null>(null);
  const [prodiName, setProdiName] = useState('');
  const [prodiError, setProdiError] = useState('');

  const toggleExpandUniv = (id: string) => {
    setExpandedUnivIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Open Add University
  const openAddUnivModal = () => {
    setEditingUnivId(null);
    setUnivName('');
    setUnivCode('');
    setUnivError('');
    setIsUnivModalOpen(true);
  };

  // Open Edit University
  const openEditUnivModal = (u: University) => {
    setEditingUnivId(u.id);
    setUnivName(u.name);
    setUnivCode(u.code);
    setUnivError('');
    setIsUnivModalOpen(true);
  };

  const handleUnivSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!univName.trim()) {
      setUnivError('Nama perguruan tinggi / kampus wajib diisi.');
      return;
    }

    if (editingUnivId) {
      onUpdateUniversity(editingUnivId, {
        name: univName.trim(),
        code: univCode.trim().toUpperCase(),
      });
    } else {
      onAddUniversity({
        name: univName.trim(),
        code: univCode.trim().toUpperCase() || univName.slice(0, 4).toUpperCase(),
        faculties: [],
      });
    }

    setIsUnivModalOpen(false);
  };

  // Add Faculty Submit
  const handleFacultySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyName.trim()) {
      setFacultyError('Nama fakultas wajib diisi.');
      return;
    }
    if (facultyModalUnivId) {
      onAddFaculty(facultyModalUnivId, facultyName.trim());
      setFacultyModalUnivId(null);
      setFacultyName('');
    }
  };

  // Add Prodi Submit
  const handleProdiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodiName.trim()) {
      setProdiError('Nama program studi wajib diisi.');
      return;
    }
    if (prodiModal) {
      onAddStudyProgram(prodiModal.univId, prodiModal.facultyId, prodiName.trim());
      setProdiModal(null);
      setProdiName('');
    }
  };

  const filteredUniversities = universities.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.faculties.some(
        (f) =>
          f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.studyPrograms.some((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Referensi Perguruan Tinggi</h2>
            <span 
              className="text-xs px-2.5 py-0.5 rounded-full font-semibold text-emerald-800"
              style={{ backgroundColor: '#d1e7dd' }}
            >
              {universities.length} Kampus Terdaftar
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Master data perguruan tinggi, struktur fakultas, dan program studi untuk pemetaan mahasiswa & kursus.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kampus, fakultas, prodi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-slate-800 w-56"
            />
          </div>

          <button
            type="button"
            onClick={openAddUnivModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs hover:opacity-90 active:scale-95 transition-all"
            style={{ backgroundColor: '#FF006E' }}
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Perguruan Tinggi</span>
          </button>
        </div>
      </div>

      {/* Universities Hierarchy List */}
      {filteredUniversities.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <School className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">Tidak ada data perguruan tinggi ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Tambahkan perguruan tinggi pertama Anda untuk memulai pendataan fakultas dan program studi.
          </p>
          <button
            type="button"
            onClick={openAddUnivModal}
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white rounded-xl"
            style={{ backgroundColor: '#FF006E' }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Kampus</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUniversities.map((univ) => {
            const isExpanded = !!expandedUnivIds[univ.id];
            const totalProdi = univ.faculties.reduce((acc, f) => acc + f.studyPrograms.length, 0);

            return (
              <div
                key={univ.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all"
              >
                {/* University Header Row */}
                <div className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-slate-50/70 hover:bg-slate-50 transition-colors border-b border-slate-100">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleExpandUniv(univ.id)}
                      className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
                      title={isExpanded ? 'Tutup struktur' : 'Buka struktur'}
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: '#FF006E' }}
                    >
                      {univ.code || univ.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{univ.name}</h3>
                        {univ.code && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-semibold">
                            {univ.code}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{univ.faculties.length} Fakultas</span>
                        <span>·</span>
                        <span>{totalProdi} Program Studi</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for University */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFacultyModalUnivId(univ.id);
                        setFacultyName('');
                        setFacultyError('');
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Tambah Fakultas</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditUnivModal(univ)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                      title="Edit Nama Kampus"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus perguruan tinggi ${univ.name} beserta seluruh fakultas dan prodinya?`)) {
                          onDeleteUniversity(univ.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Kampus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Faculties & Study Programs */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 bg-white space-y-4">
                    {univ.faculties.length === 0 ? (
                      <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl">
                        <BookMarked className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <span className="text-xs font-medium text-slate-600 block">Belum ada fakultas terdaftar</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Klik tombol &quot;Tambah Fakultas&quot; untuk menambahkan fakultas di kampus ini.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {univ.faculties.map((fac) => (
                          <div
                            key={fac.id}
                            className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 pb-2 mb-2 border-b border-slate-200">
                                <div className="flex items-center gap-1.5">
                                  <BookMarked className="w-4 h-4 text-pink-600 shrink-0" />
                                  <h4 className="font-bold text-xs text-slate-900 leading-tight">
                                    {fac.name}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setProdiModal({
                                        univId: univ.id,
                                        facultyId: fac.id,
                                        facultyName: fac.name,
                                      });
                                      setProdiName('');
                                      setProdiError('');
                                    }}
                                    className="p-1 text-emerald-700 hover:bg-emerald-100 rounded transition-colors"
                                    title="Tambah Program Studi"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Hapus ${fac.name} beserta seluruh program studinya?`)) {
                                        onDeleteFaculty(univ.id, fac.id);
                                      }
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                    title="Hapus Fakultas"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* List of Study Programs */}
                              <div className="space-y-1.5 mt-2">
                                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                                  Program Studi ({fac.studyPrograms.length}):
                                </span>

                                {fac.studyPrograms.length === 0 ? (
                                  <span className="text-[11px] text-slate-400 italic block py-1">
                                    Belum ada prodi. Klik [+] untuk menambah.
                                  </span>
                                ) : (
                                  <div className="flex flex-wrap gap-1.5">
                                    {fac.studyPrograms.map((prodi) => (
                                      <div
                                        key={prodi.id}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs text-slate-700 group shadow-2xs"
                                      >
                                        <GraduationCap className="w-3 h-3 text-slate-400" />
                                        <span className="font-medium text-[11px]">{prodi.name}</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (confirm(`Hapus Program Studi "${prodi.name}"?`)) {
                                              onDeleteStudyProgram(univ.id, fac.id, prodi.id);
                                            }
                                          }}
                                          className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                                          title="Hapus Prodi"
                                        >
                                          <X className="w-2.5 h-2.5" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => {
                                  setProdiModal({
                                    univId: univ.id,
                                    facultyId: fac.id,
                                    facultyName: fac.name,
                                  });
                                  setProdiName('');
                                  setProdiError('');
                                }}
                                className="text-[11px] font-semibold text-pink-700 hover:underline flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3 text-pink-600" />
                                <span>Tambah Program Studi</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add/Edit University */}
      {isUnivModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingUnivId ? 'Edit Perguruan Tinggi' : 'Tambah Perguruan Tinggi Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsUnivModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {univError && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {univError}
              </div>
            )}

            <form onSubmit={handleUnivSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kampus / Universitas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Universitas Indonesia"
                  value={univName}
                  onChange={(e) => setUnivName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Singkatan / Kode Kampus
                </label>
                <input
                  type="text"
                  placeholder="Contoh: UI, ITB, UGM"
                  value={univCode}
                  onChange={(e) => setUnivCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUnivModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs"
                  style={{ backgroundColor: '#FF006E' }}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingUnivId ? 'Simpan Perubahan' : 'Tambah Kampus'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Faculty */}
      {facultyModalUnivId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Tambah Fakultas Baru</h3>
              <button
                type="button"
                onClick={() => setFacultyModalUnivId(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {facultyError && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {facultyError}
              </div>
            )}

            <form onSubmit={handleFacultySubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Fakultas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Fakultas Ilmu Komputer"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFacultyModalUnivId(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs"
                  style={{ backgroundColor: '#FF006E' }}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Tambah Fakultas</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Study Program */}
      {prodiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Tambah Program Studi</h3>
                <p className="text-xs text-slate-500">{prodiModal.facultyName}</p>
              </div>
              <button
                type="button"
                onClick={() => setProdiModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {prodiError && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {prodiError}
              </div>
            )}

            <form onSubmit={handleProdiSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Program Studi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Teknik Informatika"
                  value={prodiName}
                  onChange={(e) => setProdiName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProdiModal(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs"
                  style={{ backgroundColor: '#FF006E' }}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Tambah Program Studi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
