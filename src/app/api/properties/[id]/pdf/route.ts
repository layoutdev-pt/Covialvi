import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { company } from '@/lib/company';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient();
    
    // Fetch property with images
    const { data: property, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_images (*)
      `)
      .eq('id', params.id)
      .single();

    if (error || !property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Format price
    const formatPrice = (price: number | null) => {
      if (price === null) return 'Sob Consulta';
      return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
      }).format(price);
    };

    // Get cover image
    const coverImage = property.property_images?.find((img: any) => img.is_cover) || 
                       property.property_images?.[0];

    // Labels
    const businessTypeLabels: Record<string, string> = {
      sale: 'Venda',
      rent: 'Arrendamento',
      transfer: 'Trespasse',
    };

    const natureLabels: Record<string, string> = {
      apartment: 'Apartamento',
      house: 'Moradia',
      land: 'Terreno',
      commercial: 'Comercial',
      warehouse: 'Armazém',
      office: 'Escritório',
      garage: 'Garagem',
      shop: 'Loja',
    };

    const constructionStatusLabels: Record<string, string> = {
      new: 'Novo',
      used: 'Usado',
      under_construction: 'Em Construção',
      to_recover: 'Para Recuperar',
      renovated: 'Renovado',
    };

    // Generate HTML for PDF
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${property.title} - Covialvi</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            color: #1a1a1a;
            line-height: 1.6;
          }
          .page {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            background: white;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 15px;
            border-bottom: 2px solid #eab308;
            margin-bottom: 20px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #eab308;
          }
          .ref {
            font-size: 12px;
            color: #666;
          }
          .hero-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 12px;
            margin-bottom: 20px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 8px;
          }
          .location {
            font-size: 14px;
            color: #666;
            margin-bottom: 15px;
          }
          .price {
            font-size: 32px;
            font-weight: bold;
            color: #eab308;
            margin-bottom: 20px;
          }
          .badge {
            display: inline-block;
            background: #fef9c3;
            color: #854d0e;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-right: 8px;
            margin-bottom: 20px;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #eee;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .detail-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f5f5f5;
          }
          .detail-label {
            color: #666;
            font-size: 13px;
          }
          .detail-value {
            font-weight: 500;
            font-size: 13px;
          }
          .description {
            font-size: 13px;
            color: #444;
            white-space: pre-line;
          }
          .features-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
          .feature-item {
            font-size: 13px;
            color: #444;
            padding: 4px 0;
          }
          .feature-item:before {
            content: "✓ ";
            color: #eab308;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #eab308;
            text-align: center;
          }
          .footer-contact {
            font-size: 14px;
            color: #1a1a1a;
            margin-bottom: 5px;
          }
          .footer-info {
            font-size: 11px;
            color: #888;
          }
          .qr-section {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin-top: 15px;
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
          }
          .qr-text {
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div class="logo">Covialvi</div>
            <div class="ref">Ref: ${property.reference || property.slug}</div>
          </div>
          
          ${coverImage ? `<img src="${coverImage.url}" class="hero-image" alt="${property.title}">` : ''}
          
          <div class="badge">${businessTypeLabels[property.business_type] || 'Venda'}</div>
          ${property.nature ? `<div class="badge">${natureLabels[property.nature] || property.nature}</div>` : ''}
          
          <h1 class="title">${property.title}</h1>
          <p class="location">📍 ${[property.parish, property.municipality, property.district].filter(Boolean).join(', ') || 'Portugal'}</p>
          <p class="price">${property.price_on_request ? 'Preço sob consulta' : formatPrice(property.price)}</p>
          
          <div class="section">
            <h2 class="section-title">Características</h2>
            <div class="details-grid">
              ${property.typology ? `
              <div class="detail-item">
                <span class="detail-label">Tipologia</span>
                <span class="detail-value">${property.typology}</span>
              </div>
              ` : ''}
              ${property.bedrooms ? `
              <div class="detail-item">
                <span class="detail-label">Quartos</span>
                <span class="detail-value">${property.bedrooms}</span>
              </div>
              ` : ''}
              ${property.bathrooms ? `
              <div class="detail-item">
                <span class="detail-label">Casas de Banho</span>
                <span class="detail-value">${property.bathrooms}</span>
              </div>
              ` : ''}
              ${property.gross_area ? `
              <div class="detail-item">
                <span class="detail-label">Área Bruta</span>
                <span class="detail-value">${property.gross_area} m²</span>
              </div>
              ` : ''}
              ${property.useful_area ? `
              <div class="detail-item">
                <span class="detail-label">Área Útil</span>
                <span class="detail-value">${property.useful_area} m²</span>
              </div>
              ` : ''}
              ${property.construction_status ? `
              <div class="detail-item">
                <span class="detail-label">Estado</span>
                <span class="detail-value">${constructionStatusLabels[property.construction_status] || property.construction_status}</span>
              </div>
              ` : ''}
              ${property.energy_certificate ? `
              <div class="detail-item">
                <span class="detail-label">Certificado Energético</span>
                <span class="detail-value">${property.energy_certificate}</span>
              </div>
              ` : ''}
              ${property.floors ? `
              <div class="detail-item">
                <span class="detail-label">Piso</span>
                <span class="detail-value">${property.floors}</span>
              </div>
              ` : ''}
            </div>
          </div>
          
          ${property.description ? `
          <div class="section">
            <h2 class="section-title">Descrição</h2>
            <p class="description">${property.description}</p>
          </div>
          ` : ''}
          
          ${property.equipment && property.equipment.length > 0 ? `
          <div class="section">
            <h2 class="section-title">Equipamento</h2>
            <div class="features-list">
              ${property.equipment.map((item: string) => `<div class="feature-item">${item}</div>`).join('')}
            </div>
          </div>
          ` : ''}
          
          ${property.extras && property.extras.length > 0 ? `
          <div class="section">
            <h2 class="section-title">Extras</h2>
            <div class="features-list">
              ${property.extras.map((item: string) => `<div class="feature-item">${item}</div>`).join('')}
            </div>
          </div>
          ` : ''}
          
          <div class="footer">
            <p class="footer-contact">
              <strong>${company.name}</strong><br>
              📞 ${company.phone} | ✉️ ${company.email}
            </p>
            <p class="footer-info">
              www.covialvi.com<br>
              Documento gerado em ${new Date().toLocaleDateString('pt-PT')}
            </p>
            <div class="qr-section">
              <span class="qr-text">Visite este imóvel online em:<br><strong>covialvi.com/imoveis/${property.slug}</strong></span>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Return HTML that can be printed as PDF
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${property.slug}-covialvi.html"`,
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
