import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Waves, Heart, Sparkles, Clock, Play, Pause, BarChart3, ArrowLeft } from "lucide-react";
import { BreathingExercise } from "@/components/BreathingExercise";
import { MeditationTimer } from "@/components/MeditationTimer";
import { TechniqueDetail } from "@/components/TechniqueDetail";
import { ProgressiveMuscleRelaxation } from "@/components/ProgressiveMuscleRelaxation";
import { GuidedImagery } from "@/components/GuidedImagery";

const techniques = [
  {
    id: "breathing",
    title: "Deep Breathing",
    description: "Slow, deep breaths from the belly to calm your nervous system",
    category: "Relaxation",
    icon: Waves,
    color: "calm-blue",
    interactive: true,
    details: {
      what: "Slow, deep breaths from the belly rather than shallow chest breathing.",
      how: "Inhale through the nose for 4–5 seconds → hold 2 seconds → exhale slowly through the mouth for 6–7 seconds.",
      benefits: "Lowers heart rate and blood pressure, reduces anxiety and panic symptoms, improves oxygenation, creates immediate calming effect."
    }
  },
  {
    id: "imagery",
    title: "Guided Imagery",
    description: "Mentally imagine peaceful, safe places to reduce stress",
    category: "Relaxation",
    icon: Brain,
    color: "peaceful-lavender",
    interactive: true,
    details: {
      what: "Mentally imagining a peaceful, safe place or pleasant scenario.",
      how: "Close eyes and vividly imagine sights, sounds, smells, and feelings of that scene (beach, forest, etc.).",
      benefits: "Distracts from stress, reduces muscle tension, and creates positive emotional states."
    }
  },
  {
    id: "pmr",
    title: "Progressive Muscle Relaxation",
    description: "Systematically tense and relax muscle groups",
    category: "Muscle Relaxation",
    icon: Heart,
    color: "healing-green",
    interactive: true,
    details: {
      what: "Systematically tensing and relaxing muscle groups from head to toe.",
      how: "Tighten each muscle group for ~5–7 seconds, then relax for 20–30 seconds, noticing the difference.",
      benefits: "Lowers physical tension, decreases sympathetic nervous activity, and helps identify where you hold stress in your body."
    }
  },
  {
    id: "stretching",
    title: "Stretching & Gentle Yoga",
    description: "Slow stretching and beginner yoga poses",
    category: "Muscle Relaxation",
    icon: Heart,
    color: "healing-green",
    details: {
      what: "Slow stretching or beginner yoga poses.",
      how: "10–20 min daily session, focusing on breath + movement.",
      benefits: "Releases muscle tension, improves blood flow, boosts serotonin, and promotes relaxation."
    }
  },
  {
    id: "mindfulness",
    title: "Mindfulness Meditation",
    description: "Nonjudgmental awareness of the present moment",
    category: "Meditation",
    icon: Sparkles,
    color: "soft-mint",
    interactive: true,
    details: {
      what: "Nonjudgmental awareness of the present moment (thoughts, feelings, body sensations).",
      how: "Sit quietly, observe breathing or bodily sensations, gently return attention when it wanders.",
      benefits: "Reduces rumination, stress, anxiety, and depression; increases grey matter in emotion-regulation areas of the brain."
    }
  },
  {
    id: "loving-kindness",
    title: "Loving-Kindness Meditation",
    description: "Silently repeating phrases of goodwill toward yourself and others",
    category: "Meditation",
    icon: Sparkles,
    color: "soft-mint",
    details: {
      what: "Silently repeating phrases of goodwill toward yourself and others.",
      how: "Start with yourself, then extend to loved ones, neutral people, difficult people, and all beings.",
      benefits: "Builds positive emotions, social connection, and self-compassion."
    }
  },
  {
    id: "cbt",
    title: "Cognitive Behavioral Therapy",
    description: "Recognize and change negative thought patterns",
    category: "Psychotherapy",
    icon: Brain,
    color: "peaceful-lavender",
    details: {
      what: "Teaches you to recognize and change negative thought patterns and behaviors.",
      how: "Work with a therapist to identify thought distortions and practice new coping strategies.",
      benefits: "Reduces anxiety, depression, and stress by breaking the cycle of negative thinking."
    }
  },
  {
    id: "mbct",
    title: "Mindfulness-Based Cognitive Therapy",
    description: "Combines mindfulness meditation with CBT principles",
    category: "Psychotherapy",
    icon: Brain,
    color: "peaceful-lavender",
    details: {
      what: "Combines mindfulness meditation with CBT principles.",
      how: "Practice mindfulness techniques while learning to observe thoughts without judgment.",
      benefits: "Improves emotional regulation, reduces relapse in depression, and builds present-moment awareness."
    }
  },
  {
    id: "dbt",
    title: "Dialectical Behavior Therapy",
    description: "Focus on emotional regulation and distress tolerance",
    category: "Psychotherapy",
    icon: Brain,
    color: "peaceful-lavender",
    details: {
      what: "CBT-based therapy focusing on emotional regulation, distress tolerance, and interpersonal skills.",
      how: "Learn specific skills for managing intense emotions and interpersonal relationships.",
      benefits: "Especially helpful for intense emotions and self-harm urges."
    }
  }
];

