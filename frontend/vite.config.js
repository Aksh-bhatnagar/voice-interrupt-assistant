import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  optimizeDeps: {
    exclude: ["@ricky0123/vad-web", "onnxruntime-web"],
  },
});