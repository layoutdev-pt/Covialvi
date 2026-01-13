'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Download, Trash2, Shield, Bell, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PrivacyPage() {
  const t = useTranslations('account.privacy');
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [consents, setConsents] = useState({
    marketing: false,
    alerts: true,
  });

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Simulate data export
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success('Os seus dados foram exportados. O download irá começar em breve.');
    } catch {
      toast.error('Não foi possível exportar os dados. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Simulate account deletion
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success('A sua conta foi marcada para eliminação.');
      setShowDeleteDialog(false);
    } catch {
      toast.error('Não foi possível eliminar a conta. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConsentChange = (key: 'marketing' | 'alerts') => {
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success('Preferências atualizadas.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Consents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2 text-gold-500" />
            {t('consents')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
                <h3 className="font-medium">{t('marketingEmails')}</h3>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {t('marketingDescription')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={consents.marketing}
                onChange={() => handleConsentChange('marketing')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center">
                <Bell className="h-5 w-5 mr-2 text-muted-foreground" />
                <h3 className="font-medium">{t('propertyAlerts')}</h3>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {t('alertsDescription')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={consents.alerts}
                onChange={() => handleConsentChange('alerts')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2 text-gold-500" />
            {t('exportData')}
          </CardTitle>
          <CardDescription>{t('exportDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleExportData}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A exportar...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exportar os Meus Dados
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center text-yellow-600">
            <Trash2 className="h-5 w-5 mr-2" />
            {t('deleteAccount')}
          </CardTitle>
          <CardDescription>{t('deleteDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {t('deleteWarning')}
          </p>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar a Minha Conta
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Conta</DialogTitle>
            <DialogDescription>
              Tem a certeza de que pretende eliminar a sua conta? Esta ação é
              irreversível e todos os seus dados serão permanentemente eliminados
              após 30 dias.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A eliminar...
                </>
              ) : (
                'Confirmar Eliminação'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
