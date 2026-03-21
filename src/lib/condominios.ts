export interface Condominio {
  slug: string;
  name: string;
  location: string;
  description: string;
  filterType: 'address' | 'title';
  filterValue: string;
}

export const CONDOMINIOS: Condominio[] = [
  {
    slug: 'quinta-do-pinheiro',
    name: 'Lote 26 – Quinta do Pinheiro',
    location: 'Cidade Nova, Covilhã',
    description: 'Condomínio moderno no coração da Covilhã com apartamentos de tipologias variadas e acabamentos de alta qualidade.',
    filterType: 'address',
    filterValue: 'QUINTA DO PINHEIRO LOTE 26',
  },
  {
    slug: 'faculdade-medicina',
    name: 'Edifício Junto à Faculdade de Medicina',
    location: 'Covilhã',
    description: 'Edifício residencial junto à Faculdade de Medicina da UBI, ideal para investimento ou habitação própria.',
    filterType: 'title',
    filterValue: 'faculdade de medicina',
  },
  {
    slug: 'edificio-trindade',
    name: 'Edifício Trindade',
    location: 'Torraltinha, Lagos',
    description: 'Empreendimento exclusivo no Algarve com localização privilegiada em Lagos.',
    filterType: 'title',
    filterValue: 'Trindade',
  },
];
