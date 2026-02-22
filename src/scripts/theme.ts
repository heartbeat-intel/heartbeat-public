/**
 * Light/dark theme toggle.
 * Stores preference in localStorage and applies on load.
 * Default: dark.
 */
function initTheme() {
  const stored = localStorage.getItem('hb-theme');
  const theme = stored === 'light' ? 'light' : 'dark';
  applyTheme(theme);
}

function applyTheme(theme: string) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('hb-theme', theme);

  // Update toggle button icons
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    const sunIcon = btn.querySelector('[data-icon="sun"]');
    const moonIcon = btn.querySelector('[data-icon="moon"]');
    if (sunIcon && moonIcon) {
      if (theme === 'dark') {
        (sunIcon as HTMLElement).style.display = 'block';
        (moonIcon as HTMLElement).style.display = 'none';
      } else {
        (sunIcon as HTMLElement).style.display = 'none';
        (moonIcon as HTMLElement).style.display = 'block';
      }
    }
  });
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}

// Attach to toggle buttons
function bindToggle() {
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', toggleTheme);
  });
}

// Run immediately to prevent flash
initTheme();

// Bind after DOM ready
document.addEventListener('DOMContentLoaded', bindToggle);
document.addEventListener('astro:page-load', bindToggle);
