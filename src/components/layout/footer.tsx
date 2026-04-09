'use client';

import Link from 'next/link';
import Image from 'next/image';
import { company } from '@/lib/company';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ background: '#d4d0c8', borderTop: '2px solid #ffffff', fontFamily: 'Tahoma, Arial, sans-serif' }}>
      {/* Status-bar style top strip */}
      <div style={{
        background: 'linear-gradient(to right, #0a246a 0%, #a6caf0 100%)',
        height: '4px',
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>

          {/* Brand panel */}
          <div style={{
            background: '#c8c4bc',
            borderTop: '2px solid #ffffff', borderLeft: '2px solid #ffffff',
            borderRight: '2px solid #808080', borderBottom: '2px solid #808080',
            padding: '12px',
          }}>
            {/* Title bar */}
            <div style={{
              background: 'linear-gradient(to right, #0a246a, #a6caf0)',
              color: '#fff', fontWeight: 'bold', fontSize: '11px',
              padding: '2px 6px', marginBottom: '8px',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <span>🏠</span> Covialvi.exe
            </div>
            <Link href="/" style={{ display: 'inline-block', marginBottom: '8px' }}>
              <Image
                src="https://media.egorealestate.com/ORIGINAL/ab9a/2a120afd-2b27-49b5-8934-8237e1cbab9a.png"
                alt="Covialvi"
                width={120}
                height={40}
                style={{ height: '32px', width: 'auto', filter: 'brightness(0)' }}
              />
            </Link>
            <p style={{ fontSize: '11px', color: '#444', lineHeight: 1.5 }}>
              A Covialvi é o seu parceiro de confiança para encontrar, comprar ou arrendar o imóvel perfeito em Portugal.
            </p>
          </div>

          {/* Navigation panel */}
          <div style={{
            background: '#c8c4bc',
            borderTop: '2px solid #ffffff', borderLeft: '2px solid #ffffff',
            borderRight: '2px solid #808080', borderBottom: '2px solid #808080',
            padding: '12px',
          }}>
            <div style={{ background: 'linear-gradient(to right, #0a246a, #a6caf0)', color: '#fff', fontWeight: 'bold', fontSize: '11px', padding: '2px 6px', marginBottom: '8px' }}>
              Navegação
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {[
                { href: '/', label: 'Início' },
                { href: '/sobre', label: 'Sobre Nós' },
                { href: '/servicos', label: 'Serviços' },
                { href: '/imoveis', label: 'Imóveis' },
                { href: '/procuro-imovel', label: 'Procuro Imóvel' },
                { href: '/contacto', label: 'Contacto' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    style={{ display: 'block', padding: '3px 8px', fontSize: '12px', color: '#0000cc', textDecoration: 'underline' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#0a246a'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#0000cc'; }}
                  >
                    &gt; {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal panel */}
          <div style={{
            background: '#c8c4bc',
            borderTop: '2px solid #ffffff', borderLeft: '2px solid #ffffff',
            borderRight: '2px solid #808080', borderBottom: '2px solid #808080',
            padding: '12px',
          }}>
            <div style={{ background: 'linear-gradient(to right, #0a246a, #a6caf0)', color: '#fff', fontWeight: 'bold', fontSize: '11px', padding: '2px 6px', marginBottom: '8px' }}>
              Informações Legais
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {[
                { href: '/recrutamento', label: 'Recrutamento' },
                { href: '/termos-e-condicoes', label: 'Termos e Condições' },
                { href: '/politica-de-privacidade', label: 'Política de Privacidade' },
                { href: '/politica-de-cookies', label: 'Política de Cookies' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    style={{ display: 'block', padding: '3px 8px', fontSize: '12px', color: '#0000cc', textDecoration: 'underline' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#0a246a'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#0000cc'; }}
                  >
                    &gt; {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={() => { localStorage.removeItem('covialvi_cookie_consent'); window.location.reload(); }}
                  style={{ display: 'block', padding: '3px 8px', fontSize: '12px', color: '#0000cc', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Tahoma, Arial', width: '100%', textAlign: 'left' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#0a246a'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#0000cc'; }}
                >
                  &gt; Configurar Cookies
                </button>
              </li>
            </ul>
            <div style={{ marginTop: '8px' }}>
              <a href="https://www.livroreclamacoes.pt/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', opacity: 0.9 }}>
                <Image src="/images/footer/livro-reclamacoes.png" alt="Livro de Reclamações Eletrónico" width={100} height={34} style={{ height: '28px', width: 'auto' }} />
              </a>
            </div>
          </div>

          {/* Contacts panel */}
          <div style={{
            background: '#c8c4bc',
            borderTop: '2px solid #ffffff', borderLeft: '2px solid #ffffff',
            borderRight: '2px solid #808080', borderBottom: '2px solid #808080',
            padding: '12px',
          }}>
            <div style={{ background: 'linear-gradient(to right, #0a246a, #a6caf0)', color: '#fff', fontWeight: 'bold', fontSize: '11px', padding: '2px 6px', marginBottom: '8px' }}>
              Contactos
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#000' }}>
              <div style={{ background: '#fff', border: '1px inset #808080', padding: '4px 6px', fontSize: '11px' }}>
                📍 {company.address.full}
              </div>
              <a href={`tel:${company.phoneTel}`} style={{ color: '#0000cc', textDecoration: 'underline', fontSize: '12px' }}>
                📞 {company.phone}
              </a>
              <a href={`mailto:${company.email}`} style={{ color: '#0000cc', textDecoration: 'underline', fontSize: '12px' }}>
                ✉️ {company.email}
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ background: '#fff', border: '2px inset #808080', padding: '8px 12px' }}>
          <p style={{ fontSize: '11px', color: '#555', lineHeight: 1.5, margin: 0 }}>
            ⚠️ As imagens, simulações 3D e descrições técnicas apresentadas são meramente ilustrativas e podem não corresponder fielmente ao produto final. Todas as informações, incluindo dimensões, acabamentos e preços, estão sujeitas a confirmação e podem ser alteradas sem aviso prévio.
          </p>
        </div>

        {/* Status bar */}
        <div style={{
          background: '#c8c4bc',
          borderTop: '1px solid #808080',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '4px 8px',
          flexWrap: 'wrap', gap: '8px',
        }}>
          <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            <div style={{ border: '1px inset #808080', padding: '2px 8px', fontSize: '11px', color: '#000' }}>
              © {currentYear} Covialvi - Construções, Lda.
            </div>
            <div style={{ border: '1px inset #808080', padding: '2px 8px', fontSize: '11px', color: '#000' }}>
              Mediação Imobiliária
            </div>
          </div>
          <a
            href="https://www.layoutagency.pt"
            target="_blank"
            rel="noopener noreferrer"
            style={{ border: '1px inset #808080', padding: '2px 8px', fontSize: '11px', color: '#0000cc', textDecoration: 'none' }}
          >
            Desenvolvido por: Layout Agency
          </a>
        </div>
      </div>
    </footer>
  );
}
