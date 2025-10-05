import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Activity, Heart, Sparkles, ArrowRight, Shield, Zap, Users, CheckCircle, AlertCircle, Stethoscope, ClipboardList, Waves, Timer, Target } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  const mainFeatures = [
    {
      icon: Brain,
      title: "EEG Monitoring",
      description: "Real-time brainwave analysis using BioAmp EEG devices for continuous neural activity tracking",
      path: "/bioamp",
      gradient: "from-primary to-primary/60",
      benefits: ["Real-time visualization", "Multiple channel support", "Export capabilities"]
    },
    {
      icon: ClipboardList,
      title: "Neurological Screening",
      description: "Comprehensive cognitive assessments including memory tests, attention evaluation, and motor function analysis",
      path: "/screening",
      gradient: "from-secondary to-secondary/60",
      benefits: ["PHQ-9 Depression", "GAD-7 Anxiety", "Cognitive Tests"]
    },
    {
      icon: Heart,
      title: "Mindfulness & Wellness",
      description: "Science-backed relaxation techniques including guided meditation, breathing exercises, and progressive muscle relaxation",
      path: "/wellness",
      gradient: "from-accent to-accent/60",
      benefits: ["Guided Meditation", "Breathing Exercises", "Yoga Stretching"]
    },
    {
      icon: Sparkles,
      title: "Personalized Insights",
      description: "Track your mental health progress over time with detailed analytics and personalized recommendations",
      path: "/dashboard",
      gradient: "from-primary to-accent",
      benefits: ["Progress tracking", "Historical data", "AI-powered insights"]
    }
  ];

  const screeningTools = [
    { name: "PHQ-9", description: "Depression screening questionnaire", icon: ClipboardList },
    { name: "GAD-7", description: "Anxiety assessment scale", icon: ClipboardList },
    { name: "PSS", description: "Perceived stress evaluation", icon: ClipboardList },
    { name: "AUDIT", description: "Alcohol use disorders identification", icon: ClipboardList },
    { name: "Memory Test", description: "Cognitive memory assessment", icon: Brain },
    { name: "Stroop Test", description: "Cognitive interference evaluation", icon: Brain },
    { name: "Trail Making", description: "Visual attention and task switching", icon: Brain },
    { name: "Finger Tapping", description: "Motor speed assessment", icon: Activity },
    { name: "Spiral Drawing", description: "Fine motor control evaluation", icon: Activity },
  ];

  const wellnessTools = [
    { name: "Deep Breathing", description: "Calming breath work exercises", icon: Waves },
    { name: "Guided Imagery", description: "Visualization relaxation technique", icon: Sparkles },
    { name: "Progressive Muscle Relaxation", description: "Systematic muscle tension release", icon: Activity },
    { name: "Meditation Timer", description: "Customizable mindfulness sessions", icon: Timer },
    { name: "Yoga Stretching", description: "Gentle movement practices", icon: Target },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Create Your Account",
      description: "Sign up securely and set up your personal wellness profile",
      icon: Users
    },
    {
      step: "02",
      title: "Choose Your Tools",
      description: "Select from EEG monitoring, screening tests, or mindfulness practices",
      icon: Target
    },
    {
      step: "03",
      title: "Track Your Progress",
      description: "Monitor your mental health journey with detailed analytics",
      icon: Activity
    },
    {
      step: "04",
      title: "Consult Healthcare Providers",
      description: "Share results with your doctor for professional medical guidance",
      icon: Stethoscope
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-card/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">NeuroGuardian</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/neuro">
              <Button variant="ghost">Neurological Dashboard</Button>
            </Link>
            <Link to="/wellness">
              <Button variant="ghost">Try Wellness Tools</Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" className="shadow-lg">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
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
                AI-Powered Neurological Wellness Platform
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight">
              <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in" style={{ animationDelay: '0.1s' }}>
                Your Complete
              </span>
              <span className="block mt-2 text-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Brain Health Companion
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
              NeuroGuardian combines real-time EEG monitoring, comprehensive cognitive screening tests, 
              and evidence-based mindfulness practices to help you monitor and improve your neurological wellness
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Link to="/auth">
                <Button size="lg" className="text-lg px-10 py-7 shadow-elegant hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  <Brain className="mr-3 h-6 w-6" />
                  Start Your Journey
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
              <Link to="/wellness">
                <Button size="lg" variant="outline" className="text-lg px-10 py-7 shadow-card hover:shadow-elegant hover:scale-105 transition-all duration-300">
                  <Heart className="mr-3 h-6 w-6" />
                  Explore Wellness Tools
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="max-w-7xl mx-auto px-6 py-24 sm:px-8 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Comprehensive Brain Health Tools
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to monitor, assess, and improve your neurological wellness in one platform
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-8 mb-12">
          {mainFeatures.map((feature, index) => {
            const Icon = feature.icon;
            const iconColor = index === 0 ? "text-primary" : index === 1 ? "text-secondary-foreground" : index === 2 ? "text-accent" : "text-primary";
            return (
              <Link key={index} to={feature.path}>
                <Card className="h-full shadow-card hover:shadow-elegant transition-all duration-500 hover:-translate-y-2 cursor-pointer group border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  <CardHeader className="relative">
                    <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg w-fit">
                      <Icon className={`h-8 w-8 ${iconColor}`} />
                    </div>
                    <CardTitle className="text-2xl mb-3 group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed mb-4">{feature.description}</CardDescription>
                    <div className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
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
      </section>

      {/* Screening Tools */}
      <section className="bg-muted/30 py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Neurological Screening Tests</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Access professional-grade screening tools for early detection and monitoring of cognitive, mental health, and motor function
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {screeningTools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-card transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{tool.name}</CardTitle>
                        <CardDescription className="text-sm mt-1">{tool.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/screening">
              <Button size="lg" variant="outline" className="shadow-card hover:shadow-elegant">
                View All Screening Tests
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Wellness Tools */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Mindfulness & Wellness Practices</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Science-backed relaxation techniques to reduce stress, improve focus, and enhance overall mental wellbeing
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wellnessTools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-card transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Icon className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{tool.name}</CardTitle>
                        <CardDescription className="text-sm mt-1">{tool.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/wellness">
              <Button size="lg" className="shadow-elegant hover:shadow-2xl">
                Try Wellness Tools Now
                <Heart className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">How NeuroGuardian Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to start your brain health journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="relative">
                  <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-card transition-all duration-300">
                    <CardHeader>
                      <div className="text-6xl font-black text-primary/20 mb-4">{item.step}</div>
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg w-fit mb-4">
                        <Icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <CardTitle className="text-xl mb-2">{item.title}</CardTitle>
                      <CardDescription className="text-base">{item.description}</CardDescription>
                    </CardHeader>
                  </Card>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="h-8 w-8 text-primary/30" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Consult Doctor CTA */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
          <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/30 shadow-elegant overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-destructive/10 rounded-full blur-3xl" />
            <CardHeader className="relative text-center pb-8">
              <div className="inline-flex p-4 rounded-2xl bg-destructive/10 border-2 border-destructive/30 mb-6 mx-auto">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-3xl sm:text-4xl font-bold mb-4">Important Medical Disclaimer</CardTitle>
              <CardDescription className="text-lg leading-relaxed max-w-3xl mx-auto text-foreground/80">
                <strong className="text-destructive">NeuroGuardian is a screening and wellness tool, NOT a diagnostic instrument.</strong>
                <br /><br />
                This platform provides preliminary assessments and mindfulness practices to support your mental health journey. 
                However, it does not replace professional medical evaluation, diagnosis, or treatment.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-6">
              <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <Stethoscope className="h-6 w-6 text-primary" />
                  When to Consult a Healthcare Professional
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>If screening results indicate potential concerns or elevated risk levels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Before making any changes to existing medical treatments or medications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>If you experience persistent symptoms affecting daily life</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>For professional interpretation of EEG data and screening test results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>If you have thoughts of self-harm or harming others - seek immediate help</span>
                  </li>
                </ul>
              </div>
              
              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground mb-6">
                  Always share your NeuroGuardian results with qualified healthcare providers for comprehensive evaluation
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="destructive" className="shadow-elegant" asChild>
                    <a href="https://www.nami.org/help" target="_blank" rel="noopener noreferrer">
                      <Shield className="mr-2 h-5 w-5" />
                      Find Mental Health Support
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" className="shadow-card" asChild>
                    <a href="tel:988">
                      <Stethoscope className="mr-2 h-5 w-5" />
                      Crisis Helpline: 988
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12 bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12 sm:px-8 lg:px-12">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
                  <Brain className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">NeuroGuardian</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your comprehensive platform for neurological wellness, combining EEG monitoring, cognitive screening, and mindfulness practices.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Platform Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/bioamp" className="hover:text-primary transition-colors">EEG Monitoring</Link></li>
                <li><Link to="/screening" className="hover:text-primary transition-colors">Screening Tests</Link></li>
                <li><Link to="/wellness" className="hover:text-primary transition-colors">Wellness Tools</Link></li>
                <li><Link to="/dashboard" className="hover:text-primary transition-colors">Progress Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Important Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://www.nami.org/help" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Mental Health Support</a></li>
                <li><a href="tel:988" className="hover:text-primary transition-colors">Crisis Helpline: 988</a></li>
                <li><a href="https://www.samhsa.gov/find-help/national-helpline" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">SAMHSA Helpline</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/30 pt-8 space-y-4">
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              <strong className="text-destructive">⚠️ Medical Disclaimer:</strong> NeuroGuardian is a preliminary screening and wellness tool. 
              It is NOT a substitute for professional medical diagnosis, treatment, or advice. 
              Always consult qualified healthcare providers for medical concerns.
            </p>
            <p className="text-xs text-muted-foreground/70 text-center">
              Platform architecture inspired by Chords-Web • Compatible with Upside Down Labs BioAmp/Chords devices
              <br />
              © 2025 NeuroGuardian. For educational and informational purposes only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
