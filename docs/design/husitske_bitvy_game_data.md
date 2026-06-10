# HUSITSKÉ VÁLKY 1419-1434
## Strukturovaná data bitev pro Claude Code
## Verze 1.0 - Kompletní herní data

---

# FORMÁT DAT

Každá bitva obsahuje:
- `metadata` - základní informace
- `terrain` - popis terénu a mapy
- `forces` - vojska obou stran
- `phases` - fáze bitvy jako skriptované eventy
- `victory_conditions` - podmínky vítězství

---

# BITVA 1: SUDOMĚŘ (25. března 1420)

## metadata
```json
{
  "id": "sudomere_1420",
  "name": "Bitva u Sudoměře",
  "name_en": "Battle of Sudoměř",
  "date": "1420-03-25",
  "type": "field_battle",
  "campaign": "pre_crusade",
  "historical_significance": "První větší husitské vítězství, první použití vozové hradby",
  "winner": "hussites"
}
```

## terrain
```json
{
  "location": {
    "name": "Sudoměř",
    "region": "Jižní Čechy",
    "coordinates": {"lat": 49.28, "lng": 14.05},
    "nearby_cities": ["Strakonice", "Písek"]
  },
  "map_size": {
    "width": 20,
    "height": 15,
    "hex_size_meters": 50
  },
  "terrain_types": {
    "dam": {
      "hexes": [[10,7], [10,8], [10,9]],
      "description": "Úzká hráz mezi rybníky - max 3 jednotky vedle sebe",
      "movement_modifier": 0.5,
      "defense_bonus": 2
    },
    "pond_full": {
      "hexes": [[0,0], [0,14], [5,0], [5,14]],
      "description": "Rybník Markovec - napuštěný, neprůchodný",
      "passable": false
    },
    "pond_drained": {
      "hexes": [[15,0], [19,14]],
      "description": "Rybník Škaredý - vypuštěný, bahnitý",
      "movement_modifier": 0.25,
      "cavalry_penalty": true,
      "dismount_required": true
    },
    "elevation": {
      "hexes": [[8,5], [12,10]],
      "description": "Mírná vyvýšenina na hrázi",
      "defense_bonus": 1
    }
  },
  "weather": {
    "season": "early_spring",
    "conditions": "mlha večer",
    "visibility_modifier": 0.5,
    "visibility_change_phase": 3
  },
  "time_of_day": {
    "start": "16:00",
    "sunset": "18:30",
    "night_battle_possible": false
  }
}
```

## forces

### Husité
```json
{
  "faction": "hussites",
  "commander": {
    "name": "Jan Žižka z Trocnova",
    "rank": "hejtman",
    "abilities": ["tactical_genius", "terrain_master", "wagon_expert"],
    "position": [10, 8]
  },
  "secondary_commanders": [
    {"name": "Břeněk Švihovský z Rýzmberka", "rank": "velitel", "note": "nominální vrchní velitel"},
    {"name": "Valkoun z Adlaru", "rank": "hejtman"}
  ],
  "total_strength": 400,
  "composition": {
    "infantry": {
      "cepnici": {"count": 80, "position": "wagon_defense"},
      "sudlicnici": {"count": 80, "position": "wagon_defense"},
      "paveznici": {"count": 40, "position": "wagon_support"}
    },
    "ranged": {
      "kusinici": {"count": 60, "position": "wagon_firing"},
      "rucnicari": {"count": 20, "position": "wagon_firing"}
    },
    "cavalry": {
      "lehka_jizda": {"count": 9, "position": "reserve", "note": "pouze průzkum"}
    },
    "wagons": {
      "bojove_vozy": {"count": 9, "formation": "semicircle"},
      "zasobovaci_vozy": {"count": 3}
    },
    "non_combatants": {
      "women_children": {"count": 100, "note": "civilisté v konvoji"}
    }
  },
  "deployment": {
    "wagon_wall": {
      "formation": "semicircle",
      "position": [[9,6], [11,10]],
      "facing": "west"
    }
  },
  "morale": 9,
  "supply": "low",
  "fatigue": "high"
}
```

### Katolíci
```json
{
  "faction": "catholics",
  "commander": {
    "name": "Bohuslav ze Švamberka",
    "rank": "hejtman landfrýdu",
    "abilities": ["cautious"],
    "position": [3, 8]
  },
  "secondary_commanders": [
    {"name": "Jindřich z Hradce", "rank": "převor johanitů", "note": "smrtelně zraněn"},
    {"name": "Mikuláš Divůček z Jemniště", "rank": "mincmistr"},
    {"name": "Petr Konopišťský ze Šternberka", "rank": "šlechtic"}
  ],
  "total_strength": 700,
  "composition": {
    "cavalry": {
      "tezka_jizda": {"count": 150, "type": "knights", "nickname": "Železní páni"},
      "lehka_jizda": {"count": 100}
    },
    "infantry": {
      "pesaci": {"count": 350},
      "johanite": {"count": 100, "note": "řádoví rytíři - většina na Rhodu"}
    }
  },
  "deployment": {
    "main_force": {
      "position": [[0,5], [5,12]],
      "formation": "column"
    }
  },
  "morale": 7,
  "supply": "adequate",
  "fatigue": "medium"
}
```

