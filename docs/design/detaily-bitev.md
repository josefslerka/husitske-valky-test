# Kompletní databáze 15 bitev husitských válek pro herní briefing

## Úvod

Tato databáze obsahuje detailní historický výzkum **15 klíčových bitev husitských válek (1419-1434)** ve strukturovaném formátu pro herní briefing. Každá bitva je zpracována s historickými citáty, briefingem pro hráče a poznámkami o spolehlivosti pramenů.

---

## BITVA 1: BITVA U ŽIVOHOŠTĚ

```json
{
  "battleId": "zivohosť_1419",
  "name": "Bitva u Živohoště",
  "date": "4. listopadu 1419",
  "dateNote": "Původní požadavek uváděl červen/červenec 1420, ale historicky správné datum je 4. listopadu 1419 - PRVNÍ větší střet husitských válek",
  "location": "Oblast mezi Živohoští a Novým Knínem, okres Příbram/Benešov",
  "hussiteSide": {
    "commanders": ["Břeněk Švihovský z Rýzmburka", "Václav Koranda", "Chval a Kuneš z Machovic"],
    "strength": "~4 300 poutníků",
    "composition": "Polovojensky organizovaní poutníci, venkované, měšťané"
  },
  "enemySide": {
    "commanders": ["Petr Konopišťský ze Šternberka", "Jan Ptáček z Pirkštejna"],
    "strength": "~1 300 jezdců",
    "composition": "Těžká jízda české katolické šlechty"
  },
  "terrain": {
    "description": "Vyvýšenina poblíž přechodu přes Vltavu",
    "tacticalAdvantage": "Husité využili vyvýšenou pozici, vozová hradba NEBYLA použita"
  },
  "battlePhases": [
    {"name": "Záchytný boj jihočeských", "description": "Jihočeští poutníci narazili na Šternberkovu jízdu"},
    {"name": "Rozražení skupiny", "description": "Jízdní houf rozrazil jihočeskou sestavu"},
    {"name": "Improvizovaná obrana", "description": "Zeď z kamení odrazila další útoky"},
    {"name": "Příchod posil", "description": "Posily z Nového Knína přinutily k ústupu"}
  ],
  "briefing": "Bratři a sestry v Kristu! Nepřítel nám zastoupil cestu k Praze - Šternberkova jízda čeká v údolí. Rychle postavte zeď z kamení a připravte se k boji! Dnes rozhodne Bůh, zda dojdeme na pražský sjezd!",
  "historicalQuotes": [
    {"text": "Pan Petr vyjel se svými šikem proti Ústeckým, rozrazil je a celý jeho houf jezdců skrz ně projel.", "source": "Staré letopisy české"}
  ],
  "aftermath": "Nerozhodná bitva. Zajatí husité vhozeni do kutnohorských šachet.",
  "trivia": ["Historicky PRVNÍ větší střet husitských válek", "Vozová hradba nebyla použita", "Petr ze Šternberka padl později na Vítkově"],
  "casualties": {"hussites": "~100+ mrtvých/zajatých", "enemy": "Neznámé"},
  "historicalReliability": "Středně spolehlivé. Dva hlavní prameny, méně podrobné popisy."
}
```

---

## BITVA 2: BITVA U NEKMÍŘE

```json
{
  "battleId": "nekmir_1419",
  "name": "Bitva u Nekmíře",
  "date": "Prosinec 1419 nebo leden 1420",
  "location": "Poblíž tvrze Nekmíř, 17 km SZ od Plzně",
  "hussiteSide": {
    "commanders": ["Jan Žižka z Trocnova"],
    "strength": "~300 pěších, 7 vozů",
    "composition": "Pěchota z Plzně, vozy s děly a beranidly"
  },
  "enemySide": {
    "commanders": ["Bohuslav ze Švamberka"],
    "strength": "Přes 2 000 jízdních i pěších",
    "composition": "Těžká jízda plzeňského landfrýdu"
  },
  "terrain": {
    "description": "Pole poblíž tvrze Nekmíř",
    "tacticalAdvantage": "PRVNÍ POUŽITÍ VOZOVÉ HRADBY v husitských válkách"
  },
  "battlePhases": [
    {"name": "Střetnutí", "description": "Švamberk dostihl Žižku na cestě"},
    {"name": "Útok jízdy", "description": "Útok pouze jízdním houfem"},
    {"name": "Obrana vozů", "description": "Žižka odrazil útok kombinací palných zbraní"},
    {"name": "Pokračování", "description": "Husité pobořili tři tvrze"}
  ],
  "briefing": "Bratři! Nepřítel má převahu pět ku jedné. Ale my máme vozy a víru v Boha. Postavte hradbu z vozů a střelte do koní! Dnešní noc budeme spát v jejich tvrzích!",
  "historicalQuotes": [
    {"text": "Žižka ho odrazil od vozů a zabil Hynka z Nekmíře. Pak táhl dál svou cestou a tu noc pobořil tři opevněné tvrze.", "source": "Staré letopisy české"}
  ],
  "aftermath": "Husitské vítězství. PRVNÍ doložené použití vozové hradby.",
  "trivia": ["Pouze 7 vozů - formace půlkruhu", "Bohuslav ze Švamberka se později PŘIDAL k husitům!", "Památník postaven až 2017"],
  "casualties": {"hussites": "Nízké", "enemy": "Značné, včetně Hynka z Nekmíře"},
  "historicalReliability": "NÍZKÁ. Pouze jeden pramen (Staré letopisy české). Mnoho spekulací."
}
```

---

## BITVA 3: BITVA U SUDOMĚŘE

