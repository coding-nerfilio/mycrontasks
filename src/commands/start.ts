import TelegramBot from "node-telegram-bot-api";
import UserDatabase, { User } from "../bd/user"; // Asumiendo que tienes la base de datos del usuario ya implementada

export const handleStart = (bot: TelegramBot, db: UserDatabase) => {
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Verificar si el usuario ya está registrado
    const user = db.getUser(chatId);

    if (user) {
      // Si el usuario está registrado, enviar mensaje de bienvenida
      bot.sendMessage(
        chatId,
        `Bienvenido de nuevo! 📌\n\nComandos disponibles:\n/start - Ver este mensaje\n/add - Agregar tarea\n/list - Listar tareas\n/delete - Eliminar tarea\n\nCrea tareas con recordatorios automáticos!`
      );
    } else {
      // Si no está registrado, pedir idioma
      const languageOptions = {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Español", callback_data: "language_es" }],
            [{ text: "English", callback_data: "language_en" }],
          ],
        },
      };

      bot.sendMessage(
        chatId,
        "¡Bienvenido! Por favor, elige tu idioma:",
        languageOptions
      );

      // Manejar selección del idioma
      bot.on("callback_query", (query) => {
        const selectedLanguage = query.data?.split("_")[1];

        if (selectedLanguage) {
          db.updateLanguage(chatId, selectedLanguage);

          // Después de seleccionar el idioma, preguntar por la zona horaria
          const timezoneOptions = {
            reply_markup: {
              inline_keyboard: [
                // Agrupamos los botones en filas horizontales (de 4 botones por fila)
                [
                  { text: "GMT-12", callback_data: "timezone_GMT-12" },
                  { text: "GMT-11", callback_data: "timezone_GMT-11" },
                  { text: "GMT-10", callback_data: "timezone_GMT-10" },
                  { text: "GMT-9", callback_data: "timezone_GMT-9" },
                ],
                [
                  { text: "GMT-8", callback_data: "timezone_GMT-8" },
                  { text: "GMT-7", callback_data: "timezone_GMT-7" },
                  { text: "GMT-6", callback_data: "timezone_GMT-6" },
                  { text: "GMT-5", callback_data: "timezone_GMT-5" },
                ],
                [
                  { text: "GMT-4", callback_data: "timezone_GMT-4" },
                  { text: "GMT-3", callback_data: "timezone_GMT-3" },
                  { text: "GMT-2", callback_data: "timezone_GMT-2" },
                  { text: "GMT-1", callback_data: "timezone_GMT-1" },
                ],
                [
                  { text: "GMT+0", callback_data: "timezone_GMT+0" },
                  { text: "GMT+1", callback_data: "timezone_GMT+1" },
                  { text: "GMT+2", callback_data: "timezone_GMT+2" },
                  { text: "GMT+3", callback_data: "timezone_GMT+3" },
                ],
                [
                  { text: "GMT+4", callback_data: "timezone_GMT+4" },
                  { text: "GMT+5", callback_data: "timezone_GMT+5" },
                  { text: "GMT+6", callback_data: "timezone_GMT+6" },
                  { text: "GMT+7", callback_data: "timezone_GMT+7" },
                ],
                [
                  { text: "GMT+8", callback_data: "timezone_GMT+8" },
                  { text: "GMT+9", callback_data: "timezone_GMT+9" },
                  { text: "GMT+10", callback_data: "timezone_GMT+10" },
                  { text: "GMT+11", callback_data: "timezone_GMT+11" },
                ],
                [
                  { text: "GMT+12", callback_data: "timezone_GMT+12" },
                  { text: "GMT+13", callback_data: "timezone_GMT+13" },
                  { text: "GMT+14", callback_data: "timezone_GMT+14" },
                ],
              ],
            },
          };

          bot.sendMessage(
            chatId,
            "Ahora, por favor, elige tu zona horaria:",
            timezoneOptions
          );

          // Manejar selección de la zona horaria
          bot.on("callback_query", (query) => {
            const selectedTimezone = query.data?.split("_")[1];

            if (selectedTimezone) {
              db.updateTimezone(chatId, selectedTimezone);

              // Guardar los datos del usuario
              const newUser: User = {
                chatId,
                language: selectedLanguage,
                timezone: selectedTimezone,
              };
              db.saveUser(newUser);

              bot.sendMessage(
                chatId,
                `✅ Usuario registrado con éxito.\nIdioma: ${selectedLanguage}\nZona horaria: ${selectedTimezone}\n\nComandos disponibles:\n/start - Ver este mensaje\n/add - Agregar tarea\n/list - Listar tareas\n/delete - Eliminar tarea\n\nCrea tareas con recordatorios automáticos!`
              );
            }
          });
        }
      });
    }
  });
};
