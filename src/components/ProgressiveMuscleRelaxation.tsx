import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Play, Pause, RotateCcw, SkipForward } from "lucide-react";

interface ProgressiveMuscleRelaxationProps {
  onBack: () => void;
}

const muscleGroups = [
  {
    name: "Forehead and Scalp",
    instruction: "Raise your eyebrows as high as possible and wrinkle your forehead. Hold the tension...",
    relaxInstruction: "Now let your forehead smooth out completely. Feel the tension melting away...",
    duration: 7000,
    relaxDuration: 20000
  },
  {
    name: "Eyes and Cheeks",
    instruction: "Close your eyes tightly and scrunch up your cheeks. Feel the tension around your eyes...",
    relaxInstruction: "Gently open your eyes and let your face relax completely. Notice the difference...",
    duration: 7000,
    relaxDuration: 20000
  },
  {
    name: "Jaw and Neck",
    instruction: "Clench your jaw and press your tongue against the roof of your mouth. Tense your neck...",
    relaxInstruction: "Let your jaw drop slightly and your tongue rest comfortably. Feel your neck becoming loose...",
    duration: 7000,
    relaxDuration: 20000
  },
  {
    name: "Shoulders and Arms",
    instruction: "Lift your shoulders up to your ears and make fists with your hands. Feel the tension...",
    relaxInstruction: "Let your shoulders drop and arms hang loosely. Feel the weight leaving your shoulders...",
    duration: 7000,
    relaxDuration: 20000
  },
  {
    name: "Hands and Fingers",
    instruction: "Make tight fists and squeeze them as hard as you can. Feel the tension in your fingers...",
    relaxInstruction: "Open your hands and let your fingers spread naturally. Feel the warmth flowing in...",
    duration: 7000,
    relaxDuration: 20000
  },
  {
    name: "Chest and Upper Back",
    instruction: "Take a deep breath and hold it while pulling your shoulder blades together...",
    relaxInstruction: "Breathe normally and let your chest and back relax completely. Feel the tension releasing...",
    duration: 7000,
    relaxDuration: 20000
  },
  {
    name: "Abdomen",
    instruction: "Tighten your abdominal muscles as if someone is about to punch your stomach...",
    relaxInstruction: "Let your stomach muscles go completely loose. Breathe naturally and easily...",
    duration: 7000,
    relaxDuration: 20000
  },
  {
    name: "Lower Back and Hips",
    instruction: "Arch your back slightly and tense your lower back and hip muscles...",
    relaxInstruction: "Let your back settle and your hips relax completely. Feel supported and comfortable...",
    duration: 7000,
    relaxDuration: 20000
  },
  {
    name: "Thighs and Glutes",
    instruction: "Tense your thigh muscles and squeeze your glutes as tightly as possible...",
    relaxInstruction: "Let your thighs and glutes relax completely. Feel them sinking into your seat...",
    duration: 7000,
    relaxDuration: 20000
  },
  {
    name: "Calves and Feet",
    instruction: "Point your toes downward and tense your calf muscles. Feel the stretch...",
    relaxInstruction: "Let your feet and calves relax completely. Feel the tension flowing out through your toes...",
    duration: 7000,
    relaxDuration: 20000
  }
];

