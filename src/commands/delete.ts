import TelegramBot from "node-telegram-bot-api";
import TaskDatabase from "../bd/tasks";

export const handleDelete = (bot: TelegramBot, db: TaskDatabase) => {
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
};
