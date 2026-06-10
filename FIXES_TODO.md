# Opravy Scénářů - TODO List

## ⚠️ KRITICKÉ - Opravit ASAP

### 1. Unit Type Překlepy

**horice_1423 - Bitva u Hořic:**
```javascript
// NAJÍT A NAHRADIT:
type: 'kusinici'  →  type: 'kusnici'
// (2× výskyty v tomto scénáři)
```

**malesov_1424 - Bitva u Malešova:**
```javascript
// NAJÍT A NAHRADIT:
type: 'kusinici'  →  type: 'kusnici'
// (4× výskyty v tomto scénáři)
```

**oblehani_plzne_1433 - Obléhání Plzně:**
```javascript
// NAJÍT A NAHRADIT:
type: 'bombardy'  →  type: 'bombarda'
// (1× výskyt v tomto scénáři)
```

---

## 🔴 VYSOKÁ PRIORITA - Victory Conditions

### 2. Primary Victory Conditions

**vysehrad_1420 - Bitva pod Vyšehradem:**
```javascript
// OPRAVIT:
victoryConditions: {
    primary: {
        type: 'defend',  // ← NEEXISTUJE
        // ...
    }
}

// NA:
victoryConditions: {
    primary: {
        type: 'survive',  // nebo 'hold_position'
        minUnitsPercent: 50,  // pokud survive
        // positions: [...],  // pokud hold_position
    }
}
```

### 3. Secondary Victory Conditions - Quick Fixes

**nekmir_1419:**
```javascript
// Změnit:
{ type: 'kill_unit', ... }  →  { type: 'kill_commander', ... }

// Odstranit nebo implementovat:
{ type: 'protect_wagons', ... }  // TODO: rozhodnout
```

**vysehrad_1420:**
```javascript
// Změnit:
{ type: 'kill_nobles', ... }  →  { type: 'kill_commander', ... }
```

**kutna_hora_1421:**
```javascript
// Odstranit nebo implementovat:
{ type: 'save_wagons', ... }  // TODO: rozhodnout nebo změnit na max_losses
```

**nemecky_brod_1422:**
```javascript
// Změnit:
{ type: 'time_limit', ... }  →  { type: 'fast_victory', maxTurns: ... }
```

**most_1421:**
```javascript
// Změnit:
{ type: 'minimal_losses', ... }  →  { type: 'max_losses', maxLosses: 2 }

// TODO: Rozhodnout o těchto:
{ type: 'both_objectives', ... }      // Přepracovat jako dual_objective?
{ type: 'protect_artillery', ... }    // Odstranit nebo implementovat?
```

**sion_1437:**
```javascript
// Změnit:
{ type: 'keep_commander_alive', ... }  →  { type: 'survive_commander', ... }
```

**malesov_1424:**
```javascript
// Změnit:
{ type: 'commander_survives', ... }  →  { type: 'survive_commander', ... }
{ type: 'minimize_losses', ... }     →  { type: 'max_losses', maxLosses: 5 }
```

---

## ⚖️ BALANCE OPRAVY

### 4. Kriticky Nevyvážené Scénáře

**most_1421 - Bitva u Mostu:**
```
Současný stav:
  Hussites:  1000 cost
  Crusaders:  180 cost
  Ratio: 5.56  ← EXTRÉMNĚ NEVYVÁŽENÉ!

Doporučení:
  - Zvýšit sílu crusaders na ~800-900 cost
  - NEBO snížit hussites na ~300-400 cost
  - Cílový ratio: 1.0 - 1.5
```

**zivohost_1419 - Bitva u Živohoště:**
```
Současný stav:
  Hussites:   250 cost
  Crusaders: 1310 cost
  Ratio: 0.19  ← VELMI NEVYVÁŽENÉ!

Poznámka:
  - Historicky správné (malý husitský oddíl vs přesila)
  - Pokud je záměr obranného scénáře, OK
  - Jinak zvýšit hussites na ~900-1000 cost
```

