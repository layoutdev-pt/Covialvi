'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Settings, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_CONSENT_KEY = 'covialvi_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'covialvi_cookie_preferences';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);

    if (prefs.analytics && typeof window !== 'undefined') {
      // Enable analytics if consented
      (window as any).va?.('consent', 'granted');
    }
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
    });
  };

  const acceptNecessary = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  };

  const savePreferences = () => {
    saveConsent(preferences);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      >
        <div className="max-w-4xl mx-auto bg-white dark:bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
          {!showSettings ? (
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Cookie className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Utilizamos cookies
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Este website utiliza cookies para melhorar a sua experiência de navegação, 
                    analisar o tráfego do site e personalizar conteúdo. De acordo com o 
                    Regulamento Geral sobre a Proteção de Dados (RGPD) e a Lei n.º 58/2019, 
                    necessitamos do seu consentimento para utilizar cookies não essenciais.
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Para mais informações, consulte a nossa{' '}
                    <Link href="/politica-privacidade" className="text-yellow-600 hover:underline">
                      Política de Privacidade
                    </Link>{' '}
                    e{' '}
                    <Link href="/politica-cookies" className="text-yellow-600 hover:underline">
                      Política de Cookies
                    </Link>.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={acceptAll}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Aceitar Todos
                    </Button>
                    <Button
                      onClick={acceptNecessary}
                      variant="outline"
                    >
                      Apenas Essenciais
                    </Button>
                    <Button
                      onClick={() => setShowSettings(true)}
                      variant="ghost"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Personalizar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Preferências de Cookies
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {/* Necessary Cookies */}
                <div className="p-4 bg-secondary/50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={true}
                        disabled
                        className="w-5 h-5 rounded accent-yellow-500"
                      />
                      <span className="font-medium text-foreground">Cookies Essenciais</span>
                    </div>
                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 px-2 py-1 rounded-full">
                      Sempre Ativos
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-8">
                    Necessários para o funcionamento básico do website. Incluem cookies de sessão, 
                    autenticação e preferências de idioma. Não podem ser desativados.
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="p-4 bg-secondary/50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                        className="w-5 h-5 rounded accent-yellow-500"
                      />
                      <span className="font-medium text-foreground">Cookies de Análise</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground ml-8">
                    Permitem-nos compreender como os visitantes interagem com o website, 
                    ajudando a melhorar a experiência de utilização. Incluem Vercel Analytics 
                    para estatísticas anónimas de visitas.
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="p-4 bg-secondary/50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                        className="w-5 h-5 rounded accent-yellow-500"
                      />
                      <span className="font-medium text-foreground">Cookies de Marketing</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground ml-8">
                    Utilizados para apresentar anúncios relevantes e medir a eficácia das 
                    campanhas publicitárias. Podem ser partilhados com terceiros.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-end">
                <Button
                  onClick={acceptNecessary}
                  variant="outline"
                >
                  Rejeitar Opcionais
                </Button>
                <Button
                  onClick={savePreferences}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Guardar Preferências
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
