import React, { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { 
  Play, RotateCcw, Home, Award, HelpCircle, Eye, ShieldAlert,
  Zap, Clock, Heart, Volume2, VolumeX, Trophy, ChevronRight,
  TrendingUp, Sparkles, MessageSquare, Binary, Database
} from 'lucide-react';

// Chiptune Suspense Audio Synthesizer for AI Master Challenge
const challengeAudio = {
  ctx: null,
  masterGain: null,
  heartbeatInterval: null,
  tensionDrone: null,
  isEnabled: true,

  init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Speech/drone synthesizer fail:", e);
    }
  },

  playHeartbeat() {
    this.init();
    if (!this.ctx || this.heartbeatInterval || !this.isEnabled) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    // Heartbeat clock ticks (low pass frequency)
    this.heartbeatInterval = setInterval(() => {
      const time = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, time); // Low thud

      gain.gain.setValueAtTime(0.2, time);
      gain.gain.linearRampToValueAtTime(0.001, time + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + 0.16);
    }, 1000);
  },

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  },

  startTensionDrone() {
    this.init();
    if (!this.ctx || this.tensionDrone || !this.isEnabled) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    // Suspense drone hum
    const time = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(110, time); // A2 drone

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(110.5, time); // Detuned

    gain.gain.setValueAtTime(0.08, time);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(time);
    osc2.start(time);

    this.tensionDrone = { osc1, osc2, gain };
  },

  stopTensionDrone() {
    if (this.tensionDrone) {
      try {
        const time = this.ctx.currentTime;
        this.tensionDrone.gain.gain.linearRampToValueAtTime(0.001, time + 0.3);
        this.tensionDrone.osc1.stop(time + 0.35);
        this.tensionDrone.osc2.stop(time + 0.35);
      } catch (e) {}
      this.tensionDrone = null;
    }
  },

  playCorrect() {
    this.init();
    if (!this.ctx || !this.isEnabled) return;
    const time = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C major arpeggio
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = time + (idx * 0.08);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.12, noteTime);
      gain.gain.linearRampToValueAtTime(0.001, noteTime + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(noteTime);
      osc.stop(noteTime + 0.21);
    });
  },

  playWrong() {
    this.init();
    if (!this.ctx || !this.isEnabled) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(146.83, time); // D3 detune
    osc.frequency.setValueAtTime(142.00, time + 0.1);
    
    gain.gain.setValueAtTime(0.15, time);
    gain.gain.linearRampToValueAtTime(0.001, time + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.31);
  }
};

// KBC Career Ladder
const LADDER = [
  { step: 10, title: 'AI Champion', xp: 1000, coins: 500, isCheckpoint: false },
  { step: 9, title: 'Principal AI Engineer', xp: 800, coins: 400, isCheckpoint: false },
  { step: 8, title: 'AI Architect', xp: 600, coins: 300, isCheckpoint: false },
  { step: 7, title: 'AI Researcher', xp: 500, coins: 250, isCheckpoint: true }, // Checkpoint Safe Haven
  { step: 6, title: 'Deep Learning Engineer', xp: 400, coins: 200, isCheckpoint: false },
  { step: 5, title: 'ML Engineer', xp: 300, coins: 150, isCheckpoint: false },
  { step: 4, title: 'Data Explorer', xp: 200, coins: 100, isCheckpoint: true }, // Checkpoint Safe Haven
  { step: 3, title: 'Python/Pandas Wizard', xp: 150, coins: 80, isCheckpoint: false },
  { step: 2, title: 'NumPy Cadet', xp: 100, coins: 50, isCheckpoint: false },
  { step: 1, title: 'AI Beginner', xp: 50, coins: 30, isCheckpoint: false }
];

