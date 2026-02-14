import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Hvis du bruker GitHub Pages, sett 'base' til navnet på repositoriet ditt
// f.eks. base: '/mitt-prosjekt-navn/'
export default defineConfig({
  plugins: [react()],
  base: './', 
})
