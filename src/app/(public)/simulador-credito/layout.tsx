import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Simulador de Crédito Habitação | Covialvi',
  description: 'Simule o seu crédito habitação gratuitamente. Calcule prestações, taxas de juro e descubra quanto pode pedir emprestado para comprar a sua casa.',
  openGraph: {
    title: 'Simulador de Crédito Habitação | Covialvi',
    description: 'Calcule a sua prestação mensal e descubra quanto pode pedir emprestado.',
    type: 'website',
    locale: 'pt_PT',
    url: 'https://covialvi.com/simulador-credito',
    siteName: 'Covialvi',
  },
  alternates: {
    canonical: 'https://covialvi.com/simulador-credito',
  },
};

export default function SimuladorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
