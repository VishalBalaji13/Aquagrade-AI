import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AquaGradeAPI from "@/lib/aquagradeApi";

interface FishSpecies {
  id: string;
  name: string;
  scientific_name: string | null;
  description: string | null;
  typical_size: string | null;
  habitat: string | null;
  image_url: string | null;
  handling_instructions: string | null;
  market_value?: string;
  quality_characteristics?: string;
}

const FishDirectory = () => {
  const [species, setSpecies] = useState<FishSpecies[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFish, setSelectedFish] = useState<FishSpecies | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSpecies();
  }, []);

  const fetchSpecies = async () => {
    try {
      // Get species from AquaGrade AI API
      const response = await AquaGradeAPI.getSpecies();
      const speciesList = response.species || [];
      
      // Create comprehensive fish directory with detailed information
      const fishDirectory = speciesList.map((speciesName: string, index: number) => {
        const fishInfo = getFishInfo(speciesName);
        return {
          id: `fish-${index}`,
          name: speciesName,
          scientific_name: fishInfo.scientificName,
          description: fishInfo.description,
          typical_size: fishInfo.typicalSize,
          habitat: fishInfo.habitat,
          image_url: fishInfo.imageUrl,
          handling_instructions: fishInfo.handlingInstructions,
          market_value: fishInfo.marketValue,
          quality_characteristics: fishInfo.qualityCharacteristics
        };
      });
      
      setSpecies(fishDirectory);
    } catch (error) {
      console.error("Error fetching fish species:", error);
      toast({
        title: "Error",
        description: "Failed to load fish species from AquaGrade AI",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Comprehensive fish information
  const getFishInfo = (speciesName: string) => {
    const fishData: { [key: string]: any } = {
      "Sea Bass": {
        scientificName: "Dicentrarchus labrax",
        description: "A popular European sea bass with firm, white flesh and mild flavor. Highly prized in Mediterranean cuisine.",
        typicalSize: "30-70 cm (1-2.3 ft), 0.5-3 kg (1-6.6 lbs)",
        habitat: "Coastal waters, estuaries, and shallow seas in the Atlantic and Mediterranean",
        imageUrl: "/sample_images/demo_images/Sea_Bass.jpg",
        handlingInstructions: "Keep on ice immediately after catch. Store at 0-4°C. Best consumed within 2-3 days. Handle gently to prevent bruising.",
        marketValue: "$24.00/lb",
        qualityCharacteristics: "Clear eyes, bright red gills, firm flesh, no fishy odor"
      },
      "Red Sea Bream": {
        scientificName: "Pagrus major",
        description: "A premium fish with delicate, sweet flesh. Highly valued in Japanese cuisine, especially for sashimi.",
        typicalSize: "25-60 cm (10-24 in), 0.5-2.5 kg (1-5.5 lbs)",
        habitat: "Rocky coastal areas and coral reefs in the Pacific Ocean",
        imageUrl: "/sample_images/demo_images/Red_Sea_Bream.jpg",
        handlingInstructions: "Immediate bleeding and icing required. Store at 0-2°C. Handle with extreme care to preserve quality.",
        marketValue: "$32.00/lb",
        qualityCharacteristics: "Bright red color, clear eyes, firm texture, fresh sea smell"
      },
      "Trout": {
        scientificName: "Oncorhynchus mykiss",
        description: "Freshwater fish with pink, tender flesh and mild flavor. Popular for grilling and smoking.",
        typicalSize: "20-50 cm (8-20 in), 0.3-2 kg (0.7-4.4 lbs)",
        habitat: "Cold, clear streams, rivers, and lakes in temperate regions",
        imageUrl: "/sample_images/demo_images/Trout.jpg",
        handlingInstructions: "Keep in cold, clean water or on ice. Store at 0-4°C. Best consumed within 1-2 days.",
        marketValue: "$16.00/lb",
        qualityCharacteristics: "Bright skin, clear eyes, firm flesh, no off-odors"
      },
      "Turbot": {
        scientificName: "Scophthalmus maximus",
        description: "Premium flatfish with firm, white flesh and delicate flavor. Considered a luxury fish in European cuisine.",
        typicalSize: "30-100 cm (12-39 in), 1-25 kg (2-55 lbs)",
        habitat: "Sandy and muddy seabeds in the North Atlantic and Mediterranean",
        imageUrl: "/sample_images/demo_images/turbot_sample.jpg",
        handlingInstructions: "Immediate icing essential. Store at 0-2°C. Handle carefully to avoid damage to delicate skin.",
        marketValue: "$35.00/lb",
        qualityCharacteristics: "White underside, firm flesh, clear eyes, fresh ocean smell"
      },
      "Gilt-Head Bream": {
        scientificName: "Sparus aurata",
        description: "Mediterranean fish with firm, white flesh and mild, sweet flavor. Popular in European cuisine.",
        typicalSize: "25-50 cm (10-20 in), 0.5-2 kg (1-4.4 lbs)",
        habitat: "Coastal waters, lagoons, and estuaries in the Mediterranean and Eastern Atlantic",
        imageUrl: "/sample_images/demo_images/Gilt_Head_Bream.jpg",
        handlingInstructions: "Keep on ice immediately. Store at 0-4°C. Best consumed within 2-3 days.",
        marketValue: "$28.00/lb",
        qualityCharacteristics: "Golden stripe on head, clear eyes, firm flesh, fresh smell"
      },
      "Black Sea Sprat": {
        scientificName: "Sprattus sprattus",
        description: "Small, oily fish with rich flavor. Excellent for smoking, grilling, or as bait for larger fish.",
        typicalSize: "8-15 cm (3-6 in), 10-50 g (0.4-1.8 oz)",
        habitat: "Coastal waters and estuaries in the Black Sea and Baltic Sea",
        imageUrl: "/sample_images/demo_images/Black_Sea_Sprat.jpg",
        handlingInstructions: "Immediate processing recommended. Store at 0-4°C. Consume within 1 day.",
        marketValue: "$12.50/lb",
        qualityCharacteristics: "Bright silver color, clear eyes, firm body, fresh sea smell"
      },
      "Horse Mackerel": {
        scientificName: "Trachurus trachurus",
        description: "Medium-sized fish with firm, dark flesh and strong flavor. Good for grilling and smoking.",
        typicalSize: "20-40 cm (8-16 in), 0.2-1 kg (0.4-2.2 lbs)",
        habitat: "Coastal waters and open ocean in the Atlantic and Mediterranean",
        imageUrl: "/sample_images/demo_images/Horse_Mackerel.jpg",
        handlingInstructions: "Keep on ice immediately. Store at 0-4°C. Best consumed within 1-2 days.",
        marketValue: "$15.00/lb",
        qualityCharacteristics: "Bright skin, clear eyes, firm flesh, fresh ocean smell"
      },
      "Hourse Mackerel": {
        scientificName: "Trachurus trachurus",
        description: "Medium-sized fish with firm, dark flesh and strong flavor. Good for grilling and smoking.",
        typicalSize: "20-40 cm (8-16 in), 0.2-1 kg (0.4-2.2 lbs)",
        habitat: "Coastal waters and open ocean in the Atlantic and Mediterranean",
        imageUrl: "/sample_images/demo_images/Horse_Mackerel.jpg",
        handlingInstructions: "Keep on ice immediately. Store at 0-4°C. Best consumed within 1-2 days.",
        marketValue: "$15.00/lb",
        qualityCharacteristics: "Bright skin, clear eyes, firm flesh, fresh ocean smell"
      },
      "Red Mullet": {
        scientificName: "Mullus surmuletus",
        description: "Small, colorful fish with delicate, sweet flesh. Highly prized in Mediterranean cuisine.",
        typicalSize: "15-30 cm (6-12 in), 0.1-0.5 kg (0.2-1.1 lbs)",
        habitat: "Sandy and rocky seabeds in the Mediterranean and Eastern Atlantic",
        imageUrl: "/sample_images/demo_images/Red_Mullet.jpg",
        handlingInstructions: "Handle with extreme care. Store at 0-2°C. Consume within 1 day for best quality.",
        marketValue: "$22.00/lb",
        qualityCharacteristics: "Bright red color, clear eyes, firm flesh, fresh smell"
      },
      "Shrimp": {
        scientificName: "Penaeus monodon",
        description: "Large, succulent crustacean with sweet, firm flesh. Popular in various cuisines worldwide.",
        typicalSize: "15-30 cm (6-12 in), 50-200 g (1.8-7 oz)",
        habitat: "Coastal waters, estuaries, and mangrove areas in tropical and subtropical regions",
        imageUrl: "/sample_images/demo_images/Shrimp.jpg",
        handlingInstructions: "Keep alive or on ice. Store at 0-4°C. Consume within 1-2 days.",
        marketValue: "$18.00/lb",
        qualityCharacteristics: "Bright color, firm shell, fresh ocean smell, intact antennae"
      },
      "Striped Red Mullet": {
        scientificName: "Mullus barbatus",
        description: "Small, colorful fish with delicate flesh and distinctive stripes. Popular in Mediterranean cuisine.",
        typicalSize: "12-25 cm (5-10 in), 0.1-0.3 kg (0.2-0.7 lbs)",
        habitat: "Sandy and muddy seabeds in the Mediterranean and Eastern Atlantic",
        imageUrl: "/sample_images/demo_images/Striped_Red_Mullet.jpg",
        handlingInstructions: "Handle with care. Store at 0-2°C. Consume within 1 day for optimal quality.",
        marketValue: "$20.00/lb",
        qualityCharacteristics: "Bright stripes, clear eyes, firm flesh, fresh smell"
      }
    };

    return fishData[speciesName] || {
      scientificName: "Unknown",
      description: "Information not available for this species.",
      typicalSize: "Variable",
      habitat: "Various aquatic environments",
      imageUrl: null,
      handlingInstructions: "Handle with care and store at appropriate temperatures.",
      marketValue: "$15.00/lb",
      qualityCharacteristics: "Standard fish quality indicators apply"
    };
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Fish Directory</h1>
          <p className="text-muted-foreground">
            Browse our comprehensive guide to fish species and handling instructions
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : species.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No fish species found in the directory
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {species.map((fish) => (
                <Card 
                  key={fish.id} 
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedFish(fish)}
                >
                  <CardHeader className="p-0">
                    {fish.image_url ? (
                      <img
                        src={fish.image_url}
                        alt={fish.name}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardHeader>
                    <CardTitle>{fish.name}</CardTitle>
                    {fish.scientific_name && (
                      <CardDescription className="italic">
                        {fish.scientific_name}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {fish.typical_size && (
                      <div className="mb-2">
                        <h4 className="font-semibold mb-1">Typical Size</h4>
                        <p className="text-sm text-muted-foreground">{fish.typical_size}</p>
                      </div>
                    )}
                    {fish.market_value && (
                      <div>
                        <h4 className="font-semibold mb-1">Market Value</h4>
                        <p className="text-sm text-green-600 font-semibold">{fish.market_value}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Dialog open={!!selectedFish} onOpenChange={() => setSelectedFish(null)}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                {selectedFish && (
                  <>
                    <DialogHeader>
                      <DialogTitle className="text-2xl">{selectedFish.name}</DialogTitle>
                      {selectedFish.scientific_name && (
                        <DialogDescription className="italic text-lg">
                          {selectedFish.scientific_name}
                        </DialogDescription>
                      )}
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      {selectedFish.image_url && (
                        <img
                          src={selectedFish.image_url}
                          alt={selectedFish.name}
                          className="w-full h-64 object-cover rounded-md"
                        />
                      )}
                      
                      {selectedFish.description && (
                        <div>
                          <h4 className="font-semibold mb-2">Description</h4>
                          <p className="text-muted-foreground">{selectedFish.description}</p>
                        </div>
                      )}
                      
                      {selectedFish.typical_size && (
                        <div>
                          <h4 className="font-semibold mb-2">Typical Size</h4>
                          <p className="text-muted-foreground">{selectedFish.typical_size}</p>
                        </div>
                      )}
                      
                      {selectedFish.habitat && (
                        <div>
                          <h4 className="font-semibold mb-2">Habitat</h4>
                          <p className="text-muted-foreground">{selectedFish.habitat}</p>
                        </div>
                      )}
                      
                      {selectedFish.handling_instructions && (
                        <div>
                          <h4 className="font-semibold mb-2">Handling Instructions</h4>
                          <p className="text-muted-foreground">{selectedFish.handling_instructions}</p>
                        </div>
                      )}
                      
                      {selectedFish.market_value && (
                        <div>
                          <h4 className="font-semibold mb-2">Market Value</h4>
                          <p className="text-green-600 font-semibold">{selectedFish.market_value}</p>
                        </div>
                      )}
                      
                      {selectedFish.quality_characteristics && (
                        <div>
                          <h4 className="font-semibold mb-2">Quality Characteristics</h4>
                          <p className="text-muted-foreground">{selectedFish.quality_characteristics}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FishDirectory;
