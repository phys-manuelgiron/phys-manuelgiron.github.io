import { lightBasis, scatteringBatch, scatteringCounts, seededRandom, SAMPLE } from './physics.js';

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
  const track = document.querySelector('.map-track');
  const tabs = [...track.querySelectorAll('[role="tab"]')];
  function activate(tab, focus = false) {
    for (const candidate of tabs) {
      const selected = candidate === tab;
      candidate.setAttribute('aria-selected', String(selected));
      candidate.tabIndex = selected ? 0 : -1;
      document.getElementById(candidate.getAttribute('aria-controls')).hidden = !selected;
    }
    if (focus) tab.focus();
  }
  for (const [index, tab] of tabs.entries()) {
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      activate(tabs[next], true);
    });
  }
  activate(tabs[0]);
  track.hidden = false;
}

function setupLightField() {
  const stage = document.querySelector('#light-stage');
  const canvas = document.querySelector('#light-canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
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
  let basis;
  let dirty = true;
  const clock = sceneClock(stage, time => {
    if (dirty) {
      basis = lightBasis(raster.width, raster.height, twoSources.checked ? sources : sources.slice(0, 1), Number(wavelength.value));
      dirty = false;
    }
    const angularFrequency = 2 * Math.PI * 12 / Number(wavelength.value);
    const cosTime = Math.cos(time * angularFrequency);
    const sinTime = Math.sin(time * angularFrequency);
    for (let i = 0; i < basis.cosine.length; i += 1) {
      const amplitude = basis.cosine[i] * cosTime + basis.sine[i] * sinTime;
      const mix = Math.min(0.78, Math.abs(amplitude) * 0.95);
      const color = amplitude > 0 ? [41, 102, 83] : [169, 112, 75];
      const background = [247, 246, 242];
      for (let channel = 0; channel < 3; channel += 1) pixels.data[i * 4 + channel] = background[channel] + (color[channel] - background[channel]) * mix;
      pixels.data[i * 4 + 3] = 255;
    }
    rasterContext.putImageData(pixels, 0, 0);
    ctx.drawImage(raster, 0, 0, canvas.width, canvas.height);
  });
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
  wavelength.addEventListener('input', () => { dirty = true; clock.draw(); });
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
    twoSources.checked = true;
    dirty = true;
    clock.reset();
    updateSources();
  });
  updateSources();
  canvas.hidden = false;
  stage.classList.add('ready');
  stage.querySelector('.source-controls').hidden = false;
  document.querySelector('.light-controls').hidden = false;
  if (!motion.matches) clock.play();
  syncPlay();
}

