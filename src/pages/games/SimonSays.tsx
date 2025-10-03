import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Play } from 'lucide-react';

const colors = ['red', 'green', 'blue', 'yellow'];

export default function SimonSays() {
  const [sequence, setSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const startGame = () => {
    setSequence([]);
    setUserSequence([]);
    setScore(0);
    setGameOver(false);
    addToSequence([]);
  };

  const addToSequence = (current: string[]) => {
    const newColor = colors[Math.floor(Math.random() * colors.length)];
    const newSequence = [...current, newColor];
    setSequence(newSequence);
    playSequence(newSequence);
  };

  const playSequence = async (seq: string[]) => {
    setPlaying(true);
    for (let color of seq) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setActiveColor(color);
      await new Promise(resolve => setTimeout(resolve, 400));
      setActiveColor(null);
    }
    setPlaying(false);
  };

  const handleColorClick = (color: string) => {
    if (playing || gameOver) return;

    const newUserSequence = [...userSequence, color];
    setUserSequence(newUserSequence);

    setActiveColor(color);
    setTimeout(() => setActiveColor(null), 300);

    if (newUserSequence[newUserSequence.length - 1] !== sequence[newUserSequence.length - 1]) {
      setGameOver(true);
      return;
    }

    if (newUserSequence.length === sequence.length) {
      setScore(score + 1);
      setUserSequence([]);
      setTimeout(() => addToSequence(sequence), 1000);
    }
  };

  const getColorClass = (color: string) => {
    const base = activeColor === color ? 'scale-95 ' : '';
    switch (color) {
      case 'red': return base + 'bg-red-500 hover:bg-red-600';
      case 'green': return base + 'bg-green-500 hover:bg-green-600';
      case 'blue': return base + 'bg-blue-500 hover:bg-blue-600';
      case 'yellow': return base + 'bg-yellow-500 hover:bg-yellow-600';
      default: return '';
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
          <h1 className="text-4xl font-bold mb-2">Simon Says</h1>
          <p className="text-muted-foreground">Follow the pattern!</p>
        </div>

        <Card className="p-8 mb-6">
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-primary">Score: {score}</div>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorClick(color)}
                disabled={playing || gameOver}
                className={`aspect-square rounded-xl transition-all duration-200 ${getColorClass(color)} disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            ))}
          </div>

          {!sequence.length && !gameOver && (
            <div className="text-center">
              <Button onClick={startGame} size="lg">
                <Play className="mr-2 h-5 w-5" />
                Start Game
              </Button>
            </div>
          )}

          {gameOver && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
              <p className="text-muted-foreground mb-4">Final Score: {score}</p>
              <Button onClick={startGame}>Play Again</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
