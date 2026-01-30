import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/components/providers/auth-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { StructuredData, organizationSchema, websiteSchema } from '@/components/seo/structured-data';
import { CookieConsent } from '@/components/cookie-consent';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Covialvi - Imobiliária de Confiança em Portugal',
    template: '%s | Covialvi',
  },
  description:
    'A Covialvi é uma imobiliária de referência em Portugal, especializada em apartamentos, moradias e imóveis comerciais. Encontre o seu imóvel ideal connosco.',
  keywords: [
    'imobiliária',
    'imóveis',
    'apartamentos',
    'moradias',
    'Portugal',
    'Covilhã',
    'comprar casa',
    'vender casa',
    'arrendar',
  ],
  authors: [{ name: 'Covialvi' }],
  creator: 'Covialvi',
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    url: '/',
    siteName: 'Covialvi',
    title: 'Covialvi - Imobiliária de Confiança em Portugal',
    description:
      'A Covialvi é uma imobiliária de referência em Portugal. Encontre apartamentos, moradias e imóveis comerciais.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Covialvi - Imobiliária',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Covialvi - Imobiliária de Confiança em Portugal',
    description: 'Encontre o seu imóvel ideal em Portugal com a Covialvi.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  icons: {
    icon: [
      {
        url: 'https://media.egorealestate.com/ORIGINAL/ab9a/2a120afd-2b27-49b5-8934-8237e1cbab9a.png',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: 'https://media.egorealestate.com/ORIGINAL/ab9a/2a120afd-2b27-49b5-8934-8237e1cbab9a.png',
        type: 'image/png',
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://media.egorealestate.com" />
        <link rel="dns-prefetch" href="https://media.egorealestate.com" />
        <StructuredData data={[organizationSchema, websiteSchema]} />
      </head>
      <body className={`${poppins.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <QueryProvider>
              <AuthProvider>
                {children}
                <Toaster position="top-right" richColors />
                <CookieConsent />
                <Analytics />
                <SpeedInsights />
              </AuthProvider>
            </QueryProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
