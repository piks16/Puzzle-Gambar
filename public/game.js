/**
 * ================================================================
 * FILE: permainan.js
 * ================================================================
 * 
 * Deskripsi:
 * Modul game engine untuk sistem permainan puzzle interaktif.
 * Mencakup logic pembuatan puzzle, drag-and-drop tiles, scoring,
 * timer, dan completion detection.
 * 
 * Fitur Utama:
 * - Generate puzzle dari gambar
 * - Potong gambar menjadi tiles dengan positioning yang benar
 * - Drag-and-drop tiles ke slot papan
 * - Real-time scoring dan timer
 * - Hint system (menunjukkan slot kosong random)
 * - Reset game untuk shuffle ulang
 * 
 * ================================================================
 */

// ================================================================
// 1. VARIABEL GLOBAL GAME STATE
// ================================================================

/**
 * Objek untuk menyimpan state permainan
 * @type {Object}
 */
const stateGame = {
  sedangBermain: false,
  idGambar: null,
  idCache: null,
  urlGambar: null,
  ukuranGrid: 3,
  skor: 0,
  waktuDetik: 0,
  timerInterval: null,
  tiles: [], // Array berisi data tile (id, posisi, background-position, background-size)
  layoutSlot: [], // Array berisi info slot yang terisi atau kosong
  fotografer: null,
  tingkatKesulitan: 'mudah'
};

// ================================================================
// 2. INISIALISASI EVENT LISTENERS
// ================================================================

document.addEventListener('DOMContentLoaded', () => {
  inisialisasiPermainan();
});

/**
 * Fungsi: inisialisasiPermainan
 * Deskripsi: Setup event listener untuk menu kontrol game
 */
function inisialisasiPermainan() {
  console.log('🎮 Menginisialisasi modul permainan...');

  // Setup custom size slider
  const sliderUkuran = document.getElementById('ukuran-custom');
  sliderUkuran.addEventListener('input', (e) => {
    const nilai = e.target.value;
    document.getElementById('nilai-ukuran').textContent = `${nilai}x${nilai}`;
  });
}

// ================================================================
// 3. MEMULAI PERMAINAN
// ================================================================

/**
 * Fungsi: mulaiPermainan
 * Deskripsi: Mulai permainan dengan preset difficulty
 * Parameter: kesulitan (String), ukuran (Number)
 */
async function mulaiPermainan(kesulitan, ukuran) {
  console.log(`\n🎮 === MEMULAI PERMAINAN ===`);
  console.log(`Kesulitan: ${kesulitan}, Ukuran: ${ukuran}x${ukuran}`);

  stateGame.tingkatKesulitan = kesulitan;
  stateGame.ukuranGrid = ukuran;

  await muatGambarDanMulai();
}

/**
 * Fungsi: mulaiPermainanCustom
 * Deskripsi: Mulai permainan dengan custom difficulty
 */
async function mulaiPermainanCustom() {
  const ukuran = parseInt(document.getElementById('ukuran-custom').value);
  console.log(`\n🎮 === MEMULAI PERMAINAN CUSTOM ===`);
  console.log(`Ukuran: ${ukuran}x${ukuran}`);

  stateGame.tingkatKesulitan = 'custom';
  stateGame.ukuranGrid = ukuran;

  await muatGambarDanMulai();
}

/**
 * Fungsi: muatGambarDanMulai
 * Deskripsi: Fetch gambar dari server dan inisialisasi game
 */
