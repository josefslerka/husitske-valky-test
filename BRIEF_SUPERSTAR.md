# BRIEF: „Superstar" balíček — implementační zadání

**Pro:** Claude Opus 4.8 (nebo jiný model pokračující v projektu)
**Od:** Fable 5, session 1. 7. 2026, zadal Josef Šlerka
**Cíl:** Sada vylepšení, která z hry udělají něco, co nikdo jiný nemá: hradba jako herní sloveso, kronika jako nespolehlivý vypravěč, slepý Žižka, chorál jako psychologická zbraň, skriptovaná AI.

> **Jak s tímhle briefem pracovat:** Jeden pracovní balíček (WP) = jedna ucelená práce = jeden commit. Před každým WP si PŘEČTI dotčené soubory (čísla řádků v briefu driftují — ber je jako kotvy pro grep, ne jako pravdu). Když najdeš rozpor mezi briefem a kódem, věř kódu a řekni to Josefovi. Když je něco nejednoznačné, zeptej se — Josef odpovídá rychle a česky. Po každém WP se zeptej, jestli pokračovat.

---

## 0. Zlatá pravidla projektu (NIKDY nepřeskakovat)

1. **Vanilla JS, žádný build systém.** Server: preview_start `husitske-valky` (python http.server, port 8013, `.claude/launch.json` existuje).
2. **Cache-busting:** KAŽDÁ změna v .js/.css/.json, které hra načítá → bump `?v=` v `index.html` (všech ~21 výskytů) A ZÁROVEŇ v `js/i18n/i18n.js` (fetch locales, ř. ~22). Používej `sed -i '' 's/v=X\.Y/v=X.Z/g' index.html js/i18n/i18n.js`. Aktuální verze při psaní briefu: **2.3**. Pozor: když edituješ soubor PO bumpu a reloadu, musíš bumpnout ZNOVU — jednou načtený locale JSON se bez nové URL nikdy znovu nefetchne.
3. **Lokalizace scénářů — past č. 1:** texty scénářů (name, description, historicalSignificance, briefing, objectives, debriefing, **eventy ve fázích**) se PŘEPISUJÍ z `cs.json`/`en.json` přes `getLocalizedScenario()` (`js/i18n/i18nHelpers.js:48`). Eventy se mergují **PODLE INDEXU** (`scenarios.<id>.phases.N.events.M`). Každá textová změna = **3 místa**: `scenarios.js` (kanonická čeština + fallback) + `cs.json` + `en.json`, se **stejným počtem a pořadím eventů**. Briefing se bere jako pár — stačí, že v locale existuje `briefing.hussites`, a přepíšou se OBA. battleLore analogicky přes `getLocalizedBattleLore` (bloky `usti`, `tachov`… v obou JSONech).
4. **Po každé změně:** `node --check` na každý editovaný .js; `node -e "JSON.parse(...)"` na editované JSONy; `node validate_scenarios.js` (musí hlásit 0 chyb). **Past č. 2: apostrofy v anglických textech uvnitř jednoduchých uvozovek** v .js souborech (`'George's'` → SyntaxError, který tiše zabije celý soubor — přesně tak umřel encyclopediaRenderer.js na 3 týdny). Escapuj `\'` nebo přeformuluj.
5. **Runtime ověření:** přes preview_eval, vzor:
   ```js
   const s = getLocalizedScenario('id', ScenarioManager.getScenario('id'));
   ```
   VŽDY v OBOU jazycích (`await i18n.setLanguage('en')` / `'cs'`). Nikdy neověřuj jen raw `scenarios.js` — hra ukazuje lokalizovanou verzi. `initGameWithScenario(scenario)` bere **objekt**, ne id. Konzoli kontroluj přes preview_console_logs (level error).
