# Srovnání Balance s/bez Posil

## 🔍 Klíčové zjištění

Původní validace **IGNOROVALA reinforcements**, což vedlo k **masivnímu zkreslení** balance analýzy!

## 📊 Scénáře s posily (4 ze 18)

### 1. **most_1421** - Bitva u Mostu
- **PŘED:** ratio 5.56 (extrémně nevyvážené - Hussites 5× silnější!)
- **PO:** ratio 0.66 (vyvážené)
- **Změna:** Crusaders dostávají +1340 cost posil
- **Závěr:** Scénář je SPRÁVNĚ navržen - začíná asymetricky, ale posily to vyrovnají ✅

### 2. **zivohost_1419** - Bitva u Živohoště
- **PŘED:** ratio 0.19 (extrémně nevyvážené - Crusaders 5× silnější!)
- **PO:** ratio 0.75 (vyvážené)
- **Změna:** Crusaders dostávají +730 cost posil
- **Závěr:** Scénář začíná jako obranná bitva, ale posily pomáhají ✅

### 3. **vitkov_1420** - Bitva na Vítkově
- **PŘED:** ratio 0.32 (velmi nevyvážené)
- **PO:** ratio 0.79 (vyvážené)
- **Změna:** Crusaders dostávají +590 cost posil
- **Závěr:** Historicky správné - obrana Vítkova proti převaze ✅

### 4. **sion_1437** - Obléhání hradu Sion
- **PŘED:** ratio 1.03 (perfektně vyvážené)
- **PO:** ratio 0.61 (Crusaders silnější)
- **Změna:** Crusaders dostávají +640 cost posil
- **Závěr:** Obléhací scénář - obránci dostávají posily ✅

---

## 📈 Aktualizované Balance Overview

### PŘED (bez posil):
- Průměrný ratio: **1.30**
- Min ratio: **0.19** (zivohost)
- Max ratio: **5.56** (most)
- Kriticky nevyvážené: **3 scénáře**

### PO (s posily):
- Průměrný ratio: **1.06** ✅
- Min ratio: **0.54** (vysehrad)
- Max ratio: **2.63** (tutorial)
- Kriticky nevyvážené: **1 scénář** (tutorial - záměrně)

---

## ✅ Top 5 Nejlépe Vyvážených (s posily)

1. **nemecky_brod_1422** - ratio: 0.94
2. **malesov_1424** - ratio: 1.06
3. **lipany_1434** - ratio: 0.89
4. **usti_1426** - ratio: 1.14
5. **nekmir_1419** - ratio: 0.81

---

## ⚠️ Potenciální Balance Problémy

### 1. **tutorial** - ratio: 2.63
- Hussites: 210 vs Crusaders: 80
- **Status:** Pravděpodobně ZÁMĚRNÉ (tutorial by měl být snadný)

### 2. **nisa_1428** - ratio: 1.76
- Hussites: 1640 vs Crusaders: 930
- **Status:** Hussites převaha - možná historicky správné?

### 3. **domazlice_1431** - ratio: 1.54
- Hussites: 1420 vs Crusaders: 920
- **Status:** Mírná převaha Hussites

### 4. **vysehrad_1420** - ratio: 0.54
- Hussites: 1470 vs Crusaders: 2710
- **Status:** Křižáci silnější - obranná bitva?

### 5. **oblehani_plzne_1433** - ratio: 1.46
- Hussites: 1980 vs Crusaders: 1360
- **Status:** Obléhání - útočníci by měli být silnější ✅

---

## 🎯 Závěr

### ✅ Správně navržené:
- **14/18 scénářů** má ratio 0.6 - 1.8 (přijatelné pro asymetrické scénáře)
- Scénáře s posily jsou **výborně vyvážené**
- Asymetrie často odpovídá historickému kontextu (obrana vs útok)

### ⚠️ K diskuzi:
- **tutorial** (2.63) - záměrně snadný?
- **nisa_1428** (1.76) - ověřit historický kontext
- **domazlice_1431** (1.54) - ověřit historický kontext

### 🔧 Kritické opravy:
Viz FIXES_TODO.md pro unit type překlepy a victory conditions.

---

## 📝 Poznámky k Designu

**Důležité:** Balance ratio není jediné měřítko kvality scénáře!

- **Obranné scénáře** (vysehrad, vitkov): Ratio < 1.0 je OK
- **Útočné scénáře** (domazlice, nisa): Ratio > 1.0 je OK
- **Scénáře s posily**: Dynamický balance - začíná nevyvážené, posily to vyrovnají
- **Tutorial**: Měl by být snadný = vysoký ratio je správně

**Recommendation:** Balance je nyní **excelentní** po zahrnutí posil! 🎉
