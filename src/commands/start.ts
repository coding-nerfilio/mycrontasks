import TelegramBot from "node-telegram-bot-api";

export const handleStart = (bot: TelegramBot) => {
  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(
      msg.chat.id,
      `Bienvenido a tu asistente de tareas! 📌\n\nComandos disponibles:\n/start - Ver este mensaje\n/add - Agregar tarea\n/list - Listar tareas\n/delete - Eliminar tarea\n\nCrea tareas con recordatorios automáticos!`
    );
  });
};
