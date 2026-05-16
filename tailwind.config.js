/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['var(--font-inter)', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'app-bg': 'linear-gradient(135deg, #0D0D0D 0%, #121212 25%, #0D0D0D 50%, #0F0F0F 75%, #121212 100%)',
        'hero-bg': 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.4) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 60% 20%, rgba(6, 182, 212, 0.3) 0%, transparent 50%)',
        'section-bg': 'radial-gradient(circle at 20% 20%, rgba(96, 165, 250, 0.16), transparent 55%), radial-gradient(circle at 80% 0%, rgba(167, 139, 250, 0.18), transparent 50%), rgba(12, 12, 16, 0.88)',
      },
      animation: {
        'gradient-shift': 'gradientShift 20s ease infinite',
        'float': 'float 10s ease-in-out infinite',
        'slideDown': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-30px) rotate(120deg)' },
          '66%': { transform: 'translateY(15px) rotate(240deg)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}