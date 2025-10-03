import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Activity } from 'lucide-react';

const questions = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it's hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen"
];

const options = [
  { value: "0", label: "Not at all" },
  { value: "1", label: "Several days" },
  { value: "2", label: "More than half the days" },
  { value: "3", label: "Nearly every day" }
];

export default function GAD7() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: value }));
  };

  const calculateScore = () => {
    return Object.values(answers).reduce((sum, val) => sum + parseInt(val), 0);
  };

  const getInterpretation = (score: number) => {
    if (score <= 4) return { severity: "Minimal", color: "text-success", description: "Minimal anxiety" };
    if (score <= 9) return { severity: "Mild", color: "text-primary", description: "Mild anxiety" };
    if (score <= 14) return { severity: "Moderate", color: "text-warning", description: "Moderate anxiety" };
    return { severity: "Severe", color: "text-destructive", description: "Severe anxiety" };
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
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-3xl">GAD-7 Anxiety Assessment</CardTitle>
            </div>
            <CardDescription>
              Over the last 2 weeks, how often have you been bothered by the following problems?
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showResults ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                {questions.map((question, index) => (
                  <Card key={index} className="border-muted">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base font-medium">
                        {index + 1}. {question}
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
                      <div className="text-xl">Total Score</div>
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
                    <p>• 0-4: Minimal anxiety</p>
                    <p>• 5-9: Mild anxiety</p>
                    <p>• 10-14: Moderate anxiety</p>
                    <p>• 15-21: Severe anxiety</p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30 border-primary/20">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">
                      ⚠️ <strong>Important:</strong> This is a screening tool, not a diagnostic instrument. 
                      If you scored 10 or higher, consider consulting a mental health professional for a comprehensive evaluation.
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
                <CardTitle className="text-lg">About GAD-7</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Valid and reliable screening tool for generalized anxiety disorder</p>
                <p>• Can also detect panic disorder, social anxiety, and PTSD</p>
                <p>• Widely used in clinical and research settings</p>
                <p>• Useful for monitoring anxiety severity over time</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
