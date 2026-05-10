// ========== TRADES ROUTES ==========
const express = require('express');
const router = express.Router();
const { getDb, saveDb } = require('../database/init');

// GET all trades
router.get('/', (req, res) => {
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

// POST new trade
router.post('/', (req, res) => {
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
        const trade = {
            id: row[0], entryDate: row[1], instrument: row[2], size: row[3],
            entryPrice: row[4], exitPrice: row[5], type: row[6], session: row[7],
            account: row[8], profit: row[9], result: row[10], note: row[11],
            screenshot: row[12]
        };
        res.status(201).json({ trade });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update trade
router.put('/:id', (req, res) => {
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
        const trade = {
            id: row[0], entryDate: row[1], instrument: row[2], size: row[3],
            entryPrice: row[4], exitPrice: row[5], type: row[6], session: row[7],
            account: row[8], profit: row[9], result: row[10], note: row[11],
            screenshot: row[12]
        };
        res.json({ trade });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE trade
router.delete('/:id', (req, res) => {
    try {
        const db = getDb();
        db.run('DELETE FROM trades WHERE id = ?', [req.params.id]);
        saveDb();
        res.json({ message: 'Trade deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;