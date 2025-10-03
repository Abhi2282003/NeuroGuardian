import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, MessageCircle, Clock, UserMinus, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

interface Connection {
  id: string;
  counsellor_id: string;
  counsellor_profile?: {
    name: string;
    role: string;
  };
}

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
  read: boolean;
}

export function SecureChat() {
  const { toast } = useToast();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [credits, setCredits] = useState(5);
  const [sessionTime, setSessionTime] = useState(0);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadConnections();
    getUserId();
    loadCredits();
  }, []);

  useEffect(() => {
    if (selectedConnection) {
      loadMessages(selectedConnection.id);
      subscribeToMessages(selectedConnection.id);
      startChatSession();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        endChatSession();
      }
    };
  }, [selectedConnection]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);
  };

  const loadCredits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("chat_credits_minutes")
      .eq("id", user.id)
      .single();

    if (profile) {
      setCredits(profile.chat_credits_minutes || 0);
    }
  };

  const startChatSession = async () => {
    if (!selectedConnection || credits <= 0) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: session } = await supabase
      .from("chat_sessions")
      .insert({
        connection_request_id: selectedConnection.id,
        student_id: user.id,
        counsellor_id: selectedConnection.counsellor_id,
      })
      .select()
      .single();

    if (session) {
      setActiveSessionId(session.id);
      setSessionTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setSessionTime(prev => {
          const newTime = prev + 1;
          if (Math.floor(newTime / 60) >= credits) {
            // Time's up!
            endChatSession();
            return prev;
          }
          return newTime;
        });
      }, 1000);
    }
  };

  const endChatSession = async () => {
    if (!activeSessionId || !timerRef.current) return;

    clearInterval(timerRef.current);
    timerRef.current = null;

    const minutesUsed = Math.ceil(sessionTime / 60);
    
    await supabase
      .from("chat_sessions")
      .update({ 
        ended_at: new Date().toISOString(),
        duration_minutes: minutesUsed
      })
      .eq("id", activeSessionId);

    const newCredits = Math.max(0, credits - minutesUsed);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ chat_credits_minutes: newCredits })
        .eq("id", user.id);
    }

    setCredits(newCredits);
    setActiveSessionId(null);
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("connection_requests")
        .update({ 
          disconnected_at: new Date().toISOString(),
          disconnected_by: user.id
        })
        .eq("id", connectionId);

      if (error) throw error;

      toast({
        title: "Disconnected",
        description: "You have disconnected from this counsellor",
      });

      loadConnections();
      setSelectedConnection(null);
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const loadConnections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("connection_requests")
        .select("*")
        .eq("student_id", user.id)
        .eq("status", "accepted")
        .is("disconnected_at", null);

      if (error) throw error;

      // Fetch profiles separately
      const connectionsWithProfiles = await Promise.all(
        (data || []).map(async (connection) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name, role")
            .eq("id", connection.counsellor_id)
            .single();

          return {
            ...connection,
            counsellor_profile: profile || { name: "Unknown", role: "patient" },
          };
        })
      );

      setConnections(connectionsWithProfiles);
      if (connectionsWithProfiles.length > 0) {
        setSelectedConnection(connectionsWithProfiles[0]);
      }
    } catch (error) {
      console.error("Error loading connections:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (connectionId: string) => {
    try {
      const { data, error } = await supabase
        .from("secure_messages")
        .select("*")
        .eq("connection_request_id", connectionId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages(data || []);
      markMessagesAsRead(connectionId);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const markMessagesAsRead = async (connectionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("secure_messages")
        .update({ read: true })
        .eq("connection_request_id", connectionId)
        .eq("receiver_id", user.id)
        .eq("read", false);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const subscribeToMessages = (connectionId: string) => {
    const channel = supabase
      .channel(`messages_${connectionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "secure_messages",
          filter: `connection_request_id=eq.${connectionId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedConnection) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("secure_messages").insert({
        connection_request_id: selectedConnection.id,
        sender_id: user.id,
        receiver_id: selectedConnection.counsellor_id,
        message: input.trim(),
      });

      if (error) throw error;

      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (connections.length === 0) {
    return (
      <Card className="p-6 glass-card">
        <div className="text-center space-y-2">
          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-semibold">No Active Conversations</h3>
          <p className="text-muted-foreground">
            Accept connection requests to start chatting with counsellors and volunteers
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
      {/* Connections List */}
      <Card className="p-4 glass-card md:col-span-1">
        <h3 className="font-semibold mb-4">Your Connections</h3>
        <ScrollArea className="h-[520px]">
          <div className="space-y-2">
            {connections.map((connection) => (
              <Button
                key={connection.id}
                variant={selectedConnection?.id === connection.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedConnection(connection)}
              >
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarFallback>
                    {connection.counsellor_profile?.role === "doctor" ? "C" : "V"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium">
                    {connection.counsellor_profile?.role === "doctor"
                      ? "Counsellor"
                      : "Volunteer"}
                  </p>
                  <p className="text-xs text-muted-foreground">{connection.counsellor_profile?.name}</p>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="p-4 glass-card md:col-span-2 flex flex-col">
        {selectedConnection && (
          <>
            <div className="pb-4 border-b mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {selectedConnection.counsellor_profile?.role === "doctor" ? "C" : "V"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedConnection.counsellor_profile?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedConnection.counsellor_profile?.role === "doctor"
                        ? "Professional Counsellor"
                        : "Peer Volunteer"}
                    </p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <UserMinus className="h-4 w-4 mr-2" />
                      Disconnect
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Disconnect from this counsellor?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will end your connection. You can always connect with a new counsellor later.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDisconnect(selectedConnection.id)}>
                        Disconnect
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* Credits and Time Display */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Session: {formatTime(sessionTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={credits <= 0 ? "text-destructive font-semibold" : "text-muted-foreground"}>
                    Credits: {credits} min remaining
                  </span>
                </div>
              </div>

              {credits <= 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your free credits have been used. To continue chatting, please subscribe to our service.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === userId ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender_id === userId
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="flex gap-2 mt-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !input.trim() === false && credits > 0 && sendMessage()}
                placeholder={credits <= 0 ? "Subscribe to continue chatting..." : "Type your message..."}
                disabled={credits <= 0}
              />
              <Button onClick={sendMessage} disabled={!input.trim() || credits <= 0}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}