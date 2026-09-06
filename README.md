# Husitské války - Tahová strategie

Historická tahová strategická hra zasazená do období husitských válek (1419-1437). Hrajte za husitské armády pod vedením Jana Žižky, Prokopa Holého a dalších legendárních velitelů.

## 🎮 O hře

Taktická tahovka na hexagonálním poli, která přináší historicky autentický pohled na husitské války. Využijte revoluční wagenburgovou taktiku, palné zbraně a důmyslné taktické manévry k porazení numericky i vojensky převažujících křižáckých armád.

### Hlavní funkce

- **18 historických bitev** - Od Živohoště po poslední odpor na Sionu
- **Historické typy jednotek** - Cepníci, vozová hradba, ručničáři, šlechtická jízda a další
- **Komplexní bojový systém** - Terén, morálka, velitelé, speciální schopnosti
- **Fog of War** - Omezená viditelnost, průzkum, skryté jednotky
- **Morálkový systém** - Jednotky mohou prchat, znovu se semknout nebo dezertovat
- **Variabilní vítězné podmínky** - Držení pozic, zničení nepřítele, přežití, únik
- **AI protivník** - Taktická AI pro křižácké armády
- **Kampaňový režim** - Propojené scénáře s progresí příběhu
- **Encyklopedie** - Historické informace o jednotkách, bitvách a osobnostech

## 🚀 Jak spustit

Hra je čistý HTML/CSS/JavaScript bez instalačních závislostí. Kvůli načítání lokalizačních JSON souborů ji spouštějte přes lokální HTTP server:

```bash
# V kořeni projektu
python3 -m http.server 8000
```

