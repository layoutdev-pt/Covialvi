'use client';

import { useState } from 'react';
import { Send, Mail, MessageSquare, HelpCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

const ticketCategories = [
  { value: 'technical', label: 'Problema Técnico' },
  { value: 'billing', label: 'Faturação' },
  { value: 'feature', label: 'Sugestão de Funcionalidade' },
  { value: 'account', label: 'Conta e Acesso' },
  { value: 'other', label: 'Outro' },
];

const priorityOptions = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
];

export default function SupportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    priority: 'medium',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.category || !formData.subject || !formData.message) {
      toast.error('Por favor preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      // Send email via mailto (simple approach)
      const mailtoLink = `mailto:suporte.layoutagency@gmail.com?subject=[${formData.category.toUpperCase()}] ${formData.subject}&body=Nome: ${formData.name}%0D%0AEmail: ${formData.email}%0D%0APrioridade: ${formData.priority}%0D%0ACategoria: ${formData.category}%0D%0A%0D%0AMensagem:%0D%0A${encodeURIComponent(formData.message)}`;
      
      window.open(mailtoLink, '_blank');
      
      setIsSubmitted(true);
      toast.success('O seu cliente de email foi aberto com a mensagem preparada');
    } catch (error) {
      toast.error('Erro ao preparar mensagem. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFormData({
      name: '',
      email: '',
      category: '',
      priority: 'medium',
      subject: '',
      message: '',
    });
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Mensagem Preparada!
            </h2>
            <p className="text-muted-foreground mb-6">
              O seu cliente de email foi aberto com a mensagem de suporte preparada.
              <br />
              Envie o email para completar o pedido de suporte.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleReset}>
                Novo Pedido
              </Button>
              <a href="mailto:suporte.layoutagency@gmail.com">
                <Button>
                  <Mail className="mr-2 h-4 w-4" />
                  Contactar Diretamente
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ajuda & Suporte</h1>
        <p className="text-muted-foreground mt-1">
          Precisa de ajuda? Envie-nos uma mensagem e responderemos o mais brevemente possível.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Enviar Pedido de Suporte
              </CardTitle>
              <CardDescription>
                Preencha o formulário abaixo para contactar a nossa equipa de suporte.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="O seu nome"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Categoria *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar categoria..." />
                      </SelectTrigger>
                      <SelectContent>
                        {ticketCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Prioridade</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Breve descrição do problema"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem *</Label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    placeholder="Descreva o seu problema ou questão em detalhe..."
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    'A preparar...'
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

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Direct Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Mail className="mr-2 h-5 w-5" />
                Contacto Direto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Pode também contactar-nos diretamente por email:
              </p>
              <a
                href="mailto:suporte.layoutagency@gmail.com"
                className="text-sm font-medium text-yellow-600 hover:text-yellow-700 break-all"
              >
                suporte.layoutagency@gmail.com
              </a>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <HelpCircle className="mr-2 h-5 w-5" />
                Perguntas Frequentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Como adiciono um novo imóvel?
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Clique em "Novo Imóvel" no topo da página ou aceda a Imóveis → Adicionar.
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Como edito um imóvel existente?
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Aceda a Imóveis, encontre o imóvel e clique no botão de edição.
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Como vejo os contactos recebidos?
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Aceda ao CRM no menu lateral para ver todos os contactos.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Response Time */}
          <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <CardContent className="pt-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Tempo de Resposta:</strong> Normalmente respondemos dentro de 24-48 horas úteis.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
