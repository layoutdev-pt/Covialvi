import { Locale, defaultLocale } from '@/i18n';

// Property field translations - for dynamic content that comes from the database
// This allows properties to have translated titles and descriptions

export interface PropertyTranslations {
  title?: Record<Locale, string>;
  description?: Record<Locale, string>;
}

// Get translated property field with fallback to default locale
export function getTranslatedField(
  translations: PropertyTranslations | null | undefined,
  field: keyof PropertyTranslations,
  locale: Locale,
  fallback: string
): string {
  if (!translations || !translations[field]) {
    return fallback;
  }
  
  const fieldTranslations = translations[field];
  if (!fieldTranslations) {
    return fallback;
  }
  
  // Try requested locale first
  if (fieldTranslations[locale]) {
    return fieldTranslations[locale];
  }
  
  // Fall back to default locale (Portuguese)
  if (fieldTranslations[defaultLocale]) {
    return fieldTranslations[defaultLocale];
  }
  
  // Fall back to any available translation
  const availableLocales = Object.keys(fieldTranslations) as Locale[];
  if (availableLocales.length > 0) {
    return fieldTranslations[availableLocales[0]] || fallback;
  }
  
  return fallback;
}

// Static translations for property-related labels
export const propertyLabels = {
  businessTypes: {
    pt: { sale: 'Venda', rent: 'Arrendamento', transfer: 'Trespasse' },
    en: { sale: 'Sale', rent: 'Rent', transfer: 'Transfer' },
    es: { sale: 'Venta', rent: 'Alquiler', transfer: 'Traspaso' },
    fr: { sale: 'Vente', rent: 'Location', transfer: 'Cession' },
    de: { sale: 'Verkauf', rent: 'Miete', transfer: 'Übertragung' },
    it: { sale: 'Vendita', rent: 'Affitto', transfer: 'Cessione' },
  },
  natures: {
    pt: { apartment: 'Apartamento', house: 'Moradia', land: 'Terreno', commercial: 'Comercial', warehouse: 'Armazém', office: 'Escritório', garage: 'Garagem', shop: 'Loja' },
    en: { apartment: 'Apartment', house: 'House', land: 'Land', commercial: 'Commercial', warehouse: 'Warehouse', office: 'Office', garage: 'Garage', shop: 'Shop' },
    es: { apartment: 'Apartamento', house: 'Casa', land: 'Terreno', commercial: 'Comercial', warehouse: 'Almacén', office: 'Oficina', garage: 'Garaje', shop: 'Tienda' },
    fr: { apartment: 'Appartement', house: 'Maison', land: 'Terrain', commercial: 'Commercial', warehouse: 'Entrepôt', office: 'Bureau', garage: 'Garage', shop: 'Boutique' },
    de: { apartment: 'Wohnung', house: 'Haus', land: 'Grundstück', commercial: 'Gewerbe', warehouse: 'Lager', office: 'Büro', garage: 'Garage', shop: 'Geschäft' },
    it: { apartment: 'Appartamento', house: 'Casa', land: 'Terreno', commercial: 'Commerciale', warehouse: 'Magazzino', office: 'Ufficio', garage: 'Garage', shop: 'Negozio' },
  },
  constructionStatus: {
    pt: { new: 'Novo', used: 'Usado', under_construction: 'Em Construção', to_recover: 'Para Recuperar', renovated: 'Renovado' },
    en: { new: 'New', used: 'Used', under_construction: 'Under Construction', to_recover: 'To Renovate', renovated: 'Renovated' },
    es: { new: 'Nuevo', used: 'Usado', under_construction: 'En Construcción', to_recover: 'Para Reformar', renovated: 'Renovado' },
    fr: { new: 'Neuf', used: 'Occasion', under_construction: 'En Construction', to_recover: 'À Rénover', renovated: 'Rénové' },
    de: { new: 'Neu', used: 'Gebraucht', under_construction: 'Im Bau', to_recover: 'Zu Renovieren', renovated: 'Renoviert' },
    it: { new: 'Nuovo', used: 'Usato', under_construction: 'In Costruzione', to_recover: 'Da Ristrutturare', renovated: 'Ristrutturato' },
  },
  details: {
    pt: { bedrooms: 'Quartos', bathrooms: 'Casas de Banho', area: 'Área', price: 'Preço', priceOnRequest: 'Sob Consulta' },
    en: { bedrooms: 'Bedrooms', bathrooms: 'Bathrooms', area: 'Area', price: 'Price', priceOnRequest: 'Price on Request' },
    es: { bedrooms: 'Habitaciones', bathrooms: 'Baños', area: 'Área', price: 'Precio', priceOnRequest: 'Precio a Consultar' },
    fr: { bedrooms: 'Chambres', bathrooms: 'Salles de Bain', area: 'Surface', price: 'Prix', priceOnRequest: 'Prix sur Demande' },
    de: { bedrooms: 'Schlafzimmer', bathrooms: 'Badezimmer', area: 'Fläche', price: 'Preis', priceOnRequest: 'Preis auf Anfrage' },
    it: { bedrooms: 'Camere', bathrooms: 'Bagni', area: 'Superficie', price: 'Prezzo', priceOnRequest: 'Prezzo su Richiesta' },
  },
} as const;

// Helper to get label for a specific locale
export function getPropertyLabel(
  category: keyof typeof propertyLabels,
  key: string,
  locale: Locale
): string {
  const categoryLabels = propertyLabels[category];
  const localeLabels = categoryLabels[locale] || categoryLabels[defaultLocale];
  return (localeLabels as Record<string, string>)[key] || key;
}

// Format price with locale-specific formatting
export function formatPrice(price: number | null, locale: Locale, priceOnRequest: boolean = false): string {
  if (priceOnRequest || price === null) {
    return getPropertyLabel('details', 'priceOnRequest', locale);
  }
  
  const currencyFormats: Record<Locale, { locale: string; currency: string }> = {
    pt: { locale: 'pt-PT', currency: 'EUR' },
    en: { locale: 'en-GB', currency: 'EUR' },
    es: { locale: 'es-ES', currency: 'EUR' },
    fr: { locale: 'fr-FR', currency: 'EUR' },
    de: { locale: 'de-DE', currency: 'EUR' },
    it: { locale: 'it-IT', currency: 'EUR' },
  };
  
  const format = currencyFormats[locale] || currencyFormats[defaultLocale];
  
  return new Intl.NumberFormat(format.locale, {
    style: 'currency',
    currency: format.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Format area with locale-specific formatting
export function formatArea(area: number | null, locale: Locale): string {
  if (area === null) return '-';
  
  const numberFormats: Record<Locale, string> = {
    pt: 'pt-PT',
    en: 'en-GB',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    it: 'it-IT',
  };
  
  const format = numberFormats[locale] || numberFormats[defaultLocale];
  
  return `${new Intl.NumberFormat(format).format(area)} m²`;
}
