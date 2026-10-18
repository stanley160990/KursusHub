# KursusHub - Sistem Manajemen Pengguna Kursus

Sistem aplikasi web manajemen pengguna kursus komprehensif yang dirancang untuk mengelola data **Referensi Perguruan Tinggi & Program Studi**, **Kursus**, **Mahasiswa**, **Instruktur & Asisten**, serta menyediakan **REST API untuk Integrasi Sistem Eksternal** (Autentikasi Pengguna & Pencatatan Aktivitas Login).

> **Copyright © 2026 - halkh-systems.com**  
> Identitas Visual: Nuansa warna `#FF006E` (Aksen Vibrant Pink/Rose) dan `#d1e7dd` (Aksen Mint Green).

---

## Daftar Isi
1. [Kredensial Default Sistem](#kredensial-default-sistem)
2. [Fitur Utama Sistem](#fitur-utama-sistem)
3. [Arsitektur & Keamanan](#arsitektur--keamanan)
4. [Konfigurasi Environment (.env)](#konfigurasi-environment-env)
5. [Panduan Menjalankan Aplikasi](#panduan-menjalankan-aplikasi)
   - [A. Deployment Menggunakan Docker Compose (Produksi)](#a-deployment-menggunakan-docker-compose-produksi)
   - [B. Menjalankan di Lingkungan Lokal (Development)](#b-menjalankan-di-lingkungan-lokal-development)
6. [Dokumentasi API 1: User Authentication Sistem Eksternal](#dokumentasi-api-1-user-authentication-sistem-eksternal)
   - [Spesifikasi Endpoint](#spesifikasi-endpoint-auth)
   - [Header & Payload Request](#header--payload-request-auth)
   - [Format Respon Sukses & Gagal](#format-respon-auth)
   - [Contoh Implementasi Python: User Authentication](#contoh-implementasi-python-user-authentication)
7. [Dokumentasi API 2: Pencatatan Log Aktivitas Login](#dokumentasi-api-2-pencatatan-log-aktivitas-login)
   - [Spesifikasi Endpoint](#spesifikasi-endpoint-logins)
   - [Header & Parameter Body JSON](#header--parameter-body-json-logins)
   - [Format Respon & Error Codes](#format-respon-logins)
   - [Contoh Implementasi Python: Pencatatan Log](#contoh-implementasi-python-pencatatan-log)
   - [Contoh Request cURL](#contoh-request-curl)
8. [Skema Database PostgreSQL & Inisialisasi](#skema-database-postgresql--inisialisasi)

---

## Kredensial Default Sistem

Untuk login ke sistem web portal maupun pengujian integrasi API eksternal, gunakan akun default berikut:

### 1. Akun Administrator Portal Web
| Parameter | Nilai Default |
| :--- | :--- |
| **Username** | `admin` |
| **Password** | `AdminSecret2026!` |

> *Catatan Keamanan:* Form login pada website sengaja dibiarkan kosong demi alasan keamanan. Silakan gunakan kredensial di atas untuk masuk.

### 2. Akun Contoh Instruktur & Asisten (Username & Password 16 Digit Alfanumerik)
| Nama Pengajar | Peran | Username | Password (16 Digit Alfanumerik) |
| :--- | :--- | :--- | :--- |
| Dr. Ir. Hendra Gunawan, M.T. | Instruktur Utama | `hendra.gunawan` | `H3ndrAGun4w4n982K` |
| Fajar Pratama, S.Kom. | Asisten Lab | `fajar.pratama` | `F4j4rPrat4m4928X` |
| Nadia Putri, M.Cs. | Instruktur Utama | `nadia.putri` | `N4di4Putr1Eng82P` |
| Rizky Ramadhan, S.Tr.Kom. | Asisten Praktikum | `rizky.ramadhan` | `R1zkyRam4dh4n34Q` |

### 3. Akun Contoh Mahasiswa (NPM & Password)
| Nama Mahasiswa | Kursus | NPM (8 Digit) | Password |
| :--- | :--- | :--- | :--- |
| Budi Santoso | Arsitektur Cloud & DevOps | `G0143501` | `Mhs2026!#` |
| Siti Rahmawati | Arsitektur Cloud & DevOps | `G0143502` | `Mhs2026!#` |
| Ahmad Fauzi | Full-Stack Web Engineering | `G0143503` | `Mhs2026!#` |
| Clara Anindya | Full-Stack Web Engineering | `G0143504` | `Mhs2026!#` |

---

## Fitur Utama Sistem

1. **Menu Referensi Perguruan Tinggi**:
   - Menu master **Referensi** di navigasi atas dengan submenu **Referensi Perguruan Tinggi**.
   - Mengelola data master Kampus/Universitas secara berjenjang:
     - Satu kampus dapat memiliki **banyak Fakultas**.
     - Satu fakultas dapat memiliki **banyak Program Studi**.
   - Fasilitas tambah, ubah, dan hapus kampus, fakultas, serta program studi.

2. **Manajemen Kursus & Drop Down Perguruan Tinggi**:
   - Menambahkan dan memperbarui data kursus:
     - **Nama Kursus**
     - **Perguruan Tinggi Mitra** (Dropdown dipilih langsung dari data referensi)
     - **Deskripsi Singkat Kursus**
     - **Tanggal Pelaksanaan Dinamis** (bisa ditambah/dikurangi secara dinamis dengan tombol `+ Tambah Tanggal`).

3. **Manajemen Mahasiswa, Aksi Edit & Ganti Password, Generate NPM & Referensi Berjenjang**:
   - **Aksi Edit Komprehensif**:
     - Dilengkapi tombol **Aksi Edit** pada setiap baris data mahasiswa.
     - Seluruh atribut mahasiswa dapat diedit secara lengkap: **Nama**, **NPM** (dengan tombol generate nomor unik baru), **Kelas**, **Waktu Akses**, serta data referensi berjenjang (**Perguruan Tinggi**, **Fakultas**, dan **Program Studi**).
     - **Ganti Password**: Tersedia opsi khusus untuk mengubah kata sandi mahasiswa secara langsung atau dengan tombol *Generate Acak*. Password baru akan di-hash ulang menggunakan algoritma **BCrypt**.
   - **Fitur Generate NPM**:
     - Tombol *Generate NPM* otomatis 8 digit dengan awalan `G01` (contoh: `G0143501`).
     - Sistem secara otomatis memastikan nomor NPM yang digenerate **belum ada / unik** pada daftar mahasiswa kursus tersebut.
   - **Integrasi Data Referensi**:
     - Pilihan **Perguruan Tinggi**, **Fakultas**, dan **Program Studi** terhubung secara berjenjang (*cascading*) dari data master referensi kampus.
   - **Fitur Import Excel**:
     - Mendukung file `.xlsx`, `.xls`, dan `.csv` beserta fasilitas unduh template Excel (`template_import_mahasiswa.xlsx`).
     - Sistem secara otomatis **meng-generate password acak yang aman** untuk setiap mahasiswa yang diimpor.
     - Sistem langsung mengembalikan dan mengunduh berkas Excel baru dengan **dua kolom**: `npm` dan `pass`.
     - Seluruh password dienkripsi dalam sistem menggunakan algoritma hashing **BCrypt** (10 salt rounds).

4. **Manajemen Instruktur & Asisten dengan Aksi Edit, Referensi & Password 16 Digit Alfanumerik**:
   - **Aksi Edit Komprehensif**:
     - Dilengkapi tombol **Aksi Edit** pada setiap baris instruktur dan asisten.
     - Seluruh data pengajar dapat diubah: **Nama & Gelar**, **Tipe Peran** (Instruktur / Asisten), **Peran Spesifik**, **Perguruan Tinggi**, **Program Studi**, **Username**, **Email**, dan **No. Telepon**.
     - **Ganti Password**: Dilengkapi opsi penggantian kata sandi dengan tombol *Generate 16-Digit Alfanumerik* otomatis atau input manual. Password baru otomatis di-hash dengan **BCrypt**.
   - **Tampilan Tabel Bersih**: Kolom kredensial akses dihilangkan dari tabel untuk menjaga privasi dan keamanan; pengelolaan username dan password dilakukan terpusat melalui formulir Edit.
   - **Integrasi Referensi**: Pilihan **Perguruan Tinggi** dan **Program Studi** diambil langsung dari data master referensi kampus.
   - **Username (Wajib)**: Penugasan username unik untuk setiap pengajar/asisten.
   - **Password (Generated: 16 Digit AlfaNumerik)**:
     - Sistem men-generate password 16 digit alfanumerik (huruf besar, huruf kecil, dan angka 0-9) yang unik.
     - Password disimpan di backend secara aman menggunakan enkripsi hash **BCrypt**.

5. **Daftar Login (dengan Fitur Paging)**:
   - Menampilkan rekaman login peserta: **NPM**, **Nama Mahasiswa**, **Waktu Login** (dalam format Hari dan Jam GMT), serta **Alamat IP Klien**.
   - Dilengkapi sistem **Paginasi (Paging)** dan pengaturan jumlah baris per halaman (5, 10, 25, 50 baris) agar data termuat secara teratur dan efisien.
   - Data login diisi secara eksklusif oleh sistem eksternal melalui API backend `POST /api/external/logins`.

---

## Arsitektur & Keamanan

- **Full-Stack Runtime**: Express.js + Vite React 19 dalam lingkungan Node.js 20.
- **Top Navigation Bar**: Menu diletakkan di bagian atas halaman (bukan di samping) agar area kerja konten utama lebih luas dan leluasa.
- **Session Timeout 15 Menit**:
  - Sistem dilengkapi countdown timer 15 menit di bagian navbar.
  - Jika sesi mencapai 15 menit atau idle, pengguna otomatis di-logout untuk mencegah akses tanpa izin.
  - Terdapat tombol *Perpanjang Sesi* dan peringatan visual saat waktu tersisa $\le 2$ menit.
- **Password Hashing**: Menggunakan hashing kriptografis **BCrypt** untuk memastikan tidak ada password yang tersimpan dalam format teks polos (*plain text*).
- **Deteksi Data & Idempotensi**: Skrip inisialisasi database (`init-db.sql`) mendeteksi keberadaan data terlebih dahulu. Jika data sudah ada, migrasi data awal tidak akan dijalankan ulang demi menjaga integritas data pengguna.

---

## Konfigurasi Environment (.env)

Buat file `.env` di root direktori proyek. Konfigurasi default:

```env
# Port aplikasi web
PORT=3000
NODE_ENV=production

# Konfigurasi Database PostgreSQL
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=kursushub_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres_secret_password
DATABASE_URL=postgresql://postgres:postgres_secret_password@postgres:5432/kursushub_db

# Keamanan & Batas Waktu Sesi
SESSION_TIMEOUT_MINUTES=15
JWT_SECRET=super_secret_jwt_kursushub_2026_key_halkh
ADMIN_USERNAME=admin
ADMIN_PASSWORD=AdminSecret2026!

# Kunci Otentikasi Integrasi API Eksternal
API_INTEGRATION_KEY=kursus_api_secret_key_2026
```

---

## Panduan Menjalankan Aplikasi

### A. Deployment Menggunakan Docker Compose (Produksi)

Docker Compose akan menjalankan container aplikasi web KursusHub bersama instance PostgreSQL 16 Alpine secara otomatis.

#### 1. Prasyarat:
- Docker $\ge 20.10$
- Docker Compose $\ge v2$

#### 2. Jalankan Perintah:
```bash
# Salin konfigurasi environment jika belum ada
cp .env.example .env

# Build image dan jalankan container di latar belakang
docker compose up -d --build
```

#### 3. Verifikasi Status:
```bash
docker compose ps
```
Pastikan service `kursushub_app` dan `kursushub_postgres` berstatus `Up (healthy)`.

#### 4. Akses Aplikasi:
Buka browser di: **`http://localhost:3000`**  
Masukkan Username: `admin` dan Password: `AdminSecret2026!`.

#### 5. Menghentikan Container:
```bash
docker compose down
```

---

### B. Menjalankan di Lingkungan Lokal (Development)

Jika ingin menjalankan tanpa Docker di lingkungan pengembangan lokal:

```bash
# 1. Install seluruh paket dependensi
npm install

# 2. Jalankan server development
npm run dev

# 3. Aplikasi dapat diakses di http://localhost:3000
```

---

<a name="dokumentasi-api-1-user-authentication-sistem-eksternal"></a>
## Dokumentasi API 1: User Authentication Sistem Eksternal

Endpoint ini disediakan khusus untuk aplikasi eksternal (mobile app, LMS, ujian daring, absensi eksternal, dll.) yang ingin melakukan **verifikasi autentikasi pengguna** (Mahasiswa, Instruktur, Asisten, atau Admin) terhadap database KursusHub.

<a name="spesifikasi-endpoint-auth"></a>
### Spesifikasi Endpoint
- **URL Endpoint**: `http://<domain-atau-ip>:3000/api/external/auth`
- **HTTP Method**: `POST`
- **Header**:
  - `Content-Type`: `application/json`
  - `X-API-Key`: Nilai dari `API_INTEGRATION_KEY` (Default: `kursus_api_secret_key_2026`)

<a name="header--payload-request-auth"></a>
### Header & Parameter Body JSON
| Field | Tipe | Wajib? | Keterangan & Contoh |
| :--- | :---: | :---: | :--- |
| `username` (atau `npm`) | `string` | **Ya** | NPM Mahasiswa (contoh: `"G0143501"`), Username Pengajar (contoh: `"hendra.gunawan"`), atau Username Admin (`"admin"`). |
| `password` | `string` | **Ya** | Password polos pengguna yang akan diverifikasi menggunakan hashing BCrypt di server. |
| `course_id` | `string` | *Opsional* | ID Kursus untuk memvalidasi kepesertaan pengguna pada kursus tertentu (contoh: `"crs-01"`). |

<a name="format-respon-auth"></a>
### Format Respon

#### 1. Berhasil Terotentikasi (HTTP 200 OK)
```json
{
  "status": "success",
  "code": "AUTHENTICATED",
  "message": "Autentikasi mahasiswa berhasil diverifikasi.",
  "data": {
    "user_type": "mahasiswa",
    "id": "std-01",
    "identifier": "G0143501",
    "npm": "G0143501",
    "name": "Budi Santoso",
    "course_id": "crs-01",
    "class_name": "4IA01",
    "university": "Universitas Indonesia",
    "faculty": "Fakultas Ilmu Komputer",
    "study_program": "Teknik Informatika",
    "access_hours": "08:00 - 12:00",
    "role": "Mahasiswa Kursus",
    "authenticated_at": "Sunday, 18 Oct 2026 10:15:30 GMT"
  }
}
```

*Contoh Respon untuk Instruktur / Asisten (HTTP 200 OK):*
```json
{
  "status": "success",
  "code": "AUTHENTICATED",
  "message": "Autentikasi instruktur berhasil diverifikasi.",
  "data": {
    "user_type": "instruktur",
    "id": "inst-01",
    "identifier": "hendra.gunawan",
    "username": "hendra.gunawan",
    "name": "Dr. Ir. Hendra Gunawan, M.T.",
    "course_id": "crs-01",
    "university": "Universitas Indonesia",
    "study_program": "Teknik Komputer",
    "specific_role": "Instruktur Utama Cloud Computing & DevOps",
    "email": "hendra.gunawan@halkh-systems.com",
    "phone": "+62 812-3456-7801",
    "role": "Instruktur Kursus",
    "authenticated_at": "Sunday, 18 Oct 2026 10:15:30 GMT"
  }
}
```

#### 2. Kredensial Tidak Cocok / Salah Password (HTTP 401 Unauthorized)
```json
{
  "status": "error",
  "code": "INVALID_CREDENTIALS",
  "message": "Password mahasiswa tidak cocok."
}
```

#### 3. Pengguna Tidak Ditemukan (HTTP 404 Not Found)
```json
{
  "status": "error",
  "code": "USER_NOT_FOUND",
  "message": "Pengguna dengan username/NPM \"G0199999\" tidak ditemukan."
}
```

<a name="contoh-implementasi-python-user-authentication"></a>
### Contoh Implementasi Python: User Authentication

Berikut kode skrip Python lengkap dan siap pakai menggunakan library `requests` untuk melakukan otentikasi pengguna dari sistem eksternal:

```python
#!/usr/bin/env python3
"""
KursusHub External User Authentication Client
Copyright (C) 2026 - halkh-systems.com

Skrip Python untuk memverifikasi kredensial login Mahasiswa,
Instruktur, dan Asisten dari aplikasi eksternal ke backend KursusHub.
"""

import requests
import json

# Konfigurasi Endpoint dan API Key KursusHub
BASE_URL = "http://localhost:3000"
AUTH_ENDPOINT = f"{BASE_URL}/api/external/auth"
API_KEY = "kursus_api_secret_key_2026"

def authenticate_user(identifier: str, password: str, course_id: str = None) -> dict:
    """
    Memverifikasi kredensial pengguna (Mahasiswa dengan NPM atau Pengajar dengan Username).
    """
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY
    }

    payload = {
        "username": identifier,
        "password": password
    }
    if course_id:
        payload["course_id"] = course_id

    try:
        response = requests.post(AUTH_ENDPOINT, json=payload, headers=headers, timeout=10)
        status_code = response.status_code
        data = response.json()

        print(f"\n[+] Request Auth: '{identifier}' | HTTP Status: {status_code}")

        if status_code == 200:
            user_data = data.get("data", {})
            print("==================================================")
            print(">>> AUTENTIKASI BERHASIL (SUCCESS)")
            print(f"  Tipe Pengguna : {user_data.get('user_type').upper()}")
            print(f"  Nama Lengkap  : {user_data.get('name')}")
            print(f"  Identifier    : {user_data.get('identifier')}")
            print(f"  Kampus (PT)   : {user_data.get('university', '-')}")
            print(f"  Program Studi : {user_data.get('study_program', '-')}")
            if user_data.get("access_hours"):
                print(f"  Waktu Akses   : {user_data.get('access_hours')}")
            if user_data.get("specific_role"):
                print(f"  Peran Spesifik: {user_data.get('specific_role')}")
            print("==================================================")
            return data
        else:
            print("--------------------------------------------------")
            print(f">>> AUTENTIKASI GAGAL ({data.get('code')})")
            print(f"  Pesan: {data.get('message')}")
            print("--------------------------------------------------")
            return data

    except requests.exceptions.ConnectionError:
        print("[!] Gagal terhubung ke server KursusHub. Pastikan server aktif di", BASE_URL)
        return {"status": "error", "message": "Connection error"}
    except Exception as e:
        print(f"[!] Terjadi kesalahan: {e}")
        return {"status": "error", "message": str(e)}

# ====================================================================
# Pengujian Otentikasi
# ====================================================================
if __name__ == "__main__":
    print("=" * 60)
    print("TEST SUITE: KursusHub User Authentication API")
    print("=" * 60)

    # 1. Uji Otentikasi Mahasiswa (NPM + Password)
    print("\n--- [Test 1: Mahasiswa Valid (Budi Santoso)] ---")
    authenticate_user(
        identifier="G0143501",
        password="Mhs2026!#",
        course_id="crs-01"
    )

    # 2. Uji Otentikasi Instruktur (Username + Password 16 Digit)
    print("\n--- [Test 2: Instruktur Valid (Dr. Hendra Gunawan)] ---")
    authenticate_user(
        identifier="hendra.gunawan",
        password="H3ndrAGun4w4n982K"
    )

    # 3. Uji Otentikasi Asisten (Username + Password 16 Digit)
    print("\n--- [Test 3: Asisten Valid (Fajar Pratama)] ---")
    authenticate_user(
        identifier="fajar.pratama",
        password="F4j4rPrat4m4928X"
    )

    # 4. Uji Otentikasi Gagal: Password Salah
    print("\n--- [Test 4: Password Salah] ---")
    authenticate_user(
        identifier="G0143501",
        password="PasswordSalah123"
    )

    # 5. Uji Otentikasi Gagal: Pengguna Tidak Ditemukan
    print("\n--- [Test 5: Pengguna Tidak Ditemukan] ---")
    authenticate_user(
        identifier="G0199999",
        password="RandomPassword123"
    )
```

---

<a name="dokumentasi-api-2-pencatatan-log-aktivitas-login"></a>
## Dokumentasi API 2: Pencatatan Log Aktivitas Login

Endpoint ini disediakan bagi sistem eksternal untuk **mencatat aktivitas login peserta/mahasiswa** ke dalam sistem KursusHub.

<a name="spesifikasi-endpoint-logins"></a>
### Spesifikasi Endpoint
- **URL Endpoint**: `http://<domain-atau-ip>:3000/api/external/logins`
- **HTTP Method**: `POST`
- **Header**:
  - `Content-Type`: `application/json`
  - `X-API-Key`: Nilai dari `API_INTEGRATION_KEY` (Default: `kursus_api_secret_key_2026`)

<a name="header--parameter-body-json-logins"></a>
### Header & Parameter Body JSON
| Field | Tipe | Wajib? | Keterangan & Contoh |
| :--- | :---: | :---: | :--- |
| `course_id` | `string` | **Ya** | ID Kursus yang bersangkutan (contoh: `"crs-01"`, `"crs-02"`). |
| `npm` | `string` | **Ya** | Nomor Pokok Mahasiswa (contoh: `"G0143501"`). |
| `nama` | `string` | **Ya** | Nama lengkap mahasiswa (contoh: `"Budi Santoso"`). |
| `login_time` | `string` | *Opsional* | Waktu login dalam format **Hari dan Jam GMT** (contoh: `"Monday, 18 Oct 2026 10:15:30 GMT"`). Jika dikosongkan, server otomatis men-generate waktu GMT saat ini. |

<a name="format-respon-logins"></a>
### Format Respon

#### 1. Berhasil Disimpan (HTTP 201 Created)
```json
{
  "status": "success",
  "code": "CREATED",
  "message": "Data login mahasiswa berhasil dicatat ke dalam sistem KursusHub.",
  "data": {
    "id": "log-1729272300000-xyz",
    "course_id": "crs-01",
    "npm": "G0143501",
    "nama": "Budi Santoso",
    "login_time_gmt": "Monday, 18 Oct 2026 10:15:30 GMT",
    "recorded_at": "2026-10-18T10:15:30.123Z"
  }
}
```

#### 2. Kunci API Salah / Tidak Disertakan (HTTP 401 Unauthorized)
```json
{
  "status": "error",
  "code": "UNAUTHORIZED",
  "message": "Akses ditolak. Header X-API-Key tidak valid atau tidak disertakan."
}
```

#### 3. Parameter Kurang (HTTP 400 Bad Request)
```json
{
  "status": "error",
  "code": "BAD_REQUEST",
  "message": "Parameter \"course_id\", \"npm\", dan \"nama\" wajib disertakan dalam request body JSON."
}
```

<a name="contoh-implementasi-python-pencatatan-log"></a>
### Contoh Implementasi Python: Pencatatan Log

```python
#!/usr/bin/env python3
"""
Contoh Pengiriman Log Aktivitas Login Mahasiswa ke KursusHub
"""

import requests
from datetime import datetime, timezone

API_URL = "http://localhost:3000/api/external/logins"
API_KEY = "kursus_api_secret_key_2026"

def record_student_login(course_id: str, npm: str, name: str, custom_time: str = None):
    # Format Hari dan Jam GMT: "Monday, 18 Oct 2026 10:15:30 GMT"
    if not custom_time:
        now_utc = datetime.now(timezone.utc)
        custom_time = now_utc.strftime("%A, %d %b %Y %H:%M:%S GMT")

    headers = {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY
    }

    payload = {
        "course_id": course_id,
        "npm": npm,
        "nama": name,
        "login_time": custom_time
    }

    try:
        response = requests.post(API_URL, json=payload, headers=headers, timeout=10)
        result = response.json()
        print(f"[*] Response ({response.status_code}):", result.get("message"))
        return result
    except Exception as e:
        print(f"[!] Error: {e}")

if __name__ == "__main__":
    record_student_login(
        course_id="crs-01",
        npm="G0143501",
        name="Budi Santoso"
    )
```

<a name="contoh-request-curl"></a>
### Contoh Request cURL
```bash
curl -X POST "http://localhost:3000/api/external/logins" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: kursus_api_secret_key_2026" \
  -d '{
    "course_id": "crs-01",
    "npm": "G0143501",
    "nama": "Budi Santoso",
    "login_time": "Monday, 18 Oct 2026 10:15:30 GMT"
  }'
```

---

## Skema Database PostgreSQL & Inisialisasi

Skema database diinisialisasi melalui berkas `init-db.sql`. Struktur tabel meliputi:

1. **`universities`**: Menyimpan ID, Kode, dan Nama Perguruan Tinggi.
2. **`faculties`**: Menyimpan Fakultas yang berelasi ke Perguruan Tinggi.
3. **`study_programs`**: Menyimpan Program Studi yang berelasi ke Fakultas.
4. **`courses`**: Menyimpan ID, Nama Kursus, Perguruan Tinggi Mitra, dan Deskripsi Singkat.
5. **`course_dates`**: Relasi *one-to-many* untuk tanggal pelaksanaan dinamis tiap kursus.
6. **`students`**: Menyimpan data mahasiswa (NPM 8 Digit, Nama, Kelas, Universitas, Fakultas, Program Studi, BCrypt Password Hash, Waktu Akses).
7. **`instructors_assistants`**: Menyimpan Instruktur dan Asisten beserta Universitas, Program Studi, Username, Password Hash (BCrypt), dan Peran Spesifik masing-masing.
8. **`login_logs`**: Menyimpan rekaman aktivitas login yang dikirimkan via API (dengan format Hari & Jam GMT).
9. **`admin_users`**: Menyimpan akun administrator.
10. **`system_metadata`**: Melacak status migrasi sistem.

Logika deteksi data pada `init-db.sql`:
```sql
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM courses LIMIT 1) THEN
        -- Belum ada data: jalankan migrasi dataset default
        RAISE NOTICE 'Default migration dataset seeded successfully.';
    ELSE
        -- Data telah ada: migrasi dilewati untuk menjaga integritas data pengguna
        RAISE NOTICE 'Data already exists in database. Skipping default migration.';
    END IF;
END $$;
```

---

## Hak Cipta
Hak Cipta © 2026 - **halkh-systems.com**. All Rights Reserved.
