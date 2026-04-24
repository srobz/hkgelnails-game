/*
  Holdyn's Nail Studio - Shared Game Logic
  ========================================
  HOW TO ADD YOUR IMAGES:
  1. Drop character headshots into: assets/characters/
  2. Drop hand shots (with transparent nails) into: assets/characters/
  3. Drop nail pattern PNGs into: assets/nails/
  4. Update the CONFIG paths below to match your filenames.

  HOW TO ADD SOUNDS:
  1. Drop MP3 files into: sounds/
  2. Update the CONFIG.soundPaths object below.
  3. The playSound() function will handle browser autoplay rules for you.
*/

const CONFIG = {
  /* ========== CHARACTERS ========== */
  characters: [
    {
      id: 'char1',
      name: 'Holdyn',     // <-- rename to your character's name
      head: 'assets/characters/holdyn.JPG',
      hand: 'assets/characters/holdyn_hands.JPG',
      // If head + hand are one combined image, set combined: 'assets/char1.png' and leave hand as ''
      combined: '',
      // Position of the head on the studio scene (percentages of the scene container)
      headPos: { left: '28%', top: '8%',  width: '22%' },
      // Position of the hand on the studio scene
      handPos: { left: '30%', top: '35%', width: '40%' },
    },
    {
      id: 'char2',
      name: 'Andy',
      head: 'assets/characters/andy.JPG',
      hand: 'assets/characters/andy_hands.JPG',
      combined: '',
      headPos: { left: '28%', top: '8%',  width: '22%' },
      handPos: { left: '30%', top: '35%', width: '40%' },
    },
    {
      id: 'char3',
      name: 'Koji',
      head: 'assets/characters/koji.JPG',
      hand: 'assets/characters/koji_hands.JPG',
      combined: '',
      headPos: { left: '28%', top: '8%',  width: '22%' },
      handPos: { left: '30%', top: '35%', width: '40%' },
    },
    {
      id: 'char4',
      name: 'Marceline',
      head: 'assets/characters/marceline.JPG',
      hand: 'assets/characters/marceline_hands.JPG',
      combined: '',
      headPos: { left: '28%', top: '8%',  width: '22%' },
      handPos: { left: '30%', top: '35%', width: '40%' },
    },
  ],

  /* ========== NAIL PATTERNS ========== */
  nailPatterns: [
    { id: 'nail1', name: 'Pattern 1', image: 'assets/nails/nail_1.JPG', thumb: 'assets/nails/nail_1.JPG' },
    { id: 'nail2', name: 'Pattern 2', image: 'assets/nails/nail_2.JPG', thumb: 'assets/nails/nail_2.JPG' },
    { id: 'nail3', name: 'Pattern 3', image: 'assets/nails/nail_3.JPG', thumb: 'assets/nails/nail_3.JPG' },
    { id: 'nail4', name: 'Pattern 4', image: 'assets/nails/nail_4.JPG', thumb: 'assets/nails/nail_4.JPG' },
    { id: 'nail5', name: 'Pattern 5', image: 'assets/nails/nail_5.JPG', thumb: 'assets/nails/nail_5.JPG' },
    { id: 'nail6', name: 'Pattern 6', image: 'assets/nails/nail_6.JPG', thumb: 'assets/nails/nail_6.JPG' },
  ],

  /* ========== BACKGROUNDS ========== */
  backgrounds: {
    studio: 'assets/office_bkg.JPG',
    desk:   'assets/desk_bkg.JPG',
    igStory: 'assets/insta_story.PNG',
    main:   'assets/main_bkg.png',
    charSelect: 'assets/char_sel.png',
  },

  /* ========== SOUNDS ========== */
  // IMPORTANT: Browsers block audio until the user clicks at least once.
  // The game initializes audio on first click so this just works.
  soundPaths: {
    click:        'sounds/click.mp3',
    enterStudio:  'sounds/enter-studio.mp3',
    // Holdyn voice comments – one is picked randomly when applying a nail pattern
    comments: [
      'sounds/holdyn-comment1.mp3',
      'sounds/holdyn-comment2.mp3',
      'sounds/holdyn-comment3.mp3',
      'sounds/holdyn-comment4.mp3',
      'sounds/holdyn-comment5.mp3',
    ],
  },
};

/* ---------- STATE ---------- */
const state = {
  character: null,   // selected character object
  nail: null,        // selected nail pattern object
  audioCtx: null,    // initialized on first user interaction
  sounds: {},        // cached Audio objects
};

