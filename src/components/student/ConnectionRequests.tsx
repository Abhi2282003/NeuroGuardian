import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Check, X, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface ConnectionRequest {
  id: string;
  counsellor_id: string;
  message: string;
  status: string;
  created_at: string;
  counsellor_profile?: {
    name: string;
    role: string;
  };
}

export function ConnectionRequests({ onUpdate }: { onUpdate?: () => void }) {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
    subscribeToRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("connection_requests")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      const requestsWithProfiles = await Promise.all(
        (data || []).map(async (request) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name, role")
            .eq("id", request.counsellor_id)
            .single();

          return {
            ...request,
            counsellor_profile: profile || { name: "Unknown", role: "patient" },
          };
        })
      );

      setRequests(requestsWithProfiles);
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToRequests = () => {
    const channel = supabase
      .channel("connection_requests_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "connection_requests",
        },
        () => {
          loadRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleResponse = async (requestId: string, status: "accepted" | "declined") => {
    try {
      const { error } = await supabase
        .from("connection_requests")
        .update({
          status,
          responded_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: status === "accepted" ? "Connection Accepted" : "Request Declined",
        description:
          status === "accepted"
            ? "You can now chat with this counsellor/volunteer"
            : "The request has been declined",
      });

      loadRequests();
      onUpdate?.();
    } catch (error) {
      console.error("Error responding to request:", error);
      toast({
        title: "Error",
        description: "Failed to respond to request",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="p-6 glass-card">
        <div className="text-center space-y-2">
          <UserCircle className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-semibold">No Connection Requests</h3>
          <p className="text-muted-foreground">
            Counsellors and volunteers will reach out when they notice you might need support
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id} className="p-6 glass-card animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <UserCircle className="h-8 w-8 text-primary" />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">
                    {request.counsellor_profile?.role === "doctor"
                      ? "Counsellor"
                      : "Peer Volunteer"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                  </p>
                </div>
                <Badge
                  variant={
                    request.status === "accepted"
                      ? "default"
                      : request.status === "declined"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {request.status}
                </Badge>
              </div>

              <p className="text-sm">{request.message}</p>

              {request.status === "pending" && (
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    onClick={() => handleResponse(request.id, "accepted")}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Accept & Chat
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResponse(request.id, "declined")}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                </div>
              )}

              {request.status === "accepted" && (
                <Badge variant="default" className="mt-2">
                  <Check className="h-3 w-3 mr-1" />
                  Connected - Check Messages tab
                </Badge>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}