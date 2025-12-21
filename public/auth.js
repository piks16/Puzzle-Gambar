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

    // Tampilkan notifikasi modal
    buatNotifikasi('🎉 Selamat!', `Pendaftaran berhasil, ${nama}!\nEmail konfirmasi telah dikirim ke ${email}\nSilakan login untuk memulai bermain.`, 'success');

    // Clear form
    document.getElementById('form-daftar').reset();

    // Switch ke tab login
    setTimeout(() => {
      document.querySelector('[data-tab="login"]').click();
    }, 2000);
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

// ================================================================
// 6. NOTIFIKASI MODAL
// ================================================================

function buatNotifikasi(judul, pesan, tipe = 'info') {
  // Buat container modal jika belum ada
  let modal = document.getElementById('modal-notifikasi');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-notifikasi';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
    `;
    document.body.appendChild(modal);
  }

  // Buat konten notifikasi
  const konten = document.createElement('div');
  konten.style.cssText = `
    background: white;
    padding: 2rem;
    border-radius: 12px;
    text-align: center;
    max-width: 400px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease-out;
  `;

  let warna = '#10b981'; // success - hijau
  if (tipe === 'error') warna = '#ef4444'; // merah
  if (tipe === 'warning') warna = '#f59e0b'; // orange
  if (tipe === 'info') warna = '#6366f1'; // biru

  konten.innerHTML = `
    <div style="color: ${warna}; font-size: 2.5rem; margin-bottom: 1rem;">
      ${tipe === 'success' ? '✅' : tipe === 'error' ? '❌' : tipe === 'warning' ? '⚠️' : 'ℹ️'}
    </div>
    <h3 style="color: #1f2937; margin-bottom: 0.5rem; font-size: 1.5rem;">${judul}</h3>
    <p style="color: #6b7280; line-height: 1.6; margin-bottom: 1.5rem;">${pesan.replace(/\n/g, '<br>')}</p>
    <button onclick="tutupNotifikasi()" style="
      background: ${warna};
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.3s;
    " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
      Lanjutkan
    </button>
  `;

  modal.innerHTML = '';
  modal.appendChild(konten);
  modal.style.opacity = '1';
  modal.style.pointerEvents = 'auto';
}

function tutupNotifikasi() {
  const modal = document.getElementById('modal-notifikasi');
  if (modal) {
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
  }
}

// Tambahkan style animasi
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes slideUp {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;
if (document.head) {
  document.head.appendChild(styleSheet);
}
