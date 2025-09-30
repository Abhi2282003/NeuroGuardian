import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trophy } from 'lucide-react';

export default function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('dino-high-score');
    return saved ? parseInt(saved) : 0;
  });

  const gameRef = useRef({
    dino: {
      x: 25,
      y: 0,
      width: 44,
      height: 47,
      velocityY: 0,
      jumping: false,
      ducking: false,
      legFrame: 0
    },
    obstacles: [] as Array<{
      x: number;
      type: 'cactus1' | 'cactus2' | 'cactus3' | 'ptero';
      width: number;
      height: number;
      y: number;
    }>,
    clouds: [] as Array<{ x: number; y: number }>,
    ground: { x: 0 },
    gameSpeed: 6,
    score: 0,
    frameCount: 0,
    gravity: 0.6,
    jumpPower: -12
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!gameStarted) {
          startGame();
        } else if (gameOver) {
          resetGame();
        } else {
          jump();
        }
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        if (gameStarted && !gameOver) {
          gameRef.current.dino.ducking = true;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') {
        gameRef.current.dino.ducking = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    
    const gameLoop = () => {
      update();
      draw(ctx);
      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [gameStarted, gameOver]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    
    gameRef.current = {
      dino: {
        x: 25,
        y: 0,
        width: 44,
        height: 47,
        velocityY: 0,
        jumping: false,
        ducking: false,
        legFrame: 0
      },
      obstacles: [],
      clouds: [
        { x: 150, y: 50 },
        { x: 400, y: 30 },
        { x: 650, y: 60 }
      ],
      ground: { x: 0 },
      gameSpeed: 6,
      score: 0,
      frameCount: 0,
      gravity: 0.6,
      jumpPower: -12
    };
  };

  const resetGame = () => {
    startGame();
  };

  const jump = () => {
    const { dino } = gameRef.current;
    if (!dino.jumping && dino.y === 0) {
      dino.velocityY = gameRef.current.jumpPower;
      dino.jumping = true;
    }
  };

  const update = () => {
    const game = gameRef.current;
    const { dino } = game;

    // Update dino physics
    dino.velocityY += game.gravity;
    dino.y += dino.velocityY;

    if (dino.y >= 0) {
      dino.y = 0;
      dino.velocityY = 0;
      dino.jumping = false;
    }

    // Update dino dimensions based on ducking
    if (dino.ducking && !dino.jumping) {
      dino.width = 59;
      dino.height = 26;
    } else {
      dino.width = 44;
      dino.height = 47;
    }

    // Leg animation
    if (game.frameCount % 6 === 0 && !dino.jumping) {
      dino.legFrame = dino.legFrame === 0 ? 1 : 0;
    }

    // Spawn obstacles
    game.frameCount++;
    if (game.frameCount % 90 === 0) {
      const types: Array<'cactus1' | 'cactus2' | 'cactus3' | 'ptero'> = ['cactus1', 'cactus2', 'cactus3', 'ptero'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      let width = 17, height = 35, y = 0;
      
      if (type === 'cactus1') {
        width = 17;
        height = 35;
      } else if (type === 'cactus2') {
        width = 34;
        height = 35;
      } else if (type === 'cactus3') {
        width = 51;
        height = 35;
      } else if (type === 'ptero') {
        width = 46;
        height = 40;
        y = Math.random() > 0.5 ? -70 : -35;
      }
      
      game.obstacles.push({ x: 600, type, width, height, y });
    }

    // Update obstacles
    game.obstacles = game.obstacles.filter(obs => {
      obs.x -= game.gameSpeed;
      return obs.x > -obs.width;
    });

    // Update clouds
    game.clouds.forEach(cloud => {
      cloud.x -= game.gameSpeed * 0.2;
      if (cloud.x < -46) {
        cloud.x = 600;
        cloud.y = 30 + Math.random() * 40;
      }
    });

    // Update ground
    game.ground.x -= game.gameSpeed;
    if (game.ground.x <= -600) {
      game.ground.x = 0;
    }

    // Collision detection
    const groundY = 150;
    const dinoRect = {
      x: dino.x + 4,
      y: groundY - dino.height - dino.y + 4,
      width: dino.width - 8,
      height: dino.height - 8
    };

    for (const obs of game.obstacles) {
      const obsRect = {
        x: obs.x + 4,
        y: obs.type === 'ptero' ? groundY + obs.y - obs.height + 4 : groundY - obs.height + 4,
        width: obs.width - 8,
        height: obs.height - 8
      };

      if (
        dinoRect.x < obsRect.x + obsRect.width &&
        dinoRect.x + dinoRect.width > obsRect.x &&
        dinoRect.y < obsRect.y + obsRect.height &&
        dinoRect.y + dinoRect.height > obsRect.y
      ) {
        endGame();
        return;
      }
    }

    // Update score
    game.score = Math.floor(game.frameCount / 10);
    setScore(game.score);

    // Increase speed
    if (game.frameCount % 200 === 0 && game.gameSpeed < 13) {
      game.gameSpeed += 0.5;
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    const game = gameRef.current;
    const { dino } = game;
    const groundY = 150;

    // Clear canvas
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(0, 0, 600, 200);

    // Draw clouds
    ctx.fillStyle = '#ccc';
    game.clouds.forEach(cloud => {
      drawCloud(ctx, cloud.x, cloud.y);
    });

    // Draw ground line
    ctx.strokeStyle = '#535353';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(600, groundY);
    ctx.stroke();

    // Draw ground texture
    for (let i = 0; i < 15; i++) {
      const x = (i * 50 + game.ground.x) % 600;
      ctx.fillStyle = '#535353';
      ctx.fillRect(x, groundY + 2, 2, 2);
      ctx.fillRect(x + 10, groundY + 2, 2, 2);
    }

    // Draw dino
    const dinoY = groundY - dino.height - dino.y;
    ctx.fillStyle = '#535353';
    
    if (dino.ducking) {
      drawDinoDucking(ctx, dino.x, dinoY);
    } else {
      drawDino(ctx, dino.x, dinoY, dino.legFrame, dino.jumping);
    }

    // Draw obstacles
    game.obstacles.forEach(obs => {
      const obsY = obs.type === 'ptero' ? groundY + obs.y - obs.height : groundY - obs.height;
      
      if (obs.type === 'ptero') {
        drawPtero(ctx, obs.x, obsY, game.frameCount);
      } else {
        drawCactus(ctx, obs.x, obsY, obs.type);
      }
    });

    // Draw score
    ctx.fillStyle = '#535353';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'right';
    const scoreText = `HI ${String(highScore).padStart(5, '0')}  ${String(game.score).padStart(5, '0')}`;
    ctx.fillText(scoreText, 580, 20);

    // Game Over text
    if (gameOver) {
      ctx.fillStyle = '#535353';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('G A M E  O V E R', 300, 70);
      
      ctx.font = '12px Arial';
      ctx.fillText('Press SPACE to restart', 300, 95);
    }
  };

  const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.beginPath();
    ctx.arc(x, y, 8, Math.PI * 0.5, Math.PI * 1.5);
    ctx.arc(x + 8, y - 4, 8, Math.PI * 1, Math.PI * 1.85);
    ctx.arc(x + 16, y - 2, 8, Math.PI * 1.37, Math.PI * 1.91);
    ctx.arc(x + 23, y, 7, Math.PI * 1.5, Math.PI * 0.5);
    ctx.closePath();
    ctx.fill();
  };

  const drawDino = (ctx: CanvasRenderingContext2D, x: number, y: number, legFrame: number, jumping: boolean) => {
    // Body
    ctx.fillRect(x + 6, y + 4, 22, 16);
    // Tail
    ctx.fillRect(x + 24, y + 16, 8, 4);
    ctx.fillRect(x + 28, y + 12, 4, 4);
    // Neck
    ctx.fillRect(x + 6, y, 6, 10);
    // Head
    ctx.fillRect(x, y, 6, 8);
    ctx.fillRect(x - 4, y + 2, 4, 4);
    // Eye
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(x + 2, y + 2, 2, 2);
    ctx.fillStyle = '#535353';
    // Arm
    ctx.fillRect(x + 18, y + 10, 6, 2);
    ctx.fillRect(x + 22, y + 8, 2, 2);
    
    // Legs
    if (jumping) {
      ctx.fillRect(x + 2, y + 20, 6, 14);
      ctx.fillRect(x + 12, y + 20, 6, 14);
    } else {
      if (legFrame === 0) {
        ctx.fillRect(x + 2, y + 20, 6, 14);
        ctx.fillRect(x + 2, y + 34, 4, 2);
        ctx.fillRect(x + 12, y + 20, 6, 16);
        ctx.fillRect(x + 12, y + 36, 4, 2);
      } else {
        ctx.fillRect(x + 2, y + 20, 6, 16);
        ctx.fillRect(x + 2, y + 36, 4, 2);
        ctx.fillRect(x + 12, y + 20, 6, 14);
        ctx.fillRect(x + 12, y + 34, 4, 2);
      }
    }
  };

  const drawDinoDucking = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Body (elongated)
    ctx.fillRect(x + 10, y + 18, 40, 8);
    // Head
    ctx.fillRect(x, y + 10, 16, 8);
    ctx.fillRect(x - 4, y + 12, 4, 4);
    // Eye
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(x + 2, y + 12, 2, 2);
    ctx.fillStyle = '#535353';
    // Tail
    ctx.fillRect(x + 40, y + 10, 10, 6);
    ctx.fillRect(x + 46, y + 6, 4, 4);
    // Legs
    ctx.fillRect(x + 16, y + 26, 10, 2);
    ctx.fillRect(x + 32, y + 26, 10, 2);
  };

  const drawCactus = (ctx: CanvasRenderingContext2D, x: number, y: number, type: string) => {
    if (type === 'cactus1') {
      ctx.fillRect(x + 2, y + 10, 12, 25);
      ctx.fillRect(x, y + 12, 2, 8);
      ctx.fillRect(x + 14, y + 17, 2, 8);
    } else if (type === 'cactus2') {
      ctx.fillRect(x + 2, y + 10, 12, 25);
      ctx.fillRect(x, y + 12, 2, 8);
      ctx.fillRect(x + 14, y + 17, 2, 8);
      ctx.fillRect(x + 19, y + 10, 12, 25);
      ctx.fillRect(x + 17, y + 12, 2, 8);
      ctx.fillRect(x + 31, y + 17, 2, 8);
    } else if (type === 'cactus3') {
      ctx.fillRect(x + 2, y + 10, 12, 25);
      ctx.fillRect(x, y + 12, 2, 8);
      ctx.fillRect(x + 14, y + 17, 2, 8);
      ctx.fillRect(x + 19, y + 10, 12, 25);
      ctx.fillRect(x + 17, y + 12, 2, 8);
      ctx.fillRect(x + 31, y + 17, 2, 8);
      ctx.fillRect(x + 36, y + 10, 12, 25);
      ctx.fillRect(x + 34, y + 15, 2, 8);
      ctx.fillRect(x + 48, y + 12, 2, 8);
    }
  };

  const drawPtero = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) => {
    const wingUp = Math.floor(frame / 10) % 2 === 0;
    
    // Body
    ctx.fillRect(x + 12, y + 8, 20, 14);
    // Head
    ctx.fillRect(x + 6, y + 6, 12, 10);
    // Beak
    ctx.fillRect(x, y + 8, 6, 6);
    // Eye
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(x + 8, y + 8, 2, 2);
    ctx.fillStyle = '#535353';
    
    // Wings
    if (wingUp) {
      ctx.fillRect(x + 16, y, 20, 8);
      ctx.fillRect(x + 16, y + 22, 20, 8);
    } else {
      ctx.fillRect(x + 16, y + 4, 20, 8);
      ctx.fillRect(x + 16, y + 18, 20, 8);
    }
    
    // Tail
    ctx.fillRect(x + 28, y + 12, 12, 6);
    ctx.fillRect(x + 36, y + 14, 6, 2);
  };

  const endGame = () => {
    setGameOver(true);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('dino-high-score', score.toString());
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
              T-Rex Chrome Dino Game
            </CardTitle>
            <CardDescription>
              A replica of the hidden game from Chrome offline mode - Tests reaction time and sustained attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-4 border-gray-300 rounded-lg overflow-hidden bg-[#f7f7f7] relative">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="w-full cursor-pointer"
                onClick={() => {
                  if (!gameStarted) startGame();
                  else if (gameOver) resetGame();
                  else jump();
                }}
              />
              
              {!gameStarted && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#f7f7f7]/95">
                  <div className="text-center space-y-2">
                    <div className="text-xl font-bold text-gray-700">Press SPACE to Start</div>
                    <div className="text-sm text-gray-500">↑ or SPACE = Jump  |  ↓ = Duck</div>
                  </div>
                </div>
              )}
            </div>

            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg">Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• <strong>SPACE or ↑</strong> - Jump over cacti</p>
                <p>• <strong>↓</strong> - Duck under pterodactyls</p>
                <p>• <strong>SPACE</strong> - Start game / Restart after game over</p>
                <p className="pt-2 text-xs text-muted-foreground">
                  This test measures reaction time, hand-eye coordination, and sustained attention - key indicators for neurological health screening.
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}