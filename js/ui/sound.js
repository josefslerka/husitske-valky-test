// Zvukový systém - generování zvuků pomocí Web Audio API

class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.volume = 0.5;

        // Inicializace po prvním uživatelském vstupu (kvůli autoplay policy)
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API není podporováno:', e);
            this.enabled = false;
        }
    }

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }

    mute() {
        this.enabled = false;
    }

    unmute() {
        this.enabled = true;
    }

    // Pomocná metoda pro vytvoření oscilátoru
    createOscillator(type, frequency, duration, volume = 1) {
        if (!this.enabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(volume * this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);

        return { oscillator, gainNode };
    }

    // Pomocná metoda pro šum
    createNoise(duration, volume = 1) {
        if (!this.enabled || !this.audioContext) return;

        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;

        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(volume * this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        // Filtr pro tvarování zvuku
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);

        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        source.start();
        source.stop(this.audioContext.currentTime + duration);

        return { source, gainNode, filter };
    }

    // === HERNÍ ZVUKY ===

    // Výběr jednotky
    playSelect() {
        this.init();
        if (!this.enabled || !this.audioContext) return;

        // Krátký "klik" zvuk
        this.createOscillator('sine', 800, 0.1, 0.3);
        setTimeout(() => {
            this.createOscillator('sine', 1200, 0.08, 0.2);
        }, 50);
    }

    // Pohyb jednotky
    playMove() {
        this.init();
        if (!this.enabled || !this.audioContext) return;

        // Zvuk kroků / pohybu
        const playStep = (delay, freq) => {
            setTimeout(() => {
                this.createNoise(0.1, 0.2);
                this.createOscillator('triangle', freq, 0.1, 0.1);
            }, delay);
        };

        playStep(0, 150);
        playStep(100, 140);
        playStep(200, 160);
    }

    // Útok mečem / cepem
    playMeleeAttack() {
        this.init();
        if (!this.enabled || !this.audioContext) return;

        // Švih
        const swish = this.createNoise(0.15, 0.4);
        if (swish) {
            swish.filter.frequency.setValueAtTime(3000, this.audioContext.currentTime);
            swish.filter.frequency.exponentialRampToValueAtTime(500, this.audioContext.currentTime + 0.15);
        }

        // Náraz
        setTimeout(() => {
            this.createOscillator('sawtooth', 100, 0.2, 0.5);
            this.createNoise(0.1, 0.3);
        }, 100);
    }

    // Útok střelou / šípem
    playRangedAttack() {
        this.init();
        if (!this.enabled || !this.audioContext) return;

        // Výstřel / vypuštění šípu
        const shot = this.createNoise(0.2, 0.3);
        if (shot) {
            shot.filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
            shot.filter.frequency.exponentialRampToValueAtTime(500, this.audioContext.currentTime + 0.2);
        }

        // Hvízdnutí šípu
        this.createOscillator('sine', 800, 0.3, 0.2);
        setTimeout(() => {
            this.createOscillator('sine', 600, 0.15, 0.15);
        }, 200);
    }

    // Zásah / poškození
    playHit() {
        this.init();
        if (!this.enabled || !this.audioContext) return;

        // Náraz
        this.createOscillator('square', 80, 0.15, 0.4);
        this.createNoise(0.1, 0.25);

        // Kovový zvuk
        setTimeout(() => {
            this.createOscillator('triangle', 400, 0.1, 0.2);
        }, 50);
    }

    // Zničení jednotky
    playDeath() {
        this.init();
        if (!this.enabled || !this.audioContext) return;

        // Pád
        this.createOscillator('sawtooth', 200, 0.4, 0.4);
        this.createNoise(0.3, 0.3);

        // Klesající tón
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);

        gain.gain.setValueAtTime(0.3 * this.volume, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.5);
    }

    // Konec tahu
    playEndTurn() {
        this.init();
        if (!this.enabled || !this.audioContext) return;

        // Fanfára
        const notes = [523, 659, 784]; // C5, E5, G5
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.createOscillator('triangle', freq, 0.2, 0.25);
            }, i * 100);
        });
    }

    // Začátek tahu hráče
    playPlayerTurn() {
        this.init();
        if (!this.enabled || !this.audioContext) return;

        // Pozitivní zvuk
        this.createOscillator('sine', 440, 0.15, 0.3);
        setTimeout(() => {
            this.createOscillator('sine', 554, 0.15, 0.3);
        }, 100);
        setTimeout(() => {
            this.createOscillator('sine', 659, 0.2, 0.3);
        }, 200);
    }

    // Začátek tahu AI
    playAITurn() {
        this.init();
        if (!this.enabled || !this.audioContext) return;

        // Temný zvuk
        this.createOscillator('sawtooth', 150, 0.3, 0.2);
        this.createOscillator('sine', 200, 0.3, 0.15);
    }

    // Vítězství
    playVictory() {
        this.init();
        if (!this.enabled || !this.audioContext) return;

        // Vítězná fanfára
        const melody = [
            { freq: 523, delay: 0 },     // C5
            { freq: 659, delay: 150 },   // E5
            { freq: 784, delay: 300 },   // G5
            { freq: 1047, delay: 450 },  // C6
            { freq: 784, delay: 600 },   // G5
            { freq: 1047, delay: 750 },  // C6
        ];

        melody.forEach(note => {
            setTimeout(() => {
                this.createOscillator('triangle', note.freq, 0.3, 0.35);
                this.createOscillator('sine', note.freq * 2, 0.2, 0.15);
            }, note.delay);
        });
    }

    // Prohra
    playDefeat() {
        this.init();
        if (!this.enabled || !this.audioContext) return;

        // Smutná melodie
        const melody = [
            { freq: 392, delay: 0 },     // G4
            { freq: 349, delay: 300 },   // F4
            { freq: 330, delay: 600 },   // E4
            { freq: 262, delay: 900 },   // C4
        ];

        melody.forEach(note => {
            setTimeout(() => {
                this.createOscillator('sine', note.freq, 0.4, 0.3);
            }, note.delay);
        });
    }

    // Obranný postoj
    playDefend() {
        this.init();
        if (!this.enabled || !this.audioContext) return;

        // Zvuk štítu
        this.createOscillator('triangle', 300, 0.2, 0.25);
        this.createNoise(0.15, 0.15);

        setTimeout(() => {
            this.createOscillator('sine', 500, 0.15, 0.2);
        }, 100);
    }

    // Hover nad hexem
    playHover() {
        this.init();
        if (!this.enabled || !this.audioContext) return;

        // Jemný tón
        this.createOscillator('sine', 1000, 0.05, 0.1);
    }

    // Neplatná akce
    playInvalid() {
        this.init();
        if (!this.enabled || !this.audioContext) return;

        // Chybový zvuk
        this.createOscillator('square', 200, 0.15, 0.3);
        setTimeout(() => {
            this.createOscillator('square', 150, 0.15, 0.3);
        }, 150);
    }

    // Vozová hradba - speciální zvuk
    playWagonFort() {
        this.init();
        if (!this.enabled || !this.audioContext) return;

        // Zvuk dřeva a kovu
        this.createNoise(0.2, 0.2);
        this.createOscillator('triangle', 150, 0.3, 0.25);

        setTimeout(() => {
            this.createOscillator('sawtooth', 200, 0.15, 0.2);
        }, 150);
    }

    // Jízda - zvuk koně
    playHorse() {
        this.init();
        if (!this.enabled || !this.audioContext) return;

        // Klusání
        const hoof = (delay) => {
            setTimeout(() => {
                this.createNoise(0.05, 0.3);
                this.createOscillator('triangle', 100 + Math.random() * 50, 0.08, 0.2);
            }, delay);
        };

        hoof(0);
        hoof(80);
        hoof(200);
        hoof(280);
    }
}

// Globální instance
const Sound = new SoundManager();
