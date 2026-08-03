import { create } from 'zustand';
import { audioManager } from '../utils/audioManager';

const RANKS = [
  { name: 'Fresher', xpNeeded: 0 },
  { name: 'Intern', xpNeeded: 100 },
  { name: 'Associate', xpNeeded: 300 },
  { name: 'Engineer', xpNeeded: 700 },
  { name: 'Senior Engineer', xpNeeded: 1500 },
  { name: 'Tech Lead', xpNeeded: 3000 },
  { name: 'Architect', xpNeeded: 6000 },
  { name: 'CTO Legend', xpNeeded: 12000 }
];

// Moderate Level Curve: Balanced rate (neither too fast nor too slow)
export const getPlayerLevelInfo = (xpAmount) => {
  const xp = Math.max(0, xpAmount || 0);
  const levels = [
    { level: 1, minXp: 0, maxXp: 199 },
    { level: 2, minXp: 200, maxXp: 499 },
    { level: 3, minXp: 500, maxXp: 899 },
    { level: 4, minXp: 900, maxXp: 1399 },
    { level: 5, minXp: 1400, maxXp: 1999 },
    { level: 6, minXp: 2000, maxXp: 2699 },
    { level: 7, minXp: 2700, maxXp: 3499 },
    { level: 8, minXp: 3500, maxXp: 4399 },
    { level: 9, minXp: 4400, maxXp: 5399 },
    { level: 10, minXp: 5400, maxXp: 6499 }
  ];

  let currentLevel = 1;
  let minXp = 0;
  let maxXp = 199;

  for (const lvl of levels) {
    if (xp >= lvl.minXp) {
      currentLevel = lvl.level;
      minXp = lvl.minXp;
      maxXp = lvl.maxXp;
    } else {
      break;
    }
  }

  if (xp >= 6500) {
    const extraLevels = Math.floor((xp - 6500) / 1200);
    currentLevel = 10 + extraLevels;
    minXp = 6500 + extraLevels * 1200;
    maxXp = minXp + 1199;
  }

  const range = maxXp - minXp + 1;
  const progressInLevel = xp - minXp;
  const progressPercent = Math.min(100, Math.max(0, Math.floor((progressInLevel / range) * 100)));
  const xpNeededForNext = maxXp + 1 - xp;

  return {
    level: currentLevel,
    minXp,
    maxXp,
    progressPercent,
    xpNeededForNext
  };
};

const syncProgressWithBackend = async (state) => {
  const token = localStorage.getItem('token');
  if (!token || !state.profileLoaded) return;

  try {
    await fetch('http://localhost:5000/api/auth/progress', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        xp: state.xp,
        coins: state.coins,
        streak: state.streak,
        classType: state.classType,
        unlockedSkills: state.unlockedSkills,
        heistLevelsCompleted: state.heistLevelsCompleted,
        aptiHighScore: state.aptiHighScore,
        clan: state.clan
      })
    });
  } catch (error) {
    console.warn("Backend sync failed:", error);
  }
};

