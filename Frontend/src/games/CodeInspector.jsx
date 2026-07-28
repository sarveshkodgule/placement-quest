import React, { useState, useEffect, useRef } from 'react';
import ConfettiEffect from '../components/ConfettiEffect';
import { usePlayerStore } from '../store/usePlayerStore';
import { 
  Terminal, Shield, ShieldAlert, Cpu, Database, Play, ChevronRight, 
  RotateCcw, Award, Volume2, VolumeX, Eye, Search, AlertCircle, Info, Sparkles,
  Zap, Clock, CheckCircle2, XCircle, Layout, HardDrive, RefreshCw
} from 'lucide-react';

// Chiptune Retro Audio Engine for Code Inspector
const inspectorAudio = {
  ctx: null,
  masterGain: null,
  bgmInterval: null,
  bgmStep: 0,
  isEnabled: true,

  init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.2, this.ctx.currentTime); // Boosted master gain volume
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Inspector audio engine failed to load:", e);
    }
  },

  playBgm(speedMs = 350) {
    this.init();
    if (!this.ctx || this.bgmInterval || !this.isEnabled) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    // Dark cyberpunk minor bass progression
    const progression = [
      [110.00, 164.81], // A2, E3
      [98.00, 146.83],  // G2, D3
      [87.31, 130.81],  // F2, C3
      [110.00, 164.81]  // A2, E3
    ];

    this.bgmStep = 0;
    this.bgmInterval = setInterval(() => {
      const time = this.ctx.currentTime;
      const currentChord = progression[Math.floor(this.bgmStep / 4) % progression.length];

      // Bass heartbeat pulse
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sawtooth';
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, time);

      bassOsc.frequency.setValueAtTime(currentChord[this.bgmStep % 2], time);
      
      bassGain.gain.setValueAtTime(0.18, time);
      bassGain.gain.linearRampToValueAtTime(0.001, time + (speedMs / 1000) - 0.05);

      bassOsc.connect(filter);
      filter.connect(bassGain);
      bassGain.connect(this.masterGain);
      
      bassOsc.start(time);
      bassOsc.stop(time + (speedMs / 1000));
      this.bgmStep++;
    }, speedMs);
  },

  stopBgm() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  },

  playLaser() {
    this.init();
    if (!this.ctx || !this.isEnabled) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, time);
    osc.frequency.exponentialRampToValueAtTime(100, time + 0.15);

    gain.gain.setValueAtTime(0.2, time);
    gain.gain.linearRampToValueAtTime(0.001, time + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.16);
  },

  playError() {
    this.init();
    if (!this.ctx || !this.isEnabled) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.linearRampToValueAtTime(80, time + 0.25);

    gain.gain.setValueAtTime(0.3, time);
    gain.gain.linearRampToValueAtTime(0.001, time + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.26);
  },

  playUpgrade() {
    this.init();
    if (!this.ctx || !this.isEnabled) return;
    const time = this.ctx.currentTime;

    const notes = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C arpeggios
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time + idx * 0.08);

      gain.gain.setValueAtTime(0.12, time + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.001, time + idx * 0.08 + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(time + idx * 0.08);
      osc.stop(time + idx * 0.08 + 0.22);
    });
  }
};