// 10 Progressive ML/DL questions pool (2 options per stage for daily rotation)
const QUESTIONS_POOL = [
  // Step 1
  [
    {
      step: 1,
      category: 'Python',
      q: 'How do you initialize a Python dictionary containing coordinates metadata variables?',
      opts: [
        'A: coords = [x, y, z]',
        'B: coords = { "x": 10, "y": 20 }',
        'C: coords = (10, 20)',
        'D: coords = <x=10, y=20>'
      ],
      correct: 1,
      tip: 'Dictionaries in Python are declared using curly braces {} with key:value pairs.',
      clue: 'Sample: data = { "id": 1, "value": "active" }'
    },
    {
      step: 1,
      category: 'Python',
      q: 'Which expression returns the last element of a Python list named "items"?',
      opts: [
        'A: items[len(items)]',
        'B: items[-1]',
        'C: items.last()',
        'D: items[end]'
      ],
      correct: 1,
      tip: 'Negative indexing in Python starts at -1 for the last element.',
      clue: 'items = [10, 20, 30] -> items[-1] yields 30.'
    }
  ],
  // Step 2
  [
    {
      step: 2,
      category: 'NumPy',
      q: 'Which NumPy command is used to flatten a multi-dimensional array into a single 1D vector?',
      opts: [
        'A: np.reshape(1, -1)',
        'B: array.flatten()',
        'C: np.ravel(array)',
        'D: Both flatten() and ravel() are valid'
      ],
      correct: 3,
      tip: 'Both flatten() (returns a copy) and ravel() (returns a flattened view) can reshape multi-dimensional structures.',
      clue: 'flatten() creates a deep copy, ravel() returns a reference view where possible.'
    },
    {
      step: 2,
      category: 'NumPy',
      q: 'In NumPy, how do you inspect the dimensions (axes) count of an array?',
      opts: [
        'A: array.ndim',
        'B: array.size',
        'C: array.shape',
        'D: array.length'
      ],
      correct: 0,
      tip: 'array.ndim returns the count of dimensions (axes) in the array structure.',
      clue: 'np.array([[1, 2], [3, 4]]).ndim yields 2.'
    }
  ],
  // Step 3
  [
    {
      step: 3,
      category: 'Pandas',
      q: 'In Pandas, what is the optimal way to drop rows containing NaN or empty values from a DataFrame?',
      opts: [
        'A: df.dropna()',
        'B: df.drop_empty()',
        'C: df.filter(lambda x: x is not null)',
        'D: df.fillna(0)'
      ],
      correct: 0,
      tip: 'dropna() removes row tuples containing missing fields; fillna() replaces them instead.',
      clue: 'df.dropna(axis=0) removes missing row entries.'
    },
    {
      step: 3,
      category: 'Pandas',
      q: 'In Pandas, how do you select specific rows based on a boolean mask evaluation?',
      opts: [
        'A: df.query_mask()',
        'B: df.filter_rows()',
        'C: df[df["column"] > value]',
        'D: df.select_where()'
      ],
      correct: 2,
      tip: 'Boolean indexing allows passing conditional boolean masks directly into the bracket selection operator.',
      clue: 'df.loc[df["age"] > 25] is equivalent.'
    }
  ],
  // Step 4
  [
    {
      step: 4,
      category: 'Metrics (Checkpoint 1)',
      q: 'A model has high Precision but low Recall. What does this indicate about its predictions?',
      opts: [
        'A: It predicts very few positive cases, but is highly accurate when it does.',
        'B: It predicts almost all positive cases correctly but has many false alarms.',
        'C: The model is highly accurate but suffers from massive underfitting.',
        'D: The F1 score is guaranteed to be 1.0.'
      ],
      correct: 0,
      tip: 'High Precision = low false positives. Low Recall = high false negatives. It makes very selective but accurate predictions.',
      clue: 'Precision = TP / (TP + FP). Recall = TP / (TP + FN).'
    },
    {
      step: 4,
      category: 'Metrics (Checkpoint 1)',
      q: 'In binary classification, what cell in the confusion matrix represents a positive class incorrectly predicted as negative?',
      opts: [
        'A: True Positive (TP)',
        'B: False Positive (FP)',
        'C: False Negative (FN)',
        'D: True Negative (TN)'
      ],
      correct: 2,
      tip: 'False Negatives are actual positive targets that the classifier labeled as negative.',
      clue: 'Actual is 1 (Positive), Predicted is 0 (Negative).'
    }
  ],
  // Step 5
  [
    {
      step: 5,
      category: 'Regularization (Boss Question)',
      q: 'What is the primary difference between L1 (Lasso) and L2 (Ridge) regularization parameters?',
      opts: [
        'A: L2 forces coefficients to exactly zero, performing feature selection.',
        'B: L1 shrinks weights to zero, creating sparse model weights.',
        'C: L1 penalizes squared values; L2 penalizes absolute values.',
        'D: L2 makes the models trains faster than L1.'
      ],
      correct: 1,
      tip: 'Lasso (L1) uses absolute penalty weights, forcing coefficients to exactly 0 (doing feature selection).',
      clue: 'L1: Sum(|w|). L2: Sum(w²).'
    },
    {
      step: 5,
      category: 'Regularization (Boss Question)',
      q: 'Under what conditions does a machine learning model suffer from "High Bias"?',
      opts: [
        'A: The model overfits the training dataset and fails on test sets.',
        'B: The model is underfitting, failing to capture underlying patterns in training data.',
        'C: The training error is zero, but the F1 score is low.',
        'D: The validation accuracy matches training accuracy perfectly.'
      ],
      correct: 1,
      tip: 'High bias results from over-simplistic models, causing underfitting on training metrics.',
      clue: 'High bias = underfitting. High variance = overfitting.'
    }
  ],
  // Step 6
  [
    {
      step: 6,
      category: 'CNNs',
      q: 'In Convolutional Neural Networks, what is the purpose of Max Pooling layers?',
      opts: [
        'A: To increase features dimensionality.',
        'B: To reduce spatial dimensions of feature maps while retaining major traits.',
        'C: To initialize weight parameters.',
        'D: To perform activation normalization.'
      ],
      correct: 1,
      tip: 'Max Pooling selects maximum activation zones, downsampling spatial sizes and preventing overfitting.',
      clue: 'Downsampling: 2x2 filter selecting the maximum value in a window.'
    },
    {
      step: 6,
      category: 'CNNs',
      q: 'What does the parameter "stride" represent in a Convolutional layer?',
      opts: [
        'A: The size of the kernel filters.',
        'B: The number of pixels by which the filter shifts horizontally and vertically across the input matrix.',
        'C: The padding pixel thickness.',
        'D: The training step multiplier rate.'
      ],
      correct: 1,
      tip: 'Stride defines the sliding step size of the convolutional kernel matrix.',
      clue: 'Stride = 2 means the filter slides 2 pixels per calculation.'
    }
  ],
  // Step 7
  [
    {
      step: 7,
      category: 'RNNs (Checkpoint 2)',
      q: 'Which recurrent gate structure is specifically designed to solve vanishing gradient loops in sequence models?',
      opts: [
        'A: LSTM cell gates with memory pipelines',
        'B: Relu Activation',
        'C: Standard feed-forward networks',
        'D: Batch Normalization layers'
      ],
      correct: 0,
      tip: 'LSTMs (and GRUs) use gated cells (forget, input, output gates) to retain gradients across long histories.',
      clue: 'Forget gates decide which past vectors to clear or retain.'
    },
    {
      step: 7,
      category: 'RNNs (Checkpoint 2)',
      q: 'Why does a standard ReLU activation function help prevent vanishing gradients in deep feed-forward networks?',
      opts: [
        'A: It maps all positive values to a constant derivative of 1.0.',
        'B: It squeezes all values between 0 and 1.',
        'C: It performs batch normalization.',
        'D: It returns zero for positive parameters.'
      ],
      correct: 0,
      tip: 'For positive inputs, ReLU derivative is constant at 1, preventing the gradient from decaying during backpropagation.',
      clue: 'ReLU(x) = max(0, x). Derivative for x > 0 is 1.0.'
    }
  ],
  // Step 8
  [
    {
      step: 8,
      category: 'Transformers',
      q: 'In a Transformer Self-Attention block, how are Query (Q), Key (K), and Value (V) matrices computed?',
      opts: [
        'A: By multiplying input tokens with trained linear projection weight matrices.',
        'B: By running K-Means clustering on the token array.',
        'C: By sorting dictionary hashes.',
        'D: They are hardcoded values representing vocabulary frequencies.'
      ],
      correct: 0,
      tip: 'Linear projections of the input matrix yield distinct Q, K, and V tensors for computing Attention.',
      clue: 'Attention(Q,K,V) = softmax(Q Kᵀ / √d_k) V.'
    },
    {
      step: 8,
      category: 'Transformers',
      q: 'Why are positional encodings added to the input embeddings in Transformer networks?',
      opts: [
        'A: To reduce vocabulary dimensions.',
        'B: To inject sequence order information, since Self-Attention is permutation-invariant.',
        'C: To initialize the learning rate decays.',
        'D: To replace word vector representations.'
      ],
      correct: 1,
      tip: 'Because Self-Attention operates on sets without sequential order, positional codes are added to maintain word order.',
      clue: 'Injects sinusoidal values representing token indices.'
    }
  ],
  // Step 9
  [
    {
      step: 9,
      category: 'Optimization',
      q: 'Why would an SDE deploy a Cosine Annealing learning rate scheduler during neural network training?',
      opts: [
        'A: To decrease data size.',
        'B: To smoothly decay the learning rate to a minimum value following a cosine curve.',
        'C: To randomize features.',
        'D: To replace SGD backpropagation.'
      ],
      correct: 1,
      tip: 'Cosine Annealing helps models settle into local minima by smoothly decreasing learning rates.',
      clue: 'Annealing decays rates using a cosine wave pattern.'
    },
    {
      step: 9,
      category: 'Optimization',
      q: 'How does the Adam optimizer calculate learning rates dynamically for each parameter?',
      opts: [
        'A: By combining exponential moving averages of both past gradients (momentum) and squared gradients (variance).',
        'B: By randomly selecting gradients.',
        'C: By computing Hessian matrices.',
        'D: By fixing decay step thresholds.'
      ],
      correct: 0,
      tip: 'Adam combines RMSProp (squared gradient scaling) with Momentum (moving average velocity).',
      clue: 'Adam: Adaptive Moment Estimation.'
    }
  ],
  // Step 10
  [
    {
      step: 10,
      category: 'Reinforcement Learning (Ultimate Boss)',
      q: 'In Deep Q-Learning (DQN), what is the key purpose of maintaining an independent Target Network?',
      opts: [
        'A: To store database weights.',
        'B: To decouple action policy from state evaluations, stabilizing updates.',
        'C: To calculate data standard deviations.',
        'D: To perform parallel batch inference.'
      ],
      correct: 1,
      tip: 'Target networks compute stable TD target estimates, preventing circular updates and divergence.',
      clue: 'Temporal Difference targets are held constant during mini-batch updates.'
    },
    {
      step: 10,
      category: 'Reinforcement Learning (Ultimate Boss)',
      q: 'Which framework models states, actions, rewards, and transitional probability matrices in dynamic environments?',
      opts: [
        'A: Markov Decision Process (MDP)',
        'B: Linear Discriminant Analysis',
        'C: Support Vector Machines',
        'D: Recurrent Neural Layers'
      ],
      correct: 0,
      tip: 'MDPs provide the mathematical basis for modeling environment transitions in reinforcement learning.',
      clue: 'Tuple structure: (S, A, P, R, gamma).'
    }
  ]
];