async function muatGambarDanMulai() {
  try {
    console.log('📸 Mengambil gambar random dari server...');

    // Fetch gambar dari API
    const respons = await fetch(`${URL_API}/gambar-acak`);
    const data = await respons.json();

    if (!data.sukses) {
      console.error('❌ Gagal mengambil gambar:', data.pesan);
      alert('Gagal memuat gambar. Silakan coba lagi.');
      return;
    }

    // Simpan data gambar ke state
    stateGame.idGambar = data.data.idGambar;
    stateGame.idCache = data.data.idCache;
    stateGame.urlGambar = data.data.urlGambar;
    stateGame.fotografer = data.data.fotografer;

    console.log(`✅ Gambar berhasil diambil`);
    console.log(`   ID Cache: ${stateGame.idCache}`);
    console.log(`   Fotografer: ${stateGame.fotografer}`);

    // Tampilkan halaman permainan
    tampilkanHalamanPermainan();

    // Tunggu gambar dimuat sebelum generate puzzle
    const gambar = new Image();
    gambar.src = stateGame.urlGambar;

    gambar.onload = () => {
      console.log(`✅ Gambar berhasil dimuat ke browser`);
      console.log(`   Ukuran gambar di-load: ${gambar.width}x${gambar.height}px`);
      console.log(`   ℹ️  Gambar sudah di-crop ke square di server`);
      generatePuzzle(stateGame.urlGambar);
      mulaiTimer();
    };

    gambar.onerror = () => {
      console.error('❌ Gambar gagal dimuat');
      alert('Gambar gagal dimuat. Silakan coba lagi.');
    };
  } catch (kesalahan) {
    console.error('❌ Kesalahan memuat gambar:', kesalahan);
    alert('Terjadi kesalahan. Silakan coba lagi.');
  }
}

// ================================================================
// 4. GENERATE PUZZLE
// ================================================================

/**
 * Fungsi: generatePuzzle
 * Deskripsi: Generate puzzle dari gambar dengan membuat tiles
 * Parameter: urlGambar (String) - URL gambar yang akan dipotong
 */
function generatePuzzle(urlGambar) {
  console.log(`\n✨ === GENERATE PUZZLE ===`);
  console.log(`Grid: ${stateGame.ukuranGrid}x${stateGame.ukuranGrid}`);

  const n = stateGame.ukuranGrid;
  const totalTiles = n * n;
  const boardSize = 420; // px - ukuran board 420x420
  const tileSizePerTile = boardSize / n; // Hitung ukuran 1 tile

  // Set CSS variable untuk tile height
  document.documentElement.style.setProperty('--tile-size', `${tileSizePerTile}px`);

  console.log(`📏 Ukuran Board: ${boardSize}x${boardSize}px`);
  console.log(`📏 Ukuran 1 Tile: ${tileSizePerTile}x${tileSizePerTile}px`);
  console.log(`� Tile positioning menggunakan pixel coordinates`);

  // Hitung ukuran tile dalam persen
  const tileWidth = 100 / n;
  const tileHeight = 100 / n;

  console.log(`📏 Persentase Tile: ${tileWidth.toFixed(2)}% x ${tileHeight.toFixed(2)}%`);

  // Clear tiles array
  stateGame.tiles = [];
  stateGame.layoutSlot = new Array(totalTiles).fill(null);

  // Generate tiles dengan background positioning pixel-based
  for (let baris = 0; baris < n; baris++) {
    for (let kolom = 0; kolom < n; kolom++) {
      const indexTile = baris * n + kolom;

      // Hitung offset dalam pixel (bukan percentage)
      // Tile pada position (row, col) harus menampilkan bagian dari (col*tileSize, row*tileSize)
      const offsetX = kolom * tileSizePerTile;
      const offsetY = baris * tileSizePerTile;

      const tile = {
        id: `tile-${indexTile}`,
        index: indexTile,
        baris,
        kolom,
        posisiTarget: indexTile,
        offsetX,
        offsetY,
        tileSizePerTile,
        boardSize,
        url: urlGambar
      };

      stateGame.tiles.push(tile);
      
      console.log(`   Tile ${indexTile} (baris=${baris}, kolom=${kolom}): offset=(${offsetX}px, ${offsetY}px)`);
    }
  }

  console.log(`✅ ${stateGame.tiles.length} tiles berhasil dibuat`);

  // Shuffle tiles
  shuffleTiles();

  // Render puzzle board dan tiles pool
  renderPapanPuzzle();
  renderPoolTiles();

  stateGame.sedangBermain = true;
  stateGame.skor = 0;
  updateDisplaySkor();
}

