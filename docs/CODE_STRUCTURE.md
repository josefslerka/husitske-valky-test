# Struktura kódu a pravidla údržby

## Bitva: pravidla a prezentace

`Game` vlastní stav bitvy a koordinuje tahy, scénáře, výběr jednotek, pohyb a herní
systémy. `CombatSystem` provádí souboje. Ani jedna třída přímo nepracuje s DOM nebo
s animační smyčkou prohlížeče.

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
`BattlePanels`, `BattleTooltip` a `BattleView` načítají před `Game`.

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

Příkaz kontroluje syntaxi JavaScriptu, 13 testů jádra, 17 regresí průběhu bitvy,
8 testů prezentačního rozhraní, strukturu CSS, překlady a scénáře. CSS kontrola není
plnohodnotný parser: hlídá importy, závorky, prázdné bloky a existenci assetů.
Testy UI používají zjednodušený DOM a nenahrazují kontrolu v prohlížeči.

Při změně prezentace zkontrolujte menu, výběr mise, briefing, vybranou jednotku,
průběh tahu a pauzu. Pro rozložení používejte alespoň šířky 390, 753 a 1280 px.
Při větším úklidu CSS porovnejte vypočtené styly i obrazovky s výchozí verzí.

## Co ještě není oddělené

Toto je hranice prezentace bitvy, nikoli dokončená přestavba celé aplikace.
`Game` stále koordinuje mnoho pravidel a používá zvuk, lokalizaci a ukládání.
`HexGrid` spojuje hexovou geometrii s Canvas rendererem. `MoraleSystem` a
`TutorialSystem` ještě obsahují vlastní dialogy a `main.js` řídí obrazovky globálně.
V CSS zůstává samostatná vrstva pozdějšího tématu a v panelech inline styly.

Další menší kroky mohou oddělit geometrii od kreslení a vyvést scénářové události
z `Game`. Sloučení základních stylů s tématem už potřebuje samostatnou vizuální
regresi; nemá se míchat s úpravami pravidel nebo balancu.
