# HUSITSKÉ VÁLKY 1419-1434
## Doplňující data bitev - Živohošť, Nekmíř, Vyšehrad
## Verze 1.0 - Herní data pro tahovou strategii

---

# BITVA 1: ŽIVOHOŠŤ (4. listopadu 1419)

## metadata
```json
{
  "id": "zivohost_1419",
  "name": "Bitva u Živohoště",
  "name_en": "Battle of Živohošť",
  "date": "1419-11-04",
  "type": "field_battle",
  "campaign": "pre_crusade",
  "historical_significance": "První větší střetnutí husitských válek, ukázka nutnosti organizované obrany",
  "winner": "draw_with_hussite_survival"
}
```

## terrain
```json
{
  "location": {
    "name": "Okolí Živohoště",
    "region": "Střední Čechy (Příbramsko)",
    "coordinates": {"lat": 49.83, "lng": 14.42},
    "nearby_cities": ["Příbram", "Nový Knín", "Benešov"]
  },
  "map_size": {
    "width": 25,
    "height": 20,
    "hex_size_meters": 40
  },
  "terrain_types": {
    "hill_cervena": {
      "hexes": [[15,8], [17,12]],
      "description": "Kopec Červenka - keltské hradiště, místo improvizované obrany",
      "elevation": 2,
      "defense_bonus": 2
    },
    "stone_wall_improvised": {
      "hexes": [[16,9], [16,11]],
      "description": "Improvizovaná kamenná zeď - nasucho kladené kamení",
      "defense_bonus": 2,
      "build_time": 1,
      "note": "Lze vybudovat během bitvy"
    },
    "road_benesov": {
      "hexes": [[0,10], [10,10]],
      "description": "Benešovská silnice - hlavní přístupová cesta",
      "movement_bonus": 0.25
    },
    "forest_light": {
      "hexes": [[20,0], [24,5], [0,15], [5,19]],
      "description": "Řídký les - částečné krytí",
      "cover_bonus": 1,
      "movement_modifier": 0.75
    },
    "vltava_crossing": {
      "hexes": [[0,5], [3,5]],
      "description": "Brod přes Vltavu u Živohoště",
      "movement_modifier": 0.5,
      "note": "Husité překročili řeku před bitvou"
    },
    "open_field": {
      "hexes": [[5,5], [14,15]],
      "description": "Otevřené pole - ideální pro jízdu",
      "cavalry_charge_bonus": true
    }
  },
  "weather": {
    "season": "autumn",
    "conditions": "cold",
    "time": "afternoon"
  },
  "time_of_day": {
    "start": "14:00",
    "sunset": "16:30",
    "night_battle_possible": false
  }
}
```

## forces

### Husité
```json
{
  "faction": "hussites",
  "armies": {
    "jihocesi": {
      "description": "Jihočeští poutníci ze Sezimova Ústí",
      "total_strength": 300,
      "commanders": [
        {"name": "neznámý velitel", "note": "možná Chval z Machovic"}
      ],
      "composition": {
        "infantry": {
          "poutnicy": {"count": 250, "equipment": "light", "morale": 6},
          "ozbrojenci": {"count": 50, "equipment": "medium"}
        }
      },
      "initial_position": [[8,8], [10,12]],
      "morale": 6,
      "fatigue": "high",
      "note": "Unavení z pochodu, slabě vyzbrojení"
    },
    "zapadocesi": {
      "description": "Západočeští husité z Nového Knína",
      "total_strength": 4000,
      "commanders": [
        {"name": "Břeněk Švihovský z Rýzmburka", "rank": "velitel", "abilities": ["organizer"]},
        {"name": "Chval z Machovic", "rank": "hejtman"},
        {"name": "Kuneš z Machovic", "rank": "hejtman"},
        {"name": "Václav Koranda", "rank": "kněz-vůdce", "abilities": ["morale_boost"]}
      ],
      "composition": {
        "infantry": {
          "ozbrojenci": {"count": 1500},
          "poutnicy": {"count": 2000},
          "kusinici": {"count": 300}
        },
        "cavalry": {
          "lehka_jizda": {"count": 50}
        },
        "wagons": {
          "zasobovaci_vozy": {"count": 5, "note": "posily přijíždějí na vozech"}
        }
      },
      "reinforcement_entry": {
        "turn": 4,
        "entry_point": [[0,10], [2,12]],
        "trigger": "message_received"
      },
      "morale": 8
    }
  },
  "total_combined_strength": 4300,
  "supply": "adequate",
  "special_mechanics": {
    "improvised_fortification": {
      "description": "Husité mohou během bitvy stavět kamennou zeď",
      "time_required": 1,
      "defense_bonus": 2
    }
  }
}
```

