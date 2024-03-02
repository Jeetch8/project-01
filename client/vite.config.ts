import MillionLint from '@million/lint';
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
const _plugins = [react(), tsConfigPaths()];
_plugins.unshift(MillionLint.vite())
export default defineConfig({
  plugins: _plugins
});