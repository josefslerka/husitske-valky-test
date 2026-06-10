# Validační Report - Scénáře

**Datum:** 2026-02-02
**Soubor:** js/data/scenarios.js
**Celkem scénářů:** 18

---

## 📊 Shrnutí

| Kategorie | Počet | Procento |
|-----------|-------|----------|
| ✅ 100% validní scénáře | 9 | 50% |
| ❌ Scénáře s chybami | 9 | 50% |

---

## 🔍 Detailní Výsledky

### ✅ Validní Scénáře (9)

1. **tutorial** - Výcvik na Táboře
   - Balance ratio: 2.63 (Hussites: 210, Crusaders: 80)

2. **zivohost_1419** - Bitva u Živohoště
   - Balance ratio: 0.19 (Hussites: 250, Crusaders: 1310)

3. **sudomere_1420** - Bitva u Sudoměře
   - Balance ratio: 0.81 (Hussites: 1160, Crusaders: 1440)

4. **vitkov_1420** - Bitva na Vítkově
   - Balance ratio: 0.32 (Hussites: 410, Crusaders: 1270)

5. **usti_1426** - Bitva u Ústí nad Labem
   - Balance ratio: 1.14 (Hussites: 1800, Crusaders: 1580)

6. **tachov_1427** - Bitva u Tachova
   - Balance ratio: 1.34 (Hussites: 1470, Crusaders: 1100)

7. **nisa_1428** - Bitva u Nisy
   - Balance ratio: 1.76 (Hussites: 1640, Crusaders: 930)

8. **domazlice_1431** - Bitva u Domažlic
   - Balance ratio: 1.54 (Hussites: 1420, Crusaders: 920)

9. **lipany_1434** - Bitva u Lipan
   - Balance ratio: 0.89 (Hussites: 1180, Crusaders: 1330)

---

### ❌ Scénáře s Chybami (9)

#### 1. **nekmir_1419** - Bitva u Nekmíře
- **Balance:** 0.81 (Hussites: 1660, Crusaders: 2060)
- **Chyby:**
  - ❌ Secondary victory type `'kill_unit'` není implementovaný
  - ❌ Secondary victory type `'protect_wagons'` není implementovaný
- **Doporučení:**
  - Změnit `kill_unit` na `kill_commander`
  - Přidat implementaci `protect_wagons` do VictoryConditionsSystem.js nebo použít alternativní typ

---

#### 2. **vysehrad_1420** - Bitva pod Vyšehradem
- **Balance:** 0.54 (Hussites: 1470, Crusaders: 2710)
- **Chyby:**
  - ❌ Primary victory type `'defend'` není implementovaný
  - ❌ Secondary victory type `'kill_nobles'` není implementovaný
- **Doporučení:**
  - Změnit `defend` na `survive` nebo `hold_position`
  - Změnit `kill_nobles` na `kill_commander`

---

#### 3. **kutna_hora_1421** - Bitva u Kutné Hory
- **Balance:** 0.79 (Hussites: 1800, Crusaders: 2290)
- **Chyby:**
  - ❌ Secondary victory type `'save_wagons'` není implementovaný
- **Doporučení:**
  - Použít `max_losses` nebo implementovat `save_wagons` v systému

---

#### 4. **nemecky_brod_1422** - Bitva u Německého Brodu
- **Balance:** 0.94 (Hussites: 1420, Crusaders: 1510)
- **Chyby:**
  - ❌ Secondary victory type `'time_limit'` není implementovaný
- **Doporučení:**
  - Změnit na `fast_victory` (existující typ)

---

#### 5. **most_1421** - Bitva u Mostu
- **Balance:** 5.56 (Hussites: 1000, Crusaders: 180) ⚠️ VELMI NEVYVÁŽENÉ
- **Chyby:**
  - ❌ Secondary victory type `'both_objectives'` není implementovaný
  - ❌ Secondary victory type `'protect_artillery'` není implementovaný
  - ❌ Secondary victory type `'minimal_losses'` není implementovaný
- **Doporučení:**
  - Změnit `minimal_losses` na `max_losses` nebo `no_losses`
  - `both_objectives` - použít `dual_objective` jako primary typ
  - `protect_artillery` - implementovat nebo odstranit
  - **KRITICKÉ:** Zvýšit sílu crusaders nebo snížit hussites (ratio 5.56 je extrémní)

---

