// Content lives in index.html so it remains readable without JavaScript.
// This file adds only progressive enhancements.
const massInput = document.querySelector('#mass');
const massValue = document.querySelector('#mass-value');
const fieldLine = document.querySelector('#field-line');
const envelopeLine = document.querySelector('#field-envelope');

function wavePacket(mass) {
  const field = [];
  const envelope = [];
  const modes = Array.from({ length: 81 }, (_, i) => {
    const k = 0.6 + i * 0.085;
    return { k, weight: Math.exp(-0.5 * ((k - 4) / 0.85) ** 2), omega: Math.hypot(k, mass) };
  });
  const normalization = modes.reduce((sum, mode) => sum + mode.weight, 0);
  for (let i = 0; i <= 440; i += 1) {
    const x = -8 + (i / 440) * 16;
    let real = 0;
    let imaginary = 0;
    for (const { k, weight, omega } of modes) {
      const phase = k * x - omega * 3.2;
      real += weight * Math.cos(phase);
      imaginary += weight * Math.sin(phase);
    }
    const px = 24 + (i / 440) * 552;
    const command = i === 0 ? 'M' : 'L';
    field.push(`${command}${px.toFixed(2)},${(154 - 105 * real / normalization).toFixed(2)}`);
    envelope.push(`${command}${px.toFixed(2)},${(154 - 105 * Math.hypot(real, imaginary) / normalization).toFixed(2)}`);
  }
  return { field: field.join(' '), envelope: envelope.join(' ') };
}

function updateField() {
  const mass = Number(massInput.value);
  const paths = wavePacket(mass);
  fieldLine.setAttribute('d', paths.field);
  envelopeLine.setAttribute('d', paths.envelope);
  massValue.value = mass.toFixed(1);
  massInput.setAttribute('aria-valuetext', `${mass.toFixed(1)}${mass === 0 ? ', massless' : ''}`);
}

if (massInput && fieldLine && envelopeLine && massValue) {
  updateField();
  document.querySelector('.field-controls').hidden = false;
  massInput.addEventListener('input', updateField);
}

const citation = 'Emadelden Fouad, A. F. Amin, Manuel Giron, and Arafa H. Aly, “Humidity-resilient TiO₂/CaF₂ photonic crystal smart window with a Fabry–Perot cavity for broadband near-infrared blocking in hot-humid subtropical climates: a design and simulation study,” Applied Optics 65, 7235–7244 (2026). https://doi.org/10.1364/AO.606352';
const citationButton = document.querySelector('.citation-button');
if (citationButton && navigator.clipboard?.writeText) {
  citationButton.hidden = false;
  citationButton.addEventListener('click', async () => {
    const feedback = document.querySelector('.citation-feedback');
    try {
      await navigator.clipboard.writeText(citation);
      feedback.textContent = 'Citation copied.';
    } catch {
      feedback.textContent = 'Copy unavailable. The full citation is listed above.';
    }
  });
}

if ('IntersectionObserver' in window) {
  const links = [...document.querySelectorAll('.nav-links a')];
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      for (const link of links) {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    }
  }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
  for (const link of links) {
    const section = document.querySelector(link.hash);
    if (section) observer.observe(section);
  }
}

document.querySelector('#year').textContent = String(new Date().getFullYear());