// Missions dataset
const MISSIONS = [
  {
    id: 1,
    title: 'Mobile App Token Leak',
    dept: '🏢 Mobile Team',
    threat: 'LOW',
    enemy: { name: '🐛 Null Bug', icon: '🐛', hp: 100 },
    timeLimit: 120,
    hint: 'A secret key variable is accidentally assigned to null in the headers setup.',
    file: 'AuthManager.js',
    code: [
      `// AuthManager.js - Setup Header`,
      `const axios = require('axios');`,
      `function configureHeaders(token) {`,
      `  const headers = {`,
      `    'Content-Type': 'application/json',`,
      `    'Authorization': null, // BUG FOUND HERE!`,
      `    'X-Client-ID': 'MOB_4489'`,
      `  };`,
      `  return headers;`,
      `}`
    ],
    bugLine: 5,
    reward: { coins: 80, xp: 40 }
  },
  {
    id: 2,
    title: 'Critical Banking Transaction Outage',
    dept: '🏦 Banking System',
    threat: 'HIGH',
    enemy: { name: '💀 SQL Phantom', icon: '💀', hp: 120 },
    timeLimit: 90,
    hint: 'Watch out for raw SQL query concatenations that bypass input validation.',
    file: 'TransactionVault.js',
    code: [
      `// TransactionVault.js - Query Account`,
      `const db = require('pg-pool');`,
      `async function getAccountInfo(userId) {`,
      `  // CONCATENATING RAW STRINGS INVITES SQL INJECTIONS!`,
      `  const query = "SELECT * FROM users WHERE id = '" + userId + "'";`,
      `  const res = await db.query(query);`,
      `  return res.rows[0];`,
      `}`
    ],
    bugLine: 4,
    reward: { coins: 150, xp: 60 }
  },
  {
    id: 3,
    title: 'Space Propulsion Memory Allocation',
    dept: '🚀 Space Software',
    threat: 'CRITICAL',
    enemy: { name: '👾 Memory Leech', icon: '👾', hp: 150 },
    timeLimit: 75,
    hint: 'A vector buffer array is expanding infinitely inside a loop without releasing pointers.',
    file: 'ThrusterController.cpp',
    code: [
      `// ThrusterController.cpp - Fuel Vector`,
      `#include <vector>`,
      `void balanceThrusters(int loops) {`,
      `  std::vector<double>* data = new std::vector<double>();`,
      `  for (int i = 0; i < loops; ++i) {`,
      `    data->push_back(i * 1.45);`,
      `  }`,
      `  // BUG: Memory allocation pointer is never deleted or cleared!`,
      `  // delete data; missing here!`,
      `}`
    ],
    bugLine: 3,
    reward: { coins: 200, xp: 90 }
  },
  {
    id: 4,
    title: 'Python Threading Data Race',
    dept: '🐍 Data Science Team',
    threat: 'MEDIUM',
    enemy: { name: '👾 Race Condition', icon: '👾', hp: 110 },
    timeLimit: 90,
    hint: 'Mutating a Python list or dictionary directly while iterating over it in another thread throws a RuntimeError.',
    file: 'datasaver.py',
    code: [
      `import threading`,
      `active_connections = {'user1': 'online', 'user2': 'idle'}`,
      `def clean_inactive_connections():`,
      `  # BUG: Iterating directly over the dict keys while deleting items!`,
      `  for user in active_connections:`,
      `    if active_connections[user] == 'idle':`,
      `      del active_connections[user] // RUNTIME EXCEPTION HERE!`,
      `  print('Clean complete.')`
    ],
    bugLine: 4,
    reward: { coins: 140, xp: 55 }
  },
  {
    id: 5,
    title: 'JavaScript Scope Leak',
    dept: '🌐 Web Platform',
    threat: 'LOW',
    enemy: { name: '👻 Memory Leak', icon: '👻', hp: 90 },
    timeLimit: 100,
    hint: 'Assigning variables without const/let/var declarations binds them to global scope, leaking memory.',
    file: 'authHandler.js',
    code: [
      `function setupUserSession(user) {`,
      `  const sessionToken = generateToken(user.id);`,
      `  // BUG: Missing let/const declaration leaks variable to global window object!`,
      `  globalSessionStore = { token: sessionToken, active: true };`,
      `  return globalSessionStore;`,
      `}`
    ],
    bugLine: 3,
    reward: { coins: 90, xp: 45 }
  },
  {
    id: 6,
    title: 'C++ Stack Overflow Vulnerability',
    dept: '🛡️ Cybersecurity Ops',
    threat: 'CRITICAL',
    enemy: { name: '💀 Buffer Overflow', icon: '💀', hp: 160 },
    timeLimit: 80,
    hint: 'Using strcpy or gets directly transfers uncontrolled buffer sizes onto stack buffers.',
    file: 'network_parser.cpp',
    code: [
      `#include <cstring>`,
      `void parseIncomingBuffer(char* networkStream) {`,
      `  char stackBuffer[32];`,
      `  // BUG: strcpy does not check size limits, causing stack buffer overflows!`,
      `  strcpy(stackBuffer, networkStream);`,
      `}`
    ],
    bugLine: 4,
    reward: { coins: 210, xp: 95 }
  },
  {
    id: 7,
    title: 'Java Iterator Modification',
    dept: '☕ Enterprise Services',
    threat: 'MEDIUM',
    enemy: { name: '⚡ Thread Crash', icon: '⚡', hp: 130 },
    timeLimit: 85,
    hint: 'Modifying a Java ArrayList structurally inside a foreach loop throws ConcurrentModificationException.',
    file: 'TaskService.java',
    code: [
      `import java.util.ArrayList;`,
      `public void filterCompletedTasks(ArrayList<String> tasks) {`,
      `  // BUG: Removing items inside a foreach loop breaks iterator`,
      `  for (String task : tasks) {`,
      `    if (task.contains("COMPLETE")) {`,
      `      tasks.remove(task);`,
      `    }`,
      `  }`,
      `}`
    ],
    bugLine: 5,
    reward: { coins: 160, xp: 70 }
  },
  {
    id: 8,
    title: 'SQL Zero-Division Vulnerability',
    dept: '📊 Analytics Team',
    threat: 'LOW',
    enemy: { name: '🐛 Divide By Zero', icon: '🐛', hp: 85 },
    timeLimit: 110,
    hint: 'Dividing metrics directly by count variables will crash the query engine when denominator is zero.',
    file: 'reporting.sql',
    code: [
      `-- Generate daily server report`,
      `SELECT`,
      `  server_id,`,
      `  -- BUG: Directly dividing by total_requests which could be zero!`,
      `  total_latency / total_requests AS avg_latency`,
      `FROM server_metrics;`
    ],
    bugLine: 4,
    reward: { coins: 100, xp: 50 }
  }
];

