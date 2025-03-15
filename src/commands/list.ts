import TelegramBot from "node-telegram-bot-api";
import TaskDatabase from "../bd/tasks";
import moment from "moment";

export const handleList = (bot: TelegramBot, db: TaskDatabase) => {
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
};
