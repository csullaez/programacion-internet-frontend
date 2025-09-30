import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	server: {
		host: true,
		port: 5173,
		strictPort: true,
		allowedHosts: ["wgjtpr-5173.csb.app"],
		hmr: { clientPort: 443 },
	},
	preview: {
		host: true,
		port: 5173,
		strictPort: true,
		allowedHosts: ["wgjtpr-5173.csb.app"],
	},
});
