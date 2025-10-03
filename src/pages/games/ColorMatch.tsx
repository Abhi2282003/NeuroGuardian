import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Play } from 'lucide-react';

const colors = [
  { name: 'Red', bg: 'bg-red-500', text: 'text-red-500' },
  { name: 'Blue', bg: 'bg-blue-500', text: 'text-blue-500' },
  { name: 'Green', bg: 'bg-green-500', text: 'text-green-500' },
  { name: 'Yellow', bg: 'bg-yellow-500', text: 'text-yellow-500' },
  { name: 'Purple', bg: 'bg-purple-500', text: 'text-purple-500' },
  { name: 'Orange', bg: 'bg-orange-500', text: 'text-orange-500' },
];

export default function ColorMatch() {
  const [targetColor, setTargetColor] = useState(colors[0]);
  const [textColor, setTextColor] = useState(colors[0]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (playing && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
      setPlaying(false);
    }
  }, [timeLeft, playing]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    setPlaying(true);
    generateColors();
  };

  const generateColors = () => {
    setTargetColor(colors[Math.floor(Math.random() * colors.length)]);
    setTextColor(colors[Math.floor(Math.random() * colors.length)]);
  };

  const handleAnswer = (match: boolean) => {
    const isCorrect = (targetColor.name === textColor.name) === match;
    if (isCorrect) {
      setScore(score + 1);
    } else {
      setScore(Math.max(0, score - 1));
    }
    generateColors();
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
          <h1 className="text-4xl font-bold mb-2">Color Match</h1>
          <p className="text-muted-foreground">Does the word match the color?</p>
        </div>

        <Card className="p-8">
          {!playing && !gameOver && (
            <div className="text-center">
              <p className="text-lg mb-6">Test your visual processing speed!</p>
              <Button onClick={startGame} size="lg">
                <Play className="mr-2 h-5 w-5" />
                Start Game
              </Button>
            </div>
          )}

          {playing && (
            <>
              <div className="flex justify-between mb-8">
                <div className="text-xl font-bold">Score: {score}</div>
                <div className="text-xl font-bold">Time: {timeLeft}s</div>
              </div>

              <div className="mb-8 min-h-32 flex items-center justify-center">
                <div className={`text-6xl font-bold ${textColor.text}`}>
                  {targetColor.name}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => handleAnswer(true)}
                  size="lg"
                  variant="default"
                  className="h-20 text-xl"
                >
                  Match ✓
                </Button>
                <Button
                  onClick={() => handleAnswer(false)}
                  size="lg"
                  variant="outline"
                  className="h-20 text-xl"
                >
                  Different ✗
                </Button>
              </div>
            </>
          )}

          {gameOver && (
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Time's Up!</h2>
              <p className="text-xl mb-6">Final Score: {score}</p>
              <Button onClick={startGame}>Play Again</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