const SKINS = [
  { id: 'cyberpunk', name: 'Cyberpunk Neon', primary: '#EC4899', secondary: '#00F3FF', bg: '#0b0b14' },
  { id: 'matrix', name: 'Matrix Green', primary: '#10B981', secondary: '#34D399', bg: '#030704' },
  { id: 'github', name: 'GitHub Dark', primary: '#58A6FF', secondary: '#C9D1D9', bg: '#0d1117' },
  { id: 'synthwave', name: 'Synthwave Purple', primary: '#8B5CF6', secondary: '#F472B6', bg: '#120E2E' }
];

export default function CodeInspector() {
  const { coins, addCoins, addXP, setGame, rank, completeDailyChallenge, triggerNotification, isMuted } = usePlayerStore();

  // Screen State
  const [activeScreen, setActiveScreen] = useState('briefing'); // 'briefing', 'ide', 'victory', 'failed'
  const [selectedMission, setSelectedMission] = useState(MISSIONS[0]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [shakeActive, setShakeActive] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  const speakText = (text) => {
    if (isMuted || !soundEnabled) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.05; // Slightly higher pitch for advanced cockpit voice
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  // Dynamic missions data
  const [missions, setMissions] = useState(MISSIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const DIFFICULTY_ORDER = {
      easy: 1,
      low: 1,
      medium: 2,
      hard: 3,
      high: 3,
      critical: 4
    };

    const solvedIds = localStorage.getItem('solved_question_ids_code-inspector') || '';
    fetch(`http://localhost:5000/api/questions?category=code-inspector&excludeIds=${solvedIds}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.questions && data.questions.length > 0) {
          const sortedQuestions = [...data.questions].sort((a, b) => {
            const diffA = DIFFICULTY_ORDER[a.difficulty?.toLowerCase()] || 2;
            const diffB = DIFFICULTY_ORDER[b.difficulty?.toLowerCase()] || 2;
            return diffA - diffB;
          });

          const mapped = sortedQuestions.map((q, idx) => ({
            id: q._id || idx,
            _id: q._id,
            title: q.question,
            dept: q.extraDetails?.dept || '🏢 Software Division',
            threat: q.extraDetails?.threat || 'MEDIUM',
            enemy: q.extraDetails?.enemy || { name: '🐛 Null Bug', icon: '🐛', hp: 100 },
            timeLimit: q.extraDetails?.timeLimit || (q.difficulty === 'critical' ? 75 : q.difficulty === 'medium' ? 90 : 120),
            hint: q.tip,
            file: q.extraDetails?.file || 'App.js',
            code: q.options,
            bugLine: q.correctAnswer,
            reward: q.difficulty === 'critical' ? { coins: 200, xp: 90 } : q.difficulty === 'medium' ? { coins: 150, xp: 60 } : { coins: 80, xp: 40 }
          }));
          setMissions(mapped);
          setSelectedMission(mapped[0]);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [activeScreen === 'briefing']);

  // IDE customization skin
  const [currentSkin, setCurrentSkin] = useState(SKINS[0]);

  // Editing state for fixing code lines
  const [editingLineIndex, setEditingLineIndex] = useState(null);
  const [lineEditText, setLineEditText] = useState('');

  // Gameplay session stats
  const [timer, setTimer] = useState(120);
  const [enemyHp, setEnemyHp] = useState(100);
  const [shield, setShield] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [bugEliminated, setBugEliminated] = useState(false);

  // Cooldown trackers (Seconds remaining)
  const [scannerCd, setScannerCd] = useState(0);
  const [xrayCd, setXrayCd] = useState(0);
  const [hintCd, setHintCd] = useState(0);

  // Ability active flags
  const [scannerActive, setScannerActive] = useState(false);
  const [xrayActive, setXrayActive] = useState(false);
  const [showHintText, setShowHintText] = useState(false);
  const [isTimeFrozen, setIsTimeFrozen] = useState(false);
  const [frozenUsed, setFrozenUsed] = useState(false);

  // CPU/Memory simulation ticks
  const [cpuUsage, setCpuUsage] = useState(42);
  const [ramUsage, setRamUsage] = useState(58);

  // Sounds loops setup
  useEffect(() => {
    if (soundEnabled && (activeScreen === 'ide' || activeScreen === 'briefing')) {
      inspectorAudio.isEnabled = true;
      // If timer is critical, speed up the heartbeat
      const tempo = timer < 30 ? 200 : 350;
      inspectorAudio.stopBgm();
      inspectorAudio.playBgm(tempo);
    } else {
      inspectorAudio.stopBgm();
    }
    return () => inspectorAudio.stopBgm();
  }, [soundEnabled, activeScreen, timer < 30]);

  // Main countdown timer ticker
  useEffect(() => {
    if (activeScreen !== 'ide' || isTimeFrozen) return;

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setActiveScreen('failed');
          if (soundEnabled) inspectorAudio.playError();
          return 0;
        }
        return prev - 1;
      });

      // Cooldown ticker reductions
      setScannerCd(c => Math.max(0, c - 1));
      setXrayCd(c => Math.max(0, c - 1));
      setHintCd(c => Math.max(0, c - 1));

      // Fluctuate SDE meters slightly
      setCpuUsage(prev => Math.min(99, Math.max(10, prev + Math.floor(Math.random() * 11) - 5)));
      setRamUsage(prev => Math.min(99, Math.max(10, prev + Math.floor(Math.random() * 5) - 2)));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeScreen, isTimeFrozen]);

  const handleLaunchMission = (mission) => {
    setSelectedMission(mission);
    setTimer(mission.timeLimit);
    setEnemyHp(mission.enemy.hp);
    setShield(3);
    setScore(0);
    setCombo(1);
    setBugEliminated(false);
    setConfettiActive(false);
    setScannerCd(0);
    setXrayCd(0);
    setHintCd(0);
    setScannerActive(false);
    setXrayActive(false);
    setShowHintText(false);
    setIsTimeFrozen(false);
    setFrozenUsed(false);
    setEditingLineIndex(null);
    setLineEditText('');
    
    setActiveScreen('ide');
    if (soundEnabled) {
      inspectorAudio.init();
      inspectorAudio.playUpgrade();
    }
    speakText(`Scanning system file ${mission.file}. Threat level: ${mission.threat}. Locate and patch the bug line.`);
  };

  // Ability Triggers
  const triggerScanner = () => {
    if (scannerCd > 0) return;
    setScannerActive(true);
    setScannerCd(30);
    if (soundEnabled) inspectorAudio.playLaser();
    setTimeout(() => setScannerActive(false), 3000); // active for 3 seconds
  };

  const triggerXray = () => {
    if (xrayCd > 0) return;
    setXrayActive(true);
    setXrayCd(60);
    if (soundEnabled) inspectorAudio.playLaser();
    setTimeout(() => setXrayActive(false), 5000); // active for 5 seconds
  };

  const triggerHint = () => {
    if (hintCd > 0) return;
    setShowHintText(true);
    setHintCd(90);
    if (soundEnabled) inspectorAudio.playUpgrade();
  };

  const triggerTimeFreeze = () => {
    if (frozenUsed) return;
    setIsTimeFrozen(true);
    setFrozenUsed(true);
    if (soundEnabled) inspectorAudio.playUpgrade();
    setTimeout(() => setIsTimeFrozen(false), 8000); // Freeze clock for 8 seconds
  };

  const decryptSolution = () => {
    if (coins < 50) {
      triggerNotification('❌ Insufficient Coins', 'You need 50 SDE Coins to decrypt this solution.', '🪙');
      return;
    }
    
    addCoins(-50);
    triggerNotification('🔓 Code Decrypted', `The bug is located on line ${selectedMission.bugLine + 1}!`, '💻');
    
    // Highlight the bug line automatically
    setScannerActive(true);
    setTimeout(() => setScannerActive(false), 5000);
  };

  // Code inspection selection clicks
  const handleInspectLine = (lineIndex) => {
    if (bugEliminated || activeScreen !== 'ide') return;
    setEditingLineIndex(lineIndex);
    setLineEditText(selectedMission.code[lineIndex]);
  };

  // Compile and verify code fix
  const handleCompileFix = (lineIndex) => {
    if (bugEliminated || activeScreen !== 'ide') return;

    if (lineIndex !== selectedMission.bugLine) {
      // Incorrect line selection penalty
      setShakeActive(true);
      setTimeout(() => setShakeActive(false), 500);
      if (soundEnabled) inspectorAudio.playError();
      setCombo(1);
      setEditingLineIndex(null);
      setShield(prev => {
        const nextShield = prev - 1;
        if (nextShield <= 0) {
          setActiveScreen('failed');
          if (soundEnabled) inspectorAudio.playError();
          speakText("Fatal compiler crash. CPU core overheated!");
        } else {
          speakText("Compiler warning. Healthy line compiled!");
        }
        return nextShield;
      });
      triggerNotification('🚨 COMPILER CRASH', 'You compiled modifications on a healthy, functional code line!', '❌');
      return;
    }

    // Checking if the edit corrects the conceptual bug
    const editedText = lineEditText.trim();
    let isFixCorrect = false;

    // Check query category or mission description characteristics
    if (selectedMission.bugLine === 5) {
      // Mission 1: Token Leak
      isFixCorrect = editedText.includes('token') && !editedText.includes('null');
    } else if (selectedMission.bugLine === 4) {
      // Mission 2: SQL Injection
      isFixCorrect = (editedText.includes('$1') || editedText.includes('?')) && !editedText.includes('+');
    } else if (selectedMission.bugLine === 3) {
      // Mission 3: Memory Leak
      isFixCorrect = editedText.includes('delete') && editedText.includes('data');
    } else {
      // Fallback
      isFixCorrect = editedText.length > 0 && editedText !== selectedMission.code[lineIndex].trim();
    }

    if (isFixCorrect) {
      // Correct Fix compiled!
      setConfettiActive(true);
      if (localStorage.getItem('active_daily_challenge_game') === 'code-inspector') {
        completeDailyChallenge();
      }
      if (soundEnabled) inspectorAudio.playLaser();

      if (selectedMission._id) {
        const solved = localStorage.getItem('solved_question_ids_code-inspector') || '';
        const newSolved = solved ? solved.split(',') : [];
        if (!newSolved.includes(selectedMission._id)) {
          newSolved.push(selectedMission._id);
          localStorage.setItem('solved_question_ids_code-inspector', newSolved.join(','));
        }
      }

      setBugEliminated(true);
      setEnemyHp(0);
      setScore(prev => prev + 100 * combo);
      setCombo(prev => Math.min(10, prev + 1));
      setEditingLineIndex(null);
      
      // Update the code array locally so the player sees their fix rendered inside the IDE!
      const updatedCode = [...selectedMission.code];
      updatedCode[lineIndex] = lineEditText;
      setSelectedMission(prev => ({
        ...prev,
        code: updatedCode
      }));

      setTimeout(() => {
        setActiveScreen('victory');
        if (soundEnabled) inspectorAudio.playUpgrade();
        speakText("Mission complete. Code bug eliminated successfully. PR merged!");
      }, 1000);
    } else {
      // Incorrect Fix compiled
      setShakeActive(true);
      setTimeout(() => setShakeActive(false), 500);
      if (soundEnabled) inspectorAudio.playError();
      setCombo(1);
      setShield(prev => {
        const nextShield = prev - 1;
        if (nextShield <= 0) {
          setActiveScreen('failed');
          if (soundEnabled) inspectorAudio.playError();
          speakText("Fatal compiler crash. CPU core overheated!");
        } else {
          speakText("Syntax error. Compiler rejected the patch code!");
        }
        return nextShield;
      });
      triggerNotification('🚨 COMPILATION ERROR', 'The compiler rejects your syntax fix. The bug is still active!', '❌');
    }
  };

  const handleClaimPayout = () => {
    addCoins(selectedMission.reward.coins);
    addXP(selectedMission.reward.xp);
    setConfettiActive(false);
    setActiveScreen('briefing');
  };

  return (
    <div style={{ ...styles.container, backgroundColor: currentSkin.bg }} className={shakeActive ? 'shake-animation' : ''}>
      <ConfettiEffect active={confettiActive} />
      {/* Sound controllers */}
      <button 
        style={styles.soundBtn}
        onClick={() => setSoundEnabled(!soundEnabled)}
      >
        {soundEnabled ? <Volume2 size={18} color={currentSkin.primary} /> : <VolumeX size={18} color="var(--danger-color)" />}
      </button>

      {/* 1. MISSION BRIEFING SCREEN */}
      {activeScreen === 'briefing' && (
        <div style={styles.briefingCard} className="game-card">
          <Terminal size={48} color={currentSkin.primary} className="float-animation" />
          <h2 style={{ ...styles.briefTitle, textShadow: `0 0 10px ${currentSkin.primary}` }}>
            BUG-0 CORRUPTION RADAR
          </h2>
          <p style={styles.briefDesc}>
            A rogue AI is injecting structural errors into production code banks. Select your target department below, accept the mission, and eliminate compilation crashes.
          </p>

          <div style={styles.missionsGrid}>
            {missions.map(m => (
              <div key={m.id} style={styles.missionItem} className="game-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={styles.deptLabel}>{m.dept}</span>
                  <span style={{ ...styles.threatLabel, color: m.threat === 'CRITICAL' ? 'var(--danger-color)' : m.threat === 'HIGH' ? '#F59E0B' : '#10B981' }}>
                    {m.threat} THREAT
                  </span>
                </div>
                <h4 style={{ color: '#FFF', fontWeight: 'bold', margin: '6px 0' }}>{m.title}</h4>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Files: {m.file}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 'bold' }}>⚡ XP: +{m.reward.xp}</span>
                  <button 
                    className="game-btn game-btn-primary" 
                    style={{ padding: '0.35rem 0.85rem', fontSize: '0.7rem', backgroundColor: currentSkin.primary, borderColor: currentSkin.primary }} 
                    onClick={() => handleLaunchMission(m)}
                  >
                    ACCEPT MISSION
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
            <button className="game-btn" onClick={() => setGame(null)}>
              Return to Hub
            </button>
          </div>
        </div>
      )}

      {/* 2. THE FUTURISTIC IDE INTERFACE */}
      {activeScreen === 'ide' && (
        <div style={{ ...styles.ideWorkspace, borderColor: currentSkin.primary }} className="game-card">
          {/* Header controls & system indicators */}
          <div style={styles.ideHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: currentSkin.primary }}>🤖 {selectedMission.file}</span>
              <span style={styles.divider}>|</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>DEPARTMENT: {selectedMission.dept}</span>
            </div>

            {/* Custom Theme Skin Selector */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {SKINS.map(s => (
                <button 
                  key={s.id} 
                  style={{ 
                    ...styles.skinBtn, 
                    borderColor: currentSkin.id === s.id ? s.primary : 'rgba(255,255,255,0.08)',
                    color: s.primary
                  }}
                  onClick={() => setCurrentSkin(s)}
                >
                  {s.name.split(' ')[0]}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div style={styles.ideHeaderStat}>
                <Clock size={14} color="var(--warning-color)" />
                <span style={{ color: isTimeFrozen ? 'var(--accent-secondary)' : '#FFF' }}>
                  {isTimeFrozen ? 'TIME FROZEN' : `${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`}
                </span>
              </div>
              <div style={styles.ideHeaderStat}>
                <Shield size={14} color="var(--accent-color)" />
                <span>SHIELD: {shield}/3</span>
              </div>
            </div>
          </div>

          {/* Core game workspace split: Sidebar, Editor, Enemy HUD */}
          <div style={styles.workspaceBody}>
            {/* Left: IDE File directory and CPU utilization */}
            <div style={styles.sidebarPanel}>
              <div style={styles.panelTitleBox}>EXPLORER</div>
              <div style={styles.fileTree}>
                <div style={{ ...styles.treeItem, color: currentSkin.primary }}>📂 source</div>
                <div style={{ ...styles.treeItem, paddingLeft: '20px', color: '#FFF' }}>📄 {selectedMission.file}</div>
                <div style={{ ...styles.treeItem, paddingLeft: '20px' }}>📄 utils.config</div>
                <div style={{ ...styles.treeItem, paddingLeft: '20px' }}>📄 testRunner.log</div>
              </div>

              {/* Live SDE hardware metrics */}
              <div style={styles.systemMetricsBox}>
                <span style={{ color: currentSkin.primary, fontSize: '0.65rem', fontWeight: 'bold' }}>SYSTEM HEALTH:</span>
                <div style={styles.metricItem}>
                  <span>CPU Load:</span>
                  <span>{cpuUsage}%</span>
                </div>
                <div style={styles.metricItem}>
                  <span>RAM Usage:</span>
                  <span>{ramUsage}%</span>
                </div>
              </div>
            </div>

            {/* Middle: Code editor workspace */}
            <div style={styles.editorPanel}>
              <div style={styles.editorTabHeader}>
                <span style={{ color: '#FFF', fontSize: '0.75rem', fontWeight: 'bold' }}>{selectedMission.file}</span>
              </div>

              <div style={styles.codeCanvas}>
                {selectedMission.code.map((line, idx) => {
                  const isBugLine = idx === selectedMission.bugLine;
                  const isHighlighted = scannerActive && isBugLine;
                  const isEditing = idx === editingLineIndex;
                  return (
                    <div 
                      key={idx}
                      style={{ 
                        ...styles.codeLineRow,
                        backgroundColor: isHighlighted ? 'rgba(239, 68, 68, 0.25)' : 'transparent',
                        borderLeft: isHighlighted ? '3px solid var(--danger-color)' : 'none'
                      }}
                      onClick={() => !isEditing && handleInspectLine(idx)}
                    >
                      <span style={styles.lineNumberCol}>{idx + 1}</span>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1, paddingRight: '1rem' }} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={lineEditText}
                            onChange={(e) => setLineEditText(e.target.value)}
                            style={{
                              flex: 1,
                              backgroundColor: '#1a1f2c',
                              border: `1px solid ${currentSkin.primary}`,
                              color: '#58A6FF',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.8rem',
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}
                            autoFocus
                          />
                          <button
                            className="game-btn game-btn-primary"
                            style={{ padding: '2px 8px', fontSize: '0.7rem', backgroundColor: 'var(--success-color)', borderColor: 'var(--success-color)' }}
                            onClick={() => handleCompileFix(idx)}
                          >
                            ✓ Compile
                          </button>
                          <button
                            className="game-btn"
                            style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                            onClick={() => setEditingLineIndex(null)}
                          >
                            ✕ Cancel
                          </button>
                        </div>
                      ) : (
                        <pre style={{ 
                          ...styles.codePre,
                          color: isHighlighted ? 'var(--danger-color)' : xrayActive && isBugLine ? 'var(--accent-color)' : '#9CDCFE'
                        }}>
                          {line}
                        </pre>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Cooldown ability buttons bar */}
              <div style={styles.powersRow}>
                <button 
                  className="game-btn" 
                  disabled={scannerCd > 0} 
                  style={{ ...styles.powerBtn, color: scannerCd > 0 ? 'var(--text-secondary)' : currentSkin.primary }}
                  onClick={triggerScanner}
                >
                  <Search size={14} /> Scanner {scannerCd > 0 ? `(${scannerCd}s)` : ''}
                </button>
                <button 
                  className="game-btn" 
                  disabled={xrayCd > 0} 
                  style={{ ...styles.powerBtn, color: xrayCd > 0 ? 'var(--text-secondary)' : 'var(--accent-secondary)' }}
                  onClick={triggerXray}
                >
                  <Eye size={14} /> X-Ray {xrayCd > 0 ? `(${xrayCd}s)` : ''}
                </button>
                <button 
                  className="game-btn" 
                  disabled={hintCd > 0} 
                  style={{ ...styles.powerBtn, color: hintCd > 0 ? 'var(--text-secondary)' : '#EAB308' }}
                  onClick={triggerHint}
                >
                  <Info size={14} /> AI Hint {hintCd > 0 ? `(${hintCd}s)` : ''}
                </button>
                <button 
                  className="game-btn" 
                  disabled={frozenUsed} 
                  style={{ ...styles.powerBtn, color: frozenUsed ? 'var(--text-secondary)' : '#00F3FF' }}
                  onClick={triggerTimeFreeze}
                >
                  <Clock size={14} /> Freeze Time
                </button>
                <button 
                  className="game-btn" 
                  disabled={bugEliminated}
                  style={{ ...styles.powerBtn, color: '#A855F7', borderColor: '#A855F7' }}
                  onClick={decryptSolution}
                >
                  🔓 Decrypt (-50 Coins)
                </button>
              </div>

              {/* Hint alert box */}
              {showHintText && (
                <div style={styles.hintDisplayBox}>
                  <strong>🤖 AI Advisor Hint:</strong> {selectedMission.hint}
                </div>
              )}
            </div>

            {/* Right: BUG-0 Mutation Enemy Panel */}
            <div style={styles.enemyPanel}>
              <div style={styles.panelTitleBox}>THREAT DETECTED</div>
              
              <div style={styles.enemyAvatarWrapper} className="float-animation">
                <span style={{ fontSize: '3rem' }}>{selectedMission.enemy.icon}</span>
              </div>

              <h4 style={{ color: '#FFF', fontWeight: 'bold', fontSize: '0.85rem' }}>{selectedMission.enemy.name}</h4>
              
              {/* Enemy Healthbar */}
              <div style={{ width: '100%', marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '4px' }}>
                  <span>HP: {enemyHp}%</span>
                  <span>Mutation Lock</span>
                </div>
                <div style={styles.enemyHpBarContainer}>
                  <div style={{ ...styles.enemyHpBarFill, width: `${enemyHp}%` }}></div>
                </div>
              </div>

              <div style={styles.comboBadge} className="float-animation">
                <span>COMBO: x{combo}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. VICTORY REWARDS SUMMARY */}
      {activeScreen === 'victory' && (
        <div style={styles.victoryCard} className="game-card">
          <Sparkles size={64} color={currentSkin.primary} className="float-animation" />
          <h2 style={{ ...styles.victoryTitle, color: 'var(--success-color)' }}>
            MISSION DEPLOYED!
          </h2>
          <p style={styles.victoryDesc}>
            Outstanding review! You isolated the AI corruption codes, squashed the {selectedMission.enemy.name}, and secured the build integrity.
          </p>

          <div style={styles.rewardsBox}>
            <h4 style={{ color: currentSkin.primary, fontWeight: 'bold', marginBottom: '8px' }}>MISSION PAYOUT:</h4>
            <div>💎 +{selectedMission.reward.coins} Coins credited</div>
            <div>⚡ +{selectedMission.reward.xp} XP applied</div>
          </div>

          <button className="game-btn game-btn-primary" style={{ backgroundColor: currentSkin.primary, borderColor: currentSkin.primary }} onClick={handleClaimPayout}>
            CLAIM MISSION LOOT
          </button>
        </div>
      )}

      {/* 4. MISSION FAILED SCREEN */}
      {activeScreen === 'failed' && (
        <div style={styles.failedCard} className="game-card">
          <ShieldAlert size={64} color="var(--danger-color)" className="float-animation" />
          <h2 style={{ ...styles.failedTitle, color: 'var(--danger-color)' }}>
            PRODUCTION CRASHED!
          </h2>
          <p style={styles.failedDesc}>
            Critical Sprints Outage! The compiler threw exceptions, and BUG-0 hijacked the deployment pipeline.
          </p>

          <button 
            className="game-btn game-btn-primary" 
            style={{ backgroundColor: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
            onClick={() => setActiveScreen('briefing')}
          >
            RETURN TO LOBBY
          </button>
        </div>
      )}

    </div>
  );
}

const styles = {
  container: {
    padding: '1.5rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 'calc(100vh - 70px)',
    width: '100vw',
    position: 'relative',
    overflow: 'hidden'
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
  briefingCard: {
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
  briefTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '2rem',
    letterSpacing: '2px',
    background: 'linear-gradient(90deg, #EC4899, #00F3FF)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  briefDesc: {
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    lineHeight: '1.5',
    maxWidth: '620px'
  },
  missionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1rem',
    width: '100%',
    marginTop: '1rem'
  },
  missionItem: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.06)',
    padding: '1.25rem',
    textAlign: 'left',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
  },
  deptLabel: {
    fontSize: '0.65rem',
    fontFamily: 'var(--font-mono)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: '2px 8px',
    borderRadius: '4px',
    color: 'var(--text-secondary)'
  },
  threatLabel: {
    fontSize: '0.65rem',
    fontFamily: 'var(--font-mono)',
    fontWeight: 'bold'
  },
  ideWorkspace: {
    maxWidth: '920px',
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.96)',
    borderRadius: '16px',
    borderWidth: '2px',
    display: 'flex',
    flexDirection: 'column',
    height: '88%',
    overflow: 'hidden'
  },
  ideHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    padding: '0.75rem 1.25rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem'
  },
  divider: {
    color: 'rgba(255,255,255,0.15)'
  },
  skinBtn: {
    background: 'none',
    border: '1px solid',
    borderRadius: '4px',
    fontSize: '0.6rem',
    padding: '2px 6px',
    cursor: 'pointer',
    fontFamily: 'inherit'
  },
  ideHeaderStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(0,0,0,0.25)',
    padding: '4px 10px',
    borderRadius: '4px'
  },
  workspaceBody: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden'
  },
  sidebarPanel: {
    width: '200px',
    borderRight: '1px solid rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
    gap: '1rem'
  },
  panelTitleBox: {
    fontSize: '0.65rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-secondary)',
    fontWeight: 'bold',
    letterSpacing: '1px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '4px'
  },
  fileTree: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    flex: 1
  },
  treeItem: {
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    transition: 'color 0.2s ease',
  },
  systemMetricsBox: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.04)',
    padding: '0.75rem',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem'
  },
  metricItem: {
    display: 'flex',
    justifyContent: 'space-between',
    color: 'var(--text-secondary)'
  },
  editorPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid rgba(255,255,255,0.08)'
  },
  editorTabHeader: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: '0.5rem 1rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  },
  codeCanvas: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'var(--font-mono)'
  },
  codeLineRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 0',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  lineNumberCol: {
    width: '30px',
    color: 'rgba(255,255,255,0.25)',
    fontSize: '0.75rem',
    textAlign: 'right',
    paddingRight: '10px',
    userSelect: 'none'
  },
  codePre: {
    margin: 0,
    fontSize: '0.8rem',
    fontFamily: 'inherit',
  },
  powersRow: {
    borderTop: '1px solid rgba(255,255,255,0.08)',
    padding: '0.75rem',
    display: 'flex',
    gap: '10px',
    backgroundColor: 'rgba(0,0,0,0.1)'
  },
  powerBtn: {
    flex: 1,
    justifyContent: 'center',
    gap: '4px',
    fontSize: '0.7rem',
    padding: '0.5rem'
  },
  hintDisplayBox: {
    backgroundColor: 'rgba(234, 179, 8, 0.08)',
    borderTop: '1px solid rgba(234, 179, 8, 0.2)',
    padding: '0.75rem 1rem',
    fontSize: '0.75rem',
    color: '#FBBF24',
    textAlign: 'left'
  },
  enemyPanel: {
    width: '180px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'rgba(0,0,0,0.15)'
  },
  enemyAvatarWrapper: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginTop: '10px'
  },
  enemyHpBarContainer: {
    height: '6px',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  enemyHpBarFill: {
    height: '100%',
    backgroundColor: 'var(--danger-color)',
    transition: 'width 0.3s ease'
  },
  comboBadge: {
    marginTop: 'auto',
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    border: '1px solid rgba(236, 72, 153, 0.25)',
    color: '#F472B6',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    padding: '4px 10px',
    borderRadius: '999px'
  },
  victoryCard: {
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
  victoryTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.75rem',
    letterSpacing: '2px',
  },
  victoryDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5'
  },
  rewardsBox: {
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
  },
  failedCard: {
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
  failedTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.75rem',
    letterSpacing: '2px',
  },
  failedDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5'
  }
};
