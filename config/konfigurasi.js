/**
 * ================================================================
 * FILE: konfigurasi.js
 * ================================================================
 * 
 * Deskripsi:
 * File konfigurasi terpusat untuk aplikasi puzzle interaktif.
 * Mengelola environment variables, validasi, dan konstanta aplikasi.
 * 
 * ================================================================
 */

// ================================================================
// VALIDASI ENVIRONMENT VARIABLES
// ================================================================

const variabelWajib = [
  'PORT',
  'SUPABASE_URL',
  'SUPABASE_KEY',
  'PEXELS_API_KEY',
  'EMAIL_SERVICE',
  'EMAIL_PENGIRIM',
  'EMAIL_PASSWORD'
];

// Validasi semua variabel wajib tersedia
for (const varName of variabelWajib) {
  if (!process.env[varName]) {
    console.error(`❌ Error: Environment variable ${varName} tidak ditemukan!`);
    process.exit(1);
  }
}

console.log('✅ Semua environment variables tervalidasi');

// ================================================================
// KONFIGURASI APLIKASI
// ================================================================

const konfigurasi = {
  // Server
  PORT: process.env.PORT || 3000,
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  
  // Database - Supabase
  SUPABASE: {
    URL: process.env.SUPABASE_URL,
    KEY: process.env.SUPABASE_KEY
  },
  
  // API Eksternal - Pexels
  PEXELS: {
    API_KEY: process.env.PEXELS_API_KEY,
    BASE_URL: 'https://api.pexels.com/v1'
  },
  
  // Email - Nodemailer
  EMAIL: {
    SERVICE: process.env.EMAIL_SERVICE,
    PENGIRIM: process.env.EMAIL_PENGIRIM,
    PASSWORD: process.env.EMAIL_PASSWORD
  },
  
  // CORS Configuration
  CORS: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  
  // Game Constants
  GAME: {
    DIFFICULTY_LEVELS: {
      mudah: { ukuran: 3, nama: 'Mudah (3x3)' },
      sedang: { ukuran: 4, nama: 'Sedang (4x4)' },
      sulit: { ukuran: 5, nama: 'Sulit (5x5)' }
    },
    CUSTOM_MIN: 2,
    CUSTOM_MAX: 8,
    POINTS_PER_TILE: 10,
    CACHE_EXPIRY_MS: 30 * 60 * 1000 // 30 minutes
  }
};

module.exports = konfigurasi;
