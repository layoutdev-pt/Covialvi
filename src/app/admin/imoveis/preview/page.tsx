'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Euro,
  Ruler,
  Home,
  Bed,
  Bath,
  Calendar,
} from 'lucide-react';

const businessTypeLabels: Record<string, string> = {
  sale: 'Venda',
  rent: 'Arrendamento',
  transfer: 'Trespasse',
};

const natureLabels: Record<string, string> = {
  apartment: 'Apartamento',
  house: 'Moradia',
  land: 'Terreno',
  commercial: 'Comercial',
  warehouse: 'Armazém',
  office: 'Escritório',
  garage: 'Garagem',
  shop: 'Loja',
};

const propertyStatusLabels: Record<string, string> = {
  usado: 'Usado',
  vendido: 'Vendido',
  renovado: 'Renovado',
  recuperado: 'Recuperado',
  por_recuperar: 'Por Recuperar',
  novo: 'Novo',
  em_projeto: 'Em Projeto',
  em_construcao: 'Em Construção',
};

export default function PropertyPreviewPage() {
  const [propertyData, setPropertyData] = useState<any>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('propertyPreview');
    if (data) {
      setPropertyData(JSON.parse(data));
    }
  }, []);

  if (!propertyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Nenhum dado de pré-visualização encontrado</p>
          <Link href="/admin/imoveis/novo">
            <Button className="mt-4">Voltar</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin/imoveis/novo">
                <Button variant="ghost" size="icon" className="mr-4">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                Pré-visualização do Imóvel
              </h1>
            </div>
            <Badge variant="secondary">Pré-visualização</Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Basic Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {propertyData.title}
                    </h2>
                    <p className="text-lg text-gold-600 font-semibold">
                      {propertyData.reference}
                    </p>
                  </div>
                  <div className="text-right">
                    {propertyData.price && !propertyData.price_on_request ? (
                      <div>
                        <p className="text-3xl font-bold text-gray-900">
                          {new Intl.NumberFormat('pt-PT', {
                            style: 'currency',
                            currency: 'EUR',
                          }).format(propertyData.price)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {businessTypeLabels[propertyData.business_type]}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xl font-semibold text-gray-900">
                        Preço sob consulta
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="flex items-center">
                    <Building2 className="h-3 w-3 mr-1" />
                    {natureLabels[propertyData.nature]}
                  </Badge>
                  {propertyData.construction_status && (
                    <Badge variant="outline">
                      {propertyStatusLabels[propertyData.construction_status]}
                    </Badge>
                  )}
                  {propertyData.typology && (
                    <Badge variant="outline">{propertyData.typology}</Badge>
                  )}
                </div>

                {propertyData.description && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Descrição</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {propertyData.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Características</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {propertyData.gross_area && (
                    <div className="flex items-center">
                      <Ruler className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Área Bruta</p>
                        <p className="font-medium">{propertyData.gross_area} m²</p>
                      </div>
                    </div>
                  )}
                  {propertyData.useful_area && (
                    <div className="flex items-center">
                      <Home className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Área Útil</p>
                        <p className="font-medium">{propertyData.useful_area} m²</p>
                      </div>
                    </div>
                  )}
                  {propertyData.bedrooms && (
                    <div className="flex items-center">
                      <Bed className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Quartos</p>
                        <p className="font-medium">{propertyData.bedrooms}</p>
                      </div>
                    </div>
                  )}
                  {propertyData.bathrooms && (
                    <div className="flex items-center">
                      <Bath className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Casas de Banho</p>
                        <p className="font-medium">{propertyData.bathrooms}</p>
                      </div>
                    </div>
                  )}
                  {propertyData.construction_year && (
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Ano de Construção</p>
                        <p className="font-medium">{propertyData.construction_year}</p>
                      </div>
                    </div>
                  )}
                  {propertyData.energy_certificate && (
                    <div className="flex items-center">
                      <div className="h-5 w-5 bg-gray-200 rounded flex items-center justify-center mr-3">
                        <span className="text-xs font-bold">{propertyData.energy_certificate}</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Certificado Energético</p>
                        <p className="font-medium">{propertyData.energy_certificate}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            {(propertyData.district || propertyData.municipality || propertyData.address) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Localização
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {propertyData.address && (
                      <p className="text-gray-600">{propertyData.address}</p>
                    )}
                    {(propertyData.district || propertyData.municipality) && (
                      <p className="text-gray-600">
                        {[propertyData.district, propertyData.municipality]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Interessado?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Entre em contacto para mais informações sobre este imóvel.
                </p>
                <Button className="w-full">
                  Solicitar Informações
                </Button>
              </CardContent>
            </Card>

            {/* Share */}
            <Card>
              <CardHeader>
                <CardTitle>Partilhar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    Copiar Link
                  </Button>
                  <Button variant="outline" className="w-full">
                    Enviar por Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
