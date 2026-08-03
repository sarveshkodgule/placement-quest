import React, { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { 
  Play, RotateCcw, Home, Award, ChevronRight, HelpCircle, 
  Shield, Zap, Radio, Clock, Eye, AlertOctagon, Heart, Trophy,
  Volume2, VolumeX, ArrowUp, ArrowDown, ArrowLeft, ArrowRight
} from 'lucide-react';

// Web Audio API Sound Synthesizer for Code Snake - Routed to Central System
const snakeAudio = {
  isEnabled: true,

  playBgm() {
    // Handled globally via setTrack
  },

  stopBgm() {
    // Handled globally via setTrack
  },

  playCollect() {
    if (this.isEnabled) {
      usePlayerStore.getState().playGlobalSfx('collect');
    }
  },

  playError() {
    if (this.isEnabled) {
      usePlayerStore.getState().playGlobalSfx('error');
    }
  },

  playLevelComplete() {
    if (this.isEnabled) {
      usePlayerStore.getState().playGlobalSfx('success');
    }
  },

  playBossHit() {
    if (this.isEnabled) {
      usePlayerStore.getState().playGlobalSfx('bossHit');
    }
  }
};

// 10 Campaign levels pool (2 options per level for daily rotation) + Level 11 SQL Injector Boss
const LEVELS_POOL = [
  // Level 1
  [
    {
      level: 1,
      title: 'Python Keyword Compiler',
      instruction: 'Construct a Python function header! Collect: def, (, ), :, return',
      required: ['def', '(', ')', ':', 'return'],
      wrongs: ['public', 'malloc', 'printf', 'goto'],
      difficulty: 'Easy'
    },
    {
      level: 1,
      title: 'Python List Builder',
      instruction: 'Build a Python list operation sequence! Collect: list, append, pop, len, insert',
      required: ['list', 'append', 'pop', 'len', 'insert'],
      wrongs: ['std::vector', 'push_back', 'malloc', 'free'],
      difficulty: 'Easy'
    }
  ],
  // Level 2
  [
    {
      level: 2,
      title: 'JavaScript Variable Declarations',
      instruction: 'Create an ES6 function reference! Collect: let, =, ;, const, function',
      required: ['let', '=', ';', 'const', 'function'],
      wrongs: ['std::cout', '#define', 'extern', 'struct'],
      difficulty: 'Easy'
    },
    {
      level: 2,
      title: 'JavaScript Array Functions',
      instruction: 'Chain functional array operations! Collect: const, =, map, filter, reduce',
      required: ['const', '=', 'map', 'filter', 'reduce'],
      wrongs: ['ptr', 'delete', 'malloc', 'realloc'],
      difficulty: 'Easy'
    }
  ],
  // Level 3
  [
    {
      level: 3,
      title: 'C++ Entry Core',
      instruction: 'Build a standard C++ entry function! Collect: int, main, {, }, return',
      required: ['int', 'main', '{', '}', 'return'],
      wrongs: ['import', 'def', 'elif', 'package'],
      difficulty: 'Medium'
    },
    {
      level: 3,
      title: 'C++ Class Headers',
      instruction: 'Declare a dynamic virtual class structure! Collect: class, public, private, ;, virtual',
      required: ['class', 'public', 'private', ';', 'virtual'],
      wrongs: ['def', 'lambda', 'import', 'from'],
      difficulty: 'Medium'
    }
  ],
  // Level 4
  [
    {
      level: 4,
      title: 'HTML DOM Boilerplate',
      instruction: 'Construct a structural webpage block! Collect: html, head, body, div, p',
      required: ['html', 'head', 'body', 'div', 'p'],
      wrongs: ['SELECT', 'WHERE', 'INSERT', 'CREATE'],
      difficulty: 'Medium'
    },
    {
      level: 4,
      title: 'HTML Image Links',
      instruction: 'Embed a responsive hypertext link node! Collect: img, src, alt, a, href',
      required: ['img', 'src', 'alt', 'a', 'href'],
      wrongs: ['background-image', 'border', 'padding', 'margin'],
      difficulty: 'Medium'
    }
  ],
  // Level 5
  [
    {
      level: 5,
      title: 'SQL SELECT Statement',
      instruction: 'Query the target table rows! Collect: SELECT, FROM, WHERE, LIMIT',
      required: ['SELECT', 'FROM', 'WHERE', 'LIMIT'],
      wrongs: ['function', 'class', 'struct', 'sizeof'],
      difficulty: 'Medium'
    },
    {
      level: 5,
      title: 'SQL JOIN Statement',
      instruction: 'Join two tables on their primary keys! Collect: SELECT, FROM, JOIN, ON',
      required: ['SELECT', 'FROM', 'JOIN', 'ON'],
      wrongs: ['document.write', 'console.log', 'import', 'export'],
      difficulty: 'Medium'
    }
  ],
  // Level 6
  [
    {
      level: 6,
      title: 'Python Iterator Logic',
      instruction: 'Write a standard Python iterator loop! Collect: for, in, range, :, pass',
      required: ['for', 'in', 'range', ':', 'pass'],
      wrongs: ['while(1)', 'do', 'switch', 'default'],
      difficulty: 'Medium'
    },
    {
      level: 6,
      title: 'Python Exception Gates',
      instruction: 'Handle runtime errors cleanly! Collect: try, except, :, raise, finally',
      required: ['try', 'except', ':', 'raise', 'finally'],
      wrongs: ['throw', 'throws', 'catch', 'debugger'],
      difficulty: 'Medium'
    }
  ],
  // Level 7
  [
    {
      level: 7,
      title: 'Java Class Main Gate',
      instruction: 'Declare a Java entry point signature! Collect: class, public, static, void, main',
      required: ['class', 'public', 'static', 'void', 'main'],
      wrongs: ['std::vector', 'auto', 'typedef', 'malloc'],
      difficulty: 'Hard'
    },
    {
      level: 7,
      title: 'Java Interface Structures',
      instruction: 'Define interface bindings! Collect: interface, implements, public, override, extends',
      required: ['interface', 'implements', 'public', 'override', 'extends'],
      wrongs: ['virtual', 'struct', 'friend', 'operator'],
      difficulty: 'Hard'
    }
  ],
  // Level 8
  [
    {
      level: 8,
      title: 'JavaScript Conditional Branches',
      instruction: 'Build JS branch selections! Collect: if, else, switch, case, break',
      required: ['if', 'else', 'switch', 'case', 'break'],
      wrongs: ['def', 'elsif', 'endif', 'select'],
      difficulty: 'Hard'
    },
    {
      level: 8,
      title: 'JavaScript Try-Catch blocks',
      instruction: 'Throw and catch client errors! Collect: try, catch, (, ), throw',
      required: ['try', 'catch', '(', ')', 'throw'],
      wrongs: ['except', 'finally:', 'raise', 'struct'],
      difficulty: 'Hard'
    }
  ],
  // Level 9
  [
    {
      level: 9,
      title: 'Git Version pipeline',
      instruction: 'Stage and push core local updates! Collect: git, add, commit, push, origin',
      required: ['git', 'add', 'commit', 'push', 'origin'],
      wrongs: ['docker', 'npm', 'pip', 'kubernetes'],
      difficulty: 'Hard'
    },
    {
      level: 9,
      title: 'Git Branch Workflows',
      instruction: 'Checkout and merge feature branches! Collect: git, checkout, -b, merge, rebase',
      required: ['git', 'checkout', '-b', 'merge', 'rebase'],
      wrongs: ['kubectl', 'apt-get', 'yarn', 'composer'],
      difficulty: 'Hard'
    }
  ],
  // Level 10
  [
    {
      level: 10,
      title: 'Linux Shell Navigation',
      instruction: 'Isolate, modify, and delete server directories! Collect: cd, ls, mkdir, rm, chmod',
      required: ['cd', 'ls', 'mkdir', 'rm', 'chmod'],
      wrongs: ['GET', 'POST', 'PUT', 'DELETE'],
      difficulty: 'Expert'
    },
    {
      level: 10,
      title: 'Linux Process Controllers',
      instruction: 'List and kill server processes! Collect: ps, aux, kill, -9, top',
      required: ['ps', 'aux', 'kill', '-9', 'top'],
      wrongs: ['http', 'ssh', 'scp', 'curl'],
      difficulty: 'Expert'
    }
  ],
  // Level 11 (Boss Level)
  [
    {
      level: 11,
      title: '⚡ BOSS FIGHT: SQL Injection Monster 👾',
      instruction: 'Defeat the injector! Avoid crawling SQL INJECTIONS (UNION, DROP, OR 1=1) and collect SAFE query blocks (SELECT, WHERE, id = 5) to damage boss core!',
      required: ['SELECT', 'WHERE', 'id = 5'],
      wrongs: ['DROP TABLE', 'UNION SELECT', 'OR 1=1', 'database_drop()'],
      difficulty: 'BOSS LEVEL',
      isBoss: true
    },
    {
      level: 11,
      title: '⚡ BOSS FIGHT: Cross-Site Scripting (XSS) 👾',
      instruction: 'Defeat the script injector! Avoid unsafe tags (<script>, onload, innerHTML) and collect SAFE sanitizer calls (escape, encode, sanitize) to damage boss core!',
      required: ['escape', 'encode', 'sanitize'],
      wrongs: ['<script>', 'onload', 'innerHTML', 'eval()'],
      difficulty: 'BOSS LEVEL',
      isBoss: true
    }
  ]
];

export default function CodeSnake() {
  const { addCoins, addXP, setGame, triggerNotification, isMuted, setTrack } = usePlayerStore();

  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'level_clear', 'gameover', 'victory'
  const [levelIdx, setLevelIdx] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [health, setHealth] = useState(100);
  const [collectedTokens, setCollectedTokens] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [shakeActive, setShakeActive] = useState(false);
  const [bossHp, setBossHp] = useState(5); // Lives for the level 11 boss

  // Power-up States
  const [shieldActive, setShieldActive] = useState(false);
  const [speedActive, setSpeedActive] = useState(false);
  const [magnetActive, setMagnetActive] = useState(false);
  const [freezeActive, setFreezeActive] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);

  const canvasRef = useRef(null);
  const gameIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Snake Position & Movement State Refs
  const snakeRef = useRef([{ x: 10, y: 10 }]);
  const directionRef = useRef('RIGHT');
  const tokensRef = useRef([]);
  const enemiesRef = useRef([]);
  const powerUpsRef = useRef([]);
  const particlesRef = useRef([]);
  const enemyTickRef = useRef(0);

  const daySeed = new Date().getDate();
  const activeLevelPool = LEVELS_POOL[levelIdx] || LEVELS_POOL[0];
  const activeLevel = activeLevelPool[daySeed % activeLevelPool.length];
  const gridWidth = 24;
  const gridHeight = 14;

  // Initialize chiptune toggle
  useEffect(() => {
    snakeAudio.isEnabled = soundEnabled && !isMuted;
  }, [soundEnabled, isMuted]);

  // Handle background music loop
  useEffect(() => {
    if (soundEnabled && !isMuted && gameState === 'playing') {
      setTrack('chiptune');
    } else {
      // Revert to Hub lofi coding beats in menu or gameover
      setTrack('lofi');
    }
    return () => setTrack('lofi');
  }, [soundEnabled, isMuted, gameState]);

  // Sync Timer Countdown
  useEffect(() => {
    if (gameState !== 'playing' || freezeActive) return;
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerIntervalRef.current);
  }, [gameState, freezeActive]);

  // Handle Controls and WASD/Arrow listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      const key = e.key.toLowerCase();
      const currentDir = directionRef.current;

      if ((key === 'w' || e.key === 'ArrowUp') && currentDir !== 'DOWN') {
        directionRef.current = 'UP';
      } else if ((key === 's' || e.key === 'ArrowDown') && currentDir !== 'UP') {
        directionRef.current = 'DOWN';
      } else if ((key === 'a' || e.key === 'ArrowLeft') && currentDir !== 'RIGHT') {
        directionRef.current = 'LEFT';
      } else if ((key === 'd' || e.key === 'ArrowRight') && currentDir !== 'LEFT') {
        directionRef.current = 'RIGHT';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const tickInterval = speedActive ? 90 : 155; // Double time ticks under speed power-up
    gameIntervalRef.current = setInterval(() => {
      updateGamePhysics();
      drawCanvas(ctx);
    }, tickInterval);

    return () => clearInterval(gameIntervalRef.current);
  }, [gameState, levelIdx, speedActive]);

  // Start Campaign / Level
  const startLevel = (idx) => {
    setLevelIdx(idx);
    setHealth(100);
    setCollectedTokens([]);
    setScore((prev) => (idx === 0 ? 0 : prev));
    setCombo(1);
    setTimeRemaining(idx === 10 ? 90 : 60); // More time for SQL Injector boss
    setBossHp(5);

    // Reset power-ups
    setShieldActive(false);
    setSpeedActive(false);
    setMagnetActive(false);
    setFreezeActive(false);
    setScannerActive(false);

    // Reset positions
    snakeRef.current = [
      { x: 10, y: 7 },
      { x: 9, y: 7 },
      { x: 8, y: 7 }
    ];
    directionRef.current = 'RIGHT';
    particlesRef.current = [];

    // Spawn items
    const activeLvlPool = LEVELS_POOL[idx] || LEVELS_POOL[0];
    const activeLvl = activeLvlPool[daySeed % activeLvlPool.length];
    spawnInitialElements(activeLvl);
    setGameState('playing');
  };

  const getUniqueRandomCoordinates = (occupied) => {
    let attempts = 0;
    while (attempts < 1000) {
      const x = Math.floor(Math.random() * (gridWidth - 2)) + 1;
      const y = Math.floor(Math.random() * (gridHeight - 2)) + 1;
      const isOccupied = occupied.some(pos => pos.x === x && pos.y === y);
      if (!isOccupied) {
        return { x, y };
      }
      attempts++;
    }
    return {
      x: Math.floor(Math.random() * (gridWidth - 2)) + 1,
      y: Math.floor(Math.random() * (gridHeight - 2)) + 1
    };
  };

  const spawnInitialElements = (lvl) => {
    // Clear lists
    tokensRef.current = [];
    enemiesRef.current = [];
    powerUpsRef.current = [];

    // Track occupied positions starting with the snake body
    const occupied = [...snakeRef.current];

    // Spawn first correct token ONLY!
    if (lvl.required && lvl.required.length > 0) {
      const firstTokenVal = lvl.required[0];
      const coord = getUniqueRandomCoordinates(occupied);
      occupied.push(coord);
      tokensRef.current.push({
        x: coord.x,
        y: coord.y,
        value: firstTokenVal,
        isCorrect: true
      });
    }

    // Spawn wrong syntax tokens
    lvl.wrongs.forEach((wrongVal) => {
      const coord = getUniqueRandomCoordinates(occupied);
      occupied.push(coord);
      tokensRef.current.push({
        x: coord.x,
        y: coord.y,
        value: wrongVal,
        isCorrect: false
      });
    });

    // Spawn Enemies (Bugs, Viruses) based on level index
    const bugCount = lvl.isBoss ? 4 : Math.min(5, Math.floor(lvl.level / 2) + 1);
    for (let i = 0; i < bugCount; i++) {
      const coord = getUniqueRandomCoordinates(occupied);
      occupied.push(coord);
      enemiesRef.current.push({
        x: coord.x,
        y: coord.y,
        type: lvl.isBoss ? 'virus' : (Math.random() > 0.5 ? 'bug' : 'virus'),
        dx: Math.random() > 0.5 ? 1 : -1,
        dy: Math.random() > 0.5 ? 1 : -1
      });
    }

    // Spawn random power-up on grid
    const powerTypes = ['shield', 'speed', 'magnet', 'freeze', 'scan'];
    const coord = getUniqueRandomCoordinates(occupied);
    powerUpsRef.current.push({
      x: coord.x,
      y: coord.y,
      type: powerTypes[Math.floor(Math.random() * powerTypes.length)]
    });
  };

  // Particle explosion trigger
  const spawnExplosion = (x, y, color) => {
    for (let i = 0; i < 15; i++) {
      particlesRef.current.push({
        x: x * 25 + 12.5,
        y: y * 25 + 12.5,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        radius: Math.random() * 3 + 1.5,
        alpha: 1,
        color: color
      });
    }
  };

  // Trigger screen vibrations
  const triggerScreenShake = () => {
    setShakeActive(true);
    setTimeout(() => setShakeActive(false), 450);
  };

  // Game over state
  const handleGameOver = () => {
    setGameState('gameover');
    if (soundEnabled) snakeAudio.playError();
    triggerNotification('👾 GAME OVER', 'Compiling error: System lockout activated!', '❌');
  };

  // Level cleared
  const handleLevelClear = () => {
    setGameState('level_clear');
    if (soundEnabled) snakeAudio.playLevelComplete();

    // Reward player
    addXP(50);
    addCoins(30);
    triggerNotification('🎉 Level Cleared!', 'Claimed +50 XP and +30 Coins!', '🏆');

    // Unlock badge if Level 5 cleared
    if (activeLevel.level === 5) {
      triggerNotification('🏆 New Achievement Unlocked!', 'Syntactic Reptile Badge Unlocked!', '🐍');
    }
  };

  // Campaign complete
  const handleVictory = () => {
    setGameState('victory');
    if (soundEnabled) snakeAudio.playLevelComplete();
    addXP(200);
    addCoins(100);
    triggerNotification('👑 CAMPAIGN COMPLETE!', 'Defeated SQL Injector Boss! +200 XP!', '🌟');
  };

  // Update position, coordinates, items
  const updateGamePhysics = () => {
    const snake = [...snakeRef.current];
    const head = { ...snake[0] };
    const dir = directionRef.current;

    // Direct translation
    if (dir === 'UP') head.y -= 1;
    else if (dir === 'DOWN') head.y += 1;
    else if (dir === 'LEFT') head.x -= 1;
    else if (dir === 'RIGHT') head.x += 1;

    // Wrap around logic (Arcade feel)
    if (head.x < 0) head.x = gridWidth - 1;
    else if (head.x >= gridWidth) head.x = 0;
    if (head.y < 0) head.y = gridHeight - 1;
    else if (head.y >= gridHeight) head.y = 0;

    // Body segments collision (Segmentation fault)
    for (let i = 1; i < snake.length; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) {
        if (shieldActive) {
          setShieldActive(false);
          triggerNotification('🛡️ Shield Exhausted', 'Self-collision absorbed!', '⚡');
        } else {
          setHealth((h) => {
            const nextH = h - 25;
            if (nextH <= 0) handleGameOver();
            return Math.max(0, nextH);
          });
          triggerScreenShake();
          if (soundEnabled) snakeAudio.playError();
        }
      }
    }

    // Insert new head
    snake.unshift(head);

    // Collide with Floating Code Tokens
    let eaten = false;
    tokensRef.current = tokensRef.current.filter((token) => {
      if (token.x === head.x && token.y === head.y) {
        eaten = true;
        
        const expectedToken = activeLevel.required[collectedTokens.length];
        const isCorrectNext = token.value === expectedToken;

        if (isCorrectNext) {
          // Collected correct keyword in sequence
          if (soundEnabled) snakeAudio.playCollect();
          spawnExplosion(token.x, token.y, '#10B981');
          
          const newCollected = [...collectedTokens, token.value];
          setCollectedTokens(newCollected);

          // Check if level goals achieved
          const requiredCollected = newCollected.length === activeLevel.required.length;
          if (requiredCollected) {
            if (activeLevel.isBoss) {
              setBossHp((prevHp) => {
                const nextHp = prevHp - 1;
                if (soundEnabled) snakeAudio.playBossHit();
                if (nextHp <= 0) {
                  handleVictory();
                } else {
                  triggerNotification('💥 Boss Damaged!', `SQL Injector Boss HP at ${nextHp}/5!`, '👾');
                  // Reset collected tokens and respawn initial elements of the round
                  setCollectedTokens([]);
                  spawnInitialElements(activeLevel);
                }
                return nextHp;
              });
            } else {
              handleLevelClear();
            }
          } else {
            // Spawn the NEXT correct token immediately!
            const nextTokenVal = activeLevel.required[newCollected.length];
            if (nextTokenVal) {
              const occupied = [...snake, ...tokensRef.current, ...enemiesRef.current, ...powerUpsRef.current];
              const coord = getUniqueRandomCoordinates(occupied);
              tokensRef.current.push({
                x: coord.x,
                y: coord.y,
                value: nextTokenVal,
                isCorrect: true
              });
            }
          }

          setScore((s) => s + 10 * combo);
          setCombo((c) => Math.min(10, c + 1));
        } else {
          // Ate wrong keyword or incorrect next token in sequence!
          if (shieldActive) {
            setShieldActive(false);
            triggerNotification('🛡️ Shield Absorbed', 'Syntax error neutralized!', '⚡');
          } else {
            if (soundEnabled) snakeAudio.playError();
            spawnExplosion(token.x, token.y, '#EF4444');
            triggerScreenShake();
            setHealth((h) => {
              const next = h - 20;
              if (next <= 0) handleGameOver();
              return Math.max(0, next);
            });
            // Shrink tail
            if (snake.length > 2) snake.pop();
            setCombo(1);
          }
          
          if (token.isCorrect) {
            // Relocate correct token to prevent soft-locking the level
            const coord = getUniqueRandomCoordinates([...snake, ...tokensRef.current]);
            token.x = coord.x;
            token.y = coord.y;
            return true; // Keep in array
          }
        }
        return false; // Remove token
      }
      return true;
    });

    if (!eaten) {
      snake.pop(); // Standard move: remove tail
    }

    // Collide with Power-ups
    powerUpsRef.current = powerUpsRef.current.filter((pw) => {
      if (pw.x === head.x && pw.y === head.y) {
        if (soundEnabled) snakeAudio.playCollect();
        spawnExplosion(pw.x, pw.y, '#00F3FF');

        if (pw.type === 'shield') {
          setShieldActive(true);
          triggerNotification('🛡️ Debug Shield Active', 'Neutralizes next syntax crash!', '✨');
        } else if (pw.type === 'speed') {
          setSpeedActive(true);
          setTimeout(() => setSpeedActive(false), 8000);
          triggerNotification('⚡ Speed Boost Active', 'Double speed and score rates!', '✨');
        } else if (pw.type === 'magnet') {
          setMagnetActive(true);
          setTimeout(() => setMagnetActive(false), 10000);
          triggerNotification('🧲 Token Magnet Active', 'Pulls code inputs closer!', '✨');
        } else if (pw.type === 'freeze') {
          setFreezeActive(true);
          setTimeout(() => setFreezeActive(false), 8000);
          triggerNotification('❄️ Time Freeze Active', 'Timer clock suspended!', '✨');
        } else if (pw.type === 'scan') {
          setScannerActive(true);
          setTimeout(() => setScannerActive(false), 12000);
          triggerNotification('🔍 Syntax Scanner Active', 'Scanning next correct token!', '✨');
        }
        return false;
      }
      return true;
    });

    // Update particles
    particlesRef.current = particlesRef.current.map((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.04;
      return p;
    }).filter((p) => p.alpha > 0);

    // Update Enemies (Bugs, Viruses crawling) - slowed down to 1/3 speed!
    enemyTickRef.current += 1;
    if (enemyTickRef.current % 3 === 0) {
      enemiesRef.current.forEach((enemy) => {
        // Random crawler motion
        if (enemy.type === 'bug') {
          if (Math.random() > 0.8) {
            enemy.dx = Math.random() > 0.5 ? 1 : -1;
            enemy.dy = Math.random() > 0.5 ? 1 : -1;
          }
          enemy.x += enemy.dx;
          enemy.y += enemy.dy;
        } else {
          // Virus tracks snake head
          if (Math.random() > 0.55) {
            enemy.x += head.x > enemy.x ? 1 : -1;
            enemy.y += head.y > enemy.y ? 1 : -1;
          }
        }

        // Bound check
        if (enemy.x < 0) enemy.x = gridWidth - 1;
        else if (enemy.x >= gridWidth) enemy.x = 0;
        if (enemy.y < 0) enemy.y = gridHeight - 1;
        else if (enemy.y >= gridHeight) enemy.y = 0;
      });
    }

    // Collision check runs every single tick to prevent passing through
    enemiesRef.current.forEach((enemy) => {
      // Crash into snake
      if (enemy.x === head.x && enemy.y === head.y) {
        if (shieldActive) {
          setShieldActive(false);
          triggerNotification('🛡️ Shield Depleted', 'Virus attack neutralized!', '✨');
        } else {
          setHealth((h) => {
            const next = h - 25;
            if (next <= 0) handleGameOver();
            return Math.max(0, next);
          });
          triggerScreenShake();
          if (soundEnabled) snakeAudio.playError();
        }
      }
    });

    // Magnet power-up pulling code elements
    if (magnetActive) {
      tokensRef.current.forEach((t) => {
        if (t.isCorrect) {
          const dx = head.x - t.x;
          const dy = head.y - t.y;
          if (Math.abs(dx) <= 4 && Math.abs(dy) <= 4) {
            t.x += dx > 0 ? 1 : dx < 0 ? -1 : 0;
            t.y += dy > 0 ? 1 : dy < 0 ? -1 : 0;
          }
        }
      });
    }

    // Update ref
    snakeRef.current = snake;
  };

  // Render pixels on canvas
  const drawCanvas = (ctx) => {
    ctx.clearRect(0, 0, 600, 350);

    // 1. Draw Circuit background grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < gridWidth; x++) {
      ctx.beginPath();
      ctx.moveTo(x * 25, 0);
      ctx.lineTo(x * 25, 350);
      ctx.stroke();
    }
    for (let y = 0; y < gridHeight; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * 25);
      ctx.lineTo(600, y * 25);
      ctx.stroke();
    }

    // 2. Draw active power-ups
    powerUpsRef.current.forEach((pw) => {
      ctx.font = '14px Outfit';
      ctx.fillText(pw.type === 'shield' ? '🛡️' : pw.type === 'speed' ? '⚡' : pw.type === 'magnet' ? '🧲' : pw.type === 'freeze' ? '❄️' : '🔍', pw.x * 25 + 5, pw.y * 25 + 18);
    });

    // 3. Draw enemies
    enemiesRef.current.forEach((enemy) => {
      ctx.font = '14px Outfit';
      ctx.fillText(enemy.type === 'bug' ? '🐛' : '👾', enemy.x * 25 + 5, enemy.y * 25 + 18);
    });

    // 4. Draw Floating Tokens
    tokensRef.current.forEach((token) => {
      const expectedToken = activeLevel.required[collectedTokens.length];
      const isCurrentTarget = token.value === expectedToken;
      
      // Correctly handle duplicates by counting total required vs collected occurrences
      const requiredOccurrences = activeLevel.required.filter(val => val === token.value).length;
      const collectedOccurrences = collectedTokens.filter(val => val === token.value).length;
      const isFutureTarget = requiredOccurrences > collectedOccurrences && !isCurrentTarget;
      
      const isNextTarget = scannerActive && isCurrentTarget;
      
      let tokenColor = '#EF4444'; // Red for wrong syntax / error
      if (isCurrentTarget) {
        tokenColor = '#10B981'; // Green for active expected token
      } else if (isFutureTarget) {
        tokenColor = '#F59E0B'; // Amber for future required tokens
      }

      ctx.fillStyle = tokenColor;
      ctx.strokeStyle = isNextTarget ? '#00F3FF' : 'rgba(255,255,255,0.2)';
      ctx.lineWidth = isNextTarget ? 3 : 1;

      // Draw token capsule pill
      ctx.beginPath();
      ctx.roundRect(token.x * 25 + 2, token.y * 25 + 2, 21, 21, 6);
      ctx.fill();
      ctx.stroke();

      // Label text
      ctx.fillStyle = '#000';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(token.value.substring(0, 4), token.x * 25 + 12.5, token.y * 25 + 15);
    });

    // 5. Draw Glowing Snake body data stream
    snakeRef.current.forEach((segment, idx) => {
      ctx.fillStyle = idx === 0 ? 'var(--accent-secondary)' : 'var(--accent-color)';
      ctx.beginPath();
      ctx.roundRect(segment.x * 25 + 1.5, segment.y * 25 + 1.5, 22, 22, 8);
      ctx.fill();

      // Renders code snippet letter inside body
      if (idx > 0 && idx <= collectedTokens.length) {
        ctx.fillStyle = '#fff';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(collectedTokens[idx - 1].substring(0, 3), segment.x * 25 + 12.5, segment.y * 25 + 14);
      }
    });

    // 6. Draw particles
    particlesRef.current.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  };

  // Manual redirect buttons for mobile/tablet arrow pads
  const handleMobilePress = (dir) => {
    const current = directionRef.current;
    if (dir === 'UP' && current !== 'DOWN') directionRef.current = 'UP';
    if (dir === 'DOWN' && current !== 'UP') directionRef.current = 'DOWN';
    if (dir === 'LEFT' && current !== 'RIGHT') directionRef.current = 'LEFT';
    if (dir === 'RIGHT' && current !== 'LEFT') directionRef.current = 'RIGHT';
  };

  return (
    <div style={styles.container} className={`grid-overlay ${shakeActive ? 'shake-animation' : ''}`}>
      {/* HUD Header info panel */}
      <div style={styles.hudHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Radio className="pulse-glow-animation" size={16} color="var(--accent-secondary)" />
          <span style={styles.headerTitle}>CODE_SNAKE.SYS v1.2</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            style={styles.audioToggle}
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button style={styles.exitBtn} onClick={() => setGame('hub')}>
            <Home size={14} /> Exit
          </button>
        </div>
      </div>

      {gameState === 'menu' && (
        <div className="game-card" style={styles.menuBox}>
          <Trophy size={48} color="#FFD700" className="float-animation" />
          <h2 style={styles.title}>CODE SNAKE ARENA</h2>
          <p style={styles.desc}>
            Control your AI data stream utilizing <strong>Arrow Keys / WASD</strong>. Collect syntactical tokens to complete compile goals and avoid bugs.
          </p>

          <div style={styles.levelsGrid}>
            {LEVELS_POOL.map((lvlPool, idx) => {
              const lvl = lvlPool[daySeed % lvlPool.length];
              return (
                <button
                  key={idx}
                  className="game-btn game-btn-primary"
                  style={{
                    ...styles.levelBtn,
                    borderColor: lvl.isBoss ? 'var(--danger-color)' : 'rgba(255,255,255,0.08)',
                    background: lvl.isBoss ? 'linear-gradient(135deg, #7f1d1d 0%, #1e1b4b 100%)' : 'rgba(255,255,255,0.02)'
                  }}
                  onClick={() => startLevel(idx)}
                >
                  <div>LVL {lvl.level}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{lvl.title}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div style={styles.playingLayout}>
          {/* Active Level Meta details */}
          <div className="game-card" style={styles.metaCard}>
            <div style={styles.metaRow}>
              <span>🎯 Level: {activeLevel.level}</span>
              <span style={{ color: 'var(--accent-secondary)' }}>{activeLevel.title}</span>
            </div>
            <p style={styles.instructionText}>{activeLevel.instruction}</p>

            <div style={styles.goalsContainer}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>PROGRESS:</span>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '6px' }}>
                {activeLevel.required.map((req, idx) => {
                  const isCollected = idx < collectedTokens.length;
                  const isActive = idx === collectedTokens.length;
                  
                  let badgeStyle = { ...styles.goalBadge };
                  let statusIcon = '⏳';
                  
                  if (isCollected) {
                    badgeStyle.backgroundColor = 'rgba(16, 185, 129, 0.2)';
                    badgeStyle.borderColor = 'var(--success-color)';
                    badgeStyle.color = 'var(--success-color)';
                    statusIcon = '✅';
                  } else if (isActive) {
                    badgeStyle.backgroundColor = 'rgba(0, 243, 255, 0.2)';
                    badgeStyle.borderColor = 'var(--accent-secondary)';
                    badgeStyle.color = 'var(--accent-secondary)';
                    badgeStyle.boxShadow = '0 0 10px rgba(0, 243, 255, 0.4)';
                    statusIcon = '🎯';
                  } else {
                    badgeStyle.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                    badgeStyle.borderColor = 'rgba(255, 255, 255, 0.05)';
                    badgeStyle.color = 'rgba(255, 255, 255, 0.2)';
                    statusIcon = '🔒';
                  }

                  return (
                    <span key={idx} style={badgeStyle}>
                      {statusIcon} {req}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Boss Health Bar */}
            {activeLevel.isBoss && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--danger-color)' }}>
                  <span>👾 SQL INJECTOR HP</span>
                  <span>{bossHp}/5 LIVES</span>
                </div>
                <div style={styles.bossHpContainer}>
                  <div style={{ ...styles.bossHpFill, width: `${(bossHp / 5) * 100}%` }}></div>
                </div>
              </div>
            )}

            {/* Active Indicators */}
            <div style={styles.activeIndicators}>
              {shieldActive && <span style={styles.powerIndicator}>🛡️ Shield</span>}
              {speedActive && <span style={styles.powerIndicator}>⚡ Speed</span>}
              {magnetActive && <span style={styles.powerIndicator}>🧲 Magnet</span>}
              {freezeActive && <span style={styles.powerIndicator}>❄️ Frozen</span>}
              {scannerActive && <span style={styles.powerIndicator}>🔍 Scanner</span>}
            </div>
          </div>

          {/* Center Sandbox Canvas */}
          <div style={styles.canvasContainer} className="game-card">
            <canvas ref={canvasRef} width={600} height={350} style={styles.canvasElement}></canvas>

            {/* Mobile / Tablet Touch Arrows controller pads */}
            <div style={styles.mobileDpad} className="mobile-dpad">
              <button style={styles.dpadBtn} onClick={() => handleMobilePress('UP')}><ArrowUp size={20} /></button>
              <div style={{ display: 'flex', gap: '20px' }}>
                <button style={styles.dpadBtn} onClick={() => handleMobilePress('LEFT')}><ArrowLeft size={20} /></button>
                <button style={styles.dpadBtn} onClick={() => handleMobilePress('RIGHT')}><ArrowRight size={20} /></button>
              </div>
              <button style={styles.dpadBtn} onClick={() => handleMobilePress('DOWN')}><ArrowDown size={20} /></button>
            </div>
          </div>

          {/* Right Statistics parameters card */}
          <div className="game-card" style={styles.statsCard}>
            <div style={styles.statBox}>
              <Heart size={16} color="var(--danger-color)" />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem' }}>
                  <span>HEALTH</span>
                  <span>{health}%</span>
                </div>
                <div style={styles.healthBarContainer}>
                  <div style={{ ...styles.healthBarFill, width: `${health}%` }}></div>
                </div>
              </div>
            </div>

            <div style={styles.statMetric}>
              <span style={styles.metricLabel}>SCORE</span>
              <span style={styles.metricValue}>{score}</span>
            </div>

            <div style={styles.statMetric}>
              <span style={styles.metricLabel}>COMBO</span>
              <span style={styles.metricValue} className="pulse-glow-animation">x{combo}</span>
            </div>

            <div style={styles.statMetric}>
              <Clock size={16} color="var(--accent-secondary)" />
              <span style={{ ...styles.metricValue, color: timeRemaining < 15 ? 'var(--danger-color)' : 'var(--text-primary)' }}>
                {timeRemaining}s
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="game-card" style={styles.outcomeBox}>
          <AlertOctagon size={48} color="var(--danger-color)" className="shake-animation" />
          <h2 style={{ ...styles.title, color: 'var(--danger-color)' }}>COMPILATION FAILED</h2>
          <p style={styles.desc}>
            Your stream hit a fatal memory allocation bug. Fix your compiler arguments and rebuild the stack.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button className="game-btn game-btn-primary" onClick={() => startLevel(levelIdx)}>
              <RotateCcw size={14} /> Retry Level
            </button>
            <button className="game-btn" onClick={() => setGameState('menu')}>
              Return to Sector Select
            </button>
          </div>
        </div>
      )}

      {/* Level Complete Screen */}
      {gameState === 'level_clear' && (
        <div className="game-card" style={styles.outcomeBox}>
          <Award size={48} color="var(--success-color)" className="float-animation" />
          <h2 style={{ ...styles.title, color: 'var(--success-color)' }}>COMPILATION SUCCESS!</h2>
          <p style={styles.desc}>
            Tokens verified. Releasing heap resources and caching segment definitions.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            {levelIdx < LEVELS_POOL.length - 1 ? (
              <button className="game-btn game-btn-primary" onClick={() => startLevel(levelIdx + 1)}>
                Next Level <ChevronRight size={14} />
              </button>
            ) : (
              <button className="game-btn game-btn-primary" onClick={() => startLevel(levelIdx)}>
                Replay Boss Level
              </button>
            )}
            <button className="game-btn" onClick={() => setGameState('menu')}>
              Sector Grid Map
            </button>
          </div>
        </div>
      )}

      {/* Victory Screen */}
      {gameState === 'victory' && (
        <div className="game-card" style={styles.outcomeBox}>
          <Trophy size={64} color="#FFD700" className="pulse-glow-animation" />
          <h2 style={{ ...styles.title, color: 'var(--success-color)' }}>👾 SQL INJECTOR DEFEATED!</h2>
          <p style={styles.desc}>
            Awesome job! You assembled the query blocks perfectly, bypassed malicious injection statements, and cleaned the compiler stack!
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button className="game-btn game-btn-primary" onClick={() => setGame('hub')}>
              <Home size={14} /> Back to Hub
            </button>
            <button className="game-btn" onClick={() => setGameState('menu')}>
              Replay Levels
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    height: 'calc(100vh - 70px)',
    width: '100vw',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflowY: 'auto',
    backgroundColor: '#07090E',
  },
  hudHeader: {
    width: '100%',
    maxWidth: '1000px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  headerTitle: {
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--accent-secondary)',
    letterSpacing: '1px',
  },
  audioToggle: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
  },
  exitBtn: {
    fontSize: '0.7rem',
    padding: '4px 10px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#EF4444',
    color: '#EF4444',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  menuBox: {
    width: '100%',
    maxWidth: '800px',
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    backgroundColor: 'rgba(19, 23, 34, 0.85)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    boxShadow: 'var(--shadow)',
    backdropFilter: 'blur(10px)',
  },
  title: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.75rem',
    letterSpacing: '2px',
    marginTop: '1rem',
    color: 'var(--text-primary)',
  },
  desc: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    maxWidth: '500px',
    margin: '0.75rem 0 2rem 0',
    lineHeight: '1.5',
  },
  levelsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    width: '100%',
    marginTop: '1rem',
  },
  levelBtn: {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    borderRadius: '12px',
    fontFamily: 'var(--font-title)',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  playingLayout: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 2fr 1fr',
    gap: '1.5rem',
    width: '100%',
    maxWidth: '1000px',
    alignItems: 'start',
  },
  metaCard: {
    padding: '1.5rem',
    backgroundColor: 'rgba(19, 23, 34, 0.85)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    backdropFilter: 'blur(10px)',
  },
  metaRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    fontFamily: 'var(--font-title)',
  },
  instructionText: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    marginTop: '0.5rem',
    lineHeight: '1.4',
  },
  goalsContainer: {
    marginTop: '1.25rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  goalBadge: {
    fontSize: '0.65rem',
    padding: '3px 8px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderRadius: '6px',
    fontFamily: 'var(--font-mono)',
  },
  activeIndicators: {
    display: 'flex',
    gap: '0.4rem',
    flexWrap: 'wrap',
    marginTop: '1rem',
  },
  powerIndicator: {
    fontSize: '0.65rem',
    padding: '2px 6px',
    backgroundColor: 'rgba(0, 243, 255, 0.1)',
    borderColor: '#00F3FF',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderRadius: '4px',
    color: '#00F3FF',
  },
  bossHpContainer: {
    height: '6px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginTop: '6px',
  },
  bossHpFill: {
    height: '100%',
    backgroundColor: 'var(--danger-color)',
    boxShadow: '0 0 8px var(--danger-color)',
    borderRadius: '3px',
  },
  canvasContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0.5rem',
    backgroundColor: 'rgba(19, 23, 34, 0.85)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    backdropFilter: 'blur(10px)',
    position: 'relative',
  },
  canvasElement: {
    backgroundColor: '#090B10',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.02)',
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)',
    display: 'block',
    width: '100%',
    maxWidth: '600px',
    height: 'auto',
  },
  mobileDpad: {
    display: 'none', // Shown only on mobile screens via CSS media overrides
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    marginTop: '1.25rem',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: '12px',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  dpadBtn: {
    width: '45px',
    height: '45px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, rgba(27,33,50,0.8) 0%, rgba(19,23,34,0.8) 100%)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: 'var(--accent-secondary)',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  },
  statsCard: {
    padding: '1.5rem',
    backgroundColor: 'rgba(19, 23, 34, 0.85)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  statBox: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: '10px',
    borderRadius: '12px',
  },
  healthBarContainer: {
    height: '5px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '2.5px',
    overflow: 'hidden',
    marginTop: '4px',
  },
  healthBarFill: {
    height: '100%',
    backgroundColor: 'var(--danger-color)',
    borderRadius: '2.5px',
  },
  statMetric: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: '10px 14px',
    borderRadius: '12px',
  },
  metricLabel: {
    fontSize: '0.65rem',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-title)',
  },
  metricValue: {
    fontSize: '1rem',
    fontWeight: 'bold',
    fontFamily: 'var(--font-mono)',
  },
  outcomeBox: {
    width: '100%',
    maxWidth: '550px',
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    backgroundColor: 'rgba(19, 23, 34, 0.9)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    boxShadow: 'var(--shadow)',
    backdropFilter: 'blur(12px)',
  }
};
