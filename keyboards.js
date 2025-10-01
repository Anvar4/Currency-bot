export function languageKeyboard() {
  return {
    reply_markup: {
      keyboard: [[{ text: "🇺🇿 O'zbek" }, { text: "🇬🇧 English" }], [{ text: "🇷🇺 Русский" }]],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  }
}

export function mainMenuKeyboard(lang) {
  const buttons = {
    uz: [
      [{ text: "💱 Valyuta kursi" }, { text: "🧮 Valyuta kalkulyatori" }],
      [{ text: "💎 Qimmatli metallar" }, { text: "⚖️ Metallar kalkulyatori" }],
      [{ text: "⚙️ Sozlamalar" }],
    ],
    en: [
      [{ text: "💱 Currency Rates" }, { text: "🧮 Currency Calculator" }],
      [{ text: "💎 Precious Metals" }, { text: "⚖️ Metals Calculator" }],
      [{ text: "⚙️ Settings" }],
    ],
    ru: [
      [{ text: "💱 Курсы валют" }, { text: "🧮 Калькулятор валют" }],
      [{ text: "💎 Драгоценные металлы" }, { text: "⚖️ Калькулятор металлов" }],
      [{ text: "⚙️ Настройки" }],
    ],
  }

  return {
    reply_markup: {
      keyboard: buttons[lang] || buttons["uz"],
      resize_keyboard: true,
    },
  }
}

export function currencyKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        [{ text: "USD 🇺🇸" }, { text: "EUR 🇪🇺" }, { text: "RUB 🇷🇺" }],
        [{ text: "GBP 🇬🇧" }, { text: "JPY 🇯🇵" }, { text: "CNY 🇨🇳" }],
        [{ text: "KZT 🇰🇿" }, { text: "TRY 🇹🇷" }, { text: "AED 🇦🇪" }],
        [{ text: "◀️ Orqaga" }],
      ],
      resize_keyboard: true,
    },
  }
}

export function metalsKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        [{ text: "🥇 Oltin" }, { text: "🥈 Kumush" }],
        [{ text: "🟤 Mis" }, { text: "💎 Platina" }],
        [{ text: "⚪ Palladiy" }],
        [{ text: "◀️ Orqaga" }],
      ],
      resize_keyboard: true,
    },
  }
}

export function settingsKeyboard(lang) {
  const buttons = {
    uz: [
      [{ text: "👤 Ismni o'zgartirish" }],
      [{ text: "🌐 Tilni o'zgartirish" }],
      [{ text: "🔔 Bildirishnomalar" }],
      [{ text: "👨‍💻 Dasturchi haqida" }],
      [{ text: "🏠 Asosiy menyu" }],
    ],
    en: [
      [{ text: "👤 Change Name" }],
      [{ text: "🌐 Change Language" }],
      [{ text: "🔔 Notifications" }],
      [{ text: "👨‍💻 About Developer" }],
      [{ text: "🏠 Main Menu" }],
    ],
    ru: [
      [{ text: "👤 Изменить имя" }],
      [{ text: "🌐 Изменить язык" }],
      [{ text: "🔔 Уведомления" }],
      [{ text: "👨‍💻 О разработчике" }],
      [{ text: "🏠 Главное меню" }],
    ],
  }

  return {
    reply_markup: {
      keyboard: buttons[lang] || buttons["uz"],
      resize_keyboard: true,
    },
  }
}

export function backKeyboard(lang = "uz") {
  const text = {
    uz: "◀️ Orqaga",
    en: "◀️ Back",
    ru: "◀️ Назад",
  }

  return {
    reply_markup: {
      keyboard: [[{ text: text[lang] }]],
      resize_keyboard: true,
    },
  }
}
