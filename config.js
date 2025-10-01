import dotenv from "dotenv"
dotenv.config()

export default {
  BOT_TOKEN: process.env.BOT_TOKEN,
  METALS_API: process.env.METALS_API,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  NOTIFICATION_TIME: "0 10 * * *", // 10:00 AM every day
  SUPPORTED_LANGUAGES: ["uz", "en", "ru"],
  DEFAULT_LANGUAGE: "uz",
}