const Index = () => {
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'home' | 'breathing' | 'meditation' | 'detail' | 'pmr' | 'imagery'>('home');

  const handleTechniqueClick = (technique: any) => {
    if (technique.id === 'breathing') {
      setActiveView('breathing');
    } else if (technique.id === 'mindfulness') {
      setActiveView('meditation');
    } else if (technique.id === 'pmr') {
      setActiveView('pmr');
    } else if (technique.id === 'imagery') {
      setActiveView('imagery');
    } else {
      setSelectedTechnique(technique.id);
      setActiveView('detail');
    }
  };

  const resetToHome = () => {
    setActiveView('home');
    setSelectedTechnique(null);
  };

  if (activeView === 'breathing') {
    return <BreathingExercise onBack={resetToHome} />;
  }

  if (activeView === 'meditation') {
    return <MeditationTimer onBack={resetToHome} />;
  }

  if (activeView === 'pmr') {
    return <ProgressiveMuscleRelaxation onBack={resetToHome} />;
  }

  if (activeView === 'imagery') {
    return <GuidedImagery onBack={resetToHome} />;
  }

  if (activeView === 'detail' && selectedTechnique) {
    const technique = techniques.find(t => t.id === selectedTechnique);
    return <TechniqueDetail technique={technique} onBack={resetToHome} />;
  }

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Mindful Wellness
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Evidence-based relaxation and mental health techniques to help you find peace and reduce stress
          </p>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {['Relaxation', 'Muscle Relaxation', 'Meditation', 'Psychotherapy'].map((category) => (
            <Card key={category} className="text-center shadow-gentle hover:shadow-card transition-all duration-300">
              <CardContent className="pt-6">
                <div className="text-2xl mb-2">
                  {category === 'Relaxation' && '🧘'}
                  {category === 'Muscle Relaxation' && '💪'}
                  {category === 'Meditation' && '🧠'}
                  {category === 'Psychotherapy' && '🧩'}
                </div>
                <h3 className="font-semibold text-card-foreground">{category}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Techniques Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {techniques.map((technique) => {
            const IconComponent = technique.icon;
            return (
              <Card 
                key={technique.id}
                className="cursor-pointer shadow-gentle hover:shadow-card transition-all duration-300 group"
                onClick={() => handleTechniqueClick(technique)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-3 rounded-lg bg-${technique.color}/10`}>
                      <IconComponent className={`w-6 h-6 text-${technique.color}`} />
                    </div>
                    {technique.interactive && (
                      <Badge variant="secondary" className="bg-gradient-secondary text-accent-foreground">
                        Interactive
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {technique.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {technique.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {technique.category}
                    </Badge>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {technique.interactive ? (
                        <>
                          <Play className="w-4 h-4 mr-1" />
                          Start
                        </>
                      ) : (
                        'Learn More'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-secondary p-8 shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl text-accent-foreground">
                How These Techniques Help
              </CardTitle>
              <CardDescription className="text-accent-foreground/80 text-base">
                Scientific benefits for mental health recovery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                <div>
                  <h4 className="font-semibold text-accent-foreground mb-2">Reduce Stress Response</h4>
                  <p className="text-accent-foreground/80 text-sm">Lower heart rate, blood pressure, cortisol, and adrenaline</p>
                </div>
                <div>
                  <h4 className="font-semibold text-accent-foreground mb-2">Improve Emotional Regulation</h4>
                  <p className="text-accent-foreground/80 text-sm">Strengthen prefrontal cortex activity, weaken overactive amygdala responses</p>
                </div>
                <div>
                  <h4 className="font-semibold text-accent-foreground mb-2">Break Negative Cycles</h4>
                  <p className="text-accent-foreground/80 text-sm">Change thinking-behavior patterns that maintain depression/anxiety</p>
                </div>
                <div>
                  <h4 className="font-semibold text-accent-foreground mb-2">Increase Sense of Control</h4>
                  <p className="text-accent-foreground/80 text-sm">Gives active coping tools, fostering resilience and hope</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;