import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";

interface MeditationTimerProps {
  onBack: () => void;
}

const presetTimes = [
  { label: '5 min', minutes: 5 },
  { label: '10 min', minutes: 10 },
  { label: '15 min', minutes: 15 },
  { label: '20 min', minutes: 20 },
  { label: '30 min', minutes: 30 }
];

const ambientSounds = [
  { 
    id: 'none', 
    label: 'Silence', 
    description: 'Pure quiet meditation',
    audioUrl: null
  },
  { 
    id: 'nature', 
    label: 'Forest', 
    description: 'Birds and gentle wind',
    audioUrl: 'https://www.soundjay.com/misc/sounds/forest-birds-2.mp3'
  },
  { 
    id: 'ocean', 
    label: 'Ocean Waves', 
    description: 'Rhythmic wave sounds',
    audioUrl: 'https://www.soundjay.com/nature/sounds/ocean-wave-1.mp3'
  },
  { 
    id: 'rain', 
    label: 'Rain', 
    description: 'Gentle rainfall',
    audioUrl: 'https://www.soundjay.com/nature/sounds/rain-1.mp3'
  }
];

export const MeditationTimer = ({ onBack }: MeditationTimerProps) => {
  const [selectedTime, setSelectedTime] = useState(10);
  const [timeLeft, setTimeLeft] = useState(10 * 60); // in seconds
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedSound, setSelectedSound] = useState('none');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle ambient sound playback
  useEffect(() => {
    const selectedSoundData = ambientSounds.find(sound => sound.id === selectedSound);
    
    if (isActive && soundEnabled && selectedSoundData?.audioUrl) {
      // Create and play ambient sound
      audioRef.current = new Audio();
      audioRef.current.src = selectedSoundData.audioUrl;
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
      
      const playAudio = async () => {
        try {
          await audioRef.current?.play();
        } catch (error) {
          console.log('Audio autoplay prevented by browser:', error);
        }
      };
      
      playAudio();
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isActive, selectedSound, soundEnabled]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsActive(false);
            setIsCompleted(true);
            // Stop ambient sound and play completion chime
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current = null;
            }
            if (soundEnabled) {
              // Play completion sound (you could add a chime sound here)
              const completionSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1eWz1fdY5rYGNjZGNkZGNkaGNkaGNjZGNjYGRkZGNjZGNkaGNkZGNjZGNjaGNkaGNjZGNjYGRkZGNjZGNkaGNkZGNjZGNjaGNkaGNjZGNjYGRkZGNjZGNkaGNkZGNjZGNjaGNkaGNjZGNjYGRkZGNjZGNkaGNkZGNjZGNjaGNkaGNjZGNjYGRkZGNjZGNk');
              completionSound.volume = 0.5;
              completionSound.play().catch(() => {});
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, soundEnabled]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimeSelect = (minutes: number) => {
    if (!isActive) {
      setSelectedTime(minutes);
      setTimeLeft(minutes * 60);
      setIsCompleted(false);
    }
  };

  const toggleTimer = () => {
    if (isCompleted) {
      resetTimer();
    } else {
      setIsActive(!isActive);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(selectedTime * 60);
    setIsCompleted(false);
  };

  const progress = ((selectedTime * 60 - timeLeft) / (selectedTime * 60)) * 100;

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
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <CardTitle className="text-3xl mb-2">Mindfulness Meditation</CardTitle>
            <p className="text-muted-foreground">
              Set your timer and find your center through mindful awareness
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Timer Display */}
            <div className="flex justify-center">
              <div className="relative">
                <div 
                  className="w-64 h-64 rounded-full border-8 border-muted flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: `conic-gradient(hsl(var(--primary)) ${progress}%, hsl(var(--muted)) ${progress}%)`
                  }}
                >
                  <div className="w-56 h-56 rounded-full bg-card flex items-center justify-center shadow-inner">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary mb-2">
                        {formatTime(timeLeft)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {isCompleted ? 'Complete!' : isActive ? 'Meditating...' : 'Ready to begin'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Selection */}
            {!isActive && !isCompleted && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">Choose Duration</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {presetTimes.map((time) => (
                    <Button
                      key={time.minutes}
                      variant={selectedTime === time.minutes ? "default" : "outline"}
                      onClick={() => handleTimeSelect(time.minutes)}
                      className={selectedTime === time.minutes ? "bg-gradient-primary" : ""}
                    >
                      {time.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Ambient Sounds */}
            {!isActive && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">Ambient Sound</h3>
                <div className="grid grid-cols-2 gap-3">
                  {ambientSounds.map((sound) => (
                    <Card 
                      key={sound.id}
                      className={`cursor-pointer transition-all ${
                        selectedSound === sound.id 
                          ? 'ring-2 ring-primary bg-gradient-secondary' 
                          : 'hover:shadow-gentle'
                      }`}
                      onClick={() => setSelectedSound(sound.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="font-medium text-sm mb-1">{sound.label}</div>
                        <div className="text-xs text-muted-foreground">{sound.description}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <Button 
                onClick={toggleTimer}
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
                    Begin Meditation
                  </>
                )}
              </Button>
              
              {(isActive || isCompleted) && (
                <Button 
                  onClick={resetTimer}
                  variant="outline"
                  size="lg"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              )}
            </div>

            {/* Meditation Guidance */}
            <div className="space-y-4">
              {!isActive && !isCompleted && (
                <div className="text-center p-6 bg-gradient-secondary rounded-lg">
                  <h4 className="font-semibold text-accent-foreground mb-2">Getting Started</h4>
                  <p className="text-accent-foreground/80 text-sm">
                    Find a comfortable position, close your eyes, and focus on your breath. 
                    When thoughts arise, gently return attention to your breathing.
                  </p>
                </div>
              )}
              
              {isActive && (
                <div className="text-center p-6 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-primary font-medium">
                    Focus on your breath... let thoughts come and go without judgment
                  </p>
                </div>
              )}
              
              {isCompleted && (
                <div className="text-center p-6 bg-gradient-primary rounded-lg text-white">
                  <h4 className="font-semibold mb-2">Well Done! 🎉</h4>
                  <p className="text-sm opacity-90">
                    You've completed {selectedTime} minutes of mindfulness meditation. 
                    Take a moment to notice how you feel.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};