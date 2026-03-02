import { createServiceClient } from '@/lib/supabase/server';
import { FutureProjectsClient } from './future-projects-client';

async function getFutureProjects() {
  const supabase = createServiceClient();
  
  const { data, error } = await supabase
    .from('future_projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching future projects:', error);
    return [];
  }

  return data || [];
}

export default async function AdminFutureProjectsPage() {
  const projects = await getFutureProjects();

  return <FutureProjectsClient initialProjects={projects} />;
}
