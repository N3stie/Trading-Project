// ========== SESSIONS ROUTES ==========
const express = require('express');
const router = express.Router();
const { getDb, saveDb } = require('../database/init');

router.get('/', (req, res) => {
    try {
        const db = getDb();
        const result = db.exec('SELECT name FROM sessions ORDER BY name');
        const sessions = result.length > 0 ? result[0].values.map(row => row[0]) : [];
        res.json({ sessions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', (req, res) => {
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

router.delete('/:name', (req, res) => {
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

module.exports = router;