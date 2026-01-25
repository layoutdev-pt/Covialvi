import { createClient } from '@/lib/supabase/server';
import { CRMClient } from './crm-client';

export const dynamic = 'force-dynamic';

async function getLeads() {
  const supabase = createClient();
  const { data } = await supabase
    .from('leads')
    .select(`
      *,
      properties:property_id (id, title, reference),
      assigned:assigned_to (id, first_name, last_name)
    `)
    .order('created_at', { ascending: false });

  return data || [];
}

async function getScheduledVisits() {
  const supabase = createClient();
  const { data } = await supabase
    .from('visits')
    .select(`
      *,
      properties:property_id (id, title, reference, municipality),
      profiles:user_id (id, first_name, last_name, email, phone)
    `)
    .in('status', ['pending', 'confirmed'])
    .order('scheduled_at', { ascending: true });

  return data || [];
}

export default async function CRMPage() {
  const [leads, scheduledVisits] = await Promise.all([
    getLeads(),
    getScheduledVisits(),
  ]);

  return <CRMClient initialLeads={leads} scheduledVisits={scheduledVisits} />;
}
