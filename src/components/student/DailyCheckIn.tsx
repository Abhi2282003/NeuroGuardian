import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Smile, Frown, Meh, Brain, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const moodIcons = [
  { icon: Frown, label: "Very Sad", color: "text-red-500" },
  { icon: Frown, label: "Sad", color: "text-orange-500" },
  { icon: Meh, label: "Okay", color: "text-yellow-500" },
  { icon: Smile, label: "Good", color: "text-lime-500" },
  { icon: Smile, label: "Great", color: "text-green-500" },
];

export function DailyCheckIn({ onComplete }: { onComplete?: () => void }) {
  const { toast } = useToast();
  const [mood, setMood] = useState(2);
  const [stress, setStress] = useState(2);
  const [sleepHours, setSleepHours] = useState(7);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({ title: "Error", description: "Please log in", variant: "destructive" });
        return;
      }

      const { error } = await supabase.from("daily_check_ins").insert({
        user_id: user.id,
        mood,
        stress,
        sleep_hours: sleepHours,
        notes: notes.trim() || null,
      });

      if (error) {
        if (error.code === "23505") {
          toast({ 
            title: "Already Checked In", 
            description: "You've already completed your check-in today! Come back tomorrow.",
            variant: "destructive" 
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Check-in Complete! 🎉",
        description: "Your daily wellness data has been saved.",
      });

      // Reset form
      setMood(2);
      setStress(2);
      setSleepHours(7);
      setNotes("");
      
      onComplete?.();
    } catch (error) {
      console.error("Check-in error:", error);
      toast({ 
        title: "Error", 
        description: "Failed to save check-in. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const MoodIcon = moodIcons[mood].icon;

  return (
    <Card className="p-6 glass-card animate-fade-in">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Daily Wellness Check-In
          </h3>
          <p className="text-muted-foreground">How are you feeling today?</p>
        </div>

        {/* Mood Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex items-center gap-2">
              <MoodIcon className={`h-5 w-5 ${moodIcons[mood].color}`} />
              Mood: {moodIcons[mood].label}
            </Label>
          </div>
          <Slider
            value={[mood]}
            onValueChange={(v) => setMood(v[0])}
            max={4}
            step={1}
            className="mood-slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>Very Sad</span>
            <span>Great</span>
          </div>
        </div>

        {/* Stress Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Brain className={`h-5 w-5 ${stress > 2 ? 'text-orange-500' : 'text-green-500'}`} />
              Stress Level: {stress}/4
            </Label>
          </div>
          <Slider
            value={[stress]}
            onValueChange={(v) => setStress(v[0])}
            max={4}
            step={1}
            className="stress-slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>Very Low</span>
            <span>Very High</span>
          </div>
        </div>

        {/* Sleep Hours */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Moon className={`h-5 w-5 ${sleepHours < 6 ? 'text-red-500' : 'text-blue-500'}`} />
              Sleep: {sleepHours} hours
            </Label>
          </div>
          <Slider
            value={[sleepHours]}
            onValueChange={(v) => setSleepHours(v[0])}
            max={12}
            min={0}
            step={0.5}
          />
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>0 hrs</span>
            <span>12 hrs</span>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-base font-semibold">
            How are you feeling? (Optional)
          </Label>
          <Textarea
            id="notes"
            placeholder="Share any thoughts, concerns, or highlights from your day..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? "Saving..." : "Complete Check-In"}
        </Button>
      </div>
    </Card>
  );
}