export const ProgressiveMuscleRelaxation = ({ onBack }: ProgressiveMuscleRelaxationProps) => {
  const [isActive, setIsActive] = useState(false);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [isRelaxPhase, setIsRelaxPhase] = useState(false);
  const [timeLeft, setTimeLeft] = useState(muscleGroups[0].duration);
  const [completedGroups, setCompletedGroups] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const phaseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && !isCompleted) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 100) {
            return isRelaxPhase ? muscleGroups[currentGroupIndex].relaxDuration : muscleGroups[currentGroupIndex].duration;
          }
          return prev - 100;
        });
      }, 100);

      const currentDuration = isRelaxPhase ? muscleGroups[currentGroupIndex].relaxDuration : muscleGroups[currentGroupIndex].duration;
      
      phaseTimeoutRef.current = setTimeout(() => {
        if (isRelaxPhase) {
          // Moving to next muscle group
          if (currentGroupIndex < muscleGroups.length - 1) {
            setCurrentGroupIndex(prev => prev + 1);
            setIsRelaxPhase(false);
            setTimeLeft(muscleGroups[currentGroupIndex + 1].duration);
            setCompletedGroups(prev => prev + 1);
          } else {
            // Exercise completed
            setIsActive(false);
            setIsCompleted(true);
            setCompletedGroups(muscleGroups.length);
          }
        } else {
          // Moving to relax phase
          setIsRelaxPhase(true);
          setTimeLeft(muscleGroups[currentGroupIndex].relaxDuration);
        }
      }, currentDuration);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
    };
  }, [isActive, currentGroupIndex, isRelaxPhase, isCompleted]);

  const toggleExercise = () => {
    if (isCompleted) {
      resetExercise();
    } else {
      setIsActive(!isActive);
    }
  };

  const resetExercise = () => {
    setIsActive(false);
    setCurrentGroupIndex(0);
    setIsRelaxPhase(false);
    setTimeLeft(muscleGroups[0].duration);
    setCompletedGroups(0);
    setIsCompleted(false);
  };

  const skipToNext = () => {
    if (currentGroupIndex < muscleGroups.length - 1) {
      setCurrentGroupIndex(prev => prev + 1);
      setIsRelaxPhase(false);
      setTimeLeft(muscleGroups[currentGroupIndex + 1].duration);
      setCompletedGroups(prev => prev + 1);
    }
  };

  const formatTime = (milliseconds: number) => {
    return Math.ceil(milliseconds / 1000);
  };

  const progress = ((completedGroups + (isRelaxPhase ? 0.5 : 0)) / muscleGroups.length) * 100;
  const currentGroup = muscleGroups[currentGroupIndex];

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <Card className="shadow-card">
          <CardHeader className="text-center">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="text-sm text-muted-foreground">
                Progress: {completedGroups}/{muscleGroups.length} groups
              </div>
            </div>
            <CardTitle className="text-3xl mb-2">Progressive Muscle Relaxation</CardTitle>
            <p className="text-muted-foreground">
              Systematically tense and relax each muscle group to release physical tension
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Overall Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Current Exercise */}
            {!isCompleted && (
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div 
                      className={`w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-2xl transition-all duration-1000 ${
                        isRelaxPhase 
                          ? 'bg-gradient-to-br from-healing-green to-soft-mint scale-110' 
                          : 'bg-gradient-to-br from-calm-blue to-peaceful-lavender scale-95'
                      }`}
                      style={{
                        boxShadow: isRelaxPhase 
                          ? '0 0 30px hsl(var(--healing-green) / 0.5)' 
                          : '0 0 30px hsl(var(--calm-blue) / 0.5)'
                      }}
                    >
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold text-primary">
                      {currentGroup.name}
                    </h3>
                    <div className={`text-lg p-4 rounded-lg ${
                      isRelaxPhase 
                        ? 'bg-healing-green/10 border border-healing-green/20' 
                        : 'bg-calm-blue/10 border border-calm-blue/20'
                    }`}>
                      <p className="font-medium mb-2">
                        {isRelaxPhase ? 'RELAX' : 'TENSE'}
                      </p>
                      <p className="leading-relaxed">
                        {isRelaxPhase ? currentGroup.relaxInstruction : currentGroup.instruction}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Visual Indicator */}
                <div className="flex justify-center">
                  <div className={`w-4 h-4 rounded-full transition-all duration-500 ${
                    isRelaxPhase ? 'bg-healing-green animate-pulse' : 'bg-calm-blue'
                  }`} />
                </div>
              </div>
            )}

            {/* Completion Message */}
            {isCompleted && (
              <div className="text-center p-8 bg-gradient-primary rounded-lg text-white">
                <h3 className="text-2xl font-bold mb-4">Excellent Work! 🎉</h3>
                <p className="text-lg mb-4">
                  You've completed a full Progressive Muscle Relaxation session.
                </p>
                <p className="opacity-90">
                  Take a moment to notice how your body feels now compared to when you started.
                </p>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <Button 
                onClick={toggleExercise}
                size="lg"
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                {isCompleted ? (
                  <>
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Start New Session
                  </>
                ) : isActive ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    {currentGroupIndex === 0 && !isRelaxPhase ? 'Begin PMR' : 'Resume'}
                  </>
                )}
              </Button>
              
              {isActive && !isCompleted && (
                <Button 
                  onClick={skipToNext}
                  variant="outline"
                  size="lg"
                  disabled={currentGroupIndex >= muscleGroups.length - 1}
                >
                  <SkipForward className="w-5 h-5 mr-2" />
                  Skip Group
                </Button>
              )}
              
              {(isActive || isCompleted || currentGroupIndex > 0) && (
                <Button 
                  onClick={resetExercise}
                  variant="outline"
                  size="lg"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              )}
            </div>

            {/* Instructions */}
            {!isActive && !isCompleted && currentGroupIndex === 0 && (
              <div className="text-center p-6 bg-gradient-secondary rounded-lg">
                <h4 className="font-semibold text-accent-foreground mb-2">Before You Begin</h4>
                <div className="text-accent-foreground/80 text-sm space-y-2">
                  <p>• Find a comfortable position in a quiet space</p>
                  <p>• Tense each muscle group for 5-7 seconds</p>
                  <p>• Then relax for 20-30 seconds, noticing the difference</p>
                  <p>• Focus on the contrast between tension and relaxation</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};