const STORAGE_KEY = 'econRevisionHubData';
const USERS_KEY = 'econRevisionHubUsers';
const CURRENT_USER_KEY = 'econRevisionHubCurrentUser';

const researchInput = document.getElementById('researchInput');
const researchBtn = document.getElementById('researchBtn');
const modalOverlay = document.getElementById('modalOverlay');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalForm = document.getElementById('modalForm');
const modalTitle = document.getElementById('modalTitle');
const modalSubject = document.getElementById('modalSubject');
const modalDescription = document.getElementById('modalDescription');
const modalDuration = document.getElementById('modalDuration');
const modalLink = document.getElementById('modalLink');
const modalDurationField = document.querySelector('.modal-duration-field');
const modalLinkField = document.querySelector('.modal-link-field');
const startReviewBtn = document.getElementById('startReviewBtn');

const authOverlay = document.getElementById('authOverlay');
const authCloseBtn = document.getElementById('authCloseBtn');
const authForm = document.getElementById('authForm');
const authTitle = document.getElementById('authTitle');
const authUsername = document.getElementById('authUsername');
const authPassword = document.getElementById('authPassword');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const authToggleText = document.getElementById('authToggleText');
const authToggleMessage = document.getElementById('authToggleMessage');
const authToggleBtn = document.getElementById('authToggleBtn');
const userStatus = document.getElementById('userStatus');
const authButton = document.getElementById('authButton');
const logoutBtn = document.getElementById('logoutBtn');
const sessionList = document.getElementById('sessionList');

const appState = {
    sessions: [],
    editingMode: 'session',
};

// Owner image UI removed — owner managed on About page now.


const authState = {
    users: {},
    currentUser: null,
    mode: 'signin',
    // When a protected link is clicked while not signed in, store the target here
    pendingNavigation: null,
};

function safeLocalStorageGet(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.warn('Local storage unavailable:', error);
        return null;
    }
}

function safeLocalStorageSet(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.warn('Unable to save to local storage:', error);
    }
}

function safeLocalStorageRemove(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.warn('Unable to remove local storage key:', error);
    }
}

function loadAppData() {
    const saved = JSON.parse(safeLocalStorageGet(STORAGE_KEY) || '{}');
    appState.sessions = saved.sessions || [];
    authState.users = JSON.parse(safeLocalStorageGet(USERS_KEY) || '{}');
    authState.currentUser = safeLocalStorageGet(CURRENT_USER_KEY);
    updateUserUI();
}

function saveAppData() {
    safeLocalStorageSet(STORAGE_KEY, JSON.stringify({
        sessions: appState.sessions,
    }));
}

function saveAuthData() {
    safeLocalStorageSet(USERS_KEY, JSON.stringify(authState.users));
    if (authState.currentUser) {
        safeLocalStorageSet(CURRENT_USER_KEY, authState.currentUser);
    } else {
        safeLocalStorageRemove(CURRENT_USER_KEY);
    }
}

function updateUserUI() {
    if (authState.currentUser) {
        userStatus.textContent = `Signed in as ${authState.currentUser}`;
        authButton.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
    } else {
        userStatus.textContent = 'Guest - sign in to save study progress';
        authButton.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
    }
}

function showAuthModal(mode = 'signin') {
    authState.mode = mode;
    authTitle.textContent = mode === 'signin' ? 'Sign In' : 'Create Account';
    authSubmitBtn.textContent = mode === 'signin' ? 'Sign In' : 'Sign Up';
    if (authToggleMessage) {
        authToggleMessage.textContent = mode === 'signin'
            ? 'Don’t have an account?'
            : 'Already have an account?';
    }
    if (authToggleBtn) {
        authToggleBtn.textContent = mode === 'signin' ? 'Sign Up' : 'Sign In';
    }
    authOverlay.classList.remove('hidden');
    authUsername.value = '';
    authPassword.value = '';
    authUsername.focus();
}

function attachToggleButtonListener() {
    if (!authToggleBtn) {
        return;
    }
    authToggleBtn.addEventListener('click', () => {
        showAuthModal(authState.mode === 'signin' ? 'signup' : 'signin');
    });
}

function closeAuthModal() {
    authOverlay.classList.add('hidden');
}

function isValidGoogleEmailOrPhone(value) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\+?[0-9]{7,15}$/;
    return emailPattern.test(value) || phonePattern.test(value);
}

function isValidAuthPassword(password) {
    return password.length >= 8 && /[0-9]/.test(password);
}

function requireLogin() {
    if (!authState.currentUser) {
        showAuthModal('signin');
        return false;
    }
    return true;
}

