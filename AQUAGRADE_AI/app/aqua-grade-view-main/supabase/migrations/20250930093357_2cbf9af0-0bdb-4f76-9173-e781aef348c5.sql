-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create fish_predictions table
CREATE TABLE public.fish_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  species TEXT NOT NULL,
  quality_grade TEXT NOT NULL,
  handling_instructions TEXT,
  market_value TEXT,
  confidence DECIMAL,
  was_correct BOOLEAN,
  corrected_species TEXT,
  corrected_grade TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on fish_predictions
ALTER TABLE public.fish_predictions ENABLE ROW LEVEL SECURITY;

-- Fish predictions policies
CREATE POLICY "Users can view their own predictions"
  ON public.fish_predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own predictions"
  ON public.fish_predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own predictions"
  ON public.fish_predictions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own predictions"
  ON public.fish_predictions FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for profiles updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for fish images
INSERT INTO storage.buckets (id, name, public)
VALUES ('fish-images', 'fish-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for fish-images bucket
CREATE POLICY "Users can view fish images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'fish-images');

CREATE POLICY "Users can upload their own fish images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'fish-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own fish images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'fish-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own fish images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'fish-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );