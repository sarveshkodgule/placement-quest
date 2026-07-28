import React from 'react';
import { usePlayerStore } from './store/usePlayerStore';
import Header from './components/Header';
import Hub from './components/Hub';
import LandingPage from './components/LandingPage';
import ProfilePage from './components/ProfilePage';
import LifeArchitect from './games/LifeArchitect';
import SqlHeist from './games/SqlHeist';
import AlgorithmArena from './games/AlgorithmArena';
import AptitudeDistrict from './games/AptitudeDistrict';
import StartupGarage from './games/StartupGarage';
import InternshipDetective from './games/InternshipDetective';
import CodeInspector from './games/CodeInspector';
import InterviewEscapeRoom from './games/InterviewEscapeRoom';
import ResumeBuilderTycoon from './games/ResumeBuilderTycoon';
import CodeSnake from './games/CodeSnake';
import AiMasterChallenge from './games/AiMasterChallenge';

export default function App() {
  const { activeGame, notification } = usePlayerStore();

  const playToastSound = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      // Audio context disabled or requires user interaction first
    }
  };

  React.useEffect(() => {
    if (notification) {
      playToastSound();
    }
  }, [notification]);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && activeGame !== 'landing') {
      usePlayerStore.setState({ activeGame: 'landing' });
    }
  }, [activeGame]);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.student) {
          usePlayerStore.setState({
            name: data.student.name,
            avatar: data.student.avatar,
            rank: data.student.rank,
            xp: data.student.xp,
            coins: data.student.coins,
            streak: data.student.streak,
            classType: data.student.classType,
            unlockedSkills: data.student.unlockedSkills,
            heistLevelsCompleted: data.student.heistLevelsCompleted,
            aptiHighScore: data.student.aptiHighScore,
            email: data.student.email,
            collegeName: data.student.collegeName,
            department: data.student.department,
            gradYear: data.student.gradYear,
            rollNumber: data.student.rollNumber,
            clan: data.student.clan || '',
            profileLoaded: true
          });
        }
      })
      .catch(() => {});
    }
  }, []);

  // Dynamic Theme Class mapping to CSS variables in index.css
  const getThemeClass = () => {
    switch (activeGame) {
      case 'landing':
        return 'theme-landing';
      case 'career-tower':
        return 'theme-career-tower';
      case 'sql-heist':
        return 'theme-sql-heist';
      case 'algo-arena':
        return 'theme-algo-arena';
      case 'apti-rush':
        return 'theme-apti-rush';
      case 'startup-garage':
        return 'theme-startup-garage';
      case 'internship-detective':
        return 'theme-internship-detective';
      case 'code-inspector':
        return 'theme-code-inspector';
      case 'interview-escape':
        return 'theme-interview-escape';
      case 'resume-tycoon':
        return 'theme-resume-tycoon';
      case 'code-snake':
        return 'theme-code-snake';
      case 'ai-master':
        return 'theme-ai-master';
      default:
        return 'theme-hub';
    }
  };

  // State router for mapping active game mode
  const renderGameContent = () => {
    switch (activeGame) {
      case 'landing':
        return <LandingPage />;
      case 'profile':
        return <ProfilePage />;
      case 'career-tower':
        return <LifeArchitect />;
      case 'sql-heist':
        return <SqlHeist />;
      case 'algo-arena':
        return <AlgorithmArena />;
      case 'apti-rush':
        return <AptitudeDistrict />;
      case 'startup-garage':
        return <StartupGarage />;
      case 'internship-detective':
        return <InternshipDetective />;
      case 'code-inspector':
        return <CodeInspector />;
      case 'interview-escape':
        return <InterviewEscapeRoom />;
      case 'resume-tycoon':
        return <ResumeBuilderTycoon />;
      case 'code-snake':
        return <CodeSnake />;
      case 'ai-master':
        return <AiMasterChallenge />;
      default:
        return <Hub />;
    }
  };

  return (
    <div className={getThemeClass()} style={styles.appContainer}>
      {activeGame !== 'landing' && <Header />}
      <main style={styles.mainContent}>
        {renderGameContent()}
      </main>

      {/* Global Gamification Toast Notification Overlay */}
      {notification && (
        <div style={styles.toastContainer} className="slide-in-right">
          <div style={styles.toastIcon}>{notification.icon}</div>
          <div style={styles.toastBody}>
            <span style={styles.toastTitle}>{notification.title}</span>
            <span style={styles.toastMessage}>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  appContainer: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    transition: 'background-color 0.8s ease, color 0.5s ease',
  },
  mainContent: {
    flex: 1,
    overflowY: 'auto',
    position: 'relative',
  },
  toastContainer: {
    position: 'fixed',
    top: '80px',
    right: '24px',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    backgroundColor: 'rgba(19, 23, 34, 0.85)',
    border: '1px solid var(--accent-secondary)',
    borderRadius: '12px',
    boxShadow: 'var(--glow-secondary), 0 8px 32px rgba(0,0,0,0.5)',
    backdropFilter: 'blur(8px)',
  },
  toastIcon: {
    fontSize: '1.5rem',
  },
  toastBody: {
    display: 'flex',
    flexDirection: 'column',
  },
  toastTitle: {
    fontSize: '0.85rem',
    fontWeight: 'bold',
    fontFamily: 'var(--font-title)',
    color: 'var(--accent-secondary)',
    letterSpacing: '0.5px',
  },
  toastMessage: {
    fontSize: '0.75rem',
    color: 'var(--text-primary)',
    marginTop: '2px',
  }
};
