# 📚 PANDUAN GIT WORKFLOW - PUZZLE GAMBAR

**Repository:** https://github.com/piks16/Puzzle-Gambar  
**Collaborators:** piks16, bngaa

---

## 🚀 **1. SETUP AWAL (First Time)**

### **Clone Repository**
```powershell
git clone https://github.com/piks16/Puzzle-Gambar.git
cd Puzzle-Gambar
```

### **Setup Git Config**
```powershell
# Untuk piks16
git config user.name "piks16"
git config user.email "fikrimungo123@gmail.com"

# Atau untuk bngaa
git config user.name "bngaa"
git config user.email "email@bngaa.com"

# Verify config
git config --list | grep user
```

### **Verify Remote**
```powershell
git remote -v
# Should show:
# origin  https://github.com/piks16/Puzzle-Gambar.git (fetch)
# origin  https://github.com/piks16/Puzzle-Gambar.git (push)
```

---

## 📥 **2. PULL - Update dari GitHub**

Selalu lakukan ini sebelum mulai kerja!

### **Pull dari Main Branch**
```powershell
# Pastikan di branch main
git checkout main

# Pull updates terbaru
git pull origin main
```

### **Pull dari Branch Lain**
```powershell
# Lihat semua branch
git branch -a

# Switch ke branch lain (contoh: fitur/notification)
git checkout fitur/notification

# Pull updates di branch itu
git pull origin fitur/notification
```

---

## ✏️ **3. COMMIT - Simpan Perubahan Lokal**

### **Step 1: Cek Status**
```powershell
# Lihat file yang berubah
git status

# Output akan menunjukkan:
# On branch main
# Changes not staged for commit:
#   modified: public/game.js
#   modified: public/styles.css
# Untracked files:
#   new-file.js
```

### **Step 2: Add File yang Mau Disimpan**
```powershell
# Add file spesifik
git add public/game.js

# Add multiple files
git add public/game.js public/styles.css

# Add semua file yang berubah
git add .

# Verify file yang di-add
git status
```

### **Step 3: Commit dengan Message**
```powershell
# Commit dengan pesan deskriptif
git commit -m "feat: Add notification system"

# Pesan harus jelas dan singkat
# Format: <type>: <deskripsi>

# Tipe commit:
# feat:     Feature baru
# fix:      Bug fix
# docs:     Documentation changes
# style:    Code style (formatting, semicolon, etc)
# refactor: Improve code without changing functionality
# test:     Add/modify tests
# chore:    Update dependencies, etc
```

### **Contoh Commit Messages yang Baik**
```powershell
git commit -m "feat: Add multiplayer game mode"
git commit -m "fix: Fix tile positioning bug on mobile"
git commit -m "docs: Update README with setup instructions"
git commit -m "refactor: Improve game state management"
git commit -m "style: Format code with prettier"
```

### **Contoh Commit Messages yang Buruk**
```powershell
git commit -m "update"              # ❌ Terlalu vague
git commit -m "fix stuff"           # ❌ Tidak jelas
git commit -m "asdf"                # ❌ Tidak bermakna
```

---

## 📤 **4. PUSH - Kirim ke GitHub**

### **Push ke Main Branch (Setelah PR di-approve)**
```powershell
# Pastikan di branch main
git checkout main

# Pull updates terakhir
git pull origin main

# Push commits ke GitHub
git push origin main
```

### **Push ke Feature Branch (Untuk Pull Request)**
```powershell
# Pastikan di branch fitur
git checkout fitur/notification

# Push ke GitHub
git push origin fitur/notification

# Jika first time, gunakan:
git push -u origin fitur/notification
```

---

## 🔀 **5. COMPLETE WORKFLOW**

### **Scenario: Kamu mau add feature baru**

#### **Step 1: Update Main**
```powershell
git checkout main
git pull origin main
```

#### **Step 2: Buat Feature Branch**
```powershell
# Buat branch baru
git checkout -b fitur/achievement-system

# Atau pakai syntax baru
git switch -c fitur/achievement-system
```

#### **Step 3: Kerjakan Feature**
```powershell
# Edit file sesuai kebutuhan
# ... edit public/game.js, public/styles.css, etc ...

# Cek status
git status
```

#### **Step 4: Commit Changes**
```powershell
# Add file
git add .

# Commit
git commit -m "feat: Add achievement system with badges"

# Atau multiple commits
git add public/game.js
git commit -m "feat: Add achievement logic"
git add public/styles.css
git commit -m "style: Add achievement UI styling"
```

#### **Step 5: Push ke GitHub**
```powershell
git push origin fitur/achievement-system
```

