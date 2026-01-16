# Autosave Strategy for Property Forms

> **CRITICAL**: Autosave must NEVER create new records. It only UPDATES existing records.

---

## Overview

The autosave system provides seamless data persistence for property forms, preventing data loss while ensuring data integrity.

### Key Principles

1. **UPDATE only** - Never INSERT; property must exist before autosave activates
2. **Debounced saves** - 1-2 second delay to batch rapid changes
3. **Changed fields only** - Only send fields that actually changed
4. **No data loss** - Never overwrite existing values with empty/undefined
5. **Resilient** - Handle network failures gracefully

---

## Trigger Points

### 1. Text Inputs (Input, Textarea)

```typescript
// Trigger: onBlur (when user leaves field)
<Input
  {...register('title')}
  onBlur={(e) => saveField('title', e.target.value)}
/>
```

**Why onBlur?**
- Avoids saving on every keystroke
- Captures final value when user moves to next field
- Works well with debounce

### 2. Select Components

```typescript
// Trigger: onValueChange (immediate)
<Select
  value={watch('business_type')}
  onValueChange={(value) => {
    setValue('business_type', value);
    saveField('business_type', value);
  }}
>
```

**Why immediate?**
- User intent is clear on selection
- No typing involved, so no need to wait

### 3. Checkboxes

```typescript
// Trigger: onChange (immediate)
<input
  type="checkbox"
  checked={watch('price_on_request')}
  onChange={(e) => {
    setValue('price_on_request', e.target.checked);
    saveField('price_on_request', e.target.checked);
  }}
/>
```

### 4. Number Inputs

```typescript
// Trigger: onBlur with type conversion
<Input
  type="number"
  {...register('price')}
  onBlur={(e) => {
    const value = e.target.value;
    // Convert to number or null
    saveField('price', value ? parseFloat(value) : null);
  }}
/>
```

### 5. Images (after upload)

```typescript
// Trigger: After successful upload
const handleImageUpload = async (file: File) => {
  const uploadedImage = await uploadToStorage(file);
  
  // Image is saved to property_images table directly
  // No autosave needed for the property record itself
  // But we can trigger a timestamp update
  saveField('updated_at', new Date().toISOString());
};
```

---

## Debounce Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEBOUNCE TIMELINE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User types: H-e-l-l-o                                          │
│              │ │ │ │ │                                          │
│              ▼ ▼ ▼ ▼ ▼                                          │
│  Timer:      [reset][reset][reset][reset][start 1.5s]           │
│                                           │                      │
│                                           ▼                      │
│                                    [SAVE "Hello"]                │
│                                                                  │
│  Result: Only ONE save with final value                         │
└─────────────────────────────────────────────────────────────────┘
```

**Debounce Duration: 1500ms (1.5 seconds)**

- Short enough to feel responsive
- Long enough to batch rapid changes
- Allows user to complete a thought before saving

---

## Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                      AUTOSAVE DATA FLOW                          │
└──────────────────────────────────────────────────────────────────┘

  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
  │ User Input  │────▶│ saveField() │────▶│ Pending     │
  │ (blur/change)│    │             │     │ Changes     │
  └─────────────┘     └─────────────┘     └──────┬──────┘
                                                 │
                                                 ▼
                                        ┌─────────────┐
                                        │ Debounce    │
                                        │ Timer       │
                                        │ (1.5s)      │
                                        └──────┬──────┘
                                               │
                              ┌────────────────┴────────────────┐
                              │                                 │
                              ▼                                 ▼
                    ┌─────────────────┐              ┌─────────────────┐
                    │ Timer expires   │              │ New input       │
                    │ → performSave() │              │ → Reset timer   │
                    └────────┬────────┘              └─────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Clean changes   │
                    │ (remove undef)  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Check if saving │
                    │ in progress     │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
     ┌─────────────────┐          ┌─────────────────┐
     │ Not saving      │          │ Already saving  │
     │ → Execute save  │          │ → Queue changes │
     └────────┬────────┘          └─────────────────┘
              │
              ▼
     ┌─────────────────┐
     │ Supabase UPDATE │
     │ .eq('id', id)   │
     └────────┬────────┘
              │
              ▼
     ┌─────────────────┐
     │ Update status   │
     │ 'saved' / 'error'│
     └─────────────────┘
```

---

## Edge Cases Handled

### 1. Network Failure

