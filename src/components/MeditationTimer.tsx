import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { translations, Language } from "@/lib/translations";
import { playAmbientSound, stopCurrentAudio, initializeAudio } from "@/lib/audio";
import { LanguageSelector } from "./LanguageSelector";

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

// Web Audio API sound generation functions
const generateWhiteNoise = (audioContext: AudioContext, duration: number = 1) => {
  const sampleRate = audioContext.sampleRate;
  const frameCount = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < frameCount; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
};

const generateOceanWaves = (audioContext: AudioContext, duration: number = 1) => {
  const sampleRate = audioContext.sampleRate;
  const frameCount = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < frameCount; i++) {
    const time = i / sampleRate;
    const wave1 = Math.sin(2 * Math.PI * 0.1 * time) * 0.3;
    const wave2 = Math.sin(2 * Math.PI * 0.05 * time) * 0.2;
    const noise = (Math.random() * 2 - 1) * 0.1;
    data[i] = wave1 + wave2 + noise;
  }
  return buffer;
};

const generateRainSound = (audioContext: AudioContext, duration: number = 1) => {
  const sampleRate = audioContext.sampleRate;
  const frameCount = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < frameCount; i++) {
    const noise = (Math.random() * 2 - 1) * 0.3;
    const filtered = noise * Math.random();
    data[i] = filtered;
  }
  return buffer;
};

const generateForestSounds = (audioContext: AudioContext, duration: number = 1) => {
  const sampleRate = audioContext.sampleRate;
  const frameCount = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < frameCount; i++) {
    const time = i / sampleRate;
    const wind = Math.sin(2 * Math.PI * 0.05 * time) * 0.2;
    const rustling = (Math.random() * 2 - 1) * 0.1;
    const birds = Math.sin(2 * Math.PI * 2 * time + Math.random()) * 0.05;
    data[i] = wind + rustling + birds;
  }
  return buffer;
};


const ambientSounds = [
  { 
    id: 'none', 
    label: 'silence', 
    description: 'silenceDesc',
    generator: null
  },
  { 
    id: 'nature', 
    label: 'forest', 
    description: 'forestDesc',
    generator: generateForestSounds
  },
  { 
    id: 'ocean', 
    label: 'ocean', 
    description: 'oceanDesc',
    generator: generateOceanWaves
  },
  { 
    id: 'rain', 
    label: 'rain', 
    description: 'rainDesc',
    generator: generateRainSound
  }
];

export const MeditationTimer = ({ onBack }: MeditationTimerProps) => {
  const [selectedTime, setSelectedTime] = useState(10);
  const [timeLeft, setTimeLeft] = useState(10 * 60); // in seconds
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedSound, setSelectedSound] = useState('none');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [language, setLanguage] = useState<Language>('en');
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const t = translations[language];

  // Initialize Web Audio API
  useEffect(() => {
    initializeAudio();
  }, []);

  // Handle ambient sound playback
  useEffect(() => {
    if (isActive && soundEnabled && selectedSound !== 'none') {
      const soundType = selectedSound as 'forest' | 'ocean' | 'rain';
      playAmbientSound(soundType);
    } else {
      stopCurrentAudio();
    }

    return () => {
      stopCurrentAudio();
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
            if (sourceNodeRef.current) {
              try {
                sourceNodeRef.current.stop();
              } catch (e) {}
              sourceNodeRef.current = null;
            }
            if (soundEnabled && audioContextRef.current) {
              // Generate completion chime
              const buffer = audioContextRef.current.createBuffer(1, audioContextRef.current.sampleRate * 0.5, audioContextRef.current.sampleRate);
              const data = buffer.getChannelData(0);
              for (let i = 0; i < data.length; i++) {
                const time = i / audioContextRef.current.sampleRate;
                data[i] = Math.sin(2 * Math.PI * 800 * time) * Math.exp(-time * 5) * 0.3;
              }
              const source = audioContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContextRef.current.destination);
              source.start();
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
            <CardTitle className="text-3xl mb-2">{t.title}</CardTitle>
            <p className="text-muted-foreground">
              {t.description}
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
                        {isCompleted ? t.complete : isActive ? t.meditating : t.ready}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Selection */}
            {!isActive && !isCompleted && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">{t.chooseDuration}</h3>
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
                <h3 className="text-lg font-semibold text-center">{t.ambientSound}</h3>
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
                        <div className="font-medium text-sm mb-1">{t[sound.label as keyof typeof t]}</div>
                        <div className="text-xs text-muted-foreground">{t[sound.description as keyof typeof t]}</div>
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
                    {t.startNew}
                  </>
                ) : isActive ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    {t.pause}
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    {t.beginMeditation}
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
                  {t.reset}
                </Button>
              )}
            </div>

            {/* Meditation Guidance */}
            <div className="space-y-4">
              {!isActive && !isCompleted && (
                <div className="text-center p-6 bg-gradient-secondary rounded-lg">
                  <h4 className="font-semibold text-accent-foreground mb-2">{t.gettingStarted}</h4>
                  <p className="text-accent-foreground/80 text-sm">
                    {t.gettingStartedText}
                  </p>
                </div>
              )}
              
              {isActive && (
                <div className="text-center p-6 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-primary font-medium">
                    {t.focusText}
                  </p>
                </div>
              )}
              
              {isCompleted && (
                <div className="text-center p-6 bg-gradient-primary rounded-lg text-white">
                  <h4 className="font-semibold mb-2">{t.wellDone}</h4>
                  <p className="text-sm opacity-90">
                    {t.completionText.replace('{time}', selectedTime.toString())}
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