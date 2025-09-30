import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Activity, Brain, Zap } from 'lucide-react';
import { useSerialClient } from '@/lib/serial/useSerialClient';
import { useToast } from '@/hooks/use-toast';

interface BioAmpProps {
  onBack: () => void;
}

export default function BioAmp({ onBack }: BioAmpProps) {
  const { status, isSupported, connect, disconnect, startStream, stopStream } = useSerialClient();
  const { toast } = useToast();
  const [demoMode, setDemoMode] = useState(false);

  const handleConnect = async () => {
    try {
      await connect();
      toast({
        title: 'Connected',
        description: 'BioAmp device connected successfully'
      });
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect',
        variant: 'destructive'
      });
    }
  };

  const handleStartStream = async () => {
    try {
      await startStream((packet) => {
        // Handle incoming data
        console.log('Packet:', packet);
      });
    } catch (error) {
      toast({
        title: 'Stream Error',
        description: error instanceof Error ? error.message : 'Failed to start stream',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Button
          onClick={onBack}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Brain className="h-10 w-10 text-primary" />
            BioAmp EEG Studio
          </h1>
          <p className="text-muted-foreground">
            Real-time EEG monitoring and stress analysis
          </p>
        </div>

        {!isSupported() && (
          <Card className="mb-6 border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Browser Not Supported</CardTitle>
              <CardDescription>
                Web Serial API is not available. Please use Chrome or Edge on desktop.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setDemoMode(true)} variant="secondary">
                Enable Demo Mode
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Device Connection
              </CardTitle>
              <CardDescription>
                Connect your BioAmp/Chords device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!status.connected ? (
                <Button onClick={handleConnect} className="w-full" disabled={!isSupported()}>
                  Connect via USB
                </Button>
              ) : (
                <>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="text-primary font-medium">Connected</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sample Rate:</span>
                      <span>{status.sampleRate} Hz</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Packets:</span>
                      <span>{status.totalPackets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dropped:</span>
                      <span className={status.droppedFrames > 0 ? 'text-destructive' : ''}>
                        {status.droppedFrames}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {!status.streaming ? (
                      <Button onClick={handleStartStream} className="flex-1">
                        Start Stream
                      </Button>
                    ) : (
                      <Button onClick={stopStream} variant="destructive" className="flex-1">
                        Stop Stream
                      </Button>
                    )}
                    <Button onClick={disconnect} variant="outline">
                      Disconnect
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Time Series
              </CardTitle>
              <CardDescription>
                Real-time signal visualization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-muted/20 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">
                  {status.streaming ? 'Streaming data...' : 'Start stream to view signals'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Stress Analysis
              </CardTitle>
              <CardDescription>
                AI-powered prediction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-6 bg-muted/20 rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-2">Neutral</div>
                  <div className="text-sm text-muted-foreground">Confidence: 0%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