#### 6. **oblehani_plzne_1433** - Obléhání Plzně
- **Balance:** 1.46 (Hussites: 1980, Crusaders: 1360)
- **Chyby:**
  - ❌ Unit type `'BOMBARDY'` neexistuje v UnitTypes
- **Doporučení:**
  - Změnit `BOMBARDY` na `BOMBARDA` (existující typ)

---

#### 7. **sion_1437** - Obléhání hradu Sion
- **Balance:** 1.03 (Hussites: 960, Crusaders: 930) ✅ Dobře vyváženo
- **Chyby:**
  - ❌ Secondary victory type `'keep_commander_alive'` není implementovaný
- **Doporučení:**
  - Změnit na `survive_commander` (existující typ)

---

#### 8. **horice_1423** - Bitva u Hořic
- **Balance:** 0.64 (Hussites: 1980, Crusaders: 3080)
- **Chyby:**
  - ❌ Unit type `'KUSINICI'` neexistuje v UnitTypes (2x)
- **Doporučení:**
  - Změnit `KUSINICI` na `KUSNICI` (existující typ v UnitTypes)

---

#### 9. **malesov_1424** - Bitva u Malešova
- **Balance:** 1.06 (Hussites: 3480, Crusaders: 3270) ✅ Dobře vyváženo
- **Chyby:**
  - ❌ Unit type `'KUSINICI'` neexistuje v UnitTypes (4x)
  - ❌ Secondary victory type `'commander_survives'` není implementovaný
  - ❌ Secondary victory type `'minimize_losses'` není implementovaný
- **Doporučení:**
  - Změnit `KUSINICI` na `KUSNICI`
  - Změnit `commander_survives` na `survive_commander`
  - Změnit `minimize_losses` na `max_losses`

---

## 📈 Analýza Chyb

### Nejčastější Problémy

| Typ problému | Počet výskytů |
|--------------|---------------|
| Victory conditions | 12x |
| Neexistující unit type | 7x |

### Překlepy v Unit Types

- `KUSINICI` → mělo by být `KUSNICI` (6x výskytů v scénářích horice_1423 a malesov_1424)
- `BOMBARDY` → mělo by být `BOMBARDA` (1x v oblehani_plzne_1433)

### Neimplementované Victory Condition Types

**Primary types:**
- `defend` → použít `survive` nebo `hold_position`

**Secondary types:**
- `kill_unit` → použít `kill_commander`
- `protect_wagons` → implementovat nebo odstranit
- `kill_nobles` → použít `kill_commander`
- `save_wagons` → implementovat nebo použít `max_losses`
- `time_limit` → použít `fast_victory`
- `both_objectives` → použít `dual_objective` jako primary
- `protect_artillery` → implementovat nebo odstranit
- `minimal_losses` → použít `max_losses` nebo `no_losses`
- `keep_commander_alive` → použít `survive_commander`
- `commander_survives` → použít `survive_commander`
- `minimize_losses` → použít `max_losses`

---

## ⚖️ Balance Analýza

### Statistiky

- **Průměrný ratio:** 1.30 (hussites/crusaders)
- **Min ratio:** 0.19 (zivohost_1419)
- **Max ratio:** 5.56 (most_1421)

### Top 5 Nejlépe Vyvážených Scénářů (ratio ~ 1.0)

1. **sion_1437** - ratio: 1.03 ✅
2. **nemecky_brod_1422** - ratio: 0.94 ✅
3. **malesov_1424** - ratio: 1.06 ✅
4. **lipany_1434** - ratio: 0.89 ✅
5. **usti_1426** - ratio: 1.14 ✅

### Top 5 Nejvíce Nevyvážených Scénářů

1. **most_1421** - ratio: 5.56 ⚠️ **KRITICKÉ**
2. **tutorial** - ratio: 2.63 ⚠️ (přijatelné pro tutoriál)
3. **zivohost_1419** - ratio: 0.19 ⚠️ **VELMI NEVYVÁŽENÉ**
4. **nisa_1428** - ratio: 1.76 ⚠️
5. **vitkov_1420** - ratio: 0.32 ⚠️

---

## 🎯 Doporučení

### Kritické Opravy (Musí být opraveny)

1. **Opravit překlepy v unit types:**
   - Scénáře: horice_1423, malesov_1424
   - Změnit: `KUSINICI` → `KUSNICI`

