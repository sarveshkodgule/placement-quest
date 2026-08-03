// Global procedural audio synthesis engine using the Web Audio API
class AudioManagerSingleton {
  constructor() {
    this.ctx = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.masterGain = null;

    this.activeTrack = 'none';
    this.isMuted = false;
    this.bgmVolumeVal = 0.5;
    this.sfxVolumeVal = 0.5;

    // Scheduler states
    this.timerId = null;
    this.nextNoteTime = 0.0;
    this.beatIndex = 0;
    this.bpm = 110;
    this.lookahead = 25.0; // ms
    this.scheduleAheadTime = 0.1; // sec

    // Active playing nodes tracker
    this.activeNodes = [];
    this.noiseNode = null;
  }

  // Lazy initialize AudioContext on user interaction
  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();

    // Setup node routing
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.connect(this.masterGain);
    this.bgmGain.gain.setValueAtTime(this.bgmVolumeVal, this.ctx.currentTime);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.connect(this.masterGain);
    this.sfxGain.gain.setValueAtTime(this.sfxVolumeVal, this.ctx.currentTime);
  }

  resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    this.init();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
  }

  setBgmVolume(volume) {
    this.bgmVolumeVal = volume;
    this.init();
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(volume, this.ctx.currentTime);
    }
  }

  setSfxVolume(volume) {
    this.sfxVolumeVal = volume;
    this.init();
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(volume, this.ctx.currentTime);
    }
  }

  // Play a specific procedural background loop
  playTrack(trackName) {
    this.resume();
    if (!this.ctx) return;

    if (this.activeTrack === trackName) return; // Already playing
    this.stopTrack();

    this.activeTrack = trackName;
    if (trackName === 'none') return;

    // Adjust parameters for different tracks
    if (trackName === 'chiptune') {
      this.bpm = 125;
    } else if (trackName === 'jazz') {
      this.bpm = 75;
    } else if (trackName === 'lofi') {
      this.bpm = 65;
      // Start lofi vinyl scratch noise
      this.noiseNode = this.createVinylCrackle(this.ctx.currentTime);
    }

    this.nextNoteTime = this.ctx.currentTime;
    this.beatIndex = 0;
    this.scheduler();
  }

  stopTrack() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    // Stop active synthesizer notes
    this.activeNodes.forEach(node => {
      try {
        node.stop();
      } catch (e) {}
    });
    this.activeNodes = [];

    // Stop noise generator
    if (this.noiseNode) {
      try {
        this.noiseNode.stop();
      } catch (e) {}
      this.noiseNode = null;
    }

    this.activeTrack = 'none';
  }

  // Eighth-note scheduler loop
  scheduler() {
    if (!this.ctx || this.activeTrack === 'none') return;

    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNextNote(this.beatIndex, this.nextNoteTime);
      this.nextNoteTime += 60.0 / this.bpm / 2; // Eighth-notes
      this.beatIndex = (this.beatIndex + 1) % 16;
    }
    this.timerId = setTimeout(() => this.scheduler(), this.lookahead);
  }

  scheduleNextNote(beat, time) {
    if (this.activeTrack === 'chiptune') {
      this.synthesizeChiptune(beat, time);
    } else if (this.activeTrack === 'jazz') {
      this.synthesizeJazz(beat, time);
    } else if (this.activeTrack === 'lofi') {
      this.synthesizeLofi(beat, time);
    }
  }

  // TRACK 1: Retro Chiptune Loop (Square arpeggios + noise hit drum)
  synthesizeChiptune(beat, time) {
    // 1. Bassline progression (C -> G -> Am -> F)
    const progressions = [
      [130.81, 196.00], // C3, G3
      [98.00, 146.83],  // G2, D3
      [110.00, 164.81], // A2, E3
      [87.31, 130.81]   // F2, C3
    ];
    const progIndex = Math.floor(beat / 4) % progressions.length;
    const currentBass = progressions[progIndex][beat % 2];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(currentBass, time);

    gain.gain.setValueAtTime(0.04, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.connect(gain);
    gain.connect(this.bgmGain);
    osc.start(time);
    osc.stop(time + 0.2);
    this.activeNodes.push(osc);

    // 2. Chiptune melody arpeggiator on sixteenth notes
    const melNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C4, D4, E4, G4, A4, C5
    if (beat % 2 === 0) {
      const targetNote = melNotes[(beat * 3 + Math.floor(time)) % melNotes.length];
      const melOsc = this.ctx.createOscillator();
      const melGain = this.ctx.createGain();
      
      melOsc.type = 'triangle';
      melOsc.frequency.setValueAtTime(targetNote, time);

      melGain.gain.setValueAtTime(0.025, time);
      melGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

      melOsc.connect(melGain);
      melGain.connect(this.bgmGain);
      melOsc.start(time);
      melOsc.stop(time + 0.16);
      this.activeNodes.push(melOsc);
    }
  }

  // TRACK 2: Chill Corporate Jazz Chords Loop
  synthesizeJazz(beat, time) {
    // Only schedule chords every 4 beats (measure)
    if (beat % 4 !== 0) return;

    const chords = [
      [130.81, 164.81, 196.00, 246.94], // Cmaj7 (C3, E3, G3, B3)
      [110.00, 130.81, 164.81, 196.00], // Am7 (A2, C3, E3, G3)
      [146.83, 174.61, 220.00, 261.63], // Dm7 (D3, F3, A3, C4)
      [98.00, 123.47, 146.83, 174.61]   // G7 (G2, B2, D3, F3)
    ];

    const chordIndex = Math.floor(beat / 4) % chords.length;
    const currentChord = chords[chordIndex];

    // Play 4 notes simultaneously
    currentChord.forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      // Smooth envelope attack & release
      gain.gain.setValueAtTime(0.0, time);
      gain.gain.linearRampToValueAtTime(0.02, time + 0.5);
      gain.gain.setValueAtTime(0.02, time + 2.0);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 2.9);

      osc.connect(gain);
      gain.connect(this.bgmGain);
      osc.start(time);
      osc.stop(time + 3.0);
      this.activeNodes.push(osc);
    });
  }

  // TRACK 3: Lofi Coding Beats (Sine wave pentatonics + crackle overlay)
  synthesizeLofi(beat, time) {
    // Soft minor pentatonic loop (Am Pentatonic)
    const melody = [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33]; // A3 to D5
    
    // Play on slow syncopated beats
    const isNoteBeat = [0, 2, 3, 5, 8, 10, 11, 13].includes(beat % 16);
    if (!isNoteBeat) return;

    const note = melody[(beat * 2 + Math.floor(time / 4)) % melody.length];
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(note, time);

    gain.gain.setValueAtTime(0.0, time);
    gain.gain.linearRampToValueAtTime(0.035, time + 0.1);
    gain.gain.setValueAtTime(0.035, time + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 1.4);

    osc.connect(gain);
    gain.connect(this.bgmGain);
    osc.start(time);
    osc.stop(time + 1.5);
    this.activeNodes.push(osc);
  }

  // Creates procedural vinyl record dust/hiss noise buffer
  createVinylCrackle(time) {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const randomVal = Math.random() * 2 - 1;
      if (Math.random() > 0.9997) {
        data[i] = randomVal * 0.15; // Vinyl pop crackle
      } else {
        data[i] = randomVal * 0.008; // Smooth analogue static
      }
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1200; // Filter off muddy low frequencies

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.06, time);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    noise.start(time);
    return noise;
  }

  // ==========================================
  // CENTRALIZED SFX TRIGGERS (Web Audio)
  // ==========================================
  
  playCollect() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime); // A5 note
    osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.08); // slide up

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playSuccess() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    // Play major triad arpeggio
    const chord = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = this.ctx.currentTime + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.06, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(time);
      osc.stop(time + 0.3);
    });
  }

  playError() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    // Harsh double sine-wave buzz
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(110, this.ctx.currentTime); // Low A2 buzz
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(112, this.ctx.currentTime); // Detune

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.3);
    osc2.stop(this.ctx.currentTime + 0.3);
  }

  playBossHit() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    // Synthesized explosion sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playUpgrade() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(330, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(990, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }
}

export const audioManager = new AudioManagerSingleton();
