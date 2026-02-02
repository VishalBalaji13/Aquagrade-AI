import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Fish, Save, RefreshCw, ThumbsUp, ThumbsDown } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { toast } from "sonner";
import { format } from "date-fns";
// cn utility will be defined at the bottom

// Reuse HistoryEntry interface from History page
interface HistoryEntry {
  id: string;
  species: string;
  grade: string;
  value: number;
  handling: string;
  confidence: number;
  date: string;
  thumbnail: string;
  wasCorrect: boolean | null;
  createdAt: Date;
}

const Feedback = () => {
  const [selectedPrediction, setSelectedPrediction] = useState<HistoryEntry | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<"correct" | "incorrect" | null>(null);
  const [predictions, setPredictions] = useState<HistoryEntry[]>([]);
  const [correctedSpecies, setCorrectedSpecies] = useState<string>("");
  const [correctedGrade, setCorrectedGrade] = useState<string>("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = () => {
    try {
      console.log("Loading predictions from localStorage for feedback...");
      const savedHistory = localStorage.getItem('aquagrade-history');
      console.log("Raw localStorage data:", savedHistory);
      
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        console.log("Parsed history for feedback:", history);
        console.log("Number of history entries:", history.length);
        
        const formattedData: HistoryEntry[] = history.map((item: any) => ({
          id: item.id.toString(),
          species: item.species,
          grade: item.quality_grade,
          value: parseFloat(item.market_value?.replace('$', '') || '0') || 0,
          handling: item.handling_instructions || 'Standard handling',
          confidence: parseFloat(item.confidence?.toString() || '0') || 0,
          date: item.timestamp || item.created_at || new Date().toISOString(),
          thumbnail: item.image_url || '/sample_images/demo_images/red_sea_bream_sample.jpg',
          wasCorrect: item.wasCorrect || null,
          createdAt: new Date(item.created_at || item.timestamp || new Date())
        }));
        
        setPredictions(formattedData);
        console.log("Formatted predictions for feedback:", formattedData);
        console.log("Sample image paths being used:");
        formattedData.forEach((item, index) => {
          console.log(`Prediction ${index + 1}: ${item.thumbnail}`);
        });
      } else {
        console.log("No history found in localStorage for feedback");
        // Add some sample data for testing if no real data exists
        const sampleData: HistoryEntry[] = [
          {
            id: "sample-1",
            species: "Red Sea Bream",
            grade: "Premium",
            value: 32.50,
            handling: "Store at 0-4°C, consume within 2-3 days",
            confidence: 94.5,
            date: new Date().toISOString(),
            thumbnail: "/sample_images/demo_images/red_sea_bream_sample.jpg",
            wasCorrect: null,
            createdAt: new Date()
          },
          {
            id: "sample-2", 
            species: "Sea Bass",
            grade: "Standard",
            value: 24.00,
            handling: "Standard handling procedures",
            confidence: 87.2,
            date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            thumbnail: "/sample_images/demo_images/sea_bass_sample.jpg",
            wasCorrect: null,
            createdAt: new Date(Date.now() - 86400000)
          }
        ];
        setPredictions(sampleData);
        console.log("Using sample data for testing feedback functionality");
      }
    } catch (error) {
      console.error("Error loading predictions for feedback:", error);
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };
  const handleFeedbackClick = (predictionId: string, isCorrect: boolean) => {
    try {
      // Update local storage
      const savedHistory = localStorage.getItem('aquagrade-history');
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        const updatedHistory = history.map((item: any) => 
          item.id.toString() === predictionId 
            ? { ...item, wasCorrect: isCorrect }
            : item
        );
        localStorage.setItem('aquagrade-history', JSON.stringify(updatedHistory));
        
        // Update local state
        const updatedPredictions = predictions.map(p => 
          p.id === predictionId 
            ? { ...p, wasCorrect: isCorrect }
            : p
        );
        setPredictions(updatedPredictions);
        
        toast.success(`Feedback recorded: ${isCorrect ? "Correct" : "Incorrect"}`);
      }
    } catch (error) {
      console.error("Error recording feedback:", error);
      toast.error("Failed to record feedback");
    }
  };
  const handleSubmitFeedback = () => {
    if (!selectedPrediction || !feedbackStatus) return;
    
    // Record the feedback
    handleFeedbackClick(selectedPrediction.id, feedbackStatus === "correct");
    
    // Reset form
    setSelectedPrediction(null);
    setFeedbackStatus(null);
    setCorrectedSpecies("");
    setCorrectedGrade("");
  };

  const handleSelectPrediction = (prediction: HistoryEntry) => {
    setSelectedPrediction(prediction);
    setCorrectedSpecies(prediction.species);
    setCorrectedGrade(prediction.grade);
    setFeedbackStatus(prediction.wasCorrect === true ? "correct" : prediction.wasCorrect === false ? "incorrect" : null);
  };

  const handleSpeciesChange = (value: string) => {
    setCorrectedSpecies(value);
  };

  const handleGradeChange = (value: string) => {
    setCorrectedGrade(value);
  };
  return <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Model Feedback</h1>
          <p className="text-muted-foreground mt-1">
            Help improve prediction accuracy by providing feedback
          </p>
        </div>

        {/* Info Card */}
        <Card className="shadow-card bg-accent/10 border-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Fish className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Why Your Feedback Matters</h3>
                <p className="text-sm text-muted-foreground">
                  Your corrections help train our AI model to make more accurate predictions. 
                  Each piece of feedback contributes to better species identification and quality grading for the entire fishing community.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Predictions */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Predictions</CardTitle>
                <CardDescription>Select a prediction to provide feedback</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchPredictions}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center">
                <RefreshCw className="h-8 w-8 mx-auto text-muted-foreground mb-4 animate-spin" />
                <p className="text-muted-foreground">Loading predictions...</p>
              </div>
            ) : predictions.length === 0 ? (
              <div className="py-12 text-center">
                <Fish className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No predictions yet</h3>
                <p className="text-muted-foreground">
                  Start by uploading a fish image to get your first prediction
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {predictions.map(prediction => (
                  <div 
                    key={prediction.id} 
                    className={cn(
                      "p-4 border rounded-lg transition-all cursor-pointer",
                      selectedPrediction?.id === prediction.id 
                        ? "border-primary bg-primary/5" 
                        : "hover:bg-muted/50"
                    )} 
                    onClick={() => handleSelectPrediction(prediction)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                          <img 
                            src={prediction.thumbnail} 
                            alt={prediction.species} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.log("Image failed to load:", prediction.thumbnail);
                              const target = e.target as HTMLImageElement;
                              target.src = '/sample_images/demo_images/red_sea_bream_sample.jpg';
                            }}
                            onLoad={() => {
                              console.log("Image loaded successfully:", prediction.thumbnail);
                            }}
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold">{prediction.species}</h4>
                          <p className="text-sm text-muted-foreground">
                            {prediction.grade} • {prediction.confidence}% confidence
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(prediction.createdAt), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {prediction.wasCorrect === true ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Correct
                          </Badge>
                        ) : prediction.wasCorrect === false ? (
                          <Badge variant="destructive">
                            <ThumbsDown className="h-3 w-3 mr-1" />
                            Incorrect
                          </Badge>
                        ) : (
                          <Badge variant="outline">Needs Feedback</Badge>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFeedbackClick(prediction.id, true);
                          }}
                          className={prediction.wasCorrect === true ? "bg-green-100 hover:bg-green-200" : ""}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFeedbackClick(prediction.id, false);
                          }}
                          className={prediction.wasCorrect === false ? "bg-red-100 hover:bg-red-200" : ""}
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feedback Form */}
        {selectedPrediction && <Card className="shadow-ocean animate-fade-in">
            <CardHeader>
              <CardTitle>Provide Feedback for Selected Prediction</CardTitle>
              <CardDescription>
                Help us improve by providing feedback on this prediction
              </CardDescription>
              {selectedPrediction && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      <img 
                        src={selectedPrediction.thumbnail} 
                        alt={selectedPrediction.species} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log("Feedback form image failed to load:", selectedPrediction.thumbnail);
                          const target = e.target as HTMLImageElement;
                          target.src = '/sample_images/demo_images/red_sea_bream_sample.jpg';
                        }}
                        onLoad={() => {
                          console.log("Feedback form image loaded successfully:", selectedPrediction.thumbnail);
                        }}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold">{selectedPrediction.species}</h4>
                      <p className="text-sm text-muted-foreground">
                        Predicted: {selectedPrediction.grade} • {selectedPrediction.confidence}% confidence
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(selectedPrediction.createdAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
              {/* Accuracy Assessment */}
              <div className="space-y-4">
                <Label className="text-base">Was the prediction accurate?</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant={feedbackStatus === "correct" ? "default" : "outline"} className={cn("h-auto py-4 gap-3", feedbackStatus === "correct" ? "border-success bg-success text-success-foreground" : "hover:border-success hover:bg-success/5")} onClick={() => setFeedbackStatus("correct")}>
                    <CheckCircle className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-semibold">Correct</p>
                      <p className="text-xs opacity-80">Prediction was accurate</p>
                    </div>
                  </Button>
                  <Button variant={feedbackStatus === "incorrect" ? "default" : "outline"} className={cn("h-auto py-4 gap-3", feedbackStatus === "incorrect" ? "border-destructive bg-destructive text-destructive-foreground" : "hover:border-destructive hover:bg-destructive/5")} onClick={() => setFeedbackStatus("incorrect")}>
                    <XCircle className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-semibold">Incorrect</p>
                      <p className="text-xs opacity-80">Needs correction</p>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Correction Fields */}
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="correctSpecies">Correct Species</Label>
                  <Input 
                    id="correctSpecies" 
                    name="correctSpecies" 
                    placeholder="e.g., Atlantic Salmon" 
                    value={correctedSpecies}
                    onChange={(e) => handleSpeciesChange(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="correctGrade">Correct Quality Grade</Label>
                  <Select name="correctGrade" value={correctedGrade} onValueChange={handleGradeChange}>
                    <SelectTrigger id="correctGrade">
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sushi-Grade">Sushi-Grade</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Standard">Standard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                

                <div className="space-y-2">
                  <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
                  <Textarea id="additionalNotes" placeholder="Any other observations or comments..." rows={3} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => {
                  setSelectedPrediction(null);
                  setFeedbackStatus(null);
                  setCorrectedSpecies("");
                  setCorrectedGrade("");
                }}>
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" 
                  onClick={handleSubmitFeedback}
                  disabled={!feedbackStatus}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Submit Feedback
                </Button>
              </div>
              </form>
            </CardContent>
          </Card>}
      </div>
    </DashboardLayout>;
};
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
export default Feedback;