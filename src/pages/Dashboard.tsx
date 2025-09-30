import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Activity, Users, FileText, LogOut, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const activities = [
    {
      title: 'EEG Monitoring',
      description: 'Real-time brainwave analysis',
      icon: Activity,
      path: '/bioamp',
      color: 'text-cyan-400'
    },
    {
      title: 'Screening Tests',
      description: 'Neurological assessments',
      icon: Brain,
      path: '/screening',
      color: 'text-primary'
    },
    {
      title: 'Mindfulness',
      description: 'Meditation & relaxation',
      icon: Brain,
      path: '/wellness',
      color: 'text-success'
    }
  ];

  const roleSpecificActions = {
    admin: [
      { title: 'Manage Users', icon: Users, path: '/admin/users' },
      { title: 'Configure Thresholds', icon: FileText, path: '/admin/config' }
    ],
    doctor: [
      { title: 'Patient List', icon: Users, path: '/patients' },
      { title: 'Risk Analysis', icon: Brain, path: '/analysis' }
    ],
    health_worker: [
      { title: 'Quick Screening', icon: Play, path: '/screening/quick' },
      { title: 'Patient Registry', icon: Users, path: '/patients' }
    ],
    patient: [
      { title: 'My Progress', icon: FileText, path: '/progress' },
      { title: 'My Results', icon: Brain, path: '/results' }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <nav className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">NeuroScreen</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {profile?.name} ({profile?.role})
            </span>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome, {profile?.name}</h1>
          <p className="text-muted-foreground">
            {profile?.role === 'doctor' && 'Manage your patients and review screening results'}
            {profile?.role === 'health_worker' && 'Conduct quick screenings and manage patient data'}
            {profile?.role === 'patient' && 'Track your wellness journey and view your results'}
            {profile?.role === 'admin' && 'Configure system settings and manage users'}
          </p>
        </div>

        {/* Main Activities */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <Link key={index} to={activity.path}>
                <Card className="h-full shadow-card hover:shadow-gentle transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardHeader>
                    <Icon className={`h-12 w-12 ${activity.color} mb-4 group-hover:scale-110 transition-transform`} />
                    <CardTitle>{activity.title}</CardTitle>
                    <CardDescription>{activity.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-primary flex items-center gap-2">
                      Open →
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Role-Specific Actions */}
        {profile?.role && roleSpecificActions[profile.role as keyof typeof roleSpecificActions] && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {roleSpecificActions[profile.role as keyof typeof roleSpecificActions].map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link key={index} to={action.path}>
                    <Card className="hover:bg-accent/5 transition-colors cursor-pointer">
                      <CardHeader className="pb-3">
                        <Icon className="h-6 w-6 text-primary mb-2" />
                        <CardTitle className="text-base">{action.title}</CardTitle>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <Card className="mt-8 border-muted-foreground/20 bg-muted/10">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              ⚠️ This is a preliminary screening tool, not a diagnosis. Please seek professional medical advice.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
