import TelegramBot from "node-telegram-bot-api";
import TaskDatabase from "../bd/tasks";
import moment from "moment";
import i18next from "../locales/i18n"; // Asegúrate de importar correctamente i18next
import UserDatabase from "../bd/user";
import { userIsRegistered } from "../utills";

export const handleList = (
  bot: TelegramBot,
  db: TaskDatabase,
  userDb: UserDatabase
) => {
  bot.onText(/\/list/, (msg) => {
    const chatId = msg.chat.id;
    const tasks = db.getTasks(chatId);
    const user = userIsRegistered(bot, userDb, chatId);
    if (!user) return;

    const { language } = user;

    if (tasks.length === 0)
      return bot.sendMessage(
        chatId,
        i18next.t("list_no_tasks", { lng: language })
      );

    const taskList = tasks
      .map((t) =>
        i18next.t("list_task_item", {
          lng: language,
          description: t.description,
          periodAmount: t.periodAmount,
          periodicity: t.periodicity,
          nextRun: moment(t.nextRun).format("YYYY-MM-DD HH:mm"),
        })
      )
      .join("\n\n");

    bot.sendMessage(
      chatId,
      i18next.t("list_tasks_header", { lng: language, taskList })
    );
  });
};
