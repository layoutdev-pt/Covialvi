import { getTranslations } from 'next-intl/server';
import { company } from '@/lib/company';

export default async function PrivacyPolicyPage() {
  const t = await getTranslations();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-foreground text-white py-16">
        <div className="container-wide">
          <h1 className="font-display text-display-lg mb-4">Política de Privacidade</h1>
          <p className="text-gray-400">Última atualização: Janeiro 2024</p>
        </div>
      </div>

      <div className="container-wide section-padding">
        <div className="max-w-4xl mx-auto prose prose-gray">
          <h2>1. Responsável pelo Tratamento</h2>
          <p>
            A {company.name}, com sede em {company.address.full}, é a entidade responsável pelo tratamento 
            dos dados pessoais recolhidos através deste website.
          </p>

          <h2>2. Dados Pessoais Recolhidos</h2>
          <p>
            Recolhemos os seguintes tipos de dados pessoais:
          </p>
          <ul>
            <li><strong>Dados de identificação:</strong> nome, apelido, email, telefone</li>
            <li><strong>Dados de navegação:</strong> endereço IP, tipo de browser, páginas visitadas</li>
            <li><strong>Dados de preferências:</strong> imóveis favoritos, pesquisas guardadas</li>
            <li><strong>Dados de comunicação:</strong> mensagens enviadas através do website</li>
          </ul>

          <h2>3. Finalidades do Tratamento</h2>
          <p>
            Os seus dados pessoais são tratados para as seguintes finalidades:
          </p>
          <ul>
            <li>Prestação de serviços de mediação imobiliária</li>
            <li>Gestão de pedidos de informação e agendamento de visitas</li>
            <li>Envio de comunicações de marketing (com consentimento)</li>
            <li>Alertas sobre novos imóveis (com consentimento)</li>
            <li>Melhoria dos nossos serviços e website</li>
            <li>Cumprimento de obrigações legais</li>
          </ul>

          <h2>4. Base Legal</h2>
          <p>
            O tratamento dos seus dados pessoais baseia-se em:
          </p>
          <ul>
            <li><strong>Execução de contrato:</strong> para prestação dos serviços solicitados</li>
            <li><strong>Consentimento:</strong> para comunicações de marketing e alertas</li>
            <li><strong>Interesse legítimo:</strong> para melhoria dos serviços</li>
            <li><strong>Obrigação legal:</strong> para cumprimento de obrigações fiscais e legais</li>
          </ul>

          <h2>5. Partilha de Dados</h2>
          <p>
            Os seus dados pessoais podem ser partilhados com:
          </p>
          <ul>
            <li>Prestadores de serviços (alojamento web, email marketing)</li>
            <li>Autoridades públicas (quando legalmente exigido)</li>
            <li>Parceiros de negócio (com o seu consentimento)</li>
          </ul>
          <p>
            Não vendemos nem alugamos os seus dados pessoais a terceiros.
          </p>

          <h2>6. Transferências Internacionais</h2>
          <p>
            Alguns dos nossos prestadores de serviços podem estar localizados fora 
            do Espaço Económico Europeu. Nestes casos, garantimos que existem 
            salvaguardas adequadas para proteger os seus dados, incluindo cláusulas 
            contratuais-tipo aprovadas pela Comissão Europeia.
          </p>

          <h2>7. Período de Conservação</h2>
          <p>
            Os seus dados pessoais são conservados pelo período necessário para 
            as finalidades para as quais foram recolhidos:
          </p>
          <ul>
            <li>Dados de clientes: 10 anos após o último contacto</li>
            <li>Dados de marketing: até retirada do consentimento</li>
            <li>Dados de navegação: 26 meses</li>
          </ul>

          <h2>8. Os Seus Direitos</h2>
          <p>
            Nos termos do Regulamento Geral sobre a Proteção de Dados (RGPD), 
            tem os seguintes direitos:
          </p>
          <ul>
            <li><strong>Direito de acesso:</strong> obter confirmação e acesso aos seus dados</li>
            <li><strong>Direito de retificação:</strong> corrigir dados inexatos ou incompletos</li>
            <li><strong>Direito ao apagamento:</strong> solicitar a eliminação dos seus dados</li>
            <li><strong>Direito à limitação:</strong> restringir o tratamento dos seus dados</li>
            <li><strong>Direito à portabilidade:</strong> receber os seus dados em formato estruturado</li>
            <li><strong>Direito de oposição:</strong> opor-se ao tratamento dos seus dados</li>
            <li><strong>Direito de retirar o consentimento:</strong> a qualquer momento</li>
          </ul>
          <p>
            Para exercer estes direitos, contacte-nos através de {company.email}.
          </p>

          <h2>9. Segurança</h2>
          <p>
            Implementamos medidas técnicas e organizativas adequadas para proteger 
            os seus dados pessoais contra acesso não autorizado, perda, destruição 
            ou alteração, incluindo:
          </p>
          <ul>
            <li>Encriptação de dados em trânsito (HTTPS)</li>
            <li>Controlo de acessos</li>
            <li>Backups regulares</li>
            <li>Formação de colaboradores</li>
          </ul>

          <h2>10. Cookies</h2>
          <p>
            Este website utiliza cookies. Para mais informações, consulte a nossa 
            Política de Cookies.
          </p>

          <h2>11. Menores</h2>
          <p>
            Este website não se destina a menores de 18 anos. Não recolhemos 
            intencionalmente dados pessoais de menores.
          </p>

          <h2>12. Alterações à Política</h2>
          <p>
            Reservamo-nos o direito de alterar esta Política de Privacidade. 
            Quaisquer alterações serão publicadas nesta página com indicação 
            da data de atualização.
          </p>

          <h2>13. Reclamações</h2>
          <p>
            Se considerar que o tratamento dos seus dados pessoais viola a 
            legislação aplicável, tem o direito de apresentar uma reclamação 
            junto da Comissão Nacional de Proteção de Dados (CNPD).
          </p>

          <h2>14. Contacto</h2>
          <p>
            Para questões relacionadas com a proteção de dados, contacte-nos:
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
