/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}",],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      'green': '#636946',
      'gray': '#3f4244',
      'tan': '#eeede7',
      'red': '#bf4745',
      'silver': '#c1c0c1',
    },

    extend: {
      fontFamily: {
        Jost: ["Jost", "sans-serif"]
      }
    },
  },
  plugins: [],
}

