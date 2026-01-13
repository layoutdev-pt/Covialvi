'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Users,
  Briefcase,
  TrendingUp,
  Award,
  Clock,
  MapPin,
  Send,
  CheckCircle,
  Building2,
  Handshake,
  Target,
  Loader2,
} from 'lucide-react';

export default function RecrutamentoPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success('Candidatura enviada com sucesso!');
  };

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Crescimento Profissional',
      description: 'Oportunidades de desenvolvimento e progressão na carreira.',
    },
    {
      icon: Award,
      title: 'Comissões Atrativas',
      description: 'Sistema de comissões competitivo e transparente.',
    },
    {
      icon: Users,
      title: 'Equipa Dinâmica',
      description: 'Ambiente de trabalho colaborativo e motivador.',
    },
    {
      icon: Clock,
      title: 'Flexibilidade',
      description: 'Horários flexíveis e autonomia no trabalho.',
    },
    {
      icon: Handshake,
      title: 'Formação Contínua',
      description: 'Acesso a formações e workshops especializados.',
    },
    {
      icon: Target,
      title: 'Ferramentas Modernas',
      description: 'Tecnologia de ponta para gestão de clientes e imóveis.',
    },
  ];

  const positions = [
    {
      title: 'Consultor Imobiliário',
      type: 'Full-time',
      location: 'Covilhã',
      description: 'Procuramos consultores motivados para integrar a nossa equipa comercial.',
    },
    {
      title: 'Consultor Imobiliário',
      type: 'Full-time',
      location: 'Portimão',
      description: 'Oportunidade para profissionais com experiência no mercado do Algarve.',
    },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Candidatura Enviada!
          </h1>
          <p className="text-muted-foreground mb-8">
            Obrigado pelo seu interesse em fazer parte da equipa Covialvi. 
            Iremos analisar a sua candidatura e entraremos em contacto brevemente.
          </p>
          <Button onClick={() => setSubmitted(false)} variant="outline">
            Enviar Nova Candidatura
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950/20 dark:to-background">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm font-medium mb-6">
              <Briefcase className="h-4 w-4" />
              Junte-se à Nossa Equipa
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Construa a sua carreira connosco
            </h1>
            <p className="text-xl text-muted-foreground">
              A Covialvi está em crescimento e procura profissionais talentosos 
              para integrar a nossa equipa. Se tem paixão pelo mercado imobiliário, 
              queremos conhecê-lo!
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Porquê Trabalhar na Covialvi?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Oferecemos um ambiente de trabalho estimulante com todas as condições 
              para o seu sucesso profissional.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-border hover:border-yellow-200 dark:hover:border-yellow-800 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Vagas Disponíveis
            </h2>
            <p className="text-muted-foreground">
              Explore as oportunidades atuais na nossa empresa.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {positions.map((position, index) => (
              <Card key={index} className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {position.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {position.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {position.location}
                        </span>
                      </div>
                    </div>
                    <Building2 className="h-8 w-8 text-yellow-500" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {position.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 md:px-12 lg:px-20">
          <Card className="border-border">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Envie a sua Candidatura</CardTitle>
              <CardDescription>
                Preencha o formulário abaixo e entraremos em contacto consigo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome *</Label>
                    <Input id="firstName" required placeholder="O seu nome" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apelido *</Label>
                    <Input id="lastName" required placeholder="O seu apelido" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input id="email" type="email" required placeholder="email@exemplo.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input id="phone" type="tel" required placeholder="+351 900 000 000" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Posição Pretendida *</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma posição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultor-covilha">Consultor Imobiliário - Covilhã</SelectItem>
                      <SelectItem value="consultor-portimao">Consultor Imobiliário - Portimão</SelectItem>
                      <SelectItem value="outro">Candidatura Espontânea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Experiência no Setor Imobiliário</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a sua experiência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem experiência</SelectItem>
                      <SelectItem value="1-2">1-2 anos</SelectItem>
                      <SelectItem value="3-5">3-5 anos</SelectItem>
                      <SelectItem value="5+">Mais de 5 anos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem / Motivação</Label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    placeholder="Conte-nos um pouco sobre si e porque gostaria de trabalhar connosco..."
                  />
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consent"
                    required
                    className="mt-1 h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor="consent" className="text-sm text-muted-foreground font-normal">
                    Autorizo o tratamento dos meus dados pessoais para efeitos de recrutamento, 
                    de acordo com a Política de Privacidade.
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      A enviar...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Candidatura
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
