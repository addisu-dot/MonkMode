/* SAFE STORAGE: localStorage can throw when blocked (private mode, strict settings) */
const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    remove(k) { try { localStorage.removeItem(k); } catch (e) {} }
};

/* TACTICAL AUDIO SYNTHESIZER ENGINE WITH THEME-AWARE FREQUENCIES */
let audioEnabled = true;
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function playBeep(customFreq, type = 'sine', duration = 0.04) {
    if (!audioEnabled) return;
    try {
        if (!audioCtx) audioCtx = new AudioCtx();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const rootFreq = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--audio-freq').trim()) || 600;
        const freq = customFreq || rootFreq;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
}

function toggleAudio() {
    audioEnabled = !audioEnabled;
    document.getElementById('audioStatusLabel').innerText = audioEnabled ? 'ON' : 'OFF';
    if (audioEnabled) playBeep(null, 'triangle', 0.06);
}

function toggleCRT() {
    const crt = document.getElementById('crtOverlay');
    crt.classList.toggle('disabled');
    const isActive = !crt.classList.contains('disabled');
    document.getElementById('crtStatusLabel').innerText = isActive ? 'ON' : 'OFF';
    playBeep(isActive ? 900 : 400, 'sine', 0.05);
}

/* MOVING BACKGROUND CANVAS */
const canvas = document.getElementById('cyberBgCanvas');
const ctx = canvas.getContext('2d');
let width, height, particles = [];
let cachedAccent = '#38bdf8';
function refreshAccent() {
    cachedAccent = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim() || '#38bdf8';
}
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class CyberNode {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.radius = Math.random() * 1.8 + 0.8;
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = cachedAccent;
        ctx.globalAlpha = 0.4;
        ctx.fill();
    }
}

for (let i = 0; i < 45; i++) particles.push(new CyberNode());

let bgRunning = false;
function animateCyberBg() {
    bgRunning = true;
    ctx.clearRect(0, 0, width, height);
    const accentColor = cachedAccent;
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 0.5;

    const time = Date.now() * 0.001;
    const gridSize = 60;
    const offsetY = (time * 10) % gridSize;

    ctx.globalAlpha = 0.04;
    ctx.beginPath();
    for (let x = 0; x <= width; x += gridSize) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
    for (let y = offsetY; y <= height; y += gridSize) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
    ctx.stroke();

    for (let i = 0; i < particles.length; i++) {
        particles[i].update(); particles[i].draw();
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 110) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = accentColor;
                ctx.globalAlpha = (1 - dist / 110) * 0.15;
                ctx.stroke();
            }
        }
    }
    if (!reduceMotion && !document.hidden) requestAnimationFrame(animateCyberBg);
    else bgRunning = false;
}
animateCyberBg();
document.addEventListener('visibilitychange', () => { if (!document.hidden && !reduceMotion && !bgRunning) animateCyberBg(); });

