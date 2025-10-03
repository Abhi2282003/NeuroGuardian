import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, RotateCcw } from 'lucide-react';

const emojis = ['🌟', '🎨', '🎭', '🎪', '🎸', '🎯', '🎲', '🎳'];

export default function MemoryMatch() {
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first] === cards[second]) {
        setMatched([...matched, first, second]);
        setFlipped([]);
        if (matched.length + 2 === cards.length) {
          setGameWon(true);
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
      setMoves(moves + 1);
    }
  }, [flipped]);

  const initializeGame = () => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameWon(false);
  };

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;
    setFlipped([...flipped, index]);
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
          <h1 className="text-4xl font-bold mb-2">Memory Match</h1>
          <p className="text-muted-foreground">Find all the matching pairs!</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="text-lg font-semibold">Moves: {moves}</div>
          <Button onClick={initializeGame} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            New Game
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {cards.map((emoji, index) => (
            <button
              key={index}
              onClick={() => handleCardClick(index)}
              className={`aspect-square rounded-lg text-4xl transition-all duration-300 ${
                flipped.includes(index) || matched.includes(index)
                  ? 'bg-primary/20 border-2 border-primary'
                  : 'bg-card hover:bg-accent cursor-pointer'
              }`}
              disabled={matched.includes(index)}
            >
              {(flipped.includes(index) || matched.includes(index)) ? emoji : '?'}
            </button>
          ))}
        </div>

        {gameWon && (
          <Card className="p-6 text-center bg-primary/10 border-primary">
            <h2 className="text-2xl font-bold mb-2">🎉 You Won!</h2>
            <p className="text-muted-foreground mb-4">Completed in {moves} moves</p>
            <Button onClick={initializeGame}>Play Again</Button>
          </Card>
        )}
      </div>
    </div>
  );
}
