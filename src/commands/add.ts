import TelegramBot from "node-telegram-bot-api";
import moment from "moment";
import TaskDatabase from "../bd/tasks";

export const handleAdd = (bot: TelegramBot, db: TaskDatabase) => {
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
};
