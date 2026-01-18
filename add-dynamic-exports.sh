#!/bin/bash

# Add 'export const dynamic = "force-dynamic";' to API routes that don't have it

routes=(
  "src/app/api/calendar/sync/route.ts"
  "src/app/api/calendar/event/route.ts"
  "src/app/api/auth/google/status/route.ts"
  "src/app/api/auth/google/disconnect/route.ts"
  "src/app/api/visits/confirm/route.ts"
  "src/app/api/leads/complete-evaluation/route.ts"
  "src/app/api/leads/sell-property/route.ts"
  "src/app/api/leads/[id]/route.ts"
  "src/app/api/properties/route.ts"
  "src/app/api/properties/[id]/images/route.ts"
  "src/app/api/properties/[id]/pdf/route.ts"
  "src/app/api/properties/[id]/route.ts"
  "src/app/api/properties/[id]/documents/route.ts"
  "src/app/api/properties/[id]/upload/route.ts"
  "src/app/api/debug/favorites/route.ts"
  "src/app/api/create-sample-property/route.ts"
)

for route in "${routes[@]}"; do
  if [ -f "$route" ]; then
    # Check if file already has dynamic export
    if ! grep -q "export const dynamic" "$route"; then
      # Find the line number of the first export function
      line=$(grep -n "^export async function" "$route" | head -1 | cut -d: -f1)
      
      if [ -n "$line" ]; then
        # Insert the dynamic export before the first export function
        sed -i '' "${line}i\\
export const dynamic = 'force-dynamic';\\

" "$route"
        echo "✓ Added dynamic export to $route"
      fi
    else
      echo "⊘ Skipped $route (already has dynamic export)"
    fi
  else
    echo "✗ File not found: $route"
  fi
done

echo ""
echo "Done! Added dynamic exports to API routes."
