import {Wheel} from '../../../src/wheel.js';
import * as util from '../../../src/util.js';

// --- Konfigurasi Awal ---
const NUM_WINNERS_TO_SELECT = 3;
const NUM_ELITE_MEMBERS = 3;

// Daftar peserta awal (disesuaikan kembali ke 8 orang)
const initialParticipants = [
  {name: 'Ani', fitness: 100},
  {name: 'Budi', fitness: 90},
  {name: 'Cici', fitness: 80},
  {name: 'Dedi', fitness: 50},
  {name: 'Eka', fitness: 45},
  {name: 'Fani', fitness: 30},
  {name: 'Gani', fitness: 20},
  {name: 'Hani', fitness: 10},
];

// --- State Aplikasi ---
let eligibleParticipants = [];
const winners = [];
let eliteGroupNames = new Set();
let wheel;
let currentWinningIndex = null; // Variabel untuk menyimpan pemenang yang sudah pasti

// --- Elemen DOM ---
const wheelWrapper = document.querySelector('.wheel-wrapper');
const spinButton = document.getElementById('spin-button');
const winnerPopup = document.getElementById('winner-popup');
const winnerNameEl = document.getElementById('winner-name');
const closePopupButton = document.getElementById('close-popup');

// --- Fungsi Logika Seleksi ---

// Helper: map participants to wheel items
function mapParticipantsToWheelItems(participants) {
  return participants.map(p => ({
    label: p.name,
    weight: p.fitness,
  }));
}

/**
 * Mengarahkan roda agar menunjuk ke peserta dengan probabilitas tertinggi.
 */
const orientWheelToHighestProb = () => {
  if (!eligibleParticipants.length || !wheel) return;

  // Temukan peserta dengan fitness tertinggi
  const highestProbParticipant = eligibleParticipants.reduce((max, p) => p.fitness > max.fitness ? p : max, eligibleParticipants[0]);
  const highestProbIndex = eligibleParticipants.indexOf(highestProbParticipant);

  // Dapatkan sudut tengah item tersebut di roda
  const targetAngle = wheel.items[highestProbIndex].getCenterAngle();

  // Hitung rotasi yang diperlukan agar panah (di 0 derajat) menunjuk ke sudut target
  const newRotation = util.calcWheelRotationForTargetAngle(wheel.rotation, targetAngle, 1);

  // Atur rotasi baru tanpa animasi
  wheel.rotation = newRotation;
};

/**
 * Menjalankan satu putaran seleksi: menghitung probabilitas dan memilih indeks pemenang.
 */
const getWinningIndex = () => {
  const totalFitness = eligibleParticipants.reduce((sum, p) => sum + p.fitness, 0);

  // Tambahkan probabilitas ke setiap objek peserta
  for (const p of eligibleParticipants) {
    p.probability = totalFitness > 0 ? p.fitness / totalFitness : 0;
  }

  // Lakukan seleksi Roda Rolet
  const pick = Math.random();
  let currentProbSum = 0;
  for (let i = 0; i < eligibleParticipants.length; i++) {
    currentProbSum += eligibleParticipants[i].probability;
    if (currentProbSum > pick) {
      return i; // Kembalikan indeks pemenang
    }
  }

  // Fallback jika ada masalah floating point
  return eligibleParticipants.length - 1;
};

/**
 * Memproses pemenang setelah roda berhenti.
 */
const processWinner = (winnerIndex) => {
  if (winnerIndex === null) return; // Jangan lakukan apa-apa jika tidak ada pemenang

  const winner = eligibleParticipants[winnerIndex];
  winners.push(winner.name);

  // Tampilkan popup
  winnerNameEl.textContent = winner.name;
  winnerPopup.style.display = 'flex';
  confetti({particleCount: 150, spread: 90, origin: {y: 0.6}});

  // Hapus pemenang dari daftar
  eligibleParticipants.splice(winnerIndex, 1);

  // Distribusikan ulang fitness jika pemenang adalah anggota unggulan
  if (eliteGroupNames.has(winner.name)) {
    const remainingElites = eligibleParticipants.filter(p => eliteGroupNames.has(p.name));
    if (remainingElites.length > 0) {
      const redistributionAmount = winner.original_fitness / remainingElites.length;
      for (const elite of remainingElites) {
        elite.fitness += redistributionAmount;
      }
    }
  }

  // Perbarui item di roda untuk putaran selanjutnya
  // atau nonaktifkan tombol jika semua pemenang sudah terpilih
  if (winners.length < NUM_WINNERS_TO_SELECT) {
    wheel.items = mapParticipantsToWheelItems(eligibleParticipants);
  } else {
    spinButton.disabled = true;
    spinButton.textContent = 'Selesai!';
    closePopupButton.textContent = 'Tutup';
  }
};

