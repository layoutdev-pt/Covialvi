-- Create storage buckets for property documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-documents', 'property-documents', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('property-floor-plans', 'property-floor-plans', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for property-documents bucket
CREATE POLICY "Public read access for property documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-documents');

CREATE POLICY "Authenticated users can upload property documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update property documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'property-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete property documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'property-documents' AND auth.role() = 'authenticated');

-- Storage policies for property-floor-plans bucket
CREATE POLICY "Public read access for floor plans"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-floor-plans');

CREATE POLICY "Authenticated users can upload floor plans"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-floor-plans' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update floor plans"
ON storage.objects FOR UPDATE
USING (bucket_id = 'property-floor-plans' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete floor plans"
ON storage.objects FOR DELETE
USING (bucket_id = 'property-floor-plans' AND auth.role() = 'authenticated');
