import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Brain, Target, Clock, Eye, GamepadIcon, Pencil, HandMetal, Heart, Activity, Lightbulb, Wine } from 'lucide-react';

export default function Screening() {
  const cognitiveTests = [
    {
      id: 'spiral',
      title: 'Spiral Drawing Test',
      description: 'Draw a spiral to assess motor control and tremor',
      icon: Pencil,
      path: '/screening/spiral',
      color: 'text-primary',
      difficulty: 'Easy',
      category: 'Cognitive'
    },
    {
      id: 'finger-tap',
      title: 'Finger Tapping Test',
      description: 'Measure motor speed and coordination',
      icon: HandMetal,
      path: '/screening/finger-tap',
      color: 'text-cyan-400',
      difficulty: 'Easy',
      category: 'Cognitive'
    },
    {
      id: 'memory',
      title: 'Memory Test',
      description: 'Assess short-term memory and recall',
      icon: Brain,
      path: '/screening/memory',
      color: 'text-success',
      difficulty: 'Medium',
      category: 'Cognitive'
    },
    {
      id: 'stroop',
      title: 'Stroop Test',
      description: 'Test cognitive flexibility and processing speed',
      icon: Eye,
      path: '/screening/stroop',
      color: 'text-primary',
      difficulty: 'Medium',
      category: 'Cognitive'
    },
    {
      id: 'trail-making',
      title: 'Trail Making Test',
      description: 'Assess visual attention and task switching',
      icon: Target,
      path: '/screening/trail-making',
      color: 'text-cyan-400',
      difficulty: 'Hard',
      category: 'Cognitive'
    },
    {
      id: 'dino',
      title: 'Concentration Game',
      description: 'Chrome dino game to test reaction time & focus',
      icon: GamepadIcon,
      path: '/screening/dino',
      color: 'text-success',
      difficulty: 'Fun',
      category: 'Cognitive'
    }
  ];

  const clinicalTests = [
    {
      id: 'phq9',
      title: 'PHQ-9',
      description: 'Depression screening questionnaire',
      icon: Heart,
      path: '/screening/phq9',
      color: 'text-primary',
      difficulty: '9 Questions',
      category: 'Clinical'
    },
    {
      id: 'gad7',
      title: 'GAD-7',
      description: 'Generalized anxiety disorder assessment',
      icon: Activity,
      path: '/screening/gad7',
      color: 'text-cyan-400',
      difficulty: '7 Questions',
      category: 'Clinical'
    },
    {
      id: 'pss',
      title: 'Perceived Stress Scale',
      description: 'Measure stress levels over the past month',
      icon: Lightbulb,
      path: '/screening/pss',
      color: 'text-success',
      difficulty: '10 Questions',
      category: 'Clinical'
    },
    {
      id: 'audit',
      title: 'AUDIT',
      description: 'Alcohol use disorders identification test',
      icon: Wine,
      path: '/screening/audit',
      color: 'text-primary',
      difficulty: '10 Questions',
      category: 'Clinical'
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
              Comprehensive Screening Tools
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Evidence-based cognitive, motor, and clinical assessments for neurological and mental health screening
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Cognitive & Motor Assessments</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cognitiveTests.map((test) => {
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
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Clinical Screening Questionnaires</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {clinicalTests.map((test) => {
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
