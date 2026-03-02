-- Create future_projects table
CREATE TABLE IF NOT EXISTS public.future_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  full_description TEXT,
  status TEXT NOT NULL DEFAULT 'Planeamento',
  location TEXT NOT NULL,
  image_url TEXT NOT NULL,
  features TEXT[] DEFAULT '{}',
  start_date TEXT NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create index for published projects
CREATE INDEX IF NOT EXISTS idx_future_projects_published ON public.future_projects(is_published);
CREATE INDEX IF NOT EXISTS idx_future_projects_created_at ON public.future_projects(created_at DESC);

-- Enable RLS
ALTER TABLE public.future_projects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view published projects
CREATE POLICY "Anyone can view published future projects"
  ON public.future_projects
  FOR SELECT
  USING (is_published = true);

-- Policy: Admins can view all projects
CREATE POLICY "Admins can view all future projects"
  ON public.future_projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Policy: Admins can insert projects
CREATE POLICY "Admins can insert future projects"
  ON public.future_projects
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Policy: Admins can update projects
CREATE POLICY "Admins can update future projects"
  ON public.future_projects
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Policy: Admins can delete projects
CREATE POLICY "Admins can delete future projects"
  ON public.future_projects
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_future_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_future_projects_updated_at
  BEFORE UPDATE ON public.future_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_future_projects_updated_at();