```json
{
  "battleId": "sudomer_1420",
  "name": "Bitva u Sudoměře",
  "date": "25. března 1420",
  "location": "Mezi rybníky Markovec a Škaredý, 14 km od Strakonic",
  "hussiteSide": {
    "commanders": ["Břeněk Švihovský z Rýzmburka (PADL)", "Jan Žižka z Trocnova", "Valkoun z Adlaru", "Chval z Machovic"],
    "strength": "400 pěších, 12 vozů, 9 jezdců",
    "composition": "Rolníci, měšťané, ženy, děti, kněží"
  },
  "enemySide": {
    "commanders": ["Jindřich z Hradce (SMRTELNĚ ZRANĚN)", "Bohuslav ze Švamberka", "Petr ze Šternberka"],
    "strength": "700-2 000 těžkých jezdců",
    "composition": "Těžká jízda, johanité, zbrojnoši landfrýdu"
  },
  "terrain": {
    "description": "Úzká hráz mezi rybníky - Markovec napuštěný, Škaredý bahnitý",
    "tacticalAdvantage": "KLÍČOVÝ FAKTOR VÍTĚZSTVÍ - bahno uvěznilo sesedlé rytíře"
  },
  "battlePhases": [
    {"name": "Odmítnutá kapitulace", "description": "Katolíci odmítli vyjednávat"},
    {"name": "Útok johanitů", "description": "300 mužů po hrázi - velké ztráty"},
    {"name": "Obchvat", "description": "400 jezdců přes rybník - uvízli v bahně"},
    {"name": "Masakr v bahně", "description": "Pěchota s cepy pobíjela sesedlé rytíře"},
    {"name": "Příchod tmy", "description": "Bitva skončila s tmou a mlhou"}
  ],
  "briefing": "Bratři a sestry! Železní páni odmítli naši kapitulaci. Ale Bůh nám dal toto místo - bahnitý rybník a úzkou hráz. Střelte do koní, a když sesednou, pobijte je cepy! Pán Bůh je s námi!",
  "historicalQuotes": [
    {"text": "...v den zvěstování Panny Marie pan Břeněk ze Švihova, Valkoun z Adlaru a Jan Žižka s jinými bratřími...", "source": "Vavřinec z Březové"}
  ],
  "aftermath": "Husitské vítězství. Základ Žižkovy pověsti neporazitelného vojevůdce.",
  "trivia": ["Žižka byl jednooký a ~60 let starý", "LEGENDA o závojích je výmysl Piccolominiho", "Jindřich z Hradce zraněn šipkou DO PALCE"],
  "casualties": {"hussites": "~30-40 padlých včetně Břeňka", "enemy": "Větší než husitské"},
  "historicalReliability": "VYSOKÁ. Nejlépe zdokumentovaná raná bitva díky Vavřinci z Březové."
}
```

---

## BITVA 4: BITVA NA VÍTKOVĚ

```json
{
  "battleId": "vitkov_1420",
  "name": "Bitva na Vítkově",
  "date": "14. července 1420, kolem 16:00",
  "location": "Vrch Vítkov, Praha 3 - Žižkov",
  "hussiteSide": {
    "commanders": ["Jan Žižka z Trocnova"],
    "strength": "~60 obránců + posily (~50 střelců, cepníci)",
    "composition": "Střelci s hákovnicemi, cepníci, 3 ženy"
  },
  "enemySide": {
    "commanders": ["Zikmund Lucemburský", "Bedřich IV. Bojovný", "Heinrich z Isenburgu (PADL)", "Pippo Spano"],
    "strength": "~30 000 celkem; 7-8 000 útočníků na Vítkov",
    "composition": "Mezinárodní křižácká armáda"
  },
  "terrain": {
    "description": "Protáhlý hřeben se strmými svahy, dřevěné sruby",
    "tacticalAdvantage": "Úzká přístupová cesta neumožnila využít převahu"
  },
  "battlePhases": [
    {"name": "Předstíraný útok", "description": "13. července na Špitálském poli"},
    {"name": "Hlavní útok", "description": "14. července - 7-8 tisíc oděnců na sruby"},
    {"name": "Kritický moment", "description": "Žižka téměř zabit - vyrvali ho cepy z rukou nepřátel"},
    {"name": "Zlom", "description": "Příchod posil - kněz se svátostí, střelci, cepníci"},
    {"name": "Protiútok", "description": "Bojový pokřik 'Hrrr na ně!'"},
    {"name": "Útěk", "description": "Mnozí se zřítili ze skalnatého svahu"}
  ],
  "briefing": "Bratři! Antikrist Zikmund obléhá naše svaté město! Držte sruby za každou cenu - pokud Vítkov padne, Praha bude obklíčena! Střelte do koní, sekejte do nohou - zde rozhodne víra, ne počet! Hrrr na ně!",
  "historicalQuotes": [
    {"text": "I Žižka přišed tam byl by zabit, kdyby ho jeho lidé nebyli cepy vyrvali z rukou nepřátel.", "source": "Vavřinec z Březové"},
    {"text": "A nepřátelé uviděvše svátost a uslyševše zvonění zvonku a silný křik lidu, zachváceni náramným strachem se dali na útěk...", "source": "Vavřinec z Březové"}
  ],
  "aftermath": "Rozhodné vítězství. 30. července rozpuštění křížové výpravy. 14. červenec je Památný den české armády.",
  "trivia": ["3 ŽENY bránily Vítkov", "Pokřik 'Hrrr na ně!' se stal heslem", "Jezdecká socha Žižky - třetí největší na světě"],
  "casualties": {"hussites": "Jednotky až desítky", "enemy": "100-300 padlých"},
  "historicalReliability": "VYSOKÁ. Vavřinec z Březové byl přímý účastník."
}
```

