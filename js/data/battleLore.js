// Historická data pro bitvy husitských válek
// Zdroj: detaily-bitev.md - kompilace z primárních pramenů

const BattleLore = {
    // Bitva u Živohoště
    'zivohost': {
        name: 'Bitva u Živohoště',
        date: '4. listopadu 1419',
        location: 'Oblast mezi Živohoští a Novým Knínem',
        hussiteSide: {
            commanders: ['Břeněk Švihovský z Rýzmburka', 'Václav Koranda', 'Chval a Kuneš z Machovic'],
            strength: '~4 300 poutníků',
            composition: 'Polovojensky organizovaní poutníci, venkované, měšťané'
        },
        enemySide: {
            commanders: ['Petr Konopišťský ze Šternberka', 'Jan Ptáček z Pirkštejna'],
            strength: '~1 300 jezdců',
            composition: 'Těžká jízda české katolické šlechty'
        },
        terrain: 'Vyvýšenina poblíž přechodu přes Vltavu. Vozová hradba NEBYLA použita.',
        quotes: [
            { text: 'Pan Petr vyjel se svými šikem proti Ústeckým, rozrazil je a celý jeho houf jezdců skrz ně projel.', source: 'Staré letopisy české' }
        ],
        trivia: [
            'Historicky PRVNÍ větší střet husitských válek',
            'Vozová hradba nebyla použita - vznikla až později',
            'Petr ze Šternberka padl o rok později v bitvě pod Vyšehradem',
            'Zajatí husité byli vhozeni do kutnohorských šachet'
        ],
        casualties: { hussites: '~100+ mrtvých/zajatých', enemy: 'Neznámé' },
        aftermath: 'Nerozhodná bitva. Ukázala nutnost organizované obrany.',
        reliability: 'Středně spolehlivé - dva hlavní prameny'
    },

    // Bitva u Nekmíře
    'nekmir': {
        name: 'Bitva u Nekmíře',
        date: 'Prosinec 1419 nebo leden 1420',
        location: 'Poblíž tvrze Nekmíř, 17 km SZ od Plzně',
        hussiteSide: {
            commanders: ['Jan Žižka z Trocnova'],
            strength: '~300 pěších, 7 vozů',
            composition: 'Pěchota z Plzně, vozy s děly a beranidly'
        },
        enemySide: {
            commanders: ['Bohuslav ze Švamberka'],
            strength: 'Přes 2 000 jízdních i pěších',
            composition: 'Těžká jízda plzeňského landfrýdu'
        },
        terrain: 'Pole poblíž tvrze Nekmíř. PRVNÍ POUŽITÍ VOZOVÉ HRADBY v husitských válkách.',
        quotes: [
            { text: 'Žižka ho odrazil od vozů a zabil Hynka z Nekmíře. Pak táhl dál svou cestou a tu noc pobořil tři opevněné tvrze.', source: 'Staré letopisy české' }
        ],
        trivia: [
            'PRVNÍ doložené použití vozové hradby v historii',
            'Pouze 7 vozů - formace půlkruhu',
            'Bohuslav ze Švamberka se později PŘIDAL k husitům!',
            'Památník první vozové hradby u Nekmíře postaven až v roce 2017 - 598 let po bitvě!',
            'Žižkových 7 vozů byl demoliční konvoj (beranidla, děla, prak) - vozová hradba vznikla IMPROVIZACÍ, když ho cestou přepadli',
            'Místu na polích k Všerubům, kde Žižka srazil vozy k sobě, se prý dodnes říká "Na smrtelnici"',
            'Panské jezdectvo útočilo na vozovou hradbu poprvé - netušilo, že ji nelze jen tak smést'
        ],
        casualties: { hussites: 'Nízké', enemy: 'Značné, včetně Hynka z Nekmíře' },
        aftermath: 'Husitské vítězství. Zrodila se vozová taktika.',
        reliability: 'Nízká - pouze jeden pramen (Staré letopisy české)'
    },

    // Bitva u Sudoměře
    'sudomer': {
        name: 'Bitva u Sudoměře',
        date: '25. března 1420',
        location: 'Mezi rybníky Markovec a Škaredý, 14 km od Strakonic',
        hussiteSide: {
            commanders: ['Břeněk Švihovský z Rýzmburka (padl)', 'Jan Žižka z Trocnova', 'Valkoun z Adlaru'],
            strength: '400 pěších, 12 vozů, 9 jezdců',
            composition: 'Rolníci, měšťané, ženy, děti, kněží'
        },
        enemySide: {
            commanders: ['Jindřich z Hradce (smrtelně zraněn)', 'Bohuslav ze Švamberka', 'Petr ze Šternberka'],
            strength: '700-2 000 těžkých jezdců',
            composition: 'Těžká jízda, johanité, zbrojnoši landfrýdu'
        },
        terrain: 'Úzká hráz mezi rybníky - Markovec napuštěný, Škaredý bahnitý. KLÍČOVÝ FAKTOR - bahno uvěznilo sesedlé rytíře.',
        quotes: [
            { text: '...v den zvěstování Panny Marie pan Břeněk ze Švihova, Valkoun z Adlaru a Jan Žižka s jinými bratřími...', source: 'Vavřinec z Březové' }
        ],
        trivia: [
            'Žižka byl jednooký a přibližně 60 let starý',
            'LEGENDA o závojích husitských žen oslňujících rytíře je výmysl Piccolominiho',
            'Jindřich z Hradce smrtelně zraněn šipkou DO PALCE',
            'Základ Žižkovy pověsti neporazitelného vojevůdce'
        ],
        casualties: { hussites: '~30-40 padlých včetně Břeňka', enemy: 'Větší než husitské' },
        aftermath: 'Husitské vítězství. První velká demonstrace vozové taktiky.',
        reliability: 'Vysoká - nejlépe zdokumentovaná raná bitva'
    },

    // Bitva na Vítkově
    'vitkov': {
        name: 'Bitva na Vítkově',
        date: '14. července 1420, kolem 16:00',
        location: 'Vrch Vítkov, Praha 3 - Žižkov',
        hussiteSide: {
            commanders: ['Jan Žižka z Trocnova'],
            strength: '26 mužů, 2 ženy a panna v srubech; pražská pomoc s cepy',
            composition: 'Cepníci a sudličníci, jen pár kuší (málo prachu), 3 ženy'
        },
        enemySide: {
            commanders: ['Zikmund Lucemburský', 'Fridrich IV. Bojovný', 'Heinrich z Isenburgu (velel útoku)', 'Pippo Spano'],
            strength: '~30 000 celkem; 7-8 000 v sektoru, ale do hrdla se vešlo jen ~300 jezdců',
            composition: 'Mezinárodní křižácká armáda'
        },
        terrain: 'Protáhlý hřeben se strmými svahy, dřevěné sruby. Úzká přístupová cesta neumožnila využít převahu.',
        quotes: [
            { text: 'I Žižka přišed tam byl by zabit, kdyby ho jeho lidé nebyli cepy vyrvali z rukou nepřátel.', source: 'Vavřinec z Březové' },
            { text: 'A nepřátelé uviděvše svátost a uslyševše zvonění zvonku a silný křik lidu, zachváceni náramným strachem se dali na útěk...', source: 'Vavřinec z Březové' }
        ],
        trivia: [
            '3 ŽENY bránily Vítkov',
            'Pokřik "Hrrr na ně!" se stal heslem husitů',
            'Jezdecká socha Žižky na Vítkově - třetí největší na světě',
            'Den před bitvou jízda rozprášila Pražany, kteří proti rozkazu vyrazili z brány',
            'Křižáci si zapomněli žebříky — proto marně uvázli v příkopech pod srubem'
        ],
        casualties: { hussites: 'Jednotky až desítky', enemy: '100-300 padlých' },
        aftermath: 'Rozhodné vítězství. 30. července rozpuštění křížové výpravy.',
        reliability: 'Vysoká - Vavřinec z Březové byl současník a kronikář'
    },

    // Bitva pod Vyšehradem
    'vysehrad': {
        name: 'Bitva pod Vyšehradem',
        date: '1. listopadu 1420, po 8:00 ráno',
        location: 'Pankrácká pláň, okolí kostela sv. Pankráce',
        hussiteSide: {
            commanders: ['Hynek Krušina z Lichtenburka (25 let)', 'Jan Žižka', 'Diviš Bořek z Miletínka'],
            strength: '15-20 000 mužů',
            composition: 'Pražané, orebité, táboři, žatečtí, lounští'
        },
        enemySide: {
            commanders: ['Zikmund Lucemburský', 'Jindřich z Kravař (padl)', 'Mikšík Divůček (první na útěku)'],
            strength: '15-20 000 mužů',
            composition: 'Uhři, Němci, Slezané, česká katolická šlechta'
        },
        terrain: 'Rovinatá pláň s bočním úvozem k Podolí. Boční úvoz se stal pastí pro šlechtu.',
        quotes: [
            { text: '[Panstvo] hrdě dalo králi na vědomí, že půjde do ohně i tam, kde on sám jistě nebude.', source: 'Jindřich Plumlovský k Zikmundovi' }
        ],
        trivia: [
            'Padlo 25 KOROUHEVNÍCH PÁNŮ české šlechty',
            'Posádka Vyšehradu dodržela čestnou dohodu o kapitulaci',
            'Mrtví leželi 3 DNY NAZÍ na bojišti',
            'Zikmund přišel POZDĚ - po 8:00, kdy měla posádka kapitulovat',
            'Po bitvě se prý v noci nad bojištěm zjevil sloup zbarvený jako duha — vyloženo jako znamení'
        ],
        casualties: { hussites: '~30 mužů', enemy: '400-500 včetně 25 pánů' },
        aftermath: 'Rozhodné vítězství - "podstatně větší než na Vítkově". Rozpad královské strany.',
        reliability: 'Vysoká - více pramenů včetně Eberarda Windeckeho'
    },

    // Bitva u Kutné Hory
    'kutna_hora': {
        name: 'Bitva u Kutné Hory',
        date: '21.-22. prosince 1421 + 6. ledna 1422',
        location: 'Kutná Hora, vrch Kaňk, Nebovidy',
        hussiteSide: {
            commanders: ['Jan Žižka (ZCELA SLEPÝ)', 'Viktorin Boček z Kunštátu', 'Hašek z Valdštejna'],
            strength: '~12 000 mužů',
            composition: 'Táborité + pražané + moravští páni'
        },
        enemySide: {
            commanders: ['Zikmund Lucemburský', 'Pippo Spano'],
            strength: '30-50 000 mužů',
            composition: 'Uherská jízda, německé a rakouské oddíly'
        },
        terrain: 'Kopcovitá krajina, strategický vrch Kaňk. Terén umožnil noční únik.',
        quotes: [
            { text: '...cestou vypalovali vesnice a znásilňujíce panny a ženy až do vydechnutí duše, potom je usmrcovali...', source: 'Vavřinec z Březové o křižácích' }
        ],
        trivia: [
            'Žižka byl ZCELA SLEPÝ - druhé oko ztratil při obléhání Rabí',
            'Kutnohorští tajně spolupracovali se Zikmundem a otevřeli mu brány',
            'Zikmund strávil Vánoce v domnění, že vyhrál',
            'PRVNÍ mobilní dělostřelecký manévr v historii - noční průlom',
            'Kutnohorští horníci házeli zajaté husity do dolových šachet - odtud ta zrada',
            'Zikmund hnal na husity stáda volů a krav („Nepřítel rohatý"), aby je zastrašil - husité je zprvu vzali za ďábly, pak si je prohnali do vozové hradby jako zásobu',
            'Zikmund ztratil u Kutné Hory přes 5 000 mužů takřka bez boje - sedminásobek ztrát z Vítkova',
            'Slepý Žižka byl 11. ledna 1422 pasován na rytíře - „vítězil pro kalich i bez zraku"',
            'Kořist: devět kop vozů plných zboží, klenotů a knih („jedna kniha znamenala celé jmění")'
        ],
        casualties: { hussites: '300-500', enemy: '2-12 000' },
        aftermath: 'Husitské vítězství. Geniální noční průlom vozovou hradbou.',
        reliability: 'Vysoká - více pramenů'
    },

    // Bitva u Německého Brodu
    'nemecky_brod': {
        name: 'Bitva u Německého Brodu',
        date: '8.-10. ledna 1422',
        location: 'Habry a Německý Brod (Havlíčkův Brod)',
        hussiteSide: {
            commanders: ['Jan Žižka', 'Jan Hvězda z Vícemilic (Bzdinka)'],
            strength: 'Posílené síly po Kutné Hoře',
            composition: 'Táborité + pražané'
        },
        enemySide: {
            commanders: ['Pippo Spano'],
            strength: 'Zbytky křižáckého vojska',
            composition: 'Prchající uherské a rakouské oddíly'
        },
        terrain: 'Výšina Táborec u Habrů a zamrzlá Sázava, krutý mráz. Hlavní boj u hradeb Brodu (Vojtěšské předměstí).',
        quotes: [
            { text: 'Město Německý Brod padá a hynou všichni... nejméně tisíc a pět set lidí.', source: 'Kronika starého pražského kolegiáta' },
            { text: '[Masakr byl] velký hřích na duších všech zúčastněných husitů.', source: 'List Jana Žižky, 1423' }
        ],
        trivia: [
            'Žižka byl u Německého Brodu ÚDAJNĚ pasován na rytíře (kolem 10. ledna)',
            'Pod ledem Sázavy se prý utopilo 548 jezdců - Dolejší led NEvyvrací, počítá je mezi ~12 000 ztrátami tažení; jeho skepse míří na „sedm let pusté město"',
            'Město bylo NĚKOLIK LET PUSTÉ - vlci běhali ulicemi',
            'Masakr byl odvetou za vraždění husitů v Kutné Hoře',
            'Skutečnou hrůzou ústupu byl mráz - prchající ženy a děti umrzaly cestou (Dolejší)',
            'Křižáci se bránili zády ke hradbám u kostelíka sv. Vojtěcha, kryla je i komenda německých rytířů',
            'Mezi zajatci byl Záviš Černý z Garbova - v závěru bojů nejspíš velel královské posádce ve městě',
            'Návrší Táborec u Habrů, kde Pipo Scolari sešikoval vojsko k boji, se dnes jmenuje „Peklo"',
            'Při dobytí 9. ledna byly ženy a panny z města vyvedeny bez úhony - teprve pak bylo vydáno plamenům'
        ],
        casualties: { hussites: 'Nízké', enemy: 'Tisíce mrtvých v poli + ve městě' },
        aftermath: 'Drtivá výhra. 2. křížová výprava končí naprostým debaklem.',
        reliability: 'Vysoká'
    },

    // Bitva u Mostu
    'most': {
        name: 'Bitva u Mostu',
        date: '5. srpna 1421',
        location: 'Okolí vrchu Hněvín, Most',
        hussiteSide: {
            commanders: ['Jan Želivský (radikální kazatel)'],
            strength: 'Pražský husitský svaz + Žatečtí',
            composition: 'Městské hotovosti, 2 pušky, 2 praky'
        },
        enemySide: {
            commanders: ['Fridrich IV. Bojovný', 'Hynek Hlaváč z Dubé', 'Zikmund z Vartenberka'],
            strength: 'Saské vojsko + mostecká hotovost + katolická šlechta',
            composition: 'Profesionální míšeňská armáda'
        },
        terrain: 'Svah vrchu Hněvín s hradem. Husité útočili DO SVAHU bez vozové hradby - CHYBA.',
        quotes: [
            { text: '[Vavřinec z Březové podává popis, ale nebyl příznivcem Želivského - možná zveličil porážku]', source: 'Poznámka historiků' }
        ],
        trivia: [
            'PRVNÍ velká husitská porážka',
            'Vymazána z učebnic - nehodila se do obrazu neporazitelných husitů',
            'Panna Marie se stala ochránkyní Mostu',
            'Žižka NEBYL PŘÍTOMEN - zotavoval se z oslepení',
            'Husité si před bitvou dělili kořist a podcenili německou jízdu - porážka přišla ve zmatku a nočním útěku'
        ],
        casualties: { hussites: '~500+', enemy: 'Neznámé' },
        aftermath: 'HUSITSKÁ PORÁŽKA. Oslabení pozice Jana Želivského.',
        reliability: 'Střední - pramen zaujatý proti Želivskému'
    },

    // Bitva u Ústí nad Labem
    'usti': {
        name: 'Bitva u Ústí nad Labem',
        date: '16. června 1426',
        location: 'Vyvýšenina "Na Běhání", 5 km od Ústí',
        hussiteSide: {
            commanders: ['Zikmund Korybutovič (formálně)', 'Prokop Holý (fakticky)', 'Jan Roháč', 'Jakoubek z Vřesovic'],
            strength: '24-25 000 mužů, 500+ vozů',
            composition: 'Táboři, sirotci, pražané, šlechta'
        },
        enemySide: {
            commanders: ['Boso z Vitzthumu (padl)'],
            strength: '25-30 000 mužů',
            composition: 'Vojska ze Saska, Míšně, Durynska'
        },
        terrain: 'Mírné návrší s planinou. Dvojitá linie vozové hradby.',
        quotes: [
            { text: 'A ten potok, kterýž skrze Ústie teče, veškeren hustě od velikého zmordování lidí i koní krvavý bieše.', source: 'Křížovnický rukopis' },
            { text: 'Sluší Čechům vzpomínati, že jim dal Pán Bůh u Oustí vítězství...', source: 'Píseň o vítězství u Ústí' }
        ],
        trivia: [
            'Piccolomini MYLNĚ připsal vítězství mrtvému Žižkovi',
            'PRVNÍ velká bitva Prokopa Holého jako velitele',
            'Padlo 7 říšských hrabat a 23 korouhevních pánů',
            'Smírný list odmítnut → obě strany si slíbily nikoho nešetřit; 24 klečících pánů pobito',
            'POSLEDNÍ BITVA kde jízda čelně napadla vozovou hradbu',
            'V husitském vojsku bojoval i ruský kníže Fedor z Ostrogu - Ústí přitáhlo i cizí šlechtu'
        ],
        casualties: { hussites: 'Údajně jen 19 mužů (Starý letopisec)', enemy: '~4 000 (kroniky až 15 000)' },
        aftermath: 'Drtivé vítězství. Saské vévodství zdecimováno.',
        reliability: 'Vysoká'
    },

    // Bitva u Tachova
    'tachov': {
        name: 'Bitva u Tachova',
        date: '3.-4. srpna 1427',
        location: 'Severně od Tachova',
        hussiteSide: {
            commanders: ['Prokop Holý'],
            strength: 'Spojené svazy',
            composition: 'Táboři, sirotci, pražané'
        },
        enemySide: {
            commanders: ['Arcibiskup Ota ze Ziegenheimu', 'Fridrich Hohenzollern', 'Kardinál Jindřich Beaufort'],
            strength: '~25 000 mužů',
            composition: 'PRVNÍ použití vlastní vozové hradby křižáky'
        },
        terrain: 'Okolí Stříbra a Tachova. Nerozhodující - křižáci uprchli.',
        quotes: [
            { text: 'A když se táboři přiblížili na tři míle, řečená knížata prchla do Bavor...', source: 'Bartošek z Drahonic' },
            { text: 'Kardinál strhl korouhve, hodil je před Němce na zem a prudce jim lál.', source: 'Bartošek z Drahonic' },
            { text: 'Nevidím, před kým utíkat, žádného nepřítele nevidím!', source: 'Rytíř Kamrovec' }
        ],
        trivia: [
            'Křižáci použili vlastní vozovou hradbu - neúčinná',
            'Anglické lučištníky najal kardinál Beaufort až roku 1429 - do Čech nedorazili, regent je odklonil do Francie',
            '"Nevidím, před kým utíkat, žádného nepřítele nevidím!" - sarkastický výrok rytíře Kamrovce',
            'Na 4 roky zastaveny křížové výpravy',
            'Rytíř Kamrovec, autor sarkasmu „nevidím nepřítele“, padl při dobývání Tachova v průlomu hradby - místu se dodnes říká „Krvavá ulička“'
        ],
        casualties: { hussites: 'Zanedbatelné', enemy: 'Stovky' },
        aftermath: 'Bez boje - křižáci prchli! 4. křížová výprava končí debaklem.',
        reliability: 'Vysoká'
    },

    // Bitva u Nisy
    'nisa': {
        name: 'Bitva u Nisy (Slezsko)',
        date: '18. března 1428',
        location: 'Před hradbami města Nisa (Nysa/Neisse)',
        hussiteSide: {
            commanders: ['Prokop Holý', 'Velek z Březnice', 'kněz Prokůpek', 'Jan z Bukoviny'],
            strength: 'Spojené síly',
            composition: 'Táboři, sirotci, pražané, moravští kališníci'
        },
        enemySide: {
            commanders: ['Biskup Konrád', 'Půta z Častolovic'],
            strength: 'Neznámá',
            composition: 'Narychlo vyzbrojení sedláci, místní hotovost'
        },
        terrain: 'Před městskými hradbami. Překvapení a rychlý manévr.',
        quotes: [
            { text: 'Ke dvěma tisícům Slezáků pobito aneb v řece utopeno; Čechové vtrhli do předměstí a popálili je i s vozy nepřátelskými.', source: 'Staré letopisy české' }
        ],
        trivia: [
            'Součást první "SPANILÉ JÍZDY" do Slezska',
            'Ke dvěma tisícům Slezáků pobito nebo utopeno v řece Nise',
            'Vévoda z Lehnice-Břehu zbaběle uprchl',
            'Jediná větší bitva slezské rejsy - města se pak vzdávala bez boje',
            'Systém výpalného začal smlouvou hejtmanů s radou Minstrberku; kdo neplatil, lehl popelem (Falkenberk, Břeh)'
        ],
        casualties: { hussites: 'Nezaznamenány', enemy: '~2 000' },
        aftermath: 'Drtivé vítězství. Města se vzdávají nebo platí výpalné.',
        reliability: 'Nízká - méně zdokumentovaná, většina detailů rekonstruována'
    },

    // Bitva u Domažlic
    'domazlice': {
        name: 'Bitva u Domažlic',
        date: '14. srpna 1431',
        location: 'Mezi Domažlicemi a Kdyní, u vrchu Baldov',
        hussiteSide: {
            commanders: ['Prokop Holý'],
            strength: '40-50 000 bojovníků',
            composition: 'Spojené svazy táborů, sirotků a pražanů'
        },
        enemySide: {
            commanders: ['Fridrich Hohenzollern', 'Kardinál Giuliano Cesarini', 'Zikmund ODMÍTL účast'],
            strength: '100 000+ - NEJVĚTŠÍ křížová výprava',
            composition: 'Několik tisíc vozů po husitském vzoru (plán 9 000), stovky děl'
        },
        terrain: 'Cesta k Domažlicím, Všerubský průsmyk. Průsmyk - úzké hrdlo pro prchající.',
        quotes: [
            { text: 'Když nám se přiblížil ten zhoubný národ... takovou hrůzou sevřeni jsme všichni v náhlém zděšení; tu naše síly mizejí a prchá rada s nadějí...', source: 'Píseň o vítězství u Domažlic' },
            { text: '...již rozléhal se rachot pochodu vozového a zpěv celého táboru hlučný Kdož jste boží bojovníci...', source: 'František Palacký' }
        ],
        trivia: [
            'KARDINÁLŮV KLOBOUK ztracen na útěku - symbol vítězství',
            'Chorál "Ktož jsú boží bojovníci" zněl před bitvou',
            'Cesarini později prosadil diplomatické vyjednávání',
            'Křižáci prchli, aniž by se odvážili bojovat',
            'Chorál „Ktož sú boží bojovníci“ zaslechli křižáci na SEDM KILOMETRŮ - husité ještě nebyli ani vidět',
            'Po kardinálu Cesarinim zůstala kořist: papežská bula, zlatý pektorál, klobouk i roucho - dvě století chované v Domažlicích'
        ],
        casualties: { hussites: 'Minimální', enemy: 'Stovky; ukořistěno ~2 000 vozů a ~300 děl' },
        aftermath: 'Legendární vítězství. Konec vojenského řešení, jednání na Basilejském koncilu.',
        reliability: 'Vysoká'
    },

    // Bitva u Lipan
    'lipany': {
        name: 'Bitva u Lipan',
        date: '30. května 1434, ~16:00',
        location: 'Mezi Hřiby a Lipskou horou, 40 km V od Prahy',
        hussiteSide: {
            faction: 'RADIKÁLOVÉ (poražení)',
            commanders: ['Prokop Holý (padl)', 'Prokop Malý (padl)', 'Jan Čapek ze Sán (uprchl)', 'Ondřej Keřský'],
            strength: '6-10 000 pěších, 700 jezdců, 480 vozů',
            composition: 'Táboři + sirotci'
        },
        enemySide: {
            faction: 'UMÍRNĚNÍ (vítězové)',
            commanders: ['Diviš Bořek z Miletínka', 'Aleš Vřešťovský z Rýzmburka', 'Jiří z Poděbrad (14 let!)'],
            strength: '12-13 000 pěších, 1 200-1 500 jezdců, 720+ vozů',
            composition: 'Panská jednota + pražané + plzeňské kontingenty'
        },
        terrain: 'Lipská hora (výhodnější pro radikály), pláň u Hřib. DVĚ ARMÁDY VE VOZOVÝCH HRADBÁCH proti sobě.',
        quotes: [
            { text: 'Vzhůru, vzhůru, na ně, prchají již!', source: 'Volání radikálů - Bartošek z Drahonic' },
            { text: 'A tu je řečení páni pronásledovali tak rychle stále je bijíce, že vběhli mezi jejich vozy a přímo tam na vozech zabili oba kněze Prokopy...', source: 'Bartošek z Drahonic' },
            { text: 'Čechy mohou být poraženy jedině Čechy.', source: 'Císař Zikmund Lucemburský' },
            { text: 'Kdož zastavíš se zde, zamysli se, kam vede nesvornost národa.', source: 'Nápis na mohyle' }
        ],
        trivia: [
            'Jiří z Poděbrad (budoucí král) byl účastníkem ve 14 letech',
            '~700 zajatců; dle kronikářské tradice část upálena ve stodolách (Toulky uvádějí jen zajetí)',
            'Tělo Prokopa Holého NIKDY NENALEZENO',
            'Jan Roháč z Dubé vzdoroval až do 1437 - pak byl popraven'
        ],
        casualties: { hussites: '~1 300 padlých + 700-900 upálených', enemy: '~200' },
        aftermath: 'Drtivá porážka radikálů. Konec polních vojsk. Kompaktáta v Jihlavě 1436.',
        reliability: 'Vysoká - mnoho pramenů včetně Bartoška z Drahonic'
    },

    // Bitva u Hořic
    'horice': {
        name: 'Bitva u Hořic',
        date: 'Kolem 20. dubna 1423',
        location: 'Vrch Gothard (357 m), JV od Hořic na Jičínsku',
        hussiteSide: {
            commanders: ['Jan Žižka (slepý)', 'Diviš Bořek z Miletínka'],
            strength: '~3 000 mužů, 120 vozů',
            composition: 'Orebité (východočeští husité), 10% jízdní'
        },
        enemySide: {
            commanders: ['Čeněk z Vartenberka (4x přeběhlík!)', 'Jindřich Berka z Dubé', 'Arnošt Flaška z Pardubic'],
            strength: 'Neznámá',
            composition: 'Jízdní sbory katolické české šlechty'
        },
        terrain: 'Vrch Gothard. Vozová hradba na temeni kopce.',
        quotes: [
            { text: 'Když dojel na ně Žižka blízko k Hořicím, obořil se na ně... že jich kolik set zjímal.', source: 'Staré letopisy české' },
            { text: 'Pan Čeněk s některými pány sebral se na Žižku a měli bitvu spolu a tu Žižka porazil ty pány, zjímal i zbil mnoho z nich.', source: 'Rukopis Sa' }
        ],
        trivia: [
            'Čeněk z Vartenberka - notorický PŘEBĚHLÍK (4-5x změnil stranu)',
            'Diviš Bořek z Miletínka - později vítěz u Lipan',
            'PRVNÍ VNITŘNÍ KONFLIKT HUSITŮ',
            'Východní Čechy = kolébka husitských hejtmanů',
            'Po vítězství Žižka dobyl tvrz Kozojedy a nechal tam upálit šedesát lidí',
            'Žižka před tažením burcoval: „Pomněte na náš první boj - malí proti velikým, neodění proti oděným jste statečně bojovali!“'
        ],
        casualties: { hussites: 'Neznámé', enemy: 'Stovky zabitých a zajatých' },
        aftermath: 'Drtivé orebské vítězství. Ukázalo sílu východočeských husitů.',
        reliability: 'Střední - stručnější záznamy'
    },

    // Bitva u Malešova
    'malesov': {
        name: 'Bitva u Malešova',
        date: '7. června 1424',
        location: 'U tvrze Malešov, 6 km J od Kutné Hory, údolí potoka Bohynka',
        hussiteSide: {
            commanders: ['Jan Žižka (zcela slepý)', 'Jan Hvězda z Vícemilic (Bzdinka)', 'Jan Roháč z Dubé'],
            strength: 'Východočeský husitský svaz + táboři',
            composition: 'Orebité + malý oddíl táborů'
        },
        enemySide: {
            commanders: ['Svatohavelská koalice', 'Diviš Bořek z Miletínka'],
            strength: 'Větší než Žižkova',
            composition: 'Pražský svaz + plzeňský landfrýd + umírnění kališníci'
        },
        terrain: 'Údolí u Malešova - úzký průchod. Žižka přehradil průchod vozovou hradbou.',
        quotes: [
            { text: 'Item zesrali se pražané u Malešova žitem, neb všichni pražané biechu na znamenie žitem opásáni.', source: 'Staré letopisy české (posměšné přísloví)' },
            { text: '...Žižka vtáhl do údolí, protože o něm věděl, že jest soutěskou, v níž nepřátelé naprosto nemohou rozvinout své šiky... pobil 3000 Pražanů...', source: 'Enea Silvio Piccolomini' },
            { text: 'Léta Páně 1424 porazil v boji Žižka se svými lidmi pražany a odňal jim mnoho vozů s děly; padlo tři sta pražských hospodářů.', source: 'Bartošek z Drahonic' }
        ],
        trivia: [
            'VOZY S KAMENÍM - legenda nebo skutečnost? Předchůdce tankové taktiky',
            'Vrchol Žižkovy kariéry - slepý porazil přesilu',
            'Koalice se pokusila o ATENTÁT na Žižku',
            'Žižka zemřel 4 měsíce poté (11. října 1424)',
            'Praporečník Turkovec padl s pražskou korouhví v ruce; mezi padlými byl i Žižkův zeť'
        ],
        casualties: { hussites: '~200', enemy: '~1 400 padlých z obou stran (z toho 326 pražských hospodářů)' },
        aftermath: 'Geniální vítězství slepého vojevůdce. NEJKRVAVĚJŠÍ bitva husitských válek.',
        reliability: 'Střední - přesná lokalizace bojiště není určena'
    },

    'zatec': {
        name: 'Obrana Žatce',
        date: '10. září - 2. října 1421',
        location: 'Žatec - ostrožna nad řekou Ohří, severozápadní Čechy',
        hussiteSide: {
            commanders: ['Žatecký hejtman (jméno nedoloženo)'],
            strength: 'Posádka 5 400 pěších a 400 jezdců + množství lidu z okolí',
            composition: 'Městská posádka, sudličníci, cepníci, kuše i hákovnice'
        },
        enemySide: {
            commanders: ['Ludvík III. Falcký', 'arcibiskupové z Mohuče, Kolína a Trevíru', 'Erkinger ze Seinsheim (vedl útoky)'],
            strength: '~20-30 000 křižáků',
            composition: 'Druhá křížová výprava - říšská knížata, jízda, obléhací děla'
        },
        terrain: 'Mohutná pevnost na ostrožně obtékané ze tří stran Ohří. Útok byl možný jen z jedné strany.',
        quotes: [
            { text: 'Erkinger ze Seinsheimu podnikl proti Žatci celkem šest útoků za použití děl a hákovnic, ale nepodařilo se mu proniknout ani na předměstí.', source: 'J. Dolejší: Husité' },
            { text: 'Při útoku proti městu Žatci, které se mu zdálo lehkým soustem, byl napaden silným oddílem obránců.', source: 'J. Dolejší: Husité (o Erkingerovi r. 1420)' }
        ],
        trivia: [
            'Žatec = "pevnost Slunce" (Tábor, Žatec-Slunce, Louny-Luna, Slaný-Hvězda)',
            'ŠEST frontálních útoků od 19. září 1421 odraženo',
            'Bránila celá obec: 5 400 pěších, 400 jezdců a lid z okolí',
            'Odvážný výpad z bran 30. září - obránci pobili spoustu nepřátel a stáhli se za hradby',
            'Žádný velitel obrany se nedochoval - ubránila celá obec',
            'Obléhání zlomila falešná zpráva, že táhnou pražané - křižáci 2. října prchli a byli pronásledováni',
            'Nad hořícím ležením prý stál "modrý sloup" - vyloženo jako boží znamení',
            'Erkinger si rok předtím Žatec "zdál lehkým soustem" - obránci ho tehdy zmasakrovali'
        ],
        casualties: { hussites: 'Nízké - město bylo dobře předzásobené', enemy: 'Značné; navíc hlad v táboře' },
        aftermath: 'Druhá křížová výprava se rozpadla, aniž se střetla se Žižkou v poli.',
        reliability: 'Vysoká - dobře doložené obléhání'
    },

    // Obléhání Plzně
    'plzen': {
        name: 'Obléhání Plzně',
        date: '14. července 1433 - 9. května 1434 (10 měsíců)',
        location: 'Plzeň, západní Čechy',
        hussiteSide: {
            commanders: ['Prokop Holý', 'Jan Pardus z Horky', 'Jan Čapek ze Sán'],
            strength: 'Spojená polní vojska táborů a sirotků',
            composition: 'Táboři, sirotci; posily z Polska (Čapek ze Sán)'
        },
        enemySide: {
            commanders: ['Vilém Švihovský z Rýzmberka', 'plzeňský landfrýd'],
            strength: 'Městská posádka a landfrýd',
            composition: 'Katoličtí Plzeňané, západočeská katolická šlechta'
        },
        terrain: 'Město obklíčeno příkopy a roubenou hradbou s devíti věžemi; husité měli na 40 těžkých bombard.',
        quotes: [
            { text: 'Plzeňští napotom ve znaku svém nosili velblouda.', source: 'J. Dolejší: Husité (o původu městského znaku)' }
        ],
        trivia: [
            'Plzeň odolala husitům opakovaně (1421, 1427, 1431) a nakonec 10 měsíců 1433-34 za Prokopa Holého',
            'Jan Čapek ze Sán přivezl z polského tažení velblouda a přivedl ho 11. října 1433 před obléhanou Plzeň',
            'Plzeňané velblouda při výpadu ukořistili - dali si ho do znaku; po obléhání ho darovali Norimberským',
            'Husité obklíčili město příkopy a roubenou hradbou s devíti věžemi a 40 bombardami',
            'Obléhání zlomil hlad, únava a ZRADA - Přibík z Klenové útok inicioval a pak ho sabotoval',
            'Legát Palomar úmyslně protahoval basilejská jednání, aby husity vnitřně rozložil',
            'Neúspěch u Plzně rozložil polní vojska a otevřel cestu k bratrovražedným Lipanům'
        ],
        casualties: { hussites: 'Vysoké ztráty a dezerce', enemy: 'Město uhájeno' },
        aftermath: 'Největší neúspěch husitů. Krize a rozpad jednoty polních vojsk - přímá cesta k Lipanům.',
        reliability: 'Vysoká'
    },

    // Obléhání hradu Sion (poslední odpor Jana Roháče)
    'sion': {
        name: 'Obléhání hradu Sion',
        date: 'květen - 6. září 1437',
        location: 'Hrádek Sion u Kutné Hory (~1 ha, bez studny)',
        hussiteSide: {
            commanders: ['Jan Roháč z Dubé'],
            strength: 'Malá posádka (~50-60 mužů)',
            composition: 'Poslední táborsko-sirotčí odbojníci'
        },
        enemySide: {
            commanders: ['Hynce Ptáček z Pirkštejna (Roháčův synovec)', 'Michal Országh (uherské posily)'],
            strength: 'Zemská hotovost a uherské oddíly',
            composition: 'Vojsko Zikmunda Lucemburského, pražští měšťané'
        },
        terrain: 'Malý nový hrádek, který Roháč sám pojmenoval "Sión". Neměl studnu - obránci trpěli žízní.',
        quotes: [
            { text: 'Jako příkladný válečník svůj boj nevzdal a nepokořil se.', source: 'J. Dolejší: Husité (o Janu Roháčovi)' }
        ],
        trivia: [
            'Roháč nový hrad sám pojmenoval "Sión" - po biblické svaté hoře',
            'Hrádek měl jen asi 1 hektar a NEMĚL studnu - obránci trpěli nedostatkem vody',
            'Velitel obléhání Hynce Ptáček byl Roháčův synovec - proto zprvu s útokem váhal',
            'Zikmund poslal koncem srpna uherské posily (Michal Országh), což útok urychlilo',
            'V Praze byli všichni oběšeni podle stavu: Roháč na nejvyšší šibenici, kněz na prostřední, lapkové na nejnižší',
            'Archeologie zpochybňuje hrdinskou verzi: na místě 4měsíčního obléhání jen 3-4 % válečných nálezů - snad "divadelní" obležení, kde příbuzný Ptáček předstíral boj'
        ],
        casualties: { hussites: '52 obránců popraveno v Praze', enemy: 'Nízké (dle archeologie)' },
        aftermath: 'Poslední husitský odpor zlomen. Zikmund pomstychtivě popravil obránce - a prý pozdě litoval.',
        reliability: 'Střední - archeologie relativizuje kronikářský obraz hrdinné řeže'
    }
};

