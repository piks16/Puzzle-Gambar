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
let socket = null;

// ================================================================
// 1.5 SOCKET.IO SETUP
// ================================================================

/**
 * Fungsi: setupSocketIO
 * Deskripsi: Setup koneksi socket dan event listeners untuk real-time updates
 */
function setupSocketIO() {
  socket = io();

  // Koneksi berhasil
  socket.on('connect', () => {
    console.log('✅ Socket.IO terhubung');
    
    // Emit user login event
    const namaUser = localStorage.getItem('namaUser');
    const emailUser = localStorage.getItem('emailUser');
    if (namaUser && emailUser) {
      socket.emit('user-login', { nama: namaUser, email: emailUser });
    }
  });

  // Update jumlah user online
  socket.on('user-online-count', (data) => {
    const elemOnline = document.getElementById('online-count');
    if (elemOnline) {
      elemOnline.textContent = `👥 ${data.onlineCount} pemain online`;
    }
    console.log(`👥 Online: ${data.onlineCount} pemain`);
  });

  // Listen ke update leaderboard real-time
  socket.on('leaderboard-update', (data) => {
    console.log(`🎮 Leaderboard update: ${data.message}`);
    
    // Tampilkan notifikasi
    showGameCompletionNotification(data);
    
    // Auto-refresh leaderboard
    loadPapaanPreview();
    if (document.getElementById('isi-tabel-peringkat')) {
      loadLeaderboardLengkap();
    }
  });

  // Error koneksi
  socket.on('connect_error', (error) => {
    console.error('❌ Socket.IO error:', error);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('❌ Socket.IO terputus');
  });
}

/**
 * Fungsi: showGameCompletionNotification
 * Deskripsi: Tampilkan notifikasi ketika user lain selesai game
 */
function showGameCompletionNotification(data) {
  const notif = document.createElement('div');
  notif.className = 'notifikasi-game-completion';
  notif.innerHTML = `
    <div class="notif-content">
      <span class="notif-message">${data.message}</span>
    </div>
  `;
  
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.remove();
  }, 5000);
}

/**
 * Fungsi: emitSkorKeSocket
 * Deskripsi: Emit score ke server via socket
 */
function emitSkorKeSocket(data) {
  if (socket && socket.connected) {
    socket.emit('skor-disimpan', data);
    console.log('📨 Skor dikirim via socket');
  } else {
    console.warn('⚠️ Socket tidak terhubung');
  }
}

// ================================================================
// 1.6 REFRESH HANDLER
// ================================================================

/**
 * Event listener untuk mendeteksi refresh halaman
 * Menampilkan konfirmasi kepada user sebelum refresh
 */
window.addEventListener('beforeunload', (e) => {
  const sesiId = localStorage.getItem('sesiId');
  
  // Hanya tampilkan warning jika user sudah login (ada sesiId)
  if (sesiId) {
    const message = 'Anda akan kembali ke menu awal dan harus login ulang apakah mau melanjutkan?';
    e.preventDefault();
    e.returnValue = message;
    return message;
  }
});

/**
 * Event listener untuk menangani unload halaman
 * Jika user confirm refresh saat sedang login, hapus session
 */
window.addEventListener('unload', () => {
  const sesiId = localStorage.getItem('sesiId');
  
  // Jika ada sesiId saat unload, berarti user melanjutkan refresh
  // Hapus session data
  if (sesiId) {
    localStorage.removeItem('sesiId');
    localStorage.removeItem('namaUser');
    localStorage.removeItem('emailUser');
    console.log('🔓 Session dihapus karena refresh');
  }
});

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

  // Load leaderboard preview
  loadPapaanPreview();

  // Setup Socket.IO
  setupSocketIO();
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
      let html = `
        <div class="tabel-preview-peringkat">
          <div class="header-preview">
            <div class="kolom-preview rank">Rank</div>
            <div class="kolom-preview username">Username</div>
            <div class="kolom-preview point">Point</div>
            <div class="kolom-preview waktu">Waktu</div>
          </div>
      `;

      top5.forEach((game, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`;
        const waktuText = game.waktu_detik ? `${game.waktu_detik}s` : '-';
        html += `
          <div class="baris-preview">
            <div class="kolom-preview rank">${medal}</div>
            <div class="kolom-preview username">${game.nama_pemain}</div>
            <div class="kolom-preview point">${game.skor}</div>
            <div class="kolom-preview waktu">${waktuText}</div>
          </div>
        `;
      });

      html += '</div>';
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
 * Deskripsi: Load dan tampilkan semua game yang dimainkan diurutkan dari skor tertinggi
 */
async function loadLeaderboardLengkap() {
  try {
    const isiTabel = document.getElementById('isi-tabel-peringkat');
    if (!isiTabel) return;

    // Show loading
    isiTabel.innerHTML = '<tr><td colspan="6" class="loading">Memuat peringkat...</td></tr>';

    const response = await fetch(`${URL_API}/papan-peringkat`);
    const result = await response.json();

    if (result.sukses && result.data.length > 0) {
      let html = '';

      result.data.forEach((game) => {
        const tanggal = game.tanggal 
          ? new Date(game.tanggal).toLocaleDateString('id-ID', { 
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })
          : '-';
        
        const kesulitan = game.tingkat_kesulitan.charAt(0).toUpperCase() + game.tingkat_kesulitan.slice(1);

        html += `
          <tr>
            <td class="kolom-rank">${game.rank}</td>
            <td class="kolom-nama">${game.nama_pemain}</td>
            <td class="kolom-skor">${game.skor} pts</td>
            <td class="kolom-waktu">${game.waktu_detik}s</td>
            <td class="kolom-kesulitan">${kesulitan} (${game.ukuran_grid}x${game.ukuran_grid})</td>
            <td class="kolom-tanggal">${tanggal}</td>
          </tr>
        `;
      });

      isiTabel.innerHTML = html;
      console.log('✅ Leaderboard dimuat: ' + result.data.length + ' game');
    } else {
      isiTabel.innerHTML = '<tr><td colspan="6" class="kosong">Belum ada data game</td></tr>';
    }
  } catch (error) {
    console.error('❌ Error load leaderboard:', error);
    const isiTabel = document.getElementById('isi-tabel-peringkat');
    if (isiTabel) {
      isiTabel.innerHTML = '<tr><td colspan="6" class="kosong">Gagal memuat peringkat</td></tr>';
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
window.emitSkorKeSocket = emitSkorKeSocket;
window.setupSocketIO = setupSocketIO;
