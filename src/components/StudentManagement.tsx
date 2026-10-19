import React, { useState, useRef } from 'react';
import { 
  Plus, 
  FileSpreadsheet, 
  Download, 
  Search, 
  Trash2, 
  Key, 
  Clock, 
  Building, 
  Upload, 
  X, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles,
  BookOpen,
  Pencil
} from 'lucide-react';
import { Student, Course, University } from '../types';
import { hashPassword, generateSecurePassword, generateUniqueNPM } from '../utils/crypto';
import { 
  downloadStudentTemplate, 
  downloadGeneratedPasswordsExcel, 
  parseAndProcessStudentExcel 
} from '../utils/excel';

interface StudentManagementProps {
  courses: Course[];
  students: Student[];
  universities: University[];
  selectedCourseId: string;
  onSelectCourse: (courseId: string) => void;
  onAddStudent: (student: Omit<Student, 'id' | 'createdAt'>) => void;
  onAddBatchStudents: (students: Student[]) => void;
  onUpdateStudent: (id: string, updates: Partial<Student>) => void;
  onDeleteStudent: (id: string) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  courses,
  students,
  universities = [],
  selectedCourseId,
  onSelectCourse,
  onAddStudent,
  onAddBatchStudents,
  onUpdateStudent,
  onDeleteStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isSuccessExportModalOpen, setIsSuccessExportModalOpen] = useState(false);
  const [lastExportRows, setLastExportRows] = useState<{ npm: string; pass: string }[]>([]);
  const [showHashId, setShowHashId] = useState<string | null>(null);

  // Edit Student Modal State
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editNpm, setEditNpm] = useState('');
  const [editClassName, setEditClassName] = useState('4IA01');
  const [editUniversityId, setEditUniversityId] = useState('');
  const [editUniversity, setEditUniversity] = useState('');
  const [editFacultyId, setEditFacultyId] = useState('');
  const [editFaculty, setEditFaculty] = useState('');
  const [editStudyProgram, setEditStudyProgram] = useState('');
  const [editAccessHours, setEditAccessHours] = useState('08:00 - 12:00');
  const [editChangePassword, setEditChangePassword] = useState(false);
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editError, setEditError] = useState('');
  const [isEditSaving, setIsEditSaving] = useState(false);

  // Manual Form State
  const [name, setName] = useState('');
  const [npm, setNpm] = useState('');
  const [className, setClassName] = useState('4IA01');
  const [universityId, setUniversityId] = useState('');
  const [university, setUniversity] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [faculty, setFaculty] = useState('');
  const [studyProgram, setStudyProgram] = useState('');
  const [password, setPassword] = useState('');
  const [accessHours, setAccessHours] = useState('08:00 - 12:00');
  const [manualError, setManualError] = useState('');

  // Excel Upload State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isProcessingExcel, setIsProcessingExcel] = useState(false);
  const [excelError, setExcelError] = useState('');

  // Course validation
  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const activeCourseId = currentCourse ? currentCourse.id : '';

  // Filter students
  const filteredStudents = students
    .filter((s) => (activeCourseId ? s.courseId === activeCourseId : true))
    .filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.npm.includes(searchTerm) ||
        s.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.university.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Active university faculties and study programs for cascading dropdown
  const currentSelectedUniv = universities.find((u) => u.id === universityId) || universities[0];
  const availableFaculties = currentSelectedUniv ? currentSelectedUniv.faculties : [];
  const currentSelectedFaculty = availableFaculties.find((f) => f.id === facultyId) || availableFaculties[0];
  const availableStudyPrograms = currentSelectedFaculty ? currentSelectedFaculty.studyPrograms : [];

  // Generate unique 8-digit NPM starting with 'G01'
  const handleGenerateNpm = () => {
    const existingNpmsInCourse = students
      .filter((s) => s.courseId === activeCourseId)
      .map((s) => s.npm);
    const newNpm = generateUniqueNPM(existingNpmsInCourse);
    setNpm(newNpm);
  };

  const handleUniversityChange = (univId: string) => {
    const selected = universities.find((u) => u.id === univId);
    if (selected) {
      setUniversityId(selected.id);
      setUniversity(selected.name);
      const firstFac = selected.faculties[0];
      if (firstFac) {
        setFacultyId(firstFac.id);
        setFaculty(firstFac.name);
        const firstProdi = firstFac.studyPrograms[0];
        setStudyProgram(firstProdi ? firstProdi.name : '');
      } else {
        setFacultyId('');
        setFaculty('');
        setStudyProgram('');
      }
    }
  };

  const handleFacultyChange = (facId: string) => {
    const selectedFac = availableFaculties.find((f) => f.id === facId);
    if (selectedFac) {
      setFacultyId(selectedFac.id);
      setFaculty(selectedFac.name);
      const firstProdi = selectedFac.studyPrograms[0];
      setStudyProgram(firstProdi ? firstProdi.name : '');
    }
  };

  // Active university faculties and study programs for Edit modal
  const currentEditUniv = universities.find((u) => u.id === editUniversityId) || universities[0];
  const editAvailableFaculties = currentEditUniv ? currentEditUniv.faculties : [];
  const currentEditFaculty = editAvailableFaculties.find((f) => f.id === editFacultyId) || editAvailableFaculties[0];
  const editAvailableStudyPrograms = currentEditFaculty ? currentEditFaculty.studyPrograms : [];

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setEditName(student.name);
    setEditNpm(student.npm);
    setEditClassName(student.className);
    setEditAccessHours(student.accessHours);
    setEditError('');
    setEditChangePassword(false);
    setEditPassword(student.plainPasswordPreview || '');
    setShowEditPassword(false);

    // Match university
    const foundUniv = universities.find(
      (u) => u.name.trim().toLowerCase() === student.university.trim().toLowerCase()
    ) || universities[0];

    if (foundUniv) {
      setEditUniversityId(foundUniv.id);
      setEditUniversity(foundUniv.name);
      const foundFac = foundUniv.faculties.find(
        (f) => f.name.trim().toLowerCase() === student.faculty.trim().toLowerCase()
      ) || foundUniv.faculties[0];

      if (foundFac) {
        setEditFacultyId(foundFac.id);
        setEditFaculty(foundFac.name);
        const foundProdi = foundFac.studyPrograms.find(
          (p) => p.name.trim().toLowerCase() === student.studyProgram.trim().toLowerCase()
        ) || foundFac.studyPrograms[0];
        setEditStudyProgram(foundProdi ? foundProdi.name : student.studyProgram);
      } else {
        setEditFacultyId('');
        setEditFaculty(student.faculty);
        setEditStudyProgram(student.studyProgram);
      }
    } else {
      setEditUniversityId('');
      setEditUniversity(student.university);
      setEditFacultyId('');
      setEditFaculty(student.faculty);
      setEditStudyProgram(student.studyProgram);
    }

    setIsEditModalOpen(true);
  };

  const handleEditUniversityChange = (univId: string) => {
    const selected = universities.find((u) => u.id === univId);
    if (selected) {
      setEditUniversityId(selected.id);
      setEditUniversity(selected.name);
      const firstFac = selected.faculties[0];
      if (firstFac) {
        setEditFacultyId(firstFac.id);
        setEditFaculty(firstFac.name);
        const firstProdi = firstFac.studyPrograms[0];
        setEditStudyProgram(firstProdi ? firstProdi.name : '');
      } else {
        setEditFacultyId('');
        setEditFaculty('');
        setEditStudyProgram('');
      }
    }
  };

  const handleEditFacultyChange = (facId: string) => {
    const selectedFac = editAvailableFaculties.find((f) => f.id === facId);
    if (selectedFac) {
      setEditFacultyId(selectedFac.id);
      setEditFaculty(selectedFac.name);
      const firstProdi = selectedFac.studyPrograms[0];
      setEditStudyProgram(firstProdi ? firstProdi.name : '');
    }
  };

  const handleGenerateEditNpm = () => {
    if (!editingStudent) return;
    const existingNpmsInCourse = students
      .filter((s) => s.courseId === editingStudent.courseId && s.id !== editingStudent.id)
      .map((s) => s.npm);
    const newNpm = generateUniqueNPM(existingNpmsInCourse);
    setEditNpm(newNpm);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    if (!editName.trim()) {
      setEditError('Nama mahasiswa wajib diisi.');
      return;
    }
    if (!editNpm.trim()) {
      setEditError('NPM mahasiswa wajib diisi.');
      return;
    }

    // Verify uniqueness of NPM in current course excluding self
    const isDuplicate = students.some(
      (s) => s.courseId === editingStudent.courseId && s.id !== editingStudent.id && s.npm.toUpperCase() === editNpm.trim().toUpperCase()
    );
    if (isDuplicate) {
      setEditError(`NPM ${editNpm} sudah terdaftar pada mahasiswa lain di kursus ini.`);
      return;
    }

    setIsEditSaving(true);
    try {
      const updates: Partial<Student> = {
        name: editName.trim(),
        npm: editNpm.trim().toUpperCase(),
        className: editClassName.trim(),
        university: editUniversity.trim() || currentEditUniv?.name || editingStudent.university,
        faculty: editFaculty.trim() || currentEditFaculty?.name || editingStudent.faculty,
        studyProgram: editStudyProgram.trim() || editingStudent.studyProgram,
        accessHours: editAccessHours.trim(),
      };

      if (editChangePassword) {
        if (!editPassword.trim()) {
          setEditError('Password baru tidak boleh kosong jika opsi ubah password dicentang.');
          setIsEditSaving(false);
          return;
        }
        const pwdHash = await hashPassword(editPassword.trim());
        updates.passwordHash = pwdHash;
        updates.plainPasswordPreview = editPassword.trim();
      }

      onUpdateStudent(editingStudent.id, updates);
      setIsEditModalOpen(false);
      setEditingStudent(null);
    } catch {
      setEditError('Gagal memperbarui data mahasiswa.');
    } finally {
      setIsEditSaving(false);
    }
  };

  const openManualModal = () => {
    setName('');
    const existingNpmsInCourse = students
      .filter((s) => s.courseId === activeCourseId)
      .map((s) => s.npm);
    const initialNpm = generateUniqueNPM(existingNpmsInCourse);
    setNpm(initialNpm);
    setClassName('4IA01');

    // Auto-select university based on current course or default to first university in references
    const matchedUniv = universities.find(
      (u) => u.id === currentCourse?.universityId || u.name === currentCourse?.universityName
    ) || universities[0];

    if (matchedUniv) {
      setUniversityId(matchedUniv.id);
      setUniversity(matchedUniv.name);
      const firstFac = matchedUniv.faculties[0];
      if (firstFac) {
        setFacultyId(firstFac.id);
        setFaculty(firstFac.name);
        const firstProdi = firstFac.studyPrograms[0];
        setStudyProgram(firstProdi ? firstProdi.name : '');
      } else {
        setFacultyId('');
        setFaculty('');
        setStudyProgram('');
      }
    } else {
      setUniversityId('');
      setUniversity('');
      setFacultyId('');
      setFaculty('');
      setStudyProgram('');
    }

    setPassword(generateSecurePassword(8));
    setAccessHours('08:00 - 12:00');
    setManualError('');
    setIsManualModalOpen(true);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourseId) {
      setManualError('Pilih kursus tujuan terlebih dahulu.');
      return;
    }
    if (!name.trim()) {
      setManualError('Nama mahasiswa wajib diisi.');
      return;
    }
    if (!npm.trim()) {
      setManualError('NPM mahasiswa wajib diisi.');
      return;
    }

    // Verify uniqueness of NPM in current course
    const isDuplicate = students.some(
      (s) => s.courseId === activeCourseId && s.npm.toUpperCase() === npm.trim().toUpperCase()
    );
    if (isDuplicate) {
      setManualError(`NPM ${npm} sudah terdaftar pada kursus ini. Silakan gunakan tombol Generate NPM untuk nomor unik.`);
      return;
    }

    const plainPass = password.trim() || generateSecurePassword(8);
    const pwdHash = await hashPassword(plainPass);

    onAddStudent({
      courseId: activeCourseId,
      name: name.trim(),
      npm: npm.trim().toUpperCase(),
      className: className.trim(),
      university: university.trim() || currentSelectedUniv?.name || 'Universitas Indonesia',
      faculty: faculty.trim() || currentSelectedFaculty?.name || 'Fakultas Ilmu Komputer',
      studyProgram: studyProgram.trim() || 'Teknik Informatika',
      passwordHash: pwdHash,
      plainPasswordPreview: plainPass,
      accessHours: accessHours.trim(),
    });

    setIsManualModalOpen(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setExcelFile(e.target.files[0]);
      setExcelError('');
    }
  };

  const handleProcessExcel = async () => {
    if (!excelFile) {
      setExcelError('Pilih berkas Excel (.xlsx / .csv) terlebih dahulu.');
      return;
    }
    if (!activeCourseId) {
      setExcelError('Pilih kursus tujuan terlebih dahulu.');
      return;
    }

    setIsProcessingExcel(true);
    setExcelError('');

    try {
      const result = await parseAndProcessStudentExcel(excelFile, activeCourseId);

      if (result.students.length === 0) {
        setExcelError('Tidak ada data valid yang dapat diimpor dari file.');
        setIsProcessingExcel(false);
        return;
      }

      // Add to state
      onAddBatchStudents(result.students);
      setLastExportRows(result.exportRows);

      // Trigger instant download of the 2-column Excel [npm, pass] as required:
      // "untuk input Excel ini akan digenerate password by sistem lalu kembalikan excel berisi password generate dua kolom (npm, dan pass)"
      downloadGeneratedPasswordsExcel(result.exportRows, currentCourse ? currentCourse.name : 'kursus');

      setIsExcelModalOpen(false);
      setExcelFile(null);
      setIsSuccessExportModalOpen(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses file Excel';
      setExcelError(msg);
    } finally {
      setIsProcessingExcel(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Course Selector & Actions Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Manajemen Mahasiswa</h2>
            <span 
              className="text-xs px-2.5 py-0.5 rounded-full font-semibold text-emerald-800"
              style={{ backgroundColor: '#d1e7dd' }}
            >
              {filteredStudents.length} Mahasiswa
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data peserta kursus, waktu akses, enkripsi password BCrypt, dan fitur Import Excel dengan auto-generated password.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Course Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Pilih Kursus:</label>
            <select
              value={activeCourseId}
              onChange={(e) => onSelectCourse(e.target.value)}
              className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 text-slate-800"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.status === 'inactive' ? 'Inactive' : 'Active'})
                </option>
              ))}
            </select>
          </div>

          {/* Import Excel Button */}
          <button
            type="button"
            onClick={() => setIsExcelModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Import Excel & Generate Password</span>
          </button>

          {/* Manual Add Button */}
          <button
            type="button"
            onClick={openManualModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs hover:opacity-90 active:scale-95 transition-all"
            style={{ backgroundColor: '#FF006E' }}
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mahasiswa</span>
          </button>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama, NPM, kelas, universitas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 text-slate-800"
            />
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>Kursus Aktif:</span>
            <span className="font-semibold text-slate-800">{currentCourse?.name || '-'}</span>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">Tidak ada mahasiswa terdaftar</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Silakan tambahkan data mahasiswa secara manual atau import massal melalui berkas Excel.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nama Mahasiswa & NPM</th>
                  <th className="py-3 px-4">Kelas & Universitas</th>
                  <th className="py-3 px-4">Fakultas / Prodi</th>
                  <th className="py-3 px-4">Waktu Akses</th>
                  <th className="py-3 px-4">Password & Enkripsi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{student.name}</div>
                      <div className="text-[11px] font-mono text-slate-500">{student.npm}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-mono font-medium text-slate-700 bg-slate-100 mr-2">
                        {student.className}
                      </span>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span>{student.university}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{student.faculty}</div>
                      <div className="text-[11px] text-slate-400">{student.studyProgram}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{student.accessHours}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        {student.plainPasswordPreview && (
                          <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-800 font-semibold">
                            <Key className="w-3 h-3 text-emerald-600" />
                            <span>Pass: {student.plainPasswordPreview}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                            BCrypt Hash
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowHashId(showHashId === student.id ? null : student.id)}
                            className="text-[10px] text-slate-400 hover:text-slate-700 flex items-center gap-0.5"
                          >
                            {showHashId === student.id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            <span>{showHashId === student.id ? 'Tutup' : 'Lihat'}</span>
                          </button>
                        </div>
                        {showHashId === student.id && (
                          <div className="text-[10px] font-mono bg-slate-100 p-1 rounded text-slate-600 break-all max-w-xs">
                            {student.passwordHash}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(student)}
                          className="p-1.5 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit data mahasiswa & ganti password"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus data mahasiswa ${student.name} (${student.npm})?`)) {
                              onDeleteStudent(student.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus mahasiswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Student Modal */}
      {isEditModalOpen && editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-pink-50 text-pink-600">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Data Mahasiswa</h3>
                  <p className="text-[11px] text-slate-500">Edit semua atribut mahasiswa & ganti password</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingStudent(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Budi Santoso"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      NPM <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateEditNpm}
                      className="text-[10px] font-semibold text-pink-700 hover:underline flex items-center gap-0.5"
                      title="Generate 8-digit NPM unik baru berawalan G01"
                    >
                      <Sparkles className="w-3 h-3 text-pink-600" />
                      <span>Gen NPM</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="G0143501"
                    value={editNpm}
                    onChange={(e) => setEditNpm(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kelas</label>
                  <input
                    type="text"
                    required
                    placeholder="4IA01"
                    value={editClassName}
                    onChange={(e) => setEditClassName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Waktu Akses (Jam)</label>
                  <input
                    type="text"
                    required
                    placeholder="08:00 - 12:00"
                    value={editAccessHours}
                    onChange={(e) => setEditAccessHours(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Perguruan Tinggi (Diambil dari Referensi) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Perguruan Tinggi (Data Referensi) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editUniversityId}
                  onChange={(e) => handleEditUniversityChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 font-medium text-slate-800"
                >
                  {universities.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} {u.code ? `(${u.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fakultas & Program Studi (Diambil dari Referensi) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fakultas (Data Referensi) <span className="text-rose-500">*</span>
                  </label>
                  {editAvailableFaculties.length > 0 ? (
                    <select
                      value={editFacultyId}
                      onChange={(e) => handleEditFacultyChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 font-medium text-slate-800"
                    >
                      {editAvailableFaculties.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="Fakultas Ilmu Komputer"
                      value={editFaculty}
                      onChange={(e) => setEditFaculty(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Program Studi (Data Referensi) <span className="text-rose-500">*</span>
                  </label>
                  {editAvailableStudyPrograms.length > 0 ? (
                    <select
                      value={editStudyProgram}
                      onChange={(e) => setEditStudyProgram(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 font-medium text-slate-800"
                    >
                      {editAvailableStudyPrograms.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="Teknik Informatika"
                      value={editStudyProgram}
                      onChange={(e) => setEditStudyProgram(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500"
                    />
                  )}
                </div>
              </div>

              {/* Ganti Password Section */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editChangePassword}
                      onChange={(e) => {
                        setEditChangePassword(e.target.checked);
                        if (e.target.checked && !editPassword) {
                          setEditPassword(generateSecurePassword(8));
                        }
                      }}
                      className="w-4 h-4 text-pink-600 rounded border-slate-300 focus:ring-pink-500"
                    />
                    <span className="text-xs font-bold text-slate-800">Ganti Password Mahasiswa</span>
                  </label>

                  {editChangePassword && (
                    <button
                      type="button"
                      onClick={() => setEditPassword(generateSecurePassword(8))}
                      className="text-[11px] text-pink-700 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Sparkles className="w-3 h-3 text-pink-600" />
                      <span>Generate Acak</span>
                    </button>
                  )}
                </div>

                {editChangePassword ? (
                  <div className="pt-1.5 space-y-1.5">
                    <div className="relative">
                      <input
                        type={showEditPassword ? 'text' : 'password'}
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="Ketik password baru"
                        className="w-full pl-3 pr-9 py-2 text-xs bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-pink-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Password baru akan di-hash ulang menggunakan enkripsi BCrypt saat disimpan.
                    </p>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Password saat ini tetap aktif dan tidak diubah.</span>
                    {editingStudent.plainPasswordPreview && (
                      <span className="font-mono text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                        Pass: {editingStudent.plainPasswordPreview}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingStudent(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isEditSaving}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
                  style={{ backgroundColor: '#FF006E' }}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEditSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Add Student Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Input Data Mahasiswa Baru</h3>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {manualError && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {manualError}
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Budi Santoso"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      NPM <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateNpm}
                      className="text-[11px] font-semibold text-pink-700 hover:underline flex items-center gap-1"
                      title="Generate 8-digit NPM unik berawalan G01"
                    >
                      <Sparkles className="w-3 h-3 text-pink-600" />
                      <span>Generate NPM (G01...)</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="G0143501"
                    value={npm}
                    onChange={(e) => setNpm(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    8 digit, diawali G01 (otomatis dipastikan unik di kursus ini)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kelas</label>
                  <input
                    type="text"
                    required
                    placeholder="4IA01"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Waktu Akses (Jam)</label>
                  <input
                    type="text"
                    required
                    placeholder="08:00 - 12:00"
                    value={accessHours}
                    onChange={(e) => setAccessHours(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Perguruan Tinggi (Diambil dari Referensi) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Perguruan Tinggi (Data Referensi) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={universityId}
                  onChange={(e) => handleUniversityChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 font-medium text-slate-800"
                >
                  {universities.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} {u.code ? `(${u.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fakultas & Program Studi (Diambil dari Referensi) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fakultas (Data Referensi) <span className="text-rose-500">*</span>
                  </label>
                  {availableFaculties.length > 0 ? (
                    <select
                      value={facultyId}
                      onChange={(e) => handleFacultyChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 font-medium text-slate-800"
                    >
                      {availableFaculties.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="Fakultas Ilmu Komputer"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Program Studi (Data Referensi) <span className="text-rose-500">*</span>
                  </label>
                  {availableStudyPrograms.length > 0 ? (
                    <select
                      value={studyProgram}
                      onChange={(e) => setStudyProgram(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 font-medium text-slate-800"
                    >
                      {availableStudyPrograms.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="Teknik Informatika"
                      value={studyProgram}
                      onChange={(e) => setStudyProgram(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500"
                    />
                  )}
                </div>
              </div>

              {/* Password field with auto-generate option */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password Mahasiswa
                  </label>
                  <button
                    type="button"
                    onClick={() => setPassword(generateSecurePassword(8))}
                    className="text-[11px] text-pink-700 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Sparkles className="w-3 h-3 text-pink-600" />
                    <span>Generate Acak</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password mahasiswa"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-pink-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Password akan disimpan secara terenkripsi menggunakan algoritma BCrypt hash.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
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
                  <span>Simpan Mahasiswa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Excel Modal */}
      {isExcelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Import Mahasiswa dari Excel</h3>
                  <p className="text-xs text-slate-500">Auto-generate password & kembalikan file Excel [npm, pass]</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExcelModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {excelError && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{excelError}</span>
              </div>
            )}

            {/* Template Download Box */}
            <div className="mb-4 p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Template Excel Tersedia</span>
                <span className="text-[11px] text-slate-500">
                  Kolom: Nama, NPM, Kelas, Universitas, Fakultas, Program Studi, Waktu Akses
                </span>
              </div>
              <button
                type="button"
                onClick={downloadStudentTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Unduh Template</span>
              </button>
            </div>

            {/* File Upload Drop Zone */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-pink-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-pink-50/20 transition-colors mb-4"
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              {excelFile ? (
                <div>
                  <span className="text-xs font-bold text-slate-800 block">{excelFile.name}</span>
                  <span className="text-[11px] text-slate-500">
                    {(excelFile.size / 1024).toFixed(1)} KB · Klik untuk ganti file
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-xs font-semibold text-slate-700 block">
                    Pilih atau Drag & Drop berkas Excel (.xlsx / .csv)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Sistem akan otomatis menghasilkan password acak untuk setiap mahasiswa
                  </span>
                </div>
              )}
            </div>

            {/* Target Course Info */}
            <div 
              className="p-3 rounded-xl text-xs text-emerald-900 border mb-4 flex items-center justify-between"
              style={{ backgroundColor: '#d1e7dd', borderColor: '#badbcc' }}
            >
              <div>
                <span className="font-semibold block">Kursus Tujuan:</span>
                <span className="text-[11px]">{currentCourse?.name || 'Belum dipilih'}</span>
              </div>
              <span className="text-[10px] bg-white/70 px-2 py-0.5 rounded font-mono font-medium">
                {currentCourse?.id}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsExcelModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!excelFile || isProcessingExcel}
                onClick={handleProcessExcel}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs hover:opacity-90 disabled:opacity-50 transition-all"
                style={{ backgroundColor: '#FF006E' }}
              >
                {isProcessingExcel ? (
                  <span>Memproses & Menghasilkan Password...</span>
                ) : (
                  <>
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Mulai Import & Unduh Password Excel</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Modal for Generated Passwords */}
      {isSuccessExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="text-center">
              <div 
                className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3"
                style={{ backgroundColor: '#d1e7dd', color: '#0f5132' }}
              >
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Import Berhasil & Password Tergenerate!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {lastExportRows.length} akun mahasiswa telah diimpor dan file Excel berisi dua kolom (<code className="font-mono font-semibold">npm</code> dan <code className="font-mono font-semibold">pass</code>) telah otomatis diunduh ke komputer Anda.
              </p>
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-40 overflow-y-auto">
              <table className="w-full text-[11px] font-mono">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-200">
                    <th className="text-left pb-1 font-semibold">NPM</th>
                    <th className="text-left pb-1 font-semibold">PASSWORD GENERATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {lastExportRows.slice(0, 10).map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-1">{row.npm}</td>
                      <td className="py-1 font-bold text-pink-600">{row.pass}</td>
                    </tr>
                  ))}
                  {lastExportRows.length > 10 && (
                    <tr>
                      <td colSpan={2} className="py-1 text-center text-slate-400 italic">
                        ... dan {lastExportRows.length - 10} baris lainnya pada file Excel terunduh
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => downloadGeneratedPasswordsExcel(lastExportRows, currentCourse?.name)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Unduh Ulang Excel</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSuccessExportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-white rounded-xl"
                style={{ backgroundColor: '#FF006E' }}
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
