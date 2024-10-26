/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.vue"],
  theme: {
    extend: {
      colors: {
        "bondi-blue": {
          "50": "#edfcfe",
          "100": "#d2f6fb",
          "200": "#aaebf7",
          "300": "#6fdbf1",
          "400": "#2dc1e3",
          "500": "#1099bb",
          "600": "#1183a9",
          "700": "#156a89",
          "800": "#1a5670",
          "900": "#1a485f",
          "950": "#0b2f41",
        },
        gold: {
          "50": "#ffffe7",
          "100": "#feffc1",
          "200": "#fffd86",
          "300": "#fff441",
          "400": "#ffe60d",
          "500": "#ffd700",
          "600": "#d19e00",
          "700": "#a67102",
          "800": "#89580a",
          "900": "#74480f",
          "950": "#442604",
        },
      },
    },
  },
  plugins: [],
};
