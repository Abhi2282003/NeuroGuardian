import { useEffect, useRef } from 'react';
import { WebglPlot, WebglLine, ColorRGBA } from 'webgl-plot';

interface EEGChartProps {
  data: number[][];
  channelNames?: string[];
  colors?: string[];
  isStreaming: boolean;
}

export default function EEGChart({ data, channelNames, colors, isStreaming }: EEGChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const plotRef = useRef<WebglPlot | null>(null);
  const linesRef = useRef<WebglLine[]>([]);
  const dataRef = useRef<number[][]>(data);
  const isStreamingRef = useRef<boolean>(isStreaming);

  const defaultColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'
  ];

  const defaultChannelNames = Array.from({ length: 6 }, (_, i) => `Channel ${i + 1}`);

  useEffect(() => {
    dataRef.current = data;
  }, [data, channelNames]);

  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const numChannels = data.length;
    const numPoints = 1000;

    // Initialize WebGL plot
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;

    const wglp = new WebglPlot(canvas);
    plotRef.current = wglp;

    // Create lines for each channel
    const channelColors = colors || defaultColors;
    linesRef.current = [];

    for (let i = 0; i < numChannels; i++) {
      const color = channelColors[i % channelColors.length];
      const rgb = hexToRgb(color);
      const line = new WebglLine(new ColorRGBA(rgb.r, rgb.g, rgb.b, 1), numPoints);
      
      // Initialize with zeros
      for (let j = 0; j < numPoints; j++) {
        line.setY(j, 0);
      }
      
      wglp.addLine(line);
      linesRef.current.push(line);
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      if (!isStreamingRef.current) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      // Update each channel
      linesRef.current.forEach((line, channelIdx) => {
        const channelData = dataRef.current[channelIdx];
        if (!channelData || channelData.length === 0) return;

        // Normalize and scale data for display
        // Separate channels vertically
        const verticalOffset = (channelIdx - (numChannels - 1) / 2) * (1.8 / numChannels);
        const scale = 0.8 / numChannels; // Scale amplitude

        // Scroll and update data
        for (let i = 0; i < line.numPoints - 1; i++) {
          line.setY(i, line.getY(i + 1));
        }

        // Add new data point
        if (channelData.length > 0) {
          const latestValue = channelData[channelData.length - 1];
          // Normalize from ADC range (0-16383) to -1 to 1
          const normalized = ((latestValue - 8192) / 8192) * scale;
          line.setY(line.numPoints - 1, normalized + verticalOffset);
        }
      });

      if (plotRef.current) {
        plotRef.current.update();
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      linesRef.current = [];
      plotRef.current = null;
    };
  }, [data.length]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ background: 'hsl(var(--muted) / 0.3)' }}
      />
      <div className="absolute top-2 left-2 space-y-1">
        {(channelNames || defaultChannelNames).slice(0, data.length).map((name, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: (colors || defaultColors)[idx % defaultColors.length] }}
            />
            <span className="text-foreground/70">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 1, g: 1, b: 1 };
}
