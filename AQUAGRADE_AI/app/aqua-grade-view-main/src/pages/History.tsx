import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Fish, Search, Filter, Download, Calendar, X, RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
// import { supabase } from "@/integrations/supabase/client"; // Removed for local storage
import { exportFishPredictionsToCSV } from "@/lib/csvExport";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
const History = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<HistoryEntry | null>(null);
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [speciesFilter, setSpeciesFilter] = useState<string>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [feedbackFilter, setFeedbackFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchHistory = () => {
      try {
        console.log("Loading history from localStorage...");
        const savedHistory = localStorage.getItem('aquagrade-history');
        console.log("Saved history:", savedHistory);
        
        if (savedHistory) {
          const history = JSON.parse(savedHistory);
          console.log("Parsed history:", history);
          
          const formattedData: HistoryEntry[] = history.map((item: any) => ({
            id: item.id.toString(),
            species: item.species,
            grade: item.quality_grade,
            value: parseFloat(item.market_value.replace('$', '')) || 0,
            handling: item.handling_instructions,
            confidence: item.confidence,
            date: new Date(item.created_at).toLocaleString(),
            thumbnail: item.image_url || "https://images.unsplash.com/photo-1579003593419-98f949b9398f?w=200&h=200&fit=crop",
            wasCorrect: null, // We don't have feedback in local storage yet
            createdAt: new Date(item.created_at)
          }));
          
          console.log("Formatted history data:", formattedData);
          setHistoryData(formattedData);
        } else {
          console.log("No saved history found");
          setHistoryData([]);
        }
      } catch (error) {
        console.error('Error loading history:', error);
        toast({
          title: "Error",
          description: "Failed to load history from local storage",
          variant: "destructive",
        });
        setHistoryData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, []);

  const refreshHistory = () => {
    setLoading(true);
    const fetchHistory = () => {
      try {
        console.log("Refreshing history from localStorage...");
        const savedHistory = localStorage.getItem('aquagrade-history');
        
        if (savedHistory) {
          const history = JSON.parse(savedHistory);
          const formattedData: HistoryEntry[] = history.map((item: any) => ({
            id: item.id.toString(),
            species: item.species,
            grade: item.quality_grade,
            value: parseFloat(item.market_value.replace('$', '')) || 0,
            handling: item.handling_instructions,
            confidence: item.confidence,
            date: new Date(item.created_at).toLocaleString(),
            thumbnail: item.image_url || "https://images.unsplash.com/photo-1579003593419-98f949b9398f?w=200&h=200&fit=crop",
            wasCorrect: null,
            createdAt: new Date(item.created_at)
          }));
          
          setHistoryData(formattedData);
          toast.success(`Loaded ${formattedData.length} history entries`);
        } else {
          setHistoryData([]);
          toast.info("No history found");
        }
      } catch (error) {
        console.error('Error refreshing history:', error);
        toast.error("Failed to refresh history");
        setHistoryData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  };
  const filteredData = historyData.filter(item => {
    // Search filter
    const matchesSearch = item.species.toLowerCase().includes(searchQuery.toLowerCase());

    // Species filter
    const matchesSpecies = speciesFilter === "all" || item.species === speciesFilter;

    // Grade filter
    const matchesGrade = gradeFilter === "all" || item.grade === gradeFilter;

    // Feedback filter
    const matchesFeedback = feedbackFilter === "all" || feedbackFilter === "correct" && item.wasCorrect === true || feedbackFilter === "incorrect" && item.wasCorrect === false || feedbackFilter === "not-reviewed" && item.wasCorrect === null;

    // Date range filter
    const matchesDateFrom = !dateFrom || item.createdAt >= dateFrom;
    const matchesDateTo = !dateTo || item.createdAt <= new Date(dateTo.setHours(23, 59, 59, 999));
    return matchesSearch && matchesSpecies && matchesGrade && matchesFeedback && matchesDateFrom && matchesDateTo;
  });

  // Get unique species and grades for filter dropdowns
  const uniqueSpecies = Array.from(new Set(historyData.map(item => item.species)));
  const uniqueGrades = Array.from(new Set(historyData.map(item => item.grade)));
  const clearFilters = () => {
    setSpeciesFilter("all");
    setGradeFilter("all");
    setFeedbackFilter("all");
    setDateFrom(undefined);
    setDateTo(undefined);
  };
  const hasActiveFilters = speciesFilter !== "all" || gradeFilter !== "all" || feedbackFilter !== "all" || dateFrom || dateTo;
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
  const getConfidenceBadgeVariant = (confidence: number): "success" | "warning" | "destructive" => {
    if (confidence >= 75) return "success";
    if (confidence >= 50) return "warning";
    return "destructive";
  };
  const handleExportCSV = () => {
    if (historyData.length === 0) {
      toast.error("No data to export");
      return;
    }
    exportFishPredictionsToCSV(historyData);
    toast.success("CSV file downloaded successfully!");
  };
  const handleExportSingleCSV = (prediction: HistoryEntry) => {
    exportFishPredictionsToCSV([prediction]);
    toast.success("Prediction exported as CSV!");
  };
  return <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">History</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all your fish quality assessments
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={refreshHistory}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by species..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                <Button variant={showFilters ? "default" : "outline"} className="gap-2" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="h-4 w-4" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
              </div>

              {showFilters && <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Filter Options</h3>
                    {hasActiveFilters && <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-2" />
                        Clear All
                      </Button>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Species Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Species</label>
                      <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Species" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Species</SelectItem>
                          {uniqueSpecies.map(species => <SelectItem key={species} value={species}>{species}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Grade Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quality Grade</label>
                      <Select value={gradeFilter} onValueChange={setGradeFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Grades" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Grades</SelectItem>
                          {uniqueGrades.map(grade => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date From */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">From Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
                            <Calendar className="mr-2 h-4 w-4" />
                            {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className="pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Date To */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">To Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
                            <Calendar className="mr-2 h-4 w-4" />
                            {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className="pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Feedback Filter Tabs */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Feedback Status</label>
                    <Tabs value={feedbackFilter} onValueChange={setFeedbackFilter}>
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="correct">Correct</TabsTrigger>
                        <TabsTrigger value="incorrect">Incorrect</TabsTrigger>
                        <TabsTrigger value="not-reviewed">Not Reviewed</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>}
            </div>
          </CardContent>
        </Card>

        {/* History Records */}
        {loading ? (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <RefreshCw className="h-8 w-8 mx-auto text-muted-foreground mb-4 animate-spin" />
              <h3 className="text-lg font-semibold mb-2">Loading History...</h3>
              <p className="text-muted-foreground">Please wait while we load your fish assessments</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredData.map(item => <Card key={item.id} className="shadow-card hover:shadow-ocean transition-all duration-300 cursor-pointer" onClick={() => setSelectedItem(item)}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    <div className="relative w-full md:w-32 h-32 rounded-lg overflow-hidden bg-muted">
                      <img src={item.thumbnail} alt={item.species} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2">
                        <Badge variant={getConfidenceBadgeVariant(item.confidence)} className="text-xs">
                          {item.confidence}%
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                      <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          {item.species}
                          <Badge variant={getGradeBadgeVariant(item.grade)}>
                            {item.grade}
                          </Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{item.date}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-2xl font-bold text-success">${item.value.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">per lb</p>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Fish className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Handling:</span>
                        <span>{item.handling}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>)}
            
            {filteredData.length === 0 && (
              <Card className="shadow-card">
                <CardContent className="py-12 text-center">
                  <Fish className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No predictions yet</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? "Try adjusting your search criteria" : "Start by uploading a fish image to get your first prediction"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Fish className="h-5 w-5 text-primary" />
                {selectedItem?.species}
              </DialogTitle>
              <DialogDescription>
                Detailed assessment and handling information
              </DialogDescription>
            </DialogHeader>
            
            {selectedItem && <div className="space-y-6">
                {/* Image */}
                <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted">
                  <img src={selectedItem.thumbnail} alt={selectedItem.species} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4">
                    <Badge variant={getConfidenceBadgeVariant(selectedItem.confidence)}>
                      {selectedItem.confidence}% Confidence
                    </Badge>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Species</p>
                    <p className="font-semibold text-lg">{selectedItem.species}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Quality Grade</p>
                    <Badge variant={getGradeBadgeVariant(selectedItem.grade)} className="w-fit">
                      {selectedItem.grade}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Market Value</p>
                    <p className="font-semibold text-lg text-success">
                      ${selectedItem.value.toFixed(2)} per lb
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-medium">{selectedItem.date}</p>
                  </div>
                </div>

                {/* Handling Instructions */}
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Fish className="h-4 w-4 text-primary" />
                    Detailed Handling Instructions
                  </h4>
                  <p className="text-sm leading-relaxed">
                    {selectedItem.handling}
                    {selectedItem.grade === "Sushi-Grade" && " For optimal sushi quality, maintain temperature between 0-2°C at all times. Process within 24 hours of catch. Use proper bleeding and ice slurry techniques immediately after catch."}
                    {selectedItem.grade === "Premium" && " Maintain in ice slurry. Ideal for both raw and cooked applications. Store at 2-4°C and process within 48 hours for best quality. Handle with care to avoid bruising."}
                    {selectedItem.grade === "Standard" && " Best for cooking applications. Store on ice and use within 72 hours. Suitable for grilling, baking, or frying. Ensure proper cooking to internal temperature of 145°F."}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => handleExportSingleCSV(selectedItem)}>
                    <Download className="mr-2 h-4 w-4" />
                    Export as CSV
                  </Button>
                  <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setSelectedItem(null)}>
                    Close
                  </Button>
                </div>
              </div>}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>;
};
export default History;