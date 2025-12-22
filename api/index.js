/**
 * Vercel Serverless Function Handler
 * File ini menjalankan aplikasi Express sebagai serverless function
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const nodemailer = require('nodemailer');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

// ================================================================
// INISIALISASI APLIKASI
// ================================================================
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Environment Variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'gmail';
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

// Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Email Transporter
const transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD
  }
});

// ================================================================
// ROUTES (Copy dari server.js)
// ================================================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// ================================================================
// MAIN APP ROUTES
// ================================================================

// Homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/../public/index.html');
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        sukses: false,
        pesan: 'Email dan password harus diisi'
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        sukses: false,
        pesan: error.message
      });
    }

    res.json({
      sukses: true,
      pesan: 'Login berhasil',
      data: {
        user: data.user,
        session: data.session
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan server'
    });
  }
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({
        sukses: false,
        pesan: 'Email, password, dan username harus diisi'
      });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username
        }
      }
    });

    if (error) {
      return res.status(400).json({
        sukses: false,
        pesan: error.message
      });
    }

    // Kirim email konfirmasi
    try {
      await transporter.sendMail({
        from: konfigurasi.EMAIL_USER,
        to: email,
        subject: 'Selamat datang di Game Puzzle!',
        html: `
          <h2>Selamat datang, ${username}!</h2>
          <p>Terima kasih telah mendaftar. Silakan verifikasi email Anda untuk melanjutkan.</p>
        `
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);
    }

    res.status(201).json({
      sukses: true,
      pesan: 'Registrasi berhasil. Silakan cek email Anda untuk verifikasi.',
      data: data.user
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan server'
    });
  }
});

// Get gambar dari Pexels
app.get('/api/gambar', async (req, res) => {
  try {
    const { page = 1, per_page = 1 } = req.query;

    const response = await axios.get('https://api.pexels.com/v1/curated', {
      headers: {
        'Authorization': PEXELS_API_KEY
      },
      params: {
        page: parseInt(page),
        per_page: parseInt(per_page)
      }
    });

    const photos = response.data.photos;

    if (photos.length === 0) {
      return res.status(404).json({
        sukses: false,
        pesan: 'Tidak ada foto tersedia'
      });
    }

    res.json({
      sukses: true,
      pesan: 'Foto berhasil diambil',
      data: photos[0]
    });
  } catch (err) {
    console.error('Fetch image error:', err.message);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan saat mengambil gambar'
    });
  }
});

// Download dan potong gambar
app.post('/api/potong-gambar', async (req, res) => {
  try {
    const { url, rows, cols } = req.body;

    if (!url || !rows || !cols) {
      return res.status(400).json({
        sukses: false,
        pesan: 'URL, rows, dan cols harus diisi'
      });
    }

    const imageResponse = await axios({
      method: 'get',
      url: url,
      responseType: 'arraybuffer'
    });

    const metadata = await sharp(imageResponse.data).metadata();
    const { width, height } = metadata;

    const tileWidth = Math.floor(width / cols);
    const tileHeight = Math.floor(height / rows);

    const tiles = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tile = await sharp(imageResponse.data)
          .extract({
            left: col * tileWidth,
            top: row * tileHeight,
            width: tileWidth,
            height: tileHeight
          })
          .toBuffer();

        tiles.push({
          id: row * cols + col,
          row,
          col,
          data: tile.toString('base64')
        });
      }
    }

    res.json({
      sukses: true,
      pesan: 'Gambar berhasil dipotong',
      data: {
        tiles: tiles,
        rows: rows,
        cols: cols
      }
    });
  } catch (err) {
    console.error('Cut image error:', err.message);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan saat memproses gambar'
    });
  }
});

// Simpan score
app.post('/api/simpan-score', async (req, res) => {
  try {
    const { user_id, username, score, waktu_mainkan, kesulitan } = req.body;

    if (!user_id || !username || score === undefined) {
      return res.status(400).json({
        sukses: false,
        pesan: 'Data tidak lengkap'
      });
    }

    const { data, error } = await supabase
      .from('scores')
      .insert([
        {
          user_id,
          username,
          score,
          waktu_mainkan,
          kesulitan,
          created_at: new Date()
        }
      ]);

    if (error) {
      return res.status(400).json({
        sukses: false,
        pesan: error.message
      });
    }

    res.json({
      sukses: true,
      pesan: 'Score berhasil disimpan',
      data
    });
  } catch (err) {
    console.error('Save score error:', err);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan server'
    });
  }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { kesulitan = 'normal', limit = 10 } = req.query;

    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('kesulitan', kesulitan)
      .order('score', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      return res.status(400).json({
        sukses: false,
        pesan: error.message
      });
    }

    res.json({
      sukses: true,
      pesan: 'Leaderboard berhasil diambil',
      data
    });
  } catch (err) {
    console.error('Get leaderboard error:', err);
    res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan server'
    });
  }
});

// Default error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    sukses: false,
    pesan: 'Terjadi kesalahan server'
  });
});

module.exports = app;
