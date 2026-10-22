
const Database = require("better-sqlite3");
const path = require("path");

// Create or open the database file
const db = new Database(path.join(__dirname, "campusos.db"));

// Create the tasks table if it doesn't exist
db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'medium',
        deadline TEXT DEFAULT '',
        completed INTEGER NOT NULL DEFAULT 0
    )
`);

console.log("CampusOS database connected!");

module.exports = db;
