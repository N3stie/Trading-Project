// ========== SETTINGS.JS - Settings Page Logic ==========

// ========== INIT SETTINGS ==========
function initSettings() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('change', handleThemeToggle);
    
    // Account management
    document.getElementById('addAccountBtn').addEventListener('click', handleAddAccount);
    document.getElementById('newAccount').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddAccount();
    });
    
    // Session management
    document.getElementById('addSessionBtn').addEventListener('click', handleAddSession);
    document.getElementById('newSession').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddSession();
    });
    
    // Category management
    document.getElementById('addCategoryBtn').addEventListener('click', handleAddCategory);
    document.getElementById('newCategory').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddCategory();
    });
    
    // Data management
    document.getElementById('exportDataBtn').addEventListener('click', handleExportData);
    document.getElementById('importDataBtn').addEventListener('click', handleImportData);
    document.getElementById('clearDataBtn').addEventListener('click', handleClearData);
}

// ========== REFRESH SETTINGS ==========
function refreshSettings() {
    // Set theme toggle state
    const theme = getTheme();
    document.getElementById('themeToggle').checked = theme === 'dark';
    
    // Render lists
    renderAccountsList();
    renderSessionsList();
    renderCategoriesList();
}

// ========== THEME TOGGLE ==========
function handleThemeToggle(e) {
    if (e.target.checked) {
        document.body.classList.remove('light');
        setTheme('dark');
    } else {
        document.body.classList.add('light');
        setTheme('light');
    }
    
    // Refresh charts if on dashboard or analytics
    if (currentPage === 'dashboard') refreshDashboard();
    if (currentPage === 'analytics') refreshAnalytics();
}

// ========== ACCOUNT MANAGEMENT ==========
function handleAddAccount() {
    const input = document.getElementById('newAccount');
    const name = input.value.trim();
    
    if (!name) {
        showNotification('Please enter an account name', 'error');
        return;
    }
    
    addAccount(name);
    input.value = '';
    renderAccountsList();
    populateFilterDropdowns();
    showNotification(`Account "${name}" added`, 'success');
}

function handleRemoveAccount(name) {
    const trades = getTrades();
    const hasTrades = trades.some(t => t.account === name);
    
    if (hasTrades) {
        if (!confirm(`Account "${name}" has trades assigned. Deleting it will remove the account tag from those trades. Continue?`)) {
            return;
        }
    }
    
    removeAccount(name);
    renderAccountsList();
    populateFilterDropdowns();
    showNotification(`Account "${name}" removed`, 'success');
}

function renderAccountsList() {
    const list = document.getElementById('accountsList');
    const accounts = getAccounts();
    
    if (accounts.length === 0) {
        list.innerHTML = '<li class="empty-hint">No accounts added</li>';
        return;
    }
    
    list.innerHTML = accounts.map(acc => `
        <li>
            <span>${acc}</span>
            <button class="btn-delete" onclick="handleRemoveAccount('${acc.replace(/'/g, "\\'")}')">×</button>
        </li>
    `).join('');
}

// ========== SESSION MANAGEMENT ==========
function handleAddSession() {
    const input = document.getElementById('newSession');
    const name = input.value.trim();
    
    if (!name) {
        showNotification('Please enter a session name', 'error');
        return;
    }
    
    addSession(name);
    input.value = '';
    renderSessionsList();
    populateFilterDropdowns();
    showNotification(`Session "${name}" added`, 'success');
}

function handleRemoveSession(name) {
    const trades = getTrades();
    const hasTrades = trades.some(t => t.session === name);
    
    if (hasTrades) {
        if (!confirm(`Session "${name}" has trades assigned. Deleting it will remove the session tag from those trades. Continue?`)) {
            return;
        }
    }
    
    removeSession(name);
    renderSessionsList();
    populateFilterDropdowns();
    showNotification(`Session "${name}" removed`, 'success');
}

function renderSessionsList() {
    const list = document.getElementById('sessionsList');
    const sessions = getSessions();
    
    if (sessions.length === 0) {
        list.innerHTML = '<li class="empty-hint">No sessions added</li>';
        return;
    }
    
    list.innerHTML = sessions.map(sess => `
        <li>
            <span>${sess}</span>
            <button class="btn-delete" onclick="handleRemoveSession('${sess.replace(/'/g, "\\'")}')">×</button>
        </li>
    `).join('');
}

// ========== CATEGORY MANAGEMENT ==========
function handleAddCategory() {
    const input = document.getElementById('newCategory');
    const name = input.value.trim();
    
    if (!name) {
        showNotification('Please enter a category name', 'error');
        return;
    }
    
    addCategory(name);
    input.value = '';
    renderCategoriesList();
    populateFilterDropdowns();
    showNotification(`Category "${name}" added`, 'success');
}

function handleRemoveCategory(name) {
    const trades = getTrades();
    const hasTrades = trades.some(t => t.category === name);
    
    if (hasTrades) {
        if (!confirm(`Category "${name}" has trades assigned. Deleting it will remove the category from those trades. Continue?`)) {
            return;
        }
    }
    
    removeCategory(name);
    renderCategoriesList();
    populateFilterDropdowns();
    showNotification(`Category "${name}" removed`, 'success');
}

function renderCategoriesList() {
    const list = document.getElementById('categoriesList');
    const categories = getCategories();
    
    if (categories.length === 0) {
        list.innerHTML = '<li class="empty-hint">No categories added</li>';
        return;
    }
    
    list.innerHTML = categories.map(cat => `
        <li>
            <span>${cat}</span>
            <button class="btn-delete" onclick="handleRemoveCategory('${cat.replace(/'/g, "\\'")}')">×</button>
        </li>
    `).join('');
}

// ========== DATA MANAGEMENT ==========
function handleExportData() {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading-journal-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully', 'success');
}

function handleImportData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            const success = importData(event.target.result);
            
            if (success) {
                showNotification('Data imported successfully', 'success');
                // Refresh everything
                populateFilterDropdowns();
                refreshSettings();
                if (currentPage === 'dashboard') refreshDashboard();
                if (currentPage === 'trades') refreshTrades();
                if (currentPage === 'analytics') refreshAnalytics();
                navigateTo('dashboard');
            } else {
                showNotification('Import failed. Invalid file format.', 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

function handleClearData() {
    if (confirm('⚠️ Are you sure you want to delete ALL data?\n\nThis will remove all trades, accounts, sessions, and categories. This cannot be undone.\n\nWe recommend exporting your data first.')) {
        if (confirm('Final warning: This will permanently delete everything. Continue?')) {
            clearAllData();
            populateFilterDropdowns();
            refreshSettings();
            if (currentPage === 'dashboard') refreshDashboard();
            if (currentPage === 'trades') refreshTrades();
            if (currentPage === 'analytics') refreshAnalytics();
            showNotification('All data cleared', 'success');
        }
    }
}