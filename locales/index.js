import uz from "./uz.js"
import en from "./en.js"
import ru from "./ru.js"

const locales = { uz, en, ru }

export function t(lang, key, params = {}) {
  let translation

  if (key.includes(".")) {
    const keys = key.split(".")
    translation = locales[lang]

    for (const k of keys) {
      translation = translation?.[k]
    }

    // Fallback to uz if not found
    if (!translation) {
      translation = locales["uz"]
      for (const k of keys) {
        translation = translation?.[k]
      }
    }

    translation = translation || key
  } else {
    translation = locales[lang]?.[key] || locales["uz"][key] || key
  }

  // Replace parameters
  if (typeof translation === "string") {
    return translation.replace(/\{(\w+)\}/g, (match, param) => {
      return params[param] !== undefined ? params[param] : match
    })
  }

  return translation
}

export default locales