/* CORE APPLICATION STATE */
const CLASS_START_DATE = new Date('2026-11-10');
const PHASE_START_DATE = new Date('2026-09-11');
const now = new Date();
const isClassMode = now >= CLASS_START_DATE;
const currentModeKey = isClassMode ? 'ClassIntegration' : 'NonClass';
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
// Checks are stored per calendar date so Monday's ticks don't carry into next Monday
function dateKeyFor(dayName) {
    const diff = daysOfWeek.indexOf(dayName) - now.getDay();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
let selectedDay = daysOfWeek[now.getDay()];

const books = [
    { title: "Mastery (Robert Greene)", focus: "Chapters 5 & 6 (The Creative-Active & Mastery)", notes: "Focuses on transitioning from apprenticeship to creative autonomy through deep problem immersion and rigorous pattern recognition." },
    { title: "The Laws of Human Nature (Robert Greene)", focus: "Chapters 2 (Narcissism), 6 (Short-sightedness), & 11 (Envy)", notes: "Maps psychological blind spots to maintain emotional objectivity and safeguard personal execution from social friction." },
    { title: "Antifragile (Nassim Nicholas Taleb)", focus: "Books I & IV (Building systems that gain from chaos)", notes: "Architecting robust systems that actually strengthen under volatility, stress, and randomized scheduling pressure." },
    { title: "Finite and Infinite Games (James P. Carse)", focus: "Chapter 1 (Beating boredom in total control)", notes: "Distinguishes competing to win within rules versus playing to continue the game indefinitely with boundless vision." },
    { title: "The Logic of Political Survival (Bruce Bueno de Mesquita)", focus: "Chapter 1 (Pure power mechanics)", notes: "Analyzes coalition building, resource distribution incentives, and how institutional leaders retain authority." },
    { title: "The 33 Strategies of War (Robert Greene)", focus: "Parts IV & V (Offensive & Unconventional Strategy)", notes: "Tactical positioning, asymmetrical engagement, and maintaining psychological composure under high-stakes combat pressure." },
    { title: "The Sovereign Individual (Davidson & Rees-Mogg)", focus: "Chapters 1 & 4 (Macro tech & economic trends)", notes: "Anticipating macro-economic shifts, digital decentralization, and positioning oneself as an independent economic agent." },
    { title: "Beyond Good and Evil (Friedrich Nietzsche)", focus: "Chapters 1 & 9 (Constructing internal values)", notes: "Deconstructing conventional morality to forge autonomous internal standards and uncompromising personal discipline." },
    { title: "The Book of Not Knowing (Peter Ralston)", focus: "Part II (Mechanics of perception & internal illusions)", notes: "Examining the mechanics of consciousness, shedding preconceptions, and cultivating absolute clarity of perception." },
    { title: "Thinking, Fast and Slow (Daniel Kahneman)", focus: "Parts 1 & 3 (Mapping cognitive bugs)", notes: "Identifying mental heuristics, system 1 vs system 2 biases, and neutralizing irrational decision-making under stress." }
];

const fitnessModules = [
    { title: "1.5-Mile Run (Target < 10:30)", subtitle: "Aerobic threshold & pacing benchmark", notes: "Pacing strategy requires maintaining a consistent 7:00/mile split through controlled cadence, nasal breathing techniques, and lung capacity expansion." },
    { title: "Strict Push-ups (Target 40+ reps)", subtitle: "Upper body strength endurance", notes: "Unbroken execution with full lockouts at the top and chest hovering 2 inches above ground at the bottom. Zero hip sag or momentum cheating." },
    { title: "Core Plank (Target 2+ mins)", subtitle: "Transverse abdominis stabilization", notes: "Posterior pelvic tilt, glutes fully squeezed, ribs locked down to eliminate lower back lumbar strain during prolonged holds." },
    { title: "Workout Split: Strength (Mon / Wed / Fri)", subtitle: "Bodyweight & Greasing the Groove", notes: "Focus on push-up pyramids and pull-up progressions. Apply 'Greasing the Groove' (GtG) during class transitions by executing sub-maximal sets throughout the day to build neural pathways without fatigue." },
    { title: "Workout Split: Cardio Engine (Tue / Thu / Sat)", subtitle: "Aerobic & Interval Conditioning", notes: "Tuesday Zone 2 steady runs (45m aerobic base); Thursday 400m high-intensity intervals (VO2 max output); Saturday timed 1.5-mile benchmark simulation." },
    { title: "Workout Split: Sunday Recovery", subtitle: "Active mobility & CNS reset", notes: "Complete structural joint mobility, foam rolling, dynamic stretching, and central nervous system decompression to prepare for the weekly cycle." },
    { title: "Ethiopian Breakfast Baseline", subtitle: "Clean morning focus & energy", notes: "Enkulal Firfir (scrambled eggs spiced with onions, tomatoes, and berbere) paired with black coffee or spiced tea for clean morning focus." },
    { title: "Ethiopian Lunch Baseline", subtitle: "Complex carbs & amino acids", notes: "Shiro Wot or Misir Wot accompanied by 2 whole boiled eggs and fresh Injera for complex carbohydrates and sustained amino acid delivery." },
    { title: "Ethiopian Dinner Baseline", subtitle: "Slow-digesting overnight repair", notes: "Defen Misir or Kik Wot paired with Ayib (traditional cottage cheese) and Injera to provide slow-digesting proteins for overnight tissue repair." },
    { title: "Performance Snacks", subtitle: "Micronutrients & quick fuel", notes: "Roasted Kolo (barley) and boiled eggs for quick micronutrients and sustained energy between intensive study blocks." }
];

const schedules = {
    NonClass: {
        Monday: [
            { time: "05:30 - 07:30", title: "Morning Reset, Conditioning & Active English", detail: "Push-up pyramid targeting 40+ strict reps. Active reading aloud in English to eliminate hesitation. Read ~5 pages of current book." },
            { time: "07:30 - 12:30", title: "Deep Work: CS Algorithms & Architecture", detail: "Uninterrupted deep work blocks. Implement Greasing the Groove push-ups between intense coding periods." },
            { time: "12:30 - 13:30", title: "High-Protein Lunch & Diffuse Walk", detail: "Shiro Wot / Misir Wot + 2 boiled eggs + Injera. Phone-free outdoor walk for subconscious problem solving." },
            { time: "13:30 - 16:30", title: "Applied Coding & Data Structures", detail: "Rigorous implementation of university data structures and backend logic scripts." },
            { time: "16:30 - 18:00", title: "Active English Output & Mobility", detail: "Record a 15-minute audio log explaining technical CS or aviation concepts in fluent English. Core mobility drills." },
            { time: "18:00 - 21:00", title: "Dinner, Metrics Review & Sleep Prep", detail: "Defen Misir / Kik Wot + Ayib + Injera. Review daily log metrics. Read ~5 pages of current book. Strict lights out by 21:30." }
        ],
        Tuesday: [
            { time: "05:30 - 07:30", title: "Cardio Engine: Zone 2 Run & Sprints", detail: "45-minute Zone 2 baseline run targeting sub-10:30 pace for 1.5 miles. Post-run stretch. English podcast while running." },
            { time: "07:30 - 12:30", title: "Deep Work: University CS & Systems", detail: "High-focus backend systems programming. Zero notifications, dedicated workflow blocks." },
            { time: "12:30 - 13:30", title: "High-Protein Lunch & Hydration", detail: "Shiro Wot + 2 boiled eggs + Injera. Complete offline reset and diffuse walking." },
            { time: "13:30 - 16:30", title: "Technical Architecture & Study", detail: "Algorithm problem solving and data structure optimization." },
            { time: "16:30 - 18:00", title: "English Fluency Drills & Vocabulary", detail: "Read complex technical documentation aloud; master aerospace terminology." },
            { time: "18:00 - 21:00", title: "Dinner & Recovery Protocol", detail: "Defen Misir + Ayib + Injera. Journal reflection, 10 pages reading target, and early lights out." }
        ],
        Wednesday: [
            { time: "05:30 - 07:30", title: "Morning Reset & Strength Builder", detail: "Push-up pyramids, pull-up progressions, and core stabilization routines." },
            { time: "07:30 - 12:30", title: "Deep Work: Core CS Studies", detail: "Deep focus on algorithms and operating systems architecture. GtG method during transitions." },
            { time: "12:30 - 13:30", title: "Midday Meal & Walk", detail: "Traditional high-protein lunch with walking interval. No screens." },
            { time: "13:30 - 16:30", title: "Programming Practice", detail: "Coding logic implementation and debugging test suites." },
            { time: "16:30 - 18:00", title: "Language Immersion & Mobility", detail: "Audio logging and stretching routines. Record 15 min explanation." },
            { time: "18:00 - 21:00", title: "Dinner & System Review", detail: "Nutrition intake, log checking, 10-page book engine reading, and next-day prep." }
        ],
        Thursday: [
            { time: "05:30 - 07:30", title: "Cardio Engine: Interval Training", detail: "High-intensity interval sprints (400m) and endurance building. Listen to English podcast." },
            { time: "07:30 - 12:30", title: "Deep Work: Advanced CS Systems", detail: "Uninterrupted problem solving and technical implementation." },
            { time: "12:30 - 13:30", title: "Lunch & Mental Reset", detail: "High-protein meal paired with offline decompression outdoors." },
            { time: "13:30 - 16:30", title: "Academic Focus & Project Work", detail: "University curriculum tasks and software development modules." },
            { time: "16:30 - 18:00", title: "English Communication Practice", detail: "Advanced articulation drills and technical vocabulary practice." },
            { time: "18:00 - 21:00", title: "Evening Meal & Wind Down", detail: "Clean nutrition (Defen Misir + Ayib), 10 pages reading, sleep preparation." }
        ],
        Friday: [
            { time: "05:30 - 07:30", title: "Morning Conditioning & Review", detail: "Final strength block of the work week. Push-ups and core endurance." },
            { time: "07:30 - 12:30", title: "Deep Work: Final Weekly Push", detail: "Completing major coding milestones and objective checkpoints." },
            { time: "12:30 - 13:30", title: "Lunch & Midday Walk", detail: "Nutrient-dense meal with zero screen time. Hydration focus." },
            { time: "13:30 - 16:30", title: "Systems Implementation", detail: "Finalizing software modules and backing up logic scripts." },
            { time: "16:30 - 18:00", title: "Language Review & Stretching", detail: "Comprehensive English fluency recording and deep flexibility work." },
            { time: "18:00 - 21:00", title: "Dinner & Weekly Wrap-up", detail: "Reviewing weekly execution metrics. 10 pages book engine. Prep the weekend." }
        ],
        Saturday: [
            { time: "05:30 - 07:30", title: "Endurance Benchmark Run", detail: "Timed 1.5-mile run. Full physical standard check." },
            { time: "07:30 - 12:30", title: "Deep Reading & Tactical Study", detail: "Dedicated focus on current book engine milestones. Extra reading to get ahead on the 30-day block." },
            { time: "12:30 - 13:30", title: "Lunch & Recovery", detail: "Traditional high-protein meal and complete mental break outdoors." },
            { time: "13:30 - 16:30", title: "Personal Project & Code Architecture", detail: "Long-term software engineering, system building, and creative coding." },
            { time: "16:30 - 18:00", title: "Passive English Immersion", detail: "Long walks with aviation/tech podcasts." },
            { time: "18:00 - 21:00", title: "Evening Reset & Rest", detail: "Dinner, light reading, and preparation for Sunday recovery. Sleep strictly by 21:30." }
        ],
        Sunday: [
            { time: "05:30 - 07:30", title: "Active Recovery & Mobility", detail: "Joint mobility, deep tissue stretching, and physical system reset." },
            { time: "07:30 - 12:30", title: "Strategic Review & Planning", detail: "Review the past week, audit metrics (GPA, Fitness, Book). Plan upcoming schedule blocks." },
            { time: "12:30 - 13:30", title: "Midday Meal", detail: "Clean, high-protein traditional meal. No screens." },
            { time: "13:30 - 16:30", title: "Deep Reading & Reset", detail: "Unwinding with tactical literature (hit weekly page targets) and offline relaxation." },
            { time: "16:30 - 18:00", title: "Leisure & System Update", detail: "Free time, system upgrades, calling family." },
            { time: "18:00 - 21:00", title: "Sleep Prep & Early Rest", detail: "Complete wind-down for peak performance on Monday morning. Early lights out." }
        ]
    },
    ClassIntegration: {
        Monday: [
            { time: "05:30 - 07:30", title: "Morning Conditioning & English", detail: "Rapid push-up set (GtG) and active English speaking practice. Hit 5 pages of reading." },
            { time: "07:30 - 12:30", title: "University Classes & Lectures", detail: "Active engagement, note-taking, and in-person focus. Sneak in push-ups between classes." },
            { time: "12:30 - 13:30", title: "Campus Lunch & Walk", detail: "High-protein meal with a short walk outside. Diffuse thinking." },
            { time: "13:30 - 16:30", title: "Library Deep Work", detail: "Focused study on CS modules, assignments, and reinforcing morning lectures." },
            { time: "16:30 - 18:00", title: "Commute & Physical Reset", detail: "Transition home, listen to English podcasts, light core work upon arrival." },
            { time: "18:00 - 21:00", title: "Dinner & Review", detail: "Traditional meal, metric tracking, hit remaining 5 pages for book engine. Sleep prep." }
        ],
        Tuesday: [
            { time: "05:30 - 07:30", title: "Morning Cardio Run", detail: "Quick 45m Zone 2 interval session or baseline conditioning." },
            { time: "07:30 - 12:30", title: "University Classes", detail: "Rigorous attendance and academic tracking. Sit in front, engage actively." },
            { time: "12:30 - 13:30", title: "Lunch & Reset", detail: "Clean nutrition (Shiro + Eggs) and offline recharge." },
            { time: "13:30 - 16:30", title: "CS Lab & Practical Work", detail: "Hands-on programming and software building. Group work if necessary." },
            { time: "16:30 - 18:00", title: "English Fluency Drill", detail: "Record 15 min speaking practice and vocabulary retention." },
            { time: "18:00 - 21:00", title: "Dinner & Rest", detail: "Evening meal (Defen Misir), 10 pages reading, and early lights out." }
        ],
        Wednesday: [
            { time: "05:30 - 07:30", title: "Strength & Conditioning", detail: "Push-up pyramids and core endurance. Active reading out loud." },
            { time: "07:30 - 12:30", title: "University Classes", detail: "Focused lecture attendance. Maintain high GPA targets." },
            { time: "12:30 - 13:30", title: "Lunch Break", detail: "Traditional high-protein meal. Outdoor mental break." },
            { time: "13:30 - 16:30", title: "Library Study Block", detail: "Algorithm and data structure review. Code implementation." },
            { time: "16:30 - 18:00", title: "Mobility & Stretch", detail: "Flexibility routine and physical cool-down." },
            { time: "18:00 - 21:00", title: "Dinner & Prep", detail: "Nutrition, 10 pages tactical reading, sleep scheduling." }
        ],
        Thursday: [
            { time: "05:30 - 07:30", title: "Cardio & Endurance", detail: "400m HIIT sprints. Build aerobic engine." },
            { time: "07:30 - 12:30", title: "University Classes", detail: "Active academic engagement. Push-ups between blocks." },
            { time: "12:30 - 13:30", title: "Lunch", detail: "Traditional meal and walk." },
            { time: "13:30 - 16:30", title: "Coding & Projects", detail: "Software engineering practice and labs." },
            { time: "16:30 - 18:00", title: "Language Practice", detail: "Technical reading aloud in English. Audio logging." },
            { time: "18:00 - 21:00", title: "Dinner & Wind Down", detail: "Clean recovery, 10 pages reading, rest." }
        ],
        Friday: [
            { time: "05:30 - 07:30", title: "Morning Conditioning", detail: "Final weekday bodyweight workout. Push-up volume." },
            { time: "07:30 - 12:30", title: "University Classes", detail: "Final academic push for the week. Solidify concepts." },
            { time: "12:30 - 13:30", title: "Lunch", detail: "High-protein nutrition. Unwind." },
            { time: "13:30 - 16:30", title: "Review & Wrap Up", detail: "Completing weekly tasks and assignments early." },
            { time: "16:30 - 18:00", title: "Transition & Rest", detail: "Unwinding from classes, mobility." },
            { time: "18:00 - 21:00", title: "Dinner & Weekend Prep", detail: "Meal prep, review metrics, 10 pages reading." }
        ],
        Saturday: [
            { time: "05:30 - 07:30", title: "Benchmark Fitness", detail: "1.5-mile run check. Target sub 10:30." },
            { time: "07:30 - 12:30", title: "Deep Reading Engine", detail: "Tactical literature study. Catch up on weekly page counts." },
            { time: "12:30 - 13:30", title: "Lunch", detail: "Traditional meal." },
            { time: "13:30 - 16:30", title: "Personal Projects", detail: "Coding and system development beyond class requirements." },
            { time: "16:30 - 18:00", title: "English Podcasts", detail: "Active listening while walking." },
            { time: "18:00 - 21:00", title: "Evening Rest", detail: "Offline relaxation and early sleep." }
        ],
        Sunday: [
            { time: "05:30 - 07:30", title: "Active Recovery", detail: "Stretching and mobility drills." },
            { time: "07:30 - 12:30", title: "Weekly Planning", detail: "Schedule review and metric audit. Prep for the week." },
            { time: "12:30 - 13:30", title: "Lunch", detail: "Clean nutrition." },
            { time: "13:30 - 16:30", title: "Reading & Reset", detail: "Tactical book engine focus." },
            { time: "16:30 - 18:00", title: "Leisure", detail: "Reset the mind." },
            { time: "18:00 - 21:00", title: "Sleep Prep", detail: "Early rest for the new week." }
        ]
    }
};

const phases = [
    { title: "Phase 1: Foundation (Months 1–6)", desc: "Establish daily discipline, build a strong academic baseline, master 1.5-mile run under 10:30, and complete core tactical reading list.", notes: "Establish foundational habits. Focus on academic consistency during early university blocks and strict adherence to physical training splits." },
    { title: "Phase 2: Acceleration (Months 7–12)", desc: "Intensify software portfolio development, flight physics study, English articulation, and physical stamina peaking.", notes: "Push advanced project complexity, hone technical aviation knowledge, and eliminate English speech hesitation via daily audio logs." },
    { title: "Phase 3: Integration (Months 13–18)", desc: "Combine everything: ship a complete portfolio, sharpen interview skills, and hold peak physical conditioning.", notes: "Bring projects, fitness and study habits together. Practice technical interviews, refine documentation, and keep every benchmark above target." },
    { title: "Phase 4: Execution & Deployment (Months 19–24)", desc: "Apply for internships and roles, finish final preparation, and execute with confidence.", notes: "Final polish of documentation and portfolio, peak physical conditioning, interview readiness, and calm focus on delivery." }
];

/* KEYBOARD NAVIGATION ACCELERATOR */
window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === '1') switchView('landing');
    if (e.key === '2') switchView('schedule');
    if (e.key === '3') switchView('books');
    if (e.key === '4') switchView('metrics');
    if (e.key === '5') switchView('phases');
    if (e.key.toLowerCase() === 't') toggleThemeModal();
    if (e.key === 'Escape') {
        document.getElementById('hudDrawer').classList.remove('open');
        document.getElementById('drawerBackdrop').classList.remove('active');
        document.getElementById('themeModalBackdrop').classList.remove('open');
        document.getElementById('hamburgerBtn').classList.remove('active');
    }
});

