import { Metadata } from 'next';
import { AboutClient } from './about-client';

export const metadata: Metadata = {
  title: 'Sobre Nós | Covialvi - A Nossa História e Missão',
  description: 'Conheça a Covialvi, uma imobiliária de confiança em Portugal. Descubra a nossa história, valores e compromisso com a excelência no mercado imobiliário.',
  openGraph: {
    title: 'Sobre a Covialvi | Imobiliária de Confiança',
    description: 'Conheça a nossa história e compromisso com a excelência no mercado imobiliário português.',
    type: 'website',
    locale: 'pt_PT',
    url: 'https://covialvi.com/sobre',
    siteName: 'Covialvi',
  },
  alternates: {
    canonical: 'https://covialvi.com/sobre',
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
