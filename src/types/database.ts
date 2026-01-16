/**
 * Database Types - Single Source of Truth
 * 
 * These types MUST match the schema defined in docs/SCHEMA.md
 * DO NOT modify without updating the schema documentation.
 */

// ============================================
// ENUMS
// ============================================

export type BusinessType = 'sale' | 'rent' | 'transfer';

export type PropertyNature = 
  | 'apartment' 
  | 'house' 
  | 'land' 
  | 'commercial' 
  | 'warehouse' 
  | 'office' 
  | 'garage' 
  | 'shop';

export type PropertyStatus = 'draft' | 'published' | 'archived';

export type ConstructionStatus = 
  | 'new' 
  | 'used' 
  | 'under_construction' 
  | 'renovated' 
  | 'to_renovate';

export type EnergyCertificate = 
  | 'A+' 
  | 'A' 
  | 'B' 
  | 'B-' 
  | 'C' 
  | 'D' 
  | 'E' 
  | 'F' 
  | 'Isento';

// ============================================
// PROPERTIES TABLE
// ============================================

export interface Property {
  // Primary key
  id: string;
  
  // Required fields (NOT NULL)
  reference: string;
  title: string;
  slug: string;
  business_type: BusinessType;
  nature: PropertyNature;
  status: PropertyStatus;
  price_on_request: boolean;
  featured: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  
  // Optional fields (nullable)
  description: string | null;
  price: number | null;
  district: string | null;
  municipality: string | null;
  parish: string | null;
  address: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  gross_area: number | null;
  useful_area: number | null;
  land_area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floors: number | null;
  typology: string | null;
  construction_status: ConstructionStatus | null;
  construction_year: number | null;
  energy_certificate: EnergyCertificate | null;
  divisions: Record<string, number> | null;
  equipment: string[] | null;
  extras: string[] | null;
  surrounding_area: string[] | null;
  video_url: string | null;
  virtual_tour_url: string | null;
  brochure_url: string | null;
  created_by: string | null;
  
  // Relations (populated by joins)
  property_images?: PropertyImage[];
  property_floor_plans?: PropertyFloorPlan[];
}

// ============================================
// PROPERTY IMAGES TABLE
// ============================================

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  alt: string | null;
  order: number;
  is_cover: boolean;
  created_at: string;
}

// ============================================
// PROPERTY FLOOR PLANS TABLE
// ============================================

export interface PropertyFloorPlan {
  id: string;
  property_id: string;
  url: string;
  title: string | null;
  order: number;
  created_at: string;
}

// ============================================
// CREATE/UPDATE PAYLOADS
// ============================================

/**
 * Minimum required fields to create a draft property
 */
export interface CreatePropertyPayload {
  reference: string;
  title: string;
  slug: string;
  business_type: BusinessType;
  nature: PropertyNature;
  status?: PropertyStatus; // defaults to 'draft'
}

/**
 * Partial update payload - all fields optional
 * Only include fields that are being updated
 */
export interface UpdatePropertyPayload {
  title?: string;
  description?: string | null;
  business_type?: BusinessType;
  nature?: PropertyNature;
  status?: PropertyStatus;
  price?: number | null;
  price_on_request?: boolean;
  district?: string | null;
  municipality?: string | null;
  parish?: string | null;
  address?: string | null;
  postal_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  gross_area?: number | null;
  useful_area?: number | null;
  land_area?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  floors?: number | null;
  typology?: string | null;
  construction_status?: ConstructionStatus | null;
  construction_year?: number | null;
  energy_certificate?: EnergyCertificate | null;
  divisions?: Record<string, number> | null;
  equipment?: string[] | null;
  extras?: string[] | null;
  surrounding_area?: string[] | null;
  video_url?: string | null;
  virtual_tour_url?: string | null;
  brochure_url?: string | null;
  featured?: boolean;
}

// ============================================
// ALLOWED FIELDS (for API validation)
// ============================================

/**
 * List of all valid property fields that can be updated via API
 * Used to filter out unknown fields and prevent data corruption
 */
export const PROPERTY_UPDATABLE_FIELDS = [
  'title',
  'description',
  'business_type',
  'nature',
  'status',
  'price',
  'price_on_request',
  'district',
  'municipality',
  'parish',
  'address',
  'postal_code',
  'latitude',
  'longitude',
  'gross_area',
  'useful_area',
  'land_area',
  'bedrooms',
  'bathrooms',
  'floors',
  'typology',
  'construction_status',
  'construction_year',
  'energy_certificate',
  'divisions',
  'equipment',
  'extras',
  'surrounding_area',
  'video_url',
  'virtual_tour_url',
  'brochure_url',
  'featured',
] as const;

/**
 * Fields that should never be updated via API (system-managed)
 */
export const PROPERTY_READONLY_FIELDS = [
  'id',
  'reference',
  'slug',
  'views_count',
  'created_by',
  'created_at',
  'updated_at',
] as const;

// ============================================
// LABEL MAPPINGS (for UI display)
// ============================================

export const businessTypeLabels: Record<BusinessType, string> = {
  sale: 'Venda',
  rent: 'Arrendamento',
  transfer: 'Trespasse',
};

export const natureLabels: Record<PropertyNature, string> = {
  apartment: 'Apartamento',
  house: 'Moradia',
  land: 'Terreno',
  commercial: 'Comercial',
  warehouse: 'Armazém',
  office: 'Escritório',
  garage: 'Garagem',
  shop: 'Loja',
};

export const statusLabels: Record<PropertyStatus, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  archived: 'Arquivado',
};

export const constructionStatusLabels: Record<ConstructionStatus, string> = {
  new: 'Novo',
  used: 'Usado',
  under_construction: 'Em Construção',
  renovated: 'Renovado',
  to_renovate: 'Para Renovar',
};

