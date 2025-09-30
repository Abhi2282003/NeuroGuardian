import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, Trophy } from 'lucide-react';

type ObstacleType = 'cactus-small' | 'cactus-large' | 'cactus-double' | 'pterodactyl-high' | 'pterodactyl-mid' | 'pterodactyl-low';

interface Obstacle {
  x: number;
  type: ObstacleType;
  width: number;
  height: number;
  yOffset: number;
}

export default function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const gameStateRef = useRef({
    dinoY: 0,
    dinoVelocity: 0,
    isJumping: false,
    isDucking: false,
    obstacles: [] as Obstacle[],
    clouds: [] as { x: number; y: number; speed: number }[],
    frameCount: 0,
    gameSpeed: 6,
    legFrame: 0
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
          gameStateRef.current.isDucking = true;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') {
        gameStateRef.current.isDucking = false;
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
      dinoY: 0,
      dinoVelocity: 0,
      isJumping: false,
      isDucking: false,
      obstacles: [],
      clouds: Array.from({ length: 5 }, (_, i) => ({
        x: i * 200 + 100,
        y: 30 + Math.random() * 40,
        speed: 0.5 + Math.random() * 0.5
      })),
      frameCount: 0,
      gameSpeed: 6,
      legFrame: 0
    };
  };

  const resetGame = () => {
    startGame();
  };

  const jump = () => {
    const state = gameStateRef.current;
    if (!state.isJumping && state.dinoY === 0 && !state.isDucking) {
      state.dinoVelocity = -16;
      state.isJumping = true;
    }
  };

  const spawnObstacle = () => {
    const state = gameStateRef.current;
    const obstacleTypes: ObstacleType[] = [
      'cactus-small',
      'cactus-large', 
      'cactus-double',
      'pterodactyl-high',
      'pterodactyl-mid',
      'pterodactyl-low'
    ];
    
    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    let width = 20;
    let height = 40;
    let yOffset = 0;

    switch (type) {
      case 'cactus-small':
        width = 17;
        height = 35;
        break;
      case 'cactus-large':
        width = 25;
        height = 50;
        break;
      case 'cactus-double':
        width = 40;
        height = 50;
        break;
      case 'pterodactyl-high':
        width = 46;
        height = 40;
        yOffset = -85;
        break;
      case 'pterodactyl-mid':
        width = 46;
        height = 40;
        yOffset = -50;
        break;
      case 'pterodactyl-low':
        width = 46;
        height = 40;
        yOffset = -20;
        break;
    }

    state.obstacles.push({
      x: 800,
      type,
      width,
      height,
      yOffset
    });
  };

  const updateGame = () => {
    const state = gameStateRef.current;
    
    // Update dino position
    if (state.isDucking && !state.isJumping) {
      // When ducking, stay on ground
    } else {
      state.dinoY += state.dinoVelocity;
      state.dinoVelocity += 0.8; // Gravity
    }

    if (state.dinoY > 0) {
      state.dinoY = 0;
      state.dinoVelocity = 0;
      state.isJumping = false;
    }

    // Leg animation
    if (state.frameCount % 8 === 0 && !state.isJumping) {
      state.legFrame = state.legFrame === 0 ? 1 : 0;
    }

    // Update clouds
    state.clouds.forEach(cloud => {
      cloud.x -= cloud.speed;
      if (cloud.x < -50) {
        cloud.x = 800;
        cloud.y = 30 + Math.random() * 40;
      }
    });

    // Spawn obstacles
    state.frameCount++;
    const spawnRate = Math.max(70, 120 - Math.floor(state.frameCount / 500));
    if (state.frameCount % spawnRate === 0 && state.obstacles.length < 3) {
      spawnObstacle();
    }

    // Update obstacles
    state.obstacles = state.obstacles
      .map(obs => ({ ...obs, x: obs.x - state.gameSpeed }))
      .filter(obs => obs.x > -obs.width);

    // Check collision
    const groundY = 200;
    const dinoX = 50;
    const dinoWidth = state.isDucking ? 60 : 44;
    const dinoHeight = state.isDucking ? 30 : 47;
    const dinoGroundY = groundY - dinoHeight;
    
    for (const obs of state.obstacles) {
      const obsY = obs.type.includes('pterodactyl') 
        ? groundY + obs.yOffset - obs.height
        : groundY - obs.height;

      // Collision detection with better hitbox
      if (
        dinoX + 5 < obs.x + obs.width - 5 &&
        dinoX + dinoWidth - 5 > obs.x + 5 &&
        dinoGroundY - state.dinoY < obsY + obs.height - 5 &&
        dinoGroundY - state.dinoY + dinoHeight - 5 > obsY
      ) {
        endGame();
        return;
      }
    }

    // Update score and speed
    setScore(Math.floor(state.frameCount / 10));
    if (state.frameCount % 100 === 0) {
      state.gameSpeed += 0.2;
    }
  };

  const drawGame = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const state = gameStateRef.current;
    const groundY = 200;
    
    // Clear canvas
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw clouds
    ctx.fillStyle = '#c4c4c4';
    state.clouds.forEach(cloud => {
      drawCloud(ctx, cloud.x, cloud.y);
    });

    // Draw ground line
    ctx.strokeStyle = '#535353';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(800, groundY);
    ctx.stroke();

    // Draw ground dots
    for (let i = 0; i < 40; i++) {
      const x = (i * 40 + state.frameCount * 3) % 800;
      ctx.fillStyle = '#535353';
      ctx.fillRect(x, groundY + 5, 2, 2);
    }

    // Draw dino
    const dinoY = groundY - (state.isDucking ? 30 : 47) - state.dinoY;
    if (state.isDucking) {
      drawDinoDucking(ctx, 50, dinoY);
    } else {
      drawDino(ctx, 50, dinoY, state.legFrame);
    }

    // Draw obstacles
    state.obstacles.forEach(obs => {
      const obsY = obs.type.includes('pterodactyl')
        ? groundY + obs.yOffset - obs.height
        : groundY - obs.height;

      if (obs.type.includes('cactus')) {
        drawCactus(ctx, obs.x, obsY, obs.type);
      } else {
        drawPterodactyl(ctx, obs.x, obsY, state.frameCount);
      }
    });

    // Draw score
    ctx.fillStyle = '#535353';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`HI ${String(highScore).padStart(5, '0')} ${String(score).padStart(5, '0')}`, 780, 30);
  };

  const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.arc(x + 15, y, 15, 0, Math.PI * 2);
    ctx.arc(x + 30, y, 12, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawDino = (ctx: CanvasRenderingContext2D, x: number, y: number, legFrame: number) => {
    ctx.fillStyle = '#535353';
    
    // Body
    ctx.fillRect(x + 15, y + 10, 25, 25);
    
    // Head
    ctx.fillRect(x + 5, y, 20, 15);
    ctx.fillRect(x, y + 5, 5, 10);
    
    // Eye
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 10, y + 5, 5, 5);
    
    // Mouth
    ctx.fillStyle = '#535353';
    ctx.fillRect(x + 20, y + 10, 5, 3);
    
    // Arms
    ctx.fillRect(x + 35, y + 15, 5, 10);
    
    // Tail
    ctx.fillRect(x + 30, y + 25, 15, 5);
    ctx.fillRect(x + 40, y + 20, 5, 5);
    
    // Legs (animated)
    if (legFrame === 0) {
      ctx.fillRect(x + 20, y + 35, 5, 12);
      ctx.fillRect(x + 30, y + 35, 5, 12);
    } else {
      ctx.fillRect(x + 20, y + 35, 5, 10);
      ctx.fillRect(x + 30, y + 35, 5, 14);
    }
  };

  const drawDinoDucking = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#535353';
    
    // Body (elongated)
    ctx.fillRect(x + 15, y + 15, 45, 15);
    
    // Head
    ctx.fillRect(x + 5, y + 10, 20, 12);
    
    // Eye
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 10, y + 13, 5, 5);
    
    // Tail
    ctx.fillStyle = '#535353';
    ctx.fillRect(x + 50, y + 10, 10, 5);
  };

  const drawCactus = (ctx: CanvasRenderingContext2D, x: number, y: number, type: ObstacleType) => {
    ctx.fillStyle = '#535353';
    
    if (type === 'cactus-small') {
      // Small single cactus
      ctx.fillRect(x + 5, y + 10, 12, 25);
      ctx.fillRect(x, y + 15, 5, 10);
      ctx.fillRect(x + 17, y + 20, 5, 10);
    } else if (type === 'cactus-large') {
      // Large single cactus
      ctx.fillRect(x + 7, y, 15, 50);
      ctx.fillRect(x, y + 10, 7, 15);
      ctx.fillRect(x + 22, y + 20, 7, 15);
    } else if (type === 'cactus-double') {
      // Double cactus
      ctx.fillRect(x + 5, y + 10, 12, 40);
      ctx.fillRect(x, y + 15, 5, 15);
      ctx.fillRect(x + 25, y + 5, 12, 45);
      ctx.fillRect(x + 37, y + 20, 5, 15);
    }
  };

  const drawPterodactyl = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) => {
    ctx.fillStyle = '#535353';
    
    // Body
    ctx.fillRect(x + 10, y + 15, 25, 15);
    
    // Head
    ctx.fillRect(x + 5, y + 10, 15, 10);
    
    // Beak
    ctx.fillRect(x, y + 12, 5, 5);
    
    // Eye
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 8, y + 13, 3, 3);
    
    // Wings (flapping animation)
    ctx.fillStyle = '#535353';
    if (Math.floor(frame / 10) % 2 === 0) {
      // Wings up
      ctx.fillRect(x + 15, y, 20, 10);
      ctx.fillRect(x + 15, y + 30, 20, 10);
    } else {
      // Wings down
      ctx.fillRect(x + 15, y + 5, 20, 10);
      ctx.fillRect(x + 15, y + 25, 20, 10);
    }
    
    // Tail
    ctx.fillRect(x + 30, y + 20, 15, 5);
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
              Chrome Dino Game - Concentration Test
            </CardTitle>
            <CardDescription>
              Classic Chrome dinosaur game to test reaction time and sustained attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-4 border-primary/20 rounded-lg overflow-hidden bg-white relative">
              <canvas
                ref={canvasRef}
                width={800}
                height={250}
                className="w-full"
                onClick={() => {
                  if (!gameStarted) startGame();
                  else if (gameOver) resetGame();
                  else jump();
                }}
              />
              
              {!gameStarted && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm">
                  <div className="text-center space-y-4">
                    <div className="text-2xl font-bold text-gray-700">Press SPACE or Click to Start</div>
                    <div className="text-sm text-gray-500">↑ Jump | ↓ Duck</div>
                    <Button size="lg" onClick={startGame}>
                      <Play className="mr-2 h-5 w-5" />
                      Start Game
                    </Button>
                  </div>
                </div>
              )}

              {gameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm">
                  <div className="text-center space-y-4">
                    <div className="text-3xl font-bold text-red-600">Game Over!</div>
                    <div className="text-xl text-gray-700">Score: {score}</div>
                    {score > highScore && <div className="text-lg text-green-600">🎉 New High Score!</div>}
                    <Button size="lg" onClick={resetGame}>
                      <Play className="mr-2 h-5 w-5" />
                      Play Again (SPACE)
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
                <p>• <strong>SPACE or ↑</strong> - Make the dino jump over obstacles</p>
                <p>• <strong>↓</strong> - Duck under flying pterodactyls</p>
                <p>• Avoid cacti and pterodactyls to survive</p>
                <p>• Game speed increases as you score more points</p>
                <p>• Tests: Reaction time, sustained attention, hand-eye coordination</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}