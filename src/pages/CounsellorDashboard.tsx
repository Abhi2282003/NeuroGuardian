import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, MessageCircle, AlertCircle, CheckCircle, X, Activity, TrendingUp, Calendar, User, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

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

interface StudentProfile {
  id: string;
  name: string;
  created_at: string;
}

interface CheckIn {
  id: string;
  mood: number;
  stress: number;
  sleep_hours: number;
  check_date: string;
  notes?: string;
}

interface Message {
  id: string;
  message: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  read: boolean;
}

export default function CounsellorDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCount, setActiveCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [connectedStudents, setConnectedStudents] = useState<StudentProfile[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [hasAccess, setHasAccess] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [activeTab, setActiveTab] = useState("overview");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadRequests();
    loadStats();
    loadConnectedStudents();
    getCurrentUser();

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
          loadConnectedStudents();
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel("secure_messages_counsellor")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "secure_messages"
        },
        () => {
          if (selectedStudent) {
            loadMessages(selectedStudent);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(messagesChannel);
    };
  }, [selectedStudent]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    setCurrentUserId(user.id);

    // Check user role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile) {
      setUserRole(profile.role);
      setHasAccess(profile.role === "doctor" || profile.role === "volunteer");
    }
  };

  const loadConnectedStudents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No user found");
        return;
      }

      console.log("Loading connected students for counsellor:", user.id);

      const { data: connections, error: connError } = await supabase
        .from("connection_requests")
        .select("student_id")
        .eq("counsellor_id", user.id)
        .eq("status", "accepted")
        .is("disconnected_at", null);

      console.log("Connections found:", connections);
      
      if (connError) {
        console.error("Error fetching connections:", connError);
        return;
      }

      if (connections && connections.length > 0) {
        const studentIds = connections.map(c => c.student_id);
        console.log("Student IDs:", studentIds);
        
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("id, name, created_at")
          .in("id", studentIds);

        console.log("Student profiles:", profiles);
        
        if (profileError) {
          console.error("Error fetching profiles:", profileError);
          return;
        }

        setConnectedStudents(profiles || []);
      } else {
        console.log("No connections found");
        setConnectedStudents([]);
      }
    } catch (error) {
      console.error("Error loading connected students:", error);
    }
  };

  const loadMessages = async (studentId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No user found when loading messages");
        return;
      }

      console.log("Loading messages for student:", studentId, "counsellor:", user.id);

      // First get the connection_request_id
      const { data: connection, error: connError } = await supabase
        .from("connection_requests")
        .select("id")
        .eq("counsellor_id", user.id)
        .eq("student_id", studentId)
        .eq("status", "accepted")
        .is("disconnected_at", null)
        .maybeSingle();

      console.log("Connection found:", connection, "Error:", connError);

      if (!connection) {
        console.log("No active connection found");
        setMessages([]);
        return;
      }

      // Then get all messages for this connection
      const { data, error } = await supabase
        .from("secure_messages")
        .select("*")
        .eq("connection_request_id", connection.id)
        .order("created_at", { ascending: true });

      console.log("Messages loaded:", data?.length, "Error:", error);

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      setMessages(data || []);

      // Mark messages as read
      await supabase
        .from("secure_messages")
        .update({ read: true })
        .eq("receiver_id", user.id)
        .eq("sender_id", studentId)
        .eq("read", false);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedStudent) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: connection } = await supabase
        .from("connection_requests")
        .select("id")
        .eq("counsellor_id", user.id)
        .eq("student_id", selectedStudent)
        .eq("status", "accepted")
        .is("disconnected_at", null)
        .maybeSingle();

      if (!connection) {
        toast.error("Connection not found");
        return;
      }

      const { error } = await supabase
        .from("secure_messages")
        .insert({
          connection_request_id: connection.id,
          sender_id: user.id,
          receiver_id: selectedStudent,
          message: newMessage
        });

      if (error) throw error;

      setNewMessage("");
      loadMessages(selectedStudent);
      toast.success("Message sent");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const loadRecentCheckIns = async () => {
    if (!connectedStudents.length) return;

    try {
      const studentIds = connectedStudents.map(s => s.id);
      const { data } = await supabase
        .from("daily_check_ins")
        .select("*")
        .in("user_id", studentIds)
        .order("check_date", { ascending: false })
        .limit(10);

      setRecentCheckIns(data || []);
    } catch (error) {
      console.error("Error loading check-ins:", error);
    }
  };

  useEffect(() => {
    if (connectedStudents.length > 0) {
      loadRecentCheckIns();
    }
  }, [connectedStudents]);

  useEffect(() => {
    if (selectedStudent) {
      loadMessages(selectedStudent);
    }
  }, [selectedStudent]);

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const openChat = (studentId: string) => {
    setSelectedStudent(studentId);
    setActiveTab("messages");
  };

  const viewProgress = (studentId: string) => {
    setSelectedStudent(studentId);
    setActiveTab("activity");
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

  if (!hasAccess) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card className="p-12 text-center space-y-4">
          <AlertCircle className="h-16 w-16 mx-auto text-orange-500" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">
            This dashboard is only accessible to counsellors and volunteers.
            {userRole === "patient" && " You are currently logged in as a student."}
          </p>
          <Button onClick={() => window.location.href = "/student"}>
            Go to Student Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Counsellor Dashboard
          </h1>
          <p className="text-muted-foreground">Manage your student connections and support requests</p>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="students">
            <Users className="h-4 w-4 mr-2" />
            Students ({connectedStudents.length})
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageCircle className="h-4 w-4 mr-2" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="pending">
            <AlertCircle className="h-4 w-4 mr-2" />
            Requests ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="activity">
            <TrendingUp className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Connected Students</h3>
              <ScrollArea className="h-64">
                {connectedStudents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No connected students yet</p>
                ) : (
                  <div className="space-y-3">
                    {connectedStudents.map((student) => (
                      <div key={student.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50">
                        <Avatar>
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Connected {new Date(student.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => openChat(student.id)}>
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
              <ScrollArea className="h-64">
                {recentCheckIns.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent check-ins</p>
                ) : (
                  <div className="space-y-3">
                    {recentCheckIns.map((checkIn) => {
                      const student = connectedStudents.find(s => s.id === checkIn.id);
                      return (
                        <div key={checkIn.id} className="p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium">{student?.name || "Student"}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(checkIn.check_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Mood:</span> {checkIn.mood}/10
                            </div>
                            <div>
                              <span className="text-muted-foreground">Stress:</span> {checkIn.stress}/10
                            </div>
                            <div>
                              <span className="text-muted-foreground">Sleep:</span> {checkIn.sleep_hours}h
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Resources & Support</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Crisis Helpline</h4>
                <p className="text-sm text-muted-foreground mb-2">24/7 Mental Health Support</p>
                <p className="text-lg font-semibold">1-800-273-8255</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Guidelines</h4>
                <p className="text-sm text-muted-foreground">Review best practices for student counselling</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Training Resources</h4>
                <p className="text-sm text-muted-foreground">Access professional development materials</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          {connectedStudents.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No connected students yet</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connectedStudents.map((student) => (
                <Card key={student.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-lg">{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{student.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Connected since {new Date(student.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => openChat(student.id)}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => viewProgress(student.id)}
                        >
                          View Progress
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Conversations</h3>
              <ScrollArea className="h-96">
                {connectedStudents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No students connected</p>
                ) : (
                  <div className="space-y-2">
                    {connectedStudents.map((student) => (
                      <Button
                        key={student.id}
                        variant={selectedStudent === student.id ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setSelectedStudent(student.id)}
                      >
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {student.name}
                      </Button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>

            <Card className="md:col-span-2 p-4">
              {selectedStudent ? (
                <>
                  <div className="border-b pb-3 mb-4">
                    <h3 className="font-semibold">
                      {connectedStudents.find(s => s.id === selectedStudent)?.name}
                    </h3>
                  </div>
                  <ScrollArea className="h-80 mb-4 pr-4">
                     <div className="space-y-3">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              msg.sender_id === currentUserId
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(msg.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="min-h-[60px]"
                    />
                    <Button onClick={sendMessage}>Send</Button>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Select a student to start messaging
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

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

        <TabsContent value="activity" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Student Wellbeing Trends</h3>
            {recentCheckIns.length === 0 ? (
              <p className="text-muted-foreground">No check-in data available</p>
            ) : (
              <div className="space-y-4">
                {recentCheckIns.map((checkIn) => {
                  const student = connectedStudents.find(s => s.id === checkIn.id);
                  return (
                    <div key={checkIn.id} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Avatar>
                            <AvatarFallback>{student?.name.charAt(0) || "?"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student?.name || "Student"}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(checkIn.check_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 rounded bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Mood</p>
                          <p className="text-2xl font-bold">{checkIn.mood}/10</p>
                        </div>
                        <div className="text-center p-3 rounded bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Stress</p>
                          <p className="text-2xl font-bold">{checkIn.stress}/10</p>
                        </div>
                        <div className="text-center p-3 rounded bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Sleep</p>
                          <p className="text-2xl font-bold">{checkIn.sleep_hours}h</p>
                        </div>
                      </div>
                      {checkIn.notes && (
                        <div className="mt-3 p-3 rounded bg-muted/30">
                          <p className="text-sm">{checkIn.notes}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
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
