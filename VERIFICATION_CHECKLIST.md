# ✅ CHECKLIST APLIKASI - TEBAK GAMBAR PUZZLE

## 📋 PRE-DEPLOYMENT VERIFICATION

### 1. ENVIRONMENT SETUP
- [x] `.env` file exists dengan semua variables:
  - [x] SUPABASE_URL = `https://inpxscqndplbbntyviue.supabase.co`
  - [x] SUPABASE_KEY = Ada (secret key)
  - [x] PEXELS_API_KEY = Ada
  - [x] EMAIL_SERVICE = `gmail`
  - [x] EMAIL_PENGIRIM = `tebakin.gambar.1@gmail.com`
  - [x] EMAIL_PASSWORD = Ada (Gmail App Password)
  - [x] PORT = `3000`

### 2. DATABASE (SUPABASE)
Pastikan Supabase punya tables berikut:

#### Table: `pengguna`
```
Columns:
- id (UUID, Primary Key)
- nama (VARCHAR)
- email (VARCHAR, Unique)
- password (VARCHAR)
- total_skor (INTEGER, Default: 0)
- tanggal_daftar (TIMESTAMP)
```

#### Table: `skor_permainan`
```
Columns:
- id (UUID, Primary Key)
- id_pengguna (UUID, Foreign Key → pengguna.id)
- skor (INTEGER)
- tingkat_kesulitan (VARCHAR)
- waktu_detik (INTEGER)
- tanggal (TIMESTAMP)
```

