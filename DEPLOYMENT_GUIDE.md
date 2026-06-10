# 🚀 Deployment Guide - Jak vydat hru

## Metoda 1: GitHub Pages (Doporučeno) 🌟

### Krok za krokem:

1. **Vytvoř GitHub repository:**
   ```bash
   cd /Users/josefslerka/codex/strategie
   git init
   git add .
   git commit -m "Alpha 0.1 - První release"
   ```

2. **Vytvoř repo na GitHubu:**
   - Jdi na github.com
   - New Repository
   - Název: `husitske-valky`
   - Public nebo Private (private = jen s linkem)

3. **Push na GitHub:**
   ```bash
   git remote add origin https://github.com/[username]/husitske-valky.git
   git branch -M main
   git push -u origin main
   ```

4. **Zapni GitHub Pages:**
   - Jdi do Settings → Pages
   - Source: `main` branch, `/ (root)`
   - Save
   - Počkej 1-2 minuty

5. **Hotovo! URL:**
   ```
   https://[username].github.io/husitske-valky/
   ```

### Výhody:
✅ Zdarma
✅ Automatické updaty (git push)
✅ Vlastní doména možná
✅ HTTPS
✅ Rychlé CDN

---

## Metoda 2: Netlify Drop (Nejrychlejší) ⚡

### Krok za krokem:

1. **Jdi na:** https://app.netlify.com/drop

2. **Přetáhni složku** `strategie/` do okna

3. **Hotovo!** Máš URL typu:
   ```
   https://random-name-12345.netlify.app
   ```

4. **Vlastní název (optional):**
   - Site settings → Change site name
   - Např: `husitske-valky-alpha.netlify.app`

### Update hry:
- Prostě znovu přetáhni složku (přepíše to)

### Výhody:
✅ 5 minut
✅ Žádný GitHub
✅ Vlastní subdoména zdarma
✅ HTTPS

---

## Metoda 3: ZIP pro kamarády 📦

### Krok za krokem:

1. **Vytvoř ZIP:**
   ```bash
   cd /Users/josefslerka/codex/strategie
   zip -r husitske-valky-alpha-0.1.zip . \
     -x "*.git*" \
     -x "node_modules/*" \
     -x ".DS_Store" \
     -x "*.tmp" \
     -x ".claude/*"
   ```

2. **Nahraj na:**
   - Google Drive (sdílej link)
   - Dropbox
   - WeTransfer
   - Discord

3. **Instrukce pro kamarády:**
   ```
   1. Stáhni ZIP
   2. Rozbal
   3. Otevři index.html v Chrome/Firefox
   4. Hraj!
   ```

### Výhody:
✅ Instant
✅ Offline hratelné
✅ Žádný hosting

### Nevýhody:
❌ Update = nový ZIP
❌ Nutno stahovat

---

## Metoda 4: Vercel (Alternative k Netlify) 🔷

### Krok za krokem:

1. **Jdi na:** https://vercel.com

2. **Import GitHub repo** nebo **Upload**

3. **Deploy**

4. **Hotovo!** URL:
   ```
   https://husitske-valky.vercel.app
   ```

### Výhody:
✅ Podobné jako Netlify
✅ Automatický deploy z GitHubu
✅ Analytics zdarma

---

## 🎯 Doporučení pro Alpha:

### Pro beta testing s kamarády:
**Nejlepší volba:** GitHub Pages nebo Netlify

**Proč?**
- Živá URL - pošleš jen link
- Update = git push (nebo re-upload)
- HTTPS - funguje všude
- Zdarma

### Pro rychlé sdílení:
**Nejlepší volba:** ZIP na Google Drive

**Proč?**
- 2 minuty
- Funguje offline
- Žádná registrace

---

## 📊 Porovnání:

| Metoda | Čas | Obtížnost | Update | URL |
|--------|-----|-----------|--------|-----|
| GitHub Pages | 15 min | Střední | `git push` | ✅ Trvalá |
| Netlify Drop | 5 min | Snadné | Re-upload | ✅ Trvalá |
| Vercel | 10 min | Snadné | Auto | ✅ Trvalá |
| ZIP | 2 min | Velmi snadné | Nový ZIP | ❌ Žádná |

---

## ✅ Checklist před deploym:

- [ ] Hra funguje lokálně (`python3 -m http.server`)
- [ ] Tutorial je dokončitelný
- [ ] Žádné console errors (F12)
- [ ] README vytvořeno
- [ ] CHANGELOG vytvořen
- [ ] Verze číslo někde viditelné
- [ ] Kontakt na tebe v README

---

## 🐛 Po deployu:

1. **Otestuj živou verzi**
   - Otevři na jiném počítači/telefonu
   - Projdi tutorial
   - Zahraj 1-2 scénáře

2. **Pošli kamarádům:**
   ```
   Ahoj! Mám alpha verzi husitské strategie.
   Chceš otestovat?

   URL: [tvoje URL]

   Je to alpha - bugy jsou expected!
   Pošli mi feedback. Díky! 🎮
   ```

3. **Sleduj feedback**
   - Vytvoř spreadsheet/doc pro poznámky
   - Zapisuj všechny bugy
   - Prioritizuj fixes

---

## 🎉 Ready to deploy!

Vyber si metodu a do toho! 🚀
