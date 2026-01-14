import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Procuro Imóvel | Covialvi - Ajudamos a Encontrar a Sua Casa',
  description: 'Diga-nos o que procura e encontramos o imóvel ideal para si. Serviço personalizado e gratuito de procura de imóveis em Portugal.',
  openGraph: {
    title: 'Procuro Imóvel | Covialvi',
    description: 'Deixe-nos ajudá-lo a encontrar o imóvel perfeito para si.',
    type: 'website',
    locale: 'pt_PT',
    url: 'https://covialvi.com/procuro-imovel',
    siteName: 'Covialvi',
  },
  alternates: {
    canonical: 'https://covialvi.com/procuro-imovel',
  },
};

export default function ProcuroImovelLayout({ children }: { children: React.ReactNode }) {
  return children;
}
