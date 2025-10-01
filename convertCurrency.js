const axios = require('axios');
const NodeCache = require('node-cache');

// Kesh sozlamasi (1 soatlik TTL)
const cache = new NodeCache({ stdTTL: 3600 });

// Valyuta kodlarini validatsiya qilish uchun ro‘yxat
const validCurrencies = ['USD', 'EUR', 'UZS', 'RUB', 'GBP', 'JPY', 'CNY', 'KZT'];

async function convertCurrency(amount, from, to) {
  // API kalitini tekshirish
  if (!process.env.API_KEY) {
    return {
      success: false,
      message: 'API kaliti sozlanmagan. Administrator bilan bog‘laning.',
    };
  }

  // Valyuta kodlarini validatsiya qilish
  from = from.toUpperCase();
  to = to.toUpperCase();
  if (!validCurrencies.includes(from) || !validCurrencies.includes(to)) {
    return {
      success: false,
      message: 'Noto‘g‘ri valyuta kodi. Masalan: USD, EUR, UZS.',
    };
  }

  // Miqdor validatsiyasi
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return {
      success: false,
      message: 'Iltimos, haqiqiy musbat son kiriting.',
    };
  }

  // Keshdan tekshirish
  const cacheKey = `${from}_${to}`;
  const cachedRate = cache.get(cacheKey);
  if (cachedRate) {
    return {
      success: true,
      converted: parsedAmount * cachedRate,
      rate: cachedRate,
      fromCache: true,
    };
  }

  try {
    const url = `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${parsedAmount}&access_key=${process.env.API_KEY}`;
    const res = await axios.get(url);

    if (res.data.success === false || res.data.result === undefined) {
      return {
        success: false,
        message: res.data?.error?.info || 'Valyuta maʼlumotlari topilmadi.',
      };
    }

    // Kursni keshlash
    const rate = res.data.info?.rate;
    if (rate) {
      cache.set(cacheKey, rate);
    }

    return {
      success: true,
      converted: res.data.result,
      rate: rate,
      date: res.data.date,
      fromCache: false,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Xatolik yuz berdi. Iltimos, keyinroq urinib ko‘ring.',
    };
  }
}

module.exports = convertCurrency;