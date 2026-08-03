import React, { useState, useEffect, useRef } from 'react';
import ConfettiEffect from '../components/ConfettiEffect';
import { usePlayerStore } from '../store/usePlayerStore';
import { 
  Zap, Heart, Trophy, Timer, Play, ChevronRight, AlertTriangle, 
  Shield, Coins, Sparkles, User, ShoppingBag, BarChart2, CheckCircle2, 
  RotateCcw, Award, Volume2, VolumeX, Flame, Clock
} from 'lucide-react';
import { playCoinSound, playExplosionSound, playVictorySound, playDefeatSound } from './utils/audio';

// Procedural Question Generator
function generateProceduralQuestion() {
  const categories = ['QUANTITATIVE', 'LOGICAL', 'ALGEBRA', 'SERIES', 'PROFIT & LOSS', 'PERMUTATION & PROBABILITY', 'RATIO & PROPORTION'];
  const category = categories[Math.floor(Math.random() * categories.length)];
  let text = '';
  let correctAnswer = 0;
  let tip = '';
  let options = [];

  switch (category) {
    case 'QUANTITATIVE': {
      const subType = Math.random() > 0.5 ? 'percentage' : 'arithmetic';
      if (subType === 'percentage') {
        const percentages = [10, 15, 20, 25, 30, 40, 50, 60, 75];
        const p = percentages[Math.floor(Math.random() * percentages.length)];
        const multipliers = [20, 40, 50, 60, 80, 100, 120, 150, 200, 300, 400, 500];
        const x = multipliers[Math.floor(Math.random() * multipliers.length)];
        text = `What is ${p}% of ${x}?`;
        correctAnswer = (p * x) / 100;
        tip = `Shortcut: ${p}% is same as ${p / 100} × ${x}. Try calculating 10% (= ${x / 10}) first, then multiply!`;
      } else {
        const a = Math.floor(Math.random() * 11) + 5; // 5-15
        const b = Math.floor(Math.random() * 11) + 4; // 4-14
        const c = Math.floor(Math.random() * 41) + 10; // 10-50
        const op = Math.random() > 0.5 ? '+' : '-';
        text = `Evaluate: ${a} × ${b} ${op} ${c}`;
        correctAnswer = op === '+' ? (a * b) + c : (a * b) - c;
        tip = `Order of Operations (BODMAS): First multiply ${a} × ${b} (= ${a * b}), then ${op === '+' ? 'add' : 'subtract'} ${c}.`;
      }
      break;
    }
    case 'LOGICAL': {
      const subType = Math.random() > 0.5 ? 'work' : 'speed';
      if (subType === 'work') {
        const pairs = [
          { x: 10, y: 15, ans: 6 },
          { x: 12, y: 24, ans: 8 },
          { x: 15, y: 30, ans: 10 },
          { x: 20, y: 30, ans: 12 },
          { x: 12, y: 6, ans: 4 },
          { x: 8, y: 24, ans: 6 }
        ];
        const pair = pairs[Math.floor(Math.random() * pairs.length)];
        text = `A can complete a job in ${pair.x} days, and B can do it in ${pair.y} days. How many days will they take working together?`;
        correctAnswer = pair.ans;
        tip = `Use Formula: (X × Y) / (X + Y). Here, (${pair.x} × ${pair.y}) / (${pair.x} + ${pair.y}) = ${pair.x * pair.y} / ${pair.x + pair.y} = ${pair.ans} days.`;
      } else {
        const speeds = [36, 54, 72, 90, 108]; // Multiples of 18 for clean m/s (10, 15, 20, 25, 30)
        const s = speeds[Math.floor(Math.random() * speeds.length)];
        const t = [10, 12, 15, 20, 30][Math.floor(Math.random() * 5)];
        const speedMps = (s * 5) / 18;
        text = `A train running at ${s} km/h crosses a standing signal pole in ${t} seconds. What is the length of the train in meters?`;
        correctAnswer = speedMps * t;
        tip = `First convert speed to m/s: ${s} km/h × 5/18 = ${speedMps} m/s. Length = Speed × Time = ${speedMps} × ${t} = ${correctAnswer}m.`;
      }
      break;
    }
    case 'ALGEBRA': {
      const xVal = Math.floor(Math.random() * 9) + 2; // 2-10
      const a = Math.floor(Math.random() * 7) + 2; // 2-8
      const b = Math.floor(Math.random() * 20) + 1; // 1-20
      const op = Math.random() > 0.5 ? '+' : '-';
      const c = op === '+' ? (a * xVal) + b : (a * xVal) - b;
      text = `Solve for x: ${a}x ${op} ${b} = ${c}`;
      correctAnswer = xVal;
      tip = `Isolate the x term: ${a}x = ${c} ${op === '+' ? '-' : '+'} ${b} = ${a * xVal}. Divide by ${a} to get x = ${xVal}.`;
      break;
    }
    case 'SERIES': {
      const subType = Math.random() > 0.5 ? 'arithmetic' : 'geometric';
      if (subType === 'arithmetic') {
        const start = Math.floor(Math.random() * 20) + 5;
        const diff = Math.floor(Math.random() * 8) + 3;
        const series = [start, start + diff, start + 2 * diff, start + 3 * diff];
        text = `Find the next term: ${series.join(', ')}, ...`;
        correctAnswer = start + 4 * diff;
        tip = `This is an Arithmetic Series with a common difference of +${diff}. Next term = ${series[3]} + ${diff} = ${correctAnswer}.`;
      } else {
        const start = [2, 3, 5][Math.floor(Math.random() * 3)];
        const ratio = [2, 3][Math.floor(Math.random() * 2)];
        const series = [start, start * ratio, start * ratio * ratio, start * ratio * ratio * ratio];
        text = `Find the next term: ${series.join(', ')}, ...`;
        correctAnswer = start * Math.pow(ratio, 4);
        tip = `This is a Geometric Series where each term is multiplied by ${ratio}. Next term = ${series[3]} × ${ratio} = ${correctAnswer}.`;
      }
      break;
    }
    case 'PROFIT & LOSS': {
      const cp = [100, 200, 250, 400, 500, 800, 1000][Math.floor(Math.random() * 7)];
      const pPercent = [10, 20, 25, 30, 50][Math.floor(Math.random() * 5)];
      const isProfit = Math.random() > 0.5;
      if (isProfit) {
        correctAnswer = cp + (cp * pPercent) / 100;
        text = `An item bought for ₹${cp} is sold at a profit of ${pPercent}%. What is its selling price?`;
        tip = `Profit = ${pPercent}% of ₹${cp} = ₹${(cp * pPercent) / 100}. Selling Price = Cost Price + Profit = ${cp} + ${(cp * pPercent) / 100} = ₹${correctAnswer}.`;
      } else {
        correctAnswer = cp - (cp * pPercent) / 100;
        text = `An item bought for ₹${cp} is sold at a loss of ${pPercent}%. What is its selling price?`;
        tip = `Loss = ${pPercent}% of ₹${cp} = ₹${(cp * pPercent) / 100}. Selling Price = Cost Price - Loss = ${cp} - ${(cp * pPercent) / 100} = ₹${correctAnswer}.`;
      }
      break;
    }
    case 'PERMUTATION & PROBABILITY': {
      const subType = Math.random() > 0.5 ? 'balls' : 'dice';
      if (subType === 'balls') {
        const red = [3, 4, 5][Math.floor(Math.random() * 3)];
        const blue = [5, 6, 7][Math.floor(Math.random() * 3)];
        const total = red + blue;
        text = `A bag contains ${red} red balls and ${blue} blue balls. If a ball is drawn at random, what is the probability (in %) of drawing a red ball?`;
        correctAnswer = Math.round((red / total) * 100);
        tip = `Probability = (Favorable outcomes) / (Total outcomes) = ${red} / ${total}. In percentage, it is (${red}/${total}) × 100 = ${correctAnswer}%.`;
      } else {
        const sumVal = [7, 8, 9][Math.floor(Math.random() * 3)];
        // Outcomes for sum 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) -> 6 outcomes
        // Outcomes for sum 8: (2,6), (3,5), (4,4), (5,3), (6,2) -> 5 outcomes
        // Outcomes for sum 9: (3,6), (4,5), (5,4), (6,3) -> 4 outcomes
        const outcomesCount = sumVal === 7 ? 6 : sumVal === 8 ? 5 : 4;
        text = `Two dice are thrown simultaneously. What is the probability (in %) of getting a sum of exactly ${sumVal}?`;
        correctAnswer = Math.round((outcomesCount / 36) * 100);
        tip = `Total sample space of 2 dice is 36. Favorable outcomes for sum ${sumVal} is ${outcomesCount}. Probability = (${outcomesCount}/36) × 100 = ${correctAnswer}%.`;
      }
      break;
    }
    case 'RATIO & PROPORTION': {
      const subType = Math.random() > 0.5 ? 'money' : 'mixture';
      if (subType === 'money') {
        const totalAmount = [500, 600, 800, 1000, 1200][Math.floor(Math.random() * 5)];
        const r1 = [2, 3][Math.floor(Math.random() * 2)];
        const r2 = [3, 5][Math.floor(Math.random() * 2)];
        const sumParts = r1 + r2;
        text = `Divide ₹${totalAmount} between Rohan and Neha in the ratio ${r1}:${r2}. What is Rohan's share in ₹?`;
        correctAnswer = (totalAmount * r1) / sumParts;
        tip = `Rohan's share is ${r1} parts out of ${sumParts} total parts. Rohan's share = (${r1}/${sumParts}) × ₹${totalAmount} = ₹${correctAnswer}.`;
      } else {
        const totalLitres = [40, 50, 60, 80, 100][Math.floor(Math.random() * 5)];
        const r1 = [3, 4][Math.floor(Math.random() * 2)];
        const r2 = 1;
        const sumParts = r1 + r2;
        text = `In a mixture of ${totalLitres} liters, milk and water are in the ratio ${r1}:${r2}. How many liters of milk are in the mixture?`;
        correctAnswer = (totalLitres * r1) / sumParts;
        tip = `Milk represents ${r1} parts out of ${sumParts} total parts. Milk volume = (${r1}/${sumParts}) × ${totalLitres} = ${correctAnswer} liters.`;
      }
      break;
    }
  }

  // Generate 3 unique wrong answers close to correctAnswer
  const wrongAnswers = new Set();
  while (wrongAnswers.size < 3) {
    let offset = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
    if (correctAnswer > 50) {
      offset = (Math.floor(Math.random() * 4) + 1) * 5 * (Math.random() > 0.5 ? 1 : -1);
    }
    const wrongVal = correctAnswer + offset;
    if (wrongVal !== correctAnswer && wrongVal > 0) {
      wrongAnswers.add(wrongVal);
    }
  }

  options = [correctAnswer, ...Array.from(wrongAnswers)];
  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  const correctIndex = options.indexOf(correctAnswer);

  return {
    category,
    text,
    options: options.map(val => String(val)),
    correct: correctIndex,
    tip
  };
}

