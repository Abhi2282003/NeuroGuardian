import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, MessageCircle, AlertCircle, CheckCircle, X } from "lucide-react";

interface ConnectionRequest {
  id: string;
  student_id: string;
  message: string;
  status: string;
  created_at: string;
  profiles?: {
    name: string;
  };
}

export default function CounsellorDashboard() {
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCount, setActiveCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    loadRequests();
    loadStats();

    const channel = supabase
      .channel("connection_requests_counsellor")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "connection_requests"
        },
        () => {
          loadRequests();
          loadStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("connection_requests")
        .select("*")
        .eq("counsellor_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch student names separately
      if (data && data.length > 0) {
        const studentIds = [...new Set(data.map(req => req.student_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", studentIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        const requestsWithProfiles = data.map(req => ({
          ...req,
          profiles: profileMap.get(req.student_id)
        }));
        setRequests(requestsWithProfiles as any);
      } else {
        setRequests([]);
      }

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error loading requests:", error);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count: pending } = await supabase
        .from("connection_requests")
        .select("*", { count: "exact", head: true })
        .eq("counsellor_id", user.id)
        .eq("status", "pending");

      const { count: active } = await supabase
        .from("connection_requests")
        .select("*", { count: "exact", head: true })
        .eq("counsellor_id", user.id)
        .eq("status", "accepted");

      setPendingCount(pending || 0);
      setActiveCount(active || 0);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleResponse = async (requestId: string, status: "accepted" | "declined") => {
    try {
      const { error } = await supabase
        .from("connection_requests")
        .update({
          status,
          responded_at: new Date().toISOString()
        })
        .eq("id", requestId);

      if (error) throw error;

      toast.success(
        status === "accepted" 
          ? "Connection request accepted!" 
          : "Connection request declined"
      );
      loadRequests();
      loadStats();
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error("Failed to update request");
    }
  };

  const pendingRequests = requests.filter(r => r.status === "pending");
  const activeRequests = requests.filter(r => r.status === "accepted");
  const declinedRequests = requests.filter(r => r.status === "declined");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Counsellor Dashboard
        </h1>
        <p className="text-muted-foreground">Manage your student connections and support requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Pending Requests</p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Active Connections</p>
              <p className="text-2xl font-bold">{activeCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <p className="text-2xl font-bold">{requests.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            <AlertCircle className="h-4 w-4 mr-2" />
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="active">
            <CheckCircle className="h-4 w-4 mr-2" />
            Active ({activeCount})
          </TabsTrigger>
          <TabsTrigger value="declined">
            <X className="h-4 w-4 mr-2" />
            Declined ({declinedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No pending requests</p>
            </Card>
          ) : (
            pendingRequests.map((request) => (
              <Card key={request.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {request.profiles?.name || "Student"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge>Pending</Badge>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm">{request.message}</p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleResponse(request.id, "accepted")}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept
                    </Button>
                    <Button
                      onClick={() => handleResponse(request.id, "declined")}
                      variant="outline"
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeRequests.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No active connections</p>
            </Card>
          ) : (
            activeRequests.map((request) => (
              <Card key={request.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {request.profiles?.name || "Student"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Connected on {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline" asChild>
                    <a href={`/student?tab=chat`}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Open Chat
                    </a>
                  </Button>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="declined" className="space-y-4">
          {declinedRequests.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No declined requests</p>
            </Card>
          ) : (
            declinedRequests.map((request) => (
              <Card key={request.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {request.profiles?.name || "Student"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Declined on {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline">Declined</Badge>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
