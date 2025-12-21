/**
 * ================================================================
 * PROGRAM PERMAINAN PUZZLE INTERAKTIF BERBASIS WEB
 * ================================================================
 * 
 * Deskripsi Program:
 * Aplikasi web puzzle interaktif yang mengambil gambar dari Pexels API,
 * disimpan di Supabase, kemudian dipotong menjadi tiles dan dimainkan
 * sebagai permainan puzzle drag-and-drop. Terintegrasi dengan Socket.IO
 * untuk komunikasi real-time dan Email untuk notifikasi.
 * 
 * Fitur Utama:
 * - Authentication (Login/Register)
 * - Permainan Puzzle (3x3, 4x4, 5x5, Custom 2x2-8x8)
 * - Scoring & Leaderboard
 * - Real-time Updates via Socket.IO
 * - Email Notification
 * 
 * Stack Teknologi:
 * - Backend: Express.js, Node.js
 * - Database: Supabase (PostgreSQL)
 * - API Eksternal: Pexels API
 * - Real-time: Socket.IO
 * - Email: Nodemailer
 * 
 * Author: [Nama Peserta]
 * Tanggal: 17 Desember 2025
 * ================================================================
 */

// ================================================================
// 1. IMPORT DEPENDENCIES
// ================================================================
require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const nodemailer = require('nodemailer');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');
const konfigurasi = require('./config/konfigurasi');

// ================================================================
// 2. INISIALISASI APLIKASI
// ================================================================
const aplikasi = express();
const server = http.createServer(aplikasi);
const io = socketIO(server, {
  cors: konfigurasi.CORS
});

// ================================================================
// 3. MIDDLEWARE
// ================================================================
aplikasi.use(express.json());
aplikasi.use(express.static('public'));
aplikasi.use(cors());

// ================================================================
// 4. KONFIGURASI DATABASE (SUPABASE)
// ================================================================
const databaseSupabase = createClient(
  konfigurasi.SUPABASE.URL,
  konfigurasi.SUPABASE.KEY
);

// ================================================================
// 5. KONFIGURASI EMAIL (NODEMAILER)
// ================================================================
const pengaturanEmail = nodemailer.createTransport({
  service: konfigurasi.EMAIL.SERVICE,
  auth: {
    user: konfigurasi.EMAIL.PENGIRIM,
    pass: konfigurasi.EMAIL.PASSWORD
  }
});

// ================================================================
// 6. KONFIGURASI PEXELS API
// ================================================================
const API_KEY_PEXELS = konfigurasi.PEXELS.API_KEY;
const URL_BASIS_PEXELS = konfigurasi.PEXELS.BASE_URL;
const simpananGambar = new Map(); // Cache gambar di memory

// ================================================================
// 7. SESSION MANAGEMENT (IN-MEMORY)
// ================================================================
const penyimpananSesi = {};

/**
 * Fungsi: generateSessionId
 * Deskripsi: Generate unique session ID untuk user yang login
 * Return: String - Session ID unik
 */
function generateSessionId() {
  return 'sesi_' + Math.random().toString(36).substring(7) + '_' + Date.now();
}

/**
 * Fungsi: buatSesi
 * Deskripsi: Membuat session baru untuk user yang telah login
 * Parameter: dataPengguna (Object) - Data user dari database
 * Return: String - Session ID
 */
function buatSesi(dataPengguna) {
  const sesiId = generateSessionId();
  penyimpananSesi[sesiId] = {
    id: dataPengguna.id,
    nama: dataPengguna.nama,
    email: dataPengguna.email,
    waktuLogin: new Date()
  };
  console.log(`✅ Sesi dibuat: ${sesiId.substring(0, 20)}...`);
  return sesiId;
}

/**
 * Fungsi: verifikasiSesi
 * Deskripsi: Memverifikasi apakah session ID valid
 * Parameter: sesiId (String) - Session ID yang akan diverifikasi
 * Return: Object atau null
 */
function verifikasiSesi(sesiId) {
  return penyimpananSesi[sesiId] || null;
}

/**
 * Fungsi: hapusSesi
 * Deskripsi: Menghapus session (logout)
 * Parameter: sesiId (String) - Session ID yang akan dihapus
 */
