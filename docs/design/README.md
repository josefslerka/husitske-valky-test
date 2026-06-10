# Design Documentation

Tato složka obsahuje design dokumenty a specifikace herních dat pro hru Husitské války.

## Obsah

- **armada.md** - Definice všech jednotek (husitských i křižáckých)
- **detaily-bitev.md** - Podrobné informace o historických bitvách
- **husitske_bitvy_game_data.md** - Herní data pro jednotlivé bitvy
- **husitske_bitvy_nova_data.md** - Nová/rozšířená herní data
- **jednotky_rozsireni.md** - Rozšíření a modifikace jednotek

## Účel

Tyto soubory slouží jako:
- 📖 Reference pro návrh a vývoj
- 📊 Specifikace herních mechanik
- 🎮 Zdroj dat pro implementaci
- 📝 Dokumentace historického kontextu

## Poznámka

Herní data z těchto souborů jsou implementována v:
- `js/data/unitTypes.js` - definice jednotek
- `js/data/scenarios.js` - definice scénářů
- `js/data/campaign.js` - struktura kampaně
