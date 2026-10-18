import React, { useState } from 'react';
import { 
  Plus, 
  Users, 
  UserCheck, 
  Mail, 
  Phone, 
  Trash2, 
  Search, 
  X, 
  Check, 
  Building2, 
  GraduationCap, 
  Key, 
  Copy, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Pencil
} from 'lucide-react';
import { InstructorAssistant, Course, RoleType, University } from '../types';
import { generateAlphanumeric16, hashPassword } from '../utils/crypto';

interface InstructorManagementProps {
  courses: Course[];
  instructors: InstructorAssistant[];
  universities: University[];
  selectedCourseId: string;
  onSelectCourse: (courseId: string) => void;
  onAddInstructor: (instructor: Omit<InstructorAssistant, 'id' | 'createdAt'>) => void;
  onUpdateInstructor: (id: string, updates: Partial<InstructorAssistant>) => void;
  onDeleteInstructor: (id: string) => void;
}

export const InstructorManagement: React.FC<InstructorManagementProps> = ({
  courses,
  instructors,
  universities = [],
  selectedCourseId,
  onSelectCourse,
  onAddInstructor,
  onUpdateInstructor,
  onDeleteInstructor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'instruktur' | 'asisten'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPassModalInst, setShowPassModalInst] = useState<InstructorAssistant | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [roleType, setRoleType] = useState<RoleType>('instruktur');
  const [specificRole, setSpecificRole] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [university, setUniversity] = useState('');
  const [studyProgram, setStudyProgram] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const activeCourseId = currentCourse ? currentCourse.id : '';

  // Get available study programs based on selected university
  const selectedUnivObj = universities.find((u) => u.id === universityId) || universities[0];
  const availableStudyPrograms = selectedUnivObj 
    ? selectedUnivObj.faculties.flatMap((f) => f.studyPrograms.map((p) => ({ ...p, facultyName: f.name })))
    : [];

  const handleUniversityChange = (univId: string) => {
    const foundUniv = universities.find((u) => u.id === univId);
    if (foundUniv) {
      setUniversityId(foundUniv.id);
      setUniversity(foundUniv.name);
      const programs = foundUniv.faculties.flatMap((f) => f.studyPrograms);
      setStudyProgram(programs.length > 0 ? programs[0].name : '');
    }
  };

  const openAddModal = () => {
    setName('');
    setRoleType('instruktur');
    setSpecificRole('Instruktur Utama');
    
    // Default university & study program from references
    const firstUniv = universities[0];
    if (firstUniv) {
      setUniversityId(firstUniv.id);
      setUniversity(firstUniv.name);
      const programs = firstUniv.faculties.flatMap((f) => f.studyPrograms);
      setStudyProgram(programs.length > 0 ? programs[0].name : '');
    } else {
      setUniversityId('');
      setUniversity('');
      setStudyProgram('');
    }

    // Auto-generate 16-digit alphanumeric password
    const generatedPass = generateAlphanumeric16();
    setPassword(generatedPass);
    setShowPassword(true);
    setUsername('');
    setEmail('');
    setPhone('');
    setFormError('');
    setIsSaving(false);
    setIsModalOpen(true);
  };

  const handleRegeneratePassword = () => {
    setPassword(generateAlphanumeric16());
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourseId) {
      setFormError('Pilih kursus terlebih dahulu.');
      return;
    }
    if (!name.trim()) {
      setFormError('Nama lengkap pengajar wajib diisi.');
      return;
    }
    if (!university.trim()) {
      setFormError('Pilih Perguruan Tinggi dari referensi.');
      return;
    }
    if (!studyProgram.trim()) {
      setFormError('Pilih Program Studi dari referensi.');
      return;
    }
    if (!username.trim()) {
      setFormError('Username wajib diisi.');
      return;
    }
    // Check if username already exists in instructor list
    const usernameClean = username.trim().toLowerCase();
    const isDup = instructors.some(
      (i) => i.username && i.username.toLowerCase() === usernameClean
    );
    if (isDup) {
      setFormError(`Username "${username}" sudah digunakan oleh pengajar lain. Harap gunakan username yang berbeda.`);
      return;
    }

    if (!password || password.length < 16) {
      setFormError('Password wajib 16 digit alfanumerik.');
      return;
    }
    if (!specificRole.trim()) {
      setFormError('Peran spesifik wajib diisi.');
      return;
    }

    setIsSaving(true);
    try {
      const hashed = await hashPassword(password);
      onAddInstructor({
        courseId: activeCourseId,
        name: name.trim(),
        roleType,
        specificRole: specificRole.trim(),
        university: university.trim(),
        studyProgram: studyProgram.trim(),
        username: username.trim(),
        passwordHash: hashed,
        plainPasswordPreview: password,
        email: email.trim(),
        phone: phone.trim(),
      });
      setIsModalOpen(false);
    } catch {
      setFormError('Gagal melakukan enkripsi password.');
    } finally {
      setIsSaving(false);
    }
  };

  // Edit Instructor Modal State
  const [editingInstructor, setEditingInstructor] = useState<InstructorAssistant | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRoleType, setEditRoleType] = useState<RoleType>('instruktur');
  const [editSpecificRole, setEditSpecificRole] = useState('');
  const [editUniversityId, setEditUniversityId] = useState('');
  const [editUniversity, setEditUniversity] = useState('');
  const [editStudyProgram, setEditStudyProgram] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editChangePassword, setEditChangePassword] = useState(false);
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editFormError, setEditFormError] = useState('');
  const [isEditSaving, setIsEditSaving] = useState(false);

  // Cascading for edit modal
  const editSelectedUnivObj = universities.find((u) => u.id === editUniversityId) || universities[0];
  const editAvailableStudyPrograms = editSelectedUnivObj 
    ? editSelectedUnivObj.faculties.flatMap((f) => f.studyPrograms.map((p) => ({ ...p, facultyName: f.name })))
    : [];

  const handleEditUniversityChange = (univId: string) => {
    const foundUniv = universities.find((u) => u.id === univId);
    if (foundUniv) {
      setEditUniversityId(foundUniv.id);
      setEditUniversity(foundUniv.name);
      const programs = foundUniv.faculties.flatMap((f) => f.studyPrograms);
      setEditStudyProgram(programs.length > 0 ? programs[0].name : '');
    }
  };

  const openEditModal = (inst: InstructorAssistant) => {
    setEditingInstructor(inst);
    setEditName(inst.name);
    setEditRoleType(inst.roleType);
    setEditSpecificRole(inst.specificRole);
    setEditUsername(inst.username || '');
    setEditEmail(inst.email || '');
    setEditPhone(inst.phone || '');
    setEditChangePassword(false);
    setEditPassword('');
    setShowEditPassword(false);
    setEditFormError('');

    // Match university
    const foundUniv = universities.find(
      (u) => u.name.trim().toLowerCase() === (inst.university || '').trim().toLowerCase()
    ) || universities[0];

    if (foundUniv) {
      setEditUniversityId(foundUniv.id);
      setEditUniversity(foundUniv.name);
      const programs = foundUniv.faculties.flatMap((f) => f.studyPrograms);
      const matchProg = programs.find(
        (p) => p.name.trim().toLowerCase() === (inst.studyProgram || '').trim().toLowerCase()
      );
      setEditStudyProgram(matchProg ? matchProg.name : (inst.studyProgram || (programs[0] ? programs[0].name : '')));
    } else {
      setEditUniversityId('');
      setEditUniversity(inst.university || '');
      setEditStudyProgram(inst.studyProgram || '');
    }

    setIsEditModalOpen(true);
  };

  const handleGenerateEditPassword = () => {
    const newPass = generateAlphanumeric16();
    setEditPassword(newPass);
    setShowEditPassword(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInstructor) return;

    if (!editName.trim()) {
      setEditFormError('Nama lengkap pengajar wajib diisi.');
      return;
    }
    if (!editUsername.trim()) {
      setEditFormError('Username wajib diisi.');
      return;
    }

    // Check duplicate username against other instructors
    const usernameClean = editUsername.trim().toLowerCase();
    const isDup = instructors.some(
      (i) => i.id !== editingInstructor.id && i.username && i.username.toLowerCase() === usernameClean
    );
    if (isDup) {
      setEditFormError(`Username "${editUsername}" sudah digunakan oleh pengajar lain.`);
      return;
    }

    if (!editSpecificRole.trim()) {
      setEditFormError('Peran spesifik wajib diisi.');
      return;
    }

    if (editChangePassword) {
      if (!editPassword || editPassword.length < 16) {
        setEditFormError('Password baru wajib minimal 16 digit alfanumerik.');
        return;
      }
    }

    setIsEditSaving(true);
    try {
      const updates: Partial<InstructorAssistant> = {
        name: editName.trim(),
        roleType: editRoleType,
        specificRole: editSpecificRole.trim(),
        university: editUniversity.trim() || editSelectedUnivObj?.name || editingInstructor.university,
        studyProgram: editStudyProgram.trim() || editingInstructor.studyProgram,
        username: editUsername.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
      };

      if (editChangePassword && editPassword.trim()) {
        const hashed = await hashPassword(editPassword.trim());
        updates.passwordHash = hashed;
        updates.plainPasswordPreview = editPassword.trim();
      }

      onUpdateInstructor(editingInstructor.id, updates);
      setIsEditModalOpen(false);
      setEditingInstructor(null);
    } catch {
      setEditFormError('Gagal memperbarui data pengajar.');
    } finally {
      setIsEditSaving(false);
    }
  };

  const filteredList = instructors
    .filter((i) => (activeCourseId ? i.courseId === activeCourseId : true))
    .filter((i) => (roleFilter === 'all' ? true : i.roleType === roleFilter))
    .filter(
      (i) =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.specificRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.university && i.university.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (i.studyProgram && i.studyProgram.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (i.username && i.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (i.email && i.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Instruktur & Asisten Kursus</h2>
            <span 
              className="text-xs px-2.5 py-0.5 rounded-full font-semibold text-emerald-800"
              style={{ backgroundColor: '#d1e7dd' }}
            >
              {filteredList.length} Pengajar
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Penugasan instruktur & asisten kursus dengan data Perguruan Tinggi, Program Studi, Username, dan Password 16 Digit Alfanumerik.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Course selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Pilih Kursus:</label>
            <select
              value={activeCourseId}
              onChange={(e) => onSelectCourse(e.target.value)}
              className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 text-slate-800"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            style={{ backgroundColor: '#FF006E' }}
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Instruktur / Asisten</span>
          </button>
        </div>
      </div>

      {/* Filter and Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama, PT, prodi, username, peran..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 text-slate-800"
              />
            </div>

            {/* Role Filter Tabs */}
            <div className="flex items-center p-1 bg-slate-200/60 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  roleFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('instruktur')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  roleFilter === 'instruktur' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Instruktur
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('asisten')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  roleFilter === 'asisten' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Asisten
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            <span>Kursus: </span>
            <span className="font-semibold text-slate-800">{currentCourse?.name || '-'}</span>
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">Belum ada pengajar atau asisten</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Silakan tambahkan instruktur atau asisten lab untuk kursus yang dipilih.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nama Pengajar</th>
                  <th className="py-3 px-4">Tipe & Peran Spesifik</th>
                  <th className="py-3 px-4">Perguruan Tinggi & Prodi</th>
                  <th className="py-3 px-4">Kontak</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((inst) => {
                  const isInstruktur = inst.roleType === 'instruktur';
                  return (
                    <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isInstruktur ? 'text-white' : 'text-emerald-900'
                            }`}
                            style={{ backgroundColor: isInstruktur ? '#FF006E' : '#d1e7dd' }}
                          >
                            {inst.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{inst.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                              <span>ID: {inst.id}</span>
                              {inst.username && (
                                <span className="text-pink-600 font-semibold bg-pink-50 px-1 rounded text-[10px] border border-pink-100">
                                  @{inst.username}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span 
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase ${
                              isInstruktur
                                ? 'bg-pink-50 text-pink-700 border border-pink-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {isInstruktur ? 'Instruktur' : 'Asisten'}
                          </span>
                          <span className="font-medium text-slate-800">
                            {inst.specificRole}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-900 font-medium">
                            <Building2 className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                            <span>{inst.university || '-'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <GraduationCap className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{inst.studyProgram || '-'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <div className="space-y-0.5">
                          {inst.email && (
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <a href={`mailto:${inst.email}`} className="hover:text-pink-600">
                                {inst.email}
                              </a>
                            </div>
                          )}
                          {inst.phone && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{inst.phone}</span>
                            </div>
                          )}
                          {!inst.email && !inst.phone && (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(inst)}
                            className="p-1.5 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit data pengajar & ganti password"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Hapus pengajar ${inst.name}?`)) {
                                onDeleteInstructor(inst.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus pengajar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Instructor Modal */}
      {isEditModalOpen && editingInstructor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-pink-50 text-pink-600">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Data Instruktur / Asisten</h3>
                  <p className="text-[11px] text-slate-500">Edit semua atribut pengajar, username, & ganti password</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingInstructor(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editFormError && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {editFormError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Nama Pengajar */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Ir. Hendra Gunawan, M.T."
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 font-medium text-slate-800"
                />
              </div>

              {/* Tipe Peran (Instruktur vs Asisten) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tipe Peran <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditRoleType('instruktur')}
                    className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      editRoleType === 'instruktur'
                        ? 'bg-pink-50 border-pink-500 text-pink-700 ring-1 ring-pink-500'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Instruktur</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditRoleType('asisten')}
                    className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      editRoleType === 'asisten'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Asisten</span>
                  </button>
                </div>
              </div>

              {/* Peran Spesifik */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Peran Spesifik <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Instruktur Utama Cloud, Asisten Lab, dsb."
                  value={editSpecificRole}
                  onChange={(e) => setEditSpecificRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Perguruan Tinggi (Diambil dari Referensi) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Perguruan Tinggi (Data Referensi) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={editUniversityId}
                    onChange={(e) => handleEditUniversityChange(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 font-medium text-slate-800"
                  >
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} {u.code ? `(${u.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Program Studi (Diambil dari Referensi) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Program Studi (Data Referensi) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  {editAvailableStudyPrograms.length > 0 ? (
                    <select
                      value={editStudyProgram}
                      onChange={(e) => setEditStudyProgram(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 font-medium text-slate-800"
                    >
                      {editAvailableStudyPrograms.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name} {p.facultyName ? `— ${p.facultyName}` : ''}
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
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500"
                    />
                  )}
                </div>
              </div>

              {/* Username (Wajib) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username Akun <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="hendra.gunawan"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Username wajib unik untuk keperluan login sistem eksternal
                </span>
              </div>

              {/* Ganti Password Section */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editChangePassword}
                      onChange={(e) => {
                        setEditChangePassword(e.target.checked);
                        if (e.target.checked && !editPassword) {
                          handleGenerateEditPassword();
                        }
                      }}
                      className="w-4 h-4 text-pink-600 rounded border-slate-300 focus:ring-pink-500"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      Ganti Password (16-Digit Alfanumerik)
                    </span>
                  </label>

                  {editChangePassword && (
                    <button
                      type="button"
                      onClick={handleGenerateEditPassword}
                      className="flex items-center gap-1 text-[11px] font-semibold text-pink-600 hover:text-pink-700 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Generate 16-Digit</span>
                    </button>
                  )}
                </div>

                {editChangePassword ? (
                  <div className="pt-1.5 space-y-1.5">
                    <div className="relative">
                      <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showEditPassword ? 'text' : 'password'}
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="16 digit alfanumerik"
                        className="w-full pl-9 pr-16 py-2 text-xs font-mono font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 tracking-wide text-pink-600"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowEditPassword(!showEditPassword)}
                          className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyText(editPassword, 'edit-pass')}
                          className="p-1 text-slate-400 hover:text-pink-600 cursor-pointer"
                          title="Salin Password"
                        >
                          {copiedId === 'edit-pass' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Panjang: {editPassword.length} / 16 karakter</span>
                      <span>Enkripsi: BCrypt Hash</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Password saat ini tetap aktif dan tidak diubah.</span>
                    {editingInstructor.plainPasswordPreview && (
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-pink-600 font-bold bg-pink-50 px-1.5 py-0.5 rounded text-[10px]">
                          {editingInstructor.plainPasswordPreview}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(editingInstructor.plainPasswordPreview || '', 'inst-curr')}
                          className="text-slate-400 hover:text-pink-600 cursor-pointer p-0.5"
                          title="Salin Password"
                        >
                          {copiedId === 'inst-curr' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Kontak */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="nama@kampus.ac.id"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. WhatsApp / HP</label>
                  <input
                    type="tel"
                    placeholder="+62 812-xxxx-xxxx"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingInstructor(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
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

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Tambah Instruktur / Asisten</h3>
                <p className="text-[11px] text-slate-500">Lengkapi data pengajar beserta kredensial akun dan referensi kampus.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
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
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dr. Ir. Hendra Gunawan, M.T."
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    // Automatically suggest a clean username if empty
                    if (!username && e.target.value.trim()) {
                      const cleanUser = e.target.value
                        .toLowerCase()
                        .replace(/^(dr\.|ir\.|drs\.|prof\.)/gi, '')
                        .replace(/,.*$/gi, '')
                        .trim()
                        .replace(/\s+/g, '.');
                      setUsername(cleanUser);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Tipe Peran */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipe Peran <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRoleType('instruktur');
                      if (specificRole === 'Asisten Lab') setSpecificRole('Instruktur Utama');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      roleType === 'instruktur'
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Instruktur</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRoleType('asisten');
                      if (specificRole === 'Instruktur Utama') setSpecificRole('Asisten Lab');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      roleType === 'asisten'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Asisten</span>
                  </button>
                </div>
              </div>

              {/* Peran Spesifik */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Peran Spesifik <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    roleType === 'instruktur'
                      ? 'Contoh: Instruktur Utama DevOps & Cloud'
                      : 'Contoh: Koordinator Asisten Lab / Pendamping Coding'
                  }
                  value={specificRole}
                  onChange={(e) => setSpecificRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {(roleType === 'instruktur'
                    ? ['Instruktur Utama', 'Instruktur Praktikum', 'Tutor Ahli']
                    : ['Koordinator Asisten Lab', 'Asisten Pendamping', 'Reviewer Tugas']
                  ).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setSpecificRole(suggestion)}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cascading Dropdowns: Perguruan Tinggi & Program Studi dari Referensi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-pink-500" />
                    <span>Perguruan Tinggi (Referensi) <span className="text-rose-500">*</span></span>
                  </label>
                  {universities.length > 0 ? (
                    <select
                      value={universityId}
                      onChange={(e) => handleUniversityChange(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 text-slate-800"
                    >
                      {universities.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} {u.code ? `(${u.code})` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-[11px] text-amber-600 bg-amber-50 p-2 rounded-lg">
                      Belum ada data referensi kampus. Tambahkan di menu Referensi Perguruan Tinggi.
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Program Studi (Referensi) <span className="text-rose-500">*</span></span>
                  </label>
                  {availableStudyPrograms.length > 0 ? (
                    <select
                      value={studyProgram}
                      onChange={(e) => setStudyProgram(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 text-slate-800"
                    >
                      {availableStudyPrograms.map((p, idx) => (
                        <option key={`${p.id}-${idx}`} value={p.name}>
                          {p.name} ({p.facultyName})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-[11px] text-slate-400 bg-white p-2 rounded-lg border border-slate-200">
                      Tidak ada prodi pada kampus ini.
                    </div>
                  )}
                </div>
              </div>

              {/* Kredensial: Username (Wajib) & Password (16 Digit Alfanumerik) */}
              <div className="p-3 bg-pink-50/50 rounded-xl border border-pink-100 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Key className="w-3.5 h-3.5 text-pink-600" />
                  <span>Kredensial Login Pengajar (Wajib & 16-Digit Alfanumerik)</span>
                </div>

                {/* Username Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username (Wajib) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: hendra.gunawan / instruktur_01"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-pink-500 text-slate-900"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Digunakan instruktur/asisten untuk login ke sistem.</p>
                </div>

                {/* Password Field (Generated: 16 Digit AlfaNumerik) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Password (Generated: 16 Digit AlfaNumerik) <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleRegeneratePassword}
                      className="flex items-center gap-1 text-[11px] font-semibold text-pink-600 hover:text-pink-700 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Generate Ulang (16 Digit)</span>
                    </button>
                  </div>

                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-20 text-xs bg-white border border-slate-200 rounded-xl font-mono tracking-wider font-bold text-pink-600 focus:outline-none focus:border-pink-500"
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyText(password, 'form-pass')}
                        className="px-2 py-1 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        title="Salin password ke clipboard"
                      >
                        {copiedId === 'form-pass' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                    <span>Panjang: {password.length} Karakter Alfanumerik (A-Z, a-z, 0-9)</span>
                    <span className="text-emerald-700 font-semibold">Tersimpan dalam BCrypt Hash</span>
                  </div>
                </div>
              </div>

              {/* Kontak */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="nama@halkh-systems.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. Kontak / WA</label>
                  <input
                    type="text"
                    placeholder="+62 812-xxxx-xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-500"
                  />
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
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                  style={{ backgroundColor: '#FF006E' }}
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan Pengajar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Hash Modal */}
      {showPassModalInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-slate-900">Detail Hash Password Pengajar</h3>
              <button
                type="button"
                onClick={() => setShowPassModalInst(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-500">Nama Pengajar:</span>
                <p className="text-xs font-bold text-slate-900">{showPassModalInst.name}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Username:</span>
                <p className="text-xs font-mono font-semibold text-slate-900">{showPassModalInst.username || '-'}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">BCrypt Password Hash (Database):</span>
                <div className="mt-1 p-2.5 bg-slate-100 rounded-xl font-mono text-[11px] break-all text-slate-800 border border-slate-200">
                  {showPassModalInst.passwordHash}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPassModalInst(null)}
                className="px-4 py-2 text-xs font-semibold text-white rounded-xl cursor-pointer"
                style={{ backgroundColor: '#FF006E' }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
