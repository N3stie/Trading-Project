// ========== SERVER.JS ==========
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase, getDb, saveDb } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 3000;

// Auth middleware inline
function authMiddleware(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static('uploads'));

// ========== TRADES ROUTES ==========
app.get('/api/trades', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const result = db.exec('SELECT * FROM trades ORDER BY entryDate DESC');
        const trades = result.length > 0 ? result[0].values.map(row => ({
            id: row[0], entryDate: row[1], instrument: row[2], size: row[3],
            entryPrice: row[4], exitPrice: row[5], type: row[6], session: row[7],
            account: row[8], profit: row[9], result: row[10], note: row[11],
            screenshot: row[12], created_at: row[13]
        })) : [];
        res.json({ trades });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/trades', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const { entryDate, instrument, size, entryPrice, exitPrice, type, session, account, profit, result, note, screenshot } = req.body;
        const id = Date.now().toString();
        
        db.run(
            'INSERT INTO trades (id, entryDate, instrument, size, entryPrice, exitPrice, type, session, account, profit, result, note, screenshot) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, entryDate, instrument, size || 0, entryPrice || 0, exitPrice || 0, type || 'Buy', session || '', account || '', profit || 0, result || '', note || '', screenshot || '']
        );
        saveDb();
        
        const newResult = db.exec('SELECT * FROM trades WHERE id = ?', [id]);
        const row = newResult[0].values[0];
        res.status(201).json({ trade: {
            id: row[0], entryDate: row[1], instrument: row[2], size: row[3],
            entryPrice: row[4], exitPrice: row[5], type: row[6], session: row[7],
            account: row[8], profit: row[9], result: row[10], note: row[11], screenshot: row[12]
        }});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/trades/:id', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const { entryDate, instrument, size, entryPrice, exitPrice, type, session, account, profit, result, note, screenshot } = req.body;
        const existing = db.exec('SELECT * FROM trades WHERE id = ?', [req.params.id]);
        if (existing.length === 0 || existing[0].values.length === 0) {
            return res.status(404).json({ error: 'Trade not found' });
        }
        const oldScreenshot = existing[0].values[0][12];
        
        db.run(
            'UPDATE trades SET entryDate = ?, instrument = ?, size = ?, entryPrice = ?, exitPrice = ?, type = ?, session = ?, account = ?, profit = ?, result = ?, note = ?, screenshot = ? WHERE id = ?',
            [entryDate, instrument, size || 0, entryPrice || 0, exitPrice || 0, type || 'Buy', session || '', account || '', profit || 0, result || '', note || '', screenshot || oldScreenshot, req.params.id]
        );
        saveDb();
        
        const updatedResult = db.exec('SELECT * FROM trades WHERE id = ?', [req.params.id]);
        const row = updatedResult[0].values[0];
        res.json({ trade: {
            id: row[0], entryDate: row[1], instrument: row[2], size: row[3],
            entryPrice: row[4], exitPrice: row[5], type: row[6], session: row[7],
            account: row[8], profit: row[9], result: row[10], note: row[11], screenshot: row[12]
        }});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/trades/:id', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        db.run('DELETE FROM trades WHERE id = ?', [req.params.id]);
        saveDb();
        res.json({ message: 'Trade deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== ACCOUNTS ROUTES ==========
app.get('/api/accounts', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const result = db.exec('SELECT name FROM accounts ORDER BY name');
        const accounts = result.length > 0 ? result[0].values.map(row => row[0]) : [];
        res.json({ accounts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/accounts', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const { name } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ error: 'Account name required' });
        db.run('INSERT INTO accounts (name) VALUES (?)', [name.trim()]);
        saveDb();
        const result = db.exec('SELECT name FROM accounts ORDER BY name');
        const accounts = result[0].values.map(row => row[0]);
        res.status(201).json({ accounts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/accounts/:name', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        db.run('DELETE FROM accounts WHERE name = ?', [decodeURIComponent(req.params.name)]);
        saveDb();
        const result = db.exec('SELECT name FROM accounts ORDER BY name');
        const accounts = result.length > 0 ? result[0].values.map(row => row[0]) : [];
        res.json({ accounts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== SESSIONS ROUTES ==========
app.get('/api/sessions', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const result = db.exec('SELECT name FROM sessions ORDER BY name');
        const sessions = result.length > 0 ? result[0].values.map(row => row[0]) : [];
        res.json({ sessions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/sessions', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const { name } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ error: 'Session name required' });
        db.run('INSERT INTO sessions (name) VALUES (?)', [name.trim()]);
        saveDb();
        const result = db.exec('SELECT name FROM sessions ORDER BY name');
        const sessions = result[0].values.map(row => row[0]);
        res.status(201).json({ sessions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/sessions/:name', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        db.run('DELETE FROM sessions WHERE name = ?', [decodeURIComponent(req.params.name)]);
        saveDb();
        const result = db.exec('SELECT name FROM sessions ORDER BY name');
        const sessions = result.length > 0 ? result[0].values.map(row => row[0]) : [];
        res.json({ sessions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize database then start server
initDatabase().then(() => {
    console.log('Database initialized');
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
});