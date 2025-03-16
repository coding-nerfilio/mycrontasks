import TelegramBot from "node-telegram-bot-api";
import UserDatabase from "../bd/user";
import i18next from "../locales/i18n";

export const handleConfiguration = (bot: TelegramBot, db: UserDatabase) => {
  bot.onText(/\/settings/, (msg) => {
    const chatId = msg.chat.id;

    // Verificar si el usuario está registrado
    const user = db.getUser(chatId);

    if (user) {
      // Si el usuario está registrado, mostrar su configuración actual
      const { language, timezone } = user;

      // Mostrar las opciones actuales de idioma
      const languageOptions = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: `${i18next.t("language", { lng: language })}: ${
                  language === "es" ? "Español ✅" : "Español"
                }`,
                callback_data: "language_es",
              },
            ],
            [
              {
                text: `${i18next.t("language", { lng: language })}: ${
                  language === "en" ? "English ✅" : "English"
                }`,
                callback_data: "language_en",
              },
            ],
          ],
        },
      };

      // Mostrar las opciones actuales de zona horaria
      const timezoneOptions = {
        reply_markup: {
          inline_keyboard: [
            // Agrupamos los botones en filas horizontales (de 4 botones por fila)
            [
              {
                text: `${timezone === "GMT-12" ? "GMT-12 ✅" : "GMT-12"}`,
                callback_data: "timezone_GMT-12",
              },
              {
                text: `${timezone === "GMT-11" ? "GMT-11 ✅" : "GMT-11"}`,
                callback_data: "timezone_GMT-11",
              },
              {
                text: `${timezone === "GMT-10" ? "GMT-10 ✅" : "GMT-10"}`,
                callback_data: "timezone_GMT-10",
              },
              {
                text: `${timezone === "GMT-9" ? "GMT-9 ✅" : "GMT-9"}`,
                callback_data: "timezone_GMT-9",
              },
            ],
            [
              {
                text: `${timezone === "GMT-8" ? "GMT-8 ✅" : "GMT-8"}`,
                callback_data: "timezone_GMT-8",
              },
              {
                text: `${timezone === "GMT-7" ? "GMT-7 ✅" : "GMT-7"}`,
                callback_data: "timezone_GMT-7",
              },
              {
                text: `${timezone === "GMT-6" ? "GMT-6 ✅" : "GMT-6"}`,
                callback_data: "timezone_GMT-6",
              },
              {
                text: `${timezone === "GMT-5" ? "GMT-5 ✅" : "GMT-5"}`,
                callback_data: "timezone_GMT-5",
              },
            ],
            [
              {
                text: `${timezone === "GMT-4" ? "GMT-4 ✅" : "GMT-4"}`,
                callback_data: "timezone_GMT-4",
              },
              {
                text: `${timezone === "GMT-3" ? "GMT-3 ✅" : "GMT-3"}`,
                callback_data: "timezone_GMT-3",
              },
              {
                text: `${timezone === "GMT-2" ? "GMT-2 ✅" : "GMT-2"}`,
                callback_data: "timezone_GMT-2",
              },
              {
                text: `${timezone === "GMT-1" ? "GMT-1 ✅" : "GMT-1"}`,
                callback_data: "timezone_GMT-1",
              },
            ],
            [
              {
                text: `${timezone === "GMT+0" ? "GMT+0 ✅" : "GMT+0"}`,
                callback_data: "timezone_GMT+0",
              },
              {
                text: `${timezone === "GMT+1" ? "GMT+1 ✅" : "GMT+1"}`,
                callback_data: "timezone_GMT+1",
              },
              {
                text: `${timezone === "GMT+2" ? "GMT+2 ✅" : "GMT+2"}`,
                callback_data: "timezone_GMT+2",
              },
              {
                text: `${timezone === "GMT+3" ? "GMT+3 ✅" : "GMT+3"}`,
                callback_data: "timezone_GMT+3",
              },
            ],
            [
              {
                text: `${timezone === "GMT+4" ? "GMT+4 ✅" : "GMT+4"}`,
                callback_data: "timezone_GMT+4",
              },
              {
                text: `${timezone === "GMT+5" ? "GMT+5 ✅" : "GMT+5"}`,
                callback_data: "timezone_GMT+5",
              },
              {
                text: `${timezone === "GMT+6" ? "GMT+6 ✅" : "GMT+6"}`,
                callback_data: "timezone_GMT+6",
              },
              {
                text: `${timezone === "GMT+7" ? "GMT+7 ✅" : "GMT+7"}`,
                callback_data: "timezone_GMT+7",
              },
            ],
            [
              {
                text: `${timezone === "GMT+8" ? "GMT+8 ✅" : "GMT+8"}`,
                callback_data: "timezone_GMT+8",
              },
              {
                text: `${timezone === "GMT+9" ? "GMT+9 ✅" : "GMT+9"}`,
                callback_data: "timezone_GMT+9",
              },
              {
                text: `${timezone === "GMT+10" ? "GMT+10 ✅" : "GMT+10"}`,
                callback_data: "timezone_GMT+10",
              },
              {
                text: `${timezone === "GMT+11" ? "GMT+11 ✅" : "GMT+11"}`,
                callback_data: "timezone_GMT+11",
              },
            ],
            [
              {
                text: `${timezone === "GMT+12" ? "GMT+12 ✅" : "GMT+12"}`,
                callback_data: "timezone_GMT+12",
              },
              {
                text: `${timezone === "GMT+13" ? "GMT+13 ✅" : "GMT+13"}`,
                callback_data: "timezone_GMT+13",
              },
              {
                text: `${timezone === "GMT+14" ? "GMT+14 ✅" : "GMT+14"}`,
                callback_data: "timezone_GMT+14",
              },
            ],
          ],
        },
      };

      // Enviar mensaje con las opciones de configuración
      bot.sendMessage(
        chatId,
        i18next.t("current_settings", {
          lng: language,
          language: language === "es" ? "Español" : "English",
          timezone,
        }),
        languageOptions
      );

      // Luego, proporcionar opciones para cambiar idioma o zona horaria
      bot.sendMessage(
        chatId,
        i18next.t("choose_option", { lng: language }),
        timezoneOptions
      );
    } else {
      // Si el usuario no está registrado, le avisamos
      bot.sendMessage(chatId, i18next.t("not_registered"));
    }
  });
};

export const handleChangeTimezoneCallback = (
  bot: TelegramBot,
  query: TelegramBot.CallbackQuery,
  userDb: UserDatabase
) => {
  const selectedTimezone = query.data?.split("_")[1];
  const chatId = query.message!.chat.id;

  if (selectedTimezone) {
    userDb.updateTimezone(chatId, selectedTimezone);
    bot.sendMessage(
      chatId,
      i18next.t("timezone_updated", {
        lng:
          userDb.getUser(chatId)?.language || query.from.language_code || "en",
        timezone: selectedTimezone,
      })
    );
  }
};

export const handleChangelanguageCallback = (
  bot: TelegramBot,
  query: TelegramBot.CallbackQuery,
  userDb: UserDatabase
) => {
  const selectedLanguage = query.data?.split("_")[1];
  const chatId = query.message!.chat.id;

  if (selectedLanguage) {
    userDb.updateLanguage(chatId, selectedLanguage);
    bot.sendMessage(
      chatId,
      i18next.t("language_updated", {
        lng: selectedLanguage,
        language: selectedLanguage === "es" ? "Español" : "English",
      })
    );
  }
};
