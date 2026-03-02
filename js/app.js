/**
 * app.js — Norton Simulation Controller
 * Handles navigation between screens via postMessage from iframes.
 */

const iframe  = document.getElementById('phone-iframe');
const overlay = document.getElementById('screen-overlay');
const dots    = document.querySelectorAll('.step-dot');

const SCREENS = {
  1: 'pages/screen1.html',
  2: 'pages/screen2.html',
  3: 'pages/screen3.html',
  4: 'pages/screen4.html',
  5: 'pages/screen5.html',
  6: 'pages/screen6.html',
};

let currentScreen = 1;
let alreadyActivated = false;

/* ── Navigate to a screen with a smooth fade ─────────────────── */
function goTo(screenNum, params = {}) {
  if (screenNum === currentScreen && !params.force) return;

  // Build query string
  const query = new URLSearchParams(params).toString();
  const src   = SCREENS[screenNum] + (query ? '?' + query : '');

  // Fade overlay in
  overlay.classList.add('flash-in');

  setTimeout(() => {
    iframe.src = src;
    currentScreen = screenNum;
    updateDots(screenNum);

    // Fade overlay out after iframe starts loading
    setTimeout(() => {
      overlay.classList.remove('flash-in');
    }, 300);
  }, 250);
}

/* ── Update step indicator dots ──────────────────────────────── */
function updateDots(active) {
  dots.forEach(d => {
    d.classList.toggle('active', +d.dataset.step === active);
  });
}

/* ── Listen for messages from iframes ───────────────────────── */
window.addEventListener('message', (e) => {
  const { action, payload } = e.data || {};
  if (!action) return;

  switch (action) {

    // Screen 1: link clicked
    case 'link-clicked':
      if (alreadyActivated) {
        goTo(5);
      } else {
        goTo(2);
      }
      break;

    // Screen 2: "Aktifkan Sekarang" clicked
    case 'activate-now':
      goTo(3);
      break;

    // Screen 3: form submitted (Buat Akun)
    case 'create-account':
      goTo(4);
      break;

    // Screen 4: floating back button
    case 'back-to-home':
      alreadyActivated = true;
      goTo(1, { activated: '1' });
      break;

    // Screen 5: "Masuk" button — buka halaman login (screen6)
    case 'login':
      goTo(6);
      break;

    // Screen 6: tombol back di browser bar
    case 'back-from-login':
      goTo(5);
      break;

    // Screen 6: buat akun baru
    case 'go-to-register':
      goTo(3);
      break;

    // Help icon (screen 2 & 5) — buka support di dalam iframe
    case 'open-support':
      overlay.classList.add('flash-in');
      setTimeout(() => {
        iframe.src = 'https://norton.tog.co.id/support/id/activate';
        setTimeout(() => overlay.classList.remove('flash-in'), 300);
      }, 250);
      break;

    default:
      break;
  }
});

/* ── Side panel ───────────────────────────────────────────────── */
const panel    = document.getElementById('side-panel');
const backdrop = document.getElementById('panel-backdrop');
const trigger  = document.getElementById('panel-trigger');
const closeBtn = document.getElementById('panel-close');

function openPanel() {
  panel.classList.add('open');
  backdrop.classList.add('open');
}

function closePanel() {
  panel.classList.remove('open');
  backdrop.classList.remove('open');
}

trigger.addEventListener('click', openPanel);
closeBtn.addEventListener('click', closePanel);
backdrop.addEventListener('click', closePanel);

/* ── Dot click navigation ─────────────────────────────────────── */
dots.forEach(dot => {
  dot.addEventListener('click', () => {
    const n = +dot.dataset.step;
    // When jumping to screen 1 via dot, preserve activated state
    if (n === 1 && alreadyActivated) {
      goTo(1, { activated: '1', force: true });
    } else {
      goTo(n, { force: true });
    }
  });
});
