// ========== ACCOUNTS ROUTES ==========
const express = require('express');
const router = express.Router();
const { getDb, saveDb } = require('../database/init');

router.get('/', (req, res) => {
    try {
        const db = getDb();
        const result = db.exec('SELECT name FROM accounts ORDER BY name');
        const accounts = result.length > 0 ? result[0].values.map(row => row[0]) : [];
        res.json({ accounts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', (req, res) => {
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

router.delete('/:name', (req, res) => {
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

module.exports = router;