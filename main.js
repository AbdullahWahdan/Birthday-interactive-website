document.addEventListener('DOMContentLoaded', () => {

  // --- CONFIGURATION ---
  const PASSWORD = "28126";
  const ANNIVERSARY_DATE = "2026-01-28"; // Format: YYYY-MM-DD - YOU CAN CHANGE THIS
  const REASONS = [
    "Your beautiful smile", "How you laugh at my jokes", "Your kind heart",
    "The way you look at me", "How we can talk for hours", "Your sense of humor",
    "You always support me", "You are my best friend", "Your intelligence",
    "How you make me want to be better", "The way you hold my hand", "Your passion",
    "How we share everything", "You understand me perfectly", "Your gorgeous eyes",
    "The way you say my name", "How safe I feel with you", "Your gentle touch",
    "Every memory we've made", "How you light up a room", "Your warm hugs",
    "Because you are simply YOU"
  ];
  const LOVE_LETTER = "My dearest Habiba,<br><br>Happy 22nd Birthday! Every day with you is a gift, and I wanted to make this one extra special. You mean the world to me, and I can't wait to make more beautiful memories together.<br><br>I love you endlessly.";


  // --- STATE ---
  let currentSceneIndex = 0;
  const scenes = document.querySelectorAll('.scene');
  let audioContext;
  let analyser;
  let microphone;
  let isBlowing = false;
  let flippedCards = 0;
  let bgMusic = document.getElementById('bg-music');
  let isMusicPlaying = false;


  // --- UTILS ---
  function switchScene(nextSceneId) {
    const currentScene = document.querySelector('.scene.active');
    const nextScene = document.getElementById(nextSceneId);

    if (currentScene) {
      gsap.to(currentScene, {
        opacity: 0, duration: 0.5, onComplete: () => {
          currentScene.classList.remove('active');
          nextScene.classList.add('active');
          gsap.to(nextScene, { opacity: 1, duration: 0.5 });
          initSceneLogic(nextSceneId);
        }
      });
    } else {
      nextScene.classList.add('active');
      gsap.to(nextScene, { opacity: 1, duration: 0.5 });
      initSceneLogic(nextSceneId);
    }
  }

  function initSceneLogic(sceneId) {
    if (sceneId === 'scene-story') initStory();
    if (sceneId === 'scene-cards') initCards();
    if (sceneId === 'scene-finale') initFinale();
  }


  // --- MUSIC ---
  const SVG_MUSIC_ON = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`;
  const SVG_MUSIC_OFF = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

  const musicToggle = document.getElementById('music-toggle');
  musicToggle.addEventListener('click', () => {
    if (isMusicPlaying) {
      bgMusic.pause();
      musicToggle.innerHTML = SVG_MUSIC_OFF;
    } else {
      bgMusic.play().catch(e => console.log("Audio play blocked", e));
      musicToggle.innerHTML = SVG_MUSIC_ON;
    }
    isMusicPlaying = !isMusicPlaying;
  });

  function tryPlayMusic() {
    if (!isMusicPlaying) {
      bgMusic.play().then(() => {
        isMusicPlaying = true;
        musicToggle.innerHTML = SVG_MUSIC_ON;
      }).catch(e => console.log("Audio play blocked", e));
    }
  }


  // --- SCENE 1: PASSWORD ---
  const pwInput = document.getElementById('password-input');
  const pwSubmit = document.getElementById('password-submit');
  const errorMsg = document.getElementById('error-msg');
  const hintMsg = document.getElementById('hint-msg');
  const attemptsLabel = document.getElementById('attempts-label');
  let attempts = 0;

  const funnyErrors = [
    "You are not actually Habiba, right? 🤨",
    "Try harder to remember! 🙄",
  ];
  let errorAttempts = 0;

  function checkPassword() {
    const val = pwInput.value.trim();
    if (val === PASSWORD) {
      errorMsg.classList.add('hidden');
      tryPlayMusic();
      const overlay = document.getElementById('pw-success-overlay');
      overlay.classList.add('show');
      setTimeout(() => switchScene('scene-candle'), 2500);
    } else {
      attempts++;
      errorAttempts++;
      pwInput.value = '';
      errorMsg.textContent = funnyErrors[(errorAttempts - 1) % funnyErrors.length];
      errorMsg.classList.remove('hidden');
      gsap.fromTo('.pw-card', { x: -10 }, { x: 10, yoyo: true, repeat: 3, duration: 0.1 });

      if (attempts >= 3) {
        hintMsg.classList.remove('hidden');
      }
    }
  }

  pwSubmit.addEventListener('click', checkPassword);
  pwInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkPassword();
  });


  // --- SCENE 2: CANDLE ---
  const btnMic = document.getElementById('btn-mic');
  const btnTap = document.getElementById('btn-tap');
  const c1 = document.getElementById('c1');
  const c2 = document.getElementById('c2');
  const wishText = document.getElementById('wish-text');
  const blowArea = document.getElementById('blow-area');
  const btnStory = document.getElementById('btn-story');

  async function startMic() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      btnMic.textContent = "Listening... Blow now!";

      function checkBlow() {
        if (isBlowing) return;
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        let maxVol = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
          if (dataArray[i] > maxVol) maxVol = dataArray[i];
        }
        let average = sum / bufferLength;

        // Lowered threshold: if average volume is > 20 OR there is a loud peak > 150
        if (average > 20 || maxVol > 150) {
          extinguishCandles();
        } else {
          requestAnimationFrame(checkBlow);
        }
      }
      checkBlow();

    } catch (err) {
      console.error("Mic error:", err);
      alert("Microphone access denied. You can tap to blow instead.");
      btnMic.style.display = 'none';
    }
  }

  function extinguishCandles() {
    isBlowing = true;
    c1.classList.add('extinguished');
    c2.classList.add('extinguished');
    blowArea.style.display = 'none';
    wishText.classList.remove('hidden');
    fireConfetti();
    if (audioContext) audioContext.close();
  }

  btnMic.addEventListener('click', startMic);
  btnTap.addEventListener('click', extinguishCandles);
  btnStory.addEventListener('click', () => switchScene('scene-story'));


  // --- SCENE 3: STORY ---
  function initStory() {
    const chapters = document.querySelectorAll('.chapter');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          gsap.to(entry.target, { opacity: 1, y: 0, duration: 1, ease: "power2.out" });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    chapters.forEach(ch => observer.observe(ch));
  }

  document.getElementById('btn-cards').addEventListener('click', () => switchScene('scene-cards'));


  // --- SCENE 4: CARDS ---
  function initCards() {
    const grid = document.getElementById('cards-grid');
    if (grid.children.length > 0) return; // already inited

    REASONS.forEach((reason, i) => {
      const card = document.createElement('div');
      card.className = 'reason-card';
      card.innerHTML = `
        <div class="card-inner">
          <div class="card-front">${i + 1}</div>
          <div class="card-back">${reason}</div>
        </div>
      `;
      grid.appendChild(card);

      card.addEventListener('click', function () {
        if (!this.classList.contains('flipped')) {
          this.classList.add('flipped');
          flippedCards++;
          document.getElementById('cards-progress').style.width = `${(flippedCards / 22) * 100}%`;
          document.getElementById('cards-count').textContent = `${flippedCards} / 22 revealed`;

          if (flippedCards === 22) {
            document.getElementById('cards-complete').classList.remove('hidden');
          }
        }
      });
    });

    gsap.from('.reason-card', {
      opacity: 0, scale: 0.8, y: 30, stagger: 0.05, duration: 0.5, ease: "back.out(1.7)"
    });
  }

  document.getElementById('btn-finale').addEventListener('click', () => switchScene('scene-finale'));


  // --- SCENE 5: FINALE ---
  function initFinale() {
    document.getElementById('letter-text').innerHTML = LOVE_LETTER;

    // Calculate days
    const start = new Date(ANNIVERSARY_DATE);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    document.getElementById('days-num').textContent = diffDays;

    startFireworks();
  }

  document.getElementById('btn-wish').addEventListener('click', () => {
    for (let i = 0; i < 5; i++) setTimeout(createFirework, i * 200);
  });


  // --- BACKGROUND HEARTS ---
  const floatingIcons = [
    `<svg viewBox="0 0 24 24" fill="var(--c-primary)" stroke="var(--c-primary)" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
    `<svg viewBox="0 0 24 24" fill="none" stroke="var(--c-primary)" stroke-width="2"><path d="M12 22c4.97 0 9-4.03 9-9-4.97 0-9 4.03-9 9z"/><path d="M12 22c-4.97 0-9-4.03-9-9 4.97 0 9-4.03 9 9z"/><path d="M12 2c4.97 0 9 4.03 9 9-4.97 0-9-4.03-9-9z"/><path d="M12 2c-4.97 0-9 4.03-9 9 4.97 0 9-4.03 9-9z"/><circle cx="12" cy="12" r="3"/></svg>`,
    `<svg viewBox="0 0 24 24" fill="var(--c-secondary)" stroke="var(--c-secondary)" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
  ];

  function createFloatingHeart() {
    const heart = document.createElement('div');
    heart.className = 'heart-float';
    heart.innerHTML = floatingIcons[Math.floor(Math.random() * floatingIcons.length)];
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = (Math.random() * 5 + 5) + 's';
    document.getElementById('floating-hearts').appendChild(heart);
    setTimeout(() => heart.remove(), 10000);
  }
  setInterval(createFloatingHeart, 1000);


  // --- CONFETTI (Using canvas-confetti library) ---
  function fireConfetti() {
    var duration = 3 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function () {
      var timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      var particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }));
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }));
    }, 250);
  }

  // --- FIREWORKS (Canvas) ---
  const fwCanvas = document.getElementById('fireworks-canvas');
  const fwCtx = fwCanvas?.getContext('2d');
  let fwParticles = [];
  function startFireworks() {
    if (!fwCanvas) return;
    fwCanvas.width = window.innerWidth;
    fwCanvas.height = window.innerHeight;
    setInterval(createFirework, 2000);
    animateFireworks();
  }
  function createFirework() {
    const x = Math.random() * fwCanvas.width;
    const y = Math.random() * fwCanvas.height / 2;
    for (let i = 0; i < 50; i++) {
      fwParticles.push({
        x, y,
        vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10,
        life: 1,
        color: ['#FF6B9D', '#FFD700', '#FFF', '#ffb6c1'][Math.floor(Math.random() * 4)]
      });
    }
  }
  function animateFireworks() {
    if (!fwCanvas) return;
    fwCtx.fillStyle = 'rgba(26, 10, 16, 0.2)';
    fwCtx.fillRect(0, 0, fwCanvas.width, fwCanvas.height);
    for (let i = fwParticles.length - 1; i >= 0; i--) {
      let p = fwParticles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life -= 0.02;
      fwCtx.fillStyle = p.color;
      fwCtx.globalAlpha = p.life;
      fwCtx.beginPath(); fwCtx.arc(p.x, p.y, 2, 0, Math.PI * 2); fwCtx.fill();
      if (p.life <= 0) fwParticles.splice(i, 1);
    }
    fwCtx.globalAlpha = 1;
    requestAnimationFrame(animateFireworks);
  }


  // --- RESIZE LISTENER ---
  window.addEventListener('resize', () => {
    if (fwCanvas) { fwCanvas.width = window.innerWidth; fwCanvas.height = window.innerHeight; }
  });


  // Start
  document.getElementById('scene-password').classList.add('active');
  gsap.to('#scene-password', { opacity: 1, duration: 1 });

});