function toggleDrawer() {
    playBeep(null, 'sine', 0.03);
    const drawer = document.getElementById('hudDrawer');
    const backdrop = document.getElementById('drawerBackdrop');
    const btn = document.getElementById('hamburgerBtn');
    drawer.classList.toggle('open');
    backdrop.classList.toggle('active');
    btn.classList.toggle('active');
}

function toggleThemeModal() {
    playBeep(null, 'sine', 0.03);
    const modal = document.getElementById('themeModalBackdrop');
    modal.classList.toggle('open');
}

function setTheme(modeClass, themeClass, themeName) {
    playBeep(null, 'square', 0.04);
    document.documentElement.className = `${modeClass} ${themeClass}`;
    refreshAccent();
    store.set('monk_mode_theme_mode', modeClass);
    store.set('monk_mode_theme_class', themeClass);
    store.set('monk_mode_theme_name', themeName);

    document.getElementById('currentThemeLabel').innerText = themeName;
    document.getElementById('landingThemeLabel').innerText = themeName;

    document.querySelectorAll('.theme-option-card').forEach(card => card.classList.remove('active'));
    const activeCardId = themeClass ? `theme-card-${themeClass}` : 'theme-card-light';
    const cardEl = document.getElementById(activeCardId);
    if(cardEl) cardEl.classList.add('active');

    if (document.getElementById('themeModalBackdrop').classList.contains('open')) {
        toggleThemeModal();
    }
}

