import Database from "better-sqlite3";

export type User = {
  chatId: number;
  language: string;
  timezone: string;
};

class UserDatabase {
  private db: Database.Database;

  constructor(dbPath: string | Database.Database) {
    this.db = typeof dbPath === "string" ? new Database(dbPath) : dbPath;
    this.initialize();
  }

  private initialize() {
    this.db.exec(`CREATE TABLE IF NOT EXISTS users (
      chatId INTEGER PRIMARY KEY,
      language TEXT,
      timezone TEXT
    )`);
  }

  private validateTimezone(timezone: string): boolean {
    const timezoneRegex = /^GMT([+-])(\d{1,2})$/;
    return timezoneRegex.test(timezone);
  }

  getUser(chatId: number): User | undefined {
    return this.db
      .prepare("SELECT * FROM users WHERE chatId = ?")
      .get(chatId) as User | undefined;
  }

  saveUser(user: User) {
    if (!this.validateTimezone(user.timezone)) {
      throw new Error("Invalid timezone format. It must be GMT+N or GMT-N.");
    }
    const stmt = this.db.prepare(
      "INSERT INTO users (chatId, language, timezone) VALUES (?, ?, ?) ON CONFLICT(chatId) DO UPDATE SET language = excluded.language, timezone = excluded.timezone"
    );
    stmt.run(user.chatId, user.language, user.timezone);
  }

  updateLanguage(chatId: number, language: string) {
    this.db
      .prepare("UPDATE users SET language = ? WHERE chatId = ?")
      .run(language, chatId);
  }

  updateTimezone(chatId: number, timezone: string) {
    if (!this.validateTimezone(timezone)) {
      throw new Error("Invalid timezone format. It must be GMT+N or GMT-N.");
    }
    this.db
      .prepare("UPDATE users SET timezone = ? WHERE chatId = ?")
      .run(timezone, chatId);
  }
}

export default UserDatabase;
