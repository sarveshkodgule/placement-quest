import React, { useEffect, useState } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { 
  Compass, 
  Terminal, 
  ShieldAlert, 
  Zap, 
  Briefcase, 
  Rocket, 
  Trophy, 
  Clock, 
  Star,
  Shield,
  Laptop,
  Database,
  Calendar,
  Gift,
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';

import { jsPDF } from 'jspdf';
import { playCardHover } from '../games/utils/audio';
import DailyRewardModal from './DailyRewardModal';

const HARDCODED_CLANS = [
  { id: 'devops_vanguard', name: 'DevOps Vanguard', emoji: '🛡️', baseXP: 1450 },
  { id: 'recursion_rangers', name: 'Recursion Rangers', emoji: '🌀', baseXP: 1200 },
  { id: 'ai_syndicate', name: 'AI Cyber Syndicate', emoji: '🧠', baseXP: 980 },
  { id: 'frontend_order', name: 'Frontend Order', emoji: '🔮', baseXP: 750 }
];

function renderAvatar(val) {
  if (!val || (typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://')))) {
    return '🧙';
  }
  return val;
}

const BUILDINGS = [
  {
    id: 'career-tower',
    title: 'Career Tower',
    subtitle: 'Skill Tree: Life Architect',
    description: 'Forge your developer career build. Choose starting classes and invest skill points in core languages.',
    icon: Compass,
    color: '#3B82F6', // Blue
    accentClass: 'theme-career-tower',
    difficulty: 'Strategy',
    reputationReward: '+15 Rep'
  },
  {
    id: 'sql-heist',
    title: 'Data Bank',
    subtitle: 'SQL Heist',
    description: 'Hack terminal databases. Write optimized SELECT and JOIN queries to extract files and track culprits.',
    icon: Terminal,
    color: '#39FF14', // Neon Green
    accentClass: 'theme-sql-heist',
    difficulty: 'Medium',
    reputationReward: '+30 Rep'
  },
  {
    id: 'algo-arena',
    title: 'Dsa Arena',
    subtitle: 'Algorithm Arena',
    description: 'Fight data structure monsters and compete in code speed duels using optimal big-O complexity attacks.',
    icon: ShieldAlert,
    color: '#EF4444', // Crimson
    accentClass: 'theme-algo-arena',
    difficulty: 'Hard',
    reputationReward: '+50 Rep'
  },
  {
    id: 'apti-rush',
    title: 'Aptitude District',
    subtitle: 'Apti Rush',
    description: 'Fast-paced WarioWare quants and logic runner. Answer questions in 10s to charge combo multipliers!',
    icon: Zap,
    color: '#FF007F', // Pink
    accentClass: 'theme-apti-rush',
    difficulty: 'Reflexes',
    reputationReward: '+10 Rep'
  },
  {
    id: 'internship-detective',
    title: 'Office Complex',
    subtitle: 'Internship Detective',
    description: 'Survive your first internship. Handle QA friction, code reviews, and Git crises in a visual novel branching story.',
    icon: Briefcase,
    color: '#6366F1', // Indigo
    accentClass: 'theme-internship-detective',
    difficulty: 'Social / Soft Skills',
    reputationReward: '+25 Rep'
  },
  {
    id: 'startup-garage',
    title: 'Startup Garage',
    subtitle: 'Startup Simulator',
    description: 'Bootstrapped tycoon. Allocate hours, hire devs, balance Hype vs. Product Quality, and build a SaaS unicorn.',
    icon: Rocket,
    color: '#F97316', // Orange
    accentClass: 'theme-startup-garage',
    difficulty: 'Management',
    reputationReward: '+40 Rep'
  },
  {
    id: 'code-inspector',
    title: 'PR Review Sector',
    subtitle: 'Code Inspector',
    description: 'Stop software disasters! Scan, debug, and eliminate BUG-0 corrupted code in a live, animated IDE cockpit.',
    icon: Terminal,
    color: '#EC4899', // Fuchsia
    accentClass: 'theme-code-inspector',
    difficulty: 'Critical',
    reputationReward: '+35 Rep'
  },
  {
    id: 'interview-escape',
    title: 'Assessment Suite',
    subtitle: 'Interview Escape Room',
    description: 'Solve technical riddles under lock! Traverse SQL, DSA, debugging, and behavioral rooms to earn the Offer Letter.',
    icon: Shield,
    color: '#00F3FF', // Cyan
    accentClass: 'theme-interview-escape',
    difficulty: 'Adventure',
    reputationReward: '+60 Rep'
  },
  {
    id: 'resume-tycoon',
    title: 'Development Center',
    subtitle: 'Resume Builder Tycoon',
    description: 'Life simulator. Allocate weekly hours, study DSA, deploy repos, and network to graduate with elite portfolios.',
    icon: Laptop,
    color: '#F97316', // Orange
    accentClass: 'theme-resume-tycoon',
    difficulty: 'Strategy',
    reputationReward: '+45 Rep'
  },
  {
    id: 'code-snake',
    title: 'Code Snake Arena',
    subtitle: 'Code Snake Traversal',
    description: 'Navigate the compiler grid as a data stream. Collect syntax keywords, deploy blocks, and eliminate logic loops!',
    icon: Terminal,
    color: '#10B981', // Emerald
    accentClass: 'theme-code-snake',
    difficulty: 'Medium',
    reputationReward: '+120 Rep'
  },
  {
    id: 'ai-master',
    title: 'AI Master Challenge',
    subtitle: 'AI Master Show',
    description: 'Futuristic TV game show. Answer AI/ML challenges, use model lifelines, bypass safe thresholds, and claim Champion standing.',
    icon: Trophy,
    color: '#00F3FF', // Cyan
    accentClass: 'theme-ai-master',
    difficulty: 'Hard',
    reputationReward: '+150 Rep'
  }
];

export default function Hub() {
  const { 
    setGame, 
    triggerNotification, 
    activeGame, 
    xp, 
    coins, 
    clan, 
    lastDailyRewardDate, 
    dailyRewardModalOpen, 
    setDailyRewardModalOpen,
    activeTrack,
    setTrack,
    bgmVolume,
    setBgmVolume,
    isMuted,
    toggleAudio
  } = usePlayerStore();
  const [codexOpen, setCodexOpen] = useState(false);
  const [codexTab, setCodexTab] = useState('algo');
  const [standingsTab, setStandingsTab] = useState('players'); // 'players' | 'clans'

  const handleDownloadPDF = (gameId) => {
    const doc = new jsPDF();
    
    let title = '';
    let pages = [];
    
    switch(gameId) {
      case 'career-tower':
        title = "Career Tower: Life Architect Player Manual";
        pages = [
          [
            "SECTION 1: GAME CONCEPT & CAREER ROADMAP",
            "This simulation reimagines a software engineer's career roadmap as a giant",
            "constellation skill tree. Instead of standard numeric levels, players navigate",
            "metropolis placements by lighting up career star nodes. The game is designed to",
            "develop holistic engineering decision-making.",
            "",
            "CORE MECHANICS & PATHWAYS",
            "1. Focus Points: Earned by completing SDE freelance tasks. Spent on skill trees.",
            "2. Constellation Stars: Unlocking career stars directly buffs core stats like",
            "   Velocity, Complexity Depth, DSA Intelligence, and Synergy Charisma.",
            "3. Sector Market Demands: The job market shifts dynamically. Skill nodes may cost",
            "   more or less depending on active tech stacks in the metropolis."
          ],
          [
            "SECTION 2: SELECTING YOUR CHARACTER ARCHETYPE",
            "Each Starting Class provides distinct bonuses that scale differently:",
            "",
            "* Frontend Mage: Masters UI/UX & React frameworks. Starts with +2 Focus Points,",
            "  and +10 Velocity (reduces contract cooldown times by 15%).",
            "* Backend Guardian: Masters databases & APIs. Starts with +50 Coins and",
            "  +10 Complexity Depth (reduces database query latency costs by 15%).",
            "* AI Alchemist: Masters neural models & tensors. Starts with +50 XP and",
            "  +10 DSA Intelligence (deals 15% extra damage in the DSA Arena).",
            "* UI/UX Rogue: Masters CSS styling & design. Starts with +50 Reputation and",
            "  +10 Synergy Charisma (boosts trust gains in visual novel stories by 15%)."
          ],
          [
            "SECTION 3: CONTRACT BOARD & OUTAGE RISKS",
            "Accept contracts from local tech sectors to earn SDE coins and reputation points.",
            "",
            "THE SYSTEM STABILIZATION LAWS",
            "1. Pressure Timers: Code changes must be compiled within strict timers.",
            "2. Outage Failures: Failing a task triggers a production outage, costing 1 Heart.",
            "3. System Reboots: If hearts drop to 0, system locks activate. Rebooting the profile",
            "   requires spending 50 coins in the developer profile center.",
            "4. Project Quality: Higher project complexity awards scaling XP bonuses."
          ],
          [
            "SECTION 4: OFFICIAL SOLUTIONS & SYSTEM CHEATS",
            "OPTIMAL SKILL NODES UNLOCKING RATIOS",
            "* Junior Stage: Spend first 4 Focus Points on 'Core Logic' and 'Database Basics'.",
            "* Mid Stage: Unlock 'System Architect' to double maximum SDE contract rewards.",
            "* Senior Stage: Light up 'Distributed Nodes' to reduce heart cooldowns by 50%.",
            "",
            "CLAN REBOOT CODES",
            "* Clear all local outages: Spend 50 coins at profile tab to buy 'Heart Patch'.",
            "* Maximize MRR: Accept 'Series A' and 'Series B' contracts first on the board."
          ]
        ];
        break;
      case 'sql-heist':
        title = "Data Bank: SQL Heist Player Manual";
        pages = [
          [
            "SECTION 1: MISSION BRIEFING & VAULT SECURITY",
            "You are tasked with hacking relational database terminals inside the high-security",
            "Metropolis Data Bank. A database intruder has compromised the vault, leaving",
            "corrupt security trails. SDE candidates must write syntactically correct queries",
            "to trace logs and recover data.",
            "",
            "RELATIONAL SYSTEM OUTLINES",
            "* Database terminals consist of tables (cams, employees, network_logs).",
            "* Terminal connections are isolated under strict sandbox constraints.",
            "* Bypassing firewalls requires correct SQL syntax and exact filters."
          ],
          [
            "SECTION 2: STUDENT SQL TERMINOLOGY CHEATSHEET",
            "Understand these fundamental SQL concepts to bypass data bank firewalls:",
            "",
            "* SELECT: Specifies the exact columns you want to retrieve.",
            "* WHERE: Filters rows matching criteria (e.g. status = 'OFFLINE').",
            "* JOIN / ON: Connects matching primary-foreign key records across tables.",
            "* GROUP BY: Aggregates records into group summaries.",
            "* HAVING: Filters aggregated data (cannot use WHERE on GROUP BY metrics).",
            "* ORDER BY: Sorts values. Use DESC for descending and LIMIT to crop rows."
          ],
          [
            "SECTION 3: CASE TERM INVESTIGATION PROTOCOLS",
            "To solve heist missions, candidates must inspect schemas and trace connections:",
            "",
            "1. Case 1 (Security Cams): Locate all cameras whose status is currently offline.",
            "2. Case 2 (Clearance Code): Retrieve the access code of Sarah Connor by joining the",
            "   badge registry with the employee table.",
            "3. Case 3 (Intruder IP Logs): Identify the malicious IP addresses that have triggered",
            "   more than 1 access denied log on the database server."
          ],
          [
            "SECTION 4: OFFICIAL TERMINAL CODES & ANSWERS",
            "The exact SQL scripts required to unlock cases in the Metropolis Data Bank:",
            "",
            "* CASE 1 (OFFLINE CAMERAS):",
            "  SELECT location FROM security_cameras WHERE status = 'OFFLINE';",
            "",
            "* CASE 2 (EMPLOYEE ACCESS CODE):",
            "  SELECT access_code FROM badge_registry",
            "  JOIN employees ON badge_registry.emp_id = employees.emp_id",
            "  WHERE name = 'Sarah Connor';",
            "",
            "* CASE 3 (MALICIOUS INTRUDER LOGS):",
            "  SELECT ip_address FROM network_logs WHERE action = 'DENIED'",
            "  GROUP BY ip_address HAVING count(*) > 1;"
          ]
        ];
        break;
      case 'algo-arena':
        title = "DSA Arena: Algorithm Arena Player Manual";
        pages = [
          [
            "SECTION 1: GAME CONCEPT & COMPLEXITY SPELLS",
            "Engage in tactical turn-based combat inside the computer memory heap. Players",
            "control a spaceship fighter and battle data structure sludges by selecting the",
            "optimal algorithmic complexity for target coding solutions.",
            "",
            "COMPLEXITY ATTACKS CLASSIFICATIONS",
            "* O(1) [Ultimate Spell]: Direct index lookup or constant time executions.",
            "* O(log n) [Precision Slice]: Logarithmic search loops (Binary Search).",
            "* O(n) [Linear Swipe]: Single loop array traversals or linked list scans.",
            "* O(n log n) [Dual Strike]: Optimal sorting algorithms (Merge / Quick Sort).",
            "* O(n^2) [Heavy Blunt]: Nested loops (Bubble / Selection Sorts)."
          ],
          [
            "SECTION 2: SPACESHIP SPECS & SHIELDS SYSTEM",
            "Your spaceship is equipped with visual status metrics and defense modules:",
            "",
            "* Spaceship Shields: Start with 3 shield charges. Incorrect answers invite direct",
            "  monster meteor counter-attacks, depleting 1 shield.",
            "* Continuous Battle Loop: If you run out of questions but shields are still",
            "  active, the question deck loops back to the start. The fight only concludes in",
            "  defeat when shields drop to 0.",
            "* Weakness Exploit: Exploiting a monster weakness deals double damage."
          ],
          [
            "SECTION 3: MONSTER BEAST ENCYCLOPEDIA",
            "Study these memory beasts to exploit their algorithmic weaknesses:",
            "",
            "* Array Beast (Level 1): Vulnerable to indexing and sorting questions.",
            "* String Phantom (Level 2): Vulnerable to pattern matching queries.",
            "* Stack & Queue Sentinel (Level 3): Vulnerable to push/pop operations.",
            "* Hash Goblin (Level 4): Vulnerable to open addressing & collision questions.",
            "* Tree Guardian (Level 5): Vulnerable to BST traversals and heights."
          ],
          [
            "SECTION 4: OFFICIAL DSA SOLUTIONS & ANSWERS",
            "The exact answers to defeat the DSA Arena beasts:",
            "",
            "* ARRAY BEAST (LEVEL 1):",
            "  * Q1: Time complexity to access array element by index? Answer: O(1).",
            "  * Q2: Guaranteed O(n log n) stable sorting algorithm? Answer: Merge Sort.",
            "",
            "* STRING PHANTOM (LEVEL 2):",
            "  * Q1: Worst-case string comparison time? Answer: O(min(M, N)).",
            "  * Q2: O(N+M) prefix table search algorithm? Answer: KMP.",
            "",
            "* STACK & QUEUE SENTINEL (LEVEL 3):",
            "  * Q1: LIFO access pattern structure? Answer: Stack.",
            "  * Q2: Enqueue and dequeue complexity? Answer: O(1).",
            "  * Q3: Pushing [10, 20, 30] output? Answer: [30, 20, 10]."
          ]
        ];
        break;
      case 'apti-rush':
        title = "Aptitude District: Apti Rush Player Manual";
        pages = [
          [
            "SECTION 1: SPEEDRUN PHYSICS & OBSTACLES",
            "A fast-paced runner game challenging mathematical and logical speed under a",
            "strict countdown timer. Solvers switch highway lanes to collect currency coins",
            "and dodge firewall barriers by answering aptitude questions.",
            "",
            "FIREWALL COLLISION LAWS",
            "1. Physical Collisions: Running into a neon firewall barrier before solving costs",
            "   1 security shield (life).",
            "2. Time Reductions: Collision impacts reduce your remaining timer by 4 seconds.",
            "3. Game Over: Exhausting all 3 shields terminates the speedrun."
          ],
          [
            "SECTION 2: COMBINED WORK & SPEED FORMULAS",
            "Memorize these short mathematical shortcuts to solve questions in under 10 seconds:",
            "",
            "* Combined Work Rates: If A does work in X days and B does it in Y days,",
            "  together they take: (X × Y) / (X + Y) days.",
            "* Speed Conversion Ratio: Multiply km/h by 5/18 to convert to m/s.",
            "* Train Length Physics: Length of train = speed of train (in m/s) × time taken to",
            "  cross a static signal pole (in seconds)."
          ],
          [
            "SECTION 3: STREAKS & COMBO SCORE SYSTEMS",
            "Maximize your score and coin multipliers through continuous correct streaks:",
            "",
            "1. Streak increments with every correct choice, increasing the combo multiplier.",
            "2. Scoring incorrect options or timing out resets the combo multiplier to 1.",
            "3. High combo multiplier triples final XP rewards and increases cash payouts."
          ],
          [
            "SECTION 4: OFFICIAL SOLUTIONS & CALCULATION KEYS",
            "Answers and worked solutions for common Apti-Rush problems:",
            "",
            "* WORK RATES PROBLEM (A in 12 days, B in 24 days):",
            "  * Together time = (12 × 24) / (12 + 24) = 288 / 36 = 8 days.",
            "",
            "* TRAIN PASSING PROBLEM (90 km/h speed, 12 seconds crossing time):",
            "  * Speed = 90 × (5/18) = 25 m/s. Length = 25 × 12 = 300 meters.",
            "",
            "* ALGEBRA EQUATION (Solve: 3x + 5 = 20):",
            "  * Isolate: 3x = 20 - 5 = 15. Divide: x = 15 / 3 = 5.",
            "",
            "* PROFIT & LOSS (₹400 cost, sold at 20% profit):",
            "  * Profit = 400 × 0.20 = ₹80. Selling Price = 400 + 80 = ₹480."
          ]
        ];
        break;
      case 'startup-garage':
        title = "Startup Garage Tycoon Player Manual";
        pages = [
          [
            "SECTION 1: TYCOON ECONOMICS & RUN RATE",
            "Take command of a SaaS tech company from a small garage and scale it to a",
            "corporate skyscraper. Manage your weekly sprints, financials, code quality,",
            "headcount, server scaling, and venture capital rounds.",
            "",
            "CORE BANKRUPTCY LAWS",
            "* Operating cash depletes every week due to server charges and developer salaries.",
            "* SDE developer salaries are high. Cash reaching $0 results in bankruptcy."
          ],
          [
            "SECTION 2: DEV AGILITY & SERVER METRICS",
            "Manage your workspace variables to sustain monthly recurring revenue (MRR):",
            "",
            "* Active Users: Drives your MRR growth rates.",
            "* Server Stress: High stress degrades user experience, causing user churn.",
            "* Server Latency: Can be reduced by buying memory and hardware upgrades.",
            "* Code Bugs: High bug counts decrease user acquisition rates. Click desks manually",
            "  or run QA sprints to squash bugs (+1 XP per manual bug squashed)."
          ],
          [
            "SECTION 3: PRODUCTIVITY SPRINTS SHEET",
            "Allocate company focus blocks across four active areas:",
            "",
            "1. Feature Sprint: Elevates product functionality, boosting MRR.",
            "2. QA Sprint: Squashes software bugs and cleans system logs.",
            "3. Marketing Sprint: Builds public hype to accelerate user growth.",
            "4. Infrastructure Upgrades: Upgrading coffee makers increases employee speed, and",
            "   server upgrades increase user capacity bounds."
          ],
          [
            "SECTION 4: OFFICIAL VC PITCH SOLUTIONS & CHEATS",
            "The exact pitches to secure maximum venture capital funding:",
            "",
            "* SYSTEM LATENCY PITCH (Seed Stage):",
            "  * Q: How do we optimize database queries? Answer: Add database indexes.",
            "",
            "* TRANSACTION FLOOD PITCH (Series A Stage):",
            "  * Q: How do we neutralize checkout spams? Answer: Implement a Token Bucket Rate Limiter.",
            "",
            "* CLAN FUNDING STRATEGY:",
            "  * Ensure active users are > 300 before scheduling the Series A review.",
            "  * Set pitch equity between 12% and 18% to maximize valuation ratios."
          ]
        ];
        break;
      case 'internship-detective':
        title = "Internship Detective Visual Novel Player Manual";
        pages = [
          [
            "SECTION 1: SYSTEM INCIDENTS & CLUE BOARDS",
            "Investigate production outages as a newly hired developer detective. Read visual",
            "novel dialogues, examine server environments, collect log files, and pin clues",
            "on the corkboard to formulate the correct system fix.",
            "",
            "CLUE PINBOARD PRINCIPLES",
            "* Outages contain clues (CPU charts, pull requests, network logs).",
            "* Pinboard matching connects symptom clues directly to root causes.",
            "* Making incorrect connections depletes your reputation points."
          ],
          [
            "SECTION 2: RELATIONSHIP METER SPECS",
            "Navigate conversations carefully. SDE colleagues have different personalities:",
            "",
            "* Rohan (Senior SDE): Skeptical backend lead. Demands rigorous log inspections and",
            "  strict database procedures.",
            "* Neha (Tech Lead): Strategic architect. Values clean client communications and",
            "  organized deployment plans.",
            "* Trust Multipliers: High relationship meters unlock hidden clues and reduce",
            "  diplomatic penalties by 20%."
          ],
          [
            "SECTION 3: CASE FILE DIALOGUE TREES",
            "Select the correct responses during technical debriefs to verify status:",
            "",
            "1. Level 1: Database bottleneck outage.",
            "2. Level 2: Merged Git branch merge conflicts.",
            "3. Level 3: API Gateway latency outages.",
            "",
            "Always consult SOP guidelines before committing code fixes."
          ],
          [
            "SECTION 4: OFFICIAL INCIDENT FIXES & ANSWERS",
            "Solutions to solve the three internship detective cases:",
            "",
            "* CASE 1 (DATABASE BOTTLENECK):",
            "  * Connected Clues: CPU Spike Logs + Slow Analytical Queries.",
            "  * Tech Lead Pitch: Redirect read queries to secondary replica nodes.",
            "",
            "* CASE 2 (GIT CONFLICT OUTAGE):",
            "  * Connected Clues: Commit History Conflict + Broken Master Build.",
            "  * Tech Lead Pitch: Revert corrupt merge commit, fix locally, run unit tests.",
            "",
            "* CASE 3 (API GATEWAY CRASH):",
            "  * Connected Clues: Traffic Spike Logs + Token Errors.",
            "  * Tech Lead Pitch: Implement Token Bucket rate limiter in gateway."
          ]
        ];
        break;
      case 'code-inspector':
        title = "Code Inspector: Code Decryptor Manual";
        pages = [
          [
            "SECTION 1: ABSTRACT PARSING & COMPILATION",
            "Audit syntax corruptions and bugs in active metropolis repositories. Players",
            "act as SDE compilers, scanning codebases, identifying incorrect lines, and",
            "deploying syntax corrections under a countdown timer.",
            "",
            "DECRYPTOR PROCEDURES",
            "* Repositories contain active files (Python, Javascript, C++).",
            "* Compile errors trigger a Compiler Crash toast.",
            "* Players start with 3 security shields. Shield depletion results in system lockout."
          ],
          [
            "SECTION 2: COMMON COMPILATION CORRUPTIONS",
            "Keep an eye out for these common bugs when inspecting code lines:",
            "",
            "* Off-By-One Loop Bounds: Iterating up to index length (e.g. i <= length).",
            "* Null Reference Pointer Dereferences: Accessing values without null verification.",
            "* Incorrect Operator Comparison Bounds: Using assignment instead of compare.",
            "* Memory Leaks: Pointers created inside loop bodies without garbage collection."
          ],
          [
            "SECTION 3: COMPILE STEPS & SHORTCUT KEYS",
            "1. Inspect active file lines on the IDE terminal screen.",
            "2. Select a buggy line to open the editor shell.",
            "3. Write the exact correction and click compiler build.",
            "4. Correcting code lines rewards you with +5 XP per line."
          ],
          [
            "SECTION 4: OFFICIAL COMPILER FIXES & ANSWERS",
            "The exact line edits required to compile the decryptor files:",
            "",
            "* MISSION 1 (PYTHON INDEX BUGS):",
            "  * Bug Line: `for i in range(0, len(arr) + 1):`",
            "  * Correct Fix: `for i in range(0, len(arr)):`",
            "",
            "* MISSION 2 (JAVASCRIPT NULL DEREFERENCE):",
            "  * Bug Line: `console.log(user.profile.avatar);`",
            "  * Correct Fix: `console.log(user && user.profile && user.profile.avatar);`",
            "",
            "* MISSION 3 (C++ REFERENCE LINK):",
            "  * Bug Line: `Node* temp = head; temp = temp.next;`",
            "  * Correct Fix: `Node* temp = head; temp = temp->next;`"
          ]
        ];
        break;
      case 'interview-escape':
        title = "Assessment Suite: Interview Escape Room Manual";
        pages = [
          [
            "SECTION 1: ESCAPE SUITE CHAMBER ARCHITECTURE",
            "Locked in a virtual SDE interview escape room. Solvers must pass a series of",
            "relational database queries, complexity tests, rate-limiting gate locks, and",
            "behavioral HR checkpoints to unlock the exit door.",
            "",
            "ESCAPE SUITE CHAMBERS",
            "* Gate 1: Relational Query terminals.",
            "* Gate 2: Algorithm chasm bridges.",
            "* Gate 3: Compiler robot debug cells.",
            "* Gate 4: Tech Lead HR review gates."
          ],
          [
            "SECTION 2: CHAMBER LEVEL SPECIFICATIONS",
            "Each gate requires specific engineering domain knowledge to unlock:",
            "",
            "* Database Lockers: Relational SQL joins and index keys.",
            "* DSA Bridges: Algorithm performance structures (e.g. Bubble Sort speed limits).",
            "* Debug Cells: Spotting logical loops and syntax errors.",
            "* Behavioral Gates: Selecting high-synergy, empathetic answers."
          ],
          [
            "SECTION 3: OUTAGE LAWS & WARNING SYSTEMS",
            "1. Error Warnings: Providing incorrect inputs triggers security warnings.",
            "2. Door Closures: Triggering 3 errors locks the chamber gates.",
            "3. System Resets: Accessing help files consumes SDE coins."
          ],
          [
            "SECTION 4: OFFICIAL ESCAPE ANSWERS & CODES",
            "The exact keys and responses to escape the interview chambers:",
            "",
            "* CHAMBER 1 (DATABASE TERMINAL):",
            "  * SQL Query: SELECT name FROM users WHERE role = 'ADMIN';",
            "",
            "* CHAMBER 2 (DSA BRIDGE BUILDER):",
            "  * Correct Algorithm choice: Choose 'Merge Sort' (Bubble Sort collapses bridge).",
            "",
            "* CHAMBER 3 (ROBOT DEBUG CORE):",
            "  * Correct Fix: Change `for (let i = 0; i <= arr.length; i++)` to `for (let i = 0; i < arr.length; i++)`",
            "",
            "* CHAMBER 4 (HR BEHAVIORAL GATE):",
            "  * Selected Response: 'I will collaborate with the team to identify dependencies first.'"
          ]
        ];
        break;
      case 'resume-tycoon':
        title = "Development Center: Resume Builder Tycoon Manual";
        pages = [
          [
            "SECTION 1: TIME DISTRIBUTION LAWS",
            "Manage your weekly hour balances across four academic semesters. Divide your",
            "time between Study hours, Coding practice, Project development, and Hostel rest",
            "to build a high-caliber placement resume.",
            "",
            "CORE STAT CORRELATIONS",
            "* Study hours: Increases GPA. High GPA unlocks Tier 1 company applications.",
            "* Coding hours: Unlocks skill tree nodes. Boosts DSA Arena stats.",
            "* Project hours: Earns Project Stars. Required for startup VC reviews."
          ],
          [
            "SECTION 2: ENERGY RECOVERY RULES",
            "Balancing study and coding fatigue is critical to prevent burnout:",
            "",
            "* Energy drops by 15 points per semester block of continuous work.",
            "* Low energy limits coding output and increases error rates by 35%.",
            "* Sleep hours: Recovers 40 energy points per session.",
            "* Hostel upgrades: Upgrading your dorm bed increases energy recovery rates."
          ],
          [
            "SECTION 3: SEMESTER SCHEDULE BLOCKS",
            "1. Semester 1: Focus on building basic GPA and learning DSA fundamentals.",
            "2. Semester 2: Shift to project development to earn project stars.",
            "3. Semester 3: Maximize coding hours to unlock advanced React/Python nodes.",
            "4. Semester 4: Pitch resumes to corporate tech recruiters at the hub."
          ],
          [
            "SECTION 4: OFFICIAL STRATEGY SOLUTIONS & CHEATS",
            "The optimal weekly hour allocation schedules to secure placement:",
            "",
            "* SEMESTER 1 (GPA BASICS):",
            "  * Study: 30 hours, Coding: 15 hours, Projects: 5 hours, Sleep: 34 hours.",
            "",
            "* SEMESTER 2 (PROJECT STARS):",
            "  * Study: 15 hours, Coding: 20 hours, Projects: 20 hours, Sleep: 29 hours.",
            "",
            "* SEMESTER 3 (ADVANCED CODING):",
            "  * Study: 10 hours, Coding: 40 hours, Projects: 10 hours, Sleep: 24 hours.",
            "",
            "* SEMESTER 4 (PLACEMENT INTERVIEW CHEAT):",
            "  * Ensure GPA is > 8.0, project stars are >= 4, and Python/JS nodes are unlocked."
          ]
        ];
        break;
      case 'code-snake':
        title = "Code Snake Arena Player Manual";
        pages = [
          [
            "SECTION 1: GAME CONCEPT & GRID SYSTEMS",
            "Navigate the compiler grid as an AI data stream. Collect correct syntax",
            "tokens to complete coding compiler goals while dodging bugs and virus files.",
            "",
            "MOVEMENT SCHEMES",
            "* Desktop: Use Arrow Keys or WASD keys to redirect the snake stream.",
            "* Mobile/Tablet: Tap the glassmorphic on-screen d-pad arrow buttons.",
            "* Wrap Around: Directing snake offscreen wraps it to the opposite wall."
          ],
          [
            "SECTION 2: COMPILER POWER-UPS MANUAL",
            "Collect neon power-up capsules on grid coordinates to gain temporal bonuses:",
            "",
            "* Debug Shield (🛡️): Absorbs one wrong token or self-collision impact.",
            "* Speed Boost (⚡): Accelerates speed ticks and doubles score ratings.",
            "* Token Magnet (🧲): Attracts correct syntax tokens toward the head.",
            "* Time Freeze (❄️): Suspends active countdown timers for 8 seconds.",
            "* Syntax Scanner (🔍): Highlights the next target token in a cyan glow."
          ],
          [
            "SECTION 3: SEQUENTIAL TOKEN COLLECTION RULES",
            "To prevent compile crashes, tokens must be collected in exact sequence:",
            "",
            "1. Active target tokens are colored green (🎯) with a cyan scanner highlight.",
            "2. Future required tokens are colored amber/orange (⏳). Avoid eating them out of order.",
            "3. Incorrect syntax tokens are colored red (🔴). Eating them shrinks the snake.",
            "4. Throttled Enemies: Bugs and viruses move at 1/3 speed, making them easier to dodge."
          ],
          [
            "SECTION 4: OFFICIAL SYNTAX SOLUTIONS & ANSWERS",
            "The exact sequential token sequences required for levels:",
            "",
            "* LEVEL 1 (PYTHON FUNCTION DEFINITION):",
            "  * Required Sequence: `def`, `(`, `)`, `:`, `return`",
            "",
            "* LEVEL 2 (JAVASCRIPT LOOP STATEMENT):",
            "  * Required Sequence: `for`, `(`, `let`, `i`, `++`, `)`",
            "",
            "* LEVEL 3 (SQL DATABASE QUERY):",
            "  * Required Sequence: `SELECT`, `FROM`, `WHERE`, `ORDER`, `BY`",
            "",
            "* LEVEL 4 (C++ POINTER INSTANTIATION):",
            "  * Required Sequence: `int`, `*`, `ptr`, `=`, `&`, `val`"
          ]
        ];
        break;
      case 'ai-master':
        title = "AI Master Challenge Player Manual";
        pages = [
          [
            "SECTION 1: AI SHOW RULES & CHECKPOINTS",
            "Answer progressive artificial intelligence and machine learning questions to",
            "rank up from AI Beginner to the ultimate title of AI Champion.",
            "",
            "CHECKPOINT HAVENS (SAFETY NETS)",
            "1. Question 4 Milestone: Safely locks in your progress. You cannot drop below this tier.",
            "2. Question 7 Milestone: Second safety checkpoint. Locks in senior ML rewards.",
            "3. Incorrect Answers: Drop your tier back to the last safety checkpoint."
          ],
          [
            "SECTION 2: LIFELINE HELPER MODULES",
            "Utilize these compute tools when answering complex questions:",
            "",
            "* 50:50 Scanner: Erases two incorrect options from the question panel.",
            "* AI Mentor: Generates mathematical hints on loss functions and CNN layers.",
            "* Dataset Preview: Inspects row logs or database features.",
            "* Compute Time: Adds 30 seconds of compute time to the countdown timer."
          ],
          [
            "SECTION 3: MACHINE LEARNING SYLLABUS",
            "Core ML concepts tested across the 10 TV stages:",
            "",
            "* Stages 1-3: NumPy array manipulation and Pandas data cleanup.",
            "* Stages 4-6: Convolutional dimensions, model metrics, and loss functions.",
            "* Stages 7-10: Transformer self-attention, LSTM gates, and DQN target networks."
          ],
          [
            "SECTION 4: OFFICIAL AI SOLUTIONS & ANSWERS",
            "The exact correct options for the AI Master Challenge questions:",
            "",
            "* STAGES 1-3 (DATA MANIPULATION):",
            "  * Q: Pandas method to drop missing rows? Answer: `dropna()`.",
            "  * Q: NumPy function to flatten arrays? Answer: `ravel()`.",
            "",
            "* STAGES 4-6 (MODEL OPTIMIZATION):",
            "  * Q: Metric prioritizing false positives? Answer: Precision.",
            "  * Q: Loss function for multi-class classifiers? Answer: Cross-Entropy.",
            "",
            "* STAGES 7-10 (DEEP LEARNING & RL):",
            "  * Q: Gate in LSTM controlling memory update? Answer: Input Gate.",
            "  * Q: Core mechanism of Transformers? Answer: Self-Attention."
          ]
        ];
        break;
      default:
        title = "Silicon Metropolis Placement Manual";
        pages = [
          [
            "Choose a training sector card to solve placement challenges, earn coins,",
            "gain reputation, and build your placement eligibility rating."
          ]
        ];
    }
    
    // Generate multi-page PDF documents
    pages.forEach((pageLines, pageIdx) => {
      if (pageIdx > 0) {
        doc.addPage();
      }
      
      // Draw Page Header
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(30, 58, 138); // Dark blue #1e3a8a
      doc.text(title, 20, 15);
      
      // Draw Page Number / Footer
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184); // Slate 400
      doc.text(`Page ${pageIdx + 1} of ${pages.length}`, 105, 288, { align: "center" });
      
      // Draw thin header separator line
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(0.5);
      doc.line(20, 19, 190, 19);
      
      // Draw Body
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85); // Slate gray #334155
      
      let y = 28;
      pageLines.forEach((line) => {
        if (line === "") {
          y += 5;
          return;
        }
        
        // Check if line is a header (starts with SECTION or is all caps and not a list bullet)
        const isHeader = (line.startsWith("SECTION") || line.startsWith("OPTIMAL") || line.startsWith("CLAN") || line.startsWith("CORE") || line.startsWith("THE") || line.startsWith("DEVELOPMENT") || line.startsWith("RELATIONAL") || line.startsWith("STUDENT") || line.startsWith("CASE") || line.startsWith("COMPLEXITY") || line.startsWith("SPACESHIP") || line.startsWith("MONSTER") || line.startsWith("FIREWALL") || line.startsWith("VELOCITY") || line.startsWith("STREAKS") || line.startsWith("QA") || line.startsWith("PRODUCTIVITY") || line.startsWith("DIPLOMATIC") || line.startsWith("COMMON") || line.startsWith("COMPILE") || line.startsWith("CHAMBER") || line.startsWith("TIME") || line.startsWith("SEMESTER") || line.startsWith("MOVEMENT") || line.startsWith("LIFELINE") || line.startsWith("CRITICAL") || line.startsWith("SAFETY") || line.startsWith("MODEL") || line.startsWith("ML") || line.startsWith("ARRAY") || line.startsWith("STRING") || line.startsWith("STACK") || line.startsWith("WORK") || line.startsWith("TRAIN") || line.startsWith("ALGEBRA") || line.startsWith("PROFIT") || line.startsWith("SEED") || line.startsWith("SERIES") || line.startsWith("LEVEL"));
        
        if (isHeader) {
          doc.setFont("Helvetica", "bold");
          doc.setTextColor(37, 99, 235); // Blue #2563eb
          y += 3;
          doc.text(line, 20, y);
          doc.setFont("Helvetica", "normal");
          doc.setTextColor(51, 65, 85);
          y += 5;
        } else {
          doc.text(line, 20, y);
          y += 5;
        }
      });
    });
    
    // Save/Download PDF
    const filename = `${gameId}_placement_guide.pdf`;
    doc.save(filename);
  };

  const [selectedSector, setSelectedSector] = useState(null);

  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [leaderboardExpanded, setLeaderboardExpanded] = useState(false);

  const fetchLeaderboardData = () => {
    fetch('http://localhost:5000/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        let dbLeaderboard = [];
        if (data.success && data.leaderboard && data.leaderboard.length > 0) {
          dbLeaderboard = data.leaderboard;
        }

        // Live Local Hydration: Merge current logged-in player's store XP
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
        setLoadingLeaderboard(false);
      })
      .catch(() => {
        setLoadingLeaderboard(false);
      });
  };

  useEffect(() => {
    fetchLeaderboardData();
    const interval = setInterval(fetchLeaderboardData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (lastDailyRewardDate !== todayStr) {
      setDailyRewardModalOpen(true);
    }
  }, [lastDailyRewardDate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch('http://localhost:5000/api/daily-challenge', { headers })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDailyChallenge(data);
        }
        setLoadingDaily(false);
      })
      .catch(() => {
        setLoadingDaily(false);
      });
  }, []);

  useEffect(() => {
    // Start playing default lofi beats on mount if no BGM is active
    if (activeTrack === 'none') {
      setTrack('lofi');
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setCodexOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div style={styles.container} className="grid-overlay">
      {/* City Header & Leaderboard Row */}
      <div style={styles.headerLayoutRow}>
        {/* Left Column: Title & Info */}
        <div style={styles.welcomeBanner}>
          <div style={styles.cityBadge}>SYSTEM MAIN HUB</div>
          <h2 style={styles.cityTitle}>SILICON METROPOLIS</h2>
          <p style={styles.cityDesc}>Select a sector to begin training, earn points, and level up your placement eligibility.</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <button 
              className="game-btn game-btn-primary" 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '6px 16px', 
                fontSize: '0.75rem',
                background: 'linear-gradient(135deg, var(--accent-secondary) 0%, #0369a1 100%)',
                boxShadow: 'var(--glow-secondary)',
                borderColor: 'var(--accent-secondary)'
              }}
              onClick={() => {
                setCodexOpen(true);
                localStorage.setItem('metropolis_codex_opened', 'true');
              }}
            >
              <Database size={14} /> 📁 DATABANK CODEX TERMINAL
            </button>

            {lastDailyRewardDate !== new Date().toISOString().split('T')[0] && (
              <button 
                className="game-btn" 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '6px 16px', 
                  fontSize: '0.75rem',
                  background: 'linear-gradient(135deg, #EAB308 0%, #CA8A04 100%)',
                  borderColor: '#EAB308',
                  color: '#000',
                  fontWeight: '700',
                  boxShadow: '0 0 15px rgba(234, 179, 8, 0.3)'
                }}
                onClick={() => setDailyRewardModalOpen(true)}
              >
                <Gift size={14} /> 🎁 DAILY MATRIX REWARDS
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Vertical Metropolis Standings Leaderboard */}
        <div style={styles.rightLeaderboardCard} className="game-card">
          <div style={styles.rightLeaderboardHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Trophy size={14} color="#EAB308" className="pulse-glow-animation" />
              <span style={styles.rightLeaderboardMainTitle}>STANDINGS</span>
            </div>
            
            {/* Tab Switcher: Players vs Clans */}
            <div style={{ display: 'flex', gap: '4px', backgroundColor: 'rgba(0,0,0,0.3)', padding: '2px', borderRadius: '6px' }}>
              <button
                type="button"
                style={{
                  background: standingsTab === 'players' ? 'var(--accent-color)' : 'transparent',
                  color: standingsTab === 'players' ? '#000' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.65rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
                onClick={() => setStandingsTab('players')}
              >
                Players
              </button>
              <button
                type="button"
                style={{
                  background: standingsTab === 'clans' ? 'var(--accent-color)' : 'transparent',
                  color: standingsTab === 'clans' ? '#000' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.65rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
                onClick={() => setStandingsTab('clans')}
              >
                Clans
              </button>
            </div>
          </div>
          
          <div style={styles.rightLeaderboardList}>
            {standingsTab === 'clans' ? (
              // Clan Standings List
              (() => {
                const clanRankings = HARDCODED_CLANS.map((c) => {
                  let totalClanXp = c.baseXP;
                  if (clan === c.id) {
                    totalClanXp += xp;
                  }
                  return { ...c, totalXP: totalClanXp };
                }).sort((a, b) => b.totalXP - a.totalXP);

                return clanRankings.map((c, idx) => {
                  const isTopClan = idx === 0;
                  return (
                    <div 
                      key={c.id} 
                      style={{
                        ...styles.rightLeaderboardRow,
                        background: isTopClan ? 'linear-gradient(90deg, rgba(234, 179, 8, 0.18) 0%, rgba(234, 179, 8, 0.04) 100%)' : 'rgba(255, 255, 255, 0.02)',
                        borderLeft: isTopClan ? '3px solid #EAB308' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={styles.rightRankBadge}>
                          {idx === 0 ? '👑 🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                        </span>
                        <span style={{ fontSize: '1.2rem' }}>{c.emoji}</span>
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                          <span style={{ ...styles.rightName, color: isTopClan ? '#FDE047' : '#FFF', fontWeight: isTopClan ? 'bold' : '600' }}>
                            {c.name} {isTopClan && <span style={{ fontSize: '0.65rem', color: '#EAB308', marginLeft: '4px' }}>(TOP GUILD)</span>}
                          </span>
                          <span style={styles.rightHandle}>{clan === c.id ? '⭐ Your Active Clan' : 'Developer Guild'}</span>
                        </div>
                      </div>
                      <span style={{ ...styles.rightXp, color: isTopClan ? '#FDE047' : 'var(--accent-color)', fontWeight: '700' }}>
                        {c.totalXP} XP
                      </span>
                    </div>
                  );
                });
              })()
            ) : loadingLeaderboard ? (
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Loading SDE standings...</div>
            ) : (
              (() => {
                const visibleCount = leaderboardExpanded ? leaderboard.length : 3;
                const visibleList = leaderboard.slice(0, visibleCount);
                return (
                  <>
                    {visibleList.map((player, idx) => {
                      const displayName = (player.name && player.name.startsWith('http')) ? 'SDE Candidate' : (player.name || 'SDE Candidate');
                      const playerUsername = player.email ? player.email.split('@')[0] : displayName.toLowerCase().replace(/\s+/g, '');
                      const isTopRank = idx === 0;
                      return (
                        <div 
                          key={idx} 
                          style={{
                            ...styles.rightLeaderboardRow,
                            background: isTopRank ? 'linear-gradient(90deg, rgba(234, 179, 8, 0.18) 0%, rgba(234, 179, 8, 0.04) 100%)' : 'rgba(255, 255, 255, 0.02)',
                            borderLeft: isTopRank ? '3px solid #EAB308' : 'none',
                            boxShadow: isTopRank ? '0 0 12px rgba(234, 179, 8, 0.25)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={styles.rightRankBadge}>
                              {idx === 0 ? '👑 🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                            </span>
                            <span style={styles.rightAvatar}>{renderAvatar(player.avatar, '22px')}</span>
                            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                              <span style={{ ...styles.rightName, color: isTopRank ? '#FDE047' : '#FFF', fontWeight: isTopRank ? 'bold' : '600' }}>
                                {displayName} {isTopRank && <span style={{ fontSize: '0.65rem', color: '#EAB308', marginLeft: '4px' }}>(TOP XP LEADER)</span>}
                              </span>
                              <span style={styles.rightHandle}>@{playerUsername}</span>
                            </div>
                          </div>
                          <span style={{ ...styles.rightXp, color: isTopRank ? '#FDE047' : 'var(--accent-color)', fontWeight: '700' }}>
                            {player.xp} XP
                          </span>
                        </div>
                      );
                    })}
                    
                    {leaderboard.length > 3 && (
                      <button 
                        style={styles.expandBtn}
                        onClick={() => {
                          setLeaderboardExpanded(!leaderboardExpanded);
                        }}
                      >
                        {leaderboardExpanded ? 'Show Less ▲' : `Show More (${leaderboard.length - 3} others) ▼`}
                      </button>
                    )}
                  </>
                );
              })()
            )}
          </div>
        </div>
      </div>

      {/* Grid of Buildings */}
      <div style={styles.grid} className="hub-grid">
        {BUILDINGS.map((b) => {
          const IconComponent = b.icon;
          return (
            <div 
              key={b.id} 
              className="game-card" 
              style={{ ...styles.card, '--accent-color': b.color }}
              onClick={() => setGame(b.id)}
              onMouseEnter={playCardHover}
            >
              {/* Card Header */}
              <div style={styles.cardHeader}>
                <div style={{ ...styles.iconWrapper, backgroundColor: `rgba(${hexToRgb(b.color)}, 0.1)`, borderColor: b.color }}>
                  <IconComponent size={28} color={b.color} />
                </div>
                <div style={styles.difficultyBadge}>{b.difficulty}</div>
              </div>

              {/* Card Body */}
              <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{b.title}</h3>
                <h4 style={{ ...styles.cardSubtitle, color: b.color }}>{b.subtitle}</h4>
                <p style={styles.cardDesc}>{b.description}</p>
              </div>

              {/* Card Footer / Rewards */}
              <div style={styles.cardFooter}>
                <div style={styles.rewardBadge}>
                  <Star size={12} fill="#EAB308" color="#EAB308" />
                  <span>{b.reputationReward}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button 
                    className="game-btn" 
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', borderColor: b.color, color: b.color, backgroundColor: 'transparent' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadPDF(b.id);
                    }}
                  >
                    📄 Guide PDF
                  </button>
                  <span className="game-btn game-btn-primary" style={styles.enterBtn}>
                    ENTER SECTOR
                  </span>
                </div>
              </div>

              {/* Glowing Background Accent */}
              <div style={{ ...styles.glowBacklight, backgroundColor: b.color }}></div>
            </div>
          );
        })}
      </div>

      {/* Daily Challenge Board Footer */}
      <div style={styles.dailyBoard}>
        <div style={styles.dailyHeader}>
          <Clock size={16} color="var(--accent-secondary)" />
          <h3 style={styles.dailyTitle}>ACTIVE DAILY MISSION</h3>
        </div>
        <div style={styles.dailyMission}>
          {loadingDaily ? (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Syncing rotation matrix...</div>
          ) : dailyChallenge ? (
            <>
              <p style={styles.dailyMissionText}>
                🔥 <strong>Featured Challenge:</strong> {dailyChallenge.game.desc} (Reward: <span style={{ color: '#F59E0B', fontWeight: 'bold' }}>+{dailyChallenge.coinsReward} Coins</span>, <span style={{ color: '#00F3FF', fontWeight: 'bold' }}>+{dailyChallenge.xpReward} XP</span>)
              </p>
              {dailyChallenge.completed ? (
                <button 
                  className="game-btn" 
                  style={{ ...styles.dailyBtn, borderColor: 'var(--success-color)', color: 'var(--success-color)', cursor: 'default', backgroundColor: 'transparent' }}
                  disabled
                >
                  ✅ Completed Today
                </button>
              ) : (
                <button 
                  className="game-btn game-btn-primary" 
                  style={styles.dailyBtn}
                  onClick={() => {
                    localStorage.setItem('active_daily_challenge_game', dailyChallenge.game.id);
                    setGame(dailyChallenge.game.id);
                  }}
                >
                  Launch {dailyChallenge.game.name}
                </button>
              )}
            </>
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>System offline. Check connection.</div>
          )}
        </div>
      </div>

      {/* 4. CODEX DATABASE OVERLAY MODAL */}
      {codexOpen && (
        <div style={styles.codexModal}>
          <div style={styles.codexContent} className="game-card">
            {/* Header */}
            <div style={styles.codexHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Database size={24} color="var(--accent-secondary)" />
                <h3 style={{ margin: 0, fontFamily: 'var(--font-title)', fontSize: '1.2rem', letterSpacing: '2px', color: '#FFF' }}>
                  METROPOLIS CODEX TERMINAL
                </h3>
              </div>
              <button 
                className="game-btn" 
                style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: 'var(--danger-color)', color: 'var(--danger-color)', backgroundColor: 'transparent' }}
                onClick={() => setCodexOpen(false)}
              >
                Close databank [ESC]
              </button>
            </div>

            {/* Main Tabs Navigation */}
            <div style={styles.codexTabs}>
              <button 
                style={{ ...styles.codexTabBtn, borderBottom: codexTab === 'algo' ? '2px solid var(--accent-secondary)' : 'none', color: codexTab === 'algo' ? '#FFF' : 'var(--text-secondary)' }}
                onClick={() => setCodexTab('algo')}
              >
                ⚔️ Boss Intel
              </button>
              <button 
                style={{ ...styles.codexTabBtn, borderBottom: codexTab === 'decrypt' ? '2px solid var(--accent-secondary)' : 'none', color: codexTab === 'decrypt' ? '#FFF' : 'var(--text-secondary)' }}
                onClick={() => setCodexTab('decrypt')}
              >
                🔎 Bug Registry
              </button>
              <button 
                style={{ ...styles.codexTabBtn, borderBottom: codexTab === 'escape' ? '2px solid var(--accent-secondary)' : 'none', color: codexTab === 'escape' ? '#FFF' : 'var(--text-secondary)' }}
                onClick={() => setCodexTab('escape')}
              >
                🔑 SQL Cryptography
              </button>
              <button 
                style={{ ...styles.codexTabBtn, borderBottom: codexTab === 'tycoon' ? '2px solid var(--accent-secondary)' : 'none', color: codexTab === 'tycoon' ? '#FFF' : 'var(--text-secondary)' }}
                onClick={() => setCodexTab('tycoon')}
              >
                🎓 Semester Manual
              </button>
            </div>

            {/* Tab Contents */}
            <div style={styles.codexBody}>
              {codexTab === 'algo' && (
                <div>
                  <h4 style={{ color: 'var(--accent-secondary)', fontWeight: 'bold', marginBottom: '8px', fontSize: '0.9rem' }}>⚔️ ALGORITHM ARENA - MONSTER INTEL REFERENCE</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Each Boss Golem in the Algorithm Arena is weak against certain complexity types or code paradigms. Use this cheat sheet to anticipate questions:
                  </p>
                  <div style={styles.codexGrid}>
                    <div style={styles.codexItem} className="game-card">
                      <strong style={{ color: 'var(--accent-secondary)', fontSize: '0.8rem' }}>1. Array Beast:</strong>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Focuses on memory offset indexing, arrays lookup times (O(1)), and stability in sorting methods.</span>
                    </div>
                    <div style={styles.codexItem} className="game-card">
                      <strong style={{ color: 'var(--accent-secondary)', fontSize: '0.8rem' }}>2. String Phantom:</strong>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Focuses on string equality checks (O(min(M, N))) and skip patterns like Knuth-Morris-Pratt (KMP).</span>
                    </div>
                    <div style={styles.codexItem} className="game-card">
                      <strong style={{ color: 'var(--accent-secondary)', fontSize: '0.8rem' }}>3. Stack Sentinel:</strong>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Focuses on Last-In-First-Out (LIFO) recursive buffers and stack tracking algorithms.</span>
                    </div>
                    <div style={styles.codexItem} className="game-card">
                      <strong style={{ color: 'var(--accent-secondary)', fontSize: '0.8rem' }}>4. Hash Goblin:</strong>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Focuses on bucket hashing, open addressing, separate chaining, and linear collision run degradation (O(N)).</span>
                    </div>
                    <div style={styles.codexItem} className="game-card">
                      <strong style={{ color: 'var(--accent-secondary)', fontSize: '0.8rem' }}>5. Tree Guardian:</strong>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Focuses on balanced Binary Search Tree heights (O(log N)), tree traversals (In-order sorted output), and BST features.</span>
                    </div>
                    <div style={styles.codexItem} className="game-card">
                      <strong style={{ color: 'var(--accent-secondary)', fontSize: '0.8rem' }}>6. Heap Chimera:</strong>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Focuses on heap construction bounds (O(N)), Min/Max heap root index locations (0), and insertions (O(log N)).</span>
                    </div>
                    <div style={styles.codexItem} className="game-card">
                      <strong style={{ color: 'var(--accent-secondary)', fontSize: '0.8rem' }}>7. Graph Wyrm:</strong>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Focuses on BFS queuing, DFS backtracking recursion, V-1 tree edges, and adjacency list worst-case checks (O(V+E)).</span>
                    </div>
                    <div style={styles.codexItem} className="game-card">
                      <strong style={{ color: 'var(--accent-secondary)', fontSize: '0.8rem' }}>8. Dijkstra Dragon:</strong>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Focuses on single-source paths, negative edge weights conflicts, and priority queue optimizations (O(E log V)).</span>
                    </div>
                  </div>
                </div>
              )}

              {codexTab === 'decrypt' && (
                <div>
                  <h4 style={{ color: 'var(--accent-secondary)', fontWeight: 'bold', marginBottom: '8px', fontSize: '0.9rem' }}>🔎 CODE DECRYPTOR - COMPILER THREAT REGISTRY</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Learn to audit source files like a security analyst. Here are common SDE compilation threats:
                  </p>
                  <div style={styles.codexGrid}>
                    <div style={styles.codexItem} className="game-card">
                      <strong style={{ color: 'var(--accent-secondary)', fontSize: '0.8rem' }}>🐛 Null Pointer / Leaks:</strong>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Occurs when assigning core headers or credentials statically to null, or expanding dynamic vectors without deleting pointers.</span>
                    </div>
                    <div style={styles.codexItem} className="game-card">
                      <strong style={{ color: 'var(--accent-secondary)', fontSize: '0.8rem' }}>💀 SQL Concatenations:</strong>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Building database statements via raw string additions allows injections. Remedy using parameterized inputs ($1, ?).</span>
                    </div>
                    <div style={styles.codexItem} className="game-card">
                      <strong style={{ color: 'var(--accent-secondary)', fontSize: '0.8rem' }}>👾 Concurrency Mutex Locks:</strong>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Iterating dictionary keys or collections directly while deleting items in multiple threads throws runtime exceptions.</span>
                    </div>
                    <div style={styles.codexItem} className="game-card">
                      <strong style={{ color: 'var(--accent-secondary)', fontSize: '0.8rem' }}>🛡️ Stack Overflows:</strong>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Using raw functions like strcpy copies streams indiscriminately. Use safe limits bound calls.</span>
                    </div>
                  </div>
                </div>
              )}

              {codexTab === 'escape' && (
                <div>
                  <h4 style={{ color: 'var(--accent-secondary)', fontWeight: 'bold', marginBottom: '8px', fontSize: '0.9rem' }}>🔑 SQL CRYPTOGRAPHY - DATABASE GATEWAYS SHEET</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Escape room panels verify queries dynamically. Review these query structures:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={styles.codeSnippet} className="game-card">
                      <code style={{ color: '#00F3FF', fontSize: '0.8rem' }}>SELECT * FROM security_cameras WHERE status = 'OFFLINE';</code>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Queries offline security locks.</span>
                    </div>
                    <div style={styles.codeSnippet} className="game-card">
                      <code style={{ color: '#00F3FF', fontSize: '0.8rem' }}>SELECT access_code FROM employees JOIN badge_registry ON employees.emp_id = badge_registry.emp_id WHERE name = 'Thomas Anderson';</code>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Binds multiple tables on matching fields recursively.</span>
                    </div>
                  </div>
                </div>
              )}

              {codexTab === 'tycoon' && (
                <div>
                  <h4 style={{ color: 'var(--accent-secondary)', fontWeight: 'bold', marginBottom: '8px', fontSize: '0.9rem' }}>🎓 SEMESTER BALANCING MANUAL</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Surviving campus semesters requires balancing energy and learning metrics:
                  </p>
                  <div style={styles.codexGrid}>
                    <div style={styles.codexItem} className="game-card">
                      <strong style={{ color: 'var(--accent-secondary)', fontSize: '0.8rem' }}>🛌 Hostel Rests:</strong>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Energy drops when coding or studying. Take naps or watch podcasts to restore energy.</span>
                    </div>
                    <div style={styles.codexItem} className="game-card">
                      <strong style={{ color: 'var(--accent-secondary)', fontSize: '0.8rem' }}>📚 Library DSA:</strong>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Solve Big-O puzzles to raise DSA scores and CGPA scales.</span>
                    </div>
                    <div style={styles.codexItem} className="game-card">
                      <strong style={{ color: 'var(--accent-secondary)', fontSize: '0.8rem' }}>🛍️ Tech Upgrades:</strong>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Buy SSD rigs or workstations from the shop to compile typing simulator scripts double-time.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Daily Login Reward Calendar Modal */}
      <DailyRewardModal 
        isOpen={dailyRewardModalOpen} 
        onClose={() => setDailyRewardModalOpen(false)} 
      />

      {/* Centralized BGM & Sound Controller Widget */}
      <div style={styles.musicWidget}>
        <div style={styles.musicHeader}>
          <Music size={14} color="var(--accent-secondary)" className="pulse-glow-animation" />
          <span style={styles.musicWidgetTitle}>METROPOLIS RADIO</span>
          <span style={{ fontSize: '0.6rem', color: isMuted ? 'var(--danger-color)' : activeTrack === 'none' ? 'var(--text-secondary)' : 'var(--success-color)', textTransform: 'uppercase', fontWeight: 'bold' }}>
            {isMuted ? 'Muted' : activeTrack === 'none' ? 'Stopped' : 'On Air'}
          </span>
        </div>
        
        {/* Track Selection Buttons */}
        <div style={styles.trackList}>
          <button 
            style={{ 
              ...styles.trackBtn, 
              borderColor: activeTrack === 'lofi' ? 'var(--accent-secondary)' : 'rgba(255,255,255,0.06)', 
              color: activeTrack === 'lofi' ? 'var(--accent-secondary)' : 'var(--text-secondary)',
              boxShadow: activeTrack === 'lofi' ? 'var(--glow-secondary)' : 'none'
            }}
            onClick={() => setTrack('lofi')}
          >
            ☕ Lofi Coding Beats
          </button>
          <button 
            style={{ 
              ...styles.trackBtn, 
              borderColor: activeTrack === 'jazz' ? 'var(--accent-color)' : 'rgba(255,255,255,0.06)', 
              color: activeTrack === 'jazz' ? 'var(--accent-color)' : 'var(--text-secondary)',
              boxShadow: activeTrack === 'jazz' ? 'var(--glow-accent)' : 'none'
            }}
            onClick={() => setTrack('jazz')}
          >
            🎷 Corporate Jazz
          </button>
          <button 
            style={{ 
              ...styles.trackBtn, 
              borderColor: activeTrack === 'chiptune' ? 'var(--success-color)' : 'rgba(255,255,255,0.06)', 
              color: activeTrack === 'chiptune' ? 'var(--success-color)' : 'var(--text-secondary)',
              boxShadow: activeTrack === 'chiptune' ? 'var(--glow-success)' : 'none'
            }}
            onClick={() => setTrack('chiptune')}
          >
            👾 Retro Chiptune
          </button>
        </div>

        {/* Volume & Audio State Controls */}
        <div style={styles.musicControlsRow}>
          <button 
            style={styles.playPauseBtn} 
            onClick={() => setTrack(activeTrack === 'none' ? 'lofi' : 'none')}
            title={activeTrack === 'none' ? "Play Radio" : "Pause Radio"}
          >
            {activeTrack === 'none' ? <Play size={10} fill="currentColor" /> : <Pause size={10} fill="currentColor" />}
          </button>
          
          <button style={styles.muteBtn} onClick={toggleAudio} title={isMuted ? "Unmute All" : "Mute All"}>
            {isMuted ? <VolumeX size={14} color="var(--danger-color)" /> : <Volume2 size={14} color="var(--accent-secondary)" />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
            <input 
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={bgmVolume}
              onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
              style={styles.volumeSlider}
            />
          </div>
        </div>

        {/* Visualizer bars */}
        {activeTrack !== 'none' && !isMuted && (
          <div style={styles.visualizerContainer}>
            <div className="bar animate-bar-1"></div>
            <div className="bar animate-bar-2"></div>
            <div className="bar animate-bar-3"></div>
            <div className="bar animate-bar-4"></div>
            <div className="bar animate-bar-5"></div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to convert hex to RGB values for transparent borders
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
    : '255, 255, 255';
}

const styles = {
  container: {
    padding: '2.5rem',
    overflowY: 'auto',
    height: 'calc(100vh - 70px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem',
  },
  welcomeBanner: {
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: '1',
    minWidth: '300px',
    gap: '0.5rem',
  },
  cityBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: 'var(--accent-secondary)',
    border: '1px solid var(--accent-secondary)',
    padding: '4px 12px',
    borderRadius: '4px',
    letterSpacing: '3px',
    boxShadow: 'var(--glow-secondary)',
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
  },
  cityTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '2.5rem',
    fontWeight: '800',
    letterSpacing: '4px',
    marginTop: '0.5rem',
  },
  cityDesc: {
    color: 'var(--text-secondary)',
    maxWidth: '600px',
    fontSize: '0.95rem',
    lineHeight: '1.5',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '2rem',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  card: {
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '280px',
    backgroundColor: 'rgba(19, 23, 34, 0.65)',
    backdropFilter: 'blur(8px)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconWrapper: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
  },
  difficultyBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.05)',
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  cardBody: {
    margin: '1.5rem 0',
  },
  cardTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.25rem',
    fontWeight: '700',
    letterSpacing: '1px',
    marginBottom: '0.25rem',
  },
  cardSubtitle: {
    fontSize: '0.8rem',
    fontFamily: 'var(--font-mono)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '0.75rem',
  },
  cardDesc: {
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    lineHeight: '1.5',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  rewardBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.8rem',
    color: '#EAB308',
    fontWeight: '700',
    fontFamily: 'var(--font-mono)',
  },
  enterBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.7rem',
    letterSpacing: '1px',
  },
  glowBacklight: {
    position: 'absolute',
    bottom: '-30px',
    right: '-30px',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    filter: 'blur(50px)',
    opacity: 0.12,
    pointerEvents: 'none',
    transition: 'all 0.3s ease',
  },
  dailyBoard: {
    backgroundColor: 'rgba(6, 182, 212, 0.03)',
    border: '1px dashed rgba(6, 182, 212, 0.15)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem 2rem',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    backdropFilter: 'blur(4px)',
  },
  dailyHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  dailyTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '0.85rem',
    letterSpacing: '2px',
    color: 'var(--accent-secondary)',
  },
  dailyMission: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  dailyMissionText: {
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
  },
  dailyBtn: {
    padding: '0.4rem 1rem',
    fontSize: '0.75rem',
    borderColor: 'var(--accent-secondary)',
    color: 'var(--accent-secondary)',
    boxShadow: 'var(--glow-secondary)',
  },
  headerLayoutRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    gap: '2rem',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    flexWrap: 'wrap',
  },
  rightLeaderboardCard: {
    backgroundColor: 'rgba(19, 23, 34, 0.8)',
    border: '1px solid rgba(0, 243, 255, 0.15)',
    boxShadow: 'var(--glow-accent-dim)',
    borderRadius: '12px',
    padding: '0.85rem 1.1rem',
    width: '320px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    backdropFilter: 'blur(8px)',
  },
  rightLeaderboardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.4rem',
  },
  rightLeaderboardMainTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '0.75rem',
    fontWeight: '800',
    letterSpacing: '0.8px',
    color: 'var(--accent-secondary)',
  },
  rightLeaderboardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  rightLeaderboardRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    padding: '0.4rem 0.6rem',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.02)',
    transition: 'all 0.15s ease',
  },
  rightRankBadge: {
    fontSize: '0.7rem',
    width: '18px',
    textAlign: 'center',
    fontFamily: 'var(--font-mono)',
    fontWeight: 'bold',
  },
  rightAvatar: {
    fontSize: '0.95rem',
  },
  rightName: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#FFF',
  },
  rightHandle: {
    fontSize: '0.6rem',
    color: 'var(--text-secondary)',
    marginTop: '1px',
  },
  rightXp: {
    fontSize: '0.75rem',
    fontWeight: 'bold',
    fontFamily: 'var(--font-mono)',
    color: 'var(--accent-color)',
  },
  expandBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--accent-secondary)',
    fontSize: '0.65rem',
    fontWeight: '700',
    cursor: 'pointer',
    padding: '4px 0 0 0',
    textAlign: 'center',
    transition: 'color 0.2s ease',
    outline: 'none',
  },
  leaderboardPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    padding: '6px 14px',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    minWidth: '180px',
  },
  pillRankBadge: {
    fontWeight: 'bold',
  },
  pillAvatar: {
    fontSize: '1rem',
  },
  pillInfo: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  pillName: {
    fontWeight: 'bold',
    color: '#FFF',
    lineHeight: '1.2',
  },
  pillRank: {
    fontSize: '0.55rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
  },
  pillXp: {
    fontWeight: 'bold',
    color: '#00F3FF',
    marginLeft: 'auto',
  },
  codexModal: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(5, 7, 12, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '2rem',
  },
  codexContent: {
    maxWidth: '850px',
    width: '100%',
    maxHeight: '85vh',
    height: '100%',
    backgroundColor: 'var(--bg-secondary)',
    border: '2px solid var(--accent-secondary)',
    borderRadius: '16px',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    boxShadow: 'var(--glow-secondary)',
  },
  codexHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '1rem',
  },
  codexTabs: {
    display: 'flex',
    gap: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  codexTabBtn: {
    background: 'none',
    border: 'none',
    padding: '8px 16px',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-title)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  codexBody: {
    flex: 1,
    overflowY: 'auto',
    textAlign: 'left',
    paddingRight: '8px',
  },
  codexGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  codexItem: {
    padding: '1rem',
    backgroundColor: 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
  },
  codeSnippet: {
    padding: '12px 18px',
    backgroundColor: '#05070c',
    border: '1px solid rgba(0, 243, 255, 0.15)',
    borderRadius: '6px',
    fontFamily: 'var(--font-mono)',
  },
  musicWidget: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '300px',
    backgroundColor: 'rgba(19, 23, 34, 0.85)',
    backdropFilter: 'blur(12px)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    boxShadow: 'var(--shadow)',
    padding: '1.25rem',
    zIndex: 99,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'all 0.3s ease',
  },
  musicHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '8px',
  },
  musicWidgetTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
    letterSpacing: '1px',
    flex: 1,
    marginLeft: '8px',
    textAlign: 'left',
  },
  trackList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  trackBtn: {
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '0.7rem',
    textAlign: 'left',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
  musicControlsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '4px',
  },
  playPauseBtn: {
    backgroundColor: 'var(--accent-color)',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#000',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  muteBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeSlider: {
    width: '100%',
    accentColor: 'var(--accent-secondary)',
    height: '4px',
    cursor: 'pointer',
  },
  visualizerContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: '4px',
    height: '24px',
    marginTop: '6px',
  }
};
