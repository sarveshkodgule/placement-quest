import React, { useState, useEffect, useRef } from 'react';
import ConfettiEffect from '../components/ConfettiEffect';
import { usePlayerStore } from '../store/usePlayerStore';
import { 
  Terminal, Shield, Cpu, Database, Play, ChevronRight, Award, 
  Volume2, VolumeX, AlertCircle, Sparkles, Zap, Clock, CheckCircle2, 
  XCircle, Laptop, BookOpen, Coffee, Users, Send, ShoppingBag, Landmark
} from 'lucide-react';

// Chiptune Audio Synthesizer Engine
const tycoonAudio = {
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
      this.masterGain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Tycoon audio failed to load:", e);
    }
  },

  playBgm() {
    this.init();
    if (!this.ctx || this.bgmInterval || !this.isEnabled) return;
    
    this.bgmStep = 0;
    // Dreamy corporate arpeggios (Cmaj7 -> Fmaj7 -> Dm7 -> G7)
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [349.23, 440.00, 523.25, 659.25], // Fmaj7
      [293.66, 349.23, 440.00, 587.33], // Dm7
      [392.00, 493.88, 587.33, 783.99]  // G7
    ];

    this.bgmInterval = setInterval(() => {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
        return;
      }
      const time = this.ctx.currentTime;
      const currentChord = chords[Math.floor(this.bgmStep / 4) % chords.length];
      const freq = currentChord[this.bgmStep % currentChord.length];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.04, time); // soft volume
      gain.gain.linearRampToValueAtTime(0.001, time + 0.55);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + 0.56);

      this.bgmStep++;
    }, 600); // Relaxing pace
  },

  stopBgm() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  },

  playBeep(freq = 440, duration = 0.08, type = 'sine') {
    this.init();
    if (!this.ctx || !this.isEnabled) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const time = this.ctx.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.08, time);
    gain.gain.linearRampToValueAtTime(0.001, time + duration - 0.01);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + duration);
  },

  playWeekAdvance() {
    this.init();
    if (!this.ctx || !this.isEnabled) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, time);
    osc.frequency.linearRampToValueAtTime(800, time + 0.2);

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.linearRampToValueAtTime(0.001, time + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.21);
  }
};

// 10 Progressive SDE Levels
const TYCOON_LEVELS = [
  { level: 1, title: 'Fresher Year Bootcamp', coinGoal: 100, xpReward: 50 },
  { level: 2, title: 'Open Source Launchpad', coinGoal: 250, xpReward: 75 },
  { level: 3, title: 'The Hackathon Crusade', coinGoal: 400, xpReward: 100 },
  { level: 4, title: 'The Startup Incubator Project', coinGoal: 600, xpReward: 150 },
  { level: 5, title: 'Unicorn SDE Enterprise', coinGoal: 850, xpReward: 200 }
];

