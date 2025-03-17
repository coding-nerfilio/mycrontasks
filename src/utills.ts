import TelegramBot from "node-telegram-bot-api";
import UserDatabase, { User } from "./bd/user";
import i18next from "./locales/i18n";
const timezoneMapping: { [key: string]: string } = {
  "GMT+0": "UTC",
  "GMT+1": "Europe/Paris",
  "GMT+2": "Europe/Athens",
  "GMT+3": "Europe/Moscow", // O puedes usar "America/Argentina/Buenos_Aires"
  "GMT+4": "Asia/Muscat",
  "GMT+5": "Asia/Karachi",
  "GMT+6": "Asia/Almaty",
  "GMT+7": "Asia/Bangkok",
  "GMT+8": "Asia/Singapore",
  "GMT+9": "Asia/Tokyo",
  "GMT+10": "Australia/Sydney",
  "GMT+11": "Pacific/Noumea",
  "GMT+12": "Pacific/Fiji",
  "GMT-1": "Atlantic/Azores",
  "GMT-2": "Atlantic/South_Georgia",
  "GMT-3": "America/Argentina/Buenos_Aires", // O "America/Sao_Paulo"
  "GMT-4": "America/Caracas",
  "GMT-5": "America/New_York",
  "GMT-6": "America/Chicago",
  "GMT-7": "America/Denver",
  "GMT-8": "America/Los_Angeles",
  "GMT-9": "America/Anchorage",
  "GMT-10": "Pacific/Honolulu",
  "GMT-11": "Pacific/Midway",
  "GMT-12": "Pacific/Kwajalein",
};
export function getTimezoneFromGMT(gmt: string): string {
  return timezoneMapping[gmt] || "UTC"; // Devuelve UTC si no se encuentra la zona horaria
}
export function userIsRegistered(
  bot: TelegramBot,
  userDb: UserDatabase,
  chatId: number
): User | null {
  const user = userDb.getUser(chatId);
  if (!user) {
    bot.sendMessage(chatId, i18next.t("not_registered"));
    return null;
  }
  return user;
}
