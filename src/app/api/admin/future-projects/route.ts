import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET - List all future projects (admin only)
export async function GET() {
  try {
    const userSupabase = createClient();
    const { data: { user }, error: authError } = await userSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: projects, error } = await supabase
      .from('future_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('GET /api/admin/future-projects error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new future project (admin only)
export async function POST(request: NextRequest) {
  try {
    const userSupabase = createClient();
    const { data: { user }, error: authError } = await userSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      full_description,
      status,
      location,
      image_url,
      features,
      start_date,
      is_published,
    } = body;

    if (!title || !description || !status || !location || !image_url || !start_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: project, error } = await supabase
      .from('future_projects')
      .insert({
        title,
        description,
        full_description,
        status,
        location,
        image_url,
        features: features || [],
        start_date,
        is_published: is_published || false,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/future-projects error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
