-- Create fish_species table for reference data
CREATE TABLE public.fish_species (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  scientific_name text,
  image_url text,
  handling_instructions text,
  description text,
  typical_size text,
  habitat text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.fish_species ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (this is reference data)
CREATE POLICY "Fish species are viewable by everyone" 
ON public.fish_species 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_fish_species_updated_at
BEFORE UPDATE ON public.fish_species
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert some sample fish species data
INSERT INTO public.fish_species (name, scientific_name, image_url, handling_instructions, description, typical_size, habitat) VALUES
('Atlantic Salmon', 'Salmo salar', 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44', 'Keep chilled at 0-2°C. Handle gently to avoid bruising. Remove scales and gut within 2 hours of catch.', 'A species of ray-finned fish in the family Salmonidae. Highly valued for its rich, flavorful flesh.', '71-76 cm', 'North Atlantic Ocean and rivers'),
('Pacific Tuna', 'Thunnus orientalis', 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6', 'Bleed immediately after catch. Keep at -20°C for sushi grade. Handle with care to preserve meat quality.', 'Large, fast-swimming fish highly prized for sushi and sashimi. Rich in omega-3 fatty acids.', '200-250 cm', 'Pacific Ocean'),
('Red Snapper', 'Lutjanus campechanus', 'https://images.unsplash.com/photo-1534043464124-3be32fe000c9', 'Ice immediately. Scale and gut within 4 hours. Store at 0-2°C. Avoid pressure on flesh.', 'A popular white-fleshed fish with a sweet, mild flavor. Excellent for grilling and baking.', '60-100 cm', 'Gulf of Mexico and Atlantic'),
('Sea Bass', 'Dicentrarchus labrax', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19', 'Keep on ice. Remove entrails promptly. Handle carefully to prevent skin damage. Store at 0-2°C.', 'Premium white fish with delicate flavor and firm texture. Highly valued in fine dining.', '50-100 cm', 'Mediterranean and Atlantic'),
('King Mackerel', 'Scomberomorus cavalla', 'https://images.unsplash.com/photo-1565688534245-05d6b5be184a', 'Bleed and gut immediately. Keep very cold (0-2°C). High oil content requires careful handling.', 'Fast-swimming game fish with rich, oily flesh. Best consumed fresh within 24 hours.', '90-180 cm', 'Western Atlantic Ocean');