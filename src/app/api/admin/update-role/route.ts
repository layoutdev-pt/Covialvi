import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * API Route: POST /api/admin/update-role
 * Updates a user's role - only callable by super admins
 * Uses service role to bypass RLS policies
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, newRole } = body;

    if (!userId || !newRole) {
      return NextResponse.json(
        { error: 'userId and newRole are required' },
        { status: 400 }
      );
    }

    const validRoles = ['user', 'admin', 'super_admin'];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Verify the requesting user is a super admin
    const supabase = createServiceClient();

    // Get the session from the request cookies
    const { createClient } = await import('@/lib/supabase/server');
    const userSupabase = createClient();
    const { data: { user }, error: authError } = await userSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if the requesting user is a super admin
    const { data: requestingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !requestingProfile) {
      return NextResponse.json(
        { error: 'Could not verify permissions' },
        { status: 403 }
      );
    }

    if (requestingProfile.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super admins can change user roles' },
        { status: 403 }
      );
    }

    // Update the role using service client (bypasses RLS)
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating role:', updateError);
      return NextResponse.json(
        { error: 'Failed to update role', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Role updated successfully',
      profile: data,
    });

  } catch (error) {
    console.error('Update role error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
