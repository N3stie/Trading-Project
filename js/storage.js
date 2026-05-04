// ========== STORAGE KEYS ==========
const STORAGE_KEYS = {
    TRADES: 'trading_journal_trades',
    ACCOUNTS: 'trading_journal_accounts',
    SESSIONS: 'trading_journal_sessions',
    CATEGORIES: 'trading_journal_categories',
    THEME: 'trading_journal_theme'
};

// ========== DEFAULT DATA ==========
const DEFAULT_CATEGORIES = ['Stocks', 'Forex', 'Crypto', 'Indices', 'Commodities'];

const DEFAULT_ACCOUNTS = ['Live Account', 'Demo Account'];

const DEFAULT_SESSIONS = ['Asia', 'London', 'New York'];

// ========== INITIALIZATION ==========
function initStorage() {
    // Initialize if empty
    if (!localStorage.getItem(STORAGE_KEYS.TRADES)) {
        localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) {
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(DEFAULT_ACCOUNTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(DEFAULT_SESSIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.THEME)) {
        localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    }
}

// ========== TRADES ==========
function getTrades() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRADES)) || [];
}

function saveTrades(trades) {
    localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(trades));
}

function addTrade(trade) {
    const trades = getTrades();
    trade.id = Date.now().toString(); // Unique ID based on timestamp
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
    
    // Filter by session
    if (filters.session && filters.session !== 'all') {
        trades = trades.filter(t => t.session === filters.session);
    }
    
    // Filter by instrument category
    if (filters.category && filters.category !== 'all') {
        trades = trades.filter(t => t.category === filters.category);
    }
    
    // Filter by account
    if (filters.account && filters.account !== 'all') {
        trades = trades.filter(t => t.account === filters.account);
    }
    
    // Filter by type (Buy/Sell)
    if (filters.type && filters.type !== 'all') {
        trades = trades.filter(t => t.type === filters.type);
    }
    
    // Filter by date range
    if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        trades = trades.filter(t => new Date(t.entryDate) >= fromDate);
    }
    if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59);
        trades = trades.filter(t => new Date(t.exitDate) <= toDate);
    }
    
    // Filter by search query (instrument symbol)
    if (filters.search) {
        const query = filters.search.toLowerCase();
        trades = trades.filter(t => t.instrument.toLowerCase().includes(query));
    }
    
    return trades;
}

// ========== ACCOUNTS ==========
function getAccounts() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) || [];
}

function saveAccounts(accounts) {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
}

function addAccount(accountName) {
    const accounts = getAccounts();
    if (accountName && !accounts.includes(accountName)) {
        accounts.push(accountName);
        saveAccounts(accounts);
    }
    return accounts;
}

function removeAccount(accountName) {
    let accounts = getAccounts();
    accounts = accounts.filter(a => a !== accountName);
    saveAccounts(accounts);
    return accounts;
}

// ========== SESSIONS ==========
function getSessions() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS)) || [];
}

function saveSessions(sessions) {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
}

function addSession(sessionName) {
    const sessions = getSessions();
    if (sessionName && !sessions.includes(sessionName)) {
        sessions.push(sessionName);
        saveSessions(sessions);
    }
    return sessions;
}

function removeSession(sessionName) {
    let sessions = getSessions();
    sessions = sessions.filter(s => s !== sessionName);
    saveSessions(sessions);
    return sessions;
}

// ========== CATEGORIES ==========
function getCategories() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES)) || [];
}

function saveCategories(categories) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
}

function addCategory(categoryName) {
    const categories = getCategories();
    if (categoryName && !categories.includes(categoryName)) {
        categories.push(categoryName);
        saveCategories(categories);
    }
    return categories;
}

function removeCategory(categoryName) {
    let categories = getCategories();
    categories = categories.filter(c => c !== categoryName);
    saveCategories(categories);
    return categories;
}

// ========== THEME ==========
function getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
}

function setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

// ========== DATA EXPORT / IMPORT ==========
function exportData() {
    const data = {
        trades: getTrades(),
        accounts: getAccounts(),
        sessions: getSessions(),
        categories: getCategories(),
        exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
}

function importData(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        
        if (data.trades) saveTrades(data.trades);
        if (data.accounts) saveAccounts(data.accounts);
        if (data.sessions) saveSessions(data.sessions);
        if (data.categories) saveCategories(data.categories);
        
        return true;
    } catch (error) {
        console.error('Import failed:', error);
        return false;
    }
}

function clearAllData() {
    localStorage.removeItem(STORAGE_KEYS.TRADES);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    initStorage();
}