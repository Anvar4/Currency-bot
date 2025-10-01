import TelegramBot from "node-telegram-bot-api"
import config from "./config.js"
import { userDb } from "./database.js"
import { t } from "./locales/index.js"
import * as keyboards from "./keyboards.js"
import { getCurrencyRates, getMetalsRates, convertCurrency, convertMetal } from "./services/api.js"
import { startScheduler } from "./services/scheduler.js"

const bot = new TelegramBot(config.BOT_TOKEN, { polling: true })

// User states for conversation flow
const userStates = new Map()

// Start scheduler
startScheduler(bot)

// Helper function to get user language
function getUserLang(userId) {
  const user = userDb.get(userId)
  return user?.language || "uz"
}

// Helper function to format number
function formatNumber(num) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

// /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id
  const userId = msg.from.id

  if (userDb.exists(userId)) {
    const user = userDb.get(userId)
    bot.sendMessage(chatId, t(user.language, "mainMenu"), keyboards.mainMenuKeyboard(user.language))
  } else {
    bot.sendMessage(chatId, t("uz", "welcome"))
    bot.sendMessage(chatId, t("uz", "selectLanguage"), keyboards.languageKeyboard())
    userStates.set(userId, { step: "language" })
  }
})

// Handle messages
bot.on("message", async (msg) => {
  const chatId = msg.chat.id
  const userId = msg.from.id
  const text = msg.text

  // Skip commands
  if (text?.startsWith("/")) return

  const state = userStates.get(userId)
  const lang = getUserLang(userId)

  if (text.includes("Orqaga") || text.includes("Back") || text.includes("Назад")) {
    // If in settings sub-menu, go back to settings
    if (state?.step === "change_name" || state?.step === "change_language") {
      userStates.delete(userId)
      bot.sendMessage(chatId, t(lang, "settingsMenu"), keyboards.settingsKeyboard(lang))
      return
    }
    // If in currency/metal selection, go back to main menu
    if (
      state?.step === "select_currency" ||
      state?.step === "currency_amount" ||
      state?.step === "select_metal" ||
      state?.step === "metal_grams"
    ) {
      userStates.delete(userId)
      bot.sendMessage(chatId, t(lang, "mainMenu"), keyboards.mainMenuKeyboard(lang))
      return
    }
  }

  // Language selection
  if (state?.step === "language") {
    let selectedLang = "uz"
    if (text.includes("English")) selectedLang = "en"
    else if (text.includes("Русский")) selectedLang = "ru"

    userStates.set(userId, { step: "name", language: selectedLang })
    bot.sendMessage(chatId, t(selectedLang, "enterName"), { reply_markup: { remove_keyboard: true } })
    return
  }

  // Name input
  if (state?.step === "name") {
    const name = text.trim()
    const language = state.language || "uz"

    userDb.create(userId, name, language)
    userStates.delete(userId)

    bot.sendMessage(chatId, t(language, "nameSet", { name }))
    bot.sendMessage(chatId, t(language, "mainMenu"), keyboards.mainMenuKeyboard(language))
    return
  }

  // Change name flow
  if (state?.step === "change_name") {
    const newName = text.trim()
    userDb.updateName(userId, newName)
    userStates.delete(userId)

    bot.sendMessage(chatId, t(lang, "nameSet", { name: newName }))
    bot.sendMessage(chatId, t(lang, "settingsMenu"), keyboards.settingsKeyboard(lang))
    return
  }

  // Currency calculator flow
  if (state?.step === "currency_amount") {
    const amount = Number.parseFloat(text)

    if (isNaN(amount) || amount <= 0) {
      bot.sendMessage(chatId, t(lang, "invalidAmount"))
      return
    }

    const currencies = await getCurrencyRates()
    const rate = currencies[state.currency]
    const result = convertCurrency(amount, rate)

    bot.sendMessage(
      chatId,
      t(lang, "calculationResult", {
        amount: formatNumber(amount),
        currency: state.currency,
        result: formatNumber(result),
      }),
      keyboards.mainMenuKeyboard(lang),
    )

    userStates.delete(userId)
    return
  }

  // Metals calculator flow
  if (state?.step === "metal_grams") {
    const grams = Number.parseFloat(text)

    if (isNaN(grams) || grams <= 0) {
      bot.sendMessage(chatId, t(lang, "invalidAmount"))
      return
    }

    const metals = await getMetalsRates()
    const metalKey = state.metal
    const pricePerGram = metals[metalKey]
    const result = convertMetal(grams, pricePerGram)

    const metalNames = {
      gold: { uz: "Oltin", en: "Gold", ru: "Золото" },
      silver: { uz: "Kumush", en: "Silver", ru: "Серебро" },
      copper: { uz: "Mis", en: "Copper", ru: "Медь" },
      platinum: { uz: "Platina", en: "Platinum", ru: "Платина" },
      palladium: { uz: "Palladiy", en: "Palladium", ru: "Палладий" },
    }

    bot.sendMessage(
      chatId,
      t(lang, "metalCalculation", {
        grams: formatNumber(grams),
        metal: metalNames[metalKey][lang],
        result: formatNumber(result),
      }),
      keyboards.mainMenuKeyboard(lang),
    )

    userStates.delete(userId)
    return
  }

  // Main menu handlers
  if (text.includes("Valyuta kursi") || text.includes("Currency Rates") || text.includes("Курсы валют")) {
    const currencies = await getCurrencyRates()

    let message = t(lang, "currencyRatesTitle", { currency: "" }) + "\n\n"
    message += t(lang, "popularCurrencies") + "\n\n"

    const popular = ["USD", "EUR", "RUB", "GBP", "JPY", "CNY", "KZT", "TRY"]

    for (const curr of popular) {
      if (currencies[curr]) {
        const fullName = t(lang, `currencyNames.${curr}`)
        message += `${fullName} (${curr}): ${formatNumber(currencies[curr])} so'm\n`
      }
    }

    bot.sendMessage(chatId, message, keyboards.mainMenuKeyboard(lang))
  } else if (
    text.includes("Valyuta kalkulyatori") ||
    text.includes("Currency Calculator") ||
    text.includes("Калькулятор валют")
  ) {
    bot.sendMessage(chatId, t(lang, "selectCurrency"), keyboards.currencyKeyboard())
    userStates.set(userId, { step: "select_currency" })
  } else if (state?.step === "select_currency") {
    const currencyMatch = text.match(/[A-Z]{3}/)
    if (currencyMatch) {
      const currency = currencyMatch[0]
      userStates.set(userId, { step: "currency_amount", currency })
      bot.sendMessage(chatId, t(lang, "enterAmount"), keyboards.backKeyboard(lang))
    }
  } else if (
    text.includes("Qimmatli metallar") ||
    text.includes("Precious Metals") ||
    text.includes("Драгоценные металлы")
  ) {
    const metals = await getMetalsRates()

    let message = t(lang, "metalsRatesTitle") + "\n\n"

    const metalsList = [
      { key: "gold", emoji: "🥇" },
      { key: "silver", emoji: "🥈" },
      { key: "copper", emoji: "🟤" },
      { key: "platinum", emoji: "💎" },
      { key: "palladium", emoji: "⚪" },
    ]

    for (const metal of metalsList) {
      if (metals[metal.key]) {
        const fullName = t(lang, `metalNames.${metal.key}`)
        message += `${metal.emoji} ${fullName}: ${formatNumber(metals[metal.key])} so'm/g\n`
      }
    }

    bot.sendMessage(chatId, message, keyboards.mainMenuKeyboard(lang))
  } else if (
    text.includes("Metallar kalkulyatori") ||
    text.includes("Metals Calculator") ||
    text.includes("Калькулятор металлов")
  ) {
    bot.sendMessage(chatId, t(lang, "selectMetal"), keyboards.metalsKeyboard())
    userStates.set(userId, { step: "select_metal" })
  } else if (state?.step === "select_metal") {
    let metalKey = null
    if (text.includes("Oltin") || text.includes("Gold") || text.includes("Золото")) metalKey = "gold"
    else if (text.includes("Kumush") || text.includes("Silver") || text.includes("Серебро")) metalKey = "silver"
    else if (text.includes("Mis") || text.includes("Copper") || text.includes("Медь")) metalKey = "copper"
    else if (text.includes("Platina") || text.includes("Platinum") || text.includes("Платина")) metalKey = "platinum"
    else if (text.includes("Palladiy") || text.includes("Palladium") || text.includes("Палладий"))
      metalKey = "palladium"

    if (metalKey) {
      userStates.set(userId, { step: "metal_grams", metal: metalKey })
      bot.sendMessage(chatId, t(lang, "enterGrams"), keyboards.backKeyboard(lang))
    }
  } else if (text.includes("Sozlamalar") || text.includes("Settings") || text.includes("Настройки")) {
    bot.sendMessage(chatId, t(lang, "settingsMenu"), keyboards.settingsKeyboard(lang))
  } else if (text.includes("Ismni o'zgartirish") || text.includes("Change Name") || text.includes("Изменить имя")) {
    userStates.set(userId, { step: "change_name" })
    bot.sendMessage(chatId, t(lang, "enterName"), keyboards.backKeyboard(lang))
  } else if (
    text.includes("Tilni o'zgartirish") ||
    text.includes("Change Language") ||
    text.includes("Изменить язык")
  ) {
    bot.sendMessage(chatId, t(lang, "selectLanguage"), keyboards.languageKeyboard())
    userStates.set(userId, { step: "change_language" })
  } else if (state?.step === "change_language") {
    let selectedLang = "uz"
    if (text.includes("English")) selectedLang = "en"
    else if (text.includes("Русский")) selectedLang = "ru"

    userDb.updateLanguage(userId, selectedLang)
    userStates.delete(userId)

    bot.sendMessage(chatId, t(selectedLang, "settingsMenu"), keyboards.settingsKeyboard(selectedLang))
  } else if (text.includes("Bildirishnomalar") || text.includes("Notifications") || text.includes("Уведомления")) {
    userDb.toggleNotifications(userId)
    const user = userDb.get(userId)
    const message = user.notifications_enabled ? t(lang, "notificationsOn") : t(lang, "notificationsOff")
    bot.sendMessage(chatId, message, keyboards.settingsKeyboard(lang))
  } else if (text.includes("Dasturchi haqida") || text.includes("About Developer") || text.includes("О разработчике")) {
    bot.sendMessage(chatId, t(lang, "aboutText"), keyboards.settingsKeyboard(lang))
  } else if (text.includes("Asosiy menyu") || text.includes("Main Menu") || text.includes("Главное меню")) {
    userStates.delete(userId)
    bot.sendMessage(chatId, t(lang, "mainMenu"), keyboards.mainMenuKeyboard(lang))
  }
})

// Error handling
bot.on("polling_error", (error) => {
  console.error("Polling error:", error.message)
})

console.log("✅ Bot started successfully!")
console.log("⚡ Ready to respond in milliseconds!")