## phases
```json
{
  "phases": [
    {
      "id": 1,
      "name": "Počáteční rozestavení",
      "turn_range": [1, 2],
      "description": "Husité se opevňují na hrázi, katolíci se přibližují",
      "events": [
        {
          "trigger": "start",
          "action": "hussite_wagon_wall_formed",
          "effect": "hussites gain +3 DEF in wagon positions"
        }
      ]
    },
    {
      "id": 2,
      "name": "Čelní útok",
      "turn_range": [3, 5],
      "description": "Johanité a královské vojsko útočí po hrázi",
      "events": [
        {
          "trigger": "catholic_unit_on_dam",
          "action": "bottleneck_effect",
          "effect": "max 3 units can attack wagon wall per turn"
        }
      ]
    },
    {
      "id": 3,
      "name": "Obchvat přes bahno",
      "turn_range": [6, 8],
      "description": "Část katolíků zkouší obejít přes vypuštěný rybník",
      "events": [
        {
          "trigger": "cavalry_enters_drained_pond",
          "action": "dismount_required",
          "effect": "cavalry must dismount, -2 MOV, -2 ATK"
        },
        {
          "trigger": "infantry_in_mud",
          "action": "mud_penalty",
          "effect": "-1 MOV, heavy armor units -2 MOV"
        }
      ]
    },
    {
      "id": 4,
      "name": "Husitský protiútok",
      "turn_range": [9, 11],
      "description": "Husité využívají zmatku a útočí z vozů",
      "events": [
        {
          "trigger": "hussite_counterattack",
          "action": "sally_from_wagons",
          "effect": "hussite infantry can leave wagon wall with +1 ATK this turn"
        }
      ]
    },
    {
      "id": 5,
      "name": "Mlha a zmatek",
      "turn_range": [12, 15],
      "description": "Padá mlha, katolíci ztrácejí orientaci",
      "events": [
        {
          "trigger": "turn_12",
          "action": "fog_descends",
          "effect": "visibility reduced to 3 hexes, -2 morale for catholics"
        },
        {
          "trigger": "catholic_morale_below_4",
          "action": "rout",
          "effect": "catholic units must retreat towards map edge"
        }
      ]
    }
  ]
}
```

## victory_conditions
```json
{
  "hussite_victory": {
    "primary": "Survive until turn 15 with at least 50% forces",
    "secondary": "Destroy 50% of catholic forces",
    "decisive": "Destroy 75% of catholic forces"
  },
  "catholic_victory": {
    "primary": "Destroy hussite wagon wall and 75% of defenders",
    "secondary": "Capture Jan Žižka",
    "decisive": "Complete annihilation of hussite force"
  },
  "draw": "Neither side achieves primary objective"
}
```

---

# BITVA 2: VÍTKOV (14. července 1420)

## metadata
```json
{
  "id": "vitkov_1420",
  "name": "Bitva na Vítkově",
  "name_en": "Battle of Vítkov",
  "date": "1420-07-14",
  "type": "defensive_battle",
  "campaign": "first_crusade",
  "historical_significance": "Zlom 1. křížové výpravy, obrana Prahy",
  "winner": "hussites"
}
```

## terrain
```json
{
  "location": {
    "name": "Vítkov (Žižkov)",
    "region": "Praha",
    "coordinates": {"lat": 50.087, "lng": 14.45},
    "nearby_cities": ["Praha"]
  },
  "map_size": {
    "width": 25,
    "height": 20,
    "hex_size_meters": 30
  },
  "terrain_types": {
    "hill_top": {
      "hexes": [[12,3], [15,5]],
      "description": "Vrchol Vítkova s opevněním",
      "elevation": 3,
      "defense_bonus": 3
    },
    "fortification_srub1": {
      "hexes": [[13,4]],
      "description": "Dřevěný srub - hlavní opevnění",
      "defense_bonus": 5,
      "capacity": 30
    },
    "fortification_srub2": {
      "hexes": [[14,4]],
      "description": "Druhý dřevěný srub",
      "defense_bonus": 5,
      "capacity": 30
    },
    "vineyard_tower": {
      "hexes": [[12,5]],
      "description": "Viniční věž - pozorovatelna",
      "defense_bonus": 4,
      "sight_bonus": 3
    },
    "steep_slope_north": {
      "hexes": [[10,0], [17,3]],
      "description": "Strmý severní svah - skalnatý",
      "movement_modifier": 0.25,
      "fall_damage": true,
      "cavalry_impassable": true
    },
    "slope_south": {
      "hexes": [[10,8], [17,10]],
      "description": "Jižní svah - mírnější",
      "movement_modifier": 0.5,
      "defense_bonus": 1
    },
    "narrow_ridge": {
      "hexes": [[8,4], [12,4]],
      "description": "Úzká šíje - přístupová cesta",
      "width": 2,
      "bottleneck": true
    },
    "city_walls": {
      "hexes": [[0,15], [5,19]],
      "description": "Pražské hradby - reinforcement entry point"
    }
  },
  "weather": {
    "season": "summer",
    "conditions": "hot",
    "time": "evening (before sunset)"
  }
}
```

## forces

### Husité (obránci)
```json
{
  "faction": "hussites",
  "commander": {
    "name": "Jan Žižka z Trocnova",
    "rank": "hejtman",
    "abilities": ["defensive_expert", "fortification_master"],
    "position": [13, 4]
  },
  "total_strength": 60,
  "initial_garrison": 26,
  "reinforcements": {
    "turn": 4,
    "from": "Prague",
    "composition": {
      "strelci": 50,
      "cepnici": 34
    },
    "entry_point": [2, 17]
  },
  "composition": {
    "infantry": {
      "cepnici": {"count": 30, "position": "srub_defense"},
      "sudlicnici": {"count": 20, "position": "srub_defense"}
    },
    "ranged": {
      "kusinici": {"count": 50, "position": "srub_firing"},
      "strelci": {"count": 10, "position": "tower"}
    }
  },
  "special_units": {
    "zeny_bojovnice": {
      "count": 10,
      "note": "Ženy bojující v obraně srubů",
      "abilities": ["desperate_defense"]
    }
  },
  "morale": 10,
  "fortification_level": 3
}
```

