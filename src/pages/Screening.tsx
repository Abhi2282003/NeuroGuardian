import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Brain, Target, Clock, Eye, GamepadIcon, Pencil, HandMetal } from 'lucide-react';

export default function Screening() {
  const screeningTests = [
    {
      id: 'spiral',
      title: 'Spiral Drawing Test',
      description: 'Draw a spiral to assess motor control and tremor',
      icon: Pencil,
      path: '/screening/spiral',
      color: 'text-primary',
      difficulty: 'Easy'
    },
    {
      id: 'finger-tap',
      title: 'Finger Tapping Test',
      description: 'Measure motor speed and coordination',
      icon: HandMetal,
      path: '/screening/finger-tap',
      color: 'text-cyan-400',
      difficulty: 'Easy'
    },
    {
      id: 'memory',
      title: 'Memory Test',
      description: 'Assess short-term memory and recall',
      icon: Brain,
      path: '/screening/memory',
      color: 'text-success',
      difficulty: 'Medium'
    },
    {
      id: 'stroop',
      title: 'Stroop Test',
      description: 'Test cognitive flexibility and processing speed',
      icon: Eye,
      path: '/screening/stroop',
      color: 'text-primary',
      difficulty: 'Medium'
    },
    {
      id: 'trail-making',
      title: 'Trail Making Test',
      description: 'Assess visual attention and task switching',
      icon: Target,
      path: '/screening/trail-making',
      color: 'text-cyan-400',
      difficulty: 'Hard'
    },
    {
      id: 'dino',
      title: 'Concentration Game',
      description: 'Chrome dino game to test reaction time & focus',
      icon: GamepadIcon,
      path: '/screening/dino',
      color: 'text-success',
      difficulty: 'Fun'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link to="/dashboard">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
              Neurological Screening
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Evidence-based cognitive and motor assessments for early detection of neurological conditions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {screeningTests.map((test) => {
            const Icon = test.icon;
            return (
              <Link key={test.id} to={test.path}>
                <Card className="h-full shadow-card hover:shadow-gentle transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Icon className={`h-8 w-8 ${test.color} group-hover:scale-110 transition-transform`} />
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent">
                        {test.difficulty}
                      </span>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {test.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {test.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <Clock className="mr-2 h-4 w-4" />
                      Start Test
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <Card className="bg-muted/30 border-primary/20">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              ⚠️ These screening tests are preliminary assessment tools, not diagnostic instruments. Results should be reviewed by qualified healthcare professionals.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
