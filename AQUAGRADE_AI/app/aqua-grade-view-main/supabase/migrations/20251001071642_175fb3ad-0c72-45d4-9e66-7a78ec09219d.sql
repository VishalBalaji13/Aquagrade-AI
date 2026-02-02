-- Add vessel information columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS vessel_name TEXT,
ADD COLUMN IF NOT EXISTS vessel_registration TEXT,
ADD COLUMN IF NOT EXISTS vessel_home_port TEXT;