import React, { useState } from 'react';
import { Calendar, Gift, Flame, Trophy, Coins, Zap, CheckCircle2, X } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

const REWARDS_SCHEDULE = [
  { day: 1, title: 'Day 1 Starter', coins: 50, xp: 20, icon: '🪙', desc: '+50 SDE Gold Coins & +20 XP' },
  { day: 2, title: 'Day 2 Booster', coins: 75, xp: 30, icon: '⚡', desc: '+75 SDE Gold Coins & +30 XP' },
  { day: 3, title: 'Day 3 Supply', coins: 100, xp: 40, icon: '🎁', desc: '+100 SDE Gold Coins & +40 XP' },
  { day: 4, title: 'Day 4 Surge', coins: 125, xp: 50, icon: '🔥', desc: '+125 SDE Gold Coins & +50 XP' },
  { day: 5, title: 'Day 5 Cyber Cache', coins: 150, xp: 60, icon: '💎', desc: '+150 SDE Gold Coins & +60 XP' },
  { day: 6, title: 'Day 6 Elite Matrix', coins: 200, xp: 80, icon: '🚀', desc: '+200 SDE Gold Coins & +80 XP' },
  { day: 7, title: 'Day 7 Jackpot Legend', coins: 350, xp: 120, icon: '👑', desc: '+350 Coins + 👑 Cyber Legend Badge' }
];

export default function DailyRewardModal({ isOpen, onClose }) {
  const { streak, lastDailyRewardDate, claimDailyReward, triggerNotification, isMuted } = usePlayerStore();
  const [claiming, setClaiming] = useState(false);
  const [claimedToday, setClaimedToday] = useState(false);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const isAlreadyClaimed = lastDailyRewardDate === todayStr || claimedToday;
  const currentDayIndex = ((streak || 0) % 7) === 0 ? 7 : ((streak || 0) % 7);
  const todayReward = REWARDS_SCHEDULE[currentDayIndex - 1] || REWARDS_SCHEDULE[0];

  const playClaimAudio = () => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.25);
      });
    } catch(e) {}
  };

  const handleClaim = async () => {
    if (isAlreadyClaimed || claiming) return;

    setClaiming(true);
    playClaimAudio();

    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${window.API_BASE_URL || (window.API_BASE_URL || 'http://localhost:5000')}/api/auth/claim-daily-reward`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            rewardCoins: todayReward.coins,
            rewardXP: todayReward.xp
          })
        });
      }

      claimDailyReward(todayReward.coins, todayReward.xp, streak + 1);
      setClaimedToday(true);
      triggerNotification('🎁 Daily Login Reward Claimed!', `Received +${todayReward.coins} Coins and +${todayReward.xp} XP!`, '🔥');
    } catch (error) {
      console.error(error);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div style={styles.overlay} className="modal-overlay">
      <div style={styles.modalCard} className="game-card fade-in">
        <button style={styles.closeBtn} onClick={onClose} title="Close Daily Calendar">
          <X size={18} />
        </button>

        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <Calendar size={32} color="var(--accent-color)" />
          </div>
          <h2 style={styles.title}>DAILY REWARD MATRIX</h2>
          <p style={styles.desc}>
            Log in daily to stack your SDE streak bonus and unlock exclusive gold coin payouts!
          </p>
        </div>

        {/* 7-Day Calendar Grid */}
        <div style={styles.grid}>
          {REWARDS_SCHEDULE.map((item) => {
            const isToday = item.day === currentDayIndex;
            const isPast = item.day < currentDayIndex || (isToday && isAlreadyClaimed);

            return (
              <div 
                key={item.day}
                style={{
                  ...styles.dayCard,
                  borderColor: isToday ? '#FFD700' : isPast ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.1)',
                  background: isToday ? 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(0,0,0,0.4) 100%)' : isPast ? 'rgba(0, 243, 255, 0.08)' : 'rgba(15, 23, 42, 0.6)',
                  boxShadow: isToday ? '0 0 15px rgba(255,215,0,0.3)' : 'none'
                }}
              >
                <div style={styles.dayBadge}>DAY {item.day}</div>
                <div style={styles.dayIcon}>{item.icon}</div>
                <div style={styles.dayRewardText}>+{item.coins} Coins</div>
                <div style={styles.dayXpText}>+{item.xp} XP</div>
                {isPast && (
                  <div style={styles.checkOverlay}>
                    <CheckCircle2 size={16} color="#10B981" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Claim Button */}
        <div style={styles.footer}>
          {isAlreadyClaimed ? (
            <div style={styles.claimedBanner}>
              <CheckCircle2 size={18} color="#10B981" />
              <span>Today's Daily Reward Claimed! Next Reward Available Tomorrow.</span>
            </div>
          ) : (
            <button 
              className="game-btn game-btn-primary" 
              style={styles.claimBtn}
              onClick={handleClaim}
              disabled={claiming}
            >
              <Gift size={18} />
              <span>{claiming ? 'CLAIMING MATRIX...' : `CLAIM DAY ${currentDayIndex} REWARD (+${todayReward.coins} COINS)`}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '1rem'
  },
  modalCard: {
    width: '100%',
    maxWidth: '680px',
    backgroundColor: '#0F172A',
    border: '2px solid var(--accent-color)',
    borderRadius: '16px',
    padding: '2rem',
    position: 'relative',
    boxShadow: '0 0 40px rgba(0, 243, 255, 0.2)',
    textAlign: 'center'
  },
  closeBtn: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '50%'
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  iconCircle: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 243, 255, 0.1)',
    border: '1px solid var(--accent-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.75rem'
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: '1px'
  },
  desc: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    marginTop: '0.25rem',
    maxWidth: '480px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
    gap: '10px',
    marginBottom: '1.5rem'
  },
  dayCard: {
    borderRadius: '10px',
    padding: '10px 6px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    border: '1px solid transparent',
    transition: 'transform 0.2s ease'
  },
  dayBadge: {
    fontSize: '0.65rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    marginBottom: '4px'
  },
  dayIcon: {
    fontSize: '1.5rem',
    margin: '4px 0'
  },
  dayRewardText: {
    fontSize: '0.7rem',
    fontWeight: '800',
    color: '#FFD700'
  },
  dayXpText: {
    fontSize: '0.65rem',
    color: 'var(--accent-color)'
  },
  checkOverlay: {
    position: 'absolute',
    top: '4px',
    right: '4px'
  },
  footer: {
    display: 'flex',
    justifyContent: 'center'
  },
  claimBtn: {
    width: '100%',
    maxWidth: '400px',
    padding: '12px 24px',
    fontSize: '0.9rem',
    fontWeight: '800',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    background: 'linear-gradient(135deg, #EAB308 0%, #CA8A04 100%)',
    borderColor: '#EAB308',
    color: '#000',
    boxShadow: '0 0 20px rgba(234, 179, 8, 0.4)'
  },
  claimedBanner: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid #10B981',
    color: '#10B981',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: '600'
  }
};
