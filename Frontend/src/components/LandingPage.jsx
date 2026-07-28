import React, { useState } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { Terminal, Cpu, ShieldAlert, Sparkles, LogIn, Lock, Mail, User, ShieldCheck, Info, BookOpen, Compass, GraduationCap, Building2, FileText, Eye, EyeOff } from 'lucide-react';

const AVATAR_GROUPS = [
  { category: '🤖 AI & Tech', list: ['🤖', '🦾', '🧠', '👾', '📡'] },
  { category: '🕶️ Hacker Security', list: ['🕶️', '🕵️', '🎭', '🛡️', '🔑'] },
  { category: '🧙 Sages & Wizards', list: ['🧙', '🧙‍♀️', '🔮', '🦁', '🦊'] },
  { category: '🚀 Space & Gears', list: ['💻', '🚀', '🛰️', '⚛️', '⚙️'] }
];
const AVATARS = AVATAR_GROUPS.flatMap(g => g.list);

export default function LandingPage() {
  const { setGame } = usePlayerStore();
  
  // Navigation & Modal state
  const [modalActive, setModalActive] = useState(false);
  const [authMode, setAuthMode] = useState('signup'); // 'signup', 'signin'
  const [signupStep, setSignupStep] = useState(1); // 1: credentials, 2: college details, 3: profile details
  
  // Auth Form State
  const [emailInput, setEmailInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🚀');

  // College Onboarding Form State
  const [collegeNameInput, setCollegeNameInput] = useState('');
  const [departmentInput, setDepartmentInput] = useState('');
  const [gradYearInput, setGradYearInput] = useState('');
  const [rollNumberInput, setRollNumberInput] = useState('');

  // ID Verification & Forgot Password State
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [verifyRollNumberInput, setVerifyRollNumberInput] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetRollNumber, setResetRollNumber] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showResetPass, setShowResetPass] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resetCodeInput, setResetCodeInput] = useState('');

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    if (!emailInput.trim() || !passInput.trim()) {
      alert("⚠️ Email and password are required!");
      return;
    }

    if (authMode === 'signup') {
      setSignupStep(2); // Move to College Details
    } else {
      // Sign In: fetch token from server
      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailInput, password: passInput })
        });
        const data = await response.json();
        
        if (data.success) {
          if (data.verificationRequired) {
            setVerificationRequired(true);
            return;
          }
          localStorage.setItem('token', data.token);
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
            profileLoaded: true,
            activeGame: null // Enter the Hub
          });
        } else {
          alert(`⚠️ Login Failed: ${data.message}`);
        }
      } catch (error) {
        alert("🚨 Connection failed! Please make sure your Node.js backend is running on port 5000.");
      }
    }
  };

  const handleCollegeDetailsSubmit = (e) => {
    e.preventDefault();
    if (!collegeNameInput.trim() || !departmentInput.trim() || !gradYearInput.trim() || !rollNumberInput.trim()) {
      alert("⚠️ All college information fields are required!");
      return;
    }
    setSignupStep(3); // Move to Profile setup
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      alert("⚠️ Handle name is required!");
      return;
    }

    // Sign Up: Register new student
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: emailInput, 
          password: passInput, 
          name: nameInput, 
          avatar: selectedAvatar,
          collegeName: collegeNameInput,
          department: departmentInput,
          gradYear: parseInt(gradYearInput, 10),
          rollNumber: rollNumberInput
        })
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
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
          profileLoaded: true,
          activeGame: null // Enter the Hub
        });
      } else {
        alert(`⚠️ Registration Failed: ${data.message || data.error || 'Unknown server error'}`);
      }
    } catch (error) {
      alert("🚨 Connection failed! Please make sure your Node.js backend is running on port 5000.");
    }
  };

  // Handle secondary ID Verification
  const handleVerifyIdSubmit = async (e) => {
    e.preventDefault();
    if (!verifyRollNumberInput.trim()) {
      alert("⚠️ Roll Number is required!");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, rollNumber: verifyRollNumberInput })
      });
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
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
          profileLoaded: true,
          activeGame: null // Enter the Hub
        });
        setVerificationRequired(false);
        setVerifyRollNumberInput('');
        setModalActive(false);
      } else {
        alert(`⚠️ Verification Failed: ${data.message}`);
      }
    } catch (error) {
      alert("🚨 Connection failed! Please make sure your Node.js backend is running on port 5000.");
    }
  };

  // Handle password reset request
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim() || !resetRollNumber.trim()) {
      alert("⚠️ Email and Student ID / Roll Number are required!");
      return;
    }

    if (otpSent && (!resetCodeInput.trim() || !resetNewPassword.trim())) {
      alert("⚠️ Verification Code and New Password are required!");
      return;
    }

    try {
      const payload = {
        email: resetEmail,
        rollNumber: resetRollNumber
      };

      if (otpSent) {
        payload.code = resetCodeInput;
        payload.newPassword = resetNewPassword;
      }

      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (data.success) {
        if (data.otpSent) {
          setOtpSent(true);
          alert(data.message || "✅ Verification code sent to your email!");
        } else {
          alert("✅ Credentials reset successful! You can now log in with your new password.");
          setShowForgotPassword(false);
          setOtpSent(false);
          setResetEmail('');
          setResetRollNumber('');
          setResetCodeInput('');
          setResetNewPassword('');
        }
      } else {
        alert(`⚠️ Reset Failed: ${data.message}`);
      }
    } catch (error) {
      alert("🚨 Connection failed! Please make sure your Node.js backend is running on port 5000.");
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={styles.container}>
      {/* 1. TOP NAVBAR */}
      <nav style={styles.navbar}>
        <div style={styles.logoRow}>
          <span style={styles.logoIcon}>🎮</span>
          <span style={styles.logoText}>Placement Quest</span>
        </div>
        <div style={styles.navLinks}>
          <button style={styles.navLinkBtn} onClick={() => scrollToSection('features')}>Features</button>
          <button style={styles.navLinkBtn} onClick={() => scrollToSection('about')}>About Us</button>
          <button style={styles.navLinkBtn} onClick={() => scrollToSection('how-it-works')}>How It Works</button>
        </div>
        <div style={styles.navActions}>
          <button style={styles.loginBtn} onClick={() => { setAuthMode('signin'); setSignupStep(1); setModalActive(true); }}>
            Sign In
          </button>
          <button className="game-btn game-btn-primary" style={styles.signupBtn} onClick={() => { setAuthMode('signup'); setSignupStep(1); setModalActive(true); }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section style={styles.heroSection}>
        <div style={styles.heroTextContainer}>
          <div style={styles.heroBadge}>✨ Gamified Learning Platform</div>
          <h1 style={styles.heroHeading}>Master Engineering Placements Through Gameplay</h1>
          <p style={styles.heroSubheading}>
            Bridge the gap between academic theory and real-world tech recruitment. Fight DSA data monsters, hack SQL databases, build SaaS startups, and ace interviews in a virtual city.
          </p>
          <div style={styles.heroCtaRow}>
            <button className="game-btn game-btn-primary" style={styles.heroPrimaryBtn} onClick={() => { setAuthMode('signup'); setSignupStep(1); setModalActive(true); }}>
              Initialize Profile Free
            </button>
            <button className="game-btn" style={styles.heroSecondaryBtn} onClick={() => scrollToSection('about')}>
              Learn More
            </button>
          </div>
        </div>
        <div style={styles.heroImageContainer}>
          <div style={styles.mockCityCard} className="game-card">
            <h3 style={styles.mockTitle}>🏙️ Silicon Metropolis</h3>
            <p style={styles.mockDesc}>Your overarching career dashboard. Unlock sectors as you gain placement points.</p>
            <div style={styles.mockProgressRow}>
              <span>Status: Fresher</span>
              <span>XP: 0/100</span>
            </div>
            <div style={styles.mockProgressBar}>
              <div style={styles.mockProgressBarFill}></div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTOR */}
      <section id="features" style={styles.featuresSection}>
        <h2 style={styles.sectionHeading}>Explore Training Districts</h2>
        <p style={styles.sectionDesc}>Each sector is a distinct, themed mini-game designed to test core developer competencies.</p>
        
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard} className="game-card">
            <Terminal size={32} color="var(--accent-color)" />
            <h3 style={styles.fTitle}>Data Bank (SQL Heist)</h3>
            <p style={styles.fText}>Inspect employee access tables and write optimized SQL queries to trace hackers and bypass firewalls.</p>
          </div>
          <div style={styles.featureCard} className="game-card">
            <ShieldCheck size={32} color="var(--accent-color)" />
            <h3 style={styles.fTitle}>DSA Arena (Algo Battles)</h3>
            <p style={styles.fText}>Vaporize enraging data monsters (Unsorted Array Beasts) by selecting the most optimal space/time complexity attacks.</p>
          </div>
          <div style={styles.featureCard} className="game-card">
            <Cpu size={32} color="var(--accent-color)" />
            <h3 style={styles.fTitle}>Startup Garage (Tycoon)</h3>
            <p style={styles.fText}>Allocate your weekly 40-hour runway to code SaaS features, market on social media, and raise venture capital funding.</p>
          </div>
        </div>
      </section>

      {/* 4. ABOUT US SECTION */}
      <section id="about" style={styles.aboutSection}>
        <div style={styles.aboutContainer} className="game-card">
          <div style={styles.aboutTextContent}>
            <div style={styles.aboutBadge}>
              <Info size={14} color="var(--accent-color)" />
              <span>OUR MISSION</span>
            </div>
            <h2 style={styles.aboutHeading}>Built for Students, Guided by Gamification</h2>
            <p style={styles.aboutText}>
              Traditional test prep apps feel like taking an exam. We believe learning should feel like playing a game. 
            </p>
            <p style={styles.aboutText}>
              **Placement Quest** was founded to help engineering graduates learn crucial skills (DSA, SQL queries, system architectures, and corporate soft-skills) through immersive themes, daily streaks, enraging boss combat, and tycoon simulators.
            </p>
          </div>
          <div style={styles.aboutVisualContainer}>
            <div style={styles.aboutStatCard}>
              <span style={styles.aStatNum}>10+</span>
              <span style={styles.aStatLabel}>Themed Sectors</span>
            </div>
            <div style={styles.aboutStatCard}>
              <span style={styles.aStatNum}>100%</span>
              <span style={styles.aStatLabel}>Gamified Prep</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" style={styles.howSection}>
        <h2 style={styles.sectionHeading}>Your Path to CTO Legend</h2>
        <div style={styles.howGrid}>
          <div style={styles.howStep}>
            <div style={styles.stepNum}>1</div>
            <h4>Create Hacker Profile</h4>
            <p style={styles.stepDesc}>Register and select your custom system avatar to initialize your neural connection link.</p>
          </div>
          <div style={styles.howStep}>
            <div style={styles.stepNum}>2</div>
            <h4>Earn Placement Points</h4>
            <p style={styles.stepDesc}>Solve SQL heists, fight DSA array behemoths, and answer quants logic in under 10 seconds.</p>
          </div>
          <div style={styles.howStep}>
            <div style={styles.stepNum}>3</div>
            <h4>Level Up Career Tree</h4>
            <p style={styles.stepDesc}>Unlock starting developer classes (Frontend Mage, Backend Guardian) and export your mastery resume.</p>
          </div>
        </div>
      </section>

      {/* 6. MODAL DIALOG ONBOARDING FLOW */}
      {modalActive && (
        <div style={styles.modalOverlay}>
          <div className="game-card" style={styles.modalCard}>
            <button style={styles.closeBtn} onClick={() => {
              setModalActive(false);
              setVerificationRequired(false);
              setShowForgotPassword(false);
            }}>×</button>

            {verificationRequired ? (
              <div>
                <h3 style={{ ...styles.modalTitle, color: 'var(--accent-color)', textShadow: 'var(--glow-accent)' }}>🔒 ID VERIFICATION GATE</h3>
                <p style={{ ...styles.modalSub, fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', textAlign: 'left', lineHeight: '1.4' }}>
                  A secondary verification check is active for your account. Please enter your registered Student ID / Roll Number to complete the connection sequence.
                </p>
                <form onSubmit={handleVerifyIdSubmit} style={styles.form}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>STUDENT ID / ROLL NUMBER</label>
                    <div style={styles.inputWrapper}>
                      <FileText size={16} color="var(--text-secondary)" />
                      <input 
                        type="text" 
                        placeholder="e.g. Roll Number / Student ID"
                        value={verifyRollNumberInput}
                        onChange={(e) => setVerifyRollNumberInput(e.target.value)}
                        style={styles.input}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="game-btn game-btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}>
                    Verify & Enter Hub
                  </button>
                  <button 
                    type="button" 
                    className="game-btn" 
                    style={{ width: '100%', marginTop: '0.5rem', borderColor: 'var(--danger-color)', color: 'var(--danger-color)', padding: '0.6rem' }}
                    onClick={() => {
                      setVerificationRequired(false);
                      setVerifyRollNumberInput('');
                    }}
                  >
                    Cancel
                  </button>
                </form>
              </div>
            ) : showForgotPassword ? (
              <div>
                <h3 style={{ ...styles.modalTitle, color: 'var(--accent-secondary)' }}>🔑 RESET PASSWORD</h3>
                <p style={{ ...styles.modalSub, fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', textAlign: 'left', lineHeight: '1.4' }}>
                  Reset your system password by validating your registered email and Student ID / Roll Number.
                </p>
                <form onSubmit={handleForgotPasswordSubmit} style={styles.form}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>REGISTERED EMAIL</label>
                    <div style={{ ...styles.inputWrapper, opacity: otpSent ? 0.6 : 1 }}>
                      <Mail size={16} color="var(--text-secondary)" />
                      <input 
                        type="email" 
                        placeholder="e.g. developer@quest.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        style={styles.input}
                        required
                        disabled={otpSent}
                      />
                    </div>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>STUDENT ID / ROLL NUMBER</label>
                    <div style={{ ...styles.inputWrapper, opacity: otpSent ? 0.6 : 1 }}>
                      <FileText size={16} color="var(--text-secondary)" />
                      <input 
                        type="text" 
                        placeholder="e.g. Roll Number"
                        value={resetRollNumber}
                        onChange={(e) => setResetRollNumber(e.target.value)}
                        style={styles.input}
                        required
                        disabled={otpSent}
                      />
                    </div>
                  </div>

                  {otpSent && (
                    <>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>VERIFICATION CODE (OTP)</label>
                        <div style={styles.inputWrapper}>
                          <Lock size={16} color="var(--text-secondary)" />
                          <input 
                            type="text" 
                            placeholder="Enter 6-digit verification code"
                            value={resetCodeInput}
                            onChange={(e) => setResetCodeInput(e.target.value)}
                            style={styles.input}
                            required
                          />
                        </div>
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>NEW PASSWORD</label>
                        <div style={styles.inputWrapper}>
                          <Lock size={16} color="var(--text-secondary)" />
                          <input 
                            type={showResetPass ? "text" : "password"} 
                            placeholder="Enter new secure password"
                            value={resetNewPassword}
                            onChange={(e) => setResetNewPassword(e.target.value)}
                            style={styles.input}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowResetPass(!showResetPass)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '4px',
                              color: 'var(--text-secondary)',
                              outline: 'none',
                            }}
                          >
                            {showResetPass ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  <button type="submit" className="game-btn game-btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}>
                    {otpSent ? '🔑 Reset Password' : '⚡ Send Verification Code'}
                  </button>
                  <button 
                    type="button" 
                    className="game-btn" 
                    style={{ width: '100%', marginTop: '0.5rem', padding: '0.6rem' }}
                    onClick={() => {
                      setShowForgotPassword(false);
                      setOtpSent(false);
                      setResetEmail('');
                      setResetRollNumber('');
                      setResetCodeInput('');
                      setResetNewPassword('');
                    }}
                  >
                    Back to Sign In
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <div style={styles.tabsRow}>
                  <button 
                    type="button"
                    style={{ ...styles.tabBtn, borderBottom: authMode === 'signup' ? '2px solid var(--accent-color)' : 'none', color: authMode === 'signup' ? 'var(--accent-color)' : 'var(--text-secondary)' }}
                    onClick={() => setAuthMode('signup')}
                  >
                    Register Account
                  </button>
                  <button 
                    type="button"
                    style={{ ...styles.tabBtn, borderBottom: authMode === 'signin' ? '2px solid var(--accent-color)' : 'none', color: authMode === 'signin' ? 'var(--accent-color)' : 'var(--text-secondary)' }}
                    onClick={() => setAuthMode('signin')}
                  >
                    Sign In
                  </button>
                </div>

                {/* Step 1: Basic Email & Password */}
                {signupStep === 1 && (
                  <form onSubmit={handleCredentialsSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>EMAIL ADDRESS</label>
                      <div style={styles.inputWrapper}>
                        <Mail size={16} color="var(--text-secondary)" />
                        <input 
                          type="email" 
                          placeholder="e.g. developer@quest.com"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          style={styles.input}
                          required
                        />
                      </div>
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>PASSWORD</label>
                      <div style={styles.inputWrapper}>
                        <Lock size={16} color="var(--text-secondary)" />
                        <input 
                          type={showPass ? "text" : "password"} 
                          placeholder="••••••••"
                          value={passInput}
                          onChange={(e) => setPassInput(e.target.value)}
                          style={styles.input}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px',
                            color: 'var(--text-secondary)',
                            outline: 'none',
                          }}
                        >
                          {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {authMode === 'signin' && (
                      <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                        <button 
                          type="button" 
                          style={{ background: 'none', border: 'none', color: 'var(--accent-secondary)', fontSize: '0.75rem', cursor: 'pointer', outline: 'none' }}
                          onClick={() => {
                            setShowForgotPassword(true);
                            setResetEmail(emailInput);
                          }}
                        >
                          Forgot Password?
                        </button>
                      </div>
                    )}

                    <button type="submit" className="game-btn game-btn-primary" style={styles.submitBtn}>
                      {authMode === 'signup' ? 'Continue Setup' : 'Log In'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                      <button 
                        type="button" 
                        style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontSize: '0.8rem', cursor: 'pointer', outline: 'none' }}
                        onClick={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')}
                      >
                        {authMode === 'signup' ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Step 2: College Details Onboarding (Registration Only) */}
            {authMode === 'signup' && signupStep === 2 && (
              <form onSubmit={handleCollegeDetailsSubmit} style={styles.form}>
                <div style={styles.onboardHeading}>
                  <h3>🎓 Academic Verification</h3>
                  <p>Register your college details for institutional scoring.</p>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>COLLEGE / UNIVERSITY</label>
                  <div style={styles.inputWrapper}>
                    <Building2 size={16} color="var(--text-secondary)" />
                    <input 
                      type="text" 
                      placeholder="e.g. Stanford University" 
                      value={collegeNameInput}
                      onChange={(e) => setCollegeNameInput(e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>DEPARTMENT / BRANCH</label>
                  <div style={styles.inputWrapper}>
                    <GraduationCap size={16} color="var(--text-secondary)" />
                    <input 
                      type="text" 
                      placeholder="e.g. Computer Science" 
                      value={departmentInput}
                      onChange={(e) => setDepartmentInput(e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1rem' }}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>GRAD YEAR</label>
                    <div style={styles.inputWrapper}>
                      <input 
                        type="number" 
                        placeholder="2027" 
                        value={gradYearInput}
                        onChange={(e) => setGradYearInput(e.target.value)}
                        style={styles.input}
                        required
                      />
                    </div>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>STUDENT ID / ROLL NO</label>
                    <div style={styles.inputWrapper}>
                      <input 
                        type="text" 
                        placeholder="e.g. CS-9081" 
                        value={rollNumberInput}
                        onChange={(e) => setRollNumberInput(e.target.value)}
                        style={styles.input}
                        required
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="game-btn game-btn-primary" style={styles.submitBtn}>
                  Verify & Proceed
                </button>
                <button type="button" style={styles.backBtn} onClick={() => setSignupStep(1)}>
                  ← Back to Credentials
                </button>
              </form>
            )}

            {/* Step 3: Avatar & Display Handle Selection */}
            {authMode === 'signup' && signupStep === 3 && (
              <form onSubmit={handleProfileSubmit} style={styles.form}>
                <div style={styles.onboardHeading}>
                  <h3>🛠️ Setup Character Module</h3>
                  <p>Choose your handle and categorized system avatar.</p>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>HACKER HANDLE (NAME)</label>
                  <div style={styles.inputWrapper}>
                    <User size={16} color="var(--text-secondary)" />
                    <input 
                      type="text" 
                      placeholder="e.g. CodeSlayer" 
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>

                {/* Categorized Avatar Groups */}
                <div style={styles.inputGroup}>
                  <label style={styles.label}>CHOOSE SYSTEM AVATAR</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
                    {AVATAR_GROUPS.map((group) => (
                      <div key={group.category} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--accent-color)', letterSpacing: '0.5px' }}>{group.category}</span>
                        <div style={styles.avatarGrid}>
                          {group.list.map((av) => (
                            <button
                              key={av}
                              type="button"
                              style={{ 
                                ...styles.avatarBtn, 
                                borderColor: selectedAvatar === av ? 'var(--accent-color)' : 'var(--border-color)',
                                backgroundColor: selectedAvatar === av ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-tertiary)'
                              }}
                              onClick={() => setSelectedAvatar(av)}
                            >
                              {av}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="game-btn game-btn-primary" style={styles.submitBtn}>
                  Create Profile & Enter Grid
                </button>
                <button type="button" style={styles.backBtn} onClick={() => setSignupStep(2)}>
                  ← Back to College Details
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    minHeight: '100vh',
    width: '100vw',
    fontFamily: 'var(--font-body)',
    overflowY: 'auto',
  },
  navbar: {
    height: '80px',
    backgroundColor: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-color)',
    padding: '0 4rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoIcon: {
    fontSize: '1.5rem',
  },
  logoText: {
    fontWeight: '800',
    fontSize: '1.25rem',
    color: 'var(--text-primary)',
    letterSpacing: '0.5px',
  },
  navLinks: {
    display: 'flex',
    gap: '2.5rem',
  },
  navLinkBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  loginBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '0.5rem 1rem',
  },
  signupBtn: {
    padding: '0.6rem 1.2rem',
    fontSize: '0.8rem',
  },
  heroSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '6rem 4rem',
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '4rem',
    alignItems: 'center',
  },
  heroTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '1.5rem',
  },
  heroBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    border: '1px solid rgba(99, 102, 241, 0.15)',
    color: 'var(--accent-color)',
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '6px 14px',
    borderRadius: '9999px',
  },
  heroHeading: {
    fontSize: '3.25rem',
    fontWeight: '800',
    lineHeight: '1.15',
    color: 'var(--text-primary)',
  },
  heroSubheading: {
    fontSize: '1.05rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
  },
  heroCtaRow: {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  heroPrimaryBtn: {
    padding: '0.85rem 1.75rem',
    fontSize: '0.85rem',
  },
  heroSecondaryBtn: {
    padding: '0.85rem 1.75rem',
    fontSize: '0.85rem',
  },
  heroImageContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  mockCityCard: {
    width: '100%',
    maxWidth: '380px',
    padding: '2rem',
    backgroundColor: '#0D1117', /* Dark mockup inside light landing */
    color: '#F0F6FC',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.05)',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
  },
  mockTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.1rem',
    marginBottom: '4px',
    letterSpacing: '1px',
    color: '#06B6D4',
  },
  mockDesc: {
    fontSize: '0.8rem',
    color: '#8B949E',
    lineHeight: '1.4',
    marginBottom: '1.5rem',
  },
  mockProgressRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    marginBottom: '6px',
    fontFamily: 'var(--font-mono)',
  },
  mockProgressBar: {
    height: '6px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  mockProgressBarFill: {
    height: '100%',
    width: '35%',
    background: 'linear-gradient(90deg, #A855F7, #06B6D4)',
  },
  featuresSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '4rem 4rem 6rem 4rem',
    textAlign: 'center',
  },
  sectionHeading: {
    fontSize: '2rem',
    fontWeight: '800',
    marginBottom: '0.5rem',
  },
  sectionDesc: {
    color: 'var(--text-secondary)',
    fontSize: '1rem',
    marginBottom: '3rem',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '2rem',
  },
  featureCard: {
    padding: '2rem',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    backgroundColor: 'var(--bg-secondary)',
  },
  fTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
  },
  fText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  aboutSection: {
    backgroundColor: 'var(--bg-tertiary)',
    padding: '6rem 4rem',
    width: '100vw',
  },
  aboutContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '3rem',
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr',
    gap: '4rem',
    alignItems: 'center',
    backgroundColor: 'var(--bg-secondary)',
  },
  aboutTextContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  aboutBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--accent-color)',
  },
  aboutHeading: {
    fontSize: '2rem',
    fontWeight: '800',
  },
  aboutText: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
  },
  aboutVisualContainer: {
    display: 'flex',
    gap: '2rem',
  },
  aboutStatCard: {
    flex: '1',
    backgroundColor: 'var(--bg-tertiary)',
    padding: '2rem 1.5rem',
    borderRadius: '12px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  aStatNum: {
    fontSize: '2rem',
    fontWeight: '800',
    color: 'var(--accent-color)',
  },
  aStatLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  howSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '6rem 4rem',
    textAlign: 'center',
  },
  howGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '3rem',
    marginTop: '3rem',
  },
  howStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  stepNum: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    border: '1px solid rgba(99, 102, 241, 0.15)',
    color: 'var(--accent-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '1.2rem',
  },
  stepDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalCard: {
    maxWidth: '420px',
    width: '100%',
    padding: '2.5rem 2rem',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    position: 'relative',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  },
  closeBtn: {
    position: 'absolute',
    top: '1rem',
    right: '1.25rem',
    background: 'none',
    border: 'none',
    fontSize: '1.75rem',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  tabsRow: {
    display: 'flex',
    width: '100%',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.5rem',
    marginBottom: '1.5rem',
  },
  tabBtn: {
    flex: '1',
    background: 'none',
    border: 'none',
    fontFamily: 'var(--font-body)',
    fontSize: '0.85rem',
    fontWeight: '700',
    padding: '0.5rem 0',
    cursor: 'pointer',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  onboardHeading: {
    textAlign: 'center',
    marginBottom: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    textAlign: 'left',
  },
  label: {
    fontSize: '0.7rem',
    fontFamily: 'var(--font-body)',
    color: 'var(--text-secondary)',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.75rem 1rem',
  },
  input: {
    background: 'none',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    width: '100%',
    fontFamily: 'inherit',
  },
  avatarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.5rem',
  },
  avatarBtn: {
    borderWidth: '1px',
    borderRadius: '6px',
    fontSize: '1.25rem',
    padding: '0.4rem',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    color: 'inherit',
  },
  submitBtn: {
    width: '100%',
    padding: '0.85rem',
    fontSize: '0.85rem',
    letterSpacing: '0.5px',
    fontWeight: '700',
  },
  backBtn: {
    padding: '0.4rem',
    fontSize: '0.75rem',
    border: 'none',
    background: 'none',
    boxShadow: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    marginTop: '0.75rem',
    width: '100%',
    textAlign: 'center',
  }
};
