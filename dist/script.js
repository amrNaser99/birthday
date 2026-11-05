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

buildSparkles();
setupReveal();
calculateDays();
