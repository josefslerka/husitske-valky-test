// Historická data pro bitvy husitských válek
// Zdroj: detaily-bitev.md - kompilace z primárních pramenů

const BattleLore = {
    // Bitva u Živohoště
    'zivohosť': {
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
            'Petr ze Šternberka padl později na Vítkově',
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
            'Památník první vozové hradby u Nekmíře postaven až v roce 2017 - 598 let po bitvě!'
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
            strength: '~60 obránců + posily (~50 střelců, cepníci)',
            composition: 'Střelci s hákovnicemi, cepníci, 3 ženy'
        },
        enemySide: {
            commanders: ['Zikmund Lucemburský', 'Bedřich IV. Bojovný', 'Heinrich z Isenburgu (padl)', 'Pippo Spano'],
            strength: '~30 000 celkem; 7-8 000 útočníků na Vítkov',
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
            '14. červenec je Památný den české armády'
        ],
        casualties: { hussites: 'Jednotky až desítky', enemy: '100-300 padlých' },
        aftermath: 'Rozhodné vítězství. 30. července rozpuštění křížové výpravy.',
        reliability: 'Vysoká - Vavřinec z Březové byl přímý účastník'
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
            'Zikmund přišel POZDĚ - po 8:00, kdy měla posádka kapitulovat'
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
            'PRVNÍ mobilní dělostřelecký manévr v historii - noční průlom'
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
        terrain: 'Výšina u Habrů, zamrzlá Sázava. Led se stal smrtelnou pastí.',
        quotes: [
            { text: 'Město Německý Brod padá a hynou všichni... nejméně tisíc a pět set lidí.', source: 'Kronika starého pražského kolegiáta' },
            { text: '[Masakr byl] velký hřích na duších všech zúčastněných husitů.', source: 'List Jana Žižky, 1423' }
        ],
        trivia: [
            '11. ledna byl Žižka PASOVÁN NA RYTÍŘE',
            '548 rytířů se utopilo pod ledem na Sázavě',
            'Město bylo NĚKOLIK LET PUSTÉ - vlci běhali ulicemi',
            'Masakr byl odvetou za vraždění husitů v Kutné Hoře'
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
            commanders: ['Fridrich IV. Svárlivý', 'Hynek Hlaváč z Dubé', 'Zikmund z Vartenberka'],
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
            'Žižka NEBYL PŘÍTOMEN - zotavoval se z oslepení'
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
            '14 hrabat a baronů padlo',
            'POSLEDNÍ BITVA kde jízda čelně napadla vozovou hradbu'
        ],
        casualties: { hussites: 'Údajně pouze 16 mužů (!)', enemy: '~4 000' },
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
            strength: '~25 000 mužů + 1 000 anglických lučištníků',
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
            '1 000 ANGLICKÝCH LUČIŠTNÍKŮ v křižácké armádě',
            '"Nevidím, před kým utíkat, žádného nepřítele nevidím!" - sarkastický výrok rytíře Kamrovce',
            'Na 4 roky zastaveny křížové výpravy'
        ],
        casualties: { hussites: 'Zanedbatelné', enemy: 'Stovky' },
        aftermath: 'Bez boje - křižáci prchli! 3. křížová výprava končí debaklem.',
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
            { text: 'They arrived before Neisse quite unexpectedly... The peasants immediately fled.', source: 'The Hussite Wars' }
        ],
        trivia: [
            'Součást první "SPANILÉ JÍZDY" do Slezska',
            '2 000 obránců utopeno v řece Nise',
            'Vévoda z Lehnice-Břehu zbaběle uprchl',
            'Jediná větší bitva slezské rejsy - města se pak vzdávala bez boje'
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
            commanders: ['Prokop Holý', 'Zikmund Korybutovič (host)'],
            strength: '40-50 000 bojovníků',
            composition: 'Spojené svazy + 6 000 polských husitů'
        },
        enemySide: {
            commanders: ['Fridrich Hohenzollern', 'Kardinál Giuliano Cesarini', 'Zikmund ODMÍTL účast'],
            strength: '100 000+ - NEJVĚTŠÍ křížová výprava',
            composition: '9 000 vozů podle husitského vzoru, stovky děl'
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
            'Křižáci prchli, aniž by se odvážili bojovat'
        ],
        casualties: { hussites: 'Minimální', enemy: 'Stovky, ukořistěno 8 000 vozů' },
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
            '700-900 zajatců UPÁLENO ve stodolách',
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
            commanders: ['Čeněk z Vartenberka (4x přeběhlík!)', 'Jindřich Berka z Dubé', 'Mikšík z Úlibic (padl)'],
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
            'Východní Čechy = kolébka husitských hejtmanů'
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
            commanders: ['Svatohavelská koalice', 'Hynek Boček z Poděbrad (zajat)'],
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
            'Žižka zemřel 4 měsíce poté (11. října 1424)'
        ],
        casualties: { hussites: '~200', enemy: '1 200-3 000 mrtvých' },
        aftermath: 'Geniální vítězství slepého vojevůdce. NEJKRVAVĚJŠÍ bitva husitských válek.',
        reliability: 'Střední - přesná lokalizace bojiště není určena'
    }
};

// Mapování scenario ID na battle lore ID
const ScenarioToBattleLore = {
    'zivohosť': 'zivohosť',
    'nekmir': 'nekmir',
    'sudomer': 'sudomer',
    'vitkov': 'vitkov',
    'vysehrad': 'vysehrad',
    'kutna_hora': 'kutna_hora',
    'nemecky_brod': 'nemecky_brod',
    'most': 'most',
    'usti': 'usti',
    'tachov': 'tachov',
    'nisa': 'nisa',
    'domazlice': 'domazlice',
    'lipany': 'lipany',
    'horice': 'horice',
    'malesov': 'malesov'
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
