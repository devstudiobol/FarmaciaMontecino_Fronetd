/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      'white': '#ffffff',
      'purple': '#3f3cbb',
      'midnight': '#121063',
      'metal': '#565584',
      'tahiti': '#3ab7bf',
      'silver': '#ecebff',
      'bubble-gum': '#ff77e9',
      'bermuda': '#78dcca',
      'black':'#020617',
      'gray':'#404040',
      'red':'#db3b56',
      'pl':'#D9D9D9',
      'g':'#202020',
      'green':'#6BDA7D',
      'blue':'#265FFF'
    },
    extend: {},
  },
  plugins: [],
}