### Katolíci
```json
{
  "faction": "catholics",
  "commander": {
    "name": "Petr Konopišťský ze Šternberka",
    "rank": "hejtman",
    "abilities": ["cavalry_commander", "aggressive"],
    "position": [5, 10]
  },
  "total_strength": 1300,
  "composition": {
    "cavalry": {
      "tezka_jizda": {"count": 400, "type": "knights", "charge_bonus": 3},
      "lehka_jizda": {"count": 200}
    },
    "infantry": {
      "pesaci": {"count": 700}
    }
  },
  "deployment": {
    "main_force": {
      "position": [[3,8], [7,12]],
      "formation": "wedge"
    }
  },
  "morale": 8,
  "supply": "good",
  "fatigue": "low",
  "objective": "Zastavit husitské poutníky směřující do Prahy"
}
```

## phases
```json
{
  "phases": [
    {
      "id": 1,
      "name": "Překvapivý útok",
      "turn_range": [1, 2],
      "description": "Šternberk útočí na unavené jihočeské poutníky",
      "events": [
        {
          "trigger": "start",
          "action": "surprise_attack",
          "effect": "jihocesi have -2 DEF first turn, cannot retreat"
        },
        {
          "trigger": "cavalry_charge",
          "action": "formation_broken",
          "effect": "jihocesi formation splits into two groups"
        }
      ]
    },
    {
      "id": 2,
      "name": "Rozpad jihočeské sestavy",
      "turn_range": [3, 4],
      "description": "Jihočeští husité se rozpadají, část se vzdává",
      "events": [
        {
          "trigger": "jihocesi_morale_below_4",
          "action": "group_split",
          "effect": "larger group (200) surrenders, 100 retreats to hill"
        },
        {
          "trigger": "survivors_reach_hill",
          "action": "improvised_defense",
          "effect": "survivors can begin building stone wall"
        }
      ]
    },
    {
      "id": 3,
      "name": "Obrana na návrší",
      "turn_range": [5, 7],
      "description": "Zbývající husité se opevňují na kopci Červenka",
      "events": [
        {
          "trigger": "jihocesi_join_zapadocesi",
          "action": "combined_defense",
          "effect": "combined force gains +2 morale"
        },
        {
          "trigger": "stone_wall_complete",
          "action": "fortification_ready",
          "effect": "defenders gain +2 DEF"
        },
        {
          "trigger": "negotiations_offered",
          "action": "surrender_demand",
          "effect": "catholics offer surrender terms, hussites can accept or refuse"
        }
      ]
    },
    {
      "id": 4,
      "name": "Příchod posil z Nového Knína",
      "turn_range": [8, 10],
      "description": "Velká skupina západočeských husitů přichází na pomoc",
      "events": [
        {
          "trigger": "turn_8",
          "action": "reinforcements_arrive",
          "effect": "4000 zapadocesi enter from west"
        },
        {
          "trigger": "numerical_superiority",
          "action": "catholic_reassessment",
          "effect": "catholics must check morale, consider retreat"
        }
      ]
    },
    {
      "id": 5,
      "name": "Ústup katolíků",
      "turn_range": [11, 12],
      "description": "Šternberk ustupuje s zajatci směrem na Kutnou Horu",
      "events": [
        {
          "trigger": "catholic_retreat_order",
          "action": "orderly_withdrawal",
          "effect": "catholics retreat with prisoners, hussites do not pursue"
        },
        {
          "trigger": "battle_ends",
          "action": "aftermath",
          "effect": "hussites bury dead, continue to Prague next day"
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
    "primary": "Survive with at least 50% of jihocesi force until reinforcements arrive",
    "secondary": "Prevent capture of more than 100 prisoners",
    "decisive": "Force catholic retreat before reinforcements"
  },
  "catholic_victory": {
    "primary": "Destroy or capture 75%+ of jihocesi before reinforcements",
    "secondary": "Capture at least 200 prisoners",
    "decisive": "Destroy both hussite armies"
  },
  "historical_result": {
    "prisoners_taken": 200,
    "jihocesi_survivors": 100,
    "catholic_losses": "unknown, probably light",
    "outcome": "catholics withdraw with prisoners, hussites continue to Prague"
  }
}
```

