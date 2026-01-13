import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const title = searchParams.get('title') || 'Covialvi - Imobiliária';
  const price = searchParams.get('price') || '';
  const location = searchParams.get('location') || 'Portugal';
  const type = searchParams.get('type') || '';
  const image = searchParams.get('image') || '';
  const bedrooms = searchParams.get('bedrooms') || '';
  const bathrooms = searchParams.get('bathrooms') || '';
  const area = searchParams.get('area') || '';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0a0a0a',
          position: 'relative',
        }}
      >
        {/* Background Image */}
        {image && (
          <img
            src={image}
            alt=""
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.4,
            }}
          />
        )}
        
        {/* Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 100%)',
          }}
        />
        
        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            padding: '60px',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* Top - Logo & Type Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: '#eab308',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#000' }}>C</span>
              </div>
              <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>Covialvi</span>
            </div>
            {type && (
              <div
                style={{
                  backgroundColor: '#eab308',
                  color: '#000',
                  padding: '12px 24px',
                  borderRadius: '50px',
                  fontSize: '20px',
                  fontWeight: '600',
                }}
              >
                {type}
              </div>
            )}
          </div>
          
          {/* Middle - Title & Location */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h1
              style={{
                fontSize: '52px',
                fontWeight: 'bold',
                color: '#fff',
                lineHeight: 1.2,
                maxWidth: '900px',
                margin: 0,
              }}
            >
              {title.length > 60 ? title.substring(0, 60) + '...' : title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span style={{ fontSize: '24px', color: 'rgba(255,255,255,0.8)' }}>{location}</span>
            </div>
          </div>
          
          {/* Bottom - Price & Features */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {price && (
                <span style={{ fontSize: '48px', fontWeight: 'bold', color: '#eab308' }}>
                  {price}
                </span>
              )}
            </div>
            
            {/* Property Features */}
            <div style={{ display: 'flex', gap: '32px' }}>
              {bedrooms && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <path d="M2 4v16" />
                    <path d="M2 8h18a2 2 0 0 1 2 2v10" />
                    <path d="M2 17h20" />
                    <path d="M6 8v9" />
                  </svg>
                  <span style={{ fontSize: '24px', color: '#fff' }}>{bedrooms}</span>
                </div>
              )}
              {bathrooms && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
                    <line x1="10" x2="8" y1="5" y2="7" />
                    <line x1="2" x2="22" y1="12" y2="12" />
                    <line x1="7" x2="7" y1="19" y2="21" />
                    <line x1="17" x2="17" y1="19" y2="21" />
                  </svg>
                  <span style={{ fontSize: '24px', color: '#fff' }}>{bathrooms}</span>
                </div>
              )}
              {area && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>
                  <span style={{ fontSize: '24px', color: '#fff' }}>{area} m²</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
