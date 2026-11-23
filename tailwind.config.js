/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#1a3a2a',
          dark: '#0d2418',
          mid: '#1e4530',
          light: '#2d5c3f',
          50: '#f0f7f3',
          100: '#d4eadc',
          200: '#a8d5b9',
          300: '#6db88a',
          400: '#3d9460',
          500: '#1a3a2a',
          600: '#0d2418',
        },
        lime: {
          DEFAULT: '#4ade80',
          dark: '#22c55e',
          light: '#86efac',
          50: '#f0fdf4',
        },
        cream: {
          DEFAULT: '#f8faf7',
          dark: '#eef2ec',
          warm: '#f4f7f2',
        },
        // Keep old colors for backward compat
        loam: {
          DEFAULT: '#2C3E2D',
          light: '#3D5240',
          50: '#F2F5F2',
          100: '#D6DDD6',
          200: '#A8B5A8',
          600: '#3D5240',
          900: '#1A2618',
        },
        lichen: {
          DEFAULT: '#A8B5A2',
          light: '#C4CEC0',
          dark: '#8A9884',
          50: '#F2F5F1',
          100: '#E2EAE0',
        },
        parchment: {
          DEFAULT: '#F4F1EB',
          dark: '#EAE4D8',
          cream: '#FAF8F3',
          sand: '#E8E2D6',
        },
        violet: {
          DEFAULT: '#7B5EA7',
          dark: '#634792',
          light: '#9B7EC7',
          50: '#F5F1FB',
          100: '#E8DFFF',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"DM Serif Display"', 'serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      fontSize: {
        '10': '0.625rem',
        '11': '0.6875rem',
      },
      letterSpacing: {
        'ultra': '0.22em',
        'wide-plus': '0.12em',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '3rem',
        'arch': '200px 200px 0 0',
      },
      backgroundImage: {
        'forest-gradient': 'linear-gradient(135deg, #1a3a2a 0%, #0d2418 60%, #1e4530 100%)',
        'forest-radial': 'radial-gradient(ellipse at top, #1e4530 0%, #0d2418 70%)',
        'lime-glow': 'radial-gradient(ellipse at center, rgba(74,222,128,0.15) 0%, transparent 70%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
        'parchment-gradient': 'linear-gradient(180deg, #F4F1EB 0%, #EAE4D8 100%)',
        'loam-gradient': 'linear-gradient(135deg, #2C3E2D 0%, #3D5240 100%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in': 'fadeIn 1.2s ease forwards',
        'float': 'floatY 5s ease-in-out infinite',
        'spin-slow': 'spinSlow 18s linear infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        spinSlow: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(74, 222, 128, 0.3)' },
          '50%': { boxShadow: '0 0 0 8px rgba(74, 222, 128, 0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'forest': '0 4px 24px rgba(13, 36, 24, 0.3)',
        'forest-lg': '0 16px 48px rgba(13, 36, 24, 0.4)',
        'lime': '0 4px 20px rgba(74, 222, 128, 0.25)',
        'lime-lg': '0 8px 32px rgba(74, 222, 128, 0.3)',
        'loam': '0 4px 24px rgba(44, 62, 45, 0.12)',
        'loam-lg': '0 16px 48px rgba(44, 62, 45, 0.18)',
        'violet': '0 4px 20px rgba(123, 94, 167, 0.25)',
        'violet-lg': '0 8px 32px rgba(123, 94, 167, 0.3)',
        'parchment': '0 2px 16px rgba(44, 62, 45, 0.06)',
      },
    },
  },
  plugins: [],
};