---

# BITVA 2: NEKMÍŘ (prosinec 1419 / leden 1420)

## metadata
```json
{
  "id": "nekmir_1419",
  "name": "Bitva u Nekmíře",
  "name_en": "Battle of Nekmíř",
  "date": "1419-12-XX",
  "date_note": "Přesné datum neznámé, prosinec 1419 nebo začátek ledna 1420",
  "type": "field_battle",
  "campaign": "pre_crusade",
  "historical_significance": "PRVNÍ DOLOŽENÉ POUŽITÍ VOZOVÉ HRADBY v husitských válkách",
  "winner": "hussites"
}
```

## terrain
```json
{
  "location": {
    "name": "Na smrtelnici",
    "region": "Západní Čechy (Plzeňsko)",
    "coordinates": {"lat": 49.85, "lng": 13.20},
    "nearby_cities": ["Plzeň", "Nekmíř", "Tatiná"],
    "note": "17 km severozápadně od Plzně"
  },
  "map_size": {
    "width": 20,
    "height": 15,
    "hex_size_meters": 40
  },
  "terrain_types": {
    "road_to_nekmir": {
      "hexes": [[0,7], [15,7]],
      "description": "Cesta z Plzně k tvrzi Nekmíř",
      "movement_bonus": 0.25
    },
    "wagon_position": {
      "hexes": [[10,6], [12,8]],
      "description": "Pozice vozové hradby - polokruh",
      "note": "Pouze 7 vozů - nedostatečné pro uzavřený kruh"
    },
    "open_field": {
      "hexes": [[5,4], [15,10]],
      "description": "Otevřené pole vhodné pro jízdní útok",
      "cavalry_charge_bonus": true
    },
    "tvrz_nekmir": {
      "hexes": [[18,7], [19,8]],
      "description": "Tvrz Nekmíř - cíl husitského výpadu",
      "fortification_level": 2,
      "garrison": 30
    },
    "light_forest": {
      "hexes": [[0,0], [4,4], [16,12], [19,14]],
      "description": "Řídký les",
      "cover_bonus": 1,
      "movement_modifier": 0.75
    },
    "frozen_ground": {
      "hexes": "all",
      "description": "Zmrzlá zimní zem",
      "movement_modifier": 0.9,
      "note": "Zima - pevný podklad"
    }
  },
  "weather": {
    "season": "winter",
    "conditions": "cold, possibly snow",
    "temperature": "below_freezing",
    "visibility": "normal"
  },
  "time_of_day": {
    "start": "10:00",
    "sunset": "16:00"
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
    "rank": "vojenský velitel Plzně",
    "abilities": ["tactical_genius", "wagon_master", "terrain_reader"],
    "position": [11, 7],
    "historical_note": "První známá bitva pod Žižkovým velením"
  },
  "total_strength": 300,
  "composition": {
    "infantry": {
      "cepnici": {"count": 100, "position": "wagon_defense"},
      "sudlicnici": {"count": 80, "position": "wagon_defense"},
      "sekernicy": {"count": 50, "position": "wagon_support"}
    },
    "ranged": {
      "kusinici": {"count": 50, "position": "wagon_firing"},
      "rucnicari": {"count": 10, "position": "wagon_firing", "note": "prvotní palné zbraně"}
    },
    "cavalry": {
      "lehka_jizda": {"count": 10, "position": "scouts"}
    },
    "wagons": {
      "bojove_vozy": {
        "count": 7,
        "formation": "semicircle",
        "note": "Nedostatek vozů - pouze polokruh",
        "equipment": ["beranidla", "dela", "prak"]
      }
    }
  },
  "deployment": {
    "wagon_wall": {
      "formation": "semicircle",
      "position": [[10,6], [12,8]],
      "facing": "west",
      "note": "Otevřená strana chráněna terénem"
    }
  },
  "morale": 9,
  "supply": "good",
  "fatigue": "low",
  "objective": "Zničit tvrz Nekmíř a okolní katolické opěrné body"
}
```