export default function ResumeBuilderTycoon() {
  const { addCoins, addXP, setGame, completeDailyChallenge, triggerNotification, isMuted } = usePlayerStore();

  // Campaign State
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [activeScreen, setActiveScreen] = useState('menu'); // 'menu', 'lobby', 'hostel', 'library', 'coding', 'hackathon', 'placement', 'shop', 'placement_result'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [shakeActive, setShakeActive] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  // Initialize BGM toggle
  useEffect(() => {
    tycoonAudio.isEnabled = soundEnabled && !isMuted;
  }, [soundEnabled, isMuted]);

  // Handle background music loop
  useEffect(() => {
    if (soundEnabled && !isMuted && activeScreen !== 'menu') {
      tycoonAudio.isEnabled = true;
      tycoonAudio.stopBgm();
      tycoonAudio.playBgm();
    } else {
      tycoonAudio.stopBgm();
    }
    return () => tycoonAudio.stopBgm();
  }, [soundEnabled, isMuted, activeScreen]);


  // Time & Semester System
  const [semester, setSemester] = useState(1); // Sem 1 -> Sem 3 -> Sem 4 (Placement)
  const [week, setWeek] = useState(1); // 1 - 16 weeks per semester
  const [weeklyHours, setWeeklyHours] = useState(40);

  // Player Stats
  const [cgpa, setCgpa] = useState(7.5);
  const [dsaScore, setDsaScore] = useState(10);
  const [devScore, setDevScore] = useState(10);
  const [commScore, setCommScore] = useState(20);
  const [energy, setEnergy] = useState(100);
  const [coins, setCoins] = useState(100);

  // Resume Portfolio Stats
  const [projectsCount, setProjectsCount] = useState(0);
  const [githubStars, setGithubStars] = useState(0);
  const [linkedinFollowers, setLinkedinFollowers] = useState(100);
  const [laptopUpgrade, setLaptopUpgrade] = useState('Standard Laptop'); // 'SSD Dev Rig', 'Elite Workstation'
  const [hackathonCertificates, setHackathonCertificates] = useState(0);

  // Library Puzzle states (DSA Big-O Complexity Matcher)
  const [libraryQuestion, setLibraryQuestion] = useState(null);
  const [libraryFeedback, setLibraryFeedback] = useState('');

  // Coding Club Minigame states (Typing sequence builder)
  const [typingTarget, setTypingTarget] = useState('const response = await fetch()');
  const [typingInput, setTypingInput] = useState('');
  const [codingProgress, setCodingProgress] = useState(0);

  // Random Event Engine states
  const [currentEvent, setCurrentEvent] = useState(null);

  // Placement variables
  const [placementOutcome, setPlacementOutcome] = useState(null);

  // DSA Complexity Match Library
  const COMPLEXITY_QUESTIONS = [
    { text: 'What is the optimal time complexity to search a sorted array?', opt: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correct: 1 },
    { text: 'Average lookup complexity in a well-distributed Hash Map?', opt: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], correct: 0 },
    { text: 'Worst-case time complexity of Quick Sort partitions?', opt: ['O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'], correct: 3 },
    { text: 'What is the space complexity of an in-place Bubble Sort?', opt: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correct: 0 }
  ];

  // Dynamic questions state
  const [dbQuestions, setDbQuestions] = useState(COMPLEXITY_QUESTIONS);

  useEffect(() => {
    const solvedIds = localStorage.getItem('solved_question_ids_resume-tycoon') || '';
    fetch(`http://localhost:5000/api/questions?category=resume-tycoon&excludeIds=${solvedIds}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.questions && data.questions.length > 0) {
          const mapped = data.questions.map(q => ({
            text: q.question,
            opt: q.options,
            correct: q.correctAnswer,
            _id: q._id
          }));
          setDbQuestions(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Load next Library question
  useEffect(() => {
    if (activeScreen === 'library' && !libraryQuestion) {
      loadNextLibraryQuestion();
    }
  }, [activeScreen, libraryQuestion]);

  const loadNextLibraryQuestion = () => {
    const randomQ = dbQuestions[Math.floor(Math.random() * dbQuestions.length)];
    setLibraryQuestion(randomQ);
    setLibraryFeedback('');
  };

  // Spend hours on general activities
  const handleSpendHours = (hoursSpent, energyCost, statModifier) => {
    if (weeklyHours < hoursSpent) {
      alert("⚠️ INSUFFICIENT HOURS: You do not have enough hours left this week!");
      return;
    }
    if (energy < energyCost) {
      alert("🚨 LOW ENERGY: You need to rest in the Hostel before studying or coding!");
      return;
    }

    setWeeklyHours(prev => prev - hoursSpent);
    setEnergy(prev => Math.max(0, prev - energyCost));
    statModifier();

    if (soundEnabled) tycoonAudio.playBeep(440, 0.05);
  };

  // Advanced Week advancement
  const handleAdvanceWeek = () => {
    if (soundEnabled) tycoonAudio.playWeekAdvance();
    
    // Auto-restore a bit of weekly hours
    setWeeklyHours(40);

    // Roll random weekly events
    if (Math.random() < 0.3) {
      triggerRandomEvent();
    }

    if (week < 16) {
      setWeek(prev => prev + 1);
    } else {
      // Semester transitions
      if (semester < 3) {
        setSemester(prev => prev + 1);
        setWeek(1);
        alert(`🎓 SEMESTER COMPLETE: Welcome to Semester ${semester + 1}! Keep refining your resume.`);
      } else {
        // Placement season unlocks!
        setSemester(4);
        setWeek(1);
        setActiveScreen('placement');
        alert("💼 PLACEMENT SEASON IS ACTIVE! Walk to the Placement Cell and interview with tech companies.");
      }
    }
  };

  // Random events selector
  const triggerRandomEvent = () => {
    const eventsList = [
      {
        title: '💻 Laptop Crash!',
        desc: 'Your local developer configurations crashed. Pay 50 coins to repair, or lose 15 Development rating.',
        options: [
          { text: 'Pay 50 Coins', cost: 50, action: () => { setCoins(c => Math.max(0, c - 50)); } },
          { text: 'Lose 15 Dev rating', cost: 0, action: () => { setDevScore(d => Math.max(0, d - 15)); } }
        ]
      },
      {
        title: '⭐ GitHub Repo Goes Viral!',
        desc: 'An open-source utility you built is featured on SDE newsletters! You gained stars and followers.',
        options: [
          { text: 'Celebrate! (+100 Stars, +200 LinkedIn followers)', cost: 0, action: () => { setGithubStars(s => s + 100); setLinkedinFollowers(l => l + 200); } }
        ]
      },
      {
        title: '🏆 Hackathon Invitation',
        desc: 'An engineering friend invites you to a hackathon teams group. Spend 15 weekly hours to compete.',
        options: [
          { text: 'Join Hackathon (+15 Dev, +10 Comm)', cost: 0, action: () => { setDevScore(d => Math.min(100, d + 15)); setCommScore(c => Math.min(100, c + 10)); } },
          { text: 'Decline', cost: 0, action: () => {} }
        ]
      }
    ];

    const chosen = eventsList[Math.floor(Math.random() * eventsList.length)];
    setCurrentEvent(chosen);
  };

  // Library Big-O Match Validation
  const handleAnswerLibrary = (idx) => {
    if (idx === libraryQuestion.correct) {
      setLibraryFeedback('✅ CORRECT! DSA points compiled.');
      setDsaScore(prev => Math.min(100, prev + 8));
      if (soundEnabled) tycoonAudio.playBeep(659.25, 0.1, 'sine');

      // Prevent repeated questions by logging correct answer IDs to localStorage
      if (libraryQuestion._id) {
        const solved = localStorage.getItem('solved_question_ids_resume-tycoon') || '';
        const solvedArr = solved.split(',').filter(Boolean);
        if (!solvedArr.includes(libraryQuestion._id)) {
          solvedArr.push(libraryQuestion._id);
          localStorage.setItem('solved_question_ids_resume-tycoon', solvedArr.join(','));
        }
      }
      
      setTimeout(() => {
        loadNextLibraryQuestion();
      }, 1200);
    } else {
      setShakeActive(true);
      setTimeout(() => setShakeActive(false), 500);
      setLibraryFeedback('❌ INCORRECT: Look up Big-O matrices.');
      if (soundEnabled) tycoonAudio.playBeep(220, 0.2, 'triangle');
    }
  };

  // Coding Typing Simulator validation
  const handleTypingChange = (e) => {
    const val = e.target.value;
    setTypingInput(val);

    if (val === typingTarget) {
      if (soundEnabled) tycoonAudio.playBeep(523.25, 0.05);
      
      const multiplier = laptopUpgrade === 'Elite Workstation' ? 15 : laptopUpgrade === 'SSD Dev Rig' ? 10 : 6;
      setDevScore(prev => Math.min(100, prev + 5));
      setCodingProgress(prev => {
        const next = prev + multiplier;
        if (next >= 100) {
          setProjectsCount(p => p + 1);
          setCoins(c => c + 40);
          setConfettiActive(true);
          alert("🚀 PROJECT DEPLOYED! Credit: +1 Project, +40 SDE Coins!");
          return 0;
        }
        return next;
      });

      // Load next syntax snippet
      const targets = [
        'const response = await fetch()',
        'app.listen(5000, () => console.log)',
        'const questions = await Question.aggregate()',
        'import React, { useState } from \'react\'',
        'git commit -m "feat: deploy"'
      ];
      setTypingTarget(targets[Math.floor(Math.random() * targets.length)]);
      setTypingInput('');
    }
  };

  // Shopping transactions
  const handleBuyLaptop = (laptop, cost) => {
    if (coins < cost) {
      triggerNotification("Insufficient Coins!", `Need ${cost} coins to purchase ${laptop}`, "⚠️");
      return;
    }
    setCoins(c => c - cost);
    setLaptopUpgrade(laptop);
    triggerNotification("Hardware Upgraded!", `Successfully purchased ${laptop}!`, "🛍️");
    if (soundEnabled) tycoonAudio.playBeep(880, 0.15);
  };

  // Placement cell company checks
  const handleApplyCompany = (companyName, reqDsa, reqDev, reqCgpa) => {
    const isAccepted = dsaScore >= reqDsa && devScore >= reqDev && cgpa >= reqCgpa;
    
    if (isAccepted) {
      setConfettiActive(true);
      if (localStorage.getItem('active_daily_challenge_game') === 'resume-tycoon') {
        completeDailyChallenge();
      }
      setPlacementOutcome({
        company: companyName,
        status: 'ACCEPTED',
        desc: `Congratulations! You received an offer letter from ${companyName}! your resume met all engineering matrices.`
      });
      setUnlockedLevel(prev => Math.max(prev, TYCOON_LEVELS[currentLevelIdx].level + 1));
      addCoins(150);
      addXP(100);
    } else {
      setShakeActive(true);
      setTimeout(() => setShakeActive(false), 500);
      setPlacementOutcome({
        company: companyName,
        status: 'REJECTED',
        desc: `Application Rejected by ${companyName}. Your resume profile lacks the required benchmarks. (Required: DSA ${reqDsa}+, Dev ${reqDev}+, CGPA ${reqCgpa}+)`
      });
    }
    setActiveScreen('placement_result');
  };

  const handleLaunchLevel = (idx) => {
    setCurrentLevelIdx(idx);
    setSemester(1);
    setWeek(1);
    setWeeklyHours(40);
    setCgpa(7.5);
    setDsaScore(10);
    setDevScore(10);
    setCommScore(20);
    setEnergy(100);
    setCoins(100);
    setProjectsCount(0);
    setGithubStars(0);
    setLinkedinFollowers(100);
    setLaptopUpgrade('Standard Laptop');
    setHackathonCertificates(0);
    setConfettiActive(false);

    setActiveScreen('lobby');
  };

  return (
    <div style={styles.container} className={shakeActive ? 'shake-animation' : ''}>
      <ConfettiEffect active={confettiActive} />
      {/* Sound Controller Toggle */}
      <button style={styles.soundBtn} onClick={() => setSoundEnabled(!soundEnabled)}>
        {soundEnabled ? <Volume2 size={16} color="#F97316" /> : <VolumeX size={16} color="var(--danger-color)" />}
      </button>

      {/* 1. SECTOR MENU */}
      {activeScreen === 'menu' && (
        <div style={styles.menuCard} className="game-card">
          <Laptop size={48} color="#F97316" className="float-animation" />
          <h2 style={styles.title}>RESUME BUILDER TYCOON</h2>
          <p style={styles.desc}>
            Allocate weeks, study data structures, build software repositories, and update certifications to build an elite, hireable SDE portfolio.
          </p>

          <div style={styles.levelSelectorGrid}>
            {TYCOON_LEVELS.map((lvl, idx) => {
              const isLocked = lvl.level > unlockedLevel;
              return (
                <div 
                  key={idx} 
                  style={{ 
                    ...styles.levelBox, 
                    opacity: isLocked ? 0.4 : 1,
                    borderColor: isLocked ? 'rgba(255,255,255,0.05)' : '#F97316' 
                  }}
                  className="game-card"
                >
                  <h4 style={{ color: '#FFF', fontWeight: 'bold' }}>SECTOR {lvl.level}: {lvl.title}</h4>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Coin Target: {lvl.coinGoal} Coins | Payout: +100 XP
                  </div>
                  {!isLocked ? (
                    <button 
                      className="game-btn game-btn-primary" 
                      style={{ ...styles.levelAction, backgroundColor: '#F97316', borderColor: '#F97316', color: '#000' }}
                      onClick={() => handleLaunchLevel(idx)}
                    >
                      Enter Campus
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

      {/* 2. THE MAIN CAMPUS DASHBOARD */}
      {activeScreen === 'lobby' && (
        <div style={styles.lobbyWorkspace}>
          {/* Top Info Bar */}
          <div style={styles.topHudBar} className="game-card">
            <div>🎓 Semester: **{semester === 4 ? 'Placement Season' : semester}**</div>
            <div>📅 Week: **{semester === 4 ? 'Active' : `${week} / 16`}**</div>
            <div>⏳ Hours Left: **{weeklyHours} hrs**</div>
            <div>⚡ Energy: **{energy}%**</div>
            <div>🪙 SDE Coins: **{coins}**</div>
            <button className="game-btn game-btn-primary" style={{ padding: '4px 12px', fontSize: '0.7rem', backgroundColor: '#F97316', borderColor: '#F97316', color: '#000' }} onClick={handleAdvanceWeek}>
              End Week
            </button>
          </div>

          <div style={styles.splitLayout}>
            {/* Left Column: Interactive Walkaround Map */}
            <div style={styles.mapPanel} className="game-card">
              <h4 style={styles.panelTitle}>COLLEGE CAMPUS MAP</h4>
              <div style={styles.mapGrid}>
                <div style={styles.mapNode} onClick={() => setActiveScreen('hostel')}>
                  <span>🛌</span>
                  <span style={styles.nodeName}>Hostel Room</span>
                  <span style={styles.nodeTip}>Rest & Netflix</span>
                </div>

                <div style={styles.mapNode} onClick={() => setActiveScreen('library')}>
                  <span>📚</span>
                  <span style={styles.nodeName}>Library</span>
                  <span style={styles.nodeTip}>Study DSA & CGPA</span>
                </div>

                <div style={styles.mapNode} onClick={() => setActiveScreen('coding')}>
                  <span>💻</span>
                  <span style={styles.nodeName}>Coding Club</span>
                  <span style={styles.nodeTip}>Build Projects</span>
                </div>

                <div style={styles.mapNode} onClick={() => setActiveScreen('shop')}>
                  <span>🛍️</span>
                  <span style={styles.nodeName}>Tech Shop</span>
                  <span style={styles.nodeTip}>Hardware Upgrades</span>
                </div>

                <div 
                  style={{ ...styles.mapNode, opacity: semester === 4 ? 1 : 0.4 }} 
                  onClick={() => semester === 4 ? setActiveScreen('placement') : alert("🔒 Placement Cell is locked until Semester 4!")}
                >
                  <span>💼</span>
                  <span style={styles.nodeName}>Placement Cell</span>
                  <span style={styles.nodeTip}>{semester === 4 ? '🔓 Interview Open' : '🔒 Locked (Sem 4)'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Resume Board */}
            <div style={styles.resumePanel} className="game-card">
              <h4 style={{ ...styles.panelTitle, color: '#F97316' }}>LIVE RESUME STATUS</h4>
              <div style={styles.resumeGrid}>
                <div style={styles.resumeStatRow}>
                  <span>🏫 CGPA:</span>
                  <span>{cgpa.toFixed(1)} / 10.0</span>
                </div>
                <div style={styles.resumeStatRow}>
                  <span>👾 DSA Knowledge:</span>
                  <span>{dsaScore} / 100</span>
                </div>
                <div style={styles.resumeStatRow}>
                  <span>💻 Development:</span>
                  <span>{devScore} / 100</span>
                </div>
                <div style={styles.resumeStatRow}>
                  <span>🗣️ Communication:</span>
                  <span>{commScore} / 100</span>
                </div>
                <div style={styles.resumeStatRow}>
                  <span>📄 Software Projects:</span>
                  <span>{projectsCount} deployed</span>
                </div>
                <div style={styles.resumeStatRow}>
                  <span>⭐ GitHub Stars:</span>
                  <span>{githubStars} stars</span>
                </div>
                <div style={styles.resumeStatRow}>
                  <span>🤝 LinkedIn Followers:</span>
                  <span>{linkedinFollowers} followers</span>
                </div>
                <div style={{ ...styles.resumeStatRow, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                  <span>💻 Gear:</span>
                  <span>{laptopUpgrade}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Random Event Popup overlay */}
          {currentEvent && (
            <div style={styles.eventModal}>
              <div style={styles.modalContent} className="game-card">
                <h3 style={{ color: 'var(--danger-color)', fontWeight: 'bold' }}>{currentEvent.title}</h3>
                <p style={{ fontSize: '0.85rem', margin: '1rem 0' }}>{currentEvent.desc}</p>
                <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' }}>
                  {currentEvent.options.map((opt, idx) => (
                    <button 
                      key={idx} 
                      className="game-btn game-btn-primary" 
                      onClick={() => { opt.action(); setCurrentEvent(null); }}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button className="game-btn" style={{ marginTop: '1rem' }} onClick={() => setActiveScreen('menu')}>
            Exit Campus
          </button>
        </div>
      )}

      {/* 3. HOSTEL ROOM (Rest & Recover) */}
      {activeScreen === 'hostel' && (
        <div style={styles.buildingPanel} className="game-card">
          <Coffee size={48} color="#F97316" />
          <h3 style={styles.title}>🛌 HOSTEL RECOVERY QUARTERS</h3>
          <p style={styles.desc}>Rest restores your energy reserves so you can tackle complexity coursework.</p>

          <div style={styles.activityBox}>
            <div style={styles.activityItem}>
              <div>
                <h5>Power Nap</h5>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Costs: 5 Hrs | Restores: +25 Energy</p>
              </div>
              <button className="game-btn" onClick={() => handleSpendHours(5, 0, () => setEnergy(e => Math.min(100, e + 25)))}>
                Rest
              </button>
            </div>

            <div style={styles.activityItem}>
              <div>
                <h5>Watch SDE Podcasts / Netflix</h5>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Costs: 8 Hrs | Restores: +40 Energy, +5 Comm</p>
              </div>
              <button className="game-btn" onClick={() => handleSpendHours(8, 0, () => { setEnergy(e => Math.min(100, e + 40)); setCommScore(c => Math.min(100, c + 5)); })}>
                Relax
              </button>
            </div>
          </div>

          <button className="game-btn" onClick={() => setActiveScreen('lobby')}>
            Return to Map
          </button>
        </div>
      )}

      {/* 4. LIBRARY (DSA & CGPA) */}
      {activeScreen === 'library' && (
        <div style={styles.buildingPanel} className="game-card">
          <BookOpen size={48} color="#F97316" />
          <h3 style={styles.title}>📚 CAMPUS LIBRARY LAB</h3>
          <p style={styles.desc}>Solve complexity scenarios in the library to raise your DSA scores and keep CGPA high.</p>

          <div style={styles.libraryActionRow}>
            <button className="game-btn game-btn-primary" onClick={() => handleSpendHours(6, 12, () => setCgpa(c => Math.min(10.0, c + 0.15)))}>
              Study for Exams (Costs: 6 Hrs, 12 Energy | +0.15 CGPA)
            </button>
          </div>

          {/* DSA complexity matcher puzzle */}
          {libraryQuestion && (
            <div style={styles.puzzleBox} className="game-card">
              <h4 style={{ color: '#F97316', fontWeight: 'bold' }}>DSA COMPLEXITY MATCH</h4>
              <p style={{ fontSize: '0.8rem', margin: '8px 0' }}>{libraryQuestion.text}</p>
              <div style={styles.optGrid}>
                {libraryQuestion.opt.map((opt, idx) => (
                  <button key={idx} className="game-btn" style={{ padding: '6px' }} onClick={() => handleAnswerLibrary(idx)}>
                    {opt}
                  </button>
                ))}
              </div>
              {libraryFeedback && (
                <div style={{ marginTop: '8px', fontSize: '0.75rem', fontWeight: 'bold' }}>{libraryFeedback}</div>
              )}
            </div>
          )}

          <button className="game-btn" onClick={() => setActiveScreen('lobby')}>
            Return to Map
          </button>
        </div>
      )}

      {/* 5. CODING CLUB (Development) */}
      {activeScreen === 'coding' && (
        <div style={styles.buildingPanel} className="game-card">
          <Terminal size={48} color="#F97316" />
          <h3 style={styles.title}>💻 COMPUTER CLUB TERMINAL</h3>
          <p style={styles.desc}>Type the syntax targets exactly to compile codes, boost Development rating, and build projects.</p>

          <div style={styles.libraryActionRow}>
            <button className="game-btn game-btn-primary" onClick={() => handleSpendHours(5, 10, () => setCommScore(c => Math.min(100, c + 8)))}>
              Network on LinkedIn (Costs: 5 Hrs, 10 Energy | +8 Comm, +100 followers)
            </button>
          </div>

          {/* Keypress Typing mini-game */}
          <div style={styles.typingGameBox} className="game-card">
            <h4 style={{ color: '#F97316', fontWeight: 'bold' }}>SYNTAX COMPILER TYPING</h4>
            <div style={styles.syntaxTargetBox}>
              <code>{typingTarget}</code>
            </div>
            <input 
              type="text" 
              placeholder="Type syntax snippet here..."
              value={typingInput}
              onChange={handleTypingChange}
              style={styles.typingInputBox}
            />
            {/* Project progress bar */}
            <div style={{ width: '100%', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                <span>Active Project Progress:</span>
                <span>{codingProgress}%</span>
              </div>
              <div style={styles.progressBarBg}>
                <div style={{ ...styles.progressBarFill, width: `${codingProgress}%` }}></div>
              </div>
            </div>
          </div>

          <button className="game-btn" onClick={() => setActiveScreen('lobby')}>
            Return to Map
          </button>
        </div>
      )}

      {/* 6. TECH SHOP */}
      {activeScreen === 'shop' && (
        <div style={styles.buildingPanel} className="game-card">
          <ShoppingBag size={48} color="#F97316" />
          <h3 style={styles.title}>🛍️ HARDWARE STORE SHOP</h3>
          <p style={styles.desc}>Spend SDE Placement coins to upgrade developer laptops, boosting code development rates.</p>

          <div style={styles.shopGrid}>
            <div style={styles.shopItem} className="game-card">
              <h5>SSD Developer Laptop</h5>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Increases dev project compiling rate by 50%.</p>
              <button 
                className="game-btn game-btn-primary" 
                style={{ 
                  backgroundColor: (laptopUpgrade === 'SSD Dev Rig' || laptopUpgrade === 'Elite Workstation') ? 'rgba(255, 255, 255, 0.08)' : '#F97316', 
                  borderColor: (laptopUpgrade === 'SSD Dev Rig' || laptopUpgrade === 'Elite Workstation') ? 'rgba(255, 255, 255, 0.1)' : '#F97316', 
                  color: (laptopUpgrade === 'SSD Dev Rig' || laptopUpgrade === 'Elite Workstation') ? 'var(--text-secondary)' : '#000', 
                  fontSize: '0.7rem', 
                  padding: '4px',
                  cursor: (laptopUpgrade === 'SSD Dev Rig' || laptopUpgrade === 'Elite Workstation') ? 'not-allowed' : 'pointer'
                }}
                onClick={() => handleBuyLaptop('SSD Dev Rig', 80)}
                disabled={laptopUpgrade === 'SSD Dev Rig' || laptopUpgrade === 'Elite Workstation'}
              >
                {laptopUpgrade === 'SSD Dev Rig' || laptopUpgrade === 'Elite Workstation' ? 'Owned' : 'Buy (80 Coins)'}
              </button>
            </div>

            <div style={styles.shopItem} className="game-card">
              <h5>Elite Quad-Core Workstation</h5>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Increases dev compiling speed by 150%.</p>
              <button 
                className="game-btn game-btn-primary" 
                style={{ 
                  backgroundColor: (laptopUpgrade === 'Elite Workstation') ? 'rgba(255, 255, 255, 0.08)' : '#F97316', 
                  borderColor: (laptopUpgrade === 'Elite Workstation') ? 'rgba(255, 255, 255, 0.1)' : '#F97316', 
                  color: (laptopUpgrade === 'Elite Workstation') ? 'var(--text-secondary)' : '#000', 
                  fontSize: '0.7rem', 
                  padding: '4px',
                  cursor: (laptopUpgrade === 'Elite Workstation') ? 'not-allowed' : 'pointer'
                }}
                onClick={() => handleBuyLaptop('Elite Workstation', 180)}
                disabled={laptopUpgrade === 'Elite Workstation'}
              >
                {laptopUpgrade === 'Elite Workstation' ? 'Owned' : 'Buy (180 Coins)'}
              </button>
            </div>
          </div>

          <button className="game-btn" onClick={() => setActiveScreen('lobby')}>
            Return to Map
          </button>
        </div>
      )}

      {/* 7. PLACEMENT CELL */}
      {activeScreen === 'placement' && (
        <div style={styles.buildingPanel} className="game-card">
          <Landmark size={48} color="#F97316" />
          <h3 style={styles.title}>💼 THE PLACEMENT INTERVIEW BLOCK</h3>
          <p style={styles.desc}>Interview at tech companies. The evaluation compares your compiled SDE resume indicators.</p>

          <div style={styles.companyGrid}>
            <div style={styles.companyItem} className="game-card">
              <h5>OpenAI</h5>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Requires: DSA 90+, Dev 90+, CGPA 9.0+</p>
              <button className="game-btn game-btn-primary" style={{ backgroundColor: '#F97316', borderColor: '#F97316', color: '#000' }} onClick={() => handleApplyCompany('OpenAI', 90, 90, 9.0)}>
                Apply
              </button>
            </div>

            <div style={styles.companyItem} className="game-card">
              <h5>Google</h5>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Requires: DSA 80+, Dev 70+, CGPA 8.5+</p>
              <button className="game-btn game-btn-primary" style={{ backgroundColor: '#F97316', borderColor: '#F97316', color: '#000' }} onClick={() => handleApplyCompany('Google', 80, 70, 8.5)}>
                Apply
              </button>
            </div>

            <div style={styles.companyItem} className="game-card">
              <h5>Netflix</h5>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Requires: DSA 85+, Dev 80+, CGPA 8.8+</p>
              <button className="game-btn game-btn-primary" style={{ backgroundColor: '#F97316', borderColor: '#F97316', color: '#000' }} onClick={() => handleApplyCompany('Netflix', 85, 80, 8.8)}>
                Apply
              </button>
            </div>

            <div style={styles.companyItem} className="game-card">
              <h5>Microsoft</h5>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Requires: DSA 75+, Dev 75+, CGPA 8.0+</p>
              <button className="game-btn game-btn-primary" style={{ backgroundColor: '#F97316', borderColor: '#F97316', color: '#000' }} onClick={() => handleApplyCompany('Microsoft', 75, 75, 8.0)}>
                Apply
              </button>
            </div>

            <div style={styles.companyItem} className="game-card">
              <h5>Amazon</h5>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Requires: DSA 70+, Dev 70+, CGPA 7.5+</p>
              <button className="game-btn game-btn-primary" style={{ backgroundColor: '#F97316', borderColor: '#F97316', color: '#000' }} onClick={() => handleApplyCompany('Amazon', 70, 70, 7.5)}>
                Apply
              </button>
            </div>

            <div style={styles.companyItem} className="game-card">
              <h5>TCS / Infosys</h5>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Requires: DSA 30+, Dev 30+, CGPA 6.0+</p>
              <button className="game-btn game-btn-primary" style={{ backgroundColor: '#F97316', borderColor: '#F97316', color: '#000' }} onClick={() => handleApplyCompany('TCS/Infosys', 30, 30, 6.0)}>
                Apply
              </button>
            </div>
          </div>

          <button className="game-btn" onClick={() => setActiveScreen('lobby')}>
            Return to Map
          </button>
        </div>
      )}

      {/* 8. PLACEMENT OUTCOME SCREEN */}
      {activeScreen === 'placement_result' && placementOutcome && (
        <div style={styles.outcomeCard} className="game-card">
          {placementOutcome.status === 'ACCEPTED' ? (
            <CheckCircle2 size={64} color="var(--success-color)" className="float-animation" />
          ) : (
            <XCircle size={64} color="var(--danger-color)" className="float-animation" />
          )}

          <h2 style={{ ...styles.title, color: placementOutcome.status === 'ACCEPTED' ? 'var(--success-color)' : 'var(--danger-color)' }}>
            {placementOutcome.status === 'ACCEPTED' ? 'OFFER EXTENDED!' : 'APPLICATION REJECTED'}
          </h2>
          <p style={styles.desc}>{placementOutcome.desc}</p>

          {placementOutcome.status === 'ACCEPTED' ? (
            <div style={styles.rewardsBox}>
              <div>🪙 Hired! Credited +150 SDE Placement Coins</div>
              <div>⚡ Applied +100 SDE Hub XP</div>
            </div>
          ) : null}

          <button className="game-btn game-btn-primary" style={{ backgroundColor: '#F97316', borderColor: '#F97316', color: '#000' }} onClick={() => setActiveScreen('menu')}>
            Return to Tycoon Menu
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
  menuCard: {
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
  lobbyWorkspace: {
    width: '100%',
    maxWidth: '920px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  topHudBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1.5rem',
    fontSize: '0.8rem',
    border: '1px solid rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: '12px'
  },
  splitLayout: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '1rem',
    width: '100%'
  },
  panelTitle: {
    fontWeight: 'bold',
    fontSize: '0.9rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '8px',
    marginBottom: '12px',
    letterSpacing: '0.5px'
  },
  mapPanel: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    padding: '1.25rem',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.05)'
  },
  mapGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },
  mapNode: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.03)',
    padding: '1rem 0.5rem',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    ':hover': {
      borderColor: '#F97316',
      transform: 'translateY(-2px)'
    }
  },
  nodeName: {
    fontSize: '0.8rem',
    fontWeight: 'bold',
    color: '#FFF'
  },
  nodeTip: {
    fontSize: '0.6rem',
    color: 'var(--text-secondary)'
  },
  resumePanel: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    padding: '1.25rem',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.05)'
  },
  resumeGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  resumeStatRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem'
  },
  buildingPanel: {
    maxWidth: '620px',
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    border: '2px solid #F97316',
    padding: '2rem',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem'
  },
  activityBox: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    margin: '1rem 0'
  },
  activityItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    textAlign: 'left'
  },
  libraryActionRow: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    margin: '8px 0'
  },
  puzzleBox: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: '1rem',
    borderRadius: '10px',
    width: '100%',
    textAlign: 'center'
  },
  optGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginTop: '8px'
  },
  typingGameBox: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: '1.25rem',
    borderRadius: '10px',
    width: '100%',
    textAlign: 'center'
  },
  syntaxTargetBox: {
    backgroundColor: '#05070c',
    padding: '8px',
    borderRadius: '4px',
    margin: '8px 0',
    color: '#00F3FF'
  },
  typingInputBox: {
    width: '100%',
    padding: '4px 8px',
    backgroundColor: '#1E1E1E',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#FFF',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    borderRadius: '4px',
    outline: 'none'
  },
  progressBarBg: {
    height: '6px',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginTop: '4px'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F97316',
    transition: 'width 0.3s ease'
  },
  shopGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    width: '100%',
    margin: '1rem 0'
  },
  shopItem: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    padding: '1rem',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'center',
    textAlign: 'center'
  },
  companyGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    width: '100%',
    margin: '1rem 0'
  },
  companyItem: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    padding: '1rem',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'center',
    textAlign: 'center'
  },
  outcomeCard: {
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
  eventModal: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100
  },
  modalContent: {
    backgroundColor: 'rgba(15, 23, 42, 0.98)',
    border: '2px solid var(--danger-color)',
    padding: '2rem',
    borderRadius: '16px',
    maxWidth: '480px',
    width: '90%',
    textAlign: 'center'
  }
};
