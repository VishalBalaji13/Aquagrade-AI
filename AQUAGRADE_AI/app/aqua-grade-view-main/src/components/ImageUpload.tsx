import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  onUpload: (file: File) => void;
  onClose: () => void;
}

export const ImageUpload = ({ onUpload, onClose }: ImageUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    toast.info("Analyzing fish image...");
    
    try {
      await onUpload(selectedFile);
      toast.success("Analysis complete!");
    } catch (error) {
      toast.error("Analysis failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-2xl shadow-ocean">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Upload Fish Image</h2>
              <p className="text-muted-foreground mt-1">
                Upload a clear photo for AI-powered analysis
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              disabled={isUploading}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {!preview ? (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
                dragActive 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-muted rounded-full">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-medium mb-1">
                    Drag and drop your image here
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click to browse (Max 10MB)
                  </p>
                  <Button 
                    variant="ocean"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Choose Image
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden bg-muted">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full h-80 object-contain"
                />
                {!isUploading && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreview("");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={onClose}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="ocean" 
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Analyze Fish
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