/**
 * Fungsi: shuffleTiles
 * Deskripsi: Kocok urutan tiles untuk membuat game lebih menarik
 */
function shuffleTiles() {
  console.log('🔀 Shuffle tiles...');

  // Fisher-Yates shuffle
  for (let i = stateGame.tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [stateGame.tiles[i], stateGame.tiles[j]] = [stateGame.tiles[j], stateGame.tiles[i]];
  }

  console.log('✅ Tiles ter-shuffle');
}

// ================================================================
// 5. RENDER PUZZLE BOARD
// ================================================================

/**
 * Fungsi: renderPapanPuzzle
 * Deskripsi: Render grid slot papan puzzle
 */
function renderPapanPuzzle() {
  console.log('🎨 Render papan puzzle...');

  const n = stateGame.ukuranGrid;
  const papan = document.getElementById('papan-puzzle');

  // Clear papan
  papan.innerHTML = '';

  // Set CSS grid
  papan.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
  papan.style.gridTemplateRows = `repeat(${n}, 1fr)`;

  // Create slot grid
  for (let i = 0; i < n * n; i++) {
    const slot = document.createElement('div');
    slot.id = `slot-${i}`;
    slot.className = 'slot-papan';
    slot.dataset.slotIndex = i;

    // Setup drag and drop event
    slot.addEventListener('dragover', handleDragOver);
    slot.addEventListener('drop', (e) => handleDrop(e, i));

    papan.appendChild(slot);
  }

  console.log('✅ Papan puzzle render selesai');
}

/**
 * Fungsi: renderPoolTiles
 * Deskripsi: Render tiles di pool area
 */
function renderPoolTiles() {
  console.log('🎨 Render pool tiles...');

  const poolTiles = document.getElementById('pool-tiles');
  poolTiles.innerHTML = '';

  const n = stateGame.ukuranGrid;

  // Render tiles dalam urutan ter-shuffle
  stateGame.tiles.forEach((tile) => {
    const divTile = document.createElement('div');
    divTile.id = tile.id;
    divTile.className = 'tile-item';
    divTile.draggable = true;
    divTile.dataset.tileId = tile.id; // Gunakan tile.id (unique), bukan index yang berubah setelah shuffle

    // Set background image dengan pixel-based positioning
    divTile.style.backgroundImage = `url('${tile.url}')`;
    
    // Background position menggunakan pixel offset (bukan percentage)
    // Offset negatif untuk "skip" ke bagian gambar yang benar
    divTile.style.backgroundPosition = `-${tile.offsetX}px -${tile.offsetY}px`;
    
    // Background size adalah ukuran board 420x420 (bukan persentase)
    divTile.style.backgroundSize = `${tile.boardSize}px ${tile.boardSize}px`;
    divTile.style.backgroundRepeat = 'no-repeat';

    // Setup drag event
    divTile.addEventListener('dragstart', handleDragStart);
    divTile.addEventListener('dragend', handleDragEnd);

    poolTiles.appendChild(divTile);
  });

  console.log(`✅ ${stateGame.tiles.length} tiles di-render dengan pixel-based positioning`);
}

// ================================================================
// 6. DRAG AND DROP LOGIC
// ================================================================

/**
 * Variable untuk track tile yang sedang di-drag
 * @type {HTMLElement|null}
 */
let tileYangDiDrag = null;

/**
 * Fungsi: handleDragStart
 * Deskripsi: Menangani event ketika tile mulai di-drag
 * Parameter: event (DragEvent)
 */
function handleDragStart(event) {
  tileYangDiDrag = event.target;
  event.target.style.opacity = '0.7';
  event.dataTransfer.effectAllowed = 'move';

  console.log(`🎯 Drag start: ${event.target.id}`);
}

