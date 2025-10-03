import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import Vapi from "@vapi-ai/web";

const VapiAssistant = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const vapiRef = useRef<Vapi | null>(null);
  const { toast } = useToast();
  const location = useLocation();

  // Get context-aware instructions based on current page
  const getContextInstructions = () => {
    const path = location.pathname;
    let context = "You are a helpful AI assistant for NeuroGuardian, a neurological wellness and mental health screening platform.";
    
    if (path === "/" || path === "/home") {
      context += " The user is on the home page. Guide them through the main features: EEG monitoring with BioAmp, comprehensive screening tests, and mindfulness tools. Explain that they can sign up or log in to access the full platform.";
    } else if (path === "/dashboard") {
      context += " The user is on the dashboard. Explain the three main sections: EEG Monitoring for real-time brain activity analysis, Screening Tests for cognitive and mental health assessments, and Mindfulness tools for stress reduction. Guide them based on their needs.";
    } else if (path === "/bioamp") {
      context += " The user is viewing the BioAmp EEG Studio. Explain that this provides real-time 6-channel EEG monitoring, signal filtering options, recording capabilities, and snapshot features. They can connect a physical BioAmp device via USB or use demo mode for testing.";
    } else if (path.startsWith("/screening")) {
      if (path.includes("phq9")) {
        context += " The user is taking the PHQ-9 depression screening test. Explain that this is a 9-question assessment to screen for depression severity. Reassure them that results are confidential and for screening purposes only.";
      } else if (path.includes("gad7")) {
        context += " The user is taking the GAD-7 anxiety screening test. Explain that this 7-question tool screens for generalized anxiety disorder. Encourage honest responses for accurate results.";
      } else if (path.includes("pss")) {
        context += " The user is taking the Perceived Stress Scale. Explain that this measures stress levels over the past month and helps identify stress patterns.";
      } else if (path.includes("audit")) {
        context += " The user is taking the AUDIT alcohol screening test. Explain that this helps identify harmful drinking patterns. Emphasize confidentiality.";
      } else if (path.includes("spiral")) {
        context += " The user is doing the Spiral Drawing Test, a cognitive assessment that can help detect motor control issues and tremors.";
      } else if (path.includes("finger")) {
        context += " The user is doing the Finger Tapping Test to assess motor speed and coordination.";
      } else if (path.includes("memory")) {
        context += " The user is taking the Memory Test to assess short-term memory and recall abilities.";
      } else if (path.includes("stroop")) {
        context += " The user is taking the Stroop Test to assess cognitive flexibility and processing speed.";
      } else if (path.includes("trail")) {
        context += " The user is doing the Trail Making Test to assess visual attention and task switching.";
      } else if (path.includes("dino")) {
        context += " The user is playing the Concentration Game to test focus and sustained attention.";
      } else {
        context += " The user is on the screening tests page. Explain that there are two categories: Cognitive & Motor Assessments (6 tests) for brain function, and Clinical Screening Questionnaires (4 tests) for mental health. Help them choose the right test.";
      }
    } else if (path === "/wellness") {
      context += " The user is on the mindfulness and wellness page. Explain the three interactive practices: Deep Breathing (4-7-8 technique), Meditation Timer with ambient sounds, and Progressive Muscle Relaxation. Also mention 6 educational guides for CBT, MBCT, DBT, and more. They can track their practice progress.";
    }
    
    context += " Always be supportive, professional, and empathetic. If users ask about medical concerns, remind them this is a screening tool and they should consult healthcare professionals for diagnosis. Keep responses concise and helpful.";
    
    return context;
  };

  useEffect(() => {
    // Initialize Vapi with your public key
    const initVapi = async () => {
      try {
        const vapi = new Vapi("8271e868-582a-477e-b473-d6cec5bb72e9");
        vapiRef.current = vapi;

        // Set up event listeners
        vapi.on("call-start", () => {
          console.log("Call started");
          setIsConnected(true);
          toast({
            title: "Voice Assistant Active",
            description: "Speak naturally, I'm here to help guide you through NeuroGuardian.",
          });
        });

        vapi.on("call-end", () => {
          console.log("Call ended");
          setIsConnected(false);
          setIsSpeaking(false);
          setIsListening(false);
          toast({
            title: "Call Ended",
            description: "Voice assistant disconnected.",
          });
        });

        vapi.on("speech-start", () => {
          console.log("AI started speaking");
          setIsSpeaking(true);
          setIsListening(false);
        });

        vapi.on("speech-end", () => {
          console.log("AI stopped speaking");
          setIsSpeaking(false);
        });

        vapi.on("volume-level", (volume: number) => {
          if (volume > 0.01 && !isSpeaking) {
            setIsListening(true);
          } else if (volume < 0.01 && !isSpeaking) {
            setIsListening(false);
          }
        });

        vapi.on("error", (error: Error) => {
          console.error("Vapi error:", error);
          toast({
            title: "Error",
            description: error.message || "An error occurred with the voice assistant.",
            variant: "destructive",
          });
          setIsConnected(false);
        });

      } catch (error) {
        console.error("Failed to initialize Vapi:", error);
      }
    };

    initVapi();

    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, []);

  const startCall = async () => {
    if (!vapiRef.current) return;

    try {
      // Use your assistant ID to start the call
      await vapiRef.current.start("0d1418d3-e6ce-4def-9e57-adfa33eb744f");
    } catch (error) {
      console.error("Failed to start call:", error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to voice assistant. Please check your microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-center gap-2">
      {isConnected && (
        <div className="flex flex-col items-center gap-1 mb-2">
          {isSpeaking && (
            <div className="flex items-center gap-2 bg-primary/10 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20">
              <Volume2 className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">Speaking...</span>
            </div>
          )}
          {isListening && !isSpeaking && (
            <div className="flex items-center gap-2 bg-green-500/10 backdrop-blur-sm px-4 py-2 rounded-full border border-green-500/20">
              <Mic className="h-4 w-4 text-green-500 animate-pulse" />
              <span className="text-sm font-medium text-green-500">Listening...</span>
            </div>
          )}
        </div>
      )}
      
      <Button
        onClick={isConnected ? stopCall : startCall}
        size="lg"
        className={`h-16 w-16 rounded-full shadow-lg transition-all duration-300 ${
          isConnected 
            ? "bg-red-500 hover:bg-red-600" 
            : "bg-primary hover:bg-primary/90"
        }`}
      >
        {isConnected ? (
          <MicOff className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </Button>
      
      {!isConnected && (
        <span className="text-xs text-muted-foreground mt-1">Voice Guide</span>
      )}
    </div>
  );
};

export default VapiAssistant;
