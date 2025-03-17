import TelegramBot from "node-telegram-bot-api";
import UserDatabase, { User } from "../bd/user"; // Asumiendo que tienes la base de datos del usuario ya implementada
import i18next from "../locales/i18n";

export const handleStart = (bot: TelegramBot, db: UserDatabase) => {
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    // Verificar si el usuario ya está registrado
    const user = db.getUser(chatId);

    if (user) {
      // Si el usuario está registrado, enviar mensaje de bienvenida
      bot.sendMessage(chatId, i18next.t("welcome", { lng: user!.language! }));
    } else {
      const telegramLanguage = msg.from?.language_code || "en";
      // Si no está registrado, pedir idioma
      const languageOptions = {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Español", callback_data: "startlang_es" }],
            [{ text: "English", callback_data: "startlang_en" }],
          ],
        },
      };

      bot.sendMessage(
        chatId,
        i18next.t("choose_language", { lng: telegramLanguage }),
        languageOptions
      );
    }
  });
};

export const handleStartTimezoneCallback = (
  bot: TelegramBot,
  query: TelegramBot.CallbackQuery,
  userDb: UserDatabase
) => {
  const selectedTimezone = query.data?.split("_")[1];
  const chatId = query.message!.chat.id;
  const language = userDb.getUser(chatId)?.language;

  if (selectedTimezone) {
    userDb.updateTimezone(chatId, selectedTimezone);

    // Guardar los datos del usuario
    const newUser: User = {
      chatId,
      language: language!,
      timezone: selectedTimezone,
    };
    userDb.saveUser(newUser);

    bot.deleteMessage(chatId, query.message!.message_id);
    bot.sendMessage(
      query.id,
      i18next.t("timezone_updated", {
        lng: language,
        timezone: selectedTimezone,
      })
    );
    bot.sendMessage(chatId, i18next.t("user_registered", { lng: language }));

    bot.sendMessage(chatId, i18next.t("welcome", { lng: language }));
  }
};

export const handleStartLanguageCallback = (
  bot: TelegramBot,
  query: TelegramBot.CallbackQuery,
  userDb: UserDatabase
) => {
  const selectedLanguage = query.data?.split("_")[1];
  const chatId = query.message!.chat.id;

  if (selectedLanguage) {
    userDb.updateLanguage(chatId, selectedLanguage);

    // Después de seleccionar el idioma, preguntar por la zona horaria
    const timezoneOptions = {
      reply_markup: {
        inline_keyboard: [
          // Agrupamos los botones en filas horizontales (de 4 botones por fila)
          [
            { text: "GMT-12", callback_data: "starttz_GMT-12" },
            { text: "GMT-11", callback_data: "starttz_GMT-11" },
            { text: "GMT-10", callback_data: "starttz_GMT-10" },
            { text: "GMT-9", callback_data: "starttz_GMT-9" },
          ],
          [
            { text: "GMT-8", callback_data: "starttz_GMT-8" },
            { text: "GMT-7", callback_data: "starttz_GMT-7" },
            { text: "GMT-6", callback_data: "starttz_GMT-6" },
            { text: "GMT-5", callback_data: "starttz_GMT-5" },
          ],
          [
            { text: "GMT-4", callback_data: "starttz_GMT-4" },
            { text: "GMT-3", callback_data: "starttz_GMT-3" },
            { text: "GMT-2", callback_data: "starttz_GMT-2" },
            { text: "GMT-1", callback_data: "starttz_GMT-1" },
          ],
          [
            { text: "GMT+0", callback_data: "starttz_GMT+0" },
            { text: "GMT+1", callback_data: "starttz_GMT+1" },
            { text: "GMT+2", callback_data: "starttz_GMT+2" },
            { text: "GMT+3", callback_data: "starttz_GMT+3" },
          ],
          [
            { text: "GMT+4", callback_data: "starttz_GMT+4" },
            { text: "GMT+5", callback_data: "starttz_GMT+5" },
            { text: "GMT+6", callback_data: "starttz_GMT+6" },
            { text: "GMT+7", callback_data: "starttz_GMT+7" },
          ],
          [
            { text: "GMT+8", callback_data: "starttz_GMT+8" },
            { text: "GMT+9", callback_data: "starttz_GMT+9" },
            { text: "GMT+10", callback_data: "starttz_GMT+10" },
            { text: "GMT+11", callback_data: "starttz_GMT+11" },
          ],
          [
            { text: "GMT+12", callback_data: "starttz_GMT+12" },
            { text: "GMT+13", callback_data: "starttz_GMT+13" },
            { text: "GMT+14", callback_data: "starttz_GMT+14" },
          ],
        ],
      },
    };
    bot.deleteMessage(chatId, query.message!.message_id);
    bot.sendMessage(
      chatId,
      i18next.t("language_updated", {
        lng: selectedLanguage,
        language: selectedLanguage === "es" ? "Español" : "English",
      })
    );
    bot.sendMessage(
      chatId,
      i18next.t("choose_timezone", { lng: selectedLanguage }),
      timezoneOptions
    );
  }
};
