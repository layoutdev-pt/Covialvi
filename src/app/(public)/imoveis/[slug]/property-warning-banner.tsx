'use client';

import { AlertTriangle, Phone } from 'lucide-react';

const TARGET_SLUGS = [
  'moradia-t3-com-vista-mar-garagem-jardim-e-piscina-mexilhoeira-grande-portimao-1769095037266',
  'moradia-t3-com-vista-mar-garagem-jardim-e-piscina-mexilhoeira-portimao-1769094251886'
];

interface PropertyWarningBannerProps {
  slug: string;
}

export function PropertyWarningBanner({ slug }: PropertyWarningBannerProps) {
  if (!TARGET_SLUGS.includes(slug)) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl px-4 py-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-700 font-medium">
            Devido a período de férias, as respostas por e-mail (geral@covialvi.pt) podem demorar. Para obter informações rapidamente, por favor ligue para o{' '}
            <a href="tel:+351967138116" className="font-bold underline inline-flex items-center gap-1 hover:text-yellow-800 transition-colors">
              <Phone className="h-4 w-4" />+351 967 138 116
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