Pak otevřete [http://localhost:8000](http://localhost:8000). Přímé otevření `index.html` přes `file://` nemusí kvůli bezpečnostním pravidlům prohlížeče načíst překlady.

**Doporučené prohlížeče:** aktuální Chrome, Firefox nebo Safari.

### Kontroly před testováním

```bash
node scripts/check.js
```

Příkaz ověří syntaxi JS, scénáře, překlady a oba testovací balíky. Regrese průběhu
bitvy lze samostatně spustit přes `node scripts/test-battle.js`; používají skutečné
herní třídy a hexovou mřížku s řízeným časem a nahrazeným vykreslováním.

Hru lze uložit během hráčova tahu po dokončení rozpracované akce. Načítání z hlavního
menu, herního menu i pauzy obnoví celý scénář. Save v4 zachovává i změněný terén;
starší verze v1–v3 lze nadále načíst. Neplatný save ponechá rozehranou bitvu beze změny.

První řízený playtest je popsaný v [docs/ACT_I_PLAYTEST.md](docs/ACT_I_PLAYTEST.md).

## 📁 Struktura projektu

```
strategie/
├── index.html              # Hlavní HTML soubor
├── style.css               # Globální styly
├── js/
│   ├── core/              # Základní herní logika
│   │   ├── game.js        # Hlavní herní třída
│   │   └── hex.js         # Hexagonální mřížka
│   ├── systems/           # Herní systémy
│   │   ├── CombatSystem.js         # Bojový systém
│   │   ├── CampaignProgressSystem.js # Postup kampaně a pověst
│   │   ├── FogOfWarSystem.js       # Systém viditelnosti
│   │   ├── MoraleSystem.js         # Systém morálky
│   │   ├── VictoryConditionsSystem.js  # Vítězné podmínky
│   │   └── TutorialSystem.js       # Tutorial
│   ├── entities/          # Herní entity
│   │   ├── Unit.js        # Třída jednotky
│   │   └── UnitFactory.js # Factory pro vytváření jednotek
│   ├── data/              # Herní data
│   │   ├── unitTypes.js   # Definice typů jednotek
│   │   ├── scenarios.js   # Scénáře bitev
│   │   ├── campaign.js    # Struktura kampaně
│   │   └── battleLore.js  # Historické texty
│   ├── ui/                # UI komponenty
│   │   ├── main.js        # UI logika
│   │   ├── sound.js       # Zvukové efekty
│   │   └── music.js       # Hudba
│   └── ai.js              # AI protivníka
├── docs/                  # Dokumentace
│   ├── VICTORY_CONDITIONS.md    # Dokumentace vítězných podmínek
│   ├── CONSISTENCY_REPORT.md    # Report konzistence herní logiky
│   └── design/            # Design dokumenty
├── assets/                # Grafické assety
├── audio/                 # Zvukové soubory
└── imgs/                  # Obrázky
```

## 🎯 Herní mechaniky

### Bojový systém
- **Damage calculation** - Komplexní pipeline s 13 kroky výpočtu
- **Terrain bonuses** - Les (+20% obrana), kopce (+30%), města (+40%)
- **Special abilities** - Reach, RapidFire, Charge, ArmorPiercing, Siege...
- **Formation bonuses** - Wagenburg obrana, shield wall, commander auras
- **Random factor** - ±20% variance pro taktickou hloubku

### Jednotky
- **Husité**: Cepníci, sudličníci, kušiníci, píšťalníci, vozy, houfnice
- **Křižáci**: Těžcí rytíři, kopiníci, halapartníci, kušníci, lučištníci
- **Legendary commanders**: Jan Žižka, Prokop Holý, Zikmund Korybutovič, Hynek Krušina

### Vítězné podmínky
10 typů primárních podmínek (survive, destroy_percent, capture_position, escape...)
10 typů sekundárních bonusových cílů
3 typy porážkových podmínek

Viz: [docs/VICTORY_CONDITIONS.md](docs/VICTORY_CONDITIONS.md)

## 📚 Dokumentace

- **[VICTORY_CONDITIONS.md](docs/VICTORY_CONDITIONS.md)** - Kompletní přehled vítězných a porážkových podmínek
- **[CONSISTENCY_REPORT.md](docs/CONSISTENCY_REPORT.md)** - Analýza konzistence herní logiky
- **[docs/design/](docs/design/)** - Design dokumenty a poznámky

## 🛠️ Tech Stack

- **Vanilla JavaScript** (ES6+) - Žádné závislosti, čistý JS
- **HTML5 Canvas** - Rendering hexagonální mapy
- **CSS3** - Responsivní UI s custom properties
- **Class-based architecture** - OOP design pro lepší maintainability

## 🎨 Grafický styl

- **Středověký manuscript look** - Inspirováno iluminovanými rukopisy
- **Parchment textures** - Nostalgický pocit historického dokumentu
- **Hex-based battlefield** - Taktický hexagonal grid
- **Period-appropriate UI** - Gotické fonty, zlaté ornamenty

## 🏛️ Historická autenticita

Hra vychází z historických pramenů a odborné literatury:
- Skutečné bitvy a jejich průběh
- Autentické jednotky a jejich taktika
- Historické osobnosti s reálnými charakteristikami
- Wagenburgová taktika a palné zbraně (husitská revoluce ve vojenství)

## 📝 Stav vývoje

**Verze:** Alpha 0.2 (vývojová)
**Stav:** připraveno k playtestu Aktu I

### Dokončeno
- ✅ Kompletní bojový systém
- ✅ 18+ historických scénářů
- ✅ AI protivník
- ✅ Fog of War
- ✅ Morálkový systém
- ✅ Vítězné podmínky
- ✅ Tutorial
- ✅ Encyklopedie
- ✅ Save/Load system
- ✅ Česká a anglická lokalizace
- ✅ Doktríny AI, postup kampaně a pověst
- ✅ Kronika hráče i vítězné protistrany

### Známé limity

- AI používá čitelné historické doktríny, ale nenahrazuje lidského soupeře.
- Balanc scénářů, hlavně v pozdějších aktech, potřebuje ověřit reálnými hráči.
- Dotykové ovládání a iPad zatím nemají samostatný UX průchod.
- Postup i savy jsou v `localStorage`; vymazání dat webu je odstraní a mezi prohlížeči se nesynchronizují.
- Hra nemá backend, multiplayer ani cloudové ukládání.

### Plánované funkce
- 🔄 Multiplayer/hotseat mode
- 🔄 Scenario editor
- 🔄 Achievement system
- 🔄 Extended campaign (1434-1436)

## 🤝 Contributing

Projekt je otevřený pro příspěvky. Při přidávání nových featur dodržujte:
- Existující code style (class-based OOP)
- Separaci concerns (systems/, entities/, data/)
- Historickou autenticitu u nových jednotek/scénářů

## 📜 License

MIT License - see LICENSE file for details

## 🙏 Credits

- **Design & Development:** Josef Šlerka
- **Historical Research:** Odborná literatura o husitských válkách
- **Testing:** Alpha testers TBD

## 💝 Support

Líbí se ti hra? Podpoř vývoj: https://buymeacoffee.com/josefslerka

## 📧 Contact

- **Email:** josef.slerka@gmail.com
- **Issues:** GitHub Issues (po publikování)

---

*"Kdo jsú boží bojovníci, a zákona jeho... 🎵"*