export const usePlayerStore = create((set, get) => ({
  // Player profile state
  profileLoaded: false,
  name: 'Player 1',
  avatar: '🚀',
  rank: 'Fresher',
  xp: 0,
  coins: 200,
  reputation: 0,
  hearts: 5,
  maxHearts: 5,
  streak: 3, // Mocking a 3-day streak to start with a nice visual
  activeGame: 'landing', // 'landing', 'hub', 'career-tower', 'sql-heist', 'algo-arena', 'startup-garage', 'internship-detective', 'apti-rush', 'profile'
  email: '',
  collegeName: '',
  department: '',
  gradYear: null,
  rollNumber: '',
  clan: '',

  // Skill Tree state
  classType: null, // 'Frontend Mage', 'Backend Guardian', 'AI Alchemist', 'UI/UX Rogue'
  unlockedSkills: [], // List of node IDs

  // Individual game stats/highscores
  heistLevelsCompleted: 0,
  arenaLevel: 1,
  aptiHighScore: 0,
  startupMaxRevenue: 0,
  detectiveEndingsUnlocked: [],
  notification: null,
  isMuted: false,
  bgmVolume: 0.5,
  sfxVolume: 0.5,
  activeTrack: 'none',
  lastDailyRewardDate: '',
  dailyRewardModalOpen: false,

  // Set Daily Reward Modal Visibility
  setDailyRewardModalOpen: (isOpen) => set({ dailyRewardModalOpen: isOpen }),

  // Audio toggles and modifiers
  toggleAudio: () => set((state) => {
    const nextMuted = !state.isMuted;
    audioManager.setMuted(nextMuted);
    return { isMuted: nextMuted };
  }),

  setBgmVolume: (vol) => {
    set({ bgmVolume: vol });
    audioManager.setBgmVolume(vol);
  },

  setSfxVolume: (vol) => {
    set({ sfxVolume: vol });
    audioManager.setSfxVolume(vol);
  },

  setTrack: (trackName) => {
    set({ activeTrack: trackName });
    audioManager.playTrack(trackName);
  },

  playGlobalSfx: (type) => {
    const current = get();
    if (current.isMuted) return;
    if (type === 'collect') audioManager.playCollect();
    else if (type === 'success') audioManager.playSuccess();
    else if (type === 'error') audioManager.playError();
    else if (type === 'bossHit') audioManager.playBossHit();
    else if (type === 'upgrade') audioManager.playUpgrade();
  },

  // Daily Reward Claim Action
  claimDailyReward: (rewardCoins, rewardXP, newStreak) => {
    const current = get();
    const todayStr = new Date().toISOString().split('T')[0];
    const newCoins = current.coins + rewardCoins;
    const newXP = current.xp + rewardXP;
    
    set({
      coins: newCoins,
      xp: newXP,
      streak: newStreak,
      lastDailyRewardDate: todayStr
    });

    syncProgressWithBackend({
      ...get(),
      coins: newCoins,
      xp: newXP,
      streak: newStreak
    });
  },

  // Action methods
  setGame: (game) => set({ activeGame: game }),

  triggerNotification: (title, message, icon = '🔔') => {
    set({ notification: { title, message, icon } });
    setTimeout(() => {
      const current = get().notification;
      if (current && current.title === title && current.message === message) {
        set({ notification: null });
      }
    }, 4000);
  },
  
  setClass: (classType) => {
    const current = get();
    set({ classType });
    syncProgressWithBackend({
      ...current,
      classType
    });
  },
  
  addXP: (amount) => {
    const current = get();
    const newXP = current.xp + amount;
    
    let currentRank = 'Fresher';
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (newXP >= RANKS[i].xpNeeded) {
        currentRank = RANKS[i].name;
        break;
      }
    }
    
    set({ xp: newXP, rank: currentRank });
    
    syncProgressWithBackend({
      ...get(),
      xp: newXP,
      rank: currentRank
    });
  },

  addCoins: (amount) => {
    const current = get();
    const newCoins = current.coins + amount;
    set({ coins: newCoins });
    syncProgressWithBackend({
      ...current,
      coins: newCoins
    });
  },
  
  loseHeart: () => set((state) => {
    const newHearts = Math.max(0, state.hearts - 1);
    return { hearts: newHearts };
  }),
  
  gainHeart: () => set((state) => ({ 
    hearts: Math.min(state.maxHearts, state.hearts + 1) 
  })),

  restoreHearts: () => set((state) => ({ hearts: state.maxHearts })),

  unlockSkill: (skillId) => {
    const current = get();
    if (current.unlockedSkills.includes(skillId)) return;
    const newSkills = [...current.unlockedSkills, skillId];
    set({ unlockedSkills: newSkills });
    syncProgressWithBackend({
      ...current,
      unlockedSkills: newSkills
    });
  },

  incrementStreak: () => {
    const current = get();
    const newStreak = current.streak + 1;
    set({ streak: newStreak });
    syncProgressWithBackend({
      ...current,
      streak: newStreak
    });
  },
  
  completeHeistLevel: () => {
    const current = get();
    const newHeist = current.heistLevelsCompleted + 1;
    set({ heistLevelsCompleted: newHeist });
    syncProgressWithBackend({
      ...current,
      heistLevelsCompleted: newHeist
    });
  },
  
  setArenaLevel: (level) => set({ arenaLevel: level }),
  
  setAptiHighScore: (score) => {
    const current = get();
    const newApti = Math.max(current.aptiHighScore, score);
    set({ aptiHighScore: newApti });
    syncProgressWithBackend({
      ...current,
      aptiHighScore: newApti
    });
  },

  setClan: (clanId) => {
    const current = get();
    set({ clan: clanId });
    syncProgressWithBackend({
      ...current,
      clan: clanId
    });
  },

  completeDailyChallenge: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:5000/api/daily-challenge/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        set({
          coins: data.coins,
          xp: data.xp,
          rank: data.rank
        });
        localStorage.removeItem('active_daily_challenge_game');
        get().triggerNotification('🎁 Daily Challenge Completed!', 'Claimed +50 SDE Coins and +30 XP!', '📅');
      }
    } catch (err) {
      console.error(err);
    }
  },

  mergeAndSyncProfile: (studentData) => {
    const current = get();
    const mergedXp = Math.max(current.xp, studentData.xp || 0);
    const mergedCoins = Math.max(current.coins, studentData.coins || 0);
    const mergedHeist = Math.max(current.heistLevelsCompleted, studentData.heistLevelsCompleted || 0);
    const mergedApti = Math.max(current.aptiHighScore, studentData.aptiHighScore || 0);
    const mergedSkills = Array.from(new Set([...(current.unlockedSkills || []), ...(studentData.unlockedSkills || [])]));
    const mergedClass = studentData.classType || current.classType;

    let currentRank = studentData.rank || 'Fresher';
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (mergedXp >= RANKS[i].xpNeeded) {
        currentRank = RANKS[i].name;
        break;
      }
    }

    const updatedState = {
      name: studentData.name,
      avatar: studentData.avatar,
      rank: currentRank,
      xp: mergedXp,
      coins: mergedCoins,
      streak: studentData.streak,
      classType: mergedClass,
      unlockedSkills: mergedSkills,
      heistLevelsCompleted: mergedHeist,
      aptiHighScore: mergedApti,
      email: studentData.email,
      collegeName: studentData.collegeName,
      department: studentData.department,
      gradYear: studentData.gradYear,
      rollNumber: studentData.rollNumber,
      clan: studentData.clan || '',
      profileLoaded: true
    };

    set(updatedState);
    
    syncProgressWithBackend({
      ...get(),
      ...updatedState
    });
  },

  resetGame: () => {
    localStorage.removeItem('token');
    set({
      profileLoaded: false,
      rank: 'Fresher',
      xp: 0,
      coins: 200,
      reputation: 0,
      hearts: 5,
      streak: 3,
      activeGame: 'landing',
      classType: null,
      unlockedSkills: [],
      heistLevelsCompleted: 0,
      arenaLevel: 1,
      aptiHighScore: 0,
      startupMaxRevenue: 0,
      detectiveEndingsUnlocked: [],
      email: '',
      collegeName: '',
      department: '',
      gradYear: null,
      rollNumber: '',
      clan: ''
    });
  }
}));