function loadSavedTheme() {
    const savedMode = store.get('monk_mode_theme_mode') || 'dark';
    const savedClass = store.get('monk_mode_theme_class') || 'cyberpunk-cyan';
    const savedName = store.get('monk_mode_theme_name') || 'Cyber Cyan';
    setTheme(savedMode, savedClass, savedName);
}

function switchView(viewName) {
    playBeep(null, 'sine', 0.03);
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const header = document.getElementById('masterHeader');
    if (viewName === 'landing') header.style.display = 'none';
    else header.style.display = 'flex';

    const drawer = document.getElementById('hudDrawer');
    const backdrop = document.getElementById('drawerBackdrop');
    const btn = document.getElementById('hamburgerBtn');
    if (drawer.classList.contains('open')) {
        drawer.classList.remove('open');
        backdrop.classList.remove('active');
        btn.classList.remove('active');
    }

    document.querySelectorAll('.drawer-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.mobile-nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`view-${viewName}`).classList.add('active');

    const mapping = { landing: 0, schedule: 1, books: 2, metrics: 3, phases: 4 };
    const index = mapping[viewName];
    if (index !== undefined) {
        document.querySelectorAll('.drawer-link')[index].classList.add('active');
    }
    const mobBtn = document.getElementById(`mob-nav-${viewName}`);
    if (mobBtn) mobBtn.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateClock() {
    const d = new Date();
    document.getElementById('clockText').innerText = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ' // ' + d.toLocaleTimeString('en-US', { hour12: false });
}

function renderDayPicker() {
    const container = document.getElementById('dayPickerContainer');
    container.innerHTML = '';
    daysOfWeek.forEach(day => {
        const btn = document.createElement('button');
        btn.className = `day-btn ${day === selectedDay ? 'active' : ''}`;
        btn.innerText = day;
        btn.onclick = () => {
            playBeep(null, 'sine', 0.03);
            selectedDay = day;
            renderDayPicker();
            renderSchedule();
        };
        container.appendChild(btn);
    });
}

function renderSchedule() {
    const listContainer = document.getElementById('scheduleListContainer');
    listContainer.innerHTML = '';
    document.getElementById('activeDayTitle').innerText = `${selectedDay} Routine`;
    document.getElementById('activeModeLabel').innerText = isClassMode ? '[Class Mode Active]' : '[Self-Prep Mode Active]';

    const currentRoutine = schedules[currentModeKey][selectedDay] || [];
    const currentHour = now.getHours();
    const currentDayIndex = now.getDay();
    const isToday = selectedDay === daysOfWeek[currentDayIndex];

    let scrolled = false;

    currentRoutine.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'schedule-card';

        const [startStr] = item.time.split(' - ');
        const startHour = parseInt(startStr.split(':')[0], 10);

        if (isToday && currentHour === startHour) {
            card.classList.add('current');
            if(!scrolled) {
                setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400);
                scrolled = true;
            }
        }

        const checkboxId = `chk_${dateKeyFor(selectedDay)}_${index}`;
        const isChecked = store.get(checkboxId) === 'true';
        if(isChecked) card.style.opacity = '0.5';

        card.innerHTML = `
            <div class="schedule-card-header">
                <input type="checkbox" id="${checkboxId}" ${isChecked ? 'checked' : ''} onclick="event.stopPropagation(); toggleCheck('${checkboxId}')">
                <div class="schedule-info">
                    <div class="schedule-time">${item.time}</div>
                    <div class="schedule-title">${item.title}</div>
                </div>
            </div>
            <div class="tactical-note">${item.detail}</div>
        `;

        card.onclick = () => {
            playBeep(null, 'sine', 0.03);
            const wasExpanded = card.classList.contains('expanded');
            document.querySelectorAll('.schedule-card').forEach(c => c.classList.remove('expanded'));
            if (!wasExpanded) {
                card.classList.add('expanded');
            }
        };

        listContainer.appendChild(card);
    });

    updateProgress();
    renderBookSummary();
}