### Křižáci (útočníci)
```json
{
  "faction": "crusaders",
  "commander": {
    "name": "Heinrich z Isenburgu",
    "rank": "míšeňský hejtman",
    "abilities": ["cavalry_charge"],
    "position": [5, 4],
    "fate": "killed_in_battle"
  },
  "secondary_commanders": [
    {"name": "Zikmund Lucemburský", "rank": "král", "position": "observer", "note": "nepřímo se účastní"},
    {"name": "Pippo Spano", "rank": "velitel", "note": "italský kondotiér"}
  ],
  "total_strength": 8000,
  "attacking_force": 2000,
  "composition": {
    "cavalry": {
      "tezka_jizda_misen": {"count": 800, "position": "main_attack"},
      "tezka_jizda_rakouska": {"count": 600, "position": "support"}
    },
    "infantry": {
      "pesaci": {"count": 600, "position": "reserve"}
    }
  },
  "diversion_forces": {
    "note": "Klamné útoky na jiných místech Prahy",
    "locations": ["Karlův most", "Vyšehrad", "Špitálské pole"]
  },
  "morale": 7,
  "fatigue": "medium"
}
```

## phases
```json
{
  "phases": [
    {
      "id": 1,
      "name": "Klamné útoky",
      "turn_range": [1, 2],
      "description": "Křižáci útočí na několika místech, odvádějí pozornost",
      "events": [
        {
          "trigger": "start",
          "action": "diversion_attacks",
          "effect": "hussite reinforcements delayed by 2 turns"
        }
      ]
    },
    {
      "id": 2,
      "name": "Útok na šíji",
      "turn_range": [3, 5],
      "description": "Míšeňská a rakouská jízda útočí po úzké šíji",
      "events": [
        {
          "trigger": "cavalry_on_narrow_ridge",
          "action": "bottleneck",
          "effect": "only 3-4 cavalry units can attack per turn"
        },
        {
          "trigger": "turn_3",
          "action": "isenburg_leads_charge",
          "effect": "+1 morale for crusaders near commander"
        }
      ]
    },
    {
      "id": 3,
      "name": "Boj o sruby",
      "turn_range": [6, 8],
      "description": "Křižáci pronikají k opevnění, krvavý boj",
      "events": [
        {
          "trigger": "crusader_reaches_fortification",
          "action": "melee_at_walls",
          "effect": "hussites gain +3 DEF from fortifications"
        },
        {
          "trigger": "isenburg_killed",
          "action": "commander_death",
          "effect": "-3 morale for all crusader units",
          "condition": "Heinrich z Isenburgu HP <= 0"
        }
      ]
    },
    {
      "id": 4,
      "name": "Příchod posil z Prahy",
      "turn_range": [9, 10],
      "description": "Pražané vyráží Horskou branou na pomoc",
      "events": [
        {
          "trigger": "turn_9",
          "action": "reinforcements_arrive",
          "effect": "50 crossbowmen + 34 flailmen enter from south"
        },
        {
          "trigger": "reinforcements_visible",
          "action": "crusader_surprise",
          "effect": "-2 morale for crusaders, must check for panic"
        }
      ]
    },
    {
      "id": 5,
      "name": "Husitský protiútok",
      "turn_range": [11, 13],
      "description": "Husité vytlačují křižáky z kopce",
      "events": [
        {
          "trigger": "hussite_counterattack",
          "action": "charge_from_fortification",
          "effect": "hussite units gain +2 ATK when leaving fortification"
        },
        {
          "trigger": "crusader_pushed_to_slope",
          "action": "fall_from_cliff",
          "effect": "units pushed to steep_slope_north take 2d6 damage"
        }
      ]
    },
    {
      "id": 6,
      "name": "Křižácký útěk",
      "turn_range": [14, 15],
      "description": "Křižáci prchají ze svahu, mnozí padají ze skal",
      "events": [
        {
          "trigger": "crusader_morale_below_3",
          "action": "mass_rout",
          "effect": "all crusader units must retreat, fall damage on steep slopes"
        }
      ]
    }
  ]
}
```

## victory_conditions
```json
{
  "hussite_victory": {
    "primary": "Hold both fortifications until turn 15",
    "secondary": "Kill Heinrich z Isenburgu",
    "decisive": "Destroy 50%+ of attacking crusaders"
  },
  "crusader_victory": {
    "primary": "Capture both fortifications",
    "secondary": "Kill or capture Jan Žižka",
    "decisive": "Destroy hussite force completely"
  },
  "special": "If crusaders hold fortification at turn 15, Prague falls"
}
```

---

# BITVA 3: ÚSTÍ NAD LABEM (16. června 1426)

## metadata
```json
{
  "id": "usti_1426",
  "name": "Bitva u Ústí nad Labem",
  "name_en": "Battle of Ústí nad Labem (Aussig)",
  "alternate_name": "Bitva na Běhání",
  "date": "1426-06-16",
  "type": "field_battle",
  "campaign": "third_crusade",
  "historical_significance": "Nejkrvavější porážka křižáků, poslední čelní útok na vozovou hradbu",
  "winner": "hussites"
}
```