---

## BITVA 5: BITVA POD VYŠEHRADEM

```json
{
  "battleId": "vysehrad_1420",
  "name": "Bitva pod Vyšehradem",
  "date": "1. listopadu 1420, po 8:00 ráno",
  "location": "Pankrácká pláň, okolí kostela sv. Pankráce",
  "hussiteSide": {
    "commanders": ["Hynek Krušina z Lichtenburka (25 let)", "Jan Žižka", "Diviš Bořek z Miletínka"],
    "strength": "15-20 000 mužů",
    "composition": "Pražané, orebité, táboři, žatečtí, lounští"
  },
  "enemySide": {
    "commanders": ["Zikmund Lucemburský", "Jindřich z Kravař (PADL)", "Mikšík Divůček (první na útěku)"],
    "strength": "15-20 000 mužů",
    "composition": "Uhři, Němci, Slezané, česká katolická šlechta"
  },
  "terrain": {
    "description": "Rovinatá pláň s bočním úvozem k Podolí",
    "tacticalAdvantage": "Boční úvoz se stal pastí pro šlechtu"
  },
  "battlePhases": [
    {"name": "Kapitulační dohoda", "description": "Posádka měla kapitulovat v 8:00"},
    {"name": "Zikmundovo zpoždění", "description": "Přijel PO 8:00 - posádka nezasáhla"},
    {"name": "Čelní útok", "description": "Uherská jízda k sv. Pankráci"},
    {"name": "Boční útok", "description": "Šlechta úvozem - uvězněna v mokřinách"},
    {"name": "Zlom", "description": "Orebité strhl ustupující Pražany k odporu"},
    {"name": "Masakr v úvozu", "description": "Šlechta zmasakrována, nebrali zajatce"}
  ],
  "briefing": "Bratři! Vyšehradská posádka hladoví a Zikmund táhne k její záchraně! Držíme příkopy u sv. Pankráce. Jejich šlechta pohrdá námi - dnes jim ukážeme sílu božích bojovníků! Ať ani jeden železný pán neunikne!",
  "historicalQuotes": [
    {"text": "[Panstvo] hrdě dalo králi na vědomí, že půjde do ohně i tam, kde on sám jistě nebude.", "source": "Jindřich Plumlovský k Zikmundovi"}
  ],
  "aftermath": "Rozhodné vítězství - 'podstatně větší než na Vítkově'. Rozpad královské strany.",
  "trivia": ["Padlo 25 KOROUHEVNÍCH PÁNŮ", "Posádka dodržela čestnou dohodu", "Mrtví leželi 3 DNY NAZÍ"],
  "casualties": {"hussites": "~30 mužů", "enemy": "400-500 včetně 25 pánů"},
  "historicalReliability": "VYSOKÁ. Více pramenů včetně Eberarda Windeckeho."
}
```

---

## BITVA 6: BITVA U KUTNÉ HORY

```json
{
  "battleId": "kutna_hora_1421",
  "name": "Bitva u Kutné Hory",
  "date": "21.-22. prosince 1421 + 6. ledna 1422",
  "location": "Kutná Hora, vrch Kaňk, Nebovidy",
  "hussiteSide": {
    "commanders": ["Jan Žižka (ZCELA SLEPÝ)", "Viktorin Boček z Kunštátu", "Hašek z Valdštejna"],
    "strength": "~12 000 mužů",
    "composition": "Táborité + pražané + moravští páni"
  },
  "enemySide": {
    "commanders": ["Zikmund Lucemburský", "Pippo Spano"],
    "strength": "30-50 000 mužů",
    "composition": "Uherská jízda, německé a rakouské oddíly"
  },
  "terrain": {
    "description": "Kopcovitá krajina, strategický vrch Kaňk",
    "tacticalAdvantage": "Terén umožnil noční únik"
  },
  "battlePhases": [
    {"name": "Formování hradby", "description": "Žižka zformoval vozovou hradbu ~400 m od hradeb"},
    {"name": "Křižácký trik", "description": "Stáda dobytka jako živý štít"},
    {"name": "Zrada", "description": "Kutnohorští otevřeli Kolínskou bránu"},
    {"name": "Noční průlom", "description": "22. prosince v 5:00 - PRVNÍ noční bojový přesun"},
    {"name": "Protiútok", "description": "6. ledna u Nebovid - překvapivý útok"}
  ],
  "briefing": "Bratři! Zikmund nás obklíčil a Kutnohorští zradili! Ale temnota bude naším spojencem. V pět hodin ráno projdeme nepřátelskou linií - tiše, bez pochodní. Pak se obrátíme a udeříme!",
  "historicalQuotes": [
    {"text": "...cestou vypalovali vesnice a znásilňujíce panny a ženy až do vydechnutí duše, potom je usmrcovali...", "source": "Vavřinec z Březové o křižácích"}
  ],
  "aftermath": "Husitské vítězství. Noční průlom = PRVNÍ mobilní dělostřelecký manévr v historii.",
  "trivia": ["Žižka byl ZCELA SLEPÝ", "Kutnohorští tajně spolupracovali se Zikmundem", "Zikmund strávil Vánoce v domnění že vyhrál"],
  "casualties": {"hussites": "300-500", "enemy": "2-12 000"},
  "historicalReliability": "VYSOKÁ. Více pramenů."
}
```

---

## BITVA 7: BITVA U NĚMECKÉHO BRODU

