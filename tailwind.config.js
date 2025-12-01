/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './frontend/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#050509',
        surface: '#0F172A',
        primary: '#2563EB',
        secondary: '#EC4899',
        accent: '#22D3EE',
        amber: '#FBBF24',
        text: '#F9FAFB',
        muted: '#9CA3AF',
        border: '#1F2933',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'noble-gradient': 'linear-gradient(135deg, #2563EB 0%, #EC4899 100%)',
        glass: 'linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
      },
    },
  },
  plugins: [],
};
