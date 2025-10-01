import axios from "axios"
import fs from "fs"
import path from "path"
import config from "../config.js"

const CACHE_FILE = path.join(process.cwd(), "cache.json")

function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, "utf8")
      return JSON.parse(data)
    }
  } catch (error) {
    console.error("Error loading cache:", error.message)
  }
  return {
    currencies: { data: null, timestamp: 0 },
    metals: { data: null, timestamp: 0 },
  }
}

function saveCache(cache) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2))
  } catch (error) {
    console.error("Error saving cache:", error.message)
  }
}

const cache = loadCache()

function isCacheValid(timestamp) {
  return Date.now() - timestamp < 12 * 60 * 60 * 1000
}

export async function getCurrencyRates(forceRefresh = false) {
  // Return cached data if valid and not forcing refresh
  if (!forceRefresh && isCacheValid(cache.currencies.timestamp)) {
    return cache.currencies.data
  }

  try {
    const response = await axios.get(`https://api.metals.dev/v1/latest?api_key=${config.METALS_API}&currency=UZS`)

    cache.currencies.data = response.data.currencies
    cache.currencies.timestamp = Date.now()

    saveCache(cache)

    return cache.currencies.data
  } catch (error) {
    console.error("Error fetching currency rates:", error.message)
    // Return cached data even if expired
    return cache.currencies.data || {}
  }
}

export async function getMetalsRates(forceRefresh = false) {
  // Return cached data if valid and not forcing refresh
  if (!forceRefresh && isCacheValid(cache.metals.timestamp)) {
    return cache.metals.data
  }

  try {
    const response = await axios.get(
      `https://api.metals.dev/v1/latest?api_key=${config.METALS_API}&currency=UZS&unit=g`,
    )

    cache.metals.data = response.data.metals
    cache.metals.timestamp = Date.now()

    saveCache(cache)

    return cache.metals.data
  } catch (error) {
    console.error("Error fetching metals rates:", error.message)
    // Return cached data even if expired
    return cache.metals.data || {}
  }
}

export function convertCurrency(amount, rate) {
  return (amount * rate).toFixed(2)
}

export function convertMetal(grams, pricePerGram) {
  return (grams * pricePerGram).toFixed(2)
}

console.log("Cache loaded from file")
