import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   server: {
//     host: true,
//   },
// })

export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    host: true,
     allowedHosts: [
      'wallpaper-prefer-advertisers-touring.trycloudflare.com',
      'sitctoadi.co.in',
    ],
    proxy: {
      
      // Redirect all requests starting with /api to the Django server
      '/api': {
        target: 'http://127.0.0.1:8000',
        // target: "https://nursery-enrollment-species-man.trycloudflare.com",
        // target: 'https://api.sitctoadi.co.in',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
