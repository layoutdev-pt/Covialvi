'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PropertyContactFormProps {
  propertyId: string;
  propertyTitle: string;
  propertyRef: string;
}

export function PropertyContactForm({ propertyId, propertyTitle, propertyRef }: PropertyContactFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot field
  const [message, setMessage] = useState('Desejo ser contactado a fim de obter mais informações sobre o referido imóvel.');
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error('Nome e email são obrigatórios.');
      return;
    }
    
    // Client-side stricter email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Por favor, introduza um e-mail válido.');
      return;
    }
    
    if (!consent) {
      setConsentError(true);
      return;
    }
    setConsentError(false);

    setIsLoading(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          message: message.trim() || null,
          propertyId,
          propertyTitle,
          propertyRef,
          source: 'property',
          website: website, // Honeypot payload
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.error || 'Ocorreu um erro. Por favor, tente novamente.');
      }

      toast.success('Mensagem enviada! Entraremos em contacto brevemente.');
      setName('');
      setPhone('');
      setEmail('');
      setWebsite('');
      setMessage('Desejo ser contactado a fim de obter mais informações sobre o referido imóvel.');
      setConsent(false);
      setConsentError(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ocorreu um erro. Por favor, tente novamente.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot field - invisible to users */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="property-website">Website</label>
        <input
          id="property-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Nome *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome Completo"
          required
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Telefone</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+351 912 345 678"
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nome@email.com"
          required
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Mensagem</label>
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
        />
      </div>
      {/* Consentimento RGPD */}
      <div className={`flex items-start gap-3 p-3 rounded-xl border ${
        consentError ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : 'border-border bg-muted/30'
      }`}>
        <input
          type="checkbox"
          id="propertyConsent"
          checked={consent}
          onChange={(e) => { setConsent(e.target.checked); setConsentError(false); }}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-yellow-500 cursor-pointer flex-shrink-0"
        />
        <label htmlFor="propertyConsent" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
          Li e aceito a{' '}
          <a href="/politica-privacidade" target="_blank" className="text-yellow-600 hover:text-yellow-700 underline font-medium">Política de Privacidade</a>{' '}e os{' '}
          <a href="/termos-condicoes" target="_blank" className="text-yellow-600 hover:text-yellow-700 underline font-medium">Termos e Condições</a>, e autorizo o armazenamento dos meus dados.
          <span className="text-red-500 ml-1">*</span>
        </label>
      </div>
      {consentError && (
        <p className="text-xs text-red-500">Deve aceitar os termos para continuar.</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-full transition-colors shadow-lg shadow-yellow-500/25"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            A enviar...
          </>
        ) : (
          'Enviar'
        )}
      </button>
    </form>
  );
}