## terrain
```json
{
  "location": {
    "name": "Na Běhání",
    "region": "Severní Čechy",
    "coordinates": {"lat": 50.63, "lng": 14.0},
    "nearby_cities": ["Ústí nad Labem", "Hrbovice", "Předlice", "Trmice"]
  },
  "map_size": {
    "width": 30,
    "height": 25,
    "hex_size_meters": 50
  },
  "terrain_types": {
    "hill_behani": {
      "hexes": [[12,5], [18,12]],
      "description": "Návrší Na Běhání - husitská pozice",
      "elevation": 2,
      "defense_bonus": 2
    },
    "plain": {
      "hexes": [[0,0], [30,25]],
      "description": "Otevřená rovina pod kopcem",
      "elevation": 0,
      "cavalry_bonus": 1
    },
    "stream": {
      "hexes": [[25,0], [25,25]],
      "description": "Potok tekoucí k Ústí",
      "movement_modifier": 0.75
    },
    "city_usti": {
      "hexes": [[28,10], [30,15]],
      "description": "Ústí nad Labem - obležené město",
      "fortified": true
    },
    "road_to_saxony": {
      "hexes": [[0,12], [10,12]],
      "description": "Cesta do Saska - ústupová trasa křižáků",
      "movement_bonus": 1.5
    }
  },
  "weather": {
    "season": "summer",
    "conditions": "hot",
    "heat_penalty": true,
    "note": "Parné vedro, útočníci trpí žízní"
  }
}
```

## forces

### Husité
```json
{
  "faction": "hussites",
  "commander": {
    "name": "Prokop Holý",
    "rank": "táborský správce",
    "abilities": ["inspirational_leader", "combined_arms_master"],
    "position": [15, 8],
    "note": "První velká bitva v roli vrchního velitele"
  },
  "secondary_commanders": [
    {"name": "Zikmund Korybutovič", "rank": "kandidát na trůn", "faction": "prague"},
    {"name": "Jakoubek z Vřesovic", "rank": "hejtman žatecko-lounského svazu"}
  ],
  "total_strength": 25000,
  "composition": {
    "infantry": {
      "taborite_cepnici": {"count": 4000},
      "sirotci_cepnici": {"count": 3000},
      "prazane_pesaci": {"count": 3000},
      "sudlicnici": {"count": 4000}
    },
    "ranged": {
      "kusinici": {"count": 3000},
      "rucnicari": {"count": 1500},
      "hackovnicari": {"count": 500}
    },
    "cavalry": {
      "lehka_jizda": {"count": 2000}
    },
    "artillery": {
      "houfnice": {"count": 40},
      "tarasnice": {"count": 60}
    },
    "wagons": {
      "bojove_vozy": {"count": 500, "note": "Dvojitá vozová hradba"}
    }
  },
  "deployment": {
    "wagon_wall": {
      "formation": "double_line",
      "outer_line": [[10,6], [20,6]],
      "inner_line": [[11,8], [19,8]],
      "artillery_positions": [[12,7], [18,7]]
    }
  },
  "morale": 9,
  "supply": "good"
}
```

### Křižáci
```json
{
  "faction": "crusaders",
  "commander": {
    "name": "Boso z Vitzthumu (Fictum)",
    "rank": "míšeňský hejtman",
    "abilities": ["reckless_charge"],
    "position": [5, 12]
  },
  "secondary_commanders": [
    {"name": "Bedřich I. Bojovný", "rank": "saský kurfiřt", "note": "organizátor výpravy"},
    {"name": "Kateřina Míšeňská", "rank": "vévodyně", "note": "financovala výpravu"}
  ],
  "total_strength": 30000,
  "composition": {
    "cavalry": {
      "sasky_rytiri": {"count": 3000},
      "misensky_rytiri": {"count": 2500},
      "durynsky_rytiri": {"count": 1500},
      "luzicky_rytiri": {"count": 1000}
    },
    "infantry": {
      "sasky_pesaci": {"count": 8000},
      "zemania": {"count": 4000},
      "mestske_milice": {"count": 5000}
    },
    "ranged": {
      "kusinici": {"count": 3000}
    },
    "artillery": {
      "dela": {"count": 20, "note": "méně než husité"}
    }
  },
  "deployment": {
    "main_force": {
      "position": [[0,10], [10,15]],
      "formation": "line"
    }
  },
  "morale": 6,
  "supply": "poor",
  "fatigue": "high",
  "special_conditions": ["hunger", "thirst", "heat_exhaustion"]
}
```

## phases
```json
{
  "phases": [
    {
      "id": 1,
      "name": "Křižácký útok",
      "turn_range": [1, 4],
      "description": "Němci útočí v parném vedru pěchotou",
      "events": [
        {
          "trigger": "turn_1",
          "action": "heat_penalty",
          "effect": "crusader infantry -1 ATK, -1 MOV due to heat"
        },
        {
          "trigger": "crusader_approaches_wagon_wall",
          "action": "hussite_artillery_barrage",
          "effect": "houfnice and tarasnice fire, 2d6 damage to approaching units"
        }
      ]
    },
    {
      "id": 2,
      "name": "Palba z vozů",
      "turn_range": [5, 8],
      "description": "Husitské palné zbraně decimují útočníky",
      "events": [
        {
          "trigger": "crusader_in_range",
          "action": "concentrated_fire",
          "effect": "haklovnice and rucnice fire, heavy casualties"
        },
        {
          "trigger": "crusader_casualties_30_percent",
          "action": "morale_check",
          "effect": "crusader units must pass morale check or retreat"
        }
      ]
    },
    {
      "id": 3,
      "name": "Panika a útěk",
      "turn_range": [9, 11],
      "description": "Křižáci se dávají na bezhlavý útěk",
      "events": [
        {
          "trigger": "crusader_morale_below_4",
          "action": "mass_rout",
          "effect": "all crusader units flee towards Saxon border"
        },
        {
          "trigger": "rout_begins",
          "action": "cry_beji_nemci",
          "effect": "'Běží! Němci běží!' - additional -2 morale to all crusaders"
        }
      ]
    },
    {
      "id": 4,
      "name": "Pronásledování",
      "turn_range": [12, 15],
      "description": "Husité pronásledují prchající na 15 km",
      "events": [
        {
          "trigger": "hussite_pursuit",
          "action": "no_quarter",
          "effect": "hussites take no prisoners, fleeing units destroyed on contact"
        },
        {
          "trigger": "crusader_reaches_border",
          "action": "escape",
          "effect": "unit successfully escapes"
        }
      ]
    }
  ]
}
```

