# AI Fitness Tracker — Modern Design System & UI Standards

## 🎨 Color Palette & Aesthetics

- **Theme:** Ultra-modern dark mode baseline with glassmorphism overlays.
- **Backgrounds:** Deep Zinc/Slate tones (`bg-zinc-950` main, `bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-md` for cards/panels).
- **Accents:** Neon Electric Violet/Indigo (`from-violet-600 to-indigo-600` gradients) for primary actions, Emerald (`emerald-500`) for metrics/progress.
- **Borders:** Subtle, high-precision dark borders (`border-zinc-800/60 hover:border-zinc-700/80`).

## 📐 Typography & Spacing

- **Font:** Clean, high-density sans-serif with tight tracking (`tracking-tight font-semibold`).
- **Hierarchy:** Primary text (`text-zinc-100`), Secondary (`text-zinc-400`), Muted (`text-zinc-500`).
- **Padding:** Responsive mobile-first padding (`px-4 py-6 sm:px-8`).

## 🧩 Components & Interactivity

- **Custom Modals & Dialogs:** Smooth backdrop blur (`bg-black/60 backdrop-blur-sm`), centered scale animation (`animate-in fade-in zoom-in-95 duration-200`). Replaces browser native `window.confirm()` and `window.prompt()`.
- **Loading & Empty States:** Skeleton shimmer loaders (`animate-pulse bg-zinc-800/60 rounded-xl`) instead of raw spinners. Icon-anchored subtle empty state cards.
- **Buttons & Inputs:** Micro-interactions (`active:scale-[0.98] transition-all duration-200`), clear focus rings (`focus:ring-2 focus:ring-violet-500/50`).
