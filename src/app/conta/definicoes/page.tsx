'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe, Moon, Sun, Monitor, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const t = useTranslations('account');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    language: 'pt',
    currency: 'EUR',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Definições guardadas com sucesso.');
    } catch {
      toast.error('Não foi possível guardar as definições.');
    } finally {
      setIsLoading(false);
    }
  };

  const languages = [
    { value: 'pt', label: 'Português (Portugal)' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
  ];

  const themes = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Escuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor },
  ];

  const currencies = [
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'USD', label: 'Dólar ($)' },
    { value: 'GBP', label: 'Libra (£)' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Definições</h1>
        <p className="text-muted-foreground">
          Personalize a sua experiência na plataforma.
        </p>
      </div>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2 text-gold-500" />
            Idioma
          </CardTitle>
          <CardDescription>
            Escolha o idioma de exibição da plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <Label htmlFor="language">Idioma</Label>
            <Select
              value={settings.language}
              onValueChange={(value) =>
                setSettings((prev) => ({ ...prev, language: value }))
              }
            >
              <SelectTrigger id="language" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sun className="h-5 w-5 mr-2 text-gold-500" />
            Tema
          </CardTitle>
          <CardDescription>
            Escolha o tema de cores da interface.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 max-w-md">
            {mounted && themes.map((themeOption) => (
              <button
                key={themeOption.value}
                onClick={() => setTheme(themeOption.value)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  theme === themeOption.value
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
                    : 'border-border hover:border-yellow-300 dark:hover:border-yellow-700'
                }`}
              >
                <themeOption.icon className={`h-6 w-6 mx-auto mb-2 ${
                  theme === themeOption.value ? 'text-yellow-600' : 'text-muted-foreground'
                }`} />
                <span className={`text-sm font-medium ${
                  theme === themeOption.value ? 'text-yellow-700 dark:text-yellow-400' : 'text-foreground'
                }`}>{themeOption.label}</span>
              </button>
            ))}
            {!mounted && (
              <div className="col-span-3 flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Currency */}
      <Card>
        <CardHeader>
          <CardTitle>Moeda</CardTitle>
          <CardDescription>
            Escolha a moeda para exibição de preços.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <Label htmlFor="currency">Moeda</Label>
            <Select
              value={settings.currency}
              onValueChange={(value) =>
                setSettings((prev) => ({ ...prev, currency: value }))
              }
            >
              <SelectTrigger id="currency" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.value} value={curr.value}>
                    {curr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button variant="gold" onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              A guardar...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Definições
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
