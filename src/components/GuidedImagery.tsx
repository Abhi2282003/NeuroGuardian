import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { translations, Language } from "@/lib/translations";
import { playTextToSpeech, stopCurrentAudio } from "@/lib/audio";
import { LanguageSelector } from "./LanguageSelector";

interface GuidedImageryProps {
  onBack: () => void;
}

const imageryScenarios = [
  {
    id: 'beach',
    title: 'Peaceful Beach',
    description: 'Warm sand and gentle ocean waves',
    duration: 600000, // 10 minutes
    script: [
      { text: "Close your eyes and take three deep breaths... Feel yourself beginning to relax...", duration: 10000 },
      { text: "Imagine you're walking on a beautiful, secluded beach. The sand is warm and soft beneath your feet...", duration: 15000 },
      { text: "You can hear the gentle sound of waves rolling onto the shore... The rhythm is peaceful and constant...", duration: 15000 },
      { text: "Feel the warm sun on your skin... A gentle ocean breeze touches your face, carrying the fresh scent of salt water...", duration: 15000 },
      { text: "You find the perfect spot and sit down on the warm sand... Your body sinks slightly, perfectly supported...", duration: 15000 },
      { text: "Watch the waves... Each one brings a sense of calm... As they retreat, any tension flows away with them...", duration: 20000 },
      { text: "You notice seagulls in the distance, their calls mixing with the sound of the waves... Everything is peaceful...", duration: 15000 },
      { text: "The horizon stretches endlessly before you... This vastness brings perspective to any worries...", duration: 15000 },
      { text: "Feel completely safe and at peace in this beautiful place... This is your sanctuary...", duration: 20000 },
      { text: "Continue to breathe deeply... Let this feeling of peace fill your entire being...", duration: 10000 },
      { text: "Know that you can return to this peaceful beach anytime you need to feel calm and centered...", duration: 15000 },
      { text: "When you're ready, take three deep breaths and slowly open your eyes, bringing this peace with you...", duration: 10000 }
    ]
  },
  {
    id: 'forest',
    title: 'Serene Forest Path',
    description: 'Dappled sunlight through ancient trees',
    duration: 600000,
    script: [
      { text: "Close your eyes and breathe deeply... Allow your body to relax completely...", duration: 10000 },
      { text: "You're standing at the entrance to a beautiful forest path... The trees are tall and majestic...", duration: 15000 },
      { text: "Sunlight filters through the leaves, creating patterns of light and shadow on the path ahead...", duration: 15000 },
      { text: "You begin walking slowly down the path... The ground is soft with fallen leaves that cushion each step...", duration: 15000 },
      { text: "The air is fresh and clean... You can smell the rich earth and the sweet scent of pine...", duration: 15000 },
      { text: "Birds are singing softly in the trees above... Their songs create a natural symphony of peace...", duration: 20000 },
      { text: "You come to a small clearing where wildflowers grow... Butterflies float gently from flower to flower...", duration: 15000 },
      { text: "Find a comfortable spot to rest... Perhaps on a fallen log or a patch of soft moss...", duration: 15000 },
      { text: "Feel the solid support of the earth beneath you... You are completely safe and at peace here...", duration: 20000 },
      { text: "Listen to the gentle rustling of leaves... Each sound deepens your sense of calm and connection...", duration: 10000 },
      { text: "This forest is your place of healing and renewal... You can return here whenever you need peace...", duration: 15000 },
      { text: "Take three deep breaths... Slowly open your eyes, carrying this forest peace within you...", duration: 10000 }
    ]
  },
  {
    id: 'mountain',
    title: 'Mountain Lake',
    description: 'Crystal clear water and snow-capped peaks',
    duration: 600000,
    script: [
      { text: "Close your eyes and settle into a comfortable position... Let go of the day's concerns...", duration: 10000 },
      { text: "You find yourself beside a pristine mountain lake... The water is crystal clear and perfectly still...", duration: 15000 },
      { text: "Snow-capped peaks surround the lake, their reflection creating a perfect mirror image in the water...", duration: 15000 },
      { text: "The air is crisp and pure... Each breath fills you with clarity and calm...", duration: 15000 },
      { text: "You sit on a smooth boulder at the water's edge... The stone is warm from the mountain sun...", duration: 15000 },
      { text: "The silence here is profound... Only the gentle lapping of water against the shore...", duration: 20000 },
      { text: "Watch the surface of the lake... Any ripples smooth out quickly, returning to perfect stillness...", duration: 15000 },
      { text: "Like the lake, your mind becomes calm and clear... Thoughts settle like sediment in still water...", duration: 15000 },
      { text: "The mountains stand as ancient guardians... Their strength and permanence bring you deep peace...", duration: 20000 },
      { text: "Feel yourself becoming as calm and clear as this mountain lake... Centered and serene...", duration: 10000 },
      { text: "This place of perfect peace exists within you... You can access this calm anytime you need it...", duration: 15000 },
      { text: "Breathe deeply... When ready, open your eyes and return, carrying this mountain stillness with you...", duration: 10000 }
    ]
  },
  {
    id: 'garden',
    title: 'Secret Garden',
    description: 'Blooming flowers and gentle streams',
    duration: 600000,
    script: [
      { text: "Close your eyes and take a deep, peaceful breath... Feel your body beginning to relax...", duration: 10000 },
      { text: "You discover a hidden garden gate... As you open it, you enter a magical, peaceful sanctuary...", duration: 15000 },
      { text: "The garden is filled with the most beautiful flowers you've ever seen... Colors vibrant and soothing...", duration: 15000 },
      { text: "A gentle stream flows through the center... Its soft babbling creates the perfect background melody...", duration: 15000 },
      { text: "The air is warm and carries the sweet fragrance of blooming flowers... Roses, lavender, jasmine...", duration: 15000 },
      { text: "Butterflies dance from flower to flower... Bees hum contentedly as they work... All is harmony here...", duration: 20000 },
      { text: "You find a comfortable bench beside the stream... Sit down and feel completely welcome and safe...", duration: 15000 },
      { text: "Dip your fingers in the cool, clear water... It flows gently, washing away any stress or worry...", duration: 15000 },
      { text: "This garden responds to your presence... The flowers seem to glow more brightly, welcoming you...", duration: 20000 },
      { text: "Feel the life and growth all around you... This energy of renewal fills your entire being...", duration: 10000 },
      { text: "This secret garden is always here for you... A place of beauty, peace, and restoration...", duration: 15000 },
      { text: "Take three deep breaths... Open your eyes slowly, bringing the garden's peace into your heart...", duration: 10000 }
    ]
  }
];