function hapusSesi(sesiId) {
  delete penyimpananSesi[sesiId];
  console.log(`✅ Sesi dihapus: ${sesiId.substring(0, 20)}...`);
}

// ================================================================
// 8. FUNGSI PEXELS API
// ================================================================

/**
 * Fungsi: ambilGambarAcakDariPexels
 * Deskripsi: Mengambil gambar random dari Pexels API, crop ke square, dan cache ke memory
 * Return: Object dengan properti {id, url, photographer}
 */
async function ambilGambarAcakDariPexels() {
  try {
    console.log('🌐 Menghubungi Pexels API...');
    const halamanRandom = Math.floor(Math.random() * 100) + 1;
    
    const respons = await axios.get(`${URL_BASIS_PEXELS}/curated`, {
      headers: { Authorization: API_KEY_PEXELS },
      params: {
        per_page: 80,
        page: halamanRandom
      }
    });

    console.log(`✅ Status respons: ${respons.status}`);
    console.log(`✅ Foto diterima: ${respons.data.photos ? respons.data.photos.length : 0}`);

    if (respons.data.photos && respons.data.photos.length > 0) {
      const fotoRandom = respons.data.photos[Math.floor(Math.random() * respons.data.photos.length)];
      console.log(`✅ ID Foto Dipilih: ${fotoRandom.id}`);
      
      // Coba berbagai format image
      const urlGambar = fotoRandom.src.large2x || fotoRandom.src.large || fotoRandom.src.medium || fotoRandom.src.small;
      console.log(`   URL Gambar: ${urlGambar.substring(0, 80)}...`);
      
      return {
        id: fotoRandom.id,
        url: urlGambar,
        fotografer: fotoRandom.photographer
      };
    }
  } catch (kesalahan) {
    console.error('❌ Kesalahan Pexels API:', kesalahan.message);
  }

  // Fallback jika API error
  console.log('⚠️ Menggunakan gambar fallback');
  return {
    id: Math.random().toString(36).substring(7),
    url: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg',
    fotografer: 'Default'
  };
}

/**
 * Fungsi: cropGambarMenjadiBujurSangkar
 * Deskripsi: Download gambar dari URL dan crop ke ukuran square (bujur sangkar)
 * Parameter: urlGambar (String) - URL gambar dari Pexels
 * Return: Buffer gambar yang sudah di-crop
 */
async function cropGambarMenjadiBujurSangkar(urlGambar) {
  try {
    console.log('🎬 Mendownload gambar dari Pexels...');
    
    // Download gambar
    const hasilDownload = await axios.get(urlGambar, {
      responseType: 'arraybuffer'
    });
    
    const bufferGambar = Buffer.from(hasilDownload.data);
    console.log(`📥 Gambar didownload: ${bufferGambar.length} bytes`);
    
    // Get metadata untuk tahu ukuran original
    const metadataGambar = await sharp(bufferGambar).metadata();
    console.log(`📐 Ukuran original: ${metadataGambar.width}x${metadataGambar.height}px`);
    
    // Hitung dimensi square (ambil yang terkecil)
    const dimensiSquare = Math.min(metadataGambar.width, metadataGambar.height);
    
    // Hitung offset untuk crop dari center
    const offsetX = Math.floor((metadataGambar.width - dimensiSquare) / 2);
    const offsetY = Math.floor((metadataGambar.height - dimensiSquare) / 2);
    
    console.log(`✂️  Crop ke square: ${dimensiSquare}x${dimensiSquare}px (offset: ${offsetX}, ${offsetY})`);
    
    // Crop gambar ke square
    const gambarSquare = await sharp(bufferGambar)
      .extract({
        left: offsetX,
        top: offsetY,
        width: dimensiSquare,
        height: dimensiSquare
      })
      .toBuffer();
    
    console.log(`✅ Gambar berhasil di-crop ke square: ${gambarSquare.length} bytes`);
    
    return gambarSquare;
  } catch (kesalahan) {
    console.error('❌ Kesalahan crop gambar:', kesalahan.message);
    throw kesalahan;
  }
}

