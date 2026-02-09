'use client';

import Link from 'next/link';
import Image from 'next/image';
import { company } from '@/lib/company';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="https://media.egorealestate.com/ORIGINAL/ab9a/2a120afd-2b27-49b5-8934-8237e1cbab9a.png"
                alt="Covialvi"
                width={150}
                height={50}
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              A Covialvi é o seu parceiro de confiança para encontrar, comprar ou arrendar o imóvel perfeito. Transformamos os seus sonhos imobiliários em realidade.
            </p>
          </div>

          {/* Páginas Principais */}
          <div>
            <h3 className="font-semibold text-sm text-gray-400 mb-4 uppercase tracking-wider">Navegação</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/servicos" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Serviços
                </Link>
              </li>
              <li>
                <Link href="/imoveis" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Imóveis
                </Link>
              </li>
              <li>
                <Link href="/procuro-imovel" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Procuro Imóvel
                </Link>
              </li>
              <li>
                <Link href="/simulador-credito" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Simulador de Crédito
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Informações Legais */}
          <div>
            <h3 className="font-semibold text-sm text-gray-400 mb-4 uppercase tracking-wider">Informações</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/recrutamento" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Recrutamento
                </Link>
              </li>
              <li>
                <Link href="/termos-e-condicoes" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Termos e Condições
                </Link>
              </li>
              <li>
                <Link href="/politica-de-privacidade" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/politica-de-cookies" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Política de Cookies
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    localStorage.removeItem('covialvi_cookie_consent');
                    window.location.reload();
                  }}
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Configurar Cookies
                </button>
              </li>
            </ul>
          </div>

          {/* Contactos */}
          <div>
            <h3 className="font-semibold text-sm text-gray-400 mb-4 uppercase tracking-wider">Contactos</h3>
            <ul className="space-y-3">
              <li className="text-gray-300 text-sm">
                {company.address.full}
              </li>
              <li>
                <a href={`tel:${company.phoneTel}`} className="text-gray-300 hover:text-white transition-colors text-sm">
                  {company.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${company.email}`} className="text-gray-300 hover:text-white transition-colors text-sm">
                  {company.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-gray-500 text-xs leading-relaxed text-center">
            As imagens, simulações 3D e descrições técnicas apresentadas são meramente ilustrativas e podem não corresponder fielmente ao produto final. Todas as informações, incluindo dimensões, acabamentos e preços, estão sujeitas a confirmação e podem ser alteradas sem aviso prévio.
          </p>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-sm">
              © {currentYear} Covialvi - Construções, Lda. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <p className="text-gray-500 text-sm">
                Mediação Imobiliária
              </p>
              <span className="text-gray-700">|</span>
              <a
                href="https://www.layoutagency.pt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-yellow-500 text-sm transition-colors"
              >
                Desenvolvido por: Layout Agency
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