## victory_conditions
```json
{
  "hussite_victory": {
    "primary": "Hold wagon wall and destroy 50% of crusaders",
    "secondary": "Destroy 75% of crusaders",
    "decisive": "Destroy 90%+ of crusaders (historically achieved)",
    "bonus": "Capture Ústí nad Labem after battle"
  },
  "crusader_victory": {
    "primary": "Break through wagon wall and relieve Ústí",
    "secondary": "Destroy hussite artillery",
    "decisive": "Defeat hussite army completely"
  },
  "historical_result": {
    "crusader_losses": 4000,
    "hussite_losses": 30,
    "note": "Nejkrvavější porážka křižáků v husitských válkách"
  }
}
```

---

# BITVA 4: DOMAŽLICE (14. srpna 1431)

## metadata
```json
{
  "id": "domazlice_1431",
  "name": "Bitva u Domažlic",
  "name_en": "Battle of Domažlice (Taus)",
  "date": "1431-08-14",
  "type": "pursuit_battle",
  "campaign": "fifth_crusade",
  "historical_significance": "Největší husitské vítězství, křižáci prchají při zaslechnutí chorálu",
  "winner": "hussites"
}
```

## terrain
```json
{
  "location": {
    "name": "Domažlice a okolí",
    "region": "Západní Čechy",
    "coordinates": {"lat": 49.44, "lng": 12.93},
    "nearby_features": ["Rýzmberk (hrad)", "Baldovské návrší", "Všerubský průsmyk"]
  },
  "map_size": {
    "width": 40,
    "height": 30,
    "hex_size_meters": 100
  },
  "terrain_types": {
    "town_domazlice": {
      "hexes": [[20,15], [25,20]],
      "description": "Město Domažlice - obležené křižáky",
      "fortified": true
    },
    "castle_ryzmberk": {
      "hexes": [[30,10]],
      "description": "Hrad Rýzmberk - dominanta",
      "elevation": 4,
      "sight_bonus": 5
    },
    "baldov_hill": {
      "hexes": [[15,12], [18,15]],
      "description": "Baldovské návrší - křižácká pozice",
      "elevation": 2
    },
    "forest_sumava": {
      "hexes": [[35,0], [40,30]],
      "description": "Šumavské hvozdy - útěková oblast",
      "movement_modifier": 0.5,
      "hiding_possible": true
    },
    "road_to_bavaria": {
      "hexes": [[38,15], [40,15]],
      "description": "Všerubský průsmyk - jediná ústupová cesta",
      "bottleneck": true,
      "capacity": 500
    },
    "roads_congested": {
      "hexes": [[30,10], [38,15]],
      "description": "Ucpané cesty - vozy, zásoby, prchající",
      "movement_modifier": 0.25
    }
  },
  "weather": {
    "season": "late_summer",
    "conditions": "clear"
  },
  "special_mechanic": {
    "panic_spread": true,
    "sound_based_morale": true
  }
}
```

## forces

### Husité
```json
{
  "faction": "hussites",
  "commander": {
    "name": "Prokop Holý",
    "rank": "vrchní hejtman",
    "abilities": ["rapid_march", "psychological_warfare", "combined_arms"],
    "position": [5, 15]
  },
  "secondary_commanders": [
    {"name": "Jan Čapek ze Sán", "rank": "sirotčí hejtman"},
    {"name": "Zikmund Korybutovič", "rank": "host"}
  ],
  "total_strength": 50000,
  "composition": {
    "infantry": {
      "taborite": {"count": 15000},
      "sirotci": {"count": 12000},
      "prazane": {"count": 8000},
      "mestske_svazy": {"count": 5000}
    },
    "cavalry": {
      "lehka_jizda": {"count": 5000}
    },
    "artillery": {
      "houfnice": {"count": 100},
      "tarasnice": {"count": 150}
    },
    "wagons": {
      "bojove_vozy": {"count": 3000}
    }
  },
  "special_abilities": {
    "rapid_march": {
      "description": "80 km za 2 dny",
      "effect": "can move 150% normal distance"
    },
    "hussite_chorale": {
      "name": "Ktož jsú boží bojovníci",
      "range": 10,
      "effect": "-3 morale to all enemies in range"
    },
    "wagon_thunder": {
      "description": "Rachot vozů",
      "range": 8,
      "effect": "-1 morale to enemies"
    }
  },
  "morale": 10
}
```

### Křižáci
```json
{
  "faction": "crusaders",
  "commander": {
    "name": "Fridrich Braniborský",
    "rank": "markrabě",
    "abilities": ["indecisive"],
    "position": [28, 12]
  },
  "secondary_commanders": [
    {
      "name": "Kardinál Giuliano Cesarini",
      "rank": "papežský legát",
      "abilities": ["diplomat"],
      "position": [30, 14],
      "special": {
        "cardinals_hat": true,
        "papal_bull": true,
        "golden_cross": true,
        "flee_on_panic": true
      }
    }
  ],
  "total_strength": 90000,
  "effective_fighting_force": 30000,
  "composition": {
    "cavalry": {
      "imperial_knights": {"count": 8000},
      "bavarian_knights": {"count": 5000},
      "italian_guard": {"count": 200, "note": "Cesariniho garda"}
    },
    "infantry": {
      "imperial_infantry": {"count": 25000},
      "militia": {"count": 15000}
    },
    "wagons": {
      "bojove_vozy": {"count": 9000, "note": "napodobení husitské taktiky"},
      "zasobovaci_vozy": {"count": "thousands"}
    },
    "artillery": {
      "dela": {"count": "stovky"}
    }
  },
  "deployment": {
    "status": "disorganized",
    "wagon_wall": {
      "incomplete": true,
      "position": [[25,10], [32,18]]
    }
  },
  "morale": 4,
  "cohesion": "poor",
  "command_structure": "chaotic"
}
```

