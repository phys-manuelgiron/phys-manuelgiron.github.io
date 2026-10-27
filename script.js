(() => {
const { lightBasis, scatteringBatch, scatteringCounts, makeScatterers, SAMPLE } = globalThis.PortfolioPhysics;

const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const freshSeed = () => crypto.getRandomValues(new Uint32Array(1))[0];

// Each illustration owns its clock. Hidden tabs and offscreen scenes stop
// requesting frames, and resuming does not jump forward in simulation time.
function sceneClock(element, render) {
  let playing = false;
  let visible = true;
  let frame = 0;
  let previous = null;
  let time = 0;
  function schedule() {
    if (playing && visible && !document.hidden && !frame) frame = requestAnimationFrame(tick);
  }
  function tick(now) {
    frame = 0;
    if (!playing || !visible || document.hidden) return;
    if (previous !== null) time += Math.min((now - previous) / 1000, 0.06);
    previous = now;
    render(time);
    schedule();
  }
  function suspend() {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = null;
  }
  const clock = {
    get playing() { return playing; },
    get time() { return time; },
    play() { playing = true; previous = null; schedule(); },
    pause() { playing = false; suspend(); },
    reset() { time = 0; previous = null; render(time); },
    draw() { render(time); },
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      suspend();
      schedule();
    }).observe(element);
  }
  document.addEventListener('visibilitychange', () => { suspend(); schedule(); });
  motion.addEventListener('change', event => {
    if (event.matches) { clock.pause(); element.dispatchEvent(new Event('motionpaused')); }
  });
  return clock;
}

function setupResearchMap() {
  const grid = document.querySelector('.research-orbit');
  const items = [...grid.querySelectorAll('.map-item')];
  function open(item) {
    for (const candidate of items) {
      const selected = candidate === item;
      candidate.classList.toggle('is-open', selected);
      candidate.querySelector('button').setAttribute('aria-expanded', String(selected));
      candidate.querySelector('.map-popover').inert = !selected;
    }
  }
  for (const [index, item] of items.entries()) {
    const button = item.querySelector('button');
    button.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') open(item); });
    button.addEventListener('click', () => open(item));
    item.addEventListener('focusin', () => open(item));
    item.addEventListener('focusout', event => { if (item.classList.contains('is-open') && !item.contains(event.relatedTarget)) open(null); });
    item.addEventListener('pointerleave', event => { if (event.pointerType !== 'touch' && item.classList.contains('is-open') && !item.contains(document.activeElement)) open(null); });
    item.addEventListener('keydown', event => {
      if (event.key === 'Escape') { button.focus();open(null);return; }
      if (event.target !== button) return;
      const direction = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -1, ArrowDown: 1 }[event.key];
      if (direction) { event.preventDefault();items[(index + direction + items.length) % items.length].querySelector('button').focus(); }
    });
  }
  document.addEventListener('pointerdown', event => { if (!grid.contains(event.target)) open(null); });
  grid.classList.add('map-ready');
  open(null);
}

