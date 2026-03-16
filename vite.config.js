import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Smart Campus Issue Tracker',
        short_name: 'SmartCampus',
        description: 'Report and track campus maintenance issues',
        theme_color: '#2563eb', 
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        
      }
    })
  ],
})
