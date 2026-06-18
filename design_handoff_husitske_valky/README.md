# Handoff: Husitské Války — UI redesign

## Přehled
Kompletní vizuální redesign tahové strategie **Husitské války** (1419–1437).
Pokrývá čtyři hlavní obrazovky:

1. **Hlavní menu** — logo, hlavní akce, patička.
2. **Encyklopedie** — modální okno se záložkami (Historie, Jednotky, Osobnosti, Taktika, Terén, Pravidla, Ovládání, O hře).
3. **Výběr kampaně / mise** — modální okno s érami a seznamem misí.
4. **Bojová obrazovka** — hexová mapa s terénem, levý panel jednotky, pravý panel přehledu armád, cíle mise, minimapa, spodní lišta akcí.

Cíl redesignu byl: **čitelnost a přehlednost UI**, **atmosféra**, **konzistence napříč obrazovkami**, **profesionální/„hotový" dojem** a **lepší proporce**. Emoji ikony byly nahrazeny jednotnými liniovými (vektorovými) ikonami.

---

## O design souborech
Soubor v tomto balíčku (`Husitske Valky.dc.html`) je **designová reference vytvořená v HTML** — prototyp ukazující zamýšlený vzhled a chování, **ne produkční kód k přímému zkopírování**.

Úkol je **znovu vytvořit tento design ve vašem existujícím prostředí/enginu hry** (React, Vue, Svelte, Phaser, Unity UI, vlastní canvas engine…) podle zavedených vzorů projektu. Pokud prostředí ještě neexistuje, zvolte nejvhodnější framework. HTML/CSS hodnoty níže berte jako přesnou specifikaci tokenů, ne jako kód k vložení.

> Pozn.: `.dc.html` je „Design Component" — otevře se přímo v prohlížeči. Nahoře je lišta **NÁHLED** pro přepínání obrazovek; **ta je pouze pro náhled a do hry nepatří.** Hexová mapa a žetony jsou vykresleny z dat v JS (funkce `buildMap`) — slouží jen k ukázce rozložení, ve hře je nahradíte vlastním renderem dlaždic.

## Fidelita
**High-fidelity (hifi).** Finální barvy, typografie, rozestupy, ikony a stavy. Implementujte UI pixel-přesně pomocí knihoven a vzorů vašeho projektu. Ilustrace (malovaný erb hry, případné sprity jednotek) si ponechte jako rastrové assety — styl k nim sedí.

---

## Design tokens

### Barvy
| Token | Hodnota | Použití |
|---|---|---|
| `bg/deep` | `#0b0805` → `#0a0704` | nejtmavší podklad |
| `bg/app` | `radial-gradient(125% 95% at 50% 32%, #2c2114 0%, #19120b 46%, #0a0704 100%)` | pozadí menu/aplikace (+ jemná diagonální textura, viz níže) |
| `bg/panel` | `linear-gradient(160deg, #241c12, #17110b)` | modální okna, karty |
| `bg/panel-rail` | `linear-gradient(180deg, #1a140c, #100b06)` | boční panely v bitvě |
| `gold/primary` | `#ecd283` | nadpisy, aktivní prvky |
| `gold/bright` | `#f4e0a0` / `#f2da8a` | světlý gradient tlačítek, zvýraznění |
| `gold/deep` | `#c8a03a` / `#b8902f` | spodek zlatého gradientu, okraje |
| `gold/heading` | `#e6b84a` | nadpis sekce v obsahu |
| `gold/subhead` | `#e0a93f` | podnadpisy v textu |
| `text/body` | `#ddcba4` / `#e3d6b8` / `#ecdcb6` | běžný text |
| `text/muted` | `#a08f6c` / `#8a774d` | sekundární text, popisky |
| `text/label` | `#897650` | mikropopisky pod statistikami |
| `crimson/base` | `#a8313f` → `#6e1c27` | primární akce (Ukončit tah), strana Husité |
| `crimson/text` | `#d0606c` | text „HUSITÉ" |
| `crimson/border` | `rgba(200,90,100,.4–.5)` | okraje červených prvků |
| `blue/base` | `#4f86c6` → `#2b5b8c` | strana Křižáci, modré žetony |
| `blue/text` | `#7fa6da` | text „KŘIŽÁCI" |
| `hp/green` | `linear-gradient(90deg, #6fae3f, #9bd05a)` | proužky zdraví / morálky |
| `border/gold-soft` | `rgba(214,178,84,.18–.30)` | jemné okraje karet |
| `border/gold-strong` | `rgba(214,178,84,.45–.60)` | okraje modalů |