// Available Skins for character customization
const RUNNER_SKINS = [
  { id: 'default', name: 'Cyber Core', color: '#00F3FF', trail: 'rgba(0, 243, 255, 0.4)', cost: 0, icon: '⚡' },
  { id: 'ninja', name: 'Synth Ninja', color: '#FF007F', trail: 'rgba(255, 0, 127, 0.4)', cost: 150, icon: '🥷' },
  { id: 'mech', name: 'Aegis Mech', color: '#F59E0B', trail: 'rgba(245, 158, 11, 0.4)', cost: 300, icon: '🤖' },
  { id: 'plasma', name: 'Plasma Spectre', color: '#A855F7', trail: 'rgba(168, 85, 247, 0.4)', cost: 500, icon: '🔮' }
];

// Upbeat Arcade Synthesizer Sound Engine (Subway Surfers Retro style)
const arcadeAudio = {
  ctx: null,
  mainGain: null,
  bgmInterval: null,
  bgmStep: 0,
  coinCombo: 0,
  lastCoinTime: 0,

  init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.mainGain = this.ctx.createGain();
      this.mainGain.gain.setValueAtTime(0.08, this.ctx.currentTime); // moderate master volume
      this.mainGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Arcade audio initialization failed:", e);
    }
  },

  playBgm() {
    this.init();
    if (!this.ctx || this.bgmInterval) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    // Catchy upbeat Subway Surfers-style chiptune melody
    // Tempo: 140 BPM, beat interval is 214ms
    const baseMelody = [
      261.63, 261.63, 329.63, 261.63, // C4, C4, E4, C4
      392.00, 392.00, 349.23, 293.66, // G4, G4, F4, D4
      261.63, 261.63, 329.63, 261.63, // C4, C4, E4, C4
      440.00, 440.00, 392.00, 329.63  // A4, A4, G4, E4
    ];
    const bassline = [
      65.41, 65.41, 77.78, 65.41, // C2, C2, D#2, C2
      87.31, 87.31, 98.00, 73.42, // F2, F2, G2, D2
      65.41, 65.41, 77.78, 65.41, // C2, C2, D#2, C2
      55.00, 55.00, 87.31, 98.00  // A1, A1, F2, G2
    ];

    this.bgmStep = 0;
    this.bgmInterval = setInterval(() => {
      const time = this.ctx.currentTime;

      // 1. Bass Bouncy Pulse (Triangle wave for fat retro bass)
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(bassline[this.bgmStep % bassline.length], time);
      bassGain.gain.setValueAtTime(0.2, time);
      bassGain.gain.linearRampToValueAtTime(0.01, time + 0.2);
      bassOsc.connect(bassGain);
      bassGain.connect(this.mainGain);
      bassOsc.start(time);
      bassOsc.stop(time + 0.21);

      // 2. Synthesized hi-hat/percussion sound (using filtered noise)
      if (this.bgmStep % 2 === 0) {
        this.playHiHat(time);
      }

      // 3. Synthesized kick drum on beats 0, 4, 8, 12
      if (this.bgmStep % 4 === 0) {
        this.playKick(time);
      }

      // 4. Play Bouncy Melody note (Sine wave for sweet bells)
      if (this.bgmStep % 8 !== 2 && this.bgmStep % 8 !== 6) { // rhythmic gaps
        const melOsc = this.ctx.createOscillator();
        const melGain = this.ctx.createGain();
        melOsc.type = 'sine';
        
        // play melody octave higher
        const note = baseMelody[this.bgmStep % baseMelody.length] * (this.bgmStep % 16 >= 8 ? 1.5 : 1);
        melOsc.frequency.setValueAtTime(note, time);
        
        melGain.gain.setValueAtTime(0.08, time);
        melGain.gain.linearRampToValueAtTime(0.001, time + 0.18);
        melOsc.connect(melGain);
        melGain.connect(this.mainGain);
        melOsc.start(time);
        melOsc.stop(time + 0.19);
      }

      this.bgmStep++;
    }, 214);
  },

  playHiHat(time) {
    const bufferSize = this.ctx.sampleRate * 0.04; // 40ms noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(8000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.05, time);
    gain.gain.linearRampToValueAtTime(0.001, time + 0.03);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.mainGain);
    
    noise.start(time);
    noise.stop(time + 0.045);
  },

  playKick(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    
    osc.frequency.setValueAtTime(130, time);
    osc.frequency.exponentialRampToValueAtTime(35, time + 0.1);

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.linearRampToValueAtTime(0.001, time + 0.12);

    osc.connect(gain);
    gain.connect(this.mainGain);

    osc.start(time);
    osc.stop(time + 0.13);
  },

  stopBgm() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  },

  playCoinChime() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const time = this.ctx.currentTime;
    const now = Date.now();
    if (now - this.lastCoinTime < 500) {
      this.coinCombo = Math.min(10, this.coinCombo + 1);
    } else {
      this.coinCombo = 0;
    }
    this.lastCoinTime = now;

    const baseFreq = 987.77; // B5 note
    const freqFactor = 1 + (this.coinCombo * 0.08); // +8% pitch per consecutive coin
    
    const playTone = (freq, delay, dur) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * freqFactor, time + delay);

      gain.gain.setValueAtTime(0.12, time + delay);
      gain.gain.linearRampToValueAtTime(0.001, time + delay + dur);

      osc.connect(gain);
      gain.connect(this.mainGain);
      osc.start(time + delay);
      osc.stop(time + delay + dur + 0.02);
    };

    playTone(baseFreq, 0, 0.08);
    playTone(baseFreq * 1.33, 0.06, 0.16);
  },

  playCorrectBoost() {
    this.init();
    if (!this.ctx) return;
    const time = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(1400, time + 0.65);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(360, time);
    osc2.frequency.exponentialRampToValueAtTime(2800, time + 0.65);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, time);
    filter.frequency.exponentialRampToValueAtTime(3000, time + 0.65);
    filter.Q.setValueAtTime(3, time);

    gain.gain.setValueAtTime(0.18, time);
    gain.gain.linearRampToValueAtTime(0.001, time + 0.7);

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.mainGain);

    osc.start(time);
    osc2.start(time);
    osc.stop(time + 0.72);
    osc2.stop(time + 0.72);
  },

  playCrashHit() {
    this.init();
    if (!this.ctx) return;
    const time = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, time);
    osc.frequency.linearRampToValueAtTime(25, time + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.linearRampToValueAtTime(0.001, time + 0.45);

    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(450, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25, time);
    noiseGain.gain.linearRampToValueAtTime(0.001, time + 0.25);

    osc.connect(gain);
    gain.connect(this.mainGain);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.mainGain);

    osc.start(time);
    noise.start(time);
    osc.stop(time + 0.46);
    noise.stop(time + 0.26);
  },

  playDefeatFall() {
    this.init();
    if (!this.ctx) return;
    const time = this.ctx.currentTime;

    const notes = [329.63, 293.66, 261.63, 196.00];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time + idx * 0.18);
      
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = 6;
      lfoGain.gain.value = 8;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      gain.gain.setValueAtTime(0.15, time + idx * 0.18);
      gain.gain.linearRampToValueAtTime(0.001, time + idx * 0.18 + 0.28);

      osc.connect(gain);
      gain.connect(this.mainGain);
      
      lfo.start(time + idx * 0.18);
      osc.start(time + idx * 0.18);
      osc.stop(time + idx * 0.18 + 0.3);
      lfo.stop(time + idx * 0.18 + 0.3);
    });
  }
};