function toggleCheck(id) {
    playBeep(null, 'triangle', 0.04);
    const chk = document.getElementById(id);
    store.set(id, chk.checked);
    renderSchedule();
}

function resetTodayChecks() {
    playBeep(300, 'sawtooth', 0.06);
    const currentRoutine = schedules[currentModeKey][selectedDay] || [];
    currentRoutine.forEach((_, index) => {
        store.remove(`chk_${dateKeyFor(selectedDay)}_${index}`);
    });
    renderSchedule();
}

function updateProgress() {
    const currentRoutine = schedules[currentModeKey][selectedDay] || [];
    if(currentRoutine.length === 0) return;

    let completed = 0;
    currentRoutine.forEach((_, index) => {
        if(store.get(`chk_${dateKeyFor(selectedDay)}_${index}`) === 'true') completed++;
    });

    const pct = Math.round((completed / currentRoutine.length) * 100);
    document.getElementById('completionText').innerText = `${pct}%`;
    document.getElementById('progressBar').style.width = `${pct}%`;
}

function renderBookSummary() {
    const diffDays = Math.floor((now - PHASE_START_DATE) / (1000 * 60 * 60 * 24));
    const activeDays = Math.max(0, diffDays);
    const currentBookIndex = Math.floor(activeDays / 30) % books.length;
    const activeBook = books[currentBookIndex];
    const daysInCurrentBook = activeDays % 30;
    const daysLeft = 30 - daysInCurrentBook;

    const sumContainer = document.getElementById('bookTrackerSummary');
    sumContainer.innerHTML = `
        <div style="font-weight: 700; color: var(--accent-primary); margin-bottom: 0.3rem; font-family: var(--font-mono); font-size: 0.7rem; letter-spacing:0.05em;">// ACTIVE READING ENGINE</div>
        <div style="font-size:0.85rem; font-weight:700; color:var(--text-main); margin-bottom:0.15rem;">${activeBook.title}</div>
        <div style="font-size: 0.78rem;">Day ${daysInCurrentBook + 1} of 30 // ${daysLeft} days remaining. Target: 10 pages/day.</div>
    `;
}

