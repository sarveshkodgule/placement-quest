import React, { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { 
  playSlashSound, 
  playSpellSound, 
  playExplosionSound, 
  playCoinSound, 
  playVictorySound, 
  playDefeatSound,
  playKeyClick,
  playAlarmSound,
  playCyberBgm,
  stopCyberBgm
} from './utils/audio';
import { Terminal, Database, Key, ShieldAlert, Award, Play, ChevronRight, HelpCircle, CheckCircle2, Heart, Folder, UserCheck, Shield, Volume2, VolumeX } from 'lucide-react';

const DB_SCHEMAS = {
  security_cameras: {
    columns: [
      { name: 'camera_id', type: 'INT (PK)' },
      { name: 'location', type: 'VARCHAR' },
      { name: 'status', type: 'VARCHAR' },
      { name: 'last_ping', type: 'DATETIME' }
    ],
    data: [
      { camera_id: 101, location: 'MAIN_GATE', status: 'ACTIVE', last_ping: '2026-06-06 11:00:00' },
      { camera_id: 102, location: 'BACK_ALLEY', status: 'OFFLINE', last_ping: '2026-06-06 02:14:10' },
      { camera_id: 103, location: 'SERVER_CORRIDOR', status: 'OFFLINE', last_ping: '2026-06-06 04:30:00' },
      { camera_id: 104, location: 'VAULT_ENTRANCE', status: 'ACTIVE', last_ping: '2026-06-06 11:05:00' }
    ]
  },
  network_logs: {
    columns: [
      { name: 'log_id', type: 'INT (PK)' },
      { name: 'ip_address', type: 'VARCHAR' },
      { name: 'action', type: 'VARCHAR' },
      { name: 'port', type: 'INT' }
    ],
    data: [
      { log_id: 201, ip_address: '192.168.1.15', action: 'ALLOW', port: 80 },
      { log_id: 202, ip_address: '192.168.4.89', action: 'DENIED', port: 22 },
      { log_id: 203, ip_address: '10.0.0.4', action: 'ALLOW', port: 443 },
      { log_id: 204, ip_address: '192.168.4.112', action: 'DENIED', port: 3389 }
    ]
  },
  employees: {
    columns: [
      { name: 'emp_id', type: 'INT (PK)' },
      { name: 'name', type: 'VARCHAR' },
      { name: 'dept', type: 'VARCHAR' },
      { name: 'role', type: 'VARCHAR' }
    ],
    data: [
      { emp_id: 1, name: 'Sarah Connor', dept: 'Operations', role: 'Operator' },
      { emp_id: 2, name: 'Thomas Anderson', dept: 'IT', role: 'Security' },
      { emp_id: 3, name: 'Trinity V', dept: 'IT', role: 'Manager' }
    ]
  },
  badge_registry: {
    columns: [
      { name: 'emp_id', type: 'INT (FK)' },
      { name: 'access_code', type: 'VARCHAR' },
      { name: 'clearance_level', type: 'INT' }
    ],
    data: [
      { emp_id: 1, access_code: 'ORION_7792', clearance_level: 4 },
      { emp_id: 2, access_code: 'NEO_1011', clearance_level: 2 },
      { emp_id: 3, access_code: 'TRIN_8891', clearance_level: 5 }
    ]
  },
  guard_patrols: {
    columns: [
      { name: 'patrol_id', type: 'INT (PK)' },
      { name: 'guard_name', type: 'VARCHAR' },
      { name: 'zone', type: 'VARCHAR' },
      { name: 'shifts', type: 'VARCHAR' }
    ],
    data: [
      { patrol_id: 401, guard_name: 'Agent Brown', zone: 'ZONE_A', shifts: 'MIDNIGHT' },
      { patrol_id: 402, guard_name: 'Agent Jones', zone: 'ZONE_B', shifts: 'MIDNIGHT' }
    ]
  },
  access_logs: {
    columns: [
      { name: 'log_id', type: 'INT (PK)' },
      { name: 'username', type: 'VARCHAR' },
      { name: 'session_id', type: 'VARCHAR' }
    ],
    data: [
      { log_id: 501, username: 'smith_admin', session_id: 'SESS_991' },
      { log_id: 502, username: 'thomas_sec', session_id: 'SESS_112' },
      { log_id: 503, username: 'trinity_op', session_id: 'SESS_556' }
    ]
  },
  database_backups: {
    columns: [
      { name: 'session_id', type: 'VARCHAR (FK)' },
      { name: 'backup_size_mb', type: 'INT' },
      { name: 'status', type: 'VARCHAR' }
    ],
    data: [
      { session_id: 'SESS_991', backup_size_mb: 850, status: 'DOWNLOADED' },
      { session_id: 'SESS_112', backup_size_mb: 45, status: 'COMPLETED' },
      { session_id: 'SESS_556', backup_size_mb: 210, status: 'COMPLETED' }
    ]
  },
  system_audit: {
    columns: [
      { name: 'audit_id', type: 'INT (PK)' },
      { name: 'event_type', type: 'VARCHAR' },
      { name: 'event_time', type: 'VARCHAR' }
    ],
    data: [
      { audit_id: 601, event_type: 'LOGIN_FAIL', event_time: '2026-06-04' },
      { audit_id: 602, event_type: 'LOGIN_FAIL', event_time: '2026-06-03' },
      { audit_id: 603, event_type: 'LOGIN_SUCCESS', event_time: '2026-06-05' }
    ]
  },
  financial_ledger: {
    columns: [
      { name: 'tx_id', type: 'INT (PK)' },
      { name: 'account_id', type: 'VARCHAR' },
      { name: 'type', type: 'VARCHAR' },
      { name: 'amount', type: 'INT' }
    ],
    data: [
      { tx_id: 701, account_id: 'AC_9981', type: 'UNAUTHORIZED', amount: 15000 },
      { tx_id: 702, account_id: 'AC_9981', type: 'UNAUTHORIZED', amount: 35000 },
      { tx_id: 703, account_id: 'AC_1122', type: 'AUTHORIZED', amount: 5000 }
    ]
  },
  login_attempts: {
    columns: [
      { name: 'attempt_id', type: 'INT (PK)' },
      { name: 'username', type: 'VARCHAR' },
      { name: 'status', type: 'VARCHAR' }
    ],
    data: [
      { attempt_id: 801, username: 'agent_smith', status: 'FAILED' },
      { attempt_id: 802, username: 'agent_smith', status: 'FAILED' },
      { attempt_id: 803, username: 'agent_smith', status: 'FAILED' },
      { attempt_id: 804, username: 'agent_smith', status: 'FAILED' },
      { attempt_id: 805, username: 'agent_smith', status: 'FAILED' },
      { attempt_id: 806, username: 'agent_smith', status: 'FAILED' },
      { attempt_id: 807, username: 'thomas_sec', status: 'FAILED' }
    ]
  },
  laser_grid: {
    columns: [
      { name: 'grid_id', type: 'INT (PK)' },
      { name: 'sector', type: 'VARCHAR' },
      { name: 'voltage', type: 'INT' }
    ],
    data: [
      { grid_id: 901, sector: 'SECTOR_9', voltage: 220 },
      { grid_id: 902, sector: 'SECTOR_9', voltage: 180 },
      { grid_id: 903, sector: 'SECTOR_10', voltage: 240 }
    ]
  },
  vault_status: {
    columns: [
      { name: 'vault_id', type: 'INT (PK)' },
      { name: 'lockout', type: 'INT' }
    ],
    data: [
      { vault_id: 1, lockout: 1 }
    ]
  },
  money_ledgers: {
    columns: [
      { name: 'wallet', type: 'VARCHAR (PK)' },
      { name: 'balance', type: 'INT' }
    ],
    data: [
      { wallet: 'ESCROW_WALLET', balance: 10000 },
      { wallet: 'OPERATOR_WALLET', balance: 500 }
    ]
  }
};

const CASES = [
  {
    level: 1,
    title: 'Offline Security Loops',
    targetTable: 'security_cameras',
    desc: 'The corporate security cameras are locking us out. Locate all security cameras that are currently offline so our infiltration squad can slip in.',
    instructions: 'Write a query to SELECT all columns from `security_cameras` where the `status` is OFFLINE.',
    hint: "SELECT * FROM security_cameras WHERE status = 'OFFLINE';",
    clue: 'Found camera loop IDs 102 and 103 offline, revealing guard blind spots.'
  },
  {
    level: 2,
    title: 'Tracing the Intruder',
    targetTable: 'network_logs',
    desc: 'An rogue probe hit the firewall. Scan the network logs to isolate blocked entries coming from the unindexed 192.168.4.* address subnet.',
    instructions: 'SELECT all columns from `network_logs` where `ip_address` starts with 192.168.4. and the `action` is DENIED.',
    hint: "SELECT * FROM network_logs WHERE ip_address LIKE '192.168.4.%' AND action = 'DENIED';",
    clue: 'Located active denial logs from Thomas Anderson’s cyber terminal.'
  },
  {
    level: 3,
    title: 'Sarah’s Passcode Access',
    targetTable: 'employees',
    desc: 'We need to forge a lobby clearance badge. Retrieve Sarah Connor\'s personal security access code by merging employees and badge records.',
    instructions: 'SELECT `access_code` from `employees` joined with `badge_registry` on `emp_id` where employee name is Sarah Connor.',
    hint: "SELECT access_code FROM employees JOIN badge_registry ON employees.emp_id = badge_registry.emp_id WHERE name = 'Sarah Connor';",
    clue: 'Lobby entry passcode decrypted: ORION_7792'
  },
  {
    level: 4,
    title: 'Disabling Patrol Shifts',
    targetTable: 'guard_patrols',
    desc: 'Guard patrols are blocking the elevator shaft. Rewrite guard routing schedules to move all midnight patrols out of ZONE_A into ZONE_C.',
    instructions: 'Write an UPDATE query setting the `zone` to ZONE_C for guards currently assigned to ZONE_A.',
    hint: "UPDATE guard_patrols SET zone = 'ZONE_C' WHERE zone = 'ZONE_A';",
    clue: 'Elevator guard schedule manipulated. Relocated Agent Brown away from the vault access shaft.'
  },
  {
    level: 5,
    title: 'The Database Leak',
    targetTable: 'access_logs',
    desc: 'An administrator leaked core database backups. Find the administrator username who downloaded a backup larger than 500MB.',
    instructions: 'Join `access_logs` and `database_backups` on `session_id` to SELECT the `username` where the backup size is greater than 500MB.',
    hint: "SELECT username FROM access_logs JOIN database_backups ON access_logs.session_id = database_backups.session_id WHERE backup_size_mb > 500;",
    clue: 'Identified corrupted admin username: smith_admin.'
  },
  {
    level: 6,
    title: 'Wiping Audit Evidence',
    targetTable: 'system_audit',
    desc: 'Delete previous failed login attempts logged before 2026-06-05 to clear the access traces.',
    instructions: 'Delete rows from `system_audit` where `event_type` is LOGIN_FAIL and `event_time` is before 2026-06-05.',
    hint: "DELETE FROM system_audit WHERE event_type = 'LOGIN_FAIL' AND event_time < '2026-06-05';",
    clue: 'Security audit scrubbed clean. 2 breach logs eradicated.'
  },
  {
    level: 7,
    title: 'Ledger Theft Audit',
    targetTable: 'financial_ledger',
    desc: 'Calculate the total volume of stolen cash transferred during the breach from ledger account AC_9981.',
    instructions: 'Write a query to calculate the SUM of the `amount` values from `financial_ledger` where account ID is AC_9981 and transaction type is UNAUTHORIZED.',
    hint: "SELECT SUM(amount) FROM financial_ledger WHERE account_id = 'AC_9981' AND type = 'UNAUTHORIZED';",
    clue: 'Total ledger theft verified: 50,000 credits.'
  },
  {
    level: 8,
    title: 'Brute-Force Detection',
    targetTable: 'login_attempts',
    desc: 'A terminal is executing a dictionary brute-force. Group login attempts by username to expose nodes with more than 5 failed attempts.',
    instructions: 'SELECT the `username` and COUNT(*) of attempts from `login_attempts`, grouping by `username` and filtering where count is greater than 5.',
    hint: "SELECT username, COUNT(*) FROM login_attempts GROUP BY username HAVING COUNT(*) > 5;",
    clue: 'Exposed attacker node: agent_smith (6 attempts).'
  },
  {
    level: 9,
    title: 'Laser Overrides',
    targetTable: 'laser_grid',
    desc: 'Deactivate the security laser grid blocking the mainframe room. Disable grid nodes inside SECTOR_9 by resetting their voltage to 0.',
    instructions: 'UPDATE the `laser_grid` table setting `voltage` to 0 where the grid `sector` is SECTOR_9.',
    hint: "UPDATE laser_grid SET voltage = 0 WHERE sector = 'SECTOR_9';",
    clue: 'Vault security grid bypassed. mainframe lasers powered down.'
  },
  {
    level: 10,
    title: 'The Vault Cashout (Transaction)',
    targetTable: 'vault_status',
    desc: 'Breach the vault database lock and finalize the funds wire transfer in a single transaction block. If your query fails, you must execute a ROLLBACK immediately to avoid locking the terminal.',
    instructions: 'Type BEGIN TRANSACTION; followed by updating `vault_status` setting `lockout` to 0, updating `money_ledgers` adding 500000 to balance of ESCROW_WALLET, and then COMMIT;.',
    hint: "BEGIN TRANSACTION; UPDATE vault_status SET lockout = 0; UPDATE money_ledgers SET balance = balance + 500000 WHERE wallet = 'ESCROW_WALLET'; COMMIT;",
    clue: 'Main vault fully decrypted! 500,000 credits routed to ESCROW_WALLET.'
  }
];

export default function SqlHeist() {
  const { coins, addCoins, addXP, setGame, completeDailyChallenge, triggerNotification } = usePlayerStore();

  const decryptSolution = () => {
    if (coins < 50) {
      triggerNotification('❌ Insufficient Coins', 'You need 50 SDE Coins to decrypt this solution.', '🪙');
      return;
    }
    
    addCoins(-50);
    setQueryInput(activeCase.hint);
    triggerNotification('🔓 Code Decrypted', 'The correct query has been filled in the editor!', '💻');
  };

  const [levelIndex, setLevelIndex] = useState(0);
  const [battleState, setBattleState] = useState('lobby'); // 'lobby', 'briefing', 'hacking', 'incoming', 'complete', 'gameover'
  
  // Shuffled dynamic cases list from MongoDB
  const [casesList, setCasesList] = useState(CASES);

  useEffect(() => {
    const SQL_CASE_ORDER = [
      'Offline Security Loops',
      'Tracing the Intruder',
      'Sarah’s Passcode Access',
      'High Density Departments',
      'Unassigned Rogue Agents',
      'Disabling Patrol Shifts',
      'The Database Leak',
      'Wiping Audit Evidence',
      'Ledger Theft Audit',
      'Brute-Force Detection',
      'Laser Overrides',
      'The Vault Cashout (Transaction)'
    ];

    const solvedIds = localStorage.getItem('solved_question_ids_sql-heist') || '';
    fetch(`${window.API_BASE_URL || (window.API_BASE_URL || 'http://localhost:5000')}/api/questions?category=sql-heist&excludeIds=${solvedIds}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.questions && data.questions.length > 0) {
          // Sort questions according to standard level progression order
          const sortedQuestions = [...data.questions].sort((a, b) => {
            const titleA = a.extraDetails?.title || '';
            const titleB = b.extraDetails?.title || '';
            const idxA = SQL_CASE_ORDER.indexOf(titleA);
            const idxB = SQL_CASE_ORDER.indexOf(titleB);
            const orderA = idxA === -1 ? 999 : idxA;
            const orderB = idxB === -1 ? 999 : idxB;
            return orderA - orderB;
          });

          const mappedCases = sortedQuestions.map((q, idx) => ({
            level: idx + 1,
            title: q.extraDetails?.title || `Case #${idx + 1}`,
            targetTable: q.extraDetails?.targetTable || 'security_cameras',
            desc: q.extraDetails?.desc || q.question,
            instructions: q.extraDetails?.instructions || q.question,
            hint: q.tip,
            clue: q.extraDetails?.clue || 'Evidence scrubbed.',
            _id: q._id
          }));
          setCasesList(mappedCases);
        }
      })
      .catch(() => {});
  }, [battleState === 'lobby']);
  
  // Dynamic virtual DB state mimicking database changes
  const [virtualDb, setVirtualDb] = useState(JSON.parse(JSON.stringify(DB_SCHEMAS)));
  
  const [queryInput, setQueryInput] = useState('SELECT * FROM security_cameras;');
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [activeTab, setActiveTab] = useState('map'); // 'map', 'board', 'preview'
  const [previewTableName, setPreviewTableName] = useState('security_cameras');
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Game limits
  const [playerShields, setPlayerShields] = useState(3);
  const [unlockedClues, setUnlockedClues] = useState([]);
  const [isMuted, setIsMuted] = useState(false);

  const speakText = (text) => {
    if (isMuted) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 0.85; // Lower pitch for terminal system AI
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  // Level 10 Timer
  const [timeLeft, setTimeLeft] = useState(40);
  const [inTransaction, setInTransaction] = useState(false);
  const transactionState = useRef(null); // Stores temporary changes before COMMIT

  const canvasRef = useRef(null);
  const hoveredNode = useRef(null);

  const activeCase = casesList[levelIndex] || casesList[0];

  // Map nodes definitions
  const nodes = [
    { id: 'employees', x: 80, y: 50, name: 'employees' },
    { id: 'badge_registry', x: 80, y: 140, name: 'badge_registry' },
    { id: 'security_cameras', x: 230, y: 50, name: 'security_cameras' },
    { id: 'access_logs', x: 230, y: 140, name: 'access_logs' },
    { id: 'database_backups', x: 230, y: 230, name: 'database_backups' },
    { id: 'network_logs', x: 380, y: 50, name: 'network_logs' },
    { id: 'guard_patrols', x: 380, y: 140, name: 'guard_patrols' },
    { id: 'system_audit', x: 80, y: 230, name: 'system_audit' },
    { id: 'financial_ledger', x: 530, y: 50, name: 'financial_ledger' },
    { id: 'login_attempts', x: 530, y: 140, name: 'login_attempts' },
    { id: 'laser_grid', x: 530, y: 230, name: 'laser_grid' },
    { id: 'vault_status', x: 380, y: 230, name: 'vault_status' },
    { id: 'money_ledgers', x: 380, y: 310, name: 'money_ledgers' }
  ];

  // Handle continuous BGM
  useEffect(() => {
    if (!isMuted) {
      playCyberBgm();
    } else {
      stopCyberBgm();
    }
    return () => stopCyberBgm();
  }, [isMuted]);

  // Level 10 countdown timer
  useEffect(() => {
    if (battleState === 'hacking' && levelIndex === 9 && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [battleState, levelIndex, timeLeft]);

  const handleTimeout = () => {
    if (!isMuted) playAlarmSound();
    setPlayerShields((prev) => {
      const next = Math.max(0, prev - 1);
      if (next <= 0) {
        setBattleState('gameover');
        addXP(10 * (levelIndex + 1)); // Partial XP on failure
      } else {
        setErrorMsg('🚨 TRANSACTIONS TIMEOUT: Vault Lockout Triggered. Connection reset.');
        setTimeLeft(40);
        setInTransaction(false);
        transactionState.current = null;
      }
      return next;
    });
  };

  const handleEditorChange = (e) => {
    setQueryInput(e.target.value);
    playKeyClick();
  };

  // Canvas drawing for schema map
  useEffect(() => {
    if (activeTab === 'map') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      let frame = 0;

      const drawMap = () => {
        frame++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Connections (glitches/neon style lines)
        ctx.strokeStyle = 'rgba(57, 255, 20, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        // employees <-> badge_registry (emp_id)
        ctx.moveTo(80, 50); ctx.lineTo(80, 140);
        // access_logs <-> database_backups (session_id)
        ctx.moveTo(230, 140); ctx.lineTo(230, 230);
        // vault_status <-> money_ledgers
        ctx.moveTo(380, 230); ctx.lineTo(380, 310);
        ctx.stroke();

        // Draw nodes
        nodes.forEach((node) => {
          const isHovered = hoveredNode.current === node.id;
          const isActive = previewTableName === node.id;

          ctx.save();
          ctx.translate(node.x, node.y);

          // Node shadow glow
          ctx.shadowBlur = isHovered || isActive ? 12 : 4;
          ctx.shadowColor = isActive ? '#00F3FF' : '#39FF14';

          // Node body
          ctx.fillStyle = isActive ? 'rgba(0, 243, 255, 0.15)' : 'rgba(57, 255, 20, 0.05)';
          ctx.strokeStyle = isActive ? '#00F3FF' : isHovered ? '#39FF14' : 'rgba(57, 255, 20, 0.4)';
          ctx.lineWidth = isActive || isHovered ? 2 : 1;

          ctx.beginPath();
          ctx.roundRect(-45, -15, 90, 30, 4);
          ctx.fill();
          ctx.stroke();

          // Text label
          ctx.fillStyle = isActive ? '#00F3FF' : '#39FF14';
          ctx.font = '9px Orbitron, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(node.name, 0, 3);

          ctx.restore();
        });
      };

      const loop = setInterval(drawMap, 80);
      return () => clearInterval(loop);
    }
  }, [activeTab, previewTableName]);

  // Handle canvas mouse move
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let found = null;
    nodes.forEach((n) => {
      if (mx >= n.x - 45 && mx <= n.x + 45 && my >= n.y - 15 && my <= n.y + 15) {
        found = n.id;
      }
    });
    hoveredNode.current = found;
  };

  const handleCanvasClick = () => {
    if (hoveredNode.current) {
      setPreviewTableName(hoveredNode.current);
      setActiveTab('preview');
      if (!isMuted) playKeyClick();
    }
  };

  // Launch brief
  const enterBriefing = () => {
    setPlayerShields(3);
    setErrorMsg(null);
    setTerminalOutput([]);
    setBattleState('briefing');
    if (!isMuted) playKeyClick();
    speakText(`Breach Case ${activeCase.level} loaded: ${activeCase.title}. Inspecting target database.`);
  };

  const startMission = () => {
    setBattleState('hacking');
    if (!isMuted) playKeyClick();
    speakText("Hacking terminal active. Input your decryption query statement.");
  };

  // SQL Evaluator Compiler Simulator
  const executeQuery = () => {
    setErrorMsg(null);
    const query = queryInput.trim().replace(/\s+/g, ' ').toUpperCase();

    // Check lives
    if (playerShields <= 0) return;

    // Command Validation
    if (!query.startsWith('SELECT') && !query.startsWith('UPDATE') && !query.startsWith('DELETE') && !query.startsWith('BEGIN')) {
      triggerFailure('SQL ERROR: Only SELECT, UPDATE, DELETE, or TRANSACTION controls are allowed.');
      return;
    }

    try {
      let isCorrect = false;
      let displayData = [];
      let nextDb = JSON.parse(JSON.stringify(virtualDb));

      // Add generic query match (for Decrypt button exact fills)
      const cleanUser = queryInput.trim().toLowerCase().replace(/\s+/g, ' ').replace(/;$/, '');
      const cleanCorrect = activeCase.hint.trim().toLowerCase().replace(/\s+/g, ' ').replace(/;$/, '');
      if (cleanUser === cleanCorrect) {
        isCorrect = true;
      }

      switch (activeCase.title) {
        case 'Offline Security Loops':
          if (query.includes('FROM SECURITY_CAMERAS') && (query.includes("STATUS = 'OFFLINE'") || query.includes('STATUS="OFFLINE"'))) {
            isCorrect = true;
          }
          if (isCorrect) displayData = virtualDb.security_cameras.data.filter(c => c.status === 'OFFLINE');
          break;

        case 'Tracing the Intruder':
          if (query.includes('FROM NETWORK_LOGS') && query.includes('IP_ADDRESS LIKE') && query.includes('192.168.4.%') && query.includes("ACTION = 'DENIED'")) {
            isCorrect = true;
          }
          if (isCorrect) displayData = virtualDb.network_logs.data.filter(l => l.ip_address.startsWith('192.168.4.') && l.action === 'DENIED');
          break;

        case 'Sarah’s Passcode Access':
          if (query.includes('JOIN BADGE_REGISTRY') && query.includes('ON') && query.includes("NAME = 'SARAH CONNOR'")) {
            isCorrect = true;
          }
          if (isCorrect) displayData = [{ access_code: 'ORION_7792' }];
          break;

        case 'Disabling Patrol Shifts':
          if (query.includes('UPDATE GUARD_PATROLS') && query.includes("SET ZONE = 'ZONE_C'") && query.includes("WHERE ZONE = 'ZONE_A'")) {
            isCorrect = true;
          }
          if (isCorrect) {
            nextDb.guard_patrols.data = virtualDb.guard_patrols.data.map(g => g.zone === 'ZONE_A' ? { ...g, zone: 'ZONE_C' } : g);
            displayData = nextDb.guard_patrols.data;
          }
          break;

        case 'The Database Leak':
          if (query.includes('JOIN DATABASE_BACKUPS') && query.includes('ON') && query.includes('BACKUP_SIZE_MB > 500')) {
            isCorrect = true;
          }
          if (isCorrect) displayData = [{ username: 'smith_admin' }];
          break;

        case 'Wiping Audit Evidence':
          if (query.includes('DELETE FROM SYSTEM_AUDIT') && query.includes("EVENT_TYPE = 'LOGIN_FAIL'") && query.includes("EVENT_TIME < '2026-06-05'")) {
            isCorrect = true;
          }
          if (isCorrect) {
            nextDb.system_audit.data = virtualDb.system_audit.data.filter(a => !(a.event_type === 'LOGIN_FAIL' && a.event_time < '2026-06-05'));
            displayData = nextDb.system_audit.data;
          }
          break;

        case 'Ledger Theft Audit':
          if (query.includes('SUM(AMOUNT)') && query.includes('FROM FINANCIAL_LEDGER') && query.includes("ACCOUNT_ID = 'AC_9981'") && query.includes("TYPE = 'UNAUTHORIZED'")) {
            isCorrect = true;
          }
          if (isCorrect) displayData = [{ 'SUM(amount)': 50000 }];
          break;

        case 'Brute-Force Detection':
          if (query.includes('GROUP BY USERNAME') && (query.includes('HAVING COUNT(*) > 5') || query.includes('HAVING COUNT(ATTEMPT_ID) > 5'))) {
            isCorrect = true;
          }
          if (isCorrect) displayData = [{ username: 'agent_smith', 'COUNT(*)': 6 }];
          break;

        case 'Laser Overrides':
          if (query.includes('UPDATE LASER_GRID') && query.includes('SET VOLTAGE = 0') && query.includes("WHERE SECTOR = 'SECTOR_9'")) {
            isCorrect = true;
          }
          if (isCorrect) {
            nextDb.laser_grid.data = virtualDb.laser_grid.data.map(l => l.sector === 'SECTOR_9' ? { ...l, voltage: 0 } : l);
            displayData = nextDb.laser_grid.data;
          }
          break;

        case 'High Density Departments':
          if (query.includes('GROUP BY DEPARTMENT') && query.includes('HAVING COUNT(*) > 5')) {
            isCorrect = true;
          }
          if (isCorrect) displayData = [{ department: 'IT', 'COUNT(*)': 2 }];
          break;

        case 'Unassigned Rogue Agents':
          if (query.includes('LEFT JOIN DEPARTMENTS') && query.includes('D.ID IS NULL')) {
            isCorrect = true;
          }
          if (isCorrect) displayData = [{ name: 'Thomas Anderson', dept_name: 'None' }];
          break;

        case 'The Vault Cashout (Transaction)':
          if (query.startsWith('BEGIN')) {
            setInTransaction(true);
            transactionState.current = JSON.parse(JSON.stringify(virtualDb));
            setTerminalOutput([{ status: 'TRANSACTION BUFFER OPENED. AWAITING COMMIT...' }]);
            if (!isMuted) playSpellSound();
            return;
          }

          if (inTransaction && query.startsWith('UPDATE VAULT_STATUS')) {
            transactionState.current.vault_status.data = transactionState.current.vault_status.data.map(v => ({ ...v, lockout: 0 }));
            setTerminalOutput([{ status: 'VAULT LOCKOUT REMOVED. AWAITING COMMIT...' }]);
            return;
          }

          if (inTransaction && query.startsWith('UPDATE MONEY_LEDGERS')) {
            transactionState.current.money_ledgers.data = transactionState.current.money_ledgers.data.map(w => w.wallet === 'ESCROW_WALLET' ? { ...w, balance: w.balance + 500000 } : w);
            setTerminalOutput([{ status: 'LEDGER BALANCE MODIFIED. AWAITING COMMIT...' }]);
            return;
          }

          if (inTransaction && query.startsWith('COMMIT')) {
            isCorrect = true;
            nextDb = transactionState.current;
            displayData = [
              { status: 'TRANSACTION COMMITTED' },
              { lockout: 0, escrow_wallet: '510,000 Credits' }
            ];
            setInTransaction(false);
          }

          if (inTransaction && query.startsWith('ROLLBACK')) {
            setInTransaction(false);
            transactionState.current = null;
            setTerminalOutput([{ status: 'TRANSACTION ROLLED BACK. DATABASE RESTORED.' }]);
            if (!isMuted) playSlashSound();
            return;
          }
          break;

        default:
          if (isCorrect) {
            displayData = [{ status: 'QUERY SUCCESSFUL', rows: 1 }];
          }
          break;
      }

      if (isCorrect) {
        setVirtualDb(nextDb);
        setTerminalOutput(displayData);
        if (!isMuted) playExplosionSound();
        speakText("Query executed successfully. Target decrypted!");

        // Mark as solved!
        if (activeCase._id) {
          const solved = localStorage.getItem('solved_question_ids_sql-heist') || '';
          const newSolved = solved ? solved.split(',') : [];
          if (!newSolved.includes(activeCase._id)) {
            newSolved.push(activeCase._id);
            localStorage.setItem('solved_question_ids_sql-heist', newSolved.join(','));
          }
        }

        // Unlock Evidence
        if (!unlockedClues.includes(activeCase.level)) {
          setUnlockedClues([...unlockedClues, activeCase.level]);
        }

        setTimeout(() => {
          setBattleState('incoming');
        }, 1800);
      } else {
        triggerFailure('COMPILER WARNING: Query executed but target assets were unaffected. Check query constraints.');
      }

    } catch (e) {
      triggerFailure('SYNTAX ERROR: Unexpected token near input parameter.');
    }
  };

  const triggerFailure = (msg) => {
    setErrorMsg(msg);
    if (!isMuted) playAlarmSound();
    speakText("Query check failed. Access denied!");

    setPlayerShields((prev) => {
      const next = Math.max(0, prev - 1);
      if (next <= 0) {
        setBattleState('gameover');
        speakText("Firewall lockdown activated. Connection terminated.");
        addXP(10 * (levelIndex + 1)); // Partial XP on failure
      }
      return next;
    });
  };

  // Advance level or win
  const proceedNext = () => {
    const nextIndex = levelIndex + 1;
    if (nextIndex >= casesList.length) {
      setBattleState('complete');
      addCoins(250);
      addXP(150);
      speakText("Decryption complete! You have cleared all SQL database breach cases!");
      if (localStorage.getItem('active_daily_challenge_game') === 'sql-heist') {
        completeDailyChallenge();
      }
    } else {
      setLevelIndex(nextIndex);
      setQueryInput('');
      setTerminalOutput([]);
      setErrorMsg(null);
      setBattleState('briefing');
      speakText(`Moving to Breach Case ${nextIndex + 1}: ${casesList[nextIndex].title}.`);
    }
  };

  return (
    <div style={styles.container}>
      {/* HUD Mute button */}
      <button style={styles.muteBtn} onClick={() => setIsMuted(!isMuted)}>
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        <span>HACKER SYNTH BGM</span>
      </button>

      {/* 1. LOBBY SPLASH */}
      {battleState === 'lobby' && (
        <div className="game-card animate-float" style={styles.lobbyPanel}>
          <ShieldAlert size={64} color="var(--accent-secondary)" className="float-animation" />
          <h2 style={styles.title}>SQL HEIST: CYBER-DETECTIVE</h2>
          <p style={styles.desc}>
             breaches have corrupted the Silicon City network ledger. Infiltrate databases, map schemas, and execute queries to reveal evidence cards and track database suspects.
          </p>

          <div style={styles.rulesBox}>
            <div style={styles.ruleItem}>🛡️ **Firewall Shields:** You have 3 shields per case. Malformed queries trigger security sweeps.</div>
            <div style={styles.ruleItem}>🗺️ **Interactive Radar Map:** Hover over database schemas to view index columns.</div>
            <div style={styles.ruleItem}>💰 **Payout System:** Complete cases to unlock reputation and rank points. Failure pays out partial XP.</div>
          </div>

          <button className="game-btn game-btn-primary" style={styles.actionBtn} onClick={enterBriefing}>
            <Play size={16} /> INJECT DECRYPTOR
          </button>
        </div>
      )}

      {/* 2. LEVEL BRIEFING */}
      {battleState === 'briefing' && (
        <div className="game-card" style={styles.lobbyPanel}>
          <Key size={64} color="var(--accent-color)" className="float-animation" />
          <h2 style={{ ...styles.title, color: 'var(--accent-color)' }}>
            CASE #{activeCase.level}: {activeCase.title.toUpperCase()}
          </h2>
          <p style={styles.desc}>{activeCase.desc}</p>

          <div style={styles.rulesBox}>
            <h4 style={{ color: 'var(--accent-color)', fontSize: '0.8rem', marginBottom: '4px' }}>OBJECTIVES:</h4>
            <div style={styles.ruleItem}>💻 {activeCase.instructions}</div>
            <div style={{ ...styles.ruleItem, fontSize: '0.75rem', opacity: 0.6, marginTop: '8px' }}>
              💡 Hint: {activeCase.hint}
            </div>
          </div>

          <button className="game-btn game-btn-primary" style={styles.actionBtn} onClick={startMission}>
            PROCEED TO TERMINAL
          </button>
        </div>
      )}

      {/* 3. ACTIVE HACKING TERMINAL */}
      {battleState === 'hacking' && (
        <div style={styles.workspace} className="sql-workspace">
          {/* Left panel: Maps / Board / Preview tabs */}
          <div style={styles.leftPane} className="sql-pane sql-left-pane">
            <div style={styles.tabsHeader}>
              <button 
                style={{ ...styles.tabBtn, color: activeTab === 'map' ? 'var(--accent-color)' : 'var(--text-secondary)', borderBottom: activeTab === 'map' ? '2px solid var(--accent-color)' : 'none' }}
                onClick={() => setActiveTab('map')}
              >
                HOLO_MAP.SYS
              </button>
              <button 
                style={{ ...styles.tabBtn, color: activeTab === 'board' ? 'var(--accent-color)' : 'var(--text-secondary)', borderBottom: activeTab === 'board' ? '2px solid var(--accent-color)' : 'none' }}
                onClick={() => setActiveTab('board')}
              >
                CLUE_BOARD.LOG
              </button>
              <button 
                style={{ ...styles.tabBtn, color: activeTab === 'preview' ? 'var(--accent-color)' : 'var(--text-secondary)', borderBottom: activeTab === 'preview' ? '2px solid var(--accent-color)' : 'none' }}
                onClick={() => setActiveTab('preview')}
              >
                DB_PREVIEW.DAT
              </button>
            </div>

            <div style={styles.tabContent} className="game-card">
              {/* Tab 1: Holographic DB Canvas Map */}
              {activeTab === 'map' && (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <canvas 
                    ref={canvasRef} 
                    width={600} 
                    height={330} 
                    style={styles.canvas}
                    onMouseMove={handleMouseMove}
                    onClick={handleCanvasClick}
                  ></canvas>
                  {hoveredNode.current && (
                    <div style={styles.nodeTooltip}>
                      <strong>{hoveredNode.current} schema:</strong>
                      <div style={{ fontSize: '0.7rem', marginTop: '4px' }}>
                        {DB_SCHEMAS[hoveredNode.current]?.columns.map(c => (
                          <div key={c.name}>{c.name} ({c.type})</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Investigation Board */}
              {activeTab === 'board' && (
                <div style={styles.corkboard}>
                  <h4 style={styles.boardTitle}>INVESTIGATION PROFILE BOARD</h4>
                  <div style={styles.evidenceGrid}>
                    {casesList.map((c, idx) => {
                      const isUnlocked = unlockedClues.includes(c.level);
                      return (
                        <div 
                          key={idx} 
                          style={{ 
                            ...styles.evidenceCard, 
                            borderColor: isUnlocked ? 'var(--success-color)' : 'rgba(255,255,255,0.05)',
                            opacity: isUnlocked ? 1 : 0.4 
                          }}
                        >
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <Folder size={14} color={isUnlocked ? 'var(--success-color)' : 'var(--text-secondary)'} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>CASE #{c.level} CLUE</span>
                          </div>
                          <p style={{ fontSize: '0.65rem', marginTop: '4px', fontStyle: 'italic' }}>
                            {isUnlocked ? c.clue : '🔒 File encrypted. Resolve SQL challenge to inject key.'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 3: DB Data Previewer */}
              {activeTab === 'preview' && (
                <div style={styles.previewContainer}>
                  <div style={styles.previewTitle}>
                    <Database size={14} />
                    <span>TABLE DATA PREVIEW: `{previewTableName}`</span>
                  </div>
                  <div style={styles.tableScroll}>
                    <table style={styles.previewTable}>
                      <thead>
                        <tr>
                          {virtualDb[previewTableName]?.columns.map((c) => (
                            <th key={c.name} style={styles.th}>{c.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {virtualDb[previewTableName]?.data.map((row, idx) => (
                          <tr key={idx} style={styles.tr}>
                            {virtualDb[previewTableName]?.columns.map((col, i) => (
                              <td key={i} style={styles.td}>{String(row[col.name])}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: SQL Editor Terminal & output logs */}
          <div style={styles.rightPane} className="sql-pane sql-right-pane">
            <div style={styles.editorCard} className="game-card">
              <div style={styles.editorHeader}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Heart
                      key={i}
                      size={14}
                      color={i < playerShields ? 'var(--danger-color)' : '#374151'}
                      fill={i < playerShields ? 'var(--danger-color)' : 'transparent'}
                    />
                  ))}
                </div>
                <span style={styles.editorTitle}>DECRYPT_SQL_ENGINE.EXE</span>

                {/* Level 10 Timer */}
                {levelIndex === 9 && (
                  <span style={{ color: 'var(--danger-color)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    ⏰ LOCKOUT IN: {timeLeft}s
                  </span>
                )}
              </div>

              {/* Target directive snippet */}
              <div style={styles.directiveBar}>
                <strong>Target:</strong> {activeCase.instructions}
              </div>

              <textarea
                value={queryInput}
                onChange={handleEditorChange}
                style={styles.textarea}
                placeholder="-- Write SQL decryptor instructions here..."
              />
              
              <div style={styles.editorFooter}>
                <span style={styles.hintText}>💡 Tip: Select tables from map tab on left.</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="game-btn" 
                    style={{ borderColor: 'var(--accent-secondary)', color: 'var(--accent-secondary)', backgroundColor: 'transparent' }}
                    onClick={decryptSolution}
                  >
                    🔓 DECRYPT SOLUTION (-50 Coins)
                  </button>
                  <button className="game-btn game-btn-primary" onClick={executeQuery}>
                    RUN DECRYPTOR
                  </button>
                </div>
              </div>
            </div>

            {/* Output console terminal */}
            <div style={styles.consoleCard} className="game-card">
              <div style={styles.consoleHeader}>
                <Terminal size={14} color="var(--accent-color)" />
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>OUTPUT_SHELL</span>
              </div>
              
              <div style={styles.consoleScroll}>
                {errorMsg ? (
                  <div style={styles.errorText}>{errorMsg}</div>
                ) : terminalOutput.length > 0 ? (
                  <table style={styles.consoleTable}>
                    <thead>
                      <tr>
                        {Object.keys(terminalOutput[0]).map((col) => (
                          <th key={col} style={styles.thConsole}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {terminalOutput.map((row, idx) => (
                        <tr key={idx} style={styles.trConsole}>
                          {Object.values(row).map((val, i) => (
                            <td key={i} style={styles.tdConsole}>{String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                    $ Terminal online. Write SQL query parameters and click run to decrypt node...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. INCOMING BOSS DETAILS LEVEL TRANSITION */}
      {battleState === 'incoming' && (
        <div className="game-card" style={styles.lobbyPanel}>
          <CheckCircle2 size={64} color="var(--success-color)" className="float-animation" />
          <h2 style={{ ...styles.title, color: 'var(--success-color)' }}>CASE LEVEL COMPLETE</h2>
          <p style={styles.desc}>
            Excellent. You decrypted the target information registry and isolated Case #{activeCase.level} evidence.
          </p>

          <div style={styles.rewardsPanel}>
            <h4 style={{ color: 'var(--success-color)', fontSize: '0.85rem', marginBottom: '6px' }}>SECURED EVIDENCE DOSSIER:</h4>
            <div style={{ fontSize: '0.8rem', fontStyle: 'italic', marginBottom: '8px', color: 'var(--text-primary)' }}>
              " {activeCase.clue} "
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.8rem', opacity: 0.8 }}>
              <div>💎 +80 Coins</div>
              <div>⚡ +50 XP</div>
            </div>
          </div>

          <button className="game-btn game-btn-primary" style={styles.actionBtn} onClick={proceedNext}>
            NEXT CASE FILE <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* 5. CAMPAIGN FULLY COMPLETE */}
      {battleState === 'complete' && (
        <div className="game-card" style={styles.lobbyPanel}>
          <Award size={64} color="#EAB308" className="float-animation" />
          <h2 style={{ ...styles.title, color: '#EAB308' }}>MASTER DECRYPTOR CERTIFIED</h2>
          <p style={styles.desc}>
            Incredible! You cleared all 10 corporate crime folders, locked Agent Smith out of the core bank mainframe, and completed your SQL security training badge.
          </p>

          <div style={styles.rewardsPanel}>
            <h4 style={{ color: '#EAB308', fontSize: '0.85rem', marginBottom: '6px' }}>CAMPAIGN CLEAR Payout:</h4>
            <div>💎 +250 Coins wallet bonus applied</div>
            <div>⚡ +150 XP profile boost completed</div>
          </div>

          <button className="game-btn game-btn-primary" onClick={() => setGame(null)}>
            Return to Hub
          </button>
        </div>
      )}

      {/* 6. GAME OVER */}
      {battleState === 'gameover' && (
        <div className="game-card" style={styles.lobbyPanel}>
          <ShieldAlert size={64} color="var(--danger-color)" className="float-animation" />
          <h2 style={{ ...styles.title, color: 'var(--danger-color)' }}>CONNECTION SHUTDOWN</h2>
          <p style={styles.desc}>
            Security firewall loops detected too many unindexed scans or transaction leaks. Your link has been forcefully closed.
          </p>

          <div style={styles.rewardsPanel}>
            <h4 style={{ color: 'var(--danger-color)', fontSize: '0.85rem', marginBottom: '6px' }}>CONSOLATION PAYOUT:</h4>
            <div>⚡ +{10 * (levelIndex + 1)} XP applied to user profile</div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="game-btn game-btn-primary" onClick={enterBriefing}>Retry Case</button>
            <button className="game-btn" onClick={() => setGame(null)}>Hub Metropolis</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '2.5rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 'calc(100vh - 70px)',
    width: '100vw',
    position: 'relative',
  },
  muteBtn: {
    position: 'absolute',
    top: '1rem',
    right: '2rem',
    backgroundColor: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.05)',
    color: 'var(--text-secondary)',
    padding: '6px 12px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.75rem',
    cursor: 'pointer',
    zIndex: 10,
  },
  lobbyPanel: {
    maxWidth: '600px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    backgroundColor: 'rgba(10, 14, 16, 0.95)',
    borderWidth: '2px',
  },
  title: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.6rem',
    letterSpacing: '2px',
    color: 'var(--accent-secondary)'
  },
  desc: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    lineHeight: '1.6',
  },
  rulesBox: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(57, 255, 20, 0.15)',
    borderRadius: '6px',
    padding: '1.25rem',
    textAlign: 'left',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem'
  },
  ruleItem: {
    fontSize: '0.82rem',
    color: 'var(--text-primary)',
    lineHeight: '1.4'
  },
  actionBtn: {
    width: '240px',
    justifyContent: 'center',
  },
  workspace: {
    display: 'flex',
    gap: '1.5rem',
    width: '100%',
    height: '100%',
    maxWidth: '1200px',
  },
  leftPane: {
    flex: '1.1',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden'
  },
  tabsHeader: {
    display: 'flex',
    gap: '1.25rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '0.5rem',
    marginBottom: '0.5rem',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer',
    padding: '4px 8px',
    transition: 'all 0.2s ease'
  },
  tabContent: {
    flex: '1',
    backgroundColor: 'rgba(10, 14, 16, 0.7)',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    height: 'calc(100% - 40px)',
    overflow: 'hidden'
  },
  canvas: {
    width: '100%',
    height: '100%',
    display: 'block',
    cursor: 'pointer'
  },
  nodeTooltip: {
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    backgroundColor: 'rgba(5, 7, 8, 0.9)',
    border: '1px solid #39FF14',
    padding: '8px 12px',
    borderRadius: '4px',
    color: '#39FF14',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    pointerEvents: 'none',
    maxWidth: '220px',
    boxShadow: '0 0 10px rgba(57, 255, 20, 0.2)'
  },
  corkboard: {
    height: '100%',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  boardTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    color: 'var(--accent-color)',
    letterSpacing: '1px'
  },
  evidenceGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem'
  },
  evidenceCard: {
    border: '1px dashed',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: '0.75rem',
    borderRadius: '6px',
    transition: 'all 0.3s ease'
  },
  previewContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    gap: '0.75rem'
  },
  previewTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.8rem',
    color: 'var(--accent-secondary)',
    fontFamily: 'var(--font-mono)',
    fontWeight: 'bold'
  },
  tableScroll: {
    overflow: 'auto',
    flex: '1'
  },
  previewTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.75rem',
    textAlign: 'left'
  },
  th: {
    color: 'var(--accent-color)',
    borderBottom: '1px solid rgba(57, 255, 20, 0.2)',
    padding: '6px 8px',
    fontFamily: 'var(--font-mono)'
  },
  tr: {
    borderBottom: '1px solid rgba(255,255,255,0.02)',
  },
  td: {
    padding: '6px 8px',
    color: 'var(--text-secondary)'
  },
  rightPane: {
    flex: '1.3',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    height: '100%',
  },
  editorCard: {
    flex: '1.2',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    backgroundColor: 'rgba(10, 14, 16, 0.85)',
    border: '1px solid rgba(57, 255, 20, 0.25)',
    boxShadow: 'var(--shadow)'
  },
  editorHeader: {
    backgroundColor: '#0a0e10',
    padding: '0.5rem 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(57, 255, 20, 0.1)',
  },
  editorTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    color: 'var(--text-secondary)'
  },
  directiveBar: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: '6px 1rem',
    fontSize: '0.75rem',
    borderBottom: '1px solid rgba(255,255,255,0.02)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)'
  },
  textarea: {
    flex: '1',
    backgroundColor: 'transparent',
    color: 'var(--text-primary)',
    border: 'none',
    outline: 'none',
    padding: '1rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    lineHeight: '1.5',
    resize: 'none',
  },
  editorFooter: {
    padding: '0.75rem 1rem',
    backgroundColor: '#0a0e10',
    borderTop: '1px solid rgba(57, 255, 20, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hintText: {
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
  },
  consoleCard: {
    flex: '0.8',
    backgroundColor: '#040607',
    border: '1px solid rgba(255,255,255,0.03)',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    overflow: 'hidden'
  },
  consoleHeader: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: '0.5rem 1rem',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  consoleScroll: {
    flex: '1',
    overflowY: 'auto',
    padding: '1rem'
  },
  errorText: {
    color: 'var(--danger-color)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    lineHeight: '1.4'
  },
  consoleTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    textAlign: 'left'
  },
  thConsole: {
    color: 'var(--accent-color)',
    borderBottom: '1px solid rgba(57, 255, 20, 0.2)',
    padding: '4px 6px'
  },
  trConsole: {
    borderBottom: '1px solid rgba(57, 255, 20, 0.05)'
  },
  tdConsole: {
    padding: '4px 6px',
    color: '#e0e0e0'
  },
  rewardsPanel: {
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
    border: '1px solid rgba(57, 255, 20, 0.15)',
    padding: '1rem 2rem',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    alignItems: 'flex-start',
    width: '100%',
    fontSize: '0.85rem',
  }
};
