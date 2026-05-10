// ========== DATABASE INITIALIZATION ==========
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

let db;

async function initDatabase() {
    const SQL = await initSqlJs();
    const dbPath = path.join(__dirname, 'trading.db');
    
    if (fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }
    
    db.run(`
        CREATE TABLE IF NOT EXISTS trades (
            id TEXT PRIMARY KEY,
            entryDate TEXT NOT NULL,
            instrument TEXT NOT NULL,
            size REAL DEFAULT 0,
            entryPrice REAL DEFAULT 0,
            exitPrice REAL DEFAULT 0,
            type TEXT DEFAULT 'Buy',
            session TEXT DEFAULT '',
            account TEXT DEFAULT '',
            profit REAL DEFAULT 0,
            result TEXT DEFAULT '',
            note TEXT DEFAULT '',
            screenshot TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now'))
        )
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            created_at TEXT DEFAULT (datetime('now'))
        )
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            created_at TEXT DEFAULT (datetime('now'))
        )
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    `);
    
    const accountResult = db.exec('SELECT COUNT(*) as count FROM accounts');
    if (accountResult.length === 0 || accountResult[0].values[0][0] === 0) {
        db.run('INSERT INTO accounts (name) VALUES (?)', ['Live Account']);
        db.run('INSERT INTO accounts (name) VALUES (?)', ['Demo Account']);
    }
    
    const sessionResult = db.exec('SELECT COUNT(*) as count FROM sessions');
    if (sessionResult.length === 0 || sessionResult[0].values[0][0] === 0) {
        db.run('INSERT INTO sessions (name) VALUES (?)', ['Asia']);
        db.run('INSERT INTO sessions (name) VALUES (?)', ['London']);
        db.run('INSERT INTO sessions (name) VALUES (?)', ['New York']);
    }
    
    saveDb();
    return db;
}

function getDb() {
    return db;
}

function saveDb() {
    const dbPath = path.join(__dirname, 'trading.db');
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
}

module.exports = { initDatabase, getDb, saveDb };