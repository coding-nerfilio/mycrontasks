import TelegramBot from "node-telegram-bot-api";
import moment from "moment";
import { setInterval } from "timers";
import TaskDatabase from "./bd/tasks";

// Configuración del bot
const BOT_TOKEN = process.env.TELEGRAM_API_KEY || "";
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Inicializar base de datos
const db = new TaskDatabase("tasks.db");

// Comando /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `Bienvenido a tu asistente de tareas! 📌\n\nComandos disponibles:\n/start - Ver este mensaje\n/add - Agregar tarea\n/list - Listar tareas\n/delete - Eliminar tarea\n\nCrea tareas con recordatorios automáticos!`
  );
});

// Comando /add
bot.onText(/\/add/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "📌 Envíame la descripción de la tarea:");

  bot.once("message", (msg) => {
    const description = msg.text || "Tarea sin descripción";
    bot.sendMessage(
      chatId,
      "⏳ Envíame la fecha y hora del primer aviso (Formato: YYYY-MM-DD HH:mm)"
    );

    bot.once("message", (msg) => {
      const date = moment(msg.text, "YYYY-MM-DD HH:mm");
      if (!date.isValid())
        return bot.sendMessage(
          chatId,
          "❌ Fecha inválida. Usa el formato correcto."
        );

      bot.sendMessage(
        chatId,
        "🔁 Ingresa la periodicidad (minute, hour, day, week, month):"
      );
      bot.once("message", (msg) => {
        const periodicity = msg.text?.toLowerCase();
        if (
          !["minute", "hour", "day", "week", "month"].includes(periodicity!)
        ) {
          return bot.sendMessage(chatId, "❌ Periodicidad inválida.");
        }

        bot.sendMessage(chatId, "⏳ Ingresa la cantidad de " + periodicity);
        bot.once("message", (msg) => {
          const periodAmount = parseInt(msg.text!);
          if (isNaN(periodAmount))
            return bot.sendMessage(chatId, "❌ Cantidad inválida.");

          // Guardar tarea en SQLite
          db.addTask({
            chatId,
            description,
            nextRun: date.toISOString(),
            periodicity: periodicity!,
            periodAmount,
          });
          bot.sendMessage(
            chatId,
            `✅ Tarea agregada: ${description}\n📅 Próximo aviso: ${date.format(
              "YYYY-MM-DD HH:mm"
            )}`
          );
        });
      });
    });
  });
});

// Comando /list
bot.onText(/\/list/, (msg) => {
  const chatId = msg.chat.id;
  const tasks = db.getTasks(chatId);
  if (tasks.length === 0)
    return bot.sendMessage(chatId, "📭 No tienes tareas registradas.");

  const taskList = tasks
    .map(
      (t) =>
        `🆔 ${t.id} - ${t.description}\n⏳ Periodicidad: ${t.periodAmount} ${
          t.periodicity
        }\n📅 Próximo aviso: ${moment(t.nextRun).format("YYYY-MM-DD HH:mm")}`
    )
    .join("\n\n");
  bot.sendMessage(chatId, `📋 Tus tareas:\n\n${taskList}`);
});

// Comando /delete
bot.onText(/\/delete/, (msg) => {
  const chatId = msg.chat.id;
  const tasks = db.getTasks(chatId);
  if (tasks.length === 0)
    return bot.sendMessage(chatId, "📭 No tienes tareas para eliminar.");

  const keyboard = {
    reply_markup: {
      inline_keyboard: tasks.map((task) => [
        { text: `🗑 ${task.description}`, callback_data: `delete_${task.id}` },
      ]),
    },
  };
  bot.sendMessage(chatId, "Selecciona una tarea para eliminar:", keyboard);
});

// Manejar eliminaciones
bot.on("callback_query", (query) => {
  const chatId = query.message!.chat.id;
  const taskId = parseInt(query.data!.replace("delete_", ""));
  db.deleteTask(taskId);
  bot.answerCallbackQuery(query.id, { text: "✅ Tarea eliminada." });
  bot.sendMessage(chatId, "📌 Tarea eliminada exitosamente.");
});

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
