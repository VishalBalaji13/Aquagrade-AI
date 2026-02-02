import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Fish, TrendingUp, AlertCircle, DollarSign, Upload, CheckCircle } from "lucide-react";

interface PredictionResult {
  species: string;
  grade: string;
  handling: string;
  value: number;
  confidence: number;
  imageUrl: string;
}

interface PredictionDisplayProps {
  prediction: PredictionResult;
  onNewUpload: () => void;
  onExportReport?: () => void;
}

export const PredictionDisplay = ({ prediction, onNewUpload, onExportReport }: PredictionDisplayProps) => {
  const getGradeBadgeVariant = (grade: string) => {
    switch (grade) {
      case "Sushi-Grade":
        return "default";
      case "Premium":
        return "secondary";
      case "Standard":
        return "outline";
      default:
        return "outline";
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "Sushi-Grade":
        return "text-primary";
      case "Premium":
        return "text-secondary";
      case "Standard":
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  const getConfidenceBadgeVariant = (confidence: number): "success" | "warning" | "destructive" => {
    if (confidence >= 75) return "success";
    if (confidence >= 50) return "warning";
    return "destructive";
  };

  return (
    <Card className="shadow-ocean animate-fade-in">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-success" />
            Analysis Complete
          </CardTitle>
          <Button variant="ocean" onClick={onNewUpload}>
            <Upload className="mr-2 h-4 w-4" />
            Analyze Another
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Image Preview */}
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden bg-muted">
              <img 
                src={prediction.imageUrl} 
                alt="Fish preview" 
                className="w-full h-80 object-contain"
              />
              <div className="absolute top-2 right-2">
                <Badge variant={getConfidenceBadgeVariant(prediction.confidence)} className="text-xs">
                  {prediction.confidence}%
                </Badge>
              </div>
            </div>
          </div>

          {/* Prediction Results */}
          <div className="space-y-6">
            {/* Species */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Fish className="h-4 w-4" />
                Species
              </div>
              <p className="text-3xl font-bold">{prediction.species}</p>
            </div>

            {/* Quality Grade */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Quality Grade
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getGradeBadgeVariant(prediction.grade)} className="text-lg py-1">
                  {prediction.grade}
                </Badge>
              </div>
            </div>

            {/* Market Value */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Estimated Market Value
              </div>
              <p className="text-2xl font-bold text-success">
                ${prediction.value.toFixed(2)} <span className="text-base font-normal text-muted-foreground">per lb</span>
              </p>
            </div>

            {/* Handling Recommendations */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                Handling Recommendations
              </div>
              <Card className="bg-accent/10 border-accent/20">
                <CardContent className="pt-4">
                  <p className="text-sm leading-relaxed">
                    {prediction.handling}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button 
                variant="success" 
                className="flex-1"
                onClick={onExportReport}
                disabled={!onExportReport}
              >
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
