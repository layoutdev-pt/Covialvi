import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Trash2, MapPin, Bed, Bath, Maximize } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function getFavorites(): Promise<any[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];
  
  const { data } = await supabase
    .from('favorites')
    .select(`
      *,
      properties (
        *,
        property_images (*)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return data || [];
}

export default async function FavoritesPage() {
  const t = await getTranslations('account.favorites');
  const favorites = await getFavorites();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-gold-500" />
          <span className="font-medium">{favorites.length} imóveis</span>
        </div>
      </div>

      {favorites.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {favorites.map((favorite: any) => {
            const property = favorite.properties;
            if (!property) return null;
            
            const coverImage = property.property_images?.find((img: any) => img.is_cover) ||
              property.property_images?.[0];

            return (
              <Card key={favorite.id} className="overflow-hidden">
                <div className="relative aspect-[16/9]">
                  <Link href={`/imoveis/${property.slug}`}>
                    {coverImage ? (
                      <Image
                        src={coverImage.url}
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">Sem imagem</span>
                      </div>
                    )}
                  </Link>
                  <button className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
                    <Trash2 className="h-5 w-5 text-yellow-500" />
                  </button>
                </div>
                <CardContent className="p-4">
                  <Link href={`/imoveis/${property.slug}`}>
                    <h3 className="font-semibold text-lg hover:text-gold-600 transition-colors line-clamp-1">
                      {property.title}
                    </h3>
                  </Link>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{property.municipality}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    {property.bedrooms !== null && (
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        <span>{property.bedrooms}</span>
                      </div>
                    )}
                    {property.bathrooms !== null && (
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        <span>{property.bathrooms}</span>
                      </div>
                    )}
                    {property.gross_area !== null && (
                      <div className="flex items-center">
                        <Maximize className="h-4 w-4 mr-1" />
                        <span>{property.gross_area} m²</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <p className="text-xl font-bold text-foreground">
                      {property.price_on_request ? 'Sob Consulta' : formatPrice(property.price)}
                    </p>
                    <Link href={`/imoveis/${property.slug}`}>
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg mb-2">{t('empty')}</h3>
            <p className="text-muted-foreground mb-6">
              Explore os nossos imóveis e adicione os seus favoritos.
            </p>
            <Link href="/imoveis">
              <Button variant="gold">Ver Imóveis</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