2. **Opravit neexistující unit type:**
   - Scénář: oblehani_plzne_1433
   - Změnit: `BOMBARDY` → `BOMBARDA`

3. **Opravit primary victory condition:**
   - Scénář: vysehrad_1420
   - Změnit: `defend` → `survive` nebo `hold_position`

### Vysoká Priorita (Měly by být opraveny)

1. **Opravit neimplementované secondary conditions** ve scénářích:
   - nekmir_1419 (2 problémy)
   - vysehrad_1420 (1 problém)
   - kutna_hora_1421 (1 problém)
   - nemecky_brod_1422 (1 problém)
   - most_1421 (3 problémy)
   - sion_1437 (1 problém)
   - malesov_1424 (2 problémy)

2. **Vyřešit extrémní nevyváženost:**
   - **most_1421**: ratio 5.56 - zvýšit sílu crusaders nebo snížit hussites
   - **zivohost_1419**: ratio 0.19 - zvýšit sílu hussites nebo snížit crusaders

### Střední Priorita (Doporučené úpravy)

1. **Revidovat balance scénářů s ratio < 0.5 nebo > 2.0:**
   - tutorial (2.63) - přijatelné, je to tutoriál
   - vitkov_1420 (0.32)
   - zivohost_1419 (0.19)
   - most_1421 (5.56)

---

## 📝 Implementační Checklist

### Okamžité Opravy (Unit Types)

- [ ] horice_1423: `KUSINICI` → `KUSNICI` (2 výskyty)
- [ ] malesov_1424: `KUSINICI` → `KUSNICI` (4 výskyty)
- [ ] oblehani_plzne_1433: `BOMBARDY` → `BOMBARDA`

### Victory Conditions - Quick Fixes (Použít existující typy)

- [ ] vysehrad_1420: `defend` → `survive`
- [ ] vysehrad_1420: `kill_nobles` → `kill_commander`
- [ ] nekmir_1419: `kill_unit` → `kill_commander`
- [ ] nemecky_brod_1422: `time_limit` → `fast_victory`
- [ ] most_1421: `minimal_losses` → `max_losses`
- [ ] sion_1437: `keep_commander_alive` → `survive_commander`
- [ ] malesov_1424: `commander_survives` → `survive_commander`
- [ ] malesov_1424: `minimize_losses` → `max_losses`

### Victory Conditions - Vyžadují Rozhodnutí

- [ ] nekmir_1419: `protect_wagons` - implementovat nebo odstranit?
- [ ] kutna_hora_1421: `save_wagons` - implementovat nebo použít alternativu?
- [ ] most_1421: `both_objectives` - přepracovat jako `dual_objective`?
- [ ] most_1421: `protect_artillery` - implementovat nebo odstranit?

### Balance Úpravy

- [ ] most_1421: Kritická nevyváženost (ratio 5.56) - upravit jednotky
- [ ] zivohost_1419: Vysoká nevyváženost (ratio 0.19) - upravit jednotky
- [ ] vitkov_1420: Zvážit úpravu (ratio 0.32)

---

## 📊 Statistiky po Kategoriích

### Pozice Jednotek
- ✅ Všechny scénáře: 18/18 (100%)
- ❌ S chybami: 0/18 (0%)

### Unit Types
- ✅ Validní: 15/18 (83%)
- ❌ S chybami: 3/18 (17%)
  - horice_1423
  - malesov_1424
  - oblehani_plzne_1433

### Victory Conditions
- ✅ Validní: 9/18 (50%)
- ❌ S chybami: 9/18 (50%)

### Reinforcements
- ✅ Všechny scénáře: 18/18 (100%)
- ❌ S chybami: 0/18 (0%)

---

## 🏆 Závěr

**Celkový stav:** 9/18 scénářů (50%) je plně validních.

**Hlavní problémy:**
1. Nekonzistentní názvy victory condition types (12 chyb)
2. Překlepy v unit types (7 chyb)

**Pozitivní:**
- Všechny pozice jednotek jsou validní ✅
- Všechny reinforcements jsou validní ✅
- 50% scénářů má balance ratio mezi 0.8-1.5 ✅

**Další kroky:**
1. Opravit kritické chyby (unit types překlepy)
2. Sjednotit victory condition types
3. Vyřešit extrémní nevyváženost (most_1421, zivohost_1419)
4. Zvážit implementaci chybějících victory condition types
