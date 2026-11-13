const watchButton = document.querySelector('#watchButton');
const videoShell = document.querySelector('#videoShell');
const storyVideo = document.querySelector('#storyVideo');
const videoCover = document.querySelector('#videoCover');
const videoMissing = document.querySelector('#videoMissing');
const surpriseButton = document.querySelector('#surpriseButton');
const loveDialog = document.querySelector('#loveDialog');
const dialogClose = document.querySelector('#dialogClose');
const soundToggle = document.querySelector('#soundToggle');
const ambientAudio = document.querySelector('#ambientAudio');
const countdownGate = document.querySelector('#countdownGate');
const countdownState = document.querySelector('#countdownState');
const partyState = document.querySelector('#partyState');
const voiceState = document.querySelector('#voiceState');
const partyLyrics = document.querySelector('#partyLyrics');
const partyCountdown = document.querySelector('#partyCountdown');
const partyCountNumber = document.querySelector('#partyCountNumber');
const fireworksCanvas = document.querySelector('#fireworksCanvas');
const partyConfetti = document.querySelector('#partyConfetti');
const demoTrigger = document.querySelector('#demoTrigger');
const demoDialog = document.querySelector('#demoDialog');
const demoDialogClose = document.querySelector('#demoDialogClose');
const demoForm = document.querySelector('#demoForm');
const demoPassword = document.querySelector('#demoPassword');
const demoError = document.querySelector('#demoError');
const gateStart = document.querySelector('#gateStart');
const gateReady = document.querySelector('#gateReady');
const playVoiceButton = document.querySelector('#playVoiceButton');
const voiceStatus = document.querySelector('#voiceStatus');
const voiceMessage = document.querySelector('#voiceMessage');
const experienceContent = [
  document.querySelector('.site-header'),
  document.querySelector('main'),
  document.querySelector('footer'),
];
const countdownParts = {
  days: document.querySelector('#countdownDays'),
  hours: document.querySelector('#countdownHours'),
  minutes: document.querySelector('#countdownMinutes'),
  seconds: document.querySelector('#countdownSeconds'),
};

// Midnight at the start of 14 November 2026 in Cairo (UTC+2 in November).
const TARGET_TIME = new Date('2026-11-14T00:00:00+02:00').getTime();
const previewPhase = new URLSearchParams(window.location.search).get('preview');
const previewMode = ['1', 'party', 'countdown', 'voice'].includes(previewPhase);
let countdownTimer;
let surpriseActivated = false;
let sequenceStarted = false;
let audioContext;
let fireworksFrame;
let fireworksRunning = false;
let fireworksResizeHandler;

function buildSparkles() {
  const host = document.querySelector('#sparkles');
  if (!host) return;
  for (let i = 0; i < 28; i += 1) {
    const dot = document.createElement('span');
    dot.className = 'sparkle';
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.top = `${Math.random() * 100}%`;
    dot.style.setProperty('--duration', `${6 + Math.random() * 9}s`);
    dot.style.setProperty('--delay', `${Math.random() * -10}s`);
    dot.style.setProperty('--drift', `${-30 + Math.random() * 60}px`);
    host.appendChild(dot);
  }
}

function buildGateStars() {
  const host = document.querySelector('#gateStars');
  if (!host) return;
  for (let i = 0; i < 34; i += 1) {
    const star = document.createElement('span');
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.setProperty('--star-size', `${1 + Math.random() * 2.4}px`);
    star.style.setProperty('--star-delay', `${Math.random() * -5}s`);
    host.appendChild(star);
  }
}

function setupReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 4, 3) * 80}ms`;
    observer.observe(element);
  });
}

function calculateDays() {
  const wedding = Date.UTC(2026, 7, 3);
  const birthday = Date.UTC(2026, 10, 14);
  const days = Math.round((birthday - wedding) / 86400000);
  document.querySelector('#daysTogether').textContent = new Intl.NumberFormat('ar-EG').format(days);
}

async function playStory() {
  videoShell.scrollIntoView({ behavior: 'smooth', block: 'center' });
  videoCover.hidden = true;
  try {
    await storyVideo.play();
  } catch {
    videoCover.hidden = false;
  }
}

function formatCountdown(value) {
  return new Intl.NumberFormat('ar-EG', {
    minimumIntegerDigits: 2,
    useGrouping: false,
  }).format(value);
}

function renderCountdown(remaining) {
  const totalSeconds = Math.max(0, Math.floor(remaining / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  countdownParts.days.textContent = formatCountdown(days);
  countdownParts.hours.textContent = formatCountdown(hours);
  countdownParts.minutes.textContent = formatCountdown(minutes);
  countdownParts.seconds.textContent = formatCountdown(seconds);
}

function getAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioContext = new AudioContextClass();
  }
  return audioContext;
}

function primeMedia(element) {
  const originalVolume = element.volume;
  element.volume = 0;
  element.load();
  const playAttempt = element.play();
  window.setTimeout(() => {
    element.pause();
    element.currentTime = 0;
    element.volume = originalVolume;
  }, 180);
  if (playAttempt) playAttempt.catch(() => { element.volume = originalVolume; });
}

async function assetExists(path) {
  try {
    const response = await fetch(path, { method: 'HEAD', cache: 'no-store' });
    return response.ok;
  } catch {
    return false;
  }
}

function buildPartyConfetti() {
  partyConfetti.replaceChildren();
  const colors = ['#f5e0a8', '#f1a8bd', '#ffffff', '#d8b36a', '#d96e9a'];
  for (let i = 0; i < 90; i += 1) {
    const piece = document.createElement('i');
    piece.style.setProperty('--x', `${Math.random() * 100}vw`);
    piece.style.setProperty('--delay', `${Math.random() * -7}s`);
    piece.style.setProperty('--fall', `${5 + Math.random() * 5}s`);
    piece.style.setProperty('--spin', `${-360 + Math.random() * 720}deg`);
    piece.style.setProperty('--confetti-color', colors[i % colors.length]);
    partyConfetti.appendChild(piece);
  }
}

function startFireworks() {
  const context = fireworksCanvas.getContext('2d');
  if (!context) return;

  const particles = [];
  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    fireworksCanvas.width = Math.floor(window.innerWidth * ratio);
    fireworksCanvas.height = Math.floor(window.innerHeight * ratio);
    fireworksCanvas.style.width = `${window.innerWidth}px`;
    fireworksCanvas.style.height = `${window.innerHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const burst = (x, y) => {
    const palette = ['#f5e0a8', '#f1a8bd', '#ffffff', '#d8b36a', '#e76f9f'];
    const color = palette[Math.floor(Math.random() * palette.length)];
    const count = 34 + Math.floor(Math.random() * 24);
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * .18;
      const speed = 1.4 + Math.random() * 4.8;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        decay: .008 + Math.random() * .013,
        size: 1.2 + Math.random() * 2.3,
        color,
      });
    }
  };

  resize();
  fireworksResizeHandler = resize;
  buildPartyConfetti();
  partyConfetti.classList.add('is-active');
  fireworksRunning = true;
  let lastBurst = 0;

  const draw = (time) => {
    if (!fireworksRunning) return;
    if (fireworksCanvas.style.width !== `${window.innerWidth}px` || fireworksCanvas.style.height !== `${window.innerHeight}px`) {
      resize();
    }
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    context.globalCompositeOperation = 'lighter';

    if (time - lastBurst > 280) {
      burst(
        window.innerWidth * (.08 + Math.random() * .84),
        window.innerHeight * (.1 + Math.random() * .62),
      );
      lastBurst = time;
    }

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const particle = particles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= .987;
      particle.vy = particle.vy * .987 + .028;
      particle.alpha -= particle.decay;
      if (particle.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }
      context.globalAlpha = particle.alpha;
      context.fillStyle = particle.color;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();
    }

    context.globalAlpha = 1;
    fireworksFrame = window.requestAnimationFrame(draw);
  };

  window.addEventListener('resize', resize);
  fireworksFrame = window.requestAnimationFrame(draw);
}

function stopFireworks() {
  fireworksRunning = false;
  window.cancelAnimationFrame(fireworksFrame);
  if (fireworksResizeHandler) window.removeEventListener('resize', fireworksResizeHandler);
  const context = fireworksCanvas.getContext('2d');
  if (context) context.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
  partyConfetti.classList.remove('is-active');
}