```json
{
  "battleId": "nemecky_brod_1422",
  "name": "Bitva u Německého Brodu",
  "date": "8.-10. ledna 1422",
  "location": "Habry a Německý Brod (Havlíčkův Brod)",
  "hussiteSide": {
    "commanders": ["Jan Žižka", "Jan Hvězda z Vícemilic (Bzdinka)"],
    "strength": "Posílené síly",
    "composition": "Táborité + pražané"
  },
  "enemySide": {
    "commanders": ["Pippo Spano"],
    "strength": "Zbytky křižáckého vojska",
    "composition": "Prchající uherské a rakouské oddíly"
  },
  "terrain": {
    "description": "Výšina u Habrů, zamrzlá Sázava",
    "tacticalAdvantage": "Led se stal smrtelnou pastí"
  },
  "battlePhases": [
    {"name": "Habry", "description": "8. ledna - obrana se rozpadla po prvním útoku"},
    {"name": "Pronásledování", "description": "20 km až k Německému Brodu"},
    {"name": "Zamrzlá Sázava", "description": "Led se prolomil - 548 utopených"},
    {"name": "Obléhání", "description": "9. ledna - celodenní boj o hradby"},
    {"name": "Masakr", "description": "10. ledna - vniknutí BEZ Žižkova souhlasu, ~1500 zabitých"}
  ],
  "briefing": "Bratři! Nepřítel prchá! Nedejte jim čas se vzpamatovat. Pozor na led na Sázavě - ať se topí oni! Ale pamatujte - jsme boží bojovníci, ne vrazi!",
  "historicalQuotes": [
    {"text": "Město Německý Brod padá a hynou všichni... nejméně tisíc a pět set lidí.", "source": "Kronika starého pražského kolegiáta"},
    {"text": "[Masakr byl] velký hřích na duších všech zúčastněných husitů.", "source": "List Jana Žižky, 1423"}
  ],
  "aftermath": "Drtivá výhra, masakr. Město NĚKOLIK LET PUSTÉ - vlci běhali ulicemi.",
  "trivia": ["11. ledna Žižka PASOVÁN NA RYTÍŘE", "548 utopených pod ledem", "Odvetou za vraždění v Kutné Hoře"],
  "casualties": {"hussites": "Nízké", "enemy": "Tisíce mrtvých v poli + ve městě"},
  "historicalReliability": "VYSOKÁ."
}
```

---

## BITVA 8: BITVA U MOSTU

```json
{
  "battleId": "most_1421",
  "name": "Bitva u Mostu",
  "date": "5. srpna 1421",
  "location": "Okolí vrchu Hněvín, Most",
  "hussiteSide": {
    "commanders": ["Jan Želivský (radikální kazatel)"],
    "strength": "Pražský husitský svaz + Žatečtí",
    "composition": "Městské hotovosti, 2 pušky, 2 praky"
  },
  "enemySide": {
    "commanders": ["Fridrich IV. Svárlivý", "Hynek Hlaváč z Dubé", "Zikmund z Vartenberka"],
    "strength": "Saské vojsko + mostecká hotovost + katolická šlechta",
    "composition": "Profesionální míšeňská armáda"
  },
  "terrain": {
    "description": "Svah vrchu Hněvín s hradem",
    "tacticalAdvantage": "Husité útočili DO SVAHU bez vozové hradby - CHYBA"
  },
  "battlePhases": [
    {"name": "Obléhání", "description": "24. července - tábor u kláštera"},
    {"name": "Útok", "description": "Frontální útok po úbočí BEZ vozové hradby"},
    {"name": "Boční úder", "description": "Mostecká hotovost překvapila husity"},
    {"name": "Panika", "description": "Panický útěk"},
    {"name": "Krytí", "description": "Dělostřelci kryli ústup"}
  ],
  "briefing": "Bratři! Dnes dobudeme tento katolický brloh! Děla rozstřílela hradby a Míšňané se třesou! Útočte na hrad - první kdo vleze na zeď, bude hrdina!",
  "historicalQuotes": [
    {"text": "[Vavřinec z Březové podává popis, ale nebyl příznivcem Želivského - možná zveličil porážku]", "source": "Poznámka historiků"}
  ],
  "aftermath": "HUSITSKÁ PORÁŽKA - první velká prohra. Oslabení Želivského.",
  "trivia": ["Vymazána z učebnic - nehodila se do obrazu neporazitelných husitů", "Panna Marie se stala ochránkyní Mostu", "Žižka NEBYL PŘÍTOMEN - zotavoval se z oslepení"],
  "casualties": {"hussites": "~500+", "enemy": "Neznámé"},
  "historicalReliability": "STŘEDNÍ. Méně detailů, pramen zaujatý proti Želivskému."
}
```

---

## BITVA 9: BITVA U ÚSTÍ NAD LABEM

