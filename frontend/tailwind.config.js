/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // class를 통해서만 다크모드가 활성화되도록 설정
  theme: {
    extend: {},
  },
  plugins: [],
}; 