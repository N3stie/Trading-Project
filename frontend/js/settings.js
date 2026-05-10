// ========== SETTINGS.JS ==========

function initSettings() {
    document.getElementById('themeToggle').addEventListener('change', handleThemeToggle);
    document.getElementById('addAccountBtn').addEventListener('click', handleAddAccount);
    document.getElementById('addSessionBtn').addEventListener('click', handleAddSession);
    document.getElementById('addCategoryBtn').addEventListener('click', handleAddCategory);
    document.getElementById('exportDataBtn').addEventListener('click', handleExportData);
    document.getElementById('importDataBtn').addEventListener('click', handleImportData);
    document.getElementById('clearDataBtn').addEventListener('click', handleClearData);
    
    document.getElementById('newAccount').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddAccount();
    });
    document.getElementById('newSession').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddSession();
    });
    document.getElementById('newCategory').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddCategory();
    });
}

async function refreshSettings() {
    const theme = getTheme();
    document.getElementById('themeToggle').checked = theme === 'dark';
    await renderAccountsList();
    await renderSessionsList();
    renderCategoriesList();
}

function handleThemeToggle(e) {
    if (e.target.checked) {
        document.body.classList.remove('light');
        setTheme('dark');
    } else {
        document.body.classList.add('light');
        setTheme('light');
    }
    setTimeout(() => {
        if (currentPage === 'dashboard') refreshDashboard();
        if (currentPage === 'analytics') refreshAnalytics();
    }, 100);
}

async function handleAddAccount() {
    const input = document.getElementById('newAccount');
    const name = input.value.trim();
    if (!name) return showNotification('Enter an account name', 'error');
    await addAccount(name);
    input.value = '';
    await renderAccountsList();
    populateFilterDropdowns();
    showNotification(`"${name}" added`, 'success');
}

async function handleRemoveAccount(name) {
    await removeAccount(name);
    await renderAccountsList();
    populateFilterDropdowns();
    showNotification(`"${name}" removed`, 'success');
}

async function renderAccountsList() {
    const list = document.getElementById('accountsList');
    const accounts = await getAccounts();
    list.innerHTML = accounts.length === 0 
        ? '<li class="empty-hint">No accounts</li>'
        : accounts.map(a => `<li><span>${a}</span><button class="btn-delete" onclick="handleRemoveAccount('${a.replace(/'/g, "\\'")}')">×</button></li>`).join('');
}

async function handleAddSession() {
    const input = document.getElementById('newSession');
    const name = input.value.trim();
    if (!name) return showNotification('Enter a session name', 'error');
    await addSession(name);
    input.value = '';
    await renderSessionsList();
    populateFilterDropdowns();
    showNotification(`"${name}" added`, 'success');
}

async function handleRemoveSession(name) {
    await removeSession(name);
    await renderSessionsList();
    populateFilterDropdowns();
    showNotification(`"${name}" removed`, 'success');
}

async function renderSessionsList() {
    const list = document.getElementById('sessionsList');
    const sessions = await getSessions();
    list.innerHTML = sessions.length === 0
        ? '<li class="empty-hint">No sessions</li>'
        : sessions.map(s => `<li><span>${s}</span><button class="btn-delete" onclick="handleRemoveSession('${s.replace(/'/g, "\\'")}')">×</button></li>`).join('');
}

function handleAddCategory() {
    const input = document.getElementById('newCategory');
    const name = input.value.trim();
    if (!name) return showNotification('Enter a category name', 'error');
    addCategory(name);
    input.value = '';
    renderCategoriesList();
    populateFilterDropdowns();
    showNotification(`"${name}" added`, 'success');
}

function handleRemoveCategory(name) {
    removeCategory(name);
    renderCategoriesList();
    populateFilterDropdowns();
    showNotification(`"${name}" removed`, 'success');
}

function renderCategoriesList() {
    const list = document.getElementById('categoriesList');
    const categories = getCategories();
    list.innerHTML = categories.length === 0
        ? '<li class="empty-hint">No categories</li>'
        : categories.map(c => `<li><span>${c}</span><button class="btn-delete" onclick="handleRemoveCategory('${c.replace(/'/g, "\\'")}')">×</button></li>`).join('');
}

async function handleExportData() {
    const data = await exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading-journal-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Data exported', 'success');
}

function handleImportData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async function(event) {
            if (await importData(event.target.result)) {
                showNotification('Data imported', 'success');
                populateFilterDropdowns();
                await refreshSettings();
                navigateTo('dashboard');
            } else {
                showNotification('Invalid file', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

async function handleClearData() {
    if (confirm('Delete ALL data? This cannot be undone.')) {
        if (confirm('Final warning: permanently delete everything?')) {
            await clearAllData();
            populateFilterDropdowns();
            await refreshSettings();
            refreshDashboard();
            refreshTrades();
            showNotification('All data cleared', 'success');
        }
    }
}

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 12px 20px;
        border-radius: 8px; font-size: 14px; font-weight: 600;
        z-index: 9999; animation: slideIn 0.3s ease;
        background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: #ffffff;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}