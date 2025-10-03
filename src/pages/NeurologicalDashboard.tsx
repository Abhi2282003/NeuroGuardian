import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Activity, Clock, TrendingUp, FileText, Target, AlertCircle, LogOut } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function NeurologicalDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentTests, setRecentTests] = useState<any[]>([]);

  useEffect(() => {
    loadProfile();
    loadRecentTests();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(profileData);
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const loadRecentTests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: sessions } = await supabase
        .from("sessions")
        .select("*, activity_results(*)")
        .eq("created_by", user.id)
        .order("started_at", { ascending: false })
        .limit(5);

      setRecentTests(sessions || []);
    } catch (error) {
      console.error("Error loading tests:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const mockProgressData = [
    { date: "Week 1", cognitive: 65, motor: 70, memory: 60 },
    { date: "Week 2", cognitive: 68, motor: 72, memory: 65 },
    { date: "Week 3", cognitive: 72, motor: 75, memory: 68 },
    { date: "Week 4", cognitive: 75, motor: 78, memory: 72 },
  ];

  const assessmentCards = [
    {
      title: "EEG Monitoring",
      description: "Brain wave activity tracking",
      icon: Activity,
      route: "/bioamp",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Trail Making Test",
      description: "Visual attention & cognitive flexibility",
      icon: Target,
      route: "/screening/trail-making",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Memory Assessment",
      description: "Short-term memory evaluation",
      icon: Brain,
      route: "/screening/memory",
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Stroop Test",
      description: "Processing speed & attention",
      icon: Clock,
      route: "/screening/stroop",
      color: "text-cyan-bright",
      bgColor: "bg-cyan-dim/20",
    },
    {
      title: "Motor Function",
      description: "Finger tapping coordination",
      icon: TrendingUp,
      route: "/screening/finger-tap",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Motor Coordination",
      description: "Spiral drawing test",
      icon: FileText,
      route: "/screening/spiral",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">NeuroGuardian</h1>
              <p className="text-sm text-muted-foreground">Neurological Patient Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium text-foreground">{profile?.name}</p>
              <p className="text-sm text-muted-foreground">Patient</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {profile?.name}
          </h2>
          <p className="text-muted-foreground">
            Track your neurological health and complete assessments
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{recentTests.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Completed this month</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">EEG Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground mt-1">Total recordings</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">72%</div>
              <p className="text-xs text-muted-foreground mt-1">Cognitive performance</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">+8%</div>
              <p className="text-xs text-muted-foreground mt-1">vs. last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Assessment Cards */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">Neurological Assessments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assessmentCards.map((card, index) => (
              <Card 
                key={index}
                className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer hover:shadow-card"
                onClick={() => navigate(card.route)}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center mb-3`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <CardTitle className="text-foreground">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Start Assessment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Progress Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Cognitive Progress Trends</CardTitle>
              <CardDescription>Track your performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={mockProgressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Line type="monotone" dataKey="cognitive" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="motor" stroke="hsl(var(--accent))" strokeWidth={2} />
                  <Line type="monotone" dataKey="memory" stroke="hsl(var(--success))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Assessment Performance</CardTitle>
              <CardDescription>Latest scores by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mockProgressData[mockProgressData.length - 1] ? [mockProgressData[mockProgressData.length - 1]] : []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar dataKey="cognitive" fill="hsl(var(--primary))" />
                  <Bar dataKey="motor" fill="hsl(var(--accent))" />
                  <Bar dataKey="memory" fill="hsl(var(--success))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Activity</CardTitle>
            <CardDescription>Your latest assessment sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTests.length > 0 ? (
              <div className="space-y-3">
                {recentTests.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Assessment Session</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(test.started_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">View Details</Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No recent assessments</p>
                <p className="text-sm text-muted-foreground mt-1">Start your first assessment above</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
