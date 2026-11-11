// ==========================================================================
// ECLIPSE TEAM 3 - INTERACTIVE CANVAS & WEB AUDIO CONTROLLER
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------------------------
    // 1. Mobile Menu Toggle
    // ----------------------------------------------------------------------
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            const icon = mobileToggle.querySelector('i');
            if (navMenu.classList.contains('open')) {
                icon.className = 'fas fa-xmark';
            } else {
                icon.className = 'fas fa-bars';
            }
        });
    }

    // Smooth scroll close menu
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                mobileToggle.querySelector('i').className = 'fas fa-bars';
            }
        });
    });

    // ----------------------------------------------------------------------
    // 2. Audio Effects Synthesizer (Web Audio API)
    // ----------------------------------------------------------------------
    let audioCtx = null;
    let audioEnabled = true;

    function initAudio() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playTickSound() {
        if (!audioEnabled) return;
        initAudio();
        
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
    }

    function playRocketLaunchSound() {
        if (!audioEnabled) return;
        initAudio();

        const bufferSize = audioCtx.sampleRate * 1.5;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 1.2);

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        noise.start();
    }

    const soundToggle = document.getElementById('soundToggle');
    const soundIcon = document.getElementById('soundIcon');
    const soundText = document.getElementById('soundText');

    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            audioEnabled = !audioEnabled;
            if (audioEnabled) {
                soundIcon.className = 'fas fa-volume-up';
                if (soundText) soundText.textContent = 'Audio ON';
                playTickSound();
            } else {
                soundIcon.className = 'fas fa-volume-mute';
                if (soundText) soundText.textContent = 'Audio OFF';
            }
        });
    }

    document.getElementById('pingSoundBtn')?.addEventListener('click', () => {
        playTickSound();
    });

    document.getElementById('launchBtn')?.addEventListener('click', () => {
        playRocketLaunchSound();
        triggerRocketBurst();
    });

    // ----------------------------------------------------------------------
    // 3. Futuristic Countdown Clock (Target: Nov 30, 2026)
    // ----------------------------------------------------------------------
    const targetDate = new Date('November 30, 2026 23:59:59').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            document.getElementById('days').innerText = '00';
            document.getElementById('hours').innerText = '00';
            document.getElementById('minutes').innerText = '00';
            document.getElementById('seconds').innerText = '00';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').innerText = days < 10 ? '0' + days : days;
        document.getElementById('hours').innerText = hours < 10 ? '0' + hours : hours;
        document.getElementById('minutes').innerText = minutes < 10 ? '0' + minutes : minutes;
        
        const secondsElem = document.getElementById('seconds');
        if (secondsElem) {
            const prevSeconds = secondsElem.innerText;
            const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;

            if (prevSeconds !== formattedSeconds) {
                secondsElem.innerText = formattedSeconds;
                playTickSound();
            }
        }
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

    // ----------------------------------------------------------------------
    // 4. Interactive Canvas Background: Flying Rocket Particles
    // ----------------------------------------------------------------------
    const canvas = document.getElementById('spaceCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const stars = Array.from({ length: 120 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2,
        alpha: Math.random(),
        speed: Math.random() * 0.02 + 0.005
    }));

    class FlyingRocket {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width * 0.8;
            this.y = height + 100;
            this.speed = Math.random() * 3 + 2;
            this.size = Math.random() * 0.6 + 0.5;
            this.angle = -Math.PI / 4 + (Math.random() * 0.2 - 0.1);
            this.alpha = 1;
        }

        update() {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;

            if (this.y < -150 || this.x > width + 150) {
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle + Math.PI / 2);
            ctx.scale(this.size, this.size);

            // Propulsion Flame Gradient
            const flameGradient = ctx.createLinearGradient(0, 30, 0, 90);
            flameGradient.addColorStop(0, '#FF6A1A');
            flameGradient.addColorStop(0.6, '#F21414');
            flameGradient.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.moveTo(-10, 30);
            ctx.lineTo(0, 70 + Math.random() * 20);
            ctx.lineTo(10, 30);
            ctx.fillStyle = flameGradient;
            ctx.fill();

            // Rocket Body (Eclipse Icon shape)
            ctx.beginPath();
            ctx.moveTo(0, -40);
            ctx.bezierCurveTo(15, -10, 18, 20, 14, 35);
            ctx.lineTo(-14, 35);
            ctx.bezierCurveTo(-18, 20, -15, -10, 0, -40);
            ctx.fillStyle = '#F5F5F5';
            ctx.fill();

            // Wings
            ctx.beginPath();
            ctx.moveTo(-14, 15);
            ctx.lineTo(-26, 38);
            ctx.lineTo(-12, 35);
            ctx.fillStyle = '#F21414';
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(14, 15);
            ctx.lineTo(26, 38);
            ctx.lineTo(12, 35);
            ctx.fillStyle = '#F21414';
            ctx.fill();

            ctx.restore();
        }
    }

    const rockets = Array.from({ length: 5 }, () => new FlyingRocket());

    function triggerRocketBurst() {
        rockets.push(new FlyingRocket());
        if (rockets.length > 12) rockets.shift();
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        stars.forEach(star => {
            star.alpha += star.speed;
            if (star.alpha > 1 || star.alpha < 0) star.speed = -star.speed;
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(star.alpha)})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });

        rockets.forEach(rocket => {
            rocket.update();
            rocket.draw();
        });

        requestAnimationFrame(animate);
    }

    animate();
});
