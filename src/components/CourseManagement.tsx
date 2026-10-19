import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  Trash2, 
  Edit3, 
  Search, 
  Users, 
  GraduationCap, 
  X, 
  Check, 
  BookOpen,
  Building2,
  CheckCircle2,
  Power,
  BookMarked,
  School
} from 'lucide-react';
import { Course, Student, InstructorAssistant, University, CourseStatus } from '../types';

interface CourseManagementProps {
  courses: Course[];
  students: Student[];
  instructors: InstructorAssistant[];
  universities: University[];
  onAddCourse: (course: Omit<Course, 'id' | 'createdAt'>) => void;
  onUpdateCourse: (id: string, updates: Partial<Omit<Course, 'id' | 'createdAt'>>) => void;
  onDeleteCourse: (id: string) => void;
  onSelectCourseForStudents: (courseId: string) => void;
}

export const CourseManagement: React.FC<CourseManagementProps> = ({
  courses,
  students,
  instructors,
  universities,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onSelectCourseForStudents,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [universityId, setUniversityId] = useState<string>('');
  const [facultyId, setFacultyId] = useState<string>('');
  const [studyProgramId, setStudyProgramId] = useState<string>('');
  const [status, setStatus] = useState<CourseStatus>('active');
  const [dates, setDates] = useState<string[]>(['']);
  const [formError, setFormError] = useState('');

  // Helpers for cascading dropdowns
  const selectedUniv = universities.find((u) => u.id === universityId);
  const availableFaculties = selectedUniv?.faculties || [];
  const selectedFaculty = availableFaculties.find((f) => f.id === facultyId);
  const availableStudyPrograms = selectedFaculty?.studyPrograms || [];

  const handleUniversityChange = (selectedUnivId: string) => {
    setUniversityId(selectedUnivId);
    const u = universities.find((univ) => univ.id === selectedUnivId);
    const firstFacId = u?.faculties[0]?.id || '';
    setFacultyId(firstFacId);
    const firstFacObj = u?.faculties.find((f) => f.id === firstFacId);
    setStudyProgramId(firstFacObj?.studyPrograms[0]?.id || '');
  };

  const handleFacultyChange = (selectedFacId: string) => {
    setFacultyId(selectedFacId);
    const f = availableFaculties.find((fac) => fac.id === selectedFacId);
    setStudyProgramId(f?.studyPrograms[0]?.id || '');
  };

  const openAddModal = () => {
    setEditingCourseId(null);
    setName('');
    setDescription('');
    setStatus('active');

    const defaultUnivId = universities[0]?.id || '';
    const defaultUnivObj = universities.find((u) => u.id === defaultUnivId);
    const defaultFacId = defaultUnivObj?.faculties[0]?.id || '';
    const defaultFacObj = defaultUnivObj?.faculties.find((f) => f.id === defaultFacId);
    const defaultProdiId = defaultFacObj?.studyPrograms[0]?.id || '';

    setUniversityId(defaultUnivId);
    setFacultyId(defaultFacId);
    setStudyProgramId(defaultProdiId);

    const today = new Date().toISOString().split('T')[0];
    setDates([today]);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourseId(course.id);
    setName(course.name);
    setDescription(course.description);
    setStatus(course.status || 'active');

    const foundUnivId = course.universityId || universities.find((u) => u.name === course.universityName)?.id || universities[0]?.id || '';
    const foundUnivObj = universities.find((u) => u.id === foundUnivId);

    const foundFacId = course.facultyId || foundUnivObj?.faculties.find((f) => f.name === course.facultyName)?.id || foundUnivObj?.faculties[0]?.id || '';
    const foundFacObj = foundUnivObj?.faculties.find((f) => f.id === foundFacId);

    const foundProdiId = course.studyProgramId || foundFacObj?.studyPrograms.find((p) => p.name === course.studyProgramName)?.id || foundFacObj?.studyPrograms[0]?.id || '';

    setUniversityId(foundUnivId);
    setFacultyId(foundFacId);
    setStudyProgramId(foundProdiId);

    setDates(course.dates && course.dates.length > 0 ? [...course.dates] : ['']);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleAddDateField = () => {
    setDates([...dates, '']);
  };

  const handleRemoveDateField = (index: number) => {
    if (dates.length <= 1) {
      setDates(['']);
      return;
    }
    const updated = dates.filter((_, i) => i !== index);
    setDates(updated);
  };

  const handleDateChange = (index: number, value: string) => {
    const updated = [...dates];
    updated[index] = value;
    setDates(updated);
  };

  const handleToggleStatus = (course: Course) => {
    const newStatus: CourseStatus = (course.status || 'active') === 'active' ? 'inactive' : 'active';
    onUpdateCourse(course.id, { status: newStatus });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Nama kursus wajib diisi.');
      return;
    }
    if (!description.trim()) {
      setFormError('Deskripsi singkat kursus wajib diisi.');
      return;
    }

    const matchedUniv = universities.find((u) => u.id === universityId);
    const matchedFac = matchedUniv?.faculties.find((f) => f.id === facultyId);
    const matchedProdi = matchedFac?.studyPrograms.find((p) => p.id === studyProgramId);

    const validDates = dates.map((d) => d.trim()).filter((d) => d.length > 0);
    if (validDates.length === 0) {
      setFormError('Minimal satu tanggal pelaksanaan kursus wajib ditambahkan.');
      return;
    }

    if (editingCourseId) {
      onUpdateCourse(editingCourseId, {
        name: name.trim(),
        description: description.trim(),
        universityId: matchedUniv?.id || '',
        universityName: matchedUniv?.name || '',
        facultyId: matchedFac?.id || '',
        facultyName: matchedFac?.name || '',
        studyProgramId: matchedProdi?.id || '',
        studyProgramName: matchedProdi?.name || '',
        dates: validDates,
        status,
      });
    } else {
      onAddCourse({
        name: name.trim(),
        description: description.trim(),
        universityId: matchedUniv?.id || '',
        universityName: matchedUniv?.name || '',
        facultyId: matchedFac?.id || '',
        facultyName: matchedFac?.name || '',
        studyProgramId: matchedProdi?.id || '',
        studyProgramName: matchedProdi?.name || '',
        dates: validDates,
        status,
      });
    }

    setIsModalOpen(false);
  };

  const filteredCourses = courses
    .filter((c) => {
      if (statusFilter === 'active') return (c.status || 'active') === 'active';
      if (statusFilter === 'inactive') return c.status === 'inactive';
      return true;
    })
    .filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.universityName && c.universityName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.facultyName && c.facultyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.studyProgramName && c.studyProgramName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const activeCount = courses.filter((c) => (c.status || 'active') === 'active').length;
  const inactiveCount = courses.filter((c) => c.status === 'inactive').length;

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Manajemen Kursus</h2>
            <span 
              className="text-xs px-2.5 py-0.5 rounded-full font-semibold text-emerald-800"
              style={{ backgroundColor: '#d1e7dd' }}
            >
              {courses.length} Kursus Terdaftar
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola nama kursus, perguruan tinggi, fakultas, program studi, status (Active/Inactive), dan tanggal pelaksanaan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({courses.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'active' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600 hover:text-emerald-800'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Active ({activeCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('inactive')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'inactive' ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Power className="w-3 h-3 text-slate-500" />
              <span>Inactive ({inactiveCount})</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kursus, fakultas, prodi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-slate-800 w-48 sm:w-56"
            />
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            style={{ backgroundColor: '#FF006E' }}
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kursus Baru</span>
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">Tidak ada kursus ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Mulai dengan menambahkan kursus pertama Anda beserta perguruan tinggi mitra, fakultas, program studi, status aktif, dan tanggal pelaksanaannya.
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white rounded-lg cursor-pointer"
            style={{ backgroundColor: '#FF006E' }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Kursus</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => {
            const courseStudentsCount = students.filter((s) => s.courseId === course.id).length;
            const courseInstructorsCount = instructors.filter((i) => i.courseId === course.id).length;
            const isCourseActive = (course.status || 'active') === 'active';

            return (
              <div
                key={course.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                  isCourseActive ? 'border-slate-200 hover:border-slate-300' : 'border-slate-200 bg-slate-50/60 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400 font-semibold uppercase">
                        ID: {course.id}
                      </span>
                      {/* Active / Inactive Status Badge & Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(course)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                          isCourseActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                        }`}
                        title={`Status saat ini: ${isCourseActive ? 'Active' : 'Inactive'}. Klik untuk mengubah.`}
                      >
                        {isCourseActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <Power className="w-3 h-3 text-slate-500" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(course)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit data, fakultas, prodi & status kursus"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus kursus "${course.name}" beserta seluruh data mahasiswa dan instrukturnya?`)) {
                            onDeleteCourse(course.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus kursus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug mb-2">
                    {course.name}
                  </h3>

                  {/* University, Faculty, & Study Program Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {course.universityName && (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <Building2 className="w-3 h-3 text-emerald-700" />
                        <span>{course.universityName}</span>
                      </div>
                    )}
                    {course.facultyName && (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        <BookMarked className="w-3 h-3 text-blue-700" />
                        <span>Fakultas: {course.facultyName}</span>
                      </div>
                    )}
                    {course.studyProgramName && (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        <School className="w-3 h-3 text-purple-700" />
                        <span>Prodi: {course.studyProgramName}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-3 mb-4">
                    {course.description}
                  </p>

                  {/* Dynamic Execution Dates Section */}
                  <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                      <Calendar className="w-3.5 h-3.5 text-pink-600" />
                      <span>Tanggal Pelaksanaan ({course.dates?.length || 0})</span>
                    </div>
                    {course.dates && course.dates.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {course.dates.map((dateStr, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded-md font-mono bg-white border border-slate-200 text-slate-700"
                          >
                            {dateStr}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Belum ada tanggal ditentukan</span>
                    )}
                  </div>
                </div>

                {/* Footer counts & direct actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onSelectCourseForStudents(course.id)}
                      className="flex items-center gap-1 text-slate-600 hover:text-pink-600 font-medium transition-colors cursor-pointer"
                      title="Lihat mahasiswa kursus ini"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      <span>{courseStudentsCount} Mhs</span>
                    </button>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{courseInstructorsCount} Pengajar</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectCourseForStudents(course.id)}
                    className="text-xs font-semibold hover:underline cursor-pointer"
                    style={{ color: '#FF006E' }}
                  >
                    Kelola Mahasiswa →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingCourseId ? 'Edit Data Kursus' : 'Tambah Kursus Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kursus <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Arsitektur Cloud & DevOps Modern"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 text-slate-800"
                />
              </div>

              {/* Status Active / Inactive Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Status Kursus <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus('active')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      status === 'active'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>Active (Aktif)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('inactive')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      status === 'inactive'
                        ? 'bg-slate-100 border-slate-400 text-slate-800 ring-2 ring-slate-400/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Power className={`w-4 h-4 ${status === 'inactive' ? 'text-slate-600' : 'text-slate-400'}`} />
                    <span>Inactive (Tidak Aktif)</span>
                  </button>
                </div>
              </div>

              {/* Dropdown Perguruan Tinggi (Diambil dari Data Referensi) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Perguruan Tinggi Mitra (Data Referensi) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={universityId}
                  onChange={(e) => handleUniversityChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 text-slate-800 font-medium"
                >
                  <option value="">-- Pilih Perguruan Tinggi --</option>
                  {universities.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} {u.code ? `(${u.code})` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Data kampus bersumber dari Menu Referensi Perguruan Tinggi.
                </p>
              </div>

              {/* Dropdown Fakultas (Berdasarkan Kampus Terpilih) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fakultas (Data Referensi)
                </label>
                <select
                  value={facultyId}
                  onChange={(e) => handleFacultyChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 text-slate-800 font-medium"
                >
                  <option value="">-- Pilih Fakultas --</option>
                  {availableFaculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown Program Studi (Berdasarkan Fakultas Terpilih) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Program Studi (Data Referensi)
                </label>
                <select
                  value={studyProgramId}
                  onChange={(e) => setStudyProgramId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 text-slate-800 font-medium"
                >
                  <option value="">-- Pilih Program Studi --</option>
                  {availableStudyPrograms.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi Singkat Kursus <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ringkasan materi, target capaian pembelajaran kursus..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 text-slate-800"
                />
              </div>

              {/* Dynamic Dates Section */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800">
                      Tanggal Pelaksanaan (Dinamis)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Tambahkan satu atau beberapa tanggal pelaksanaan kursus.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddDateField}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-pink-700 bg-pink-50 hover:bg-pink-100 rounded-lg border border-pink-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Tanggal</span>
                  </button>
                </div>

                <div className="space-y-2 mt-2">
                  {dates.map((d, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400 w-5">#{index + 1}</span>
                      <input
                        type="date"
                        required
                        value={d}
                        onChange={(e) => handleDateChange(index, e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-pink-500 text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveDateField(index)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                        title="Hapus tanggal ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs hover:opacity-90 transition-all cursor-pointer"
                  style={{ backgroundColor: '#FF006E' }}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingCourseId ? 'Simpan Perubahan' : 'Buat Kursus'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
