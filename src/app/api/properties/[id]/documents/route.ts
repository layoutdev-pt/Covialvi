import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${params.id}/${type}-${Date.now()}.${fileExt}`;
    const bucket = type === 'floor_plan' ? 'property-floor-plans' : 'property-documents';

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    // Update property with the URL
    if (type === 'brochure') {
      const { error: updateError } = await supabase
        .from('properties')
        .update({ brochure_url: publicUrl })
        .eq('id', params.id);

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    } else if (type === 'floor_plan') {
      // Insert into property_floor_plans table
      const { error: insertError } = await supabase
        .from('property_floor_plans')
        .insert({
          property_id: params.id,
          url: publicUrl,
          order: 0,
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ url: publicUrl, type });
  } catch (error: any) {
    console.error('Error in POST /api/properties/[id]/documents:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
