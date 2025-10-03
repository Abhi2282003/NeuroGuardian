import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const wordList = ['CALM', 'PEACE', 'JOY', 'HOPE', 'LOVE'];

export default function WordSearch() {
  const [found, setFound] = useState<string[]>([]);

  const grid = [
    ['C', 'A', 'L', 'M', 'X'],
    ['P', 'E', 'A', 'C', 'E'],
    ['X', 'J', 'O', 'Y', 'X'],
    ['H', 'O', 'P', 'E', 'X'],
    ['L', 'O', 'V', 'E', 'X'],
  ];

  const handleWordClick = (word: string) => {
    if (!found.includes(word)) {
      setFound([...found, word]);
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
          <h1 className="text-4xl font-bold mb-2">Word Search</h1>
          <p className="text-muted-foreground">Find all the positive words!</p>
        </div>

        <Card className="p-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Words to Find:</h3>
            <div className="flex flex-wrap gap-2">
              {wordList.map((word) => (
                <div
                  key={word}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    found.includes(word)
                      ? 'bg-green-500 text-white'
                      : 'bg-muted'
                  }`}
                >
                  {word}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 max-w-md mx-auto mb-6">
            {grid.flat().map((letter, index) => (
              <div
                key={index}
                className="aspect-square flex items-center justify-center text-2xl font-bold bg-card rounded-lg border-2 border-border hover:bg-accent transition-colors"
              >
                {letter}
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Click words from the list when you spot them in the grid!
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {wordList.map((word) => (
                <Button
                  key={word}
                  onClick={() => handleWordClick(word)}
                  variant="outline"
                  disabled={found.includes(word)}
                >
                  Found "{word}"
                </Button>
              ))}
            </div>
          </div>

          {found.length === wordList.length && (
            <Card className="mt-6 p-4 text-center bg-primary/10 border-primary">
              <h3 className="text-xl font-bold">🎉 All Words Found!</h3>
              <p className="text-muted-foreground">Great job!</p>
            </Card>
          )}
        </Card>
      </div>
    </div>
  );
}
