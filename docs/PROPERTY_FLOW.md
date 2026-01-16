# Property Creation & Editing Flow

> **CRITICAL**: This document defines the strict separation between CREATE and UPDATE operations.
> All frontend code MUST follow this flow to prevent data loss.

---

## The Bug: Root Cause Analysis

### What Was Happening

1. **Duplicate record creation**: Clicking "Guardar" sometimes created a NEW property instead of updating the existing one
2. **Field wipes**: Empty form fields were being sent as `null`, overwriting previously saved data
3. **404 on public pages**: New records had different IDs/slugs, breaking existing URLs

### Why It Happened

```
┌─────────────────────────────────────────────────────────────────┐
│ PROBLEM 1: No persistent property_id tracking                   │
├─────────────────────────────────────────────────────────────────┤
│ - Draft ID stored in localStorage but not reliably checked     │
│ - If localStorage cleared, a NEW draft was created             │
│ - Multiple browser tabs = multiple drafts                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ PROBLEM 2: API accepted any payload via spread operator        │
├─────────────────────────────────────────────────────────────────┤
│ - `...body` in API routes allowed unknown fields               │
│ - No validation of incoming data                               │
│ - Null/undefined values overwrote existing data                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ PROBLEM 3: Empty strings converted to null                     │
├─────────────────────────────────────────────────────────────────┤
│ - `data.field || null` converts empty string to null           │
│ - This OVERWRITES existing data with null                      │
│ - User loses previously entered information                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## The Fix: Strict CREATE vs UPDATE Separation

### Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         PROPERTY LIFECYCLE                                │
└──────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────┐
                              │   START     │
                              └──────┬──────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
                    ▼                                 ▼
           ┌───────────────┐                ┌───────────────┐
           │  /novo page   │                │  /[id] page   │
           │  (Create New) │                │  (Edit Mode)  │
           └───────┬───────┘                └───────┬───────┘
                   │                                │
                   ▼                                ▼
    ┌──────────────────────────┐     ┌──────────────────────────┐
    │ Check localStorage for   │     │ Fetch property by ID     │
    │ existing draft_id        │     │ from URL params          │
    └──────────────┬───────────┘     └──────────────┬───────────┘
                   │                                │
         ┌────────┴────────┐                       │
         │                 │                       │
         ▼                 ▼                       │
   ┌──────────┐     ┌──────────┐                  │
   │ Draft    │     │ No Draft │                  │
   │ Exists   │     │ Found    │                  │
   └────┬─────┘     └────┬─────┘                  │
        │                │                        │
        ▼                ▼                        │
   ┌──────────┐   ┌─────────────┐                │
   │ RESTORE  │   │ CREATE NEW  │                │
   │ Draft    │   │ Draft       │                │
   │ (UPDATE) │   │ (INSERT)    │                │
   └────┬─────┘   └──────┬──────┘                │
        │                │                        │
        │                ▼                        │
        │         ┌─────────────┐                │
        │         │ Store ID in │                │
        │         │ localStorage│                │
        │         │ & state     │                │
        │         └──────┬──────┘                │
        │                │                        │
        └────────┬───────┘                        │
                 │                                │
                 ▼                                ▼
    ┌────────────────────────────────────────────────────────┐
    │                    EDIT MODE                            │
    │  - property_id is ALWAYS in state                      │
    │  - ALL saves are UPDATE operations                     │
    │  - NEVER call INSERT after initial create              │
    └────────────────────────────┬───────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  User clicks "Guardar" │
                    └────────────┬───────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  updateProperty(id)    │
                    │  - Sanitize payload    │
                    │  - Only send changed   │
                    │    fields              │
                    │  - Never send null for │
                    │    unchanged fields    │
                    └────────────┬───────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  API: PUT /properties  │
                    │  - Validate payload    │
                    │  - Filter allowed      │
                    │    fields only         │
                    │  - Update by ID        │
                    └────────────────────────┘
```

---

## Implementation: Pseudocode

### 1. createProperty() - Called ONCE on /novo page mount

```typescript
async function createProperty(): Promise<string> {
  // ONLY called when:
  // 1. No draft_id in localStorage
  // 2. OR draft_id exists but property not found in DB

  const minimalData = {
    reference: generateReference(),      // Required, unique
    title: 'Novo Imóvel',                // Required, placeholder
    slug: `draft-${Date.now()}`,         // Required, temporary
    business_type: 'sale',               // Required, default
    nature: 'house',                     // Required, default
    status: 'draft',                     // Required, always draft
  };

  const { data, error } = await supabase
    .from('properties')
    .insert(minimalData)
    .select('id')
    .single();

  if (error) throw error;

  // CRITICAL: Persist the ID immediately
  localStorage.setItem('property_draft_id', data.id);
  
  return data.id;
}
```

### 2. updateProperty(id) - Called for ALL subsequent saves

```typescript
async function updateProperty(id: string, changes: Partial<Property>): Promise<void> {
  // NEVER call INSERT - always UPDATE by ID
  
  // Step 1: Sanitize the payload
  const sanitizedPayload = sanitizePropertyUpdate(changes);
  
  // Step 2: Remove undefined values (don't overwrite with null)
  const cleanPayload = Object.fromEntries(
    Object.entries(sanitizedPayload).filter(([_, v]) => v !== undefined)
  );
  
  // Step 3: If empty payload, skip the update
  if (Object.keys(cleanPayload).length === 0) {
    return;
  }
  
  // Step 4: Update by ID
  const { error } = await supabase
    .from('properties')
    .update(cleanPayload)
    .eq('id', id);

  if (error) throw error;
}
```