```json
{
  "battleId": "usti_1426",
  "name": "Bitva u Ústí nad Labem",
  "date": "16. června 1426",
  "location": "Vyvýšenina 'Na Běhání', 5 km od Ústí",
  "hussiteSide": {
    "commanders": ["Zikmund Korybutovič (formálně)", "Prokop Holý (fakticky - PRVNÍ VELKÁ BITVA)", "Jan Roháč", "Jakoubek z Vřesovic"],
    "strength": "24-25 000 mužů, 500+ vozů",
    "composition": "Táboři, sirotci, pražané, šlechta"
  },
  "enemySide": {
    "commanders": ["Boso z Vitzthumu (PADL)"],
    "strength": "25-30 000 mužů",
    "composition": "Vojska ze Saska, Míšně, Durynska"
  },
  "terrain": {
    "description": "Mírné návrší s planinou",
    "tacticalAdvantage": "Dvojitá linie vozové hradby"
  },
  "battlePhases": [
    {"name": "Křižácký postup", "description": "Unavená armáda, nedostatek potravin"},
    {"name": "Čelní útok", "description": "Na dvojitou vozovou hradbu"},
    {"name": "Průlom", "description": "Křižáci sekáním řetězů pronikli přes obě linie"},
    {"name": "Obklíčení", "description": "Husitská jízda zaútočila ZEZADU"},
    {"name": "Masakr", "description": "Nebrali zajatce"}
  ],
  "briefing": "Bratři! Saská hrabata přitáhla, ale jsou hladoví a unavení. My máme dvojitou zeď z vozů. Nechte je prorazit první linii - pak na ně spadne naše jízda jako boží hněv! Žádné slitování!",
  "historicalQuotes": [
    {"text": "A ten potok, kterýž skrze Ústie teče, veškeren hustě od velikého zmordování lidí i koní krvavý bieše.", "source": "Křížovnický rukopis"},
    {"text": "Sluší Čechům vzpomínati, že jim dal Pán Bůh u Oustí vítězství...", "source": "Píseň o vítězství u Ústí"}
  ],
  "aftermath": "Drtivé vítězství. POSLEDNÍ BITVA kde jízda čelně napadla vozovou hradbu.",
  "trivia": ["Piccolomini MYLNĚ připsal vítězství mrtvému Žižkovi", "PRVNÍ velká bitva Prokopa Holého", "14 hrabat a baronů padlo"],
  "casualties": {"hussites": "Údajně 16 mužů (!)", "enemy": "~4 000"},
  "historicalReliability": "VYSOKÁ."
}
```

---

## BITVA 10: BITVA U TACHOVA

```json
{
  "battleId": "tachov_1427",
  "name": "Bitva u Tachova",
  "date": "3.-4. srpna 1427",
  "location": "Severně od Tachova",
  "hussiteSide": {
    "commanders": ["Prokop Holý"],
    "strength": "Spojené svazy",
    "composition": "Táboři, sirotci, pražané"
  },
  "enemySide": {
    "commanders": ["Arcibiskup Ota ze Ziegenheimu", "Fridrich Hohenzollern", "Kardinál Jindřich Beaufort"],
    "strength": "~25 000 mužů + 1 000 anglických lučištníků",
    "composition": "PRVNÍ použití vlastní vozové hradby křižáky"
  },
  "terrain": {
    "description": "Okolí Stříbra a Tachova",
    "tacticalAdvantage": "Nerozhodující - křižáci uprchli"
  },
  "battlePhases": [
    {"name": "Obléhání Stříbra", "description": "Neúspěšné"},
    {"name": "Průzkum", "description": "3 000 jezdců se vrátilo bez boje"},
    {"name": "Chaos", "description": "Požáry v ležení, dezerce"},
    {"name": "Špatné znamení", "description": "Padající korouhev"},
    {"name": "Kardinálův pokus", "description": "Beaufort strhal korouhve a nadával"},
    {"name": "Masový útěk", "description": "PŘED příchodem husitů"}
  ],
  "briefing": "Bratři! Křižáci utekli jako zajíci! Jejich kardinál házel korouhve na zem - nic nepomohlo. Teď dobijeme jejich posádky a sebereme jejich vozy!",
  "historicalQuotes": [
    {"text": "A když se táboři přiblížili na tři míle, řečená knížata prchla do Bavor...", "source": "Bartošek z Drahonic"},
    {"text": "Kardinál strhl korouhve, hodil je před Němce na zem a prudce jim lál.", "source": "Bartošek z Drahonic"},
    {"text": "Nevidím, před kým utíkat, žádného nepřítele nevidím!", "source": "Rytíř Kamrovec"}
  ],
  "aftermath": "Bez boje - křižáci prchli! Na 4 roky zastaveny křížové výpravy.",
  "trivia": ["Křižáci použili vlastní vozovou hradbu - neúčinná", "1 000 ANGLICKÝCH LUČIŠTNÍKŮ", "Rytíř Kamrovec - jeho výrok se stal příslovím"],
  "casualties": {"hussites": "Zanedbatelné", "enemy": "Stovky"},
  "historicalReliability": "VYSOKÁ."
}
```

---

## BITVA 11: BITVA U NISY

```json
{
  "battleId": "nisa_1428",
  "name": "Bitva u Nisy (Slezsko)",
  "date": "18. března 1428",
  "location": "Před hradbami města Nisa (Nysa/Neisse)",
  "hussiteSide": {
    "commanders": ["Prokop Holý", "Velek z Březnice", "kněz Prokůpek", "Jan z Bukoviny"],
    "strength": "Spojené síly",
    "composition": "Táboři, sirotci, pražané, moravští kališníci"
  },
  "enemySide": {
    "commanders": ["Biskup Konrád", "Půta z Častolovic"],
    "strength": "Neznámá",
    "composition": "Narychlo vyzbrojení sedláci, místní hotovost"
  },
  "terrain": {
    "description": "Před městskými hradbami",
    "tacticalAdvantage": "Překvapení a rychlý manévr"
  },
  "battlePhases": [
    {"name": "Překvapivý příchod", "description": "Husité dorazili NEČEKANĚ RYCHLE"},
    {"name": "Obranná linie", "description": "Slezané se postavili před hradby"},
    {"name": "Útok", "description": "Na neprofesionální obránce"},
    {"name": "Rozklad", "description": "Sedláci v panice uprchli"},
    {"name": "Pronásledování", "description": "2 000 zabitých nebo utopených"}
  ],
  "briefing": "Bratři! Slezané postavili sedláky před hradby. Ukažme jim, proč se říši třese kolena! Rychle vpřed - nezastavujte, dokud nebudou utíkat! Pak je ženeme do řeky!",
  "historicalQuotes": [
    {"text": "They arrived before Neisse quite unexpectedly... The peasants immediately fled, and the bishop only with difficulty found a refuge.", "source": "The Hussite Wars"}
  ],
  "aftermath": "Drtivé vítězství. Jediná větší bitva slezské rejsy - města se pak vzdávala bez boje.",
  "trivia": ["Součást první 'SPANILÉ JÍZDY' do Slezska", "2 000 utopených v řece", "Vévoda z Lehnice-Břehu zbaběle uprchl"],
  "casualties": {"hussites": "Nezaznamenány", "enemy": "~2 000"},
  "historicalReliability": "NÍZKÁ. Méně zdokumentovaná, většina detailů REKONSTRUOVÁNA."
}
```

