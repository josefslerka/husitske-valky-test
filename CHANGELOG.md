# 📜 Changelog

## Stabilizace bitev (6. září 2026)

- Opravená předčasná porážka na Sionu a dvojí ztráta morálky kvůli žízni.
- Útok spotřebuje akci okamžitě; dvojklik, konec tahu a ukládání nemohou přerušit rozpracovaný souboj.
- AI čeká na celý nájezd, reakční palbu i protiútok, také při zrychlení.
- Zvýraznění cílů i provedení útoku používá společnou kontrolu viditelnosti.
- Jednotné načítání celé bitvy s validací savu před výměnou instance; save v4 a kompatibilita v1–v3.
- Pauza zastavuje čekající akce. Výměna bitvy ruší staré časovače a listenery minimapy.
- Rychlá bitva nepřebírá cíle předchozí mise; po načtení nezůstávají stará čísla poškození.
- Integrační regrese nad skutečnými třídami; původní AI testy používají skutečnou hexovou mřížku.
- Jediný příkaz pro všechny kontroly: `node scripts/check.js`.

## Připravovaná Alpha 0.2 (3. září 2026)

### Nové
- Názvy míst na všech 18 mapách, respektující fog of war a jazyk hry.
- Scénářové doktríny AI: útok jízdy, pronásledování, hledání boků, klamný ústup a držení vozové hradby.
- Kampaňová pověst, odemykání aktů a jednorázový zlom po Lipanech.
- Shrnutí čtyř aktů a kronika vítězné protistrany; Sion zachovává kronikářskou i archeologickou verzi.
- Lokalizační validátor a deterministický testovací balík herního jádra.

### Změny
- Historické přesily u Hořic, Tachova a Domažlic jsou vyjádřeny počtem žetonů a doktrínou AI, ne navýšením HP.
- Ústí dostalo dvě jednotky husitské šlechtické jízdy; Plzeň mechanický tlak hladu a dezercí.
- Dynamické panely, jednotky, tooltipy, události a kampaň se překládají bez reloadu.
- Rozhraní při šířce 753 px dovoluje sbalit boční panely bez překrývání obsahu.

### Opravy
- Úplný datový kontrakt událostí, fronta notifikací, jednotná evidence úmrtí a routu.
- Save v3 ukládá čas, pověst, AI stance a stav jednorázových mechanik.
- Nová bitva čistí starý herní log; opravené překlady tlačítka zvuku a briefingu Hořic.

## Alpha 0.1 (3. února 2026)

### ✨ Features
- 🎮 18 historických scénářů
- 🎓 Interaktivní tutorial
- 🏰 Kompletní bojový systém s morálkou
- 🗺️ Fog of War systém
- 👑 Velitelské schopnosti a aury
- 🎯 Vítězné podmínky (survive, destroy, hold position, escape...)
- 🤖 AI protivník
- 📚 Encyklopedie (jednotky, taktika, historie)
- 💾 Save/Load system
- 🎵 Hudba a zvukové efekty

### 🎨 Design
- Středověký rukopis styl
- Parchment textury
- Zlaté ornamenty
- Palatino Linotype font (konzistentní napříč celou hrou)

### ⚖️ Balance
- Všechny scénáře validní (0 chyb)
- Balance ratio: průměr 1.05
- Opravené unit types
- Implementované všechny victory conditions

### 🐛 Známé problémy
- AI občas dělá divné tahy
- Mobile UX není optimalizováno
- Některé scénáře mohou být těžké
- Save může selhat v některých prohlížečích

---

## Plánované pro Beta 0.2
- 🎮 Multiplayer/hotseat mode
- 🛠️ Scenario editor
- 🏆 Achievement system
- 🌍 Lokalizace (EN/CZ)
- 📱 Mobile optimalizace
- 🤖 Vylepšená AI

---

**Alpha = Testovací verze s bugy**
**Beta = Téměř hotová verze**
**Release = Finální verze**
