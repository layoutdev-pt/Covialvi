import { company } from '@/lib/company';

export default async function CookiesPolicyPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-foreground text-white py-16">
        <div className="container-wide">
          <h1 className="font-display text-display-lg mb-4">Política de Cookies</h1>
          <p className="text-gray-400">Última atualização: Março 2025</p>
        </div>
      </div>

      <div className="container-wide section-padding">
        <div className="max-w-4xl mx-auto prose prose-gray">
          <h2>1. O que são Cookies?</h2>
          <p>
            Cookies são pequenos ficheiros de texto armazenados no seu dispositivo quando visita um website.
            Permitem que o website reconheça o seu dispositivo e memorize informações sobre a sua visita,
            melhorando a sua experiência de navegação.
          </p>
          <p>
            Para além de cookies, este website utiliza também <strong>armazenamento local (localStorage)</strong> do browser 
            para guardar preferências do utilizador. Estas informações ficam apenas no seu dispositivo e não são 
            transmitidas para servidores externos.
          </p>

          <h2>2. Tipos de Cookies e Tecnologias que Utilizamos</h2>

          <h3>2.1. Cookies Estritamente Necessários</h3>
          <p>
            Essenciais para o funcionamento do website. Sem estes cookies algumas funcionalidades, 
            como a autenticação, não funcionam. Não podem ser desativados.
          </p>
          <table>
            <thead>
              <tr>
                <th>Cookie / Chave</th>
                <th>Fornecedor</th>
                <th>Finalidade</th>
                <th>Tipo</th>
                <th>Duração</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>sb-[projeto]-auth-token</td>
                <td>Supabase</td>
                <td>Autenticação do utilizador — mantém a sessão ativa após início de sessão</td>
                <td>Cookie HTTP</td>
                <td>Sessão / até expirar o token</td>
              </tr>
              <tr>
                <td>sb-[projeto]-auth-token-code-verifier</td>
                <td>Supabase</td>
                <td>Verificação PKCE durante o fluxo de autenticação OAuth</td>
                <td>Cookie HTTP</td>
                <td>Sessão</td>
              </tr>
              <tr>
                <td>covialvi_cookie_consent</td>
                <td>Covialvi</td>
                <td>Guarda as preferências de consentimento de cookies do utilizador</td>
                <td>localStorage</td>
                <td>Persistente (até limpeza do browser)</td>
              </tr>
              <tr>
                <td>covialvi_cookie_preferences</td>
                <td>Covialvi</td>
                <td>Guarda as preferências detalhadas de cookies (essenciais, análise)</td>
                <td>localStorage</td>
                <td>Persistente (até limpeza do browser)</td>
              </tr>
              <tr>
                <td>theme</td>
                <td>Covialvi</td>
                <td>Guarda a preferência de tema visual (claro/escuro) do utilizador</td>
                <td>localStorage</td>
                <td>Persistente (até limpeza do browser)</td>
              </tr>
            </tbody>
          </table>

          <h3>2.2. Cookies de Análise e Desempenho</h3>
          <p>
            Utilizados apenas com o seu consentimento. Permitem-nos compreender como os visitantes 
            utilizam o website para melhorar a experiência. Todos os dados recolhidos são 
            <strong> anónimos e agregados</strong> — nenhuma informação pessoal é armazenada.
          </p>
          <table>
            <thead>
              <tr>
                <th>Serviço</th>
                <th>Fornecedor</th>
                <th>Finalidade</th>
                <th>Cookies / Identificadores</th>
                <th>Duração dos dados</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Vercel Web Analytics</td>
                <td>Vercel Inc.</td>
                <td>
                  Estatísticas anónimas de visitas: páginas vistas, fontes de tráfego, país de acesso.
                  Não utiliza cookies — o visitante é identificado por um hash temporário gerado 
                  a partir do pedido HTTP, sem armazenar IP ou dados pessoais.
                </td>
                <td>Sem cookies — identificação por hash anónimo</td>
                <td>Sessão descartada ao fim de 24 horas</td>
              </tr>
              <tr>
                <td>Vercel Speed Insights</td>
                <td>Vercel Inc.</td>
                <td>
                  Medição de métricas de desempenho da página (Core Web Vitals: LCP, FID, CLS).
                  Os dados são anónimos e não permitem identificar qualquer utilizador individualmente.
                </td>
                <td>Sem cookies — dados recolhidos via API nativa do browser</td>
                <td>Dados anónimos agregados</td>
              </tr>
            </tbody>
          </table>
          <p>
            <strong>Nota importante:</strong> O Vercel Web Analytics e o Vercel Speed Insights foram 
            concebidos para conformidade com o RGPD. Não utilizam cookies de rastreamento, não 
            recolhem endereços IP e não partilham dados com terceiros para fins publicitários. 
            Mais informação: <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener noreferrer">Política de Privacidade da Vercel Analytics</a>.
          </p>

          <h2>3. Cookies que NÃO Utilizamos</h2>
          <p>
            Para total transparência, confirmamos que este website <strong>não utiliza</strong>:
          </p>
          <ul>
            <li>Google Analytics ou qualquer produto de análise da Google</li>
            <li>Facebook Pixel ou qualquer tecnologia de rastreamento da Meta</li>
            <li>Cookies de publicidade ou retargeting</li>
            <li>Cookies de redes sociais de terceiros</li>
          </ul>

          <h2>4. Base Legal (RGPD)</h2>
          <p>
            Nos termos do Regulamento Geral sobre a Proteção de Dados (RGPD — Regulamento UE 2016/679) 
            e da Lei n.º 58/2019:
          </p>
          <ul>
            <li><strong>Cookies essenciais</strong>: base legal de <em>interesse legítimo</em> e <em>execução contratual</em> — necessários para fornecer o serviço solicitado.</li>
            <li><strong>Cookies de análise</strong> (Vercel Analytics/Speed Insights): base legal de <em>consentimento</em> — apenas ativados após o utilizador aceitar cookies de análise no banner de consentimento. Por serem cookieless e anónimos, a exigência de consentimento é aplicada de forma conservadora para máxima transparência.</li>
          </ul>

          <h2>5. Como Gerir as Suas Preferências</h2>

          <h3>5.1. Banner de Consentimento</h3>
          <p>
            Na primeira visita ao website é apresentado um banner que lhe permite aceitar todos os cookies, 
            apenas os essenciais, ou personalizar as suas preferências. Pode alterar as suas escolhas a 
            qualquer momento limpando o armazenamento local do browser.
          </p>

          <h3>5.2. Através do Seu Browser</h3>
          <p>
            Pode controlar e eliminar cookies através das definições do seu browser:
          </p>
          <ul>
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/pt-PT/kb/cookies-informacao-que-websites-guardam-no-seu-computador" target="_blank" rel="noopener">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/pt-pt/guide/safari/sfri11471/mac" target="_blank" rel="noopener">Safari</a></li>
            <li><a href="https://support.microsoft.com/pt-pt/microsoft-edge/eliminar-cookies-no-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener">Microsoft Edge</a></li>
          </ul>

          <h2>6. Fornecedores de Terceiros</h2>
          <p>
            Os serviços de terceiros utilizados neste website e as respetivas políticas de privacidade:
          </p>
          <ul>
            <li><a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel Inc. — Política de Privacidade</a> (alojamento e analytics)</li>
            <li><a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase Inc. — Política de Privacidade</a> (base de dados e autenticação)</li>
          </ul>

          <h2>7. Impacto da Desativação de Cookies</h2>
          <p>
            Se desativar os cookies essenciais, as seguintes funcionalidades poderão não funcionar:
          </p>
          <ul>
            <li>Início e manutenção de sessão (área de conta)</li>
            <li>Memorização de preferências (tema, idioma)</li>
            <li>Funcionalidades de favoritos e alertas de imóveis</li>
          </ul>
          <p>
            A desativação dos cookies de análise não afeta a navegação — apenas deixamos de recolher 
            estatísticas anónimas de utilização.
          </p>

          <h2>8. Alterações a Esta Política</h2>
          <p>
            Podemos atualizar esta Política de Cookies periodicamente para refletir alterações nos 
            serviços utilizados ou na legislação aplicável. Quaisquer alterações serão publicadas 
            nesta página com a data de atualização.
          </p>

          <h2>9. Contacto</h2>
          <p>
            Para questões sobre a nossa utilização de cookies ou para exercer os seus direitos ao 
            abrigo do RGPD, contacte-nos:
          </p>
          <ul>
            <li>Email: {company.email}</li>
            <li>Telefone: {company.phone}</li>
            <li>Morada: {company.address.full}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
