import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from '@svgr/rollup';

export default defineConfig({
  plugins: [
    react(), 
    svgr(),
  ],
  server: {
    port: 3000,
    fs: {
      strict: false,
    },
  },
  build: {
    target: "es2022",
    minify: true,
    sourcemap: true,
  },
  resolve: {},
});
