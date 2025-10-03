import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserCircle, Building2, Send, CheckCircle, UserMinus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Counsellor {
  id: string;
  name: string;
  role: string;
  organization: string | null;
}

interface RequestStatus {
  [counsellorId: string]: 'pending' | 'accepted' | 'declined';
}

export function BrowseCounsellors() {
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCounsellor, setSelectedCounsellor] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [requestStatus, setRequestStatus] = useState<RequestStatus>({});
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadCounsellors();
    loadRequestStatus();
  }, []);

  const loadCounsellors = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, role, organization")
        .in("role", ["doctor", "volunteer"])
        .order("name");

      if (error) throw error;
      setCounsellors(data || []);
    } catch (error) {
      console.error("Error loading counsellors:", error);
      toast.error("Failed to load counsellors");
    } finally {
      setLoading(false);
    }
  };

  const loadRequestStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("connection_requests")
        .select("counsellor_id, status")
        .eq("student_id", user.id)
        .is("disconnected_at", null);

      if (error) throw error;

      const statusMap: RequestStatus = {};
      data?.forEach(req => {
        statusMap[req.counsellor_id] = req.status as 'pending' | 'accepted' | 'declined';
      });
      setRequestStatus(statusMap);
    } catch (error) {
      console.error("Error loading request status:", error);
    }
  };

  const handleSendRequest = async (counsellorId: string) => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("connection_requests")
        .insert({
          student_id: user.id,
          counsellor_id: counsellorId,
          message: message.trim(),
          status: "pending"
        });

      if (error) throw error;

      toast.success("Connection request sent!");
      setMessage("");
      setSelectedCounsellor(null);
      loadRequestStatus();
    } catch (error: any) {
      console.error("Error sending request:", error);
      toast.error(error.message || "Failed to send request");
    } finally {
      setSending(false);
    }
  };

  const handleDisconnect = async (counsellorId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("connection_requests")
        .update({ 
          disconnected_at: new Date().toISOString(),
          disconnected_by: user.id
        })
        .eq("student_id", user.id)
        .eq("counsellor_id", counsellorId)
        .eq("status", "accepted");

      if (error) throw error;

      toast.success("Disconnected from counsellor");
      loadRequestStatus();
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast.error("Failed to disconnect");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Connect with a Counsellor</h2>
        <p className="text-muted-foreground">
          Browse available counsellors and volunteers. Send a connection request to start a conversation.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {counsellors.map((counsellor) => {
          const status = requestStatus[counsellor.id];
          const isRequested = !!status;

          return (
            <Card key={counsellor.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <UserCircle className="h-12 w-12 text-primary" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{counsellor.name}</h3>
                    <Badge variant="outline" className="mt-1">
                      {counsellor.role === "doctor" ? "Counsellor" : "Volunteer"}
                    </Badge>
                    {counsellor.organization && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{counsellor.organization}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedCounsellor === counsellor.id ? (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Introduce yourself and explain why you'd like to connect..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSendRequest(counsellor.id)}
                        disabled={sending || !message.trim()}
                        className="flex-1"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Request
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedCounsellor(null);
                          setMessage("");
                        }}
                        disabled={sending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {status === "accepted" ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="w-full">
                            <UserMinus className="h-4 w-4 mr-2" />
                            Disconnect
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Disconnect from counsellor?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently end your connection with {counsellor.name}. You can always connect with a new counsellor later.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDisconnect(counsellor.id)}>
                              Disconnect
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : status === "pending" ? (
                      <Button disabled variant="outline" className="w-full">
                        Request Pending
                      </Button>
                    ) : status === "declined" ? (
                      <Button disabled variant="outline" className="w-full">
                        Request Declined
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setSelectedCounsellor(counsellor.id)}
                        className="w-full"
                      >
                        Send Connection Request
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {counsellors.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            No counsellors or volunteers are currently available.
          </p>
        </Card>
      )}
    </div>
  );
}
