import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, Square } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function FingerTapping() {
  const [isRunning, setIsRunning] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [results, setResults] = useState<number[]>([]);
  const TEST_DURATION = 10; // seconds

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      finishTest();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const startTest = () => {
    setIsRunning(true);
    setTapCount(0);
    setTimeLeft(TEST_DURATION);
  };

  const handleTap = () => {
    if (isRunning && timeLeft > 0) {
      setTapCount((prev) => prev + 1);
    }
  };

  const finishTest = () => {
    setIsRunning(false);
    setResults((prev) => [...prev, tapCount]);
  };

  const resetTest = () => {
    setIsRunning(false);
    setTapCount(0);
    setTimeLeft(TEST_DURATION);
    setResults([]);
  };

  const averageTaps = results.length > 0 
    ? (results.reduce((a, b) => a + b, 0) / results.length).toFixed(1)
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
            <CardTitle className="text-3xl">Finger Tapping Test</CardTitle>
            <CardDescription>
              Tap the button as many times as you can in {TEST_DURATION} seconds to measure motor speed and coordination.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="text-6xl font-bold text-primary">
                {tapCount}
              </div>
              <div className="text-muted-foreground">Taps</div>
              
              {isRunning && (
                <div className="space-y-2">
                  <div className="text-2xl font-semibold">{timeLeft}s</div>
                  <Progress value={(timeLeft / TEST_DURATION) * 100} className="h-2" />
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <Button
                size="lg"
                className="w-64 h-64 rounded-full text-2xl font-bold"
                onClick={isRunning ? handleTap : startTest}
                variant={isRunning ? "default" : "outline"}
              >
                {isRunning ? 'TAP!' : (
                  <>
                    <Play className="mr-2 h-8 w-8" />
                    Start Test
                  </>
                )}
              </Button>
            </div>

            {results.length > 0 && (
              <Card className="bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-primary">{averageTaps}</div>
                      <div className="text-sm text-muted-foreground">Average Taps</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-primary">{results.length}</div>
                      <div className="text-sm text-muted-foreground">Trials Completed</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {results.map((result, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>Trial {idx + 1}:</span>
                        <span className="font-semibold">{result} taps</span>
                      </div>
                    ))}
                  </div>
                  <Button onClick={resetTest} variant="outline" className="w-full">
                    <Square className="mr-2 h-4 w-4" />
                    Reset All Results
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg">Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>1. Click "Start Test" to begin</p>
                <p>2. Tap the button as fast as possible for {TEST_DURATION} seconds</p>
                <p>3. Use your dominant hand's index finger</p>
                <p>4. Complete multiple trials for accurate assessment</p>
                <p>5. Normal range: 40-60 taps per 10 seconds</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
