import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play } from 'lucide-react';

export default function TrailMaking() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<'intro' | 'partA' | 'partB' | 'results'>('intro');
  const [points, setPoints] = useState<Array<{ x: number; y: number; label: string }>>([]);
  const [currentTarget, setCurrentTarget] = useState(0);
  const [path, setPath] = useState<Array<{ x: number; y: number }>>([]);
  const [startTime, setStartTime] = useState(0);
  const [completionTime, setCompletionTime] = useState({ partA: 0, partB: 0 });
  const [errors, setErrors] = useState(0);

  useEffect(() => {
    if (phase === 'partA' || phase === 'partB') {
      generatePoints();
      setCurrentTarget(0);
      setPath([]);
      setStartTime(Date.now());
      setErrors(0);
    }
  }, [phase]);

  useEffect(() => {
    if (points.length > 0) {
      drawCanvas();
    }
  }, [points, currentTarget, path]);

  const generatePoints = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newPoints: Array<{ x: number; y: number; label: string }> = [];
    const margin = 50;
    const count = phase === 'partA' ? 12 : 12;

    // Generate Part A (numbers only) or Part B (numbers and letters alternating)
    if (phase === 'partA') {
      for (let i = 1; i <= count; i++) {
        newPoints.push({
          x: margin + Math.random() * (canvas.width - 2 * margin),
          y: margin + Math.random() * (canvas.height - 2 * margin),
          label: i.toString()
        });
      }
    } else {
      const letters = 'ABCDEFGHIJKL';
      for (let i = 0; i < count / 2; i++) {
        newPoints.push({
          x: margin + Math.random() * (canvas.width - 2 * margin),
          y: margin + Math.random() * (canvas.height - 2 * margin),
          label: (i + 1).toString()
        });
        newPoints.push({
          x: margin + Math.random() * (canvas.width - 2 * margin),
          y: margin + Math.random() * (canvas.height - 2 * margin),
          label: letters[i]
        });
      }
    }

    setPoints(newPoints);
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'hsl(var(--card))';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw path
    if (path.length > 1) {
      ctx.strokeStyle = 'hsl(var(--primary))';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      path.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    }

    // Draw points
    points.forEach((point, idx) => {
      const isTarget = idx === currentTarget;
      const isCompleted = idx < currentTarget;

      // Circle
      ctx.beginPath();
      ctx.arc(point.x, point.y, 20, 0, 2 * Math.PI);
      
      if (isCompleted) {
        ctx.fillStyle = 'hsl(var(--success))';
      } else if (isTarget) {
        ctx.fillStyle = 'hsl(var(--primary))';
      } else {
        ctx.fillStyle = 'hsl(var(--muted))';
      }
      ctx.fill();
      
      ctx.strokeStyle = isTarget ? 'hsl(var(--ring))' : 'hsl(var(--border))';
      ctx.lineWidth = isTarget ? 3 : 1;
      ctx.stroke();

      // Label
      ctx.fillStyle = isCompleted || isTarget ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(point.label, point.x, point.y);
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTarget >= points.length) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const target = points[currentTarget];
    const distance = Math.sqrt((x - target.x) ** 2 + (y - target.y) ** 2);

    if (distance <= 20) {
      // Correct target clicked
      setPath([...path, { x: target.x, y: target.y }]);
      setCurrentTarget(currentTarget + 1);

      // Check if test is complete
      if (currentTarget + 1 >= points.length) {
        const time = Math.round((Date.now() - startTime) / 1000);
        if (phase === 'partA') {
          setCompletionTime({ ...completionTime, partA: time });
          setPhase('intro');
        } else {
          setCompletionTime({ ...completionTime, partB: time });
          setPhase('results');
        }
      }
    } else {
      // Wrong target clicked
      setErrors(errors + 1);
    }
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
            <CardTitle className="text-3xl">Trail Making Test</CardTitle>
            <CardDescription>
              Connect numbered circles in sequence (Part A) and alternate between numbers and letters (Part B) to assess visual attention and task switching.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {phase === 'intro' && (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="text-muted-foreground space-y-4">
                    <p className="text-lg">
                      This test measures visual attention, processing speed, and cognitive flexibility.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="bg-primary/10">
                        <CardHeader>
                          <CardTitle className="text-lg">Part A</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                          <p>Connect numbers in order: 1→2→3→4...</p>
                          <p className="mt-2 text-muted-foreground">Tests processing speed and visual scanning</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-primary/10">
                        <CardHeader>
                          <CardTitle className="text-lg">Part B</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                          <p>Alternate numbers and letters: 1→A→2→B→3→C...</p>
                          <p className="mt-2 text-muted-foreground">Tests cognitive flexibility and task switching</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button size="lg" variant="outline" onClick={() => setPhase('partA')}>
                    <Play className="mr-2 h-5 w-5" />
                    Start Part A
                  </Button>
                  {completionTime.partA > 0 && (
                    <Button size="lg" onClick={() => setPhase('partB')}>
                      <Play className="mr-2 h-5 w-5" />
                      Start Part B
                    </Button>
                  )}
                </div>

                {completionTime.partA > 0 && (
                  <Card className="bg-primary/10">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-primary">{completionTime.partA}s</div>
                          <div className="text-sm text-muted-foreground">Part A Time</div>
                        </div>
                        {completionTime.partB > 0 && (
                          <div>
                            <div className="text-2xl font-bold text-primary">{completionTime.partB}s</div>
                            <div className="text-sm text-muted-foreground">Part B Time</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {(phase === 'partA' || phase === 'partB') && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold">
                    {phase === 'partA' ? 'Part A: ' : 'Part B: '}
                    Connect {phase === 'partA' ? 'numbers in order' : 'numbers and letters alternating'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Target: <span className="font-bold text-primary">{points[currentTarget]?.label}</span>
                    {errors > 0 && <span className="ml-4 text-destructive">Errors: {errors}</span>}
                  </div>
                </div>

                <div className="border-2 border-primary/20 rounded-lg overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={400}
                    className="w-full cursor-pointer"
                    onClick={handleCanvasClick}
                  />
                </div>
              </div>
            )}

            {phase === 'results' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-4">
                    Test Complete!
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-primary/10">
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-primary">{completionTime.partA}s</div>
                      <div className="text-sm text-muted-foreground">Part A Time</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/10">
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-primary">{completionTime.partB}s</div>
                      <div className="text-sm text-muted-foreground">Part B Time</div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Interpretation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><strong>Part A Normal:</strong> 29-75 seconds (age dependent)</p>
                    <p><strong>Part B Normal:</strong> 75-180 seconds (age dependent)</p>
                    <p><strong>B/A Ratio:</strong> {(completionTime.partB / completionTime.partA).toFixed(2)} (normal: 2-3)</p>
                    <p className="mt-4">Higher times or B/A ratio may indicate:</p>
                    <p>• Attention deficits • Processing speed issues</p>
                    <p>• Executive dysfunction • Cognitive impairment</p>
                  </CardContent>
                </Card>

                <Button onClick={() => setPhase('intro')} variant="outline" className="w-full">
                  Back to Menu
                </Button>
              </div>
            )}

            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg">About This Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Gold standard for assessing executive function</p>
                <p>• Part A: Visual scanning and processing speed</p>
                <p>• Part B: Cognitive flexibility and task switching</p>
                <p>• Widely used in dementia, stroke, and TBI assessment</p>
                <p>• Sensitive to frontal lobe dysfunction</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
