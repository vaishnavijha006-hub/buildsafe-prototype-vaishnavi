import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { notionApiPlugin } from "./server/notionApiPlugin.js";

export default defineConfig(({ mode }) => ({
  plugins: [react(), notionApiPlugin(mode)],
}));
