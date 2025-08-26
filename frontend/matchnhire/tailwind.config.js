/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2196F3', // Bleu
        secondary: '#FFC107', // Jaune
        accent: '#FFFFFF', // Blanc
        dark: '#333333', // Gris foncé pour le texte
        light: '#F5F5F5', // Gris clair pour les fonds
      },
    },
  },
  plugins: [],
}