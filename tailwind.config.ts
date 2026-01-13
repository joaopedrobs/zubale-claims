import type { Config } from "tailwindcss";

const config: Config = {
  // O "content" é crucial: ele diz ao Tailwind para escanear estes arquivos em busca de classes
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Adicionado por segurança caso você use a pasta src
  ],
  theme: {
    extend: {
      colors: {
        zubale: {
          blue: "#1e40af",
          light: "#3b82f6",
        },
      },
    },
  },
  plugins: [],
};

export default config;