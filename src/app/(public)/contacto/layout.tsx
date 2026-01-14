import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacto | Covialvi - Fale Connosco',
  description: 'Entre em contacto com a Covialvi. Estamos disponíveis para ajudá-lo a encontrar o imóvel ideal ou vender a sua propriedade. Atendimento personalizado.',
  openGraph: {
    title: 'Contacte a Covialvi | Imobiliária de Confiança',
    description: 'Fale connosco para encontrar o imóvel ideal ou vender a sua propriedade.',
    type: 'website',
    locale: 'pt_PT',
    url: 'https://covialvi.com/contacto',
    siteName: 'Covialvi',
  },
  alternates: {
    canonical: 'https://covialvi.com/contacto',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
