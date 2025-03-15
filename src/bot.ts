import TelegramBot from "node-telegram-bot-api";
import TaskDatabase from "./bd/tasks";
import { handleStart } from "./commands/start";
import { handleAdd } from "./commands/add";
import { handleList } from "./commands/list";
import { handleDelete } from "./commands/delete";
import moment from "moment";
import UserDatabase from "./bd/user";
import { tz } from "moment-timezone";
import { getTimezoneFromGMT } from "./utills";

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
    // Obtener la zona horaria del usuario desde la base de datos
    const userTimezone = userDb.getUser(task.chatId)?.timezone;
    const timezone = getTimezoneFromGMT(userTimezone!);

    // Ajustar la hora de la tarea a la zona horaria del usuario
    const userTime = tz(task.nextRun, timezone);

    // Comparar si es la hora correcta para enviar la notificación
    const currentTime = moment().tz(timezone);

    // Verifica si es la hora de la tarea (puedes ajustar la precisión si es necesario)
    if (userTime.isSameOrBefore(currentTime)) {
      bot.sendMessage(task.chatId, `🔔 Recordatorio: ${task.description}`);

      if (task.periodAmount === 0) {
        taskDb.deleteTask(task.chatId);
      } else {
        // Calcular la próxima fecha
        const nextRun = moment(userTime)
          .add(
            task.periodAmount,
            task.periodicity as moment.unitOfTime.DurationConstructor
          )
          .toISOString();
        taskDb.updateNextRun(task.id!, nextRun);
      }
    }
  });
}, 30000);

console.log("🤖 Bot iniciado...");