**Verifikasi di Supabase:**
1. Login ke https://supabase.com
2. Select project Anda
3. Klik "SQL Editor"
4. Run query untuk check tables:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```
**Result harus ada: `pengguna`, `skor_permainan`**

### 3. SERVER (server.js)
Endpoints yang harus ada:

- [x] GET `/` - Homepage
- [x] POST `/api/daftar` - Register user
- [x] POST `/api/masuk` - Login user  
- [x] GET `/api/gambar-acak` - Random image dari Pexels
- [x] POST `/api/potong-gambar` - Cut image into tiles
- [x] POST `/api/simpan-skor` - Save score to DB
- [x] GET `/api/papan-peringkat` - Get leaderboard
- [x] GET `/api/session` - Check current session

**Test di lokal:**
```bash
npm run dev
# Test dengan Postman atau curl
curl http://localhost:3000/api/health
```

### 4. FRONTEND (public/)
Files yang ada:

- [x] `index.html` - Main HTML
- [x] `auth.js` - Login/Register logic
- [x] `game.js` - Game engine
- [x] `main.js` - Main app logic
- [x] `styles.css` - Styling

**Check di index.html:**
- [x] Script imports ada semua (auth.js, game.js, main.js)
- [x] HTML structure lengkap
- [x] CSS loaded

### 5. DEPENDENCIES (package.json)
```
✅ express ^4.18.2
✅ socket.io ^4.7.2
✅ cors ^2.8.5
✅ axios ^1.6.2
✅ nodemailer ^6.9.7
✅ sharp ^0.33.0
✅ @supabase/supabase-js ^2.38.4
✅ dotenv ^16.3.1
✅ nodemon ^3.0.2 (dev)
```

**Verify:**
```bash
npm list
```

### 6. EMAIL SETUP (CRITICAL!)
Gmail setup untuk Nodemailer:

**⚠️ PENTING - BUKAN PASSWORD AKUN!**

1. Login ke Gmail
2. Google Account → Security
3. App Passwords (hanya jika 2FA enabled)
4. Select "Mail" → "Windows Computer"
5. Copy generated password
6. Set di `.env`: `EMAIL_PASSWORD=<generated-password>`

Jika App Passwords tidak ada:
- Enable 2-Factor Authentication dulu
- Baru bisa generate App Password

### 7. LOCAL TESTING

#### Test 1: Server Startup
```bash
npm run dev
```
Expected output:
```
✅ Server berjalan di http://localhost:3000
📊 Database: Supabase
🖼️  API Gambar: Pexels
📧 Email: Nodemailer
🔌 Real-time: Socket.IO
```

#### Test 2: Access Homepage
```bash
# Buka di browser: http://localhost:3000
```
Expected: Halaman intro/intro puzzle loading

#### Test 3: Register User
1. Klik "Mulai Bermain"
2. Switch ke tab "Daftar"
3. Isi form:
   - Nama: test_user_123
   - Email: your-email@gmail.com
   - Password: 123456
4. Klik "Daftar"

Expected:
- ✅ Notifikasi "Selamat" muncul
- ✅ Redirect ke login (3 detik)
- ✅ Email terkirim ke inbox Anda

**Check server console untuk:**
```
📝 === REGISTRASI ===
✅ User berhasil terdaftar: test_user_123
✅ Email konfirmasi terkirim ke: your-email@gmail.com
```

#### Test 4: Login
1. Tab Login
2. Email: your-email@gmail.com
3. Password: 123456
4. Klik "Masuk"

Expected:
- ✅ Login berhasil
- ✅ Redirect ke menu utama
- ✅ Session ID disimpan di localStorage

#### Test 5: Main Menu
Expected: Tampilannya
- [x] Nama user ditampilkan
- [x] Tombol "Mulai Bermain" ada
- [x] Tombol "Papan Peringkat" ada
- [x] Pilihan kesulitan (Mudah/Sedang/Sulit) ada
- [x] Leaderboard preview ada

#### Test 6: Play Game
1. Select "Mudah" → Klik "Mulai Bermain"
2. Wait untuk load gambar dari Pexels
3. Tiles muncul (3x3 grid)
4. Drag-drop tiles
5. Complete puzzle

Expected:
- ✅ Gambar terload dari Pexels
- ✅ Tiles bisa di-drag
- ✅ Score counter jalan
- ✅ Timer jalan
- ✅ Completion detection bekerja

#### Test 7: Save Score
Setelah puzzle selesai:

Expected:
- ✅ Notifikasi "Selesai" muncul
- ✅ Score ditampilkan
- ✅ Tombol "Lanjut" ada
- ✅ Data masuk ke Supabase `skor_permainan` table

**Check di Supabase:**
1. Klik table `skor_permainan`
2. Verify row baru ada dengan skor Anda

#### Test 8: Leaderboard
1. Dari menu → Klik "Papan Peringkat"
2. Select "Mudah"

Expected:
- ✅ Scores muncul (dari yang tertinggi)
- ✅ Nama pemain ditampilkan
- ✅ Score dan waktu terlihat

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue: Email tidak terkirim
**Causes:**
1. App Password salah
2. 2FA belum enabled
3. Less secure apps diblokir

**Solution:**
1. Generate ulang App Password dari Google Account
2. Set di `.env`: `EMAIL_PASSWORD=<new-password>`
3. Restart server: `npm run dev`

### Issue: Notifikasi tidak muncul
**Check:**
1. Console browser (F12) ada error?
2. Response dari `/api/daftar` return `sukses: true`?
3. Function `buatNotifikasi()` ada di auth.js?

### Issue: Gambar tidak load dari Pexels
**Check:**
1. PEXELS_API_KEY valid?
2. API rate limit tercapai? (Try tomorrow)
3. Console error: `Fetch image error`?

### Issue: Score tidak tersimpan
**Check:**
1. Session valid? (`localStorage.getItem('sesiId')`)
2. Response dari `/api/simpan-skor` return `sukses: true`?
3. Supabase table `skor_permainan` ada?

### Issue: Koneksi Supabase error
**Check:**
1. SUPABASE_URL benar?
2. SUPABASE_KEY benar?
3. Tables sudah dibuat?
4. Firewall tidak block?

---

## ✅ READY FOR DEPLOYMENT?

Jika semua test passed:
- [x] Server berjalan lancar lokal
- [x] Database connected
- [x] Email terkirim
- [x] Game playable
- [x] Score tersimpan
- [x] Leaderboard kerja

**THEN READY FOR RAILWAY! 🚀**

---

## 🚀 DEPLOYMENT STEPS

Setelah semua test passed:

```bash
# 1. Git commit
git add .
git commit -m "Final version - ready for Railway"
git push origin main

# 2. Install Railway CLI
npm install -g @railway/cli

# 3. Login Railway
railway login

# 4. Initialize Railway
railway init

# 5. Set environment variables
railway variables

# Add:
# SUPABASE_URL=...
# SUPABASE_KEY=...
# etc

# 6. Deploy
railway up
```

---

## 📞 DEBUGGING COMMANDS

```bash
# Check dependencies installed
npm list

# Test API endpoint
curl http://localhost:3000/api/health

# View server logs
npm run dev

# Check environment variables
node -e "console.log(process.env)"
```

---

**Generate checklist ini: 22 Dec 2025**