/* ---------- URL HELPERS ---------- */
function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function setParam(name, value) {
  const url = new URL(window.location.href);
  url.searchParams.set(name, value);
  window.history.replaceState({}, '', url);
}

/* ---------- SOUND SYSTEM ---------- */
// Audio is locked behind a user-gesture in modern browsers.
// We unlock it on the first click anywhere in the document.
function initAudio() {
  if (state.audioCtx) return;
  state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // Pre-load all sounds so they can play instantly later
  Object.entries(CONFIG.soundPaths).forEach(([key, path]) => {
    if (Array.isArray(path)) {
      state.sounds[key] = path.map(p => new Audio(p));
    } else {
      state.sounds[key] = new Audio(path);
    }
  });
}

function playSound(key) {
  initAudio();
  // Small delay to ensure audio context is unlocked on the current click frame
  if (state.audioCtx && state.audioCtx.state === 'suspended') {
    state.audioCtx.resume();
  }
  const src = state.sounds[key];
  if (!src) return;

  if (Array.isArray(src)) {
    // pick random from array (e.g. comments)
    const clip = src[Math.floor(Math.random() * src.length)];
    if (clip) {
      clip.currentTime = 0;
      clip.play().catch(() => {}); // swallow autoplay errors
    }
  } else {
    src.currentTime = 0;
    src.play().catch(() => {});
  }
}

// Auto-unlock audio on first click anywhere
document.addEventListener('click', initAudio, { once: true });

/* ---------- PROMPTS ---------- */
async function loadPrompts() {
  try {
    const res = await fetch('prompts.csv');
    const text = await res.text();
    return text.trim().split('\n').filter(line => line.trim() !== '');
  } catch (e) {
    console.warn('Could not load prompts.csv, using fallback.');
    return [
      "for a fresh set, bestie!",
      "to slay the 'gram with these claws.",
      "because your nailbeds are perfect.",
      "for a mani that screams main character.",
      "to serve looks and serve nails.",
      "for that post-studio glow.",
      "because your cuticles are thriving.",
      "for a sparkle moment.",
      "to match your main-character energy.",
      "because nobody does nails like Holdyn."
    ];
  }
}

/* ---------- TYPEWRITER ---------- */
async function runTypewriter(elementId, baseText) {
  const prompts = await loadPrompts();
  const prompt = prompts[Math.floor(Math.random() * prompts.length)];
  const el = document.getElementById(elementId);
  if (!el) return;

  el.textContent = baseText;
  let i = 0;
  const type = () => {
    if (i < prompt.length) {
      el.textContent = baseText + prompt.substring(0, i + 1) + '...';
      i++;
      setTimeout(type, 45);
    }
  };
  type();
}

/* ---------- CHARACTER SELECT ---------- */
function renderCharacterGrid(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.innerHTML = '';
  CONFIG.characters.forEach(char => {
    const btn = document.createElement('div');
    btn.className = 'character-card';
    btn.innerHTML = `
      <img src="${char.head}" alt="${char.name}" loading="lazy">
      <span class="character-label">${char.name}</span>
    `;
    btn.addEventListener('click', () => {
      playSound('click');
      state.character = char;
      window.location.href = `studio.html?character=${char.id}`;
    });
    container.appendChild(btn);
  });
}

/* ---------- STUDIO / NAIL LOGIC ---------- */
function initStudio() {
  const charId = getParam('character');
  const char = CONFIG.characters.find(c => c.id === charId);
  if (!char) {
    window.location.href = 'character-select.html';
    return;
  }
  state.character = char;

  // Render character layers
  const scene = document.getElementById('scene');
  if (!scene) return;

  // If using a combined image, only render that. Otherwise render head + hand.
  if (char.combined) {
    scene.insertAdjacentHTML('beforeend', `
      <img src="${char.combined}" class="layer-character-combined" id="char-combined" alt="${char.name}">
    `);
  } else {
    scene.insertAdjacentHTML('beforeend', `
      <img src="${char.head}" class="layer-head" id="char-head" alt="${char.name}" style="left:${char.headPos.left};top:${char.headPos.top};width:${char.headPos.width};">
      <img src="${char.hand}" class="layer-hand" id="char-hand" alt="hand" style="left:${char.handPos.left};top:${char.handPos.top};width:${char.handPos.width};">
      <img src="" class="layer-nails" id="nail-overlay" alt="nails" style="left:${char.handPos.left};top:${char.handPos.top};width:${char.handPos.width};">
    `);
  }

  // Render nail swatches
  const swatchTray = document.getElementById('swatch-tray');
  if (swatchTray) {
    swatchTray.innerHTML = '';
    CONFIG.nailPatterns.forEach((pattern, idx) => {
      const swatch = document.createElement('button');
      swatch.className = 'swatch';
      swatch.dataset.id = pattern.id;
      swatch.innerHTML = `<img src="${pattern.thumb}" alt="${pattern.name}" loading="lazy">`;
      swatch.addEventListener('click', () => applyNailPattern(pattern));
      swatchTray.appendChild(swatch);
    });
  }
}

