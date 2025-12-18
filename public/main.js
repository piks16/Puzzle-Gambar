/**
 * ================================================================
 * FILE: main.js
 * ================================================================
 * 
 * Deskripsi:
 * File utama untuk inisialisasi aplikasi, setup global variables,
 * dan event listeners.
 * 
 * ================================================================
 */

// ================================================================
// 1. GLOBAL VARIABLES & CONSTANTS
// ================================================================

const URL_API = '/api';

// ================================================================
// 2. PAGE VISIBILITY TOGGLE
// ================================================================

function tampilkanHalaman(namaHalaman) {
  // Hide all pages
  const semuaHalaman = document.querySelectorAll('.halaman');
  semuaHalaman.forEach((halaman) => {
    halaman.classList.remove('aktif');
  });

  // Show target page
  const halaman = document.getElementById(`halaman-${namaHalaman}`);
  if (halaman) {
    halaman.classList.add('aktif');
  }
}

function tampilkanHalamanPermainan() {
  console.log('📄 Menampilkan halaman permainan...');
  tampilkanHalaman('permainan');
}

function tampilkanHalamanMenu() {
  console.log('📄 Menampilkan halaman menu...');
  tampilkanHalaman('menu');

  const namaUser = localStorage.getItem('namaUser');
  const elemen = document.getElementById('nama-pengguna');
  if (elemen) elemen.textContent = `👤 ${namaUser}`;

  // Load leaderboard preview
  loadPapaanPreview();
}

// ================================================================
// 3. LOGOUT HANDLER
// ================================================================

document.addEventListener('DOMContentLoaded', () => {
  const tombolLogout = document.getElementById('tombol-logout');
  if (tombolLogout) {
    tombolLogout.addEventListener('click', handleLogout);
  }

  const tombolLogoutLB = document.getElementById('tombol-logout-lb');
  if (tombolLogoutLB) {
    tombolLogoutLB.addEventListener('click', handleLogout);
  }

  const tombolKeMenu = document.getElementById('tombol-ke-menu');
  if (tombolKeMenu) {
    tombolKeMenu.addEventListener('click', () => {
      tampilkanHalamanMenu();
    });
  }

  // Setup keyboard shortcuts
  setupKeyboardShortcuts();

  // Load leaderboard preview saat menu dimuat
  loadPapaanPreview();
});

