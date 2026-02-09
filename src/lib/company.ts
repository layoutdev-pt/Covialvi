/**
 * Canonical company contact details.
 * Single source of truth — import this wherever contacts are needed.
 */

export const company = {
  name: 'Covialvi - Construções, Lda.',
  shortName: 'Covialvi',
  tradeName: 'Covialvi Imobiliária',
  email: 'covialvi@gmail.com',
  phone: '+351 967 138 116',
  phoneTel: '+351967138116',
  landline: '+351 275 971 394',
  landlineTel: '+351275971394',
  address: {
    street: 'Parque Industrial do Tortosendo',
    detail: 'Lote 75 – Rua E',
    postalCode: '6200-683',
    locality: 'Tortosendo',
    district: 'Castelo Branco',
    country: 'PT',
    /** One-liner for compact usage */
    full: 'Parque Industrial do Tortosendo, Lote 75 – Rua E, 6200-683 Tortosendo',
  },
  website: 'https://covialvi.com',
  hours: 'Segunda a Sexta: 9h às 13h e das 14h às 18h',
  social: {
    facebook: 'https://www.facebook.com/covialvi',
    instagram: 'https://www.instagram.com/covialvi',
  },
} as const;
