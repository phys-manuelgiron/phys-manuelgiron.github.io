// Apply the initial choice before styles paint; this also works in file previews.
(() => {
  const key = 'manuel-portfolio-theme';
  const system = matchMedia('(prefers-color-scheme: dark)');
  let preference = null;
  try {
    const saved = localStorage.getItem(key);
    if (saved === 'dark' || saved === 'light') preference = saved;
  } catch { /* A blocked storage API should not prevent theme switching. */ }

  function apply(theme) {
    document.documentElement.dataset.theme = theme;
    const night = theme === 'dark';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = night ? '#111c19' : '#f7f6f2';
    for (const button of document.querySelectorAll('.theme-toggle')) {
      button.hidden = false;
      button.setAttribute('aria-pressed', String(night));
      button.setAttribute('aria-label', `Switch to ${night ? 'day' : 'night'} mode`);
      button.title = `Switch to ${night ? 'day' : 'night'} mode`;
      button.querySelector('.theme-label').textContent = night ? 'Day' : 'Night';
    }
    window.dispatchEvent(new Event('themechange'));
  }

  apply(preference || (system.matches ? 'dark' : 'light'));
  system.addEventListener('change', event => {
    if (!preference) apply(event.matches ? 'dark' : 'light');
  });
  document.addEventListener('DOMContentLoaded', () => {
    apply(preference || (system.matches ? 'dark' : 'light'));
    for (const button of document.querySelectorAll('.theme-toggle')) {
      button.addEventListener('click', () => {
        preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem(key, preference); } catch { /* Session-only choice. */ }
        apply(preference);
      });
    }
  });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    preference = event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : null;
    apply(preference || (system.matches ? 'dark' : 'light'));
  });
})();
