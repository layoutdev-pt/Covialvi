import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade | Covialvi',
  description: 'Política de Privacidade da Covialvi - Mediação Imobiliária. Saiba como tratamos os seus dados pessoais.',
};

export default function PoliticaPrivacidadePage() {
  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">Política de Privacidade</h1>
        <p className="text-muted-foreground mb-8">Última atualização: Janeiro de 2026</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Responsável pelo Tratamento</h2>
            <p className="text-muted-foreground leading-relaxed">
              A <strong>Covialvi - Mediação Imobiliária, Lda.</strong>, com sede em Covilhã, Portugal, NIF 123456789, 
              é a entidade responsável pelo tratamento dos dados pessoais recolhidos através deste website, em conformidade 
              com o Regulamento (UE) 2016/679 do Parlamento Europeu e do Conselho, de 27 de abril de 2016 (Regulamento 
              Geral sobre a Proteção de Dados - RGPD) e a Lei n.º 58/2019, de 8 de agosto.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Dados Pessoais Recolhidos</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A Covialvi pode recolher os seguintes dados pessoais:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Dados de identificação:</strong> nome, apelido, NIF</li>
              <li><strong>Dados de contacto:</strong> endereço de email, número de telefone, morada</li>
              <li><strong>Dados de navegação:</strong> endereço IP, tipo de navegador, páginas visitadas, tempo de permanência</li>
              <li><strong>Dados de preferências:</strong> imóveis favoritos, pesquisas guardadas, alertas configurados</li>
              <li><strong>Dados de comunicação:</strong> mensagens enviadas através dos formulários de contacto</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Finalidades do Tratamento</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Os dados pessoais são tratados para as seguintes finalidades:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Prestação de serviços de mediação imobiliária</li>
              <li>Gestão de pedidos de informação e contactos</li>
              <li>Agendamento e gestão de visitas a imóveis</li>
              <li>Envio de comunicações de marketing (mediante consentimento)</li>
              <li>Envio de alertas de novos imóveis (mediante consentimento)</li>
              <li>Cumprimento de obrigações legais e regulamentares</li>
              <li>Melhoria dos serviços e experiência do utilizador</li>
              <li>Análise estatística e de desempenho do website</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Fundamento Jurídico</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              O tratamento dos dados pessoais baseia-se nos seguintes fundamentos jurídicos, conforme o artigo 6.º do RGPD:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Execução de contrato:</strong> para a prestação de serviços de mediação imobiliária</li>
              <li><strong>Consentimento:</strong> para o envio de comunicações de marketing e alertas</li>
              <li><strong>Interesse legítimo:</strong> para melhorar os serviços e garantir a segurança do website</li>
              <li><strong>Obrigação legal:</strong> para cumprimento de obrigações fiscais, de prevenção de branqueamento de capitais e outras obrigações legais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Prazo de Conservação</h2>
            <p className="text-muted-foreground leading-relaxed">
              Os dados pessoais são conservados pelo período necessário para as finalidades que motivaram a sua recolha, 
              ou pelo período exigido por lei. Em geral, os dados são conservados durante a vigência da relação contratual 
              e, após o seu término, pelo período de 10 anos para cumprimento de obrigações legais, ou pelo prazo de 
              prescrição aplicável para efeitos de defesa de direitos em caso de litígio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Destinatários dos Dados</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Os dados pessoais podem ser comunicados a:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Prestadores de serviços que atuam em nome da Covialvi (alojamento web, email, análise de dados)</li>
              <li>Proprietários de imóveis ou seus representantes, no âmbito da mediação imobiliária</li>
              <li>Entidades públicas e autoridades competentes, quando exigido por lei</li>
              <li>Instituições financeiras, no âmbito de processos de financiamento imobiliário</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              A Covialvi assegura que os subcontratantes oferecem garantias adequadas de proteção de dados pessoais, 
              através de contratos que vinculam as partes ao cumprimento do RGPD.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Transferências Internacionais</h2>
            <p className="text-muted-foreground leading-relaxed">
              Alguns dos nossos prestadores de serviços podem estar localizados fora do Espaço Económico Europeu. 
              Nestes casos, a Covialvi assegura que as transferências de dados são realizadas em conformidade com o 
              RGPD, nomeadamente através de decisões de adequação da Comissão Europeia ou de cláusulas contratuais-tipo 
              aprovadas pela Comissão Europeia.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Direitos dos Titulares</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Nos termos do RGPD, o titular dos dados tem os seguintes direitos:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Direito de acesso:</strong> obter confirmação de que os seus dados são tratados e aceder aos mesmos</li>
              <li><strong>Direito de retificação:</strong> solicitar a correção de dados inexatos ou incompletos</li>
              <li><strong>Direito ao apagamento:</strong> solicitar a eliminação dos dados, quando aplicável</li>
              <li><strong>Direito à limitação:</strong> solicitar a restrição do tratamento em determinadas circunstâncias</li>
              <li><strong>Direito à portabilidade:</strong> receber os dados num formato estruturado e de uso corrente</li>
              <li><strong>Direito de oposição:</strong> opor-se ao tratamento para fins de marketing direto ou por motivos relacionados com a sua situação particular</li>
              <li><strong>Direito a retirar o consentimento:</strong> retirar o consentimento a qualquer momento, sem comprometer a licitude do tratamento efetuado anteriormente</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Para exercer qualquer destes direitos, contacte-nos através do email: <strong>privacidade@covialvi.com</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Reclamações</h2>
            <p className="text-muted-foreground leading-relaxed">
              Sem prejuízo de qualquer outra via de recurso administrativo ou judicial, o titular dos dados tem o 
              direito de apresentar reclamação junto da Comissão Nacional de Proteção de Dados (CNPD), a autoridade 
              de controlo competente em Portugal, através do website www.cnpd.pt.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Segurança dos Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              A Covialvi implementa medidas técnicas e organizativas adequadas para proteger os dados pessoais contra 
              a destruição, perda, alteração, divulgação ou acesso não autorizados, incluindo encriptação de dados, 
              controlo de acessos, backups regulares e formação dos colaboradores em matéria de proteção de dados.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Este website utiliza cookies. Para mais informações sobre os cookies utilizados e como os pode gerir, 
              consulte a nossa <a href="/politica-de-cookies" className="text-yellow-500 hover:underline">Política de Cookies</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Alterações à Política</h2>
            <p className="text-muted-foreground leading-relaxed">
              A Covialvi reserva-se o direito de alterar esta Política de Privacidade a qualquer momento. Quaisquer 
              alterações serão publicadas nesta página, com indicação da data da última atualização. Recomendamos a 
              consulta regular desta política.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">13. Contactos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para questões relacionadas com a proteção de dados pessoais, contacte-nos:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Email: privacidade@covialvi.com</li>
              <li>Telefone: +351 275 000 000</li>
              <li>Morada: Covilhã, Portugal</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
