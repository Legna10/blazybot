/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // scan semua file di folder src
  ],
  theme: {
    extend: {
      colors: {
        bluehj: "#009590", //biru
        greenhj: "#8EC640", //hijau
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