```typescript
try {
  await supabase.from('properties').update(changes).eq('id', id);
  setStatus('saved');
} catch (error) {
  setStatus('error');
  setError(error.message);
  // Keep pending changes so user can retry
  // Show error indicator in UI
}
```

**Behavior:**
- Status changes to 'error'
- Error message displayed to user
- Pending changes are preserved
- User can retry by making another change or clicking manual save

### 2. Rapid Sequential Saves (Race Condition)

```typescript
// If a save is in progress, queue new changes
if (isSavingRef.current) {
  queuedChangesRef.current = { ...queuedChangesRef.current, ...changes };
  return;
}

// After save completes, process queued changes
finally {
  isSavingRef.current = false;
  if (Object.keys(queuedChangesRef.current).length > 0) {
    const queued = { ...queuedChangesRef.current };
    queuedChangesRef.current = {};
    performSave(queued);
  }
}
```

**Behavior:**
- Changes made during a save are queued
- After current save completes, queued changes are saved
- No changes are lost

### 3. Page Navigation / Close

```typescript
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (Object.keys(pendingChanges).length > 0) {
      e.preventDefault();
      e.returnValue = ''; // Shows browser warning
    }
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, []);
```

**Behavior:**
- Browser shows "unsaved changes" warning
- User can choose to stay or leave
- If they stay, they can save manually

### 4. Empty/Undefined Values

```typescript
const cleanChanges = (changes: Record<string, any>) => {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(changes)) {
    // Only include non-undefined values
    // Allow null, empty strings, 0, false as valid values
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
};
```

**Behavior:**
- `undefined` values are filtered out (don't overwrite)
- `null` is allowed (explicit clear)
- Empty string `''` is allowed (user cleared field)
- `0` and `false` are allowed (valid values)

### 5. No ID Available

```typescript
const performSave = async (changes: Record<string, any>) => {
  if (!id || Object.keys(changes).length === 0) {
    return; // Silently skip - no error
  }
  // ... proceed with save
};
```

**Behavior:**
- If property ID is not yet available, save is skipped
- No error thrown
- Changes remain in pending state
- Will be saved once ID is available

### 6. Partial Save Failure

```typescript
// Each field is saved atomically in a single UPDATE
// If the UPDATE fails, ALL changes in that batch fail together
// This prevents partial saves

// The pending changes are preserved on error
// User can retry by making another change
```

---

## UI Feedback

### AutoSaveIndicator Component

```typescript
interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
  error: string | null;
}

// Visual states:
// idle:   Nothing shown (or subtle "Auto-save enabled")
// saving: Spinner + "A guardar..."
// saved:  Checkmark + "Guardado" + timestamp
// error:  Warning + "Erro ao guardar" + retry hint
```

---

## Implementation Example

### useAutoSave Hook Usage

```typescript
// In property form component
const {
  status,
  lastSaved,
  error,
  saveField,
  saveFields,
  forceSave,
  isSaving,
} = useAutoSave({
  table: 'properties',
  id: propertyId,  // MUST be set before autosave works
  debounceMs: 1500,
  onSaveError: (err) => toast.error(`Erro: ${err.message}`),
});

// Text input
<Input
  {...register('title')}
  onBlur={(e) => saveField('title', e.target.value)}
/>

// Select
<Select
  value={watch('nature')}
  onValueChange={(v) => {
    setValue('nature', v);
    saveField('nature', v);
  }}
/>

// Manual save button (forces immediate save)
<Button onClick={async () => {
  await forceSave();
  toast.success('Guardado!');
}}>
  Guardar
</Button>
```

---

## What Autosave Does NOT Do

1. **Does NOT create new records** - Property must exist first
2. **Does NOT reset form state** - Only sends changes to server
3. **Does NOT overwrite with undefined** - Filters out undefined values
4. **Does NOT save on every keystroke** - Uses debounce
5. **Does NOT block UI** - Saves happen in background

---

## Testing Checklist

- [ ] Type in field, blur → Value saved
- [ ] Change select → Value saved immediately
- [ ] Toggle checkbox → Value saved immediately
- [ ] Type rapidly → Only final value saved (debounce)
- [ ] Network offline → Error shown, changes preserved
- [ ] Refresh page → Warning shown if unsaved changes
- [ ] Multiple fields changed quickly → All saved in one batch
- [ ] Empty field → Saved as empty (not overwritten)
- [ ] Clear field → Saved as null/empty

