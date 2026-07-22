let themeToggleBtn = null;

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    if (themeToggleBtn) {
        themeToggleBtn.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    }
}

function createThemeToggleButton() {
    const button = document.createElement('button');
    button.id = 'themeToggleBtn';
    button.type = 'button';
    button.className = 'secondary-btn';
    button.textContent = 'Toggle Theme';

    const header = document.querySelector('.site-header');
    if (header) {
        const controls = header.querySelector('.user-controls') || header;
        controls.appendChild(button);
    } else {
        button.style.position = 'fixed';
        button.style.bottom = '1rem';
        button.style.right = '1rem';
        button.style.zIndex = '999';
        document.body.appendChild(button);
    }

    return button;
}

function loadTheme() {
    const savedTheme = localStorage.getItem('themeMode');
    if (savedTheme === 'dark' || savedTheme === 'light') {
        applyTheme(savedTheme);
        return;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
}

function toggleTheme() {
    debugger;
    const current = document.documentElement.dataset.theme || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('themeMode', next);
}

function initTheme() {
    themeToggleBtn = document.getElementById('themeToggleBtn') || createThemeToggleButton();
    themeToggleBtn.addEventListener('click', toggleTheme);
    loadTheme();
}

document.addEventListener('DOMContentLoaded', initTheme);
