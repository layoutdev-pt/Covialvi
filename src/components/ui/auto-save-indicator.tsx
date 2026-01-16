'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, AlertCircle, Cloud } from 'lucide-react';
import { AutoSaveStatus } from '@/hooks/use-auto-save';

interface AutoSaveIndicatorProps {
  status: AutoSaveStatus;
  lastSaved: Date | null;
  error: string | null;
  className?: string;
}

export function AutoSaveIndicator({
  status,
  lastSaved,
  error,
  className = '',
}: AutoSaveIndicatorProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <AnimatePresence mode="wait">
        {status === 'saving' && (
          <motion.div
            key="saving"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>A guardar...</span>
          </motion.div>
        )}

        {status === 'saved' && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2 text-green-600"
          >
            <Check className="h-4 w-4" />
            <span>
              Guardado automaticamente
              {lastSaved && ` às ${formatTime(lastSaved)}`}
            </span>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2 text-red-600"
          >
            <AlertCircle className="h-4 w-4" />
            <span>{error || 'Erro ao guardar'}</span>
          </motion.div>
        )}

        {status === 'idle' && lastSaved && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <Cloud className="h-4 w-4" />
            <span>Última gravação às {formatTime(lastSaved)}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
