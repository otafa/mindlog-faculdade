/** @type {import('prettier').Config} */
const config = {
  // Ordena as classes do Tailwind de forma consistente.
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/app/globals.css",
};

export default config;