/**
 * Fungsi: handleDragEnd
 * Deskripsi: Menangani event ketika tile berhenti di-drag
 * Parameter: event (DragEvent)
 */
function handleDragEnd(event) {
  event.target.style.opacity = '1';
  tileYangDiDrag = null;

  console.log(`🎯 Drag end: ${event.target.id}`);
}

/**
 * Fungsi: handleDragOver
 * Deskripsi: Menangani event drag over slot
 * Parameter: event (DragEvent)
 */
function handleDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';

  // Visual feedback
  event.currentTarget.classList.add('dragover');
}

/**
 * Fungsi: handleDrop
 * Deskripsi: Menangani drop tile ke slot
 * Parameter: event (DragEvent), slotIndex (Number)
 */
function handleDrop(event, slotIndex) {
  event.preventDefault();
  event.currentTarget.classList.remove('dragover');

  if (!tileYangDiDrag) return;

  // Cari tile berdasarkan ID, bukan array index (karena array sudah di-shuffle)
  const tileId = tileYangDiDrag.dataset.tileId;
  const tile = stateGame.tiles.find(t => t.id === tileId);
  
  if (!tile) {
    console.error('❌ Tile tidak ditemukan:', tileId);
    return;
  }

  const slot = document.getElementById(`slot-${slotIndex}`);

  // Cek apakah slot sudah terisi
  if (stateGame.layoutSlot[slotIndex] !== null) {
    console.log(`❌ Slot ${slotIndex} sudah terisi!`);
    slot.style.backgroundColor = 'rgba(239, 68, 68, 0.3)'; // Red flash
    setTimeout(() => {
      slot.style.backgroundColor = '';
    }, 500);
    return;
  }

  // Cek apakah tile sesuai dengan posisi slot
  const posisiBenar = (tile.posisiTarget === slotIndex);

  console.log(`📍 Drop ke slot: ${slotIndex}`);
  console.log(`   Tile ID: ${tileId}, Tile Index: ${tile.index}`);
  console.log(`   Posisi Target: ${tile.posisiTarget}`);
  console.log(`   Validasi: ${posisiBenar ? '✅ SESUAI' : '❌ TIDAK SESUAI'}`);

  if (posisiBenar) {
    // ✅ BENAR! Tile ini adalah tile yang seharusnya ada di slot ini
    console.log(`✅ Tile ditempatkan benar!`);

    // Pindahkan tile visual ke dalam slot
    const tileCopy = tileYangDiDrag.cloneNode(true);
    tileCopy.classList.remove('tile-item');
    tileCopy.classList.add('tile-gambar');
    tileCopy.draggable = false;
    tileCopy.style.cursor = 'default';
    
    // Set background dengan positioning yang tepat
    tileCopy.style.backgroundImage = `url('${tile.url}')`;
    tileCopy.style.backgroundPosition = `-${tile.offsetX}px -${tile.offsetY}px`;
    tileCopy.style.backgroundSize = `${tile.boardSize}px ${tile.boardSize}px`;
    tileCopy.style.backgroundRepeat = 'no-repeat';
    
    // Clear slot sebelumnya dan append tile baru
    slot.innerHTML = '';
    slot.appendChild(tileCopy);
    slot.classList.add('berisi');
    
    // Highlight success
    slot.style.backgroundColor = 'rgba(16, 185, 129, 0.2)'; // Green flash
    setTimeout(() => {
      slot.style.backgroundColor = '';
    }, 300);

    // Hapus tile dari pool
    tileYangDiDrag.classList.add('ditempatkan');

    // Update layout
    stateGame.layoutSlot[slotIndex] = tileIndex;

    // Tambah skor
    const skorTambah = 10;
    stateGame.skor += skorTambah;
    updateDisplaySkor();

    console.log(`✅ Skor +${skorTambah} (Total: ${stateGame.skor})`);
    console.log(`   Posisi di board: baris=${tile.baris}, kolom=${tile.kolom}`);

    // Cek apakah puzzle sudah selesai
    const selesai = stateGame.layoutSlot.every((val) => val !== null);
    if (selesai) {
      console.log('🎉 PUZZLE SELESAI!');
      selesaiPermainan();
    }
  } else {
    // ❌ SALAH! Tile ini tidak sesuai untuk slot ini
    console.log(`❌ POSISI TIDAK SESUAI!`);
    console.log(`   Tile ${tileIndex} tidak boleh di slot ${slotIndex}`);
    console.log(`   Tile ${tileIndex} seharusnya di slot ${tile.posisiTarget}`);
    
    // Visual feedback: reject
    slot.style.backgroundColor = 'rgba(239, 68, 68, 0.3)'; // Red flash
    slot.style.borderColor = '#ef4444';
    
    setTimeout(() => {
      slot.style.backgroundColor = '';
      slot.style.borderColor = '';
    }, 500);
    
    // Tidak terima tile ini - tile kembali ke pool
    tileYangDiDrag.style.opacity = '1';
  }
}

