import { Button } from "@/components/ui/button";
import { Fish, Waves, TrendingUp, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-wave">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50 shadow-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <Fish className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-primary">AquaGrade AI</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button variant="ocean" onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center space-y-8 animate-fade-in">
          <div className="inline-block">
            <div className="px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
              <p className="text-sm font-medium text-secondary">AI-Powered Fish Quality Assessment</p>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Transform Your Catch Into
            <span className="block text-primary mt-2">Data-Driven Decisions</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Instantly identify fish species, assess quality grades, and get real-time market valuations 
            with cutting-edge AI technology built for commercial fishermen.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="ocean" 
              onClick={() => navigate("/auth")}
              className="text-lg px-8 shadow-ocean"
            >
              Start Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate("/auth")}
              className="text-lg px-8"
            >
              Watch Demo
            </Button>
          </div>

          <div className="pt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-success" />
              <span>95%+ Accuracy</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent" />
              <span>Instant Results</span>
            </div>
            <div className="flex items-center gap-2">
              <Fish className="h-4 w-4 text-secondary" />
              <span>1000+ Species</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20 border-t">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Grade Your Catch
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional-grade AI tools designed specifically for the commercial fishing industry
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-card shadow-card hover:shadow-ocean transition-all duration-300 animate-fade-in">
            <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
              <Fish className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Species Recognition</h3>
            <p className="text-muted-foreground">
              AI identifies over 1,000 fish species with 95%+ accuracy in seconds. 
              Know exactly what you've caught, every time.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-card shadow-card hover:shadow-ocean transition-all duration-300 animate-fade-in">
            <div className="p-3 bg-secondary/10 rounded-xl w-fit mb-4">
              <TrendingUp className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Quality Grading</h3>
            <p className="text-muted-foreground">
              Get precise quality assessments from Sushi-Grade to Standard, 
              with detailed handling recommendations for maximum value.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-card shadow-card hover:shadow-ocean transition-all duration-300 animate-fade-in">
            <div className="p-3 bg-accent/10 rounded-xl w-fit mb-4">
              <Waves className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-3">Market Insights</h3>
            <p className="text-muted-foreground">
              Real-time market value estimates help you make informed decisions 
              about handling, storage, and sales pricing.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 border-t">
        <div className="max-w-4xl mx-auto text-center space-y-6 p-12 rounded-3xl bg-gradient-ocean shadow-ocean">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
            Ready to Upgrade Your Operations?
          </h2>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            Join hundreds of commercial fishermen using AquaGrade AI to maximize their catch value
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate("/auth")}
              className="text-lg px-8"
            >
              Start Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Fish className="h-5 w-5 text-primary" />
            <span className="font-bold text-primary">AquaGrade AI</span>
          </div>
          <p className="text-sm">
            © 2024 AquaGrade AI. All rights reserved. 
            Built for fishermen, by technology.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
