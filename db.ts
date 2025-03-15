import Database from "better-sqlite3";
import moment from "moment";

export type Task = {
  id?: number | undefined;
  chatId: number;
  description: string;
  nextRun: string;
  periodicity: string;
  periodAmount: number;
};

class TaskDatabase {
  private db: Database.Database;

  constructor(dbPath: string | Database.Database) {
    this.db = typeof dbPath === "string" ? new Database(dbPath) : dbPath;
    this.initialize();
  }

  private initialize() {
    this.db.exec(`CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chatId INTEGER,
      description TEXT,
      nextRun TEXT,
      periodicity TEXT,
      periodAmount INTEGER
    )`);
  }

  addTask(task: Task) {
    const stmt = this.db.prepare(
      "INSERT INTO tasks (chatId, description, nextRun, periodicity, periodAmount) VALUES (?, ?, ?, ?, ?)"
    );
    stmt.run(
      task.chatId,
      task.description,
      task.nextRun,
      task.periodicity,
      task.periodAmount
    );
  }

  getTasks(chatId: number) {
    return this.db
      .prepare("SELECT * FROM tasks WHERE chatId = ?")
      .all(chatId) as Task[];
  }

  deleteTask(taskId: number) {
    this.db.prepare("DELETE FROM tasks WHERE id = ?").run(taskId);
  }

  getExpiredTasks() {
    const now = moment().toISOString();
    return this.db
      .prepare("SELECT * FROM tasks WHERE nextRun <= ?")
      .all(now) as Task[];
  }

  updateNextRun(taskId: number, nextRun: string) {
    this.db
      .prepare("UPDATE tasks SET nextRun = ? WHERE id = ?")
      .run(nextRun, taskId);
  }
}

export default TaskDatabase;
