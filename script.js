// AURA Dashboard - Main Script
// Minimal editorial implementation. Vanilla JS, no frameworks.

(function () {
  "use strict";

  // =========================================================
  // CONFIG
  // =========================================================
  // All localStorage keys live in one place so we can dump/import them.
  const LS_KEYS = {
    density: "aura-density",
    speed: "aura-speed",
    noise: "aura-noise",
    bgStyle: "aura-bg-style",
    themeIdx: "aura-theme-idx",
    accentCustom: "aura-accent-custom",
    enabledWidgets: "aura-enabled-widgets",
    mode: "aura-mode",
    dim: "aura-dim",
    gridLayout: "aura-grid-layout",
    todos: "aura-todos",
    notes: "aura-notes",
    shortcuts: "aura-shortcuts",
    weatherLocation: "aura-weather-location",
    habits: "aura-habits",
    reading: "aura-reading",
    firstVisit: "aura-first-visit",
    visits: "aura-visit-count",
    visitDate: "aura-visit-date",
    pomodoroDone: "aura-pomo-done",
    spotifyAccess: "spotify_access_token",
    spotifyRefresh: "spotify_refresh_token",
  };

  // Built-in widgets that can be toggled in the gallery.
  // Each entry: id, name, description, badge ("core" / "media"), enabled by default.
  const WIDGET_REGISTRY = [
    { id: "weather",   name: "Weather",     description: "Current temperature, conditions, and today's range for any city.", badge: "core",  default: true },
    { id: "focus",     name: "Focus",       description: "Pomodoro / short / long break timer with a circular progress ring.", badge: "core",  default: true },
    { id: "habits",    name: "Habits",      description: "Daily habits with a 7-day grid and a rolling streak counter.",      badge: "core",  default: true },
    { id: "todo",      name: "Tasks",       description: "Quick task list with check-off and persistence.",                  badge: "core",  default: true },
    { id: "speeddial", name: "Speed Dial",  description: "Bookmark grid with favicons — add a name + URL.",                    badge: "core",  default: true },
    { id: "notes",     name: "Notes",       description: "A scratchpad that auto-saves as you type.",                          badge: "core",  default: true },
    { id: "music",     name: "Music",       description: "Spotify playback, search, and progress via Web Playback SDK.",       badge: "media", default: true },
    { id: "quote",     name: "Signal",      description: "Daily quote plus your streak stats: days, tasks, visits.",            badge: "core",  default: true },
    { id: "reading",   name: "Reading List", description: "Save articles and links to read later with optional notes.",        badge: "new",   default: false },
  ];
  const WIDGET_MAP = Object.fromEntries(WIDGET_REGISTRY.map((w) => [w.id, w]));

  const config = {
    density: parseInt(localStorage.getItem(LS_KEYS.density) || "60", 10),
    speed: parseFloat(localStorage.getItem(LS_KEYS.speed) || "0.6", 10),
    noise: localStorage.getItem(LS_KEYS.noise) !== "false",
    bgStyle: localStorage.getItem(LS_KEYS.bgStyle) || "pulse",
  };

  // =========================================================
  // PARTICLE BACKGROUND
  // =========================================================
  const canvas = document.getElementById("bg-canvas");
  const ctx = canvas.getContext("2d");
  let particles = [];
  const particleColors = ["75,214,255", "167,139,250", "255,122,209"];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mouse = { x: null, y: null, radius: 110 };
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function initParticles() {
    particles = Array.from({ length: config.density }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.6,
      vx: (Math.random() - 0.5) * config.speed,
      vy: (Math.random() - 0.5) * config.speed,
      alpha: Math.random() * 0.25 + 0.1,
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
      twSpeed: Math.random() * 0.01 + 0.003,
      twPhase: Math.random() * Math.PI * 2,
    }));
  }

  function drawParticles(t) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    if (config.bgStyle === "nordic") {
      ctx.fillStyle = "rgba(5, 8, 14, 1)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      const aur = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
      aur.addColorStop(0, "rgba(110, 231, 183, 0.04)");
      aur.addColorStop(0.5, "rgba(75, 214, 255, 0.02)");
      aur.addColorStop(1, "rgba(5, 8, 14, 1)");
      ctx.fillStyle = aur;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    } else if (config.bgStyle === "cyber") {
      ctx.fillStyle = "rgba(6, 4, 10, 1)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      const rad = ctx.createRadialGradient(window.innerWidth / 2, window.innerHeight / 2, 10, window.innerWidth / 2, window.innerHeight / 2, window.innerWidth);
      rad.addColorStop(0, "rgba(255, 122, 209, 0.04)");
      rad.addColorStop(1, "rgba(6, 4, 10, 1)");
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    } else {
      // pulse - monochrome, just a slow gradient
      const sp = t * 0.0003;
      const g = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
      g.addColorStop(0, "#0a0a0a");
      g.addColorStop(1, "#0a0a0a");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // Subtle moving orbs - mostly monochrome, just a hint of accent
      const x1 = 30 + Math.sin(sp) * 10;
      const y1 = 30 + Math.cos(sp) * 10;
      const aurora = ctx.createRadialGradient(
        window.innerWidth * (x1 / 100), window.innerHeight * (y1 / 100), 0,
        window.innerWidth * (x1 / 100), window.innerHeight * (y1 / 100), window.innerWidth * 0.35
      );
      aurora.addColorStop(0, "rgba(75, 214, 255, 0.04)");
      aurora.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = aurora;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (mouse.x !== null && mouse.y !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          p.x += Math.cos(angle) * force * 1.2;
          p.y += Math.sin(angle) * force * 1.2;
        }
      }
      if (p.x < -10) p.x = window.innerWidth + 10;
      if (p.x > window.innerWidth + 10) p.x = -10;
      if (p.y < -10) p.y = window.innerHeight + 10;
      if (p.y > window.innerHeight + 10) p.y = -10;

      const tw = (Math.sin(t * p.twSpeed + p.twPhase) + 1) / 2;
      const a = p.alpha * (0.4 + tw * 0.6);

      // Soft glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.5);
      glow.addColorStop(0, "rgba(" + p.color + "," + (a * 0.35) + ")");
      glow.addColorStop(1, "rgba(" + p.color + ",0)");
      ctx.fillStyle = glow;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(245, 245, 244, " + a + ")";
      ctx.fill();
    }
    if (!reduceMotion) requestAnimationFrame(drawParticles);
  }

  resizeCanvas();
  initParticles();
  window.addEventListener("resize", () => { resizeCanvas(); initParticles(); });
  requestAnimationFrame(drawParticles);
  if (reduceMotion) drawParticles(0);

  window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener("mouseleave", () => { mouse.x = null; mouse.y = null; });

  // =========================================================
  // CLOCK & GREETING
  // =========================================================
  function pad(n) { return n.toString().padStart(2, "0"); }

  function updateClock() {
    const now = new Date();
    const h = pad(now.getHours());
    const m = pad(now.getMinutes());
    const s = pad(now.getSeconds());
    if (elH && elH.textContent !== h) elH.textContent = h;
    if (elM && elM.textContent !== m) elM.textContent = m;
    if (elS) elS.textContent = s;

    const hour = now.getHours();
    let g = "Good evening.";
    if (hour < 5) g = "Still up? The night is quiet.";
    else if (hour < 12) g = "Good morning.";
    else if (hour < 18) g = "Good afternoon.";
    elGreeting.textContent = g;

    elDate.textContent = now.toLocaleDateString(undefined, {
      weekday: "long", month: "long", day: "numeric"
    });
  }
  const elH = document.getElementById("clock-h");
  const elM = document.getElementById("clock-m");
  const elS = document.getElementById("clock-s");
  const elDate = document.getElementById("hero-date");
  const elGreeting = document.getElementById("greeting");
  updateClock();
  setInterval(updateClock, 1000);

  // =========================================================
  // THEME (6 swatches + custom hex)
  // =========================================================
  const SWATCHES = ["cyan", "violet", "rose", "amber", "emerald", "slate"];
  const SWATCH_COLORS = { cyan: "#4bd6ff", violet: "#a78bfa", rose: "#ff7ad1", amber: "#f5b14b", emerald: "#6ee7b7", slate: "#94a3b8" };
  const themeToggle = document.getElementById("theme-toggle");
  const swatchRow = document.getElementById("swatch-row");
  const accentHex = document.getElementById("accent-hex");
  let themeIndex = parseInt(localStorage.getItem(LS_KEYS.themeIdx) || "0", 10);
  let customAccent = localStorage.getItem(LS_KEYS.accentCustom) || ""; // hex override

  function applyAccentColor(name) {
    const el = document.documentElement;
    if (customAccent && /^#[0-9a-fA-F]{6}$/.test(customAccent)) {
      el.style.setProperty("--accent", customAccent);
      el.style.setProperty("--accent-soft", hexToSoft(customAccent));
    } else if (name === "cyan") {
      el.removeAttribute("data-theme");
      el.style.removeProperty("--accent");
      el.style.removeProperty("--accent-soft");
    } else {
      el.setAttribute("data-theme", name);
      el.style.removeProperty("--accent");
      el.style.removeProperty("--accent-soft");
    }
    syncSwatchUI();
  }
  function syncSwatchUI() {
    if (!swatchRow) return;
    swatchRow.querySelectorAll(".swatch").forEach((btn) => {
      const isOn = !customAccent && btn.getAttribute("data-accent") === SWATCHES[themeIndex];
      btn.classList.toggle("is-on", isOn);
    });
    if (accentHex && !customAccent) accentHex.value = "";
  }
  function hexToSoft(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return "rgba(" + r + "," + g + "," + b + ",0.12)";
  }
  function cycleTheme() {
    customAccent = "";
    localStorage.removeItem(LS_KEYS.accentCustom);
    themeIndex = (themeIndex + 1) % SWATCHES.length;
    localStorage.setItem(LS_KEYS.themeIdx, themeIndex);
    applyAccentColor(SWATCHES[themeIndex]);
  }
  applyAccentColor(SWATCHES[themeIndex]);

  // Topbar Theme button is repurposed to cycle Mode (the swatch picker in
  // Options already handles accent color, so clicking Theme in the topbar
  // would be redundant). Mode cycling is a single-click action and earns
  // its slot in the topbar.
  function syncModeLabel() {
    const mode = localStorage.getItem(LS_KEYS.mode) || "dark";
    if (!themeToggle) return;
    const label = themeToggle.querySelector("span");
    if (label) label.textContent = mode === "light" ? "Light" : "Dark";
    themeToggle.setAttribute("title", "Mode: " + mode + " (click to toggle)");
  }
  function cycleMode() {
    const cur = localStorage.getItem(LS_KEYS.mode) || "dark";
    const next = cur === "light" ? "dark" : "light";
    localStorage.setItem(LS_KEYS.mode, next);
    applyMode();
    syncModeLabel();
  }
  themeToggle.addEventListener("click", cycleMode);
  syncModeLabel();

  // Swatch row + hex input
  if (swatchRow) {
    swatchRow.addEventListener("click", (e) => {
      const btn = e.target.closest(".swatch");
      if (!btn) return;
      const name = btn.getAttribute("data-accent");
      themeIndex = SWATCHES.indexOf(name);
      customAccent = "";
      localStorage.setItem(LS_KEYS.themeIdx, themeIndex);
      localStorage.removeItem(LS_KEYS.accentCustom);
      applyAccentColor(name);
      if (accentHex) accentHex.value = "";
    });
  }
  if (accentHex) {
    accentHex.addEventListener("input", (e) => {
      let v = e.target.value.trim();
      if (!v.startsWith("#")) v = "#" + v;
      if (/^#[0-9a-fA-F]{6}$/.test(v)) {
        customAccent = v.toLowerCase();
        localStorage.setItem(LS_KEYS.accentCustom, customAccent);
        applyAccentColor("");
      }
    });
    accentHex.addEventListener("blur", (e) => {
      let v = e.target.value.trim();
      if (!v.startsWith("#")) v = "#" + v;
      if (/^#[0-9a-fA-F]{6}$/.test(v)) e.target.value = v.toLowerCase();
      else e.target.value = "";
    });
  }

  // =========================================================
  // MODALS (settings + shortcuts + gallery)
  // =========================================================
  const settingsModal = document.getElementById("settings-modal");
  const settingsToggle = document.getElementById("settings-toggle");
  const settingsClose = document.getElementById("settings-close");

  const shortcutsModal = document.getElementById("shortcuts-modal");
  const shortcutsClose = document.getElementById("shortcuts-close");

  const galleryModal = document.getElementById("gallery-modal");
  const galleryBtn = document.getElementById("gallery-btn");
  const galleryClose = document.getElementById("gallery-close");
  const galleryGrid = document.getElementById("gallery-grid");

  const openModal = (m) => m && m.classList.add("open");
  const closeModal = (m) => m && m.classList.remove("open");

  settingsToggle.addEventListener("click", () => openModal(settingsModal));
  settingsClose.addEventListener("click", () => closeModal(settingsModal));
  settingsModal.addEventListener("click", (e) => { if (e.target === settingsModal) closeModal(settingsModal); });

  shortcutsClose.addEventListener("click", () => closeModal(shortcutsModal));
  shortcutsModal.addEventListener("click", (e) => { if (e.target === shortcutsModal) closeModal(shortcutsModal); });

  // =========================================================
  // SETTINGS WIDGET (density / speed / noise / bg / reset)
  // =========================================================
  const densitySlider = document.getElementById("particle-density");
  const speedSlider = document.getElementById("particle-speed");
  const noiseToggle = document.getElementById("toggle-noise");
  const bgStyleSelect = document.getElementById("bg-style");
  const noiseOverlay = document.querySelector(".noise-overlay");

  densitySlider.value = config.density;
  speedSlider.value = config.speed * 5;
  bgStyleSelect.value = config.bgStyle;
  if (!config.noise) {
    noiseToggle.classList.remove("is-on");
    noiseToggle.textContent = "Disabled";
    noiseOverlay.classList.add("disabled");
  }

  densitySlider.addEventListener("input", (e) => {
    config.density = parseInt(e.target.value, 10);
    localStorage.setItem(LS_KEYS.density, config.density);
    initParticles();
  });

  speedSlider.addEventListener("input", (e) => {
    config.speed = parseFloat(e.target.value) / 5;
    localStorage.setItem(LS_KEYS.speed, config.speed);
    initParticles();
  });

  noiseToggle.addEventListener("click", () => {
    config.noise = !config.noise;
    localStorage.setItem(LS_KEYS.noise, config.noise);
    if (config.noise) {
      noiseToggle.classList.add("is-on");
      noiseToggle.textContent = "Enabled";
      noiseOverlay.classList.remove("disabled");
    } else {
      noiseToggle.classList.remove("is-on");
      noiseToggle.textContent = "Disabled";
      noiseOverlay.classList.add("disabled");
    }
  });

  bgStyleSelect.addEventListener("change", (e) => {
    config.bgStyle = e.target.value;
    localStorage.setItem(LS_KEYS.bgStyle, config.bgStyle);
  });

  document.getElementById("reset-layout-btn").addEventListener("click", () => {
    localStorage.removeItem(LS_KEYS.gridLayout);
    window.location.reload();
  });

  // Light/dark mode toggle
  const modeToggle = document.getElementById("mode-toggle");
  function applyMode() {
    const mode = localStorage.getItem(LS_KEYS.mode) || "dark";
    if (mode === "light") document.documentElement.setAttribute("data-mode", "light");
    else document.documentElement.removeAttribute("data-mode");
    if (modeToggle) modeToggle.textContent = mode === "light" ? "Dark Mode" : "Light Mode";
  }
  function toggleMode() {
    const cur = localStorage.getItem(LS_KEYS.mode) || "dark";
    const next = cur === "light" ? "dark" : "light";
    localStorage.setItem(LS_KEYS.mode, next);
    applyMode();
  }
  applyMode();
  modeToggle && modeToggle.addEventListener("click", toggleMode);

  // Dim toggle
  const dimBtn = document.getElementById("dim-btn");
  function applyDim() {
    const dim = localStorage.getItem(LS_KEYS.dim) === "true";
    if (dim) document.documentElement.setAttribute("data-dim", "true");
    else document.documentElement.removeAttribute("data-dim");
    if (dimBtn) dimBtn.textContent = dim ? "Restore Widgets" : "Dim Widgets";
  }
  dimBtn && dimBtn.addEventListener("click", () => {
    const cur = localStorage.getItem(LS_KEYS.dim) === "true";
    localStorage.setItem(LS_KEYS.dim, (!cur).toString());
    applyDim();
  });
  applyDim();

  // Reset everything
  const resetAllBtn = document.getElementById("reset-all-btn");
  resetAllBtn && resetAllBtn.addEventListener("click", () => {
    if (!confirm("Reset all AURA data? This clears every widget, theme, habit, todo, note and setting. Cannot be undone.")) return;
    Object.values(LS_KEYS).forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem("spotify_code_verifier");
    localStorage.removeItem("spotify_state");
    window.location.reload();
  });

  // =========================================================
  // BENTO DRAG & DROP
  // =========================================================
  const grid = document.getElementById("widget-grid");
  const dragHint = document.getElementById("drag-hint");
  let dragSrc = null;

  function loadLayout() {
    try {
      const layout = JSON.parse(localStorage.getItem(LS_KEYS.gridLayout));
      if (!layout) return;
      const cards = Array.from(grid.querySelectorAll(".card"));
      layout.forEach((name) => {
        const match = cards.find((c) => c.getAttribute("data-widget") === name);
        if (match) grid.appendChild(match);
      });
    } catch (e) { /* corrupt — ignore */ }
  }
  function saveLayout() {
    const layout = Array.from(grid.querySelectorAll(".card")).map((c) => c.getAttribute("data-widget"));
    localStorage.setItem(LS_KEYS.gridLayout, JSON.stringify(layout));
  }

  function bindDrag(card) {
    card.addEventListener("dragstart", (e) => {
      const isHandle = e.target.closest(".drag-handle");
      if (!isHandle) { e.preventDefault(); return; }
      dragSrc = card;
      card.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", card.dataset.widget);
      dragHint.classList.add("show");
    });
    card.addEventListener("dragover", (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; });
    card.addEventListener("dragenter", () => { if (card !== dragSrc) card.style.borderColor = "var(--accent)"; });
    card.addEventListener("dragleave", () => { card.style.borderColor = ""; });
    card.addEventListener("drop", (e) => {
      e.preventDefault();
      if (dragSrc && dragSrc !== card) {
        const cards = Array.from(grid.children);
        const srcIdx = cards.indexOf(dragSrc);
        const targetIdx = cards.indexOf(card);
        grid.insertBefore(dragSrc, srcIdx < targetIdx ? card.nextSibling : card);
        saveLayout();
      }
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      dragHint.classList.remove("show");
      grid.querySelectorAll(".card").forEach((c) => (c.style.borderColor = ""));
      dragSrc = null;
    });
  }
  grid.querySelectorAll(".card").forEach(bindDrag);
  loadLayout();

  // =========================================================
  // WIDGET ENABLE/DISABLE + GALLERY
  // =========================================================
  function loadEnabledWidgets() {
    try {
      const stored = JSON.parse(localStorage.getItem(LS_KEYS.enabledWidgets));
      if (Array.isArray(stored)) return stored;
    } catch (e) { /* corrupt */ }
    return WIDGET_REGISTRY.filter((w) => w.default).map((w) => w.id);
  }
  function saveEnabledWidgets(arr) {
    localStorage.setItem(LS_KEYS.enabledWidgets, JSON.stringify(arr));
  }
  function applyEnabledWidgets() {
    const enabled = new Set(loadEnabledWidgets());
    grid.querySelectorAll(".card[data-widget]").forEach((card) => {
      const id = card.getAttribute("data-widget");
      const visible = enabled.has(id);
      card.hidden = !visible;
      // Also strip the drag binding for hidden widgets to save memory
      if (!visible && card.draggable) card.draggable = false;
      else if (visible && !card.draggable) card.draggable = true;
    });
  }
  function toggleWidget(id) {
    const enabled = loadEnabledWidgets();
    const idx = enabled.indexOf(id);
    if (idx >= 0) {
      enabled.splice(idx, 1);
    } else {
      enabled.push(id);
      // If it was hidden, append at end of grid for clear visibility
      const card = grid.querySelector('[data-widget="' + id + '"]');
      if (card) grid.appendChild(card);
    }
    saveEnabledWidgets(enabled);
    applyEnabledWidgets();
    renderGallery();
  }
  function renderGallery() {
    if (!galleryGrid) return;
    const enabled = new Set(loadEnabledWidgets());
    galleryGrid.replaceChildren();
    WIDGET_REGISTRY.forEach((w) => {
      const card = document.createElement("div");
      card.className = "gallery-card";
      const head = document.createElement("div");
      head.className = "gallery-card-head";
      const name = document.createElement("div");
      name.className = "gallery-card-name";
      name.textContent = w.name;
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "toggle-switch" + (enabled.has(w.id) ? " is-on" : "");
      toggle.setAttribute("aria-label", "Toggle " + w.name);
      toggle.setAttribute("aria-pressed", enabled.has(w.id) ? "true" : "false");
      toggle.addEventListener("click", () => toggleWidget(w.id));
      head.append(name, toggle);
      const desc = document.createElement("div");
      desc.className = "gallery-card-desc";
      desc.textContent = w.description;
      const foot = document.createElement("div");
      foot.className = "gallery-card-action";
      const badge = document.createElement("span");
      badge.className = "gallery-card-badge";
      badge.textContent = w.badge;
      const state = document.createElement("span");
      state.style.cssText = "font-size:11px;color:var(--ink-2);";
      state.textContent = enabled.has(w.id) ? "Visible" : "Hidden";
      foot.append(badge, state);
      card.append(head, desc, foot);
      galleryGrid.appendChild(card);
    });
  }
  galleryBtn && galleryBtn.addEventListener("click", () => { renderGallery(); openModal(galleryModal); });
  galleryClose && galleryClose.addEventListener("click", () => closeModal(galleryModal));
  galleryModal && galleryModal.addEventListener("click", (e) => { if (e.target === galleryModal) closeModal(galleryModal); });
  applyEnabledWidgets();

  // =========================================================
  // POMODORO
  // =========================================================
  const pomoPhase = document.getElementById("pomodoro-phase");
  const timerTime = document.getElementById("timer-time");
  const pomoStartPause = document.getElementById("pomo-start-pause");
  const pomoReset = document.getElementById("pomo-reset");
  const progressCircle = document.getElementById("timer-progress-circle");
  const pomoPills = document.querySelectorAll(".focus-pill");

  const POMO_CONFIGS = { work: 1500, short: 300, long: 900 };
  let pomoTime = 1500;
  let pomoDuration = 1500;
  let pomoInterval = null;
  let pomoRunning = false;
  let pomoType = "work";

  function playChime() {
    try {
      const actx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, actx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.45, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.55);
    } catch (e) { /* audio blocked */ }
  }

  function updatePomoDisplay() {
    const m = Math.floor(pomoTime / 60);
    const s = pomoTime % 60;
    timerTime.textContent = pad(m) + ":" + pad(s);
    const pct = pomoTime / pomoDuration;
    progressCircle.style.strokeDashoffset = 283 - (pct * 283);
  }

  function setPomoRunningState(isRunning) {
    pomoRunning = isRunning;
    pomoStartPause.textContent = isRunning ? "Pause" : "Start";
    pomoStartPause.classList.toggle("is-running", isRunning);
  }
  function togglePomo() {
    if (pomoRunning) {
      clearInterval(pomoInterval);
      setPomoRunningState(false);
      return;
    }
    setPomoRunningState(true);
    pomoInterval = setInterval(() => {
      pomoTime--;
      updatePomoDisplay();
      if (pomoTime <= 0) {
        clearInterval(pomoInterval);
        setPomoRunningState(false);
        playChime();
        const done = parseInt(localStorage.getItem(LS_KEYS.pomodoroDone) || "0", 10) + 1;
        localStorage.setItem(LS_KEYS.pomodoroDone, done);
        updateStats();
        if (pomoType === "work") {
          pomoPhase.textContent = "Break time";
        } else {
          pomoPhase.textContent = "Focus cycle complete";
        }
        resetPomo();
      }
    }, 1000);
  }
  function resetPomo() {
    clearInterval(pomoInterval);
    setPomoRunningState(false);
    pomoTime = POMO_CONFIGS[pomoType];
    pomoDuration = POMO_CONFIGS[pomoType];
    updatePomoDisplay();
  }
  pomoStartPause.addEventListener("click", togglePomo);
  pomoReset.addEventListener("click", resetPomo);

  pomoPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      pomoPills.forEach((p) => p.classList.remove("is-active"));
      pill.classList.add("is-active");
      pomoType = pill.getAttribute("data-type");
      pomoPhase.textContent = pill.textContent;
      resetPomo();
    });
  });
  resetPomo();

  // =========================================================
  // SPOTIFY PLAYER
  // =========================================================
  const SPOTIFY_CLIENT_ID = "YOUR_SPOTIFY_CLIENT_ID";
  const SPOTIFY_REDIRECT_URI = window.location.origin + "/callback.html";
  const SPOTIFY_SCOPES = [
    "streaming",
    "user-read-email",
    "user-read-private",
    "user-library-read",
    "user-read-playback-state",
    "user-modify-playback-state",
  ];

  const spotifyAuthSection = document.getElementById("spotify-auth-section");
  const spotifyPlayerSection = document.getElementById("spotify-player-section");
  const spotifyLoginBtn = document.getElementById("spotify-login-btn");
  const spotifyPlay = document.getElementById("spotify-play");
  const spotifyPlayIcon = document.getElementById("spotify-play-icon");
  const spotifyArt = document.getElementById("spotify-art");
  const spotifyCoverImg = document.getElementById("spotify-cover-img");
  const spotifyProgressSlider = document.getElementById("spotify-progress-slider");
  const spotifyProgressFill = document.getElementById("spotify-progress-fill");
  const spotifyTimeCur = document.getElementById("spotify-time-cur");
  const spotifyTimeDur = document.getElementById("spotify-time-dur");
  const spotifyTrackName = document.getElementById("spotify-track-name");
  const spotifyArtistName = document.getElementById("spotify-artist-name");
  const spotifyNext = document.getElementById("spotify-next");
  const spotifyPrev = document.getElementById("spotify-prev");
  const spotifyVolumeSlider = document.getElementById("spotify-volume-slider");
  const spotifySearchInput = document.getElementById("spotify-search-input");
  const spotifySearchBtn = document.getElementById("spotify-search-btn");
  const spotifySearchResults = document.getElementById("spotify-search-results");
  const spotifyVisualizer = document.getElementById("spotify-visualizer");

  let spotifyPlayer = null;
  let spotifyAccessToken = null;
  let spotifyDeviceId = null;
  let currentTrackUri = null;

  function randStr(n) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let s = "";
    for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  }

  async function codeChallenge(verifier) {
    const data = new TextEncoder().encode(verifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  async function loginSpotify() {
    const verifier = randStr(128);
    const challenge = await codeChallenge(verifier);
    const state = randStr(16);
    localStorage.setItem("spotify_code_verifier", verifier);
    localStorage.setItem("spotify_state", state);
    const url = new URL("https://accounts.spotify.com/authorize");
    url.searchParams.append("client_id", SPOTIFY_CLIENT_ID);
    url.searchParams.append("response_type", "code");
    url.searchParams.append("redirect_uri", SPOTIFY_REDIRECT_URI);
    url.searchParams.append("scope", SPOTIFY_SCOPES.join(" "));
    url.searchParams.append("code_challenge_method", "S256");
    url.searchParams.append("code_challenge", challenge);
    url.searchParams.append("state", state);
    window.location.href = url.toString();
  }

  async function exchangeToken(code) {
    const verifier = localStorage.getItem("spotify_code_verifier");
    const state = localStorage.getItem("spotify_state");
    const retState = new URLSearchParams(window.location.search).get("state");
    if (state !== retState) return null;
    const r = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        grant_type: "authorization_code",
        code, redirect_uri: SPOTIFY_REDIRECT_URI,
        code_verifier: verifier,
      }),
    });
    const data = await r.json();
    if (!data.access_token) return null;
    spotifyAccessToken = data.access_token;
    localStorage.setItem(LS_KEYS.spotifyAccess, spotifyAccessToken);
    if (data.refresh_token) localStorage.setItem(LS_KEYS.spotifyRefresh, data.refresh_token);
    return data.access_token;
  }

  async function refreshSpotifyToken() {
    const refresh = localStorage.getItem(LS_KEYS.spotifyRefresh);
    if (!refresh) return null;
    const r = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        grant_type: "refresh_token",
        refresh_token: refresh,
      }),
    });
    const data = await r.json();
    if (!data.access_token) return null;
    spotifyAccessToken = data.access_token;
    localStorage.setItem(LS_KEYS.spotifyAccess, spotifyAccessToken);
    if (data.refresh_token) localStorage.setItem(LS_KEYS.spotifyRefresh, data.refresh_token);
    return data.access_token;
  }

  function initSpotifyPlayer(token) {
    if (!window.Spotify) return;
    spotifyPlayer = new Spotify.Player({
      name: "AURA Dashboard",
      getOAuthToken: (cb) => cb(token),
      volume: 0.7,
    });
    spotifyPlayer.addListener("ready", ({ device_id }) => {
      spotifyDeviceId = device_id;
      spotifyAuthSection.style.display = "none";
      spotifyPlayerSection.style.display = "flex";
      transferPlayback();
    });
    spotifyPlayer.addListener("not_ready", () => {});
    spotifyPlayer.addListener("player_state_changed", (state) => { if (state) renderSpotify(state); });
    spotifyPlayer.addListener("initialization_error", ({ message }) => console.error("Spotify init", message));
    spotifyPlayer.addListener("authentication_error", () => refreshSpotifyToken().then((t) => t && initSpotifyPlayer(t)));
    spotifyPlayer.addListener("account_error", ({ message }) => console.error("Spotify account", message));
    spotifyPlayer.connect();
  }

  async function transferPlayback() {
    if (!spotifyDeviceId || !spotifyAccessToken) return;
    try {
      await fetch("https://api.spotify.com/v1/me/player", {
        method: "PUT",
        headers: { Authorization: "Bearer " + spotifyAccessToken, "Content-Type": "application/json" },
        body: JSON.stringify({ device_ids: [spotifyDeviceId], play: false }),
      });
    } catch (e) { /* network */ }
  }

  function fmtTime(s) {
    s = Math.floor(s);
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return m + ":" + pad(ss);
  }

  function renderSpotify(state) {
    const track = state.track_window.current_track;
    currentTrackUri = track.uri;
    spotifyTrackName.textContent = track.name;
    spotifyArtistName.textContent = track.artists.map((a) => a.name).join(", ");
    if (track.album.images[0]) {
      spotifyCoverImg.src = track.album.images[0].url;
      spotifyCoverImg.style.display = "block";
    }
    const pos = state.position;
    const dur = state.duration;
    spotifyProgressSlider.value = pos;
    spotifyProgressSlider.max = dur;
    spotifyProgressFill.style.width = (dur ? (pos / dur) * 100 : 0) + "%";
    spotifyTimeCur.textContent = fmtTime(pos / 1000);
    spotifyTimeDur.textContent = fmtTime(dur / 1000);
    if (state.paused) {
      spotifyPlayIcon.innerHTML = '<path d="M8 5v14l11-7z" fill="currentColor"/>';
      spotifyArt.classList.remove("spin");
      spotifyVisualizer.classList.remove("active");
    } else {
      spotifyPlayIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"/>';
      spotifyArt.classList.add("spin");
      spotifyVisualizer.classList.add("active");
    }
  }

  async function searchSpotify(q) {
    if (!spotifyAccessToken) return [];
    const r = await fetch("https://api.spotify.com/v1/search?q=" + encodeURIComponent(q) + "&type=track&limit=10", {
      headers: { Authorization: "Bearer " + spotifyAccessToken },
    });
    const d = await r.json();
    return d.tracks?.items || [];
  }

  async function playTrack(uri) {
    if (!spotifyDeviceId || !spotifyAccessToken) return;
    await fetch("https://api.spotify.com/v1/me/player/play?device_id=" + spotifyDeviceId, {
      method: "PUT",
      headers: { Authorization: "Bearer " + spotifyAccessToken, "Content-Type": "application/json" },
      body: JSON.stringify({ uris: [uri] }),
    });
  }

  function renderSearchResults(tracks) {
    spotifySearchResults.replaceChildren();
    if (!tracks.length) { spotifySearchResults.classList.remove("open"); return; }
    tracks.forEach((track) => {
      const item = document.createElement("div");
      item.className = "spotify-search-item";
      const img = document.createElement("img");
      img.src = track.album.images[0]?.url || "";
      img.alt = track.name;
      const info = document.createElement("div");
      info.className = "spotify-search-item-info";
      const title = document.createElement("div");
      title.className = "spotify-search-item-title";
      title.textContent = track.name;
      const artist = document.createElement("div");
      artist.className = "spotify-search-item-artist";
      artist.textContent = track.artists.map((a) => a.name).join(", ");
      info.append(title, artist);
      item.append(img, info);
      item.addEventListener("click", () => {
        playTrack(track.uri);
        spotifySearchResults.classList.remove("open");
        spotifySearchInput.value = "";
      });
      spotifySearchResults.appendChild(item);
    });
    spotifySearchResults.classList.add("open");
  }

  spotifyLoginBtn.addEventListener("click", loginSpotify);
  spotifyPlay.addEventListener("click", () => spotifyPlayer?.togglePlay());
  spotifyNext.addEventListener("click", () => spotifyPlayer?.nextTrack());
  spotifyPrev.addEventListener("click", () => spotifyPlayer?.previousTrack());
  spotifyProgressSlider.addEventListener("input", (e) => spotifyPlayer?.seek(parseInt(e.target.value, 10)));
  spotifyVolumeSlider.addEventListener("input", (e) => spotifyPlayer?.setVolume(parseFloat(e.target.value)));
  spotifySearchBtn.addEventListener("click", async () => {
    const q = spotifySearchInput.value.trim();
    if (q) renderSearchResults(await searchSpotify(q));
  });
  spotifySearchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const q = spotifySearchInput.value.trim();
      if (q) searchSpotify(q).then(renderSearchResults);
    }
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".spotify-search-row") && !e.target.closest(".spotify-search-results")) {
      spotifySearchResults.classList.remove("open");
    }
  });

  const code = new URLSearchParams(window.location.search).get("code");
  if (code) {
    exchangeToken(code).then((token) => {
      if (token) {
        window.history.replaceState({}, document.title, window.location.pathname);
        initSpotifyPlayer(token);
      }
    });
  } else {
    const existing = localStorage.getItem(LS_KEYS.spotifyAccess);
    if (existing) {
      spotifyAccessToken = existing;
      initSpotifyPlayer(existing);
    }
  }

  // =========================================================
  // SPEED DIAL
  // =========================================================
  const speeddialGrid = document.getElementById("speeddial-grid");
  const shortcutForm = document.getElementById("shortcut-form");
  const shortcutName = document.getElementById("shortcut-name");
  const shortcutUrl = document.getElementById("shortcut-url");

  let shortcuts = [];
  try {
    shortcuts = JSON.parse(localStorage.getItem(LS_KEYS.shortcuts)) || [];
  } catch (e) { shortcuts = []; }

  if (shortcuts.length === 0) {
    shortcuts = [
      { name: "GitHub", url: "https://github.com" },
      { name: "Gmail", url: "https://mail.google.com" },
      { name: "YouTube", url: "https://youtube.com" },
      { name: "Hack", url: "https://hackclub.com" },
    ];
  }

  function getDomain(u) {
    try { return new URL(u).hostname; } catch (e) { return ""; }
  }

  function renderShortcuts() {
    speeddialGrid.replaceChildren();
    shortcuts.forEach((sc, i) => {
      const a = document.createElement("a");
      a.className = "speeddial-item";
      a.href = sc.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.title = sc.name;

      const icon = document.createElement("div");
      icon.className = "speeddial-icon";
      const domain = getDomain(sc.url);
      if (domain) {
        const img = document.createElement("img");
        img.src = "https://icons.duckduckgo.com/ip3/" + domain + ".ico";
        img.alt = "";
        img.style.width = "16px";
        img.style.height = "16px";
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
      const del = document.createElement("button");
      del.className = "speeddial-del";
      del.type = "button";
      del.textContent = "×";
      del.title = "Remove " + sc.name;
      del.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        shortcuts.splice(i, 1);
        localStorage.setItem(LS_KEYS.shortcuts, JSON.stringify(shortcuts));
        renderShortcuts();
      });
      a.append(icon, label, del);
      speeddialGrid.appendChild(a);
    });
  }

  shortcutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = shortcutName.value.trim();
    let url = shortcutUrl.value.trim();
    if (!name || !url) return;
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    shortcuts.push({ name, url });
    localStorage.setItem(LS_KEYS.shortcuts, JSON.stringify(shortcuts));
    shortcutName.value = "";
    shortcutUrl.value = "";
    renderShortcuts();
  });
  renderShortcuts();

  // =========================================================
  // NOTES (auto-save)
  // =========================================================
  const notesArea = document.getElementById("notes-area");
  const notesStatus = document.getElementById("notes-status");
  notesArea.value = localStorage.getItem(LS_KEYS.notes) || "";
  let notesTimer = null;
  notesArea.addEventListener("input", () => {
    notesStatus.textContent = "Saving…";
    clearTimeout(notesTimer);
    notesTimer = setTimeout(() => {
      localStorage.setItem(LS_KEYS.notes, notesArea.value);
      notesStatus.textContent = "Saved";
    }, 400);
  });

  // =========================================================
  // TASKS / TODO
  // =========================================================
  const todoForm = document.getElementById("todo-form");
  const todoInput = document.getElementById("todo-input");
  const todoList = document.getElementById("todo-list");
  const todoCount = document.getElementById("todo-count");

  let todos = [];
  try {
    todos = JSON.parse(localStorage.getItem(LS_KEYS.todos)) || [];
  } catch (e) { todos = []; }
  if (todos.length === 0) {
    todos = [
      { id: cryptoId(), text: "Make the dashboard feel like home", done: false },
      { id: cryptoId(), text: "Run a focus cycle", done: false },
      { id: cryptoId(), text: "Add a habit and keep the streak alive", done: false },
    ];
  }
  function cryptoId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  function saveTodos() {
    localStorage.setItem(LS_KEYS.todos, JSON.stringify(todos));
    todoCount.textContent = todos.filter((t) => !t.done).length + " open";
    updateStats();
  }
  function renderTodos() {
    todoList.replaceChildren();
    todos.forEach((todo) => {
      const li = document.createElement("li");
      li.className = "todo-item" + (todo.done ? " done" : "");
      li.dataset.id = todo.id;
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
      const del = document.createElement("button");
      del.type = "button";
      del.className = "todo-del";
      del.textContent = "×";
      del.setAttribute("aria-label", "Delete task");
      del.addEventListener("click", () => {
        li.style.transition = "all 200ms ease";
        li.style.opacity = "0";
        li.style.transform = "translateX(8px)";
        setTimeout(() => {
          todos = todos.filter((t) => t.id !== todo.id);
          renderTodos();
          saveTodos();
        }, 220);
      });
      li.append(check, text, del);
      todoList.appendChild(li);
    });
    todoCount.textContent = todos.filter((t) => !t.done).length + " open";
  }
  todoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = todoInput.value.trim();
    if (!v) return;
    todos.unshift({ id: cryptoId(), text: v, done: false });
    todoInput.value = "";
    renderTodos();
    saveTodos();
  });
  renderTodos();

  // =========================================================
  // HABIT TRACKER (new)
  // =========================================================
  // Data shape:
  //   habits = [{ id, name, days: { "YYYY-MM-DD": true } }]
  const HABIT_KEY = LS_KEYS.habits;
  const habitGrid = document.getElementById("habit-grid");
  const habitList = document.getElementById("habit-list");
  const habitInput = document.getElementById("habit-name-input");
  const habitAddBtn = document.getElementById("habit-add-btn");
  const habitsWeeknum = document.getElementById("habits-weeknum");
  const habitsStreak = document.getElementById("habits-streak");
  const habitsToday = document.getElementById("habits-today");

  function dateKey(d) {
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    return y + "-" + m + "-" + day;
  }
  function startOfWeek(d) {
    // Mon = start. JS Sunday=0, Monday=1.
    const day = (d.getDay() + 6) % 7;
    const out = new Date(d);
    out.setHours(0, 0, 0, 0);
    out.setDate(out.getDate() - day);
    return out;
  }
  function isoWeek(d) {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return Math.ceil((((t - yearStart) / 86400000) + 1) / 7);
  }
  function loadHabits() {
    try { return JSON.parse(localStorage.getItem(HABIT_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveHabits(arr) { localStorage.setItem(HABIT_KEY, JSON.stringify(arr)); }

  let habits = loadHabits();

  function renderHabits() {
    habitGrid.replaceChildren();
    habitList.replaceChildren();
    if (!habits.length) {
      habitGrid.appendChild(emptyMessage("Add a habit to start tracking."));
      habitsStreak.textContent = "0 habits";
      habitsWeeknum.textContent = "Week " + isoWeek(new Date());
      habitsToday.textContent = new Date().toLocaleDateString(undefined, { weekday: "short" });
      return;
    }
    const today = new Date();
    const weekStart = startOfWeek(today);
    const todayKey = dateKey(today);
    const dayLetters = ["M", "T", "W", "T", "F", "S", "S"];
    let activeDays = new Set();

    habits.forEach((habit) => {
      const card = document.createElement("div");
      card.className = "habit-row-head";
      const head = document.createElement("div");
      head.className = "habit-row-name";
      const name = document.createElement("div");
      name.textContent = habit.name;
      const del = document.createElement("button");
      del.type = "button";
      del.className = "habit-row-del";
      del.textContent = "×";
      del.title = "Remove " + habit.name;
      del.addEventListener("click", () => {
        habits = habits.filter((h) => h.id !== habit.id);
        saveHabits(habits);
        renderHabits();
      });
      head.appendChild(name);
      card.append(head, del);
      habitList.appendChild(card);

      // 7-day cells, one row
      const row = document.createElement("div");
      row.className = "habit-row";

      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        const key = dateKey(d);
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "habit-cell";
        if (habit.days[key]) {
          cell.classList.add("is-on");
          if (key <= todayKey) activeDays.add(key);
        }
        if (key === todayKey) cell.classList.add("is-today");
        const isFuture = key > todayKey;
        if (isFuture) cell.classList.add("is-future");
        const label = document.createElement("span");
        label.textContent = dayLetters[i];
        const dot = document.createElement("span");
        dot.className = "dot";
        cell.append(label, dot);
        cell.addEventListener("click", () => {
          if (isFuture) return;
          if (!habit.days) habit.days = {};
          habit.days[key] = !habit.days[key];
          saveHabits(habits);
          renderHabits();
        });
        row.appendChild(cell);
      }
      habitGrid.appendChild(row);
    });

    // streak = consecutive completed days across ALL habits (today-anchored)
    const sortedDays = Array.from(activeDays).sort();
    let streak = 0;
    if (sortedDays.length) {
      let cursor = new Date(today);
      cursor.setHours(0, 0, 0, 0);
      while (sortedDays.includes(dateKey(cursor))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      }
    }
    habitsStreak.textContent = "Streak · " + streak + "d";
    habitsWeeknum.textContent = "Week " + isoWeek(today);
    habitsToday.textContent = today.toLocaleDateString(undefined, { weekday: "short" });
  }

  function emptyMessage(text) {
    const el = document.createElement("div");
    el.className = "habit-empty";
    el.textContent = text;
    return el;
  }

  habitAddBtn.addEventListener("click", () => {
    const name = habitInput.value.trim();
    if (!name) return;
    habits.push({ id: cryptoId(), name, days: {} });
    habitInput.value = "";
    saveHabits(habits);
    renderHabits();
  });
  habitInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") habitAddBtn.click();
  });
  renderHabits();

  // =========================================================
  // READING LIST WIDGET
  // =========================================================
  const READING_KEY = LS_KEYS.reading;
  const readingList = document.getElementById("reading-list");
  const readingForm = document.getElementById("reading-form");
  const readingUrl = document.getElementById("reading-url");
  const readingCount = document.getElementById("reading-count");

  let readingItems = [];
  try { readingItems = JSON.parse(localStorage.getItem(READING_KEY)) || []; }
  catch (e) { readingItems = []; }

  function saveReading() { localStorage.setItem(READING_KEY, JSON.stringify(readingItems)); }

  function deriveTitle(url) {
    try {
      const u = new URL(url);
      const path = u.pathname === "/" ? "" : u.pathname;
      return (u.hostname.replace(/^www\./, "") + path).slice(0, 60);
    } catch (e) {
      return url.slice(0, 60);
    }
  }

  function renderReading() {
    if (!readingList) return;
    readingList.replaceChildren();
    readingCount.textContent = readingItems.length + (readingItems.length === 1 ? " saved" : " saved");
    if (!readingItems.length) {
      const empty = document.createElement("div");
      empty.className = "reading-empty";
      empty.textContent = "Paste a link below to save it.";
      readingList.appendChild(empty);
      return;
    }
    readingItems.forEach((item, i) => {
      const row = document.createElement("div");
      row.className = "reading-item";
      const main = document.createElement("div");
      main.className = "reading-item-main";
      const a = document.createElement("a");
      a.className = "reading-item-title";
      a.href = item.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = item.title || deriveTitle(item.url);
      main.appendChild(a);
      if (item.note) {
        const note = document.createElement("div");
        note.className = "reading-item-note";
        note.textContent = item.note;
        main.appendChild(note);
      }
      const del = document.createElement("button");
      del.type = "button";
      del.className = "reading-item-del";
      del.setAttribute("aria-label", "Remove " + (item.title || item.url));
      del.textContent = "\u00d7";
      del.addEventListener("click", () => {
        readingItems.splice(i, 1);
        saveReading();
        renderReading();
      });
      row.append(main, del);
      readingList.appendChild(row);
    });
  }

  readingForm && readingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let url = readingUrl.value.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    try { new URL(url); } catch (err) { return; }
    readingItems.unshift({ id: cryptoId(), url, title: deriveTitle(url), note: "" });
    readingUrl.value = "";
    saveReading();
    renderReading();
  });
  renderReading();

  // =========================================================
  // COMMAND BAR
  // =========================================================
  const commandBar = document.getElementById("command-bar");
  const commandInput = document.getElementById("command-input");
  const cmdPanel = document.getElementById("cmd-panel");

  function focusWidget(name) {
    const el = document.querySelector('.widget[data-widget="' + name + '"]');
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.animate(
      [
        { borderColor: "var(--line)" },
        { borderColor: "var(--accent)" },
        { borderColor: "var(--line)" },
      ],
      { duration: 800, easing: "ease-out" }
    );
  }

  const COMMANDS = [
    { label: "Focus Weather widget", tag: "widget", action: () => focusWidget("weather") },
    { label: "Focus Focus timer", tag: "widget", action: () => focusWidget("focus") },
    { label: "Focus Habits", tag: "widget", action: () => focusWidget("habits") },
    { label: "Focus Notes", tag: "widget", action: () => focusWidget("notes") },
    { label: "Focus Speed Dial", tag: "widget", action: () => focusWidget("speeddial") },
    { label: "Cycle accent color", tag: "theme", action: () => cycleTheme() },
    { label: "Open Options", tag: "settings", action: () => openModal(settingsModal) },
    { label: "Open Shortcuts", tag: "help", action: () => openModal(shortcutsModal) },
    { label: "Export Settings", tag: "file", action: () => exportSettings() },
    { label: "Google Search for “{q}”", tag: "web", action: (q) => window.open("https://www.google.com/search?q=" + encodeURIComponent(q), "_blank", "noopener,noreferrer") },
  ];

  let cmdItems = [];
  let cmdActiveIndex = 0;

  function setActiveCmd(idx) {
    if (!cmdItems.length) return;
    cmdActiveIndex = ((idx % cmdItems.length) + cmdItems.length) % cmdItems.length;
    cmdPanel.querySelectorAll(".cmd-item").forEach((el, i) => {
      el.classList.toggle("active", i === cmdActiveIndex);
    });
    const active = cmdPanel.querySelector(".cmd-item.active");
    if (active) active.scrollIntoView({ block: "nearest" });
  }

  function renderCommandPanel(q) {
    cmdPanel.replaceChildren();
    q = q.trim();
    const items = [];
    COMMANDS.forEach((cmd) => {
      if (cmd.tag === "web") {
        if (q.length > 0) items.push({ text: cmd.label.replace("{q}", q), tag: cmd.tag, run: () => cmd.action(q) });
      } else if (q.length === 0 || cmd.label.toLowerCase().includes(q.toLowerCase())) {
        items.push({ text: cmd.label, tag: cmd.tag, run: cmd.action });
      }
    });
    cmdItems = items;
    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "cmd-empty";
      empty.textContent = q ? "No commands match \u201c" + q + "\u201d. Press Enter to search Google." : "Type to search or run a command.";
      cmdPanel.appendChild(empty);
      cmdPanel.classList.add("open");
      return;
    }
    cmdActiveIndex = 0;
    items.forEach((item, i) => {
      const div = document.createElement("div");
      div.className = "cmd-item" + (i === 0 ? " active" : "");
      const num = document.createElement("span");
      num.className = "num";
      num.textContent = i < 9 ? String(i + 1) : "";
      const label = document.createElement("span");
      label.className = "label";
      label.textContent = item.text;
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = item.tag;
      div.append(num, label, tag);
      div.addEventListener("mouseenter", () => setActiveCmd(i));
      div.addEventListener("mousedown", (e) => {
        e.preventDefault();
        item.run();
        commandInput.value = "";
        cmdPanel.classList.remove("open");
      });
      cmdPanel.appendChild(div);
    });
    const foot = document.createElement("div");
    foot.className = "cmd-foot";
    foot.textContent = "\u2191\u2193 navigate   \u21b5 run   esc close";
    cmdPanel.appendChild(foot);
    cmdPanel.classList.add("open");
  }

  commandInput.addEventListener("focus", () => {
    commandBar.classList.add("focused");
    const r = commandBar.getBoundingClientRect();
    cmdPanel.style.top = (r.bottom + 8) + "px";
    cmdPanel.style.left = r.left + "px";
    cmdPanel.style.width = r.width + "px";
    renderCommandPanel(commandInput.value);
  });
  commandInput.addEventListener("blur", () => {
    commandBar.classList.remove("focused");
    setTimeout(() => cmdPanel.classList.remove("open"), 120);
  });
  commandInput.addEventListener("input", () => renderCommandPanel(commandInput.value));
  commandInput.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveCmd(cmdActiveIndex + 1); return; }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActiveCmd(cmdActiveIndex - 1); return; }
    if (e.key === "Enter") {
      e.preventDefault();
      const active = cmdPanel.querySelector(".cmd-item.active");
      if (active) {
        active.dispatchEvent(new Event("mousedown", { bubbles: true }));
      } else if (commandInput.value.trim()) {
        window.open("https://www.google.com/search?q=" + encodeURIComponent(commandInput.value.trim()), "_blank", "noopener,noreferrer");
        commandInput.value = "";
        commandInput.blur();
      }
    } else if (e.key === "Escape") {
      commandInput.blur();
    }
  });

  // =========================================================
  // WEATHER (Open-Meteo)
  // =========================================================
  const weatherTemp = document.getElementById("weather-temp");
  const weatherDesc = document.getElementById("weather-desc");
  const weatherIcon = document.getElementById("weather-icon");
  const weatherLoc = document.getElementById("weather-loc");
  const weatherHi = document.getElementById("weather-hi");
  const weatherLo = document.getElementById("weather-lo");
  const weatherLocationInput = document.getElementById("weather-location-input");
  const weatherLocationForm = document.getElementById("weather-form");

  // Map emoji by WMO weather code
  const WX_ICON = { 0: "☀", 1: "⛅", 2: "⛅", 3: "☁", 45: "·", 48: "·", 51: "☂", 61: "☂", 63: "☂", 71: "❄", 80: "☂", 95: "⚡" };

  async function fetchWeather(lat, lon, label) {
    try {
      const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto");
      if (!r.ok) throw new Error("bad response");
      const d = await r.json();
      renderWeather({
        temp: Math.round(d.current_weather.temperature),
        hi: Math.round(d.daily.temperature_2m_max[0]),
        lo: Math.round(d.daily.temperature_2m_min[0]),
        code: d.current_weather.weathercode,
      }, label);
    } catch (e) {
      renderWeather({ temp: 19, hi: 23, lo: 14, code: 1 }, label);
    }
  }

  function renderWeather(d, label = "Your location") {
    weatherTemp.textContent = d.temp + "°";
    weatherIcon.textContent = WX_ICON[d.code] || "·";
    const cond = codeToCondition(d.code);
    weatherDesc.textContent = cond;
    weatherHi.textContent = "H: " + d.hi + "°";
    weatherLo.textContent = "L: " + d.lo + "°";
    weatherLoc.textContent = label;
  }

  function codeToCondition(code) {
    if (code === 0) return "Clear";
    if (code <= 3) return "Cloudy";
    if (code >= 51 && code <= 67) return "Rain";
    if (code >= 71 && code <= 77) return "Snow";
    if (code >= 95) return "Storm";
    return "Mist";
  }

  async function fetchWeatherForLocation(q) {
    if (!q) return;
    try {
      const r = await fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(q) + "&count=1&language=en&format=json");
      const d = await r.json();
      const first = d.results?.[0];
      if (first) {
        fetchWeather(first.latitude, first.longitude, first.name);
      } else {
        renderWeather({ temp: 19, hi: 23, lo: 14, code: 1 }, q);
      }
    } catch (e) {
      renderWeather({ temp: 19, hi: 23, lo: 14, code: 1 }, q);
    }
  }

  weatherLocationForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = weatherLocationInput.value.trim();
    if (!v) return;
    localStorage.setItem(LS_KEYS.weatherLocation, v);
    fetchWeatherForLocation(v);
  });

  const savedLoc = localStorage.getItem(LS_KEYS.weatherLocation);
  if (savedLoc) {
    weatherLocationInput.value = savedLoc;
    fetchWeatherForLocation(savedLoc);
  } else if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (p) => fetchWeather(p.coords.latitude, p.coords.longitude, "Local"),
      () => renderWeather({ temp: 19, hi: 23, lo: 14, code: 1 }, "Milan"),
      { timeout: 4000 }
    );
  } else {
    renderWeather({ temp: 19, hi: 23, lo: 14, code: 1 }, "Milan");
  }

  // =========================================================
  // QUOTE + STATS
  // =========================================================
  const QUOTES = [
    "Design is not just what it looks like and feels like. Design is how it works.",
    "Simplicity is the ultimate sophistication.",
    "Make it simple, but significant.",
    "The best way to predict the future is to invent it.",
    "Details make the design. They are not just details.",
    "You have to start somewhere. Build the thing you wish existed.",
    "Less, but better.",
  ];
  const quoteText = document.getElementById("quote-text");

  function daySeed() {
    const n = new Date();
    return n.getFullYear() * 400 + n.getMonth() * 31 + n.getDate();
  }
  quoteText.textContent = QUOTES[daySeed() % QUOTES.length];

  const statUptime = document.getElementById("stat-uptime");
  const statTasks = document.getElementById("stat-tasks");
  const statFocus = document.getElementById("stat-focus");

  function updateStats() {
    let first = localStorage.getItem(LS_KEYS.firstVisit);
    if (!first) {
      first = Date.now().toString();
      localStorage.setItem(LS_KEYS.firstVisit, first);
    }
    const days = Math.max(1, Math.floor((Date.now() - parseInt(first, 10)) / 86400000) + 1);
    statUptime.textContent = days;
    const done = todos.filter((t) => t.done).length + parseInt(localStorage.getItem(LS_KEYS.pomodoroDone) || "0", 10);
    statTasks.textContent = done;
    statFocus.textContent = parseInt(localStorage.getItem(LS_KEYS.visits) || "1", 10);
  }

  const today = new Date().toDateString();
  let visits = parseInt(localStorage.getItem(LS_KEYS.visits) || "0", 10);
  if (localStorage.getItem(LS_KEYS.visitDate) !== today) visits = 1;
  else visits += 1;
  localStorage.setItem(LS_KEYS.visitDate, today);
  localStorage.setItem(LS_KEYS.visits, visits.toString());
  updateStats();

  // =========================================================
  // EXPORT / IMPORT (new)
  // =========================================================
  const exportBtn = document.getElementById("export-btn");
  const importBtn = document.getElementById("import-btn");
  const importFile = document.getElementById("import-file");

  function exportSettings() {
    const payload = {};
    Object.entries(LS_KEYS).forEach(([k, key]) => {
      const v = localStorage.getItem(key);
      if (v !== null) payload[key] = v;
    });
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dt = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = "aura-settings-" + dt + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importSettings(jsonText) {
    let data;
    try { data = JSON.parse(jsonText); } catch (e) { return false; }
    if (typeof data !== "object" || data === null) return false;
    let count = 0;
    Object.values(LS_KEYS).forEach((k) => {
      if (data[k] !== undefined) {
        localStorage.setItem(k, data[k]);
        count++;
      }
    });
    return count > 0;
  }

  exportBtn.addEventListener("click", exportSettings);
  importBtn.addEventListener("click", () => importFile.click());
  importFile.addEventListener("change", (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importSettings(String(reader.result || ""));
      importFile.value = "";
      if (ok) window.location.reload();
      else alert("That file doesn't look like an AURA backup.");
    };
    reader.readAsText(f);
  });

  // =========================================================
  // KEYBOARD SHORTCUTS (global)
  // =========================================================
  document.addEventListener("keydown", (e) => {
    const target = e.target;
    const inField = target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
    const cmdKey = e.metaKey || e.ctrlKey;

    if (e.key === "Escape") {
      if (galleryModal && galleryModal.classList.contains("open")) { closeModal(galleryModal); return; }
      if (shortcutsModal.classList.contains("open")) { closeModal(shortcutsModal); return; }
      if (settingsModal.classList.contains("open")) { closeModal(settingsModal); return; }
      if (commandInput === document.activeElement) { commandInput.blur(); return; }
    }
    if (cmdKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      commandInput.focus();
      return;
    }
    if (cmdKey && e.key === ",") {
      e.preventDefault();
      openModal(settingsModal);
      return;
    }
    if (cmdKey && e.key.toLowerCase() === "e") {
      e.preventDefault();
      exportSettings();
      return;
    }
    if (e.key === "?" && !inField) {
      e.preventDefault();
      openModal(shortcutsModal);
      return;
    }
    if (e.key.toLowerCase() === "t" && !inField && !cmdKey) {
      e.preventDefault();
      cycleTheme();
      return;
    }
  });
})();
