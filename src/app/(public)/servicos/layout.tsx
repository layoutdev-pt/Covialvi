import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Serviços | Covialvi - Soluções Imobiliárias Completas',
  description: 'Descubra os nossos serviços imobiliários: compra, venda, arrendamento, avaliação de imóveis e consultoria. Soluções personalizadas para cada cliente.',
  openGraph: {
    title: 'Serviços Imobiliários | Covialvi',
    description: 'Soluções completas para compra, venda e arrendamento de imóveis em Portugal.',
    type: 'website',
    locale: 'pt_PT',
    url: 'https://covialvi.com/servicos',
    siteName: 'Covialvi',
  },
  alternates: {
    canonical: 'https://covialvi.com/servicos',
  },
};

export default function ServicosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
