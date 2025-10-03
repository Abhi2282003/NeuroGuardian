import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Activity, Brain, Zap, Download, Pause, Play } from 'lucide-react';
import { useSerialClient } from '@/lib/serial/useSerialClient';
import { useToast } from '@/hooks/use-toast';
import EEGChart from '@/components/EEGChart';

interface BioAmpProps {
  onBack: () => void;
}

export default function BioAmp({ onBack }: BioAmpProps) {
  const { status, isSupported, connect, disconnect, startStream, stopStream } = useSerialClient();
  const { toast } = useToast();
  const [demoMode, setDemoMode] = useState(false);
  const [channels, setChannels] = useState<number[][]>([[], [], [], [], [], []]);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recordedDataRef = useRef<{ timestamp: number; channels: number[] }[]>([]);

  // Demo mode data generation
  useEffect(() => {
    if (demoMode && !isPaused) {
      const interval = setInterval(() => {
        setChannels(prev => {
          const newChannels = prev.map((channel, idx) => {
            const newValue = Math.sin(Date.now() / 1000 + idx) * 1000 + 8192 + (Math.random() * 200 - 100);
            const updated = [...channel.slice(-500), newValue];
            
            // Record if recording is active
            if (isRecording && idx === 0) {
              recordedDataRef.current.push({
                timestamp: Date.now(),
                channels: newChannels.map(ch => ch[ch.length - 1] || 0)
              });
            }
            
            return updated;
          });
          return newChannels;
        });
      }, 4); // ~250 Hz
      return () => clearInterval(interval);
    }
  }, [demoMode, isPaused, isRecording]);

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
        if (isPaused) return;
        
        // Update channels with real data
        setChannels(prev => {
          const newChannels = prev.map((channel, idx) => {
            const newValue = packet.channels[idx] || 8192;
            return [...channel.slice(-500), newValue];
          });
          
          // Record if recording is active
          if (isRecording) {
            recordedDataRef.current.push({
              timestamp: packet.timestamp,
              channels: packet.channels
            });
          }
          
          return newChannels;
        });
      });
    } catch (error) {
      toast({
        title: 'Stream Error',
        description: error instanceof Error ? error.message : 'Failed to start stream',
        variant: 'destructive'
      });
    }
  };

  const handleDownloadData = () => {
    if (recordedDataRef.current.length === 0) {
      toast({
        title: 'No Data',
        description: 'No recorded data to download',
        variant: 'destructive'
      });
      return;
    }

    // Convert to CSV
    const headers = ['Timestamp', 'Ch1', 'Ch2', 'Ch3', 'Ch4', 'Ch5', 'Ch6'];
    const csvContent = [
      headers.join(','),
      ...recordedDataRef.current.map(row => 
        [row.timestamp, ...row.channels].join(',')
      )
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eeg-recording-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Downloaded',
      description: `${recordedDataRef.current.length} samples saved to CSV`
    });
  };

  const toggleRecording = () => {
    if (!isRecording) {
      recordedDataRef.current = [];
      setIsRecording(true);
      toast({
        title: 'Recording Started',
        description: 'Data is being recorded'
      });
    } else {
      setIsRecording(false);
      toast({
        title: 'Recording Stopped',
        description: `${recordedDataRef.current.length} samples recorded`
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
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle>Web Serial Not Available</CardTitle>
              <CardDescription>
                Web Serial API requires Chrome/Edge on desktop and won't work in iframe previews.
                <br />
                <strong>To use hardware connection:</strong> Deploy your app first, then access it directly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => setDemoMode(!demoMode)} 
                variant={demoMode ? "default" : "secondary"}
                className="w-full"
              >
                {demoMode ? '✓ Demo Mode Active' : 'Enable Demo Mode'}
              </Button>
              <p className="text-xs text-muted-foreground">
                Demo mode simulates 6 channels at 250 Hz for testing visualization
              </p>
            </CardContent>
          </Card>
        )}

        {/* Full-width EEG Chart */}
        <Card className="shadow-card mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Multi-Channel EEG Visualization
                </CardTitle>
                <CardDescription>
                  Real-time signal monitoring across 6 channels
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsPaused(!isPaused)}
                  variant="outline"
                  size="sm"
                  disabled={!status.streaming && !demoMode}
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={toggleRecording}
                  variant={isRecording ? "destructive" : "outline"}
                  size="sm"
                  disabled={!status.streaming && !demoMode}
                >
                  {isRecording ? '⏺ Recording' : 'Record'}
                </Button>
                <Button
                  onClick={handleDownloadData}
                  variant="outline"
                  size="sm"
                  disabled={recordedDataRef.current.length === 0}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-96 w-full">
              <EEGChart 
                data={channels}
                isStreaming={(status.streaming || demoMode) && !isPaused}
                channelNames={['Ch1', 'Ch2', 'Ch3', 'Ch4', 'Ch5', 'Ch6']}
              />
            </div>
          </CardContent>
        </Card>

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
                Recording Info
              </CardTitle>
              <CardDescription>
                Data capture statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={isRecording ? 'text-destructive font-medium' : ''}>
                    {isRecording ? '⏺ Recording' : 'Idle'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Samples:</span>
                  <span>{recordedDataRef.current.length.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{Math.round(recordedDataRef.current.length / 250)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paused:</span>
                  <span>{isPaused ? 'Yes' : 'No'}</span>
                </div>
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
