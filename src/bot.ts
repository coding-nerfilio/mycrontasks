import TelegramBot from "node-telegram-bot-api";
import TaskDatabase from "./bd/tasks";
import { handleStart } from "./commands/start";
import { handleAdd } from "./commands/add";
import { handleList } from "./commands/list";
import { handleDelete } from "./commands/delete";
import moment from "moment";
import UserDatabase from "./bd/user";

// Configuración del bot
const BOT_TOKEN = process.env.TELEGRAM_API_KEY || "";
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Inicializar base de datos
const taskDb = new TaskDatabase("tasks.db");
const userDb = new UserDatabase("user.db");

// Configurar los comandos
handleStart(bot, userDb);
handleAdd(bot, taskDb);
handleList(bot, taskDb);
handleDelete(bot, taskDb);

// Revisión de tareas cada 30 segundos
setInterval(() => {
  const tasksToNotify = taskDb.getExpiredTasks();

  tasksToNotify.forEach((task) => {
    bot.sendMessage(task.chatId, `🔔 Recordatorio: ${task.description}`);

    if (task.periodAmount === 0) {
      taskDb.deleteTask(task.chatId);
    } else {
      // Calcular próxima fecha
      const nextRun = moment(task.nextRun)
        .add(
          task.periodAmount,
          task.periodicity as moment.unitOfTime.DurationConstructor
        )
        .toISOString();
      taskDb.updateNextRun(task.id!, nextRun);
    }
  });
}, 30000);

console.log("🤖 Bot iniciado...");
