import confetti from 'canvas-confetti';

// 15+ Motivational quotes curated for Gen-Z focus & sanctuary vibe
export const QUOTES: string[] = [
  "Focus on the present moment. ✨",
  "One task at a time. 🌱",
  "Breathe. Focus. Create. 🎨",
  "Progress, not perfection. 🚀",
  "Stay present. 🧘",
  "Clarity comes from stillness. 🌊",
  "Small steps lead to big changes. 👣",
  "The only way out is through. 💡",
  "You are capable of amazing things. ✨",
  "Start where you are. Use what you have. 🛠️",
  "The best time to start was yesterday. The next best time is now. ⏰",
  "Be the energy you want to attract.⚡",
  "Your vibe attracts your tribe. 🌸",
  "Trust the process. 🌌",
  "Everything you want is on the other side of fear. 🔥",
  "Protect your peace and stay in your zone. 🎧",
  "Make today cozy and productive. ☕"
];

export function getRandomQuote(): string {
  const index = Math.floor(Math.random() * QUOTES.length);
  return QUOTES[index];
}

export function getGreeting(date: Date = new Date()): string {
  const hours = date.getHours();
  if (hours >= 5 && hours < 12) {
    return "Good Morning ☀️";
  } else if (hours >= 12 && hours < 17) {
    return "Good Afternoon 🌤️";
  } else if (hours >= 17 && hours < 22) {
    return "Good Evening 🌙";
  } else {
    return "Good Night 🌌";
  }
}

export function formatDateFull(date: Date = new Date()): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
}

export function formatDateISO(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTimeDigit(num: number): string {
  return String(num).padStart(2, '0');
}

export function triggerConfetti() {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#FF6B6B', '#FFD166', '#06D6A0', '#4EA8DE', '#9C88FF']
  });
}

// Gentle audio synthesizer for notifications (offline safe)
export function playGentleChime() {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    // Create two soft warm sine waves
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc2.frequency.setValueAtTime(659.25, now); // E5

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.15, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.5);
    osc2.stop(now + 1.5);
  } catch (err) {
    // Ignore audio errors silently
  }
}
