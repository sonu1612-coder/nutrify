-- schema.sql
-- Run this in your Supabase SQL Editor to create the Indian Food Database table

CREATE TABLE IF NOT EXISTS public.indian_foods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT DEFAULT 'Generic',
    category TEXT DEFAULT 'Indian',
    serving_options JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { "serving": "1 katori", "grams": 150 }
    nutrition_per_100g JSONB NOT NULL DEFAULT '{"calories": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) but allow anonymous read access
ALTER TABLE public.indian_foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous select on indian_foods" 
ON public.indian_foods FOR SELECT 
USING (true);

-- Create a GIN index to allow fast, fuzzy text searching on the name column
CREATE INDEX IF NOT EXISTS idx_indian_foods_name 
ON public.indian_foods USING GIN (to_tsvector('english', name));