function setupScattering() {
  const root = document.querySelector('.scatter-lab');
  const canvas = document.querySelector('#scatter-canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const density = document.querySelector('#density');
  const status = document.querySelector('#scatter-status');
  const launch = document.querySelector('#scatter-launch');
  const pause = document.querySelector('#scatter-pause');
  const outputs = Object.fromEntries(['forward', 'back', 'side'].map(key => [key, document.querySelector(`#count-${key}`)]));
  let seed = freshSeed();
  let paths = scatteringBatch(Number(density.value), seed);
  let launched = false;
  let lastStatus = '';
  let speckles = [];
  function makeSpeckles() {
    const random = seededRandom(seed ^ 0xab12);
    speckles = Array.from({ length: Math.round(Number(density.value) * 2) }, () => ({ x: SAMPLE.left + random() * 340, y: SAMPLE.top + random() * 224 }));
  }
  function label(text) {
    if (text !== lastStatus) { status.textContent = text; lastStatus = text; }
  }
  function drawPath(path, distance, preview) {
    const visible = Math.min(path.distance, distance);
    ctx.beginPath();
    ctx.moveTo(path.points[0].x, path.points[0].y);
    let head = path.points[0];
    for (let i = 1; i < path.points.length; i += 1) {
      const point = path.points[i];
      const previous = path.points[i - 1];
      if (visible < previous.distance) break;
      const ratio = Math.min(1, (visible - previous.distance) / (point.distance - previous.distance));
      head = { x: previous.x + (point.x - previous.x) * ratio, y: previous.y + (point.y - previous.y) * ratio };
      ctx.lineTo(head.x, head.y);
      if (ratio < 1) break;
    }
    ctx.strokeStyle = preview ? 'rgba(159, 201, 174, 0.32)' : 'rgba(159, 220, 181, 0.27)';
    ctx.lineWidth = preview ? 1.4 : 1;
    ctx.stroke();
    if (!preview && visible < path.distance) {
      ctx.beginPath();ctx.arc(head.x, head.y, 2.1, 0, Math.PI * 2);
      ctx.fillStyle = '#e5ecc1';ctx.fill();
    }
  }
  const clock = sceneClock(root, time => {
    ctx.fillStyle = '#233d34';ctx.fillRect(0, 0, 600, 360);
    ctx.fillStyle = 'rgba(184, 216, 203, 0.045)';ctx.fillRect(SAMPLE.left, SAMPLE.top, 340, 224);
    ctx.strokeStyle = '#638774';ctx.lineWidth = 1;ctx.strokeRect(SAMPLE.left, SAMPLE.top, 340, 224);
    ctx.fillStyle = '#afc8b5';ctx.fillRect(24, 162, 42, 32);
    ctx.fillStyle = '#bdce98';ctx.fillRect(470, SAMPLE.top, 8, 224);
    ctx.strokeStyle = '#bdce98';ctx.beginPath();ctx.moveTo(460, SAMPLE.top);ctx.lineTo(460, SAMPLE.bottom);ctx.stroke();
    ctx.font = '17px Arial, sans-serif';ctx.fillStyle = '#d7e7dc';
    ctx.fillText('SOURCE', 20, 42);ctx.fillText('SCATTERING SAMPLE', 212, 42);ctx.fillText('DETECTOR', 470, 42);
    ctx.fillStyle = 'rgba(190, 216, 184, 0.35)';
    for (const point of speckles) { ctx.beginPath();ctx.arc(point.x, point.y, 1.1, 0, Math.PI * 2);ctx.fill(); }
    const distance = time * 550;
    for (const path of launched ? paths : paths.slice(0, 6)) drawPath(path, launched ? distance : Infinity, !launched);
    if (launched) {
      const counts = scatteringCounts(paths, distance);
      for (const key of Object.keys(outputs)) outputs[key].textContent = String(counts[key]);
      const finished = paths.length - counts.inside;
      // Announce only coarse progress, rather than every animation frame.
      if (finished === paths.length || distance >= Math.max(...paths.map(path => path.distance))) {
        label(counts.inside ? `${finished} rays left the sample; ${counts.inside} reached the model's event limit.` : `All ${paths.length} rays have left the sample. Counts are for this simulated pulse.`);
        clock.pause();pause.disabled = true;pause.textContent = 'Pause';pause.setAttribute('aria-pressed', 'false');launch.textContent = 'Launch again →';
      } else {
        label(`${Math.floor(finished / 8) * 8} of ${paths.length} rays have left the sample.`);
      }
    }
  });
  function reset() {
    clock.pause();launched = false;
    paths = scatteringBatch(Number(density.value), seed);
    makeSpeckles();clock.reset();
    for (const output of Object.values(outputs)) output.textContent = '—';
    document.querySelector('#density-value').value = density.value;
    pause.disabled = true;pause.textContent = 'Pause';pause.setAttribute('aria-pressed', 'false');
    launch.textContent = 'Launch pulse →';
    label('Example paths. Launch a pulse to follow 48 rays.');
  }
  launch.addEventListener('click', () => {
    launched = true;clock.reset();
    if (motion.matches) {
      // Reduced motion gets the complete outcome immediately.
      const counts = scatteringCounts(paths, Infinity);
      for (const key of Object.keys(outputs)) outputs[key].textContent = String(counts[key]);
      launched = false;
      ctx.clearRect(0, 0, 600, 360);clock.draw();
      for (const path of paths) drawPath(path, Infinity, true);
      label(counts.inside ? `${counts.inside} rays reached the model's event limit; the other paths are shown without animation.` : `All ${paths.length} rays shown without animation. Counts are for this simulated pulse.`);
      launch.textContent = 'Show pulse again →';
    } else {
      pause.disabled = false;pause.textContent = 'Pause';pause.setAttribute('aria-pressed', 'true');clock.play();
    }
  });
  pause.addEventListener('click', () => {
    clock.playing ? clock.pause() : clock.play();
    pause.textContent = clock.playing ? 'Pause' : 'Resume';
    pause.setAttribute('aria-pressed', String(clock.playing));
  });
  root.addEventListener('motionpaused', () => {
    if (launched && !pause.disabled) { pause.textContent = 'Resume';pause.setAttribute('aria-pressed', 'false'); }
  });
  density.addEventListener('input', reset);
  document.querySelector('#scatter-new').addEventListener('click', () => { seed = freshSeed();reset(); });
  reset();
  canvas.hidden = false;root.querySelector('.scatter-stage').classList.add('ready');
  root.querySelector('.scatter-controls').hidden = false;
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