function setupLightField() {
  const stage = document.querySelector('#light-stage');
  const canvas = document.querySelector('#light-canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) { document.querySelector('#light-status').textContent = 'Static preview: drawing is unavailable in this browser.';return; }
  const raster = document.createElement('canvas');
  raster.width = 220;
  raster.height = 132;
  const rasterContext = raster.getContext('2d');
  if (!rasterContext) return;
  const pixels = rasterContext.createImageData(raster.width, raster.height);
  const sources = [{ x: 0.3, y: 0.43 }, { x: 0.68, y: 0.57 }];
  const buttons = [document.querySelector('#source-a'), document.querySelector('#source-b')];
  const wavelength = document.querySelector('#wavelength');
  const twoSources = document.querySelector('#two-sources');
  const play = document.querySelector('#light-play');
  function readPalette() {
    const style = getComputedStyle(document.documentElement);
    const rgb = name => style.getPropertyValue(name).trim().replace('#', '').match(/../g).map(value => parseInt(value, 16));
    return { background: rgb('--field-bg'), positive: rgb('--field-positive'), negative: rgb('--field-negative') };
  }
  let palette = readPalette();
  let basis;
  let phaseOffset = 0;
  let dirty = true;
  const clock = sceneClock(stage, time => {
    if (dirty) {
      basis = lightBasis(raster.width, raster.height, twoSources.checked ? sources : sources.slice(0, 1), Number(wavelength.value));
      dirty = false;
    }
    const angularFrequency = 2 * Math.PI * 12 / Number(wavelength.value);
    const cosTime = Math.cos(time * angularFrequency + phaseOffset);
    const sinTime = Math.sin(time * angularFrequency + phaseOffset);
    for (let i = 0; i < basis.cosine.length; i += 1) {
      const amplitude = basis.cosine[i] * cosTime + basis.sine[i] * sinTime;
      const mix = Math.min(0.78, Math.abs(amplitude) * 0.95);
      const color = amplitude > 0 ? palette.positive : palette.negative;
      const background = palette.background;
      for (let channel = 0; channel < 3; channel += 1) pixels.data[i * 4 + channel] = background[channel] + (color[channel] - background[channel]) * mix;
      pixels.data[i * 4 + 3] = 255;
    }
    rasterContext.putImageData(pixels, 0, 0);
    ctx.drawImage(raster, 0, 0, canvas.width, canvas.height);
  });
  window.addEventListener('themechange', () => { palette = readPalette();clock.draw(); });
  function updateSources() {
    for (const [index, button] of buttons.entries()) {
      button.style.left = `${sources[index].x * 100}%`;
      button.style.top = `${sources[index].y * 100}%`;
      button.setAttribute('aria-label', `Source ${index + 1}, position ${Math.round(sources[index].x * 100)} percent across, ${Math.round(sources[index].y * 100)} percent down. Drag or use arrow keys to move.`);
    }
    buttons[1].hidden = !twoSources.checked;
    dirty = true;
    clock.draw();
  }
  function syncPlay() {
    play.textContent = clock.playing ? 'Pause' : 'Play';
    play.setAttribute('aria-pressed', String(clock.playing));
  }
  play.addEventListener('click', () => { clock.playing ? clock.pause() : clock.play(); syncPlay(); });
  stage.addEventListener('motionpaused', syncPlay);
  twoSources.addEventListener('change', updateSources);
  wavelength.addEventListener('input', () => { document.querySelector('#wavelength-value').value = wavelength.value;dirty = true;clock.draw(); });
  document.querySelector('#light-phase').addEventListener('input', event => {
    clock.pause();phaseOffset = Number(event.target.value) / 100 * 2 * Math.PI;clock.draw();syncPlay();
  });
  canvas.addEventListener('click', event => {
    const rect = stage.getBoundingClientRect();
    sources[0].x = clamp((event.clientX - rect.left) / rect.width, .05, .95);
    sources[0].y = clamp((event.clientY - rect.top) / rect.height, .08, .92);
    updateSources();
  });
  for (const [index, button] of buttons.entries()) {
    let dragging = false;
    button.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      dragging = true;
      button.setPointerCapture(event.pointerId);
      button.focus({ preventScroll: true });
      event.preventDefault();
    });
    button.addEventListener('pointermove', event => {
      if (!dragging) return;
      const rect = stage.getBoundingClientRect();
      sources[index].x = clamp((event.clientX - rect.left) / rect.width, 0.05, 0.95);
      sources[index].y = clamp((event.clientY - rect.top) / rect.height, 0.08, 0.92);
      updateSources();
    });
    for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(event, () => { dragging = false; });
    button.addEventListener('keydown', event => {
      const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      if (!directions[event.key]) return;
      event.preventDefault();
      const [dx, dy] = directions[event.key];
      sources[index].x = clamp(sources[index].x + dx * 0.02, 0.05, 0.95);
      sources[index].y = clamp(sources[index].y + dy * 0.02, 0.08, 0.92);
      updateSources();
    });
  }
  document.querySelector('#light-reset').addEventListener('click', () => {
    sources[0] = { x: 0.3, y: 0.43 };
    sources[1] = { x: 0.68, y: 0.57 };
    wavelength.value = '48';
    document.querySelector('#wavelength-value').value = '48';
    document.querySelector('#light-phase').value = '0';phaseOffset = 0;
    twoSources.checked = true;
    dirty = true;
    clock.reset();
    updateSources();
  });
  updateSources();
  canvas.hidden = false;
  stage.classList.add('ready');
  stage.querySelector('.source-controls').hidden = false;
  document.querySelector('.light-controls').disabled = false;
  document.querySelector('#light-status').textContent = motion.matches ? 'Motion is paused. Use the sliders, move a source, or press Play.' : 'Drag a source, click the field, or try the sliders.';
  if (!motion.matches) clock.play();
  syncPlay();
}