## phases
```json
{
  "phases": [
    {
      "id": 1,
      "name": "Husitský rychlý pochod",
      "turn_range": [1, 3],
      "description": "Husité se rychle přibližují od Berouna",
      "events": [
        {
          "trigger": "start",
          "action": "crusader_reorganization",
          "effect": "crusaders attempt to form wagon wall, incomplete"
        }
      ]
    },
    {
      "id": 2,
      "name": "Zvuk blížících se husitů",
      "turn_range": [4, 5],
      "description": "Křižáci slyší rachot vozů a zpěv chorálu",
      "events": [
        {
          "trigger": "hussites_at_range_10",
          "action": "chorale_heard",
          "effect": "play 'Ktož jsú boží bojovníci', all crusaders -3 morale"
        },
        {
          "trigger": "wagon_thunder_heard",
          "action": "panic_begins",
          "effect": "crusader units must make morale check, fail = flee"
        }
      ]
    },
    {
      "id": 3,
      "name": "Křižácká panika",
      "turn_range": [6, 8],
      "description": "Vojsko se hroutí, začíná hromadný útěk",
      "events": [
        {
          "trigger": "crusader_morale_below_3",
          "action": "mass_rout",
          "effect": "90% of crusader units flee towards Bavaria"
        },
        {
          "trigger": "cesarini_flees",
          "action": "cardinal_hat_dropped",
          "effect": "Cesarini loses hat, papal bull, golden cross - capture for bonus VP"
        },
        {
          "trigger": "roads_congested",
          "action": "traffic_jam",
          "effect": "fleeing units 0.25 MOV on congested roads"
        }
      ]
    },
    {
      "id": 4,
      "name": "Boj o vozovou hradbu",
      "turn_range": [9, 12],
      "description": "Italská garda drží linii, zatímco ostatní prchají",
      "events": [
        {
          "trigger": "hussites_reach_wagon_wall",
          "action": "assault_incomplete_wall",
          "effect": "wagon wall only +1 DEF (incomplete)"
        },
        {
          "trigger": "italian_guard_fights",
          "action": "rearguard_action",
          "effect": "Italian guard delays hussites, takes heavy losses"
        }
      ]
    },
    {
      "id": 5,
      "name": "Pronásledování v lesích",
      "turn_range": [13, 20],
      "description": "Husité pronásledují prchající do šumavských hvozdů",
      "events": [
        {
          "trigger": "pursuit_into_forest",
          "action": "hunting_fugitives",
          "effect": "fleeing crusaders in forest can be captured or killed"
        },
        {
          "trigger": "vseruby_pass_blocked",
          "action": "bottleneck_massacre",
          "effect": "units trying to flee through blocked pass take casualties"
        }
      ]
    }
  ]
}
```

## victory_conditions
```json
{
  "hussite_victory": {
    "primary": "Cause crusader army to rout (achieved automatically by chorale)",
    "secondary": "Capture crusader wagon train and artillery",
    "decisive": "Capture Cardinal Cesarini's hat and papal insignia",
    "bonus_objectives": [
      "Relieve Domažlice",
      "Capture 50%+ of crusader wagons",
      "Kill/capture 5000+ crusaders"
    ]
  },
  "crusader_victory": {
    "primary": "Hold wagon wall position until nightfall",
    "secondary": "Successfully retreat 75% of army to Bavaria",
    "note": "Historically impossible given morale state"
  },
  "special_mechanics": {
    "chorale_effect": "When hussites within 10 hexes, automatic morale penalty",
    "panic_spread": "Each routing unit causes adjacent units to check morale",
    "capture_valuables": "Cardinal's hat worth 1000 VP if captured"
  }
}
```

---

# BITVA 5: LIPANY (30. května 1434)

## metadata
```json
{
  "id": "lipany_1434",
  "name": "Bitva u Lipan",
  "name_en": "Battle of Lipany",
  "date": "1434-05-30",
  "type": "civil_war_battle",
  "campaign": "hussite_civil_war",
  "historical_significance": "Konec husitských válek, porážka radikálů, smrt Prokopa Holého",
  "winner": "moderate_hussites"
}
```

## terrain
```json
{
  "location": {
    "name": "Lipany",
    "region": "Střední Čechy",
    "coordinates": {"lat": 50.0, "lng": 14.9},
    "nearby_cities": ["Český Brod", "Kouřim"]
  },
  "map_size": {
    "width": 35,
    "height": 25,
    "hex_size_meters": 75
  },
  "terrain_types": {
    "lipska_hora": {
      "hexes": [[15,5], [20,10]],
      "description": "Lipská hora - pozice radikálů (kóta 367)",
      "elevation": 3,
      "defense_bonus": 2
    },
    "village_hriby": {
      "hexes": [[8,15], [12,18]],
      "description": "Vesnice Hřiby - pozice koalice",
      "cover": 1
    },
    "village_lipany": {
      "hexes": [[25,12], [28,15]],
      "description": "Vesnice Lipany",
      "cover": 1
    },
    "plain": {
      "hexes": [[0,0], [35,25]],
      "description": "Otevřená pláň mezi pozicemi",
      "cavalry_bonus": 1
    },
    "pond": {
      "hexes": [[22,8], [24,10]],
      "description": "Rybník - krytí pravého boku radikálů",
      "impassable": true
    },
    "bylanka_stream": {
      "hexes": [[5,10], [5,20]],
      "description": "Potok Bylanka - skrytá pozice pro jízdu",
      "hidden_deployment": true
    }
  },
  "weather": {
    "season": "late_spring",
    "conditions": "clear",
    "day_of_week": "Sunday"
  }
}
```

