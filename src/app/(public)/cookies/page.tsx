import { getTranslations } from 'next-intl/server';

export default async function CookiesPolicyPage() {
  const t = await getTranslations();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-foreground text-white py-16">
        <div className="container-wide">
          <h1 className="font-display text-display-lg mb-4">Política de Cookies</h1>
          <p className="text-gray-400">Última atualização: Janeiro 2024</p>
        </div>
      </div>

      <div className="container-wide section-padding">
        <div className="max-w-4xl mx-auto prose prose-gray">
          <h2>1. O que são Cookies?</h2>
          <p>
            Cookies são pequenos ficheiros de texto que são armazenados no seu 
            dispositivo (computador, tablet ou telemóvel) quando visita um website. 
            Os cookies permitem que o website reconheça o seu dispositivo e memorize 
            informações sobre a sua visita.
          </p>

          <h2>2. Tipos de Cookies que Utilizamos</h2>
          
          <h3>2.1. Cookies Estritamente Necessários</h3>
          <p>
            Estes cookies são essenciais para o funcionamento do website e não 
            podem ser desativados. Incluem:
          </p>
          <table>
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Finalidade</th>
                <th>Duração</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>session</td>
                <td>Gestão da sessão do utilizador</td>
                <td>Sessão</td>
              </tr>
              <tr>
                <td>csrf_token</td>
                <td>Proteção contra ataques CSRF</td>
                <td>Sessão</td>
              </tr>
              <tr>
                <td>cookie_consent</td>
                <td>Armazenar preferências de cookies</td>
                <td>1 ano</td>
              </tr>
            </tbody>
          </table>

          <h3>2.2. Cookies de Desempenho/Análise</h3>
          <p>
            Estes cookies permitem-nos analisar como os visitantes utilizam o 
            website, para melhorar a sua experiência:
          </p>
          <table>
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Finalidade</th>
                <th>Duração</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>_ga</td>
                <td>Google Analytics - distinguir utilizadores</td>
                <td>2 anos</td>
              </tr>
              <tr>
                <td>_gid</td>
                <td>Google Analytics - distinguir utilizadores</td>
                <td>24 horas</td>
              </tr>
              <tr>
                <td>_gat</td>
                <td>Google Analytics - limitar taxa de pedidos</td>
                <td>1 minuto</td>
              </tr>
            </tbody>
          </table>

          <h3>2.3. Cookies de Funcionalidade</h3>
          <p>
            Estes cookies permitem funcionalidades melhoradas e personalização:
          </p>
          <table>
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Finalidade</th>
                <th>Duração</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>locale</td>
                <td>Preferência de idioma</td>
                <td>1 ano</td>
              </tr>
              <tr>
                <td>theme</td>
                <td>Preferência de tema (claro/escuro)</td>
                <td>1 ano</td>
              </tr>
            </tbody>
          </table>

          <h3>2.4. Cookies de Marketing</h3>
          <p>
            Estes cookies são utilizados para apresentar anúncios relevantes:
          </p>
          <table>
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Finalidade</th>
                <th>Duração</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>_fbp</td>
                <td>Facebook Pixel - rastreamento de conversões</td>
                <td>3 meses</td>
              </tr>
            </tbody>
          </table>

          <h2>3. Como Gerir Cookies</h2>
          <p>
            Pode gerir as suas preferências de cookies de várias formas:
          </p>
          
          <h3>3.1. Através do Nosso Banner de Cookies</h3>
          <p>
            Quando visita o nosso website pela primeira vez, é apresentado um 
            banner que lhe permite aceitar ou personalizar as suas preferências 
            de cookies.
          </p>

          <h3>3.2. Através do Seu Browser</h3>
          <p>
            A maioria dos browsers permite controlar cookies através das definições. 
            Consulte a ajuda do seu browser para mais informações:
          </p>
          <ul>
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/pt-PT/kb/cookies-informacao-que-websites-guardam-no-seu-computador" target="_blank" rel="noopener">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/pt-pt/guide/safari/sfri11471/mac" target="_blank" rel="noopener">Safari</a></li>
            <li><a href="https://support.microsoft.com/pt-pt/microsoft-edge/eliminar-cookies-no-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener">Microsoft Edge</a></li>
          </ul>

          <h2>4. Cookies de Terceiros</h2>
          <p>
            Alguns cookies são colocados por serviços de terceiros que aparecem 
            nas nossas páginas. Não controlamos estes cookies e recomendamos que 
            consulte as políticas de privacidade desses terceiros:
          </p>
          <ul>
            <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google Analytics</a></li>
            <li><a href="https://www.facebook.com/privacy/explanation" target="_blank" rel="noopener">Facebook</a></li>
          </ul>

          <h2>5. Impacto da Desativação de Cookies</h2>
          <p>
            Se optar por desativar cookies, algumas funcionalidades do website 
            podem não funcionar corretamente, incluindo:
          </p>
          <ul>
            <li>Manutenção da sessão iniciada</li>
            <li>Memorização de preferências</li>
            <li>Funcionalidades de favoritos</li>
          </ul>

          <h2>6. Alterações a Esta Política</h2>
          <p>
            Podemos atualizar esta Política de Cookies periodicamente. Quaisquer 
            alterações serão publicadas nesta página com a data de atualização.
          </p>

          <h2>7. Contacto</h2>
          <p>
            Para questões sobre a nossa utilização de cookies, contacte-nos:
          </p>
          <ul>
            <li>Email: privacidade@covialvi.com</li>
            <li>Telefone: +351 275 000 000</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