function openModal(mode) {
    if (!requireLogin()) {
        return;
    }
    appState.editingMode = mode;
    modalTitle.textContent = 'Add Session';
    modalSubject.value = '';
    modalDescription.value = '';
    modalDuration.value = '30';
    modalLink.value = '';
    modalDurationField.classList.remove('hidden');
    modalLinkField.classList.add('hidden');
    modalOverlay.classList.remove('hidden');
}

function closeModal() {
    modalOverlay.classList.add('hidden');
}

function handleModalSubmit(event) {
    event.preventDefault();
    const subject = modalSubject.value.trim();
    const description = modalDescription.value.trim();
    const duration = Number(modalDuration.value);
    const link = modalLink.value.trim();
    if (!subject || !description) {
        return;
    }
    appState.sessions.push({ subject, description, duration, addedBy: authState.currentUser || 'guest' });
    renderSessions();
    saveAppData();
    closeModal();
}

function handleStartReview() {
    const target = document.querySelector('#academic-hub') || document.querySelector('#unit-generator');
    if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
    }
}

function handleResearchSearch() {
    const query = researchInput.value.trim();
    if (!query) {
        researchInput.focus();
        return;
    }
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
}

function signOut() {
    authState.currentUser = null;
    saveAuthData();
    updateUserUI();
}

function handleAuthSubmit(event) {
    event.preventDefault();
    const username = authUsername.value.trim();
    const password = authPassword.value.trim();
    if (!username || !password) {
        alert('Please enter both your Google email or phone number and password.');
        return;
    }
    if (!isValidGoogleEmailOrPhone(username)) {
        alert('Please enter a valid Google email address or phone number.');
        return;
    }
    if (!isValidAuthPassword(password)) {
        alert('Password must be at least 8 characters and include at least one number.');
        return;
    }
    if (authState.mode === 'signin') {
        if (!authState.users[username] || authState.users[username] !== password) {
            alert('Invalid username or password.');
            return;
        }
        authState.currentUser = username;
        saveAuthData();
        updateUserUI();
        // After sign-in, redirect if we were trying to visit a protected page
        const target = authState.pendingNavigation;
        authState.pendingNavigation = null;
        closeAuthModal();
        if (target) {
            window.location.href = target;
        }
        return;
    }
    if (authState.users[username]) {
        alert('That username is already taken. Please choose another.');
        return;
    }
    authState.users[username] = password;
    authState.currentUser = username;
    saveAuthData();
    updateUserUI();
    // After sign-up, redirect if we were trying to visit a protected page
    const target2 = authState.pendingNavigation;
    authState.pendingNavigation = null;
    closeAuthModal();
    if (target2) {
        window.location.href = target2;
    }
}

function updateFlashcard() {
    // Flashcard feature removed from the current homepage. Leave this stub in place if it is restored later.
}

function renderSessions() {
    if (!sessionList) {
        return;
    }
    if (appState.sessions.length === 0) {
        sessionList.innerHTML = '<li>No sessions yet. Add one to get started.</li>';
        return;
    }
    sessionList.innerHTML = appState.sessions
        .map(session => `
            <li class="session-card">
                <div>
                    <h4>${session.subject}</h4>
                    <p>${session.description}</p>
                    <p><em>Added by ${session.addedBy || 'guest'}</em></p>
                </div>
                <span class="badge">${session.duration} min</span>
            </li>
        `)
        .join('');
}

loadAppData();
renderSessions();

researchBtn.addEventListener('click', handleResearchSearch);
modalCloseBtn.addEventListener('click', closeModal);
modalForm.addEventListener('submit', handleModalSubmit);
startReviewBtn.addEventListener('click', handleStartReview);
modalOverlay.addEventListener('click', event => {
    if (event.target === modalOverlay) {
        closeModal();
    }
});

const unitYearSelect = document.getElementById('unitYearSelect');
const unitSubjectSelect = document.getElementById('unitSubjectSelect');
const generateUnitsBtn = document.getElementById('generateUnitsBtn');
const unitGeneratorResults = document.getElementById('unitGeneratorResults');