// ================================================================
// 7. GAME CONTROLS
// ================================================================

/**
 * Fungsi: resetPermainan
 * Deskripsi: Reset permainan dan shuffle tiles lagi
 */
function resetPermainan() {
  console.log('\n🔄 === RESET GAME ===');

  // Stop timer
  stopTimer();

  // Reset state
  stateGame.skor = 0;
  stateGame.waktuDetik = 0;
  stateGame.layoutSlot = new Array(stateGame.ukuranGrid * stateGame.ukuranGrid).fill(null);

  updateDisplaySkor();
  updateDisplayWaktu();

  // Shuffle dan re-render
  shuffleTiles();
  renderPoolTiles();

  // Clear slots
  document.querySelectorAll('.slot-papan').forEach((slot) => {
    slot.innerHTML = '';
    slot.classList.remove('berisi');
  });

  // Start timer lagi
  mulaiTimer();

  console.log('✅ Game direset');
}

/**
 * Fungsi: berikanHint
 * Deskripsi: Berikan hint dengan menunjukkan slot kosong random
 */
function berikanHint() {
  console.log('💡 === HINT ===');

  // Cari slot kosong
  const slotKosong = [];
  for (let i = 0; i < stateGame.layoutSlot.length; i++) {
    if (stateGame.layoutSlot[i] === null) {
      slotKosong.push(i);
    }
  }

  if (slotKosong.length === 0) {
    console.log('❌ Tidak ada slot kosong');
    return;
  }

  // Pilih slot random
  const slotIndex = slotKosong[Math.floor(Math.random() * slotKosong.length)];
  const slot = document.getElementById(`slot-${slotIndex}`);

  // Highlight slot
  slot.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.8)';

  console.log(`💡 Hint: Slot ${slotIndex} kosong`);

  // Remove highlight setelah 2 detik
  setTimeout(() => {
    slot.style.boxShadow = 'none';
  }, 2000);
}

/**
 * Fungsi: selesaiPermainan
 * Deskripsi: Tangani completion permainan
 */
function selesaiPermainan() {
  console.log('\n🎉 === SELESAI PERMAINAN ===');

  stopTimer();

  // Update display hasil
  document.getElementById('hasil-skor').textContent = stateGame.skor;
  document.getElementById('hasil-waktu').textContent = stateGame.waktuDetik + 's';
  document.getElementById('hasil-kesulitan').textContent = stateGame.tingkatKesulitan.toUpperCase();

  // Simpan skor ke database
  simpanSkorKeDatabse();

  // Tampilkan modal
  document.getElementById('modal-selesai').classList.remove('tersembunyi');

  stateGame.sedangBermain = false;
}

/**
 * Fungsi: tutupModalSelesai
 * Deskripsi: Tutup modal completion dan mulai game baru
 */