export const GuidedImagery = ({ onBack }: GuidedImageryProps) => {
  const [language, setLanguage] = useState<Language>('en');
  const [selectedScenario, setSelectedScenario] = useState(imageryScenarios[0]);
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const t = translations[language];
  const currentStep = selectedScenario.script[currentStepIndex];

  useEffect(() => {
    if (isActive && !isCompleted) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 100) {
            return selectedScenario.script[currentStepIndex]?.duration || 0;
          }
          return prev - 100;
        });
      }, 100);

      const currentStep = selectedScenario.script[currentStepIndex];
      if (currentStep) {
        stepTimeoutRef.current = setTimeout(() => {
          if (currentStepIndex < selectedScenario.script.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
            setTimeLeft(selectedScenario.script[currentStepIndex + 1]?.duration || 0);
          } else {
            setIsActive(false);
            setIsCompleted(true);
          }
        }, currentStep.duration);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
    };
  }, [isActive, currentStepIndex, selectedScenario, isCompleted]);

  const toggleSession = () => {
    if (isCompleted) {
      resetSession();
    } else {
      setIsActive(!isActive);
      if (!isActive && currentStepIndex === 0) {
        setTimeLeft(selectedScenario.script[0].duration);
      }
    }
  };

  const resetSession = () => {
    setIsActive(false);
    setCurrentStepIndex(0);
    setTimeLeft(0);
    setIsCompleted(false);
  };

  const handleScenarioChange = (scenario: typeof imageryScenarios[0]) => {
    if (!isActive) {
      setSelectedScenario(scenario);
      resetSession();
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Play audio narration
  useEffect(() => {
    if (isActive && currentStep && soundEnabled) {
      playTextToSpeech(currentStep.text);
    }
  }, [currentStepIndex, isActive, soundEnabled]);

  const progress = selectedScenario.script.length > 0 ? ((currentStepIndex + 1) / selectedScenario.script.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="shadow-card">
          <CardHeader className="text-center">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                {t.back}
              </Button>
              <div className="flex items-center gap-2">
                <LanguageSelector language={language} onLanguageChange={setLanguage} />
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <CardTitle className="text-3xl mb-2">{t.guidedImagery}</CardTitle>
            <p className="text-muted-foreground">
              {t.guidedImageryDesc}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Scenario Selection */}
            {!isActive && !isCompleted && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">{t.choosePlace}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {imageryScenarios.map((scenario) => (
                    <Card 
                      key={scenario.id}
                      className={`cursor-pointer transition-all ${
                        selectedScenario.id === scenario.id 
                          ? 'ring-2 ring-primary bg-gradient-secondary' 
                          : 'hover:shadow-gentle'
                      }`}
                      onClick={() => handleScenarioChange(scenario)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-4xl mb-2">
                          {scenario.id === 'beach' && '🏖️'}
                          {scenario.id === 'forest' && '🌲'}
                          {scenario.id === 'mountain' && '🏔️'}
                          {scenario.id === 'garden' && '🌸'}
                        </div>
                        <div className="font-medium mb-1">{scenario.title}</div>
                        <div className="text-xs text-muted-foreground">{scenario.description}</div>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {formatTime(scenario.duration)}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Active Session Display */}
            {(isActive || isCompleted) && (
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-primary">
                    {selectedScenario.title}
                  </h3>
                  
                  {/* Progress Indicator */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Step {currentStepIndex + 1} of {selectedScenario.script.length}</span>
                      <span>{formatTime(timeLeft)} remaining</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Current Text */}
                  {!isCompleted && currentStep && (
                    <div className="max-w-2xl mx-auto">
                      <div className="p-6 bg-gradient-secondary rounded-lg border border-accent-foreground/20">
                        <p className="text-lg leading-relaxed text-accent-foreground">
                          {currentStep.text}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Visual Breathing Indicator */}
                  {isActive && (
                    <div className="flex justify-center">
                      <div 
                        className="w-16 h-16 rounded-full bg-gradient-primary opacity-20 animate-pulse"
                        style={{ 
                          animationDuration: '4s',
                          boxShadow: '0 0 30px hsl(var(--primary) / 0.3)'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Completion Message */}
            {isCompleted && (
              <div className="text-center p-8 bg-gradient-primary rounded-lg text-white">
                <h3 className="text-2xl font-bold mb-4">{t.journeyComplete}</h3>
                <p className="text-lg mb-4">
                  You've experienced a full guided imagery session in your {selectedScenario.title.toLowerCase()}.
                </p>
                <p className="opacity-90">
                  Take a moment to hold onto these peaceful feelings before returning to your day.
                </p>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <Button 
                onClick={toggleSession}
                size="lg"
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                {isCompleted ? (
                  <>
                    <RotateCcw className="w-5 h-5 mr-2" />
                    {t.start} New Journey
                  </>
                ) : isActive ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    {t.pause}
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    {t.beginJourney}
                  </>
                )}
              </Button>
              
              {(isActive || isCompleted || currentStepIndex > 0) && (
                <Button 
                  onClick={resetSession}
                  variant="outline"
                  size="lg"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  {t.reset}
                </Button>
              )}
            </div>

            {/* Instructions */}
            {!isActive && !isCompleted && (
              <div className="text-center p-6 bg-gradient-secondary rounded-lg">
                <h4 className="font-semibold text-accent-foreground mb-2">{t.gettingStarted}</h4>
                <div className="text-accent-foreground/80 text-sm space-y-2">
                  <p>• Find a quiet, comfortable place where you won't be disturbed</p>
                  <p>• Sit or lie down in a relaxed position</p>
                  <p>• Close your eyes and let your imagination guide you</p>
                  <p>• Don't worry if your mind wanders - gently return to the visualization</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};