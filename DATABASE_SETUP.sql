/**
 * ================================================================
 * DATABASE_SETUP.sql
 * ================================================================
 * 
 * Deskripsi:
 * Script SQL untuk setup database Supabase
 * Buat 2 table utama: pengguna dan skor_permainan
 * 
 * Jalankan script ini di Supabase SQL Editor:
 * 1. Buka https://app.supabase.com
 * 2. Pilih project
 * 3. Buka "SQL Editor"
 * 4. Klik "New Query"
 * 5. Copy-paste seluruh script ini
 * 6. Klik "Run"
 * 
 * ================================================================
 */

-- ================================================================
-- 1. CREATE TABLE: pengguna
-- ================================================================
-- Deskripsi: Tabel untuk menyimpan data user
-- Kolom:
--   - id: Primary key auto-increment
--   - nama: Nama lengkap user
--   - email: Email unik user (unique constraint)
--   - password: Password user (dalam prod, harus di-hash!)
--   - total_skor: Total skor akumulatif user
--   - tanggal_daftar: Timestamp ketika user daftar
--   - terakhir_login: Timestamp login terakhir

CREATE TABLE IF NOT EXISTS pengguna (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nama VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  total_skor INTEGER DEFAULT 0,
  tanggal_daftar TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  terakhir_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- 2. CREATE INDEX: pengguna (email)
-- ================================================================
-- Deskripsi: Index untuk mempercepat query by email
CREATE INDEX idx_pengguna_email ON pengguna(email);

-- ================================================================
-- 3. CREATE TABLE: skor_permainan
-- ================================================================
-- Deskripsi: Tabel untuk menyimpan setiap skor permainan user
-- Kolom:
--   - id: Primary key auto-increment
--   - id_pengguna: Foreign key ke tabel pengguna
--   - skor: Skor yang diperoleh
--   - tingkat_kesulitan: Level kesulitan (mudah, sedang, sulit, custom)
--   - waktu_detik: Berapa lama permainan (dalam detik)
--   - tanggal: Timestamp permainan
--   - ukuran_grid: Ukuran grid yang dimainkan (3, 4, 5, atau 2-8 untuk custom)

CREATE TABLE IF NOT EXISTS skor_permainan (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  id_pengguna BIGINT NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
  skor INTEGER NOT NULL DEFAULT 0,
  tingkat_kesulitan VARCHAR(50) NOT NULL,
  waktu_detik INTEGER NOT NULL DEFAULT 0,
  ukuran_grid INTEGER DEFAULT 3,
  tanggal TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- 4. CREATE INDEX: skor_permainan (id_pengguna, tanggal)
-- ================================================================
-- Deskripsi: Index untuk mempercepat query history user
CREATE INDEX idx_skor_id_pengguna ON skor_permainan(id_pengguna);
CREATE INDEX idx_skor_tanggal ON skor_permainan(tanggal DESC);

-- ================================================================
-- 5. CREATE VIEW: papan_peringkat_top10
-- ================================================================
-- Deskripsi: View untuk menampilkan top 10 pemain dengan skor tertinggi
CREATE OR REPLACE VIEW papan_peringkat_top10 AS
SELECT 
  p.id,
  p.nama,
  p.email,
  p.total_skor,
  COUNT(sp.id) as jumlah_permainan,
  AVG(sp.waktu_detik) as rata_rata_waktu,
  p.terakhir_login
FROM pengguna p
LEFT JOIN skor_permainan sp ON p.id = sp.id_pengguna
GROUP BY p.id, p.nama, p.email, p.total_skor, p.terakhir_login
ORDER BY p.total_skor DESC
LIMIT 10;

-- ================================================================
-- 6. CREATE VIEW: statistik_user
-- ================================================================
-- Deskripsi: View untuk statistik per user
CREATE OR REPLACE VIEW statistik_user AS
SELECT 
  p.id,
  p.nama,
  p.email,
  p.total_skor,
  COUNT(sp.id) as jumlah_permainan,
  AVG(sp.skor) as rata_rata_skor,
  MAX(sp.skor) as skor_tertinggi,
  AVG(sp.waktu_detik) as rata_rata_waktu
FROM pengguna p
LEFT JOIN skor_permainan sp ON p.id = sp.id_pengguna
GROUP BY p.id, p.nama, p.email, p.total_skor;

-- ================================================================
-- 7. CREATE VIEW: statistik_difficulty
-- ================================================================
-- Deskripsi: View untuk statistik permainan per level kesulitan
CREATE OR REPLACE VIEW statistik_difficulty AS
SELECT 
  tingkat_kesulitan,
  COUNT(id) as jumlah_permainan,
  AVG(skor) as rata_rata_skor,
  MAX(skor) as skor_tertinggi,
  MIN(skor) as skor_terendah,
  AVG(waktu_detik) as rata_rata_waktu
FROM skor_permainan
GROUP BY tingkat_kesulitan;

-- ================================================================
-- 8. SAMPLE DATA (OPTIONAL)
-- ================================================================
-- Uncomment untuk insert sample data untuk testing

-- INSERT INTO pengguna (nama, email, password, total_skor) VALUES
-- ('Ahmad Rahman', 'ahmad@example.com', 'password123', 450),
-- ('Siti Nurhaliza', 'siti@example.com', 'password123', 380),
-- ('Budi Santoso', 'budi@example.com', 'password123', 520);

-- INSERT INTO skor_permainan (id_pengguna, skor, tingkat_kesulitan, waktu_detik, ukuran_grid) VALUES
-- (1, 150, 'mudah', 120, 3),
-- (1, 200, 'sedang', 180, 4),
-- (1, 100, 'sulit', 240, 5),
-- (2, 120, 'mudah', 100, 3),
-- (2, 180, 'sedang', 200, 4),
-- (3, 200, 'mudah', 110, 3),
-- (3, 220, 'sedang', 190, 4),
-- (3, 100, 'sulit', 260, 5);

-- ================================================================
-- 9. ENABLE ROW LEVEL SECURITY (RECOMMENDED)
-- ================================================================
-- Uncomment untuk enable RLS (untuk production)

-- ALTER TABLE pengguna ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE skor_permainan ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view their own data"
-- ON pengguna FOR SELECT
-- USING (true);

-- CREATE POLICY "Users can update their own data"
-- ON pengguna FOR UPDATE
-- USING (true);

-- ================================================================
-- 10. QUERIES USEFUL
-- ================================================================

-- Query 1: Ambil semua user
-- SELECT * FROM pengguna;

-- Query 2: Ambil top 10 pemain
-- SELECT * FROM papan_peringkat_top10;

-- Query 3: Ambil semua skor user tertentu
-- SELECT * FROM skor_permainan WHERE id_pengguna = 1 ORDER BY tanggal DESC;

-- Query 4: Ambil statistik user
-- SELECT * FROM statistik_user;

-- Query 5: Ambil statistik per difficulty
-- SELECT * FROM statistik_difficulty;

-- Query 6: Update total skor user
-- UPDATE pengguna SET total_skor = (
--   SELECT COALESCE(SUM(skor), 0) FROM skor_permainan WHERE id_pengguna = pengguna.id
-- );

-- ================================================================
-- END OF DATABASE SETUP
-- ================================================================

