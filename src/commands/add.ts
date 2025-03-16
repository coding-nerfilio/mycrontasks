import TelegramBot from "node-telegram-bot-api";
import moment, { lang } from "moment";
import TaskDatabase from "../bd/tasks";
import UserDatabase from "../bd/user";
import i18next from "../locales/i18n";

export const handleAdd = (
  bot: TelegramBot,
  db: TaskDatabase,
  userDb: UserDatabase
) => {
  bot.onText(/\/add/, (msg) => {
    const chatId = msg.chat.id;
    const language = userDb.getUser(chatId)?.language;

    if (!language) {
      return bot.sendDice(chatId);
    }

    bot.sendMessage(
      chatId,
      i18next.t("add_task_description", { lng: language })
    );

    bot.once("message", (msg) => {
      const description = msg.text || "Tarea sin descripción";
      bot.sendMessage(
        chatId,
        i18next.t("add_task_datetime", { lng: language })
      );

      bot.once("message", (msg) => {
        const date = moment(msg.text, "YYYY-MM-DD HH:mm");
        if (!date.isValid())
          return bot.sendMessage(
            chatId,
            i18next.t("invalid_date", { lng: language })
          );

        bot.sendMessage(
          chatId,
          i18next.t("add_task_periodicity", { lng: language })
        );
        bot.once("message", (msg) => {
          const periodicity = msg.text?.toLowerCase();
          if (
            !["minute", "hour", "day", "week", "month"].includes(periodicity!)
          ) {
            return bot.sendMessage(
              chatId,
              i18next.t("invalid_periodicity", { lng: language })
            );
          }

          bot.sendMessage(
            chatId,
            i18next.t("add_task_period_amount", {
              lng: language,
              periodicity,
            })
          );
          bot.once("message", (msg) => {
            const periodAmount = parseInt(msg.text!);
            if (isNaN(periodAmount))
              return bot.sendMessage(
                chatId,
                i18next.t("invalid_period_amount", { lng: language })
              );

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
              i18next.t("task_added", {
                lng: language,
                description,
                nextRun: date.format("YYYY-MM-DD HH:mm"),
              })
            );
          });
        });
      });
    });
  });
};