// ================================================================
// 9. SOCKET.IO EVENTS
// ================================================================
io.on('connection', (soket) => {
  console.log(`🔗 User terhubung: ${soket.id}`);

  // Kirim jumlah user online ke semua client
  io.emit('user-online-count', { onlineCount: io.engine.clientsCount });

  /**
   * Event: user-login
   * Diterima ketika user login dan socket terhubung
   */
  soket.on('user-login', (dataUser) => {
    soket.namaUser = dataUser.nama;
    soket.emailUser = dataUser.email;
    console.log(`👤 ${dataUser.nama} login via socket`);
    io.emit('user-online-count', { onlineCount: io.engine.clientsCount });
  });

  /**
   * Event: skor-disimpan
   * Diterima dari client saat user selesai game
   * Broadcast ke semua client untuk update leaderboard realtime
   */
  soket.on('skor-disimpan', (dataGame) => {
    console.log(`🎮 Skor baru: ${dataGame.nama_pemain} - ${dataGame.skor} poin`);
    
    // Broadcast ke semua client
    io.emit('leaderboard-update', {
      nama_pemain: dataGame.nama_pemain,
      skor: dataGame.skor,
      waktu_detik: dataGame.waktu_detik,
      tingkat_kesulitan: dataGame.tingkat_kesulitan,
      message: `🎮 ${dataGame.nama_pemain} selesai ${dataGame.tingkat_kesulitan} dengan skor ${dataGame.skor}!`
    });
  });

  soket.on('disconnect', () => {
    console.log(`🔌 User terputus: ${soket.id}`);
    io.emit('user-online-count', { onlineCount: io.engine.clientsCount });
  });
});

// ================================================================
// 10. RUTE: HOME
// ================================================================
aplikasi.get('/', (req, res) => {
  res.json({
    aplikasi: 'Program Permainan Puzzle Interaktif',
    versi: '1.0.0',
    status: 'Online'
  });
});

// ================================================================
// 11. RUTE: AUTHENTIKASI
// ================================================================

/**
 * RUTE: POST /api/daftar
 * Deskripsi: Register user baru
 * Body: {nama, email, password}
 */
aplikasi.post('/api/daftar', async (req, res) => {
  try {
    const { nama, email, password } = req.body;

    console.log('\n📝 === REGISTRASI ===');
    console.log(`Email: ${email}, Nama: ${nama}`);

    if (!nama || !email || !password) {
      return res.status(400).json({
        sukses: false,
        pesan: 'Nama, email, dan password harus diisi'
      });
    }

    // Cek apakah nama sudah terdaftar
    const { data: penggunaNama, error: kesalahanNama } = await databaseSupabase
      .from('pengguna')
      .select('*')
      .eq('nama', nama);

    if (kesalahanNama) {
      console.error('❌ Kesalahan database:', kesalahanNama.message);
      return res.status(500).json({
        sukses: false,
        pesan: 'Kesalahan database'
      });
    }

    if (penggunaNama.length > 0) {
      console.log('❌ Nama sudah terdaftar');
      return res.status(400).json({
        sukses: false,
        pesan: 'Nama/username sudah terdaftar, gunakan nama lain'
      });
    }

    // Cek apakah email sudah terdaftar
    const { data: pengguna, error: kesalahan } = await databaseSupabase
      .from('pengguna')
      .select('*')
      .eq('email', email);

    if (kesalahan) {
      console.error('❌ Kesalahan database:', kesalahan.message);
      return res.status(500).json({
        sukses: false,
        pesan: 'Kesalahan database'
      });
    }

    if (pengguna.length > 0) {
      console.log('❌ Email sudah terdaftar');
      return res.status(400).json({
        sukses: false,
        pesan: 'Email sudah terdaftar'
      });
    }

    // Insert user baru
    const { data: dataBaru, error: kesalahanInsert } = await databaseSupabase
      .from('pengguna')
      .insert([{
        nama,
        email,
        password,
        total_skor: 0,
        tanggal_daftar: new Date().toISOString()
      }])
      .select();

    if (kesalahanInsert) {
      console.error('❌ Kesalahan insert:', kesalahanInsert.message);
      return res.status(500).json({
        sukses: false,
        pesan: 'Gagal membuat akun'
      });
    }

    console.log(`✅ User berhasil terdaftar: ${nama}`);

    // Kirim email konfirmasi
    await pengaturanEmail.sendMail({
      from: process.env.EMAIL_PENGIRIM,
      to: email,
      subject: '🎉 Selamat Datang di Program Permainan Puzzle!',
      html: `
        <h2>Selamat Datang, ${nama}!</h2>
        <p>Akun Anda telah berhasil dibuat.</p>
        <p>Silakan login ke aplikasi dan mulai bermain puzzle!</p>
      `
    }).catch(err => console.error('Gagal kirim email:', err.message));

    res.json({
      sukses: true,
      pesan: 'Registrasi berhasil'
    });
  } catch (kesalahan) {
    console.error('❌ Kesalahan registrasi:', kesalahan);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan server'
    });
  }
});

