# Vítězné a porážkové podmínky

## Implementované primární podmínky (primary)

### ✅ Standardní
- **`survive`** - Přežít s minimálním % jednotek
- **`survive_turns`** - Přežít určitý počet kol
- **`destroy_percent`** - Zničit X% nepřátel
- **`destroy_or_rout`** - Zničit NEBO zlomit morálku nepřítele ✨ NOVĚ
- **`escape`** - Určitý počet jednotek musí uniknout
- **`hold_position`** - Udržet určité pozice
- **`capture_position`** - Obsadit určité pozice
- **`dual_objective`** - Splnit jeden z více cílů
- **`dual_objective_battle`** - Alias pro dual_objective ✨ NOVĚ
- **`tutorial_complete`** - Dokončení tutoriálu ✨ NOVĚ

## Implementované sekundární podmínky (secondary)

### ✅ Bonusové cíle
- **`kill_commander`** - Zabít nepřátelského velitele
- **`eliminate_commander`** - Alias pro kill_commander ✨ NOVĚ
- **`survive_commander`** - Velitel musí přežít ✨ NOVĚ
- **`no_losses`** - Žádné ztráty
- **`max_losses`** - Maximum X ztrát
- **`fast_victory`** - Vítězství do X kol
- **`hold_position`** - Udržet pozice ✨ NOVĚ
- **`capture_position`** - Obsadit pozice ✨ NOVĚ
- **`destroy_percent`** - Zničit X% nepřátel ✨ NOVĚ
- **`capture_wagons`** - Zajmout nepřátelské vozy ✨ NOVĚ

## Porážkové podmínky (defeatConditions)

### ✅ Okamžitá porážka
- **`commander_death`** - Smrt velitele
- **`lose_positions`** - Ztráta klíčových pozic
- **`lose_percent`** - Ztráta X% jednotek

## Příklady použití

### Přežití s minimálními ztrátami
```javascript
victoryConditions: {
    primary: {
        type: 'survive',
        minUnitsPercent: 40,
        description: 'Přežijte s alespoň 40% jednotek'
    },
    secondary: [
        { type: 'no_losses', description: 'Bez ztrát' },
        { type: 'fast_victory', maxTurns: 5, description: 'Rychlé vítězství' }
    ]
}
```

### Zničení nebo zlomení nepřítele
```javascript
victoryConditions: {
    primary: {
        type: 'destroy_or_rout',
        description: 'Zničte nebo přiměřte nepřítele k útěku'
    },
    secondary: [
        { type: 'eliminate_commander', description: 'Zabijte nepřátelského velitele' },
        { type: 'capture_wagons', count: 2, description: 'Zajměte 2 nepřátelské vozy' }
    ]
}
```

### Držení pozic
```javascript
victoryConditions: {
    primary: {
        type: 'hold_position',
        positions: [[10,5], [11,5], [12,5]],
        description: 'Udržte klíčový kopec'
    },
    secondary: [
        { type: 'survive_commander', description: 'Žižka musí přežít' }
    ]
}
```

### Duální cíl
```javascript
victoryConditions: {
    primary: {
        type: 'dual_objective',
        objectives: [
            {
                id: 'hill',
                type: 'capture_position',
                positions: [[10,5], [11,5]],
                holdTurns: 3,
                description: 'Obsaďte kopec a držte 3 kola'
            },
            {
                type: 'hold_position',
                positions: [[5,5], [6,5]],
                description: 'NEBO udržte výchozí pozici'
            }
        ]
    }
}
```

## Poznámky k implementaci

- **destroy_or_rout** využívá systém morálky - vítězství nastane když nepřítel ztratil 50%+ jednotek NEBO má morální zlom
- **capture_wagons** počítá pouze zničené/zajmuté vozy (unitClass === 'wagon')
- **hold_position** jako sekundární cíl vyžaduje alespoň 50% pozic (zaokrouhleno nahoru)
- **capture_position** jako sekundární cíl vyžaduje všechny pozice (nebo specifikovaný count)
- **dual_objective_battle** je alias pro dual_objective - obě fungují stejně

## Testování

Všechny podmínky jsou implementovány v `js/systems/VictoryConditionsSystem.js`.
Podmínky se kontrolují:
- Po každém tahu (checkVictory)
- Po uplynutí maxTurns (checkScenarioVictoryConditions)
- Průběžně pro dual objectives (checkDualObjectiveProgress)
