'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  ExternalLink,
  Building2,
  MapPin,
  Filter,
  Eye,
  Trash2,
  Archive,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  archived: 'Arquivado',
};

const statusColors: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-700',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-700',
};

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

interface Property {
  id: string;
  title: string;
  slug: string;
  status: string;
  business_type: string;
  nature: string;
  price: number | null;
  price_on_request: boolean;
  municipality: string | null;
  district: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  gross_area: number | null;
  construction_year: number | null;
  property_images: Array<{ id: string; url: string; is_cover: boolean; order: number }> | null;
}

interface PropertiesClientProps {
  properties: Property[];
}

export function PropertiesClient({ properties: initialProperties }: PropertiesClientProps) {
  const [properties, setProperties] = useState(initialProperties);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    initialProperties.length > 0 ? initialProperties[0].id : null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [businessTypeFilter, setBusinessTypeFilter] = useState<string>('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const menuButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && !menuButtonRefs.current[openMenuId]?.contains(event.target as Node)) {
        setOpenMenuId(null);
        setMenuPosition(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  const handleMenuToggle = (propertyId: string, buttonElement: HTMLButtonElement) => {
    if (openMenuId === propertyId) {
      setOpenMenuId(null);
      setMenuPosition(null);
    } else {
      const rect = buttonElement.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 192, // 192px = w-48
      });
      setOpenMenuId(propertyId);
    }
  };

  const filteredProperties = properties.filter((property) => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.municipality?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || property.status === statusFilter;
    const matchesBusinessType = !businessTypeFilter || property.business_type === businessTypeFilter;
    return matchesSearch && matchesStatus && matchesBusinessType;
  });

  const getCoverImage = (property: Property) => {
    if (!property.property_images || !Array.isArray(property.property_images) || property.property_images.length === 0) {
      return null;
    }
    return property.property_images.find((img) => img.is_cover) || property.property_images[0];
  };

  const handleDeleteProperty = async (propertyId: string, propertyTitle: string) => {
    if (!confirm(`Tem a certeza que deseja eliminar "${propertyTitle}"?`)) return;
    
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erro ao eliminar');
      }

      setProperties(prev => prev.filter(p => p.id !== propertyId));
      if (selectedPropertyId === propertyId) {
        const remaining = properties.filter(p => p.id !== propertyId);
        setSelectedPropertyId(remaining[0]?.id || null);
      }
      toast.success('Imóvel eliminado com sucesso');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao eliminar imóvel');
    }
    setOpenMenuId(null);
  };

  const handleArchiveProperty = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erro ao arquivar');
      }

      setProperties(prev => prev.map(p => 
        p.id === propertyId ? { ...p, status: 'archived' } : p
      ));
      toast.success('Imóvel arquivado');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao arquivar imóvel');
    }
    setOpenMenuId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lista de Imóveis</h1>
          <p className="text-muted-foreground mt-1">
            {properties.length} imóveis
          </p>
        </div>
        <Link href="/admin/imoveis/novo-simple">
          <button className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-yellow-500/25 transition-all">
            <Plus className="h-4 w-4" />
            Novo Imóvel
          </button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Pesquisar imóveis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-xl text-sm transition-colors ${showFilters ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'text-muted-foreground hover:bg-secondary'}`}
        >
          <Filter className="h-4 w-4" />
          Filtros
        </button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">Todos</option>
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
              <option value="archived">Arquivado</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Tipo de Negócio</label>
            <select
              value={businessTypeFilter}
              onChange={(e) => setBusinessTypeFilter(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">Todos</option>
              <option value="sale">Venda</option>
              <option value="rent">Arrendamento</option>
              <option value="transfer">Trespasse</option>
            </select>
          </div>
          <button
            onClick={() => { setStatusFilter(''); setBusinessTypeFilter(''); }}
            className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
          >
            Limpar Filtros
          </button>
        </div>
      )}

      {/* Properties List with Detail Panel */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Properties List */}
        <div className="bg-card rounded-2xl shadow-sm border border-border">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Imóveis <span className="text-muted-foreground">{filteredProperties.length}</span>
              </span>
            </div>
          </div>
          
          <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
            {filteredProperties.length > 0 ? (
              filteredProperties.map((property) => {
                const coverImage = getCoverImage(property);
                const isSelected = property.id === selectedPropertyId;

                return (
                  <div 
                    key={property.id} 
                    onClick={() => setSelectedPropertyId(property.id)}
                    className={`p-4 transition-colors cursor-pointer ${isSelected ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'hover:bg-secondary'}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                        {coverImage && coverImage.url ? (
                          <img
                            src={coverImage.url}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground truncate">{property.title}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3.5 w-3.5" />
                              {property.municipality || 'Portugal'}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[property.status] || 'bg-gray-100 text-gray-700'}`}>
                            {statusLabels[property.status] || property.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="font-medium text-yellow-600">
                            {property.price_on_request ? 'Sob Consulta' : formatPrice(property.price)}
                          </span>
                          <span className="text-border">|</span>
                          <span>{businessTypeLabels[property.business_type] || property.business_type}</span>
                        </div>
                      </div>
                      
                      {/* Actions Dropdown */}
                      <div className="relative">
                        <button 
                          ref={(el) => { menuButtonRefs.current[property.id] = el; }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuToggle(property.id, e.currentTarget);
                          }}
                          className="p-2 hover:bg-secondary rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </button>
                        {openMenuId === property.id && menuPosition && (
                          <div 
                            className="fixed w-48 bg-card border border-border rounded-xl shadow-lg py-1 z-[9999]"
                            style={{ top: menuPosition.top, left: menuPosition.left }}
                          >
                            <Link 
                              href={`/admin/imoveis/${property.id}`}
                              onClick={() => setOpenMenuId(null)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                              Editar
                            </Link>
                            <Link 
                              href={`/imoveis/${property.slug}`}
                              onClick={() => setOpenMenuId(null)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                              Ver no Site
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArchiveProperty(property.id);
                              }}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors w-full text-left"
                            >
                              <Archive className="h-4 w-4" />
                              Arquivar
                            </button>
                            <hr className="my-1 border-border" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProperty(property.id, property.title);
                              }}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                            >
                              <Trash2 className="h-4 w-4" />
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter || businessTypeFilter 
                    ? 'Nenhum imóvel encontrado com os filtros aplicados.' 
                    : 'Ainda não existem imóveis.'}
                </p>
                {!searchTerm && !statusFilter && !businessTypeFilter && (
                  <Link href="/admin/imoveis/novo-simple">
                    <button className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-yellow-500/25 transition-all">
                      <Plus className="h-4 w-4" />
                      Adicionar Primeiro Imóvel
                    </button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Property Detail Panel */}
        {selectedProperty && (
          <div className="bg-card rounded-2xl shadow-sm overflow-hidden border border-border">
            {(() => {
              const coverImage = getCoverImage(selectedProperty);

              return (
                <>
                  {/* Cover Image */}
                  <div className="relative aspect-[16/9] bg-secondary">
                    {coverImage && coverImage.url ? (
                      <img
                        src={coverImage.url}
                        alt={selectedProperty.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Link href={`/imoveis/${selectedProperty.slug}`}>
                        <button className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors">
                          <ExternalLink className="h-4 w-4 text-gray-700" />
                        </button>
                      </Link>
                      <Link href={`/admin/imoveis/${selectedProperty.id}`}>
                        <button className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors">
                          <Edit className="h-4 w-4 text-gray-700" />
                        </button>
                      </Link>
                    </div>
                  </div>

                  {/* Property Info */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[selectedProperty.status] || 'bg-gray-100 text-gray-700'}`}>
                        {statusLabels[selectedProperty.status] || selectedProperty.status}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {natureLabels[selectedProperty.nature] || selectedProperty.nature}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-foreground mb-1">{selectedProperty.title}</h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {selectedProperty.municipality}, {selectedProperty.district || 'Portugal'}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6 py-4 border-y border-border">
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground">{selectedProperty.bedrooms || '-'}</p>
                        <p className="text-xs text-muted-foreground">Quartos</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground">{selectedProperty.gross_area || '-'}</p>
                        <p className="text-xs text-muted-foreground">Área (m²)</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground">{selectedProperty.construction_year || '-'}</p>
                        <p className="text-xs text-muted-foreground">Ano</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mt-4">
                      <p className="text-2xl font-bold text-foreground">
                        {selectedProperty.price_on_request ? 'Sob Consulta' : formatPrice(selectedProperty.price)}
                      </p>
                      <p className="text-sm text-muted-foreground">{businessTypeLabels[selectedProperty.business_type] || selectedProperty.business_type}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                      <Link href={`/admin/imoveis/${selectedProperty.id}`} className="flex-1">
                        <button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium py-3 rounded-xl hover:shadow-lg hover:shadow-yellow-500/25 transition-all">
                          Editar Imóvel
                        </button>
                      </Link>
                      <button 
                        onClick={() => handleDeleteProperty(selectedProperty.id, selectedProperty.title)}
                        className="px-4 py-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Empty state for detail panel */}
        {!selectedProperty && properties.length > 0 && (
          <div className="bg-card rounded-2xl shadow-sm border border-border flex items-center justify-center p-12">
            <div className="text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Selecione um imóvel para ver os detalhes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
