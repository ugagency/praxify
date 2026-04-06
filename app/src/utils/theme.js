// =============================================
// THEME MANAGER
// Gerencia alternância entre claro/escuro
// =============================================

import { CONFIG, debug } from '../core/config.js';

export function initTheme() {
    const savedTheme = localStorage.getItem(CONFIG.UI.THEME_KEY);

    // Default to dark if no preference (or user preference logic)
    // If saved is 'light', apply it. Otherwise, assume dark default (handled by CSS :root)
    if (savedTheme === 'light') {
        applyTheme('light');
    } else {
        applyTheme('dark');
    }

    debug('Theme initialized:', savedTheme || 'dark (default)');
    setupThemeToggle();
}

export function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'light' ? 'dark' : 'light';

    applyTheme(newTheme);
    localStorage.setItem(CONFIG.UI.THEME_KEY, newTheme);
    debug('Theme toggled to:', newTheme);
}

function applyTheme(theme) {
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    updateToggleIcon(theme);
}

function setupThemeToggle() {
    // Tenta encontrar botão existente ou espera ser criado
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) {
        btn.addEventListener('click', toggleTheme);
    }
}

function updateToggleIcon(theme) {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;

    // Simple text/icon swap
    if (theme === 'light') {
        btn.innerHTML = '🌙'; // Moon icon for switching TO dark
        btn.title = 'Mudar para Modo Escuro';
    } else {
        btn.innerHTML = '☀️'; // Sun icon for switching TO light
        btn.title = 'Mudar para Modo Claro';
    }
}

// Global exposure for HTML onclick if needed
window.toggleTheme = toggleTheme;
