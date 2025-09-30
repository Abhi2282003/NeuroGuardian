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
      color: "text-cyan-400"
    },
    {
      icon: Heart,
      title: "Mindfulness Practices",
      description: "Guided meditation, breathing exercises, and relaxation",
      path: "/wellness",
      color: "text-primary"
    },
    {
      icon: Activity,
      title: "Neurological Screening",
      description: "Early detection assessments for cognitive health",
      path: "/auth",
      color: "text-cyan-400"
    },
    {
      icon: Sparkles,
      title: "Personalized Insights",
      description: "Track your progress and optimize your wellness",
      path: "/auth",
      color: "text-primary"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">NeuroScreen</span>
          </div>
          <Link to="/auth">
            <Button variant="outline">Sign In</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-card/50 border border-primary/20 backdrop-blur-sm">
              <Brain className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Neuro-Wellness Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold">
              <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
                Monitor Your Mind,
              </span>
              <br />
              <span className="text-foreground">Master Your Wellness</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              AI-powered neurological screening, real-time EEG monitoring, and evidence-based mindfulness practices
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8">
                  <Brain className="mr-2 h-5 w-5" />
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/wellness">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  <Heart className="mr-2 h-5 w-5" />
                  Try Wellness Tools
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link key={index} to={feature.path}>
                <Card className="h-full shadow-card hover:shadow-gentle transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardHeader>
                    <Icon className={`h-12 w-12 ${feature.color} mb-4 group-hover:scale-110 transition-transform`} />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-primary group-hover:gap-2 transition-all">
                      Learn more
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground text-center">
            ⚠️ This is a preliminary screening tool, not a diagnosis. Seek professional medical advice.
            <br />
            <span className="text-xs">Platform inspired by Chords-Web. Works with Upside Down Labs BioAmp/Chords devices.</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
