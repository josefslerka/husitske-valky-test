# PLAN_GOAL.md — Co by se mělo změnit (doporučení Claude, 2026-09-02)

> Předávací dokument. Vznikl po dokončení revize všech 18 scénářů vůči pramenům
> (PLAN_TOULKY_REVIZE.md, buckety A–D hotové). Je psaný tak, aby ho mohl provést
> jiný model bez kontextu původní session. **Pořadí = doporučená priorita (hodnota / cena).**
> Kotvy v kódu jsou ověřené; kde si nejsem jistý souborem, je uveden grep.

## 0. North star a zásady práce

**Identita hry:** *hra, která se hádá se svými prameny* — ukazuje svou práci (trivia flagují legendy,
Dolejší vs. kronikáři, Sion vs. archeologie). Každá změna má této identitě sloužit.
Motto další etapy: **historie, která se hraje, ne jen čte.**

Zásady (z memory, ověřené praxí):
- **Obohatit, ne opravovat.** Kde hra sedí, nesahat. Opravy jen doložené pramenem.
- **Mechanika před balancem.** Balanc je provizorní do předělání AI (bucket E v PLAN_TOULKY_REVIZE.md) — čísla neladit dřív.
- **Balance-neutrální default:** nové eventy jako narativ/text; mechanické debuffy až vědomě a pojmenovaně.
- **Lokalizace (3 místa):** scénářové texty = `js/data/scenarios.js` (CZ báze) + `cs.json` + `en.json` overlay **podle indexu**. Nový event **APPENDOVAT na konec fáze v bázi i v en** (mid-insert = misalignment). battleLore = `js/data/battleLore.js` (CZ báze) + cs/en `battleLore.<id>`; nová trivia stačí báze + en (cs padne na bázi). V JSON české uvozovky „ “ (U+201E/U+201C), nikdy rovná `"` uvnitř stringu. Po editu bumpnout `?v=` (tagy v `index.html` + interní fetch locale v `js/i18n/i18n.js`). Ověřovat přes `getLocalizedScenario()` / `getBattleLore()` v CS **i** EN — pozor, `localStorage.gameLanguage` přežívá reload, přepínej explicitně `i18n.setLanguage()`.
- Commit po logické jednotce, zpráva česky, trailer `Co-Authored-By`. Před commitem `git status` — jen zamýšlené soubory.

**Stav repa k předání:** revize hotová (commity 081cd22 … 4d2c21b). **V pracovním stromu je necommitnutý draft položky 1a:** `js/core/hex.js` (metoda `drawMapLabels` + volání v `render()`) a `index.html` (hex.js `?v=6.5`). Syntax OK (`node --check`), **vizuálně neověřeno**. První úkol = ověřit v prohlížeči a commitnout, nebo `git checkout -- js/core/hex.js index.html`.

---

## 1. Mapa, která mluví (mapLabels) — rychlá výhra

**Proč:** 7 scénářů nese názvy míst v datech (`mapLabels`), ale **nikdy se nekreslí** — slouží jen tooltipu.
A bitvy definované *místem* je nemají vůbec: Sudoměř *je* hráz mezi Škaredým a Markovcem, Hořice *je* Gothard,
Ústí *je* „Na Běhání", Domažlice *je* Baldov, Lipany *jsou* Lipská hora. Briefing to dnes vysvětluje slovy;
label je **terén, který učí.** Některé labely vyprávějí pohyb (Tachov: „K Bavorsku", „Od Stříbra").

**Kde:** `js/core/hex.js` `render(units, fogOptions)` (~ř. 636; lokální `fogOfWar`, `exploredHexes`).
Draft `drawMapLabels(fogOfWar, exploredHexes)` volaný před `drawWagonChains` → **pod jednotkami**
(kurzíva Georgia, světlé halo, fog-aware: ukáže se po prozkoumání ≥1 hexu). Data `scenario.mapLabels:
[{text, hexes:[[col,row]…]}]`; do gridu je ukládá `js/core/game.js` (~ř. 263, převod `scenarioToMap`).
Tooltip lookup `game.js` ~ř. 1337. Pozor: v hex.js je i druhý `render(units)` (~ř. 1722, jiná třída) — editovat ten první.

