import TelegramBot from "node-telegram-bot-api";
import TaskDatabase from "../bd/tasks";
import UserDatabase from "../bd/user";
import i18next from "../locales/i18n";
import { userIsRegistered } from "../utills";

export const handleDelete = (
  bot: TelegramBot,
  db: TaskDatabase,
  userDb: UserDatabase
) => {
  bot.onText(/\/delete/, (msg) => {
    const chatId = msg.chat.id;
    const tasks = db.getTasks(chatId);

    const user = userIsRegistered(bot, userDb, chatId);
    if (!user) return;

    const { language } = user;

    if (tasks.length === 0)
      return bot.sendMessage(
        chatId,
        i18next.t("delete_no_tasks", { lng: language })
      );

    const keyboard = {
      reply_markup: {
        inline_keyboard: tasks.map((task) => [
          { text: `🗑 ${task.description}`, callback_data: `delete_${task.id}` },
        ]),
      },
    };
    bot.sendMessage(
      chatId,
      i18next.t("delete_select_task", { lng: language }),
      keyboard
    );
  });
};

export const handleDeleteCallback = (
  bot: TelegramBot,
  query: TelegramBot.CallbackQuery,
  userDb: UserDatabase,
  taskDb: TaskDatabase
) => {
  const chatId = query.message!.chat.id;
  const language = userDb.getUser(chatId)?.language;
  const taskId = parseInt(query.data!.replace("delete_", ""));
  taskDb.deleteTask(taskId);
  bot.answerCallbackQuery(query.id, {
    text: i18next.t("delete_task_confirm", { lng: language }),
  });
  bot.sendMessage(chatId, i18next.t("delete_task_success", { lng: language }));
};
