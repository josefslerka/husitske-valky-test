# Jak spustit hru

Ve složce projektu spusťte:

```bash
python3 -m http.server 8000
```

Otevřete [localhost:8000](http://localhost:8000). Terminál nechte během hraní
otevřený; server ukončíte pomocí `Ctrl+C`. Pokud je port obsazený, použijte
`python3 -m http.server 8001` a otevřete [localhost:8001](http://localhost:8001).
Není potřeba instalovat balíčky ani sestavovat aplikaci.

Samotný `index.html` přes `file://` nestačí: prohlížeč může zablokovat překlady.
Hra v takovém případě zobrazí česko-anglickou zprávu s návodem, místo nečitelných
překladových klíčů. Pokud chyba trvá i přes HTTP, obnovte stránku a ověřte, že jste
server spustili ve složce obsahující `index.html` i adresář `js`.

## První hraní

1. Zvolte **První bitva: Živohošť**. Otevřou se rozkazy, hlavní cíl a rozbalené
   stručné ovládání; bitva začne až tlačítkem **Zahájit bitvu**.
2. Na mapě vyberte vlastní oddíl. Zelená pole jsou pohyb, červeně zvýraznění
   nepřátelé možné útoky. Řádek pod mapou napoví podle aktuální situace.
3. Po rozkazech ukončete tah. Není časový limit na přemýšlení ani povinnost
   využít každou akci. Hlavní cíl zůstává nad mapou, bonusové cíle jsou volitelné.
4. Po bitvě uvidíte důvod konce. Pokud se zápis podařilo uložit, **Vaše kronika**
   otevře její vyprávění; **Zkusit znovu** umožní další pokus.

Jiné odemčené bitvy najdete přes **Vybrat bitvu**. Jazyk lze přepnout vlaječkou
v menu nebo v **Nastavení**. Pro první test doporučujeme počítač s myší;
dotykové ovládání ještě není optimalizované.

Save i kronika zůstávají v úložišti daného prohlížeče a webové adresy. Jiný port,
prohlížeč nebo soukromé okno mohou proto ukázat prázdný postup. Stažená kronika
je čtenářský archiv, nikoli záloha rozehrané hry.

Pozorovatelé najdou krátký scénář a zápis zpětné vazby v
[podkladu pro playtest](docs/ACT_I_PLAYTEST.md). Technické kontroly jsou v [README](README.md).