function renderBooks() {
    const container = document.getElementById('bookGridContainer');
    const diffDays = Math.floor((now - PHASE_START_DATE) / (1000 * 60 * 60 * 24));
    const activeDays = Math.max(0, diffDays);
    const currentBookIndex = Math.floor(activeDays / 30) % books.length;

    container.innerHTML = '';
    books.forEach((b, idx) => {
        const card = document.createElement('div');
        card.className = 'card-item';
        if(idx === currentBookIndex) {
            card.style.borderColor = 'var(--border-active)';
            card.style.background = 'var(--accent-glow)';
        }
        card.innerHTML = `
            <div style="font-family: var(--font-mono); font-size: 0.7rem; color: ${idx === currentBookIndex ? 'var(--accent-primary)' : 'var(--warning)'};">// BOOK ${String(idx+1).padStart(2,'0')} // 30-DAY BLOCK ${idx === currentBookIndex ? '(ACTIVE)' : ''}</div>
            <h3>${b.title}</h3>
            <p><strong>Target Focus:</strong> ${b.focus}</p>
            <div class="tactical-note"><strong>Tactical Takeaway:</strong> ${b.notes}<br><br><span style="color: var(--accent-primary);">Target Pace: ~10 pages / day</span></div>
        `;

        card.onclick = () => {
            playBeep(null, 'sine', 0.03);
            const wasExpanded = card.classList.contains('expanded');
            document.querySelectorAll('#bookGridContainer .card-item').forEach(c => c.classList.remove('expanded'));
            if (!wasExpanded) {
                card.classList.add('expanded');
            }
        };

        container.appendChild(card);
    });
}

