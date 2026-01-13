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
  Search,
  Home,
  MapPin,
  Euro,
  BedDouble,
  Bath,
  Ruler,
  Send,
  CheckCircle,
  Loader2,
  Building2,
  TreePine,
  Store,
  Warehouse,
} from 'lucide-react';

export default function ProcuroImovelPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success('Pedido enviado com sucesso!');
  };

  const propertyTypes = [
    { value: 'apartment', label: 'Apartamento', icon: Building2 },
    { value: 'house', label: 'Moradia', icon: Home },
    { value: 'land', label: 'Terreno', icon: TreePine },
    { value: 'commercial', label: 'Comercial', icon: Store },
    { value: 'warehouse', label: 'Armazém', icon: Warehouse },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Pedido Recebido!
          </h1>
          <p className="text-muted-foreground mb-8">
            Obrigado pelo seu interesse. A nossa equipa irá procurar imóveis que 
            correspondam às suas preferências e entraremos em contacto brevemente.
          </p>
          <Button onClick={() => setSubmitted(false)} variant="outline">
            Fazer Novo Pedido
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
              <Search className="h-4 w-4" />
              Encontre o Imóvel Ideal
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Procura um imóvel?
            </h1>
            <p className="text-xl text-muted-foreground">
              Não encontrou o que procura? Deixe-nos ajudá-lo! Preencha o formulário 
              com as suas preferências e a nossa equipa irá procurar o imóvel ideal para si.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-yellow-600">1</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Descreva o que procura</h3>
              <p className="text-sm text-muted-foreground">
                Preencha o formulário com as características do imóvel que deseja.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-yellow-600">2</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Procuramos por si</h3>
              <p className="text-sm text-muted-foreground">
                A nossa equipa irá procurar imóveis que correspondam às suas preferências.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-yellow-600">3</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Receba propostas</h3>
              <p className="text-sm text-muted-foreground">
                Entraremos em contacto com as melhores opções para si.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 md:px-12 lg:px-20">
          <Card className="border-border">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">O que procura?</CardTitle>
              <CardDescription>
                Preencha os campos abaixo com as suas preferências.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-xs font-bold text-yellow-600">1</span>
                    Dados de Contacto
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input id="name" required placeholder="O seu nome" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail *</Label>
                      <Input id="email" type="email" required placeholder="email@exemplo.com" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input id="phone" type="tel" required placeholder="+351 900 000 000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-preference">Preferência de Contacto</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="phone">Telefone</SelectItem>
                          <SelectItem value="email">E-mail</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <hr className="border-border" />

                {/* Property Preferences */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-xs font-bold text-yellow-600">2</span>
                    Características do Imóvel
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo de Negócio *</Label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buy">Comprar</SelectItem>
                          <SelectItem value="rent">Arrendar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Imóvel *</Label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {propertyTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Localização Pretendida *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="location" 
                        required 
                        className="pl-10"
                        placeholder="Ex: Covilhã, Portimão, Lisboa..." 
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Orçamento Mínimo</Label>
                      <div className="relative">
                        <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="number" className="pl-10" placeholder="0" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Orçamento Máximo</Label>
                      <div className="relative">
                        <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="number" className="pl-10" placeholder="500000" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Quartos (mín.)</Label>
                      <div className="relative">
                        <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="number" min="0" className="pl-10" placeholder="0" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>WCs (mín.)</Label>
                      <div className="relative">
                        <Bath className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="number" min="0" className="pl-10" placeholder="0" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Área (m²)</Label>
                      <div className="relative">
                        <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="number" min="0" className="pl-10" placeholder="0" />
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-border" />

                {/* Additional Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-xs font-bold text-yellow-600">3</span>
                    Informações Adicionais
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="details">Outras características ou requisitos</Label>
                    <textarea
                      id="details"
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      placeholder="Descreva outras características importantes para si: garagem, jardim, vista, proximidade a escolas, etc..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Urgência</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Quando pretende encontrar?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">Urgente (até 1 mês)</SelectItem>
                        <SelectItem value="soon">Em breve (1-3 meses)</SelectItem>
                        <SelectItem value="flexible">Flexível (3-6 meses)</SelectItem>
                        <SelectItem value="exploring">Apenas a explorar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consent"
                    required
                    className="mt-1 h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor="consent" className="text-sm text-muted-foreground font-normal">
                    Autorizo o tratamento dos meus dados pessoais para efeitos de pesquisa de imóveis, 
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
                      Enviar Pedido
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
