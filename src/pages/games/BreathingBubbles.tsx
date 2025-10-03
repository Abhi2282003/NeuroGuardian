import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Play } from 'lucide-react';

export default function BreathingBubbles() {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'idle'>('idle');
  const [count, setCount] = useState(4);
  const [cycles, setCycles] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;

    if (count === 0) {
      if (phase === 'inhale') {
        setPhase('hold');
        setCount(2);
      } else if (phase === 'hold') {
        setPhase('exhale');
        setCount(6);
      } else if (phase === 'exhale') {
        setCycles(cycles + 1);
        setPhase('inhale');
        setCount(4);
      }
    } else {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [count, phase, playing]);

  const start = () => {
    setPhase('inhale');
    setCount(4);
    setCycles(0);
    setPlaying(true);
  };

  const stop = () => {
    setPlaying(false);
    setPhase('idle');
    setCount(4);
  };

  const getBubbleSize = () => {
    if (phase === 'inhale') return 80 + (4 - count) * 30;
    if (phase === 'exhale') return 200 - (6 - count) * 30;
    return 200;
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      default: return 'Ready to Begin';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background p-8">
      <Link to="/games">
        <Button variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Games
        </Button>
      </Link>

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Breathing Bubbles</h1>
          <p className="text-muted-foreground">Follow the bubble to practice calming breath</p>
        </div>

        <Card className="p-8">
          <div className="mb-6 text-center">
            <div className="text-xl font-semibold text-primary">Cycles: {cycles}</div>
          </div>

          <div className="flex items-center justify-center h-96 relative">
            <div
              className="rounded-full bg-gradient-to-br from-blue-400 to-purple-500 transition-all duration-1000 ease-in-out shadow-2xl"
              style={{
                width: `${getBubbleSize()}px`,
                height: `${getBubbleSize()}px`,
              }}
            />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <div className="text-3xl font-bold mb-2">{getPhaseText()}</div>
              {playing && <div className="text-6xl font-bold">{count}</div>}
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-4">
            {!playing ? (
              <Button onClick={start} size="lg">
                <Play className="mr-2 h-5 w-5" />
                Start Breathing
              </Button>
            ) : (
              <Button onClick={stop} variant="outline" size="lg">
                Stop
              </Button>
            )}
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>4-2-6 breathing pattern: Inhale for 4 seconds, hold for 2, exhale for 6</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
