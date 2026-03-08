import { getRequestConfig } from 'next-intl/server'
import { defaultLocale, locales, type Locale } from './config'

export default getRequestConfig(async (params) => {
  // next-intl 3.22+ uses requestLocale (Promise); older v3 passed locale directly
  let locale: string
  try {
    const reqLocale = (params as any).requestLocale
    locale = reqLocale
      ? (await reqLocale) ?? defaultLocale
      : (params as any).locale ?? defaultLocale
  } catch {
    locale = defaultLocale
  }

  // Validate that locale is in the supported list
  if (!locales.includes(locale as Locale)) {
    locale = defaultLocale
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
