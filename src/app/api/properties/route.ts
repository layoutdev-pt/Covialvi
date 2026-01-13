import { createClient, createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const serviceClient = createServiceClient();
    const body = await request.json();

    console.log('API: Creating property with data:', body);

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('API: User:', user?.id, 'Auth error:', authError?.message);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado - faça login novamente' },
        { status: 401 }
      );
    }

    // Check if user is admin or super_admin using service client
    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    console.log('API: Profile:', profile, 'Profile error:', profileError?.message);

    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
      return NextResponse.json(
        { error: 'Acesso negado - apenas administradores podem criar imóveis' },
        { status: 403 }
      );
    }

    // Check if reference already exists using service client
    const { data: existingProperty } = await serviceClient
      .from('properties')
      .select('id')
      .eq('reference', body.reference)
      .single();

    if (existingProperty) {
      return NextResponse.json(
        { error: 'Referência já existe' },
        { status: 400 }
      );
    }

    // Create the property using service client (bypasses RLS)
    const { data: property, error } = await serviceClient
      .from('properties')
      .insert({
        ...body,
        created_by: user.id,
      })
      .select()
      .single();

    console.log('API: Insert result:', property, 'Error:', error?.message);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: error.message || 'Erro ao criar imóvel' },
        { status: 500 }
      );
    }

    // Create audit log
    try {
      await serviceClient.from('audit_logs').insert({
        user_id: user.id,
        action: 'create',
        entity_type: 'property',
        entity_id: property.id,
        details: `Criou imóvel: ${property.title}`,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      });
    } catch (auditErr) {
      console.error('Audit log error:', auditErr);
    }

    return NextResponse.json(property);
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Check if user is admin or super_admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Get properties
    const { data: properties, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(properties);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
