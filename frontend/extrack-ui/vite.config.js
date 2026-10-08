import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Forward API calls to the ASP.NET Core backend (port from launchSettings.json)
const apiProxy = {
  '/api': 'http://localhost:5071',
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { proxy: apiProxy },   // npm run dev
  preview: { proxy: apiProxy },  // npm run preview (serves the built app)
})
