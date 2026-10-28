import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, Smartphone } from 'lucide-react';
import { company } from '@/lib/company';
import { FadeInUp } from '@/components/ui/motion';
import { ScrollRevealText } from '@/components/ui/scroll-reveal-text';
import { OpenStatus } from '@/components/open-status';
import { ContactForm } from './contact-form';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ContactPage() {
  const fullAddress = `${company.address.street}, ${company.address.detail}, ${company.address.postalCode} ${company.address.locality}`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  const channels = [
    { icon: Smartphone, label: 'Telemóvel', value: company.phone, href: `tel:${company.phoneTel}` },
    { icon: Phone, label: 'Telefone', value: company.landline, href: `tel:${company.landlineTel}` },
    { icon: Mail, label: 'E-mail', value: company.email, href: `mailto:${company.email}` },
    { icon: MapPin, label: 'Morada', value: fullAddress, href: mapsLink, external: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#0b1016] px-6 pb-40 pt-40 md:px-12 md:pb-44 md:pt-48 lg:px-20">
        <Image
          src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2070"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover opacity-40"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0b1016] via-[#0b1016]/80 to-[#0b1016]/25" />
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full bg-yellow-500/15 blur-3xl"
        />

        <div className="mx-auto max-w-7xl">
          <FadeInUp>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              Fale Connosco
            </span>
          </FadeInUp>
          <ScrollRevealText
            as="h1"
            className="max-w-3xl text-4xl font-light leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl"
            segments={[
              { text: 'Vamos falar sobre', breakAfter: true },
              { text: 'o seu próximo imóvel', className: 'text-yellow-500' },
            ]}
          />
          <ScrollRevealText
            as="p"
            className="mt-6 max-w-xl text-lg leading-relaxed text-white/70"
            segments={[
              {
                text: 'Estamos aqui para ajudar. A nossa equipa está pronta para responder às suas questões e acompanhá-lo em cada passo.',
              },
            ]}
          />
        </div>
      </section>

      {/* One premium card: dark information panel + form */}
      <section className="relative z-10 -mt-24 px-4 pb-20 md:-mt-28 md:px-8 lg:px-16">
        <FadeInUp className="mx-auto max-w-7xl">
          <div className="grid overflow-hidden rounded-[2rem] bg-card shadow-2xl shadow-black/15 ring-1 ring-black/5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] dark:ring-white/10">
            {/* Information panel */}
            <div className="relative isolate overflow-hidden bg-[#0b1016] p-8 text-white md:p-12">
              <Image
                src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200"
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="-z-20 object-cover opacity-20"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0b1016]/70 via-[#0b1016]/85 to-[#0b1016]" />
              <div
                aria-hidden="true"
                className="absolute -bottom-24 -left-24 -z-10 h-72 w-72 rounded-full bg-yellow-500/20 blur-3xl"
              />

              <h2 className="text-3xl font-light leading-[1.1] tracking-tight md:text-4xl">
                Informações
                <br />
                <span className="text-yellow-500">de contacto</span>
              </h2>
              <p className="mt-4 max-w-xs text-white/60">
                Empresa especializada em construção e mediação imobiliária.
              </p>

              <ul className="mt-10 space-y-6">
                {channels.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="group flex items-start gap-4"
                    >
                      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-white/20 text-yellow-500 transition-colors duration-300 group-hover:border-yellow-500 group-hover:bg-yellow-500 group-hover:text-white">
                        <item.icon className="h-5 w-5" strokeWidth={1.6} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs uppercase tracking-[0.14em] text-white/50">{item.label}</span>
                        <span className="mt-1 block break-words text-white/90 transition-colors group-hover:text-yellow-400">
                          {item.value}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
                <li className="flex items-start gap-4">
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-white/20 text-yellow-500">
                    <Clock className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs uppercase tracking-[0.14em] text-white/50">Horário</span>
                    <span className="mt-1 block text-white/90">{company.hours}</span>
                    <OpenStatus tone="dark" className="mt-3" />
                  </span>
                </li>
              </ul>
            </div>

            {/* Form */}
            <ContactForm bare />
          </div>
        </FadeInUp>
      </section>

      {/* Map */}
      <section className="px-4 pb-24 md:px-8 lg:px-16">
        <FadeInUp className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-black/15 ring-1 ring-black/5 dark:ring-white/10">
            <div className="relative h-[420px] md:h-[560px]">
              {/* The frame is pushed up a little so Google info box stays out of sight */}
              <iframe
                title="Localização da Covialvi"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1521.5!2d-7.508579!3d40.2268017!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd3d3d8a2b44f8a7%3A0xb87b2a0de875d062!2sFRENTE%20PRINCIPAL!5e0!3m2!1spt-PT!2spt!4v1704900000000!5m2!1spt-PT!2spt"
                className="absolute -top-[150px] left-0 h-[calc(100%+150px)] w-full border-0 [filter:grayscale(0.85)_contrast(1.05)] transition-[filter] duration-700 hover:[filter:grayscale(0)] dark:[filter:invert(0.92)_hue-rotate(180deg)_grayscale(0.6)]"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent md:bg-gradient-to-r md:from-black/15" />
            </div>

            {/* Floating address card */}
            <div className="relative p-4 md:absolute md:bottom-8 md:left-8 md:w-[360px] md:p-0">
              <div className="rounded-3xl bg-card p-6 shadow-2xl shadow-black/20 ring-1 ring-black/5 dark:ring-white/10">
                <span className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                  Visite-nos
                </span>
                <h3 className="text-xl font-light tracking-tight text-foreground">Covialvi Investimentos Imobiliários</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{fullAddress}</p>
                <p className="mt-3 text-sm text-foreground">{company.hours}</p>
                <OpenStatus className="mt-3" />
                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-yellow-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-yellow-500/25 transition-colors hover:bg-yellow-600"
                  >
                    <MapPin className="h-4 w-4" />
                    Como chegar
                  </a>
                  <a
                    href={`tel:${company.phoneTel}`}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    <Phone className="h-4 w-4" />
                    Ligar
                  </a>
                </div>
              </div>
            </div>
          </div>
        </FadeInUp>
      </section>
    </div>
  );
}
