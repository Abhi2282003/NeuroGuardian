import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Target, Heart } from "lucide-react";

interface TechniqueDetailProps {
  technique: any;
  onBack: () => void;
}

export const TechniqueDetail = ({ technique, onBack }: TechniqueDetailProps) => {
  if (!technique) return null;

  const IconComponent = technique.icon;

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Techniques
              </Button>
              <Badge variant="outline">{technique.category}</Badge>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-4 rounded-xl bg-${technique.color}/10`}>
                <IconComponent className={`w-8 h-8 text-${technique.color}`} />
              </div>
              <div>
                <CardTitle className="text-3xl">{technique.title}</CardTitle>
                <p className="text-muted-foreground text-lg mt-2">{technique.description}</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* What it is */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">What it is</h3>
              </div>
              <p className="text-foreground leading-relaxed pl-10">
                {technique.details.what}
              </p>
            </div>

            {/* How to do it */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-healing-green/10">
                  <Target className="w-5 h-5 text-healing-green" />
                </div>
                <h3 className="text-xl font-semibold">How to practice</h3>
              </div>
              <p className="text-foreground leading-relaxed pl-10">
                {technique.details.how}
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-peaceful-lavender/10">
                  <Heart className="w-5 h-5 text-peaceful-lavender" />
                </div>
                <h3 className="text-xl font-semibold">How it helps</h3>
              </div>
              <p className="text-foreground leading-relaxed pl-10">
                {technique.details.benefits}
              </p>
            </div>

            {/* Additional guidance based on technique */}
            {technique.id === 'imagery' && (
              <div className="bg-gradient-secondary p-6 rounded-lg">
                <h4 className="font-semibold text-accent-foreground mb-3">Visualization Ideas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-accent-foreground/80">
                  <div>
                    <strong>Beach Scene:</strong> Warm sand, gentle waves, ocean breeze, seagulls in the distance
                  </div>
                  <div>
                    <strong>Forest Path:</strong> Dappled sunlight, rustling leaves, bird songs, fresh pine scent
                  </div>
                  <div>
                    <strong>Mountain Lake:</strong> Still water, snow-capped peaks, crisp air, peaceful silence
                  </div>
                  <div>
                    <strong>Garden Sanctuary:</strong> Blooming flowers, gentle stream, warm sunshine, butterflies
                  </div>
                </div>
              </div>
            )}

            {technique.id === 'pmr' && (
              <div className="bg-gradient-secondary p-6 rounded-lg">
                <h4 className="font-semibold text-accent-foreground mb-3">Muscle Group Sequence</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-accent-foreground/80">
                  {[
                    'Forehead and scalp',
                    'Eyes and cheeks', 
                    'Jaw and neck',
                    'Shoulders and arms',
                    'Hands and fingers',
                    'Chest and upper back',
                    'Abdomen',
                    'Lower back and hips',
                    'Thighs and glutes',
                    'Calves and feet'
                  ].map((group, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-accent-foreground/20 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      {group}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Call to action */}
            <div className="text-center p-6 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold mb-2">Ready to practice?</h4>
              <p className="text-muted-foreground mb-4">
                Start with just 5-10 minutes daily and gradually increase as you become more comfortable.
              </p>
              <Button className="bg-gradient-primary" onClick={onBack}>
                Explore More Techniques
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};