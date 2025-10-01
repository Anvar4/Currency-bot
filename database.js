import Database from "better-sqlite3"

const db = new Database("bot.db")

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    language TEXT DEFAULT 'uz',
    notifications_enabled INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

export const userDb = {
  create(userId, name, language = "uz") {
    const stmt = db.prepare("INSERT OR REPLACE INTO users (user_id, name, language) VALUES (?, ?, ?)")
    return stmt.run(userId, name, language)
  },

  get(userId) {
    const stmt = db.prepare("SELECT * FROM users WHERE user_id = ?")
    return stmt.get(userId)
  },

  updateName(userId, name) {
    const stmt = db.prepare("UPDATE users SET name = ? WHERE user_id = ?")
    return stmt.run(name, userId)
  },

  updateLanguage(userId, language) {
    const stmt = db.prepare("UPDATE users SET language = ? WHERE user_id = ?")
    return stmt.run(language, userId)
  },

  toggleNotifications(userId) {
    const stmt = db.prepare("UPDATE users SET notifications_enabled = NOT notifications_enabled WHERE user_id = ?")
    return stmt.run(userId)
  },

  getNotificationUsers() {
    const stmt = db.prepare("SELECT * FROM users WHERE notifications_enabled = 1")
    return stmt.all()
  },

  exists(userId) {
    const stmt = db.prepare("SELECT user_id FROM users WHERE user_id = ?")
    return !!stmt.get(userId)
  },
}

export default db
