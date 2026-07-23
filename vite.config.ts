import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Databricks Apps serves the app at the root path.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
