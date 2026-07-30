import React from 'react';
import { usePlayerStore, getPlayerLevelInfo } from '../store/usePlayerStore';
import { Award, Trophy, ShieldAlert, Star, Terminal, Coins, Flame, Cpu, ShieldCheck } from 'lucide-react';

function renderAvatar(val) {
  if (!val || (typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://')))) {
    return '🧙';
  }
  return val;
}

const ACHIEVEMENTS = [
  {
    id: 'sql_master',
    title: 'SQL Cyber Decryptor',
    desc: 'Bypassed server defenses to extract files in the Data Bank.',
    icon: Terminal,
    color: '#39FF14',
    check: (s) => s.heistLevelsCompleted > 0
  },
  {
    id: 'algo_slayer',
    title: 'Algorithm Gladiator',
    desc: 'Defeated a data structure monster in the DSA Arena.',
    icon: ShieldCheck,
    color: '#EF4444',
    check: (s) => s.xp >= 40
  },
  {
    id: 'placement_hunter',
    title: 'Logical Ninja',
    desc: 'Achieved a score of 50+ in Apti-Rush.',
    icon: Trophy,
    color: '#FF007F',
    check: (s) => s.aptiHighScore >= 50
  },
  {
    id: 'cto_badge',
    title: 'Incubator Founder',
    desc: 'Successfully launched a SaaS company from a dorm room.',
    icon: Cpu,
    color: '#F97316',
    check: (s) => s.xp >= 80
  },
  {
    id: 'decryptor_auditor',
    title: 'Compiler Auditor',
    desc: 'Audited and debugged corrupt code lines in Code Decryptor.',
    icon: ShieldAlert,
    color: '#EC4899',
    check: (s) => s.xp >= 60
  },
  {
    id: 'codex_scholar',
    title: 'Databank Archivist',
    desc: 'Unlocked all Metropolis database entries in the Codex Terminal.',
    icon: Star,
    color: '#00F3FF',
    check: (s) => localStorage.getItem('metropolis_codex_opened') === 'true' || s.xp >= 20
  },
  {
    id: 'code_snake_master',
    title: 'Syntactic Reptile',
    desc: 'Completed Level 5 in the Code Snake Arena.',
    icon: Terminal,
    color: '#10B981',
    check: (s) => s.xp >= 150
  },
  {
    id: 'ai_champion_badge',
    title: 'AI Champion',
    desc: 'Completed all 10 stages in the AI Master Challenge.',
    icon: Trophy,
    color: '#00F3FF',
    check: (s) => s.xp >= 300
  }
];

const CLANS = [
  {
    id: 'algo_overlords',
    name: 'Algorithm Overlords',
    emoji: '⚔️',
    desc: 'Mastering dynamic programming and graph structures.',
    members: [
      { name: 'Rohan (Lead)', rank: 'CTO Legend', xp: 4200, avatar: '👨‍💻' },
      { name: 'Nisha', rank: 'Engineer', xp: 950, avatar: '👩‍💻' },
      { name: 'Vikram', rank: 'Associate', xp: 700, avatar: '🧑‍💻' }
    ]
  },
  {
    id: 'bytecode_buccaneers',
    name: 'Bytecode Buccaneers',
    emoji: '🏴‍☠️',
    desc: 'Database heist specialists and SQL injection bypassers.',
    members: [
      { name: 'Aman', rank: 'Architect', xp: 2450, avatar: '🧑‍💻' },
      { name: 'Priya', rank: 'Senior Engineer', xp: 1400, avatar: '👩‍💻' }
    ]
  },
  {
    id: 'recursion_rangers',
    name: 'Recursion Rangers',
    emoji: '🌀',
    desc: 'Functional programming, clean code, and recursion loops.',
    members: [
      { name: 'Neha', rank: 'Architect', xp: 3800, avatar: '👩‍💼' },
      { name: 'Thomas Neo', rank: 'Senior SDE', xp: 2100, avatar: '🕶️' }
    ]
  }
];

export default function ProfilePage() {
  const store = usePlayerStore();
  const { 
    name, avatar, rank, xp, coins, streak, classType, unlockedSkills, 
    heistLevelsCompleted, aptiHighScore, setGame,
    collegeName, department, gradYear, rollNumber, email, clan, setClan
  } = store;

  const { level, xpNeededForNext } = getPlayerLevelInfo(xp);

  const getAcademicYear = (year) => {
    if (!year) return 'N/A';
    const currentYear = new Date().getFullYear();
    const diff = year - currentYear;
    if (diff >= 3) return 'FY (First Year)';
    if (diff === 2) return 'SY (Second Year)';
    if (diff === 1) return 'TY (Third Year)';
    if (diff <= 0) return 'LY (Final Year / Graduate)';
    return `${year} Grad`;
  };

  const [leaderboard, setLeaderboard] = React.useState([]);
  const [leaderboardExpanded, setLeaderboardExpanded] = React.useState(false);

  React.useEffect(() => {
    const fetchLeaderboardData = () => {
      fetch('http://localhost:5000/api/leaderboard')
        .then(res => res.json())
        .then(data => {
          let dbLeaderboard = [];
          if (data.success && data.leaderboard && data.leaderboard.length > 0) {
            dbLeaderboard = data.leaderboard;
          }

          const currentPlayer = usePlayerStore.getState();
          if (currentPlayer && (currentPlayer.name || currentPlayer.email)) {
            let found = false;
            dbLeaderboard = dbLeaderboard.map(p => {
              const isMatch = (currentPlayer.email && p.email && p.email.toLowerCase() === currentPlayer.email.toLowerCase()) || 
                              (currentPlayer.name && p.name && p.name.toLowerCase() === currentPlayer.name.toLowerCase());
              if (isMatch) {
                found = true;
                return { ...p, xp: Math.max(Number(p.xp || 0), Number(currentPlayer.xp || 0)), avatar: currentPlayer.avatar || p.avatar };
              }
              return p;
            });

            if (!found && currentPlayer.name && currentPlayer.name !== 'Player 1') {
              dbLeaderboard.push({
                name: currentPlayer.name,
                email: currentPlayer.email,
                avatar: currentPlayer.avatar,
                rank: currentPlayer.rank,
                xp: Number(currentPlayer.xp || 0)
              });
            }
          }

          dbLeaderboard.sort((a, b) => Number(b.xp || 0) - Number(a.xp || 0));
          setLeaderboard(dbLeaderboard);
        })
        .catch(() => {
          setLeaderboard([]);
        });
    };

    fetchLeaderboardData();
    const interval = setInterval(fetchLeaderboardData, 3000);
    return () => clearInterval(interval);
  }, []);

  const playHoverSound = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600 + Math.random() * 200, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch(e) {}
  };

  const handleSpeakProfile = () => {
    try {
      window.speechSynthesis.cancel();
      const text = `Welcome back developer ${name}. You are a level ${level} ${classType || 'unspecialized programmer'}. You currently hold ${coins} placement coins and have unlocked ${unlockedSkills.length} career constellation skills.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch(e) {}
  };

  return (
    <div style={styles.container} className="grid-overlay profile-container">
      <div style={styles.grid} className="profile-grid">
        {/* Left Card: Player Details */}
        <div className="game-card" style={styles.detailsCard}>
          <div style={styles.avatarWrapper} className="float-animation">
            <span style={styles.avatar}>{renderAvatar(avatar, '48px')}</span>
          </div>

          <button 
            className="game-btn" 
            style={{ padding: '4px 10px', fontSize: '0.7rem', marginBottom: '1rem', borderColor: 'var(--accent-color)', color: 'var(--accent-color)', backgroundColor: 'transparent' }}
            onClick={handleSpeakProfile}
            onMouseEnter={playHoverSound}
          >
            🔊 Speak Summary
          </button>
          
          <h2 style={styles.hackerName}>{name}</h2>
          {email && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem' }}>
              @{email.split('@')[0]}
            </div>
          )}
          <div style={styles.rankBadge}>
            <Award size={14} color="#00F3FF" />
            <span>{rank}</span>
          </div>

          <div style={styles.statsSummary}>
            <div style={styles.sumBox} onMouseEnter={playHoverSound}>
              <span style={styles.sumVal}>{level}</span>
              <span style={styles.sumLabel}>LEVEL</span>
            </div>
            <div style={styles.sumBox} onMouseEnter={playHoverSound}>
              <span style={styles.sumVal}>{coins}</span>
              <span style={styles.sumLabel}>COINS</span>
            </div>
            <div style={styles.sumBox} onMouseEnter={playHoverSound}>
              <span style={{ ...styles.sumVal, color: '#FF5722' }}>{streak}d</span>
              <span style={styles.sumLabel}>STREAK</span>
            </div>
          </div>

          {/* Level Progress */}
          <div style={styles.xpSection}>
            <div style={styles.xpLabelRow}>
              <span>XP: {xp}</span>
              <span>{xpNeededForNext} XP to next level</span>
            </div>
            <div style={styles.xpBarContainer}>
              <div style={{ ...styles.xpBarFill, width: `${xp % 100}%` }}></div>
            </div>
          </div>

          {/* Specialization Class */}
          <div style={styles.specBox}>
            <span style={styles.specLabel}>SPECIALIZATION CLASS:</span>
            <span style={{ ...styles.specVal, color: classType ? 'var(--accent-color)' : 'var(--text-secondary)' }}>
              {classType || 'No Class Selected'}
            </span>
            {!classType && (
              <button 
                className="game-btn game-btn-primary" 
                style={styles.treeBtn}
                onClick={() => setGame('career-tower')}
              >
                Choose Class
              </button>
            )}
          </div>

          {/* Academic Profile (Futuristic ID Card Style) */}
          <div style={styles.idCardContainer}>
            <div style={styles.idCardHeader}>
              <span style={styles.idCardLogo}>🎓 METROPOLIS STUDENT ID</span>
              <span style={styles.idCardVerified}>VERIFIED</span>
            </div>
            
            <div style={styles.idCardBody}>
              <div style={styles.idCardInfo}>
                <div style={styles.idCardField}>
                  <span style={styles.idCardLabel}>STUDENT NAME</span>
                  <span style={styles.idCardValue}>{name}</span>
                </div>
                <div style={styles.idCardField}>
                  <span style={styles.idCardLabel}>EMAIL ADDRESS</span>
                  <span style={{ ...styles.idCardValue, color: 'var(--accent-secondary)' }}>{email || 'N/A'}</span>
                </div>
                <div style={styles.idCardField}>
                  <span style={styles.idCardLabel}>COLLEGE / UNIVERSITY</span>
                  <span style={styles.idCardValue}>{collegeName || 'N/A'}</span>
                </div>
                <div style={styles.idCardField}>
                  <span style={styles.idCardLabel}>ACADEMIC DEPT / BRANCH</span>
                  <span style={styles.idCardValue}>{department || 'N/A'}</span>
                </div>
                <div style={styles.idCardRow}>
                  <div style={styles.idCardField}>
                    <span style={styles.idCardLabel}>ROLL NUMBER / STUDENT ID</span>
                    <span style={{ ...styles.idCardValue, fontFamily: 'var(--font-mono)' }}>{rollNumber || 'N/A'}</span>
                  </div>
                  <div style={styles.idCardField}>
                    <span style={styles.idCardLabel}>GRAD YEAR</span>
                    <span style={{ ...styles.idCardValue, color: 'var(--accent-color)' }}>{getAcademicYear(gradYear)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sci-fi Barcode / Systems Badge */}
            <div style={styles.idCardFooter}>
              <div style={styles.barcode}>
                <div style={{ width: '2px', height: '14px', backgroundColor: 'var(--accent-secondary)' }}></div>
                <div style={{ width: '4px', height: '14px', backgroundColor: 'var(--accent-secondary)' }}></div>
                <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--accent-secondary)' }}></div>
                <div style={{ width: '3px', height: '14px', backgroundColor: 'var(--accent-secondary)' }}></div>
                <div style={{ width: '2px', height: '14px', backgroundColor: 'var(--accent-secondary)' }}></div>
                <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--accent-secondary)' }}></div>
                <div style={{ width: '5px', height: '14px', backgroundColor: 'var(--accent-secondary)' }}></div>
                <div style={{ width: '2px', height: '14px', backgroundColor: 'var(--accent-secondary)' }}></div>
                <div style={{ width: '3px', height: '14px', backgroundColor: 'var(--accent-secondary)' }}></div>
                <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--accent-secondary)' }}></div>
              </div>
              <span style={styles.barcodeText}>SYSTEMS ID: {rollNumber || '000000'}</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Game Stats & Badges */}
        <div style={styles.statsPanel}>
          {/* Section 1: Mini-game Metrics */}
          <div className="game-card" style={styles.metricsCard}>
            <h3 style={styles.panelTitle}>⚡ PLACEMENT SECTOR STATS</h3>
            <div style={styles.metricsGrid}>
              <div style={styles.metricRow}>
                <span style={styles.mName}>🏦 Data Bank Cases Cracked:</span>
                <span style={styles.mVal}>{heistLevelsCompleted} Cases</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.mName}>⚡ Apti-Rush Highscore:</span>
                <span style={styles.mVal}>{aptiHighScore} Pts</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.mName}>🌳 Skill Tree Unlocked:</span>
                <span style={styles.mVal}>{unlockedSkills.length} Nodes</span>
              </div>
            </div>
          </div>

          {/* Section 2: Badges Achievements */}
          <div className="game-card" style={styles.achievementsCard}>
            <h3 style={styles.panelTitle}>🏆 HACKER ACHIEVEMENTS</h3>
            <div style={styles.achievementsGrid}>
              {ACHIEVEMENTS.map((ach) => {
                const isUnlocked = ach.check(store);
                const AchIcon = ach.icon;
                
                return (
                  <div 
                    key={ach.id} 
                    style={{ 
                      ...styles.badgeCard, 
                      borderColor: isUnlocked ? ach.color : 'rgba(255,255,255,0.03)',
                      opacity: isUnlocked ? 1 : 0.35,
                      boxShadow: isUnlocked ? `0 0 10px rgba(${hexToRgb(ach.color)}, 0.2)` : 'none'
                    }}
                    className="game-card"
                    onMouseEnter={playHoverSound}
                  >
                    <div style={{ ...styles.badgeIconBg, backgroundColor: isUnlocked ? `rgba(${hexToRgb(ach.color)}, 0.1)` : 'rgba(0,0,0,0.2)' }}>
                      <AchIcon size={24} color={isUnlocked ? ach.color : '#4B5563'} />
                    </div>
                    <div>
                      <h4 style={{ ...styles.badgeTitle, color: isUnlocked ? ach.color : 'var(--text-primary)' }}>
                        {ach.title}
                      </h4>
                      <p style={styles.badgeDesc}>{ach.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Third Column: Global Leaderboard & Clans */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Leaderboard Card */}
          <div className="game-card" style={styles.leaderboardCard}>
            <h3 style={styles.panelTitle}>🏆 CAMPUS LEADERBOARD</h3>
            <div style={styles.leaderboardList}>
              {leaderboard.slice(0, leaderboardExpanded ? leaderboard.length : 3).map((player, idx) => {
                const isTop = idx === 0;
                return (
                  <div 
                    key={idx} 
                    style={{
                      ...styles.leaderboardRow,
                      background: isTop ? 'linear-gradient(90deg, rgba(234, 179, 8, 0.18) 0%, rgba(234, 179, 8, 0.04) 100%)' : 'rgba(255, 255, 255, 0.02)',
                      borderLeft: isTop ? '3px solid #EAB308' : 'none'
                    }} 
                    onMouseEnter={playHoverSound}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ ...styles.rankNum, color: isTop ? '#FDE047' : '#9CA3AF' }}>{isTop ? '👑 🥇' : idx + 1}</span>
                      <span style={{ fontSize: '1.25rem' }}>{renderAvatar(player.avatar)}</span>
                      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                        <span style={{ ...styles.leaderName, color: isTop ? '#FDE047' : '#FFF', fontWeight: isTop ? 'bold' : '600' }}>
                          {player.name} {isTop && <span style={{ fontSize: '0.65rem', color: '#EAB308', marginLeft: '4px' }}>(TOP XP)</span>}
                        </span>
                        <span style={styles.leaderSub}>{player.classType || 'SDE Recruit'}</span>
                      </div>
                    </div>
                    <span style={{ ...styles.leaderXp, color: isTop ? '#FDE047' : 'var(--accent-color)', fontWeight: 'bold' }}>{player.xp} XP</span>
                  </div>
                );
              })}
            </div>
            {leaderboard.length > 3 && (
              <button 
                style={styles.viewStandingsBtn} 
                onClick={() => setLeaderboardExpanded(!leaderboardExpanded)}
              >
                {leaderboardExpanded ? 'Show Top 3 Standings ▲' : '🏆 View Overall Standings ▼'}
              </button>
            )}
          </div>

          {/* Clans / Developer Guilds Card */}
          <div className="game-card" style={styles.clanCard}>
            <h3 style={styles.panelTitle}>🌐 DEVELOPER CLANS</h3>
            
            {!clan ? (
              // List available clans
              <div style={styles.clanList}>
                <p style={styles.clanSub}>Join a developer clan to compete in collective XP rankings and team up!</p>
                {CLANS.map((clanItem) => (
                  <div key={clanItem.id} style={styles.clanRow} onMouseEnter={playHoverSound}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.5rem' }}>{clanItem.emoji}</span>
                      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                        <span style={styles.clanName}>{clanItem.name}</span>
                        <span style={styles.clanDesc}>{clanItem.desc}</span>
                        <span style={styles.clanMeta}>👥 {clanItem.members.length + 1} members • ⚡ Collective XP: {clanItem.members.reduce((acc, m) => acc + m.xp, 0) + xp}</span>
                      </div>
                    </div>
                    <button 
                      className="game-btn game-btn-primary" 
                      style={styles.joinClanBtn}
                      onClick={() => {
                        setClan(clanItem.id);
                        playHoverSound();
                      }}
                    >
                      Join
                    </button>
                  </div>
                ))}
              </div>
            ) : (() => {
              const activeClan = CLANS.find(c => c.id === clan) || CLANS[0];
              const displayMembers = [...activeClan.members];
              if (!displayMembers.some(m => m.name === name || m.name === `${name} (You)`)) {
                displayMembers.push({ name: `${name} (You)`, rank: rank, xp: xp, avatar: avatar });
              }
              displayMembers.sort((a, b) => b.xp - a.xp);

              return (
                <div style={styles.activeClanContainer}>
                  <div style={styles.activeClanHeader}>
                    <span style={{ fontSize: '1.5rem' }}>{activeClan.emoji}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', flex: 1, marginLeft: '10px' }}>
                      <span style={styles.activeClanName}>{activeClan.name}</span>
                      <span style={styles.activeClanDesc}>{activeClan.desc}</span>
                    </div>
                  </div>
                  
                  <div style={styles.memberSectionTitle}>CLAN ROSTER</div>
                  <div style={styles.clanRoster}>
                    {displayMembers.map((member, idx) => (
                      <div key={idx} style={{ 
                        ...styles.rosterRow, 
                        borderLeft: member.name.includes('(You)') ? '3px solid var(--accent-color)' : '1px solid rgba(255,255,255,0.03)' 
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={styles.rosterRankNum}>{idx + 1}</span>
                          <span style={{ fontSize: '1rem' }}>{renderAvatar(member.avatar, '20px')}</span>
                          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                            <span style={{ 
                              ...styles.rosterName, 
                              color: member.name.includes('(You)') ? 'var(--accent-color)' : '#FFF' 
                            }}>{member.name}</span>
                            <span style={styles.rosterSub}>{member.rank}</span>
                          </div>
                        </div>
                        <span style={styles.rosterXp}>{member.xp} XP</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    className="game-btn" 
                    style={styles.leaveClanBtn}
                    onClick={() => {
                      setClan('');
                      playHoverSound();
                    }}
                  >
                    Leave Clan
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
    : '255, 255, 255';
}

const styles = {
  container: {
    padding: '2rem 1.5rem',
    minHeight: 'calc(100vh - 70px)',
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
    boxSizing: 'border-box',
    overflowX: 'hidden'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    width: '100%',
    margin: '0 auto',
    alignItems: 'start'
  },
  detailsCard: {
    backgroundColor: 'rgba(19, 23, 34, 0.75)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '2.5rem 1.5rem',
    minHeight: '420px',
  },
  avatarWrapper: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-tertiary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '3px solid var(--accent-color)',
    boxShadow: 'var(--glow-accent)',
    marginBottom: '1rem',
  },
  avatar: {
    fontSize: '3.5rem',
  },
  hackerName: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.5rem',
    fontWeight: '800',
    letterSpacing: '1px',
    marginBottom: '0.25rem',
  },
  rankBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    border: '1px solid rgba(6, 182, 212, 0.3)',
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
    color: 'var(--accent-secondary)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    padding: '3px 10px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: '1.5rem',
  },
  statsSummary: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-around',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    padding: '1rem 0',
    marginBottom: '1.5rem',
  },
  sumBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  sumVal: {
    fontSize: '1.25rem',
    fontWeight: '800',
    fontFamily: 'var(--font-mono)',
  },
  sumLabel: {
    fontSize: '0.65rem',
    color: 'var(--text-secondary)',
    fontWeight: '700',
    fontFamily: 'var(--font-mono)',
  },
  xpSection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '1.5rem',
  },
  xpLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  xpBarContainer: {
    height: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--accent-color), var(--accent-secondary))',
    boxShadow: 'var(--glow-accent)',
  },
  specBox: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.03)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  },
  specLabel: {
    fontSize: '0.7rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-secondary)',
    fontWeight: '700',
  },
  specVal: {
    fontSize: '0.9rem',
    fontWeight: '800',
    letterSpacing: '1px',
    fontFamily: 'var(--font-title)',
  },
  treeBtn: {
    padding: '4px 10px',
    fontSize: '0.7rem',
    marginTop: '4px',
  },
  statsPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    height: '100%',
  },
  metricsCard: {
    backgroundColor: 'rgba(19, 23, 34, 0.75)',
  },
  panelTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '0.9rem',
    color: 'var(--accent-secondary)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '0.5rem',
    marginBottom: '1rem',
    letterSpacing: '1px',
  },
  metricsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  metricRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
  },
  mName: {
    color: 'var(--text-secondary)',
  },
  mVal: {
    fontWeight: '700',
    fontFamily: 'var(--font-mono)',
  },
  achievementsCard: {
    backgroundColor: 'rgba(19, 23, 34, 0.75)',
  },
  achievementsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  badgeCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0.75rem 1rem',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: '1px',
  },
  badgeIconBg: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTitle: {
    fontSize: '0.8rem',
    fontWeight: '700',
  },
  badgeDesc: {
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
    marginTop: '2px',
    lineHeight: '1.3',
  },
  leaderboardCard: {
    backgroundColor: 'rgba(19, 23, 34, 0.75)',
    padding: '1.5rem',
    height: '100%',
    minHeight: '420px',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto'
  },
  viewStandingsBtn: {
    backgroundColor: 'rgba(0, 243, 255, 0.08)',
    border: '1px dashed rgba(0, 243, 255, 0.3)',
    color: '#00F3FF',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '12px',
    width: '100%',
    textAlign: 'center',
    transition: 'all 0.25s ease',
  },
  leaderboardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '0.5rem',
    overflowY: 'auto',
    flex: 1
  },
  leaderboardRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.02)',
    transition: 'all 0.2s ease',
  },
  rankNum: {
    fontSize: '0.75rem',
    fontWeight: 'bold',
    fontFamily: 'var(--font-mono)',
    color: 'var(--accent-color)',
    width: '18px'
  },
  leaderName: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#FFF'
  },
  leaderSub: {
    fontSize: '0.65rem',
    color: 'var(--text-secondary)'
  },
  leaderXp: {
    fontSize: '0.85rem',
    fontWeight: '800',
    fontFamily: 'var(--font-mono)',
    color: 'var(--accent-secondary)'
  },
  idCardContainer: {
    marginTop: '1.25rem',
    width: '100%',
    backgroundColor: 'rgba(12, 16, 26, 0.65)',
    border: '1px solid rgba(0, 243, 255, 0.25)',
    borderRadius: '12px',
    padding: '0.75rem 1rem',
    boxShadow: '0 0 15px rgba(0, 243, 255, 0.08), inset 0 0 10px rgba(0, 243, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    position: 'relative',
    overflow: 'hidden',
  },
  idCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px dashed rgba(0, 243, 255, 0.2)',
    paddingBottom: '0.5rem',
    marginBottom: '0.6rem',
  },
  idCardLogo: {
    fontSize: '0.65rem',
    fontWeight: '800',
    color: 'var(--accent-secondary)',
    letterSpacing: '0.5px',
    fontFamily: 'var(--font-title)',
  },
  idCardVerified: {
    fontSize: '0.55rem',
    fontWeight: 'bold',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    color: 'var(--success-color)',
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    letterSpacing: '0.5px',
  },
  idCardBody: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: '0.5rem',
  },
  idCardInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  idCardField: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
  },
  idCardLabel: {
    fontSize: '0.55rem',
    color: 'var(--text-secondary)',
    fontWeight: '700',
    letterSpacing: '0.3px',
  },
  idCardValue: {
    fontSize: '0.75rem',
    color: '#FFF',
    fontWeight: '600',
    marginTop: '1px',
    textAlign: 'left',
  },
  idCardRow: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    gap: '1rem',
  },
  idCardFooter: {
    borderTop: '1px dashed rgba(255,255,255,0.06)',
    marginTop: '0.75rem',
    paddingTop: '0.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barcode: {
    display: 'flex',
    gap: '1px',
  },
  barcodeText: {
    fontSize: '0.55rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-secondary)',
    letterSpacing: '0.5px',
  },
  clanCard: {
    backgroundColor: 'rgba(19, 23, 34, 0.75)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '280px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  clanList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '0.5rem',
  },
  clanSub: {
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    textAlign: 'left',
    marginBottom: '0.25rem',
  },
  clanRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: '0.6rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.02)',
    transition: 'all 0.2s ease',
  },
  clanName: {
    fontSize: '0.8rem',
    fontWeight: '800',
    color: '#FFF',
  },
  clanDesc: {
    fontSize: '0.65rem',
    color: 'var(--text-secondary)',
    marginTop: '1px',
  },
  clanMeta: {
    fontSize: '0.6rem',
    color: 'var(--accent-secondary)',
    marginTop: '3px',
    fontWeight: '600',
  },
  joinClanBtn: {
    padding: '4px 12px',
    fontSize: '0.7rem',
    backgroundColor: 'rgba(0, 243, 255, 0.1)',
    color: 'var(--accent-color)',
    borderColor: 'rgba(0, 243, 255, 0.3)',
  },
  activeClanContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  activeClanHeader: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 243, 255, 0.03)',
    border: '1px solid rgba(0, 243, 255, 0.15)',
    padding: '0.6rem 0.8rem',
    borderRadius: '10px',
  },
  activeClanName: {
    fontSize: '0.95rem',
    fontWeight: '800',
    color: 'var(--accent-color)',
    textShadow: '0 0 5px rgba(0,243,255,0.3)',
  },
  activeClanDesc: {
    fontSize: '0.65rem',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  memberSectionTitle: {
    fontSize: '0.65rem',
    fontWeight: 'bold',
    color: 'var(--text-secondary)',
    textAlign: 'left',
    letterSpacing: '0.5px',
    marginTop: '0.25rem',
  },
  clanRoster: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    maxHeight: '180px',
    overflowY: 'auto',
    paddingRight: '4px',
  },
  rosterRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: '0.4rem 0.6rem',
    borderRadius: '6px',
    transition: 'all 0.15s ease',
  },
  rosterRankNum: {
    fontSize: '0.7rem',
    fontWeight: 'bold',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-secondary)',
    width: '14px',
  },
  rosterName: {
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  rosterSub: {
    fontSize: '0.6rem',
    color: 'var(--text-secondary)',
  },
  rosterXp: {
    fontSize: '0.75rem',
    fontWeight: 'bold',
    fontFamily: 'var(--font-mono)',
    color: 'var(--accent-secondary)',
  },
  leaveClanBtn: {
    padding: '5px 0',
    fontSize: '0.7rem',
    backgroundColor: 'transparent',
    color: 'var(--danger-color)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginTop: '0.5rem',
    width: '100%',
  }
};
