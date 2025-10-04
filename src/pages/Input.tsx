import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input as InputField } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Link2, Image as ImageIcon, ArrowLeft, Upload } from "lucide-react";
import { toast } from "sonner";

const Input = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "text";

  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const getModeConfig = () => {
    switch (mode) {
      case "text":
        return {
          icon: FileText,
          title: "Analyze News Text",
          description: "Paste the title and body text of the news article you want to verify",
          color: "text-primary",
        };
      case "url":
        return {
          icon: Link2,
          title: "Analyze Article URL",
          description: "Paste the URL of the news article you want to verify",
          color: "text-secondary",
        };
      case "image":
        return {
          icon: ImageIcon,
          title: "Analyze News Image",
          description: "Upload an image containing news text (OCR will extract the text)",
          color: "text-accent",
        };
      default:
        return {
          icon: FileText,
          title: "Analyze Content",
          description: "Enter content to analyze",
          color: "text-primary",
        };
    }
  };

  const handleSubmit = async () => {
    // Validate input based on mode
    if (mode === "text" && !textInput.trim()) {
      toast.error("Please enter some text to analyze");
      return;
    }
    if (mode === "url" && !urlInput.trim()) {
      toast.error("Please enter a URL to analyze");
      return;
    }
    if (mode === "image" && !imageFile) {
      toast.error("Please upload an image to analyze");
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare data for navigation
      const inputData = {
        mode,
        text: mode === "text" ? textInput : undefined,
        url: mode === "url" ? urlInput : undefined,
        imageFile: mode === "image" ? imageFile?.name : undefined,
      };

      // Store in sessionStorage for the analysis page
      sessionStorage.setItem('analysisInput', JSON.stringify({
        text: textInput,
        title: mode === "text" ? textInput.split('\n')[0].substring(0, 100) : undefined,
        url: urlInput,
        imageUrl: imageFile?.name,
      }));

      // Navigate to analysis
      const queryData = mode === "text" 
        ? textInput.substring(0, 100) 
        : mode === "url" 
        ? urlInput 
        : "image-uploaded";
      
      navigate(`/analysis?mode=${mode}&query=${encodeURIComponent(queryData)}`);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit content');
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size should be less than 10MB");
        return;
      }
      setImageFile(file);
      toast.success("Image uploaded successfully");
    }
  };

  const config = getModeConfig();
  const ModeIcon = config.icon;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/landing")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2" />
              Back to Landing
            </Button>
            <h1 className="text-2xl font-bold text-gradient">Input Content</h1>
            <div className="w-24"></div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Mode Header */}
            <Card className="glassmorphism p-6 text-center animate-fade-in">
              <ModeIcon className={`w-16 h-16 mx-auto mb-4 ${config.color}`} />
              <h2 className="text-3xl font-bold text-foreground mb-2">{config.title}</h2>
              <p className="text-muted-foreground">{config.description}</p>
            </Card>

            {/* Input Form */}
            <Card className="glassmorphism p-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="space-y-6">
                {mode === "text" && (
                  <div className="space-y-3">
                    <Label htmlFor="text-input" className="text-lg font-semibold">
                      News Content
                    </Label>
                    <Textarea
                      id="text-input"
                      placeholder="Paste the title and body text of the news article here..."
                      className="min-h-[300px] text-base bg-muted/50 border-2 border-primary/30 focus:border-primary"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Include both the headline and the full article text for best results
                    </p>
                  </div>
                )}

                {mode === "url" && (
                  <div className="space-y-3">
                    <Label htmlFor="url-input" className="text-lg font-semibold">
                      Article URL
                    </Label>
                    <InputField
                      id="url-input"
                      type="url"
                      placeholder="https://example.com/news-article"
                      className="h-14 text-base bg-muted/50 border-2 border-secondary/30 focus:border-secondary"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter the full URL of the news article to analyze
                    </p>
                  </div>
                )}

                {mode === "image" && (
                  <div className="space-y-3">
                    <Label htmlFor="image-input" className="text-lg font-semibold">
                      Upload Image
                    </Label>
                    <div className="border-2 border-dashed border-accent/30 rounded-lg p-8 text-center hover:border-accent/50 transition-colors">
                      <input
                        id="image-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="image-input" className="cursor-pointer">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-accent" />
                        <p className="text-lg font-semibold text-foreground mb-2">
                          {imageFile ? imageFile.name : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          PNG, JPG, WEBP up to 10MB
                        </p>
                      </label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Upload an image containing news text. OCR will extract and analyze the text.
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  variant="neon"
                  size="lg"
                  className="w-full h-14 text-lg"
                  onClick={handleSubmit}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Analyze Content"}
                </Button>
              </div>
            </Card>

            {/* Info Card */}
            <Card className="glassmorphism p-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <h3 className="text-lg font-bold text-foreground mb-3">How it works</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Multi-agent AI system analyzes your content</li>
                <li>✓ Cross-references with trusted fact-checking sources</li>
                <li>✓ Provides confidence score and supporting evidence</li>
                <li>✓ Detects misinformation patterns and manipulation tactics</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Input;