/**
 * RUTE: POST /api/masuk
 * Deskripsi: Login user
 * Body: {email, password}
 */
aplikasi.post('/api/masuk', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('\n🔑 === LOGIN ===');
    console.log(`Email: ${email}`);

    // Cari user
    const { data: pengguna, error: kesalahan } = await databaseSupabase
      .from('pengguna')
      .select('*')
      .eq('email', email);

    if (kesalahan || pengguna.length === 0) {
      console.log('❌ Email tidak ditemukan');
      return res.status(401).json({
        sukses: false,
        pesan: 'Email atau password salah'
      });
    }

    // Verifikasi password
    if (pengguna[0].password !== password) {
      console.log('❌ Password salah');
      return res.status(401).json({
        sukses: false,
        pesan: 'Email atau password salah'
      });
    }

    // Buat session
    const sesiId = buatSesi(pengguna[0]);

    // Update terakhir login
    await databaseSupabase
      .from('pengguna')
      .update({ terakhir_login: new Date().toISOString() })
      .eq('id', pengguna[0].id);

    console.log(`✅ Login berhasil untuk ${pengguna[0].nama}`);

    res.json({
      sukses: true,
      pesan: 'Login berhasil',
      data: {
        sesiId,
        nama: pengguna[0].nama,
        email: pengguna[0].email
      }
    });
  } catch (kesalahan) {
    console.error('❌ Kesalahan login:', kesalahan);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan server'
    });
  }
});

/**
 * RUTE: POST /api/lupa-password
 * Deskripsi: Kirim link reset password ke email user
 * Body: {email}
 */
