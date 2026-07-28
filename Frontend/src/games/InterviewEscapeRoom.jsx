import React, { useState, useEffect, useRef } from 'react';
import ConfettiEffect from '../components/ConfettiEffect';
import { usePlayerStore } from '../store/usePlayerStore';
import { 
  Terminal, Shield, ShieldAlert, Cpu, Database, Play, ChevronRight, 
  Award, Volume2, VolumeX, Eye, Search, AlertCircle, Info, Sparkles,
  Zap, Clock, CheckCircle2, XCircle, Layout, HardDrive, RefreshCw, Key, Heart
} from 'lucide-react';

// Escape Room Synthesized Audio Engine
const escapeAudio = {
  ctx: null,
  masterGain: null,
  isEnabled: true,
  bgmInterval: null,
  bgmStep: 0,

  init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.12, this.ctx.currentTime); // Boosted master gain volume
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Escape audio engine failed to load:", e);
    }
  },

  playBgm(speedMs = 400) {
    this.init();
    if (!this.ctx || this.bgmInterval || !this.isEnabled) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    // Mysterious ambient chime chords loop
    const melody = [220.00, 261.63, 293.66, 329.63, 392.00, 329.63, 293.66, 261.63];

    this.bgmStep = 0;
    this.bgmInterval = setInterval(() => {
      const time = this.ctx.currentTime;
      
      // Soft ambient low chime (triangle)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(melody[this.bgmStep % melody.length] / 2, time);

      gain.gain.setValueAtTime(0.12, time);
      gain.gain.linearRampToValueAtTime(0.001, time + (speedMs / 1000) - 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + (speedMs / 1000));

      this.bgmStep++;
    }, speedMs);
  },

  stopBgm() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  },

  playBeep(freq = 440, duration = 0.1, type = 'sine') {
    this.init();
    if (!this.ctx || !this.isEnabled) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.linearRampToValueAtTime(0.001, time + duration - 0.02);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + duration);
  },

  playDoorOpen() {
    this.init();
    if (!this.ctx || !this.isEnabled) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, time);
    osc.frequency.linearRampToValueAtTime(600, time + 0.3);

    gain.gain.setValueAtTime(0.15, time);
    gain.gain.linearRampToValueAtTime(0.001, time + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.31);
  },

  playBridgeCollapse() {
    this.init();
    if (!this.ctx || !this.isEnabled) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.linearRampToValueAtTime(40, time + 0.5);

    gain.gain.setValueAtTime(0.2, time);
    gain.gain.linearRampToValueAtTime(0.001, time + 0.5);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.51);
  }
};

