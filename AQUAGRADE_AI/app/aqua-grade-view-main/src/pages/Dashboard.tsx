import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Fish, Upload, TrendingUp, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ImageUpload } from "@/components/ImageUpload";
import { PredictionDisplay } from "@/components/PredictionDisplay";
// import { supabase } from "@/integrations/supabase/client"; // Removed for now
import { toast } from "sonner";
import AquaGradeAPI from "@/lib/aquagradeApi";

interface PredictionResult {
  species: string;
  grade: string;
  handling: string;
  value: number;
  confidence: number;
  imageUrl: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [showUpload, setShowUpload] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalAnalyzed: 0,
    totalValue: 0,
    recentPredictions: [] as any[]
  });

  // Load saved history from localStorage on component mount
  useEffect(() => {
    console.log("Loading history from localStorage...");
    const savedHistory = localStorage.getItem('aquagrade-history');
    console.log("Saved history from localStorage:", savedHistory);
    
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        console.log("Parsed history on load:", history);
        
        const totalValue = history.reduce((sum: number, item: any) => sum + (parseFloat(item.market_value) || 0), 0);
        console.log("Calculated total value:", totalValue);
        
        const newStats = {
          totalAnalyzed: history.length,
          totalValue,
          recentPredictions: history.slice(0, 3) // Show last 3
        };
        
        console.log("Setting stats:", newStats);
        setStats(newStats);
      } catch (error) {
        console.error('Error loading history:', error);
      }
    } else {
      console.log("No saved history found");
    }
  }, []);

  useEffect(() => {
    // For now, we'll work without authentication
    // You can add Supabase auth later when it's configured
    setUserId('demo-user');
  }, []);

  // Export analysis as PDF
  const exportAnalysis = async (prediction: PredictionResult) => {
    try {
      // Dynamic import to avoid SSR issues
      const { default: jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Colors
      const primaryColor: [number, number, number] = [59, 130, 246]; // Blue
      const successColor: [number, number, number] = [34, 197, 94]; // Green
      const warningColor: [number, number, number] = [245, 158, 11]; // Orange
      
      // Header
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 30, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('AquaGrade AI', 20, 20);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Fish Quality Assessment Report', 20, 25);
      
      // Analysis timestamp
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 60, 25);
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      // Add the analyzed fish image
      let yPos = 50;
      try {
        // Create an image element to load the image
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Handle CORS if needed
        
        // Wait for image to load
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = prediction.imageUrl;
        });
        
        // Calculate image dimensions (max width 80mm, maintain aspect ratio)
        const maxWidth = 80;
        const maxHeight = 60;
        let imgWidth = img.width;
        let imgHeight = img.height;
        
        // Scale down if too large
        if (imgWidth > maxWidth) {
          const ratio = maxWidth / imgWidth;
          imgWidth = maxWidth;
          imgHeight = imgHeight * ratio;
        }
        if (imgHeight > maxHeight) {
          const ratio = maxHeight / imgHeight;
          imgHeight = maxHeight;
          imgWidth = imgWidth * ratio;
        }
        
        // Center the image
        const imgX = (pageWidth - imgWidth) / 2;
        const imgY = yPos;
        
        // Determine image format
        let imageFormat = 'JPEG';
        if (prediction.imageUrl.includes('data:image/png')) {
          imageFormat = 'PNG';
        } else if (prediction.imageUrl.includes('data:image/jpeg') || prediction.imageUrl.includes('data:image/jpg')) {
          imageFormat = 'JPEG';
        } else if (prediction.imageUrl.includes('data:image/webp')) {
          imageFormat = 'WEBP';
        }
        
        // Add image to PDF
        doc.addImage(img, imageFormat, imgX, imgY, imgWidth, imgHeight);
        
        // Add border around image
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.rect(imgX - 2, imgY - 2, imgWidth + 4, imgHeight + 4);
        
        // Add caption
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Analyzed Fish Image', pageWidth / 2, imgY + imgHeight + 8, { align: 'center' });
        
        yPos = imgY + imgHeight + 20;
      } catch (imageError) {
        console.warn('Could not load image for PDF:', imageError);
        // Add a placeholder if image fails to load
        doc.setFontSize(12);
        doc.setTextColor(150, 150, 150);
        doc.text('Image not available', pageWidth / 2, yPos + 20, { align: 'center' });
        yPos += 30;
      }
      
      // Species Information
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Species Analysis', 20, yPos);
      
      yPos += 15;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      // Species name with confidence
      doc.setFont('helvetica', 'bold');
      doc.text('Species:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(prediction.species, 60, yPos);
      
      yPos += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Confidence:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...successColor);
      doc.text(`${prediction.confidence}%`, 70, yPos);
      
      // Quality Assessment
      yPos += 20;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Quality Assessment', 20, yPos);
      
      yPos += 15;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      // Quality grade
      doc.setFont('helvetica', 'bold');
      doc.text('Grade:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      
      // Color code the grade
      if (prediction.grade === 'Premium' || prediction.grade === 'Sushi-Grade') {
        doc.setTextColor(...successColor);
      } else if (prediction.grade === 'Standard') {
        doc.setTextColor(...warningColor);
      } else {
        doc.setTextColor(239, 68, 68); // Red
      }
      doc.text(prediction.grade, 50, yPos);
      
      // Market Information
      yPos += 20;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Market Information', 20, yPos);
      
      yPos += 15;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      doc.setFont('helvetica', 'bold');
      doc.text('Estimated Value:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...successColor);
      doc.text(`$${prediction.value.toFixed(2)}/lb`, 80, yPos);
      
      // Handling Recommendations
      yPos += 20;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Handling Recommendations', 20, yPos);
      
      yPos += 15;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      // Split long text into multiple lines
      const maxWidth = pageWidth - 40;
      const handlingLines = doc.splitTextToSize(prediction.handling, maxWidth);
      doc.text(handlingLines, 20, yPos);
      
      // Footer
      const footerY = pageHeight - 20;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Generated by AquaGrade AI - Advanced Fish Quality Assessment System', 20, footerY);
      doc.text('www.aquagrade-ai.com', pageWidth - 50, footerY);
      
      // Save the PDF
      const fileName = `fish-analysis-${prediction.species.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`;
      doc.save(fileName);
      
      toast.success("Analysis exported as PDF!");
      return true;
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error("Failed to export PDF. Please try again.");
      return false;
    }
  };

  // Save analysis to localStorage
  const saveAnalysisToHistory = (result: any, imageUrl: string) => {
    try {
      console.log("saveAnalysisToHistory called with:", result, imageUrl);
      
      const savedHistory = localStorage.getItem('aquagrade-history');
      console.log("Existing history:", savedHistory);
      
      const history = savedHistory ? JSON.parse(savedHistory) : [];
      console.log("Parsed history:", history);
      
      const newEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        species: result.species.name,
        quality_grade: result.quality.grade,
        market_value: result.market.pricePerPound,
        confidence: parseFloat(result.species.confidence),
        image_url: imageUrl,
        handling_instructions: result.handling.recommendations.join(' '),
        created_at: new Date().toISOString()
      };
      
      console.log("New entry:", newEntry);
      
      // Add to beginning of array (most recent first)
      const updatedHistory = [newEntry, ...history];
      console.log("Updated history:", updatedHistory);
      
      // Keep only last 50 entries to prevent localStorage from getting too large
      const trimmedHistory = updatedHistory.slice(0, 50);
      console.log("Trimmed history:", trimmedHistory);
      
      localStorage.setItem('aquagrade-history', JSON.stringify(trimmedHistory));
      console.log("Saved to localStorage");
      
      // Update stats
      const totalValue = trimmedHistory.reduce((sum: number, item: any) => sum + (parseFloat(item.market_value) || 0), 0);
      console.log("Total value:", totalValue);
      
      setStats({
        totalAnalyzed: trimmedHistory.length,
        totalValue,
        recentPredictions: trimmedHistory.slice(0, 3)
      });
      
      console.log("Stats updated");
      return true;
    } catch (error) {
      console.error('Error saving to history:', error);
      return false;
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      // Call AquaGrade AI API
      const result = await AquaGradeAPI.analyzeFish(file, {
        debug: false,
        saveToDb: false // Using local storage for now
      });

      // Create a local URL for the image preview
      const imageUrl = URL.createObjectURL(file);

      // Update UI with result
      setPrediction({
        species: result.species.name,
        grade: result.quality.grade,
        handling: result.handling.recommendations.join(' '),
        value: parseFloat(result.market.pricePerPound.replace('$', '')),
        confidence: parseFloat(result.species.confidence),
        imageUrl: imageUrl,
      });

      setShowUpload(false);
      toast.success("Analysis complete!");
      
      // Automatically save to history
      console.log("Saving to history:", result, imageUrl);
      const saveSuccess = saveAnalysisToHistory(result, imageUrl);
      console.log("Save result:", saveSuccess);
      
      if (saveSuccess) {
        console.log("Successfully saved to history");
      } else {
        console.error("Failed to save to history");
      }
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error("Failed to analyze fish. Make sure the AquaGrade AI backend is running.");
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Upload fish images for instant AI-powered quality analysis
            </p>
          </div>
          
          <Button 
            size="lg"
            onClick={() => setShowUpload(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-ocean"
          >
            <Upload className="mr-2 h-5 w-5" />
            Upload Fish Image
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-card hover:shadow-ocean transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Analyzed</CardTitle>
              <Fish className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAnalyzed}</div>
              <p className="text-xs text-muted-foreground">Total predictions</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-ocean transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Grade</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalAnalyzed > 0 ? 'Premium' : '-'}
              </div>
              <p className="text-xs text-muted-foreground">Quality analysis</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-ocean transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Est. Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalValue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Total market value</p>
            </CardContent>
          </Card>
        </div>

        {/* Prediction Result */}
        {prediction && (
          <PredictionDisplay 
            prediction={prediction} 
            onNewUpload={() => {
              setPrediction(null);
              setShowUpload(true);
            }}
            onExportReport={() => {
              if (prediction) {
                exportAnalysis(prediction);
              }
            }}
          />
        )}

        {/* Recent Activity */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest fish quality assessments</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => navigate("/history")}
              >
                View All
                <History className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentPredictions.length > 0 ? (
                stats.recentPredictions.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate("/history")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Fish className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{item.species}</p>
                        <p className="text-sm text-muted-foreground">
                          {getTimeAgo(item.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{item.quality_grade}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Fish className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No predictions yet. Upload your first fish image!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <ImageUpload 
          onUpload={handleImageUpload}
          onClose={() => setShowUpload(false)}
        />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
