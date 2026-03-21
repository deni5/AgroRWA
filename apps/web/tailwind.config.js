/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Стандартні шляхи (якщо конфіг лежить всередині apps/web)
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    
    // Шляхи від кореня проєкту (якщо конфіг лежить у найголовнішій папці)
    './apps/web/src/**/*.{js,ts,jsx,tsx,mdx}',
    './apps/web/app/**/*.{js,ts,jsx,tsx,mdx}',
    './apps/web/components/**/*.{js,ts,jsx,tsx,mdx}',
    
    // Якщо у тебе є спільні UI компоненти (Turborepo)
    '../../packages/ui/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
