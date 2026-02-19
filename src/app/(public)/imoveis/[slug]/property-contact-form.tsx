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
  const [message, setMessage] = useState('Desejo ser contactado a fim de obter mais informações sobre o referido imóvel.');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error('Nome e email são obrigatórios.');
      return;
    }

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
      setMessage('Desejo ser contactado a fim de obter mais informações sobre o referido imóvel.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ocorreu um erro. Por favor, tente novamente.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
