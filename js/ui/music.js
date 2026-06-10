// Hudební modul pro Husitské Války
// Přehrává melodii "Ktož jsú boží bojovníci"

const Music = {
    audio: null,
    isPlaying: false,

    // Inicializace audio elementu
    init() {
        if (!this.audio) {
            this.audio = new Audio('audio/ktoz-jsu-bozi-bojovnici-dobrevyzvaneni.mobi.mp3');
            this.audio.loop = true;
            this.audio.volume = 0.5;

            // Event listenery pro sledování stavu
            this.audio.addEventListener('play', () => {
                this.isPlaying = true;
            });

            this.audio.addEventListener('pause', () => {
                this.isPlaying = false;
            });

            this.audio.addEventListener('ended', () => {
                this.isPlaying = false;
            });
        }
        return this.audio;
    },

    // Přehrání melodie s loopem
    playMelody(loop = false) {
        this.init();
        this.audio.loop = loop;

        // Start playback
        const playPromise = this.audio.play();

        // Handle autoplay restrictions
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('Audio playback failed:', error);
            });
        }
    },

    // Zastavení přehrávání
    stop() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.isPlaying = false;
        }
    },

    // Nastavení hlasitosti (0-1)
    setVolume(vol) {
        const volume = Math.max(0, Math.min(1, vol));
        if (this.audio) {
            this.audio.volume = volume;
        }
    },

    // Zapnutí/vypnutí hudby
    toggle() {
        this.init();

        if (this.audio.paused) {
            this.audio.loop = true;
            const playPromise = this.audio.play();

            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        this.isPlaying = true;
                    })
                    .catch(error => {
                        console.warn('Audio playback failed:', error);
                        this.isPlaying = false;
                    });
            }
            return true;
        } else {
            this.audio.pause();
            this.isPlaying = false;
            return false;
        }
    }
};

// Export pro globální použití
window.Music = Music;
