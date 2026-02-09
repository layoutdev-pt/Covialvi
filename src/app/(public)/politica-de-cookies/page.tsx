import { Metadata } from 'next';
import { company } from '@/lib/company';

export const metadata: Metadata = {
  title: 'Política de Cookies | Covialvi',
  description: 'Política de Cookies da Covialvi - Mediação Imobiliária. Saiba como utilizamos cookies no nosso website.',
};

export default function PoliticaCookiesPage() {
  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">Política de Cookies</h1>
        <p className="text-muted-foreground mb-8">Última atualização: Janeiro de 2026</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. O que são Cookies?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies são pequenos ficheiros de texto que são armazenados no seu dispositivo (computador, tablet ou 
              smartphone) quando visita um website. Os cookies permitem que o website reconheça o seu dispositivo e 
              memorize informações sobre a sua visita, como as suas preferências de idioma e outras configurações, 
              tornando a sua próxima visita mais fácil e o website mais útil para si.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Base Legal</h2>
            <p className="text-muted-foreground leading-relaxed">
              A utilização de cookies está sujeita à Lei n.º 41/2004, de 18 de agosto (Lei das Comunicações Eletrónicas), 
              alterada pela Lei n.º 46/2012, de 29 de agosto, que transpõe para o ordenamento jurídico português a 
              Diretiva 2002/58/CE (Diretiva ePrivacy), bem como ao Regulamento Geral sobre a Proteção de Dados (RGPD).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Tipos de Cookies Utilizados</h2>
            
            <div className="space-y-6">
              <div className="bg-secondary/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">3.1 Cookies Estritamente Necessários</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Estes cookies são essenciais para o funcionamento do website e não podem ser desativados. São 
                  geralmente definidos apenas em resposta a ações suas, como definir as suas preferências de 
                  privacidade, iniciar sessão ou preencher formulários.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-foreground">Cookie</th>
                        <th className="text-left py-2 text-foreground">Finalidade</th>
                        <th className="text-left py-2 text-foreground">Duração</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border/50">
                        <td className="py-2">session_id</td>
                        <td className="py-2">Identificação de sessão do utilizador</td>
                        <td className="py-2">Sessão</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2">csrf_token</td>
                        <td className="py-2">Proteção contra ataques CSRF</td>
                        <td className="py-2">Sessão</td>
                      </tr>
                      <tr>
                        <td className="py-2">cookie_consent</td>
                        <td className="py-2">Armazenamento das preferências de cookies</td>
                        <td className="py-2">1 ano</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-secondary/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">3.2 Cookies de Desempenho/Analíticos</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Estes cookies permitem-nos contar visitas e fontes de tráfego para podermos medir e melhorar o 
                  desempenho do nosso website. Ajudam-nos a saber quais as páginas mais e menos populares e a ver 
                  como os visitantes navegam pelo website.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-foreground">Cookie</th>
                        <th className="text-left py-2 text-foreground">Finalidade</th>
                        <th className="text-left py-2 text-foreground">Duração</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border/50">
                        <td className="py-2">_ga</td>
                        <td className="py-2">Google Analytics - Distinção de utilizadores</td>
                        <td className="py-2">2 anos</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2">_gid</td>
                        <td className="py-2">Google Analytics - Distinção de utilizadores</td>
                        <td className="py-2">24 horas</td>
                      </tr>
                      <tr>
                        <td className="py-2">_gat</td>
                        <td className="py-2">Google Analytics - Limitação de pedidos</td>
                        <td className="py-2">1 minuto</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-secondary/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">3.3 Cookies de Funcionalidade</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Estes cookies permitem que o website forneça funcionalidades e personalização melhoradas. Podem ser 
                  definidos por nós ou por fornecedores terceiros cujos serviços adicionámos às nossas páginas.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-foreground">Cookie</th>
                        <th className="text-left py-2 text-foreground">Finalidade</th>
                        <th className="text-left py-2 text-foreground">Duração</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border/50">
                        <td className="py-2">theme</td>
                        <td className="py-2">Preferência de tema (claro/escuro)</td>
                        <td className="py-2">1 ano</td>
                      </tr>
                      <tr>
                        <td className="py-2">favorites</td>
                        <td className="py-2">Imóveis favoritos (utilizadores não autenticados)</td>
                        <td className="py-2">30 dias</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-secondary/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">3.4 Cookies de Marketing/Publicidade</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Estes cookies podem ser definidos através do nosso website pelos nossos parceiros de publicidade. 
                  Podem ser utilizados por essas empresas para construir um perfil dos seus interesses e mostrar-lhe 
                  anúncios relevantes em outros websites.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-foreground">Cookie</th>
                        <th className="text-left py-2 text-foreground">Finalidade</th>
                        <th className="text-left py-2 text-foreground">Duração</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border/50">
                        <td className="py-2">_fbp</td>
                        <td className="py-2">Facebook Pixel - Rastreamento de conversões</td>
                        <td className="py-2">3 meses</td>
                      </tr>
                      <tr>
                        <td className="py-2">_gcl_au</td>
                        <td className="py-2">Google Ads - Rastreamento de conversões</td>
                        <td className="py-2">3 meses</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Gestão de Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Pode gerir as suas preferências de cookies a qualquer momento. A maioria dos navegadores permite:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Ver os cookies armazenados e eliminá-los individualmente</li>
              <li>Bloquear cookies de terceiros</li>
              <li>Bloquear cookies de websites específicos</li>
              <li>Bloquear todos os cookies</li>
              <li>Eliminar todos os cookies ao fechar o navegador</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Tenha em atenção que se optar por bloquear ou eliminar cookies, algumas funcionalidades do website 
              podem não funcionar corretamente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Como Configurar Cookies no seu Navegador</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Para gerir cookies no seu navegador, consulte as instruções específicas:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>
                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:underline">
                  Google Chrome
                </a>
              </li>
              <li>
                <a href="https://support.mozilla.org/pt-PT/kb/cookies-informacao-que-websites-guardam-no-seu-computador" target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:underline">
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a href="https://support.apple.com/pt-pt/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:underline">
                  Safari
                </a>
              </li>
              <li>
                <a href="https://support.microsoft.com/pt-pt/windows/eliminar-e-gerir-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:underline">
                  Microsoft Edge
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Cookies de Terceiros</h2>
            <p className="text-muted-foreground leading-relaxed">
              Alguns cookies são colocados por serviços de terceiros que aparecem nas nossas páginas. Não controlamos 
              a disseminação destes cookies. Deve consultar os websites desses terceiros para mais informações sobre 
              os seus cookies e como os gerir. Os principais terceiros cujos cookies podem aparecer no nosso website são:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Google (Analytics, Maps, Ads)</li>
              <li>Facebook (Pixel)</li>
              <li>Supabase (Autenticação)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Alterações à Política de Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              A Covialvi reserva-se o direito de alterar esta Política de Cookies a qualquer momento. Quaisquer 
              alterações serão publicadas nesta página, com indicação da data da última atualização. Recomendamos 
              a consulta regular desta política.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Mais Informações</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para mais informações sobre como tratamos os seus dados pessoais, consulte a nossa{' '}
              <a href="/politica-de-privacidade" className="text-yellow-500 hover:underline">Política de Privacidade</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Contactos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para questões relacionadas com a utilização de cookies, contacte-nos:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Email: {company.email}</li>
              <li>Telefone: {company.phone}</li>
              <li>Morada: {company.address.full}</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
