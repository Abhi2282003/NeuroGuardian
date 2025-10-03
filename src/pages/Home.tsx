import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Activity, Heart, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  const features = [
    {
      icon: Brain,
      title: "EEG Monitoring",
      description: "Real-time brainwave analysis with BioAmp devices",
      path: "/auth",
      gradient: "from-primary to-primary/60"
    },
    {
      icon: Heart,
      title: "Mindfulness Practices",
      description: "Guided meditation, breathing exercises, and relaxation",
      path: "/wellness",
      gradient: "from-accent to-accent/60"
    },
    {
      icon: Activity,
      title: "Neurological Screening",
      description: "Early detection assessments for cognitive health",
      path: "/auth",
      gradient: "from-secondary to-secondary/60"
    },
    {
      icon: Sparkles,
      title: "Personalized Insights",
      description: "Track your progress and optimize your wellness",
      path: "/auth",
      gradient: "from-primary to-accent"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-card/50 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">NeuroScreen</span>
          </div>
          <Link to="/auth">
            <Button size="lg" className="shadow-lg">Sign In</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center space-y-12">
            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 backdrop-blur-xl shadow-elegant animate-fade-in">
              <div className="relative">
                <Brain className="h-7 w-7 text-primary animate-pulse" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Next-Gen Neuro-Wellness Platform
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight">
              <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in" style={{ animationDelay: '0.1s' }}>
                Monitor Your Mind,
              </span>
              <span className="block mt-2 text-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Master Your Wellness
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
              Harness the power of AI-driven neurological screening, real-time EEG monitoring with BioAmp devices, 
              and scientifically-proven mindfulness practices to optimize your brain health and overall wellbeing
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Link to="/auth">
                <Button size="lg" className="text-lg px-10 py-7 shadow-elegant hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  <Brain className="mr-3 h-6 w-6" />
                  Get Started
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
              <Link to="/wellness">
                <Button size="lg" variant="outline" className="text-lg px-10 py-7 shadow-card hover:shadow-elegant hover:scale-105 transition-all duration-300">
                  <Heart className="mr-3 h-6 w-6" />
                  Try Wellness Tools
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-24 sm:px-8 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Powerful Features for Your Brain Health
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to monitor, understand, and improve your neurological wellness
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link key={index} to={feature.path}>
                <Card className="h-full shadow-card hover:shadow-elegant transition-all duration-500 hover:-translate-y-2 cursor-pointer group border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  <CardHeader className="relative">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                      <Icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl mb-3 group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="flex items-center text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                      Explore feature
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-32 bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12 sm:px-8 lg:px-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">NeuroScreen</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              ⚠️ <strong>Important:</strong> This is a preliminary screening tool, not a medical diagnosis. 
              Always consult with qualified healthcare professionals for medical advice.
            </p>
            <p className="text-xs text-muted-foreground/70">
              Platform inspired by Chords-Web • Compatible with Upside Down Labs BioAmp/Chords devices
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
