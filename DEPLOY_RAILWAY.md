# 🚀 RAILWAY DEPLOYMENT - STEP BY STEP

**Status:** Code sudah di-commit & di-push ke GitHub ✅

## ✅ Yang Sudah Dilakukan:
```
✅ Commit: "Prepare for Railway deployment"
✅ Push ke GitHub: piks16/Puzzle-Gambar main branch
```

---

## 📝 RAILWAY DEPLOYMENT STEPS (DO THIS NOW)

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Login ke Railway
```bash
railway login
```
- Browser akan buka
- Login dengan GitHub (recommended)
- Grant permissions

### Step 3: Link ke Repository
```bash
cd d:\kuliah\smt\ 5\praktikum\ pemograman\ jaringan\uas\tebak-gambar
railway init
```
- Pilih "Create new project"
- Nama: `tebak-gambar-puzzle` (atau sesuai keinginan)
- Railway akan scan project & detect Node.js

### Step 4: Set Environment Variables di Railway Dashboard

1. Buka https://railway.app
2. Pilih project Anda
3. Klik "Variables"
4. Add environment variables:

```
SUPABASE_URL=https://inpxscqndplbbntyviue.supabase.co
SUPABASE_KEY=sb_secret_-KDQGdnzJTMgiw48So0uIA_eHjCT3Qy
PEXELS_API_KEY=yabmzogkoyily58YrwSsjlR2KSvSiST57Xef43ZGtaJQnPvuwiW44pgr
EMAIL_SERVICE=gmail
EMAIL_PENGIRIM=tebakin.gambar.1@gmail.com
EMAIL_PASSWORD=xygf fjix cgfs cqef
PORT=3000
NODE_ENV=production
```

**Note:** Jika EMAIL_PASSWORD masih error, ganti dengan Gmail App Password!

### Step 5: Deploy via Dashboard
1. Railway dashboard → Project
2. Klik "Deploy"
3. Railway akan:
   - Pull dari GitHub
   - Install dependencies (npm install)
   - Build project
   - Start server

Monitor logs di dashboard!

---

## 🔄 ATAU Deploy via CLI:

Jika lebih suka command line:

```bash
# Set variables via CLI
railway variables

# Deploy
railway up

# Cek logs
railway logs
```

---

## ✅ VERIFICATION AFTER DEPLOY

Setelah deployment selesai:

### 1. Get Public URL
```bash
railway open
```
Atau lihat di dashboard → "View Logs" → scroll cari URL

### 2. Test Application
1. Buka URL public di browser
2. Coba register user baru
3. Coba login
4. Coba main game
5. Cek apakah score tersimpan

### 3. Monitor Logs
```bash
railway logs -f
```
Untuk real-time monitoring

---

## 🚨 TROUBLESHOOTING

### Error: "Cannot find module"
- Railway auto-install dependencies
- Check logs untuk error details
- Pastikan package.json ada di root

### Error: "Environment variable not found"
- Pastikan semua variables di-set di Railway dashboard
- Jangan lupa EMAIL_PASSWORD (penting!)

### Error: "Cannot connect to Supabase"
- Check SUPABASE_URL & SUPABASE_KEY valid?
- Supabase tables sudah dibuat?

### Error: "Email not sending"
- Check EMAIL_PASSWORD adalah Gmail App Password (bukan password akun)
- Generate ulang di Google Account → Security

### Application timeout/crash
- Check logs: `railway logs`
- Pastikan server listen ke `process.env.PORT`
- Check timeout limits di Railway settings

---

## 📊 RAILWAY DASHBOARD

Setelah deploy, di dashboard Anda bisa:
- ✅ View logs real-time
- ✅ Monitor memory & CPU usage
- ✅ Set environment variables
- ✅ Trigger redeploy
- ✅ View deployment history
- ✅ Custom domain (premium feature)

---

## 🔗 USEFUL LINKS

- **Railway Dashboard:** https://railway.app
- **Railway Docs:** https://docs.railway.app/
- **Project Repo:** https://github.com/piks16/Puzzle-Gambar

---

## ✨ NEXT STEPS

1. ✅ Do Step 1-5 above
2. ✅ Test aplikasi di Railway URL
3. ✅ Monitor logs
4. ✅ Celebrate! 🎉

---

**Butuh bantuan? Check logs terlebih dahulu untuk error messages!**

Happy Deploying! 🚀