### 3. sanitizePropertyUpdate() - Filter allowed fields only

```typescript
const ALLOWED_UPDATE_FIELDS = [
  'title', 'description', 'business_type', 'nature', 'status',
  'price', 'price_on_request', 'district', 'municipality', 'parish',
  'address', 'postal_code', 'latitude', 'longitude',
  'gross_area', 'useful_area', 'land_area',
  'bedrooms', 'bathrooms', 'floors', 'typology',
  'construction_status', 'construction_year', 'energy_certificate',
  'divisions', 'equipment', 'extras', 'surrounding_area',
  'video_url', 'virtual_tour_url', 'brochure_url', 'featured',
];

function sanitizePropertyUpdate(payload: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (field in payload && payload[field] !== undefined) {
      sanitized[field] = payload[field];
    }
  }
  
  return sanitized;
}
```

### 4. finalizeProperty(id) - Called when user clicks "Guardar" to publish

```typescript
async function finalizeProperty(id: string, formData: PropertyFormData): Promise<void> {
  // Generate proper slug from title
  const slug = generateSlug(formData.title);
  
  // Build final update with all form data
  const finalData = {
    title: formData.title,
    slug: slug,
    // ... other fields
    status: formData.status, // 'draft' or 'published'
  };
  
  await updateProperty(id, finalData);
  
  // Clear draft from localStorage ONLY after successful save
  localStorage.removeItem('property_draft_id');
}
```

---

## API Route Changes

### Before (Buggy)

```typescript
// PUT /api/properties/[id]
const { data, error } = await supabase
  .from('properties')
  .update({
    ...body,  // ❌ DANGEROUS: Accepts ANY fields
    updated_at: new Date().toISOString(),
  })
  .eq('id', params.id);
```

### After (Fixed)

```typescript
// PUT /api/properties/[id]
import { sanitizePropertyUpdate } from '@/lib/property-utils';

// Step 1: Sanitize incoming payload
const sanitizedPayload = sanitizePropertyUpdate(body);

// Step 2: Validate required fields if publishing
if (sanitizedPayload.status === 'published') {
  const validation = validatePublishProperty(sanitizedPayload);
  if (validation) {
    return NextResponse.json({ error: validation }, { status: 400 });
  }
}

// Step 3: Update with sanitized data only
const { data, error } = await supabase
  .from('properties')
  .update({
    ...sanitizedPayload,
    updated_at: new Date().toISOString(),
  })
  .eq('id', params.id);
```

---

## Frontend State Management

### Critical Rules

1. **property_id MUST be in state before any save operation**
   ```typescript
   const [propertyId, setPropertyId] = useState<string | null>(null);
   
   // Block saves until ID is available
   if (!propertyId) {
     toast.error('Aguarde a inicialização');
     return;
   }
   ```

2. **Never call INSERT after initial create**
   ```typescript
   // ❌ WRONG: This creates duplicates
   const save = async () => {
     if (!propertyId) {
       await createProperty();  // Creates new
     }
     await createProperty();    // Creates ANOTHER new!
   };
   
   // ✅ CORRECT: Create once, update always
   const save = async () => {
     if (!propertyId) {
       const id = await createProperty();
       setPropertyId(id);
     }
     await updateProperty(propertyId, formData);
   };
   ```

3. **Don't send unchanged fields**
   ```typescript
   // ❌ WRONG: Sends all fields, including empty ones
   const updateData = {
     title: data.title,
     description: data.description || null,  // Overwrites with null!
   };
   
   // ✅ CORRECT: Only send fields that have values
   const updateData: Record<string, unknown> = {};
   if (data.title) updateData.title = data.title;
   if (data.description) updateData.description = data.description;
   // Don't include field if it's empty/undefined
   ```

---

## Edit Page (/admin/imoveis/[id])

The edit page is simpler because the ID comes from the URL:

```typescript
export default function EditPropertyPage({ params }: { params: { id: string } }) {
  const propertyId = params.id;  // Always available from URL
  
  // Load existing data on mount
  useEffect(() => {
    loadProperty(propertyId);
  }, [propertyId]);
  
  // All saves are updates
  const onSubmit = async (data: PropertyFormData) => {
    await updateProperty(propertyId, data);
  };
}
```

---

## Summary of Changes Required

| Component | Change |
|-----------|--------|
| `/novo/page.tsx` | Ensure `draftId` is set before any save; use UPDATE not INSERT |
| `/[id]/page.tsx` | Always use `params.id`; never create new records |
| `POST /api/properties` | Only for initial draft creation; validate required fields |
| `PUT /api/properties/[id]` | Sanitize payload; filter allowed fields; never spread `...body` |
| `sanitizePropertyUpdate()` | New utility to filter allowed fields |

---

## Testing Checklist

- [ ] Create new property → Only ONE record created
- [ ] Click Guardar multiple times → Same record updated
- [ ] Refresh page during creation → Draft restored, not duplicated
- [ ] Edit existing property → Same record updated
- [ ] Empty fields don't overwrite existing data
- [ ] Public page URL remains stable after edits