function renderFitness() {
    const container = document.getElementById('fitnessGridContainer');
    container.innerHTML = '';
    fitnessModules.forEach((f, idx) => {
        const card = document.createElement('div');
        card.className = 'card-item';
        card.innerHTML = `
            <div style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--warning);">// MODULE 0${idx+1} // PERFORMANCE SPEC</div>
            <h3>${f.title}</h3>
            <p><strong>Category:</strong> ${f.subtitle}</p>
            <div class="tactical-note"><strong>Tactical Notes:</strong> ${f.notes}</div>
        `;

        card.onclick = () => {
            playBeep(null, 'sine', 0.03);
            const wasExpanded = card.classList.contains('expanded');
            document.querySelectorAll('#fitnessGridContainer .card-item').forEach(c => c.classList.remove('expanded'));
            if (!wasExpanded) {
                card.classList.add('expanded');
            }
        };

        container.appendChild(card);
    });
}

function updatePhaseBadge() {
    const diffDays = Math.floor((now - PHASE_START_DATE) / (1000 * 60 * 60 * 24));
    const activeDays = Math.max(0, diffDays);

    let phaseNum = Math.floor(activeDays / 180) + 1;
    if (phaseNum > 4) phaseNum = 4;

    const phaseNames = ["Foundation", "Acceleration", "Integration", "Execution & Deployment"];
    const badgeEl = document.getElementById('phaseBadge');
    if(badgeEl) badgeEl.innerHTML = `<span class="badge-dot"></span>Phase ${phaseNum}: ${phaseNames[phaseNum-1]}`;
}

