# Struktura kódu a pravidla údržby

## Bitva: pravidla a prezentace

`Game` vlastní stav bitvy a koordinuje tahy, scénáře, výběr jednotek, pohyb a herní
systémy. `CombatSystem` provádí souboje; `ScenarioEventSystem` spravuje průběh
scénářových událostí. Žádná z těchto tříd přímo nepracuje s DOM nebo s animační
smyčkou prohlížeče.

Prezentace bitvy je rozdělena do tří tříd:

- `BattleView` překládá vstupy prohlížeče na příkazy hry, vykresluje mapu a minimapu,
  ovládá kameru, notifikace a efekty. Vlastní listenery a animační smyčku.
- `BattlePanels` sestavuje HTML jednotek, přehledu armád, tlačítek a fázového banneru.
- `BattleTooltip` vlastní tooltip, jeho obsah a cache pro hover.

Pohled čte stav a dotazuje se pravidel. Změny herního stavu provádí příkazy `Game`
nebo příslušného systému, nikoli přímým přepisováním jeho polí. Například klik na
Canvas převede `BattleView.handleClick()` na hex a předá `Game.handleHexClick()`.
Přepnutí rychlosti AI jde přes `Game.skipAIAnimations()`.

Dosavadní metody `Game.updateUI()`, `Game.updateUnitPanel()` a další veřejné vstupy
pro prezentaci jsou zatím tenké delegáty. Udržují kompatibilitu s `main.js`, AI
a systémy; nejde o novou druhou implementaci UI.

### Stav se nemění při kreslení

`Game.render()` je kompatibilní bod pro obnovení odvozené viditelnosti po změně hry
a následné vykreslení. Samotné `BattleView.render()`, které volá animační smyčka,
už pravidla nepřepočítává. Stejně tak panel morálky pouze zobrazuje vypočítanou
hodnotu, nezapisuje do stavu armády.

Herní log vlastní výhradně `Game`; pohled jen přidává nebo odstraňuje jeho HTML.
`Game.destroy()` nejprve zruší čekající akce a poté zničí pohled. Ten odpojí vstupy
včetně minimapy, zastaví animaci a odstraní notifikace. Čísla poškození se odstraní
také při zrušení čekání.

### Vyměnitelný pohled a testy

Konstruktor přijímá volitelné `{ viewFactory }`. Ve hře se automaticky použije
`BattleView`; testy vkládají explicitní `TestBattleView`:

```js
const game = new Game(grid, {
    viewFactory: game => new TestBattleView(game)
});
```

`SaveGameSystem.load()` zachovává factory dosavadní hry, případně přijímá explicitní
třetí argument `{ viewFactory }`. Načtení tak v testech omylem nevytvoří prohlížečové
UI. Testovací adaptér je v `scripts/helpers/test-battle-view.js`; jeho kontrakt se
ověřuje proti metodám skutečně používaným pravidly. Nepřepisujeme `Game.prototype`.

Soubory jsou nadále klasické skripty, nikoli ES moduly. V `index.html` se proto
`BattlePanels`, `BattleTooltip`, `BattleView` i `ScenarioEventSystem` načítají před `Game`.

## Scénářové události

Každá instance `Game` má vlastní `scenarioEventSystem`. Systém vlastní implementaci
přechodů fází, vyhodnocení jednorázových událostí, jejich účinků a příchodu posil.
`ScenarioManager` nadále poskytuje scénářová data a vyhodnocuje podmínky událostí.
Veřejné metody `Game.updatePhase()`, `checkPhaseEvents()`, `processEvent()`,
`checkReinforcements()` a `spawnReinforcements()` zůstávají kompatibilními delegáty.

Stav `currentScenario`, `currentPhase` a `processedEvents` zůstává v `Game`; systém
si nedrží druhou kopii. Díky tomu lokalizace pracuje s aktuálními daty a save v4
nemění strukturu ani kompatibilitu se staršími verzemi.

Při začátku kola se nejprve aktualizuje fáze, pak provedou její způsobilé události
a posily. Identifikátor události se uloží před provedením účinku. Posily používají
dosavadní klíče `reinf-hussites-<kolo>`, `reinf-crusaders-<kolo>` a
`reinf-scenario-<skupina>-<kolo>`. Neměňte je bez migrace uložených her.
Podmíněné události používají stabilní ID nezávislé na kole skutečného spuštění.

Posily nejprve naplánují umístění **celé skupiny**, bez vytváření jednotek a spotřeby
ID. BFS hledá nejbližší volný průchodný hex, zachovává pořadí sousedů a rezervuje
každé jednotce jiné místo. Nejde o hledání cesty pohybu, takže hledání pokračuje
i za obsazenými nebo vodními hexy; voda sama není povolené místo příchodu.
Pokud skupina nemá dost míst, nevznikne žádná její část. Do `processedEvents` se
uloží `<původní-klíč>:pending` a jednou se zaloguje čekání. Pozdější kontrola skupinu
zkusí znovu; až při úspěchu odstraní čekání, zapíše původní klíč a ohlásí příchod.
Klíč vždy obsahuje plánované kolo, nikoli kolo skutečného příchodu. Prosté `turn <=`
by u starých savů bez evidence zopakovalo minulé posily, proto se mimo plánované
kolo zkoušejí pouze explicitně čekající skupiny.
Přímé `spawnReinforcements()` vrací počet vytvořených jednotek, nebo `0`, a samo
nezakládá čekající skupinu. Automatické opakování patří scénářovým skupinám.

Načtení sestaví bitvu s `{ restoring: true }`, bez přehrání úvodních událostí,
a obnoví jednotky i `processedEvents` ze savu. Již provedené účinky se neopakují;
budoucí události a posily zůstanou připravené. Testy pokrývají save před příchodem
i po příchodu posil, oba datové formáty, správnou frakci a zachování ID jednotek.