#### Barvy terénu (hex dlaždice)
| Terén | Výplň |
|---|---|
| Louka (grass) | `linear-gradient(155deg, #74a04c, #5a8438)` |
| Voda (water) | `linear-gradient(155deg, #3f7fb8, #2b5b8c)` |
| Písek/pole (sand) | `linear-gradient(155deg, #cdac6c, #a98a4f)` |
| Kopec (hill) | `linear-gradient(155deg, #c9aa6e, #a3814b)` |
| Zvýraznění pohybu | výplň `rgba(233,207,134,.28)`, okraj `inset 0 0 0 2px rgba(244,224,160,.85)` |
| Zvýraznění útoku | výplň `rgba(180,50,63,.32)`, okraj `inset 0 0 0 2px rgba(220,90,100,.9)` |
| Vnitřní okraj dlaždice | `inset 0 0 0 1px rgba(20,30,10,.22)` |

#### Textura pozadí
Přes radiální gradient se vrství jemný diagonální šrafur:
`repeating-linear-gradient(125deg, rgba(255,214,128,.018) 0 2px, transparent 2px 8px)`

### Typografie
- **Display / nadpisy / tlačítka / popisky:** `Cinzel` (váhy 500–800)
- **Běžný text / popisy / názvy jednotek:** `EB Garamond` (400–600, kurzíva pro datumy a popisy)

| Role | Font | Velikost | Váha | Letter-spacing |
|---|---|---|---|---|
| Titulek hry (menu H1) | Cinzel | 55px | 800 | .05em |
| Titulek modalu | Cinzel | 33–34px | 700 | .07em |
| Nadpis obsahu (H3) | Cinzel / EB Garamond | 23–25px | 700 | .04em |
| Podnadpis v textu (H4) | EB Garamond | 19px | 600 | .02em |
| Tělo textu | EB Garamond | 16–16.5px | 400 | — (line-height 1.6) |
| Tlačítko primární | Cinzel | 16px | 700 | .07em |
| Tlačítko sekundární | Cinzel | 13–15px | 600 | .05–.06em |
| Popisek/caps (UTOK, ZDRAVÍ…) | Cinzel | 9–11px | 600 | .14–.20em |
| Datum/popis (kurzíva) | EB Garamond italic | 13–15px | 400 | — |

### Rádiusy a rozměry
- Rádiusy: pilulky/tlačítka `7–8px`, karty `10–12px`, modaly `14px`, žeton jednotky `50%`.
- Stínování karet: `0 2px 8px rgba(0,0,0,.4)`, modaly `0 24px 60px rgba(0,0,0,.6)`.
- Vnitřní světlo: `inset 0 1px 0 rgba(214,178,84,.08–.12)`.
- **Designová plocha: 1280 × 720 px**, škálovaná na výšku/šířku viewportu (`Math.min(vw/1280, vh/720)`).
- Bitva: horní lišta `66px`, spodní lišta `58px`, levý panel `248px`, pravý panel `236px`.
- Mřížka tlačítek menu: 3 sloupce × `238px`, výška řádku `74px`, mezera `16px`.

### Ikony
Jednotná **liniová** sada, `viewBox 0 0 24 24`, `stroke-width 1.7`, `linecap/linejoin: round`. Vyplněné jsou jen: srdce (zdraví), hvězda (hodnocení/velitel), blesk (schopnost/událost), stopy (pohyb).
Použité názvy: `swords` (útok/nová hra), `scroll` (pokračovat), `book` (encyklopedie), `bolt` (rychlá bitva/událost/schopnost), `info` (o hře), `gear` (nastavení), `chalice` (kalich = znak husitů / kněz), `flail` (cep), `bow` (kuše), `horseshoe` (jízda), `spear` (sudlice), `cross` (křižáci), `wagon` (vůz), `shield` (obrana), `range` (dosah), `move` (pohyb), `heart` (zdraví), `star` (velitel), `target` (hlavní cíl), `diamond` (vedlejší cíl), `music` (hudba), menu (tři čáry).
Přesné `path` data jsou v metodě `icon(name, color, size)` v souboru — překlopte je do vašeho icon systému (SVG sprite / komponenty).