export default function AiMasterChallenge() {
  const { addCoins, addXP, setGame, triggerNotification } = usePlayerStore();

  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'locking', 'reveal', 'gameover', 'victory'
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [timer, setTimer] = useState(45);
  const [hostSubtitle, setHostSubtitle] = useState('Welcome to the AI Master Challenge!');
  const [shakeActive, setShakeActive] = useState(false);

  // Lifelines
  const [lifelines, setLifelines] = useState({
    hint5050: true,
    mentor: true,
    preview: true,
    time: true
  });
  const [eliminatedOpts, setEliminatedOpts] = useState([]); // indices of options hidden by 50:50
  const [mentorHint, setMentorHint] = useState(null);
  const [datasetClue, setDatasetClue] = useState(null);

// Helper to dynamically shuffle options and update correct answer index
function shuffleQuestionObj(qObj) {
  if (!qObj || !qObj.opts) return qObj;
  const originalCorrectTextClean = qObj.opts[qObj.correct].replace(/^[A-D]:\s*/i, '');
  const cleanedOpts = qObj.opts.map(opt => opt.replace(/^[A-D]:\s*/i, ''));
  
  const shuffledOpts = [...cleanedOpts].sort(() => Math.random() - 0.5);
  const newCorrectIndex = shuffledOpts.indexOf(originalCorrectTextClean);
  
  const prefixOpts = shuffledOpts.map((opt, idx) => `${['A', 'B', 'C', 'D'][idx]}: ${opt}`);
  
  return {
    ...qObj,
    opts: prefixOpts,
    correct: newCorrectIndex
  };
}

  const [shuffledDeck, setShuffledDeck] = useState([]);
  const [dbQuestions, setDbQuestions] = useState([]);

  useEffect(() => {
    const solvedIds = localStorage.getItem('solved_question_ids_ai-master') || '';
    fetch(`http://localhost:5000/api/questions?category=ai-master&limit=100&excludeIds=${solvedIds}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.questions && data.questions.length > 0) {
          setDbQuestions(data.questions);
        }
      })
      .catch(() => {});
  }, [gameState === 'menu']);

  useEffect(() => {
    // Generate a fresh randomized deck for all 10 stages
    const newDeck = Array.from({ length: 10 }, (_, i) => {
      const stepNum = i + 1;
      const stepDbQuestions = dbQuestions.filter(q => q.extraDetails && q.extraDetails.step === stepNum);
      
      if (stepDbQuestions.length > 0) {
        const randomQ = stepDbQuestions[Math.floor(Math.random() * stepDbQuestions.length)];
        return shuffleQuestionObj({
          step: stepNum,
          category: randomQ.extraDetails.topic || 'Machine Learning',
          q: randomQ.question,
          opts: randomQ.options,
          correct: randomQ.correctAnswer,
          tip: randomQ.tip,
          clue: randomQ.extraDetails.clue || '',
          _id: randomQ._id
        });
      } else {
        const stagePool = QUESTIONS_POOL[i] || QUESTIONS_POOL[0];
        const randomQ = stagePool[Math.floor(Math.random() * stagePool.length)];
        return shuffleQuestionObj(randomQ);
      }
    });
    setShuffledDeck(newDeck);
  }, [gameState === 'menu', dbQuestions]);

  const activeQuestion = shuffledDeck[currentIdx] || shuffleQuestionObj((QUESTIONS_POOL[currentIdx] || QUESTIONS_POOL[0])[0]);
  const timerIntervalRef = useRef(null);
  const hostCanvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Sync BGM chiptune settings
  useEffect(() => {
    challengeAudio.isEnabled = !isMuted;
  }, [isMuted]);

  // TTS helper
  const speakHostDialogue = (text) => {
    setHostSubtitle(text);
    if (isMuted) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.08;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS engine block:", e);
    }
  };

  // Timer Tick Loop
  useEffect(() => {
    if (gameState !== 'playing') {
      challengeAudio.stopHeartbeat();
      return;
    }

    if (timer <= 12) {
      challengeAudio.playHeartbeat();
    } else {
      challengeAudio.stopHeartbeat();
    }

    timerIntervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerIntervalRef.current);
      challengeAudio.stopHeartbeat();
    };
  }, [gameState, timer]);

  // Host wave canvas animation
  useEffect(() => {
    if (gameState === 'menu') return;
    const canvas = hostCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let waveStep = 0;
    const drawWave = () => {
      ctx.clearRect(0, 0, 150, 150);
      
      const isSpeaking = window.speechSynthesis && window.speechSynthesis.speaking;
      const waveAmplitude = isSpeaking ? 30 : 8;
      const center = 75;

      ctx.strokeStyle = 'var(--accent-secondary)';
      ctx.shadowColor = 'var(--accent-secondary)';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2.5;

      // Draw pulsating AI holographic circle
      ctx.beginPath();
      for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
        const offset = Math.sin(angle * 8 + waveStep) * waveAmplitude * 0.15;
        const r = 40 + offset;
        const x = center + Math.cos(angle) * r;
        const y = center + Math.sin(angle) * r;
        if (angle === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      waveStep += 0.15;
      animationFrameRef.current = requestAnimationFrame(drawWave);
    };

    drawWave();
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [gameState]);

  // Trigger screen shake
  const triggerScreenShake = () => {
    setShakeActive(true);
    setTimeout(() => setShakeActive(false), 450);
  };

  const handleTimeUp = () => {
    triggerScreenShake();
    handleGameOver('Time Expired!');
  };

  // Launch Competition
  const startChallenge = () => {
    setGameState('playing');
    setCurrentIdx(0);
    setSelectedOpt(null);
    setTimer(45);
    setLifelines({
      hint5050: true,
      mentor: true,
      preview: true,
      time: true
    });
    setEliminatedOpts([]);
    setMentorHint(null);
    setDatasetClue(null);
    speakHostDialogue("Welcome to the AI Master Challenge. Prove your machine learning models to climb the career ladder!");
  };

  // Locking option (millionaire style)
  const selectOption = (idx) => {
    if (gameState !== 'playing' || eliminatedOpts.includes(idx)) return;
    setSelectedOpt(idx);
    speakHostDialogue(`Locking in option ${['A','B','C','D'][idx]} as your final choice?`);
  };

  // Confirm Final Answer (Cinematic Reveal)
  const confirmFinalAnswer = () => {
    if (selectedOpt === null) return;
    setGameState('locking');
    challengeAudio.startTensionDrone();
    speakHostDialogue("Locking in answer... Let's review the neural parameters...");

    // Suspense wait
    setTimeout(() => {
      challengeAudio.stopTensionDrone();
      const isCorrect = selectedOpt === activeQuestion.correct;
      setGameState('reveal');

      if (isCorrect) {
        if (!isMuted) challengeAudio.playCorrect();
        speakHostDialogue("Incredible! That is the optimal solution!");

        if (activeQuestion._id) {
          const solved = localStorage.getItem('solved_question_ids_ai-master') || '';
          const newSolved = solved ? solved.split(',') : [];
          if (!newSolved.includes(activeQuestion._id)) {
            newSolved.push(activeQuestion._id);
            localStorage.setItem('solved_question_ids_ai-master', newSolved.join(','));
          }
        }

        // If level 10 cleared: complete victory
        if (currentIdx === 9) {
          setTimeout(() => handleCampaignVictory(), 2000);
        }
      } else {
        if (!isMuted) challengeAudio.playWrong();
        triggerScreenShake();
        speakHostDialogue("Unfortunately, that vector leads to gradient explosion.");
        setTimeout(() => handleGameOver(), 2500);
      }
    }, 2500);
  };

  // Proceed to next KBC stage
  const nextStage = () => {
    const nextIdx = currentIdx + 1;
    setCurrentIdx(nextIdx);
    setSelectedOpt(null);
    setEliminatedOpts([]);
    setMentorHint(null);
    setDatasetClue(null);
    setTimer(45);
    setGameState('playing');
    speakHostDialogue(`Here is your Level ${nextIdx + 1} challenge for the rank of ${LADDER[9 - nextIdx].title}.`);
  };

  // Safe haven checkpoint calculations (KBC fallback rules)
  const getSafeHavenXP = () => {
    // Checkpoints at Q4 (step index 3) and Q7 (step index 6)
    if (currentIdx >= 6) {
      return LADDER[3].xp; // Fallback to AI Researcher (500 XP)
    } else if (currentIdx >= 3) {
      return LADDER[6].xp; // Fallback to Data Explorer (200 XP)
    }
    return 0; // Lost everything
  };

  const getSafeHavenCoins = () => {
    if (currentIdx >= 6) {
      return LADDER[3].coins;
    } else if (currentIdx >= 3) {
      return LADDER[6].coins;
    }
    return 0;
  };

  // Game over fallback (Real-time DB standings update)
  const handleGameOver = (customMsg = null) => {
    setGameState('gameover');
    challengeAudio.stopHeartbeat();
    challengeAudio.stopTensionDrone();

    const xpEarned = getSafeHavenXP();
    const coinsEarned = getSafeHavenCoins();

    if (xpEarned > 0) {
      addXP(xpEarned);
      addCoins(coinsEarned);
      triggerNotification('📊 Standings Synchronized', `Saved checkpoint score: +${xpEarned} XP to Leaderboard!`, '🏆');
    } else {
      triggerNotification('👾 Failure', 'Compilation failed. Standings synced.', '❌');
    }
  };

  const handleCampaignVictory = () => {
    setGameState('victory');
    challengeAudio.stopHeartbeat();
    challengeAudio.stopTensionDrone();

    addXP(1000);
    addCoins(500);
    triggerNotification('👑 AI CHAMPION!', 'Cleared all ML challenges! Unlocked Champion Badge!', '🏆');
  };

  // Lifelines handlers
  const trigger5050 = () => {
    if (!lifelines.hint5050 || gameState !== 'playing') return;
    setLifelines(prev => ({ ...prev, hint5050: false }));
    triggerNotification('🔌 50:50 Activated', 'Wiping incorrect answer indexes...', '✨');

    // Select 2 wrong answers
    const wrongIndices = [0, 1, 2, 3].filter(idx => idx !== activeQuestion.correct);
    const toEliminate = [];
    while (toEliminate.length < 2) {
      const selected = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
      if (!toEliminate.includes(selected)) toEliminate.push(selected);
    }
    setEliminatedOpts(toEliminate);
    speakHostDialogue("Filtering array indices. Two incorrect options eliminated.");
  };

  const triggerMentor = () => {
    if (!lifelines.mentor || gameState !== 'playing') return;
    setLifelines(prev => ({ ...prev, mentor: false }));
    setMentorHint(activeQuestion.tip);
    triggerNotification('🧠 AI Mentor Prompted', 'Displaying classification tip...', '✨');
    speakHostDialogue("Here is a prompt vector regarding the loss equation.");
  };

  const triggerClue = () => {
    if (!lifelines.preview || gameState !== 'playing') return;
    setLifelines(prev => ({ ...prev, preview: false }));
    setDatasetClue(activeQuestion.clue);
    triggerNotification('📊 Dataset Preview Opened', 'Fetching raw data logs...', '✨');
  };

  const triggerTimeBoost = () => {
    if (!lifelines.time || gameState !== 'playing') return;
    setLifelines(prev => ({ ...prev, time: false }));
    setTimer(prev => prev + 30);
    triggerNotification('⏳ Time Boost Applied', 'Added 30 seconds!', '✨');
  };

  return (
    <div style={styles.container} className={`grid-overlay ${shakeActive ? 'shake-animation' : ''}`}>
      {/* Top HUD bar */}
      <div style={styles.hudHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Binary className="pulse-glow-animation" size={16} color="var(--accent-secondary)" />
          <span style={styles.headerTitle}>AI_CHALLENGE.EXE</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            style={styles.audioToggle}
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button style={styles.exitBtn} onClick={() => setGame('hub')}>
            Exit
          </button>
        </div>
      </div>

      {gameState === 'menu' && (
        <div className="game-card" style={styles.menuBox}>
          <Trophy size={48} color="#FFD700" className="float-animation" />
          <h2 style={styles.title}>AI MASTER CHALLENGE</h2>
          <p style={styles.desc}>
            Ascend the machine learning career ladder. Lock in final answers, utilize your digital lifelines, and achieve the rank of AI Champion.
          </p>
          <button className="game-btn game-btn-primary" onClick={startChallenge}>
            Start AI Exam
          </button>
        </div>
      )}

      {(gameState === 'playing' || gameState === 'locking' || gameState === 'reveal') && (
        <div style={styles.gameplayLayout}>
          
          {/* Main KBC game center column */}
          <div style={styles.quizColumn}>
            {/* Host Hologram waveform */}
            <div style={styles.hostWrapper}>
              <canvas ref={hostCanvasRef} width={150} height={150} style={styles.hostCanvas}></canvas>
              <div className="game-card" style={styles.subtitleCard}>
                <MessageSquare size={12} color="var(--accent-secondary)" />
                <span style={styles.subtitleText}>{hostSubtitle}</span>
              </div>
            </div>

            {/* Central console monitor screen */}
            <div className="game-card" style={{ ...styles.monitorCard, transform: gameState === 'locking' ? 'scale(1.025)' : 'none' }}>
              <div style={styles.monitorHeader}>
                <span style={styles.difficultyBadge}>{activeQuestion.category}</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Clock size={14} color="var(--accent-secondary)" />
                  <span style={styles.timerVal}>{timer}s</span>
                </div>
              </div>

              {/* Question Text */}
              <h3 style={styles.questionText}>{activeQuestion.q}</h3>

              {/* Lifeline hints boxes */}
              {mentorHint && (
                <div style={styles.mentorBox}>
                  💡 <strong>Mentor Hint:</strong> {mentorHint}
                </div>
              )}

              {datasetClue && (
                <div style={styles.clueBox}>
                  📊 <strong>Dataset Preview:</strong> {datasetClue}
                </div>
              )}

              {/* Diamond-shaped split options */}
              <div style={styles.optionsGrid}>
                {activeQuestion.opts.map((opt, idx) => {
                  const isEliminated = eliminatedOpts.includes(idx);
                  const isSelected = selectedOpt === idx;
                  const isReveal = gameState === 'reveal';
                  const isCorrect = idx === activeQuestion.correct;

                  let optBorder = 'rgba(255,255,255,0.08)';
                  let optBg = 'rgba(255,255,255,0.02)';
                  let optColor = 'var(--text-primary)';

                  if (isSelected) {
                    optBorder = 'var(--warning-color)';
                    optBg = 'rgba(245, 158, 11, 0.15)';
                  }
                  if (isReveal) {
                    if (isCorrect) {
                      optBorder = 'var(--success-color)';
                      optBg = 'rgba(16, 185, 129, 0.2)';
                    } else if (isSelected) {
                      optBorder = 'var(--danger-color)';
                      optBg = 'rgba(239, 68, 68, 0.2)';
                    }
                  }

                  if (isEliminated) {
                    return <div key={idx} style={{ opacity: 0.1, cursor: 'default' }}></div>;
                  }

                  return (
                    <button
                      key={idx}
                      className="game-btn"
                      style={{
                        ...styles.optionBtn,
                        borderColor: optBorder,
                        backgroundColor: optBg,
                        color: optColor,
                      }}
                      disabled={gameState === 'locking' || gameState === 'reveal'}
                      onClick={() => selectOption(idx)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Actions panel */}
              {selectedOpt !== null && gameState === 'playing' && (
                <button 
                  className="game-btn game-btn-primary pulse-glow-animation" 
                  style={styles.lockBtn}
                  onClick={confirmFinalAnswer}
                >
                  🔒 LOCK FINAL ANSWER
                </button>
              )}

              {gameState === 'reveal' && selectedOpt === activeQuestion.correct && (
                <button 
                  className="game-btn game-btn-primary" 
                  style={styles.lockBtn}
                  onClick={nextStage}
                >
                  Proceed to Next Rank <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Right column: Lifelines + KBC Career Rank progress ladder */}
          <div style={styles.ladderColumn}>
            {/* Lifelines bar */}
            <div className="game-card" style={styles.lifelinesCard}>
              <h4 style={styles.panelTitle}>AI LIFELINES</h4>
              <div style={styles.lifelineRow}>
                <button 
                  style={{ ...styles.lifelineBtn, opacity: lifelines.hint5050 ? 1 : 0.4 }} 
                  onClick={trigger5050}
                  disabled={!lifelines.hint5050}
                  title="50:50 Filter"
                >
                  🔌 50:50
                </button>
                <button 
                  style={{ ...styles.lifelineBtn, opacity: lifelines.mentor ? 1 : 0.4 }} 
                  onClick={triggerMentor}
                  disabled={!lifelines.mentor}
                  title="AI Mentor Prompt"
                >
                  🧠 Mentor
                </button>
                <button 
                  style={{ ...styles.lifelineBtn, opacity: lifelines.preview ? 1 : 0.4 }} 
                  onClick={triggerClue}
                  disabled={!lifelines.preview}
                  title="Dataset Preview"
                >
                  📊 Data
                </button>
                <button 
                  style={{ ...styles.lifelineBtn, opacity: lifelines.time ? 1 : 0.4 }} 
                  onClick={triggerTimeBoost}
                  disabled={!lifelines.time}
                  title="Time Compute Boost (+30s)"
                >
                  ⏳ Time
                </button>
              </div>
            </div>

            {/* Vertical Ladder progress stack */}
            <div className="game-card" style={styles.ladderCard}>
              <h4 style={styles.panelTitle}>CAREER LADDER</h4>
              <div style={styles.ladderStack}>
                {LADDER.map((item, idx) => {
                  const reverseIdx = 9 - idx;
                  const isCurrent = currentIdx === reverseIdx;
                  const isCleared = currentIdx > reverseIdx;

                  let stepColor = 'var(--text-secondary)';
                  let stepBorder = 'rgba(255,255,255,0.05)';
                  let stepBg = 'rgba(255,255,255,0.02)';

                  if (isCurrent) {
                    stepColor = 'var(--accent-secondary)';
                    stepBorder = 'var(--accent-secondary)';
                    stepBg = 'rgba(0, 243, 255, 0.08)';
                  } else if (isCleared) {
                    stepColor = 'var(--success-color)';
                    stepBorder = 'rgba(16, 185, 129, 0.2)';
                    stepBg = 'rgba(16, 185, 129, 0.05)';
                  }

                  return (
                    <div 
                      key={idx} 
                      style={{
                        ...styles.ladderStep,
                        color: stepColor,
                        borderColor: stepBorder,
                        backgroundColor: stepBg,
                        fontWeight: isCurrent ? 'bold' : 'normal'
                      }}
                    >
                      <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}>
                        {item.step === 4 || item.step === 7 ? '⭐ Checkpoint' : `#${item.step}`}
                      </span>
                      <span style={{ fontSize: '0.75rem' }}>{item.title}</span>
                      <span style={{ fontSize: '0.7rem', color: '#F59E0B' }}>+{item.xp} XP</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      )}

      {gameState === 'gameover' && (
        <div className="game-card" style={styles.outcomeBox}>
          <ShieldAlert size={48} color="var(--danger-color)" className="shake-animation" />
          <h2 style={{ ...styles.title, color: 'var(--danger-color)' }}>COMPILATION TIMEOUT</h2>
          <p style={styles.desc}>
            Unfortunately, your prompt failed structural weights checking.
            {getSafeHavenXP() > 0 ? (
              <div style={{ color: 'var(--success-color)', marginTop: '0.5rem', fontWeight: 'bold' }}>
                🎉 Checkpoint Saved! Commited +{getSafeHavenXP()} XP to Leaderboard standings!
              </div>
            ) : 'Falling back to entry parameters.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button className="game-btn game-btn-primary" onClick={startChallenge}>
              <RotateCcw size={14} /> Play Again
            </button>
            <button className="game-btn" onClick={() => setGame('hub')}>
              Return to City Hub
            </button>
          </div>
        </div>
      )}

      {gameState === 'victory' && (
        <div className="game-card" style={styles.outcomeBox}>
          <Trophy size={64} color="#FFD700" className="pulse-glow-animation" />
          <h2 style={{ ...styles.title, color: 'var(--success-color)' }}>👑 AI CHAMPION CONVERGENCE!</h2>
          <p style={styles.desc}>
            Outstanding! You solved all 10 stages correctly without model regression, claiming the ultimate rank of AI Champion!
            Saved +1000 XP to remote Leaderboard database.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button className="game-btn game-btn-primary" onClick={() => setGame('hub')}>
              Back to Hub
            </button>
            <button className="game-btn" onClick={startChallenge}>
              Replay Challenge
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
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0710', // Deep purple-black game show ambient
  },
  hudHeader: {
    width: '100%',
    maxWidth: '1100px',
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
  },
  menuBox: {
    width: '100%',
    maxWidth: '650px',
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    backgroundColor: 'rgba(19, 23, 34, 0.85)',
    border: '1px solid var(--border-color)',
    borderRadius: '24px',
    boxShadow: 'var(--shadow)',
    backdropFilter: 'blur(10px)',
  },
  title: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.75rem',
    letterSpacing: '3px',
    marginTop: '1rem',
    color: 'var(--text-primary)',
  },
  desc: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    maxWidth: '450px',
    margin: '0.75rem 0 2rem 0',
    lineHeight: '1.5',
  },
  gameplayLayout: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '2rem',
    width: '100%',
    maxWidth: '1100px',
    alignItems: 'start',
  },
  quizColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    width: '100%',
  },
  hostWrapper: {
    display: 'flex',
    gap: '1.25rem',
    alignItems: 'center',
    width: '100%',
  },
  hostCanvas: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  subtitleCard: {
    flex: 1,
    padding: '1rem',
    backgroundColor: 'rgba(19, 23, 34, 0.7)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    gap: '8px',
    alignItems: 'start',
  },
  subtitleText: {
    fontSize: '0.75rem',
    lineHeight: '1.4',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)',
  },
  monitorCard: {
    padding: '2rem',
    backgroundColor: 'rgba(19, 23, 34, 0.85)',
    border: '1px solid var(--border-color)',
    borderRadius: '24px',
    boxShadow: 'var(--shadow)',
    backdropFilter: 'blur(10px)',
    transition: 'transform 0.4s ease',
  },
  monitorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
  },
  difficultyBadge: {
    fontSize: '0.65rem',
    padding: '2px 8px',
    backgroundColor: 'rgba(0, 243, 255, 0.1)',
    color: '#00F3FF',
    borderColor: '#00F3FF',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderRadius: '4px',
    fontFamily: 'var(--font-mono)',
  },
  timerVal: {
    fontSize: '0.8rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--accent-secondary)',
    fontWeight: 'bold',
  },
  questionText: {
    fontSize: '1.15rem',
    lineHeight: '1.5',
    color: 'var(--text-primary)',
    marginBottom: '1.5rem',
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    width: '100%',
  },
  optionBtn: {
    padding: '1.15rem',
    textAlign: 'left',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-body)',
    borderRadius: '16px',
    borderWidth: '1px',
    borderStyle: 'solid',
    transition: 'all 0.2s ease',
  },
  lockBtn: {
    width: '100%',
    padding: '1rem',
    marginTop: '1.5rem',
    fontSize: '0.9rem',
    letterSpacing: '1px',
    fontWeight: 'bold',
  },
  mentorBox: {
    fontSize: '0.75rem',
    padding: '8px 12px',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    borderRadius: '8px',
    color: 'var(--warning-color)',
    marginBottom: '1rem',
  },
  clueBox: {
    fontSize: '0.75rem',
    padding: '8px 12px',
    backgroundColor: 'rgba(0, 243, 255, 0.1)',
    border: '1px solid rgba(0, 243, 255, 0.2)',
    borderRadius: '8px',
    color: '#00F3FF',
    marginBottom: '1rem',
    fontFamily: 'var(--font-mono)',
  },
  ladderColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    width: '100%',
  },
  lifelinesCard: {
    padding: '1.25rem',
    backgroundColor: 'rgba(19, 23, 34, 0.85)',
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
  },
  panelTitle: {
    fontSize: '0.7rem',
    fontFamily: 'var(--font-title)',
    color: 'var(--text-secondary)',
    letterSpacing: '1.5px',
    marginBottom: '0.75rem',
  },
  lifelineRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '6px',
  },
  lifelineBtn: {
    padding: '8px 4px',
    fontSize: '0.65rem',
    fontWeight: 'bold',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'opacity 0.2s ease',
  },
  ladderCard: {
    padding: '1.25rem',
    backgroundColor: 'rgba(19, 23, 34, 0.85)',
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
  },
  ladderStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    maxHeight: '380px',
    overflowY: 'auto',
  },
  ladderStep: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 12px',
    border: '1px solid transparent',
    borderRadius: '10px',
    transition: 'all 0.3s ease',
  },
  outcomeBox: {
    width: '100%',
    maxWidth: '500px',
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    backgroundColor: 'rgba(19, 23, 34, 0.9)',
    border: '1px solid var(--border-color)',
    borderRadius: '24px',
    boxShadow: 'var(--shadow)',
    backdropFilter: 'blur(12px)',
  }
};
