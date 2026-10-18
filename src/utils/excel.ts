import * as XLSX from 'xlsx';
import { Student } from '../types';
import { generateSecurePassword, hashPassword } from './crypto';

export interface ImportCandidateRow {
  Nama?: string;
  nama?: string;
  'Nama Lengkap'?: string;
  NPM?: string | number;
  npm?: string | number;
  Kelas?: string;
  kelas?: string;
  Universitas?: string;
  universitas?: string;
  Fakultas?: string;
  fakultas?: string;
  'Program Studi'?: string;
  Prodi?: string;
  prodi?: string;
  'Waktu Akses'?: string;
  waktu_akses?: string;
  [key: string]: unknown;
}

/**
 * Downloads standard student import template Excel file
 */
export function downloadStudentTemplate(): void {
  const sampleData = [
    {
      Nama: 'Raden Mas Bagus',
      NPM: '20214350101',
      Kelas: '4IA01',
      Universitas: 'Universitas Indonesia',
      Fakultas: 'Fakultas Ilmu Komputer',
      'Program Studi': 'Teknik Informatika',
      'Waktu Akses': '08:00 - 12:00',
    },
    {
      Nama: 'Dewi Lestari',
      NPM: '20214350102',
      Kelas: '4IA01',
      Universitas: 'Universitas Indonesia',
      Fakultas: 'Fakultas Ilmu Komputer',
      'Program Studi': 'Sistem Informasi',
      'Waktu Akses': '08:00 - 12:00',
    },
    {
      Nama: 'Fauzan Hakim',
      NPM: '20214350103',
      Kelas: '4IA02',
      Universitas: 'Universitas Gadjah Mada',
      Fakultas: 'Fakultas MIPA',
      'Program Studi': 'Ilmu Komputer',
      'Waktu Akses': '13:00 - 17:00',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  // Auto-fit column widths
  worksheet['!cols'] = [
    { wch: 22 }, // Nama
    { wch: 16 }, // NPM
    { wch: 10 }, // Kelas
    { wch: 26 }, // Universitas
    { wch: 26 }, // Fakultas
    { wch: 22 }, // Program Studi
    { wch: 18 }, // Waktu Akses
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template_Mahasiswa');
  XLSX.writeFile(workbook, 'template_import_mahasiswa.xlsx');
}

/**
 * Generates and immediately downloads the two-column Excel file: [npm, pass]
 */
export function downloadGeneratedPasswordsExcel(
  passwordRows: { npm: string; pass: string }[],
  courseName: string = 'kursus'
): void {
  const formattedData = passwordRows.map((row) => ({
    npm: String(row.npm).trim(),
    pass: String(row.pass).trim(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData, {
    header: ['npm', 'pass'],
  });

  // Set nice column widths
  worksheet['!cols'] = [
    { wch: 20 }, // npm
    { wch: 16 }, // pass
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Password_Mahasiswa');

  const sanitizedCourse = courseName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
  const fileName = `generated_passwords_${sanitizedCourse}_${Date.now()}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * Parses uploaded Excel/CSV file, creates student records with auto-generated passwords,
 * hashes passwords, and returns student objects alongside [npm, pass] export list.
 */
export async function parseAndProcessStudentExcel(
  file: File,
  courseId: string
): Promise<{
  students: Student[];
  exportRows: { npm: string; pass: string }[];
  errors: string[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rawRows: ImportCandidateRow[] = XLSX.utils.sheet_to_json(worksheet);

        if (!rawRows || rawRows.length === 0) {
          resolve({
            students: [],
            exportRows: [],
            errors: ['File Excel kosong atau tidak memiliki baris data.'],
          });
          return;
        }

        const students: Student[] = [];
        const exportRows: { npm: string; pass: string }[] = [];
        const errors: string[] = [];

        for (let idx = 0; idx < rawRows.length; idx++) {
          const row = rawRows[idx];
          const rowNum = idx + 2; // +1 for 0-index, +1 for header

          const name = String(row.Nama || row.nama || row['Nama Lengkap'] || '').trim();
          const npm = String(row.NPM || row.npm || '').trim();
          const className = String(row.Kelas || row.kelas || '-').trim();
          const university = String(row.Universitas || row.universitas || '-').trim();
          const faculty = String(row.Fakultas || row.fakultas || '-').trim();
          const studyProgram = String(row['Program Studi'] || row.Prodi || row.prodi || '-').trim();
          const accessHours = String(row['Waktu Akses'] || row.waktu_akses || '08:00 - 17:00').trim();

          if (!name || !npm) {
            errors.push(`Baris ${rowNum}: Nama dan NPM wajib diisi. (dilewati)`);
            continue;
          }

          // Generate secure password by system
          const plainPassword = generateSecurePassword(8);
          const passwordHash = await hashPassword(plainPassword);

          const studentId = `std-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

          students.push({
            id: studentId,
            courseId,
            name,
            npm,
            className,
            university,
            faculty,
            studyProgram,
            passwordHash,
            plainPasswordPreview: plainPassword,
            accessHours,
            createdAt: new Date().toISOString(),
          });

          // Add to generated password list [npm, pass]
          exportRows.push({
            npm,
            pass: plainPassword,
          });
        }

        resolve({ students, exportRows, errors });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Gagal membaca berkas Excel.';
        reject(new Error(`Terjadi kesalahan saat memproses Excel: ${message}`));
      }
    };

    reader.onerror = () => reject(new Error('Gagal membaca berkas.'));
    reader.readAsArrayBuffer(file);
  });
}