---

## Obrazovky

### 1. Hlavní menu
- **Účel:** vstupní rozcestník.
- **Layout:** vystředěný sloupec. Shora: kruhový medailon s kalichem (108px, zlatý okraj, radiální tmavé pozadí) → titulek `HUSITSKÉ VÁLKY` → oddělovač s textem `TAHOVÁ STRATEGIE` (čára–text–čára) → mřížka 3×2 tlačítek → patička.
- **Tlačítka (pořadí):** `NOVÁ HRA` (primární, zlaté) · `POKRAČOVAT` · `ENCYKLOPEDIE` · `RYCHLÁ BITVA` · `O HŘE` · `NASTAVENÍ` (sekundární, tmavá se zlatým okrajem). Každé má vlevo liniovou ikonu.
  - Primární tlačítko: `linear-gradient(180deg,#f2da8a 0%,#dab44e 46%,#c39a32 100%)`, text `#2a1c08`, `box-shadow:0 2px 0 #856420, 0 7px 16px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.55)`.
  - Sekundární: `linear-gradient(180deg,#2c2417,#1c1610)`, okraj `1px rgba(214,178,84,.3)`, text `#e6d09a`.
  - Hover (obě): `filter:brightness(1.08); transform:translateY(-1px)`.
- **Patička:** přepínač `Hudba` (s tečkou stavu `#7fb53f`), jazykový odznak `CZ`, verze `Alpha 0.1 · 03.02.2026`.

### 2. Encyklopedie (modal)
- **Rozměr:** 930 × 606px, vystředěno na ztmaveném pozadí (`rgba(0,0,0,.45)`).
- **Hlava:** titulek `ENCYKLOPEDIE`, vpravo nahoře zavírací `×` (hover zčervená).
- **Záložky:** 8 ks, zalamují se; aktivní = zlatá s „připojením" k obsahu (spodní okraj transparentní), neaktivní tmavé.
- **Obsah (scroll):** nadpis sekce (`#e6b84a`) + zlatá podtržítková linka, pak:
  - **Textové sekce** (Historie, Osobnosti, Taktika, Terén, Pravidla, Ovládání, O hře): bloky H4 (podnadpis se slábnoucí linkou) + odstavec.
  - **Jednotky:** karty jednotek — viz níže.
- **Karta jednotky:** ikonová destička (46px, červený gradient) + název (`#ecc15a`) + kategorie (caps). Pod tím řádek 5 statistik (Zdraví, Útok, Obrana, Dosah, Pohyb — ikona + číslo + popisek), pruh schopnosti (blesk + text, levý zlatý accent `border-left:3px #d8b350`), kurzíva popis.

### 3. Výběr kampaně (modal)
- **Rozměr:** 880 × 606px.
- **Hlava:** `KAMPAŇ: HUSITSKÉ VÁLKY` + podtitul `1419–1437` + zavírací `×`.
- **Éry:** 4 tlačítka v řadě (`I. Zrození` 1419–1420, `II. Žižkova éra` 1421–1424, `III. Prokopova éra` 1425–1431, `IV. Konec` 1433–1437). Aktivní zlaté.
- **Seznam misí (scroll):** řádek = kruhový číselný odznak (červený gradient, zlatý okraj) + název + datum (kurzíva) + hvězdy hodnocení (vpravo, splněné `#f4d35e`, prázdné `#574a2b`) + popis. Aktivní/vybraná mise má zlatý highlight.

