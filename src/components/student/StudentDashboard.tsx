import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DailyCheckIn } from "./DailyCheckIn";
import { ProgressDashboard } from "./ProgressDashboard";
import { AIAssistant } from "./AIAssistant";
import { ConnectionRequests } from "./ConnectionRequests";
import { BrowseCounsellors } from "./BrowseCounsellors";
import { SecureChat } from "./SecureChat";
import { Brain, Activity, MessageCircle, Calendar, Heart, AlertCircle, GamepadIcon, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function StudentDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  const [defaultTab, setDefaultTab] = useState(tabParam || 'checkin');
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [activeConnections, setActiveConnections] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkTodayCheckIn();
    loadConnectionData();
    
    // Update tab when URL changes
    const tabParam = new URLSearchParams(location.search).get('tab');
    if (tabParam) {
      setDefaultTab(tabParam);
    }
  }, [location.search]);

  const checkTodayCheckIn = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from("daily_check_ins")
        .select("id")
        .eq("user_id", user.id)
        .eq("check_date", today)
        .maybeSingle();

      setHasCheckedInToday(!!data);
    } catch (error) {
      console.error("Error checking today's check-in:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadConnectionData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Count pending requests
      const { count: pending } = await supabase
        .from("connection_requests")
        .select("*", { count: 'exact', head: true })
        .eq("student_id", user.id)
        .eq("status", "pending");

      // Count active connections
      const { count: active } = await supabase
        .from("connection_requests")
        .select("*", { count: 'exact', head: true })
        .eq("student_id", user.id)
        .eq("status", "accepted");

      setPendingRequests(pending || 0);
      setActiveConnections(active || 0);
    } catch (error) {
      console.error("Error loading connection data:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Student Wellness Portal
          </h1>
          <p className="text-muted-foreground">Track your mental health journey and connect with support when needed</p>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* Check-in Reminder */}
      {!hasCheckedInToday && (
        <Card className="p-6 border-primary/50 bg-primary/5 animate-fade-in">
          <div className="flex items-center gap-4">
            <AlertCircle className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <h3 className="font-semibold">Complete Your Daily Check-In</h3>
              <p className="text-sm text-muted-foreground">
                Share how you're feeling today to help us support you better
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Link to="/screening">
          <Card className="p-4 glass-card hover-scale cursor-pointer">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Mental Health</p>
                <p className="font-semibold">Screening Tests</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/bioamp">
          <Card className="p-4 glass-card hover-scale cursor-pointer">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">EEG</p>
                <p className="font-semibold">Brain Monitoring</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/wellness">
          <Card className="p-4 glass-card hover-scale cursor-pointer">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-pink-500" />
              <div>
                <p className="text-sm text-muted-foreground">Mindfulness</p>
                <p className="font-semibold">Activities</p>
              </div>
            </div>
          </Card>
        </Link>

        <Card className="p-4 glass-card hover-scale">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Support</p>
              <p className="font-semibold">{activeConnections} Active Chats</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 glass-card hover-scale">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Requests</p>
              <p className="font-semibold">{pendingRequests} Pending</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={defaultTab} onValueChange={setDefaultTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="checkin">
            <Heart className="h-4 w-4 mr-2" />
            Check-In
          </TabsTrigger>
          <TabsTrigger value="progress">
            <Activity className="h-4 w-4 mr-2" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Brain className="h-4 w-4 mr-2" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="browse">
            <Calendar className="h-4 w-4 mr-2" />
            Find Counsellor
          </TabsTrigger>
          <TabsTrigger value="requests">
            <Calendar className="h-4 w-4 mr-2" />
            Requests ({pendingRequests})
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageCircle className="h-4 w-4 mr-2" />
            Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checkin">
          <DailyCheckIn onComplete={() => {
            setHasCheckedInToday(true);
            checkTodayCheckIn();
          }} />
        </TabsContent>

        <TabsContent value="progress">
          <ProgressDashboard />
        </TabsContent>

        <TabsContent value="ai">
          <AIAssistant />
        </TabsContent>

        <TabsContent value="browse">
          <BrowseCounsellors />
        </TabsContent>

        <TabsContent value="requests">
          <ConnectionRequests 
            onUpdate={() => {
              loadConnectionData();
            }}
          />
        </TabsContent>

        <TabsContent value="chat">
          <SecureChat />
        </TabsContent>
      </Tabs>

      {/* Fun & Mind Games */}
      <Card className="p-6 glass-card">
        <h3 className="text-lg font-semibold mb-4">Fun & Mind Games</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/wellness">
            <Button variant="outline" className="w-full justify-start">
              <Heart className="h-4 w-4 mr-2" />
              Mindfulness Activities
            </Button>
          </Link>
          <Link to="/games">
            <Button variant="outline" className="w-full justify-start">
              <GamepadIcon className="h-4 w-4 mr-2" />
              Play Mind Games (10+)
            </Button>
          </Link>
          <Button variant="outline" className="w-full justify-start">
            <MessageCircle className="h-4 w-4 mr-2" />
            Crisis Helpline
          </Button>
        </div>
      </Card>
    </div>
  );
}