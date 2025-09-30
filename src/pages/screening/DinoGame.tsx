import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, Trophy } from 'lucide-react';

export default function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const gameStateRef = useRef({
    dinoY: 150,
    dinoVelocity: 0,
    isJumping: false,
    obstacles: [] as { x: number; width: number; height: number }[],
    frameCount: 0,
    gameSpeed: 5
  });

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!gameStarted) {
          startGame();
        } else if (gameOver) {
          resetGame();
        } else {
          jump();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = setInterval(() => {
      updateGame();
      drawGame(ctx, canvas);
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    gameStateRef.current = {
      dinoY: 150,
      dinoVelocity: 0,
      isJumping: false,
      obstacles: [],
      frameCount: 0,
      gameSpeed: 5
    };
  };

  const resetGame = () => {
    setGameOver(false);
    setScore(0);
    gameStateRef.current = {
      dinoY: 150,
      dinoVelocity: 0,
      isJumping: false,
      obstacles: [],
      frameCount: 0,
      gameSpeed: 5
    };
  };

  const jump = () => {
    const state = gameStateRef.current;
    if (!state.isJumping && state.dinoY === 150) {
      state.dinoVelocity = -15;
      state.isJumping = true;
    }
  };

  const updateGame = () => {
    const state = gameStateRef.current;
    
    // Update dino position
    state.dinoY += state.dinoVelocity;
    state.dinoVelocity += 0.8; // Gravity

    if (state.dinoY > 150) {
      state.dinoY = 150;
      state.dinoVelocity = 0;
      state.isJumping = false;
    }

    // Spawn obstacles
    state.frameCount++;
    if (state.frameCount % 100 === 0) {
      const height = Math.random() > 0.5 ? 40 : 60;
      state.obstacles.push({
        x: 600,
        width: 20,
        height: height
      });
    }

    // Update obstacles
    state.obstacles = state.obstacles
      .map(obs => ({ ...obs, x: obs.x - state.gameSpeed }))
      .filter(obs => obs.x > -obs.width);

    // Check collision
    const dinoX = 50;
    const dinoWidth = 40;
    const dinoHeight = 50;
    
    for (const obs of state.obstacles) {
      if (
        dinoX < obs.x + obs.width &&
        dinoX + dinoWidth > obs.x &&
        state.dinoY + dinoHeight > 200 - obs.height
      ) {
        endGame();
        return;
      }
    }

    // Update score and speed
    setScore(Math.floor(state.frameCount / 10));
    if (state.frameCount % 500 === 0) {
      state.gameSpeed += 0.5;
    }
  };

  const drawGame = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const state = gameStateRef.current;
    
    // Clear canvas
    ctx.fillStyle = 'hsl(var(--background))';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.strokeStyle = 'hsl(var(--border))';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 200);
    ctx.lineTo(600, 200);
    ctx.stroke();

    // Draw dino
    ctx.fillStyle = 'hsl(var(--primary))';
    ctx.fillRect(50, state.dinoY, 40, 50);
    
    // Draw eye
    ctx.fillStyle = 'hsl(var(--background))';
    ctx.fillRect(70, state.dinoY + 10, 8, 8);

    // Draw obstacles
    ctx.fillStyle = 'hsl(var(--destructive))';
    state.obstacles.forEach(obs => {
      ctx.fillRect(obs.x, 200 - obs.height, obs.width, obs.height);
    });
  };

  const endGame = () => {
    setGameOver(true);
    if (score > highScore) {
      setHighScore(score);
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
            <CardTitle className="text-3xl flex items-center gap-3">
              <Trophy className="h-8 w-8 text-primary" />
              Concentration Game
            </CardTitle>
            <CardDescription>
              Test your reaction time and sustained attention with this Chrome dino-style game.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <Card className="bg-primary/10">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary">{score}</div>
                  <div className="text-sm text-muted-foreground">Score</div>
                </CardContent>
              </Card>
              <Card className="bg-primary/10">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary">{highScore}</div>
                  <div className="text-sm text-muted-foreground">High Score</div>
                </CardContent>
              </Card>
            </div>

            <div className="border-2 border-primary/20 rounded-lg overflow-hidden bg-card relative">
              <canvas
                ref={canvasRef}
                width={600}
                height={250}
                className="w-full"
              />
              
              {!gameStarted && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                  <div className="text-center space-y-4">
                    <div className="text-2xl font-bold">Press SPACE to Start</div>
                    <Button size="lg" onClick={startGame}>
                      <Play className="mr-2 h-5 w-5" />
                      Start Game
                    </Button>
                  </div>
                </div>
              )}

              {gameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                  <div className="text-center space-y-4">
                    <div className="text-3xl font-bold text-destructive">Game Over!</div>
                    <div className="text-xl">Score: {score}</div>
                    <Button size="lg" onClick={resetGame}>
                      <Play className="mr-2 h-5 w-5" />
                      Play Again
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg">How to Play</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Press SPACE to make the dino jump</p>
                <p>• Avoid the obstacles by timing your jumps</p>
                <p>• Game speed increases as you progress</p>
                <p>• Tests reaction time, attention, and hand-eye coordination</p>
                <p>• Used to assess sustained attention and concentration</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