**Kroky:**
- (a) Ověřit draft na Německém Brodě / Kutné Hoře („Sázava", „Německý Brod", „Kaňk"), doladit velikost a kontrast
  při šířce 753 px (Josefovo okno), commit.
- (b) Dolabelovat 11 scénářů — jen terén nesoucí příběh (souřadnice vzít z bloku `terrain:` ve scenarios.js):
  Sudoměř (rybník Škaredý / Markovec / hráz), Vítkov (hřeben Vítkov / Špitálské pole), Vyšehrad (Pankrác / úvoz k Podolí),
  Žatec (Ohře / západní hradba), Nekmíř (tvrz Nekmíř), Živohošť (kopec Červenka / brod), Hořice (Gothard / Hořice),
  Malešov (potok Bohynka / tvrz Malešov), Ústí (Na Běhání / Ústí), Domažlice (Baldov / Domažlice / Všerubský průsmyk),
  Lipany (Lipská hora / Hřiby).
- (c) Lokalizace: názvy míst nechat neutrální; popisné („Příkopy", „K Bavorsku", „Husitský tábor") buď přejmenovat
  na neutrální, nebo přidat `mapLabels` do `getLocalizedScenario` (`js/i18n/i18nHelpers.js` ~ř. 48) + klíče v cs/en.

**Hotovo když:** labely vidět na všech 18 mapách, pod jednotkami, fog respektován, EN hráč nevidí české popisné texty.
**Velikost:** S (a) + M (b).

---

## 2. P1 přerámované: AI jako *doktrína*, ne chytrost — hlavní cíl etapy

**Proč:** Veškerá historická věrnost je dnes v textech; hloupý soupeř dělá z bitvy diorama. Ale cíl **není**
„chytrá AI". Rytíři tupě nabíhající na vozovou hradbu jsou **historicky přesní** — to přesně dělali. Cíl je AI
**hloupá správným způsobem**: panstvo nabíhá, ale pronásleduje rozprášené, hledá otevřený bok, u Lipan umí klamný
ústup; křižáci prchají při pověsti/chorálu (viz 3). Doktrína je levnější a věrnější než generická chytrost.

**Kde:** Existuje zárodek — event `ai_stance` (WP0) s `mode` (`'lure'` u Lipan, `'retreat'` u Domažlic), `target`,
`untilTurn`, `proximity`; zpracovává `processEvent` v `js/core/game.js`, definice ve scenarios.js.
Vlastní AI logiku najít: `grep -rn "ai_stance\|aiTurn\|AISystem\|makeAIMove\|aiStance" js/`.
Zásobník návrhu: PLAN_SUPERSTAR_II.md → P1 „reaktivní AI" — použít jako výchozí, ale **zúžit na doktríny**.

**Návrh:** profil `doctrine` per frakce/scénář (v datech scénáře, default podle frakce):
`{ charge: 'reckless'|'cautious', pursueRouted: bool, flankSeeking: bool, fearThreshold: number,
feignedRetreat: bool, holdWagonFort: bool }`. Panská jednota / křižáci = reckless + pursueRouted + flankSeeking;
umírnění (Lipany) = feignedRetreat; posádky a obléhaní (Žatec-AI, Sion-AI) = holdWagonFort. Napojit na existující
stance eventy, ať scripty zůstanou funkční.

**Hotovo když:** (1) jízda pořád útočí na hradbu čelně (historie se nemění), ale (2) dorazí rozprášené jednotky,
(3) obejde bok, když je otevřený, (4) Lipany-lure funguje proti hráči-radikálovi, (5) žádné bezúčelné sebevraždy
do palby bez stance. Regrese ověřit na Nekmíři (reckless charge musí pro AI zůstat prohrou), Vyšehradu (úvoz-past),
Lipanech (lure), Tachově/Domažlicích (útěk). **Velikost: L. Teprve potom bucket E.**

---

## 3. Pověst / strach — kampaňová kontinuita

**Proč:** Každá bitva je ostrov, nic se nepřenáší. Historie má oblouk: pověst neporazitelnosti roste Ústí → Tachov →
Domažlice (nepřítel prchá na *zvuk*), Lipany ji zlomí („Čechy poražené Čechy"). Dnes je útěk u Tachova/Domažlic
**naskriptovaný** — darovaný, ne zasloužený. Metr pověsti sjednotí P6 (družina), P7 (slepý Žižka) i pedagogickou
linku do jedné mechaniky — a je historicky pravdivý.

**Kde:** stav kampaně (dokončené mise): `grep -rn "campaignProgress\|completedMissions\|localStorage" js/ui/main.js js/core/game.js`.
Rout/panic eventy: `processEvent` case `'panic'` / `'rout'` / `'morale_drop'` (game.js ~ř. 506+), `activate_choral`
(~ř. 477) a `applyChoralShock`. Startovní morálka frakce: scénář `specialMechanics` (Tachov má `crusaders: 40`).

**Návrh:** `pověst` 0–100 uložená s postupem kampaně; + za vítězství (víc za křižácké bitvy, bonus za rychlé/bez ztrát);
zlom po Lipanech. Startovní morálka křižáků a síla panic/rout eventů u Tachova a Domažlic = f(pověst) — **s podlahou**,
ať bitvy zůstanou vyhratelné i při nízké pověsti (jen těžší a s jiným textem: „křižáci se nebojí — musíte je porazit
v poli"). Volitelně u Domažlic dosah chorálového šoku = f(pověst) (Dolejší: slyšeli ho na 7 km).

**Hotovo když:** hráč s vysokou pověstí prožívá Tachov/Domažlice jako *výsledek* svých vítězství; Rychlá bitva má
default střední pověst. **Velikost: M.**

---

## 4. Tragický oblouk čtyř aktů — texty a Kronika

**Proč:** Zrození (underdog) → Žižkova éra (génius, bratrovražda, smrt) → Prokopova éra (neporazitelnost, evropské
měřítko) → Konec (hybris → Lipany → Sion, možná divadlo). Vrchol moci je ve III. aktu, IV. je o ztrátě. Hra ten
oblouk **má**, ale nic ho neforeground-uje.

**Kde:** debriefingy (`scenarios.js` + cs/en `debriefing.victory/defeat`), Kronika `js/systems/ChronicleSystem.js`
(~ř. 45 bere první trivia z battleLore jako podpis kronikáře), popisky aktů v mission listu (`js/ui/main.js`).

**Návrh:** (a) tón debriefingů sleduje křivku — Akt III vítězství s náznakem hybris (rejsy, kořist, „nikdo nás
nezastaví"), Akt IV ztráta i při vítězství hráče (kontrafakt: „vyhráli jste bitvu, kterou historie prohrála — ale…").
(b) Kronika: shrnující zápis po každém aktu (4 texty). (c) Věta k aktu v mission listu — zpřesnit na oblouk.
**Velikost: S–M** (jen texty; 3-místná lokalizace).

---

## 5. P8 Kronika protistrany — „dějiny píší vítězové"

**Proč:** Sedí na identitu hry nejlíp ze všech parkovaných nápadů. Hráč může vyhrát bitvy, které historie prohrála
(Most, Plzeň, Lipany za radikály) = **kontrafaktuální laboratoř**. Při prohře se kanonickou stane *jejich* kronika.
Sion = dokonalá případovka: kronikářská (hrdinská) vs. archeologická (divadlo) verze — ukázat obě.

**Kde:** `js/systems/ChronicleSystem.js`; `js/data/battleLore.js` — nové pole `enemyChronicle: { text, source }`
per bitva, + cs/en overlay v `getLocalizedBattleLore` (`js/i18n/i18nHelpers.js` ~ř. 236). Obrazovka konce hry
`#gameover-modal` (override blok v `style.css`), `window.showGameOver`.

**Návrh:** ke každé bitvě 2–4 věty „jak by to zapsal nepřítel" (křižácký letopisec / Bartošek / Piccolomini —
prameny už v lore jsou). Při prohře se ukáže **místo** husitského debriefingu a v Kronice se uloží jako kanonický.
U Sionu obě verze vždy. **Velikost: M** (hlavně texty ×18 ×2 jazyky).

---

## 6. Lokalizační dluh — úklid, který zabrání dalším chybám

**Proč:** Během jednoho dne kousl: misalignment eventů (mid-insert vs. append), rovná uvozovka v JSON, **mrtvé flat
`events`** v cs/en (duplikují fáze, báze je nečte, ale matou náhrady textů), mapLabels bez lokalizace, hardcoded
„→ Kolín" v rendereru (už odstraněn), `event.title` se nelokalizuje, `morale_boost` má natvrdo hlavičku „Morálka".

**Kde:** `js/i18n/i18nHelpers.js` (`getLocalizedScenario`, `getLocalizedBattleLore`), cs.json/en.json
`scenarios.*.events` (flat), `game.js processEvent` (hlavičky notifikací), `showEventNotification`.

**Návrh:** (a) smazat mrtvé flat `events` ze `scenarios.*` v cs/en (ověřit: žádný scénář v bázi flat `events` nemá).
(b) lokalizovat `title` eventů a hlavičky notifikací přes i18n klíče. (c) mapLabels overlay (viz 1c).
(d) validační skript `scripts/validate-locales.js`: stejný počet fází/eventů báze vs. cs vs. en, stejný počet
trivia/quotes, žádná rovná `"` uvnitř českých stringů — spouštět před commitem.
**Velikost: M**, nízký lesk, vysoká prevence.

---

## 7. Bucket E — balanc podle historických poměrů (až po 2)

Přesily z pramenů (Hořice ≥3:1, Ústí ~⅓ jezdectva vč. těžké šlechty, Tachov/Domažlice masy prchajících, Malešov)
řešit **doktrínou a počtem jednotek AI**, ne HP čísly. Seznam per bitva: 🎚️ položky v PLAN_TOULKY_REVIZE.md.
**Neotvírat před 2.**

---

## Milník: Vydání Aktu I (proces, ne kód)

Akt I je historicky výborný. Po položce 1 (ideálně po základní verzi 2) **dát Akt I hrát 3–5 lidem** dřív než
pokračovat v leštění — sólo hobby projekt umírá na nekonečné leštění. Připravit: README „jak spustit"
(`python3 -m http.server 8000`), poznámka o známých limitech (AI, balanc), 4 otázky pro hráče (kde ses ztratil?
co tě nudilo? co jsi nepochopil v cíli? co bys chtěl vědět o bitvě a nedozvěděl ses?). Hráč našel HUD cíle,
který já v kódu nenašel — reální hráči najdou víc.

## Co NEdělat
- Neladit čísla jednotek/HP před položkou 2.
- Nepřepisovat scénáře, které sedí (revize A–D je uzavřená).
- Nezavádět plný chorál u Tachova (rozhodnuto: jen text; Domažlice zůstávají „písničkou, která vyhrála bitvu").
- Nesahat na Erkingera u Žatce (záměrné teleskopování) ani na Diviše Bořka u Malešova (prameny velitele nejmenují).
