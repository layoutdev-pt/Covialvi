import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export const locales = ['pt', 'en', 'es', 'fr', 'de', 'it'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'pt';

export const localeNames: Record<Locale, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
};

export const localeFlags: Record<Locale, string> = {
  pt: '🇵🇹',
  en: '🇬🇧',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  it: '🇮🇹',
};

async function getLocale(): Promise<Locale> {
  try {
    // First check for user preference in cookie
    const cookieStore = cookies();
    const localeCookie = cookieStore.get('NEXT_LOCALE');
    if (localeCookie && locales.includes(localeCookie.value as Locale)) {
      return localeCookie.value as Locale;
    }

    // Fall back to IP detection
    const headersList = headers();
    const country = headersList.get('x-vercel-ip-country') || 
                    headersList.get('cf-ipcountry') || 
                    'PT';
    
    const countryToLocale: Record<string, Locale> = {
      PT: 'pt',
      BR: 'pt',
      AO: 'pt',
      MZ: 'pt',
      ES: 'es',
      AR: 'es',
      MX: 'es',
      CO: 'es',
      FR: 'fr',
      BE: 'fr',
      CH: 'fr',
      CA: 'fr',
      US: 'en',
      GB: 'en',
      IE: 'en',
      AU: 'en',
      NZ: 'en',
      DE: 'de',
      AT: 'de',
      IT: 'it',
    };

    return countryToLocale[country] || defaultLocale;
  } catch {
    return defaultLocale;
  }
}

export default getRequestConfig(async () => {
  const locale = await getLocale();

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
