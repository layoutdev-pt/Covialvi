'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Heart, Bed, Bath, Maximize, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatPrice, formatArea } from '@/lib/utils';
import type { Tables } from '@/lib/database.types';

interface PropertyCardProps {
  property: Tables<'properties'> & {
    property_images?: Tables<'property_images'>[];
  };
  isFavorite?: boolean;
  onToggleFavorite?: (propertyId: string) => void;
  className?: string;
}

export function PropertyCard({
  property,
  isFavorite = false,
  onToggleFavorite,
  className,
}: PropertyCardProps) {
  const t = useTranslations('properties');

  const coverImage = property.property_images?.find((img) => img.is_cover) ||
    property.property_images?.[0];

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

  return (
    <article
      className={cn(
        'group bg-white rounded-lg border border-border overflow-hidden card-hover',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link href={`/imoveis/${property.slug}`}>
          {coverImage ? (
            <Image
              src={coverImage.url}
              alt={property.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">Sem imagem</span>
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <Badge variant="gold">
            {businessTypeLabels[property.business_type] || property.business_type}
          </Badge>
          {property.featured && (
            <Badge variant="secondary">Destaque</Badge>
          )}
        </div>

        {/* Favorite Button */}
        {onToggleFavorite && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute top-3 right-3 bg-white/90 hover:bg-white shadow-sm',
              isFavorite && 'text-yellow-500'
            )}
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite(property.id);
            }}
            aria-label={isFavorite ? t('actions.removeFavorite') : t('actions.addFavorite')}
          >
            <Heart
              className={cn('h-5 w-5', isFavorite && 'fill-current')}
            />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Nature & Location */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gold-600">
            {natureLabels[property.nature] || property.nature}
          </span>
          <span className="text-xs text-muted-foreground">
            Ref: {property.reference}
          </span>
        </div>

        {/* Title */}
        <Link href={`/imoveis/${property.slug}`}>
          <h3 className="font-semibold text-lg text-foreground line-clamp-2 hover:text-gold-600 transition-colors">
            {property.title}
          </h3>
        </Link>

        {/* Location */}
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="truncate">
            {property.municipality}
            {property.district && ` › ${property.district}`}
          </span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {property.bedrooms !== null && (
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms !== null && (
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          {property.gross_area !== null && (
            <div className="flex items-center gap-1">
              <Maximize className="h-4 w-4" />
              <span>{formatArea(property.gross_area)}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="pt-3 border-t border-border">
          <p className="text-xl font-bold text-foreground">
            {property.price_on_request
              ? t('details.priceOnRequest')
              : formatPrice(property.price)}
          </p>
        </div>
      </div>
    </article>
  );
}
