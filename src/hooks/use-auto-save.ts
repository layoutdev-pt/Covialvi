'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions {
  table: string;
  id: string | null;
  debounceMs?: number;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

interface UseAutoSaveReturn {
  status: AutoSaveStatus;
  lastSaved: Date | null;
  error: string | null;
  saveField: (field: string, value: any) => void;
  saveFields: (fields: Record<string, any>) => void;
  forceSave: () => Promise<void>;
  pendingChanges: Record<string, any>;
  hasPendingChanges: boolean;
  isSaving: boolean;
}

export function useAutoSave({
  table,
  id,
  debounceMs = 800,
  onSaveSuccess,
  onSaveError,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef<boolean>(false);
  const queuedChangesRef = useRef<Record<string, any>>({});
  const supabase = createClient();

  // Clean up pending changes that are empty/undefined
  const cleanChanges = useCallback((changes: Record<string, any>) => {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(changes)) {
      // Only include non-undefined values
      // Allow null, empty strings, 0, false as valid values
      if (value !== undefined) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }, []);

  // Perform the actual save to Supabase with race condition prevention
  const performSave = useCallback(async (changes: Record<string, any>) => {
    if (!id || Object.keys(changes).length === 0) {
      return;
    }

    const cleanedChanges = cleanChanges(changes);
    if (Object.keys(cleanedChanges).length === 0) {
      return;
    }

    // If already saving, queue the changes for later
    if (isSavingRef.current) {
      queuedChangesRef.current = { ...queuedChangesRef.current, ...cleanedChanges };
      return;
    }

    isSavingRef.current = true;
    setStatus('saving');
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from(table)
        .update({
          ...cleanedChanges,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setStatus('saved');
      setLastSaved(new Date());
      setPendingChanges({});
      onSaveSuccess?.();

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setStatus((current) => (current === 'saved' ? 'idle' : current));
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao guardar';
      setStatus('error');
      setError(errorMessage);
      onSaveError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      isSavingRef.current = false;
      
      // Process queued changes if any
      if (Object.keys(queuedChangesRef.current).length > 0) {
        const queuedChanges = { ...queuedChangesRef.current };
        queuedChangesRef.current = {};
        performSave(queuedChanges);
      }
    }
  }, [id, table, supabase, cleanChanges, onSaveSuccess, onSaveError]);

  // Debounced save
  const debouncedSave = useCallback((changes: Record<string, any>) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSave(changes);
    }, debounceMs);
  }, [performSave, debounceMs]);

  // Save a single field
  const saveField = useCallback((field: string, value: any) => {
    setPendingChanges((prev) => {
      const updated = { ...prev, [field]: value };
      debouncedSave(updated);
      return updated;
    });
  }, [debouncedSave]);

  // Save multiple fields at once
  const saveFields = useCallback((fields: Record<string, any>) => {
    setPendingChanges((prev) => {
      const updated = { ...prev, ...fields };
      debouncedSave(updated);
      return updated;
    });
  }, [debouncedSave]);

  // Use ref to track pending changes for beforeunload without causing re-renders
  const pendingChangesRef = useRef<Record<string, any>>({});
  
  // Keep ref in sync with state
  useEffect(() => {
    pendingChangesRef.current = pendingChanges;
  }, [pendingChanges]);

  // Force immediate save (for manual save button or before navigation)
  const forceSave = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    const currentChanges = pendingChangesRef.current;
    if (Object.keys(currentChanges).length > 0) {
      await performSave(currentChanges);
    }
  }, [performSave]);

  // Save on page unload/navigation - only set up once
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const changes = pendingChangesRef.current;
      if (Object.keys(changes).length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Clean up timer on unmount
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    status,
    lastSaved,
    error,
    saveField,
    saveFields,
    forceSave,
    pendingChanges,
    hasPendingChanges: Object.keys(pendingChanges).length > 0,
    isSaving: status === 'saving',
  };
}
