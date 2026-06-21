const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'gridlock.db');
const db = new Database(dbPath);

function initialize() {
    db.pragma('journal_mode = WAL');

    db.exec(`
        CREATE TABLE IF NOT EXISTS dispatch_log (
            id TEXT PRIMARY KEY,
            incident_id TEXT,
            status TEXT,
            timestamp TEXT,
            operator TEXT
        );

        CREATE TABLE IF NOT EXISTS incident_history (
            id TEXT PRIMARY KEY,
            title TEXT,
            type TEXT,
            severity TEXT,
            sector TEXT,
            event TEXT,
            reported_at TEXT,
            resolved_at TEXT,
            duration_mins INTEGER
        );
    `);
    
    // Seed some history if empty so there's data for the demo
    const count = db.prepare('SELECT count(*) as count FROM incident_history').get().count;
    if (count === 0) {
        const stmt = db.prepare(`
            INSERT INTO incident_history 
            (id, title, type, severity, sector, event, reported_at, resolved_at, duration_mins) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const now = new Date();
        const t1 = new Date(now.getTime() - 1000 * 60 * 60 * 2);
        const t2 = new Date(t1.getTime() + 1000 * 60 * 45);
        stmt.run('hist-1', 'Stadium Road Blockade', 'Derby Outflow', 'High', 'westside', 'derby_match', t1.toISOString(), t2.toISOString(), 45);
        
        const t3 = new Date(now.getTime() - 1000 * 60 * 60 * 24);
        const t4 = new Date(t3.getTime() + 1000 * 60 * 120);
        stmt.run('hist-2', 'Hydroplaning Incident', 'Crash Accident', 'Critical', 'highway', 'rain_storm', t3.toISOString(), t4.toISOString(), 120);
    }
}

module.exports = {
    db,
    initialize
};
