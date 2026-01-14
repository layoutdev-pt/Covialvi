import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recrutamento | Covialvi - Junte-se à Nossa Equipa',
  description: 'Faça parte da equipa Covialvi. Procuramos profissionais motivados para crescer connosco no mercado imobiliário português.',
  openGraph: {
    title: 'Carreiras na Covialvi | Trabalhe Connosco',
    description: 'Junte-se à nossa equipa e construa uma carreira de sucesso no mercado imobiliário.',
    type: 'website',
    locale: 'pt_PT',
    url: 'https://covialvi.com/recrutamento',
    siteName: 'Covialvi',
  },
  alternates: {
    canonical: 'https://covialvi.com/recrutamento',
  },
};

export default function RecrutamentoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
