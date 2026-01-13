import { getTranslations } from 'next-intl/server';

export default async function TermsPage() {
  const t = await getTranslations();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-foreground text-white py-16">
        <div className="container-wide">
          <h1 className="font-display text-display-lg mb-4">Termos e Condições</h1>
          <p className="text-gray-400">Última atualização: Janeiro 2024</p>
        </div>
      </div>

      <div className="container-wide section-padding">
        <div className="max-w-4xl mx-auto prose prose-gray">
          <h2>1. Introdução</h2>
          <p>
            Bem-vindo ao website da Covialvi. Ao aceder e utilizar este website, 
            concorda em cumprir e estar vinculado aos seguintes termos e condições 
            de utilização. Se não concordar com qualquer parte destes termos, 
            não deverá utilizar o nosso website.
          </p>

          <h2>2. Definições</h2>
          <p>
            Nestes Termos e Condições, as seguintes definições aplicam-se:
          </p>
          <ul>
            <li><strong>"Covialvi"</strong> refere-se à empresa Covialvi - Mediação Imobiliária, Lda.</li>
            <li><strong>"Website"</strong> refere-se ao website acessível em www.covialvi.com</li>
            <li><strong>"Utilizador"</strong> refere-se a qualquer pessoa que aceda ao Website</li>
            <li><strong>"Serviços"</strong> refere-se aos serviços de mediação imobiliária prestados pela Covialvi</li>
          </ul>

          <h2>3. Utilização do Website</h2>
          <p>
            O conteúdo deste website é fornecido apenas para informação geral. 
            A Covialvi reserva-se o direito de modificar, suspender ou descontinuar 
            qualquer aspeto do website a qualquer momento, sem aviso prévio.
          </p>
          <p>
            O Utilizador compromete-se a:
          </p>
          <ul>
            <li>Não utilizar o website para fins ilegais ou não autorizados</li>
            <li>Não tentar aceder a áreas restritas do website sem autorização</li>
            <li>Não transmitir vírus ou código malicioso</li>
            <li>Não recolher informações de outros utilizadores sem consentimento</li>
          </ul>

          <h2>4. Propriedade Intelectual</h2>
          <p>
            Todo o conteúdo presente neste website, incluindo textos, gráficos, 
            logótipos, imagens, fotografias e software, é propriedade da Covialvi 
            ou dos seus licenciadores e está protegido por leis de direitos de autor 
            e outras leis de propriedade intelectual.
          </p>

          <h2>5. Informações sobre Imóveis</h2>
          <p>
            As informações sobre imóveis apresentadas neste website são fornecidas 
            de boa fé e baseiam-se em informações disponibilizadas pelos proprietários. 
            A Covialvi esforça-se por garantir a precisão destas informações, mas não 
            garante a sua exatidão, integridade ou atualidade.
          </p>
          <p>
            Os preços, características e disponibilidade dos imóveis estão sujeitos 
            a alterações sem aviso prévio. As fotografias e plantas são meramente 
            ilustrativas.
          </p>

          <h2>6. Registo de Utilizadores</h2>
          <p>
            Algumas funcionalidades do website podem requerer registo. Ao registar-se, 
            o Utilizador compromete-se a:
          </p>
          <ul>
            <li>Fornecer informações verdadeiras, precisas e completas</li>
            <li>Manter a confidencialidade da sua palavra-passe</li>
            <li>Notificar imediatamente a Covialvi de qualquer uso não autorizado da sua conta</li>
          </ul>

          <h2>7. Proteção de Dados</h2>
          <p>
            O tratamento de dados pessoais é regido pela nossa Política de Privacidade, 
            que constitui parte integrante destes Termos e Condições. Ao utilizar este 
            website, o Utilizador consente com o tratamento dos seus dados pessoais 
            conforme descrito na Política de Privacidade.
          </p>

          <h2>8. Limitação de Responsabilidade</h2>
          <p>
            A Covialvi não será responsável por quaisquer danos diretos, indiretos, 
            incidentais, consequenciais ou punitivos resultantes do uso ou 
            impossibilidade de uso deste website.
          </p>

          <h2>9. Links para Websites de Terceiros</h2>
          <p>
            Este website pode conter links para websites de terceiros. A Covialvi 
            não tem controlo sobre o conteúdo desses websites e não assume qualquer 
            responsabilidade pelo mesmo.
          </p>

          <h2>10. Lei Aplicável</h2>
          <p>
            Estes Termos e Condições são regidos pela lei portuguesa. Qualquer 
            litígio será submetido à jurisdição exclusiva dos tribunais portugueses.
          </p>

          <h2>11. Alterações aos Termos</h2>
          <p>
            A Covialvi reserva-se o direito de alterar estes Termos e Condições 
            a qualquer momento. As alterações entram em vigor imediatamente após 
            a sua publicação no website.
          </p>

          <h2>12. Contacto</h2>
          <p>
            Para questões relacionadas com estes Termos e Condições, contacte-nos:
          </p>
          <ul>
            <li>Email: legal@covialvi.com</li>
            <li>Telefone: +351 275 000 000</li>
            <li>Morada: Rua Principal, 123, 6200-000 Covilhã, Portugal</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
