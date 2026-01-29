import { createClient } from '@/lib/supabase/server';
import { VisitsCalendarClient } from './visits-calendar-client';

export const dynamic = 'force-dynamic';

async function getVisits(): Promise<any[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('visits')
    .select(`
      *,
      properties (id, title, slug, municipality, reference, property_images(url, is_cover)),
      profiles:user_id (id, first_name, last_name, email, phone, avatar_url),
      assigned:assigned_to (first_name, last_name)
    `)
    .order('scheduled_at', { ascending: true });

  // Data already includes visitor_name, visitor_email, visitor_phone from the * selector
  return data || [];
}

export default async function AdminVisitsPage() {
  const visits = await getVisits();

  return <VisitsCalendarClient visits={visits} />;
}
