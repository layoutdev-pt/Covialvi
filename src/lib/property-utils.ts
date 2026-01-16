/**
 * Property Utilities
 * 
 * Functions for validating and sanitizing property data
 * to ensure consistency with the database schema.
 */

import { PROPERTY_UPDATABLE_FIELDS, UpdatePropertyPayload } from '@/types/database';

/**
 * Sanitizes an update payload by removing any fields that are not
 * in the allowed list. This prevents unknown fields from being
 * inserted into the database.
 * 
 * @param payload - The raw update payload from the client
 * @returns A sanitized payload with only allowed fields
 */
export function sanitizePropertyUpdate(payload: Record<string, unknown>): UpdatePropertyPayload {
  const sanitized: Record<string, unknown> = {};
  
  for (const field of PROPERTY_UPDATABLE_FIELDS) {
    if (field in payload) {
      sanitized[field] = payload[field];
    }
  }
  
  return sanitized as UpdatePropertyPayload;
}

/**
 * Validates that required fields are present for creating a property.
 * Returns an error message if validation fails, null if valid.
 * 
 * @param payload - The create payload
 * @returns Error message or null
 */
export function validateCreateProperty(payload: Record<string, unknown>): string | null {
  const requiredFields = ['reference', 'title', 'slug', 'business_type', 'nature'];
  
  for (const field of requiredFields) {
    if (!payload[field]) {
      return `Campo obrigatório em falta: ${field}`;
    }
  }
  
  // Validate business_type
  const validBusinessTypes = ['sale', 'rent', 'transfer'];
  if (!validBusinessTypes.includes(payload.business_type as string)) {
    return 'Tipo de negócio inválido';
  }
  
  // Validate nature
  const validNatures = ['apartment', 'house', 'land', 'commercial', 'warehouse', 'office', 'garage', 'shop'];
  if (!validNatures.includes(payload.nature as string)) {
    return 'Natureza do imóvel inválida';
  }
  
  return null;
}

/**
 * Validates that a property can be published.
 * Returns an error message if validation fails, null if valid.
 * 
 * @param property - The property to validate
 * @returns Error message or null
 */
export function validatePublishProperty(property: Record<string, unknown>): string | null {
  // Must have price or price_on_request
  if (!property.price && !property.price_on_request) {
    return 'O imóvel deve ter um preço ou estar marcado como "Sob Consulta"';
  }
  
  // Recommended fields warning (not blocking)
  const warnings: string[] = [];
  
  if (!property.district) {
    warnings.push('Distrito não definido');
  }
  if (!property.municipality) {
    warnings.push('Concelho não definido');
  }
  
  // For now, we don't block publishing based on warnings
  return null;
}

/**
 * Generates a URL-friendly slug from a title.
 * 
 * @param title - The property title
 * @returns A slug string
 */
export function generateSlug(title: string): string {
  const timestamp = Date.now().toString(36);
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '')         // Remove leading/trailing hyphens
    .substring(0, 50);               // Limit length
  
  return `${slug}-${timestamp}`;
}

/**
 * Generates a unique reference code for a property.
 * 
 * @param prefix - Optional prefix (default: 'COV')
 * @returns A reference string like 'COV-ABC123'
 */
export function generateReference(prefix: string = 'COV'): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
}