### 4. Bojová obrazovka
- **Horní lišta (66px):** vlevo mini-erb (kalich), uprostřed název bitvy (`Bitva u Živohoště`) + řádek s datem a červenou pilulkou události (blesk + `PŘEKVAPIVÝ ÚTOK` + popis), vpravo stavové pilulky `Tah: Husité` (červená) a `Kolo: 1` (zlatá).
- **Levý panel `JEDNOTKA` (248px):** vybraná jednotka — ikona + název + kategorie, proužek zdraví (text `80 / 100`), 2×2 mřížka statistik, pruh schopnosti, dole akční tlačítka: `ÚTOK` (primární zlaté) + `POHYB` / `BRÁNIT` (sekundární). Prázdný stav: text *„Vyberte jednotku"*.
- **Mapa (střed):** hexová mřížka (pointy-top), terén s texturami (travní trsy, vodní vlnky, dashed pole, kopce), krajinné prvky (shluky stromů, vesnice = domky), žetony jednotek (modří = Husité hráč, červení = Křižáci), zvýraznění pohybu (zlaté) a útoku (červené). Žeton = barevný kruh s okrajem + liniová ikona zbraně + proužek HP pod ním; velitel má hvězdu a vybraná jednotka zlatý prsten + záři.
- **Cíle mise (overlay vpravo nahoře):** karta `CÍLE MISE` se zavíracím ×; hlavní cíl s ikonou terče (`target`, tučně), vedlejší s kosočtvercem (`diamond`).
- **Minimapa (vpravo dole):** 178×114px, zelený podklad, modré/červené tečky + zlatý obdélník viewportu.
- **Pravý panel `PŘEHLED` (236px):** dvě armády. Hlavička strany (ikona + název v barvě strany + počet `6/6` / `11/11`), pruh morálky `100%`, seznam jednotek (řádky s levým barevným accentem strany, ikona + název + ❤ HP).
- **Spodní lišta (58px):** `UKONČIT TAH` (primární červené), `CHORÁL` (červené sekundární), `CÍLE` (zlatý okraj), uprostřed log zpráv (*„Husité začínají."*), vpravo `MENU`.

---

## Interakce a chování
- **Navigace menu:** Nová hra → výběr kampaně; Pokračovat / Rychlá bitva → bitva; Encyklopedie → modal (záložka Historie); O hře → modal (záložka O hře). Zavírací `×` → zpět do menu.
- **Záložky encyklopedie / éry kampaně / mise:** klik přepne aktivní stav (zlatý highlight).
- **Hover stavy:** tlačítka zesvětlují (`brightness`) a/nebo se nadzvednou; sekundární zesvětlují okraj na `rgba(214,178,84,.6)`; zavírací × dostane červené pozadí.
- **Bitva:** výběr jednotky → naplní levý panel + zvýrazní dosažitelná pole (pohyb) a cíle (útok) na mapě. Tlačítka Útok/Pohyb/Bránit přepínají režim. Ukončit tah předá tah druhé straně.
- **Škálování:** celá scéna je navržena na 1280×720 a škáluje se transformem na velikost okna (origin = střed). Ve hře nahraďte vlastním layoutem/kamerou.
- **Přechody:** jemné `transition: all .15s` na interaktivních prvcích.

## Stav (state)
Z prototypu (přizpůsobte svému enginu):
- `screen`: `'menu' | 'kampan' | 'enc' | 'bitva'`
- `encTab`: aktivní záložka encyklopedie
- `era`: vybraná éra kampaně; `selMission`: vybraná mise
- `music`: zapnutá hudba (bool)
- Bitva (reálná hra): vybraná jednotka, dosažitelná/útočná pole, jednotky stran s HP/morálkou, kolo, aktivní strana, log, cíle mise.

## Assets
- Veškeré ikony jsou **inline SVG liniové ikony** (žádné externí soubory) — viz metoda `icon()`. Doporučení: vytvořit z nich SVG sprite / komponenty ve vašem projektu.
- Krajinné prvky (stromy, vesnice) a terénní textury jsou rovněž vykresleny kódem (metody `feature()`, `hexDecor()`) — ve hře nahraďte spritey/dlaždicemi, ale dodržte barevnou paletu výše.
- Fonty: **Cinzel** a **EB Garamond** (Google Fonts).
- Původní malovaný erb hry („Husitské války" crest) si ponechte jako rastr — nový styl je s ním kompatibilní.

## Soubory
- `Husitske Valky.dc.html` — kompletní hifi prototyp všech čtyř obrazovek (přepínač NÁHLED nahoře = jen pro náhled). Logika a všechny styly/ikony jsou uvnitř.
