'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, Loader2, Send, Smartphone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const contactSchema = z.object({
  firstName: z.string().min(1, 'O nome é obrigatório.'),
  lastName: z.string().min(1, 'O apelido é obrigatório.'),
  email: z.string().email('Por favor, introduza um e-mail válido.'),
  phone: z.string().optional(),
  message: z.string().min(10, 'A mensagem deve ter pelo menos 10 caracteres.'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          name: `${data.firstName} ${data.lastName}`.trim(),
          email: data.email,
          phone: data.phone || null,
          message: data.message,
        }),
      });

      clearTimeout(timeoutId);

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.error || 'Ocorreu um erro. Por favor, tente novamente.');
      }

      toast.success(result?.message || 'Mensagem enviada com sucesso! Entraremos em contacto brevemente.');
      reset();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.name === 'AbortError'
            ? 'O pedido demorou demasiado tempo. Por favor, tente novamente.'
            : err.message
          : 'Ocorreu um erro. Por favor, tente novamente.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gray-900 dark:bg-gray-800 text-white py-16">
        <div className="container-wide">
          <h1 className="font-display text-display-lg mb-4 text-white">Contacte-nos</h1>
          <p className="text-gray-300 max-w-2xl">Estamos aqui para ajudar. Entre em contacto connosco.</p>
        </div>
      </div>

      <div className="container-wide section-padding">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div>
            <h2 className="font-display text-2xl font-semibold mb-6">
              Envie-nos uma Mensagem
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    className={errors.firstName ? 'border-destructive' : ''}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apelido</Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    className={errors.lastName ? 'border-destructive' : ''}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensagem</Label>
                <textarea
                  id="message"
                  rows={5}
                  {...register('message')}
                  className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none ${
                    errors.message ? 'border-destructive' : ''
                  }`}
                />
                {errors.message && (
                  <p className="text-sm text-destructive">{errors.message.message}</p>
                )}
              </div>

              <Button type="submit" variant="gold" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A enviar...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Mensagem
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="font-display text-2xl font-semibold mb-6">
              Covialvi - Construções, Lda.
            </h2>

            <div className="space-y-6">
              {/* Address */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Morada</h3>
                  <p className="text-muted-foreground">
                    Parque Industrial do Tortosendo,<br />
                    Lote 75 - Rua E,<br />
                    6200-683 Tortosendo
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Telefone</h3>
                  <p className="text-muted-foreground">
                    <a href="tel:+351275971394" className="hover:text-yellow-600 transition-colors">
                      +351 275 971 394
                    </a>
                  </p>
                </div>
              </div>

              {/* Mobile */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Telemóvel</h3>
                  <p className="text-muted-foreground">
                    <a href="tel:+351967138116" className="hover:text-yellow-600 transition-colors">
                      +351 967 138 116
                    </a>
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">E-mail</h3>
                  <p className="text-muted-foreground">
                    <a href="mailto:covialvi@gmail.com" className="hover:text-yellow-600 transition-colors">
                      covialvi@gmail.com
                    </a>
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Horário</h3>
                  <p className="text-muted-foreground">
                    Segunda a Sexta:<br />
                    9h às 13h e das 14h às 18h
                  </p>
                </div>
              </div>

              {/* Observations */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Observações</h3>
                  <p className="text-muted-foreground text-sm">
                    Temos uma estrutura flexível que permite adequar-nos às necessidades de cada cliente em função das solicitações do mercado.
                  </p>
                </div>
              </div>
            </div>

            {/* Google Maps */}
            <div className="mt-8 rounded-xl overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1521.5!2d-7.508579!3d40.2268017!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd3d3d8a2b44f8a7%3A0xb87b2a0de875d062!2sFRENTE%20PRINCIPAL!5e0!3m2!1spt-PT!2spt!4v1704900000000!5m2!1spt-PT!2spt"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-xl"
              />
            </div>
          </div>
        </div>

      </div>

      {/* QR Code Section - Full Width Dark Background */}
      <div className="bg-gray-900 dark:bg-gray-800 py-16 mt-16">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-shrink-0">
              <Image
                src="https://image-charts.com/chart?chs=300x300&cht=qr&chld=L%7C0&chl=BEGIN%253AVCARD%250AVERSION%253A3.0%250AFN%253ACovialvi+-+Constru%25C3%25A7%25C3%25B5es%252C+Lda.%250ATEL%253BTYPE%253DCELL%252CVOICE%253A%252B351+967+138+116%250ATEL%253BTYPE%253DWORK%252CVOICE%253A%252B351+275+971+394%250AEMAIL%253BTYPE%253DPREF%252CINTERNET%253Acovialvi%2540gmail.com%250AURL%253Ahttp%253A%252F%252Fwww.covialvi.com%250AADR%253AParque+Industrial+do+Tortosendo%252C+Lote+75+-+Rua+E%252C+6200-683+Tortosendo%250AEND%253AVCARD"
                alt="QR Code - Contactos Covialvi"
                width={180}
                height={180}
                className="rounded-lg bg-white p-3"
              />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white mb-4">Guarde os nossos contactos</h3>
              <p className="text-gray-300 max-w-lg">
                Descarregue os nossos contactos para o seu smartphone. Basta apontar a câmara do seu telemóvel para o código QR.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
