import TelegramBot from "node-telegram-bot-api";
import TaskDatabase from "./bd/tasks";
import { handleStart } from "./commands/start";
import { handleAdd } from "./commands/add";
import { handleList } from "./commands/list";
import { handleDelete } from "./commands/delete";
import moment from "moment";

// Configuración del bot
const BOT_TOKEN = process.env.TELEGRAM_API_KEY || "";
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Inicializar base de datos
const db = new TaskDatabase("tasks.db");

// Configurar los comandos
handleStart(bot);
handleAdd(bot, db);
handleList(bot, db);
handleDelete(bot, db);

// Revisión de tareas cada 30 segundos
setInterval(() => {
  const tasksToNotify = db.getExpiredTasks();

  tasksToNotify.forEach((task) => {
    bot.sendMessage(task.chatId, `🔔 Recordatorio: ${task.description}`);

    if (task.periodAmount === 0) {
      db.deleteTask(task.chatId);
    } else {
      // Calcular próxima fecha
      const nextRun = moment(task.nextRun)
        .add(
          task.periodAmount,
          task.periodicity as moment.unitOfTime.DurationConstructor
        )
        .toISOString();
      db.updateNextRun(task.id!, nextRun);
    }
  });
}, 30000);

console.log("🤖 Bot iniciado...");
