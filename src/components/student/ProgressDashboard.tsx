import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Flame, Moon, Brain, TrendingUp } from "lucide-react";
import { format, subDays } from "date-fns";

interface CheckInData {
  check_date: string;
  mood: number;
  stress: number;
  sleep_hours: number;
}

export function ProgressDashboard() {
  const [checkIns, setCheckIns] = useState<CheckInData[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCheckIns();
  }, []);

  const loadCheckIns = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const thirtyDaysAgo = subDays(new Date(), 30).toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("daily_check_ins")
        .select("check_date, mood, stress, sleep_hours")
        .eq("user_id", user.id)
        .gte("check_date", thirtyDaysAgo)
        .order("check_date", { ascending: true });

      if (error) throw error;

      setCheckIns(data || []);
      calculateStreak(data || []);
    } catch (error) {
      console.error("Error loading check-ins:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (data: CheckInData[]) => {
    if (data.length === 0) {
      setStreak(0);
      return;
    }

    let currentStreak = 1;
    const today = new Date().toISOString().split('T')[0];
    const sortedData = [...data].sort((a, b) => 
      new Date(b.check_date).getTime() - new Date(a.check_date).getTime()
    );

    if (sortedData[0].check_date !== today) {
      setStreak(0);
      return;
    }

    for (let i = 1; i < sortedData.length; i++) {
      const prevDate = new Date(sortedData[i - 1].check_date);
      const currDate = new Date(sortedData[i].check_date);
      const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }

    setStreak(currentStreak);
  };

  const chartData = checkIns.map((item) => ({
    date: format(new Date(item.check_date), "MMM dd"),
    mood: item.mood,
    stress: item.stress,
    sleep: item.sleep_hours,
  }));

  const avgMood = checkIns.length > 0 
    ? (checkIns.reduce((sum, item) => sum + item.mood, 0) / checkIns.length).toFixed(1)
    : "0.0";

  const avgStress = checkIns.length > 0
    ? (checkIns.reduce((sum, item) => sum + item.stress, 0) / checkIns.length).toFixed(1)
    : "0.0";

  const avgSleep = checkIns.length > 0
    ? (checkIns.reduce((sum, item) => sum + item.sleep_hours, 0) / checkIns.length).toFixed(1)
    : "0.0";

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (checkIns.length === 0) {
    return (
      <Card className="p-6 glass-card">
        <div className="text-center space-y-2">
          <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-semibold">No Data Yet</h3>
          <p className="text-muted-foreground">Complete your first daily check-in to see your progress!</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 glass-card hover-scale">
          <div className="flex items-center gap-3">
            <Flame className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Streak</p>
              <p className="text-2xl font-bold">{streak} days</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 glass-card hover-scale">
          <div className="flex items-center gap-3">
            <div className="text-2xl">😊</div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Mood</p>
              <p className="text-2xl font-bold">{avgMood}/4</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 glass-card hover-scale">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Stress</p>
              <p className="text-2xl font-bold">{avgStress}/4</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 glass-card hover-scale">
          <div className="flex items-center gap-3">
            <Moon className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Sleep</p>
              <p className="text-2xl font-bold">{avgSleep}h</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Mood & Stress Chart */}
      <Card className="p-6 glass-card">
        <h3 className="text-lg font-semibold mb-4">Mood & Stress Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 4]} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="mood" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Mood"
            />
            <Line 
              type="monotone" 
              dataKey="stress" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={2}
              name="Stress"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Sleep Chart */}
      <Card className="p-6 glass-card">
        <h3 className="text-lg font-semibold mb-4">Sleep Pattern</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 12]} />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="sleep" 
              stroke="hsl(var(--chart-5))" 
              fill="hsl(var(--chart-5))" 
              fillOpacity={0.3}
              name="Sleep Hours"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}