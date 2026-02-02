import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Waves, Fish } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    } else {
      toast.success("Welcome back to AquaGrade AI!");
      navigate("/dashboard");
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    } else {
      // With auto-confirm enabled, user is automatically signed in
      if (data.session) {
        toast.success("Welcome to AquaGrade AI!");
        navigate("/dashboard");
      } else {
        toast.success("Account created! Please check your email to confirm.");
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-wave flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="hidden lg:flex flex-col gap-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-2xl">
              <Fish className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">AquaGrade AI</h1>
              <p className="text-muted-foreground">Intelligent Fish Quality Assessment</p>
            </div>
          </div>
          
          <div className="space-y-4 text-foreground/90">
            <h2 className="text-4xl font-bold leading-tight">
              Transform Your <span className="text-primary">Fish Quality</span> Analysis
            </h2>
            <p className="text-lg text-muted-foreground">
              Advanced AI-powered fish species identification and quality grading for commercial fishermen and seafood professionals.
            </p>
            
            <div className="grid gap-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <Waves className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold">Instant Species Recognition</h3>
                  <p className="text-sm text-muted-foreground">AI identifies fish species in seconds with 95%+ accuracy</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <Waves className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">Quality Grading</h3>
                  <p className="text-sm text-muted-foreground">Get precise quality scores and handling recommendations</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-success/20 rounded-lg">
                  <Waves className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold">Real-Time Market Value</h3>
                  <p className="text-sm text-muted-foreground">Instant pricing estimates based on quality and market data</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Forms */}
        <Card className="w-full shadow-ocean animate-fade-in">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader>
              <div className="lg:hidden flex items-center gap-2 mb-4">
                <Fish className="w-6 h-6 text-primary" />
                <span className="font-bold text-xl text-primary">AquaGrade AI</span>
              </div>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>Enter your credentials to access your dashboard</CardDescription>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      name="email"
                      type="email" 
                      placeholder="fisher@example.com" 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password"
                      name="password"
                      type="password" 
                      placeholder="••••••••" 
                      required 
                    />
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="link" 
                    className="px-0 text-sm"
                  >
                    Forgot password?
                  </Button>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    variant="ocean" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup}>
                <CardContent className="space-y-4">
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>Join AquaGrade AI to start analyzing your catch</CardDescription>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName"
                        name="firstName"
                        placeholder="John" 
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName"
                        name="lastName"
                        placeholder="Doe" 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vesselName">Vessel Name (Optional)</Label>
                    <Input 
                      id="vesselName"
                      name="vesselName"
                      placeholder="The Sea Runner" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">Email</Label>
                    <Input 
                      id="signupEmail"
                      name="email"
                      type="email" 
                      placeholder="fisher@example.com" 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">Password</Label>
                    <Input 
                      id="signupPassword"
                      name="password"
                      type="password" 
                      placeholder="••••••••" 
                      required
                      minLength={6}
                    />
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    variant="ocean" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