async function handleLogout() {
  try {
    const sesiId = localStorage.getItem('sesiId');

    if (sesiId) {
      await fetch(`${URL_API}/keluar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sesiId })
      });
    }

    // Clear localStorage
    localStorage.removeItem('sesiId');
    localStorage.removeItem('namaUser');
    localStorage.removeItem('emailUser');

    console.log('✅ Logout berhasil');

    // Redirect ke login
    tampilkanHalaman('authentikasi');
  } catch (error) {
    console.error('❌ Error logout:', error);
  }
}

// ================================================================
// 4. KEYBOARD SHORTCUTS
// ================================================================

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // H = Hint
    if (e.key === 'h' || e.key === 'H') {
      if (window.berikukanHint) window.berikukanHint();
    }
    // R = Reset
    if (e.key === 'r' || e.key === 'R') {
      if (window.resetPermainan) window.resetPermainan();
    }
    // ESC = Back to menu
    if (e.key === 'Escape') {
      if (window.kembaliKeMenu) window.kembaliKeMenu();
    }
  });
}

// ================================================================
// 5. UTILITY FUNCTIONS
// ================================================================

function formatWaktu(detik) {
  const menit = Math.floor(detik / 60);
  const sisa = detik % 60;
  return `${menit.toString().padStart(2, '0')}:${sisa.toString().padStart(2, '0')}`;
}

function kembaliKeMenu() {
  if (window.stopTimer) window.stopTimer();
  tampilkanHalamanMenu();
}

// ================================================================
// 6. LEADERBOARD FUNCTIONS
// ================================================================

/**
 * Fungsi: loadPapaanPreview
 * Deskripsi: Load dan tampilkan top 5 pemain di menu
 */
async function loadPapaanPreview() {
  try {
    const response = await fetch(`${URL_API}/papan-peringkat`);
    const result = await response.json();

    if (result.sukses && result.data.length > 0) {
      const preview = document.getElementById('papan-preview');
      if (!preview) return;

      const top5 = result.data.slice(0, 5);
      let html = '<ol class="daftar-peringkat">';

      top5.forEach((pemain, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        html += `
          <li class="item-peringkat">
            <span class="medal">${medal}</span>
            <span class="nama">${pemain.nama}</span>
            <span class="skor">${pemain.total_skor} pts</span>
          </li>
        `;
      });

      html += '</ol>';
      preview.innerHTML = html;
    } else {
      const preview = document.getElementById('papan-preview');
      if (preview) {
        preview.innerHTML = '<p class="kosong">Belum ada data pemain</p>';
      }
    }
  } catch (error) {
    console.error('❌ Error load papan preview:', error);
    const preview = document.getElementById('papan-preview');
    if (preview) {
      preview.innerHTML = '<p class="kosong">Gagal memuat peringkat</p>';
    }
  }
}

/**
 * Fungsi: bukaHalamanLeaderboard
 * Deskripsi: Buka halaman leaderboard lengkap
 */
function bukaHalamanLeaderboard() {
  console.log('📄 Membuka halaman leaderboard...');
  tampilkanHalaman('leaderboard');

  const namaUser = localStorage.getItem('namaUser');
  const elemen = document.getElementById('nama-pengguna-lb');
  if (elemen) elemen.textContent = `👤 ${namaUser}`;

  loadLeaderboardLengkap();
}

/**
 * Fungsi: loadLeaderboardLengkap
 * Deskripsi: Load dan tampilkan top 10 pemain di tabel
 */
async function loadLeaderboardLengkap() {
  try {
    const isiTabel = document.getElementById('isi-tabel-peringkat');
    if (!isiTabel) return;

    // Show loading
    isiTabel.innerHTML = '<tr><td colspan="5" class="loading">Memuat peringkat...</td></tr>';

    const response = await fetch(`${URL_API}/papan-peringkat`);
    const result = await response.json();

    if (result.sukses && result.data.length > 0) {
      let html = '';

      result.data.forEach((pemain, index) => {
        const tglLogin = pemain.terakhir_login 
          ? new Date(pemain.terakhir_login).toLocaleDateString('id-ID')
          : 'Belum login';

        html += `
          <tr>
            <td class="kolom-rank">${index + 1}</td>
            <td class="kolom-nama">${pemain.nama}</td>
            <td class="kolom-skor">${pemain.total_skor} pts</td>
            <td class="kolom-email">${pemain.email}</td>
            <td class="kolom-login">${tglLogin}</td>
          </tr>
        `;
      });

      isiTabel.innerHTML = html;
      console.log('✅ Leaderboard dimuat: ' + result.data.length + ' pemain');
    } else {
      isiTabel.innerHTML = '<tr><td colspan="5" class="kosong">Belum ada data pemain</td></tr>';
    }
  } catch (error) {
    console.error('❌ Error load leaderboard:', error);
    const isiTabel = document.getElementById('isi-tabel-peringkat');
    if (isiTabel) {
      isiTabel.innerHTML = '<tr><td colspan="5" class="kosong">Gagal memuat peringkat</td></tr>';
    }
  }
}

// Export untuk digunakan di file lain
window.tampilkanHalamanPermainan = tampilkanHalamanPermainan;
window.tampilhanHalamanMenu = tampilhanHalamanMenu;
window.kembaliKeMenu = kembaliKeMenu;
window.formatWaktu = formatWaktu;
window.bukaHalamanLeaderboard = bukaHalamanLeaderboard;
window.loadLeaderboardLengkap = loadLeaderboardLengkap;
window.loadPapaanPreview = loadPapaanPreview;