// --- Inisialisasi dan Event Listeners ---

const init = () => {
  // Salin data awal dan simpan fitness original
  eligibleParticipants = JSON.parse(JSON.stringify(initialParticipants));
  eligibleParticipants.forEach(p => {
 p.original_fitness = p.fitness;
});

  // Tentukan grup unggulan
  const sortedByFitness = [...initialParticipants].sort((a, b) => b.fitness - a.fitness);
  eliteGroupNames = new Set(sortedByFitness.slice(0, NUM_ELITE_MEMBERS).map(p => p.name));

  // Properti untuk Roda
  const props = {
    items: mapParticipantsToWheelItems(eligibleParticipants),
    radius: 0.90,
    borderWidth: 8,
    borderColor: '#003366', // Dark Blue
    lineColor: '#003366', // Dark Blue
    lineWidth: 2,
    itemBackgroundColors: ['#FFFFFF', '#ADD8E6'], // White, LightBlue
    itemLabelColors: ['#003366'], // Dark Blue
    itemLabelFont: 'sans-serif',
    itemLabelRadius: 0.8,
    itemLabelRadiusMax: 0.4,
    isInteractive: false, // Nonaktifkan interaksi manual
    pointerAngle: 0, // Pastikan panah di posisi atas (0 derajat)
    onRest: (e) => {
      console.log('--- RODA BERHENTI ---');
      console.log(`Indeks yang dilaporkan Roda (e.currentIndex): ${e.currentIndex}`);
      console.log(`Indeks Pemenang yang DISIMPAN: ${currentWinningIndex}`);
      console.log('-----------------------');
      processWinner(currentWinningIndex); // Gunakan index yang sudah disimpan
      currentWinningIndex = null; // Reset setelah dipakai
    },
  };

  // Buat instance Roda
  wheel = new Wheel(wheelWrapper, props);
  wheelWrapper.style.visibility = 'visible';

  // Panggil resize setelah sedikit penundaan untuk memastikan layout sudah stabil
  setTimeout(() => {
    wheel.resize();
    orientWheelToHighestProb(); // Arahkan roda setelah resize
  }, 50);
};

// Event listener untuk tombol putar
spinButton.addEventListener('click', () => {
  if (winners.length >= NUM_WINNERS_TO_SELECT) return;

  console.clear(); // Bersihkan console setiap kali spin
  console.log('--- MEMULAI PUTARAN BARU ---');

  currentWinningIndex = getWinningIndex(); // Tentukan dan simpan pemenang SEBELUM berputar

  console.log('Peserta yang memenuhi syarat saat ini:', JSON.parse(JSON.stringify(eligibleParticipants)));
  console.log(`Indeks Pemenang yang DITENTUKAN: ${currentWinningIndex}`);
  if (eligibleParticipants[currentWinningIndex]) {
    console.log(`Nama Pemenang yang SEHARUSNYA: ${eligibleParticipants[currentWinningIndex].name}`);
  }
  console.log('---------------------------------');

  wheel.spinToItem(currentWinningIndex, 5000, true, 3, 1); // Putar selama 5 detik
  spinButton.disabled = true; // Nonaktifkan tombol selama berputar
}, false);

// Event listener untuk tombol tutup popup
closePopupButton.addEventListener('click', () => {
  winnerPopup.style.display = 'none';
  if (winners.length < NUM_WINNERS_TO_SELECT) {
    spinButton.disabled = false; // Aktifkan kembali tombol untuk putaran selanjutnya
    orientWheelToHighestProb(); // Arahkan kembali roda untuk putaran berikutnya
  }
}, false);

// Mulai aplikasi
init();
