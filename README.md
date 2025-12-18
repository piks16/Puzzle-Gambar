# 🧩 Program Permainan Puzzle Interaktif Berbasis Web

## 📋 Daftar Isi
1. [Deskripsi Aplikasi](#deskripsi-aplikasi)
2. [Fitur Utama](#fitur-utama)
3. [Teknologi yang Digunakan](#teknologi-yang-digunakan)
4. [Setup & Instalasi](#setup--instalasi)
5. [Konfigurasi Database](#konfigurasi-database)
6. [Menjalankan Aplikasi](#menjalankan-aplikasi)
7. [Struktur Proyek](#struktur-proyek)
8. [API Endpoints](#api-endpoints)
9. [Socket.IO Events](#socketio-events)
10. [Panduan Penggunaan](#panduan-penggunaan)
11. [Troubleshooting](#troubleshooting)

---

## 📝 Deskripsi Aplikasi

**Program Permainan Puzzle Interaktif Berbasis Web** adalah aplikasi web yang memungkinkan pengguna untuk memainkan permainan puzzle dengan gambar yang diambil dari API eksternal (Pexels). Pengguna dapat memilih tingkat kesulitan yang berbeda-beda dan berkompetisi untuk mendapatkan skor tertinggi di leaderboard.

### Spesifikasi Teknis
- **Bahasa Pemrograman**: JavaScript (Node.js + Frontend)
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **API Eksternal**: Pexels API
- **Real-time Communication**: Socket.IO
- **Email Service**: Nodemailer (Gmail)
- **Naming Convention**: Indonesian (Bahasa Indonesia)

---

## ✨ Fitur Utama

### 1. Authentication System
- ✅ Registrasi user baru dengan validasi email
- ✅ Login dengan session management
- ✅ Logout dan session destruction
- ✅ Password validation (minimal 6 karakter)
- ✅ Email confirmation pada registrasi

### 2. Game Mechanics
- ✅ Preset difficulty levels: Mudah (3x3), Sedang (4x4), Sulit (5x5)
- ✅ Custom difficulty: 2x2 hingga 8x8 grid
- ✅ Drag-and-drop interface untuk menempatkan tiles
- ✅ Automatic scoring system (10 poin per tile yang benar)
- ✅ Real-time timer untuk tracking waktu bermain
- ✅ Hint system (highlight slot kosong random)
- ✅ Reset game (shuffle tiles kembali)

### 3. Image Management
- ✅ Fetch gambar dari Pexels API secara random
- ✅ Image caching di server memory
- ✅ Tile positioning dengan background positioning yang akurat
- ✅ Responsive image scaling

### 4. Scoring & Leaderboard
- ✅ Track skor per permainan ke database
- ✅ Total skor akumulatif per user
- ✅ Leaderboard top 10 pemain
- ✅ Statistik permainan (jumlah game, rata-rata waktu, dll)

### 5. Real-time Features
- ✅ Socket.IO untuk broadcast game completion
- ✅ Live leaderboard updates
- ✅ Connected user tracking

### 6. Email Notifications
- ✅ Welcome email saat registrasi
- ✅ Configurable email service (Gmail SMTP)

---

## 🛠️ Teknologi yang Digunakan

| Component | Technology | Version |
|-----------|-----------|---------|
| Backend | Express.js | ^4.18.0 |
| Runtime | Node.js | ^16.0.0 |
| Database | Supabase (PostgreSQL) | Cloud |
| ORM | Supabase JS Client | ^2.0.0 |
| Real-time | Socket.IO | ^4.5.0 |
| Email | Nodemailer | ^6.9.0 |
| HTTP Client | Axios | ^1.4.0 |
| CORS | cors | ^2.8.5 |
| Environment | dotenv | ^16.0.0 |

---

## 🚀 Setup & Instalasi

### Prerequisites
- Node.js v16+ sudah terinstall
- npm atau yarn
- Account Supabase
- Account Pexels API
- Gmail account dengan app password

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd tebak-gambar
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Setup Environment Variables
Buat file `.env` di root directory dengan konten:

```env
# Database Supabase
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# Pexels API
PEXELS_API_KEY=your-pexels-api-key

# Email Configuration
EMAIL_PENGIRIM=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# Port
PORT=3000
```

**Note**: 
- Dapatkan Supabase credentials dari https://app.supabase.com
- Dapatkan Pexels API key dari https://www.pexels.com/api/
- Setup Gmail app password dari https://myaccount.google.com/apppasswords

---

## 🗄️ Konfigurasi Database

### Step 1: Setup Database Tables
1. Buka Supabase Console
2. Navigasi ke "SQL Editor"
3. Copy-paste seluruh konten dari file `DATABASE_SETUP.sql`
4. Klik "Run"

### Database Schema
Database akan membuat 2 table utama:

#### Table: `pengguna`
```sql
- id (Primary Key)
- nama (VARCHAR)
- email (VARCHAR, Unique)
- password (VARCHAR) -- Note: gunakan bcrypt di production!
- total_skor (INTEGER)
- tanggal_daftar (TIMESTAMP)
- terakhir_login (TIMESTAMP)
```

#### Table: `skor_permainan`
```sql
- id (Primary Key)
- id_pengguna (Foreign Key)
- skor (INTEGER)
- tingkat_kesulitan (VARCHAR)
- waktu_detik (INTEGER)
- ukuran_grid (INTEGER)
- tanggal (TIMESTAMP)
```

### Views yang Dibuat
- `papan_peringkat_top10` - Top 10 pemain dengan skor tertinggi
- `statistik_user` - Statistik permainan per user
- `statistik_difficulty` - Statistik permainan per level kesulitan

---

## ▶️ Menjalankan Aplikasi

### Development Mode
```bash
npm start
# atau
node server.js
```

Server akan berjalan di `http://localhost:3000`

### Production Mode
```bash
NODE_ENV=production npm start
```

---

## 📁 Struktur Proyek

```
tebak-gambar/
├── server.js                    # Main server file
├── package.json                 # Dependencies
├── .env                         # Environment variables
├── DATABASE_SETUP.sql           # Database schema
├── README.md                    # Documentation
│
├── config/
│   └── konfigurasi.js          # Centralized configuration
│
├── rute/                        # API Routes (folder untuk future expansion)
│   └── [routes files will be here]
│
├── layanan/                     # Services (folder untuk future expansion)
│   └── [service files will be here]
│
└── public/                      # Frontend files
    ├── index.html               # Main HTML
    ├── gaya.css                 # Stylesheet
    ├── utama.js                 # Main app initialization
    ├── authentikasi.js          # Authentication logic
    ├── permainan.js             # Game engine
    ├── js/                      # Additional JS modules
    └── css/                     # Additional stylesheets
```

---

## 🔌 API Endpoints

### Authentication
```
POST /api/daftar
Body: { nama, email, password }
Response: { sukses, pesan }

POST /api/masuk
Body: { email, password }
Response: { sukses, pesan, data: { sesiId, nama, email } }

POST /api/keluar
Body: { sesiId }
Response: { sukses, pesan }
```

### Game
```
GET /api/gambar-acak
Response: { sukses, pesan, data: { idGambar, idCache, urlGambar, fotografer } }

GET /api/gambar/:idCache
Response: Image binary data

POST /api/simpan-skor
Body: { sesiId, tingkatKesulitan, skor, waktuDetik }
Response: { sukses, pesan }

GET /api/papan-peringkat
Response: { sukses, pesan, data: [{ id, nama, total_skor, terakhir_login }, ...] }
```

---

## 🔄 Socket.IO Events

### Server Events (Listen)
```javascript
socket.on('connect')              // Koneksi baru
socket.on('disconnect')           // User disconnect
socket.on('connect_error')        // Error koneksi
```

### Server Events (Emit)
```javascript
io.emit('update-papan-peringkat', dataPapan)    // Update leaderboard
io.emit('user-selesai-puzzle', data)             // Broadcast completion
```

### Client Events
```javascript
socket.emit('puzzle-completed', {              // Emit saat puzzle selesai
  nama, ukuranGrid, skor, waktu
})
```

---

## 👥 Panduan Penggunaan

### Untuk User Baru
1. Buka aplikasi di `http://localhost:3000`
2. Klik tab "Daftar"
3. Masukkan nama, email, dan password
4. Klik "Daftar"
5. Login dengan email dan password yang sudah didaftar

### Untuk Bermain Game
1. Pilih level kesulitan atau custom grid size
2. Game akan memulai dengan mengambil gambar random
3. Seret tiles dari pool ke slot papan yang sesuai
4. Setiap tile yang ditempatkan dengan benar akan mendapat 10 poin
5. Game selesai ketika semua slot terisi
6. Skor akan disimpan ke database otomatis

### Keyboard Shortcuts (saat bermain)
- **ESC** - Kembali ke menu (dengan konfirmasi)
- **H** - Hint (highlight slot kosong)
- **R** - Reset game (shuffle tiles ulang)

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'dotenv'"
```bash
npm install dotenv
```

### Error: "Gambar tidak muncul"
- Pastikan URL gambar accessible
- Check browser console untuk error details
- Verify Pexels API key di `.env`

### Error: "Koneksi database gagal"
- Verify `SUPABASE_URL` dan `SUPABASE_KEY` di `.env`
- Pastikan Supabase project active
- Check database tables sudah dibuat dengan benar

### Error: "Email tidak terkirim"
- Verify email credentials di `.env`
- Pastikan Gmail app password sudah generate (bukan regular password)
- Check Gmail security settings memungkinkan "Less secure apps"

### Socket.IO tidak terkoneksi
- Pastikan server berjalan
- Check client console untuk error
- Verify CORS settings di server

---

## 📊 Performance Tips

1. **Image Caching**: Images di-cache di memory server untuk response lebih cepat
2. **Database Indexes**: Gunakan indexes pada email dan user_id untuk query optimization
3. **Session Management**: Session disimpan di memory (gunakan Redis untuk production)
4. **Static Files**: Frontend files di-serve sebagai static dari `/public`

---

## 🔒 Security Notes

⚠️ **IMPORTANT FOR PRODUCTION**:
1. Hash passwords menggunakan bcrypt, bukan plain text
2. Gunakan HTTPS instead of HTTP
3. Implement rate limiting untuk API endpoints
4. Move session storage dari memory ke Redis
5. Implement CSRF protection
6. Validate semua user input di server-side
7. Use environment variables untuk sensitive data
8. Implement API key rotation untuk external APIs

---

## 📝 License & Credits

- **Author**: [Your Name]
- **University**: Universitas [Name]
- **Course**: Praktikum Pemograman Jaringan
- **Date**: Desember 2025

---

## 📧 Support

Untuk pertanyaan atau issue, silakan hubungi:
- Email: [your-email@example.com]
- GitHub Issues: [link-to-issues]

---

**Last Updated**: 17 Desember 2025
**Version**: 1.0.0