## forces

### Radikální husité (Táboři a Sirotci)
```json
{
  "faction": "radical_hussites",
  "commander": {
    "name": "Prokop Holý",
    "rank": "táborský duchovní správce",
    "abilities": ["defensive_master", "inspirational"],
    "position": [17, 7],
    "fate": "killed_in_battle"
  },
  "secondary_commanders": [
    {"name": "Prokop Malý (Prokůpek)", "rank": "sirotčí duchovní", "fate": "killed"},
    {"name": "Ondřej Keřský", "rank": "táborský hejtman"},
    {"name": "Jan Čapek ze Sán", "rank": "sirotčí hejtman", "note": "velí jízdě, obviněn ze zrady"}
  ],
  "total_strength": 10000,
  "composition": {
    "infantry": {
      "taborite_pesaci": {"count": 4000},
      "sirotci_pesaci": {"count": 3500}
    },
    "ranged": {
      "kusinici": {"count": 1200},
      "rucnicari": {"count": 800}
    },
    "cavalry": {
      "sirotci_jizda": {"count": 700, "commander": "Jan Čapek ze Sán"}
    },
    "artillery": {
      "houfnice": {"count": 30},
      "tarasnice": {"count": 40}
    },
    "wagons": {
      "bojove_vozy": {"count": 350}
    }
  },
  "deployment": {
    "wagon_wall": {
      "formation": "rectangle",
      "position": [[14,5], [21,11]],
      "right_flank_protected_by_pond": true
    }
  },
  "morale": 7,
  "note": "Demoralizovaní po neúspěšném obléhání Plzně"
}
```

### Umírnění kališníci a katolíci (Panská jednota)
```json
{
  "faction": "moderate_coalition",
  "commander": {
    "name": "Diviš Bořek z Miletínka",
    "rank": "vrchní hejtman",
    "abilities": ["tactical_cunning", "feigned_retreat"],
    "position": [10, 16]
  },
  "secondary_commanders": [
    {"name": "Oldřich z Rožmberka", "rank": "katolický pán"},
    {"name": "Menhart z Hradce", "rank": "kališnický pán"},
    {"name": "Aleš Vřešťovský z Rýzmburka", "rank": "hejtman jízdy"}
  ],
  "total_strength": 13000,
  "composition": {
    "infantry": {
      "prazane": {"count": 3000},
      "slechticke_druziny": {"count": 4000},
      "mestske_milice": {"count": 3500}
    },
    "ranged": {
      "kusinici": {"count": 1500}
    },
    "cavalry": {
      "slechticka_jizda": {"count": 1200, "note": "klíčová jednotka"}
    },
    "artillery": {
      "houfnice": {"count": 35},
      "tarasnice": {"count": 45}
    },
    "wagons": {
      "bojove_vozy": {"count": 400}
    }
  },
  "deployment": {
    "wagon_wall": {
      "formation": "line",
      "position": [[6,14], [14,19]]
    },
    "hidden_cavalry": {
      "position": [[3,12], [5,15]],
      "hidden_behind": "bylanka_stream",
      "note": "Skrytá jednotka pro obchvat"
    }
  },
  "morale": 8,
  "special_tactic": "feigned_retreat"
}
```

## phases
```json
{
  "phases": [
    {
      "id": 1,
      "name": "Patová situace",
      "turn_range": [1, 5],
      "description": "Obě strany za vozovou hradbou, vyjednávání selhává",
      "events": [
        {
          "trigger": "start",
          "action": "standoff",
          "effect": "neither side willing to attack first"
        },
        {
          "trigger": "turn_5",
          "action": "negotiations_fail",
          "effect": "battle becomes inevitable"
        }
      ]
    },
    {
      "id": 2,
      "name": "Klamný útok koalice",
      "turn_range": [6, 8],
      "description": "Diviš Bořek vysílá pěchotu do zdánlivě zoufalého útoku",
      "events": [
        {
          "trigger": "coalition_infantry_advances",
          "action": "feigned_attack",
          "effect": "coalition infantry attacks wagon wall, appears to fail"
        },
        {
          "trigger": "coalition_infantry_retreats",
          "action": "feigned_retreat",
          "effect": "coalition infantry retreats in apparent disorder"
        }
      ]
    },
    {
      "id": 3,
      "name": "Radikálové opouštějí hradbu",
      "turn_range": [9, 11],
      "description": "Vítězstvím opojení radikálové otevírají hradbu a pronásledují",
      "events": [
        {
          "trigger": "radicals_see_retreat",
          "action": "sally_from_wagons",
          "effect": "radical infantry leaves wagon wall protection"
        },
        {
          "trigger": "wagon_wall_opened",
          "action": "gaps_in_defense",
          "effect": "radical wagon wall defense reduced by 50%"
        }
      ]
    },
    {
      "id": 4,
      "name": "Jízda udeří z boku",
      "turn_range": [12, 14],
      "description": "Skrytá šlechtická jízda udeří na odkryté boky",
      "events": [
        {
          "trigger": "radicals_overextended",
          "action": "cavalry_charge_from_flank",
          "effect": "coalition cavalry charges from Bylanka, +3 ATK from surprise"
        },
        {
          "trigger": "cavalry_reaches_wagon_gap",
          "action": "breach_wagon_wall",
          "effect": "cavalry enters radical wagon wall through gaps"
        }
      ]
    },
    {
      "id": 5,
      "name": "Zkáza radikálů",
      "turn_range": [15, 18],
      "description": "Radikálové obklíčeni uvnitř vlastní hradby, krvavá řež",
      "events": [
        {
          "trigger": "radicals_surrounded",
          "action": "massacre_in_wagons",
          "effect": "radical units in wagon wall cannot retreat, take double damage"
        },
        {
          "trigger": "prokop_holy_killed",
          "action": "leader_death",
          "effect": "Prokop Holý killed, radical morale -5"
        },
        {
          "trigger": "prokupek_killed",
          "action": "second_leader_death",
          "effect": "Prokop Malý killed, sirotci morale -3"
        }
      ]
    },
    {
      "id": 6,
      "name": "Únik a zajetí",
      "turn_range": [19, 22],
      "description": "Část radikálů prchá k Lipanům, stovky zajaty",
      "events": [
        {
          "trigger": "capek_retreats",
          "action": "sirotci_cavalry_flees",
          "effect": "Jan Čapek's cavalry retreats, doesn't help infantry"
        },
        {
          "trigger": "prisoners_taken",
          "action": "capture_radicals",
          "effect": "700+ prisoners captured"
        }
      ]
    },
    {
      "id": 7,
      "name": "Upálení zajatců",
      "turn_range": [23, 25],
      "description": "Vítězové upalují zajatce ve stodolách",
      "events": [
        {
          "trigger": "battle_ends",
          "action": "prisoner_execution",
          "effect": "700 captured radicals burned in barns (war crime)"
        }
      ]
    }
  ]
}
```

