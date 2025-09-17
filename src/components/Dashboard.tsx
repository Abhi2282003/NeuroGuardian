import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Calendar, TrendingUp, Target, Clock, Award, BarChart3 } from "lucide-react";

interface DashboardProps {
  onBack: () => void;
}

interface ActivityLog {
  id: string;
  technique: string;
  duration: number; // in minutes
  date: Date;
  completed: boolean;
  rating?: number; // 1-5 scale
}

interface DailyStats {
  date: string;
  totalMinutes: number;
  sessionsCompleted: number;
  techniques: string[];
}

// Mock data - in a real app, this would come from a database
const generateMockData = (): ActivityLog[] => {
  const techniques = ['Deep Breathing', 'Mindfulness Meditation', 'Progressive Muscle Relaxation', 'Guided Imagery'];
  const logs: ActivityLog[] = [];
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Generate 0-3 sessions per day
    const sessionsToday = Math.floor(Math.random() * 4);
    
    for (let j = 0; j < sessionsToday; j++) {
      logs.push({
        id: `${i}-${j}`,
        technique: techniques[Math.floor(Math.random() * techniques.length)],
        duration: Math.floor(Math.random() * 20) + 5, // 5-25 minutes
        date: new Date(date),
        completed: Math.random() > 0.1, // 90% completion rate
        rating: Math.floor(Math.random() * 5) + 1
      });
    }
  }
  
  return logs.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const Dashboard = ({ onBack }: DashboardProps) => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  
  useEffect(() => {
    // In a real app, this would fetch from localStorage or a database
    const logs = generateMockData();
    setActivityLogs(logs);
  }, []);

  // Calculate statistics
  const now = new Date();
  const periodDays = selectedPeriod === 'week' ? 7 : 30;
  const cutoffDate = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000));
  
  const recentLogs = activityLogs.filter(log => log.date >= cutoffDate);
  const completedSessions = recentLogs.filter(log => log.completed);
  
  const totalMinutes = completedSessions.reduce((sum, log) => sum + log.duration, 0);
  const averageRating = completedSessions.length > 0 
    ? completedSessions.reduce((sum, log) => sum + (log.rating || 0), 0) / completedSessions.length 
    : 0;
  
  // Group by technique
  const techniqueStats = completedSessions.reduce((acc, log) => {
    acc[log.technique] = (acc[log.technique] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Daily streak calculation
  const dailyStats: DailyStats[] = [];
  for (let i = 0; i < periodDays; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayStr = date.toISOString().split('T')[0];
    
    const dayLogs = completedSessions.filter(log => 
      log.date.toISOString().split('T')[0] === dayStr
    );
    
    dailyStats.push({
      date: dayStr,
      totalMinutes: dayLogs.reduce((sum, log) => sum + log.duration, 0),
      sessionsCompleted: dayLogs.length,
      techniques: [...new Set(dayLogs.map(log => log.technique))]
    });
  }
  
  const currentStreak = calculateStreak(dailyStats);
  const weeklyGoal = 5; // sessions per week
  const monthlyGoal = 20; // sessions per month
  const currentGoal = selectedPeriod === 'week' ? weeklyGoal : monthlyGoal;
  const goalProgress = (completedSessions.length / currentGoal) * 100;

  function calculateStreak(stats: DailyStats[]): number {
    let streak = 0;
    for (const day of stats.reverse()) {
      if (day.sessionsCompleted > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-6xl mx-auto shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Techniques
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant={selectedPeriod === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod('week')}
                >
                  This Week
                </Button>
                <Button 
                  variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod('month')}
                >
                  This Month
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-primary/10">
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-3xl">Progress Dashboard</CardTitle>
                <p className="text-muted-foreground text-lg mt-2">
                  Track your mindfulness journey and celebrate your progress
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center bg-gradient-to-br from-calm-blue/10 to-calm-blue/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center mb-3">
                    <Clock className="w-8 h-8 text-calm-blue" />
                  </div>
                  <div className="text-2xl font-bold text-calm-blue mb-1">
                    {totalMinutes}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Minutes Practiced
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center bg-gradient-to-br from-healing-green/10 to-healing-green/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center mb-3">
                    <Target className="w-8 h-8 text-healing-green" />
                  </div>
                  <div className="text-2xl font-bold text-healing-green mb-1">
                    {completedSessions.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Sessions Completed
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center bg-gradient-to-br from-peaceful-lavender/10 to-peaceful-lavender/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center mb-3">
                    <Award className="w-8 h-8 text-peaceful-lavender" />
                  </div>
                  <div className="text-2xl font-bold text-peaceful-lavender mb-1">
                    {currentStreak}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Day Streak
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center bg-gradient-to-br from-soft-mint/10 to-soft-mint/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center mb-3">
                    <TrendingUp className="w-8 h-8 text-soft-mint" />
                  </div>
                  <div className="text-2xl font-bold text-soft-mint mb-1">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Average Rating
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Goal Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  {selectedPeriod === 'week' ? 'Weekly' : 'Monthly'} Goal Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>{completedSessions.length} of {currentGoal} sessions</span>
                    <span className={goalProgress >= 100 ? 'text-healing-green font-semibold' : 'text-muted-foreground'}>
                      {Math.round(goalProgress)}%
                    </span>
                  </div>
                  <Progress value={Math.min(goalProgress, 100)} className="h-3" />
                  {goalProgress >= 100 && (
                    <div className="text-center text-healing-green font-medium">
                      🎉 Goal achieved! Excellent work!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Technique Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Technique Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(techniqueStats)
                    .sort(([,a], [,b]) => b - a)
                    .map(([technique, count]) => (
                      <div key={technique} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{technique}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-muted rounded-full h-2">
                            <div 
                              className="bg-gradient-primary h-2 rounded-full transition-all"
                              style={{ 
                                width: `${(count / Math.max(...Object.values(techniqueStats))) * 100}%` 
                              }}
                            />
                          </div>
                          <Badge variant="secondary" className="min-w-[3rem] text-center">
                            {count}
                          </Badge>
                        </div>
                      </div>
                    ))
                  }
                  {Object.keys(techniqueStats).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No sessions completed in this period yet. Start your mindfulness journey today!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          log.completed ? 'bg-healing-green' : 'bg-muted-foreground'
                        }`} />
                        <div>
                          <div className="font-medium">{log.technique}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(log.date)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{log.duration} min</div>
                        {log.rating && (
                          <div className="text-xs text-muted-foreground">
                            {'★'.repeat(log.rating)}{'☆'.repeat(5 - log.rating)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {recentLogs.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">
                      No activity recorded yet. Complete a session to see your progress here!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Motivational Message */}
            {completedSessions.length > 0 && (
              <Card className="bg-gradient-primary text-white">
                <CardContent className="pt-6 text-center">
                  <h3 className="text-xl font-semibold mb-2">Keep Going! 🌟</h3>
                  <p className="opacity-90">
                    You've practiced mindfulness for {totalMinutes} minutes {selectedPeriod === 'week' ? 'this week' : 'this month'}. 
                    Every session contributes to your mental well-being and resilience.
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};