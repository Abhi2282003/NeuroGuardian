import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Lightbulb } from 'lucide-react';

const questions = [
  { text: "Been upset because of something that happened unexpectedly?", reverse: false },
  { text: "Felt that you were unable to control the important things in your life?", reverse: false },
  { text: "Felt nervous and stressed?", reverse: false },
  { text: "Felt confident about your ability to handle your personal problems?", reverse: true },
  { text: "Felt that things were going your way?", reverse: true },
  { text: "Found that you could not cope with all the things that you had to do?", reverse: false },
  { text: "Been able to control irritations in your life?", reverse: true },
  { text: "Felt that you were on top of things?", reverse: true },
  { text: "Been angered because of things that were outside of your control?", reverse: false },
  { text: "Felt difficulties were piling up so high that you could not overcome them?", reverse: false }
];

const options = [
  { value: "0", label: "Never" },
  { value: "1", label: "Almost never" },
  { value: "2", label: "Sometimes" },
  { value: "3", label: "Fairly often" },
  { value: "4", label: "Very often" }
];

export default function PSS() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: value }));
  };

  const calculateScore = () => {
    let total = 0;
    Object.entries(answers).forEach(([index, value]) => {
      const questionIndex = parseInt(index);
      const score = parseInt(value);
      // Reverse scoring for positive items
      if (questions[questionIndex].reverse) {
        total += 4 - score;
      } else {
        total += score;
      }
    });
    return total;
  };

  const getInterpretation = (score: number) => {
    if (score <= 13) return { severity: "Low Stress", color: "text-success", description: "You are experiencing low levels of stress" };
    if (score <= 26) return { severity: "Moderate Stress", color: "text-warning", description: "You are experiencing moderate stress levels" };
    return { severity: "High Stress", color: "text-destructive", description: "You are experiencing high levels of perceived stress" };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(answers).length === questions.length) {
      setShowResults(true);
    }
  };

  const resetTest = () => {
    setAnswers({});
    setShowResults(false);
  };

  const score = calculateScore();
  const interpretation = getInterpretation(score);
  const isComplete = Object.keys(answers).length === questions.length;

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
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-3xl">Perceived Stress Scale (PSS-10)</CardTitle>
            </div>
            <CardDescription>
              In the last month, how often have you...
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showResults ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                {questions.map((question, index) => (
                  <Card key={index} className="border-muted">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base font-medium">
                        {index + 1}. {question.text}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup
                        value={answers[index]}
                        onValueChange={(value) => handleAnswerChange(index, value)}
                      >
                        {options.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2 mb-2">
                            <RadioGroupItem value={option.value} id={`q${index}-${option.value}`} />
                            <Label htmlFor={`q${index}-${option.value}`} className="cursor-pointer">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </CardContent>
                  </Card>
                ))}

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full"
                  disabled={!isComplete}
                >
                  Calculate Results
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <div className="text-5xl font-bold text-primary">{score}</div>
                      <div className="text-xl">Total Score (0-40)</div>
                      <div className={`text-2xl font-semibold ${interpretation.color}`}>
                        {interpretation.severity}
                      </div>
                      <p className="text-muted-foreground">{interpretation.description}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Score Interpretation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>• 0-13: Low perceived stress</p>
                    <p>• 14-26: Moderate perceived stress</p>
                    <p>• 27-40: High perceived stress</p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30 border-primary/20">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">
                      ⚠️ <strong>Important:</strong> This scale measures your perception of stress, not the presence of specific stressors. 
                      If you're experiencing high stress levels, consider stress management techniques or consulting a healthcare professional.
                    </p>
                  </CardContent>
                </Card>

                <Button onClick={resetTest} variant="outline" className="w-full">
                  Take Test Again
                </Button>
              </div>
            )}

            <Card className="mt-6 bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg">About PSS-10</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Most widely used psychological instrument for measuring stress</p>
                <p>• Measures the degree to which situations are appraised as stressful</p>
                <p>• Considers unpredictability, uncontrollability, and overload</p>
                <p>• Higher scores indicate greater perceived stress</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
