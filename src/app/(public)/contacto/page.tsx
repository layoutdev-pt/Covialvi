import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, Smartphone, Building2 } from 'lucide-react';
import { company } from '@/lib/company';
import { ContactForm } from './contact-form';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ContactPage() {

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
          <ContactForm />

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
