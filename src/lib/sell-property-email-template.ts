/**
 * Professional email template for property evaluation/sell wizard
 * Optimized for cold calling with all necessary context
 */

interface SellPropertyEmailData {
  // Contact details
  name?: string;
  email?: string;
  phone: string;
  
  // Property details
  propertyType: string;
  district: string;
  municipality: string;
  districtLabel: string;
  municipalityLabel: string;
  
  // Sale context
  sellingStage: string;
  estimatedValue: string;
  contactTiming: string;
  
  // Meta
  leadId?: string;
  submittedAt: string;
}

export function getSellPropertyEmailTemplate(data: SellPropertyEmailData): string {
  const {
    name,
    email,
    phone,
    propertyType,
    districtLabel,
    municipalityLabel,
    sellingStage,
    estimatedValue,
    contactTiming,
    leadId,
    submittedAt,
  } = data;

  // Map values to readable labels
  const propertyTypeLabels: Record<string, string> = {
    apartment: 'Apartamento',
    house: 'Moradia',
    land: 'Terreno',
    other: 'Outro',
  };

  const sellingStageLabels: Record<string, string> = {
    urgent: 'Quero vender o mais rapidamente possível',
    evaluating: 'Estou a avaliar o mercado',
    next_months: 'Pretendo vender nos próximos meses',
  };

  const estimatedValueLabels: Record<string, string> = {
    up_to_150k: 'Até 150.000 €',
    '150k_300k': '150.000 € – 300.000 €',
    '300k_500k': '300.000 € – 500.000 €',
    above_500k: 'Mais de 500.000 €',
    unknown: 'Não sei / Pretendo uma avaliação',
  };

  const contactTimingLabels: Record<string, string> = {
    asap: 'O mais breve possível',
    next_days: 'Nos próximos dias',
    info_only: 'Apenas para informações',
  };

  const propertyTypeLabel = propertyTypeLabels[propertyType] || propertyType;
  const sellingStageLabel = sellingStageLabels[sellingStage] || sellingStage;
  const estimatedValueLabel = estimatedValueLabels[estimatedValue] || estimatedValue;
  const contactTimingLabel = contactTimingLabels[contactTiming] || contactTiming;

  const isUrgent = sellingStage === 'urgent';
  const firstName = name?.split(' ')[0] || 'Cliente';

  return `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 700px;
          margin: 0 auto;
          padding: 20px;
          background: #f5f5f5;
        }
        .email-container {
          background: #fff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          color: #fff;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 26px;
        }
        .badge {
          display: inline-block;
          background: #d4af37;
          color: #fff;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .badge-urgent {
          background: #ff6b6b;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .content {
          padding: 30px;
        }
        .alert-urgent {
          background: #fff3cd;
          border-left: 4px solid #ff6b6b;
          padding: 15px;
          margin: 0 0 25px 0;
          border-radius: 4px;
        }
        .alert-urgent strong {
          color: #ff6b6b;
        }
        .section {
          margin-bottom: 30px;
          padding-bottom: 25px;
          border-bottom: 2px solid #f0f0f0;
        }
        .section:last-of-type {
          border-bottom: none;
        }
        .section-title {
          color: #1a1a1a;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .section-title::before {
          content: '';
          display: inline-block;
          width: 4px;
          height: 20px;
          background: #d4af37;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }
        .info-item {
          background: #f9f9f9;
          padding: 12px 15px;
          border-radius: 6px;
          border-left: 3px solid #d4af37;
        }
        .info-label {
          font-size: 11px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
          font-weight: 600;
        }
        .info-value {
          font-size: 15px;
          color: #1a1a1a;
          font-weight: 500;
        }
        .info-value.highlight {
          color: #d4af37;
          font-size: 18px;
          font-weight: 700;
        }
        .call-script {
          background: #fff9e6;
          border: 2px dashed #d4af37;
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
        }
        .call-script h3 {
          margin: 0 0 15px 0;
          color: #1a1a1a;
          font-size: 16px;
        }
        .call-script p {
          margin: 8px 0;
          font-size: 14px;
          line-height: 1.8;
        }
        .quick-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          flex-wrap: wrap;
        }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          background: #d4af37;
          color: #fff;
          text-decoration: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
        }
        .btn-secondary {
          background: #1a1a1a;
        }
        .metadata {
          background: #f5f5f5;
          padding: 20px;
          margin-top: 20px;
          border-radius: 6px;
          font-size: 13px;
          color: #666;
        }
        .footer {
          background: #1a1a1a;
          color: #fff;
          padding: 25px;
          text-align: center;
        }
        .footer p {
          margin: 5px 0;
          font-size: 13px;
          opacity: 0.9;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        
        <!-- Header -->
        <div class="header">
          <h1>🏡 Novo Pedido de Avaliação</h1>
          <span class="badge ${isUrgent ? 'badge-urgent' : ''}">
            ${isUrgent ? '⚡ URGENTE' : 'Formulário de Venda'}
          </span>
        </div>

        <div class="content">
          
          ${isUrgent ? `
          <div class="alert-urgent">
            <strong>⚡ ALTA PRIORIDADE:</strong> Cliente quer vender o mais rapidamente possível!
          </div>
          ` : ''}

          <!-- Contact Information -->
          <div class="section">
            <div class="section-title">📞 Informações de Contacto</div>
            <div class="info-grid">
              ${name ? `
              <div class="info-item">
                <div class="info-label">Nome Completo</div>
                <div class="info-value highlight">${name}</div>
              </div>
              ` : ''}
              <div class="info-item">
                <div class="info-label">Telefone</div>
                <div class="info-value">
                  <a href="tel:${phone}" style="color: #d4af37; text-decoration: none;">
                    ${phone}
                  </a>
                </div>
              </div>
              ${email ? `
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">
                  <a href="mailto:${email}" style="color: #d4af37; text-decoration: none;">
                    ${email}
                  </a>
                </div>
              </div>
              ` : ''}
              <div class="info-item">
                <div class="info-label">Preferência de Contacto</div>
                <div class="info-value">${contactTimingLabel}</div>
              </div>
            </div>
          </div>

          <!-- Property Details -->
          <div class="section">
            <div class="section-title">🏠 Detalhes do Imóvel</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Tipo de Imóvel</div>
                <div class="info-value highlight">${propertyTypeLabel}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Localização</div>
                <div class="info-value">${municipalityLabel}, ${districtLabel}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Valor Estimado</div>
                <div class="info-value">${estimatedValueLabel}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Fase de Venda</div>
                <div class="info-value">${sellingStageLabel}</div>
              </div>
            </div>
          </div>

          <!-- Cold Call Script -->
          <div class="call-script">
            <h3>📞 Script para Cold Call</h3>
            
            <p><strong>Abertura:</strong><br>
            "Bom dia/Boa tarde ${firstName}, o meu nome é [SEU NOME] da Covialvi Investimentos Imobiliários. Estou a ligar porque recebemos o seu pedido de avaliação de ${propertyTypeLabel.toLowerCase()} em ${municipalityLabel}. É um bom momento para falar?"</p>
            
            <p><strong>Qualificação:</strong><br>
            "Vi que ${sellingStageLabel.toLowerCase()}. ${estimatedValue === 'unknown' ? 'Gostaria de agendar uma visita para fazer uma avaliação profissional do imóvel?' : `Indicou um valor estimado de ${estimatedValueLabel}. Podemos agendar uma visita para confirmar o valor de mercado?`}"</p>
            
            ${isUrgent ? `
            <p><strong>Urgência:</strong><br>
            "Como indicou que pretende vender rapidamente, temos compradores ativos à procura de imóveis em ${municipalityLabel}. Quanto mais cedo avaliarmos, mais rápido conseguimos apresentar propostas."</p>
            ` : ''}
            
            <p><strong>Fecho:</strong><br>
            "Posso agendar uma visita ${contactTiming === 'asap' ? 'ainda hoje ou amanhã' : contactTiming === 'next_days' ? 'nos próximos dias' : 'esta semana'} para avaliar o imóvel e apresentar a nossa proposta de serviço? Que dia e horário funciona melhor para si?"</p>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions">
            <a href="tel:${phone}" class="btn">📞 Ligar Agora</a>
            ${email ? `<a href="mailto:${email}" class="btn btn-secondary">✉️ Enviar Email</a>` : ''}
            ${leadId ? `<a href="https://covialvi.vercel.app/admin/crm?lead=${leadId}" class="btn btn-secondary">🗂️ Ver no CRM</a>` : ''}
          </div>

          <!-- Metadata -->
          <div class="metadata">
            <strong>📊 Informações do Sistema</strong><br>
            📍 Origem: Formulário de Venda (Homepage)<br>
            🕐 Data/Hora: ${submittedAt}<br>
            🌐 Website: covialvi.vercel.app<br>
            ${leadId ? `🆔 Lead ID: ${leadId}` : ''}
          </div>

        </div>

        <!-- Footer -->
        <div class="footer">
          <p><strong>Covialvi Investimentos Imobiliários</strong></p>
          <p>${isUrgent ? '⚡ Responda URGENTEMENTE para maximizar a conversão!' : 'Responda rapidamente para maximizar a conversão!'}</p>
        </div>

      </div>
    </body>
    </html>
  `;
}
