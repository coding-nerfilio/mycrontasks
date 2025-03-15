import Database from "better-sqlite3";
import TaskDatabase, { Task } from "../src/bd/tasks";
import moment from "moment";

describe("TaskDatabase", () => {
  let db: Database.Database;
  let taskDb: TaskDatabase;

  beforeEach(() => {
    db = new Database(":memory:"); // Base de datos en memoria para pruebas
    taskDb = new TaskDatabase(db);
  });

  afterEach(() => {
    db.close();
  });

  test("should add a task", () => {
    const task: Task = {
      chatId: 1,
      description: "Test task",
      nextRun: moment().add(1, "day").toISOString(),
      periodicity: "days",
      periodAmount: 1,
    };

    taskDb.addTask(task);
    const tasks = taskDb.getTasks(1);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].description).toBe("Test task");
  });

  test("should retrieve tasks by chatId", () => {
    const task1 = {
      chatId: 1,
      description: "Task 1",
      nextRun: moment().add(1, "hour").toISOString(),
      periodicity: "hours",
      periodAmount: 1,
    };
    const task2 = {
      chatId: 2,
      description: "Task 2",
      nextRun: moment().add(2, "hours").toISOString(),
      periodicity: "hours",
      periodAmount: 2,
    };

    taskDb.addTask(task1);
    taskDb.addTask(task2);

    const chat1Tasks = taskDb.getTasks(1);
    expect(chat1Tasks).toHaveLength(1);
    expect(chat1Tasks[0].description).toBe("Task 1");
  });

  test("should delete a task", () => {
    const task = {
      chatId: 1,
      description: "Delete me",
      nextRun: moment().add(1, "day").toISOString(),
      periodicity: "days",
      periodAmount: 1,
    };

    taskDb.addTask(task);
    const tasksBefore = taskDb.getTasks(1);
    taskDb.deleteTask(tasksBefore[0].id!);
    const tasksAfter = taskDb.getTasks(1);
    expect(tasksAfter).toHaveLength(0);
  });

  test("should get expired tasks", () => {
    const expiredTask = {
      chatId: 1,
      description: "Expired task",
      nextRun: moment().subtract(1, "hour").toISOString(),
      periodicity: "hours",
      periodAmount: 1,
    };
    const futureTask = {
      chatId: 1,
      description: "Future task",
      nextRun: moment().add(1, "hour").toISOString(),
      periodicity: "hours",
      periodAmount: 1,
    };

    taskDb.addTask(expiredTask);
    taskDb.addTask(futureTask);

    const expiredTasks = taskDb.getExpiredTasks();
    expect(expiredTasks).toHaveLength(1);
    expect(expiredTasks[0].description).toBe("Expired task");
  });

  test("should update nextRun time", () => {
    const task = {
      chatId: 1,
      description: "Update next run",
      nextRun: moment().toISOString(),
      periodicity: "days",
      periodAmount: 1,
    };

    taskDb.addTask(task);
    const tasks = taskDb.getTasks(1);
    const newNextRun = moment().add(2, "days").toISOString();

    taskDb.updateNextRun(tasks[0].id!, newNextRun);

    const updatedTask = taskDb.getTasks(1)[0];
    expect(updatedTask.nextRun).toBe(newNextRun);
  });
});
