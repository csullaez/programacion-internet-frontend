import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	server: {
		host: false,
		port: 5173,
		strictPort: true,
		allowedHosts: ["wgjtpr-5173.csb.app"],
		 hmr: {
      protocol: 'ws',
      host: 'localhost',
      clientPort: 5173,
    },
	},
	preview: {
		host: true,
		port: 5173,
		strictPort: true,
		allowedHosts: ["wgjtpr-5173.csb.app"],
	},
});
