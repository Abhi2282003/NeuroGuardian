import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Wine } from 'lucide-react';

const questions = [
  {
    text: "How often do you have a drink containing alcohol?",
    options: [
      { value: "0", label: "Never" },
      { value: "1", label: "Monthly or less" },
      { value: "2", label: "2-4 times a month" },
      { value: "3", label: "2-3 times a week" },
      { value: "4", label: "4+ times a week" }
    ]
  },
  {
    text: "How many standard drinks do you have on a typical day when drinking?",
    options: [
      { value: "0", label: "1 or 2" },
      { value: "1", label: "3 or 4" },
      { value: "2", label: "5 or 6" },
      { value: "3", label: "7 to 9" },
      { value: "4", label: "10 or more" }
    ]
  },
  {
    text: "How often do you have six or more drinks on one occasion?",
    options: [
      { value: "0", label: "Never" },
      { value: "1", label: "Less than monthly" },
      { value: "2", label: "Monthly" },
      { value: "3", label: "Weekly" },
      { value: "4", label: "Daily or almost daily" }
    ]
  },
  {
    text: "During the past year, how often have you found that you were not able to stop drinking once you had started?",
    options: [
      { value: "0", label: "Never" },
      { value: "1", label: "Less than monthly" },
      { value: "2", label: "Monthly" },
      { value: "3", label: "Weekly" },
      { value: "4", label: "Daily or almost daily" }
    ]
  },
  {
    text: "During the past year, how often have you failed to do what was normally expected of you because of drinking?",
    options: [
      { value: "0", label: "Never" },
      { value: "1", label: "Less than monthly" },
      { value: "2", label: "Monthly" },
      { value: "3", label: "Weekly" },
      { value: "4", label: "Daily or almost daily" }
    ]
  },
  {
    text: "During the past year, how often have you needed a drink in the morning to get yourself going after a heavy drinking session?",
    options: [
      { value: "0", label: "Never" },
      { value: "1", label: "Less than monthly" },
      { value: "2", label: "Monthly" },
      { value: "3", label: "Weekly" },
      { value: "4", label: "Daily or almost daily" }
    ]
  },
  {
    text: "During the past year, how often have you had a feeling of guilt or remorse after drinking?",
    options: [
      { value: "0", label: "Never" },
      { value: "1", label: "Less than monthly" },
      { value: "2", label: "Monthly" },
      { value: "3", label: "Weekly" },
      { value: "4", label: "Daily or almost daily" }
    ]
  },
  {
    text: "During the past year, have you been unable to remember what happened the night before because of your drinking?",
    options: [
      { value: "0", label: "Never" },
      { value: "1", label: "Less than monthly" },
      { value: "2", label: "Monthly" },
      { value: "3", label: "Weekly" },
      { value: "4", label: "Daily or almost daily" }
    ]
  },
  {
    text: "Have you or someone else been injured because of your drinking?",
    options: [
      { value: "0", label: "No" },
      { value: "2", label: "Yes, but not in the past year" },
      { value: "4", label: "Yes, during the past year" }
    ]
  },
  {
    text: "Has a relative, friend, doctor, or health care worker been concerned about your drinking or suggested you cut down?",
    options: [
      { value: "0", label: "No" },
      { value: "2", label: "Yes, but not in the past year" },
      { value: "4", label: "Yes, during the past year" }
    ]
  }
];

export default function AUDIT() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: value }));
  };

  const calculateScore = () => {
    return Object.values(answers).reduce((sum, val) => sum + parseInt(val), 0);
  };

  const getInterpretation = (score: number) => {
    if (score <= 7) return { 
      severity: "Low Risk", 
      color: "text-success", 
      description: "Low risk of alcohol-related problems",
      recommendation: "Continue with current alcohol use patterns"
    };
    if (score <= 15) return { 
      severity: "Hazardous", 
      color: "text-warning", 
      description: "Hazardous or harmful alcohol consumption",
      recommendation: "Consider reducing alcohol intake and seeking brief counseling"
    };
    if (score <= 19) return { 
      severity: "Harmful", 
      color: "text-destructive", 
      description: "Harmful level of alcohol consumption",
      recommendation: "Professional evaluation and brief intervention recommended"
    };
    return { 
      severity: "Dependent", 
      color: "text-destructive", 
      description: "Possible alcohol dependence",
      recommendation: "Seek professional evaluation and treatment"
    };
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
                <Wine className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-3xl">AUDIT Screening Test</CardTitle>
            </div>
            <CardDescription>
              Alcohol Use Disorders Identification Test - Answer honestly about your alcohol consumption
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
                        {question.options.map((option) => (
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
                    <CardTitle className="text-lg">Recommendation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{interpretation.recommendation}</p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Score Interpretation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>• 0-7: Low risk</p>
                    <p>• 8-15: Hazardous or harmful alcohol consumption</p>
                    <p>• 16-19: Harmful alcohol consumption</p>
                    <p>• 20-40: Possible alcohol dependence</p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30 border-primary/20">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">
                      ⚠️ <strong>Important:</strong> This is a screening tool developed by WHO. 
                      A score of 8 or more indicates hazardous or harmful alcohol consumption. 
                      Consider consulting a healthcare professional for further evaluation and support.
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
                <CardTitle className="text-lg">About AUDIT</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Developed by World Health Organization (WHO)</p>
                <p>• Most widely used screening tool for hazardous alcohol use</p>
                <p>• Valid across cultures and settings</p>
                <p>• Useful for identifying early-stage alcohol problems</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
