import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    
    // Create a sample property
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert({
        title: 'Apartamento T3 no Centro da Covilhã',
        slug: 'apartamento-t3-centro-covilha',
        reference: 'CVL/2025/001',
        description: 'Excelente apartamento T3 no centro da Covilhã, totalmente renovado com vistas para a Serra da Estrela. Próximo de todas as comodidades, incluindo universidades, comércio e serviços de transporte.',
        nature: 'apartment',
        business_type: 'sale',
        price: 185000,
        price_on_request: false,
        gross_area: 120,
        useful_area: 105,
        bedrooms: 3,
        bathrooms: 2,
        construction_year: 2010,
        district: 'Castelo Branco',
        municipality: 'Covilhã',
        parish: 'São Martinho',
        address: 'Rua dos Combatentes, nº 123',
        postal_code: '6200-000',
        latitude: 40.2785,
        longitude: -7.5086,
        featured: true,
        status: 'published',
        video_url: null,
      })
      .select()
      .single();
    
    if (propertyError) {
      console.error('Error creating property:', propertyError);
      return NextResponse.json(
        { error: 'Failed to create property', details: propertyError },
        { status: 500 }
      );
    }
    
    if (!property) {
      return NextResponse.json(
        { error: 'Property not created - no data returned' },
        { status: 500 }
      );
    }
    
    // Add sample images
    const sampleImages = [
      {
        property_id: property.id,
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070',
        is_cover: true,
        order: 0,
      },
      {
        property_id: property.id,
        url: 'https://images.unsplash.com/photo-1600607687638-c74a877fd1f5?q=80&w=2070',
        is_cover: false,
        order: 1,
      },
      {
        property_id: property.id,
        url: 'https://images.unsplash.com/photo-1600566753376-12c8ac7ecb8e?q=80&w=2070',
        is_cover: false,
        order: 2,
      },
      {
        property_id: property.id,
        url: 'https://images.unsplash.com/photo-1600585154526-9908ded7f2b0?q=80&w=2070',
        is_cover: false,
        order: 3,
      },
      {
        property_id: property.id,
        url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075',
        is_cover: false,
        order: 4,
      },
    ];
    
    const { data: images, error: imagesError } = await supabase
      .from('property_images')
      .insert(sampleImages)
      .select();
    
    if (imagesError) {
      console.error('Error adding images:', imagesError);
      return NextResponse.json(
        { error: 'Failed to add images', details: imagesError },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      property: {
        id: property.id,
        title: property.title,
        slug: property.slug,
        price: property.price,
        images_count: images?.length || 0,
      },
      message: 'Sample property created successfully!',
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
