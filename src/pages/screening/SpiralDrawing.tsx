import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SpiralDrawing() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    drawReferenceSpiral();
  }, []);

  const drawReferenceSpiral = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw reference spiral (light gray)
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let angle = 0;
    let radius = 0;
    
    ctx.moveTo(centerX, centerY);
    
    for (let i = 0; i < 720; i++) {
      angle = i * Math.PI / 180;
      radius = i * 0.15;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      ctx.lineTo(x, y);
    }
    
    ctx.stroke();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasDrawn(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const resetCanvas = () => {
    setHasDrawn(false);
    drawReferenceSpiral();
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spiral-test-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Drawing saved',
        description: 'Your spiral drawing has been saved'
      });
    });
  };

  return (
    <div className="min-h-screen bg-gradient-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/screening">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Screening
          </Button>
        </Link>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-3xl">Spiral Drawing Test</CardTitle>
            <CardDescription>
              Draw a spiral following the gray guide. This test assesses motor control, tremor, and coordination.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-primary/20 rounded-lg overflow-hidden bg-card">
              <canvas
                ref={canvasRef}
                width={600}
                height={600}
                className="w-full cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>

            <div className="flex gap-4">
              <Button onClick={resetCanvas} variant="outline" className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button onClick={saveDrawing} disabled={!hasDrawn} className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Save Drawing
              </Button>
            </div>

            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg">Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>1. Place your cursor at the center of the spiral</p>
                <p>2. Click and hold to start drawing</p>
                <p>3. Follow the gray guide spiral outward</p>
                <p>4. Try to maintain smooth, steady movement</p>
                <p>5. Save your drawing when complete</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
