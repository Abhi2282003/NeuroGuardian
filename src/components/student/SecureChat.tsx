import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, MessageCircle, UserMinus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConnections();
    getUserId();
  }, []);

  useEffect(() => {
    if (selectedConnection) {
      loadMessages(selectedConnection.id);
      subscribeToMessages(selectedConnection.id);
    }
  }, [selectedConnection]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);
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
            <div className="pb-4 border-b mb-4">
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
            </div>

            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 p-2">
                {messages.map((message) => {
                  const isSender = message.sender_id === userId;
                  console.log("Message:", message.id, "Sender:", message.sender_id, "CurrentUser:", userId, "IsSender:", isSender);
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isSender
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-secondary text-secondary-foreground mr-auto"
                        }`}
                      >
                        <p className="text-sm break-words">{message.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="flex gap-2 mt-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your message..."
              />
              <Button onClick={sendMessage} disabled={!input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}