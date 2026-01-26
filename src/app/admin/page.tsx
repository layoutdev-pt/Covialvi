import { createServiceClient } from '@/lib/supabase/server';
import { AdminDashboardClient } from './admin-dashboard-client';

export const dynamic = 'force-dynamic';

async function getDashboardStats() {
  const supabase = createServiceClient();
  
  const now = new Date();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  const [
    propertiesResult,
    activePropertiesResult,
    propertiesThisMonthResult,
    propertiesLastMonthResult,
    leadsThisWeekResult,
    leadsLastWeekResult,
    pendingLeadsResult,
    scheduledVisitsResult,
    visitsThisWeekResult,
    recentLeadsResult,
    recentActivityResult,
  ] = await Promise.all([
    supabase.from('properties').select('*', { count: 'exact', head: true }),
    supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('properties').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo.toISOString()),
    supabase.from('properties').select('*', { count: 'exact', head: true }).gte('created_at', sixtyDaysAgo.toISOString()).lt('created_at', thirtyDaysAgo.toISOString()),
    supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo.toISOString()),
    supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', fourteenDaysAgo.toISOString()).lt('created_at', sevenDaysAgo.toISOString()),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('visits').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('visits').select('*', { count: 'exact', head: true }).gte('scheduled_at', sevenDaysAgo.toISOString()).lt('scheduled_at', now.toISOString()),
    supabase.from('leads').select('*, properties:property_id (title, reference)').order('created_at', { ascending: false }).limit(5),
    supabase.from('audit_logs').select('*, profiles:user_id (first_name, last_name)').order('created_at', { ascending: false }).limit(5),
  ]);

  const totalProperties = propertiesResult.count || 0;
  const activeProperties = activePropertiesResult.count || 0;
  const propertiesThisMonth = propertiesThisMonthResult.count || 0;
  const propertiesLastMonth = propertiesLastMonthResult.count || 0;
  const newLeadsThisWeek = leadsThisWeekResult.count || 0;
  const newLeadsLastWeek = leadsLastWeekResult.count || 0;
  const pendingLeads = pendingLeadsResult.count || 0;
  const scheduledVisits = scheduledVisitsResult.count || 0;
  const visitsThisWeek = visitsThisWeekResult.count || 0;

  const calcChange = (current: number, previous: number) => {
    if (previous === 0) {
      return current > 0 ? { value: 100, type: 'positive' as const } : { value: 0, type: 'neutral' as const };
    }
    const change = Math.round(((current - previous) / previous) * 100);
    return {
      value: Math.abs(change),
      type: change > 0 ? 'positive' as const : change < 0 ? 'negative' as const : 'neutral' as const
    };
  };

  return {
    stats: {
      totalProperties,
      activeProperties,
      newLeads: newLeadsThisWeek,
      scheduledVisits,
      pendingLeads,
      changes: {
        properties: calcChange(propertiesThisMonth, propertiesLastMonth),
        active: { value: totalProperties ? Math.round(activeProperties / totalProperties * 100) : 0, type: 'neutral' as const },
        leads: calcChange(newLeadsThisWeek, newLeadsLastWeek),
        visits: { value: visitsThisWeek, type: 'neutral' as const },
      }
    },
    recentLeads: recentLeadsResult.data || [],
    recentActivity: recentActivityResult.data || [],
  };
}

export default async function AdminDashboard() {
  const data = await getDashboardStats();
  return <AdminDashboardClient initialData={data} />;
}