function playSynthBirthday() {
  const context = getAudioContext();
  if (!context) return Promise.resolve();
  context.resume();

  const notes = [
    [392, .34], [392, .34], [440, .68], [392, .68], [523.25, .68], [493.88, 1.25],
    [392, .34], [392, .34], [440, .68], [392, .68], [587.33, .68], [523.25, 1.25],
    [392, .34], [392, .34], [783.99, .68], [659.25, .68], [523.25, .68], [493.88, .68], [440, 1.25],
    [698.46, .34], [698.46, .34], [659.25, .68], [523.25, .68], [587.33, .68], [523.25, 1.35],
  ];
  const master = context.createGain();
  master.gain.value = .075;
  master.connect(context.destination);
  let cursor = context.currentTime + .12;

  notes.forEach(([frequency, duration]) => {
    const gain = context.createGain();
    const lead = context.createOscillator();
    const warmth = context.createOscillator();
    lead.type = 'sine';
    warmth.type = 'triangle';
    lead.frequency.value = frequency;
    warmth.frequency.value = frequency / 2;
    gain.gain.setValueAtTime(.001, cursor);
    gain.gain.exponentialRampToValueAtTime(.9, cursor + .055);
    gain.gain.exponentialRampToValueAtTime(.001, cursor + duration * .94);
    lead.connect(gain);
    warmth.connect(gain);
    gain.connect(master);
    lead.start(cursor);
    warmth.start(cursor);
    lead.stop(cursor + duration);
    warmth.stop(cursor + duration);
    cursor += duration;
  });

  const phrases = [
    ['Happy Birthday', 'to you ♡'],
    ['Happy Birthday', 'to you ♡'],
    ['Happy Birthday', 'dear Mona ♡'],
    ['Happy Birthday', 'to you ♡'],
  ];
  const phraseTimes = [0, 4.2, 8.4, 13.8];
  phraseTimes.forEach((time, index) => {
    window.setTimeout(() => {
      partyLyrics.querySelector('span').textContent = phrases[index][0];
      partyLyrics.querySelector('strong').textContent = phrases[index][1];
      partyLyrics.classList.remove('lyric-pop');
      void partyLyrics.offsetWidth;
      partyLyrics.classList.add('lyric-pop');
    }, time * 1000);
  });

  return new Promise((resolve) => window.setTimeout(resolve, Math.max(0, (cursor - context.currentTime) * 1000 + 300)));
}

async function playBirthdaySong() {
  await playSynthBirthday();
}

function playCountdownBeep(number) {
  const context = getAudioContext();
  if (!context) return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = number === 1 ? 880 : 620;
  gain.gain.setValueAtTime(.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(.12, context.currentTime + .025);
  gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .25);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + .28);
}

async function runFinalCountdown() {
  partyState.classList.add('is-counting');
  partyCountdown.hidden = false;
  for (const number of [3, 2, 1]) {
    partyCountNumber.textContent = new Intl.NumberFormat('ar-EG').format(number);
    partyCountNumber.classList.remove('count-pop');
    void partyCountNumber.offsetWidth;
    partyCountNumber.classList.add('count-pop');
    playCountdownBeep(number);
    await new Promise((resolve) => window.setTimeout(resolve, 1000));
  }
  await new Promise((resolve) => window.setTimeout(resolve, 380));
}

function openDemoDialog() {
  demoError.textContent = '';
  demoPassword.value = '';
  demoDialog.showModal();
  window.setTimeout(() => demoPassword.focus(), 60);
}

async function startPasswordDemo(event) {
  event.preventDefault();
  if (demoPassword.value !== '7654321') {
    demoError.textContent = 'الباسورد مش صح… جرّب تاني.';
    demoPassword.select();
    demoDialog.classList.remove('is-wrong');
    void demoDialog.offsetWidth;
    demoDialog.classList.add('is-wrong');
    return;
  }

  demoError.textContent = '';
  demoDialog.close();
  surpriseActivated = true;
  const context = getAudioContext();
  if (context?.state === 'suspended') await context.resume();
  startSurpriseSequence();
}

async function unlockSurprise() {
  surpriseActivated = true;
  gateStart.hidden = true;
  gateReady.hidden = false;

  const context = getAudioContext();
  if (context?.state === 'suspended') await context.resume();

  if (Date.now() >= TARGET_TIME || previewMode) {
    startSurpriseSequence();
    return;
  }

  // Warm the personal recording after a gesture to improve playback later.
  primeMedia(voiceMessage);
}