## victory_conditions
```json
{
  "coalition_victory": {
    "primary": "Destroy radical wagon wall and 50%+ of radical forces",
    "secondary": "Kill Prokop Holý and Prokop Malý",
    "decisive": "Destroy 75%+ of radical forces (historically achieved)"
  },
  "radical_victory": {
    "primary": "Hold wagon wall and destroy 50%+ of coalition forces",
    "secondary": "Kill Diviš Bořek z Miletínka",
    "decisive": "Break coalition army completely"
  },
  "historical_result": {
    "radical_losses": {
      "killed": 1300,
      "burned_prisoners": 700,
      "total": 2000
    },
    "coalition_losses": {
      "killed": 200,
      "total": "under 500"
    }
  },
  "special_mechanics": {
    "feigned_retreat": "Coalition can use feigned retreat ability once per battle",
    "wagon_wall_breach": "If cavalry enters wagon wall, defender loses DEF bonus",
    "leader_death_morale": "Death of Prokop causes massive morale penalty"
  }
}
```

---

# HERNÍ MECHANIKY - SPOLEČNÉ

## wagon_wall_mechanics
```json
{
  "formation": {
    "min_wagons": 3,
    "setup_turns": 2,
    "breakdown_turns": 1
  },
  "bonuses": {
    "defense": "+3 DEF for units inside",
    "ranged_cover": "units inside can fire without penalty",
    "cavalry_negation": "enemy cavalry cannot use charge bonus"
  },
  "vulnerabilities": {
    "open_gaps": "if gaps opened, cavalry can enter",
    "sally_risk": "units leaving lose protection immediately",
    "artillery_target": "wagons can be destroyed by artillery (5+ on d6)"
  },
  "chain_connection": {
    "bonus": "+1 DEF if wagons chained together",
    "time_to_chain": "1 turn per 5 wagons"
  }
}
```

## morale_system
```json
{
  "base_morale": {
    "hussites": 8,
    "crusaders": 6,
    "catholics": 7
  },
  "modifiers": {
    "leader_present": "+1",
    "leader_killed": "-3 to -5",
    "heavy_losses": "-1 per 25% losses",
    "wagon_wall_broken": "-2",
    "hussite_chorale": "-3 for enemies",
    "surprise_attack": "-2 for defenders"
  },
  "rout_threshold": 3,
  "rally_attempt": "commander can try once per turn, success on 4+ (d6)"
}
```

## special_abilities
```json
{
  "hussite_chorale": {
    "name": "Ktož jsú boží bojovníci",
    "range": 10,
    "effect": "-3 morale to all enemies in range",
    "usage": "automatic when hussites advance"
  },
  "feigned_retreat": {
    "name": "Předstíraný ústup",
    "prerequisite": "commander with tactical_cunning",
    "effect": "retreat triggers enemy pursuit, then counterattack with +2 ATK",
    "risk": "if enemy doesn't pursue, retreat becomes real"
  },
  "wagon_thunder": {
    "name": "Rachot vozů",
    "range": 8,
    "effect": "-1 morale to enemies, horses must check for panic",
    "automatic": true
  },
  "no_quarter": {
    "name": "Bez milosti",
    "effect": "no prisoners taken, routing enemies destroyed",
    "morale_effect": "+1 own morale, -2 enemy morale"
  }
}
```

---

# POZNÁMKY PRO IMPLEMENTACI

1. **Hexová mapa**: Doporučuji hexagonální grid pro lepší reprezentaci terénu a pohybu
2. **Mlha války**: Křižáci by měli mít omezenou viditelnost husitských pozic
3. **Morálka jako klíč**: Většina bitev se rozhodla morálkou, ne ztrátami
4. **Asymetrické cíle**: Husité obvykle brání, křižáci útočí
5. **Vozová hradba**: Centrální mechanika - její správné použití je klíč k vítězství
6. **Velitelé**: Smrt velitele má drastický dopad na morálku
7. **Terén**: Husité vždy volili výhodný terén - kopce, hráze, bažiny

## Doporučená implementace v Claude Code:
- Použij TypeScript/JavaScript pro herní logiku
- JSON konfigurace pro jednotlivé bitvy
- React nebo podobný framework pro UI
- Hexagonální knihovna (např. honeycomb-grid)
- State management pro tahy a události
