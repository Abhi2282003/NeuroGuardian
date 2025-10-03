import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Play } from 'lucide-react';

export default function FocusTrainer() {
  const [playing, setPlaying] = useState(false);
  const [ballY, setBallY] = useState(50);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballVelocityRef = useRef(0);

  useEffect(() => {
    if (!playing || gameOver) return;

    const interval = setInterval(() => {
      setBallY((prev) => {
        const newY = prev + ballVelocityRef.current;
        if (newY < 10 || newY > 90) {
          setGameOver(true);
          return prev;
        }
        ballVelocityRef.current += 0.2; // Gravity
        setScore((s) => s + 1);
        return newY;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [playing, gameOver]);

  const startGame = () => {
    setBallY(50);
    setScore(0);
    setGameOver(false);
    setPlaying(true);
    ballVelocityRef.current = 0;
  };

  const handleClick = () => {
    if (gameOver) {
      startGame();
    } else if (playing) {
      ballVelocityRef.current = -2;
    } else {
      startGame();
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
          <h1 className="text-4xl font-bold mb-2">Focus Trainer</h1>
          <p className="text-muted-foreground">Keep the ball balanced - Click to lift it up!</p>
        </div>

        <Card className="p-8">
          <div className="mb-4 text-center">
            <div className="text-2xl font-bold text-primary">Score: {score}</div>
          </div>

          <div
            onClick={handleClick}
            className="relative h-96 bg-gradient-to-b from-sky-100 to-sky-300 rounded-lg cursor-pointer overflow-hidden"
          >
            <div
              className="absolute w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow-lg transition-all"
              style={{
                top: `${ballY}%`,
                left: 'calc(50% - 24px)',
                transform: 'translateY(-50%)',
              }}
            />
            
            {!playing && !gameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="text-center text-white">
                  <Play className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-xl font-bold">Click to Start</p>
                </div>
              </div>
            )}

            {gameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center text-white">
                  <h2 className="text-3xl font-bold mb-2">Game Over!</h2>
                  <p className="text-xl mb-4">Score: {score}</p>
                  <p className="text-sm">Click to try again</p>
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Click anywhere to keep the ball in the air. Don't let it touch the top or bottom!
          </p>
        </Card>
      </div>
    </div>
  );
}