#### **Step 6: Create Pull Request**
1. Go to https://github.com/piks16/Puzzle-Gambar
2. Akan ada notification "Compare & pull request"
3. Click **Create pull request**
4. Add title & description
5. Click **Create pull request**

#### **Step 7: Review & Merge**
- Collaborator review code
- Add comments/approve
- Click **Merge pull request**
- Delete branch (optional)

#### **Step 8: Update Local Main**
```powershell
# Switch ke main
git checkout main

# Pull merged changes
git pull origin main
```

---

## 🔧 **6. TROUBLESHOOTING**

### **Lihat Commit History**
```powershell
# Lihat 5 commit terakhir
git log --oneline -5

# Output:
# abc1234 (HEAD -> main, origin/main) feat: Add notification
# def5678 fix: Fix tile positioning
# ghi9012 docs: Update README
# jkl3456 refactor: Improve game logic
# mno7890 feat: Add leaderboard
```

### **Lihat Perubahan yang Belum Di-commit**
```powershell
# Lihat perubahan di semua file
git diff

# Lihat perubahan di file spesifik
git diff public/game.js
```

### **Batalkan Perubahan yang Belum Di-add**
```powershell
# Batalkan perubahan di file spesifik
git checkout public/game.js

# Batalkan semua perubahan
git checkout .
```

### **Batalkan Commit Terakhir (Belum Push)**
```powershell
# Batalkan commit, tapi file tetap ter-edit
git reset --soft HEAD~1

# Batalkan commit & perubahan file
git reset --hard HEAD~1
```

### **Merge Conflict**
Jika ada conflict saat pull/merge:

```powershell
# 1. Cek file yang conflict
git status

# 2. Edit file yang conflict (remove conflict markers)
# Cari: <<<<<<<, =======, >>>>>>>

# 3. Add file yang sudah diedit
git add .

# 4. Commit
git commit -m "resolve: Merge conflict at [filename]"

# 5. Push
git push origin main
```

---

## 📋 **7. QUICK REFERENCE**

| Command | Tujuan |
|---------|--------|
| `git status` | Lihat status file |
| `git add .` | Stage semua file |
| `git add [file]` | Stage file spesifik |
| `git commit -m "msg"` | Commit dengan pesan |
| `git push origin [branch]` | Push ke GitHub |
| `git pull origin [branch]` | Pull dari GitHub |
| `git checkout [branch]` | Switch branch |
| `git checkout -b [branch]` | Buat & switch ke branch |
| `git branch -a` | Lihat semua branch |
| `git log --oneline` | Lihat commit history |
| `git diff` | Lihat perubahan |
| `git reset HEAD~1` | Batalkan commit terakhir |

---

## ✅ **8. BEST PRACTICES**

### **✅ DO**
- ✅ Pull sebelum mulai kerja
- ✅ Commit sering (setiap fitur/fix selesai)
- ✅ Gunakan pesan commit yang jelas
- ✅ Push secara regular (jangan nunggu lama)
- ✅ Buat branch terpisah untuk setiap fitur
- ✅ Review code sebelum merge

### **❌ DON'T**
- ❌ Jangan push langsung ke `main` (tanpa review)
- ❌ Jangan edit file yang sama di waktu bersamaan
- ❌ Jangan commit file besar (.zip, video, etc)
- ❌ Jangan push `.env` atau sensitive files
- ❌ Jangan force push (`git push --force`)
- ❌ Jangan buat commit message yang vague

---

## 📞 **9. HELP**

### **Kalau Stuck**
```powershell
# Cek status lengkap
git status

# Lihat git configuration
git config --list

# Lihat git log dengan detail
git log

# Lihat apa yang mau di-push
git log origin/main..main
```

### **Reset ke State Tertentu**
```powershell
# Update ke latest remote state
git fetch origin
git reset --hard origin/main

# ⚠️ Warning: Ini akan hapus local changes!
```

---

## 🎯 **SUMMARY**

Workflow untuk setiap hari:

```powershell
# 1. Start: Update dari GitHub
git checkout main
git pull origin main

# 2. Buat branch untuk fitur
git checkout -b fitur/nama-fitur

# 3. Kerjakan fitur
# ... edit files ...

# 4. Commit perubahan
git add .
git commit -m "feat: Deskripsi fitur"

# 5. Push ke GitHub
git push origin fitur/nama-fitur

# 6. Buat PR di GitHub (UI)

# 7. Setelah PR di-approve & merge:
git checkout main
git pull origin main
```

---

**Happy Coding! 🚀**