function renderRoadmap() {
    const diffDays = Math.floor((now - PHASE_START_DATE) / (1000 * 60 * 60 * 24));
    const activeDays = Math.max(0, diffDays);
    const currentPhaseIndex = Math.min(Math.floor(activeDays / 180), 3);
    const daysLeftInPhase = 180 - (activeDays % 180);

    const container = document.getElementById('roadmapContainer');
    container.innerHTML = '';
    phases.forEach((p, idx) => {
        const isCurrent = idx === currentPhaseIndex;
        const card = document.createElement('div');
        card.className = 'meta-card';
        if(isCurrent) {
            card.style.borderColor = 'var(--border-active)';
            card.style.background = 'var(--accent-glow)';
        }

        let phaseStatusStr = '';
        if(isCurrent) phaseStatusStr = `<span style="color: var(--accent-primary);">[ACTIVE // ${daysLeftInPhase} Days Left]</span>`;
        else if (idx < currentPhaseIndex) phaseStatusStr = `<span style="color: var(--success);">[COMPLETED]</span>`;
        else phaseStatusStr = `<span style="color: var(--text-dim);">[LOCKED]</span>`;

        card.innerHTML = `
            <div style="font-weight: 700; color: var(--accent-primary); margin-bottom: 0.35rem; font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.08em; display:flex; justify-content:space-between; flex-wrap:wrap; gap:0.2rem;">
                <span>// PHASE 0${idx + 1} TIMELINE</span>
                ${phaseStatusStr}
            </div>
            <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.2rem;">${p.title}</div>
            <div style="font-size: 0.78rem; margin-bottom: 0.2rem;">${p.desc}</div>
            <div class="tactical-note"><strong>Phase Milestone Objectives:</strong> ${p.notes}</div>
        `;

        card.onclick = () => {
            playBeep(null, 'sine', 0.03);
            const wasExpanded = card.classList.contains('expanded');
            document.querySelectorAll('#roadmapContainer .meta-card').forEach(c => c.classList.remove('expanded'));
            if (!wasExpanded) {
                card.classList.add('expanded');
            }
        };

        container.appendChild(card);
    });
}

function initApp() {
    loadSavedTheme();
    updateClock();
    setInterval(updateClock, 1000);
    renderDayPicker();
    renderSchedule();
    renderBooks();
    renderFitness();
    renderRoadmap();
    updateProgress();
    updatePhaseBadge();
    document.getElementById('modeBadge').innerHTML = `<span class="badge-dot"></span>${isClassMode ? 'Class Integration' : 'Self-Prep Mode'}`;
}

initApp();
