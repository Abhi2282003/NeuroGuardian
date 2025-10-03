import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, RotateCcw } from 'lucide-react';

export default function SlidingPuzzle() {
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const numbers = Array.from({ length: 15 }, (_, i) => i + 1);
    numbers.push(0); // 0 represents empty tile
    shuffleArray(numbers);
    setTiles(numbers);
    setMoves(0);
    setSolved(false);
  };

  const shuffleArray = (array: number[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const canMove = (index: number) => {
    const emptyIndex = tiles.indexOf(0);
    const row = Math.floor(index / 4);
    const col = index % 4;
    const emptyRow = Math.floor(emptyIndex / 4);
    const emptyCol = emptyIndex % 4;
    
    return (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
           (col === emptyCol && Math.abs(row - emptyRow) === 1);
  };

  const moveTile = (index: number) => {
    if (!canMove(index)) return;
    
    const newTiles = [...tiles];
    const emptyIndex = tiles.indexOf(0);
    [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
    setTiles(newTiles);
    setMoves(moves + 1);
    
    if (isSolved(newTiles)) {
      setSolved(true);
    }
  };

  const isSolved = (tiles: number[]) => {
    for (let i = 0; i < 15; i++) {
      if (tiles[i] !== i + 1) return false;
    }
    return tiles[15] === 0;
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
          <h1 className="text-4xl font-bold mb-2">Sliding Puzzle</h1>
          <p className="text-muted-foreground">Arrange tiles in order from 1 to 15</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="text-lg font-semibold">Moves: {moves}</div>
          <Button onClick={initGame} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            New Puzzle
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-2 max-w-md mx-auto mb-6">
          {tiles.map((tile, index) => (
            <button
              key={index}
              onClick={() => moveTile(index)}
              disabled={tile === 0}
              className={`aspect-square rounded-lg text-3xl font-bold transition-all ${
                tile === 0
                  ? 'bg-muted cursor-default'
                  : canMove(index)
                  ? 'bg-primary text-primary-foreground hover:scale-105 cursor-pointer'
                  : 'bg-card cursor-not-allowed opacity-50'
              }`}
            >
              {tile || ''}
            </button>
          ))}
        </div>

        {solved && (
          <Card className="p-6 text-center bg-primary/10 border-primary">
            <h2 className="text-2xl font-bold mb-2">🎉 Puzzle Solved!</h2>
            <p className="text-muted-foreground mb-4">Completed in {moves} moves</p>
            <Button onClick={initGame}>New Puzzle</Button>
          </Card>
        )}
      </div>
    </div>
  );
}
