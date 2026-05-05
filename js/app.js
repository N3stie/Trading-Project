// ========== APP.JS - Main Application Controller ==========

let currentPage = 'dashboard';

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    initStorage();
    applyTheme();
    initNavigation();
    initDashboard();
    initTrades();
    initAddTrade();
    initAnalytics();
    initSettings();
    
    populateFilterDropdowns();
    navigateTo('dashboard');
});

// ========== NAVIGATION ==========
function initNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            navigateTo(btn.dataset.page);
        });
    });
}

function navigateTo(page) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === page) btn.classList.add('active');
    });
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    const targetPage = document.getElementById(page);
    if (targetPage) {
        targetPage.classList.add('active');
        currentPage = page;
        
        populateFilterDropdowns();
        
        if (page === 'dashboard') refreshDashboard();
        if (page === 'trades') refreshTrades();
        if (page === 'addTrade') refreshAddTradeForm();
        if (page === 'analytics') refreshAnalytics();
        if (page === 'settings') refreshSettings();
    }
}

// ========== THEME ==========
function applyTheme() {
    const theme = getTheme();
    if (theme === 'light') {
        document.body.classList.add('light');
    } else {
        document.body.classList.remove('light');
    }
}

// ========== HELPERS ==========
function formatCurrency(amount) {
    const num = parseFloat(amount);
    if (isNaN(num)) return '$0.00';
    return num.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    });
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString('en-US', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
    });
}

function formatDateShort(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ========== POPULATE FILTERS ==========
function populateFilterDropdowns() {
    const accounts = getAccounts();
    const sessions = getSessions();
    const categories = getCategories();
    
    const accountFilters = ['dashboardAccountFilter', 'tradesAccountFilter', 'analyticsAccountFilter'];
    accountFilters.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            const val = select.value;
            select.innerHTML = '<option value="all">All Accounts</option>';
            accounts.forEach(a => select.innerHTML += `<option value="${a}">${a}</option>`);
            if (val) select.value = val;
        }
    });
    
    const sessionFilters = ['dashboardSessionFilter', 'tradesSessionFilter', 'analyticsSessionFilter'];
    sessionFilters.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            const val = select.value;
            select.innerHTML = '<option value="all">All Sessions</option>';
            sessions.forEach(s => select.innerHTML += `<option value="${s}">${s}</option>`);
            if (val) select.value = val;
        }
    });
    
    const sessionSelect = document.getElementById('session');
    if (sessionSelect) {
        const val = sessionSelect.value;
        sessionSelect.innerHTML = '<option value="">Select...</option>';
        sessions.forEach(s => sessionSelect.innerHTML += `<option value="${s}">${s}</option>`);
        if (val) sessionSelect.value = val;
    }
    
    const accountSelect = document.getElementById('account');
    if (accountSelect) {
        const val = accountSelect.value;
        accountSelect.innerHTML = '<option value="">Select...</option>';
        accounts.forEach(a => accountSelect.innerHTML += `<option value="${a}">${a}</option>`);
        if (val) accountSelect.value = val;
    }
    
    const instrumentFilters = ['dashboardInstrumentFilter', 'tradesInstrumentFilter', 'analyticsInstrumentFilter'];
    instrumentFilters.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            const val = select.value;
            select.innerHTML = '<option value="all">All Instruments</option>';
            categories.forEach(c => select.innerHTML += `<option value="${c}">${c}</option>`);
            if (val) select.value = val;
        }
    });
}