---

## BITVA 12: BITVA U DOMAŽLIC

```json
{
  "battleId": "domazlice_1431",
  "name": "Bitva u Domažlic",
  "date": "14. srpna 1431",
  "location": "Mezi Domažlicemi a Kdyní, u vrchu Baldov",
  "hussiteSide": {
    "commanders": ["Prokop Holý", "Zikmund Korybutovič (host)"],
    "strength": "40-50 000 bojovníků",
    "composition": "Spojené svazy + 6 000 polských husitů"
  },
  "enemySide": {
    "commanders": ["Fridrich Hohenzollern", "Kardinál Giuliano Cesarini", "Zikmund ODMÍTL účast"],
    "strength": "100 000+ - NEJVĚTŠÍ křížová výprava",
    "composition": "9 000 vozů podle husitského vzoru, stovky děl"
  },
  "terrain": {
    "description": "Cesta k Domažlicím, Všerubský průsmyk",
    "tacticalAdvantage": "Průsmyk - úzké hrdlo pro prchající"
  },
  "battlePhases": [
    {"name": "Obléhání Domažlic", "description": "10.-13. srpna"},
    {"name": "Husitský přesun", "description": "75 km za 2 dny"},
    {"name": "Zvuk chorálu", "description": "Zaslechli 'Ktož jsú boží bojovníci'"},
    {"name": "Špatná komunikace", "description": "Taktický přesun pochopen jako útěk"},
    {"name": "Panika", "description": "Masový útěk přes Všerubský průsmyk"},
    {"name": "Skutečný boj", "description": "Italská garda bránila až do večera - 200+ padlých"}
  ],
  "briefing": "Bratři! Už slyšíte ten rachot? To je největší armáda, jakou kdy říšská knížata poslala! Ale Bůh je s námi - zpívejte hlasitě chorál a sledujte, jak prchají! Ktož jsú boží bojovníci!",
  "historicalQuotes": [
    {"text": "Když nám se přiblížil ten zhoubný národ... takovou hrůzou sevřeni jsme všichni v náhlém zděšení; tu naše síly mizejí a prchá rada s nadějí...", "source": "Píseň o vítězství u Domažlic"},
    {"text": "...již rozléhal se rachot pochodu vozového a zpěv celého táboru hlučný Kdož jste boží bojovníci...", "source": "František Palacký"}
  ],
  "aftermath": "Legendární vítězství. Konec vojenského řešení, jednání na Basilejském koncilu.",
  "trivia": ["KARDINÁLŮV KLOBOUK ztracen na útěku - symbol vítězství", "Chorál 'Ktož jsú boží bojovníci' zněl před bitvou", "Cesarini později prosadil vyjednávání"],
  "casualties": {"hussites": "Minimální", "enemy": "Stovky, ukořistěno 8 000 vozů"},
  "historicalReliability": "VYSOKÁ."
}
```

---

## BITVA 13: BITVA U LIPAN

