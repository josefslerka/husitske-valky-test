# TODO - Husitské Války

## ✅ Hotovo (Alpha 0.2)

### Lokalizace
- [x] Plná lokalizace CS/EN - 18 scénářů
- [x] 15 battleLore záznamů přeloženo
- [x] Všechny události, zprávy, briefingy, cíle, debriefingy
- [x] Fáze (phases) s vnořenými events
- [x] Historické poznámky a datumy
- [x] Detekce jazyka prohlížeče při prvním spuštění
- [x] Dynamická aktualizace meta tagů (title, description, OG tags)
- [x] HTML lang atribut se mění s jazykem

### Funkce
- [x] Tutorial scénář
- [x] Kampaň s 17 historickými bitvami
- [x] Quick Battle režim
- [x] Encyklopedie jednotek
- [x] Save/Load systém
- [x] AI pro křižáky
- [x] Mlha války (zapíná se podle obtížnosti)
- [x] Morální systém
- [x] Speciální schopnosti (chorál, dělostřelecký bombardement)
- [x] Zvuky (pohyb, boj, výběr)
- [x] Hudba (MP3 - "Ktož jsú boží bojovníci")

### Opravy
- [x] Quick Battle funguje (opravena undefined scenario reference)
- [x] Hudba toggle funguje správně (přepsáno z Web Audio API na HTML5 Audio)
- [x] Meta tagy a SEO optimalizace

---

## 🔧 Před releasem (Alpha 1.0)

### Čištění kódu
- [ ] Odstranit debug console.log záznamy:
  - [ ] `/js/ui/main.js` - Quick Battle logy (řádky 516, 525, 532, 539, 543, 546-548)
  - [ ] `/js/core/game.js` - Army creation log (řádek 108)
  - [ ] `/js/core/game.js` - First render log (řádky 1880-1883)

### Testování
- [ ] **Scénáře** - projít všech 18 scénářů v obou jazycích:
  - [ ] Tutorial (cs/en)
  - [ ] Sudoměř 1420 (cs/en)
  - [ ] Vítkův Kámen 1420 (cs/en)
  - [ ] Záhořany 1421 (cs/en)
  - [ ] Kutná Hora 1421-22 (cs/en)
  - [ ] Habry 1422 (cs/en)
  - [ ] Německý Brod 1422 (cs/en)
  - [ ] Strachov 1423 (cs/en)
  - [ ] Ústí nad Labem 1426 (cs/en)
  - [ ] Tachov 1427 (cs/en)
  - [ ] Zwettl 1427 (cs/en)
  - [ ] Taus 1431 (cs/en)
  - [ ] Domažlice 1431 (cs/en)
  - [ ] Lipany 1434 (cs/en)
  - [ ] Úštěk 1426 (cs/en)
  - [ ] Loket 1421-22 (cs/en)
  - [ ] Vysoké Mýto 1421-22 (cs/en)
  - [ ] Praha 1420 (cs/en)

- [ ] **Funkcionality:**
  - [ ] Quick Battle - vytvoření a hra
  - [ ] Save/Load - uložení a načtení hry
  - [ ] AI - chování křižáků
  - [ ] Mlha války - zapíná/vypíná podle obtížnosti
  - [ ] Speciální schopnosti fungují
  - [ ] Victory conditions - všechny typy (survive, destroy, escape, hold, atd.)
  - [ ] Tutoriál kroky fungují správně
  - [ ] Encyklopedie se správně překládá

- [ ] **Lokalizace:**
  - [ ] Všechny UI texty přeložené (žádné chybějící klíče)
  - [ ] Žádné mixování CS/EN
  - [ ] Přepínání jazyků funguje všude (menu, hra, modály)

### Dokumentace
- [ ] **README.md:**
  - [ ] Popis hry
  - [ ] Screenshot / GIF
  - [ ] Jak spustit (local server instructions)
  - [ ] Ovládání
  - [ ] Kredity
  - [ ] License info (MIT)

- [ ] **Inline komentáře:**
  - [ ] Zkontrolovat klíčové funkce mají komentáře
  - [ ] Složité algoritmy vysvětlené

### Browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Optimalizace (volitelné pro alpha)
- [ ] Komprimovat obrázky (PNG → optimalizované PNG/WebP)
- [ ] Minifikace JS/CSS (build script)
- [ ] Lazy loading pro velké assety

---

## 🎯 Nice-to-have (Budoucí verze)

### Další jazyky
- [ ] Němčina (DE) - relevantní pro historii
- [ ] Polština (PL) - sousední země
- [ ] Připravit strukturu pro další jazyky

### Mobile/Tablet podpora
- [ ] Touch ovládání (tap místo click)
- [ ] Responsivní layout pro menší obrazovky
- [ ] Vertikální/horizontální orientace
- [ ] Gesture navigation (pinch-to-zoom?)

### Gameplay vylepšení
- [ ] Více difficulty levelů (easy/normal/hard s různými AI)
- [ ] Statistiky po bitvě (damage dealt, units lost, atd.)
- [ ] Achievement systém
- [ ] Replay funkce
- [ ] Multiplayer (hot-seat)
- [ ] Custom scenarios editor

### Audio/Visual
- [ ] Další hudební tracky pro různé části hry
- [ ] Zvukové efekty pro jednotlivé jednotky
- [ ] Animace pohybu jednotek
- [ ] Particle effects (kouř, jiskry, krev)
- [ ] Weather effects (déšť, sníh)

### Technické
- [ ] Service Worker pro offline play
- [ ] PWA manifest (instalovatelná aplikace)
- [ ] Analytics (kolik lidí hraje, které scénáře jsou populární)
- [ ] Error reporting (Sentry nebo podobné)

### Content
- [ ] Více historických bitev (1420-1434)
- [ ] Alternativní scénáře ("what if")
- [ ] Detailed lore pro každou jednotku
- [ ] Historical articles v encyklopedii

---

## 📝 Poznámky

### Známé problémy
- (žádné aktuálně)

### Technický dluh
- Console logs v kódu (k odstranění před releasem)
- Starý Web Audio API kód odstraněn (✓)

### Release checklist
1. [ ] Projít všechny TODO položky
2. [ ] Odstranit debug kód
3. [ ] Otestovat všechny scénáře
4. [ ] Napsat README
5. [ ] Commit + tag v gitu (v1.0.0)
6. [ ] Deploy na hosting
7. [ ] Oznámení release

---

**Aktuální verze:** Alpha 0.2 (04.02.2026)
**Cílová verze pro release:** Alpha 1.0
**Udržováno od:** 04.02.2026
