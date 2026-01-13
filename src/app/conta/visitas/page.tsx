import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Building2, X, RefreshCw } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function getVisits(): Promise<{ upcoming: any[]; past: any[] }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { upcoming: [], past: [] };
  
  const now = new Date().toISOString();
  
  const { data: upcoming } = await supabase
    .from('visits')
    .select(`
      *,
      properties (title, slug, municipality, district)
    `)
    .eq('user_id', user.id)
    .gte('scheduled_at', now)
    .in('status', ['pending', 'confirmed'])
    .order('scheduled_at', { ascending: true });

  const { data: past } = await supabase
    .from('visits')
    .select(`
      *,
      properties (title, slug, municipality, district)
    `)
    .eq('user_id', user.id)
    .or(`scheduled_at.lt.${now},status.in.(completed,cancelled)`)
    .order('scheduled_at', { ascending: false })
    .limit(10);

  return {
    upcoming: upcoming || [],
    past: past || [],
  };
}

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmada',
  completed: 'Concluída',
  cancelled: 'Cancelada',
  rescheduled: 'Reagendada',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-yellow-100 text-yellow-700',
  rescheduled: 'bg-purple-100 text-purple-700',
};

export default async function VisitsPage() {
  const t = await getTranslations('account.visits');
  const { upcoming, past } = await getVisits();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Upcoming Visits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-gold-500" />
            {t('upcoming')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length > 0 ? (
            <div className="space-y-4">
              {upcoming.map((visit: any) => (
                <div
                  key={visit.id}
                  className="flex items-start justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={statusColors[visit.status] || 'bg-gray-100 text-gray-700'}>
                        {statusLabels[visit.status] || visit.status}
                      </Badge>
                    </div>
                    {visit.properties && (
                      <Link href={`/imoveis/${visit.properties.slug}`}>
                        <h3 className="font-semibold hover:text-gold-600 transition-colors">
                          {visit.properties.title}
                        </h3>
                      </Link>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>
                        {visit.properties?.municipality}
                        {visit.properties?.district && `, ${visit.properties.district}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(visit.scheduled_at)}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>
                          {new Date(visit.scheduled_at).toLocaleTimeString('pt-PT', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-1" />
                      {t('reschedule')}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-yellow-500 hover:text-yellow-600">
                      <X className="h-4 w-4 mr-1" />
                      {t('cancel')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">{t('empty')}</p>
              <Link href="/imoveis" className="mt-4 inline-block">
                <Button variant="outline">Explorar Imóveis</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Visits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
            {t('past')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {past.length > 0 ? (
            <div className="space-y-4">
              {past.map((visit: any) => (
                <div
                  key={visit.id}
                  className="flex items-start justify-between p-4 bg-muted/30 rounded-lg opacity-75"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={statusColors[visit.status] || ''}>
                        {statusLabels[visit.status] || visit.status}
                      </Badge>
                    </div>
                    {visit.properties && (
                      <Link href={`/imoveis/${visit.properties.slug}`}>
                        <h3 className="font-medium hover:text-gold-600 transition-colors">
                          {visit.properties.title}
                        </h3>
                      </Link>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(visit.scheduled_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Ainda não tem visitas anteriores.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