### Katolíci (Plzeňský landfrýd)
```json
{
  "faction": "catholics",
  "subfaction": "plzensky_landfrid",
  "commander": {
    "name": "Bohuslav ze Švamberka",
    "rank": "hejtman landfrýdu",
    "abilities": ["cautious", "cavalry_commander"],
    "position": [3, 7],
    "historical_note": "Nejvyšší komorník za Václava IV., člen královské rady od 1396"
  },
  "secondary_commanders": [
    {"name": "Hynek z Nekmíře", "rank": "majitel tvrze", "fate": "killed_in_battle"}
  ],
  "total_strength": 2000,
  "composition": {
    "cavalry": {
      "tezka_jizda": {
        "count": 800, 
        "type": "knights",
        "charge_bonus": 3,
        "note": "Páni landfrýdu a jejich družiny"
      },
      "lehka_jizda": {"count": 400}
    },
    "infantry": {
      "pesaci": {
        "count": 800,
        "note": "Pěchota nezasáhla do bitvy"
      }
    }
  },
  "deployment": {
    "cavalry_vanguard": {
      "position": [[2,5], [5,9]],
      "formation": "wedge"
    },
    "infantry_reserve": {
      "position": [[0,5], [2,9]],
      "formation": "column"
    }
  },
  "morale": 7,
  "supply": "adequate",
  "fatigue": "low",
  "objective": "Zničit husitský výpad, ochránit tvrz Nekmíř"
}
```

## phases
```json
{
  "phases": [
    {
      "id": 1,
      "name": "Husitský výpad z Plzně",
      "turn_range": [1, 2],
      "description": "Žižka vytahuje z Plzně směrem k Nekmíři",
      "events": [
        {
          "trigger": "start",
          "action": "hussite_advance",
          "effect": "hussites move toward Nekmíř with siege equipment"
        }
      ]
    },
    {
      "id": 2,
      "name": "Švamberk dostihuje husity",
      "turn_range": [3, 4],
      "description": "Landfrýd dostihuje husitskou kolonu",
      "events": [
        {
          "trigger": "catholic_intercept",
          "action": "forced_battle",
          "effect": "hussites must form defensive position immediately"
        },
        {
          "trigger": "wagon_formation_ordered",
          "action": "first_wagon_wall",
          "effect": "Žižka forms semicircle wagon formation - HISTORIC FIRST USE"
        }
      ]
    },
    {
      "id": 3,
      "name": "Útok jízdy na vozovou hradbu",
      "turn_range": [5, 7],
      "description": "Švamberk vrhá jízdu proti vozům",
      "events": [
        {
          "trigger": "cavalry_charge",
          "action": "charge_against_wagons",
          "effect": "cavalry charge bonus negated by wagon wall"
        },
        {
          "trigger": "cavalry_reaches_wagons",
          "action": "brutal_melee",
          "effect": "hussite defenders gain +3 DEF from wagon protection"
        },
        {
          "trigger": "hynek_killed",
          "action": "commander_death",
          "effect": "Hynek z Nekmíře killed, catholic morale -2"
        }
      ]
    },
    {
      "id": 4,
      "name": "Odražení útoku",
      "turn_range": [8, 9],
      "description": "Husité odrážejí jízdu od vozů",
      "events": [
        {
          "trigger": "cavalry_repulsed",
          "action": "retreat_from_wagons",
          "effect": "catholic cavalry must retreat, significant losses"
        },
        {
          "trigger": "infantry_hesitation",
          "action": "infantry_holds",
          "effect": "catholic infantry does not advance, awaits orders"
        }
      ]
    },
    {
      "id": 5,
      "name": "Ústup landfrýdu",
      "turn_range": [10, 12],
      "description": "Katolíci ustupují, husité pokračují k tvrzi",
      "events": [
        {
          "trigger": "catholic_retreat",
          "action": "orderly_withdrawal",
          "effect": "catholics retreat, do not pursue hussites further"
        },
        {
          "trigger": "hussites_advance",
          "action": "continue_mission",
          "effect": "hussites proceed to destroy Nekmíř and two other fortresses"
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
    "primary": "Repel catholic cavalry attack on wagon wall",
    "secondary": "Kill Hynek z Nekmíře",
    "decisive": "Destroy tvrz Nekmíř same night"
  },
  "catholic_victory": {
    "primary": "Break hussite wagon formation and destroy 50%+ of force",
    "secondary": "Capture Jan Žižka",
    "decisive": "Force hussite retreat back to Plzeň"
  },
  "historical_result": {
    "hussite_losses": "unknown, probably light",
    "catholic_losses": "significant cavalry losses",
    "notable_deaths": ["Hynek z Nekmíře"],
    "aftermath": "Hussites destroyed Nekmíř and 2 other fortresses same night",
    "strategic_impact": "First successful use of wagon wall tactic"
  }
}
```