// 10 Progressive Levels Data
const ESCAPE_LEVELS = [
  {
    level: 1,
    title: 'System Infiltration Lobby',
    difficulty: 'Easy',
    sqlChallenge: {
      dbTable: 'security_cameras',
      instructions: 'Open the gate! Query all cameras with status OFFLINE.',
      expectedQuery: "SELECT * FROM security_cameras WHERE status = 'OFFLINE';",
      tip: "Syntax: SELECT * FROM security_cameras WHERE status = 'OFFLINE';"
    },
    dsaChallenge: {
      question: 'Which traversal algorithm searches level-by-level to find the shortest path in unweighted graphs?',
      options: ['Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'Quick Sort', 'Bubble Sort'],
      correctIndex: 1,
      tip: 'BFS visits neighbors step-by-step, finding the optimal bridge link.'
    },
    codingChallenge: {
      file: 'boot.js',
      code: [
        "function initRobot() {",
        "  let status = null; // BUG HERE!",
        "  if (status === 'ACTIVE') {",
        "    return 'ONLINE';",
        "  }",
        "}"
      ],
      bugLine: 1,
      expectedFix: "let status = 'ACTIVE';",
      tip: "Change null to 'ACTIVE' inside boot.js configuration."
    },
    hrChallenge: {
      question: "The Recruiter asks: 'How do you handle merge conflicts inside a team pipeline?'",
      options: [
        { text: "Force push my changes to override others' commits.", value: -20, feedback: "Incorrect. You overwrote teammates' progress!" },
        { text: "Call a huddle, review conflicting blocks together, and merge safely.", value: 20, feedback: "Excellent! Team collaboration preserves code integrity." },
        { text: "Ignore the conflict and assign it to another developer.", value: -10, feedback: "Avoidance drops trust." }
      ]
    },
    reward: { coins: 100, xp: 50 }
  },
  {
    level: 2,
    title: 'The Database Vault Breach',
    difficulty: 'Medium',
    sqlChallenge: {
      dbTable: 'network_logs',
      instructions: 'Bypass firewall logs! Fetch IP addresses starting with 192.168.4. and actions of DENIED.',
      expectedQuery: "SELECT * FROM network_logs WHERE ip_address LIKE '192.168.4.%' AND action = 'DENIED';",
      tip: "Use LIKE with wildcards: ip_address LIKE '192.168.4.%'"
    },
    dsaChallenge: {
      question: 'Which sorting algorithm has a guaranteed O(n log n) worst-case time complexity and preserves element stability?',
      options: ['Quick Sort', 'Merge Sort', 'Selection Sort', 'Insertion Sort'],
      correctIndex: 1,
      tip: 'Merge Sort guarantees O(n log n) stable partitions.'
    },
    codingChallenge: {
      file: 'vault.cpp',
      code: [
        "void unlockVault() {",
        "  int* key = new int(101);",
        "  // BUG: key pointer is leaked without deleting!",
        "  // delete key; missing",
        "}"
      ],
      bugLine: 2,
      expectedFix: "delete key;",
      tip: "Type delete key; to free allocated heap blocks."
    },
    hrChallenge: {
      question: "The Recruiter asks: 'If a project is running late, how do you communicate it?'",
      options: [
        { text: "Wait until the deadline day and tell them it failed.", value: -30, feedback: "Worst practice. Communication must be proactive." },
        { text: "Alert stakeholders early, explain bottlenecks, and offer mitigation plans.", value: 30, feedback: "Awesome! Early transparency builds deep trust." },
        { text: "Overtime quietly and hope they do not notice.", value: -5, feedback: "Risks quality." }
      ]
    },
    reward: { coins: 120, xp: 60 }
  },
  {
    level: 3,
    title: 'Lobby Cryptographic Core',
    difficulty: 'Medium',
    sqlChallenge: {
      dbTable: 'badge_registry',
      instructions: 'Unlock Lobby Badge! Join employees and badge_registry on emp_id to select access_code for employee Thomas Anderson.',
      expectedQuery: "SELECT access_code FROM employees JOIN badge_registry ON employees.emp_id = badge_registry.emp_id WHERE name = 'Thomas Anderson';",
      tip: "Use JOIN ... ON employees.emp_id = badge_registry.emp_id"
    },
    dsaChallenge: {
      question: 'Which data structure utilizes a LIFO (Last-In-First-Out) rule to control execution loops?',
      options: ['Queue', 'Stack', 'Linked List', 'Priority Queue'],
      correctIndex: 1,
      tip: 'Stacks push and pop from the top in LIFO order.'
    },
    codingChallenge: {
      file: 'crypt.py',
      code: [
        "def decrypt(key):",
        "  if key == '':",
        "    return False",
        "  # BUG: Infinite recursive loop!",
        "  return decrypt(key)"
      ],
      bugLine: 4,
      expectedFix: "return key",
      tip: "Change recursive loop to return key variable directly."
    },
    hrChallenge: {
      question: "The Recruiter asks: 'How do you give feedback to a teammate?'",
      options: [
        { text: "Critique their work publicly in the Slack general channel.", value: -25, feedback: "Public criticism damages morale." },
        { text: "Provide constructive, actionable feedback privately using the feedback sandwich.", value: 25, feedback: "Fantastic! Empowers team growth." },
        { text: "Avoid giving feedback to maintain peace.", value: -5, feedback: "Bypasses improvement opportunities." }
      ]
    },
    reward: { coins: 150, xp: 75 }
  },
  {
    level: 4,
    title: 'API Gateway Firewall Control',
    difficulty: 'Hard',
    sqlChallenge: {
      dbTable: 'guard_patrols',
      instructions: 'Unlock Firewall node! Join guard_patrols and system_audit to retrieve zone for failed event logs.',
      expectedQuery: "SELECT zone FROM guard_patrols JOIN system_audit ON guard_patrols.guard_id = system_audit.user_id WHERE event_type = 'LOGIN_FAIL';",
      tip: "Use JOIN ... ON guard_id = user_id WHERE event_type = 'LOGIN_FAIL'"
    },
    dsaChallenge: {
      question: 'Which hash collision resolution strategy inserts elements into the next available slot sequentially?',
      options: ['Chaining', 'Linear Probing', 'Double Hashing', 'Rehashing'],
      correctIndex: 1,
      tip: 'Linear probing searches index + 1 sequentially for empty slots.'
    },
    codingChallenge: {
      file: 'server.js',
      code: [
        "const express = require('express');",
        "const app = express();",
        "// BUG: Dividing by zero on endpoint count!",
        "const activeCount = 100 / 0;"
      ],
      bugLine: 3,
      expectedFix: "const activeCount = 100 / 10;",
      tip: "Avoid divisions by zero inside server.js."
    },
    hrChallenge: {
      question: "The Recruiter asks: 'How do you handle disagreement with your Tech Lead?'",
      options: [
        { text: "Argue with them until they submit.", value: -20, feedback: "Incorrect. Respectful alignment is better." },
        { text: "Schedule a 1-on-1, explain my perspective with data, and align on a consensus.", value: 30, feedback: "Excellent! Constructive debate using metrics shows professional maturity." },
        { text: "Accept it quietly, then write different code behind their back.", value: -30, feedback: "Deceptive and violates team trust." }
      ]
    },
    reward: { coins: 180, xp: 90 }
  },
  {
    level: 5,
    title: 'The Mainframe System Core',
    difficulty: 'Expert',
    sqlChallenge: {
      dbTable: 'login_attempts',
      instructions: 'Expose intruders! Select count of login attempts grouping by username having count greater than 5.',
      expectedQuery: "SELECT username, COUNT(*) FROM login_attempts GROUP BY username HAVING COUNT(*) > 5;",
      tip: "Use GROUP BY username HAVING COUNT(*) > 5"
    },
    dsaChallenge: {
      question: 'What is the average time complexity to retrieve an element from a Hash Table with good distribution?',
      options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
      correctIndex: 0,
      tip: 'Hash tables offer constant O(1) lookups on average.'
    },
    codingChallenge: {
      file: 'leak.py',
      code: [
        "cache = []",
        "def process(data):",
        "  # BUG: Global array leak growing infinite memory!",
        "  global cache",
        "  cache.append(data)"
      ],
      bugLine: 0,
      expectedFix: "cache = None",
      tip: "Release global cache scope in Python arrays."
    },
    hrChallenge: {
      question: "The Recruiter asks: 'Why do you want to join our company?'",
      options: [
        { text: "Just for the high salary and corporate perks.", value: -10, feedback: "Lacks motivational alignment." },
        { text: "Your engineering culture, scaling products, and SDE alignment fits my career goals.", value: 30, feedback: "Brilliant! Researching culture shows true alignment." },
        { text: "My parents forced me to find any job.", value: -20, feedback: "Lacks motivation and interest." }
      ]
    },
    reward: { coins: 200, xp: 100 }
  }
];

export default function InterviewEscapeRoom() {
  const { coins, addCoins, addXP, setGame, completeDailyChallenge, triggerNotification, isMuted } = usePlayerStore();

  // Campaign level selector states
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [activeScreen, setActiveScreen] = useState('menu'); // 'menu', 'lobby', 'sql', 'dsa', 'coding', 'hr', 'ceo', 'victory', 'failed'
  
  // Custom states
  const activeLevel = ESCAPE_LEVELS[currentLevelIdx] || ESCAPE_LEVELS[0];
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [shakeActive, setShakeActive] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  const speakText = (text) => {
    if (isMuted || !soundEnabled) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.0;
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  const decryptEscapeSolution = () => {
    if (coins < 50) {
      triggerNotification('❌ Insufficient Coins', 'You need 50 SDE Coins to decrypt this solution.', '🪙');
      return;
    }

    if (activeScreen === 'sql') {
      addCoins(-50);
      setSqlQuery(activeLevel.sqlChallenge.expectedQuery);
      triggerNotification('🔓 Vault Decrypted', 'The correct query has been injected!', '💻');
    } else if (activeScreen === 'dsa') {
      addCoins(-50);
      handleSelectDsa(activeLevel.dsaChallenge.correctIndex);
      triggerNotification('🔓 Bridge Assembled', 'Correct traversal identified! Bridge assembled!', '🌉');
    } else if (activeScreen === 'coding') {
      addCoins(-50);
      setEditingLine(activeLevel.codingChallenge.bugLine);
      setLineEditText(activeLevel.codingChallenge.expectedFix);
      triggerNotification('🔓 Robot Decrypted', 'Correct logic fix prefilled in the editor!', '🤖');
    } else if (activeScreen === 'hr') {
      addCoins(-50);
      const bestOption = activeLevel.hrChallenge.options.reduce((max, opt) => opt.value > max.value ? opt : max, activeLevel.hrChallenge.options[0]);
      handleSelectHr(bestOption);
      triggerNotification('🔓 Advisor Advice', 'Selected the most professional communication response!', '👩‍💼');
    }
  };

  // Handle background music loop
  useEffect(() => {
    if (soundEnabled && activeScreen !== 'menu') {
      escapeAudio.isEnabled = true;
      escapeAudio.stopBgm();
      escapeAudio.playBgm();
    } else {
      escapeAudio.stopBgm();
    }
    return () => escapeAudio.stopBgm();
  }, [soundEnabled, activeScreen]);

  // SQL Vault Chamber states
  const [sqlQuery, setSqlQuery] = useState('');
  const [vaultUnlocked, setVaultUnlocked] = useState(false);

  // DSA Bridge Chasm states
  const [dsaChoice, setDsaChoice] = useState(null);
  const [bridgeAnimationState, setBridgeAnimationState] = useState('broken'); // 'broken', 'building', 'collapsed', 'complete'
  const canvasRef = useRef(null);

  // Coding Room Robot states
  const [codeLines, setCodeLines] = useState(activeLevel.codingChallenge.code);
  const [editingLine, setEditingLine] = useState(null);
  const [lineEditText, setLineEditText] = useState('');
  const [robotBooted, setRobotBooted] = useState(false);

  // HR Room dialogue states
  const [hrChoice, setHrChoice] = useState(null);
  const [recruiterRelation, setRecruiterRelation] = useState(50); // Scale of 0 - 100
  const [dialogueText, setDialogueText] = useState(activeLevel.hrChallenge.question);

  // Completed room checklist for active level
  const [completedRooms, setCompletedRooms] = useState({
    sql: false,
    dsa: false,
    coding: false,
    hr: false
  });

  // Track zoom transition state
  const [isZooming, setIsZooming] = useState(false);

  // Render bridge animations on canvas
  useEffect(() => {
    if (activeScreen !== 'dsa' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let frameId;
    let bridgeProgress = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Chasm Sides
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 80, canvas.height);
      ctx.fillRect(canvas.width - 80, 0, 80, canvas.height);

      // Draw danger lasers in chasm base
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.moveTo(i, canvas.height - 20);
        ctx.lineTo(i + 10, canvas.height - 10);
      }
      ctx.stroke();

      if (bridgeAnimationState === 'building') {
        bridgeProgress = Math.min(100, bridgeProgress + 2);
        ctx.fillStyle = '#00F3FF';
        ctx.shadowColor = '#00F3FF';
        ctx.shadowBlur = 10;
        ctx.fillRect(80, canvas.height / 2 - 10, (canvas.width - 160) * (bridgeProgress / 100), 20);
        ctx.shadowBlur = 0;

        if (bridgeProgress >= 100) {
          setBridgeAnimationState('complete');
          setCompletedRooms(prev => ({ ...prev, dsa: true }));
        }
      } else if (bridgeAnimationState === 'complete') {
        ctx.fillStyle = '#10B981'; // Green complete bridge
        ctx.fillRect(80, canvas.height / 2 - 10, canvas.width - 160, 20);
      } else if (bridgeAnimationState === 'collapsed') {
        // Red falling fragments
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(80, canvas.height / 2 + 10, 60, 10);
        ctx.fillRect(160, canvas.height / 2 + 30, 40, 10);
        ctx.fillRect(240, canvas.height / 2 + 50, 50, 10);
      } else {
        // Broken indicator
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(80, canvas.height / 2 - 10, canvas.width - 160, 20);
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.font = '10px monospace';
        ctx.fillText('⚡ Algorithmic assembly bridge broken', canvas.width / 2 - 90, canvas.height / 2 + 4);
      }

      frameId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frameId);
  }, [activeScreen, bridgeAnimationState]);

  // Handle entering a room with transition zooms
  const enterRoom = (room) => {
    setIsZooming(true);
    if (soundEnabled) escapeAudio.playBeep(523.25, 0.15); // C5 tone
    
    setTimeout(() => {
      setActiveScreen(room);
      setIsZooming(false);
      speakText(`Entering the ${room.toUpperCase()} chamber.`);
    }, 600);
  };

  // SQL Vault validation
  const handleVerifySql = () => {
    const queryClean = sqlQuery.trim().toLowerCase().replace(/\s+/g, ' ');
    const expectedClean = activeLevel.sqlChallenge.expectedQuery.toLowerCase().replace(/\s+/g, ' ');

    if (queryClean === expectedClean) {
      setVaultUnlocked(true);
      if (soundEnabled) escapeAudio.playDoorOpen();
      setCompletedRooms(prev => ({ ...prev, sql: true }));
      speakText("Database decrypted. SQL lock deactivated!");
    } else {
      setShakeActive(true);
      setTimeout(() => setShakeActive(false), 500);
      if (soundEnabled) escapeAudio.playBeep(180, 0.3, 'sawtooth');
      triggerNotification('🚨 DATABASE REJECT', 'Query compilation failed. Security lockout active!', '❌');
      speakText("Access denied. Query constraint error.");
    }
  };

  // DSA bridge builder choice selector
  const handleSelectDsa = (idx) => {
    setDsaChoice(idx);
    if (idx === activeLevel.dsaChallenge.correctIndex) {
      setBridgeAnimationState('building');
      if (soundEnabled) escapeAudio.playDoorOpen();
      speakText("Algorithmic assembly complete. Bridge building active.");
    } else {
      setShakeActive(true);
      setTimeout(() => setShakeActive(false), 500);
      setBridgeAnimationState('collapsed');
      if (soundEnabled) escapeAudio.playBridgeCollapse();
      triggerNotification('💥 BRIDGE COLLAPSED', 'Bubble Sort was too slow! Your spaceship fell into the chasm.', '❌');
      speakText("Fatal complexity exception. Bridge collapsed!");
    }
  };

  // Code debug validation
  const handleInspectLine = (idx) => {
    setEditingLine(idx);
    setLineEditText(codeLines[idx]);
  };

  const handleCompileFix = () => {
    if (editingLine === activeLevel.codingChallenge.bugLine) {
      if (lineEditText.trim() === activeLevel.codingChallenge.expectedFix) {
        // Correct fix
        const nextLines = [...codeLines];
        nextLines[editingLine] = lineEditText;
        setCodeLines(nextLines);
        setRobotBooted(true);
        setEditingLine(null);
        if (soundEnabled) escapeAudio.playDoorOpen();
        setCompletedRooms(prev => ({ ...prev, coding: true }));
        speakText("Syntax patched successfully. Robot core booted.");
      } else {
        setShakeActive(true);
        setTimeout(() => setShakeActive(false), 500);
        if (soundEnabled) escapeAudio.playBeep(180, 0.3, 'triangle');
        triggerNotification('🚨 SYNTAX ERROR', 'The robot logic rejected your patch code!', '❌');
        speakText("Compile check failed. Patch code rejected.");
      }
    } else {
      setShakeActive(true);
      setTimeout(() => setShakeActive(false), 500);
      if (soundEnabled) escapeAudio.playBeep(180, 0.3, 'triangle');
      triggerNotification('🚨 COMPILER OUTAGE', 'You edited a fully healthy system line!', '❌');
      setEditingLine(null);
      speakText("Compiler warning. Healthy line compile crash.");
    }
  };

  // HR Dialog responses
  const handleSelectHr = (choice) => {
    setHrChoice(choice);
    if (choice.value < 0) {
      setShakeActive(true);
      setTimeout(() => setShakeActive(false), 500);
    }
    setRecruiterRelation(prev => Math.min(100, Math.max(0, prev + choice.value)));
    setDialogueText(choice.feedback);
    setCompletedRooms(prev => ({ ...prev, hr: true }));
    speakText(choice.feedback);
  };

  // CEO evaluation
  const handleEvaluateOffer = () => {
    if (recruiterRelation >= 65) {
      // Unlocked next level
      setUnlockedLevel(prev => Math.max(prev, activeLevel.level + 1));
      setConfettiActive(true);
      if (localStorage.getItem('active_daily_challenge_game') === 'interview-escape') {
        completeDailyChallenge();
      }
      setActiveScreen('victory');
      if (soundEnabled) escapeAudio.playBeep(659.25, 0.3); // E5 arpeggio
      speakText("Congratulations! Your interview benchmarks are impressive. We extend an SDE offer letter!");
    } else {
      setShakeActive(true);
      setTimeout(() => setShakeActive(false), 500);
      setActiveScreen('failed');
      if (soundEnabled) escapeAudio.playBridgeCollapse();
      speakText("We regret to inform you that your communication score does not meet our hiring targets.");
    }
  };

  const handleLaunchLevel = (idx) => {
    setCurrentLevelIdx(idx);
    setCompletedRooms({ sql: false, dsa: false, coding: false, hr: false });
    setSqlQuery('');
    setVaultUnlocked(false);
    setDsaChoice(null);
    setBridgeAnimationState('broken');
    setCodeLines(ESCAPE_LEVELS[idx].codingChallenge.code);
    setEditingLine(null);
    setRobotBooted(false);
    setHrChoice(null);
    setRecruiterRelation(50);
    setDialogueText(ESCAPE_LEVELS[idx].hrChallenge.question);
    setConfettiActive(false);

    setActiveScreen('lobby');
    speakText(`Entering Interview Room ${idx + 1}. Complete all tasks to unlock the exit door.`);
  };

  const handlePayoutClaim = () => {
    addCoins(activeLevel.reward.coins);
    addXP(activeLevel.reward.xp);
    setConfettiActive(false);
    setActiveScreen('menu');
  };

  return (
    <div style={{ ...styles.container, transform: isZooming ? 'scale(1.5)' : 'scale(1)' }} className={shakeActive ? 'shake-animation' : ''}>
      <ConfettiEffect active={confettiActive} />
      {/* Sound toggle button */}
      <button style={styles.soundBtn} onClick={() => setSoundEnabled(!soundEnabled)}>
        {soundEnabled ? <Volume2 size={16} color="#00F3FF" /> : <VolumeX size={16} color="var(--danger-color)" />}
      </button>

      {/* 1. LEVEL SELECTOR MENU */}
      {activeScreen === 'menu' && (
        <div style={styles.lobbyCard} className="game-card">
          <Terminal size={48} color="#00F3FF" className="float-animation" />
          <h2 style={styles.title}>INTERVIEW ESCAPE ROOM</h2>
          <p style={styles.desc}>
            Navigate a sequence of high-tech puzzles, bypass locked firewalls, and complete recruiter interviews to unlock your offer letters.
          </p>

          <div style={styles.levelSelectorGrid}>
            {ESCAPE_LEVELS.map((lvl, idx) => {
              const isLocked = lvl.level > unlockedLevel;
              return (
                <div 
                  key={idx} 
                  style={{ 
                    ...styles.levelBox, 
                    opacity: isLocked ? 0.4 : 1,
                    borderColor: isLocked ? 'rgba(255,255,255,0.05)' : '#00F3FF' 
                  }}
                  className="game-card"
                >
                  <h4 style={{ color: '#FFF', fontWeight: 'bold' }}>LVL {lvl.level}: {lvl.title}</h4>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    DIFFICULTY: {lvl.difficulty} | Payout: {lvl.reward.coins} Coins
                  </div>
                  {!isLocked ? (
                    <button 
                      className="game-btn game-btn-primary" 
                      style={{ ...styles.levelAction, backgroundColor: '#00F3FF', borderColor: '#00F3FF', color: '#000' }}
                      onClick={() => handleLaunchLevel(idx)}
                    >
                      Enter Office
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: 'var(--danger-color)', display: 'block', marginTop: '12px' }}>🔒 Locked</span>
                  )}
                </div>
              );
            })}
          </div>

          <button className="game-btn" style={{ marginTop: '1rem' }} onClick={() => setGame(null)}>
            Return to Hub
          </button>
        </div>
      )}

      {/* 2. THE LOBBY WALK-AROUND OFFICE */}
      {activeScreen === 'lobby' && (
        <div style={styles.officeLobby} className="game-card">
          <h2 style={{ ...styles.title, color: '#00F3FF' }}>🏢 ESCAPE LOBBY: LEVEL {activeLevel.level}</h2>
          <p style={styles.desc}>
            You are locked inside the recruiting suite. Complete all 4 assessment rooms to open the CEO Suite door!
          </p>

          {/* Interactive Blueprint Map Layout */}
          <div style={styles.mapGrid}>
            <div style={styles.mapRoom} onClick={() => enterRoom('sql')}>
              <span style={{ fontSize: '2rem' }}>🏦</span>
              <span style={styles.roomName}>SQL Vault</span>
              <span style={completedRooms.sql ? styles.roomOpen : styles.roomLocked}>
                {completedRooms.sql ? '✓ Cleaned' : '🔒 Locked'}
              </span>
            </div>

            <div style={styles.mapRoom} onClick={() => enterRoom('dsa')}>
              <span style={{ fontSize: '2rem' }}>🌉</span>
              <span style={styles.roomName}>DSA Bridge</span>
              <span style={completedRooms.dsa ? styles.roomOpen : styles.roomLocked}>
                {completedRooms.dsa ? '✓ Crossed' : '🔒 Broken'}
              </span>
            </div>

            <div style={styles.mapRoom} onClick={() => enterRoom('coding')}>
              <span style={{ fontSize: '2rem' }}>🤖</span>
              <span style={styles.roomName}>Coding Lab</span>
              <span style={completedRooms.coding ? styles.roomOpen : styles.roomLocked}>
                {completedRooms.coding ? '✓ Repaired' : '🔒 Malfunctioning'}
              </span>
            </div>

            <div style={styles.mapRoom} onClick={() => enterRoom('hr')}>
              <span style={{ fontSize: '2rem' }}>👩‍💼</span>
              <span style={styles.roomName}>HR Boardroom</span>
              <span style={completedRooms.hr ? styles.roomOpen : styles.roomLocked}>
                {completedRooms.hr ? '✓ Interviewed' : '🔒 Unopened'}
              </span>
            </div>
          </div>

          {/* CEO Suite Entry Lock */}
          <div style={styles.ceoDoorBox}>
            <button 
              className="game-btn game-btn-primary" 
              disabled={!(completedRooms.sql && completedRooms.dsa && completedRooms.coding && completedRooms.hr)}
              style={{ ...styles.actionBtn, background: 'linear-gradient(135deg, #00F3FF 0%, #007799 100%)', color: '#000' }}
              onClick={() => enterRoom('ceo')}
            >
              🔓 ENTER CEO SUITE
            </button>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
              Requires completing all 4 chambers.
            </span>
          </div>

          <button className="game-btn" onClick={() => setActiveScreen('menu')}>
            Exit Lobby
          </button>
        </div>
      )}

      {/* 3. SQL VAULT CHAMBER */}
      {activeScreen === 'sql' && (
        <div style={styles.vaultChamber} className="game-card">
          <Database size={48} color="#00F3FF" />
          <h3 style={styles.title}>🏦 SQL SECURE VAULT</h3>
          <p style={styles.desc}>{activeLevel.sqlChallenge.instructions}</p>

          <div style={{ ...styles.codeSnippet, border: '1px solid rgba(255,255,255,0.05)', width: '100%' }}>
            <span style={{ color: 'var(--text-secondary)' }}>-- Schema: {activeLevel.sqlChallenge.dbTable}</span>
            <pre style={{ margin: '6px 0', fontSize: '0.8rem', color: '#58A6FF' }}>{sqlQuery || '-- Enter query below...'}</pre>
          </div>

          <input 
            type="text" 
            placeholder="Type your SQL query..."
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            style={styles.sqlTextarea}
            disabled={vaultUnlocked}
          />

          {vaultUnlocked ? (
            <div style={{ color: 'var(--success-color)', fontSize: '0.85rem', fontWeight: 'bold' }}>
              ✓ VAULT UNLOCKED! Particle coins added to payout logs.
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', width: '100%', marginBottom: '8px' }}>
              <button 
                className="game-btn" 
                style={{ ...styles.actionBtn, borderColor: 'var(--accent-secondary)', color: 'var(--accent-secondary)', backgroundColor: 'transparent' }}
                onClick={decryptEscapeSolution}
              >
                🔓 Decrypt (-50 Coins)
              </button>
              <button className="game-btn game-btn-primary" style={styles.actionBtn} onClick={handleVerifySql}>
                COMPILE & RUN
              </button>
            </div>
          )}

          <button className="game-btn" onClick={() => setActiveScreen('lobby')}>
            Return to Lobby
          </button>
        </div>
      )}

      {/* 4. DSA BRIDGE CHASM */}
      {activeScreen === 'dsa' && (
        <div style={styles.bridgeChamber} className="game-card">
          <h3 style={styles.title}>🌉 DSA CHASM BRIDGE</h3>
          <p style={styles.desc}>{activeLevel.dsaChallenge.question}</p>

          <canvas ref={canvasRef} width={420} height={140} style={styles.canvasFrame} />

          <div style={styles.dsaQuizGrid}>
            {activeLevel.dsaChallenge.options.map((opt, idx) => (
              <button 
                key={idx} 
                className="game-btn" 
                style={{ 
                  ...styles.optBtn, 
                  borderColor: dsaChoice === idx ? (idx === activeLevel.dsaChallenge.correctIndex ? 'var(--success-color)' : 'var(--danger-color)') : 'rgba(255,255,255,0.05)'
                }}
                disabled={dsaChoice !== null}
                onClick={() => handleSelectDsa(idx)}
              >
                {opt}
              </button>
            ))}
          </div>

          {dsaChoice === null && (
            <button 
              className="game-btn" 
              style={{ ...styles.optBtn, borderColor: '#A855F7', color: '#A855F7', backgroundColor: 'transparent', width: '100%', marginTop: '8px' }}
              onClick={decryptEscapeSolution}
            >
              🔓 Decrypt Solution (-50 Coins)
            </button>
          )}

          <button className="game-btn" style={{ marginTop: '1rem' }} onClick={() => setActiveScreen('lobby')}>
            Return to Lobby
          </button>
        </div>
      )}

      {/* 5. ROBOT DEBUG LAB */}
      {activeScreen === 'coding' && (
        <div style={styles.debugChamber} className="game-card">
          <Cpu size={48} color="#00F3FF" />
          <h3 style={styles.title}>🤖 ROBOT WORKSHOP TERMINAL</h3>
          <p style={styles.desc}>Click the malfunctioning line in the editor code and supply the correct syntax patch.</p>

          <div style={styles.ideCanvas}>
            {codeLines.map((line, idx) => {
              const isEditing = idx === editingLine;
              return (
                <div 
                  key={idx} 
                  style={styles.codeRow} 
                  onClick={() => !isEditing && !robotBooted && handleInspectLine(idx)}
                >
                  <span style={styles.lineNumber}>{idx + 1}</span>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                      <input 
                        type="text" 
                        value={lineEditText} 
                        onChange={(e) => setLineEditText(e.target.value)}
                        style={styles.inlineEditor}
                        autoFocus
                      />
                      <button className="game-btn game-btn-primary" style={{ padding: '2px 8px', fontSize: '0.7rem', backgroundColor: 'var(--success-color)' }} onClick={handleCompileFix}>
                        Fix
                      </button>
                    </div>
                  ) : (
                    <pre style={{ ...styles.codePre, color: robotBooted && idx === activeLevel.codingChallenge.bugLine ? 'var(--success-color)' : '#FFF' }}>
                      {line}
                    </pre>
                  )}
                </div>
              );
            })}
          </div>

          {robotBooted && (
            <div style={{ color: 'var(--success-color)', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '8px' }}>
              ✓ ROBOT BOOTED! The security locking logs are bypassed.
            </div>
          )}

          {!robotBooted && (
            <button 
              className="game-btn" 
              style={{ borderColor: '#A855F7', color: '#A855F7', backgroundColor: 'transparent', width: '100%', marginBottom: '8px', marginTop: '8px' }}
              onClick={decryptEscapeSolution}
            >
              🔓 Decrypt Solution (-50 Coins)
            </button>
          )}

          <button className="game-btn" onClick={() => setActiveScreen('lobby')}>
            Return to Lobby
          </button>
        </div>
      )}

      {/* 6. HR dialogue INTERVIEW */}
      {activeScreen === 'hr' && (
        <div style={styles.hrChamber} className="game-card">
          <h3 style={styles.title}>👩‍💼 RECRUITER INTERVIEW SCREEN</h3>
          <p style={styles.desc}>Select how you communicate to balance your relationship indicators.</p>

          <div style={styles.npcBox} className="game-card">
            <span style={{ fontSize: '3rem' }}>👩‍💼</span>
            <p style={{ fontSize: '0.85rem', color: '#FFF', fontStyle: 'italic' }}>{dialogueText}</p>
          </div>

          {/* Relationship Meter */}
          <div style={{ width: '100%', margin: '1rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <span>Recruiter Relationship:</span>
              <span>{recruiterRelation}%</span>
            </div>
            <div style={styles.meterBg}>
              <div style={{ ...styles.meterFill, width: `${recruiterRelation}%`, backgroundColor: recruiterRelation > 50 ? 'var(--success-color)' : 'var(--danger-color)' }}></div>
            </div>
          </div>

          <div style={styles.hrOptsGrid}>
            {activeLevel.hrChallenge.options.map((opt, idx) => (
              <button 
                key={idx}
                className="game-btn"
                style={{ ...styles.hrOptBtn, borderColor: hrChoice === opt ? '#00F3FF' : 'rgba(255,255,255,0.05)' }}
                disabled={hrChoice !== null}
                onClick={() => handleSelectHr(opt)}
              >
                {opt.text}
              </button>
            ))}
          </div>

          {hrChoice === null && (
            <button 
              className="game-btn" 
              style={{ ...styles.hrOptBtn, borderColor: '#A855F7', color: '#A855F7', backgroundColor: 'transparent', width: '100%', marginTop: '8px' }}
              onClick={decryptEscapeSolution}
            >
              🔓 Decrypt Solution (-50 Coins)
            </button>
          )}

          <button className="game-btn" style={{ marginTop: '1rem' }} onClick={() => setActiveScreen('lobby')}>
            Return to Lobby
          </button>
        </div>
      )}

      {/* 7. CEO board room suite */}
      {activeScreen === 'ceo' && (
        <div style={styles.ceoChamber} className="game-card">
          <Award size={64} color="#00F3FF" className="float-animation" />
          <h3 style={styles.title}>👨‍💼 THE EXECUTIVE SUITE</h3>
          <p style={styles.desc}>The CEO reviews your composite placement assessment reports.</p>

          <div style={styles.reportSummary} className="game-card">
            <h4 style={{ color: '#00F3FF', fontWeight: 'bold', marginBottom: '8px' }}>CANDIDATE LOGS:</h4>
            <div>🏦 Database bypass: {completedRooms.sql ? '✅ CLEARED' : '❌ LOCKED'}</div>
            <div>🌉 Network Routing: {completedRooms.dsa ? '✅ CLEARED' : '❌ LOCKED'}</div>
            <div>🤖 Logic configuration: {completedRooms.coding ? '✅ CLEARED' : '❌ LOCKED'}</div>
            <div style={{ marginTop: '8px' }}>👩‍💼 Recruiter Alignment: **{recruiterRelation}% Trust**</div>
          </div>

          <button className="game-btn game-btn-primary" style={styles.actionBtn} onClick={handleEvaluateOffer}>
            EVALUATE CANDIDACY
          </button>
        </div>
      )}

      {/* 8. LEVEL VICTORY SCREEN */}
      {activeScreen === 'victory' && (
        <div style={styles.payoutCard} className="game-card">
          <Sparkles size={64} color="#00F3FF" className="float-animation" />
          <h2 style={{ ...styles.title, color: 'var(--success-color)' }}>OFFER LETTER RECEIVED!</h2>
          <p style={styles.desc}>
            Sensational candidate profile! The board approved your application. You are hired!
          </p>

          <div style={styles.rewardsRow}>
            <div>💎 +{activeLevel.reward.coins} Coins credited</div>
            <div>⚡ +{activeLevel.reward.xp} XP applied</div>
          </div>

          <button className="game-btn game-btn-primary" style={{ backgroundColor: '#00F3FF', borderColor: '#00F3FF', color: '#000' }} onClick={handlePayoutClaim}>
            CLAIM REWARDS
          </button>
        </div>
      )}

      {/* 9. FAILED REJECTION SCREEN */}
      {activeScreen === 'failed' && (
        <div style={styles.payoutCard} className="game-card">
          <ShieldAlert size={64} color="var(--danger-color)" className="float-animation" />
          <h2 style={{ ...styles.title, color: 'var(--danger-color)' }}>APPLICATION REJECTED!</h2>
          <p style={styles.desc}>
            The CEO rejected your profiles due to low recruiter trust or incomplete assessment files.
          </p>

          <button className="game-btn game-btn-primary" style={{ backgroundColor: 'var(--danger-color)', borderColor: 'var(--danger-color)' }} onClick={() => setActiveScreen('menu')}>
            RETURN TO SECTOR MENU
          </button>
        </div>
      )}

    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 'calc(100vh - 70px)',
    width: '100vw',
    position: 'relative',
    transition: 'transform 0.5s ease-in-out',
    overflowY: 'auto'
  },
  soundBtn: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    zIndex: 10
  },
  lobbyCard: {
    maxWidth: '820px',
    width: '100%',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.2rem',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    padding: '2rem',
    borderRadius: '16px',
    borderWidth: '2px',
    maxHeight: '90%',
    overflowY: 'auto'
  },
  title: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.75rem',
    letterSpacing: '1px',
    fontWeight: '800'
  },
  desc: {
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    maxWidth: '560px',
    lineHeight: '1.5'
  },
  levelSelectorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
    width: '100%',
    marginTop: '1rem'
  },
  levelBox: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    border: '1px solid',
    padding: '1.25rem',
    textAlign: 'left',
    borderRadius: '12px'
  },
  levelAction: {
    marginTop: '12px',
    padding: '4px 10px',
    fontSize: '0.7rem'
  },
  officeLobby: {
    maxWidth: '720px',
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    border: '2px solid #00F3FF',
    padding: '2rem',
    borderRadius: '16px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem'
  },
  mapGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    width: '100%',
    marginTop: '1rem'
  },
  mapRoom: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.05)',
    padding: '1.5rem 1rem',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    ':hover': {
      borderColor: '#00F3FF',
      transform: 'translateY(-2px)'
    }
  },
  roomName: {
    fontSize: '0.85rem',
    fontWeight: 'bold',
    color: '#FFF'
  },
  roomLocked: {
    fontSize: '0.65rem',
    color: 'var(--danger-color)'
  },
  roomOpen: {
    fontSize: '0.65rem',
    color: 'var(--success-color)'
  },
  ceoDoorBox: {
    marginTop: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    paddingTop: '1rem',
    width: '100%'
  },
  actionBtn: {
    padding: '0.5rem 2rem',
    fontSize: '0.8rem'
  },
  vaultChamber: {
    maxWidth: '560px',
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid #00F3FF',
    padding: '2rem',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem'
  },
  codeSnippet: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    textAlign: 'left',
    fontFamily: 'var(--font-mono)'
  },
  sqlTextarea: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#0a0d16',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#FFF',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    borderRadius: '8px',
    outline: 'none'
  },
  bridgeChamber: {
    maxWidth: '560px',
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid #00F3FF',
    padding: '2rem',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem'
  },
  canvasFrame: {
    backgroundColor: '#05070c',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '8px',
    width: '100%'
  },
  dsaQuizGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    width: '100%',
    marginTop: '0.5rem'
  },
  optBtn: {
    padding: '0.6rem 0.5rem',
    fontSize: '0.7rem',
    textAlign: 'center',
    justifyContent: 'center'
  },
  debugChamber: {
    maxWidth: '560px',
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid #00F3FF',
    padding: '2rem',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem'
  },
  ideCanvas: {
    width: '100%',
    backgroundColor: '#05070c',
    padding: '1rem',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'var(--font-mono)',
    textAlign: 'left'
  },
  codeRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '3px 0',
    cursor: 'pointer'
  },
  lineNumber: {
    width: '24px',
    color: 'rgba(255,255,255,0.15)',
    fontSize: '0.7rem'
  },
  codePre: {
    margin: 0,
    fontSize: '0.75rem'
  },
  inlineEditor: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    border: '1px solid #00F3FF',
    color: '#00F3FF',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    padding: '2px 6px',
    borderRadius: '4px',
    outline: 'none'
  },
  hrChamber: {
    maxWidth: '560px',
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid #00F3FF',
    padding: '2rem',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem'
  },
  npcBox: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    padding: '1rem',
    borderRadius: '8px',
    width: '100%',
    textAlign: 'left'
  },
  meterBg: {
    height: '6px',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  meterFill: {
    height: '100%',
    transition: 'width 0.3s ease'
  },
  hrOptsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%'
  },
  hrOptBtn: {
    textAlign: 'left',
    justifyContent: 'flex-start',
    padding: '0.65rem 1rem',
    fontSize: '0.75rem'
  },
  ceoChamber: {
    maxWidth: '520px',
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid #00F3FF',
    padding: '2rem',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem'
  },
  reportSummary: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.05)',
    padding: '1.25rem',
    borderRadius: '10px',
    width: '100%',
    textAlign: 'left',
    fontSize: '0.8rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  payoutCard: {
    maxWidth: '520px',
    width: '90%',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.2rem',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    padding: '2.5rem',
    borderRadius: '16px',
    borderWidth: '2px'
  },
  rewardsRow: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    padding: '1rem 2rem',
    borderRadius: '8px',
    width: '100%',
    textAlign: 'left',
    fontSize: '0.85rem',
    color: '#34D399',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  }
};
