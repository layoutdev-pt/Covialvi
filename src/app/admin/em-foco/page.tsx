import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { EmFocoClient } from './em-foco-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Gestão de Imóveis Em Foco | Admin Covialvi',
  description: 'Gerir os 3 imóveis em destaque na página inicial.',
};

export default async function EmFocoPage() {
  const supabase = createClient();

  // Fetch all published properties to be available for selection
  const { data: properties } = await supabase
    .from('properties')
    .select('id, title, reference, price, price_on_request, property_images(url, is_cover)')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  // Fetch current premium highlights
  const { data: highlights } = await supabase
    .from('premium_highlights')
    .select('*')
    .order('position', { ascending: true });

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Imóveis Em Foco</h1>
          <p className="mt-2 text-gray-600">
            Selecione até 3 imóveis para aparecerem destacados na página inicial logo abaixo do Hero.
          </p>
        </div>

        <EmFocoClient 
          properties={properties || []} 
          initialHighlights={highlights || []} 
        />
      </div>
    </div>
  );
}
