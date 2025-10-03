import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Gamepad2, Brain, Puzzle, Target, Timer, Zap, Eye, Sparkles, Heart, Smile } from 'lucide-react';

export default function Games() {
  const games = [
    {
      id: 'dino',
      title: 'Dino Run',
      description: 'Classic Chrome dino game - Jump over obstacles and test your reflexes',
      icon: Gamepad2,
      path: '/games/dino',
      color: 'text-orange-500',
      category: 'Reflexes'
    },
    {
      id: 'memory',
      title: 'Memory Match',
      description: 'Flip cards and match pairs - Improve your memory and concentration',
      icon: Brain,
      path: '/games/memory',
      color: 'text-blue-500',
      category: 'Memory'
    },
    {
      id: 'puzzle',
      title: 'Sliding Puzzle',
      description: 'Arrange tiles in correct order - Enhance problem-solving skills',
      icon: Puzzle,
      path: '/games/puzzle',
      color: 'text-purple-500',
      category: 'Logic'
    },
    {
      id: 'simon',
      title: 'Simon Says',
      description: 'Follow the pattern - Test your memory and pattern recognition',
      icon: Target,
      path: '/games/simon',
      color: 'text-green-500',
      category: 'Memory'
    },
    {
      id: 'reaction',
      title: 'Reaction Time',
      description: 'Click when the color changes - Measure your reaction speed',
      icon: Zap,
      path: '/games/reaction',
      color: 'text-yellow-500',
      category: 'Reflexes'
    },
    {
      id: 'focus',
      title: 'Focus Trainer',
      description: 'Keep the ball balanced - Improve concentration and mindfulness',
      icon: Eye,
      path: '/games/focus',
      color: 'text-cyan-500',
      category: 'Focus'
    },
    {
      id: 'breathing',
      title: 'Breathing Bubbles',
      description: 'Pop bubbles in rhythm - Practice calming breathing patterns',
      icon: Sparkles,
      path: '/games/breathing',
      color: 'text-pink-500',
      category: 'Relaxation'
    },
    {
      id: 'color',
      title: 'Color Match',
      description: 'Match colors quickly - Enhance visual processing speed',
      icon: Heart,
      path: '/games/color',
      color: 'text-red-500',
      category: 'Speed'
    },
    {
      id: 'word',
      title: 'Word Search',
      description: 'Find hidden words - Boost vocabulary and pattern recognition',
      icon: Brain,
      path: '/games/word',
      color: 'text-indigo-500',
      category: 'Language'
    },
    {
      id: 'mood',
      title: 'Mood Garden',
      description: 'Grow a virtual garden - Track emotions through creative play',
      icon: Smile,
      path: '/games/mood',
      color: 'text-emerald-500',
      category: 'Emotional'
    }
  ];

  const categories = ['Reflexes', 'Memory', 'Logic', 'Focus', 'Relaxation', 'Speed', 'Language', 'Emotional'];

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link to="/student">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Student Portal
          </Button>
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Mind Games & Brain Training
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Fun, interactive games designed to improve cognitive skills, reduce stress, and boost mental wellness
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <div
              key={category}
              className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
            >
              {category}
            </div>
          ))}
        </div>

        {/* Games Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => {
            const Icon = game.icon;
            return (
              <Link key={game.id} to={game.path}>
                <Card className="h-full shadow-card hover:shadow-gentle transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Icon className={`h-8 w-8 ${game.color} group-hover:scale-110 transition-transform`} />
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full bg-accent/20 text-accent font-medium">
                        {game.category}
                      </span>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {game.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {game.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <Timer className="mr-2 h-4 w-4" />
                      Play Now
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <Card className="mt-8 bg-muted/30 border-primary/20">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              💡 Playing these games regularly can help improve focus, memory, and emotional regulation while providing a fun break from stress
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