## special_mechanics
```json
{
  "first_wagon_wall": {
    "description": "Historicky první použití vozové hradby",
    "wagons_available": 7,
    "formation_possible": "semicircle_only",
    "full_circle_requires": 12,
    "bonuses": {
      "defense": "+3 DEF for units behind wagons",
      "cavalry_negation": "enemy cavalry cannot use charge bonus",
      "ranged_cover": "ranged units can fire without penalty"
    },
    "vulnerabilities": {
      "open_flank": "semicircle has exposed rear",
      "no_chains": "wagons not yet connected by chains (later improvement)"
    }
  }
}
```

---

# BITVA 3: VYŠEHRAD (1. listopadu 1420)

## metadata
```json
{
  "id": "vysehrad_1420",
  "name": "Bitva pod Vyšehradem",
  "name_en": "Battle of Vyšehrad",
  "alternate_name": "Bitva u Vyšehradu",
  "date": "1420-11-01",
  "type": "relief_battle",
  "campaign": "first_crusade",
  "historical_significance": "Rozhodující vítězství, Praha plně v husitských rukou, ztráta Zikmundovy podpory české šlechty",
  "winner": "hussites"
}
```

## terrain
```json
{
  "location": {
    "name": "Pankrácká pláň pod Vyšehradem",
    "region": "Praha",
    "coordinates": {"lat": 50.06, "lng": 14.42},
    "nearby_cities": ["Praha"]
  },
  "map_size": {
    "width": 30,
    "height": 25,
    "hex_size_meters": 30
  },
  "terrain_types": {
    "vysehrad_fortress": {
      "hexes": [[25,5], [29,10]],
      "description": "Vyšehradská pevnost - obléhána, ale posádka kapitulovala",
      "fortification_level": 5,
      "garrison": {
        "initial": 500,
        "state": "capitulated",
        "commander": "Jan z Boskovic (Všembera)"
      }
    },
    "pankrac_plain": {
      "hexes": [[10,10], [20,20]],
      "description": "Pankrácká pláň - hlavní bojiště",
      "terrain_type": "open_field"
    },
    "hussite_trenches": {
      "hexes": [[12,12], [18,15]],
      "description": "Husitské příkopy a valy u sv. Pankráce",
      "defense_bonus": 3,
      "built_during_siege": true
    },
    "kostel_sv_pankrace": {
      "hexes": [[15,13]],
      "description": "Kostelík sv. Pankráce - centrum husitského ležení",
      "defense_bonus": 2
    },
    "podoli_slope": {
      "hexes": [[20,20], [25,24]],
      "description": "Strmý svah od Podolí - boční přístup",
      "movement_modifier": 0.4,
      "cavalry_penalty": true,
      "uphill_penalty": 2
    },
    "botič_valley": {
      "hexes": [[5,15], [10,20]],
      "description": "Údolí Botiče - pozice obléhacích strojů",
      "cover_bonus": 1
    },
    "vltava_river": {
      "hexes": [[0,0], [5,10]],
      "description": "Vltava - západní hranice bojiště",
      "passable": false
    },
    "benesov_road": {
      "hexes": [[15,24], [15,20], [15,15]],
      "description": "Benešovská silnice - směr královského útoku",
      "movement_bonus": 0.25
    },
    "kapitulni_ostrov": {
      "hexes": [[2,5], [4,8]],
      "description": "Kapitulní ostrov (Císařská louka) - husitské opevnění blokující zásobování",
      "fortification_level": 2
    }
  },
  "weather": {
    "season": "autumn",
    "conditions": "cold",
    "date": "All Saints' Day"
  },
  "time_of_day": {
    "start": "15:00",
    "sunset": "16:45",
    "battle_duration": "approximately 2 hours"
  }
}
```

## forces