6. **Commity:** per feature, česky, popiš CO a PROČ. Patička: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
7. **Historie — disciplína:** NIC nevymýšlet. Fakta jen z tabulky v §2, z `js/data/battleLore.js`, nebo z Dolejšího (`zdroje/*.epub`, gitignored; extrakce: `unzip` do /tmp → `index_split_*.html` → stripnout tagy pythonem). Milované legendy se NEMAŽOU — rámují se poctivě („tradice praví", „kroniky uvádějí", „údajně"). Když si nejsi jistý, zeptej se Josefa.
8. **Rozsah:** nic navíc. Žádný multiplayer, 3D, RPG vrstva, procedurální mapy, velké refaktory. Balanc čísel se ladí AŽ PO mechanikách (Josefovo pravidlo). Josef si někdy chce „jen povídat" — když řekne „nic neprogramuj", neprogramuj.

---

## 1. Mapa kódu (ověřeno 1. 7. 2026)

| Co | Kde | Klíčové body |
|---|---|---|
| Herní smyčka | `js/core/game.js` | `initGameWithScenario(obj)` ~197; `processEvent(event)` ~400 — switch event typů (`case 'panic'` ~464, `case 'activate_choral'` ~438); `setupEventListeners()` ~979 (VŠECHNY listenery s `{ signal }` AbortControlleru — dodržuj!); `endTurn`; `runAI` ~1943; `fastForwardAI` (klik na #ai-thinking); `activateChoral()` ~2930; `isInWagonLine(unit)` ~3027; breach mechanika `breachedTurns` ~3094–3105; `unitsLost` (ř. 29/210, ukládá se v save) |
| AI | `js/ai.js` | `takeTurn` → `processUnits` (prodlevy, fastForwardAI); `decideAction` ~105 — hned na začátku je **pursuit** mechanika („AI ustupuje směrem k cílovému bodu") — VZOR pro ústupové stance ve WP0 |
| Jednotky | `js/entities/Unit.js` | `canAct()` ~611, `canAttack()` ~619 (artillery nemůže střílet po pohybu; wagon může); morálka per-unit. Factory: `js/entities/UnitFactory.js` |
| Boj | `js/systems/CombatSystem.js` | `isDefending` bonus ~322 (vzor pro obranné modifikátory); `getChoralModifiers()` ~434 (+50 % útok, −20 % obrana při `choralActive`); `getWagonFormationBonuses(unit)` ~443 (linie vozů: ≥2 sousední vozy → +10 % obrana, ruší ji `breachedTurns`); `trackUnitDeath(unit, attacker)` = JEDINÝ kill-path (sjednoceno) |
| Morálka | `js/systems/MoraleSystem.js` | `processRoutingUnits()` ~10; `noQuarterGiven` ~17–28 (prchající nepřátelé zničeni) |
| Fog of war | `js/systems/FogOfWarSystem.js` + `js/core/hex.js` ~614–679 | kreslení bere `fogOptions {fogOfWar, visibleHexes, exploredHexes}`; `game.fogOfWar` se zapíná v `js/ui/main.js` ~466 (difficulty 'advanced') |
| Mapa/render | `js/core/hex.js` | odd-q offset; `scenarioToMap(col,row)` — souřadnice scénářů se PŘEVÁDĚJÍ; `drawTerrain` switch ~230 (vč. drawTrenches, drawChurch); `drawUnitDetailed` ~700+ |
| Scénáře | `js/data/scenarios.js` | `ScenarioManager.getScenario(id)`, `applyScenarioTerrain`. Event typy které engine UMÍ: `message`(jen text), `morale_drop`, `morale_boost`, `panic` (level 1–3; útok −5×level; level≥3 → 30% šance routu), `rout`, `dismount`, `trench_bonus`, `charge_bonus`, `terrain_penalty`, `activate_choral` (duration). Podmíněné eventy: `condition: {type:'units_in_area', faction, area:{minCol,maxCol,minRow,maxRow}, minCount}` + `triggerBefore`. specialMechanics IMPLEMENTOVANÉ: noQuarterGiven, nightBreakout, frozenRiver, bridgeBottleneck, pursuit, noWater, startingMorale. JEN POPISNÉ (engine je nečte): mobileFirearms, betrayal, weakCommander, flanking, dualObjective, terrainTrap, capitulationAgreement |
| Typy jednotek | `js/data/unitTypes.js` | globál `UnitTypes`; velitelé mají `commanderAbilities` (aura, fear…); frakce jednotky se určuje podle STRANY, pod kterou je ve scénáři zapsaná (cross-faction velitelé fungují, vzor DIVIS_BOREK u Malešova) |
| Lore | `js/data/battleLore.js` | globál `BattleLore` + mapování `ScenarioToBattleLore` ~507 |
| Kampaň | `js/data/campaign.js` | 4 akty, pořadí bitev |
| i18n | `js/i18n/i18n.js` (`t()` umí `{param}` přes `replaceParams` ~121; `updateDOM` přepisuje `data-i18n` elementy!), `i18nHelpers.js` (getLocalizedScenario 48, getLocalizedBattleLore ~220, `updateGameDataLocalization` — hook po přepnutí jazyka), `encyclopediaRenderer.js` (kurátorované osobnosti ~93–107), `locales/cs.json` + `en.json` |
| UI | `index.html` (#ai-thinking ~868, #gameover-modal ~776 s .gameover-columns, #unit-actions s btn-attack/btn-defend/btn-undo ~105), `js/ui/main.js`, `music.js` (`playChoral()` ~64), `style.css` (CSS proměnné --gold, --parchment…) |
| Validátor | `validate_scenarios.js` | typy jednotek, victory conditions, frakce-vs-strana, whitelist event typů (NOVÉ TYPY TAM PŘIDEJ), holdTurns, poměr sil |

---

## 2. Ověřená historická fakta (jiná nepoužívat, nevymýšlet)

| Téma | Fakt |
|---|---|
| **Lipany 30. 5. 1434** | Panská jednota (vrchní velitel **Diviš Bořek z Miletínka**, ~25 000) proti polním vojskům (~10–12 000, Prokop Holý, Čapek ze Sán). Rozhodl **předstíraný ústup** — vozy jednoty couvly, polní vojska rozevřela hradbu a vyrazila z ní, jízda jednoty vpadla do otevřené hradby. Prokop Holý padl. Čapkova jízda ujela (dodnes sporné, zda zrada — rámovat jako spor). |
| **Žižkova slepota** | Od obléhání Rábí (červen 1421) **zcela slepý**. Bitvy ve hře, kde velel slepý: **Kutná Hora 1421, Německý Brod 1422, Hořice 1423, Malešov 1424**. U Žatce 1421 NEBYL (město se ubránilo samo), u Ústí 1426 už byl mrtvý (†11. 10. 1424). |
| **Domažlice 14. 8. 1431** | Křižáci (Fridrich Braniborský, kardinál Cesarini) se dali na útěk **bez rozhodné bitvy** — podle tradice při zvuku blížících se husitů: rachot vozů a **zpěv chorálu**. Cesarini prchal v přestrojení, ztratil kardinálský klobouk (tradice). Ukořistěno ~3700 vozů a 300 děl (Staré letopisy). |
| **Ústí 1426** | Smírný list odmítnut → obě strany slíbily nikoho neživit; 24 klečících hrabat/korouhevních pánů po bitvě pobito. Ztráty: Čechů „19" (Starý letopisec), Němců tisíce (kroniky až 15 000). Už zapracováno ve hře — vzor, jak rámovat. |
| **Kroniky lžou systematicky** | Dobové kroniky **zmenšují ztráty vítězů** („Čechóv padlo jedno devatenácte") a **nadsazují ztráty poražených** („mnoho tisíc, leželi jako snopy"). Porážky se vysvětlují **zradou** nebo boží vůlí. → Tohle je designový základ WP2b. |
| **Chorál** | „Ktož jsú boží bojovníci", Jistebnický kancionál. Fungoval jako psychologická zbraň (Domažlice). |
| **Vozová hradba** | Sepnutí vozů řetězy „kolo na kolo", dvojité linie (Ústí), otevření hradby k výpadu = vrcholný manévr bitvy (Ústí: „rozevřeli husité s rozvahou vozovou hradbu a z ní vyrazili nejprve táboří"). Osádka vozu 18–21 mužů (Durdíkova tabule, Tábor). |

---

## 3. Co UŽ EXISTUJE — nestavěj znovu, jen rozšiřuj

- **Linie vozů (pasivní):** `isInWagonLine` — ≥2 sousední spřátelené vozy → +10 % obrana; průlom (`breachedTurns`) bonus dočasně ruší. WP1 na tom staví.
- **Chorál (aktivní schopnost):** tlačítko `#btn-choral` → `activateChoral()`: 1× za bitvu, jen husité, 2 kola `choralActive` → `getChoralModifiers()` +50 % útok / −20 % obrana. Event `activate_choral` (Domažlice ho už používá, `scenarios.js` ~2343). WP4 to rozšiřuje o efekt na NEPŘÍTELE.
- **Okno protiútoku:** army-level wavering stav (lišty morálky, bonus poškození na kolísající) — hotové z dřívějška.
- **Přeskočení tahu AI:** klik na #ai-thinking → `game.fastForwardAI`.
- **noQuarterGiven, nightBreakout, pursuit** — funkční specialMechanics.
- **Jediný kill-path:** `CombatSystem.trackUnitDeath` — každou smrt jednotky veď PŘES něj.

---

## 4. Pracovní balíčky

**Doporučené pořadí:** WP0 → WP5 → WP1 → WP4 → WP2a → WP2b → WP3.
(WP4-Domažlice a WP1-Lipany závisí na WP0. WP2b staví na WP2a. WP3 je nezávislý, ale největší.)

Velikosti: WP0=M, WP5=S, WP1=M, WP4=S, WP2a=S, WP2b=M, WP3=L.

---

### WP0 — Skriptovaná AI přes eventy (klíčový kámen)

**Proč:** AI je greedy per-unit smyčka. Asymetrické scénáře potřebují režii: předstíraný ústup (Lipany!), držení pozice, vlny. Bez toho nefungují návnady a trychtýře.

**Spec (ROZHODNUTO, neřešit jinak):**
1. `game.aiStance = { mode: 'default', target: null, untilTurn: null, proximity: 3 }` — inicializace v konstruktoru A resetu scénáře (najdi trojici míst, kde se resetuje `choralUsed` — ř. ~50/115/222 — a dej to vedle).
2. Nový event typ **`ai_stance`** do `processEvent` switche (vedle `case 'panic'`):
   ```js
   { trigger: 'turn_1', type: 'ai_stance', mode: 'lure', target: {col: 18, row: 7}, untilTurn: 6, proximity: 3, message: '...' }
   ```
   Nastaví `this.aiStance = {...}`, zaloguje `message` (pokud je). **POZOR:** ověř, zda ostatní eventy s pozicí převádějí souřadnice přes `scenarioToMap` — chovej se stejně jako ony.
3. `AI.decideAction` na začátku čte `game.aiStance`:
   - `'lure'` / `'retreat'`: jednotka se hýbe SMĚREM k `target` (když není, tak od nejbližšího nepřítele), útočí JEN na adjacentní cíle. **Použij existující pursuit kód** v decideAction jako vzor (dělá přesně „ustupuj k bodu"). U `'lure'` navíc: když `turnNumber > untilTurn` NEBO se libovolná hráčova jednotka dostane na ≤`proximity` hexů od `target` → `aiStance.mode = 'aggressive'` + log `gameLog.aiTrapSprung` (nový i18n klíč, cs: „Léčka! Nepřítel se obrací proti vám!", en: „A trap! The enemy turns on you!").
   - `'hold'`: nehýbat se; útočit jen na cíle v dosahu ze současné pozice.
   - `'defensive'`: pohyb max 1 hex a jen pokud tím získá cíl v dosahu; jinak stát.
   - `'aggressive'` / `'default'`: stávající chování beze změny.
4. Expiraci (`untilTurn`) kontroluj na začátku tahu AI (v `takeTurn` nebo na vstupu `processUnits`).
5. **Lipany (`lipany_1434`):** přidej do fáze 1 event `ai_stance mode:'lure'` — `target` = souřadnice ZA výchozí linií vozů panské jednoty (přečti si rozestavění ve scénáři a zvol bod ~4–6 hexů za jejich hradbou), `untilTurn: 6`, `message` cs: „Vozy panské jednoty couvají! Že by ustupovali?" / en: „The Lords' League wagons are pulling back! Are they retreating?". Nezapomeň: event přidat do `scenarios.js` + `cs.json` + `en.json` per-index (pravidlo 0.3).
6. Validátor: přidej `ai_stance` do whitelistu event typů + zkontroluj `mode` ∈ {aggressive, defensive, hold, retreat, lure}.

**DoD:** Na Lipanech AI prvních ~6 kol couvá k targetu, pak (nebo při přiblížení hráče) se obrátí a útočí — ověř runtime přes eval (nastav `game.aiStance` ručně a pusť `AI.takeTurn`, sleduj pozice jednotek). Ostatní scénáře: chování beze změny (`mode:'default'`). Validátor 0 chyb. Oba jazyky.

---

### WP5 — Frakční jména per scénář (rychlá výhra)

**Proč:** „Křižáci přemýšlí…" je fakticky špatně u občanských bitev (Hořice, Malešov, Lipany) i u Ústí (Sasové). Malé, ale imerze-kritické.

**Spec:**
1. `scenarios.js`: nové volitelné pole scénáře `factionNames: { hussites: '...', crusaders: '...' }` (kanonicky česky).
2. `getLocalizedScenario` (i18nHelpers.js): zkopíruj `factionNames` do lokalizovaného objektu a přepiš z `scenarios.<id>.factionNames.hussites/.crusaders`, pokud v locale existují (stejný vzor jako briefing).
3. `initGameWithScenario`: nastav `this.factionDisplayNames = scenario.factionNames || { hussites: i18n.t('factions.hussites'), crusaders: i18n.t('factions.crusaders') }`.
4. Použít VŠUDE, kde se vypisuje jméno frakce: `#ai-thinking` text (nový klíč `game.aiThinkingNamed` = cs „{faction} přemýšlí..." / en „{faction} is thinking..." — `i18n.t` umí `{param}`), `#current-player` (na tahu), hlavičky army overview (`.faction-name`), victory/defeat texty, plovoucí hlášky, kde dává smysl.
   **PAST:** elementy s `data-i18n` přepisuje `i18n.updateDOM()` při každé změně jazyka. U elementů, které mají nést per-scénář jméno, atribut `data-i18n` ODSTRAŇ (v HTML) a nastavuj textContent ručně: při startu scénáře + v `updateGameDataLocalization()` (hook, který i18n volá po přepnutí jazyka — ověř, že tam máš přístup k běžící hře).
5. Nastav `factionNames` (cs kanonicky / en do en.json):
   - `usti_1426`: crusaders „Sasové a Míšeňané" / „Saxons and Meisseners"
   - `kutna_hora_1421`, `nemecky_brod_1422`: crusaders „Zikmundovo vojsko" / „Sigismund's army"
   - `horice_1423`, `lipany_1434`: crusaders „Panská jednota" / „Lords' League"
   - `malesov_1424`: crusaders „Pražský svaz" / „Prague League"
   - `lipany_1434`: hussites „Polní vojska" / „Field Armies"
   - ostatní: bez pole (default Husité/Křižáci).
   **POZOR na apostrofy** v en stringách: v .json jsou v pořádku (double quotes), v .js escapuj.

**DoD:** Na Malešově indikátor říká „Pražský svaz přemýšlí…", na Sudoměři pořád „Křižáci přemýšlí…". Přepnutí jazyka za běhu bitvy jména správně přegeneruje. Screenshot.

---

### WP1 — Hradba jako sloveso (vlajkový mechanik)

**Proč:** Historické drama vozové hradby je manévr: sepnout řetězy pod tlakem, vydržet, v pravou chvíli ROZEVŘÍT k výpadu. Teď je linie vozů pasivní bonus — uděláme z ní hráčské rozhodnutí. Žádná jiná hra tohle sloveso nemá.

**Spec (ROZHODNUTO):**
1. Nový stav vozu: `unit.formationClosed` (bool, jen `unitClass === 'wagon'`). **Default `true`** při vytvoření (zachová dnešní chování defenzivních scénářů, kde linie „prostě funguje"). Volitelné pole ve scénáři: `{ type: 'VOZOVA_HRADBA', col, row, formation: 'open' }` pro vozy, které mají začít rozepnuté (validátor: akceptovat pole, hodnoty open/closed).
2. Význam stavů:
   - **Zavřený (closed):** počítá se do linie (`isInWagonLine`), NEMŮŽE se hýbat (pohyb 0), střílet může. Sousední spřátelená NE-vozová jednotka dostává **+5 % obrany** („kryt za hradbou") — přidej do agregace obranných modifikátorů v CombatSystem (vzor: `isDefending` bonus ~322, `getWagonFormationBonuses` ~443).
   - **Otevřený (open):** může se hýbat (dnešní pohyb 1), NEPOČÍTÁ se do linie (sám bonus nemá a nedělá souseda ostatním), žádný kryt.
3. Úprava `isInWagonLine`: na začátku `if (!unit.formationClosed) return null;` a v cyklu sousedů počítej jen sousedy s `formationClosed`.
4. Přepnutí = akce: tlačítko `#btn-formation` v `#unit-actions` (vedle btn-defend, stejný vzor zapojení s `{ signal }` v setupEventListeners). Label přepíná: cs „⛓ Sepnout hradbu" / „⛓ Rozevřít hradbu", en „⛓ Chain the wagons" / „⛓ Open the wall" (i18n klíče `game.closeFort` / `game.openFort`). Viditelné jen pro hráčův vůz, který ještě nejednal. Přepnutí nastaví `hasMoved = true` (střílet potom ještě smí — osádka střílí, zatímco vozataji spínají řetězy).
5. Vizuál: v hex.js při kreslení ZAVŘENÉHO vozu nakresli řetěz (tlustší tmavo-zlatá čára, `--gold-dark`, lineWidth 3, alpha ~0.7) ke KAŽDÉMU sousednímu zavřenému spřátelenému vozu ve směrech E/SE/SW (jen 3 směry → žádné dvojité kreslení páru). Stav vypiš i v unit info panelu.
6. Save/load: persistuj `formationClosed` (vzor: jak se persistuje wavering/isDefending — najdi v save/load bloku game.js ~2400).
7. AI: NEPŘEPÍNÁ (vozy AI zůstávají, jak začaly). Žádná změna AI.
8. **STRETCH (jen pokud triviální):** během okna protiútoku (nepřátelská armáda wavering) dostane spřátelená ne-vozová jednotka stojící vedle OTEVŘENÉHO vozu +10 % útoku („výpad z hradby") — napoj na existující bonus na kolísající nepřátele. Když to není na pár řádek, vynech a napiš Josefovi.
9. **Poetika s WP0:** na Lipanech teď hráčova nejlepší obrana = držet hradbu zavřenou a NEVYBĚHNOUT za couvajícím nepřítelem. Přesně to je historická lekce Lipan. Nic dalšího netřeba — vznikne to samo složením WP0+WP1.

**DoD:** Toggle funguje (eval: přepni, ověř `formationClosed`, pohybové možnosti 0/1, linie bonus přes `isInWagonLine` vrací null pro open); kryt +5 % měřitelný; řetězy vidět na screenshotu; save→load zachová stav; validátor 0 chyb; oba jazyky.

---

### WP4 — Chorál jako psychologická zbraň (rozšíření existujícího)

**Proč:** Dnes je chorál self-buff (+50 % útok). Historicky byl zbraní PROTI nepříteli — u Domažlic křižáci utekli od zvuku. Doplníme druhou půlku.

**Spec:**
1. NEBOURAT existující: `activateChoral()` (~2930), `getChoralModifiers()`, event `activate_choral`, 1×/bitvu, 2 kola — vše zůstává.
2. PŘIDAT při aktivaci (v `activateChoral` i v event větvi `activate_choral` — ideálně vyfaktoruj společnou metodu `applyChoralShock()`):
   - VŠECHNY nepřátelské jednotky: morálka **−8** (globálně — u Domažlic to slyšeli na kilometry).
   - Nepřátelské jednotky, které po zásahu mají morálku **< 25**: okamžitý test routu **30 %** (zrcadli mechaniku `case 'panic'` level 3 v processEvent ~464 — použij stejný kód/roll, ať je chování konzistentní).
   - Všechny husitské jednotky: morálka **+5**.
   - Log: nové klíče `gameLog.choralShockEnemy` (cs: „Nepřátelé slyší chorál — strach se šíří šiky!", en: „The enemy hears the chorale — dread spreads through their ranks!").
3. Audio: `playChoral()` v music.js už hymnus jednou přehraje — ověř, že se volá při aktivaci, a nech být.
4. **Domažlice (`domazlice_1431`)** — ZÁVISÍ NA WP0: scénář má `activate_choral` na turn_4. Přidej NA STEJNÝ trigger event `ai_stance mode:'retreat'` s targetem u západního okraje mapy (přečti si mapu scénáře) → historický útěk od zvuku chorálu. Message cs: „Křižáci slyší chorál a rachot vozů — a dávají se na útěk!" (+ en; per-index do JSONů!).
5. Balance čísla (−8/+5/25/30 %) jsou první nástřel — NELADIT bez Josefa, jen implementovat.

**DoD:** Eval: před/po aktivaci porovnej morálku vzorku nepřátel (−8) a husitů (+5); jednotka s morálkou <25 občas routne (můžeš dočasně nastavit morálku ručně). Domažlice: po turn_4 AI couvá k západu. 1×/bitvu drží. Oba jazyky, validátor, screenshot logu.

---

### WP2a — „Vy vs. kronika" (levný násobič, udělat před WP2b)

**Proč:** Post-battle srovnání hráčova výsledku s tím, co „praví kroniky" — okamžitě zajímavé, sdílitelné, data už existují.

**Spec:**
1. Počítadla: `game.lossesByFaction = { hussites: 0, crusaders: 0 }` — inkrementuj VÝHRADNĚ v `CombatSystem.trackUnitDeath` (jediný kill-path). Jednotky s `unit.escaped === true` (dezerce/útěk z bojiště) počítej zvlášť do `game.fledByFaction` — kronika je může „pobít", ale kritika řekne pravdu. Persistuj v save/load (vzor `unitsLost`).
2. Gameover modal (`#gameover-modal`, má .gameover-columns z landscape úpravy): přidej sekci `#gameover-chronicle`:
   - řádek 1: „Vaše ztráty: {X} z {Y} jednotek · Nepřítel: {A} z {B} · Kol: {N}"
   - řádek 2: „Kronika praví: {battleLore.casualties.hussites} / {battleLore.casualties.enemy}"
   - řádek 3 (kurzívou): cs „Kroniky ztráty vítězů rády umenšují a poražených rozmnožují." / en „Chronicles like to shrink the victors' losses and swell the vanquished's."
   - Data z `getLocalizedBattleLore` přes `ScenarioToBattleLore` mapování (battleLore.js ~507). Když bitva nemá lore záznam, sekci skryj.
3. i18n klíče pro labely (`gameover.yourLosses`, `gameover.chronicleSays`, `gameover.chronicleNote`).

**DoD:** Vynuť konec bitvy přes eval (najdi, jak se volá showVictory/checkVictory — grep) a ověř sekci v CZ i EN + screenshot. Počítadla sedí s počtem mrtvol (eval: spočítej `units.filter(u=>u.health<=0 && !u.escaped)` per frakce a porovnej).

---

### WP2b — Kronika: nespolehlivý vypravěč (podpis hry)

**Proč:** Hra sama generuje dobový pramen, který LŽE, a hráč má nástroj pramenné kritiky, aby lež odhalil. Josefova metoda (source-criticism, kterou děláme v lore ručně) povýšená na mechaniku. Tohle je feature, kterou nikdo jiný nemá.

**Spec:**
1. Nový soubor `js/systems/ChronicleSystem.js` (+ script tag do index.html s `?v=`).
2. **Ukládej DATA, ne text** (kvůli přepínání jazyků): localStorage klíč `hussiteChronicle` = pole záznamů:
   ```js
   { scenarioId, result: 'victory'|'defeat', playerLosses, playerTotal, enemyLosses, enemyTotal, fled, turns, blind: false, ts }
   ```
   Zápis zavolej z místa, kde se finalizuje konec bitvy (tam, kde se plní gameover modal — jedno místo, po WP2a už tam data jsou).
3. **Text se generuje při zobrazení** z šablon v cs.json/en.json (`chronicle.*`), aktuálním jazykem. Pravidla stylizace (= ta lež, PŘESNĚ TAKTO):
   - Vítězství: vlastní ztráty PODHODNOŤ: `shown = max(1, floor(playerLosses / 3))`, formulace cs „a našich padlo sotva {n} houfů" / en „and of ours fell scarcely {n} companies". Nepřátelské NADSAĎ: pokud `enemyLosses/enemyTotal > 0.5` → „nepřátel pak pobito bez čísla, na mnoho tisíc" / „of the enemy, slain beyond counting, many thousands", jinak → „nepřátel pobito veliké množství" / „a great multitude".
   - Porážka: NIKDY nepřiznej slabost — viníka vyber deterministicky `(scenarioId.length + turns) % 3` z: cs [„zradou zrádných", „pro nepřízeň počasí a vůli boží", „proti přesile desateronásobné"] / en analogicky.
   - Rámec: cs „Léta Páně {rok} svedena bitva {jméno bitvy}. {tělo} {podpis}" — rok vytáhni ze scénáře (id končí `_RRRR` — parsuj z id, je to spolehlivější než date string).
   - {podpis}: první položka trivia z battleLore (localizovaná), pokud existuje.
   - Pokud `blind: true` (WP3): přidej větu cs „A to vše slepý hejtman viděl toliko ušima svých věrných." / en „And all this the blind captain saw only through the ears of his faithful."
4. UI: nové tlačítko v hlavním menu „📜 Kronika" (`#btn-chronicle`, vzor btn-encyclopedia vč. modálu). Obsah: záznamy seřazené podle pořadí bitev v kampani (campaign.js), každý jako odstavec dobovým stylem (existující parchment CSS proměnné; iniciála: první písmeno ve spanu s větším fontem a `--gold`). U každého záznamu tlačítko **„Pramenná kritika"** → rozbalí pravdu: cs „Ve skutečnosti: ztráty {playerLosses} z {playerTotal} jednotek, nepřítel {enemyLosses} z {enemyTotal}, {fled} rozprchlých. Kronikář, jak bývá zvykem, umenšil a rozmnožil." (+ en). Prázdný stav: „Kronika je prázdná. Vybojujte první bitvu."
5. Jazyk přepnutí: modal se překreslí (napoj na `updateGameDataLocalization` nebo generuj při každém otevření — stačí při otevření).

**DoD:** Dvě bitvy (klidně vyvolané přes eval zápisem do ChronicleSystem) → dva záznamy; reload stránky → záznamy přežily; „Pramenná kritika" ukazuje skutečná čísla ≠ stylizovaná; CZ/EN přepnutí funguje; screenshot kroniky.

---

### WP3 — Slepý Žižka (experimentální režim, vlajková loď Aktu II)

**Proč:** Od Rábí (1421) velel Žižka ZCELA SLEPÝ — Kutnou Horu, Brod, Hořice i Malešov vyhrál nevidomý. Režim, kde hráč velí „ušima": nevidí nepřátele, jen hlášení pobočníků. O tomhle se píšou články.

**Spec:**
1. Flag scénáře `zizkaBlind: true` na: `kutna_hora_1421`, `nemecky_brod_1422`, `horice_1423`, `malesov_1424`. (NE Žatec — Žižka tam nebyl; NE Ústí — mrtvý. Viz §2.)
2. Zapnutí: v briefing obrazovce (najdi, kde se renderuje briefing modal před bitvou) checkbox „⚫ Velet poslepu (slepý hejtman)" — default VYPNUTO, jen když scénář má flag a playerFaction hussites. Nastaví `game.blindMode = true`. Persistuj v save/load.
3. **Mechanika viditelnosti (ROZHODNUTO — jednoduchá verze):**
   - Terén je vidět celý (Žižka krajinu znal — nech mapu, fog terénu neřeš).
   - NEPŘÁTELSKÉ jednotky se NEKRESLÍ (canvas ani minimapa), POKUD nejsou **adjacentní (vzdálenost 1) k libovolné spřátelené jednotce** — kontakt zblízka „cítíš". Živý check při kreslení (hex.js — tam, kde se už filtrují jednotky přes fogOptions; přidej větev blindMode). Jakmile adjacency pomine, zase zmizí.
   - Pravý panel: seznam nepřátel (`#crusader-units`) nahraď „???" a count „?/{start}".
   - **Cílení:** střelba na neviditelného nepřítele NEJDE — filtruj v místě, kde se počítají platné cíle útoku (grep getValidTargets / highlight targets). Melee je z definice na adjacentní = viditelné. Overwatch nech beze změny.
4. **Hlášení (jádro zážitku):** na začátku KAŽDÉHO hráčova tahu vygeneruj 2–4 log zprávy:
   - Shlukuj nepřátele: jednotky do vzdálenosti ≤2 od sebe = jeden „houf".
   - Za každý shluk: směr od Žižkovy jednotky (najdi JAN_ZIZKA v game.units; když není, od těžiště husitů) — 8 směrů cs (na severu, severovýchodě…), počet s šumem ±30 %: `max(1, n + randInt(-ceil(n*.3), ceil(n*.3)))`, složení podle unitClass ({jízda, pěší, střelci, děla} — vyjmenuj přítomné).
   - Hlásí nejbližší spřátelený VELITEL (unitClass 'commander'), jinak „Zvěd".
   - i18n šablona `reports.sighting`: cs „{reporter} hlásí: {count} houfů — {composition} — {direction}!" / en „{reporter} reports: {count} companies — {composition} — {direction}!" (`i18n.t` s parametry). Log typu 'turn'.
   - `Math.random()` je tady v pořádku (herní kód, ne workflow).
5. Žižkova aura beze změny — v tom je pointa (velel skvěle i slepý).
6. Napojení na WP2b (pokud už existuje): záznam kroniky dostane `blind: true`. Pokud WP2b ještě není, jen ulož flag do dat gameoveru — nevaž na sebe.
7. Vítězná obrazovka: pod titulek přidej řádku cs „Vybojováno poslepu." / en „Fought blind." když blindMode.

**DoD:** Malešov s režimem: screenshot BEZ nepřátelských jednotek na mapě + hlášení v logu; eval ověř, že střelec nemá mezi platnými cíli neviditelného nepřítele, ale adjacentní jednotka útočit může; adjacency odhalení funguje; výhra/prohra funguje; save/load přežije; vypnutý režim = normální hra; oba jazyky.

---

## 5. Co v tomhle briefu NENÍ (neřešit, nezačínat)

- **UI redesign** (`design_handoff_husitske_valky/`) — Josef rozhodl: až ÚPLNĚ na konci projektu. (Poznámka pro budoucnost: směr = Jenský kodex / iluminovaný rukopis.)
- **Balanc čísel** (Žatec ratio 0.46, Sudoměř tier 3…) — až po mechanikách.
- **Přejmenování hry** (kandidát „TÁBOR") — rozhodne Josef sám.
- **EN lokalizace Žateckého lore** — samostatný dluh, netahat do WP.
- **Tutorial** — odstraněn záměrně, nevracet bez zadání.
- **Zbytek scénářové tour** (Tachov, Nisa, Domažlice, Plzeň, Lipany, Sión vs. Dolejší) — běží paralelně, ale je to jiná práce než tento brief.

## 6. Definition of Done — checklist KAŽDÉHO WP

```
[ ] Přečetl jsem si dotčené soubory PŘED editací (ne jen brief)
[ ] node --check na všech editovaných .js
[ ] node -e "JSON.parse(...)" na cs.json i en.json (pokud editovány)
[ ] node validate_scenarios.js → 0 chyb
[ ] Texty ve 3 místech (scenarios.js + cs.json + en.json), eventy per-index
[ ] bump ?v= v index.html (VŠECHNY výskyty) + js/i18n/i18n.js — právě jednou za WP
      (a znovu, pokud jsem po reloadu ještě editoval)
[ ] Runtime ověření přes preview_eval v OBOU jazycích + screenshot důkaz
[ ] preview_console_logs bez errorů
[ ] Commit: česky, co+proč, Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
[ ] Krátké shrnutí Josefovi česky + dotaz, zda pokračovat dalším WP
```
