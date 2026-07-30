import React, { useState, useEffect, useRef } from 'react';
import ConfettiEffect from '../components/ConfettiEffect';
import { usePlayerStore } from '../store/usePlayerStore';
import { 
  playSlashSound, 
  playSpellSound, 
  playExplosionSound, 
  playCoinSound, 
  playVictorySound, 
  playDefeatSound, 
  playBgm, 
  stopBgm 
} from './utils/audio';
import { ShieldAlert, Heart, Trophy, Play, ChevronRight, HelpCircle, Volume2, VolumeX } from 'lucide-react';

const MONSTERS = [
  {
    level: 1,
    name: 'Array Beast',
    maxHp: 100,
    weakness: 'Indexing',
    type: 'array',
    desc: 'An amorphous sludge monster made of unsorted blocks. Requires array indexing and sorting knowledge.',
    timeLimit: 20,
    questions: [
      {
        q: 'What is the time complexity to access an element in an array of size N using its index?',
        opts: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correct: 0,
        tip: 'Array lookup by index uses direct memory address offsets, taking O(1) constant time.'
      },
      {
        q: 'Which sorting algorithm has a guaranteed worst-case time complexity of O(n log n) and is stable?',
        opts: ['Quick Sort', 'Merge Sort', 'Heap Sort', 'Selection Sort'],
        correct: 1,
        tip: 'Merge Sort is a stable, divide-and-conquer sort with a guaranteed O(n log n) complexity.'
      }
    ]
  },
  {
    level: 2,
    name: 'String Phantom',
    maxHp: 120,
    weakness: 'Pattern Matching',
    type: 'string',
    desc: 'A floating phantom made of floating text characters. Vulnerable to string operations.',
    timeLimit: 18,
    questions: [
      {
        q: 'What is the time complexity of comparing two strings of lengths M and N for equality in the worst case?',
        opts: ['O(1)', 'O(min(M, N))', 'O(M + N)', 'O(M * N)'],
        correct: 1,
        tip: 'In the worst case, we must compare characters up to the length of the shorter string, so O(min(M, N)).'
      },
      {
        q: 'Which string pattern matching algorithm operates in O(N + M) worst-case time using a prefix table?',
        opts: ['Naive Search', 'KMP (Knuth-Morris-Pratt)', 'Rabin-Karp', 'Boyer-Moore'],
        correct: 1,
        tip: 'KMP precomputes a prefix table (LPS) to skip redundant comparisons, running in O(N + M).'
      }
    ]
  },
  {
    level: 3,
    name: 'Stack & Queue Sentinel',
    maxHp: 140,
    weakness: 'Push/Pop Order',
    type: 'stackqueue',
    desc: 'A heavy mechanical sentinel built of stacked gears and queue pipes. Vulnerable to stack and queue rules.',
    timeLimit: 16,
    questions: [
      {
        q: 'Which data structure operates on a Last-In, First-Out (LIFO) access pattern?',
        opts: ['Queue', 'Stack', 'Linked List', 'Heap'],
        correct: 1,
        tip: 'Stacks are LIFO structures (elements are added and removed from the same end).'
      },
      {
        q: 'What is the time complexity of enqueue and dequeue operations in an optimal Queue implementation?',
        opts: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correct: 0,
        tip: 'Both enqueue and dequeue operate in O(1) constant time when using pointers to the front and rear.'
      },
      {
        q: 'If you push elements [10, 20, 30] sequentially onto a stack, what is the output order if you pop them all?',
        opts: ['[10, 20, 30]', '[30, 20, 10]', '[20, 30, 10]', '[10, 30, 20]'],
        correct: 1,
        tip: 'The last element pushed (30) is the first popped, then 20, then 10 (LIFO order).'
      }
    ]
  },
  {
    level: 4,
    name: 'Hash Goblin',
    maxHp: 150,
    weakness: 'Collision Handling',
    type: 'hash',
    desc: 'A green creature that steals data. Vulnerable to hashing and key-value mapping concepts.',
    timeLimit: 15,
    questions: [
      {
        q: 'What is the worst-case lookup time complexity of a Hash Map if all elements hash to the same bucket?',
        opts: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correct: 2,
        tip: 'If all keys collide, they form a single list, degrading the search time to linear O(n).'
      },
      {
        q: 'Which collision resolution technique stores all colliding elements in the same hash bucket using a list?',
        opts: ['Linear Probing', 'Quadratic Probing', 'Chaining (Open Addressing)', 'Separate Chaining'],
        correct: 3,
        damage: 50,
        tip: 'Separate Chaining solves collisions by linking elements into a list at the corresponding bucket index.'
      },
      {
        q: 'What is a primary advantage of open addressing over separate chaining in hash tables?',
        opts: ['Lower worst-case complexity', 'Better cache locality', 'Simple resizing', 'No hash calculation needed'],
        correct: 1,
        tip: 'Open addressing stores all elements inside the table array directly, improving CPU cache utilization.'
      }
    ]
  },
  {
    level: 5,
    name: 'Tree Guardian',
    maxHp: 180,
    weakness: 'Traversal Order',
    type: 'tree',
    desc: 'A massive golem with branching binary tree roots. Vulnerable to binary tree traversal algorithms.',
    timeLimit: 14,
    questions: [
      {
        q: 'Which binary tree traversal visits nodes in the order: Left Subtree, Root, Right Subtree?',
        opts: ['Pre-order', 'In-order', 'Post-order', 'Level-order'],
        correct: 1,
        tip: 'In-order traversal visits left-subtree, root, then right-subtree (L-Root-R).'
      },
      {
        q: 'What is the height of a balanced Binary Search Tree containing N elements in the worst case?',
        opts: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correct: 1,
        tip: 'A balanced BST maintains a height of O(log n), keeping search operations logarithmic.'
      },
      {
        q: 'What traversal of a BST yields elements in sorted ascending order?',
        opts: ['Pre-order', 'In-order', 'Post-order', 'Breadth-First'],
        correct: 1,
        tip: 'In-order traversal visits BST keys in strictly increasing order (sorted ascending).'
      }
    ]
  },
  {
    level: 6,
    name: 'Heap Chimera',
    maxHp: 200,
    weakness: 'Min/Max Properties',
    type: 'heap',
    desc: 'A mythical beast with a binary heap body. Requires priority queue knowledge to tame.',
    timeLimit: 12,
    questions: [
      {
        q: 'In a Min-Heap represented as an array, at what index is the minimum element always located?',
        opts: ['Last index (n - 1)', 'Root index (0)', 'Middle index (n / 2)', 'Random index'],
        correct: 1,
        tip: 'The root of a min-heap holds the smallest value, located at array index 0.'
      },
      {
        q: 'What is the worst-case time complexity of inserting a new element into a Max-Heap of size N?',
        opts: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correct: 1,
        tip: 'Inserting an element adds it at the bottom and bubbles it up, which takes O(log n) swaps.'
      },
      {
        q: 'What is the time complexity to build a Heap from an unsorted array of size N?',
        opts: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correct: 2,
        tip: 'Using the bottom-up heapify algorithm, a heap can be constructed in O(n) linear time.'
      }
    ]
  },
  {
    level: 7,
    name: 'Graph Wyrm',
    maxHp: 220,
    weakness: 'Connected Paths',
    type: 'graph',
    desc: 'A dragon weaving through connected nodes. Vulnerable to traversal pathfinding spells.',
    timeLimit: 11,
    questions: [
      {
        q: 'Which algorithm uses a FIFO Queue to traverse graph nodes level-by-level?',
        opts: ['Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'Bellman-Ford', 'Prim'],
        correct: 1,
        tip: 'BFS explores neighbor nodes level-by-level using a FIFO Queue.'
      },
      {
        q: 'What data structure is typically used to implement Depth-First Search (DFS) recursively or iteratively?',
        opts: ['Queue', 'Stack', 'Heap', 'Hash Table'],
        correct: 1,
        tip: 'DFS uses a Stack (the call stack recursively or an explicit stack iteratively) to backtrack.'
      },
      {
        q: 'What is the worst-case time complexity of BFS on an adjacency list graph with V vertices and E edges?',
        opts: ['O(V)', 'O(E)', 'O(V + E)', 'O(V * E)'],
        correct: 2,
        tip: 'BFS visits each vertex and edge once, yielding a time complexity of O(V + E).'
      },
      {
        q: 'A graph with vertices V and no cycles is called a tree. How many edges does it have?',
        opts: ['V', 'V - 1', 'V + 1', '2V'],
        correct: 1,
        tip: 'A tree (a connected acyclic graph) with V vertices always has exactly V - 1 edges.'
      }
    ]
  },
  {
    level: 8,
    name: 'Dijkstra Dragon',
    maxHp: 240,
    weakness: 'Optimal Routing',
    type: 'dijkstra',
    desc: 'An ancient dragon breathing fire over weighted networks. Can be outsmarted by single-source shortest path math.',
    timeLimit: 10,
    questions: [
      {
        q: 'Why can Dijkstra\'s algorithm NOT be used on graphs with negative edge weights?',
        opts: ['It runs in an infinite loop', 'It makes greedy decisions that cannot be corrected later', 'It only works on trees', 'It requires undirected graphs'],
        correct: 1,
        tip: 'Dijkstra\'s algorithm assumes paths only get longer. Negative weights invalidate this greedy assumption.'
      },
      {
        q: 'Which algorithm finds shortest paths in a graph with negative edge weights (provided there are no negative cycles)?',
        opts: ['Dijkstra', 'Bellman-Ford', 'Kruskal', 'Floyd-Warshall'],
        correct: 1,
        tip: 'Bellman-Ford can handle negative weights and detect negative-weight cycles in O(V * E) time.'
      },
      {
        q: 'What is the time complexity of Kruskal\'s algorithm to find a Minimum Spanning Tree of a graph with E edges?',
        opts: ['O(V²)', 'O(E log E)', 'O(E log V)', 'Both O(E log E) and O(E log V) are equivalent'],
        correct: 3,
        tip: 'Sorting edges takes O(E log E). Since E <= V², log E is O(log V), making O(E log E) and O(E log V) equivalent.'
      },
      {
        q: 'Which data structure is typically used to optimize Dijkstra\'s algorithm to run in O(E log V) time?',
        opts: ['Stack', 'Binary Search Tree', 'Min-Priority Queue / Min-Heap', 'Queue'],
        correct: 2,
        tip: 'A Min-Priority Queue enables retrieving the vertex with the minimum distance in O(log V) time.'
      }
    ]
  },
  {
    level: 9,
    name: 'DP Hydra',
    maxHp: 260,
    weakness: 'Memoization',
    type: 'dp',
    desc: 'A legendary multi-headed serpent that regenerates heads. Vulnerable to memoized cached subproblem solutions.',
    timeLimit: 9,
    questions: [
      {
        q: 'What is the top-down approach to Dynamic Programming called?',
        opts: ['Tabulation', 'Memoization', 'Recursion', 'Backtracking'],
        correct: 1,
        tip: 'Memoization is the top-down recursive caching technique; Tabulation is the bottom-up table-filling technique.'
      },
      {
        q: 'What is the time complexity of the classic Knapsack 0/1 problem solved using DP with N items and weight capacity W?',
        opts: ['O(2^N)', 'O(N log N)', 'O(N * W)', 'O(N + W)'],
        correct: 2,
        tip: 'The DP solution fills a table of size N x W, resulting in a time complexity of O(N * W) (pseudo-polynomial).'
      },
      {
        q: 'What does Dynamic Programming require that makes it different from simple Divide-and-Conquer?',
        opts: ['Recursive calls', 'Overlapping subproblems', 'Sorted inputs', 'Linear space'],
        correct: 1,
        tip: 'DP is used when subproblems overlap and are recomputed multiple times. Divide-and-Conquer splits into independent subproblems.'
      },
      {
        q: 'What is the time complexity of solving the Longest Common Subsequence (LCS) of two strings of lengths M and N using DP?',
        opts: ['O(M + N)', 'O(M * N)', 'O(2^(M+N))', 'O(M² + N²)'],
        correct: 1,
        tip: 'LCS uses a 2D table of dimensions (M+1) x (N+1), taking O(M * N) time.'
      },
      {
        q: 'In DP, if we store Fibonacci results in an array to avoid repeating recursion, we reduce time complexity from O(2^N) to:',
        opts: ['O(N²)', 'O(N log N)', 'O(N)', 'O(log N)'],
        correct: 2,
        tip: 'Storing calculated values resolves overlapping subproblems, reducing Fibonacci to linear O(N) time.'
      }
    ]
  },
  {
    level: 10,
    name: 'Backtracking Overlord',
    maxHp: 300,
    weakness: 'Maze Backtracking',
    type: 'backtrack',
    desc: 'The final boss, guarding the core compiler. Requires depth search and state pruning choices.',
    timeLimit: 8,
    questions: [
      {
        q: 'What design strategy does Backtracking search use to search for solutions in a state-space tree?',
        opts: ['Breadth-First Search (BFS)', 'Depth-First Search (DFS) with pruning', 'Greedy Selection', 'Dijkstra\'s Search'],
        correct: 1,
        tip: 'Backtracking uses DFS to traverse the state space, pruning invalid branches as soon as constraints are violated.'
      },
      {
        q: 'What is the worst-case time complexity of the N-Queens placement problem solved using backtracking?',
        opts: ['O(N²)', 'O(N log N)', 'O(N!)', 'O(2^N)'],
        correct: 2,
        tip: 'N-Queens checks column assignments, which is a permutation problem taking O(N!) in the worst case.'
      },
      {
        q: 'Which of the following problems is most commonly solved using a Backtracking algorithm?',
        opts: ['Fibonacci Sequence', 'Sudoku Solver', 'Kruskal\'s MST', 'Binary Search'],
        correct: 1,
        tip: 'Sudoku involves trying candidates in cells and backtracking when a constraint (row/col/grid) is violated.'
      },
      {
        q: 'In backtracking, what is "pruning"?',
        opts: ['Deleting dead nodes', 'Stopping recursion down a branch when it is clear it cannot lead to a valid solution', 'Sorting the search space', 'Optimizing memory allocations'],
        correct: 1,
        tip: 'Pruning stops exploring a subtree immediately when the current path violates the problem rules.'
      },
      {
        q: 'What is the time complexity of the Hamiltonian Path problem solved using backtracking on a graph of N vertices?',
        opts: ['O(N²)', 'O(2^N)', 'O(N!)', 'O(N^N)'],
        correct: 2,
        tip: 'Searching for a path visiting all vertices once runs in O(N!) in the worst case as it tests vertex permutations.'
      }
    ]
  }
];

export default function AlgorithmArena() {
  const { coins, addCoins, addXP, xp, setGame, completeDailyChallenge } = usePlayerStore();

  const [levelIndex, setLevelIndex] = useState(0);
  const [battleState, setBattleState] = useState('lobby'); // 'lobby', 'combat', 'loot', 'victory', 'gameover'
  const [monsterHp, setMonsterHp] = useState(100);
  const [playerShields, setPlayerShields] = useState(3);
  const [qIndex, setQIndex] = useState(0);
  const [combatText, setCombatText] = useState('');
  const [shakeActive, setShakeActive] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

// Helper to dynamically shuffle options and update correct answer index
function shuffleQuestionObj(qObj) {
  if (!qObj || !qObj.opts) return qObj;
  const originalCorrectText = qObj.opts[qObj.correct];
  const shuffledOpts = [...qObj.opts].sort(() => Math.random() - 0.5);
  const newCorrectIndex = shuffledOpts.indexOf(originalCorrectText);
  return {
    ...qObj,
    opts: shuffledOpts,
    correct: newCorrectIndex
  };
}

  // Shuffled Dynamic questions from MongoDB
  const [monsters, setMonsters] = useState(MONSTERS);

  useEffect(() => {
    const DIFFICULTY_ORDER = {
      easy: 1,
      medium: 2,
      hard: 3,
      critical: 4
    };

    const solvedIds = localStorage.getItem('solved_question_ids_algo-arena') || '';
    fetch(`http://localhost:5000/api/questions?category=algo-arena&limit=100&excludeIds=${solvedIds}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.questions && data.questions.length > 0) {
          const mappedMonsters = MONSTERS.map(monster => {
            let dbQuestions = data.questions
              .filter(q => {
                if (!q.extraDetails || !q.extraDetails.subCategory) return false;
                const subCat = q.extraDetails.subCategory.toLowerCase();
                if (monster.type === 'stackqueue') {
                  return subCat === 'stack' || subCat === 'stackqueue';
                }
                if (monster.type === 'backtrack') {
                  return subCat === 'backtrack' || subCat === 'backtracking';
                }
                return subCat === monster.type;
              })
              .map(q => shuffleQuestionObj({
                q: q.question,
                opts: q.options,
                correct: q.correctAnswer,
                tip: q.tip,
                difficulty: q.difficulty || 'easy',
                _id: q._id
              }))
              .sort((a, b) => {
                const diffA = DIFFICULTY_ORDER[a.difficulty] || 1;
                const diffB = DIFFICULTY_ORDER[b.difficulty] || 1;
                return diffA - diffB;
              });

            return {
              ...monster,
              questions: dbQuestions.length > 0 ? dbQuestions : monster.questions.map(shuffleQuestionObj)
            };
          });
          setMonsters(mappedMonsters);
        }
      })
      .catch(() => {});
  }, []);

  const [activeQuestion, setActiveQuestion] = useState(null);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isAnswering, setIsAnswering] = useState(true);
  const [seenQuestionIds, setSeenQuestionIds] = useState([]);

  // Audio state
  const [isMuted, setIsMuted] = useState(false);

  const speakText = (text) => {
    if (isMuted) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 0.95;
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  // Refs for closure loops
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const particles = useRef([]);
  const bgParticles = useRef([]);
  const damageTexts = useRef([]);
  const shakeTimer = useRef(0);
  const monsterVibrate = useRef(0);
  const shieldFlash = useRef(0); // Spaceship hit shield visual flash

  // Animation values
  const laserAnim = useRef({ active: false, x: 0, y: 110, speed: 15 });
  const stoneAnim = useRef({ active: false, x: 550, y: 110, speed: -10, angle: 0 });

  const monsterHpRef = useRef(100);
  const playerShieldsRef = useRef(3);

  const activeMonster = monsters[levelIndex] || monsters[0];

  // Callback references to run safely inside requestAnimationFrame
  const handleMonsterHitRef = useRef(null);
  const handleSpaceshipHitRef = useRef(null);

  useEffect(() => {
    handleMonsterHitRef.current = handleMonsterHit;
    handleSpaceshipHitRef.current = handleSpaceshipHit;
  });

  // Spaceship drawing utility
  const drawSpaceship = (ctx, x, y, t) => {
    ctx.save();
    ctx.translate(x, y);

    // Thruster flame (pulsing)
    const flameSize = 14 + Math.sin(t * 12) * 5;
    const flameGrad = ctx.createLinearGradient(-15, 0, -15 - flameSize, 0);
    flameGrad.addColorStop(0, '#FF4500'); // Orange-Red
    flameGrad.addColorStop(0.5, '#FFD700'); // Yellow
    flameGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(-15, -6);
    ctx.lineTo(-15 - flameSize, 0);
    ctx.lineTo(-15, 6);
    ctx.closePath();
    ctx.fill();

    // Ship body wings
    ctx.fillStyle = '#4B5563'; // Slate
    ctx.strokeStyle = '#00F3FF'; // Cyber glow shield
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(25, 0); // Nose cone
    ctx.lineTo(-15, -12); // Left wing
    ctx.lineTo(-5, 0); // Tail inner
    ctx.lineTo(-15, 12); // Right wing
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cockpit glass
    ctx.fillStyle = '#00F3FF';
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(0, -4);
    ctx.lineTo(-5, 0);
    ctx.lineTo(0, 4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  // Monster drawing dispatcher based on type
  const drawMonster = (ctx, x, y, type, hpRatio, t) => {
    ctx.save();
    ctx.translate(x, y);

    // Floating motion
    const floatOffset = Math.sin(t * 3.5) * 8;
    ctx.translate(0, floatOffset);

    // Breath scale
    const scale = 1 + Math.sin(t * 6) * 0.04;
    ctx.scale(scale, scale);

    switch (type) {
      case 'array':
        // Array Beast: cyan index blocks
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
        ctx.lineWidth = 2;
        for (let i = -1; i <= 1; i++) {
          ctx.fillStyle = hpRatio <= 0.3 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(6, 182, 212, 0.1)';
          ctx.fillRect(i * 32 - 12, -12, 24, 24);
          ctx.strokeRect(i * 32 - 12, -12, 24, 24);
        }
        // Core glow
        const gradA = ctx.createRadialGradient(0, 0, 1, 0, 0, 10);
        gradA.addColorStop(0, '#FFFFFF');
        gradA.addColorStop(1, 'transparent');
        ctx.fillStyle = gradA;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'string':
        // String Phantom: glowing characters
        ctx.fillStyle = 'rgba(168, 85, 247, 0.8)';
        ctx.font = 'bold 20px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('["S", "T", "R"]', 0, 6);
        break;

      case 'stackqueue':
        // Stack & Queue: vertical tube
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
        ctx.lineWidth = 3;
        ctx.strokeRect(-14, -28, 28, 56);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
        ctx.fillRect(-10, -22, 20, 12);
        ctx.fillRect(-10, -4, 20, 12);
        ctx.fillRect(-10, 14, 20, 12);
        break;

      case 'hash':
        // Hash Goblin: key-value link pairs
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-18, -10);
        ctx.lineTo(18, 10);
        ctx.stroke();

        ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
        ctx.beginPath();
        ctx.arc(-18, -10, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillRect(8, 0, 18, 18);
        ctx.strokeRect(8, 0, 18, 18);
        break;

      case 'tree':
        // Tree Guardian: binary tree nodes
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(-22, 10);
        ctx.moveTo(0, -20);
        ctx.lineTo(22, 10);
        ctx.stroke();

        const drawNode = (nx, ny) => {
          ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
          ctx.beginPath();
          ctx.arc(nx, ny, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        };
        drawNode(0, -20);
        drawNode(-22, 10);
        drawNode(22, 10);
        break;

      case 'heap':
        // Heap Chimera: pyramid nodes
        ctx.strokeStyle = '#EC4899';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -22);
        ctx.lineTo(-18, 0);
        ctx.moveTo(0, -22);
        ctx.lineTo(18, 0);
        ctx.stroke();

        const drawHeapNode = (nx, ny) => {
          ctx.fillStyle = 'rgba(236, 72, 153, 0.2)';
          ctx.beginPath();
          ctx.arc(nx, ny, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        };
        drawHeapNode(0, -22);
        drawHeapNode(-18, 0);
        drawHeapNode(18, 0);
        break;

      case 'graph':
        // Graph Wyrm: pentagon links
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5 + t * 0.4;
          const xVal = Math.cos(angle) * 28;
          const yVal = Math.sin(angle) * 28;
          if (i === 0) ctx.moveTo(xVal, yVal);
          else ctx.lineTo(xVal, yVal);
        }
        ctx.closePath();
        ctx.stroke();
        break;

      case 'dijkstra':
        // Dijkstra Dragon: weighted path nodes
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-25, 0);
        ctx.lineTo(0, -18);
        ctx.lineTo(25, 0);
        ctx.stroke();

        ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
        const drawWeightNode = (nx, ny, label) => {
          ctx.beginPath();
          ctx.arc(nx, ny, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        };
        drawWeightNode(-25, 0, 'A');
        drawWeightNode(0, -18, 'B');
        drawWeightNode(25, 0, 'C');
        break;

      case 'dp':
        // DP Hydra: multi heads
        for (let h = -1; h <= 1; h++) {
          ctx.save();
          ctx.translate(h * 24, -8 + Math.sin(t * 5 + h) * 6);
          const headGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 14);
          headGrad.addColorStop(0, '#FFFFFF');
          headGrad.addColorStop(0.4, '#A855F7');
          headGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = headGrad;
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        break;

      case 'backtrack':
        // Backtracking Overlord: maze matrix
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(-22, -22, 44, 44);
        ctx.beginPath();
        ctx.moveTo(-22, 0); ctx.lineTo(0, 0); ctx.lineTo(0, 22);
        ctx.moveTo(0, -22); ctx.lineTo(0, -8); ctx.lineTo(22, -8);
        ctx.stroke();
        break;
      
      default:
        break;
    }

    ctx.restore();
  };

  // Initialize Canvas Game Loop
  useEffect(() => {
    if (battleState === 'combat' || battleState === 'loot') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      let t = 0;

      const render = () => {
        t += 0.05;

        // 1. Draw Space Background Gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGrad.addColorStop(0, '#020208'); // Pure deep space
        bgGrad.addColorStop(0.5, '#070716');
        bgGrad.addColorStop(1, '#0e0a24');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Animate and draw scrolling stars (parallax starfield)
        if (bgParticles.current.length === 0) {
          for (let i = 0; i < 40; i++) {
            bgParticles.current.push({
              x: Math.random() * canvas.width,
              y: Math.random() * canvas.height,
              speed: Math.random() * 1.8 + 0.4,
              size: Math.random() * 1.8 + 0.4,
              alpha: Math.random() * 0.8 + 0.2
            });
          }
        }
        bgParticles.current.forEach((star) => {
          star.x -= star.speed;
          if (star.x < 0) {
            star.x = canvas.width;
            star.y = Math.random() * canvas.height;
          }
          ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        });

        // Apply Screen Shake (Camera vibration)
        let dx = 0, dy = 0;
        if (shakeTimer.current > 0) {
          dx = (Math.random() - 0.5) * 8;
          dy = (Math.random() - 0.5) * 8;
          shakeTimer.current -= 1;
        }

        ctx.save();
        ctx.translate(dx, dy);

        // 3. Draw player Spaceship
        let shipX = 75;
        let shipY = 110;
        drawSpaceship(ctx, shipX, shipY, t);

        // Draw Spaceship Shield Bubble (flashes red when hit, pulses cyan normally)
        if (shieldFlash.current > 0) {
          ctx.save();
          ctx.strokeStyle = `rgba(239, 68, 68, ${shieldFlash.current / 15})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(shipX, shipY, 26, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          shieldFlash.current -= 1;
        } else {
          ctx.save();
          ctx.strokeStyle = 'rgba(0, 243, 255, 0.22)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(shipX, shipY, 24 + Math.sin(t * 8) * 2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Draw Laser charging nozzle glow right before firing
        if (laserAnim.current.active && laserAnim.current.x < 150) {
          ctx.save();
          ctx.fillStyle = '#00F3FF';
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#00F3FF';
          ctx.beginPath();
          ctx.arc(shipX + 25, shipY, 6 + Math.sin(t * 22) * 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // 4. Draw Monster Golem
        let monX = 550;
        let monY = 110;
        if (monsterVibrate.current > 0) {
          monX += (Math.random() - 0.5) * 10;
          monsterVibrate.current -= 1;
        }
        const monsterHpRatio = monsterHpRef.current / activeMonster.maxHp;
        drawMonster(ctx, monX, monY, activeMonster.type, monsterHpRatio, t);

        // Draw Monster HP Bar directly on Canvas (above head)
        const barWidth = 60;
        const barHeight = 4;
        ctx.save();
        ctx.fillStyle = 'rgba(31, 41, 55, 0.6)';
        ctx.fillRect(monX - barWidth / 2, monY - 35, barWidth, barHeight);
        ctx.fillStyle = monsterHpRatio <= 0.3 ? '#EF4444' : '#10B981';
        ctx.fillRect(monX - barWidth / 2, monY - 35, barWidth * monsterHpRatio, barHeight);
        ctx.restore();

        // 5. ANIMATE AND DRAW LASER BEAM
        if (laserAnim.current.active) {
          laserAnim.current.x += laserAnim.current.speed;
          
          ctx.save();
          ctx.strokeStyle = '#00F3FF';
          ctx.lineWidth = 4;
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#00F3FF';
          ctx.beginPath();
          ctx.moveTo(95, 110);
          ctx.lineTo(laserAnim.current.x, 110);
          ctx.stroke();
          ctx.restore();

          // Check hit
          if (laserAnim.current.x >= 535) {
            laserAnim.current.active = false;
            monsterVibrate.current = 15;

            // Spawn impact explosion particles
            for (let i = 0; i < 20; i++) {
              particles.current.push({
                x: 535,
                y: 110,
                vx: (Math.random() - 0.3) * 6,
                vy: (Math.random() - 0.5) * 6,
                size: Math.random() * 3 + 2,
                color: '#00F3FF',
                alpha: 1,
                gravity: 0.02
              });
            }

            // Spawn float damage text
            const dmgDealt = Math.round(activeMonster.maxHp / activeMonster.questions.length);
            damageTexts.current.push({
              x: 535,
              y: 90,
              text: `-${dmgDealt} HP`,
              color: '#00F3FF',
              size: 18,
              alpha: 1
            });

            if (handleMonsterHitRef.current) {
              handleMonsterHitRef.current(dmgDealt);
            }
          }
        }

        // 6. ANIMATE AND DRAW STONE/METEOR
        if (stoneAnim.current.active) {
          stoneAnim.current.x += stoneAnim.current.speed;
          stoneAnim.current.angle += 0.08;

          ctx.save();
          ctx.translate(stoneAnim.current.x, 110);
          ctx.rotate(stoneAnim.current.angle);

          // Draw meteor fire tail
          const trailGrad = ctx.createLinearGradient(0, 0, 18, 0);
          trailGrad.addColorStop(0, '#EF4444');
          trailGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = trailGrad;
          ctx.fillRect(4, -5, 18, 10);

          // Meteor body
          ctx.fillStyle = '#78350F'; // Dark brown
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Craters
          ctx.fillStyle = '#451A03';
          ctx.beginPath();
          ctx.arc(-3, -2, 2.5, 0, Math.PI * 2);
          ctx.arc(3, 3, 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();

          // Check hit
          if (stoneAnim.current.x <= 95) {
            stoneAnim.current.active = false;
            shakeTimer.current = 15;
            shieldFlash.current = 15; // Trigger spaceship red shield impact flash

            // Spawn red spaceship impact explosion particles
            for (let i = 0; i < 20; i++) {
              particles.current.push({
                x: 95,
                y: 110,
                vx: (Math.random() - 0.7) * 5,
                vy: (Math.random() - 0.5) * 5,
                size: Math.random() * 4 + 2,
                color: '#EF4444',
                alpha: 1,
                gravity: 0.05
              });
            }

            // Shield loss text
            damageTexts.current.push({
              x: 95,
              y: 85,
              text: `-1 SHIELD`,
              color: '#EF4444',
              size: 16,
              alpha: 1
            });

            if (handleSpaceshipHitRef.current) {
              handleSpaceshipHitRef.current();
            }
          }
        }

        // 7. UPDATE & RENDER SPARK PARTICLES
        particles.current = particles.current.filter((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity || 0;
          p.alpha -= 0.035;

          if (p.alpha <= 0) return false;

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          return true;
        });

        // 8. UPDATE & RENDER FLOATING DAMAGE TEXTS
        damageTexts.current = damageTexts.current.filter((d) => {
          d.y -= 1.1;
          d.alpha -= 0.025;

          if (d.alpha <= 0) return false;

          ctx.save();
          ctx.globalAlpha = d.alpha;
          ctx.fillStyle = d.color;
          ctx.font = `bold ${d.size}px Orbitron, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(d.text, d.x, d.y);
          ctx.restore();
          return true;
        });

        ctx.restore();
        animationFrameId.current = requestAnimationFrame(render);
      };

      render();
    }

    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [levelIndex, battleState]);

  // Audio trigger settings
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    if (!isMuted) {
      playBgm();
    } else {
      stopBgm();
    }
    return () => stopBgm();
  }, [isMuted]);

  const generateProceduralDsaQuestion = (topic) => {
    const fallbacks = {
      array: [
        { q: "What is the space complexity of merging two sorted arrays of sizes N and M into a new array?", opts: ["O(1)", "O(N + M)", "O(N log M)", "O(N * M)"], correct: 1, tip: "Storing the merged elements takes space proportional to both inputs." },
        { q: "Which operation on a dynamic array has an O(N) amortized worst-case complexity?", opts: ["Access by index", "Insert at beginning", "Insert at end", "Update element"], correct: 1, tip: "Inserting at the beginning requires shifting all N elements to the right." },
        { q: "What is the time complexity of searching a sorted array using Binary Search?", opts: ["O(1)", "O(log N)", "O(N)", "O(N log N)"], correct: 1, tip: "Binary Search halves the search space each step, running in O(log N)." }
      ],
      string: [
        { q: "What is the space complexity of generating all substrings of a string of length N?", opts: ["O(1)", "O(N)", "O(N²)", "O(2^N)"], correct: 2, tip: "There are N*(N+1)/2 substrings, requiring O(N²) space to store." },
        { q: "Which string search algorithm uses hashing to check pattern matches in O(N + M) average time?", opts: ["Naive", "KMP", "Rabin-Karp", "Boyer-Moore"], correct: 2, tip: "Rabin-Karp uses a rolling hash function to search strings in linear time." }
      ],
      stackqueue: [
        { q: "Which data structure is best suited for implementing a Breadth-First Search (BFS) traversal?", opts: ["Stack", "Queue", "Binary Tree", "Heap"], correct: 1, tip: "BFS visits nodes level by level using a FIFO Queue." },
        { q: "What is the time complexity to pop an element from a stack implemented using a singly linked list?", opts: ["O(1)", "O(log N)", "O(N)", "O(N log N)"], correct: 0, tip: "Popping from the head of a linked list is a constant O(1) time operation." }
      ],
      hash: [
        { q: "What is the worst-case search complexity of a hash table with poor hash distribution (all keys collide)?", opts: ["O(1)", "O(log N)", "O(N)", "O(N²)"], correct: 2, tip: "If all keys collide into a single chain, search degrades to O(N) linear search." }
      ],
      tree: [
        { q: "What is the height of a perfectly balanced Binary Tree with N nodes?", opts: ["O(1)", "O(log N)", "O(N)", "O(N log N)"], correct: 1, tip: "A balanced binary tree has a height of log2(N)." }
      ],
      graph: [
        { q: "Which algorithm finds the single-source shortest path in a graph with non-negative edge weights?", opts: ["Kruskal", "Prim", "Dijkstra", "Bellman-Ford"], correct: 2, tip: "Dijkstra's algorithm is optimal for non-negative weighted graphs." }
      ],
      backtrack: [
        { q: "What is the time complexity of solving the N-Queens problem using backtracking?", opts: ["O(N)", "O(N²)", "O(N!)", "O(2^N)"], correct: 2, tip: "Backtracking explores all board permutations, leading to O(N!) worst-case." }
      ]
    };

    const pool = fallbacks[topic] || fallbacks.array;
    const selected = pool[Math.floor(Math.random() * pool.length)];
    return shuffleQuestionObj({
      q: selected.q,
      opts: selected.opts,
      correct: selected.correct,
      tip: selected.tip,
      _id: "procedural-" + Math.random().toString(36).substr(2, 9)
    });
  };

  const loadNextUniqueQuestion = (currentIndex) => {
    let foundIdx = -1;
    for (let i = currentIndex + 1; i < activeMonster.questions.length; i++) {
      const q = activeMonster.questions[i];
      const qIdentifier = q._id || q.q;
      if (!seenQuestionIds.includes(qIdentifier)) {
        foundIdx = i;
        break;
      }
    }
    
    if (foundIdx === -1) {
      for (let i = 0; i < currentIndex; i++) {
        const q = activeMonster.questions[i];
        const qIdentifier = q._id || q.q;
        if (!seenQuestionIds.includes(qIdentifier)) {
          foundIdx = i;
          break;
        }
      }
    }

    if (foundIdx !== -1) {
      setQIndex(foundIdx);
      loadQuestion(foundIdx);
    } else {
      const fallbackQ = generateProceduralDsaQuestion(activeMonster.type);
      setActiveQuestion(fallbackQ);
      setSelectedOpt(null);
      setIsAnswerCorrect(null);
      setTimeLeft(activeMonster.timeLimit);
      setIsAnswering(true);
    }
  };

  // Launch Fight State
  const startCombat = () => {
    monsterHpRef.current = activeMonster.maxHp;
    playerShieldsRef.current = 3;
    setMonsterHp(activeMonster.maxHp);
    setPlayerShields(3);
    setQIndex(0);
    setSeenQuestionIds([]);
    setConfettiActive(false);
    setCombatText(`Defeat the ${activeMonster.name}! Choose correct answers to fire your lasers.`);
    loadQuestion(0);
    setBattleState('combat');
    speakText(`Entering battle with the ${activeMonster.name}. Prepare your big-O complexity attacks!`);
  };

  // Load question info
  const loadQuestion = (index) => {
    const q = activeMonster.questions[index];
    setActiveQuestion(q);
    setSelectedOpt(null);
    setIsAnswerCorrect(null);
    setTimeLeft(activeMonster.timeLimit);
    setIsAnswering(true);
  };

  // Countdown timer effect
  useEffect(() => {
    if (battleState === 'combat' && isAnswering && timeLeft > 0) {
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
  }, [battleState, isAnswering, timeLeft]);

  // Handle Timeout
  const handleTimeout = () => {
    if (!isAnswering) return;
    setIsAnswering(false);
    setSelectedOpt(-1);
    setIsAnswerCorrect(false);

    // Add current question to seen pool
    const qIdentifier = activeQuestion._id || activeQuestion.q;
    setSeenQuestionIds(prev => [...prev, qIdentifier]);

    // Launch stone impact meteor
    stoneAnim.current = { active: true, x: 520, y: 110, speed: -10, angle: 0 };
    setCombatText(`⏰ TIME EXPIRED! The ${activeMonster.name} hurls a giant stone at your spaceship!`);
    speakText("Time expired! Incoming stone attack!");
  };

  // Submit answer option selection
  const submitAnswer = (optIdx) => {
    if (!isAnswering) return;
    setIsAnswering(false);
    setSelectedOpt(optIdx);

    const isCorrect = optIdx === activeQuestion.correct;
    setIsAnswerCorrect(isCorrect);

    // Add current question to seen pool
    const qIdentifier = activeQuestion._id || activeQuestion.q;
    setSeenQuestionIds(prev => [...prev, qIdentifier]);

    if (isCorrect) {
      // Spaceship fires laser
      laserAnim.current = { active: true, x: 95, y: 110, speed: 12 };
      if (!isMuted) playSpellSound();
      setCombatText(`✨ OPTIMAL COMPILE! Spaceship fires lasers dealing critical compilation damage!`);
      speakText("Optimal compile! Laser fire!");

      // Prevent repeated questions by logging correct answer IDs to localStorage
      if (activeQuestion._id) {
        const solved = localStorage.getItem('solved_question_ids_algo-arena') || '';
        const solvedArr = solved.split(',').filter(Boolean);
        if (!solvedArr.includes(activeQuestion._id)) {
          solvedArr.push(activeQuestion._id);
          localStorage.setItem('solved_question_ids_algo-arena', solvedArr.join(','));
        }
      }
    } else {
      // Monster throws stone
      stoneAnim.current = { active: true, x: 520, y: 110, speed: -10, angle: 0 };
      setCombatText(`❌ SYNTAX ERROR! The ${activeMonster.name} throws a giant stone counter-attack.`);
      speakText("Syntax error! Incoming stone!");
    }
  };

  // Called when laser hits monster
  const handleMonsterHit = (dmg) => {
    const nextHp = Math.max(0, monsterHpRef.current - dmg);
    monsterHpRef.current = nextHp;
    setMonsterHp(nextHp);

    setTimeout(() => {
      if (nextHp <= 0) {
        // Boss is defeated!
        setConfettiActive(true);
        if (!isMuted) {
          playExplosionSound();
          playVictorySound();
        }
        speakText(`Warning: ${activeMonster.name} has been defeated. Loot chest unlocked.`);
        if (localStorage.getItem('active_daily_challenge_game') === 'algo-arena') {
          completeDailyChallenge();
        }
        setBattleState('loot');
      } else {
        loadNextUniqueQuestion(qIndex);
      }
    }, 1200);
  };

  // Called when stone hits spaceship
  const handleSpaceshipHit = () => {
    const nextShields = Math.max(0, playerShieldsRef.current - 1);
    playerShieldsRef.current = nextShields;
    setPlayerShields(nextShields);
    setShakeActive(true);
    setTimeout(() => setShakeActive(false), 500);

    setTimeout(() => {
      if (nextShields <= 0) {
        if (!isMuted) playDefeatSound();
        setBattleState('gameover');
        speakText("Warning: Spaceship shields collapsed. Critical system failure.");
      } else {
        loadNextUniqueQuestion(qIndex);
      }
    }, 1200);
  };

  // Restart campaign from level 1
  const restartGame = () => {
    setLevelIndex(0);
    setBattleState('lobby');
  };

  // Loot chest claimed
  const claimLoot = () => {
    if (!isMuted) playCoinSound();
    addCoins(80 * activeMonster.level);
    addXP(50 * activeMonster.level);
    setConfettiActive(false);

    const nextIndex = levelIndex + 1;
    if (nextIndex >= monsters.length) {
      setBattleState('victory');
      speakText("Congratulations! You cleared all sectors and claimed ultimate victory in the DSA Algorithm Arena!");
    } else {
      setLevelIndex(nextIndex);
      setBattleState('incoming'); // Direct player to incoming boss warning popup
    }
  };

  return (
    <div style={styles.container} className={shakeActive ? 'shake-animation' : ''}>
      <ConfettiEffect active={confettiActive} />
      {/* HUD Mute Controller */}
      <button style={styles.muteBtn} onClick={toggleMute} title="Toggle Audio Synth">
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        <span>BGM Synthesizer</span>
      </button>

      {/* 1. LOBBY ENTRY PANEL */}
      {battleState === 'lobby' && (
        <div className="game-card" style={styles.lobbyPanel}>
          <ShieldAlert size={64} color="var(--accent-color)" className="float-animation" />
          <h2 style={styles.title}>DSA ARENA: LEVEL {activeMonster.level} / 10</h2>
          <p style={styles.desc}>
            Prepare to battle the **{activeMonster.name}** in open space. You must answer complexity and data structure queries to navigate. Correct entries power up your spaceship lasers, while wrong responses trigger monster meteor strikes!
          </p>

          <div style={styles.gearBox}>
            <h4 style={styles.gearTitle}>Battle Directives:</h4>
            <div style={styles.gearRow}>
              <div>👾 Sector Beast: **{activeMonster.name}**</div>
              <div>⚡ Timer Limit: **{activeMonster.timeLimit} seconds**</div>
            </div>
            <div style={{ ...styles.gearRow, marginTop: '8px' }}>
              <div>🛡️ Ship Shields: **3 / 3 Max**</div>
              <div>📖 Level Questions: **{activeMonster.questions.length} Waves**</div>
            </div>
          </div>

          <button className="game-btn game-btn-primary" style={styles.actionBtn} onClick={startCombat}>
            <Play size={16} /> START MISSION
          </button>
        </div>
      )}

      {/* 1.5. NEW INCOMING ENEMY DETECTED WARNING POPUP */}
      {battleState === 'incoming' && (
        <div className="game-card" style={{ ...styles.lobbyPanel, borderColor: '#EF4444', boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)' }}>
          <div className="blink-animation" style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <span>⚠️</span> WARNING: NEW ENEMY DETECTED <span>⚠️</span>
          </div>
          <h2 style={{ ...styles.title, color: '#EF4444' }}>{activeMonster.name.toUpperCase()}</h2>
          <p style={styles.desc}>
            A new threat **{activeMonster.name}** has moved into Sector {activeMonster.level}! 
            <br />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{activeMonster.desc}</span>
          </p>

          <div style={styles.gearBox}>
            <h4 style={{ ...styles.gearTitle, color: '#EF4444' }}>Intel Specifications:</h4>
            <div style={styles.gearRow}>
              <div>👾 Golem Type: **{activeMonster.type.toUpperCase()}**</div>
              <div>⚡ Weakness: <span style={{ color: '#00F3FF', fontWeight: 'bold' }}>{activeMonster.weakness}</span></div>
            </div>
            <div style={{ ...styles.gearRow, marginTop: '8px' }}>
              <div>🛡️ Sector Level: **{activeMonster.level} / 10**</div>
              <div>📖 Question Waves: **{activeMonster.questions.length} Waves**</div>
            </div>
          </div>

          <button className="game-btn game-btn-primary" style={{ ...styles.actionBtn, background: 'linear-gradient(135deg, #EF4444 0%, #7F1D1D 100%)' }} onClick={() => setBattleState('lobby')}>
            PROCEED TO SECTOR
          </button>
        </div>
      )}

      {/* 2. COMBAT GAMEPLAY & SCREEN */}
      {(battleState === 'combat' || battleState === 'loot') && (
        <div style={styles.combatWorkspace}>
          {/* HUD Status Bar */}
          <div style={styles.hudBars}>
            <div className="game-card" style={styles.hpCard}>
              <span style={styles.hpLabel}>🛡️ SPACESHIP SHIELDS:</span>
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Heart
                    key={i}
                    size={18}
                    color={i < playerShields ? '#EF4444' : '#374151'}
                    fill={i < playerShields ? '#EF4444' : 'transparent'}
                  />
                ))}
              </div>
            </div>

            <div className="game-card" style={{ ...styles.hpCard, alignItems: 'flex-end' }}>
              <span style={styles.hpLabel}>👾 {activeMonster.name} HP: {monsterHp}/{activeMonster.maxHp}</span>
              <div style={styles.hpContainer}>
                <div style={{ ...styles.hpFill, width: `${(monsterHp / activeMonster.maxHp) * 100}%`, backgroundColor: '#00F3FF' }}></div>
              </div>
            </div>
          </div>

          {/* Interactive Spaceship Canvas */}
          <div style={styles.canvasWrapper} className="game-card">
            {battleState === 'loot' && (
              <div style={styles.lootChestOverlay} onClick={claimLoot} className="float-animation">
                <span style={{ fontSize: '4.5rem', cursor: 'pointer' }}>🎁</span>
                <p style={{ marginTop: '0.5rem', fontWeight: '800', color: '#00F3FF' }}>
                  LEVEL {activeMonster.level} CLEAR! CLICK TO COLLECT LOOT
                </p>
              </div>
            )}
            <canvas ref={canvasRef} width={650} height={220} style={styles.canvas}></canvas>
          </div>

          {/* Dynamic Console Logs */}
          <div style={styles.logsBox}>
            <p style={styles.logText}>{combatText}</p>
          </div>

          {/* Question Banner (displayed during active combat) */}
          {battleState === 'combat' && activeQuestion && (
            <div style={styles.quizPanel} className="game-card">
              {/* Timer Bar */}
              <div style={styles.timerContainer}>
                <div style={{ 
                  ...styles.timerFill, 
                  width: `${(timeLeft / activeMonster.timeLimit) * 100}%`,
                  backgroundColor: timeLeft <= 3 ? '#EF4444' : '#00F3FF'
                }}></div>
              </div>

              <div style={styles.questionHeader}>
                <HelpCircle size={18} color="var(--accent-color)" />
                <span>DSA COMPILE EXAM - LEVEL {activeMonster.level} / 10</span>
              </div>
              <p style={styles.questionText}>{activeQuestion.q}</p>
              
              <div style={styles.optsGrid}>
                {activeQuestion.opts.map((opt, idx) => {
                  let optStyle = { ...styles.optBtn };
                  if (selectedOpt !== null) {
                    if (idx === activeQuestion.correct) {
                      optStyle.borderColor = 'var(--success-color)';
                      optStyle.color = 'var(--success-color)';
                    } else if (selectedOpt === idx) {
                      optStyle.borderColor = 'var(--danger-color)';
                      optStyle.color = 'var(--danger-color)';
                    }
                  }
                  
                  return (
                    <button
                      key={idx}
                      className="game-btn"
                      style={optStyle}
                      disabled={selectedOpt !== null}
                      onClick={() => submitAnswer(idx)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {selectedOpt !== null && (
                <div style={styles.scrollTipBox}>
                  💡 **Scroll Hint:** {activeQuestion.tip}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. CAMPAIGN VICTORY */}
      {battleState === 'victory' && (
        <div className="game-card" style={styles.lobbyPanel}>
          <Trophy size={64} color="#EAB308" className="float-animation" />
          <h2 style={{ ...styles.title, color: 'var(--success-color)' }}>CAMPAIGN COMPLETE!</h2>
          <p style={styles.desc}>
            Sensational! You cleared all 10 levels of the DSA Space Arena, repaired the core compiler, and unlocked ultimate algorithmic mastery badges!
          </p>

          <button className="game-btn game-btn-primary" onClick={() => setGame(null)}>
            Return to Hub
          </button>
        </div>
      )}

      {/* 4. GAME OVER */}
      {battleState === 'gameover' && (
        <div className="game-card" style={styles.lobbyPanel}>
          <ShieldAlert size={64} color="var(--danger-color)" className="float-animation" />
          <h2 style={{ ...styles.title, color: 'var(--danger-color)' }}>SPACESHIP DESTROYED</h2>
          <p style={styles.desc}>
            The monster's meteor strikes punctured your hull shields. Review data structures complexity matrices and launch again!
          </p>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="game-btn game-btn-primary" onClick={restartGame}>Launch Ship</button>
            <button className="game-btn" onClick={() => setGame(null)}>Return to Hub</button>
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
    backgroundColor: 'rgba(16, 12, 18, 0.95)',
    borderWidth: '2px',
  },
  title: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.75rem',
    letterSpacing: '2px',
  },
  desc: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    lineHeight: '1.6',
  },
  gearBox: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.05)',
    padding: '1.25rem',
    borderRadius: '8px',
    width: '100%',
    textAlign: 'left',
  },
  gearTitle: {
    fontSize: '0.85rem',
    color: 'var(--accent-color)',
    marginBottom: '8px',
  },
  gearRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
  actionBtn: {
    width: '200px',
    justifyContent: 'center',
  },
  combatWorkspace: {
    width: '100%',
    maxWidth: '750px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  hudBars: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  hpCard: {
    padding: '0.75rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    backgroundColor: 'rgba(16, 12, 18, 0.7)',
  },
  hpLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  hpContainer: {
    width: '100%',
    height: '10px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginTop: '6px',
  },
  hpFill: {
    height: '100%',
    transition: 'width 0.4s ease',
  },
  canvasWrapper: {
    height: '240px',
    backgroundColor: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.05)',
    padding: '0',
    position: 'relative',
    overflow: 'hidden',
  },
  canvas: {
    width: '100%',
    height: '100%',
    display: 'block',
  },
  lootChestOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 5,
  },
  logsBox: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: '0.75rem 1rem',
    minHeight: '48px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid rgba(255,255,255,0.02)',
  },
  logText: {
    fontSize: '0.85rem',
    fontStyle: 'italic',
    lineHeight: '1.4',
  },
  quizPanel: {
    backgroundColor: 'rgba(16, 12, 18, 0.95)',
    border: '1px solid var(--accent-color)',
    padding: '1.5rem',
    boxShadow: 'var(--glow-accent)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    position: 'relative',
    overflow: 'hidden',
  },
  timerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  timerFill: {
    height: '100%',
    transition: 'width 1s linear, background-color 0.5s ease',
  },
  questionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: 'var(--accent-color)',
  },
  questionText: {
    fontSize: '0.95rem',
    fontWeight: '700',
    lineHeight: '1.5',
  },
  optsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  optBtn: {
    width: '100%',
    justifyContent: 'center',
  },
  scrollTipBox: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: '8px 12px',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: '6px',
  }
};