### Husité (obléhatelé)
```json
{
  "faction": "hussites",
  "commander": {
    "name": "Hynek Krušina z Lichtenburka",
    "rank": "vrchní velitel",
    "age": 25,
    "abilities": ["young_commander", "decisive", "cavalry_tactics"],
    "position": [15, 14],
    "note": "Zvolen velitelem při příchodu orebitů 4. října"
  },
  "secondary_commanders": [
    {"name": "Diviš Bořek z Miletínka", "rank": "hejtman orebitů", "note": "pozdější vítěz u Lipan"},
    {"name": "Mikuláš z Husi", "rank": "hejtman táboritů"},
    {"name": "velitelé žateckých a lounských", "rank": "hejtmani"}
  ],
  "total_strength": 16000,
  "composition": {
    "prazane": {
      "count": 6000,
      "type": "mestska_hotovost",
      "units": {
        "pesaci": 4000,
        "kusinici": 1500,
        "zoldneri": 500
      },
      "position": "main_trenches"
    },
    "orebite": {
      "count": 4000,
      "type": "polni_vojsko",
      "units": {
        "cepnici": 2000,
        "sudlicnici": 1000,
        "kusinici": 800,
        "jizda": 200
      },
      "position": "reserve_pankrac"
    },
    "zatecti_a_lounsti": {
      "count": 3000,
      "type": "mestske_hotovosti",
      "position": "karlov_sector"
    },
    "taborite": {
      "count": 3000,
      "type": "polni_vojsko",
      "arrival": "15. října",
      "position": "botic_valley"
    }
  },
  "siege_equipment": {
    "praky": {"count": 2, "position": "botic_valley", "note": "poškozeny královskou palbou"},
    "velka_puska": {"count": 1, "position": "botic_valley"}
  },
  "deployment": {
    "main_position": {
      "location": "pankracka_plan",
      "formation": "defensive_trenches"
    },
    "reserves": {
      "location": "behind_sv_pankrac",
      "composition": "orebští cepníci"
    }
  },
  "morale": 9,
  "supply": "adequate",
  "fatigue": "low"
}
```

### Královské vojsko
```json
{
  "faction": "royalists",
  "commander": {
    "name": "Zikmund Lucemburský",
    "rank": "římský a uherský král, korunovaný český král",
    "abilities": ["royal_authority", "impulsive"],
    "position": [15, 22],
    "note": "Osobně přítomen, ale velí z povzdálí"
  },
  "secondary_commanders": [
    {"name": "Jindřich z Plumova", "rank": "moravský zemský hejtman", "note": "varoval před útokem"},
    {"name": "uherští velitelé", "rank": "hejtmani"},
    {"name": "němečtí velitelé", "rank": "hejtmani"}
  ],
  "total_strength": 18000,
  "composition": {
    "uhri": {
      "count": 6000,
      "type": "zoldneri",
      "units": {
        "tezka_jizda": 2000,
        "lehka_jizda": 2000,
        "pesaci": 2000
      },
      "position": "main_attack_benesov"
    },
    "nemci_a_slezane": {
      "count": 4000,
      "type": "zoldneri",
      "units": {
        "pesaci": 3000,
        "jizda": 1000
      },
      "position": "main_attack_support"
    },
    "ceska_a_moravska_slechta": {
      "count": 5000,
      "type": "feudalni_vojsko",
      "units": {
        "tezka_jizda": 1500,
        "druziny": 3500
      },
      "position": "flank_attack_podoli",
      "note": "Uraženi nařčením ze zbabělosti, museli sesednout kvůli terénu"
    },
    "vysehradska_posadka": {
      "count": 500,
      "state": "capitulated",
      "participation": "none",
      "note": "Dodrželi dohodu o kapitulaci, do bitvy nezasáhli"
    }
  },
  "deployment": {
    "main_force": {
      "position": [[10,20], [20,24]],
      "formation": "attack_columns"
    },
    "flank_force": {
      "position": [[22,22], [25,24]],
      "formation": "dismounted_advance"
    }
  },
  "morale": 6,
  "supply": "stretched",
  "fatigue": "high",
  "special_circumstances": {
    "arrival_time": "po 15:00 - hodinu po vypršení ultimáta",
    "vysehrad_support": "none - posádka již kapitulovala",
    "prazsky_hrad_diversion": "failed - posel zajat"
  }
}
```