// P8: Kronika protistrany. Nejde o doslovné citace, ale o krátké
// kontrafaktuální zápisy stylizované podle pramenů uvedených u bitvy.
// Při hráčově porážce se tato verze stane kanonickým zápisem Kroniky.
const EnemyChronicles = {
    zivohost: {
        text: 'Páni dostihli houf poutníků u Vltavy a rozehnali jej dříve, než mohl proměnit kopec v pevnost. Zemský řád byl na cestě k Novému Knínu obnoven.',
        source: 'Stylizováno podle Starých letopisů českých'
    },
    nekmir: {
        text: 'Plzeňský landfrýd sevřel Žižkovy vozy v poli a rozbil káčířský houf. Tvrz Nekmíř zůstala v rukou pravověrných.',
        source: 'Stylizováno podle Starých letopisů českých'
    },
    sudomer: {
        text: 'Královští a rožmberští zlomili uprchlíky mezi rybníky a otevřeli cestu k Písku. Vozy ani bahno tentokrát neposlušné neuchránily.',
        source: 'Stylizováno podle podání Vavřince z Březové'
    },
    vitkov: {
        text: 'Křižáci dobyli dřevěné sruby na hoře a uvolnili cestu k Praze. Obránci byli potrestáni za vzdor císaři a církvi.',
        source: 'Stylizováno jako křižácký protizápis k Vavřinci z Březové'
    },
    vysehrad: {
        text: 'Král přivedl pomoc včas, prorazil k Vyšehradu a zachránil jeho posádku. Korouhevní páni splnili slib, že půjdou i tam, kam se jiní neodváží.',
        source: 'Stylizováno podle okruhu Eberharda Windeckeho'
    },
    zatec: {
        text: 'Pevnost Slunce podlehla po opakovaných útocích a její brány se otevřely vojsku kříže. Severozápadní Čechy se znovu podřídily pravé víře.',
        source: 'Stylizováno jako letopis druhé křížové výpravy'
    },
    kutna_hora: {
        text: 'Královské vojsko uzavřelo slepého hejtmana v Kutné Hoře a jeho vozy nedokázaly prorazit. Horní město zůstalo věrné králi Zikmundovi.',
        source: 'Stylizováno jako kutnohorský královský zápis'
    },
    nemecky_brod: {
        text: 'Scolari zastavil pronásledovatele u Habrů a převedl královské vojsko přes Sázavu. Německý Brod odolal a druhá výprava si uchovala čest.',
        source: 'Stylizováno jako královský protizápis k pražské kronice'
    },
    most: {
        text: 'Mostečtí a míšeňští obránci vyrazili od hradu, překvapili Pražany a zahnali je od města. Kacířská výprava skončila pod Hněvínem porážkou.',
        source: 'Stylizováno podle katolického podání o Mostu'
    },
    horice: {
        text: 'Čeňkova jízda dobyla Gothard a rozptýlila orebské vozy na svahu. Východní Čechy znovu poznaly moc panského vojska.',
        source: 'Stylizováno jako zápis strany Čeňka z Vartenberka'
    },
    malesov: {
        text: 'Pražané a panská hotovost sevřeli slepého hejtmana u Malešova a jeho vozy na svahu zadrželi. Země byla uchráněna další Žižkovy války proti Praze.',
        source: 'Stylizováno jako pražský protizápis k Bartoškovi z Drahonic'
    },
    usti: {
        text: 'Saské korouhve prolomily vozovou pevnost na Na Běhání a otevřely cestu k Ústí. Města za Krušnými horami byla pomstěna.',
        source: 'Stylizováno jako saský protizápis ke Křížovnickému rukopisu'
    },
    tachov: {
        text: 'Kardinál shromáždil rozkolísané oddíly u Tachova a odrazil pronásledovatele od bavorské hranice. Říšské korouhve nebyly vydány bez boje.',
        source: 'Stylizováno jako zpráva tábora kardinála Beauforta'
    },
    nisa: {
        text: 'Slezská města zastavila spanilou jízdu před Nisou a uchránila své hradby i kostely. Vetřelci odtáhli bez kořisti a bez výpalného.',
        source: 'Stylizováno jako slezský městský zápis'
    },
    domazlice: {
        text: 'Legát utišil zmatek, zformoval výpravu u Domažlic a zastavil husitský postup. Chorál se ukázal být jen písní, ne zbraní.',
        source: 'Stylizováno jako zpráva papežského legáta Juliána Cesariniho'
    },
    plzen: {
        text: 'Plzeňská obec přečkala hlad i devět měsíců obležení a odrazila generální útok. Uloupený velbloud zůstal znamením města, které polní vojska nedobyla.',
        source: 'Stylizováno podle plzeňské městské tradice'
    },
    lipany: {
        text: 'Panská jednota vylákala polní vojska z vozů, obrátila ústup v úder a ukončila jejich vládu. Prokop padl a země dostala cestu k míru.',
        source: 'Stylizováno podle Bartoška z Drahonic'
    },
    sion: {
        text: 'Královské vojsko po dlouhém obležení dobylo Sion útokem a zajalo Jana Roháče i jeho věrné. Poslední ozbrojený vzdor proti králi byl zlomen.',
        source: 'Kronikářská verze — Staré letopisy české',
        counterText: 'Archeologické nálezy tvoří jen malý zlomek toho, co by po čtyřměsíčním boji zůstalo. Obléhání mohlo být zčásti divadlem, v němž příbuzný Hynce Ptáček boj spíš předstíral.',
        counterSource: 'Archeologický výzkum hradu Sion'
    }
};

