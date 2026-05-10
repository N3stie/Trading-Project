// ========== SETTINGS ROUTES ==========
const express = require('express');
const router = express.Router();
const { getDb, saveDb } = require('../database/init');

router.get('/', (req, res) => {
    try {
        const db = getDb();
        const result = db.exec('SELECT key, value FROM settings');
        const settings = {};
        if (result.length > 0) {
            result[0].values.forEach(row => {
                try { settings[row[0]] = JSON.parse(row[1]); }
                catch { settings[row[0]] = row[1]; }
            });
        }
        res.json({ settings });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:key', (req, res) => {
    try {
        const db = getDb();
        const { key } = req.params;
        const { value } = req.body;
        const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
        
        const result = db.exec('SELECT key FROM settings WHERE key = ?', [key]);
        if (result.length > 0 && result[0].values.length > 0) {
            db.run('UPDATE settings SET value = ? WHERE key = ?', [valueStr, key]);
        } else {
            db.run('INSERT INTO settings (key, value) VALUES (?, ?)', [key, valueStr]);
        }
        saveDb();
        res.json({ key, value });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;