aplikasi.post('/api/lupa-password', async (req, res) => {
  try {
    const { email } = req.body;

    console.log('\n📧 === LUPA PASSWORD ===');
    console.log(`Email: ${email}`);

    // Validasi input
    if (!email) {
      return res.status(400).json({
        sukses: false,
        pesan: 'Email harus diisi'
      });
    }

    // Cari user berdasarkan email
    const { data: pengguna, error: kesalahan } = await databaseSupabase
      .from('pengguna')
      .select('*')
      .eq('email', email);

    if (kesalahan || pengguna.length === 0) {
      console.log('❌ Email tidak ditemukan');
      // Untuk keamanan, tetap return sukses agar tidak ada email enumeration
      return res.json({
        sukses: true,
        pesan: 'Jika email terdaftar, link reset akan dikirim'
      });
    }

    // Generate token reset (simple: email + timestamp + random)
    const tokenReset = require('crypto')
      .randomBytes(32)
      .toString('hex');
    
    const expiredAt = new Date();
    expiredAt.setHours(expiredAt.getHours() + 1); // Token berlaku 1 jam

    // Simpan token di database (tambah kolom reset_token dan reset_expired)
    const { error: updateError } = await databaseSupabase
      .from('pengguna')
      .update({
        reset_token: tokenReset,
        reset_expired: expiredAt.toISOString()
      })
      .eq('id', pengguna[0].id);

    if (updateError) {
      console.error('❌ Kesalahan update token:', updateError);
      throw updateError;
    }

    // Kirim email dengan link reset
    const linkReset = `http://localhost:3000/reset-password?token=${tokenReset}`;
    
    await pengaturanEmail.sendMail({
      from: process.env.EMAIL_PENGIRIM,
      to: email,
      subject: '🔐 Reset Password Puzzle Game',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Password Anda</h2>
          <p>Kami menerima permintaan untuk mereset password akun Anda.</p>
          
          <p><strong>Link reset password Anda:</strong></p>
          <p>
            <a href="${linkReset}" style="
              display: inline-block;
              padding: 12px 30px;
              background-color: #6366f1;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              margin: 20px 0;
            ">Reset Password</a>
          </p>
          
          <p>Atau copy link ini ke browser Anda:</p>
          <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
            ${linkReset}
          </p>
          
          <p style="color: #666; font-size: 14px;">
            ⏱️ Link ini berlaku selama 1 jam.<br>
            🔒 Jangan bagikan link ini ke orang lain.
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            Jika Anda tidak meminta reset password, abaikan email ini.
          </p>
        </div>
      `
    });

    console.log(`✅ Email reset password dikirim ke ${email}`);

    res.json({
      sukses: true,
      pesan: 'Link reset password telah dikirim ke email Anda'
    });
  } catch (kesalahan) {
    console.error('❌ Kesalahan lupa password:', kesalahan);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan server'
    });
  }
});

/**
 * RUTE: POST /api/keluar
 * Deskripsi: Logout user
 * Body: {sesiId}
 */
aplikasi.post('/api/keluar', (req, res) => {
  try {
    const { sesiId } = req.body;

    console.log('\n🚪 === LOGOUT ===');

    hapusSesi(sesiId);

    res.json({
      sukses: true,
      pesan: 'Logout berhasil'
    });
  } catch (kesalahan) {
    console.error('❌ Kesalahan logout:', kesalahan);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan server'
    });
  }
});

// ================================================================
// 12. RUTE: GAME
// ================================================================

/**
 * RUTE: GET /api/gambar-acak
 * Deskripsi: Ambil gambar random dari Pexels, crop ke square, dan cache
 * Return: JSON dengan imageUrl dan imageId
 */
aplikasi.get('/api/gambar-acak', async (req, res) => {
  try {
    console.log('\n📸 === AMBIL GAMBAR RANDOM ===');
    const gambar = await ambilGambarAcakDariPexels();

    console.log(`🔄 Mengambil data gambar...`);

    // Crop gambar ke square
    const gambarSquare = await cropGambarMenjadiBujurSangkar(gambar.url);

    // Cache gambar dengan ID unik
    const idCache = `img_${gambar.id}_${Date.now()}`;
    simpananGambar.set(idCache, gambarSquare);

    console.log(`✅ Gambar di-cache: ${idCache}`);
    console.log(`   Ukuran setelah crop: ${gambarSquare.length} bytes`);

    res.json({
      sukses: true,
      pesan: 'Gambar berhasil diambil dan di-crop ke square',
      data: {
        idGambar: gambar.id,
        idCache,
        urlGambar: `/api/gambar/${idCache}`,
        fotografer: gambar.fotografer
      }
    });
  } catch (kesalahan) {
    console.error('❌ Kesalahan ambil gambar:', kesalahan.message);
    res.status(500).json({
      sukses: false,
      pesan: 'Gagal mengambil gambar'
    });
  }
});

/**
 * RUTE: GET /api/gambar/:idCache
 * Deskripsi: Serve cached image file
 */
aplikasi.get('/api/gambar/:idCache', (req, res) => {
  try {
    const { idCache } = req.params;
    const dataGambar = simpananGambar.get(idCache);

    if (!dataGambar) {
      console.error(`❌ Gambar tidak ditemukan: ${idCache}`);
      return res.status(404).json({
        sukses: false,
        pesan: 'Gambar tidak ditemukan'
      });
    }

    console.log(`📤 Serve gambar: ${idCache}, ukuran: ${dataGambar.length} bytes`);

    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=3600');
    res.set('Access-Control-Allow-Origin', '*');

    res.send(dataGambar);
  } catch (kesalahan) {
    console.error('❌ Kesalahan serve gambar:', kesalahan.message);
    res.status(500).json({
      sukses: false,
      pesan: 'Gagal serve gambar'
    });
  }
});

/**
 * RUTE: POST /api/simpan-skor
 * Deskripsi: Simpan skor permainan ke database
 * Body: {sesiId, tingkatKesulitan, skor, waktuDetik}
 */
aplikasi.post('/api/simpan-skor', async (req, res) => {
  try {
    const { sesiId, tingkatKesulitan, skor, waktuDetik } = req.body;

    console.log('\n📊 === SIMPAN SKOR ===');
    console.log(`Skor: ${skor} | Kesulitan: ${tingkatKesulitan} | Waktu: ${waktuDetik}s`);

    // Verifikasi sesi
    const sesi = verifikasiSesi(sesiId);
    if (!sesi) {
      return res.status(401).json({
        sukses: false,
        pesan: 'Sesi tidak valid'
      });
    }

    // Insert skor
    const { error: kesalahanInsert } = await databaseSupabase
      .from('skor_permainan')
      .insert([{
        id_pengguna: sesi.id,
        skor,
        tingkat_kesulitan: tingkatKesulitan,
        waktu_detik: waktuDetik,
        tanggal: new Date().toISOString()
      }]);

    if (kesalahanInsert) {
      console.error('❌ Kesalahan insert skor:', kesalahanInsert.message);
      return res.status(500).json({
        sukses: false,
        pesan: 'Gagal simpan skor'
      });
    }

    // Update total skor
    const { data: skorSekarang } = await databaseSupabase
      .from('skor_permainan')
      .select('skor')
      .eq('id_pengguna', sesi.id);

    const totalSkor = skorSekarang.reduce((sum, item) => sum + item.skor, 0);

    await databaseSupabase
      .from('pengguna')
      .update({ total_skor: totalSkor })
      .eq('id', sesi.id);

    console.log(`✅ Skor disimpan. Total: ${totalSkor}`);

    res.json({
      sukses: true,
      pesan: 'Skor berhasil disimpan'
    });
  } catch (kesalahan) {
    console.error('❌ Kesalahan simpan skor:', kesalahan);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan server'
    });
  }
});

/**
 * RUTE: GET /api/papan-peringkat
 * Deskripsi: Ambil semua game yang dimainkan diurutkan dari skor tertinggi ke terendah
 * Pengurutan: Berdasarkan skor DESC, kemudian waktu DESC
 */
aplikasi.get('/api/papan-peringkat', async (req, res) => {
  try {
    console.log('\n🏆 === AMBIL PAPAN PERINGKAT (SEMUA GAME) ===');

    // Query untuk mendapatkan SEMUA record game dari skor_permainan beserta nama pemain
    const { data: semuaGame, error: kesalahan } = await databaseSupabase
      .from('skor_permainan')
      .select(`
        id,
        skor,
        waktu_detik,
        tingkat_kesulitan,
        tanggal,
        ukuran_grid,
        pengguna(id, nama, email)
      `)
      .order('skor', { ascending: false });

    if (kesalahan) {
      console.error('❌ Kesalahan ambil peringkat:', kesalahan.message);
      return res.status(500).json({
        sukses: false,
        pesan: 'Gagal ambil peringkat'
      });
    }

    // Process data untuk format yang lebih rapi
    const peringkatProsesed = semuaGame.map((game, index) => {
      return {
        rank: index + 1,
        nama_pemain: game.pengguna?.nama || 'Unknown',
        email_pemain: game.pengguna?.email || '-',
        skor: game.skor,
        waktu_detik: game.waktu_detik,
        tingkat_kesulitan: game.tingkat_kesulitan,
        ukuran_grid: game.ukuran_grid,
        tanggal: game.tanggal
      };
    });

    console.log(`✅ Peringkat diambil: ${peringkatProsesed.length} game`);

    res.json({
      sukses: true,
      pesan: 'Peringkat berhasil diambil',
      data: peringkatProsesed
    });
  } catch (kesalahan) {
    console.error('❌ Kesalahan papan peringkat:', kesalahan);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan server'
    });
  }
});

// ================================================================
// 13. START SERVER
// ================================================================
const PORT = konfigurasi.PORT;

server.listen(PORT, () => {
  console.log('\n==================================================');
  console.log('🧩 PROGRAM PERMAINAN PUZZLE INTERAKTIF');
  console.log('==================================================');
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
  console.log(`📊 Database: Supabase`);
  console.log(`🖼️  API Gambar: Pexels`);
  console.log(`📧 Email: Nodemailer`);
  console.log(`🔌 Real-time: Socket.IO`);
  console.log('==================================================\n');
});

module.exports = { aplikasi, io };