async function startVoice() {
  if (!await assetExists('assets/voice-message.mp3')) {
    revealFilm();
    return;
  }
  voiceStatus.textContent = '';
  playVoiceButton.hidden = true;
  voiceMessage.currentTime = 0;
  try {
    await voiceMessage.play();
    voiceState.classList.add('is-playing');
  } catch {
    voiceState.classList.remove('is-playing');
    playVoiceButton.hidden = false;
    voiceStatus.textContent = 'اضغطي على الزر عشان تسمعي الرسالة.';
  }
}

function revealFilm() {
  countdownGate.classList.add('is-opening');
  document.body.classList.remove('experience-locked');
  experienceContent.forEach((element) => {
    element.inert = false;
    element.removeAttribute('aria-hidden');
  });

  window.setTimeout(async () => {
    countdownGate.hidden = true;
    videoShell.scrollIntoView({ behavior: 'smooth', block: 'center' });
    videoCover.hidden = true;
    try {
      await storyVideo.play();
    } catch {
      videoCover.hidden = false;
    }
  }, 850);
}

async function startSurpriseSequence() {
  if (sequenceStarted) return;
  sequenceStarted = true;
  window.clearInterval(countdownTimer);
  renderCountdown(0);
  countdownState.hidden = true;

  if (previewPhase === 'voice') {
    voiceState.hidden = false;
    startVoice();
    return;
  }

  partyState.hidden = false;
  startFireworks();
  if (previewPhase !== 'countdown') await playBirthdaySong();
  await runFinalCountdown();
  stopFireworks();
  partyState.hidden = true;
  voiceState.hidden = false;
  startVoice();
}

function updateCountdown() {
  const remaining = previewMode ? 0 : TARGET_TIME - Date.now();
  renderCountdown(remaining);
  if (remaining <= 0) {
    window.clearInterval(countdownTimer);
    if (surpriseActivated || previewMode) {
      startSurpriseSequence();
    } else {
      gateStart.querySelector('strong').textContent = 'ابدئي المفاجأة';
      gateStart.querySelector('small').textContent = 'اللحظة وصلت… اضغطي وابدئي الحفلة';
    }
  }
}

watchButton.addEventListener('click', playStory);
videoCover.addEventListener('click', playStory);

storyVideo.addEventListener('error', () => {
  videoCover.hidden = true;
  videoMissing.hidden = false;
});

surpriseButton.addEventListener('click', () => {
  loveDialog.showModal();
});

dialogClose.addEventListener('click', () => loveDialog.close());
loveDialog.addEventListener('click', (event) => {
  if (event.target === loveDialog) loveDialog.close();
});

soundToggle.addEventListener('click', async () => {
  const active = soundToggle.getAttribute('aria-pressed') === 'true';
  if (active) {
    ambientAudio.pause();
    soundToggle.setAttribute('aria-pressed', 'false');
    return;
  }
  try {
    ambientAudio.volume = 0.28;
    await ambientAudio.play();
    soundToggle.setAttribute('aria-pressed', 'true');
  } catch {
    soundToggle.setAttribute('aria-pressed', 'false');
  }
});

gateStart.addEventListener('click', unlockSurprise);
demoTrigger.addEventListener('click', openDemoDialog);
demoDialogClose.addEventListener('click', () => demoDialog.close());
demoDialog.addEventListener('click', (event) => {
  if (event.target === demoDialog) demoDialog.close();
});
demoForm.addEventListener('submit', startPasswordDemo);
playVoiceButton.addEventListener('click', startVoice);
voiceMessage.addEventListener('ended', revealFilm);
voiceMessage.addEventListener('error', () => {
  voiceState.classList.remove('is-playing');
  playVoiceButton.hidden = false;
  voiceStatus.textContent = 'ملف الرسالة الصوتية لسه محتاج يتضاف.';
});

buildSparkles();
buildGateStars();
setupReveal();
calculateDays();
document.body.classList.add('experience-locked');
experienceContent.forEach((element) => {
  element.inert = true;
  element.setAttribute('aria-hidden', 'true');
});
updateCountdown();
countdownTimer = window.setInterval(updateCountdown, 1000);