```json
{
  "battleId": "lipany_1434",
  "name": "Bitva u Lipan",
  "date": "30. května 1434, ~16:00",
  "location": "Mezi Hřiby a Lipskou horou, 40 km V od Prahy",
  "hussiteSide": {
    "faction": "RADIKÁLOVÉ (poražení)",
    "commanders": ["Prokop Holý (PADL)", "Prokop Malý (PADL)", "Jan Čapek ze Sán (UPRCHL)", "Ondřej Keřský"],
    "strength": "6-10 000 pěších, 700 jezdců, 480 vozů",
    "composition": "Táboři + sirotci"
  },
  "enemySide": {
    "faction": "UMÍRNĚNÍ (vítězové)",
    "commanders": ["Diviš Bořek z Miletínka", "Aleš Vřešťovský z Rýzmburka", "Jiří z Poděbrad (14 let!)"],
    "strength": "12-13 000 pěších, 1 200-1 500 jezdců, 720+ vozů",
    "composition": "Panská jednota + pražané + plzeňské kontingenty + rožmberské oddíly"
  },
  "terrain": {
    "description": "Lipská hora (výhodnější pro radikály), pláň u Hřib",
    "tacticalAdvantage": "Poprvé DVĚ ARMÁDY VE VOZOVÝCH HRADBÁCH proti sobě"
  },
  "battlePhases": [
    {"name": "Zahájení", "description": "~16:00 po ukončení jednání, dělostřelecká palba"},
    {"name": "Předstíraný útěk", "description": "Diviš Bořek nařídil 'zmatený' ústup"},
    {"name": "Reakce radikálů", "description": "OTEVŘELI vozovou hradbu a pronásledovali"},
    {"name": "Protiúder", "description": "Skrytá jízda zaútočila na odkrytý bok"},
    {"name": "Obklíčení", "description": "Jízda pronikla do otevřené hradby"},
    {"name": "Masakr", "description": "Prokop Holý a Malý padli na vozech"},
    {"name": "Upálení zajatců", "description": "Večer - 700-900 mužů ve stodolách"}
  ],
  "briefing": "Bratři táboři a sirotci! Dnes stojíme proti našim bývalým bratrům, kteří zradili pravdu boží! Oni chtějí kompromis s Antikristem - my chceme čistou víru! Držte vozy a nebraňte se nikomu vzdát - ale vězte, že oni zajatce nebrali nikdy!",
  "historicalQuotes": [
    {"text": "Vzhůru, vzhůru, na ně, prchají již!", "source": "Volání radikálů - Bartošek z Drahonic"},
    {"text": "A tu je řečení páni pronásledovali tak rychle stále je bijíce, že vběhli mezi jejich vozy a přímo tam na vozech zabili oba kněze Prokopy...", "source": "Bartošek z Drahonic"},
    {"text": "Čechy mohou být poraženy jedině Čechy.", "source": "Císař Zikmund Lucemburský"},
    {"text": "Kdož zastavíš se zde, zamysli se, kam vede nesvornost národa.", "source": "Nápis na mohyle"}
  ],
  "aftermath": "Drtivá porážka radikálů. Konec polních vojsk. 5. července 1436 kompaktáta v Jihlavě. Zikmund uznán králem.",
  "trivia": ["Jiří z Poděbrad (budoucí král) byl účastníkem ve 14 letech", "700-900 zajatců UPÁLENO ve stodolách", "Tělo Prokopa Holého NIKDY NENALEZENO", "Jan Roháč z Dubé vzdoroval do 1437 - popraven"],
  "casualties": {"hussites": "~1 300 padlých + 700-900 upálených", "enemy": "~200"},
  "historicalReliability": "VYSOKÁ. Mnoho pramenů včetně Bartoška z Drahonic."
}
```

---

## BITVA 14: BITVA U HOŘIC

```json
{
  "battleId": "horice_1423",
  "name": "Bitva u Hořic",
  "date": "Kolem 20. dubna 1423",
  "location": "Vrch Gothard (357 m), JV od Hořic na Jičínsku",
  "hussiteSide": {
    "commanders": ["Jan Žižka (slepý)", "Diviš Bořek z Miletínka"],
    "strength": "~3 000 mužů, 120 vozů",
    "composition": "Orebité (východočeští husité), 10% jízdní"
  },
  "enemySide": {
    "commanders": ["Čeněk z Vartenberka (4x přeběhlík!)", "Jindřich Berka z Dubé", "Mikšík z Úlibic (PADL)"],
    "strength": "Neznámá",
    "composition": "Jízdní sbory katolické české šlechty"
  },
  "terrain": {
    "description": "Vrch Gothard",
    "tacticalAdvantage": "Vozová hradba na temeni kopce"
  },
  "battlePhases": [
    {"name": "Formace", "description": "Žižka zformoval vozovou hradbu na temeni"},
    {"name": "Útok", "description": "Čeňkovi jezdci pravděpodobně sesedli a útočili pěšky"},
    {"name": "Palba", "description": "Děla, ručnice a samostříly zasáhly útočníky"},
    {"name": "Boj o vozy", "description": "Husité postupně získali převahu"},
    {"name": "Vítězství", "description": "Bitva trvala ~3 hodiny"}
  ],
  "briefing": "Bratři orebité! Čeněk z Vartenberka zradil víru - teď vede katolické pány proti nám! Držte vozy na kopci a střelte do nich, až budou stoupat! Pan Čeněk už zradil čtyřikrát - dnes mu to spočítáme!",
  "historicalQuotes": [
    {"text": "Když dojel na ně Žižka blízko k Hořicím, obořil se na ně... že jich kolik set zjímal.", "source": "Staré letopisy české"},
    {"text": "Pan Čeněk s některými pány sebral se na Žižku a měli bitvu spolu a tu Žižka porazil ty pány, zjímal i zbil mnoho z nich.", "source": "Rukopis Sa"}
  ],
  "aftermath": "Drtivé orebské vítězství. PRVNÍ VNITŘNÍ KONFLIKT HUSITŮ.",
  "trivia": ["Čeněk z Vartenberka - notorický PŘEBĚHLÍK (4-5x změnil stranu)", "Diviš Bořek z Miletínka - později vítěz u Lipan", "Východní Čechy = kolébka husitských hejtmanů"],
  "casualties": {"hussites": "Neznámé", "enemy": "Stovky zabitých a zajatých"},
  "historicalReliability": "STŘEDNÍ. Stručnější záznamy, základní průběh doložen."
}
```

---

## BITVA 15: BITVA U MALEŠOVA

