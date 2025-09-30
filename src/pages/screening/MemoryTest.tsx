import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, Check, X } from 'lucide-react';

const WORD_LISTS = [
  ['apple', 'guitar', 'ocean', 'mountain', 'rainbow', 'elephant', 'piano', 'sunset'],
  ['bicycle', 'forest', 'diamond', 'butterfly', 'volcano', 'dolphin', 'thunder', 'crystal'],
  ['penguin', 'canyon', 'laptop', 'meteor', 'cactus', 'lighthouse', 'leopard', 'glacier']
];

export default function MemoryTest() {
  const [phase, setPhase] = useState<'intro' | 'memorize' | 'distract' | 'recall' | 'results'>('intro');
  const [currentWords, setCurrentWords] = useState<string[]>([]);
  const [userRecall, setUserRecall] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (phase === 'memorize' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && phase === 'memorize') {
      setPhase('distract');
      setTimeLeft(10);
    } else if (phase === 'distract' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && phase === 'distract') {
      setPhase('recall');
    }
    return () => clearInterval(interval);
  }, [phase, timeLeft]);

  const startTest = () => {
    const randomList = WORD_LISTS[Math.floor(Math.random() * WORD_LISTS.length)];
    setCurrentWords(randomList);
    setUserRecall([]);
    setCurrentInput('');
    setTimeLeft(30);
    setPhase('memorize');
  };

  const handleRecallSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentInput.trim()) {
      setUserRecall([...userRecall, currentInput.trim().toLowerCase()]);
      setCurrentInput('');
    }
  };

  const finishRecall = () => {
    const correct = userRecall.filter(word => currentWords.includes(word)).length;
    setScore(correct);
    setPhase('results');
  };

  const resetTest = () => {
    setPhase('intro');
    setCurrentWords([]);
    setUserRecall([]);
    setCurrentInput('');
    setScore(0);
  };

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
            <CardTitle className="text-3xl">Memory Recall Test</CardTitle>
            <CardDescription>
              Test your short-term memory by memorizing and recalling a list of words.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {phase === 'intro' && (
              <div className="text-center space-y-6">
                <div className="text-muted-foreground space-y-4">
                  <p className="text-lg">You will have 30 seconds to memorize a list of 8 words.</p>
                  <p>After a brief distraction period, you'll be asked to recall as many words as possible.</p>
                </div>
                <Button size="lg" onClick={startTest}>
                  <Play className="mr-2 h-5 w-5" />
                  Start Memory Test
                </Button>
              </div>
            )}

            {phase === 'memorize' && (
              <div className="text-center space-y-6">
                <div className="text-2xl font-bold text-primary mb-4">
                  Memorize these words ({timeLeft}s)
                </div>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  {currentWords.map((word, idx) => (
                    <Card key={idx} className="p-6 bg-primary/10">
                      <div className="text-xl font-semibold">{word}</div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {phase === 'distract' && (
              <div className="text-center space-y-6">
                <div className="text-2xl font-bold text-primary mb-4">
                  Count backwards from 100 by 7s ({timeLeft}s)
                </div>
                <div className="text-muted-foreground">
                  <p>100, 93, 86, 79...</p>
                  <p className="mt-4">Keep counting until the timer ends</p>
                </div>
              </div>
            )}

            {phase === 'recall' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-4">
                    Recall the words
                  </div>
                  <p className="text-muted-foreground">
                    Type as many words as you can remember
                  </p>
                </div>

                <form onSubmit={handleRecallSubmit} className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter a word..."
                      autoFocus
                    />
                    <Button type="submit">Add</Button>
                  </div>
                </form>

                <div className="space-y-2">
                  <div className="font-semibold">Your answers ({userRecall.length}):</div>
                  <div className="flex flex-wrap gap-2">
                    {userRecall.map((word, idx) => (
                      <div key={idx} className="px-3 py-1 bg-primary/20 rounded-full text-sm">
                        {word}
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={finishRecall} className="w-full" size="lg">
                  Finish & See Results
                </Button>
              </div>
            )}

            {phase === 'results' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {score} / {currentWords.length}
                  </div>
                  <div className="text-xl text-muted-foreground">
                    {((score / currentWords.length) * 100).toFixed(0)}% Accuracy
                  </div>
                </div>

                <Card className="bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg">Detailed Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="font-semibold mb-2 flex items-center gap-2">
                        <Check className="h-4 w-4 text-success" />
                        Correct Recalls ({score})
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {userRecall.filter(word => currentWords.includes(word)).map((word, idx) => (
                          <div key={idx} className="px-3 py-1 bg-success/20 text-success rounded-full text-sm">
                            {word}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="font-semibold mb-2 flex items-center gap-2">
                        <X className="h-4 w-4 text-destructive" />
                        Incorrect/Missing ({currentWords.length - score})
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {currentWords.filter(word => !userRecall.includes(word)).map((word, idx) => (
                          <div key={idx} className="px-3 py-1 bg-destructive/20 text-destructive rounded-full text-sm">
                            {word}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={resetTest} variant="outline" className="w-full">
                  Try Again
                </Button>
              </div>
            )}

            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg">About This Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Assesses short-term memory and working memory</p>
                <p>• Normal adults recall 5-7 items on average</p>
                <p>• Used in cognitive screening for dementia and memory disorders</p>
                <p>• Performance can be affected by attention, stress, and fatigue</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