const suggestedUnits = {
    'Year 1': {
        'K16 Economics and Finance': ['Principles of Microeconomics', 'Business Accounting Basics', 'Quantitative Skills', 'Introductory Finance'],
        'K14 Economics Pure': ['Foundations of Economics', 'Mathematical Economics', 'Economic Models', 'Theory of Demand'],
        'K24 Economics and Statistics': ['Introductory Statistics', 'Foundations of Economics', 'Data Interpretation', 'Applied Quantitative Methods'],
        'UCU 110 Communication and Skills': ['Academic Writing', 'Oral Communication', 'Study Strategies', 'Critical Reading'],
        'BBA 102 Principles of Management': ['Management Process', 'Organizational Behavior', 'Leadership Basics', 'Decision Making'],
        'BAC 101 Fundamentals of Accounting': ['Accounting Equation', 'Financial Statements', 'Bookkeeping', 'Introduction to Assets'],
    },
    'Year 2': {
        'K16 Economics and Finance': ['Intermediate Microeconomics', 'Corporate Finance', 'Cost Accounting', 'Economic Policy'],
        'K14 Economics Pure': ['Intermediate Macroeconomics', 'Mathematical Optimization', 'Market Structures', 'Economic Growth'],
        'K24 Economics and Statistics': ['Probability & Statistics', 'Regression Analysis', 'Econometrics Basics', 'Applied Data Models'],
        'UCU 110 Communication and Skills': ['Professional Communication', 'Presentation Skills', 'Research Writing', 'Collaboration Techniques'],
        'BBA 102 Principles of Management': ['Strategic Management', 'Operations Management', 'Human Resource Principles', 'Organizational Design'],
        'BAC 101 Fundamentals of Accounting': ['Cost Accounting', 'Management Accounting', 'Budgeting', 'Accounting Controls'],
    },
    'Year 3': {
        'K16 Economics and Finance': ['Advanced Macroeconomics', 'Financial Markets', 'Investment Analysis', 'Policy Evaluation'],
        'K14 Economics Pure': ['Advanced Economic Theory', 'Economic Measurement', 'Macroeconomic Policy', 'Mathematical Economics II'],
        'K24 Economics and Statistics': ['Advanced Econometrics', 'Time Series Analysis', 'Statistical Software', 'Big Data in Economics'],
        'UCU 110 Communication and Skills': ['Negotiation Skills', 'Leadership Communication', 'Conflict Resolution', 'Advanced Report Writing'],
        'BBA 102 Principles of Management': ['Corporate Strategy', 'Change Management', 'Ethics in Management', 'Project Management'],
        'BAC 101 Fundamentals of Accounting': ['Financial Reporting', 'Audit Principles', 'Taxation Basics', 'Corporate Accounting'],
    },
    'Year 4': {
        'K16 Economics and Finance': ['Financial Modelling', 'Portfolio Management', 'Policy Research', 'Capstone Projects'],
        'K14 Economics Pure': ['Research Methods', 'Advanced Theoretical Economics', 'Project Work', 'Independent Study Topics'],
        'K24 Economics and Statistics': ['Applied Statistics Projects', 'Policy Evaluation', 'Data Science Techniques', 'Final Research Preparation'],
        'UCU 110 Communication and Skills': ['Executive Communication', 'Media Literacy', 'Public Speaking', 'Career Communication'],
        'BBA 102 Principles of Management': ['Executive Leadership', 'Organizational Change', 'Business Analytics', 'Capstone Strategy'],
        'BAC 101 Fundamentals of Accounting': ['Advanced Financial Reporting', 'Risk Management', 'Forensic Accounting', 'Professional Practice'],
    },
};

function renderUnitGeneratorResults() {
    const year = unitYearSelect.value;
    const subject = unitSubjectSelect.value;
    const units = suggestedUnits[year]?.[subject];
    if (!units) {
        unitGeneratorResults.innerHTML = '<p>Choose a year and subject to view suggested revision units.</p>';
        return;
    }
    unitGeneratorResults.innerHTML = `
        <h3>Suggested revision units for ${year} — ${subject}</h3>
        <ul class="unit-results-list">
            ${units.map(unit => `<li>${unit}</li>`).join('')}
        </ul>
    `;
}

generateUnitsBtn.addEventListener('click', renderUnitGeneratorResults);

authButton.addEventListener('click', () => showAuthModal('signin'));
authCloseBtn.addEventListener('click', closeAuthModal);
authForm.addEventListener('submit', handleAuthSubmit);
authOverlay.addEventListener('click', event => {
    if (event.target === authOverlay) {
        closeAuthModal();
    }
});
logoutBtn.addEventListener('click', signOut);
attachToggleButtonListener();
// If the index page is opened with #signup or #signup=<target>, automatically show the sign-up modal
if (window.location.hash && window.location.hash.startsWith('#signup')) {
    const hash = window.location.hash.substring(1); // remove '#'
    const parts = hash.split('=');
    const target = parts[1] ? parts[1] : null;
    if (target) {
        try {
            // convert to absolute URL if it's a relative path
            const abs = new URL(target, window.location.origin + window.location.pathname).href;
            authState.pendingNavigation = abs;
        } catch (e) {
            authState.pendingNavigation = target;
        }
    }
    showAuthModal('signup');
    try { history.replaceState(null, '', window.location.pathname); } catch (e) { /* ignore */ }
}
