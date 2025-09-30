import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play } from 'lucide-react';

const COLORS = [
  { name: 'red', hsl: '0 75% 55%' },
  { name: 'blue', hsl: '217 91% 60%' },
  { name: 'green', hsl: '142 76% 48%' },
  { name: 'yellow', hsl: '48 96% 53%' }
];

export default function StroopTest() {
  const [phase, setPhase] = useState<'intro' | 'practice' | 'test' | 'results'>('intro');
  const [currentWord, setCurrentWord] = useState({ text: '', color: '' });
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(0);

  const generateQuestion = () => {
    const wordColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const displayColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setCurrentWord({ text: wordColor.name, color: displayColor.hsl });
    setQuestionStartTime(Date.now());
  };

  const startTest = (isPractice: boolean = false) => {
    setPhase(isPractice ? 'practice' : 'test');
    setCorrectCount(0);
    setTotalCount(0);
    setReactionTimes([]);
    setStartTime(Date.now());
    generateQuestion();
  };

  const handleAnswer = (selectedColor: string) => {
    const reactionTime = Date.now() - questionStartTime;
    setReactionTimes([...reactionTimes, reactionTime]);
    
    const wordColorObject = COLORS.find(c => c.hsl === currentWord.color);
    const isCorrect = wordColorObject?.name === selectedColor;
    
    if (isCorrect) {
      setCorrectCount(correctCount + 1);
    }
    
    setTotalCount(totalCount + 1);
    
    if (phase === 'practice' && totalCount >= 4) {
      setPhase('intro');
    } else if (phase === 'test' && totalCount >= 19) {
      setPhase('results');
    } else {
      generateQuestion();
    }
  };

  const avgReactionTime = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/screening">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Screening
          </Button>
        </Link>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-3xl">Stroop Test</CardTitle>
            <CardDescription>
              Test cognitive flexibility and processing speed by identifying the color of the text, not the word itself.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {phase === 'intro' && (
              <div className="text-center space-y-6">
                <div className="space-y-4 text-muted-foreground">
                  <p className="text-lg">
                    You will see color words displayed in different colors.
                  </p>
                  <p>
                    <strong>Your task:</strong> Click the button that matches the <strong>COLOR</strong> of the text, not the word itself.
                  </p>
                  <div className="p-6 bg-muted/30 rounded-lg">
                    <p>Example:</p>
                    <div className="text-4xl font-bold mt-4" style={{ color: 'hsl(142 76% 48%)' }}>
                      RED
                    </div>
                    <p className="mt-4">The correct answer would be <strong>GREEN</strong> (the color of the text)</p>
                  </div>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button size="lg" variant="outline" onClick={() => startTest(true)}>
                    Practice (5 trials)
                  </Button>
                  <Button size="lg" onClick={() => startTest(false)}>
                    <Play className="mr-2 h-5 w-5" />
                    Start Test (20 trials)
                  </Button>
                </div>
              </div>
            )}

            {(phase === 'practice' || phase === 'test') && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-4">
                    {phase === 'practice' ? 'Practice Mode' : `Question ${totalCount + 1}/20`}
                  </div>
                  <div 
                    className="text-6xl font-bold py-12"
                    style={{ color: `hsl(${currentWord.color})` }}
                  >
                    {currentWord.text.toUpperCase()}
                  </div>
                  <div className="text-muted-foreground mb-8">
                    Click the COLOR of the text
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  {COLORS.map((color) => (
                    <Button
                      key={color.name}
                      size="lg"
                      variant="outline"
                      className="h-20 text-lg font-semibold"
                      style={{ 
                        borderColor: `hsl(${color.hsl})`,
                        color: `hsl(${color.hsl})`
                      }}
                      onClick={() => handleAnswer(color.name)}
                    >
                      {color.name.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {phase === 'results' && (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="text-5xl font-bold text-primary">
                    {Math.round((correctCount / totalCount) * 100)}%
                  </div>
                  <div className="text-xl text-muted-foreground">Accuracy</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-primary/10">
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-primary">{correctCount}/{totalCount}</div>
                      <div className="text-sm text-muted-foreground">Correct Answers</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/10">
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-primary">{avgReactionTime}ms</div>
                      <div className="text-sm text-muted-foreground">Avg Reaction Time</div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Interpretation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>• Normal adults: 85-95% accuracy</p>
                    <p>• Average reaction time: 700-1000ms</p>
                    <p>• The Stroop effect measures cognitive interference</p>
                    <p>• Slower times suggest reduced executive function</p>
                    <p>• Used in ADHD, dementia, and brain injury assessment</p>
                  </CardContent>
                </Card>

                <Button onClick={() => setPhase('intro')} variant="outline" className="w-full">
                  Try Again
                </Button>
              </div>
            )}

            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg">About This Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Measures selective attention and cognitive flexibility</p>
                <p>• Tests the Stroop effect: interference between word reading and color naming</p>
                <p>• Assesses executive function and processing speed</p>
                <p>• Widely used in neuropsychological assessments</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