function setupScattering() {
  const root = document.querySelector('.scatter-lab');
  const canvas = document.querySelector('#scatter-canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) { document.querySelector('#scatter-status').textContent = 'Static preview: drawing is unavailable in this browser.';return; }
  const density = document.querySelector('#density');
  const radius = document.querySelector('#particle-size');
  const status = document.querySelector('#scatter-status');
  const launch = document.querySelector('#scatter-launch');
  const pause = document.querySelector('#scatter-pause');
  const outputs = Object.fromEntries(['forward', 'back', 'side'].map(key => [key, document.querySelector(`#count-${key}`)]));
  let seed = 0x5a17;
  let particles = [];
  let paths = [];
  let duration = 0;
  let staticOutcome = false;
  let lastStatus = '';
  function label(text) { if (text !== lastStatus) { status.textContent = text;lastStatus = text; } }
  function drawRay(path, distance) {
    const visible = Math.min(path.distance, distance);
    ctx.beginPath();ctx.moveTo(path.points[0].x, path.points[0].y);
    let head = path.points[0];
    for (let i = 1; i < path.points.length; i += 1) {
      const previous = path.points[i - 1];
      const point = path.points[i];
      if (visible <= previous.distance) break;
      const ratio = Math.min(1, (visible - previous.distance) / (point.distance - previous.distance));
      head = { x: previous.x + (point.x - previous.x) * ratio, y: previous.y + (point.y - previous.y) * ratio };
      ctx.lineTo(head.x, head.y);
      if (ratio < 1) break;
    }
    ctx.strokeStyle = 'rgba(169, 230, 183, 0.35)';ctx.lineWidth = 1.3;ctx.stroke();
    if (visible < path.distance) { ctx.beginPath();ctx.arc(head.x, head.y, 2.5, 0, Math.PI * 2);ctx.fillStyle = '#eff7ca';ctx.fill(); }
    for (const point of path.points) {
      if (point.particleId === undefined || visible < point.distance) continue;
      const age = visible - point.distance;
      if (!staticOutcome && age > 100) continue;
      ctx.beginPath();ctx.arc(point.x, point.y, staticOutcome ? 2.5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = staticOutcome ? '#e5d49b' : `rgba(255, 225, 139, ${1 - age / 130})`;ctx.fill();
    }
  }
  const clock = sceneClock(root, time => {
    ctx.fillStyle = '#233d34';ctx.fillRect(0, 0, 600, 360);
    ctx.fillStyle = 'rgba(184, 216, 203, 0.045)';ctx.fillRect(SAMPLE.left, SAMPLE.top, 340, 224);
    ctx.strokeStyle = '#638774';ctx.lineWidth = 1;ctx.strokeRect(SAMPLE.left, SAMPLE.top, 340, 224);
    ctx.fillStyle = '#afc8b5';ctx.fillRect(24, 140, 42, 76);
    ctx.fillStyle = '#bdce98';ctx.fillRect(460, SAMPLE.top, 9, 224);
    ctx.font = '17px Arial, sans-serif';ctx.fillStyle = '#d7e7dc';
    ctx.fillText('SOURCE', 20, 42);ctx.fillText('SAMPLE', 253, 42);ctx.fillText('DETECTOR', 470, 42);
    for (const particle of particles) {
      ctx.beginPath();ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#577b69';ctx.fill();ctx.strokeStyle = '#c1d4a3';ctx.lineWidth = 1.2;ctx.stroke();
    }
    const distance = staticOutcome ? Infinity : time * 240;
    for (const path of paths) drawRay(path, distance);
    const counts = scatteringCounts(paths, distance);
    for (const key of Object.keys(outputs)) outputs[key].textContent = String(counts[key]);
    const finished = paths.length - counts.inside;
    if (staticOutcome) label(`${particles.length} particles · all ${paths.length} paths shown. Move a slider to change the sample.`);
    else if (distance >= duration) {
      label(`${finished} of ${paths.length} rays exited · pulse repeats. Yellow flashes mark collisions.`);
      if (distance > duration + 360) clock.reset();
    } else label(`${particles.length} particles · yellow flashes show where rays hit.`);
  });
  function syncPause() {
    pause.textContent = clock.playing ? 'Pause' : 'Play';pause.disabled = false;
    pause.setAttribute('aria-pressed', String(clock.playing));
  }
  function startPulse(animate = true) {
    clock.pause();staticOutcome = !animate;clock.reset();
    if (animate) clock.play();
    syncPause();
  }
  function rebuild() {
    particles = makeScatterers(Number(density.value), seed, Number(radius.value));
    paths = scatteringBatch(Number(density.value), seed, 48, Number(radius.value), particles);
    duration = Math.max(...paths.map(path => path.distance));
    document.querySelector('#density-value').value = density.value;
    document.querySelector('#particle-size-value').value = radius.value;
    startPulse(!motion.matches);
  }
  launch.addEventListener('click', () => startPulse(!motion.matches));
  pause.addEventListener('click', () => {
    if (clock.playing) clock.pause();
    else if (staticOutcome) startPulse(true);
    else clock.play();
    syncPause();
  });
  root.addEventListener('motionpaused', () => { staticOutcome = true;clock.draw();syncPause(); });
  density.addEventListener('input', rebuild);
  radius.addEventListener('input', rebuild);
  document.querySelector('#scatter-new').addEventListener('click', () => { seed = freshSeed();rebuild(); });
  rebuild();canvas.hidden = false;root.querySelector('.scatter-stage').classList.add('ready');
  root.querySelector('.scatter-controls').disabled = false;
}

setupResearchMap();
setupLightField();
setupScattering();

const citation = 'Emadelden Fouad, A. F. Amin, Manuel Giron, and Arafa H. Aly, “Humidity-resilient TiO₂/CaF₂ photonic crystal smart window with a Fabry–Perot cavity for broadband near-infrared blocking in hot-humid subtropical climates: a design and simulation study,” Applied Optics 65, 7235–7244 (2026). https://doi.org/10.1364/AO.606352';
const citationButton = document.querySelector('.citation-button');
if (citationButton && navigator.clipboard?.writeText) {
  citationButton.hidden = false;
  citationButton.addEventListener('click', async () => {
    const feedback = document.querySelector('.citation-feedback');
    try { await navigator.clipboard.writeText(citation); feedback.textContent = 'Citation copied.'; }
    catch { feedback.textContent = 'Copy unavailable. The full citation is listed above.'; }
  });
}

if ('IntersectionObserver' in window) {
  const links = [...document.querySelectorAll('.nav-links a')];
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      for (const link of links) {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    }
  }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
  for (const link of links) { const section = document.querySelector(link.hash); if (section) observer.observe(section); }
}
document.querySelector('#year').textContent = String(new Date().getFullYear());

})();