## phases
```json
{
  "phases": [
    {
      "id": 0,
      "name": "Obléhání Vyšehradu (před bitvou)",
      "turn_range": "pre_battle",
      "description": "Od 15. září husité obléhají Vyšehrad",
      "events": [
        {
          "trigger": "siege_start_sep_15",
          "action": "encirclement",
          "effect": "Vyšehrad cut off from supplies"
        },
        {
          "trigger": "oct_28",
          "action": "capitulation_agreement",
          "effect": "Garrison agrees to surrender at 8:00 Nov 1 if not relieved"
        },
        {
          "trigger": "messenger_captured",
          "action": "intelligence_gained",
          "effect": "Hussites learn royal attack plan, can reorganize"
        }
      ]
    },
    {
      "id": 1,
      "name": "Zikmund přichází pozdě",
      "turn_range": [1, 2],
      "description": "Královské vojsko dorazí po 15:00 - hodinu po ultimátu",
      "events": [
        {
          "trigger": "start",
          "action": "late_arrival",
          "effect": "Vyšehrad posádka již kapitulovala, nemůže pomoci"
        },
        {
          "trigger": "zikmund_signals",
          "action": "futile_signal",
          "effect": "Zikmund marně mává mečem směrem k Vyšehradu"
        }
      ]
    },
    {
      "id": 2,
      "name": "Útok na pankrácká opevnění",
      "turn_range": [3, 5],
      "description": "Uhři a Němci čelně útočí na husitské příkopy",
      "events": [
        {
          "trigger": "frontal_assault",
          "action": "trench_defense",
          "effect": "hussites gain +3 DEF from prepared positions"
        },
        {
          "trigger": "hussite_artillery",
          "action": "cannon_fire",
          "effect": "velká puška zadržuje uherskou jízdu"
        }
      ]
    },
    {
      "id": 3,
      "name": "Boční útok české šlechty",
      "turn_range": [6, 8],
      "description": "Česká a moravská šlechta útočí od Podolí",
      "events": [
        {
          "trigger": "plumlov_warning",
          "action": "cowardice_accusation",
          "effect": "Jindřich z Plumova varuje, Zikmund ho obviní ze zbabělosti"
        },
        {
          "trigger": "honor_attack",
          "action": "dismounted_assault",
          "effect": "nobles must dismount due to terrain, lose cavalry advantage"
        },
        {
          "trigger": "initial_success",
          "action": "breakthrough_attempt",
          "effect": "royal forces achieve initial penetration of hussite lines"
        }
      ]
    },
    {
      "id": 4,
      "name": "Husitský protiútok",
      "turn_range": [9, 11],
      "description": "Hynek Krušina nasazuje zálohy",
      "events": [
        {
          "trigger": "reserves_committed",
          "action": "orebite_counterattack",
          "effect": "orebští cepníci deployed from reserve, +2 ATK"
        },
        {
          "trigger": "vyšehrad_clear",
          "action": "additional_forces",
          "effect": "hussite units freed from siege duty join battle"
        },
        {
          "trigger": "flanking_repulsed",
          "action": "nobles_trapped",
          "effect": "czech nobility trapped in uphill terrain"
        }
      ]
    },
    {
      "id": 5,
      "name": "Masakr české šlechty",
      "turn_range": [12, 14],
      "description": "Táboři a orebité pobíjejí ustupující šlechtu",
      "events": [
        {
          "trigger": "nobles_retreat",
          "action": "trapped_in_ravine",
          "effect": "dismounted nobles cannot escape, trapped in úvoz"
        },
        {
          "trigger": "no_quarter",
          "action": "massacre",
          "effect": "táboři a orebští cepníci nebrali zajatce"
        },
        {
          "trigger": "some_rescued",
          "action": "hussite_nobles_help",
          "effect": "some captured by hussite nobles, spared"
        }
      ]
    },
    {
      "id": 6,
      "name": "Všeobecný ústup",
      "turn_range": [15, 17],
      "description": "Zikmund dává rozkaz k ústupu",
      "events": [
        {
          "trigger": "royal_rout",
          "action": "general_retreat",
          "effect": "all royal forces retreat toward Český Brod"
        },
        {
          "trigger": "vyšehrad_surrenders",
          "action": "fortress_falls",
          "effect": "garrison leaves honorably, some join hussites"
        },
        {
          "trigger": "battle_ends",
          "action": "aftermath",
          "effect": "hussites control all of Prague"
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
    "primary": "Prevent relief of Vyšehrad, hold defensive positions",
    "secondary": "Inflict 20%+ casualties on royal forces",
    "decisive": "Capture or kill 20+ noble commanders (historically achieved)"
  },
  "royal_victory": {
    "primary": "Break through to Vyšehrad before garrison surrenders",
    "secondary": "Destroy 50%+ of hussite forces",
    "decisive": "Capture or kill hussite commanders"
  },
  "historical_result": {
    "hussite_losses": {
      "killed": 30
    },
    "royal_losses": {
      "killed": 400,
      "notable_deaths": "25 korouhevních pánů (banner lords)",
      "prisoners": "some taken by hussite nobles"
    },
    "political_consequences": {
      "description": "Ztráta důvěry české a moravské šlechty v Zikmunda",
      "moravian_defection": "mnoho moravských pánů přešlo k husitům",
      "recognition": "Zikmund neuznaný králem další téměř 20 let"
    },
    "territorial": "Praha plně v husitských rukou"
  }
}
```