function applyNailPattern(pattern) {
  playSound('click');
  playSound('comments');

  state.nail = pattern;

  // Update UI active state
  document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
  const active = document.querySelector(`.swatch[data-id="${pattern.id}"]`);
  if (active) active.classList.add('active');

  // Overlay nail image on hand
  const overlay = document.getElementById('nail-overlay');
  if (overlay) {
    overlay.src = pattern.image;
    overlay.style.opacity = '1';
  }
}

/* ---------- SAVE TO IG STORY ---------- */
async function saveStory() {
  playSound('click');
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');

  function loadImg(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed: ' + src));
      img.src = src;
    });
  }

  try {
    // 1. IG story background
    const bg = await loadImg(CONFIG.backgrounds.igStory);
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    const char = state.character;
    if (!char) throw new Error('No character selected');

    // 2. Draw character (head + hand + nails)
    // We composite the same way the studio does, but scaled to fit the story canvas nicely.
    const storyCharWidth = canvas.width * 0.7;
    const storyCharX = (canvas.width - storyCharWidth) / 2;
    const storyCharY = canvas.height * 0.35;

    if (char.combined) {
      const cImg = await loadImg(char.combined);
      const ratio = cImg.height / cImg.width;
      const h = storyCharWidth * ratio;
      ctx.drawImage(cImg, storyCharX, storyCharY, storyCharWidth, h);
      if (state.nail) {
        const nImg = await loadImg(state.nail.image);
        // If combined, we don't have per-hand positioning – assume nail image aligns to combined
        ctx.drawImage(nImg, storyCharX, storyCharY, storyCharWidth, h);
      }
    } else {
      // Head
      const headImg = await loadImg(char.head);
      const headW = storyCharWidth * 0.55;
      const headH = headW * (headImg.height / headImg.width);
      const headX = storyCharX + storyCharWidth * 0.22;
      const headY = storyCharY;
      ctx.drawImage(headImg, headX, headY, headW, headH);

      // Hand
      const handImg = await loadImg(char.hand);
      const handW = storyCharWidth * 0.8;
      const handH = handW * (handImg.height / handImg.width);
      const handX = storyCharX + storyCharWidth * 0.1;
      const handY = headY + headH * 0.85;
      ctx.drawImage(handImg, handX, handY, handW, handH);

      // Nails
      if (state.nail) {
        const nailImg = await loadImg(state.nail.image);
        ctx.drawImage(nailImg, handX, handY, handW, handH);
      }
    }

    // 3. Text
    ctx.font = '48px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const mainText = `Just got my nails done and pussy popped by Holdyn! Which pattern should I try next?`;
    const textX = canvas.width / 2;
    const textY = canvas.height - 260;
    const maxW = canvas.width - 120;

    ctx.shadowColor = '#ff009c';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ffffff';

    wrapText(ctx, mainText, textX, textY, maxW, 56);

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    ctx.font = '32px "Comic Sans MS", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('https://srobz.github.io/hkgelnails-game/', textX, canvas.height - 120);

    // 4. Download
    const link = document.createElement('a');
    link.download = 'holdyn-nails-story.png';
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Save failed:', err);
    alert('Could not save image. Make sure all images are loaded and try again.');
  }
}

function wrapText(ctx, text, x, y, maxW, lineH) {
  const words = text.split(' ');
  let line = '';
  let curY = y;
  for (let n = 0; n < words.length; n++) {
    const test = line + words[n] + ' ';
    if (ctx.measureText(test).width > maxW && n > 0) {
      ctx.fillText(line, x, curY);
      line = words[n] + ' ';
      curY += lineH;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, curY);
}
