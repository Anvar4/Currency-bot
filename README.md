# 💱 Valyuta Konvertor Bot

Professional Telegram bot for currency and precious metals conversion with real-time rates.

## ✨ Features

- 🌍 Multi-language support (Uzbek, English, Russian)
- 💱 Real-time currency rates (50+ currencies)
- 💎 Precious metals prices (Gold, Silver, Copper, Platinum, Palladium)
- 🧮 Currency and metals calculators
- 🔔 Daily automatic notifications at 10:00 AM
- ⚡ Lightning-fast responses (milliseconds)
- 💾 User preferences storage
- 🎯 Intuitive keyboard interface

## 🚀 Installation

1. Clone the repository
2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create `.env` file:
\`\`\`env
BOT_TOKEN=your_telegram_bot_token
METALS_API=your_metals_api_key
\`\`\`

4. Start the bot:
\`\`\`bash
npm start
\`\`\`

For development with auto-reload:
\`\`\`bash
npm run dev
\`\`\`

## 📋 Requirements

- Node.js 18+
- Telegram Bot Token (from @BotFather)
- Metals.dev API Key (from https://metals.dev)

## 🏗️ Project Structure

\`\`\`
├── index.js              # Main bot file
├── config.js             # Configuration
├── database.js           # SQLite database
├── keyboards.js          # Telegram keyboards
├── locales/              # Translations
│   ├── uz.js
│   ├── en.js
│   ├── ru.js
│   └── index.js
└── services/
    ├── api.js            # API calls with caching
    └── scheduler.js      # Daily notifications
\`\`\`

## 🎯 Usage

1. Start the bot: `/start`
2. Select your language
3. Enter your name
4. Use the menu to:
   - View currency rates
   - Calculate currency conversions
   - Check precious metals prices
   - Calculate metal values
   - Manage settings

## ⚙️ Settings

- 👤 Change name
- 🌐 Change language
- 🔔 Toggle daily notifications
- 👨‍💻 About developer

## 🔔 Notifications

Enable daily notifications to receive automatic updates at 10:00 AM with:
- Popular currency rates (USD, EUR, RUB)
- Precious metals prices (Gold, Silver, Copper)

## 🚀 Performance

- ⚡ Response time: < 100ms (cached data)
- 💾 Smart caching: 5-minute cache duration
- 🔄 Automatic cache refresh
- 📊 Efficient database queries

## 📝 License

MIT

## 👨‍💻 Developer

Created with ❤️ by a professional developer Ko'charov Anvar
