# 🚀 DEPLOY KE RAILWAY

## Langkah-Langkah Deploy:

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login ke Railway
```bash
railway login
```
Browser akan buka, login dengan GitHub/email

### 3. Initialize Railway di project
```bash
railway init
```
- Pilih "Create new project"
- Beri nama project (e.g., "tebak-gambar")

### 4. Set Environment Variables
```bash
railway variables
```
Atau manual di dashboard: https://railway.app

Tambahkan:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
PEXELS_API_KEY=your-pexels-api-key-here
EMAIL_SERVICE=gmail
EMAIL_PENGIRIM=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
PORT=3000
NODE_ENV=production
```

### 5. Deploy
```bash
railway up
```

### 6. Cek Status
```bash
railway logs
```

### 7. Dapatkan URL Public
```bash
railway open
```

---

## ✅ Selesai!
Aplikasi sudah live di Railway dengan Socket.IO support penuh.

## Tips:
- Jika ada error, cek logs: `railway logs`
- Untuk redeploy: `railway up`
- Update env vars: `railway variables`
