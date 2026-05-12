// ========== STORAGE.JS - LocalStorage Layer ==========

// ========== TRADES ==========
function getTrades() {
    const data = localStorage.getItem('trading_journal_trades');
    return data ? JSON.parse(data) : [];
}

function saveTrades(trades) {
    localStorage.setItem('trading_journal_trades', JSON.stringify(trades));
}

function addTrade(trade) {
    const trades = getTrades();
    trade.id = Date.now().toString();
    trade.createdAt = new Date().toISOString();
    trades.push(trade);
    saveTrades(trades);
    return trade;
}

function updateTrade(tradeId, updatedTrade) {
    const trades = getTrades();
    const index = trades.findIndex(t => t.id === tradeId);
    if (index !== -1) {
        trades[index] = { ...trades[index], ...updatedTrade, id: tradeId };
        saveTrades(trades);
        return true;
    }
    return false;
}

function deleteTrade(tradeId) {
    let trades = getTrades();
    trades = trades.filter(t => t.id !== tradeId);
    saveTrades(trades);
}

function getFilteredTrades(filters = {}) {
    let trades = getTrades();
    
    if (filters.session && filters.session !== 'all') {
        trades = trades.filter(t => t.session === filters.session);
    }
    if (filters.category && filters.category !== 'all') {
        trades = trades.filter(t => t.category === filters.category);
    }
    if (filters.account && filters.account !== 'all') {
        trades = trades.filter(t => t.account === filters.account);
    }
    if (filters.type && filters.type !== 'all') {
        trades = trades.filter(t => t.type === filters.type);
    }
    if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        trades = trades.filter(t => new Date(t.entryDate) >= fromDate);
    }
    if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59);
        trades = trades.filter(t => new Date(t.entryDate) <= toDate);
    }
    if (filters.search) {
        const query = filters.search.toLowerCase();
        trades = trades.filter(t => t.instrument.toLowerCase().includes(query));
    }
    return trades;
}

// ========== ACCOUNTS ==========
function getAccounts() {
    const data = localStorage.getItem('trading_journal_accounts');
    if (data) return JSON.parse(data);
    const defaults = ['Live Account', 'Demo Account'];
    localStorage.setItem('trading_journal_accounts', JSON.stringify(defaults));
    return defaults;
}

function addAccount(accountName) {
    const accounts = getAccounts();
    if (accountName && !accounts.includes(accountName)) {
        accounts.push(accountName);
        localStorage.setItem('trading_journal_accounts', JSON.stringify(accounts));
    }
    return accounts;
}

function removeAccount(accountName) {
    let accounts = getAccounts();
    accounts = accounts.filter(a => a !== accountName);
    localStorage.setItem('trading_journal_accounts', JSON.stringify(accounts));
    return accounts;
}

// ========== SESSIONS ==========
function getSessions() {
    const data = localStorage.getItem('trading_journal_sessions');
    if (data) return JSON.parse(data);
    const defaults = ['Asia', 'London', 'New York'];
    localStorage.setItem('trading_journal_sessions', JSON.stringify(defaults));
    return defaults;
}

function addSession(sessionName) {
    const sessions = getSessions();
    if (sessionName && !sessions.includes(sessionName)) {
        sessions.push(sessionName);
        localStorage.setItem('trading_journal_sessions', JSON.stringify(sessions));
    }
    return sessions;
}

function removeSession(sessionName) {
    let sessions = getSessions();
    sessions = sessions.filter(s => s !== sessionName);
    localStorage.setItem('trading_journal_sessions', JSON.stringify(sessions));
    return sessions;
}

// ========== CATEGORIES ==========
function getCategories() {
    return ['Stocks', 'Forex', 'Crypto', 'Indices', 'Commodities'];
}

function addCategory() { return []; }
function removeCategory() { return []; }

// ========== THEME ==========
function getTheme() {
    return localStorage.getItem('trading_journal_theme') || 'dark';
}

function setTheme(theme) {
    localStorage.setItem('trading_journal_theme', theme);
}

// ========== DATA EXPORT / IMPORT ==========
function exportData() {
    const data = {
        trades: getTrades(),
        accounts: getAccounts(),
        sessions: getSessions(),
        exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
}

function importData(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        if (data.trades) saveTrades(data.trades);
        if (data.accounts) localStorage.setItem('trading_journal_accounts', JSON.stringify(data.accounts));
        if (data.sessions) localStorage.setItem('trading_journal_sessions', JSON.stringify(data.sessions));
        return true;
    } catch (err) {
        console.error('Import failed:', err);
        return false;
    }
}

function clearAllData() {
    localStorage.removeItem('trading_journal_trades');
    localStorage.removeItem('trading_journal_accounts');
    localStorage.removeItem('trading_journal_sessions');
    // Re-initialize defaults
    getAccounts();
    getSessions();
}

function initStorage() {
    // Initialize defaults
    getAccounts();
    getSessions();
}