**vitkov_1420 - Bitva na Vítkově:**
```
Současný stav:
  Hussites:  410 cost
  Crusaders: 1270 cost
  Ratio: 0.32

Poznámka:
  - Historicky pravděpodobně správné (obrana kopce)
  - Pokud je záměr těžkého obranného scénáře, OK
  - Jinak zvážit zvýšení hussites
```

---

## 📋 Checklist pro Opravu

### Fáze 1: Kritické Chyby (30 minut)
- [ ] horice_1423: Opravit `kusinici` → `kusnici` (2×)
- [ ] malesov_1424: Opravit `kusinici` → `kusnici` (4×)
- [ ] oblehani_plzne_1433: Opravit `bombardy` → `bombarda` (1×)
- [ ] vysehrad_1420: Změnit `defend` → `survive`

### Fáze 2: Quick Fixes Victory Conditions (1 hodina)
- [ ] nekmir_1419: `kill_unit` → `kill_commander`
- [ ] vysehrad_1420: `kill_nobles` → `kill_commander`
- [ ] nemecky_brod_1422: `time_limit` → `fast_victory`
- [ ] most_1421: `minimal_losses` → `max_losses`
- [ ] sion_1437: `keep_commander_alive` → `survive_commander`
- [ ] malesov_1424: `commander_survives` → `survive_commander`
- [ ] malesov_1424: `minimize_losses` → `max_losses`

### Fáze 3: Rozhodnutí o Implementaci (diskuze)
- [ ] `protect_wagons` - implementovat nebo odstranit?
- [ ] `save_wagons` - implementovat nebo nahradit?
- [ ] `both_objectives` - přepracovat jako dual_objective?
- [ ] `protect_artillery` - implementovat nebo odstranit?

### Fáze 4: Balance Review (1-2 hodiny)
- [ ] most_1421: Kritická úprava balance (ratio 5.56)
- [ ] zivohost_1419: Review historické přesnosti vs gameplay
- [ ] vitkov_1420: Review obranného designu
- [ ] nisa_1428: Zvážit mírnou úpravu (ratio 1.76)

---

## 🔧 Ukázkové Opravy

### Příklad 1: horice_1423

**PŘED:**
```javascript
units: [
    { type: 'kusinici', col: 5, row: 3 },  // ← ŠPATNĚ
    { type: 'kusinici', col: 7, row: 3 },  // ← ŠPATNĚ
    // ...
]
```

**PO:**
```javascript
units: [
    { type: 'kusnici', col: 5, row: 3 },  // ✓ SPRÁVNĚ
    { type: 'kusnici', col: 7, row: 3 },  // ✓ SPRÁVNĚ
    // ...
]
```

### Příklad 2: vysehrad_1420

**PŘED:**
```javascript
victoryConditions: {
    primary: {
        type: 'defend',
        description: 'Odrazte křižácký útok',
        minUnitsPercent: 50
    },
    secondary: [
        {
            type: 'kill_nobles',
            description: 'Zabijte nepřátelské velitele'
        }
    ]
}
```

**PO:**
```javascript
victoryConditions: {
    primary: {
        type: 'survive',
        description: 'Odrazte křižácký útok',
        minUnitsPercent: 50
    },
    secondary: [
        {
            type: 'kill_commander',
            description: 'Zabijte nepřátelské velitele'
        }
    ]
}
```

---

## 📊 Progress Tracking

**Celkem problémů:** 19
- **Kritické (unit types):** 3
- **Vysoká priorita (victory conditions):** 12
- **Balance:** 3
- **K rozhodnutí:** 4

**Odhadovaný čas oprav:**
- Fáze 1 (kritické): 30 minut
- Fáze 2 (quick fixes): 1 hodina
- Fáze 3 (diskuze): 30 minut
- Fáze 4 (balance): 1-2 hodiny

**Celkem:** ~3-4 hodiny

---

## 🎯 Po Opravách

Po dokončení všech oprav by mělo být:
- ✅ 18/18 scénářů s validními unit types (100%)
- ✅ 18/18 scénářů s validními victory conditions (100%)
- ✅ 15+/18 scénářů s přijatelným balance ratio (83%+)

**Výsledek:** Plně funkční a vyvážená sada scénářů připravená k testování a vydání.
