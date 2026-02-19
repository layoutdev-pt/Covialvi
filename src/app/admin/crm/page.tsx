import { createServiceClient } from '@/lib/supabase/server';
import { CRMClient } from './crm-client';

export const dynamic = 'force-dynamic';

async function getLeads() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      properties:property_id (id, title, reference, slug),
      assigned:assigned_to (id, first_name, last_name)
    `)
    .order('created_at', { ascending: false });

  if (error) console.error('[CRM] getLeads error:', error.message);
  return data || [];
}

async function getScheduledVisits() {
  const supabase = createServiceClient();
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
  const [allLeads, scheduledVisits] = await Promise.all([
    getLeads(),
    getScheduledVisits(),
  ]);

  const isPropertyLead = (l: any) => l.source === 'property' || l.source === 'property_page';
  const propertyLeads = allLeads.filter(isPropertyLead);
  const contactLeads = allLeads.filter((l: any) => !isPropertyLead(l));

  return (
    <CRMClient
      propertyLeads={propertyLeads}
      contactLeads={contactLeads}
      scheduledVisits={scheduledVisits}
    />
  );
}
