# Properties Domain - Data Model Specification

> **SINGLE SOURCE OF TRUTH** - This document defines the canonical schema for the properties domain.
> All frontend and backend code MUST conform to this specification.
> **DO NOT MODIFY** this schema without explicit approval and migration plan.

---

## Overview

This schema supports:
- **Draft properties** (autosave, partial updates)
- **Published properties** (complete, visible to users)
- **Media references** (images, floor plans, brochures)
- **Supabase Row Level Security (RLS)**

---

## 1. Properties Table

### Schema Definition

| Column | Type | Nullable | Default | Purpose |
|--------|------|----------|---------|---------|
| `id` | `UUID` | NO | `uuid_generate_v4()` | Primary key |
| `reference` | `TEXT` | NO | - | Unique property reference code (e.g., "COV-001") |
| `title` | `TEXT` | NO | - | Property title |
| `slug` | `TEXT` | NO | - | URL-friendly identifier (unique) |
| `description` | `TEXT` | YES | `NULL` | Full property description |
| `business_type` | `ENUM` | NO | - | 'sale', 'rent', 'transfer' |
| `nature` | `ENUM` | NO | - | Property type (see enum values) |
| `status` | `ENUM` | NO | `'draft'` | 'draft', 'published', 'archived' |
| `price` | `DECIMAL(12,2)` | YES | `NULL` | Price in EUR |
| `price_on_request` | `BOOLEAN` | NO | `FALSE` | Hide price, show "Sob Consulta" |
| `district` | `TEXT` | YES | `NULL` | District (e.g., "Castelo Branco") |
| `municipality` | `TEXT` | YES | `NULL` | Municipality (e.g., "Covilhã") |
| `parish` | `TEXT` | YES | `NULL` | Parish/Freguesia |
| `address` | `TEXT` | YES | `NULL` | Full street address |
| `postal_code` | `TEXT` | YES | `NULL` | Postal code |
| `latitude` | `DECIMAL(10,8)` | YES | `NULL` | GPS latitude |
| `longitude` | `DECIMAL(11,8)` | YES | `NULL` | GPS longitude |
| `gross_area` | `DECIMAL(10,2)` | YES | `NULL` | Gross area in m² |
| `useful_area` | `DECIMAL(10,2)` | YES | `NULL` | Useful/net area in m² |
| `land_area` | `DECIMAL(10,2)` | YES | `NULL` | Land/terrain area in m² |
| `bedrooms` | `INTEGER` | YES | `NULL` | Number of bedrooms |
| `bathrooms` | `INTEGER` | YES | `NULL` | Number of bathrooms |
| `floors` | `INTEGER` | YES | `NULL` | Number of floors |
| `typology` | `TEXT` | YES | `NULL` | Typology (e.g., "T3") |
| `construction_status` | `TEXT` | YES | `NULL` | Construction status (see values) |
| `construction_year` | `INTEGER` | YES | `NULL` | Year of construction |
| `energy_certificate` | `TEXT` | YES | `NULL` | Energy rating (A+, A, B, etc.) |
| `divisions` | `JSONB` | YES | `NULL` | Room divisions with areas |
| `equipment` | `TEXT[]` | YES | `NULL` | List of equipment |
| `extras` | `TEXT[]` | YES | `NULL` | List of extras |
| `surrounding_area` | `TEXT[]` | YES | `NULL` | Surrounding area features |
| `video_url` | `TEXT` | YES | `NULL` | YouTube/video URL |
| `virtual_tour_url` | `TEXT` | YES | `NULL` | Virtual tour URL |
| `brochure_url` | `TEXT` | YES | `NULL` | Brochure PDF URL |
| `featured` | `BOOLEAN` | NO | `FALSE` | Featured on homepage |
| `views_count` | `INTEGER` | NO | `0` | View counter |
| `created_by` | `UUID` | YES | `NULL` | FK to profiles.id |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NO | `NOW()` | Last update timestamp |

### Enum Values

**business_type:**
- `sale` - Venda
- `rent` - Arrendamento
- `transfer` - Trespasse

**nature (property_nature):**
- `apartment` - Apartamento
- `house` - Moradia
- `land` - Terreno
- `commercial` - Comercial
- `warehouse` - Armazém
- `office` - Escritório
- `garage` - Garagem
- `shop` - Loja

**status (property_status):**
- `draft` - Rascunho (not visible to public)
- `published` - Publicado (visible to public)
- `archived` - Arquivado (not visible)

**construction_status (stored as TEXT for flexibility):**
- `new` - Novo
- `used` - Usado
- `under_construction` - Em Construção
- `renovated` - Renovado
- `to_renovate` - Para Renovar

**energy_certificate:**
- `A+`, `A`, `B`, `B-`, `C`, `D`, `E`, `F`, `Isento`

### Constraints

```sql
PRIMARY KEY (id)
UNIQUE (reference)
UNIQUE (slug)
FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL
```

---

## 2. Property Images Table

### Schema Definition

| Column | Type | Nullable | Default | Purpose |
|--------|------|----------|---------|---------|
| `id` | `UUID` | NO | `uuid_generate_v4()` | Primary key |
| `property_id` | `UUID` | NO | - | FK to properties.id |
| `url` | `TEXT` | NO | - | Public URL of image |
| `alt` | `TEXT` | YES | `NULL` | Alt text for accessibility |
| `order` | `INTEGER` | NO | `0` | Display order |
| `is_cover` | `BOOLEAN` | NO | `FALSE` | Is this the cover image? |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | Upload timestamp |