for (const [battleId, chronicle] of Object.entries(EnemyChronicles)) {
    if (BattleLore[battleId]) BattleLore[battleId].enemyChronicle = chronicle;
}

// Mapování scenario ID na battle lore ID
const ScenarioToBattleLore = {
    'zivohost': 'zivohost',
    'nekmir': 'nekmir',
    'sudomer': 'sudomer',
    'vitkov': 'vitkov',
    'vysehrad': 'vysehrad',
    'zatec': 'zatec',
    'kutna_hora': 'kutna_hora',
    'nemecky_brod': 'nemecky_brod',
    'most': 'most',
    'usti': 'usti',
    'tachov': 'tachov',
    'nisa': 'nisa',
    'domazlice': 'domazlice',
    'lipany': 'lipany',
    'horice': 'horice',
    'malesov': 'malesov',
    'oblehani_plzne': 'plzen',
    'sion': 'sion'
};

// Funkce pro získání lore podle ID scénáře
function getBattleLore(scenarioId) {
    // Normalizace ID - převod na lowercase a odstranění diakritiky pro porovnání
    const normalizedId = scenarioId.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    let baseLore = null;
    let loreKey = null;

    // Hledání v mapování
    for (const [key, loreId] of Object.entries(ScenarioToBattleLore)) {
        const normalizedKey = key.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (normalizedId.includes(normalizedKey) || normalizedKey.includes(normalizedId)) {
            baseLore = BattleLore[loreId];
            loreKey = loreId;
            break;
        }
    }

    // Přímé hledání v BattleLore pokud nenalezeno
    if (!baseLore) {
        for (const [key, lore] of Object.entries(BattleLore)) {
            const normalizedKey = key.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            if (normalizedId.includes(normalizedKey) || normalizedKey.includes(normalizedId)) {
                baseLore = lore;
                loreKey = key;
                break;
            }
        }
    }

    if (!baseLore) return null;

    // Aplikuj lokalizaci pokud je dostupná
    if (typeof getLocalizedBattleLore === 'function') {
        return getLocalizedBattleLore(loreKey, baseLore);
    }

    return baseLore;
}

// Funkce pro získání náhodné trivia
function getRandomTrivia(scenarioId) {
    const lore = getBattleLore(scenarioId);
    if (lore && lore.trivia && lore.trivia.length > 0) {
        const randomIndex = Math.floor(Math.random() * lore.trivia.length);
        return lore.trivia[randomIndex];
    }
    return null;
}

// Funkce pro získání náhodného citátu
function getRandomQuote(scenarioId) {
    const lore = getBattleLore(scenarioId);
    if (lore && lore.quotes && lore.quotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * lore.quotes.length);
        return lore.quotes[randomIndex];
    }
    return null;
}
