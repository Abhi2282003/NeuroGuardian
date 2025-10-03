import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function ReactionTime() {
  const [state, setState] = useState<'waiting' | 'ready' | 'go' | 'result'>('waiting');
  const [time, setTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number>(Infinity);
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const start = () => {
    setState('ready');
    const delay = 2000 + Math.random() * 3000;
    timeoutRef.current = setTimeout(() => {
      setState('go');
      startTimeRef.current = Date.now();
    }, delay);
  };

  const handleClick = () => {
    if (state === 'waiting') {
      start();
    } else if (state === 'ready') {
      clearTimeout(timeoutRef.current);
      setState('waiting');
      setTime(null);
    } else if (state === 'go') {
      const reactionTime = Date.now() - startTimeRef.current;
      setTime(reactionTime);
      if (reactionTime < bestTime) {
        setBestTime(reactionTime);
      }
      setState('result');
    } else if (state === 'result') {
      setState('waiting');
      setTime(null);
    }
  };

  const getBackgroundColor = () => {
    switch (state) {
      case 'waiting': return 'bg-blue-500';
      case 'ready': return 'bg-red-500';
      case 'go': return 'bg-green-500';
      case 'result': return 'bg-blue-500';
    }
  };

  const getMessage = () => {
    switch (state) {
      case 'waiting': return 'Click to Start';
      case 'ready': return 'Wait for green...';
      case 'go': return 'Click NOW!';
      case 'result': return `${time}ms`;
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
          <h1 className="text-4xl font-bold mb-2">Reaction Time Test</h1>
          <p className="text-muted-foreground">Click as fast as you can when the screen turns green!</p>
        </div>

        <button
          onClick={handleClick}
          className={`w-full h-96 rounded-xl ${getBackgroundColor()} text-white text-4xl font-bold transition-colors mb-6 hover:opacity-90`}
        >
          {getMessage()}
        </button>

        {bestTime !== Infinity && (
          <Card className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Best Time</h3>
            <div className="text-4xl font-bold text-primary">{bestTime}ms</div>
            <p className="text-sm text-muted-foreground mt-2">
              {bestTime < 200 ? '🚀 Lightning fast!' : 
               bestTime < 300 ? '⚡ Great reflexes!' : 
               '👍 Keep practicing!'}
            </p>
          </Card>
        )}

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Average human reaction time: 200-300ms</p>
        </div>
      </div>
    </div>
  );
}
