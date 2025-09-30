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
      path: "/bioamp",
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
      title: "Stress Analysis",
      description: "AI-powered stress level predictions from EEG signals",
      path: "/bioamp",
      color: "text-cyan-400"
    },
    {
      icon: Sparkles,
      title: "Personalized Insights",
      description: "Track your progress and optimize your mental wellness",
      path: "/wellness",
      color: "text-primary"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-background">
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
              <span className="text-foreground">
                Master Your Wellness
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Combine cutting-edge EEG technology with proven mindfulness techniques 
              to understand and improve your mental state
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/bioamp">
                <Button size="lg" className="text-lg px-8">
                  <Activity className="mr-2 h-5 w-5" />
                  Start EEG Monitoring
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/wellness">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  <Heart className="mr-2 h-5 w-5" />
                  Explore Wellness
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

      {/* About Section */}
      <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-3xl text-center">About Neuro-Sentinel</CardTitle>
            <CardDescription className="text-center text-lg">
              Your personal mental wellness companion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground text-center max-w-3xl mx-auto">
              Neuro-Sentinel combines advanced biosignal processing with evidence-based wellness practices. 
              Monitor your brainwaves in real-time using BioAmp/Chords devices, while accessing a comprehensive 
              suite of mindfulness tools including meditation, breathing exercises, progressive muscle relaxation, 
              and guided imagery.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 pt-8">
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-primary">500Hz</div>
                <div className="text-sm text-muted-foreground">Sample Rate</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-primary">6 Ch</div>
                <div className="text-sm text-muted-foreground">EEG Channels</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-primary">Real-time</div>
                <div className="text-sm text-muted-foreground">Analysis</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            This platform is inspired by Chords-Web and designed to work with Upside Down Labs BioAmp/Chords devices.
            <br />
            Firmware © 2024–2025 Upside Down Labs (GPLv3). This web app is client-side only and intended for demo/education.
          </p>
        </div>
      </footer>
    </div>
  );
}
