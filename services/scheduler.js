import cron from "node-cron"
import config from "../config.js"
import { userDb } from "../database.js"
import { getCurrencyRates, getMetalsRates } from "./api.js"
import { t } from "../locales/index.js"

export function startScheduler(bot) {
  cron.schedule("0 6,18 * * *", async () => {
    console.log("Updating currency and metals cache from API...")

    try {
      // Force refresh from API
      await getCurrencyRates(true)
      await getMetalsRates(true)
      console.log("Cache updated successfully")
    } catch (error) {
      console.error("Error updating cache:", error.message)
    }
  })

  // Schedule daily notifications at 10:00 AM
  cron.schedule(config.NOTIFICATION_TIME, async () => {
    console.log("Sending daily notifications...")

    const users = userDb.getNotificationUsers()
    const currencies = await getCurrencyRates()
    const metals = await getMetalsRates()

    for (const user of users) {
      try {
        const date = new Date().toLocaleDateString("uz-UZ")
        let message = t(user.language, "dailyNotification", { date }) + "\n\n"

        // Add popular currencies
        message += "💱 Valyuta kurslari:\n"
        message += `USD: ${currencies.USD?.toFixed(2)} so'm\n`
        message += `EUR: ${currencies.EUR?.toFixed(2)} so'm\n`
        message += `RUB: ${currencies.RUB?.toFixed(2)} so'm\n\n`

        // Add metals
        message += "💎 Qimmatli metallar (1g):\n"
        message += `Oltin: ${metals.gold?.toFixed(2)} so'm\n`
        message += `Kumush: ${metals.silver?.toFixed(2)} so'm\n`
        message += `Mis: ${metals.copper?.toFixed(2)} so'm\n`

        await bot.sendMessage(user.user_id, message)
      } catch (error) {
        console.error(`Error sending notification to ${user.user_id}:`, error.message)
      }
    }
  })

  console.log("Scheduler started:")
  console.log("- API updates: 6:00 AM and 6:00 PM daily")
  console.log("- User notifications: 10:00 AM daily")
}
