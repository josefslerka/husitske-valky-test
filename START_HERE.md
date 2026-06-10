# 🎮 Jak spustit hru

## ⚠️ DŮLEŽITÉ - Problém s lokalizací

Pokud vidíš v menu texty jako "MENU.NEWGAME" místo "Nová hra" / "New Game", je to proto, že jsi otevřel `index.html` přímo v prohlížeči (file://).

**Proč to nefunguje?**
- Prohlížeč blokuje načítání JSON souborů (překlady) kvůli CORS bezpečnostní politice
- Je potřeba spustit lokální web server

---

## ✅ Správný způsob spuštění:

### Metoda 1: Automatický start (doporučeno)

```bash
./start.sh
```

Skript automaticky:
- Spustí lokální server na portu 8000
- Otevře hru v prohlížeči
- Lokalizace bude fungovat! ✨

### Metoda 2: Manuální start serveru

#### Python 3:
```bash
python3 -m http.server 8000
```

#### Python 2:
```bash
python -m SimpleHTTPServer 8000
```

#### Node.js (pokud máš nainstalovaný):
```bash
npx http-server -p 8000
```

Pak otevři v prohlížeči: http://localhost:8000

---

## 🔍 Jak zjistit, že to funguje?

1. Otevři konzoli prohlížeče (F12)
2. Měl bys vidět:
   ```
   Loading language: cs...
   ✓ Language loaded: cs (20 sections)
   ✓ Updated 150 elements
   ✓ i18n initialized
   ```

3. V menu by měly být texty česky (nebo anglicky po přepnutí)

---

## 🌍 Jak přepnout jazyk?

1. Klikni na **Nastavení** ⚙️
2. V sekci **Jazyk** vyber **English**
3. Klikni **Uložit**
4. → Celé UI se přepne do angličtiny! 🇬🇧

---

## 🐛 Řešení problémů

### Problém: Vidím "MENU.NEWGAME" atd.
**Řešení:** Spusť hru přes web server (viz výše)

### Problém: Server se nespustí
**Řešení:**
- Zkontroluj, jestli je Python nainstalovaný: `python3 --version`
- Zkus jiný port: `python3 -m http.server 8080`

### Problém: Port 8000 je již použitý
**Řešení:**
```bash
# Najdi proces
lsof -i :8000

# Ukonči ho
kill -9 <PID>

# Nebo použij jiný port
python3 -m http.server 8001
```

### Problém: Texty jsou v češtině, chci angličtinu
**Řešení:**
1. Otevři konzoli (F12)
2. Zadej: `await i18n.setLanguage('en')`
3. Nebo jdi do Nastavení a změň jazyk tam

---

## 📝 Poznámky

- **Doporučený prohlížeč:** Chrome, Firefox, Safari
- **Port:** 8000 (nebo jiný volný port)
- **Jazyk:** Uloží se do localStorage a zůstane při dalším spuštění

Užij si hru! ⚔️🏆
