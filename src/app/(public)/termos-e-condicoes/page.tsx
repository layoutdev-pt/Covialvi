import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos e Condições | Covialvi',
  description: 'Termos e Condições de utilização do website da Covialvi - Mediação Imobiliária.',
};

export default function TermosCondicoesPage() {
  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">Termos e Condições</h1>
        <p className="text-muted-foreground mb-8">Última atualização: Janeiro de 2026</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Identificação da Entidade</h2>
            <p className="text-muted-foreground leading-relaxed">
              O presente website é propriedade e gerido pela <strong>Covialvi - Mediação Imobiliária, Lda.</strong>, 
              sociedade comercial por quotas, com sede em Covilhã, Portugal, registada na Conservatória do Registo Comercial 
              da Covilhã, com o número de pessoa coletiva (NIF) 123456789, titular da Licença AMI n.º 12345, emitida pelo 
              Instituto dos Mercados Públicos, do Imobiliário e da Construção (IMPIC).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Objeto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Os presentes Termos e Condições regulam o acesso e utilização do website www.covialvi.com, bem como os 
              serviços de mediação imobiliária prestados pela Covialvi, em conformidade com a legislação portuguesa aplicável, 
              nomeadamente a Lei n.º 15/2013, de 8 de fevereiro (Regime Jurídico da Atividade de Mediação Imobiliária) e 
              respetivas alterações.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Aceitação dos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao aceder e utilizar este website, o utilizador declara ter lido, compreendido e aceita ficar vinculado aos 
              presentes Termos e Condições. Caso não concorde com algum dos termos, deverá abster-se de utilizar o website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Serviços de Mediação Imobiliária</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A Covialvi presta serviços de mediação imobiliária, que consistem na procura, por conta de outrem, de 
              destinatários para a realização de negócios que visem a constituição ou aquisição de direitos reais sobre 
              bens imóveis, bem como a permuta, trespasse ou arrendamento dos mesmos.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Os serviços de mediação imobiliária são prestados mediante a celebração de contrato de mediação imobiliária, 
              nos termos da legislação aplicável, o qual deverá ser reduzido a escrito e conter os elementos obrigatórios 
              previstos na lei.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Informação sobre Imóveis</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A informação relativa aos imóveis apresentados neste website é fornecida pelos respetivos proprietários ou 
              representantes legais. A Covialvi envida os melhores esforços para garantir a exatidão e atualização da 
              informação, mas não pode garantir que a mesma esteja isenta de erros ou omissões.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              As fotografias, plantas e vídeos dos imóveis são meramente ilustrativos, podendo não corresponder integralmente 
              ao estado atual do imóvel. Os preços indicados podem estar sujeitos a alterações sem aviso prévio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Registo de Utilizadores</h2>
            <p className="text-muted-foreground leading-relaxed">
              Algumas funcionalidades do website podem requerer o registo do utilizador. O utilizador compromete-se a 
              fornecer informações verdadeiras, completas e atualizadas, sendo responsável pela confidencialidade das 
              suas credenciais de acesso e por todas as atividades realizadas na sua conta.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Propriedade Intelectual</h2>
            <p className="text-muted-foreground leading-relaxed">
              Todos os conteúdos deste website, incluindo textos, imagens, logótipos, gráficos, vídeos e software, são 
              propriedade da Covialvi ou dos seus licenciantes, estando protegidos pela legislação portuguesa e europeia 
              relativa a direitos de autor e propriedade industrial. É proibida a reprodução, distribuição, comunicação 
              pública ou transformação destes conteúdos sem autorização prévia por escrito.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Limitação de Responsabilidade</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A Covialvi não se responsabiliza por quaisquer danos diretos, indiretos, incidentais ou consequenciais 
              resultantes do acesso ou utilização do website, incluindo, mas não se limitando a, erros, omissões, 
              interrupções, defeitos, vírus ou falhas de funcionamento.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              A Covialvi não garante a disponibilidade contínua e ininterrupta do website, podendo suspender, modificar 
              ou descontinuar qualquer funcionalidade sem aviso prévio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Links Externos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Este website pode conter links para websites de terceiros, sobre os quais a Covialvi não tem qualquer 
              controlo. A inclusão de tais links não implica qualquer associação, aprovação ou responsabilidade pelos 
              conteúdos ou práticas desses websites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Proteção de Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              O tratamento de dados pessoais efetuado através deste website está sujeito à nossa Política de Privacidade, 
              que constitui parte integrante dos presentes Termos e Condições, em conformidade com o Regulamento Geral 
              sobre a Proteção de Dados (RGPD) - Regulamento (UE) 2016/679 - e a Lei n.º 58/2019, de 8 de agosto.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Livro de Reclamações</h2>
            <p className="text-muted-foreground leading-relaxed">
              Em cumprimento do disposto no Decreto-Lei n.º 156/2005, de 15 de setembro, informamos que a Covialvi 
              dispõe de Livro de Reclamações, em formato físico nas suas instalações e em formato eletrónico através 
              do portal www.livroreclamacoes.pt.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Resolução Alternativa de Litígios</h2>
            <p className="text-muted-foreground leading-relaxed">
              Em caso de litígio de consumo, o consumidor pode recorrer a uma Entidade de Resolução Alternativa de 
              Litígios de consumo. A Covialvi informa que se encontra vinculada ao Centro de Arbitragem de Conflitos 
              de Consumo de Lisboa (www.centroarbitragemlisboa.pt) ou ao Centro de Informação de Consumo e Arbitragem 
              do Porto (www.cicap.pt), podendo o consumidor obter mais informações em www.consumidor.gov.pt.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">13. Alterações aos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              A Covialvi reserva-se o direito de modificar os presentes Termos e Condições a qualquer momento, sem 
              aviso prévio. As alterações entram em vigor imediatamente após a sua publicação no website. A continuação 
              da utilização do website após tais alterações constitui a aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">14. Lei Aplicável e Foro Competente</h2>
            <p className="text-muted-foreground leading-relaxed">
              Os presentes Termos e Condições são regidos pela lei portuguesa. Para a resolução de quaisquer litígios 
              emergentes da interpretação ou execução dos presentes termos, será competente o Tribunal da Comarca da 
              Covilhã, com expressa renúncia a qualquer outro foro.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">15. Contactos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para quaisquer questões relacionadas com os presentes Termos e Condições, por favor contacte-nos através de:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Email: info@covialvi.com</li>
              <li>Telefone: +351 275 000 000</li>
              <li>Morada: Covilhã, Portugal</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
