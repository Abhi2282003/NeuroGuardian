import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";

interface BreathingExerciseProps {
  onBack: () => void;
}

type Phase = 'inhale' | 'hold' | 'exhale' | 'pause';

const phaseConfig = {
  inhale: { duration: 4000, label: 'Breathe In', instruction: 'Inhale slowly through your nose' },
  hold: { duration: 2000, label: 'Hold', instruction: 'Hold your breath gently' },
  exhale: { duration: 6000, label: 'Breathe Out', instruction: 'Exhale slowly through your mouth' },
  pause: { duration: 1000, label: 'Pause', instruction: 'Brief pause before next breath' }
};

export const BreathingExercise = ({ onBack }: BreathingExerciseProps) => {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<Phase>('inhale');
  const [timeLeft, setTimeLeft] = useState(phaseConfig.inhale.duration);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [circleScale, setCircleScale] = useState(1);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const phaseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const phases: Phase[] = ['inhale', 'hold', 'exhale', 'pause'];

  useEffect(() => {
    if (isActive) {
      // Timer for countdown
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 100) {
            return phaseConfig[currentPhase].duration;
          }
          return prev - 100;
        });
      }, 100);

      // Phase transition
      phaseTimeoutRef.current = setTimeout(() => {
        const currentIndex = phases.indexOf(currentPhase);
        const nextIndex = (currentIndex + 1) % phases.length;
        const nextPhase = phases[nextIndex];
        
        setCurrentPhase(nextPhase);
        setTimeLeft(phaseConfig[nextPhase].duration);
        
        if (nextPhase === 'inhale') {
          setCompletedCycles(prev => prev + 1);
        }
      }, phaseConfig[currentPhase].duration);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
    };
  }, [isActive, currentPhase]);

  // Animate circle based on phase
  useEffect(() => {
    switch (currentPhase) {
      case 'inhale':
        setCircleScale(1.5);
        break;
      case 'hold':
        setCircleScale(1.5);
        break;
      case 'exhale':
        setCircleScale(1);
        break;
      case 'pause':
        setCircleScale(1);
        break;
    }
  }, [currentPhase]);

  const toggleExercise = () => {
    setIsActive(!isActive);
  };

  const resetExercise = () => {
    setIsActive(false);
    setCurrentPhase('inhale');
    setTimeLeft(phaseConfig.inhale.duration);
    setCompletedCycles(0);
    setCircleScale(1);
  };

  const formatTime = (milliseconds: number) => {
    return Math.ceil(milliseconds / 1000);
  };

  const getPhaseColor = (phase: Phase) => {
    switch (phase) {
      case 'inhale': return 'text-calm-blue';
      case 'hold': return 'text-peaceful-lavender';
      case 'exhale': return 'text-healing-green';
      case 'pause': return 'text-soft-mint';
      default: return 'text-primary';
    }
  };

  const getCircleColor = (phase: Phase) => {
    switch (phase) {
      case 'inhale': return 'bg-calm-blue/20 border-calm-blue';
      case 'hold': return 'bg-peaceful-lavender/20 border-peaceful-lavender';
      case 'exhale': return 'bg-healing-green/20 border-healing-green';
      case 'pause': return 'bg-soft-mint/20 border-soft-mint';
      default: return 'bg-primary/20 border-primary';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-card">
          <CardHeader className="text-center">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="text-sm text-muted-foreground">
                Cycles completed: {completedCycles}
              </div>
            </div>
            <CardTitle className="text-3xl mb-2">Deep Breathing Exercise</CardTitle>
            <p className="text-muted-foreground">
              Follow the visual guide and breathe at your own peaceful pace
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Breathing Circle */}
            <div className="flex justify-center">
              <div 
                className={`w-64 h-64 rounded-full border-4 ${getCircleColor(currentPhase)} flex items-center justify-center transition-all duration-1000 ease-in-out`}
                style={{ 
                  transform: `scale(${circleScale})`,
                  boxShadow: `0 0 40px ${currentPhase === 'inhale' ? 'hsl(var(--calm-blue) / 0.3)' : 
                                      currentPhase === 'exhale' ? 'hsl(var(--healing-green) / 0.3)' : 
                                      'hsl(var(--peaceful-lavender) / 0.3)'}`
                }}
              >
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getPhaseColor(currentPhase)} mb-2`}>
                    {formatTime(timeLeft)}
                  </div>
                  <div className={`text-lg font-medium ${getPhaseColor(currentPhase)}`}>
                    {phaseConfig[currentPhase].label}
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-center space-y-4">
              <p className="text-xl font-medium text-foreground">
                {phaseConfig[currentPhase].instruction}
              </p>
              <p className="text-muted-foreground">
                {isActive ? 'Follow the expanding and contracting circle' : 'Press play to begin your breathing exercise'}
              </p>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <Button 
                onClick={toggleExercise}
                size="lg"
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                {isActive ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start
                  </>
                )}
              </Button>
              
              <Button 
                onClick={resetExercise}
                variant="outline"
                size="lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </Button>
            </div>

            {/* Progress */}
            {completedCycles > 0 && (
              <div className="text-center p-4 bg-gradient-secondary rounded-lg">
                <p className="text-accent-foreground">
                  Great progress! You've completed <span className="font-bold">{completedCycles}</span> breathing cycles.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};