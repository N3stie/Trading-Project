// ========== APP.JS - Main Application Controller ==========

// Current page state
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
    
    // Populate all dropdowns first
    populateFilterDropdowns();
    
    // Load default page
    navigateTo('dashboard');
});

// ========== NAVIGATION ==========
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            navigateTo(page);
        });
    });
}

function navigateTo(page) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === page) {
            btn.classList.add('active');
        }
    });
    
    // Switch pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    
    const targetPage = document.getElementById(page);
    if (targetPage) {
        targetPage.classList.add('active');
        currentPage = page;
        
        // Refresh dropdowns and page content
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

// ========== HELPER FUNCTIONS ==========
function calculateProfit(entryPrice, exitPrice, size, type) {
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const qty = parseFloat(size);
    
    if (isNaN(entry) || isNaN(exit) || isNaN(qty)) return 0;
    
    if (type === 'Buy') {
        return (exit - entry) * qty;
    } else {
        return (entry - exit) * qty;
    }
}

function formatCurrency(amount) {
    const num = parseFloat(amount);
    if (isNaN(num)) return '$0.00';
    
    return num.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

function formatDateShort(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

// ========== POPULATE FILTERS ==========
function populateFilterDropdowns() {
    const accounts = getAccounts();
    const sessions = getSessions();
    const categories = getCategories();
    
    // All account filter dropdowns
    const accountFilters = [
        'dashboardAccountFilter',
        'tradesAccountFilter', 
        'analyticsAccountFilter'
    ];
    
    accountFilters.forEach(filterId => {
        const select = document.getElementById(filterId);
        if (select) {
            const currentValue = select.value;
            select.innerHTML = '<option value="all">All Accounts</option>';
            accounts.forEach(acc => {
                select.innerHTML += `<option value="${acc}">${acc}</option>`;
            });
            if (currentValue) select.value = currentValue;
        }
    });
    
    // All session filter dropdowns
    const sessionFilters = [
        'dashboardSessionFilter',
        'tradesSessionFilter',
        'analyticsSessionFilter'
    ];
    
    sessionFilters.forEach(filterId => {
        const select = document.getElementById(filterId);
        if (select) {
            const currentValue = select.value;
            select.innerHTML = '<option value="all">All Sessions</option>';
            sessions.forEach(sess => {
                select.innerHTML += `<option value="${sess}">${sess}</option>`;
            });
            if (currentValue) select.value = currentValue;
        }
    });
    
    // Add Trade form session select
    const sessionSelect = document.getElementById('session');
    if (sessionSelect) {
        const currentValue = sessionSelect.value;
        sessionSelect.innerHTML = '<option value="">Select...</option>';
        sessions.forEach(sess => {
            sessionSelect.innerHTML += `<option value="${sess}">${sess}</option>`;
        });
        if (currentValue) sessionSelect.value = currentValue;
    }
    
    // Add Trade form account select
    const accountSelect = document.getElementById('account');
    if (accountSelect) {
        const currentValue = accountSelect.value;
        accountSelect.innerHTML = '<option value="">Select...</option>';
        accounts.forEach(acc => {
            accountSelect.innerHTML += `<option value="${acc}">${acc}</option>`;
        });
        if (currentValue) accountSelect.value = currentValue;
    }
    
    // Instrument filters in dashboard/trades/analytics
    const instrumentFilters = [
        'dashboardInstrumentFilter',
        'tradesInstrumentFilter',
        'analyticsInstrumentFilter'
    ];
    
    instrumentFilters.forEach(filterId => {
        const select = document.getElementById(filterId);
        if (select) {
            const currentValue = select.value;
            select.innerHTML = '<option value="all">All Instruments</option>';
            categories.forEach(cat => {
                select.innerHTML += `<option value="${cat}">${cat}</option>`;
            });
            if (currentValue) select.value = currentValue;
        }
    });
}