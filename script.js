// AURA Dashboard - Main Script
// Let's make this dashboard come alive!

(function() {
  "use strict";

  // Setup the canvas for our particle background
  const canvas = document.getElementById("bg-canvas");
  const ctx = canvas.getContext("2d");
  let particles = [];
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // User preferences - saved in localStorage so they persist
  let config = {
    density: parseInt(localStorage.getItem("aura-density") || "65", 10),
    speed: parseFloat(localStorage.getItem("aura-speed") || "0.6", 10),
    noise: localStorage.getItem("aura-noise") !== "false",
    bgStyle: localStorage.getItem("aura-bg-style") || "pulse"
  };

  // Track mouse position for those cool particle interactions
  let mouse = { x: null, y: null, targetX: null, targetY: null, radius: 140 };

  // Make sure the canvas fills the screen properly
  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Our particle color palette - nice and subtle
  const PARTICLE_COLORS = ["75,214,255", "167,139,250", "255,122,209"];

  // Create a bunch of particles with random properties
  function initParticles() {
    const maxCount = config.density;
    particles = Array.from({ length: maxCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.8,
      vx: (Math.random() - 0.5) * config.speed,
      vy: (Math.random() - 0.5) * config.speed,
      alpha: Math.random() * 0.35 + 0.15,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      twinkleSpeed: Math.random() * 0.01 + 0.003,
      twinklePhase: Math.random() * Math.PI * 2
    }));
  }

  // The main animation loop - draws everything each frame
  function drawParticles(t) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Different background styles based on user preference
    if (config.bgStyle === "nordic") {
      // Nordic aurora style - green and blue gradients
      ctx.fillStyle = "rgba(5, 12, 18, 1)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      const aur = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
      aur.addColorStop(0, "rgba(16, 185, 129, 0.06)");
      aur.addColorStop(0.5, "rgba(75, 214, 255, 0.04)");
      aur.addColorStop(1, "rgba(3, 4, 8, 1)");
      ctx.fillStyle = aur;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    } else if (config.bgStyle === "cyber") {
      // Cyberpunk style - pink radial gradient
      ctx.fillStyle = "rgba(4, 2, 8, 1)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      const rad = ctx.createRadialGradient(window.innerWidth / 2, window.innerHeight / 2, 10, window.innerWidth / 2, window.innerHeight / 2, window.innerWidth);
      rad.addColorStop(0, "rgba(255, 122, 209, 0.05)");
      rad.addColorStop(1, "rgba(3, 4, 8, 1)");
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    } else {
      // Default pulse style - moving neon orbs
      const speedFactor = t * 0.0003;
      const x1 = 20 + Math.sin(speedFactor) * 15;
      const y1 = 20 + Math.cos(speedFactor) * 15;
      const x2 = 80 + Math.cos(speedFactor) * 10;
      const y2 = 15 + Math.sin(speedFactor) * 15;

      const grad = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
      grad.addColorStop(0, "#05060a");
      grad.addColorStop(1, "#0a0d16");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // First neon orb - cyan
      ctx.beginPath();
      const orb1 = ctx.createRadialGradient(window.innerWidth * (x1/100), window.innerHeight * (y1/100), 0, window.innerWidth * (x1/100), window.innerHeight * (y1/100), window.innerWidth * 0.4);
      orb1.addColorStop(0, "rgba(75, 214, 255, 0.12)");
      orb1.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = orb1;
      ctx.arc(window.innerWidth * (x1/100), window.innerHeight * (y1/100), window.innerWidth * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Second neon orb - purple
      ctx.beginPath();
      const orb2 = ctx.createRadialGradient(window.innerWidth * (x2/100), window.innerHeight * (y2/100), 0, window.innerWidth * (x2/100), window.innerHeight * (y2/100), window.innerWidth * 0.4);
      orb2.addColorStop(0, "rgba(167, 139, 250, 0.1)");
      orb2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = orb2;
      ctx.arc(window.innerWidth * (x2/100), window.innerHeight * (y2/100), window.innerWidth * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Now let's update and draw each particle
    for (const p of particles) {
      // Move the particle based on its velocity
      p.x += p.vx;
      p.y += p.vy;

      // Make particles react to mouse movement - they get pushed away
      if (mouse.x !== null && mouse.y !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          p.x += Math.cos(angle) * force * 1.5;
          p.y += Math.sin(angle) * force * 1.5;
        }
      }

      // Wrap particles around the screen edges
      if (p.x < -10) p.x = window.innerWidth + 10;
      if (p.x > window.innerWidth + 10) p.x = -10;
      if (p.y < -10) p.y = window.innerHeight + 10;
      if (p.y > window.innerHeight + 10) p.y = -10;

      // Make them twinkle nicely
      const twinkle = (Math.sin(t * p.twinkleSpeed + p.twinklePhase) + 1) / 2;
      const a = p.alpha * (0.4 + twinkle * 0.6);

      // Draw the glow around each particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
      glow.addColorStop(0, `rgba(${p.color},${a * 0.45})`);
      glow.addColorStop(1, `rgba(${p.color},0)`);
      ctx.fillStyle = glow;
      ctx.fill();

      // Draw the actual particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
      ctx.fill();
    }

    // Keep the animation going unless user prefers reduced motion
    if (!reduceMotion) requestAnimationFrame(drawParticles);
  }

  // Initialize everything
  resizeCanvas();
  initParticles();
  window.addEventListener("resize", () => { resizeCanvas(); initParticles(); });
  requestAnimationFrame(drawParticles);
  if (reduceMotion) drawParticles(0);

  // Track mouse movement for those cool particle interactions
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  // =========================================================
  // CLOCK & GREETING
  // =========================================================
  const elH = document.getElementById("clock-h");
  const elM = document.getElementById("clock-m");
  const elS = document.getElementById("clock-s");
  const elDate = document.getElementById("hero-date");
  const elGreeting = document.getElementById("greeting");

  // Helper to add leading zeros to numbers
  function pad(n) { return n.toString().padStart(2, "0"); }

  // Update the clock display every second
  function updateClock() {
    const now = new Date();
    const h = pad(now.getHours());
    const m = pad(now.getMinutes());
    const s = pad(now.getSeconds());
    if (elH.textContent !== h) elH.textContent = h;
    if (elM.textContent !== m) elM.textContent = m;
    elS.textContent = s;

    // Change greeting based on time of day
    const hour = now.getHours();
    let greeting = "Good evening.";
    if (hour < 5) greeting = "Still up? The night is quiet.";
    else if (hour < 12) greeting = "Good morning.";
    else if (hour < 18) greeting = "Good afternoon.";
    elGreeting.textContent = greeting;

    // Show the full date
    elDate.textContent = now.toLocaleDateString(undefined, {
      weekday: "long", month: "long", day: "numeric"
    });
  }
  updateClock();
  setInterval(updateClock, 1000);

  // =========================================================
  // THEME CONTROL (ACCENTS)
  // =========================================================
  const THEMES = ["cyan", "violet", "rose"];
  const themeToggle = document.getElementById("theme-toggle");
  let themeIndex = parseInt(localStorage.getItem("aura-theme-idx") || "0", 10);

  // Apply the selected theme to the page
  function applyTheme() {
    const t = THEMES[themeIndex];
    if (t === "cyan") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", t);
  }

  // Cycle through the available themes
  function cycleTheme() {
    themeIndex = (themeIndex + 1) % THEMES.length;
    localStorage.setItem("aura-theme-idx", themeIndex);
    applyTheme();
  }
  applyTheme();
  themeToggle.addEventListener("click", cycleTheme);

  // =========================================================
  // CUSTOMIZATION OPTIONS MODAL
  // =========================================================
  const settingsModal = document.getElementById("settings-modal");
  const settingsToggle = document.getElementById("settings-toggle");
  const settingsClose = document.getElementById("settings-close");
  const densitySlider = document.getElementById("particle-density");
  const speedSlider = document.getElementById("particle-speed");
  const noiseToggle = document.getElementById("toggle-noise");
  const bgStyleSelect = document.getElementById("bg-style");
  const noiseOverlay = document.querySelector(".noise-overlay");

  // Open and close the settings modal
  settingsToggle.addEventListener("click", () => settingsModal.classList.add("open"));
  settingsClose.addEventListener("click", () => settingsModal.classList.remove("open"));
  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) settingsModal.classList.remove("open");
  });

  // Load saved settings and apply them to the UI
  densitySlider.value = config.density;
  speedSlider.value = config.speed * 5;
  bgStyleSelect.value = config.bgStyle;
  if (!config.noise) {
    noiseToggle.classList.remove("active");
    noiseToggle.textContent = "Disabled";
    noiseOverlay.classList.add("disabled");
  }

  // Handle particle density changes
  densitySlider.addEventListener("input", (e) => {
    config.density = parseInt(e.target.value, 10);
    localStorage.setItem("aura-density", config.density);
    initParticles();
  });

  // Handle particle speed changes
  speedSlider.addEventListener("input", (e) => {
    config.speed = parseFloat(e.target.value) / 5;
    localStorage.setItem("aura-speed", config.speed);
    initParticles();
  });

  // Toggle the noise overlay on/off
  noiseToggle.addEventListener("click", () => {
    config.noise = !config.noise;
    localStorage.setItem("aura-noise", config.noise);
    if (config.noise) {
      noiseToggle.classList.add("active");
      noiseToggle.textContent = "Enabled";
      noiseOverlay.classList.remove("disabled");
    } else {
      noiseToggle.classList.remove("active");
      noiseToggle.textContent = "Disabled";
      noiseOverlay.classList.add("disabled");
    }
  });

  // Handle background style changes
  bgStyleSelect.addEventListener("change", (e) => {
    config.bgStyle = e.target.value;
    localStorage.setItem("aura-bg-style", config.bgStyle);
  });

  // =========================================================
  // DYNAMIC BENTO DRAG & DROP
  // =========================================================
  const grid = document.getElementById("widget-grid");
  const dragHint = document.getElementById("drag-hint");
  let dragSrcEl = null;

  // Load the saved widget layout from localStorage
  function loadGridLayout() {
    const layout = JSON.parse(localStorage.getItem("aura-grid-layout"));
    if (layout) {
      const cards = Array.from(grid.querySelectorAll(".card"));
      layout.forEach(widgetName => {
        const match = cards.find(c => c.getAttribute("data-widget") === widgetName);
        if (match) grid.appendChild(match);
      });
    }
  }

  // Save the current widget layout to localStorage
  function saveGridLayout() {
    const layout = Array.from(grid.querySelectorAll(".card")).map(c => c.getAttribute("data-widget"));
    localStorage.setItem("aura-grid-layout", JSON.stringify(layout));
  }

  // Handle the start of a drag operation
  function handleDragStart(e) {
    // Only allow dragging if user clicked on the handle (:::)
    const isHandle = e.target.closest(".drag-handle");
    if (!isHandle) {
      e.preventDefault();
      return;
    }
    dragSrcEl = this;
    this.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", this.innerHTML);
    dragHint.classList.add("show");
  }

  // Allow dropping by preventing default behavior
  function handleDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    return false;
  }

  // Highlight the target when dragging over it
  function handleDragEnter(e) {
    if (this !== dragSrcEl) {
      this.style.borderColor = "var(--accent-1)";
    }
  }

  // Remove highlight when leaving the target
  function handleDragLeave(e) {
    this.style.borderColor = "";
  }

  // Handle the actual drop - reorder the widgets
  function handleDrop(e) {
    if (e.stopPropagation) e.stopPropagation();
    
    if (dragSrcEl !== this) {
      // Figure out where to insert the dragged widget
      const cards = Array.from(grid.children);
      const srcIndex = cards.indexOf(dragSrcEl);
      const targetIndex = cards.indexOf(this);

      if (srcIndex < targetIndex) {
        grid.insertBefore(dragSrcEl, this.nextSibling);
      } else {
        grid.insertBefore(dragSrcEl, this);
      }
      saveGridLayout();
    }
    return false;
  }

  // Clean up after drag is complete
  function handleDragEnd(e) {
    this.classList.remove("dragging");
    dragHint.classList.remove("show");
    const cards = grid.querySelectorAll(".card");
    cards.forEach(card => card.style.borderColor = "");
  }

  // Set up all the drag event listeners for a widget
  function setupDragEvents(card) {
    card.addEventListener("dragstart", handleDragStart, false);
    card.addEventListener("dragenter", handleDragEnter, false);
    card.addEventListener("dragover", handleDragOver, false);
    card.addEventListener("dragleave", handleDragLeave, false);
    card.addEventListener("drop", handleDrop, false);
    card.addEventListener("dragend", handleDragEnd, false);
  }

  // Initialize drag & drop for all widgets
  grid.querySelectorAll(".card").forEach(setupDragEvents);
  loadGridLayout();

  // Reset button to restore default layout
  document.getElementById("reset-layout-btn").addEventListener("click", () => {
    localStorage.removeItem("aura-grid-layout");
    window.location.reload();
  });

  // =========================================================
  // FOCUS POMODORO TIMER
  // =========================================================
  const pomoPhase = document.getElementById("pomodoro-phase");
  const timerTime = document.getElementById("timer-time");
  const pomoStartPause = document.getElementById("pomo-start-pause");
  const pomoReset = document.getElementById("pomo-reset");
  const progressCircle = document.getElementById("timer-progress-circle");
  const pomoPills = document.querySelectorAll(".focus-pills .focus-pill");

  let pomoTimeRemaining = 1500; // 25 minutes in seconds
  let pomoDuration = 1500;
  let pomoInterval = null;
  let pomoIsRunning = false;
  let pomoType = "work"; // can be: work, short, long

  // Timer configurations for different focus modes
  const POMO_CONFIGS = {
    work: 1500,  // 25 minutes
    short: 300,  // 5 minutes
    long: 900    // 15 minutes
  };

  // Play a nice chime sound when timer completes (using Web Audio API)
  function playPomoChime() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5 note

      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.55);
    } catch (e) {
      console.warn("Audio Context blocked or unsupported.");
    }
  }

  // Update the timer display and progress circle
  function updateTimerDisplay() {
    const m = Math.floor(pomoTimeRemaining / 60);
    const s = pomoTimeRemaining % 60;
    timerTime.textContent = `${pad(m)}:${pad(s)}`;

    // Update the circular progress indicator
    const progressPercent = pomoTimeRemaining / pomoDuration;
    const offset = 283 - (progressPercent * 283);
    progressCircle.style.strokeDashoffset = offset;
  }

  // Start or pause the timer
  function startPausePomo() {
    if (pomoIsRunning) {
      // Pause the timer
      clearInterval(pomoInterval);
      pomoStartPause.textContent = "Start";
      pomoIsRunning = false;
    } else {
      // Start the timer
      pomoIsRunning = true;
      pomoStartPause.textContent = "Pause";
      pomoInterval = setInterval(() => {
        pomoTimeRemaining--;
        updateTimerDisplay();

        // Timer finished!
        if (pomoTimeRemaining <= 0) {
          clearInterval(pomoInterval);
          pomoIsRunning = false;
          pomoStartPause.textContent = "Start";
          playPomoChime();
          
          // Track completed pomodoros
          let focusVisits = parseInt(localStorage.getItem("aura-pomo-done") || "0", 10) + 1;
          localStorage.setItem("aura-pomo-done", focusVisits);
          updateStats();

          // Show appropriate message based on timer type
          if (pomoType === "work") {
            pomoPhase.textContent = "Break time!";
            alert("Great work! Take a break.");
          } else {
            pomoPhase.textContent = "Focus cycle complete.";
            alert("Break finished! Ready to focus?");
          }
          resetPomo();
        }
      }, 1000);
    }
  }

  // Reset the timer to the beginning
  function resetPomo() {
    clearInterval(pomoInterval);
    pomoIsRunning = false;
    pomoStartPause.textContent = "Start";
    pomoTimeRemaining = POMO_CONFIGS[pomoType];
    pomoDuration = POMO_CONFIGS[pomoType];
    updateTimerDisplay();
  }

  // Wire up the timer controls
  pomoStartPause.addEventListener("click", startPausePomo);
  pomoReset.addEventListener("click", resetPomo);

  // Handle the focus mode pills (work/short break/long break)
  pomoPills.forEach(pill => {
    pill.addEventListener("click", (e) => {
      pomoPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      pomoType = pill.getAttribute("data-type");
      pomoPhase.textContent = pill.textContent;
      resetPomo();
    });
  });

  // Initialize the timer
  resetPomo();

  // =========================================================
  // SPOTIFY PLAYER INTEGRATION
  // =========================================================
  
  // You'll need to set up your own Spotify Developer account and get a Client ID
  // Check the README for instructions on how to do this
  const SPOTIFY_CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID'; 
  const SPOTIFY_REDIRECT_URI = window.location.origin + '/callback.html';
  const SPOTIFY_SCOPES = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-library-read',
    'user-read-playback-state',
    'user-modify-playback-state'
  ];

  // Grab all the DOM elements we need for the Spotify widget
  const spotifyAuthSection = document.getElementById('spotify-auth-section');
  const spotifyPlayerSection = document.getElementById('spotify-player-section');
  const spotifyLoginBtn = document.getElementById('spotify-login-btn');
  const spotifyPlay = document.getElementById('spotify-play');
  const spotifyPlayIcon = document.getElementById('spotify-play-icon');
  const spotifyArt = document.getElementById('spotify-art');
  const spotifyArtDisk = document.getElementById('spotify-art-disk');
  const spotifyCoverImg = document.getElementById('spotify-cover-img');
  const spotifyProgressFill = document.getElementById('spotify-progress-fill');
  const spotifyProgressSlider = document.getElementById('spotify-progress-slider');
  const spotifyTimeCur = document.getElementById('spotify-time-cur');
  const spotifyTimeDur = document.getElementById('spotify-time-dur');
  const spotifyTrackName = document.getElementById('spotify-track-name');
  const spotifyArtistName = document.getElementById('spotify-artist-name');
  const spotifyNext = document.getElementById('spotify-next');
  const spotifyPrev = document.getElementById('spotify-prev');
  const spotifyVolumeSlider = document.getElementById('spotify-volume-slider');
  const spotifySearchInput = document.getElementById('spotify-search-input');
  const spotifySearchBtn = document.getElementById('spotify-search-btn');
  const spotifySearchResults = document.getElementById('spotify-search-results');
  const spotifyVisualizer = document.getElementById('spotify-visualizer');

  let spotifyPlayer = null;
  let spotifyAccessToken = null;
  let spotifyDeviceId = null;
  let currentTrackUri = null;

  // Generate a random string for the PKCE authentication flow
  function generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  // Create a code challenge for secure Spotify authentication
  async function generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  // Start the Spotify OAuth login process
  async function loginToSpotify() {
    const codeVerifier = generateRandomString(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateRandomString(16);

    localStorage.setItem('spotify_code_verifier', codeVerifier);
    localStorage.setItem('spotify_state', state);

    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.append('client_id', SPOTIFY_CLIENT_ID);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', SPOTIFY_REDIRECT_URI);
    authUrl.searchParams.append('scope', SPOTIFY_SCOPES.join(' '));
    authUrl.searchParams.append('code_challenge_method', 'S256');
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('state', state);

    window.location.href = authUrl.toString();
  }

  // Exchange the authorization code for an access token
  async function exchangeCodeForToken(code) {
    const codeVerifier = localStorage.getItem('spotify_code_verifier');
    const state = localStorage.getItem('spotify_state');
    const storedState = new URLSearchParams(window.location.search).get('state');

    if (state !== storedState) {
      console.error('State mismatch - possible security issue');
      return null;
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    });

    const data = await response.json();
    if (data.access_token) {
      spotifyAccessToken = data.access_token;
      localStorage.setItem('spotify_access_token', spotifyAccessToken);
      localStorage.setItem('spotify_refresh_token', data.refresh_token);
      return data.access_token;
    }
    return null;
  }

  // Get a new access token when the old one expires
  async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('spotify_refresh_token');
    if (!refreshToken) return null;

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json();
    if (data.access_token) {
      spotifyAccessToken = data.access_token;
      localStorage.setItem('spotify_access_token', spotifyAccessToken);
      if (data.refresh_token) {
        localStorage.setItem('spotify_refresh_token', data.refresh_token);
      }
      return data.access_token;
    }
    return null;
  }

  // Set up the Spotify Web Playback SDK
  function initializeSpotifyPlayer(token) {
    if (window.Spotify) {
      spotifyPlayer = new Spotify.Player({
        name: 'AURA Dashboard',
        getOAuthToken: cb => { cb(token); },
        volume: 0.7
      });

      // Player is ready - we can start using it!
      spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('Spotify player ready with Device ID:', device_id);
        spotifyDeviceId = device_id;
        spotifyAuthSection.style.display = 'none';
        spotifyPlayerSection.style.display = 'block';
        transferPlaybackToDevice();
      });

      // Player went offline for some reason
      spotifyPlayer.addListener('not_ready', ({ device_id }) => {
        console.log('Spotify device went offline:', device_id);
      });

      // Track info changed - update the UI
      spotifyPlayer.addListener('player_state_changed', state => {
        if (!state) return;
        updateSpotifyUI(state);
      });

      // Something went wrong during initialization
      spotifyPlayer.addListener('initialization_error', ({ message }) => {
        console.error('Spotify initialization error:', message);
      });

      // Authentication failed - try to refresh the token
      spotifyPlayer.addListener('authentication_error', ({ message }) => {
        console.error('Spotify authentication error:', message);
        refreshAccessToken().then(token => {
          if (token) initializeSpotifyPlayer(token);
        });
      });

      // Account-related error
      spotifyPlayer.addListener('account_error', ({ message }) => {
        console.error('Spotify account error:', message);
      });

      // Connect to Spotify!
      spotifyPlayer.connect();
    }
  }

  // Tell Spotify to play music on this device
  async function transferPlaybackToDevice() {
    if (!spotifyDeviceId || !spotifyAccessToken) return;

    try {
      await fetch(`https://api.spotify.com/v1/me/player`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${spotifyAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_ids: [spotifyDeviceId],
          play: false,
        }),
      });
    } catch (error) {
      console.error('Error transferring playback to this device:', error);
    }
  }

  // Update the widget UI with the current track information
  function updateSpotifyUI(state) {
    const track = state.track_window.current_track;
    currentTrackUri = track.uri;

    spotifyTrackName.textContent = track.name;
    spotifyArtistName.textContent = track.artists.map(a => a.name).join(', ');
    
    if (track.album.images[0]) {
      spotifyCoverImg.src = track.album.images[0].url;
    }

    // Update the progress bar and time display
    const position = state.position;
    const duration = state.duration;
    const progress = (position / duration) * 100;

    spotifyProgressSlider.value = position;
    spotifyProgressSlider.max = duration;
    spotifyProgressFill.style.width = `${progress}%`;
    spotifyTimeCur.textContent = formatTime(position / 1000);
    spotifyTimeDur.textContent = formatTime(duration / 1000);

    // Update the play/pause.button and visualizer
    if (state.paused) {
      spotifyPlayIcon.innerHTML = `<path d="M8 5v14l11-7z" fill="currentColor"/>`;
      spotifyArt.classList.remove('spin');
      spotifyVisualizer.classList.remove('active');
    } else {
      spotifyPlayIcon.innerHTML = `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"/>`;
      spotifyArt.classList.add('spin');
      spotifyVisualizer.classList.add('active');
    }
  }

  // Control functions for Spotify playback
  async function toggleSpotifyPlay() {
    if (!spotifyPlayer) return;
    spotifyPlayer.togglePlay();
  }

  async function spotifyNextTrack() {
    if (!spotifyPlayer) return;
    spotifyPlayer.nextTrack();
  }

  async function spotifyPreviousTrack() {
    if (!spotifyPlayer) return;
    spotifyPlayer.previousTrack();
  }

  async function seekToPosition(position) {
    if (!spotifyPlayer) return;
    spotifyPlayer.seek(position);
  }

  async function setSpotifyVolume(volume) {
    if (!spotifyPlayer) return;
    spotifyPlayer.setVolume(volume);
  }

  // Search for tracks on Spotify
  async function searchSpotifyTracks(query) {
    if (!spotifyAccessToken) {
      const refreshed = await refreshAccessToken();
      if (!refreshed) return [];
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
        headers: {
          'Authorization': `Bearer ${spotifyAccessToken}`,
        },
      });

      const data = await response.json();
      return data.tracks.items;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  // Play a specific track from search results
  async function playTrack(trackUri) {
    if (!spotifyDeviceId || !spotifyAccessToken) return;

    try {
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${spotifyDeviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${spotifyAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: [trackUri],
        }),
      });
    } catch (error) {
      console.error('Error playing track:', error);
    }
  }

  // Display the search results in the widget
  function renderSearchResults(tracks) {
    spotifySearchResults.innerHTML = '';
    
    if (tracks.length === 0) {
      spotifySearchResults.classList.remove('open');
      return;
    }

    // Create a nice list of search results
    tracks.forEach(track => {
      const item = document.createElement('div');
      item.className = 'spotify-search-item';
      
      const img = document.createElement('img');
      img.src = track.album.images[0]?.url || '';
      img.alt = track.name;
      
      const info = document.createElement('div');
      info.className = 'spotify-search-item-info';
      
      const title = document.createElement('div');
      title.className = 'spotify-search-item-title';
      title.textContent = track.name;
      
      const artist = document.createElement('div');
      artist.className = 'spotify-search-item-artist';
      artist.textContent = track.artists.map(a => a.name).join(', ');
      
      info.appendChild(title);
      info.appendChild(artist);
      item.appendChild(img);
      item.appendChild(info);
      
      // Click to play this track
      item.addEventListener('click', () => {
        playTrack(track.uri);
        spotifySearchResults.classList.remove('open');
        spotifySearchInput.value = '';
      });
      
      spotifySearchResults.appendChild(item);
    });
    
    spotifySearchResults.classList.add('open');
  }

  // Wire up all the Spotify widget controls
  spotifyLoginBtn.addEventListener('click', loginToSpotify);

  spotifyPlay.addEventListener('click', toggleSpotifyPlay);
  spotifyNext.addEventListener('click', spotifyNextTrack);
  spotifyPrev.addEventListener('click', spotifyPreviousTrack);

  spotifyProgressSlider.addEventListener('input', (e) => {
    seekToPosition(parseInt(e.target.value));
  });

  spotifyVolumeSlider.addEventListener('input', (e) => {
    setSpotifyVolume(parseFloat(e.target.value));
  });

  // Search button click handler
  spotifySearchBtn.addEventListener('click', () => {
    const query = spotifySearchInput.value.trim();
    if (query) {
      searchSpotifyTracks(query).then(renderSearchResults);
    }
  });

  // Also search when user presses Enter
  spotifySearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = spotifySearchInput.value.trim();
      if (query) {
        searchSpotifyTracks(query).then(renderSearchResults);
      }
    }
  });

  // Close search results when clicking outside the search area
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.spotify-search-row') && !e.target.closest('.spotify-search-results')) {
      spotifySearchResults.classList.remove('open');
    }
  });

  // Check if we're returning from Spotify OAuth callback
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  if (code) {
    // We have an auth code - exchange it for a token
    exchangeCodeForToken(code).then(token => {
      if (token) {
        window.history.replaceState({}, document.title, window.location.pathname);
        initializeSpotifyPlayer(token);
      }
    });
  } else {
    // Check if we already have a saved token
    const existingToken = localStorage.getItem('spotify_access_token');
    if (existingToken) {
      spotifyAccessToken = existingToken;
      initializeSpotifyPlayer(existingToken);
    }
  }

  // =========================================================
  // SPEED DIAL / QUICK SHORTCUTS
  // =========================================================
  const speeddialGrid = document.getElementById("speeddial-grid");
  const shortcutForm = document.getElementById("shortcut-form");
  const shortcutName = document.getElementById("shortcut-name");
  const shortcutUrl = document.getElementById("shortcut-url");
  const SHORTCUTS_KEY = "aura-shortcuts";

  let shortcuts = [];
  try {
    shortcuts = JSON.parse(localStorage.getItem(SHORTCUTS_KEY)) || [];
  } catch (e) {
    shortcuts = [];
  }

  // Add some default shortcuts if there aren't any yet
  if (shortcuts.length === 0) {
    shortcuts = [
      { name: "GitHub", url: "https://github.com" },
      { name: "Gmail", url: "https://mail.google.com" },
      { name: "YouTube", url: "https://youtube.com" },
      { name: "Hack Club", url: "https://hackclub.com" }
    ];
  }

  // Extract the domain name from a URL
  function getDomain(urlStr) {
    try {
      const u = new URL(urlStr);
      return u.hostname;
    } catch (e) {
      return "";
    }
  }

  // Display all the shortcuts in the widget
  function renderShortcuts() {
    speeddialGrid.replaceChildren(); // Clear the grid first

    shortcuts.forEach((sc, index) => {
      const a = document.createElement("a");
      a.className = "speeddial-item";
      a.href = sc.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";

      // Try to get the favicon, or fall back to first letter
      const domain = getDomain(sc.url);
      const icon = document.createElement("div");
      icon.className = "speeddial-icon";

      if (domain) {
        const img = document.createElement("img");
        img.src = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
        img.alt = "";
        img.style.width = "18px";
        img.style.height = "18px";
        // If the favicon fails to load, use the first letter instead
        img.onerror = () => {
          img.remove();
          icon.textContent = sc.name.charAt(0).toUpperCase();
        };
        icon.appendChild(img);
      } else {
        icon.textContent = sc.name.charAt(0).toUpperCase();
      }

      const label = document.createElement("span");
      label.className = "speeddial-label";
      label.textContent = sc.name;

      // Add a delete button for each shortcut
      const del = document.createElement("button");
      del.className = "speeddial-del";
      del.textContent = "✕";
      del.title = `Delete ${sc.name}`;
      del.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        shortcuts.splice(index, 1);
        localStorage.setItem(SHORTCUTS_KEY, JSON.stringify(shortcuts));
        renderShortcuts();
      });

      a.appendChild(icon);
      a.appendChild(label);
      a.appendChild(del);
      speeddialGrid.appendChild(a);
    });
  }

  // Handle adding a new shortcut
  shortcutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = shortcutName.value.trim();
    let url = shortcutUrl.value.trim();

    if (!name || !url) return;

    // Make sure the URL has https://
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    shortcuts.push({ name, url });
    localStorage.setItem(SHORTCUTS_KEY, JSON.stringify(shortcuts));
    
    // Clear the form and refresh the display
    shortcutName.value = "";
    shortcutUrl.value = "";
    renderShortcuts();
  });

  renderShortcuts();

  // =========================================================
  // QUICK NOTES WITH AUTO-SAVE
  // =========================================================
  const notesArea = document.getElementById("notes-area");
  const notesStatus = document.getElementById("notes-status");
  const NOTES_KEY = "aura-notes";

  // Load saved notes
  notesArea.value = localStorage.getItem(NOTES_KEY) || "";
  let notesTimer = null;
  
  // Auto-save notes as you type (with a small delay)
  notesArea.addEventListener("input", () => {
    notesStatus.textContent = "Saving…";
    clearTimeout(notesTimer);
    notesTimer = setTimeout(() => {
      localStorage.setItem(NOTES_KEY, notesArea.value);
      notesStatus.textContent = "Saved";
    }, 400);
  });

  // =========================================================
  // TASK LIST / TODO WIDGET
  // =========================================================
  const todoForm = document.getElementById("todo-form");
  const todoInput = document.getElementById("todo-input");
  const todoList = document.getElementById("todo-list");
  const todoCount = document.getElementById("todo-count");
  const TODO_KEY = "aura-todos";

  let todos = [];
  try {
    todos = JSON.parse(localStorage.getItem(TODO_KEY)) || [];
  } catch (e) {
    todos = [];
  }

  // Add some example todos if the list is empty
  if (todos.length === 0) {
    todos = [
      { id: cryptoId(), text: "Make website look amazing", done: true },
      { id: cryptoId(), text: "Learn Pomodoro focus cycles", done: false },
      { id: cryptoId(), text: "Commit changes to Git", done: false }
    ];
  }

  // Generate a unique ID for each todo
  function cryptoId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // Save todos to localStorage and update the UI
  function saveTodos() {
    localStorage.setItem(TODO_KEY, JSON.stringify(todos));
    updateTodoCount();
    updateStats();
  }

  // Update the count of open tasks
  function updateTodoCount() {
    const open = todos.filter(t => !t.done).length;
    todoCount.textContent = `${open} open`;
  }

  // Display all todos in the list
  function renderTodos() {
    todoList.replaceChildren(); // Clear the list first

    todos.forEach(todo => {
      const li = document.createElement("li");
      li.className = "todo-item" + (todo.done ? " done" : "");
      li.dataset.id = todo.id;

      // Click the checkbox to toggle completion
      const check = document.createElement("div");
      check.className = "todo-check" + (todo.done ? " checked" : "");
      check.addEventListener("click", () => {
        todo.done = !todo.done;
        li.classList.toggle("done", todo.done);
        check.classList.toggle("checked", todo.done);
        saveTodos();
      });

      const text = document.createElement("span");
      text.className = "todo-text";
      text.textContent = todo.text;

      // Add a delete button with a nice animation
      const del = document.createElement("button");
      del.className = "todo-del";
      del.setAttribute("aria-label", "Delete task");
      del.textContent = "✕";
      del.addEventListener("click", () => {
        li.style.transform = "translateX(10px)";
        li.style.opacity = "0";
        setTimeout(() => {
          todos = todos.filter(t => t.id !== todo.id);
          renderTodos();
          saveTodos();
        }, 220);
      });

      li.append(check, text, del);
      todoList.appendChild(li);
    });
    updateTodoCount();
  }

  // Handle adding a new todo
  todoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = todoInput.value.trim();
    if (!val) return;
    todos.unshift({ id: cryptoId(), text: val, done: false });
    todoInput.value = "";
    renderTodos();
    saveTodos();
  });

  renderTodos();

  // =========================================================
  // COMMAND BAR & QUICK SEARCH
  // =========================================================
  const commandBar = document.getElementById("command-bar");
  const commandInput = document.getElementById("command-input");
  const cmdPanel = document.getElementById("cmd-panel");

  // Scroll to and highlight a specific widget
  function focusWidget(name) {
    const el = document.querySelector(`.widget[data-widget="${name}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // Add a nice glow animation
      el.animate(
        [
          { boxShadow: "0 0 0 0 rgba(75, 214, 255, 0)" },
          { boxShadow: "0 0 0 8px var(--accent-glow)" },
          { boxShadow: "0 0 0 0 rgba(75, 214, 255, 0)" }
        ],
        { duration: 900, easing: "ease-out" }
      );
    }
  }

  // Available commands for the command bar
  const COMMANDS = [
    { label: "Focus Weather widget", tag: "widget", action: () => focusWidget("weather") },
    { label: "Focus Pomodoro timer", tag: "widget", action: () => focusWidget("focus") },
    { label: "Focus Quick Notes", tag: "widget", action: () => focusWidget("notes") },
    { label: "Focus Speed Dial Shortcuts", tag: "widget", action: () => focusWidget("speeddial") },
    { label: "Toggle Accent Color", tag: "action", action: () => cycleTheme() },
    { label: "Open Settings Modal", tag: "action", action: () => settingsModal.classList.add("open") },
    { label: "Google Search for “{q}”", tag: "web", action: (q) => {
        window.open("https://www.google.com/search?q=" + encodeURIComponent(q), "_blank", "noopener,noreferrer");
      } }
  ];

  // Show matching commands based on what the user types
  function renderCommandPanel(query) {
    cmdPanel.replaceChildren(); // Clear the panel
    const q = query.trim();
    const items = [];

    COMMANDS.forEach(cmd => {
      if (cmd.tag === "web") {
        // Show web search only if there's actual text to search
        if (q.length > 0) {
          items.push({ text: cmd.label.replace("{q}", q), tag: cmd.tag, run: () => cmd.action(q) });
        }
      } else if (q.length === 0 || cmd.label.toLowerCase().includes(q.toLowerCase())) {
        items.push({ text: cmd.label, tag: cmd.tag, run: cmd.action });
      }
    });

    if (items.length === 0) {
      cmdPanel.classList.remove("open");
      return;
    }

    // Create the command items
    items.forEach((item, i) => {
      const div = document.createElement("div");
      div.className = "cmd-item" + (i === 0 ? " active" : "");
      
      const labelSpan = document.createElement("span");
      labelSpan.textContent = item.text;
      
      const tagSpan = document.createElement("span");
      tagSpan.className = "tag";
      tagSpan.textContent = item.tag;

      div.appendChild(labelSpan);
      div.appendChild(tagSpan);

      // Click to run the command
      div.addEventListener("mousedown", (e) => {
        e.preventDefault();
        item.run();
        commandInput.value = "";
        cmdPanel.classList.remove("open");
      });
      cmdPanel.appendChild(div);
    });
    cmdPanel.classList.add("open");
  }

  // Show the command panel when the input is focused
  commandInput.addEventListener("focus", () => {
    commandBar.classList.add("focused");
    const rect = commandBar.getBoundingClientRect();
    cmdPanel.style.top = (rect.bottom + 12) + 'px';
    renderCommandPanel(commandInput.value);
  });
  
  // Hide the panel when the input loses focus (with a small delay)
  commandInput.addEventListener("blur", () => {
    commandBar.classList.remove("focused");
    setTimeout(() => cmdPanel.classList.remove("open"), 150);
  });

  // Update the panel as the user types
  commandInput.addEventListener("input", () => renderCommandPanel(commandInput.value));

  // Handle keyboard shortcuts in the command bar
  commandInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const activeItem = cmdPanel.querySelector(".cmd-item.active") || cmdPanel.querySelector(".cmd-item");
      if (activeItem) {
        activeItem.dispatchEvent(new Event("mousedown", { bubbles: true }));
      } else if (commandInput.value.trim().length > 0) {
        // If no command matches, do a Google search
        window.open("https://www.google.com/search?q=" + encodeURIComponent(commandInput.value.trim()), "_blank", "noopener,noreferrer");
        commandInput.value = "";
        commandInput.blur();
      }
    } else if (e.key === "Escape") {
      commandInput.blur();
    }
  });

  // Open the command bar with Cmd/Ctrl + K
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      commandInput.focus();
    }
  });

  // =========================================================
  // WEATHER WIDGET (Open-Meteo API)
  // =========================================================
  const weatherTemp = document.getElementById("weather-temp");
  const weatherDesc = document.getElementById("weather-desc");
  const weatherIcon = document.getElementById("weather-icon");
  const weatherLoc = document.getElementById("weather-loc");
  const weatherHi = document.getElementById("weather-hi");
  const weatherLo = document.getElementById("weather-lo");
  const weatherLocationInput = document.getElementById("weather-location-input");
  const weatherLocationForm = document.getElementById("weather-form");
  const WEATHER_KEY = "aura-weather-location";

  // Weather condition icons
  const WEATHER_ICONS = {
    clear: "☀️", clouds: "☁️", rain: "🌧️", snow: "❄️", storm: "⛈️", mist: "🌫️"
  };

  // Fetch weather data from Open-Meteo API
  async function fetchWeather(lat, lon, label = "Your location") {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
      );
      if (!res.ok) throw new Error("bad response");
      const data = await res.json();
      renderWeather({
        temp: Math.round(data.current_weather.temperature),
        hi: Math.round(data.daily.temperature_2m_max[0]),
        lo: Math.round(data.daily.temperature_2m_min[0]),
        code: data.current_weather.weathercode
      }, label);
    } catch (err) {
      // If something goes wrong, show mock data
      renderWeather(mockWeather(), label);
    }
  }

  // Fallback weather data if the API fails
  function mockWeather() {
    return { temp: 19, hi: 23, lo: 14, code: 1 };
  }

  // Convert weather code to a human-readable condition
  function codeToCondition(code) {
    if (code === 0) return "clear";
    if (code <= 3) return "clouds";
    if (code >= 51 && code <= 67) return "rain";
    if (code >= 71 && code <= 77) return "snow";
    if (code >= 95) return "storm";
    return "mist";
  }

  // Display the weather data in the widget
  function renderWeather({ temp, hi, lo, code }, label = "Your location") {
    const cond = codeToCondition(code);
    weatherTemp.textContent = `${temp}°`;
    weatherIcon.textContent = WEATHER_ICONS[cond] || "☁️";
    weatherDesc.textContent = cond.charAt(0).toUpperCase() + cond.slice(1);
    weatherHi.textContent = `H: ${hi}°`;
    weatherLo.textContent = `L: ${lo}°`;
    weatherLoc.textContent = label;
  }

  // Get coordinates for a location name using the geocoding API
  async function fetchWeatherForLocation(location) {
    const query = location.trim();
    if (!query) return;
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
      if (!geoRes.ok) throw new Error("geo failed");
      const geoData = await geoRes.json();
      const result = geoData.results?.[0];
      if (result) {
        fetchWeather(result.latitude, result.longitude, result.name);
      } else {
        renderWeather(mockWeather(), query);
      }
    } catch (err) {
      renderWeather(mockWeather(), query);
    }
  }

  // Save the location and fetch its weather
  function setWeatherLocation(location) {
    const next = location.trim();
    if (!next) return;
    localStorage.setItem(WEATHER_KEY, next);
    weatherLocationInput.value = next;
    fetchWeatherForLocation(next);
  }

  // Handle the weather location form submission
  weatherLocationForm.addEventListener("submit", (e) => {
    e.preventDefault();
    setWeatherLocation(weatherLocationInput.value);
  });

  // Load the saved location or use the browser's location
  const savedLocation = localStorage.getItem(WEATHER_KEY);
  if (savedLocation) {
    weatherLocationInput.value = savedLocation;
    fetchWeatherForLocation(savedLocation);
  } else if (navigator.geolocation) {
    // Try to get the user's current location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeather(pos.coords.latitude, pos.coords.longitude, "Local Weather");
      },
      () => {
        renderWeather(mockWeather(), "Milan, IT");
      },
      { timeout: 4000 }
    );
  } else {
    renderWeather(mockWeather(), "Milan, IT");
  }

  // =========================================================
  // DAILY QUOTES & STATS
  // =========================================================
  const QUOTES = [
    "Design is not just what it looks like and feels like. Design is how it works.",
    "Simplicity is the ultimate sophistication.",
    "The best way to predict the future is to invent it.",
    "Details make the design; they are not just details.",
    "Make it simple, but significant.",
    "Action is the foundational key to all success.",
    "You have to start somewhere. Build the thing you wish existed."
  ];

  const quoteText = document.getElementById("quote-text");
  const statUptime = document.getElementById("stat-uptime");
  const statTasks = document.getElementById("stat-tasks");
  const statFocus = document.getElementById("stat-focus");

  // Show a different quote each day based on the date
  function dayIndexSeed() {
    const now = new Date();
    return now.getFullYear() * 400 + now.getMonth() * 31 + now.getDate();
  }
  quoteText.textContent = QUOTES[dayIndexSeed() % QUOTES.length];

  const FIRST_VISIT_KEY = "aura-first-visit";
  const VISIT_COUNT_KEY = "aura-visit-count";
  const VISIT_DATE_KEY = "aura-visit-date";

  // Update the stats display
  function updateStats() {
    let firstVisit = localStorage.getItem(FIRST_VISIT_KEY);
    if (!firstVisit) {
      firstVisit = Date.now().toString();
      localStorage.setItem(FIRST_VISIT_KEY, firstVisit);
    }
    const days = Math.max(0, Math.floor((Date.now() - parseInt(firstVisit, 10)) / 86400000)) + 1;
    statUptime.textContent = days;

    // Count completed tasks and pomodoros
    const doneCount = todos.filter(t => t.done).length;
    statTasks.textContent = doneCount + parseInt(localStorage.getItem("aura-pomo-done") || "0", 10);

    // Track daily visits
    const today = new Date().toDateString();
    let visitCount = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || "0", 10);
    const lastDate = localStorage.getItem(VISIT_DATE_KEY);
    
    if (lastDate !== today) {
      visitCount = 1;
    }
    statFocus.textContent = visitCount;
  }

  // Track how many times the user visits today
  const todayDateString = new Date().toDateString();
  let loadVisits = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || "0", 10);
  if (localStorage.getItem(VISIT_DATE_KEY) !== todayDateString) {
    loadVisits = 1;
  } else {
    loadVisits += 1;
  }
  localStorage.setItem(VISIT_DATE_KEY, todayDateString);
  localStorage.setItem(VISIT_COUNT_KEY, loadVisits.toString());

  // Initialize the stats display
  updateStats();
})();