### Constraints

```sql
PRIMARY KEY (id)
FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
```

### Business Rules

- Only ONE image per property can have `is_cover = TRUE`
- When setting a new cover, unset the previous one
- Images are stored in Supabase Storage bucket: `property-images`

---

## 3. Property Floor Plans Table

### Schema Definition

| Column | Type | Nullable | Default | Purpose |
|--------|------|----------|---------|---------|
| `id` | `UUID` | NO | `uuid_generate_v4()` | Primary key |
| `property_id` | `UUID` | NO | - | FK to properties.id |
| `url` | `TEXT` | NO | - | Public URL of floor plan |
| `title` | `TEXT` | YES | `NULL` | Floor plan title |
| `order` | `INTEGER` | NO | `0` | Display order |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | Upload timestamp |

### Constraints

```sql
PRIMARY KEY (id)
FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
```

### Business Rules

- Floor plans are stored in Supabase Storage bucket: `property-floor-plans`
- Multiple floor plans per property are allowed

---

## 4. Field Requirements by Status

### Draft Properties (status = 'draft')

**Mandatory at creation:**
| Field | Required | Notes |
|-------|----------|-------|
| `reference` | YES | Must be unique, auto-generated if not provided |
| `title` | YES | Can be placeholder like "Novo Imóvel" |
| `slug` | YES | Auto-generated from title + timestamp |
| `business_type` | YES | Default to 'sale' if not specified |
| `nature` | YES | Default to 'house' if not specified |
| `status` | YES | Always 'draft' on creation |

**All other fields are optional for drafts.**

### Published Properties (status = 'published')

**Required before publishing:**
| Field | Required | Notes |
|-------|----------|-------|
| `reference` | YES | Unique identifier |
| `title` | YES | Descriptive title |
| `slug` | YES | URL-friendly |
| `business_type` | YES | sale/rent/transfer |
| `nature` | YES | Property type |
| `price` OR `price_on_request` | YES | Must have price or be "sob consulta" |
| `district` | RECOMMENDED | For search/filtering |
| `municipality` | RECOMMENDED | For search/filtering |
| At least 1 image | RECOMMENDED | For display |

---

## 5. Autosave & Partial Updates

### Autosave Strategy

1. **Create draft early**: When user starts adding a property, create a draft record immediately with minimal required fields
2. **Partial updates**: Use PATCH semantics - only update fields that changed
3. **No field deletion**: Never set fields to NULL unless explicitly requested
4. **Debounced saves**: Frontend should debounce saves (800ms recommended)

### API Contract for Partial Updates

```typescript
// PUT /api/properties/[id]
// Only include fields that changed
{
  "title": "Updated Title",  // Only this field updates
  // Other fields remain unchanged
}
```

### Backend Rules

1. **Never spread unknown fields**: Validate all incoming fields against schema
2. **Preserve existing data**: If a field is not in the update payload, do NOT touch it
3. **Explicit NULL**: Only set to NULL if explicitly passed as `null`
4. **Timestamp update**: Always update `updated_at` on any change

---

## 6. Row Level Security (RLS)

### Properties Table

```sql
-- Public can read published properties
CREATE POLICY "Public can view published properties"
ON properties FOR SELECT
USING (status = 'published');

-- Admins can do everything
CREATE POLICY "Admins have full access"
ON properties FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);
```

### Property Images Table

```sql
-- Public can view images of published properties
CREATE POLICY "Public can view images of published properties"
ON property_images FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM properties
    WHERE properties.id = property_images.property_id
    AND properties.status = 'published'
  )
);

-- Admins can manage all images
CREATE POLICY "Admins can manage images"
ON property_images FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);
```

### Property Floor Plans Table

```sql
-- Same pattern as property_images
```

---

## 7. Storage Buckets

| Bucket | Purpose | Public |
|--------|---------|--------|
| `property-images` | Property photos | YES |
| `property-floor-plans` | Floor plan PDFs/images | YES |
| `property-documents` | Brochures, other docs | YES |

---

## 8. Indexes

```sql
-- Performance indexes
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_business_type ON properties(business_type);
CREATE INDEX idx_properties_nature ON properties(nature);
CREATE INDEX idx_properties_district ON properties(district);
CREATE INDEX idx_properties_municipality ON properties(municipality);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX idx_properties_featured ON properties(featured) WHERE featured = TRUE;
CREATE INDEX idx_properties_slug ON properties(slug);
CREATE INDEX idx_properties_reference ON properties(reference);
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);

CREATE INDEX idx_property_images_property_id ON property_images(property_id);
CREATE INDEX idx_property_images_is_cover ON property_images(property_id, is_cover) WHERE is_cover = TRUE;

CREATE INDEX idx_property_floor_plans_property_id ON property_floor_plans(property_id);
```

---

## 9. Triggers

```sql
-- Auto-update updated_at timestamp
CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 10. Migration Notes

### Current State Issues

1. **construction_status enum mismatch**: Frontend uses English keys (`new`, `used`), some migrations tried Portuguese values
2. **Spread operator in API**: `...body` allows unknown fields to be inserted
3. **No validation**: API accepts any fields without schema validation

### Resolution

1. Use TEXT for `construction_status` to avoid enum migration issues
2. Implement explicit field allowlist in API routes
3. Add Zod validation matching this schema

---

## Changelog

| Date | Version | Change |
|------|---------|--------|
| 2026-01-16 | 1.0.0 | Initial schema documentation |

