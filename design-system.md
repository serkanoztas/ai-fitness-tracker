<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport"/>
<title>PULSE Fitness Dashboard</title>
<!-- Tailwind CSS CDN -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Tailwind Configuration -->
<script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              red: '#FF3B5C',
              coral: '#FF6452',
              glow: 'rgba(255, 67, 101, 0.45)',
              dark: '#0D0E12',
              card: '#15161C',
              cardLight: '#1E2028',
              border: '#232632'
            }
          },
          fontFamily: {
            sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', 'Segoe UI', 'Roboto', 'sans-serif'],
          },
          boxShadow: {
            'glow-coral': '0 0 25px rgba(255, 75, 92, 0.55)',
            'glow-sm': '0 0 12px rgba(255, 75, 92, 0.35)',
            'inner-glow': 'inset 0 0 16px rgba(255, 255, 255, 0.03)'
          }
        }
      }
    }
  </script>
<!-- Custom Styles for Effects & Fine Tweaks -->
<style data-purpose="glow-and-utilities">
    /* Hide scrollbars for smooth app feel */
    ::-webkit-scrollbar {
      display: none;
    }
    * {
      -ms-overflow-style: none;
      scrollbar-width: none;
      -webkit-tap-highlight-color: transparent;
    }

    /* Gradients and specific glows */
    .bg-gradient-coral {
      background: linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%);
    }
    .text-gradient-coral {
      background: linear-gradient(135deg, #FF4F68 0%, #FF7253 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .neon-pulse-glow {
      filter: drop-shadow(0 0 8px rgba(255, 65, 108, 0.65));
    }
    .ai-card-gradient {
      background: linear-gradient(135deg, rgba(255, 77, 90, 0.28) 0%, rgba(255, 100, 80, 0.12) 100%);
    }
  </style>
</head>
<body class="bg-[#090A0D] text-white font-sans antialiased min-h-screen flex justify-center selection:bg-brand-red selection:text-white">
<!-- Mobile Frame Container -->
<div class="w-full max-w-[430px] min-h-screen bg-[#090A0D] flex flex-col relative pb-28 select-none">
<!-- BEGIN: StatusBar -->
<!-- Top System Status Bar matching iOS interface -->
<header class="w-full pt-3 px-7 flex justify-between items-center text-xs tracking-tight font-medium text-white/90 z-20" data-purpose="ios-status-bar">
<span class="text-sm font-semibold tracking-normal">9:41</span>
<div class="flex items-center space-x-2 text-white">
<!-- Cellular Signal -->
<svg class="w-4 h-3.5 fill-current" viewbox="0 0 17 12">
<rect height="4" rx="0.5" width="2.5" x="0" y="8"></rect>
<rect height="6.5" rx="0.5" width="2.5" x="4.5" y="5.5"></rect>
<rect height="9" rx="0.5" width="2.5" x="9" y="3"></rect>
<rect height="12" rx="0.5" width="2.5" x="13.5" y="0"></rect>
</svg>
<!-- Wifi Icon -->
<svg class="w-4 h-3.5 fill-current" viewbox="0 0 16 12">
<path d="M8 2.8c2.4 0 4.6.9 6.2 2.5l1.4-1.4C13.7 1.8 11 0.8 8 0.8S2.3 1.8.4 3.9L1.8 5.3C3.4 3.7 5.6 2.8 8 2.8zm0 4.2c1.3 0 2.5.5 3.4 1.4l1.4-1.4C11.6 5.8 9.9 5.2 8 5.2s-3.6.6-4.8 1.8l1.4 1.4c.9-.9 2.1-1.4 3.4-1.4zm0 4.2c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5-1.5.7-1.5 1.5.7 1.5 1.5 1.5z"></path>
</svg>
<!-- Battery Icon -->
<div class="flex items-center">
<div class="w-5 h-2.5 rounded-[3px] border border-white/80 p-0.5 flex items-center">
<div class="h-full w-full bg-white rounded-[1.5px]"></div>
</div>
<div class="w-0.5 h-1 bg-white/80 rounded-r-sm"></div>
</div>
</div>
</header>
<!-- END: StatusBar -->
<!-- Main Content Area -->
<main class="flex-1 px-5 pt-3 space-y-5">
<!-- BEGIN: BrandHeader -->
<!-- App Brand Logo & User Profile Avatar -->
<section class="flex justify-between items-center" data-purpose="brand-navigation">
<!-- Logo with Pulse Beat -->
<div class="flex items-center space-x-2">
<svg class="w-6 h-6 text-[#FF416C]" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" viewbox="0 0 24 24">
<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
</svg>
<span class="text-xl font-black tracking-widest text-white uppercase" style="letter-spacing: 0.18em;">PULSE</span>
</div>
<!-- Profile Avatar with Online Dot -->
<div class="relative cursor-pointer">
<div class="w-10 h-10 rounded-full border-2 border-brand-border overflow-hidden bg-zinc-800">
<img alt="Alex profile avatar" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSmOMkkruOTTYsAkwAhpoWwp2tDXIv-z-KWox58n3KFWqk397wMe4wQ9ZvIkKqcPJjgkiFBE62-opCskqjqxVK7zXJt6Xf-KGYOc1yDFmZrgYFx6BaT6NZRG0D1XF-mIFRcGWkJB0nnz6e-7rBtXNyL-zDI8soLDDyphFQYRxrJlWBMxP1-BHpFYsAiQa2avTblVwTWydwcjExNRY7BuUqgXmCImzhJUEmM4YTyDHm"/>
</div>
<span class="absolute top-0 right-0 w-3 h-3 bg-[#FF416C] border-2 border-[#090A0D] rounded-full"></span>
</div>
</section>
<!-- END: BrandHeader -->
<!-- BEGIN: GreetingAndAICoach -->
<!-- Greeting and Quick AI Coach Banner -->
<section class="flex justify-between items-start pt-1" data-purpose="hero-greeting">
<!-- Alex Greeting -->
<div>
<p class="text-zinc-400 text-xs font-medium">Good morning,</p>
<h1 class="text-2xl font-bold tracking-tight text-white flex items-center gap-1.5 mt-0.5">
            Alex <span class="text-2xl">👋</span>
</h1>
<p class="text-zinc-400 text-xs font-normal mt-1">Ready to crush your goals today?</p>
</div>
<!-- AI Coach Card -->
<div class="ai-card-gradient border border-[#FF4D5A]/40 rounded-2xl px-3.5 py-2.5 flex items-center space-x-2.5 backdrop-blur-md shadow-sm" data-purpose="ai-coach-pill">
<div class="flex flex-col">
<span class="text-xs font-bold text-white tracking-wide">AI Coach</span>
<div class="flex items-center space-x-1 mt-0.5">
<svg class="w-3 h-3 text-[#FF5B65] animate-pulse" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<polyline points="22 12 18 12 15 20 9 4 6 12 2 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"></polyline>
</svg>
<span class="text-[10px] text-zinc-300 font-medium">Active</span>
</div>
</div>
<!-- Robot Icon Avatar -->
<div class="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center p-1">
<svg class="w-6 h-6 text-white" fill="currentColor" viewbox="0 0 24 24">
<path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h4a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h4V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2zM8.5 11a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm7 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-6 5.5a.75.75 0 0 0 0 1.5h5a.75.75 0 0 0 0-1.5h-5z"></path>
</svg>
</div>
</div>
</section>
<!-- END: GreetingAndAICoach -->
<!-- BEGIN: ActivitySummarySection -->
<!-- Daily Activity Card with Circular Gauge & Side Metrics -->
<section class="grid grid-cols-12 gap-3.5" data-purpose="daily-activity-overview">
<!-- Left: Circular Neon Gauge Card (7 cols) -->
<div class="col-span-7 bg-[#14151C] border border-[#20222B] rounded-3xl p-4 flex flex-col justify-between relative shadow-lg overflow-hidden">
<!-- Card Header Dropdown -->
<div class="flex items-center justify-between z-10">
<span class="text-xs font-semibold text-zinc-200">Daily Activity</span>
<button class="flex items-center space-x-1 text-[11px] text-zinc-400 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-full transition-colors">
<span>Today</span>
<svg class="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"></path>
</svg>
</button>
</div>
<!-- Circular Gauge Display -->
<div class="relative flex items-center justify-center my-3">
<svg class="w-40 h-40 transform -rotate-90" viewbox="0 0 120 120">
<defs>
<!-- Arc Gradient -->
<lineargradient id="ringGrad" x1="0%" x2="100%" y1="0%" y2="100%">
<stop offset="0%" stop-color="#FF3E6C"></stop>
<stop offset="100%" stop-color="#FF6B4A"></stop>
</lineargradient>
<filter height="140%" id="neonBlur" width="140%" x="-20%" y="-20%">
<fegaussianblur result="blur" stddeviation="3"></fegaussianblur>
<femerge>
<femergenode in="blur"></femergenode>
<femergenode in="SourceGraphic"></femergenode>
</femerge>
</filter>
</defs>
<!-- Track Ring -->
<circle cx="60" cy="60" fill="none" r="46" stroke="#222530" stroke-width="9"></circle>
<!-- Active Glowing Neon Ring -->
<circle cx="60" cy="60" fill="none" filter="url(#neonBlur)" r="46" stroke="url(#ringGrad)" stroke-dasharray="289" stroke-dashoffset="52" stroke-linecap="round" stroke-width="9"></circle>
</svg>
<!-- Center Score Content -->
<div class="absolute inset-0 flex flex-col items-center justify-center text-center">
<span class="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Total Score</span>
<span class="text-3xl font-extrabold text-white tracking-tight mt-0.5">845</span>
<span class="text-[10px] text-zinc-400">of 1,000</span>
<div class="mt-1 flex items-center space-x-1 text-[#FF5163] text-[11px] font-semibold">
<span>Excellent</span>
<span>⚡</span>
</div>
</div>
</div>
</div>
<!-- Right: Stacked Metric Cards (5 cols) -->
<div class="col-span-5 flex flex-col justify-between space-y-2.5">
<!-- Calories Item -->
<div class="bg-[#14151C] border border-[#20222B] rounded-2xl p-3 flex items-center justify-between hover:border-zinc-700/60 transition-all cursor-pointer">
<div class="flex items-center space-x-2.5">
<div class="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
<svg class="w-4 h-4 fill-current" viewbox="0 0 20 20">
<path clip-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.527.82-1.12 2.05-1.57 3.513-.448 1.458-.724 3.037-.724 4.439a4.27 4.27 0 004.271 4.271c2.359 0 4.271-1.912 4.271-4.271 0-1.782-.916-3.414-1.93-4.782-.999-1.348-2.046-2.59-2.046-3.665zm-3.89 6.27c-.208.575-.41 1.258-.57 2.02a7.1 7.1 0 00-.206 1.657 5.728 5.728 0 005.728 5.729c1.99 0 3.738-1.015 4.757-2.568-1.026.495-2.227.768-3.486.768-3.606 0-6.53-2.924-6.53-6.53 0-.374.032-.738.093-1.09l.214.014z" fill-rule="evenodd"></path>
</svg>
</div>
<div>
<p class="text-[10px] text-zinc-400 font-medium">Calories</p>
<p class="text-sm font-bold text-white tracking-tight leading-tight">632</p>
<p class="text-[9px] text-zinc-500">/ 800 kcal</p>
</div>
</div>
<svg class="w-3.5 h-3.5 text-zinc-600" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"></path>
</svg>
</div>
<!-- Steps Item -->
<div class="bg-[#14151C] border border-[#20222B] rounded-2xl p-3 flex items-center justify-between hover:border-zinc-700/60 transition-all cursor-pointer">
<div class="flex items-center space-x-2.5">
<div class="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-[#FF5163]">
<svg class="w-4 h-4 fill-current" viewbox="0 0 24 24">
<path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"></path>
</svg>
</div>
<div>
<p class="text-[10px] text-zinc-400 font-medium">Steps</p>
<p class="text-sm font-bold text-white tracking-tight leading-tight">12,456</p>
<p class="text-[9px] text-zinc-500">/ 10,000</p>
</div>
</div>
<svg class="w-3.5 h-3.5 text-zinc-600" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"></path>
</svg>
</div>
<!-- Active Min Item -->
<div class="bg-[#14151C] border border-[#20222B] rounded-2xl p-3 flex items-center justify-between hover:border-zinc-700/60 transition-all cursor-pointer">
<div class="flex items-center space-x-2.5">
<div class="w-8 h-8 rounded-xl bg-orange-400/10 border border-orange-400/20 flex items-center justify-center text-orange-400">
<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24">
<circle cx="12" cy="12" r="10"></circle>
<polyline points="12 6 12 12 16 14"></polyline>
</svg>
</div>
<div>
<p class="text-[10px] text-zinc-400 font-medium">Active Min</p>
<p class="text-sm font-bold text-white tracking-tight leading-tight">78</p>
<p class="text-[9px] text-zinc-500">/ 60 min</p>
</div>
</div>
<svg class="w-3.5 h-3.5 text-zinc-600" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"></path>
</svg>
</div>
</div>
</section>
<!-- END: ActivitySummarySection -->
<!-- BEGIN: HeartRateCard -->
<!-- Live Heart Rate Card with Interactive SVG Wave -->
<section class="bg-[#14151C] border border-[#20222B] rounded-3xl p-4 relative overflow-hidden shadow-lg" data-purpose="heart-rate-monitor">
<!-- Header Info -->
<div class="flex justify-between items-center">
<div class="flex items-center space-x-1.5">
<span class="text-sm">❤️</span>
<span class="text-xs font-semibold text-zinc-200">Heart Rate</span>
</div>
<!-- Live Status Indicator -->
<div class="flex items-center space-x-1.5 bg-[#FF3B5C]/10 border border-[#FF3B5C]/30 px-2 py-0.5 rounded-full">
<span class="w-1.5 h-1.5 rounded-full bg-[#FF3B5C] animate-ping"></span>
<span class="text-[10px] font-semibold text-[#FF4D5A]">Live</span>
</div>
</div>
<!-- BPM Reading and Zone -->
<div class="flex justify-between items-end mt-2">
<div>
<div class="flex items-baseline space-x-1">
<span class="text-2xl font-black text-white tracking-tight">128</span>
<span class="text-xs font-semibold text-zinc-400">BPM</span>
</div>
<p class="text-[10px] text-zinc-400 font-medium mt-0.5">Zone 3 <span class="text-zinc-600">•</span> Cardio</p>
</div>
<!-- Y-Axis References -->
<div class="flex flex-col text-[9px] text-zinc-500 font-mono items-end space-y-1">
<span>180</span>
<span>120</span>
<span>60</span>
</div>
</div>
<!-- Pulse Graph Canvas / SVG -->
<div class="relative w-full h-24 mt-2">
<svg class="w-full h-full overflow-visible" fill="none" preserveaspectratio="none" viewbox="0 0 350 90">
<defs>
<!-- Gradient under the graph curve -->
<lineargradient id="ecgGlow" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stop-color="#FF3E6C" stop-opacity="0.35"></stop>
<stop offset="100%" stop-color="#FF3E6C" stop-opacity="0.0"></stop>
</lineargradient>
</defs>
<!-- Fill Area under stroke -->
<path d="M0,65 Q25,64 45,63 T90,62 Q105,58 120,63 T150,65 Q165,65 175,60 T200,52 Q215,58 230,42 T245,46 Q260,56 280,50 T310,48 Q330,55 350,52 L350,90 L0,90 Z" fill="url(#ecgGlow)"></path>
<!-- Neon ECG Pulse Line -->
<path class="neon-pulse-glow" d="M0,65 Q25,64 45,63 T90,62 Q105,58 120,63 T150,65 Q165,65 175,60 T200,52 Q215,58 230,42 T245,46 Q260,56 280,50 T310,48 Q330,55 350,52" stroke="#FF416C" stroke-linecap="round" stroke-width="2.5"></path>
<!-- Highlight Peak Dot and Pill (at x=230, y=42) -->
<circle cx="230" cy="42" fill="#FF416C" r="5" stroke="#FFFFFF" stroke-width="2"></circle>
</svg>
<!-- Current BPM Floating Badge Pin -->
<div class="absolute left-[62%] top-0.5 -translate-x-1/2 bg-[#FF3B5C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg flex items-center justify-center">
            128
          </div>
</div>
<!-- X-Axis Timeline Markers -->
<div class="flex justify-between items-center text-[9px] text-zinc-500 font-mono pt-1">
<span>00:00</span>
<span>06:00</span>
<span>12:00</span>
<span>18:00</span>
<span>24:00</span>
</div>
</section>
<!-- END: HeartRateCard -->
<!-- BEGIN: TodaysWorkouts -->
<!-- List of Today's Scheduled Workouts -->
<section class="space-y-3" data-purpose="workout-schedule">
<!-- Section Header -->
<div class="flex justify-between items-center">
<h2 class="text-sm font-bold text-white tracking-tight">Today's Workouts</h2>
<a class="text-xs font-semibold text-[#FF4D5A] hover:underline" href="#">See All</a>
</div>
<!-- Workouts List -->
<div class="space-y-2.5">
<!-- Workout 1: Upper Body Strength -->
<div class="bg-[#14151C] border border-[#20222B] rounded-2xl p-2.5 flex items-center justify-between hover:border-zinc-700 transition cursor-pointer">
<div class="flex items-center space-x-3">
<!-- Workout Photo -->
<div class="w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
<img alt="Upper Body Strength" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsRjlAV5VaqtZ0NWlXNGPgD3SS_VP6lwHhAC3aJaSbJZ7WDQY901aGC9xNOuFQwLD0vgGfATshGEoRHNEQqEgRvd_oL9IcmcuRHyvk8GgyZWEPPLV-UAOElJ0A-X7HVg67JWnq9QimwfSBhOw9Ogw9OtTZgAWCYIm3JTxvPvpb5PXPCWKyRvqnMHbMppGjFrhfIservz4Ivb27O7E1SBSVxU8jVNIm-JTi1_p1PzAs"/>
</div>
<!-- Workout Details -->
<div>
<h3 class="text-xs font-bold text-white">Upper Body Strength</h3>
<p class="text-[10px] text-zinc-400 mt-0.5">45 min <span class="text-zinc-600">•</span> Intermediate</p>
</div>
</div>
<!-- Time and Arrow -->
<div class="flex items-center space-x-1.5 text-zinc-400">
<span class="text-xs font-semibold text-[#FF5163]">9:00 AM</span>
<svg class="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"></path>
</svg>
</div>
</div>
<!-- Workout 2: HIIT Cardio Blast -->
<div class="bg-[#14151C] border border-[#20222B] rounded-2xl p-2.5 flex items-center justify-between hover:border-zinc-700 transition cursor-pointer">
<div class="flex items-center space-x-3">
<!-- Workout Photo -->
<div class="w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
<img alt="HIIT Cardio Blast" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_yS8ctMieH9iUeaWyGAIZxOhaodwXr5TQHtZkyytUJigjSPyyMNuelt5Di5Z_Yrv8J6y4AOu25n8iqISvbvMQBs3BRbzMwXmiJXRvGbcn0JPddvKzxhikGy9uGMygTRSFtN1WWGJ51vvbdxlmdkZZIPQNoZFYLfSFzXy-tZ1mwwyaDPW3V6nwtUIridQtnBVWubKg9UrLoogLEKWTQI9bGNuFTDOzO5r9HjX3sDMI"/>
</div>
<!-- Workout Details -->
<div>
<h3 class="text-xs font-bold text-white">HIIT Cardio Blast</h3>
<p class="text-[10px] text-zinc-400 mt-0.5">30 min <span class="text-zinc-600">•</span> High Intensity</p>
</div>
</div>
<!-- Time and Arrow -->
<div class="flex items-center space-x-1.5 text-zinc-400">
<span class="text-xs font-semibold text-[#FF5163]">12:30 PM</span>
<svg class="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"></path>
</svg>
</div>
</div>
<!-- Workout 3: Yoga Flow -->
<div class="bg-[#14151C] border border-[#20222B] rounded-2xl p-2.5 flex items-center justify-between hover:border-zinc-700 transition cursor-pointer">
<div class="flex items-center space-x-3">
<!-- Workout Photo -->
<div class="w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
<img alt="Yoga Flow" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjnYDER8mGBGE_rD5pu9jJQ-zFN3-Nl8DXBJcOKgPe6g8v3X7AZq5f084i2bJv8PIYvWC8aO2F5LFYL5DE7ulBFW5cyQxhQdqSP-YboKfC_gubde3PRuarw6UkV0ovdRTp_OPU05pIptz3QJXbpBX8KGJdywOSEnqbYswhei4NFShldCJTKvPSA2s9NxxzuEvFiZY91RFjeOMHzoFx8vU0V9i9L741h0Q2GLDJiR2G"/>
</div>
<!-- Workout Details -->
<div>
<h3 class="text-xs font-bold text-white">Yoga Flow</h3>
<p class="text-[10px] text-zinc-400 mt-0.5">20 min <span class="text-zinc-600">•</span> Flexibility</p>
</div>
</div>
<!-- Time and Arrow -->
<div class="flex items-center space-x-1.5 text-zinc-400">
<span class="text-xs font-semibold text-[#FF5163]">6:00 PM</span>
<svg class="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"></path>
</svg>
</div>
</div>
</div>
</section>
<!-- END: TodaysWorkouts -->
</main>
<!-- BEGIN: FloatingBottomNavigation -->
<!-- Fixed Mobile Dock with Glowing Central FAB -->
<nav class="fixed bottom-0 max-w-[430px] w-full bg-[#111218]/90 backdrop-blur-xl border-t border-[#1F212B] px-6 py-2 z-50" data-purpose="floating-tab-bar">
<div class="flex items-center justify-between relative">
<!-- Tab 1: Home (Active) -->
<a class="flex flex-col items-center space-y-1 text-[#FF4D5A]" href="#">
<svg class="w-5 h-5 fill-current" viewbox="0 0 20 20">
<path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
</svg>
<span class="text-[10px] font-semibold">Home</span>
</a>
<!-- Tab 2: Workouts -->
<a class="flex flex-col items-center space-y-1 text-zinc-500 hover:text-zinc-300" href="#">
<svg class="w-5 h-5 fill-none stroke-current stroke-2" viewbox="0 0 24 24">
<path d="M6 7v10M18 7v10M3 9v6M21 9v6M6 12h12" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>
<span class="text-[10px] font-medium">Workouts</span>
</a>
<!-- Central Floating Plus Action Button -->
<div class="relative -top-5">
<button class="w-13 h-13 p-3.5 bg-gradient-coral rounded-full text-white shadow-glow-coral flex items-center justify-center transform active:scale-95 transition-transform" data-purpose="action-button-add">
<svg class="w-6 h-6 stroke-white stroke-[2.5]" fill="none" viewbox="0 0 24 24">
<path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>
</button>
</div>
<!-- Tab 3: Progress -->
<a class="flex flex-col items-center space-y-1 text-zinc-500 hover:text-zinc-300" href="#">
<svg class="w-5 h-5 fill-none stroke-current stroke-2" viewbox="0 0 24 24">
<path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>
<span class="text-[10px] font-medium">Progress</span>
</a>
<!-- Tab 4: Profile -->
<a class="flex flex-col items-center space-y-1 text-zinc-500 hover:text-zinc-300" href="#">
<svg class="w-5 h-5 fill-none stroke-current stroke-2" viewbox="0 0 24 24">
<path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>
<span class="text-[10px] font-medium">Profile</span>
</a>
</div>
<!-- iOS Home Indicator bar -->
<div class="w-32 h-1 bg-white/20 rounded-full mx-auto mt-2"></div>
</nav>
<!-- END: FloatingBottomNavigation -->
</div>
</body></html>