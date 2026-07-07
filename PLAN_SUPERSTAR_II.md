# PLAN SUPERSTAR II — hloubka hratelnosti

Companion k `BRIEF_SUPERSTAR.md`. Osm plánů, každý konkrétní až na úroveň souborů a funkcí, aby to mohl realizovat i levnější model. Optikou veterána ze školy Sida Meiera.

## Ústřední teze

**„Hra je série zajímavých rozhodnutí."** Dnešní vozová hradba je tak silná v obraně, že optimální strategie většiny bitev kolabuje do *sepni–čekej–vyhraj* (naměřeno: turtle politika vyhrává Sudoměř, sepnout/nesepnout se utopí v šumu kostek). Nedobytná pevnost = nepřítel rozhodnutí. Historická genialita husitů byla **pohyblivá** hradba (pochodový šik, výpad). Cíl celého balíčku: **udělat z hradby sloveso, ne místo, a dát jí protihráče, který nutí reagovat.**

## Architektura — ověřená fakta (NE po paměti, zmapováno ve zdroji 2026-07-07)

- **AI je celá v `js/ai.js`** (jeden globální objekt `AI`, ~706 řádků). Žádné `AISystem.js`. Hraje jen `crusaders`. Rozhoduje **greedy, per-unit, bez lookaheadu a bez koordinace**. `game.js` jen orchestruje tah (`runAI` 2072, `AI.takeTurn` ai.js:54).
- **AI nemá žádné škálování obtížnosti.** `gameSettings.difficultyLevel` (beginner/advanced) přepíná **jen fog of war** (main.js:480-484), logiku AI se nedotýká. `scenario.difficulty` je jen hvězdičky v UI.
- **Vítězství/prohra řeší `js/systems/VictoryConditionsSystem.js` (VCS)**, ne game.js. Bohatá sada primárních typů už existuje: `survive`, `destroy_percent`, `hold_position`, `escape`, `survive_turns`, `capture_position`, `dual_objective`, `destroy_or_rout`. Dvě MRTVÉ větve ve switchi: `dual_objective_battle` (VCS:405), `tutorial_complete` (VCS:438) — volné k recyklaci.
- **Většina `specialMechanics` je jen flavor — kód je NEČTE.** Reálně čtených 7: `startingMorale`, `frozenRiver`, `bridgeBottleneck`, `pursuit`, `noQuarterGiven`, `noWater`, `noFogOfWar`. **Nečtené (jen texty do briefingu): `firstWagonWall`, `nightBreakout`, `mobileFirearms`, `terrainTrap`, `betrayal`, `lastStand`, `flanking`, `weakCommander`, `capitulationAgreement`, `lateArrival`, `escapeTarget`, `dualObjective`.** (Pozor: `nightBreakout` má dnes nulový efekt, ač byl v poznámkách veden jako mechanika.)
- **Reálná bojová matematika je inlinovaná v `Unit.attackTarget` (Unit.js:192-453) a NENÍ pure** — mutuje `target.health`. Existuje `CombatSystem.calculateDamagePreview` (CombatSystem.js:270-356) napojený na hover tooltip („⚔️ Odhad poškození", game.js:1254-1266), ale je to **divergentní zjednodušená kopie**, které chybí ~15 modifikátorů a **nemá protiútok**. Náhoda vstupuje na **dvou místech** neseedovaným `Math.random()` (Unit.js:349 hlavní ±20 %, Unit.js:464 protiútok ±20 %).
- **Zavřený vůz nemůže jet** (`Unit.canMove` Unit.js:637: `if (isWagon && formationClosed) return false`). Přepnutí formace (`toggleWagonFormation` game.js:3285, `toggleWagonFormationLine` game.js:3298) nastaví `hasMoved=true` → **stojí celý tah** (i otevření). **Mobilní/pochodová formace neexistuje.**
- **Fog = sjednocení vidění VŠECH hussitských jednotek** (`FogOfWarSystem.updateVisibility` FoW:28). Velitel má generický dohled 4, fog na něj **není navázaný**.
- **Kampaň = `js/data/campaign.js`** (`Campaign.acts`). **Živohošť je PRVNÍ** v Aktu I (survive 40 % / 5 kol, difficulty 3). Žádný engine progrese — tlačítko „Další mise" (main.js:1313) jen načte lineárně `index+1` ze `Scenarios`. `unlockCondition`/`battlesRequired` v campaign.js jsou **mrtvá data** (nikdy nečtená).
- **Nulový carryover mezi bitvami.** Jednotky se pokaždé vytvoří nanovo z dat scénáře (`createScenarioUnits` scenarios.js:3483). localStorage klíče: `husitskeValky_save` (jeden mid-battle snapshot), `husitskeValky_settings`, `gameLanguage`, `hussiteChronicle` (data-only záznamy bitev). Žádná kampaňová progrese se neukládá.

## Doporučené pořadí (podle páky × ceny)

| # | Plán | Bucket | Rozsah | Proč tady |
|---|------|--------|--------|-----------|
| P3 | Náhled šancí před útokem | Přidat | **S** | Nejlevnější, opravuje rozbitou existující věc, okamžitý pocit férovosti |
| P4 | Mobilní vozová hradba | Přidat | **M** | Jádro teze — hradba jako sloveso |
| P5 | Cíle, co tě vyženou z hradby | Přidat | **S–M** | Primitiva už existují; páruje s P4 |
| P1 | Reaktivní / nebezpečná AI | Předělat | **M** (etapovitě) | Největší páka; začni levnými zásahy do ai.js |
| P2 | První hodina / Živohošť | Předělat | **S–M** | Většinou data + pořadí; oprav náběh obtížnosti |
| P6 | Přetrvávající družina | Přidat | **M** | Pojivo kampaně, „ještě jedna bitva" |
| P7 | Slepý Žižka | Dodělat | **M–L** | Vlajková fantazie; potřebuje přepis fogu |
| P8 | Kronika protistrany | Dodělat | **M** | Obsahově těžké; „dějiny píší vítězové" |

**Kdybys dělal jen jedno:** P4+P5 dohromady (mobilní hradba + cíl, co tě z ní vyžene). To jediné promění vyřešenou hádanku v rozhodnutí. P3 udělej jako rychlou rozehřívačku napřed.

Tuning-pravidlo (Sid): až budeš ladit čísla, **zdvojnásob, nebo rozpul** — ne kosmetika o 2 %. A **nelaď balanc proti hloupé AI** (P1 dělej dřív než finální čísla).

---

# PŘEDĚLAT

## P1 — Reaktivní, nebezpečná AI

**Cíl:** AI, která tě nutí reagovat (koordinuje se, kryje, nekrmí se do hradby), ne pytel na boxování. Nemusí být chytrá, musí být nebezpečná.

**Sid princip:** Soupeř je půlka hry. Když AI jen šlape do hradby, hráč nemá protihráče. Zároveň: veškerý dosavadní balanc je měřený proti téhle hlouposti.

**Dnešní stav (ai.js):** `decideAction` (147) — priorita: scripted stance → pursuit → commander self-preserve → charge → attack in range → move to nearest → defend. `findBestMove` (470) míří greedy na **jednoho nejbližšího** nepřítele, ignoruje morálku, ostatní nepřátele i vlastní ohrožení. `findBestAttackTarget` (381) preferuje zraněné (+ synergie schopností), s malusem −10/přilehlý vůz (445). Regulérní jednotky **nikdy neustupují** (jen velitelé, pursuit, scripted). Fokus-fire jen emergentně přes „prefer wounded".

**Mechanika — etapovitě (od levného k drahému):**

**Etapa A (levné, cílené zásahy do ai.js):**
1. **Kiting střelců** — v `findBestMove` (470) pro `isRanged()` jednotky: preferuj tah, který drží nepřítele na *kraji* dostřelu a couvá, pokud je nepřítel adjacentní. Dnes střelci greedy nabíhají.
2. **Pud sebezáchovy regulérních jednotek** — přidej do `decideAction` větev: jednotka pod prahem HP nebo `isWavering/isRouting` zvaž `findSafeMove` (existuje, 190) místo útoku. Práh = knob obtížnosti.
3. **Explicitní fokus-fire** — pre-pass v `takeTurn` (54): sestav pořadí hráčových jednotek podle „kill value / počet AI jednotek, co na ně dosáhnou" a předej jako bias do `findBestAttackTarget`. Cíl: soustředit palbu na jedno místo linie a probourat díru.
4. **Nekrm hradbu** — dnes je malus jen na útočný cíl. Přidej i do skórování POHYBU (`findBestMove`): penalizuj tah, který skončí adjacentně k zavřené linii vozů, pokud to není kvůli útoku; a bonus za tah k **okraji/mezeře** linie (sondování křídla).

**Etapa B (větší):**
5. **Knob obtížnosti AI** — dnes žádný. Zaveď `gameSettings.aiDifficulty` (nebo rozšiř `difficultyLevel`), který škáluje: práh ústupu, míru koordinace (kolik jednotek smí fokusit jeden cíl), agresivitu vůči hradbě, náhodnost. Napojit na existující nastavení (main.js).
6. **Hrubá koordinace tahu** — místo per-unit greedy: jednoduchý plán tahu na začátku `takeTurn` (soustředit N jednotek na nejslabší úsek, zbytek fixovat). Ne full AI, jen „úderná pěst".

**Doplňkově — oprava:** `aiStance` se neserializuje (save/load uprostřed lure vrátí stance na default). Přidat do `saveGame`/`loadGame` (game.js).

**Soubory:** `js/ai.js` (jádro), `js/ui/main.js` (knob), `js/core/game.js` (serializace aiStance).

**Rozsah:** M (etapa A ~S, etapa B ~M). Doporučení: etapa A hned a samostatně měřitelná; B po P4/P5.

**DoD:** (1) střelci kitují — v testu neběží do meele; (2) rozbitá/nízká jednotka ustoupí, ne sebevražda; (3) demonstrovatelný fokus-fire na jeden úsek; (4) knob obtížnosti mění chování měřitelně; (5) re-měřený balanc Aktu I proti nové AI (sim harness).

**Rizika:** kiting + fog může zacyklit (přidej strop kroků / fallback na defend). Fokus-fire nesmí ignorovat charge synergie. Nepřehnat agresivitu — pak hradba přestane fungovat i historicky správně.

---

## P2 — První hodina / Živohošť (náběh obtížnosti)

**Cíl:** Úvod, který **učí a chytí**, ne trestá. Dnes je nejtěžší bitva první.

**Sid princip:** Prvních 15 minut je celá hra. Otvírák má dát fantazii a jednu čistou lekci, ne test všech mechanik naráz.

**Dnešní stav:** Živohošť = 1. scénář Aktu I, `survive` 40 % jednotek / 5 kol, difficulty 3 — obranná dřina jako otvírák. Žádný auto-progression engine (Další mise = lineární `index+1`). Existuje poznámka [[zivohost-kryty-unik]]: Živohošť učí **krytý únik**.

**Mechanika:**
1. **Přerámovat Živohošť na `escape`** (typ existuje, VCS:315; escapeZone/unitsRequired) — místo „přežij masakr" → „stáhni se v pořádku pod palbou". Historicky pravdivější a učí ústup-pod-palbou jako první dovednost. Sníží frustraci, dá jasnou lekci.
2. **Nekmíř (dnes 2.) = první čistá výhra s hradbou** — confidence builder: postav hradbu, odraz jezdce, vyhraj. Tady se poprvé odměňuje sepnutí.
3. **Monotónní náběh Aktu I** — přeměřit sim harnessem, aby obtížnost rostla plynule (Živohošť/escape → Nekmíř/hradba → Sudoměř/terén → Vítkov → Vyšehrad). Reorder = úprava pořadí v `Scenarios` / `Campaign.acts`.
4. **Pedagogická linka** (viz [[pedagogicka-linka-kampane]]): každá raná bitva zavede právě jednu mechaniku; párovat Živohošť↔Vladař↔Kutná Hora jako „escape linku".

**Soubory:** `js/data/scenarios.js` (Živohošť victoryConditions, pořadí), `js/data/campaign.js` (pořadí Aktu I), locale `cs.json`/`en.json` (nové briefing/debriefing texty — per-index lokalizace, bumpni `?v=`).

**Rozsah:** S–M (převážně data + texty + přeměření; kód minimálně).

**DoD:** (1) Živohošť je escape s nižší frustrací, ověřeno hraním; (2) Nekmíř dává první „aha, hradba funguje" výhru; (3) sim ukáže rostoucí, ne pilovitou obtížnost Aktu I; (4) lokalizace CS i EN sedí.

**Rizika:** Přerámování Živohošti změní kánon — držet historickou poctivost v textech (byl to reálně těžký střet). Reorder nesmí rozbít odkazy „Další mise".

---

# PŘIDAT

## P3 — Náhled šancí před útokem

**Cíl:** Před kliknutím ukázat předpokládané poškození (rozsah), zda to zabije, a předpokládaný **protiútok** na mě. Perceived fairness.

**Sid princip:** Hráč si pamatuje prohraný souboj na 90 % a cítí se podvedený. Ukázat šance předem je největší levný skok v pocitu spravedlnosti.

**Dnešní stav:** `calculateDamagePreview` (CombatSystem.js:270-356) je **rozbitá slepá kopie** reálné matematiky — chybí jí ~15 modifikátorů (velitelský bonus, fear, chorál, formace, night/terén, wavering, sally, wagenburg, shieldWall, surround, bodyguard, armorPiercing-obrana…) a **nemá protiútok**. Reálná matematika je inlinovaná a mutující v `Unit.attackTarget` (192-453). Náhoda = 2× `Math.random()` ±20 % (Unit.js:349, 464), neseedovaná → preview může ukázat jen **rozsah** (dosaď meze ×0.8 a ×1.2).

**Mechanika:**
1. **Vytáhni pure jádro z `attackTarget`** do `computeAttackOutcome(attacker, defender, terrains, hasMoved, gameContext, randomFactor)` → vrací `{damage, counterDamage, willKill, counterWillKill}` **bez mutace stavu**. `attackTarget` pak volá jádro s `Math.random`-faktorem a teprve pak aplikuje `-= damage`; preview volá jádro s mezemi 0.8 a 1.2.
2. **Zahoď `calculateDamagePreview`** a napoj obě volání (reálný útok i preview) na jedno jádro — konec dvou divergentních vzorců.
3. **UI** — do existujícího tooltipu (game.js:1254-1266, „⚔️ Odhad poškození") vykresli: rozsah poškození, „zabije/nezabije", rozsah protiútoku, „padneš/přežiješ". `gameContext` builder (CombatSystem.js:99-143) je non-mutating — použij ho i pro preview.

**Soubory:** `js/entities/Unit.js` (extrakce jádra), `js/systems/CombatSystem.js` (smazat starý preview, sdílet jádro), `js/core/game.js` (tooltip).

**Rozsah:** S–M (extrakce je hlavní práce, UI hook existuje).

**DoD:** (1) tooltip ukazuje rozsah poškození + protiútok + kill flagy; (2) čísla v preview odpovídají reálnému výsledku (v rámci ±20 % rozsahu) — ověřit na 5 soubojích; (3) jen jeden vzorec v kódu (žádná divergentní kopie).

**Rizika:** Extrakce nesmí změnit chování reálného útoku (regresní test: stejný seed-faktor → stejné číslo jako dřív). Pozor na side-efekty v attackTarget (dismount, terror, chargeBonus) — ty zůstávají v mutující obálce, ne v jádře.

---

## P4 — Mobilní vozová hradba (pochodový šik)

**Cíl:** Hradba jako sloveso. Postup pod palbou jako pohyblivá stěna — historická signatura husitů.

**Sid princip:** Dej hráči cool hračku, kterou vede. Zároveň mobilní hradba **nutí k pohybu** → sama rozbíjí turtle.

**Dnešní stav:** Vůz je binární — `open` (jezdí, žádný bonus) / `closed` (stěna, stojí). `canMove` (Unit.js:637) tvrdě blokuje zavřený vůz. Přepnutí stojí celý tah (`toggleWagonFormation` game.js:3285 nastaví `hasMoved=true`). Pochodová formace neexistuje.

**Mechanika:**
1. **Třetí stav formace** — `formationMode: 'open' | 'closed' | 'marching'` (nahradí boolean `formationClosed`; serializovat). Marching = **jede jako skupina** za sníženou rychlost (např. 1 hex/tah) a drží **poloviční** wagenburg kryt.
2. **Revize `canMove`** (Unit.js:637): marching vůz smí jet (dnes `formationClosed` blokuje vše).
3. **Skupinový pohyb** — rozšiř BFS z `toggleWagonFormationLine` (game.js:3298) na `moveWagonLine(direction)`: posuň celý řetěz o hex daným směrem, spotřebuj pohyb každého vozu, zachovej linii (pěchota v závěsu se ideálně veze/drží krok — viz níže).
4. **Krytí za pohybu** — wagenburg výpočet (`isInWagonLine` game.js:3251, ×(1−x) v CombatSystem) vrací pro marching poloviční hodnotu. Dřevcová pěchota adjacentní k pohybující se hradbě drží část bonusu (historicky bojovali *z vozu*).
5. **Render** — `drawWagonChains` (hex.js): pochodová linie čárkovaně/jinak než pevná.

**Soubory:** `js/entities/Unit.js` (formationMode, canMove, serialize/deserialize), `js/core/game.js` (moveWagonLine, wagenburg kryt, toggly), `js/core/hex.js` (render), `js/systems/CombatSystem.js` (poloviční kryt marching). Validátor `validate_scenarios.js` (formation pole).

**Rozsah:** M (pohyb + kryt + render + save/load).

**DoD:** (1) hráč umí přepnout linii do marching a posunout ji o hex jako celek; (2) marching drží poloviční kryt, ne plný; (3) save/load zachová formationMode; (4) vizuálně rozlišené; (5) demo scénář, kde musíš dojet hradbou k cíli (párování s P5).

**Rizika:** Skupinový pohyb + kolize/terén (co když hex obsazený) — potřebuje jasná pravidla a fallback (kdo nemůže, zůstane a linie se „natrhne"). Balanc: marching kryt nesmí být tak silný, aby vznikl nezastavitelný tank — proto poloviční + snížená rychlost. Zpětná kompatibilita saveů (boolean → enum).

---

## P5 — Cíle, které tě vyženou z hradby

**Cíl:** Aby „sedni a čekej" byla špatná volba. Variabilita vítězných cest = variabilita rozhodnutí.

**Sid princip:** Napětí musí přijít z něčeho, co tě nutí ven. Zajímavé rozhodnutí = žádná dominantní strategie.

**Dnešní stav:** Primitiva EXISTUJÍ (VCS): `escape`, `capture_position`, `hold_position` (dopředný hex), `dual_objective`, `destroy_or_rout`, tracking přes `objectiveHeldTurns`. Ale `destroy_percent`/`survive` **odměňují turtle**. Jen Kutná Hora je dnes reálné „musíš pryč". Dvě mrtvé větve switche k recyklaci (VCS:405, 438).

**Mechanika (většina = design scénářů + pár nových tlaků, ne engine):**
1. **Časový tlak / deadline-loss** — nový povinný cíl: „obsaď dopředný hex do kola N, jinak prohra". Dnes je capture jen win-only (`checkMidGameVictory` VCS:460). Přidej deadline-loss cestu (pole `deadline` + kontrola v `checkScenarioVictoryConditions`).
2. **Postupující cíl** — vítězný hex daleko od startu → musíš přinést (nově mobilní, P4) hradbu dopředu. Přímá synergie s P4.
3. **Hrozba, co proláme hradbu** — nepřítel přivede bombardu/prak, který od kola N boří tvou linii, pokud ho nezničíš výpadem. Nutí sally. (Napojit na reálně čtený mechanismus, ne flavor.)
4. **Implementuj 1–2 dnes-flavor mechaniky jako forcing** — např. `nightBreakout` (musíš se probít ven do svítání/kola N; páruje s P2 escape a P7 slepým Žižkou) nebo `mobileFirearms` (bonus jen za pohybu — odměna za P4). Dnes mají nulový efekt.
5. **Recykluj mrtvé větve** `dual_objective_battle`/`tutorial_complete`.
6. **Retrofit pár turtle scénářů** sekundárním dopředným cílem.

**Soubory:** `js/systems/VictoryConditionsSystem.js` (deadline-loss, nové/oživené větve), `js/data/scenarios.js` (nové cíle do scénářů), `js/core/game.js` (napojení mechanik z flavor na runtime), locale texty. Validátor.

**Rozsah:** S–M (engine hooky malé; těžiště je návrh scénářů).

**DoD:** (1) aspoň 2 scénáře, kde turtle prohrává (deadline/postupující cíl); (2) deadline-loss cesta funguje a je čitelně komunikovaná hráči; (3) aspoň 1 dřívější flavor-mechanika má reálný runtime efekt; (4) sim: turtle politika už tyhle scénáře nevyhrává.

**Rizika:** Nepřehnat tlak (frustrace). Cíl musí být jasně komunikovaný v UI, jinak hráč neví, proč prohrál — párovat s čitelným debriefingem (`gameOverReason` už existuje, VCS `outcome()`).

---

## P6 — Přetrvávající družina (pojivo kampaně)

**Cíl:** Jádro vojska, které přežívá mezi bitvami, získá jména a vazbu. Prohra pak něco stojí.

**Sid princip (Pirates!):** Pojivo mezi misemi je, kde žije „ještě jedna bitva". Attachment k vlastním jednotkám.

**Dnešní stav:** Nulový carryover — jednotky nanovo z dat scénáře pokaždé (`createScenarioUnits` scenarios.js:3483). Žádná kampaňová progrese se neukládá; `unlockCondition`/`battlesRequired` (campaign.js) jsou mrtvá data. Chronicle už ukládá data-only záznamy bitev (`hussiteChronicle`).

**Mechanika:**
1. **Nový localStorage klíč `husitskeValky_campaign`** — `{ completedBattles: [...], retinue: [{ unitType, name, battlesSurvived, scars }] }`.
2. **Po výhře** (`showVictory` game.js:1975) ulož přeživší jednotky označené jako `coreSlot` (tag ve scénáři). Zranění se do další bitvy zahojí (nebo částečně — designové rozhodnutí).
3. **Na startu scénáře** (`createScenarioUnits` scenarios.js:3483) pro opt-in scénáře nahraď/doplň `coreSlot` sloty perzistovanou družinou (match podle tagu).
4. **Pojmenování po 3 přežitých bitvách** → korouhev dostane jméno, feed do ChronicleSystem (record už bere per-battle data). Viz „menší sourozenci" v [[kronika-protistrany]].
5. **Oživ kampaňovou progresi** — konečně čti `unlockCondition`/`battlesRequired` (`Campaign.isBattleAvailable` campaign.js:90 dnes vždy true) a persistuj `completedBattles`. Tím se z lineárního výběru stane kampaň.

**Soubory:** nový modul `js/systems/CampaignProgress.js` (nebo rozšíř ChronicleSystem), `js/core/game.js` (save po výhře, load na startu), `js/data/scenarios.js` (`coreSlot` tagy, opt-in), `js/data/campaign.js` (číst unlock), `js/ui/main.js` (zobrazit zámky/postup, jména družiny).

**Rozsah:** M.

**DoD:** (1) přeživší core jednotka se objeví v další bitvě se svým jménem; (2) po 3 bitvách dostane jméno a kronika ji zmíní; (3) kampaň zamyká/odemyká podle postupu; (4) save/load robustní (neztratí družinu, neduplikuje).

**Rizika:** **Snowball** — perzistentní veteráni můžou rozbít balanc; strop (max družina, cap bonusů, smrt je definitivní). Interakce s mid-battle savem (`husitskeValky_save`) — dva různé klíče, nesmí se poplést. Zpětná kompatibilita (chybějící klíč = prázdná družina).

---

# DODĚLAT

## P7 — Slepý Žižka (velení přes hlášení)

**Cíl:** Veď slepého generála, který nikdy neprohrál. Nevidíš všechno — velíš přes zvědy a hlášení.

**Sid princip:** Veď fantazii. Být Žižka je ten hook, kvůli kterému si to lidi pustí. (WP3 z `BRIEF_SUPERSTAR.md` — sladit se stávající specifikací.)

**Dnešní stav:** Fog = sjednocení vidění VŠECH hussitských jednotek (`updateVisibility` FoW:28). Velitel má generický dohled 4, fog na něj není navázaný. Fog aktivní jen na `difficultyLevel==='advanced'`.

**Mechanika:**
1. **Flag `blindCommander`** (scénář/režim).
2. **Přepiš `updateVisibility`** (FoW:28): při `blindCommander` přispívají do dohledu **jen velitel a zvědi/poslové**; ostatní jednotky odhalují jen malý okruh (bijí, co je adjacentní, ale hráč nedostane jejich plný dohled). Modeluje Žižkovu závislost na zvědech.
3. **Velitelský „bojový smysl"** — velitel dostane zvláštní větší dohled (reprezentuje jeho čtení bitvy sluchem/hlášením).
4. **(Volitelně) zpožděná hlášení** — nepřátelské pozice mimo dohled velitele/zvěda se ukazují o 1 kolo zastarale (report layer). Silný flavor, větší práce.

**Soubory:** `js/systems/FogOfWarSystem.js` (jádro přepisu), `js/core/game.js` (flag, případně stale-info vrstva), `js/data/scenarios.js` (opt-in scénáře), `js/ui/main.js` (indikace režimu). Sladit s WP3 v `BRIEF_SUPERSTAR.md`.

**Rozsah:** M–L (přepis fogu; report-layer navíc L).

**DoD:** (1) v režimu vidíš jen okolo velitele a zvědů; (2) zvěd (`ZVED`) má reálně smysl (rozšiřuje zrak); (3) ztráta velitele = oslepnutí (napětí); (4) čitelně komunikováno, proč nevidíš.

**Rizika:** Frustrace ze slepoty — musí být fér (zvědi jako řešení, ne trest). Interakce s existující `isEnemyVisible` logikou (hiddenMovement, scout reveal, FoW:161-199) — nerozbít. Report-layer je velký; udělat až jako druhá iterace.

---

## P8 — Kronika protistrany

**Cíl:** Druhý, nepřátelský zápis ke každé bitvě. Při prohře se JEJICH verze stane kanonickou. „Dějiny píší vítězové" doslova a mechanicky.

**Sid princip:** Meta-sázka — prohra není jen reload, má narativní následek. (Plný koncept: [[kronika-protistrany]].)

**Dnešní stav:** ChronicleSystem ukládá data-only záznamy; `generateText()` generuje JEDEN (husitský) hlas, který lže; `truthText()` ukáže realitu. `factionNames` (WP5) existují. Prameny nepřátelského hlasu už inventarizované v [[kronika-protistrany]] (Piccolomini / němečtí kronikáři / Ebendorfer / křižácká proklamace).

**Mechanika:**
1. **Druhá sada i18n šablon** — nepřátelský hlas (4 registry z memory). Identitu kronikáři dá `factionNames` (saský, panská jednota…).
2. **`generateText(perspective)`** — parametr `'hussite' | 'enemy'`; při **prohře** je kanonická perspektiva `enemy`, tvoje jen pod přepínačem.
3. **Přepínač perspektivy** v chronicle modalu (`showChronicle` main.js:~1040).
4. **Pramenná kritika jako payoff** — porovnej dvě lži + pravdu (`truthText`). Školní úloha „porovnej dva prameny" vygenerovaná z hráčovy vlastní bitvy. Bonus: nepřátelský zápis může obsahovat dobovou chybu, kterou hráč odhalí (Piccolomini připsal Ústí mrtvému Žižkovi — už je v trivia).

**Soubory:** `js/systems/ChronicleSystem.js` (perspective param, enemy canonical při prohře), locale `cs.json`/`en.json` (enemy šablony), `js/ui/main.js` (přepínač v modalu). `factionNames` už v scenarios.js.

**Rozsah:** M (těžiště = obsah/šablony; engine je param + přepínač).

**DoD:** (1) každá bitva má dva hlasy; (2) po prohře je kanonický nepřátelský; (3) přepínač funguje; (4) aspoň jeden „odhalitelný omyl" v nepřátelském textu; (5) CS i EN šablony.

**Rizika:** Obsahová náročnost (kvalitní dobové hlasy pro každou bitvu). Držet styl (Piccolomini ≠ křižácká proklamace). Neudělat z toho jen „stejný text negativně".

---

## Poznámky k realizaci

- Po editaci locale bumpni `?v=` v index.html i v i18n fetchi (jinak stale JSON). Viz [[lokalizace-scenaru-per-index]].
- Nové event/objective/formation pole přidej i do `validate_scenarios.js` (whitelist).
- Každý plán měř: `node --check` na dotčené JS, pak runtime ověření v preview (port 8013), u balancu sim harness (async IIFE → `window.__simState`).
- Commit trailer: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
