import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const moods = [
  { emoji: '😊', name: 'Happy', color: 'bg-yellow-200' },
  { emoji: '😌', name: 'Calm', color: 'bg-blue-200' },
  { emoji: '😔', name: 'Sad', color: 'bg-gray-200' },
  { emoji: '😰', name: 'Anxious', color: 'bg-purple-200' },
  { emoji: '😡', name: 'Angry', color: 'bg-red-200' },
  { emoji: '🥰', name: 'Loved', color: 'bg-pink-200' },
];

export default function MoodGarden() {
  const [garden, setGarden] = useState<Array<{ emoji: string; color: string }>>([]);

  const addMood = (mood: typeof moods[0]) => {
    setGarden([...garden, mood]);
  };

  const clearGarden = () => {
    setGarden([]);
  };

  return (
    <div className="min-h-screen bg-gradient-background p-8">
      <Link to="/games">
        <Button variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Games
        </Button>
      </Link>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Mood Garden</h1>
          <p className="text-muted-foreground">Plant flowers that represent your emotions</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">How are you feeling?</h3>
            <div className="grid grid-cols-2 gap-3">
              {moods.map((mood) => (
                <Button
                  key={mood.name}
                  onClick={() => addMood(mood)}
                  variant="outline"
                  className="h-20 flex-col gap-2"
                >
                  <span className="text-4xl">{mood.emoji}</span>
                  <span className="text-sm">{mood.name}</span>
                </Button>
              ))}
            </div>
            <Button
              onClick={clearGarden}
              variant="ghost"
              className="w-full mt-4"
              disabled={garden.length === 0}
            >
              Clear Garden
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Your Emotional Garden</h3>
            <div className="min-h-80 bg-gradient-to-b from-sky-100 to-green-100 rounded-lg p-4 relative overflow-hidden">
              {garden.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <p>Start planting by selecting your moods</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {garden.map((flower, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center animate-fade-in"
                    >
                      <span className="text-4xl">{flower.emoji}</span>
                      <div className={`w-2 h-12 ${flower.color} rounded-full mt-1`} />
                      <div className="w-8 h-2 bg-green-600 rounded-full" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              {garden.length} flowers planted
            </p>
          </Card>
        </div>

        <Card className="mt-6 p-6 bg-muted/30">
          <p className="text-sm text-center text-muted-foreground">
            💚 Track your emotions visually. Notice patterns over time. All feelings are valid and welcome in your garden.
          </p>
        </Card>
      </div>
    </div>
  );
}
