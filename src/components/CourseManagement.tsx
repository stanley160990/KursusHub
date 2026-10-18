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
  Building2 
} from 'lucide-react';
import { Course, Student, InstructorAssistant, University } from '../types';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [universityId, setUniversityId] = useState<string>('');
  const [dates, setDates] = useState<string[]>(['']);
  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    setEditingCourseId(null);
    setName('');
    setDescription('');
    setUniversityId(universities[0]?.id || '');
    const today = new Date().toISOString().split('T')[0];
    setDates([today]);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourseId(course.id);
    setName(course.name);
    setDescription(course.description);
    setUniversityId(course.universityId || universities.find(u => u.name === course.universityName)?.id || universities[0]?.id || '');
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
        dates: validDates,
      });
    } else {
      onAddCourse({
        name: name.trim(),
        description: description.trim(),
        universityId: matchedUniv?.id || '',
        universityName: matchedUniv?.name || '',
        dates: validDates,
      });
    }

    setIsModalOpen(false);
  };

  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.universityName && c.universityName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            Kelola nama kursus, perguruan tinggi mitra, deskripsi singkat, dan tanggal pelaksanaan dinamis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kursus atau kampus..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-slate-800 w-56"
            />
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs hover:opacity-90 active:scale-95 transition-all"
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
            Mulai dengan menambahkan kursus pertama Anda beserta perguruan tinggi mitra dan tanggal pelaksanaannya.
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white rounded-lg"
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

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono text-slate-400 font-semibold uppercase">
                      ID: {course.id}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(course)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit kursus"
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
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus kursus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug mb-1">
                    {course.name}
                  </h3>

                  {/* University Reference Badge */}
                  {course.universityName && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 mb-2 w-fit">
                      <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{course.universityName}</span>
                    </div>
                  )}

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
                      className="flex items-center gap-1 text-slate-600 hover:text-pink-600 font-medium transition-colors"
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
                    className="text-xs font-semibold hover:underline"
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

              {/* Dropdown Perguruan Tinggi (Diambil dari Data Referensi) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Perguruan Tinggi Mitra (Data Referensi) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={universityId}
                  onChange={(e) => setUniversityId(e.target.value)}
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
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-pink-700 bg-pink-50 hover:bg-pink-100 rounded-lg border border-pink-200 transition-colors"
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
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
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
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs hover:opacity-90 transition-all"
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