Změny zde nesmějí měnit balanc jako vedlejší efekt refaktoringu. Nová mechanika
nebo oprava jejího chování potřebuje vlastní explicitní očekávání v testu.

## Bezpečný zápis savu

`Game.saveGame()` sestaví snapshot uvnitř ošetření chyb a předá jej do
`SaveGameSystem.write()`. Ten nejprve serializuje JSON, pak skutečně serializovaná
data ověří přes `prepare()`, které používá i načítání. Teprve potom zavolá
`localStorage.setItem()`. Neúspěšný pokus tak nepřepíše poslední funkční save a
hráči se nehlásí úspěch. Validace nemění aktivní jednotky ani factory ID.
Formát zůstává v4; kompatibilita načítání v1–v3 se nemění.

## CSS: zachované pořadí kaskády

`style.css` je pouze vstupní seznam importů. Jeho pořadí odpovídá původnímu souboru:

| Soubor v `styles/` | Odpovědnost |
| --- | --- |
| `base.css` | Proměnné, typografie a základ stránky |
| `battle.css` | Rozložení bitvy, mapa, jednotky a přehledy |
| `dialogs-and-help.css` | Dialogy, tooltip a encyklopedie |
| `campaign.css` | Kampaň, mise, fáze a události |
| `menu-and-results.css` | Hlavní menu, nastavení, výsledky a tutorial |
| `feedback.css` | Animace, indikátory, přístupnost a kronika |
| `field-theme.css` | Výsledné rukopisné téma a jeho přepsání základních stylů |

Rozdělení zachovalo relativní pořadí selektorů i media queries. Pozdější téma stále
přepisuje základní rozložení; soubory se nesmí prostě abecedně seřadit. Validátor
toto pořadí hlídá. Nepřidáváme `@layer`, protože by změnilo prioritu existující CSS.

Při údržbě upravujte vlastníka pravidla místo přidávání dalšího přepsání na konec
souboru. Před sloučením pravidel ověřte media query, specificitu, `!important`
a vztah zkrácených a dílčích vlastností. Duplicitní selektor sám o sobě není chyba.
Po změně stylů obnovte příslušné `?v=` v importu a verzi `style.css` v `index.html`.

## Ověření změn

```bash
node scripts/check.js
```

Příkaz kontroluje syntaxi JavaScriptu, testy jádra, průběhu bitvy, scénářových
událostí, bezpečného ukládání a prezentačního rozhraní, HTML vstup a testy jeho
validátoru, strukturu CSS, překlady a scénáře.
CSS kontrola není plnohodnotný parser: hlídá importy, závorky,
prázdné bloky a existenci assetů.
Testy UI používají zjednodušený DOM a nenahrazují kontrolu v prohlížeči.

`validate-entrypoint.js` má explicitní kontrakt pořadí klasických synchronních
skriptů a porovnává ho i se všemi `.js` soubory v `js/`. Nový runtime soubor je
potřeba zapojit do HTML i kontraktu. Kontroluje lokální `src`, `href` a `poster`,
vstupní stylesheet a dvě současná dynamická místa načítání (hudba a locale soubory
pro jazyky z HTML nabídky). Cesty čte přímo ze zdrojů; při změně způsobu načítání
upravte i validátor a jeho testy. Neprovádí síťové dotazy ani obecnou analýzu JS.
Přesnou velikost písmen ověřuje i na macOS, zakazuje úniky mimo projekt a absolutní
lokální URL, které by nefungovaly pod podadresářem statického hostingu. `<base>`
a `srcset` zatím záměrně odmítá: jejich zavedení vyžaduje rozšíření kontroly cest.

Při změně prezentace zkontrolujte menu, výběr mise, briefing, vybranou jednotku,
průběh tahu a pauzu. Pro rozložení používejte alespoň šířky 390, 753 a 1280 px.
Při větším úklidu CSS porovnejte vypočtené styly i obrazovky s výchozí verzí.

### Automatické kontroly

`.github/workflows/ci.yml` spouští `node scripts/check.js` na Node.js 24 při pushi,
pull requestu a ručním spuštění. Jeden běh má limit pět minut; novější změna ve stejné
větvi nebo pull requestu zruší starší rozpracovaný běh. Není potřeba instalovat
balíčky, přidávat přístupové údaje ani vytvářet build.

Oficiální akce pro checkout a Node.js jsou připnuté na konkrétní commity. Při jejich
aktualizaci ověřte tag v původním repozitáři a aktualizujte hash i komentář verze.
Workflow má pouze `contents: read`, neukládá Git credentials a nic nepublikuje.
Konfigurace vychází z [oficiálního návodu GitHub Actions](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs).
Úspěšná lokální kontrola nepotvrzuje vzdálený běh: ten ověřte v Actions po pushi.
Povinné kontroly pro merge se nastavují zvlášť; tento workflow je sám nezapíná.

## Co ještě není oddělené

Toto je hranice prezentace bitvy, nikoli dokončená přestavba celé aplikace.
`Game` stále koordinuje mnoho pravidel a používá zvuk, lokalizaci a ukládání.
`HexGrid` spojuje hexovou geometrii s Canvas rendererem. `MoraleSystem` a
`TutorialSystem` ještě obsahují vlastní dialogy a `main.js` řídí obrazovky globálně.
V CSS zůstává samostatná vrstva pozdějšího tématu a v panelech inline styly.

Další menší krok může oddělit hexovou geometrii od kreslení. Sloučení základních
stylů s tématem už potřebuje samostatnou vizuální regresi; nemá se míchat s úpravami
pravidel nebo balancu.