## special_mechanics
```json
{
  "capitulation_agreement": {
    "description": "Unikátní gentlemanská dohoda o kapitulaci",
    "deadline": "8:00 1. listopadu 1420",
    "terms": "pokud Zikmund nedodá zásoby nebo neosvobodí posádku",
    "effect": "vyšehradská posádka do bitvy nezasáhne bez ohledu na průběh",
    "honor_maintained": "obě strany dodržely dohodu"
  },
  "late_arrival_penalty": {
    "description": "Zikmund dorazil hodinu po ultimátu",
    "effect": "garrison already committed to surrender",
    "no_vysehrad_sortie": "planned pincer movement impossible"
  },
  "terrain_trap": {
    "description": "Podolský svah - past pro těžkou jízdu",
    "effect": "cavalry must dismount",
    "retreat_blocked": "single route back through ravine",
    "massacre_potential": "trapped units suffer double damage"
  },
  "no_quarter_given": {
    "description": "Táboři a orebité nebrali zajatce",
    "effect": "routed noble units destroyed instead of captured",
    "exception": "hussite nobles could ransom prisoners"
  }
}
```

---

# HERNÍ MECHANIKY - DOPLNĚNÍ

## improvised_fortification_mechanics
```json
{
  "stone_wall_improvised": {
    "description": "Improvizovaná kamenná zeď (Živohošť)",
    "build_time": 1,
    "defense_bonus": 2,
    "requirements": {
      "terrain": "hill with stones",
      "units": "minimum 50 infantry"
    },
    "limitations": {
      "no_cavalry_protection": "doesn't stop cavalry charge as well as wagons",
      "weather_dependent": "cannot build in rain"
    }
  }
}
```

## siege_mechanics
```json
{
  "fortress_siege": {
    "starvation_timeline": {
      "week_1": "normal operations",
      "week_2": "reduced rations, -1 morale",
      "week_3": "eating horses, -2 morale",
      "week_4": "eating leather, -3 morale, garrison may negotiate",
      "week_5+": "risk of mutiny or surrender"
    },
    "relief_attempt": {
      "timing_critical": "must arrive before surrender deadline",
      "coordinated_attack": "requires communication with garrison"
    },
    "capitulation_agreement": {
      "binding": "both sides honor agreement regardless of battle outcome",
      "deadline_strict": "arrival after deadline negates support"
    }
  }
}
```

## early_hussite_warfare
```json
{
  "pre_wagon_tactics": {
    "description": "Taktiky před plným rozvojem vozové hradby",
    "zivohost_1419": {
      "defense": "improvised stone walls",
      "weakness": "no cavalry protection",
      "outcome": "partial success"
    },
    "nekmir_1419": {
      "defense": "first wagon wall - semicircle",
      "wagons": 7,
      "limitation": "not enough for full circle",
      "innovation": "proves concept works"
    },
    "evolution": "experiences led to standardized wagon wall tactics"
  }
}
```

---

# POZNÁMKY PRO IMPLEMENTACI

1. **Živohošť** - Asymetrická bitva s příchodem posil, důraz na timing a přežití
2. **Nekmíř** - Historicky zásadní pro vozovou hradbu, menší měřítko ale takticky zajímavá
3. **Vyšehrad** - Komplexní bitva s více fázemi, mechanika kapitulační dohody

## Doporučení pro herní balancing:
- Živohošť: Husité musí vydržet do příchodu posil, katolíci mají časový tlak
- Nekmíř: Kvalita vs kvantita, test vozové hradby v malém měřítku
- Vyšehrad: Komplexní, mnoho jednotek, důraz na terén a timing

## Historické poznámky:
- Všechny tři bitvy se odehrály v prvních dvou letech husitských válek (1419-1420)
- Ukazují vývoj husitské taktiky od improvizace k vozové hradbě
- Vyšehrad představuje vrchol úspěchu první fáze husitské revoluce