function tutupModalSelesai() {
  document.getElementById('modal-selesai').classList.add('tersembunyi');
  mulaiPermainan(stateGame.tingkatKesulitan, stateGame.ukuranGrid);
}

/**
 * Fungsi: kembaliKeMenu
 * Deskripsi: Kembali ke menu utama dari permainan
 */
function kembaliKeMenu() {
  console.log('🏠 Kembali ke menu');

  // Stop timer
  stopTimer();

  // Clear game state
  stateGame.sedangBermain = false;

  // Sembunyikan semua halaman
  document.querySelectorAll('.halaman').forEach((h) => {
    h.classList.remove('aktif');
  });

  // Tampilkan halaman menu
  document.getElementById('halaman-menu').classList.add('aktif');

  // Update papan peringkat
  muatPapanPeringkat();
}

// ================================================================
// 8. TIMER
// ================================================================

/**
 * Fungsi: mulaiTimer
 * Deskripsi: Mulai menghitung waktu permainan
 */
function mulaiTimer() {
  console.log('⏱️ Timer dimulai');

  stateGame.timerInterval = setInterval(() => {
    stateGame.waktuDetik++;
    updateDisplayWaktu();
  }, 1000);
}

/**
 * Fungsi: stopTimer
 * Deskripsi: Hentikan timer
 */
function stopTimer() {
  if (stateGame.timerInterval) {
    clearInterval(stateGame.timerInterval);
    console.log('⏱️ Timer dihentikan');
  }
}

/**
 * Fungsi: updateDisplayWaktu
 * Deskripsi: Update tampilan waktu di UI
 */
function updateDisplayWaktu() {
  document.getElementById('tampilan-waktu').textContent = stateGame.waktuDetik + 's';
}

// ================================================================
// 9. SCORING
// ================================================================

/**
 * Fungsi: updateDisplaySkor
 * Deskripsi: Update tampilan skor di UI
 */
function updateDisplaySkor() {
  document.getElementById('tampilan-skor').textContent = stateGame.skor;
}

/**
 * Fungsi: simpanSkorKeDatabse
 * Deskripsi: Simpan skor final ke database
 */
async function simpanSkorKeDatabse() {
  try {
    console.log('💾 Menyimpan skor ke database...');

    const sesiId = dataSession.sesiId;

    const respons = await fetch(`${URL_API}/simpan-skor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sesiId,
        tingkatKesulitan: stateGame.tingkatKesulitan,
        skor: stateGame.skor,
        waktuDetik: stateGame.waktuDetik
      })
    });

    const data = await respons.json();

    if (data.sukses) {
      console.log('✅ Skor berhasil disimpan');
    } else {
      console.error('❌ Gagal simpan skor:', data.pesan);
    }
  } catch (kesalahan) {
    console.error('❌ Kesalahan simpan skor:', kesalahan);
  }
}

// ================================================================
// 10. NAVIGATION
// ================================================================

/**
 * Fungsi: tampilkanHalamanPermainan
 * Deskripsi: Switch ke halaman permainan
 */
function tampilkanHalamanPermainan() {
  console.log('📄 Menampilkan halaman permainan');

  // Sembunyikan semua halaman
  document.querySelectorAll('.halaman').forEach((h) => {
    h.classList.remove('aktif');
  });

  // Tampilkan halaman permainan
  document.getElementById('halaman-permainan').classList.add('aktif');

  // Update judul
  document.getElementById('judul-game').textContent = `Puzzle ${stateGame.ukuranGrid}x${stateGame.ukuranGrid} (${stateGame.tingkatKesulitan.toUpperCase()})`;

  // Update gambar preview
  document.getElementById('gambarprediksi').src = stateGame.urlGambar;

  // Setup button event listeners
  document.getElementById('tombol-hint').addEventListener('click', berikanHint);
  document.getElementById('tombol-reset').addEventListener('click', resetPermainan);
  document.getElementById('tombol-selesai').addEventListener('click', selesaiPermainan);
}