export default function AptitudeDistrict() {
  const { coins, addCoins, addXP, setAptiHighScore, aptiHighScore, setGame, completeDailyChallenge } = usePlayerStore();
  
  const submitAnswerRef = useRef(null);
  const triggerCrashRef = useRef(null);
  
  // Game states: 'lobby' | 'playing' | 'feedback' | 'gameover' | 'skins' | 'leaderboard'
  const [gameState, setGameState] = useState('lobby');
  const [qIndex, setQIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [timeLeft, setTimeLeft] = useState(25);
  const [baseTime, setBaseTime] = useState(25);
  const [maxTime, setMaxTime] = useState(25);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [shields, setShields] = useState(3);
  const [shake, setShake] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Shop and customization state
  const [unlockedSkins, setUnlockedSkins] = useState(() => {
    const saved = localStorage.getItem('apti_rush_unlocked_skins');
    return saved ? JSON.parse(saved) : ['default'];
  });
  const [currentSkinId, setCurrentSkinId] = useState(() => {
    return localStorage.getItem('apti_rush_current_skin') || 'default';
  });

  // Daily challenge and daily rewards
  const [lastClaimDate, setLastClaimDate] = useState(() => {
    return localStorage.getItem('apti_rush_last_claim') || '';
  });
  const [dailyChallenges, setDailyChallenges] = useState([
    { id: 'score_500', text: 'Reach 500 score points', target: 500, current: 0, reward: 50, completed: false },
    { id: 'combo_5', text: 'Achieve a 5x Combo streak', target: 5, current: 0, reward: 30, completed: false },
    { id: 'collect_20', text: 'Collect 20 coins in one run', target: 20, current: 0, reward: 40, completed: false }
  ]);

  // Virtual Leaderboard entries
  const [leaderboard, setLeaderboard] = useState(() => {
    const saved = localStorage.getItem('apti_rush_leaderboard');
    if (saved) return JSON.parse(saved);
    return [
      { name: 'Sarvesh', score: 3200, rank: 'CTO Legend' },
      { name: 'Aman', score: 2450, rank: 'Architect' },
      { name: 'Rohan', score: 1800, rank: 'Tech Lead' },
      { name: 'Priya', score: 1400, rank: 'Senior Engineer' },
      { name: 'Nisha', score: 950, rank: 'Engineer' },
      { name: 'Vikram', score: 700, rank: 'Associate' }
    ];
  });

  // Refs for audio synth & canvas loops
  const canvasRef = useRef(null);
  const timerRef = useRef(null);
  const gameLoopRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);
  const activeSkin = RUNNER_SKINS.find(s => s.id === currentSkinId) || RUNNER_SKINS[0];

  // Toggle sound settings
  const toggleSound = () => {
    if (soundEnabled) {
      arcadeAudio.stopBgm();
      setSoundEnabled(false);
    } else {
      setSoundEnabled(true);
      if (gameState === 'playing' || gameState === 'feedback') {
        arcadeAudio.playBgm();
      }
    }
  };

  // Claim Daily Rewards
  const claimDailyReward = () => {
    const today = new Date().toDateString();
    if (lastClaimDate === today) return;
    
    addCoins(50);
    localStorage.setItem('apti_rush_last_claim', today);
    setLastClaimDate(today);
    if (soundEnabled) arcadeAudio.playCoinChime();
  };

  // Purchase/Unlock Skin
  const purchaseSkin = (skin) => {
    if (unlockedSkins.includes(skin.id)) {
      // Just select
      setCurrentSkinId(skin.id);
      localStorage.setItem('apti_rush_current_skin', skin.id);
      return;
    }

    if (coins >= skin.cost) {
      addCoins(-skin.cost);
      const updated = [...unlockedSkins, skin.id];
      setUnlockedSkins(updated);
      localStorage.setItem('apti_rush_unlocked_skins', JSON.stringify(updated));
      setCurrentSkinId(skin.id);
      localStorage.setItem('apti_rush_current_skin', skin.id);
      if (soundEnabled) arcadeAudio.playCoinChime();
    }
  };

  const [dbQuestions, setDbQuestions] = useState([]);
  const [usedDbIds, setUsedDbIds] = useState([]);

  useEffect(() => {
    const DIFFICULTY_ORDER = {
      easy: 1,
      medium: 2,
      hard: 3,
      critical: 4
    };

    const solvedIds = localStorage.getItem('solved_question_ids_apti-rush') || '';
    fetch(`${window.API_BASE_URL || (window.API_BASE_URL || 'http://localhost:5000')}/api/questions?category=apti-rush&limit=100&excludeIds=${solvedIds}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.questions && data.questions.length > 0) {
          const sorted = [...data.questions].sort((a, b) => {
            const diffA = DIFFICULTY_ORDER[a.difficulty] || 1;
            const diffB = DIFFICULTY_ORDER[b.difficulty] || 1;
            return diffA - diffB;
          });
          setDbQuestions(sorted);
        }
      })
      .catch(() => {});
  }, [gameState === 'lobby']);

  const fetchNextAptiQuestion = (currentUsedIds = usedDbIds) => {
    const available = dbQuestions.filter(q => !currentUsedIds.includes(q._id));
    if (available.length > 0) {
      const selected = available[0];
      setUsedDbIds(prev => [...prev, selected._id]);
      return {
        category: selected.extraDetails?.topic || 'QUANTITATIVE',
        text: selected.question,
        options: selected.options,
        correct: selected.correctAnswer,
        tip: selected.tip,
        _id: selected._id
      };
    } else if (dbQuestions.length > 0) {
      const selected = dbQuestions[0];
      setUsedDbIds([selected._id]);
      return {
        category: selected.extraDetails?.topic || 'QUANTITATIVE',
        text: selected.question,
        options: selected.options,
        correct: selected.correctAnswer,
        tip: selected.tip,
        _id: selected._id
      };
    }
    return generateProceduralQuestion();
  };

  // Start the Game
  const startGame = () => {
    setQIndex(0);
    setScore(0);
    setCoinsCollected(0);
    setShields(3);
    setCombo(0);
    setMaxCombo(0);
    setSelectedOpt(null);
    setIsCorrect(null);
    setConfettiActive(false);
    setGameState('playing');
    
    // Initialize seen pool for this run
    setUsedDbIds([]);
    const firstQ = fetchNextAptiQuestion([]);
    setCurrentQuestion(firstQ);

    const initialBase = 25;
    const isHeavy = 
      firstQ.category === 'PERMUTATION & PROBABILITY' || 
      firstQ.category === 'PROFIT & LOSS' ||
      firstQ.category === 'QUANTITATIVE' ||
      firstQ.category === 'LOGICAL' ||
      (firstQ.text && (
        firstQ.text.toLowerCase().includes('percent') || 
        firstQ.text.toLowerCase().includes('days') || 
        firstQ.text.toLowerCase().includes('train') || 
        firstQ.text.toLowerCase().includes('work') ||
        firstQ.text.toLowerCase().includes('speed')
      ));
    
    const initialMax = isHeavy ? initialBase + 10 : initialBase;

    setBaseTime(initialBase);
    setMaxTime(initialMax);
    setTimeLeft(initialMax);

    // Reset daily challenge tracking in state for this run
    setDailyChallenges(prev => prev.map(c => ({ ...c, current: 0 })));

    if (soundEnabled) {
      arcadeAudio.playBgm();
    }
  };

  // Submit Answer
  const submitAnswer = (idx) => {
    if (gameState !== 'playing') return;
    clearInterval(timerRef.current);
    setSelectedOpt(idx);

    const correct = idx === currentQuestion.correct;
    setIsCorrect(correct);

    if (correct) {
      // Points calculation: Increased base points during Hyperboost to 15!
      const mult = Math.min(8, 1 + Math.floor(combo / 3)); // caps combo at 8x
      const pointsGained = 15 * mult;
      
      setCombo(prev => {
        const next = prev + 1;
        if (next > maxCombo) setMaxCombo(next);
        return next;
      });
      setScore(prev => prev + pointsGained);
      setCoinsCollected(prev => prev + 2); // get coins for answering correctly
      
      // Award flat +5 XP directly to global store profile on correct answers!
      addXP(5);

      if (currentQuestion._id) {
        const solved = localStorage.getItem('solved_question_ids_apti-rush') || '';
        const newSolved = solved ? solved.split(',') : [];
        if (!newSolved.includes(currentQuestion._id)) {
          newSolved.push(currentQuestion._id);
          localStorage.setItem('solved_question_ids_apti-rush', newSolved.join(','));
        }
      }
      
      if (soundEnabled) arcadeAudio.playCorrectBoost();

      // Trigger runner animations on canvas (speed boost & coin vacuum magnet)
      if (canvasGameEngine.current) {
        canvasGameEngine.current.triggerBoost();
      }

      setGameState('feedback');

      // Auto-advance after 1.8 seconds of hyper speed run
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = setTimeout(() => {
        nextQuestion();
      }, 1800);
    } else {
      triggerCrash('Wrong Answer');
    }
  };
  submitAnswerRef.current = submitAnswer;

  // Trigger Crash
  const triggerCrash = (reason) => {
    setCombo(0);
    setIsCorrect(false);
    setShields(prev => {
      const next = Math.max(0, prev - 1);
      if (next === 0) {
        handleGameOver();
      } else {
        setGameState('feedback');
      }
      return next;
    });

    setShake(true);
    setTimeout(() => setShake(false), 500);
    if (soundEnabled) arcadeAudio.playCrashHit();

    if (canvasGameEngine.current) {
      canvasGameEngine.current.triggerCrash();
    }
  };
  triggerCrashRef.current = triggerCrash;

  // Handle Timeout (counts as crash)
  const handleTimeout = () => {
    triggerCrash('Time Out');
  };

  // Proceed to next procedural question
  const nextQuestion = () => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
    if (shields <= 0) {
      setGameState('gameover');
      return;
    }

    const nextQ = fetchNextAptiQuestion();
    const nextBase = Math.max(15, 25 - Math.floor(qIndex / 4));
    
    const isHeavy = 
      nextQ.category === 'PERMUTATION & PROBABILITY' || 
      nextQ.category === 'PROFIT & LOSS' ||
      nextQ.category === 'QUANTITATIVE' ||
      nextQ.category === 'LOGICAL' ||
      (nextQ.text && (
        nextQ.text.toLowerCase().includes('percent') || 
        nextQ.text.toLowerCase().includes('days') || 
        nextQ.text.toLowerCase().includes('train') || 
        nextQ.text.toLowerCase().includes('work') ||
        nextQ.text.toLowerCase().includes('speed')
      ));

    let nextMax = nextBase;
    if (isHeavy) {
      nextMax += 10;
    }
    if (isCorrect) {
      nextMax += 8; // Boost by +8 seconds on correct answer!
    }

    setSelectedOpt(null);
    setIsCorrect(null);
    setQIndex(prev => prev + 1);
    setCurrentQuestion(nextQ);
    setBaseTime(nextBase);
    setMaxTime(nextMax);
    setTimeLeft(nextMax);
    setGameState('playing');
  };

  // Game Over
  const handleGameOver = () => {
    arcadeAudio.stopBgm();
    if (soundEnabled) arcadeAudio.playDefeatFall();
    if (score >= 150) {
      setConfettiActive(true);
    }
    if (score >= 50) {
      if (localStorage.getItem('active_daily_challenge_game') === 'apti-rush') {
        completeDailyChallenge();
      }
    }

    // Sync score and coins to store
    const finalCoinsGained = coinsCollected;
    const finalXpGained = Math.floor(score / 4);

    addCoins(finalCoinsGained);
    addXP(finalXpGained);
    setAptiHighScore(score);

    // Update daily challenge accomplishments
    setDailyChallenges(prev => {
      return prev.map(ch => {
        let current = ch.current;
        if (ch.id === 'score_500') current = score;
        if (ch.id === 'combo_5') current = maxCombo;
        if (ch.id === 'collect_20') current = coinsCollected;
        
        const completed = current >= ch.target;
        if (completed && !ch.completed) {
          // award bonus coins instantly
          addCoins(ch.reward);
        }
        return { ...ch, current, completed };
      });
    });

    // Update Virtual Leaderboard
    setLeaderboard(prev => {
      const entries = [...prev];
      const playerIndex = entries.findIndex(e => e.name === 'You');
      if (playerIndex !== -1) {
        if (score > entries[playerIndex].score) {
          entries[playerIndex].score = score;
        }
      } else {
        entries.push({ name: 'You', score: score, rank: 'Custom Runner' });
      }
      
      // Re-sort
      return entries.sort((a, b) => b.score - a.score).map((e, idx) => {
        // assign virtual rank based on top spots
        let rank = 'Associate';
        if (e.score >= 3000) rank = 'CTO Legend';
        else if (e.score >= 2000) rank = 'Architect';
        else if (e.score >= 1200) rank = 'Tech Lead';
        else if (e.score >= 800) rank = 'Senior Engineer';
        else if (e.score >= 400) rank = 'Engineer';
        return { ...e, rank };
      });
    });

    setGameState('gameover');
  };

  // Timer tick down
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState, qIndex]);

  // Clean up BGM on unmount
  useEffect(() => {
    return () => {
      arcadeAudio.stopBgm();
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  // HTML5 Canvas 3D Runner Rendering Engine
  const canvasGameEngine = useRef(null);
  
  useEffect(() => {
    if (gameState !== 'playing' && gameState !== 'feedback') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Fit canvas container
    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 3D Perspective settings
    const vanishingPoint = { x: 0, y: 0 };
    const fov = 320;
    const roadY = 1.3; // projection multiplier below horizon
    
    // Game scroll variables
    let scrollOffset = 0;
    let baseSpeed = 5;
    let targetSpeed = 0.8; // Solve phase starts at very slow hover speed
    let speed = 0.8;
    
    // Player object
    const player = {
      lane: 0, // -1 (Left), 0 (Center), 1 (Right)
      renderLane: 0,
      y: 0,
      targetY: 0,
      jumpTime: 0,
      slideTime: 0,
      isBoosting: false,
      boostFrames: 0,
      crashFrames: 0
    };

    // Lists of environment obstacles/coins
    let obstacles = [];
    let coins = [];
    let particles = [];
    let speedLines = [];
    let floatingTexts = [];
    let magnetActive = false;
    let magnetTimer = 0;

    // Background stars initialization
    const stars = [];
    for (let i = 0; i < 40; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random() * 0.4,
        size: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? '#00F3FF' : '#FF007F'
      });
    }

    // Parallax City Skylines
    const buildings = [];
    for (let i = 0; i < 12; i++) {
      buildings.push({
        x: i * 0.1 - 0.1,
        width: Math.random() * 0.08 + 0.05,
        height: Math.random() * 0.2 + 0.1,
        lights: Array.from({ length: 6 }, () => Math.random() > 0.5)
      });
    }

    // Function to spawn coins in lanes
    const spawnGroup = (lane) => {
      for (let i = 0; i < 4; i++) {
        coins.push({
          lane: lane,
          z: 18 + i * 2, // spaced in Z
          gathered: false,
          angle: Math.random() * Math.PI * 2
        });
      }
    };

    // Track active question barrier
    let hasBarrier = false;

    // Trigger animations from parent component state changes
    canvasGameEngine.current = {
      triggerBoost: () => {
        player.isBoosting = true;
        player.boostFrames = 100; // Match 1.8 second duration (60fps * 1.8s = 108 frames)
        targetSpeed = 15;
        magnetActive = true;
        magnetTimer = 100; // magnet pull frames
        
        // Spawn rewards
        spawnGroup(player.lane);
        
        // Floating arcade text pops
        const pScaleX = vanishingPoint.x + (player.lane * 0.7 / 1.35) * fov;
        floatingTexts.push({
          text: 'PERFECT!',
          x: pScaleX,
          y: canvas.height * 0.62,
          vy: -2,
          color: '#00F3FF',
          size: 24,
          life: 50,
          maxLife: 50
        });
        
        floatingTexts.push({
          text: '⚡ +5 XP',
          x: pScaleX,
          y: canvas.height * 0.68,
          vy: -1.7,
          color: '#A855F7',
          size: 18,
          life: 50,
          maxLife: 50
        });

        floatingTexts.push({
          text: '⏱️ TIME +4s',
          x: pScaleX,
          y: canvas.height * 0.74,
          vy: -1.4,
          color: '#10B981',
          size: 18,
          life: 50,
          maxLife: 50
        });

        // Stunt dodge choice
        if (Math.random() > 0.5) {
          player.jumpTime = 30; // 30 frames jump
        } else {
          player.slideTime = 30; // 30 frames slide
        }
        
        // Neon burst particles
        for (let i = 0; i < 15; i++) {
          particles.push({
            x: pScaleX + (Math.random() * 40 - 20),
            y: canvas.height * 0.8 + (Math.random() * 40 - 20),
            vx: (Math.random() - 0.5) * 8,
            vy: -Math.random() * 6 - 2,
            size: Math.random() * 5 + 3,
            color: activeSkin.color,
            alpha: 1,
            decay: 0.02
          });
        }
      },
      triggerCrash: () => {
          player.crashFrames = 30;
          targetSpeed = 1.5;
          
          // Floating crash text
          floatingTexts.push({
            text: 'CRASH!',
            x: canvas.width / 2 + (player.lane * 150),
            y: canvas.height * 0.65,
            vy: -1.5,
            color: '#FF003C',
            size: 24,
            life: 50,
            maxLife: 50
          });
  
          // Red explosion sparks
          const pScaleX = vanishingPoint.x + (player.lane * 0.7 / 1.35) * fov;
          for (let i = 0; i < 25; i++) {
            particles.push({
              x: pScaleX + (Math.random() * 40 - 20),
              y: canvas.height * 0.8 + (Math.random() * 40 - 20),
              vx: (Math.random() - 0.5) * 12,
              vy: (Math.random() - 0.5) * 12,
              size: Math.random() * 6 + 4,
              color: '#FF003C',
              alpha: 1,
              decay: 0.03
            });
          }
        }
    };

    // Render loop
    const render = () => {
      vanishingPoint.x = canvas.width / 2;
      vanishingPoint.y = canvas.height * 0.35;

      // Update target speed dynamically based on active game phases
      if (gameState === 'playing') {
        targetSpeed = 0.8; // slow hover speed for reading/calculating
      } else if (gameState === 'feedback') {
        if (isCorrect) {
          if (player.isBoosting) {
            targetSpeed = 15; // rocket speed on correct answer!
          } else {
            targetSpeed = 0.8; // decelerating back to solver speed
          }
        } else {
          targetSpeed = 0; // completely frozen on incorrect answers for study
        }
      }

      // Update game stats
      speed += (targetSpeed - speed) * 0.08;
      scrollOffset += speed * 0.08;
      
      // Decay boost state back to normal
      if (player.boostFrames > 0) {
        player.boostFrames--;
        if (player.boostFrames === 0) {
          player.isBoosting = false;
        }
      }
      if (player.crashFrames > 0) {
        player.crashFrames--;
      }

      // Smooth lane changing transition
      player.renderLane += (player.lane - player.renderLane) * 0.2;

      // Spawn new barrier in distance if none exists
      if (!hasBarrier && gameState === 'playing') {
        // Spawn obstacle barrier at Z=20
        const obsLane = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        obstacles.push({
          lane: obsLane,
          z: 20,
          cleared: false,
          color: '#FF0055',
          glow: 15
        });
        hasBarrier = true;
      }

      // Magnet timer update
      if (magnetTimer > 0) {
        magnetTimer--;
        if (magnetTimer === 0) magnetActive = false;
      }

      // 0. UPDATE & DRAW FLOATING TEXT POPS
      floatingTexts.forEach(t => {
        t.y += t.vy;
        t.life--;
        const alpha = t.life / t.maxLife;
        ctx.save();
        ctx.fillStyle = t.color;
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = t.color;
        ctx.font = `bold ${t.size}px var(--font-title)`;
        ctx.textAlign = 'center';
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
      });
      floatingTexts = floatingTexts.filter(t => t.life > 0);

      // Draw Dashboard Speedometer at top center
      ctx.save();
      ctx.fillStyle = 'rgba(12, 4, 30, 0.7)';
      ctx.strokeStyle = activeSkin.color;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 8;
      ctx.shadowColor = activeSkin.color;
      ctx.beginPath();
      ctx.rect(canvas.width / 2 - 50, 10, 100, 40);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 3;
      ctx.fillStyle = '#FFF';
      ctx.font = '16px var(--font-title)';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.floor(speed * 18)}`, canvas.width / 2, 28);
      
      ctx.fillStyle = activeSkin.color;
      ctx.font = '7px var(--font-mono)';
      ctx.fillText("KM/H", canvas.width / 2, 38);
      ctx.restore();

      // 1. DRAW BACKGROUND
      // Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#04010a');
      skyGrad.addColorStop(0.35, '#120324');
      skyGrad.addColorStop(0.7, '#24083a');
      skyGrad.addColorStop(1, '#080110');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      stars.forEach(star => {
        ctx.fillStyle = star.color;
        ctx.shadowBlur = 4;
        ctx.shadowColor = star.color;
        ctx.fillRect(star.x * canvas.width, star.y * canvas.height, star.size, star.size);
      });
      ctx.shadowBlur = 0;

      // Parallax City Silhouette
      ctx.fillStyle = '#0a0214';
      buildings.forEach(b => {
        const xPos = b.x * canvas.width - (player.renderLane * 15);
        const wVal = b.width * canvas.width;
        const hVal = b.height * canvas.height;
        ctx.fillRect(xPos, vanishingPoint.y - hVal, wVal, hVal + 10);
        
        // Draw neon windows
        ctx.fillStyle = 'rgba(255, 0, 127, 0.15)';
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 2; col++) {
            if (b.lights[(row * 2 + col) % b.lights.length]) {
              ctx.fillRect(xPos + (col * wVal * 0.3) + wVal * 0.2, vanishingPoint.y - hVal + (row * hVal * 0.2) + hVal * 0.1, wVal * 0.15, hVal * 0.08);
            }
          }
        }
        ctx.fillStyle = '#0a0214';
      });

      // 2. DRAW 3D PERSPECTIVE HIGHWAY
      // Road Surface polygon
      const roadCorners = [
        { x: vanishingPoint.x - 20, y: vanishingPoint.y },
        { x: vanishingPoint.x + 20, y: vanishingPoint.y },
        { x: canvas.width * 0.9, y: canvas.height },
        { x: canvas.width * 0.1, y: canvas.height }
      ];
      ctx.fillStyle = 'rgba(10, 3, 22, 0.9)';
      ctx.beginPath();
      ctx.moveTo(roadCorners[0].x, roadCorners[0].y);
      ctx.lineTo(roadCorners[1].x, roadCorners[1].y);
      ctx.lineTo(roadCorners[2].x, roadCorners[2].y);
      ctx.lineTo(roadCorners[3].x, roadCorners[3].y);
      ctx.closePath();
      ctx.fill();

      // Transversal grid Lines (Floor Lines that scroll)
      ctx.strokeStyle = 'rgba(255, 133, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let z = 1; z <= 20; z++) {
        const gridZ = z - (scrollOffset % 1);
        const gridY = vanishingPoint.y + (roadY / gridZ) * fov;
        if (gridY > vanishingPoint.y && gridY < canvas.height) {
          ctx.beginPath();
          ctx.moveTo(vanishingPoint.x - (3 / gridZ) * fov, gridY);
          ctx.lineTo(vanishingPoint.x + (3 / gridZ) * fov, gridY);
          ctx.stroke();
        }
      }

      // Lane boundaries (3 lanes total: X = -1.05, -0.35, 0.35, 1.05)
      const laneCoordsX = [-1.05, -0.35, 0.35, 1.05];
      laneCoordsX.forEach((laneX, idx) => {
        ctx.strokeStyle = idx === 0 || idx === 3 ? activeSkin.color : 'rgba(0, 243, 255, 0.4)';
        ctx.lineWidth = idx === 0 || idx === 3 ? 3 : 1.5;
        if (idx === 0 || idx === 3) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = activeSkin.color;
        }

        ctx.beginPath();
        // Project vanishing end (z = 20) to screen bottom (z = 1)
        const projTopX = vanishingPoint.x + (laneX / 20) * fov;
        const projTopY = vanishingPoint.y + (roadY / 20) * fov;
        const projBotX = vanishingPoint.x + (laneX / 1) * fov;
        const projBotY = vanishingPoint.y + (roadY / 1) * fov;
        
        ctx.moveTo(projTopX, projTopY);
        ctx.lineTo(projBotX, projBotY);
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // 3. UPDATE & DRAW ENTIRE COINS LIST
      coins.forEach(coin => {
        // Magnet effect: pull coins to player if active
        if (magnetActive) {
          coin.lane += (player.renderLane - coin.lane) * 0.15;
          coin.z += (1.35 - coin.z) * 0.15;
        } else {
          coin.z -= speed * 0.015;
        }

        // Draw active coin
        if (coin.z > 1 && coin.z < 20 && !coin.gathered) {
          const coinX = coin.lane * 0.7; // lane scaling factor (fit canvas width)
          const coinScaleX = vanishingPoint.x + (coinX / coin.z) * fov;
          const coinScaleY = vanishingPoint.y + (roadY / coin.z) * fov - (40 / coin.z); // floating slightly above
          const radius = (20 / coin.z);

          // Draw spinning coin
          coin.angle += 0.15;
          ctx.save();
          ctx.translate(coinScaleX, coinScaleY);
          ctx.scale(Math.abs(Math.sin(coin.angle)), 1);

          ctx.shadowBlur = 8;
          ctx.shadowColor = '#FFD700';
          ctx.fillStyle = '#FFD700';
          ctx.strokeStyle = '#FF8C00';
          ctx.lineWidth = Math.max(1, 2 / coin.z);

          ctx.beginPath();
          ctx.arc(0, 0, radius > 0 ? radius : 1, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();

          // Coin Collection Check
          if (coin.z <= 1.5 && coin.z >= 1.2 && !coin.gathered) {
            // check lane match
            if (Math.abs(player.renderLane - coin.lane) < 0.6) {
              coin.gathered = true;
              setCoinsCollected(c => c + 1);
              setScore(s => s + 10);
              if (soundEnabled) arcadeAudio.playCoinChime();

              // Floating points text
              floatingTexts.push({
                text: '+10 PTS',
                x: coinScaleX,
                y: coinScaleY - 10,
                vy: -2,
                color: '#FFD700',
                size: 14,
                life: 35,
                maxLife: 35
              });

              // Spawn tiny coin blast particles
              for (let p = 0; p < 6; p++) {
                particles.push({
                  x: coinScaleX,
                  y: coinScaleY,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4 - 2,
                  size: Math.random() * 3 + 2,
                  color: '#FFD700',
                  alpha: 1,
                  decay: 0.04
                });
              }
            }
          }
        }
      });

      // Filter out dead/offscreen coins
      coins = coins.filter(c => c.z > 1.05 && !c.gathered);

      // 4. UPDATE & DRAW ENTIRE OBSTACLES LIST
      obstacles.forEach(obs => {
        obs.z -= speed * 0.015;

        // Draw firewall barrier
        if (obs.z > 1 && obs.z < 20 && !obs.cleared) {
          const obsX = obs.lane * 0.7; // lane scaling factor (fit canvas width)
          const projX = vanishingPoint.x + (obsX / obs.z) * fov;
          const projY = vanishingPoint.y + (roadY / obs.z) * fov;
          const sizeW = (100 / obs.z);
          const sizeH = (60 / obs.z);

          // Draw barrier arch
          ctx.strokeStyle = obs.color;
          ctx.shadowBlur = obs.glow;
          ctx.shadowColor = obs.color;
          ctx.lineWidth = Math.max(2, 6 / obs.z);

          // Draw grid patterns on the barrier
          ctx.fillStyle = 'rgba(255, 0, 85, 0.08)';
          ctx.beginPath();
          ctx.rect(projX - sizeW, projY - sizeH, sizeW * 2, sizeH);
          ctx.fill();

          ctx.strokeRect(projX - sizeW, projY - sizeH, sizeW * 2, sizeH);
          
          // Draw caution label
          ctx.fillStyle = '#FFF';
          ctx.font = `${Math.max(6, 14 / obs.z)}px var(--font-title)`;
          ctx.textAlign = 'center';
          ctx.fillText("FIREWALL ERROR", projX, projY - sizeH / 2);
          ctx.shadowBlur = 0;

          // Crash / Dodge check
          if (obs.z <= 1.4 && obs.z >= 1.15) {
            // Check if player collided
            const laneDiff = Math.abs(player.renderLane - obs.lane);
            if (laneDiff < 0.7) {
              // If correct option is answered, barrier dissolves (turned green, cleared safely)
              if (gameState === 'feedback' && isCorrect) {
                // Dissolve cleanly
                obs.cleared = true;
                hasBarrier = false;
                
                // Blast barrier into neon sparks
                for (let i = 0; i < 15; i++) {
                  particles.push({
                    x: projX,
                    y: projY - sizeH / 2,
                    vx: (Math.random() - 0.5) * 8,
                    vy: -Math.random() * 5,
                    size: Math.random() * 4 + 2,
                    color: '#00F3FF',
                    alpha: 1,
                    decay: 0.02
                  });
                }
              } else {
                // Crash!
                obs.cleared = true;
                hasBarrier = false;
                
                if (gameState === 'playing') {
                  if (triggerCrashRef.current) {
                    triggerCrashRef.current('Firewall Collision');
                  }
                  setTimeLeft(t => Math.max(1, t - 4));
                }
              }
            }
          }
        }
      });

      // Clear offscreen obstacles
      obstacles.forEach(obs => {
        if (obs.z <= 1) {
          obs.cleared = true;
          hasBarrier = false;
        }
      });
      obstacles = obstacles.filter(o => !o.cleared);

      // 5. DRAW SPEED LINES / WARP SYSTEM
      if (player.isBoosting) {
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.4)';
        ctx.lineWidth = 1.5;
        if (Math.random() > 0.4) {
          speedLines.push({
            x: vanishingPoint.x,
            y: vanishingPoint.y,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            len: Math.random() * 40 + 20,
            life: 20
          });
        }
      }

      speedLines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(line.x + line.vx * 1.5, line.y + line.vy * 1.5);
        ctx.stroke();
        
        line.x += line.vx;
        line.y += line.vy;
        line.life--;
      });
      speedLines = speedLines.filter(l => l.life > 0);

      // 6. UPDATE & DRAW PARTICLE ENGINE
      particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size > 0 ? p.size : 1, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
      });
      particles = particles.filter(p => p.alpha > 0);

      // 7. DRAW RUNNER AVATAR
      const playerLaneX = player.renderLane * 0.7; // lane scaling factor (fit canvas width)
      const playerScaleX = vanishingPoint.x + (playerLaneX / 1.35) * fov;
      
      // Calculate Jumps / Slides
      let playerJumpY = 0;
      if (player.jumpTime > 0) {
        // sine jump wave
        playerJumpY = Math.sin((30 - player.jumpTime) / 30 * Math.PI) * 70;
        player.jumpTime--;
      }

      let playerScaleH = 1;
      if (player.slideTime > 0) {
        playerScaleH = 0.5; // squish height
        player.slideTime--;
      }

      const playerScaleY = vanishingPoint.y + (roadY / 1.35) * fov - playerJumpY;
      
      // Emit jetpack exhaust sparks
      if (Math.random() > 0.3) {
        particles.push({
          x: playerScaleX + (Math.random() * 10 - 5),
          y: playerScaleY - (10 * playerScaleH),
          vx: (Math.random() - 0.5) * 2 - (player.renderLane * 2),
          vy: Math.random() * 3 + 1,
          size: Math.random() * 3 + 1,
          color: activeSkin.color,
          alpha: 0.8,
          decay: 0.03
        });
      }

      // Render player shape (glowing cyberpunk hover bike or power runner)
      ctx.save();
      ctx.translate(playerScaleX, playerScaleY);
      ctx.scale(1, playerScaleH);

      // Shadow glow under player
      ctx.shadowBlur = player.isBoosting ? 20 : 12;
      ctx.shadowColor = activeSkin.color;
      ctx.fillStyle = activeSkin.color;

      // Draw futuristic jetpack runner shape
      // Torso / Body
      ctx.beginPath();
      ctx.moveTo(-12, -35);
      ctx.lineTo(12, -35);
      ctx.lineTo(8, -5);
      ctx.lineTo(-8, -5);
      ctx.closePath();
      ctx.fill();

      // Visor / Head
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, -42, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = activeSkin.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-5, -43);
      ctx.lineTo(5, -43);
      ctx.stroke();

      // Left Jetpack Wing
      ctx.fillStyle = '#220845';
      ctx.beginPath();
      ctx.moveTo(-12, -30);
      ctx.lineTo(-20, -15);
      ctx.lineTo(-12, -10);
      ctx.closePath();
      ctx.fill();

      // Right Jetpack Wing
      ctx.beginPath();
      ctx.moveTo(12, -30);
      ctx.lineTo(20, -15);
      ctx.lineTo(12, -10);
      ctx.closePath();
      ctx.fill();

      // Jetpack flame engine glow (changing color dynamically)
      ctx.fillStyle = player.isBoosting ? '#FF85FF' : '#00F3FF';
      ctx.fillRect(-18, -12, 4, 6);
      ctx.fillRect(14, -12, 4, 6);

      ctx.restore();
      ctx.shadowBlur = 0;

      // Repeat animation frame
      if (gameState === 'playing' || gameState === 'feedback') {
        gameLoopRef.current = requestAnimationFrame(render);
      }
    };

    gameLoopRef.current = requestAnimationFrame(render);

    // Dynamic keyboard controls (Arrow keys & WASD to switch lanes, plus hotkeys 1-4 to answer)
    const handleKeys = (e) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        player.lane = Math.max(-1, player.lane - 1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        player.lane = Math.min(1, player.lane + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        if (player.jumpTime === 0) player.jumpTime = 25;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        if (player.slideTime === 0) player.slideTime = 25;
      } else if (e.key === '1') {
        if (submitAnswerRef.current) submitAnswerRef.current(0);
      } else if (e.key === '2') {
        if (submitAnswerRef.current) submitAnswerRef.current(1);
      } else if (e.key === '3') {
        if (submitAnswerRef.current) submitAnswerRef.current(2);
      } else if (e.key === '4') {
        if (submitAnswerRef.current) submitAnswerRef.current(3);
      }
    };

    window.addEventListener('keydown', handleKeys);
    
    return () => {
      window.removeEventListener('keydown', handleKeys);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, currentSkinId]);

  const baseWaveTime = baseTime;
  const maxWaveTime = maxTime;

  return (
    <div style={styles.container} className={shake ? 'shake-animation' : ''}>
      <ConfettiEffect active={confettiActive} />
      {/* Background Sound controls */}
      <button style={styles.soundToggle} onClick={toggleSound}>
        {soundEnabled ? <Volume2 size={20} color="var(--accent-secondary)" /> : <VolumeX size={20} color="var(--danger-color)" />}
      </button>

      {/* 1. LOBBY STATE */}
      {gameState === 'lobby' && (
        <div style={styles.lobbyPanel} className="game-card">
          <Zap size={64} color="var(--accent-color)" className="float-animation" />
          <h2 style={styles.title}>APTITUDE DISTRICT: APTI RUSH</h2>
          <p style={styles.desc}>
            Race through a futuristic city highway! Dodge security firewalls and vacuum gold series coins by solving aptitude challenges. Beat the high score to earn massive XP and unlock elite runner gear!
          </p>

          <div style={styles.lobbyButtons}>
            <button className="game-btn game-btn-primary" style={styles.actionBtn} onClick={startGame}>
              <Play size={16} /> START CHALLENGE
            </button>
            <button className="game-btn" onClick={() => setGameState('skins')}>
              <ShoppingBag size={16} color="var(--accent-secondary)" /> RUNNER SHOP
            </button>
            <button className="game-btn" onClick={() => setGameState('leaderboard')}>
              <BarChart2 size={16} color="var(--warning-color)" /> LEADERBOARD
            </button>
          </div>

          {/* Daily reward & stats grid */}
          <div style={styles.lobbyGrid}>
            <div style={styles.statsSummaryCard}>
              <Trophy size={28} color="#FFD700" />
              <div>
                <div style={styles.statLabel}>Personal Best</div>
                <div style={styles.statValue}>{aptiHighScore} PTS</div>
              </div>
            </div>

            <div style={styles.statsSummaryCard}>
              <Coins size={28} color="var(--accent-secondary)" />
              <div>
                <div style={styles.statLabel}>Available Balance</div>
                <div style={styles.statValue}>{coins} COINS</div>
              </div>
            </div>

            <div style={{ ...styles.statsSummaryCard, gridColumn: 'span 2' }}>
              <Award size={28} color="#FF85FF" />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={styles.statLabel}>Daily Reward</span>
                  <span style={{ fontSize: '0.7rem', color: lastClaimDate === new Date().toDateString() ? 'var(--success-color)' : 'var(--text-secondary)' }}>
                    {lastClaimDate === new Date().toDateString() ? 'Claimed Today' : 'Available'}
                  </span>
                </div>
                <button 
                  style={{ 
                    ...styles.claimBtn, 
                    opacity: lastClaimDate === new Date().toDateString() ? 0.5 : 1,
                    cursor: lastClaimDate === new Date().toDateString() ? 'default' : 'pointer'
                  }}
                  disabled={lastClaimDate === new Date().toDateString()}
                  onClick={claimDailyReward}
                >
                  {lastClaimDate === new Date().toDateString() ? 'Claimed (+50)' : 'Claim Daily +50 Coins'}
                </button>
              </div>
            </div>
          </div>

          <div style={styles.rulesBox}>
            <div style={styles.ruleItem}>🏃‍♂️ **Controls:** Use click choices below, or lane-switch with Arrow Keys / WASD!</div>
            <div style={styles.ruleItem}>⚡ **Multipliers:** Correct streak boosts runner speed and pulls in all coins via magnet.</div>
            <div style={styles.ruleItem}>🛡️ **Shields:** Start with 3 shields. A crash or timeout costs 1 shield.</div>
          </div>
          
          <button className="game-btn" style={{ ...styles.actionBtn, marginTop: '0.5rem' }} onClick={() => setGame(null)}>
            Return to Hub
          </button>
        </div>
      )}

      {/* 2. PLAYING / FEEDBACK STATE */}
      {(gameState === 'playing' || gameState === 'feedback') && (
        <div style={styles.gameContainer}>
          {/* Main Visual Runner Canvas */}
          <div style={styles.canvasContainer}>
            <canvas ref={canvasRef} style={styles.runnerCanvas}></canvas>

            {/* Hyper Boost Text Overlay for Correct Answers */}
            {gameState === 'feedback' && isCorrect === true && (
              <div style={styles.correctOverlay} className="pulse-glow-animation">
                <Flame size={32} color="var(--accent-secondary)" />
                <div style={styles.correctOverlayText}>HYPER BOOST ACTIVATED!</div>
                <div style={styles.correctOverlaySub}>
                  +{15 * Math.min(8, 1 + Math.floor(combo / 3))} PTS | +5 XP | +4s NEXT WAVE TIME
                </div>
              </div>
            )}
            
            {/* Overlay HUD stats */}
            <div style={styles.hudOverlay}>
              <div style={styles.hudLeft}>
                <div style={styles.shieldPanel}>
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <Shield 
                      key={idx} 
                      size={22} 
                      fill={idx < shields ? 'var(--accent-color)' : 'transparent'} 
                      color={idx < shields ? 'var(--accent-color)' : 'rgba(255,255,255,0.15)'}
                      style={{ filter: idx < shields ? 'drop-shadow(0 0 5px var(--accent-color))' : 'none', marginRight: '4px' }}
                    />
                  ))}
                </div>
                <div style={styles.hudStat}>
                  <Trophy size={16} color="#FFD700" />
                  <span>PTS: {score}</span>
                </div>
              </div>

              <div style={styles.hudRight}>
                {combo >= 2 && (
                  <div style={styles.comboBadge} className="pulse-glow-animation">
                    <Flame size={16} color="var(--accent-color)" />
                    <span>COMBO x{combo}</span>
                  </div>
                )}
                <div style={styles.hudStat}>
                  <Coins size={16} color="var(--accent-secondary)" />
                  <span>COINS: {coinsCollected}</span>
                </div>
              </div>
            </div>

            {/* Quick Lane hint pointers */}
            <div style={styles.laneButtons}>
              <button style={styles.laneBtn} onClick={() => {
                if (canvasRef.current) window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
              }}>LEFT</button>
              <button style={styles.laneBtn} onClick={() => {
                if (canvasRef.current) window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
              }}>JUMP</button>
              <button style={styles.laneBtn} onClick={() => {
                if (canvasRef.current) window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
              }}>RIGHT</button>
            </div>
          </div>

          {/* Lower HUD: Question Box */}
          <div style={styles.questionPanel}>
            <div style={styles.qHeader}>
              <span style={styles.catBadge}>{currentQuestion?.category}</span>
              <div style={styles.timerBar}>
                <Clock size={14} color="var(--accent-secondary)" style={{ marginRight: '6px' }} />
                <span style={{ 
                  fontSize: '0.8rem', 
                  fontFamily: 'var(--font-mono)',
                  color: timeLeft > baseWaveTime ? 'var(--success-color)' : 'var(--text-primary)'
                }}>
                  {timeLeft}s {timeLeft > baseWaveTime && `(+${maxWaveTime - baseWaveTime}s Boost!)`}
                </span>
                <div style={styles.timerTrack}>
                  <div style={{ 
                    ...styles.timerFill, 
                    width: `${(timeLeft / maxWaveTime) * 100}%`,
                    backgroundColor: timeLeft <= 4 ? 'var(--danger-color)' : timeLeft > baseWaveTime ? 'var(--success-color)' : 'var(--accent-secondary)'
                  }}></div>
                </div>
              </div>
            </div>

            <div className="game-card" style={styles.qTextCard}>
              <div style={styles.qText}>{currentQuestion?.text}</div>
            </div>

            {/* Multiple choices */}
            <div style={styles.optionsGrid}>
              {currentQuestion?.options.map((opt, idx) => {
                let btnStyle = { ...styles.optionButton };
                if (gameState === 'feedback') {
                  if (idx === currentQuestion.correct) {
                    btnStyle.borderColor = 'var(--success-color)';
                    btnStyle.boxShadow = 'var(--glow-success)';
                    btnStyle.color = 'var(--success-color)';
                  } else if (selectedOpt === idx) {
                    btnStyle.borderColor = 'var(--danger-color)';
                    btnStyle.color = 'var(--danger-color)';
                  } else {
                    btnStyle.opacity = 0.35;
                  }
                }

                return (
                  <button 
                    key={idx}
                    className="game-btn"
                    style={btnStyle}
                    disabled={gameState === 'feedback'}
                    onClick={() => submitAnswer(idx)}
                  >
                    <span style={styles.optionIndex}>{['A', 'B', 'C', 'D'][idx]}</span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Learning Shortcut Feedback Panel (Only shown on incorrect answers so correct answers auto-advance smoothly) */}
            {gameState === 'feedback' && isCorrect === false && (
              <div className="game-card float-animation" style={{ 
                ...styles.feedbackCard, 
                borderColor: 'var(--danger-color)',
                boxShadow: 'none'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    fontWeight: '800', 
                    fontSize: '1.1rem', 
                    color: 'var(--danger-color)' 
                  }}>
                    💥 SECURITY BLOCKED / CRASH
                  </span>
                </div>
                <div style={styles.tipText}>
                  <strong>💡 Apti Shortcut:</strong> {currentQuestion?.tip}
                </div>
                <button className="game-btn game-btn-primary" style={styles.nextBtn} onClick={nextQuestion}>
                  CONTINUE RUN <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SKINS CUSTOMIZATION STATE */}
      {gameState === 'skins' && (
        <div style={styles.lobbyPanel} className="game-card">
          <ShoppingBag size={48} color="var(--accent-secondary)" />
          <h2 style={styles.title}>RUNNER GEAR APPAREL</h2>
          <p style={styles.desc}>
            Unlock glowing character skin trails with coins gathered during your runs. Equipped suits customize your 3D runner avatar in real-time.
          </p>

          <div style={styles.skinsList}>
            {RUNNER_SKINS.map(skin => {
              const isUnlocked = unlockedSkins.includes(skin.id);
              const isEquipped = currentSkinId === skin.id;

              return (
                <div key={skin.id} style={{ 
                  ...styles.skinCard, 
                  borderColor: isEquipped ? skin.color : 'rgba(255,255,255,0.05)',
                  boxShadow: isEquipped ? `0 0 10px ${skin.color}` : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ ...styles.skinIcon, backgroundColor: `${skin.color}20`, borderColor: skin.color }}>
                      {skin.icon}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: '700', color: skin.color }}>{skin.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {skin.cost === 0 ? 'Starter Suit' : `Cost: ${skin.cost} Coins`}
                      </div>
                    </div>
                  </div>

                  <button 
                    className={`game-btn ${isUnlocked && !isEquipped ? '' : 'game-btn-primary'}`}
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                    onClick={() => purchaseSkin(skin)}
                    disabled={!isUnlocked && coins < skin.cost}
                  >
                    {!isUnlocked ? `Buy ${skin.cost}` : isEquipped ? 'Equipped' : 'Equip'}
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center' }}>
            <button className="game-btn game-btn-primary" onClick={() => setGameState('lobby')}>
              Back to Terminal
            </button>
          </div>
        </div>
      )}

      {/* 4. LEADERBOARD STATE */}
      {gameState === 'leaderboard' && (
        <div style={styles.lobbyPanel} className="game-card">
          <Trophy size={48} color="var(--warning-color)" />
          <h2 style={styles.title}>GLOBAL LEADERBOARD</h2>
          <p style={styles.desc}>
            Rankings of top campus runners in logical and quantitative challenges. Prove your skills and claim the top seed!
          </p>

          <div style={styles.leaderboardList}>
            {leaderboard.map((entry, index) => {
              const isPlayer = entry.name === 'You';
              return (
                <div key={index} style={{ 
                  ...styles.leaderboardRow, 
                  backgroundColor: isPlayer ? 'rgba(0, 243, 255, 0.08)' : 'rgba(0,0,0,0.15)',
                  border: isPlayer ? '1px solid var(--accent-secondary)' : '1px solid rgba(255,255,255,0.03)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ ...styles.rankLabel, color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'var(--text-secondary)' }}>
                      #{index + 1}
                    </span>
                    <span style={{ fontWeight: isPlayer ? '800' : '400', color: isPlayer ? 'var(--accent-secondary)' : '#FFF' }}>
                      {entry.name} {isPlayer && '(You)'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <span style={styles.leadRankBadge}>{entry.rank}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--accent-color)' }}>
                      {entry.score} PTS
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="game-btn game-btn-primary" onClick={() => setGameState('lobby')}>
            Back to Terminal
          </button>
        </div>
      )}

      {/* 5. GAME OVER STATE */}
      {gameState === 'gameover' && (
        <div style={styles.lobbyPanel} className="game-card">
          <AlertTriangle size={64} color="var(--danger-color)" className="float-animation" />
          <h2 style={{ ...styles.title, color: 'var(--danger-color)' }}>BURNOUT / RUN ENDED</h2>
          <p style={styles.desc}>
            Your security shields completely depleted! The systems firewall blocked your access, but your run was synchronized with your developer profile.
          </p>

          <div style={styles.rewardsPanel}>
            <h4 style={{ fontFamily: 'var(--font-title)', color: '#FFF', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Synchronizing Rewards:</h4>
            <div style={styles.rewardRow}>
              <span>Final Runner Score:</span>
              <span style={{ color: 'var(--warning-color)', fontWeight: '700' }}>{score} PTS</span>
            </div>
            <div style={styles.rewardRow}>
              <span>Coins Synchronized (+):</span>
              <span style={{ color: 'var(--accent-secondary)', fontWeight: '700' }}>+{coinsCollected} Coins</span>
            </div>
            <div style={styles.rewardRow}>
              <span>XP Transferred (+):</span>
              <span style={{ color: '#A855F7', fontWeight: '700' }}>+{Math.floor(score / 4)} XP</span>
            </div>
          </div>

          {/* Daily challenges update summary */}
          <div style={{ width: '100%', textAlign: 'left', marginTop: '0.5rem' }}>
            <h5 style={{ fontFamily: 'var(--font-title)', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>DAILY CHALLENGE CHECKS:</h5>
            {dailyChallenges.map((ch, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                fontSize: '0.8rem',
                backgroundColor: 'rgba(0,0,0,0.2)',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                marginBottom: '4px',
                borderLeft: ch.completed ? '3px solid var(--success-color)' : '3px solid var(--text-secondary)'
              }}>
                <span>{ch.text}</span>
                <span style={{ fontWeight: '600', color: ch.completed ? 'var(--success-color)' : 'var(--text-secondary)' }}>
                  {ch.completed ? 'COMPLETED! (+Coins)' : `${ch.current}/${ch.target}`}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button className="game-btn game-btn-primary" onClick={startGame}>
              <RotateCcw size={16} /> Run Again
            </button>
            <button className="game-btn" onClick={() => setGameState('lobby')}>
              Lobby
            </button>
          </div>
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
    backgroundColor: '#05010a',
    position: 'relative',
    overflow: 'hidden'
  },
  soundToggle: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 10,
    transition: 'all 0.2s ease',
  },
  lobbyPanel: {
    maxWidth: '620px',
    width: '100%',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.2rem',
    backgroundColor: 'rgba(15, 4, 30, 0.85)',
    borderColor: 'rgba(255, 0, 127, 0.2)',
    maxHeight: '90%',
    overflowY: 'auto',
    padding: '2rem',
    borderRadius: '16px',
    borderWidth: '2px',
    backdropFilter: 'blur(10px)',
  },
  title: {
    fontFamily: 'var(--font-title)',
    fontSize: '2rem',
    letterSpacing: '2px',
    background: 'linear-gradient(90deg, var(--accent-color), var(--accent-secondary))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 0 15px rgba(255, 0, 127, 0.3)'
  },
  desc: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    lineHeight: '1.5',
  },
  lobbyButtons: {
    display: 'flex',
    gap: '0.8rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  actionBtn: {
    minWidth: '180px',
    justifyContent: 'center',
  },
  lobbyGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.8rem',
    width: '100%',
  },
  statsSummaryCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '10px',
    padding: '0.8rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    textAlign: 'left',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)'
  },
  statValue: {
    fontSize: '1.1rem',
    fontWeight: '800',
    fontFamily: 'var(--font-mono)'
  },
  claimBtn: {
    background: 'linear-gradient(90deg, var(--accent-secondary), var(--accent-color))',
    border: 'none',
    color: '#FFF',
    padding: '4px 10px',
    fontSize: '0.75rem',
    fontWeight: '700',
    borderRadius: '4px',
    width: '100%',
    marginTop: '4px',
    fontFamily: 'var(--font-title)',
  },
  rulesBox: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '8px',
    padding: '0.8rem 1rem',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    width: '100%',
  },
  ruleItem: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4'
  },
  gameContainer: {
    width: '100%',
    maxWidth: '920px',
    height: '100%',
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'stretch',
  },
  canvasContainer: {
    flex: '1.2',
    position: 'relative',
    background: '#040108',
    borderRadius: '16px',
    border: '2px solid rgba(255,255,255,0.08)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)'
  },
  runnerCanvas: {
    width: '100%',
    flex: '1',
    display: 'block',
  },
  hudOverlay: {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    pointerEvents: 'none',
    background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)'
  },
  hudLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  hudRight: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    alignItems: 'flex-end',
  },
  shieldPanel: {
    display: 'flex',
  },
  hudStat: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    padding: '4px 10px',
    color: '#FFF',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-mono)',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  comboBadge: {
    backgroundColor: 'rgba(255, 0, 127, 0.15)',
    border: '1px solid var(--accent-color)',
    borderRadius: '6px',
    padding: '4px 10px',
    color: '#FFF',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-title)',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: 'var(--glow-accent)',
  },
  laneButtons: {
    position: 'absolute',
    bottom: '1rem',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '1rem',
  },
  laneBtn: {
    background: 'rgba(0, 0, 0, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#FFF',
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: '800',
    cursor: 'pointer',
    fontFamily: 'var(--font-title)',
    transition: 'all 0.1s ease',
  },
  questionPanel: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    justifyContent: 'center',
  },
  qHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  catBadge: {
    fontFamily: 'var(--font-mono)',
    color: 'var(--accent-secondary)',
    border: '1px solid var(--accent-secondary)',
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: '0.75rem',
    backgroundColor: 'rgba(0, 243, 255, 0.05)'
  },
  timerBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  timerTrack: {
    width: '100px',
    height: '6px',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    transition: 'width 1s linear',
  },
  qTextCard: {
    padding: '1.8rem 1.5rem',
    backgroundColor: 'rgba(15, 4, 30, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    minHeight: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
  },
  qText: {
    fontSize: '1.1rem',
    fontWeight: '600',
    lineHeight: '1.5',
    textAlign: 'center',
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.8rem',
  },
  optionButton: {
    width: '100%',
    justifyContent: 'flex-start',
    padding: '1rem',
    fontSize: '0.9rem',
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(15, 4, 30, 0.5)',
  },
  optionIndex: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: 'var(--accent-color)',
    width: '22px',
    height: '22px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '0.7rem',
    fontFamily: 'var(--font-mono)',
  },
  feedbackCard: {
    borderWidth: '2px',
    backgroundColor: 'rgba(15, 4, 30, 0.95)',
    padding: '1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    borderRadius: '12px',
  },
  tipText: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: '0.6rem',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.03)'
  },
  nextBtn: {
    alignSelf: 'flex-end',
    padding: '0.4rem 0.8rem',
    fontSize: '0.75rem',
  },
  skinsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
    width: '100%',
    maxHeight: '350px',
    overflowY: 'auto',
    paddingRight: '6px',
  },
  skinCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    padding: '0.8rem 1rem',
    borderRadius: '10px',
  },
  skinIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.4rem',
  },
  leaderboardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    width: '100%',
    maxHeight: '350px',
    overflowY: 'auto',
    paddingRight: '6px',
  },
  leaderboardRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.8rem 1rem',
    borderRadius: '8px',
  },
  rankLabel: {
    fontWeight: '800',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.9rem',
    width: '30px',
  },
  leadRankBadge: {
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '4px',
    padding: '2px 6px',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  rewardsPanel: {
    backgroundColor: 'rgba(0, 243, 255, 0.04)',
    border: '1px solid rgba(0, 243, 255, 0.12)',
    padding: '0.8rem 1.5rem',
    borderRadius: '10px',
    width: '100%',
    textAlign: 'left',
  },
  rewardRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    marginBottom: '4px',
  },
  correctOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(12, 2, 21, 0.88)',
    border: '2px solid var(--accent-secondary)',
    borderRadius: '12px',
    padding: '1.25rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    boxShadow: 'var(--glow-secondary)',
    pointerEvents: 'none',
    zIndex: 5,
  },
  correctOverlayText: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: '2px',
    textAlign: 'center',
  },
  correctOverlaySub: {
    fontSize: '0.85rem',
    color: 'var(--accent-secondary)',
    fontFamily: 'var(--font-mono)',
    fontWeight: '700',
  }
};
