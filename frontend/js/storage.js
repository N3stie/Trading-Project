// ========== STORAGE.JS - API Layer ==========

const API_BASE = 'http://localhost:3000/api';
const API_KEY = 'tr4ding-j0urn4l-s3cr3t-k3y-2024';

const headers = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY
};

// ========== TRADES ==========
async function getTrades() {
    try {
        const res = await fetch(`${API_BASE}/trades`, { headers });
        const data = await res.json();
        return data.trades || [];
    } catch (err) {
        console.error('Get trades failed:', err);
        return [];
    }
}

async function addTrade(trade) {
    try {
        const res = await fetch(`${API_BASE}/trades`, {
            method: 'POST',
            headers,
            body: JSON.stringify(trade)
        });
        const data = await res.json();
        return data.trade;
    } catch (err) {
        console.error('Add trade failed:', err);
        return null;
    }
}

async function updateTrade(tradeId, updatedTrade) {
    try {
        const res = await fetch(`${API_BASE}/trades/${tradeId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(updatedTrade)
        });
        const data = await res.json();
        return !!data.trade;
    } catch (err) {
        console.error('Update trade failed:', err);
        return false;
    }
}

async function deleteTrade(tradeId) {
    try {
        await fetch(`${API_BASE}/trades/${tradeId}`, {
            method: 'DELETE',
            headers
        });
    } catch (err) {
        console.error('Delete trade failed:', err);
    }
}

async function getFilteredTrades(filters = {}) {
    let trades = await getTrades();
    
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
async function getAccounts() {
    try {
        const res = await fetch(`${API_BASE}/accounts`, { headers });
        const data = await res.json();
        return data.accounts || [];
    } catch (err) {
        console.error('Get accounts failed:', err);
        return [];
    }
}

async function addAccount(accountName) {
    try {
        const res = await fetch(`${API_BASE}/accounts`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ name: accountName })
        });
        const data = await res.json();
        return data.accounts || [];
    } catch (err) {
        console.error('Add account failed:', err);
        return [];
    }
}

async function removeAccount(accountName) {
    try {
        const res = await fetch(`${API_BASE}/accounts/${encodeURIComponent(accountName)}`, {
            method: 'DELETE',
            headers
        });
        const data = await res.json();
        return data.accounts || [];
    } catch (err) {
        console.error('Remove account failed:', err);
        return [];
    }
}

// ========== SESSIONS ==========
async function getSessions() {
    try {
        const res = await fetch(`${API_BASE}/sessions`, { headers });
        const data = await res.json();
        return data.sessions || [];
    } catch (err) {
        console.error('Get sessions failed:', err);
        return [];
    }
}

async function addSession(sessionName) {
    try {
        const res = await fetch(`${API_BASE}/sessions`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ name: sessionName })
        });
        const data = await res.json();
        return data.sessions || [];
    } catch (err) {
        console.error('Add session failed:', err);
        return [];
    }
}

async function removeSession(sessionName) {
    try {
        const res = await fetch(`${API_BASE}/sessions/${encodeURIComponent(sessionName)}`, {
            method: 'DELETE',
            headers
        });
        const data = await res.json();
        return data.sessions || [];
    } catch (err) {
        console.error('Remove session failed:', err);
        return [];
    }
}

// ========== CATEGORIES (local only) ==========
function getCategories() {
    return ['Stocks', 'Forex', 'Crypto', 'Indices', 'Commodities'];
}

function addCategory() { return []; }
function removeCategory() { return []; }

// ========== THEME (local only) ==========
function getTheme() {
    return localStorage.getItem('trading_journal_theme') || 'dark';
}

function setTheme(theme) {
    localStorage.setItem('trading_journal_theme', theme);
}

// ========== DATA EXPORT / IMPORT ==========
async function exportData() {
    const trades = await getTrades();
    const accounts = await getAccounts();
    const sessions = await getSessions();
    return JSON.stringify({ trades, accounts, sessions, exportedAt: new Date().toISOString() }, null, 2);
}

async function importData(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        if (data.trades) {
            for (const trade of data.trades) {
                await addTrade(trade);
            }
        }
        if (data.accounts) {
            for (const acc of data.accounts) {
                await addAccount(acc);
            }
        }
        if (data.sessions) {
            for (const sess of data.sessions) {
                await addSession(sess);
            }
        }
        return true;
    } catch (err) {
        console.error('Import failed:', err);
        return false;
    }
}

async function clearAllData() {
    const trades = await getTrades();
    for (const trade of trades) {
        await deleteTrade(trade.id);
    }
}

function initStorage() {
    // No localStorage init needed
}