```json
{
  "battleId": "malesov_1424",
  "name": "Bitva u Malešova",
  "date": "7. června 1424",
  "location": "U tvrze Malešov, 6 km J od Kutné Hory, údolí potoka Bohynka",
  "hussiteSide": {
    "commanders": ["Jan Žižka (zcela slepý)", "Jan Hvězda z Vícemilic (Bzdinka)", "Jan Roháč z Dubé"],
    "strength": "Východočeský husitský svaz + táboři",
    "composition": "Orebité + malý oddíl táborů"
  },
  "enemySide": {
    "commanders": ["Svatohavelská koalice", "Hynek Boček z Poděbrad (zajat)"],
    "strength": "Větší než Žižkova",
    "composition": "Pražský svaz + plzeňský landfrýd + umírnění kališníci"
  },
  "terrain": {
    "description": "Údolí u Malešova - úzký průchod",
    "tacticalAdvantage": "Žižka přehradil průchod vozovou hradbou"
  },
  "battlePhases": [
    {"name": "Předehra", "description": "Žižka obklíčen v Kostelci, v noci unikl"},
    {"name": "Zajetí vyjednavače", "description": "Hynek z Poděbrad zajat při vyjednávání"},
    {"name": "Obranná pozice", "description": "Vozová hradba přehradila údolí"},
    {"name": "Vozy s kamením", "description": "Žižka pustil dolů vozy naplněné kamením (LEGENDA?)"},
    {"name": "Zmatek nepřítele", "description": "Koalice nemohla rozvinout formaci"},
    {"name": "Protiútok", "description": "Prudký husitský útok - panika a útěk"}
  ],
  "briefing": "Bratři! Pražané a zrádci se spojili proti nám! Ale toto údolí bude jejich hrobem. Postavte vozy napříč a připravte vozy s kamením - až budou blízko, pusťte je dolů! A pak na ně - žádné slitování pro ty, kdo zradili pravdu!",
  "historicalQuotes": [
    {"text": "Item zesrali se pražané u Malešova žitem, neb všichni pražané biechu na znamenie žitem opásáni.", "source": "Staré letopisy české (posměšné přísloví)"},
    {"text": "...Žižka vtáhl do údolí, protože o něm věděl, že jest soutěskou, v níž nepřátelé naprosto nemohou rozvinout své šiky... pobil 3000 Pražanů...", "source": "Enea Silvio Piccolomini"},
    {"text": "Léta Páně 1424 porazil v boji Žižka se svými lidmi pražany a odňal jim mnoho vozů s děly; padlo tři sta pražských hospodářů.", "source": "Bartošek z Drahonic"}
  ],
  "aftermath": "Drtivé Žižkovo vítězství. NEJKRVAVĚJŠÍ bitva husitských válek. Pražané zaplatili 14 000 kop grošů.",
  "trivia": ["VOZY S KAMENÍM - legenda nebo skutečnost? Předchůdce tankové taktiky", "Vrchol Žižkovy kariéry", "Koalice se pokusila o ATENTÁT na Žižku", "14. září smír zprostředkován Rokycanou", "Žižka zemřel 4 měsíce poté (11. října 1424)"],
  "casualties": {"hussites": "~200", "enemy": "1 200-3 000 mrtvých"},
  "historicalReliability": "STŘEDNÍ. Přesná lokalizace bojiště NENÍ URČENA. Počty ztrát se značně liší."
}
```

---

## CHORÁL "KTOŽ JSÚ BOŽÍ BOJOVNÍCI"

**Původ:** Jistebnický kancionál (nalezen 1872), autor pravděpodobně táborský kněz Jan Čapek, vznik kolem 1420

**První sloka:**
```
Ktož jsú boží bojovníci a zákona jeho,
prostež od Boha pomoci a ufajte v něho,
že konečně vždycky s ním svítězíte...
```

**Vojenská funkce:** Zhudebněný výtah Žižkova vojenského řádu, obsahuje pokyny pro jednotlivé složky vojska, sloužil jako instruktáž a psychologická zbraň.

---

## SOUHRNNÁ TABULKA

| # | Bitva | Datum | Výsledek | Spolehlivost |
|---|-------|-------|----------|--------------|
| 1 | Živohošť | 4.11.1419 | Nerozhodná | Střední |
| 2 | Nekmíř | XII/1419-I/1420 | Husité | Nízká |
| 3 | Sudoměř | 25.3.1420 | Husité | Vysoká |
| 4 | Vítkov | 14.7.1420 | Husité | Vysoká |
| 5 | Vyšehrad | 1.11.1420 | Husité | Vysoká |
| 6 | Kutná Hora | XII/1421-I/1422 | Husité | Vysoká |
| 7 | Německý Brod | 8-10.1.1422 | Husité | Vysoká |
| 8 | Most | 5.8.1421 | PORÁŽKA | Střední |
| 9 | Ústí n. L. | 16.6.1426 | Husité | Vysoká |
| 10 | Tachov | 3-4.8.1427 | Husité (bez boje) | Vysoká |
| 11 | Nisa | 18.3.1428 | Husité | Nízká |
| 12 | Domažlice | 14.8.1431 | Husité (legendární) | Vysoká |
| 13 | Lipany | 30.5.1434 | Umírnění | Vysoká |
| 14 | Hořice | ~20.4.1423 | Orebité | Střední |
| 15 | Malešov | 7.6.1424 | Žižka | Střední |

---

## HLAVNÍ PRAMENY

**Primární:**
- Vavřinec z Březové: Husitská kronika (1414-1422) - NEJDŮLEŽITĚJŠÍ
- Staré letopisy české (různé rukopisy)
- Bartošek z Drahonic (katolický pohled)
- Kronika starého pražského kolegiáta
- Enea Silvio Piccolomini: Historia Bohemica

**Sekundární literatura:**
- Petr Čornej: Jan Žižka: Život a doba husitského válečníka (2019)
- František Šmahel: Husitská revoluce (1993-96)
- Petr Klučina: Jak válčili husité (1987)

---

*Databáze připravena pro herní briefing. U méně známých bitev (Nekmíř, Živohošť, Most, Nisa) jasně rozlišeno mezi doloženými fakty a rekonstrukcemi historiků.*