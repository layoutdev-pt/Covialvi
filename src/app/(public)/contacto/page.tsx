'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, Loader2, Send, Smartphone, MessageSquare } from 'lucide-react';
import { company } from '@/lib/company';
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
          source: 'contact',
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="container-wide relative z-10">
          <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Mail className="h-4 w-4" />
            Fale Connosco
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-white">Contacte-nos</h1>
          <p className="text-gray-300 text-lg max-w-2xl">Estamos aqui para ajudar. A nossa equipa está pronta para responder às suas questões e acompanhá-lo em cada passo.</p>
        </div>
      </div>

      <div className="container-wide py-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-800">
            <h2 className="font-display text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Envie-nos uma Mensagem
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Preencha o formulário e entraremos em contacto em breve.</p>
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

              <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isLoading}>
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
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Covialvi - Construções, Lda.
              </h2>
              <p className="text-gray-500 dark:text-gray-400">Empresa especializada em construção e mediação imobiliária.</p>
            </div>

            <div className="grid gap-3">
              {/* Address */}
              <div className="flex items-start space-x-4 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-yellow-200 dark:hover:border-yellow-900/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/20">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-gray-900 dark:text-white">Morada</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {company.address.street},<br />
                    {company.address.detail}, {company.address.postalCode} {company.address.locality}
                  </p>
                </div>
              </div>

              {/* Phone & Mobile in a row */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-start space-x-4 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-yellow-200 dark:hover:border-yellow-900/50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/20">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-gray-900 dark:text-white">Telefone</h3>
                    <a href={`tel:${company.landlineTel}`} className="text-gray-600 dark:text-gray-400 text-sm hover:text-yellow-600 transition-colors">
                      {company.landline}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-yellow-200 dark:hover:border-yellow-900/50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/20">
                    <Smartphone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-gray-900 dark:text-white">Telemóvel</h3>
                    <a href={`tel:${company.phoneTel}`} className="text-gray-600 dark:text-gray-400 text-sm hover:text-yellow-600 transition-colors">
                      {company.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-4 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-yellow-200 dark:hover:border-yellow-900/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/20">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-gray-900 dark:text-white">E-mail</h3>
                  <a href={`mailto:${company.email}`} className="text-gray-600 dark:text-gray-400 text-sm hover:text-yellow-600 transition-colors">
                    {company.email}
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start space-x-4 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-yellow-200 dark:hover:border-yellow-900/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/20">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-gray-900 dark:text-white">Horário</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {company.hours}
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
