import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Activity, Brain, Zap, Download, Pause, Play, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { useSerialClient } from '@/lib/serial/useSerialClient';
import { useToast } from '@/hooks/use-toast';
import EEGChart from '@/components/EEGChart';
import FilterControls from '@/components/FilterControls';
import RecordingManager from '@/components/RecordingManager';
import ChannelSelector from '@/components/ChannelSelector';
import { SignalFilter, FilterType } from '@/lib/signalFilters';
import { saveRecording } from '@/lib/indexedDB';

interface BioAmpProps {
  onBack: () => void;
}

export default function BioAmp({ onBack }: BioAmpProps) {
  const { status, isSupported, connect, disconnect, startStream, stopStream } = useSerialClient();
  const { toast } = useToast();
  const [channels, setChannels] = useState<number[][]>([[], [], [], [], [], []]);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState<number>(0);
  const [zoom, setZoom] = useState(1);
  const [timeBase, setTimeBase] = useState(4);
  const [selectedChannels, setSelectedChannels] = useState<boolean[]>(Array(6).fill(true));
  const [channelFilters, setChannelFilters] = useState<FilterType[]>(Array(6).fill('none'));
  const [frameBuffers, setFrameBuffers] = useState<number[][][]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(-1);
  
  const recordedDataRef = useRef<{ timestamp: number; channels: number[] }[]>([]);
  const filtersRef = useRef<SignalFilter[]>(Array(6).fill(null).map(() => new SignalFilter(250)));
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);


  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      setRecordingTimer(0);
    }
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  const handleConnect = async () => {
    try {
      await connect();
      toast({
        title: 'Connected',
        description: 'BioAmp device connected successfully. Click "Start Stream" to begin.'
      });
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect. Make sure to select the correct port.',
        variant: 'destructive'
      });
    }
  };

  const handleStartStream = async () => {
    try {
      await startStream((channelData) => {
        if (isPaused) return;
        
        // Update channels with real data  
        setChannels(prev => {
          const newChannels = prev.map((channel, idx) => {
            if (!selectedChannels[idx]) return channel;
            
            const newValue = channelData[idx] || 8192;
            const filtered = filtersRef.current[idx].process(newValue);
            return [...channel.slice(-500), filtered];
          });
          
          // Record if recording is active
          if (isRecording) {
            recordedDataRef.current.push({
              timestamp: Date.now(),
              channels: channelData
            });
          }
          
          return newChannels;
        });
      });
      
      toast({
        title: 'Stream Started',
        description: 'Receiving data from BioAmp device'
      });
    } catch (error) {
      console.error('Stream error:', error);
      toast({
        title: 'Stream Error',
        description: error instanceof Error ? error.message : 'Failed to start stream',
        variant: 'destructive'
      });
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      recordedDataRef.current = [];
      setIsRecording(true);
      toast({
        title: 'Recording Started',
        description: 'Data is being recorded'
      });
    } else {
      setIsRecording(false);
      
      // Save to IndexedDB
      if (recordedDataRef.current.length > 0) {
        const name = `recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
        await saveRecording(
          recordedDataRef.current,
          name,
          selectedChannels.filter(Boolean).length,
          250
        );
        
        toast({
          title: 'Recording Saved',
          description: `${recordedDataRef.current.length} samples saved to IndexedDB`
        });
      }
    }
  };

  const captureSnapshot = () => {
    const snapshot = channels.map(ch => [...ch]);
    setFrameBuffers(prev => [...prev.slice(-4), snapshot]);
    setCurrentFrameIndex(-1);
    toast({
      title: 'Snapshot Captured',
      description: 'Frame buffer saved'
    });
  };

  const navigateFrame = (direction: 'prev' | 'next') => {
    if (frameBuffers.length === 0) return;
    
    if (currentFrameIndex === -1) {
      setCurrentFrameIndex(frameBuffers.length - 1);
    } else {
      const newIndex = direction === 'prev' 
        ? Math.max(0, currentFrameIndex - 1)
        : Math.min(frameBuffers.length - 1, currentFrameIndex + 1);
      setCurrentFrameIndex(newIndex);
    }
  };

  const handleFilterChange = (channelIndex: number, filter: FilterType) => {
    const newFilters = [...channelFilters];
    newFilters[channelIndex] = filter;
    setChannelFilters(newFilters);
    filtersRef.current[channelIndex].setFilter(filter);
  };

  const handleApplyFilterToAll = (filter: FilterType) => {
    const newFilters = Array(6).fill(filter);
    setChannelFilters(newFilters);
    filtersRef.current.forEach(f => f.setFilter(filter));
    toast({
      title: 'Filter Applied',
      description: `${filter} filter applied to all channels`
    });
  };

  const handleChannelToggle = (index: number) => {
    const newSelected = [...selectedChannels];
    newSelected[index] = !newSelected[index];
    setSelectedChannels(newSelected);
  };

  const handleSelectAllChannels = () => {
    setSelectedChannels(Array(6).fill(true));
  };

  const handleResetChannels = () => {
    setSelectedChannels(Array(6).fill(true));
  };

  const displayChannels = currentFrameIndex >= 0 
    ? frameBuffers[currentFrameIndex]
    : channels;

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
          <Card className="mb-6 border-primary/50 bg-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Serial Port Access Required
              </CardTitle>
              <CardDescription className="space-y-3">
                <div className="p-4 bg-background/50 rounded-lg border border-primary/20">
                  <p className="font-semibold text-foreground mb-2">⚠️ Lovable Preview Limitation</p>
                  <p className="text-sm mb-3">
                    Web Serial API is blocked in the preview iframe due to browser security policies.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">To use your BioAmp device:</p>
                    <ol className="text-sm space-y-1 list-decimal list-inside">
                      <li>Click the "Open in New Tab" button below</li>
                      <li>Connect your Arduino device (Baud: 230400)</li>
                      <li>Click "Connect via USB" and select your port</li>
                      <li>Click "Start Stream" to see live EEG visualization</li>
                    </ol>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => window.open(window.location.href, '_blank')}
                >
                  🚀 Open in New Tab (Required for Serial Access)
                </Button>
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Full-width EEG Chart */}
        <Card className="shadow-card mb-6">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Multi-Channel EEG Visualization
                  </CardTitle>
                  <CardDescription>
                    Real-time signal monitoring with advanced filters
                  </CardDescription>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => setIsPaused(!isPaused)}
                    variant="outline"
                    size="sm"
                    disabled={!status.streaming}
                  >
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={captureSnapshot}
                    variant="outline"
                    size="sm"
                    disabled={!status.streaming}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => navigateFrame('prev')}
                    variant="outline"
                    size="sm"
                    disabled={frameBuffers.length === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => navigateFrame('next')}
                    variant="outline"
                    size="sm"
                    disabled={frameBuffers.length === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={toggleRecording}
                    variant={isRecording ? "destructive" : "outline"}
                    size="sm"
                    disabled={!status.streaming}
                  >
                    {isRecording ? `⏺ ${recordingTimer}s` : 'Record'}
                  </Button>
                  <RecordingManager />
                  <FilterControls
                    channelFilters={channelFilters}
                    onFilterChange={handleFilterChange}
                    onApplyToAll={handleApplyFilterToAll}
                    numChannels={6}
                  />
                  <ChannelSelector
                    totalChannels={6}
                    selectedChannels={selectedChannels}
                    onChannelToggle={handleChannelToggle}
                    onSelectAll={handleSelectAllChannels}
                    onReset={handleResetChannels}
                  />
                </div>
              </div>
              
              {/* Zoom and Time Base Controls */}
              <div className="flex gap-6 items-center">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    Zoom: {zoom.toFixed(1)}x
                  </label>
                  <Slider
                    value={[zoom]}
                    onValueChange={(val) => setZoom(val[0])}
                    min={0.5}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    Time Base: {timeBase}s
                  </label>
                  <Slider
                    value={[timeBase]}
                    onValueChange={(val) => setTimeBase(val[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              {currentFrameIndex >= 0 && (
                <div className="text-sm text-muted-foreground">
                  Viewing snapshot {currentFrameIndex + 1} of {frameBuffers.length}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-96 w-full">
              <EEGChart 
                data={displayChannels.filter((_, idx) => selectedChannels[idx])}
                isStreaming={status.streaming && !isPaused && currentFrameIndex === -1}
                channelNames={selectedChannels
                  .map((selected, idx) => selected ? `Ch${idx + 1}` : null)
                  .filter(Boolean) as string[]}
              />
            </div>
          </CardContent>
        </Card>

        {/* External Stream Link */}
        <Card className="shadow-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              EEG Monitoring Stream
            </CardTitle>
            <CardDescription>
              External visualization from NeuroGuardian
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Web Serial API requires opening the stream in a new tab for device access.
              </p>
              <Button 
                className="w-full" 
                onClick={() => window.open('https://neuroguardian.vercel.app/stream', '_blank')}
              >
                🚀 Open NeuroGuardian Stream in New Tab
              </Button>
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
                <>
                  <Button onClick={handleConnect} className="w-full" disabled={!isSupported()}>
                    Connect via USB
                  </Button>
                  <div className="text-xs text-muted-foreground p-3 bg-muted/20 rounded">
                    <p className="font-medium mb-1">Expected Device:</p>
                    <p>• Arduino UNO R4 Minima</p>
                    <p>• Product ID: 105</p>
                    <p>• Baud Rate: 230400</p>
                    <p>• 6 Channels @ 14-bit resolution</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-sm font-semibold text-green-400 mb-2">✓ Connection Successful</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Device:</span>
                        <span className="text-foreground">Arduino UNO R4 Minima</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sample Rate:</span>
                        <span className="text-foreground">{status.sampleRate || 250} Hz</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Packets:</span>
                        <span className="text-foreground">{status.totalPackets}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dropped:</span>
                        <span className={status.droppedFrames > 0 ? 'text-destructive' : 'text-foreground'}>
                          {status.droppedFrames}
                        </span>
                      </div>
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
                Signal Quality
              </CardTitle>
              <CardDescription>
                Real-time monitoring stats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={isRecording ? 'text-destructive font-medium' : ''}>
                    {isRecording ? `⏺ ${recordingTimer}s` : 'Idle'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Channels:</span>
                  <span>{selectedChannels.filter(Boolean).length} / 6</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Samples:</span>
                  <span>{recordedDataRef.current.length.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Snapshots:</span>
                  <span>{frameBuffers.length} / 5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paused:</span>
                  <span>{isPaused ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Filters:</span>
                  <span>{channelFilters.filter(f => f !== 'none').length} active</span>
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
