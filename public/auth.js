/**
 * ================================================================
 * FILE: auth.js
 * ================================================================
 * 
 * Deskripsi:
 * Modul authentication untuk login/register user.
 * Menangani validasi form, submit ke server, dan session management.
 * 
 * ================================================================
 */

// ================================================================
// 1. INISIALISASI
// ================================================================

document.addEventListener('DOMContentLoaded', () => {
  inisialisasiAuthentikasi();
});

/**
 * Fungsi: mulaiDariIntro
 * Deskripsi: Navigasi dari halaman intro ke halaman authentikasi
 */
function mulaiDariIntro() {
  tampilkanHalaman('authentikasi');
  console.log('📖 Navigasi dari intro ke authentikasi');
}

/**
 * Fungsi: kembaliKeIntro
 * Deskripsi: Navigasi kembali dari halaman authentikasi ke halaman intro
 */
function kembaliKeIntro() {
  tampilkanHalaman('intro');
  console.log('📖 Kembali ke halaman intro');
}

function inisialisasiAuthentikasi() {
  console.log('🔐 Menginisialisasi modul authentikasi...');

  // Setup tab navigation
  setupTabNavigation();

  // Setup form submissions
  const formLogin = document.getElementById('form-login');
  const formDaftar = document.getElementById('form-daftar');

  if (formLogin) {
    formLogin.addEventListener('submit', handleLoginSubmit);
  }

  if (formDaftar) {
    formDaftar.addEventListener('submit', handleDaftarSubmit);
  }

  // Check jika sudah ada session
  cekSesiAda();
}

// ================================================================
// 2. TAB NAVIGATION
// ================================================================

function setupTabNavigation() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const formLogin = document.getElementById('form-login');
  const formDaftar = document.getElementById('form-daftar');

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      // Remove active dari semua tab
      tabButtons.forEach((b) => b.classList.remove('aktif'));
      btn.classList.add('aktif');

      const tabName = btn.dataset.tab;

      if (tabName === 'login') {
        formLogin.classList.remove('tersembunyi');
        formDaftar.classList.add('tersembunyi');
      } else if (tabName === 'daftar') {
        formDaftar.classList.remove('tersembunyi');
        formLogin.classList.add('tersembunyi');
      }
    });
  });
}

// ================================================================
// 3. LOGIN HANDLER
// ================================================================

async function handleLoginSubmit(e) {
  e.preventDefault();

  const email = document.getElementById('email-login').value.trim();
  const password = document.getElementById('password-login').value;
  const pesanLogin = document.getElementById('pesan-login');

  // Validasi
  if (!email || !password) {
    tampilkanPesan(pesanLogin, '❌ Email dan password harus diisi', 'error');
    return;
  }

  try {
    console.log('🔐 Mengirim request login...');
    pesanLogin.innerHTML = '⏳ Memproses...';

    const response = await fetch(`${URL_API}/masuk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!data.sukses) {
      tampilkanPesan(pesanLogin, `❌ ${data.pesan}`, 'error');
      return;
    }

    console.log('✅ Login berhasil!');
    tampilkanPesan(pesanLogin, '✅ Login berhasil! Redirect...', 'success');

    // Simpan session
    localStorage.setItem('sesiId', data.data.sesiId);
    localStorage.setItem('namaUser', data.data.nama);
    localStorage.setItem('emailUser', data.data.email);

    // Redirect ke menu
    setTimeout(() => {
      tampilkanHalamanMenu();
    }, 1000);
  } catch (error) {
    console.error('❌ Error login:', error);
    tampilkanPesan(pesanLogin, '❌ Terjadi kesalahan. Coba lagi.', 'error');
  }
}

// ================================================================
// 4. REGISTER HANDLER
// ================================================================

async function handleDaftarSubmit(e) {
  e.preventDefault();

  const nama = document.getElementById('nama-daftar').value.trim();
  const email = document.getElementById('email-daftar').value.trim();
  const password = document.getElementById('password-daftar').value;
  const pesanDaftar = document.getElementById('pesan-daftar');

  // Validasi
  if (!nama || !email || !password) {
    tampilkanPesan(pesanDaftar, '❌ Semua field harus diisi', 'error');
    return;
  }

  if (password.length < 6) {
    tampilkanPesan(pesanDaftar, '❌ Password minimal 6 karakter', 'error');
    return;
  }

  if (!validasiEmail(email)) {
    tampilkanPesan(pesanDaftar, '❌ Format email tidak valid', 'error');
    return;
  }

  try {
    console.log('🔐 Mengirim request daftar...');
    pesanDaftar.innerHTML = '⏳ Memproses...';

    const response = await fetch(`${URL_API}/daftar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama, email, password })
    });

    const data = await response.json();

    if (!data.sukses) {
      tampilkanPesan(pesanDaftar, `❌ ${data.pesan}`, 'error');
      return;
    }

    console.log('✅ Daftar berhasil!');
    tampilkanPesan(pesanDaftar, '✅ Daftar berhasil! Silakan login.', 'success');

    // Clear form
    document.getElementById('form-daftar').reset();

    // Switch ke tab login
    setTimeout(() => {
      document.querySelector('[data-tab="login"]').click();
    }, 1500);
  } catch (error) {
    console.error('❌ Error daftar:', error);
    tampilkanPesan(pesanDaftar, '❌ Terjadi kesalahan. Coba lagi.', 'error');
  }
}

// ================================================================
// 5. UTILITY FUNCTIONS
// ================================================================

function validasiEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function tampilkanPesan(element, pesan, tipe = 'info') {
  element.textContent = pesan;
  element.className = `pesan ${tipe}`;
}

function cekSesiAda() {
  const sesiId = localStorage.getItem('sesiId');
  if (sesiId) {
    console.log('✅ Session ditemukan, redirect ke menu...');
    tampilkanHalamanMenu();
  } else {
    console.log('❌ Tidak ada session, tampilkan halaman intro...');
    // Jika tidak ada sesi, tampilkan halaman intro
    // Ini terjadi saat pertama kali membuka atau setelah refresh/logout
    tampilkanHalaman('intro');
  }
}

function tampilkanHalamanMenu() {
  tampilkanHalaman('menu');

  const namaUser = localStorage.getItem('namaUser');
  const elemen = document.getElementById('nama-pengguna');
  if (elemen) elemen.textContent = `👤 ${namaUser}`;

  // Load leaderboard preview
  loadPapaanPreview();
}
