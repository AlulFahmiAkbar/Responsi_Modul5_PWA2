# TemuBarang
Temukan Kembali, Kembalikan dengan Mudah. React + Vite + PWA, data di localStorage.

## Menjalankan
    npm install
    npm run dev          # pengembangan
    npm run build && npm run preview   # uji PWA & offline (service worker aktif di build)

## Deploy ke Vercel
Push ke GitHub, import repo di Vercel (preset Vite, build `npm run build`, output `dist`). `vercel.json` sudah menangani routing SPA.
