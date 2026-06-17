
const Scenarios = {
    // ==========================================
    // BITVA 0: ŽIVOHOŠŤ (4. listopadu 1419) - TUTORIÁL
    // ==========================================
    zivohost_1419: {
        id: 'zivohost_1419',
        name: 'Bitva u Živohoště',
        date: '4. listopadu 1419',
        type: 'field_battle',
        difficulty: 3,
        tutorial: false,
        description: 'První větší střetnutí husitských válek. Jihočeští poutníci musí přežít útok do příchodu posil.',
        historicalSignificance: 'Ukázka nutnosti organizované obrany, předchůdce vozové hradby.',

        briefing: {
            hussites: 'Vaše malá skupina jihočeských poutníků byla překvapena u Živohoště. Ustupte na kopec Červenka a vybudujte improvizovanou obranu. Posily z Nového Knína jsou na cestě!',
            crusaders: 'Dohoňte husitské poutníky dříve, než se jim dostane pomoci. Máte převahu - využijte ji!'
        },

        mapSize: { width: 18, height: 14 },

        terrain: {
            // Kopec Červenka - keltské hradiště (pravá strana mapy)
            hills: [
                [13,5], [14,5], [15,5],
                [13,6], [14,6], [15,6],
                [14,7], [15,7]
            ],
            // Brod přes Vltavu (levý horní roh)
            water: [
                [0,2], [1,2], [2,2],
                [0,3], [1,3]
            ],
            // Řídký les
            forest: [
                [15,0], [16,0], [17,0],
                [16,1], [17,1],
                [0,11], [1,11], [2,11],
                [0,12], [1,12], [2,12], [3,12],
                [0,13], [1,13], [2,13]
            ],
            // Benešovská silnice
            road: [
                [0,7], [1,7], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7]
            ],
            plains: 'default'
        },

        forces: {
            hussites: {
                commander: 'Břeněk Švihovský z Rýzmburka',
                units: [
                    // Kněz Koranda - kazatel na vrcholu kopce, drží morálku poutníků
                    { type: 'VACLAV_KORANDA', col: 13, row: 6 },
                    // Jihočeští poutníci - blíže kopci, mají šanci ustoupit
                    { type: 'SUDLICNICI', col: 10, row: 5 },
                    { type: 'SUDLICNICI', col: 10, row: 7 },
                    { type: 'CEPNICI', col: 11, row: 6 },
                    { type: 'KUSINICI_HUSITI', col: 12, row: 6 },
                    // Lehká jízda - zdržuje nepřítele
                    { type: 'JIZDA_HUSITI', col: 8, row: 7 }
                ],
                reinforcements: {
                    turn: 5,
                    units: [
                        // Posily z Nového Knína - přicházejí blíže k boji
                        { type: 'BRENEK_SVIHOVSKY', col: 6, row: 7 },
                        { type: 'CEPNICI', col: 5, row: 6 },
                        { type: 'CEPNICI', col: 5, row: 8 },
                        { type: 'CEPNICI', col: 6, row: 6 },
                        { type: 'SUDLICNICI', col: 6, row: 8 },
                        { type: 'SUDLICNICI', col: 7, row: 7 },
                        { type: 'KUSINICI_HUSITI', col: 7, row: 6 },
                        { type: 'KUSINICI_HUSITI', col: 7, row: 8 },
                        { type: 'JIZDA_HUSITI', col: 5, row: 7 }
                    ],
                    message: 'Posily z Nového Knína přicházejí! Břeněk Švihovský vede oddíl na pomoc!'
                }
            },
            crusaders: {
                commander: 'Petr Konopišťský ze Šternberka',
                units: [
                    // VELITEL - Petr ze Šternberka
                    { type: 'PETR_STERNBERK', col: 4, row: 7 },
                    // Těžká jízda - hlavní útočná síla
                    { type: 'TEZKY_RYTIR', col: 3, row: 6 },
                    { type: 'TEZKY_RYTIR', col: 3, row: 7 },
                    { type: 'TEZKY_RYTIR', col: 3, row: 8 },
                    { type: 'TEZKY_RYTIR', col: 4, row: 6 },
                    // Lehká jízda
                    { type: 'LEHKA_JIZDA', col: 5, row: 6 },
                    { type: 'LEHKA_JIZDA', col: 5, row: 8 },
                    // Pěchota
                    { type: 'KOPINICI', col: 2, row: 6 },
                    { type: 'KOPINICI', col: 2, row: 7 },
                    { type: 'KOPINICI', col: 2, row: 8 },
                    { type: 'HALAPARTNICI', col: 1, row: 7 }
                ]
            }
        },

        phases: [
            {
                id: 1,
                name: 'Překvapivý útok',
                turnRange: [1, 2],
                description: 'Šternberk útočí na unavené jihočeské poutníky.',
                events: [
                    { trigger: 'turn_1', message: 'Petr ze Šternberka vás dostihl! Opevněte se na kopci Červenka!' },
                    { trigger: 'turn_1', type: 'tutorial', text: 'TIP: Vaše jednotky jsou blízko kopce. Přesuňte je na zelená pole pro obranný bonus.' }
                ]
            },
            {
                id: 2,
                name: 'Obrana na kopci',
                turnRange: [3, 4],
                description: 'Husité budují improvizovanou obranu.',
                events: [
                    { trigger: 'turn_3', type: 'tutorial', text: 'TIP: Vůz poskytuje ochranu okolním jednotkám. Střelci z kopce mají bonus k útoku.' }
                ]
            },
            {
                id: 3,
                name: 'Příchod posil',
                turnRange: [5, 7],
                description: 'Posily z Nového Knína přicházejí na pomoc.',
                events: [
                    { trigger: 'turn_5', message: 'Břeněk Švihovský přivádí posily! Držte pozice!' }
                ]
            },
            {
                id: 4,
                name: 'Protiútok',
                turnRange: [8, 10],
                description: 'S posilami můžete přejít do protiútoku.',
                events: [
                    { trigger: 'turn_8', message: 'Šternberk vidí přesilu a váhá. Teď je čas udeřit!' }
                ]
            }
        ],

        victoryConditions: {
            primary: {
                type: 'survive',
                turns: 5,
                minUnitsPercent: 40,
                description: 'Přežijte do příchodu posil (kolo 5) s alespoň 40% jednotek'
            },
            secondary: [
                { type: 'hold_position', positions: [[13,6], [14,6], [15,6]], description: 'Udržte kopec Červenka' },
                { type: 'eliminate_commander', description: 'Zajměte nebo zabijte Petra ze Šternberka' }
            ]
        },

        debriefing: {
            victory: 'Posily z Nového Knína dorazily včas! Petr ze Šternberka ustoupil, když viděl odhodlanou obranu na kopci. Improvizovaný vůz jako zárodek budoucí vozové hradby ukázal cestu k novému způsobu boje.',
            defeat: 'Jihočeští poutníci byli rozprášeni. Petr ze Šternberka slaví vítězství. Husitské hnutí utrpělo těžkou ránu hned v počátcích.'
        },

        maxTurns: 10,
        playerFaction: 'hussites'
    },

    // ==========================================
    // BITVA 0.5: NEKMÍŘ (prosinec 1419) - PRVNÍ VOZOVÁ HRADBA
    // ==========================================
    nekmir_1419: {
        id: 'nekmir_1419',
        name: 'Bitva u Nekmíře',
        date: 'prosinec 1419',
        type: 'field_battle',
        difficulty: 2,
        description: 'PRVNÍ DOLOŽENÉ POUŽITÍ VOZOVÉ HRADBY! Jan Žižka s malou skupinou odráží útok plzeňského landfrýdu.',
        historicalSignificance: 'Historicky první známé použití vozové hradby. Zrod taktiky, která změní válečnictví.',

        briefing: {
            hussites: 'Vyrážíte z Plzně k nepřátelské tvrzi Nekmíř. Plzeňský landfrýd vás dostihl! Máte pouze 7 vozů - nestačí na uzavřený kruh. Vytvořte polokruh a braňte se!',
            crusaders: 'Dostihnete husitské kacíře, než stihnou zničit tvrz Nekmíř. Máte jasnou početní převahu. Zničte je!'
        },

        mapSize: { width: 20, height: 15 },

        terrain: {
            // Cesta k Nekmíři
            road: [
                [0,7], [1,7], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7],
                [10,7], [11,7], [12,7], [13,7], [14,7], [15,7]
            ],
            // Tvrz Nekmíř - cíl výpadu
            town: [
                [18,7], [19,7], [18,8], [19,8]
            ],
            // Řídký les po stranách
            forest: [
                [0,0], [1,0], [2,0], [3,0], [4,0],
                [0,1], [1,1], [2,1], [3,1], [4,1],
                [16,12], [17,12], [18,12], [19,12],
                [16,13], [17,13], [18,13], [19,13],
                [17,14], [18,14], [19,14]
            ],
            plains: 'default'
        },

        forces: {
            hussites: {
                commander: 'Jan Žižka z Trocnova',
                units: [
                    // VELITEL - Jan Žižka (jeho první známá bitva jako velitele!)
                    { type: 'JAN_ZIZKA', col: 11, row: 7 },
                    // Vozová hradba - POUZE 7 VOZŮ (polokruh)
                    { type: 'VOZOVA_HRADBA', col: 10, row: 6 },
                    { type: 'VOZOVA_HRADBA', col: 10, row: 7 },
                    { type: 'VOZOVA_HRADBA', col: 10, row: 8 },
                    // Druhá linie vozů (jen 4 další)
                    { type: 'VOZOVA_HRADBA', col: 11, row: 5 },
                    { type: 'VOZOVA_HRADBA', col: 11, row: 6 },
                    { type: 'VOZOVA_HRADBA', col: 11, row: 8 },
                    { type: 'VOZOVA_HRADBA', col: 11, row: 9 },
                    // Pěchota za vozy
                    { type: 'CEPNICI', col: 12, row: 6 },
                    { type: 'CEPNICI', col: 12, row: 7 },
                    { type: 'CEPNICI', col: 12, row: 8 },
                    { type: 'SUDLICNICI', col: 13, row: 7 },
                    // Střelci
                    { type: 'KUSINICI_HUSITI', col: 13, row: 6 },
                    { type: 'KUSINICI_HUSITI', col: 13, row: 8 },
                    { type: 'RUCNICARI', col: 14, row: 7 }
                ]
            },
            crusaders: {
                commander: 'Bohuslav ze Švamberka',
                units: [
                    // VELITEL - Bohuslav ze Švamberka (hejtman landfrýdu)
                    { type: 'BOHUSLAV_SVAMBERK', col: 3, row: 7 },
                    // Těžká jízda - hlavní útočná síla (800 jezdců!)
                    { type: 'TEZKY_RYTIR', col: 4, row: 5 },
                    { type: 'TEZKY_RYTIR', col: 4, row: 6 },
                    { type: 'TEZKY_RYTIR', col: 4, row: 7 },
                    { type: 'TEZKY_RYTIR', col: 4, row: 8 },
                    { type: 'TEZKY_RYTIR', col: 4, row: 9 },
                    { type: 'TEZKOODENCI', col: 5, row: 6 },
                    { type: 'TEZKOODENCI', col: 5, row: 7 },
                    { type: 'TEZKOODENCI', col: 5, row: 8 },
                    // Lehká jízda
                    { type: 'LEHKA_JIZDA', col: 3, row: 5 },
                    { type: 'LEHKA_JIZDA', col: 3, row: 9 },
                    // Pěchota (nezasáhla do bitvy)
                    { type: 'KOPINICI', col: 1, row: 6 },
                    { type: 'KOPINICI', col: 1, row: 7 },
                    { type: 'KOPINICI', col: 1, row: 8 },
                    { type: 'HALAPARTNICI', col: 0, row: 7 },
                    // Hynek z Nekmíře - majitel tvrze (zahyne v boji)
                    { type: 'HYNEK_NEKMIRE', col: 6, row: 7 }
                ]
            }
        },

        phases: [
            {
                id: 1,
                name: 'Husitský výpad z Plzně',
                turnRange: [1, 2],
                description: 'Žižka vytahuje z Plzně směrem k Nekmíři.',
                events: [
                    { trigger: 'turn_1', message: 'Plzeňský landfrýd dostihl husitskou kolonu! Rychle vytvořte vozovou hradbu!' },
                    { trigger: 'turn_1', type: 'tutorial', text: 'TIP: Máte pouze 7 vozů - nestačí na uzavřený kruh. Vytvořte polokruh otevřený směrem k tvrzi.' }
                ]
            },
            {
                id: 2,
                name: 'Formování první vozové hradby',
                turnRange: [3, 4],
                description: 'Žižka nařizuje novou obrannou formaci.',
                events: [
                    { trigger: 'turn_3', message: 'Žižka: "Sražte vozy k sobě! Střelci za vozy, cepníci připraveni!"' },
                    { trigger: 'turn_4', type: 'wagon_bonus', text: 'Vozová hradba je připravena! +3 k obraně pro jednotky za vozy.' }
                ]
            },
            {
                id: 3,
                name: 'Útok jízdy na vozovou hradbu',
                turnRange: [5, 7],
                description: 'Švamberk vrhá jízdu proti vozům.',
                events: [
                    { trigger: 'turn_5', message: 'Těžká jízda landfrýdu útočí! Vydrží vozová hradba?' },
                    { trigger: 'turn_6', type: 'cavalry_charge_blocked', text: 'Jízda narazila na vozy! Charge bonus negován!' }
                ]
            },
            {
                id: 4,
                name: 'Klíčová fáze bitvy',
                turnRange: [8, 9],
                description: 'Rozhodující okamžik střetu.',
                events: [
                    { trigger: 'turn_8', message: '(Historicky v této fázi padl Hynek z Nekmíře - majitel tvrze)' }
                ]
            },
            {
                id: 5,
                name: 'Ústup landfrýdu',
                turnRange: [10, 12],
                description: 'Katolíci ustupují, husité pokračují k tvrzi.',
                events: [
                    { trigger: 'turn_10', message: 'Jízda je odražena! Landfrýd se stahuje!' },
                    { trigger: 'turn_12', message: 'Vítězství! Žižka prokázal, že vozová hradba funguje!' }
                ]
            }
        ],

        victoryConditions: {
            primary: {
                type: 'survive',
                turns: 10,
                minUnitsPercent: 50,
                description: 'Odražte útok landfrýdu a přežijte do kola 10 s 50% jednotek'
            },
            secondary: [
                { type: 'kill_commander', description: 'Zabijte Hynka z Nekmíře' },
                { type: 'protect_wagons', minWagons: 5, description: 'Uchraňte alespoň 5 vozů' }
            ]
        },

        specialMechanics: {
            firstWagonWall: {
                description: 'Historicky první použití vozové hradby',
                wagonsAvailable: 7,
                formationPossible: 'semicircle_only',
                bonuses: {
                    defense: 3,
                    cavalryNegation: true,
                    rangedCover: true
                },
                vulnerabilities: {
                    openFlank: true,
                    noChains: true
                }
            }
        },

        debriefing: {
            victory: 'První vozová hradba v historii obstála! Žižka prokázal, že i malá skupina s vozy může odolat přesile. Plzeňský landfrýd byl zahnán a tvrz Nekmíř dobyta. Zrodila se taktika, která změní evropské válečnictví.',
            defeat: 'Improvizovaná vozová hradba nevydržela nápor nepřítele. Husitský výpad skončil katastrofou. Žižka však přežil a poučil se - příště bude hradba silnější a uzavřená.'
        },

        maxTurns: 12,
        playerFaction: 'hussites'
    },

    // ==========================================
    // BITVA 1: SUDOMĚŘ (25. března 1420)
    // ==========================================
    sudomere_1420: {
        id: 'sudomere_1420',
        name: 'Bitva u Sudoměře',
        date: '25. března 1420',
        type: 'field_battle',
        difficulty: 2,
        description: 'První větší husitské vítězství. Jan Žižka s malým vojskem brání hráz mezi rybníky proti přesile katolických pánů.',
        historicalSignificance: 'První úspěšné použití vozové hradby v boji.',

        briefing: {
            hussites: 'Vaše malá skupina poutníků je pronásledována vojskem katolických pánů. Využijte hráz mezi rybníky a postavte vozovou hradbu. Musíte přežít do setmění.',
            crusaders: 'Dohoňte a zničte husitské kacíře dříve, než se opevní. Útočte rychle, než padne mlha.'
        },

        mapSize: { width: 20, height: 12 },

        terrain: {
            // Hráz - úzký průchod mezi rybníky (2 hexy, řady 5-6)
            dam: [
                [9,5], [9,6]
            ],
            // Rybník Markovec - napuštěný (neprůchodný) - SEVERNĚ od hráze.
            // Historicky: hráz vedla mezi plným Markovcem a vypuštěným
            // Škaredým - útočník musel buď úzkou hrází, nebo bahnem
            water: [
                [6,0], [7,0], [8,0], [9,0], [10,0], [11,0], [12,0], [13,0],
                [6,1], [7,1], [8,1], [9,1], [10,1], [11,1], [12,1], [13,1],
                [6,2], [7,2], [8,2], [9,2], [10,2], [11,2], [12,2], [13,2],
                [6,3], [7,3], [8,3], [9,3], [10,3], [11,3], [12,3], [13,3],
                [6,4], [7,4], [8,4], [9,4], [10,4], [11,4], [12,4], [13,4]
            ],
            // Rybník Škaredý - vypuštěný (bahno) - JIŽNĚ od hráze, na straně
            // útočníka: jediný obchvat vozové hradby vede jeho dnem.
            // Pěchota platí 2 body za hex, jízda 3 - pod palbou z hráze
            mud: [
                [6,7], [7,7], [8,7], [9,7], [10,7], [11,7], [12,7], [13,7],
                [6,8], [7,8], [8,8], [9,8], [10,8], [11,8], [12,8], [13,8],
                [6,9], [7,9], [8,9], [9,9], [10,9], [11,9], [12,9], [13,9],
                [6,10], [7,10], [8,10], [9,10], [10,10], [11,10], [12,10], [13,10],
                [6,11], [7,11], [8,11], [9,11], [10,11], [11,11], [12,11], [13,11]
            ],
            // Vyvýšenina na hrázi je součástí dam terénu (dam poskytuje +20% obranu)
            plains: 'default'
        },

        forces: {
            hussites: {
                commander: 'Jan Žižka z Trocnova',
                units: [
                    // Vozová hradba - čelní zeď, ucpává úžinu mezi rybníky
                    { type: 'VOZOVA_HRADBA', col: 9, row: 5 },
                    { type: 'VOZOVA_HRADBA', col: 9, row: 6 },
                    // Střelci - TĚSNĚ za vozy, dostřel kryje úžinu (col 9) i
                    // severní okraj bahna (řady 7-8) - bagrující jízda dostane palbu
                    { type: 'KUSINICI_HUSITI', col: 10, row: 5 },
                    { type: 'KUSINICI_HUSITI', col: 10, row: 6 },
                    { type: 'RUCNICARI', col: 11, row: 5 },
                    { type: 'RUCNICARI', col: 11, row: 6 },
                    // Pěchota - druhá řada, drží linii a vyráží k protiútoku
                    { type: 'CEPNICI', col: 12, row: 5 },
                    { type: 'CEPNICI', col: 12, row: 6 },
                    { type: 'SUDLICNICI', col: 13, row: 5 },
                    // VELITEL - Jan Žižka (za linií, aura dosah 3 kryje hradbu)
                    { type: 'JAN_ZIZKA', col: 13, row: 6 },
                    // Kněz Koranda - morální kotva za hradbou (Dolejší: byl u Sudoměře)
                    { type: 'VACLAV_KORANDA', col: 14, row: 5 },
                    // Jízda - záloha připravená k výpadu
                    { type: 'JIZDA_HUSITI', col: 14, row: 6 }
                ]
            },
            crusaders: {
                commander: 'Bohuslav ze Švamberka',
                units: [
                    // VELITEL - Bohuslav ze Švamberka
                    { type: 'BOHUSLAV_SVAMBERK', col: 2, row: 5 },
                    // Těžká jízda - musí projet úzkým průchodem
                    { type: 'TEZKY_RYTIR', col: 3, row: 5 },
                    { type: 'TEZKY_RYTIR', col: 3, row: 6 },
                    { type: 'TEZKY_RYTIR', col: 4, row: 5 },
                    { type: 'TEZKY_RYTIR', col: 4, row: 6 },
                    { type: 'TEZKOODENCI', col: 5, row: 5 },
                    { type: 'TEZKOODENCI', col: 5, row: 6 },
                    // Pěchota
                    { type: 'KOPINICI', col: 2, row: 6 },
                    { type: 'HALAPARTNICI', col: 1, row: 5 },
                    { type: 'HALAPARTNICI', col: 1, row: 6 },
                    // Střelci
                    { type: 'KUSNICI', col: 0, row: 5 },
                    { type: 'KUSNICI', col: 0, row: 6 }
                ]
            }
        },

        phases: [
            {
                id: 1,
                name: 'Počáteční rozestavení',
                turnRange: [1, 3],
                description: 'Husité se opevňují na hrázi, katolíci se přibližují.',
                events: []
            },
            {
                id: 2,
                name: 'Čelní útok',
                turnRange: [4, 7],
                description: 'Johanité a královské vojsko útočí po hrázi.',
                events: [
                    { trigger: 'turn_4', message: 'Křižáci zahajují útok po úzké hrázi!' }
                ]
            },
            {
                id: 3,
                name: 'Mlha a zmatek',
                turnRange: [8, 12],
                description: 'Padá mlha, katolíci ztrácejí orientaci.',
                events: [
                    { trigger: 'turn_10', message: 'Padá hustá mlha! Viditelnost klesá.' }
                ]
            }
        ],

        victoryConditions: {
            primary: {
                type: 'survive',
                turns: 12,
                minUnitsPercent: 50,
                description: 'Přežijte do kola 12 s alespoň 50% jednotek'
            },
            secondary: [
                { type: 'destroy_percent', percent: 50, description: 'Zničte 50% nepřátelských sil' }
            ]
        },

        debriefing: {
            victory: 'Rybník a bahna se staly hrobem pro železné pány! Husité využili terénu a odrazili přesilu. Tato bitva ukázala, že správně zvolené bojiště může vyvážit i značnou početní nevýhodu. Žižkův génius se projevil naplno.',
            defeat: 'Bahna u Sudoměře se nestala pastí pro nepřítele, ale pro vás. Rytíři prolomili vaši obranu. Žižkova kariéra končí dříve, než mohla skutečně začít.'
        },

        maxTurns: 12,
        playerFaction: 'hussites'
    },

    // ==========================================
    // BITVA 2: VÍTKOV (14. července 1420)
    // ==========================================
    vitkov_1420: {
        id: 'vitkov_1420',
        name: 'Bitva na Vítkově',
        date: '14. července 1420',
        type: 'defensive_battle',
        difficulty: 2,
        description: 'Obrana Prahy proti první křížové výpravě. Malá posádka na Vítkově musí odolat do příchodu posil.',
        historicalSignificance: 'Zlomový okamžik první křížové výpravy, obrana Prahy.',

        briefing: {
            hussites: 'Žižka osobně velí hrstce obránců (26 mužů a tři ženy) ve srubech na Vítkově. Křižácká jízda se valí do úzkého hrdla šíje. Vydržte do příchodu pražské pomoci!',
            crusaders: 'Dobyjte husitské opevnění na Vítkově a otevřete cestu k Praze.'
        },

        mapSize: { width: 12, height: 8 },

        terrain: {
            // Vítkov = pevnost na úzké šíji (Dolejší). Plošina na východě,
            // obehnaná strmými srázy; jediný přístup je 2hexové hrdlo (řady 3-4)
            // se sruby. Jízda se v hrdle namačká a nemůže se rozvinout.
            // Vrcholová plošina - obránci (+30% obrana)
            hills: [
                [8,1], [9,1], [10,1], [11,1],
                [8,2], [9,2], [10,2], [11,2],
                [8,3], [9,3], [10,3], [11,3],
                [8,4], [9,4], [10,4], [11,4],
                [8,5], [9,5], [10,5], [11,5],
                [8,6], [9,6], [10,6], [11,6]
            ],
            // Strmé srázy obklopující plošinu - trychtýřují útok do hrdla.
            // 'slope' je průchozí, ale pomalý (jízda 3): svahem se dá jen
            // zemřít pod palbou, rychlá cesta vede jen hrdlem.
            slope: [
                [4,0], [5,0], [6,0], [7,0], [8,0], [9,0], [10,0], [11,0],
                [4,1], [5,1], [6,1], [7,1],
                [4,2], [5,2], [6,2], [7,2],
                [4,5], [5,5], [6,5], [7,5],
                [4,6], [5,6], [6,6], [7,6],
                [4,7], [5,7], [6,7], [7,7], [8,7], [9,7], [10,7], [11,7]
            ],
            // Příkopy v hrdle ("tři pásy úzkých příkopů" - Dolejší) - zpomalují
            // namačkanou jízdu těsně před sruby
            mud: [
                [5,3], [6,3],
                [5,4], [6,4]
            ],
            plains: 'default'
        },

        forces: {
            hussites: {
                commander: 'Jan Žižka z Trocnova',
                units: [
                    // SRUBY (vozové hradby) - ucpávají 2hexové hrdlo šíje
                    { type: 'VOZOVA_HRADBA', col: 7, row: 3 },
                    { type: 'VOZOVA_HRADBA', col: 7, row: 4 },
                    // Posádka: historicky 26 mužů, 2 ženy a panna. Velel OSOBNĚ
                    // Žižka (byl na kopci, ne posila). Cepy a sudlice, málo střelby.
                    { type: 'JAN_ZIZKA', col: 9, row: 4 },
                    { type: 'CEPNICI', col: 8, row: 3 },
                    { type: 'CEPNICI', col: 8, row: 2 },
                    { type: 'SUDLICNICI', col: 8, row: 4 },
                    { type: 'KUSINICI_HUSITI', col: 9, row: 3 }
                ],
                reinforcements: {
                    turn: 4,
                    units: [
                        // Pomoc z Prahy: kněz Jan Želivský s Tělem Páně + lid
                        // s cepy. Tento příchod zlomil útok - Němci prchli v hrůze
                        // ze svátosti (Vavřinec z Březové).
                        { type: 'JAN_ZELIVSKY', col: 10, row: 5 },
                        { type: 'CEPNICI', col: 10, row: 6 },
                        { type: 'CEPNICI', col: 11, row: 5 },
                        { type: 'SUDLICNICI', col: 11, row: 6 }
                    ],
                    message: 'Kněz Jan Želivský přivádí z Prahy lid s Tělem Páně! Křižáci couvají před svátostí!'
                }
            },
            crusaders: {
                commander: 'Heinrich z Isenburgu',
                units: [
                    // VELITEL - Heinrich z Isenburgu
                    { type: 'HEINRICH_ISENBURG', col: 1, row: 3 },
                    // Míšeňská těžká jízda - hlavní útočná síla
                    { type: 'TEZKY_RYTIR', col: 0, row: 2 },
                    { type: 'TEZKY_RYTIR', col: 0, row: 3 },
                    { type: 'TEZKY_RYTIR', col: 0, row: 4 },
                    // Rakouská jízda
                    { type: 'TEZKOODENCI', col: 1, row: 2 },
                    { type: 'TEZKOODENCI', col: 1, row: 4 },
                    // Střelci
                    { type: 'KUSNICI', col: 2, row: 2 },
                    { type: 'KUSNICI', col: 2, row: 4 },
                    // Lehká jízda - průzkum
                    { type: 'LEHKA_JIZDA', col: 3, row: 5 }
                ]
            }
        },

        phases: [
            {
                id: 1,
                name: 'Útok na šíji',
                turnRange: [1, 3],
                description: 'Míšeňská a duryňská jízda se valí do úzkého hrdla šíje.',
                events: []
            },
            {
                id: 2,
                name: 'Boj o sruby',
                turnRange: [4, 6],
                description: 'Křižáci pronikají k opevnění. Posily z Prahy jsou na cestě!',
                events: []
            },
            {
                id: 3,
                name: 'Protiútok',
                turnRange: [7, 8],
                description: 'Husité vytlačují křižáky z kopce.',
                events: []
            }
        ],

        victoryConditions: {
            primary: {
                type: 'survive',
                turns: 8,
                minUnitsPercent: 30,
                description: 'Přežijte do kola 8 s alespoň 30% jednotek'
            },
            secondary: [
                { type: 'kill_commander', description: 'Zabijte nepřátelského velitele' }
            ]
        },

        debriefing: {
            victory: 'Vítkov obstál! Žižka s hrstkou obránců, včetně žen, odrazil tisíce křižáků. Zikmund ztratil naději na rychlé dobytí Prahy. Toto vítězství povzbudilo husitské hnutí a ukázalo, že odhodlaní obránci mohou porazit i přesilu.',
            defeat: 'Sruby na Vítkově padly a s nimi i naděje Prahy. Křižáci obsadili strategickou výšinu a Praha je v obležení. Husitská revoluce končí dříve, než mohla rozvinout svou sílu.'
        },

        maxTurns: 8,
        playerFaction: 'hussites'
    },

    // ==========================================
    // BITVA 2.5: VYŠEHRAD (1. listopadu 1420)
    // ==========================================
    vysehrad_1420: {
        id: 'vysehrad_1420',
        name: 'Bitva pod Vyšehradem',
        date: '1. listopadu 1420',
        type: 'relief_battle',
        difficulty: 4,
        description: 'Rozhodující husitské vítězství. Zikmund přichází pozdě a česká šlechta je pobita v úvozu pod Podolím.',
        historicalSignificance: 'Praha plně v husitských rukou. Ztráta důvěry české šlechty v Zikmunda. 25 korouhevních pánů padlo.',

        briefing: {
            hussites: 'Obléháte Vyšehrad od září. Posádka vyjednala kapitulaci na ráno (středověká "hodina patnáctá") - pokud Zikmund nepřijde dřív. Je Den všech svatých a královské vojsko se blíží. Braňte své pozice!',
            crusaders: 'Musíte prorazit k Vyšehradu a zachránit posádku! Česká šlechta útočí od Podolí, hlavní voj čelně.'
        },

        mapSize: { width: 30, height: 25 },

        terrain: {
            // Vyšehradská pevnost
            town: [
                [25,5], [26,5], [27,5], [28,5], [29,5],
                [25,6], [26,6], [27,6], [28,6], [29,6],
                [25,7], [26,7], [27,7], [28,7], [29,7],
                [26,8], [27,8], [28,8], [29,8]
            ],
            // Pankrácká pláň - hlavní bojiště
            plains: 'default',
            // Husitské příkopy u sv. Pankráce
            trenches: [
                [12,12], [13,12], [14,12], [15,12], [16,12], [17,12], [18,12],
                [12,13], [13,13], [14,13], [15,13], [16,13], [17,13], [18,13],
                [13,14], [14,14], [15,14], [16,14], [17,14]
            ],
            // Kostel sv. Pankráce
            church: [
                [15,13]
            ],
            // Podolský svah - strmý, past pro jízdu (šlechta musí sesednout)
            slope: [
                [20,20], [21,20], [22,20], [23,20], [24,20],
                [20,21], [21,21], [22,21], [23,21], [24,21],
                [21,22], [22,22], [23,22], [24,22],
                [22,23], [23,23], [24,23]
            ],
            // Mokřiny a rybníky pod Podolím - kde sesednutá šlechta uvázla
            // a sedláci ji bez slitování ubíjeli cepy (Dolejší)
            mud: [
                [19,23], [20,23], [21,23], [25,23],
                [19,24], [20,24], [21,24], [22,24], [23,24], [24,24], [25,24]
            ],
            // Údolí Botiče
            forest: [
                [5,15], [6,15], [7,15], [8,15], [9,15],
                [5,16], [6,16], [7,16], [8,16], [9,16], [10,16],
                [6,17], [7,17], [8,17], [9,17], [10,17]
            ],
            // Vltava - západní hranice
            water: [
                [0,0], [1,0], [2,0], [3,0], [4,0], [5,0],
                [0,1], [1,1], [2,1], [3,1], [4,1], [5,1],
                [0,2], [1,2], [2,2], [3,2], [4,2],
                [0,3], [1,3], [2,3], [3,3],
                [0,4], [1,4], [2,4],
                [0,5], [1,5],
                [0,6], [1,6],
                [0,7], [1,7],
                [0,8], [1,8]
            ],
            // Benešovská silnice
            road: [
                [15,24], [15,23], [15,22], [15,21], [15,20], [15,19], [15,18], [15,17], [15,16], [15,15]
            ]
        },

        forces: {
            hussites: {
                commander: 'Hynek Krušina z Lichtenburka',
                units: [
                    // VELITEL - Hynek Krušina (25 let, zvolen velitelem)
                    { type: 'HYNEK_KRUSINA', col: 15, row: 13 },
                    // Pražané - hlavní pozice v příkopech
                    { type: 'CEPNICI', col: 13, row: 12 },
                    { type: 'CEPNICI', col: 14, row: 12 },
                    { type: 'CEPNICI', col: 15, row: 12 },
                    { type: 'CEPNICI', col: 16, row: 12 },
                    { type: 'CEPNICI', col: 17, row: 12 },
                    { type: 'SUDLICNICI', col: 12, row: 13 },
                    { type: 'SUDLICNICI', col: 18, row: 13 },
                    // Střelci v příkopech
                    { type: 'KUSINICI_HUSITI', col: 14, row: 13 },
                    { type: 'KUSINICI_HUSITI', col: 16, row: 13 },
                    { type: 'KUSINICI_HUSITI', col: 15, row: 14 },
                    // Táboři - u Botiče
                    { type: 'CEPNICI', col: 8, row: 16 },
                    { type: 'SUDLICNICI', col: 9, row: 16 },
                    // Záloha - Krušinovi muži
                    { type: 'CEPNICI', col: 14, row: 14 },
                    { type: 'SUDLICNICI', col: 16, row: 14 },
                    // Orebité - přední záloha
                    { type: 'CEPNICI', col: 15, row: 15 },
                    // Husitská jízda - blízká
                    { type: 'JIZDA_HUSITI', col: 12, row: 15 },
                    { type: 'JIZDA_HUSITI', col: 18, row: 15 }
                ]
            },
            crusaders: {
                commander: 'Zikmund Lucemburský',
                units: [
                    // VELITEL - Zikmund (osobně přítomen, ale velí z povzdálí)
                    { type: 'ZIKMUND', col: 15, row: 22 },
                    // Uhři a Němci - hlavní útok po benešovské silnici
                    { type: 'TEZKY_RYTIR', col: 15, row: 21 },
                    { type: 'LEHKA_JIZDA', col: 14, row: 21 },
                    { type: 'LEHKA_JIZDA', col: 13, row: 21 },
                    { type: 'LEHKA_JIZDA', col: 17, row: 21 },
                    { type: 'TEZKOODENCI', col: 14, row: 22 },
                    { type: 'TEZKOODENCI', col: 16, row: 22 },
                    // Průzkumníci - předsunuté pozice
                    { type: 'LEHKA_JIZDA', col: 12, row: 20 },
                    { type: 'LEHKA_JIZDA', col: 18, row: 20 },
                    // Pěchota
                    { type: 'KOPINICI', col: 14, row: 23 },
                    { type: 'KOPINICI', col: 15, row: 23 },
                    { type: 'KOPINICI', col: 16, row: 23 },
                    { type: 'HALAPARTNICI', col: 13, row: 22 },
                    { type: 'HALAPARTNICI', col: 17, row: 22 },
                    // Střelci - posílení
                    { type: 'KUSNICI', col: 14, row: 24 },
                    { type: 'KUSNICI', col: 16, row: 24 },
                    { type: 'KUSNICI', col: 13, row: 24 },
                    { type: 'KUSNICI', col: 17, row: 24 },
                    // Česká a moravská šlechta - boční útok od Podolí (blíže k boji!)
                    { type: 'TEZKY_RYTIR', col: 22, row: 20 },
                    { type: 'TEZKY_RYTIR', col: 23, row: 20 },
                    { type: 'TEZKY_RYTIR', col: 24, row: 21 },
                    { type: 'TEZKOODENCI', col: 24, row: 20 },
                    { type: 'TEZKOODENCI', col: 23, row: 21 },
                    // Jindřich z Plumlova - varoval před útokem
                    { type: 'JINDRICH_PLUMOV', col: 21, row: 20 }
                ]
            }
        },

        // Posily - fázové nasazení husitských záloh
        reinforcements: {
            orebska_zaloha: {
                turn: 7,
                faction: 'hussites',
                message: 'Hynek Krušina nasazuje orebské cepníky z rezervy!',
                units: [
                    { type: 'CEPNICI', col: 14, row: 15 },
                    { type: 'CEPNICI', col: 16, row: 15 },
                    { type: 'SUDLICNICI', col: 15, row: 16 }
                ]
            },
            vysehradske_oddily: {
                turn: 8,
                faction: 'hussites',
                message: 'Jednotky uvolněné z obléhání Vyšehradu se připojují k bitvě!',
                units: [
                    { type: 'JIZDA_HUSITI', col: 15, row: 18 },
                    { type: 'JIZDA_HUSITI', col: 20, row: 18 }
                ]
            }
        },

        phases: [
            {
                id: 1,
                name: 'Zikmund přichází pozdě',
                turnRange: [1, 2],
                description: 'Královské vojsko dorazí až po ultimátu ke kapitulaci - příliš pozdě.',
                events: [
                    { trigger: 'turn_1', message: 'Ultimátum vypršelo - vyšehradská posádka už kapitulovala a nemůže vám pomoci!' },
                    { trigger: 'turn_2', message: 'Zikmund marně mává mečem směrem k Vyšehradu. Je pozdě.' }
                ]
            },
            {
                id: 2,
                name: 'Útok na pankrácká opevnění',
                turnRange: [3, 4],
                description: 'Uhři a Němci čelně útočí na husitské příkopy.',
                events: [
                    {
                        id: 'trench_attack_msg',
                        trigger: 'turn_3',
                        triggerBefore: 'turn_5',
                        condition: { type: 'units_in_area', faction: 'crusaders', area: { minCol: 10, maxCol: 20, minRow: 10, maxRow: 16 }, minCount: 3 },
                        message: 'Uhři a Němci zahajují čelní útok na vaše příkopy!'
                    },
                    { trigger: 'turn_3', type: 'trench_bonus', text: 'Připravené pozice poskytují +3 k obraně!' }
                ]
            },
            {
                id: 3,
                name: 'Boční útok české šlechty',
                turnRange: [5, 8],
                description: 'Česká a moravská šlechta útočí od Podolí.',
                events: [
                    {
                        id: 'plumov_warning',
                        trigger: 'turn_4',
                        triggerBefore: 'turn_7',
                        condition: { type: 'units_in_area', faction: 'crusaders', area: { minCol: 18, maxCol: 24, minRow: 15, maxRow: 21 }, minCount: 2 },
                        message: 'Jindřich z Plumlova varuje před útokem přes svah. Zikmund ho obviní ze zbabělosti!'
                    },
                    {
                        id: 'nobility_dismount_msg',
                        trigger: 'turn_5',
                        triggerBefore: 'turn_8',
                        condition: { type: 'units_in_area', faction: 'crusaders', area: { minCol: 20, maxCol: 24, minRow: 18, maxRow: 23 }, minCount: 2 },
                        message: 'Uražená česká šlechta útočí! Musí sesednout kvůli strmému svahu.'
                    },
                    {
                        id: 'nobility_dismount_effect',
                        trigger: 'turn_5',
                        triggerBefore: 'turn_8',
                        condition: { type: 'units_in_area', faction: 'crusaders', area: { minCol: 20, maxCol: 24, minRow: 18, maxRow: 23 }, minCount: 2 },
                        type: 'dismount',
                        faction: 'crusaders',
                        text: 'Česká šlechta ztrácí výhodu jízdy na strmém svahu!'
                    }
                ]
            },
            {
                id: 4,
                name: 'Husitský protiútok',
                turnRange: [7, 9],
                description: 'Hynek Krušina nasazuje zálohy.',
                events: [
                    { trigger: 'turn_7', message: 'Orebští cepníci vstupují do bitvy! Zálohy jsou nasazeny.' },
                    { trigger: 'turn_8', message: 'Jednotky z obléhání Vyšehradu se připojují k bitvě!' }
                ]
            },
            {
                id: 5,
                name: 'Masakr české šlechty',
                turnRange: [10, 14],
                description: 'Šlechta je uvězněna v úvozu a pobita.',
                events: [
                    {
                        id: 'nobility_trapped',
                        trigger: 'turn_9',
                        triggerBefore: 'turn_14',
                        condition: { type: 'units_routing', faction: 'crusaders', minCount: 2 },
                        message: 'Česká šlechta uvízla v úvozu! Nemůže uniknout!'
                    },
                    {
                        id: 'massacre_event',
                        trigger: 'turn_10',
                        triggerBefore: 'turn_14',
                        condition: { type: 'units_routing', faction: 'crusaders', minCount: 3 },
                        type: 'massacre',
                        faction: 'crusaders',
                        text: 'Táboři a orebité nebrali zajatce... Masakr v úvozu!'
                    }
                ]
            },
            {
                id: 6,
                name: 'Všeobecný ústup',
                turnRange: [15, 17],
                description: 'Zikmund dává rozkaz k ústupu.',
                events: [
                    {
                        id: 'retreat_order',
                        trigger: 'turn_12',
                        triggerBefore: 'turn_17',
                        condition: { type: 'faction_losses_percent', faction: 'crusaders', percent: 40 },
                        message: 'Zikmund dává rozkaz k ústupu! Královské vojsko prchá k Českému Brodu.'
                    },
                    { trigger: 'turn_17', message: 'Vítězství! Praha je plně v husitských rukou. 25 korouhevních pánů padlo.' }
                ]
            }
        ],

        victoryConditions: {
            primary: {
                type: 'hold_position',
                positions: [[15,13]],
                turns: 15,
                description: 'Ubraňte kostel sv. Pankráce do kola 15'
            },
            secondary: [
                { type: 'destroy_percent', percent: 50, description: 'Způsobte 50% ztrát královskému vojsku' },
                { type: 'kill_commander', description: 'Pobijte nepřátelské velitele (historicky 25 korouhevních pánů)' }
            ]
        },

        specialMechanics: {
            capitulationAgreement: {
                description: 'Vyšehradská posádka kapitulovala ráno ("hodina patnáctá" = ~8:00 ráno, vlašské hodiny)',
                effect: 'no_vysehrad_sortie',
                note: 'Posádka do bitvy nezasáhne bez ohledu na průběh'
            },
            lateArrival: {
                description: 'Zikmund dorazil hodinu po ultimátu',
                effect: 'no_pincer_movement'
            },
            terrainTrap: {
                description: 'Podolský svah - past pro těžkou jízdu',
                effect: 'cavalry_must_dismount',
                retreatBlocked: true,
                massacrePotential: true
            },
            noQuarterGiven: {
                description: 'Táboři a orebité nebrali zajatce',
                effect: 'routed_units_destroyed',
                exception: 'hussite_nobles_could_ransom'
            }
        },

        debriefing: {
            victory: 'Rozhodující vítězství pod Vyšehradem! 25 korouhevních pánů české šlechty padlo v mokřinách pod Podolím. Vyšehradská posádka kapitulovala a Praha je plně v husitských rukou. Zikmund přišel pozdě a s ním i důvěra české šlechty v jeho schopnosti. Moravský hejtman Jindřich z Plumlova, hnaný králem na porážku a pak opuštěný, padl podle svého slibu: "Budeme nakonec v bitvě, kde ty už nebudeš!"',
            defeat: 'Zikmundovy síly prorazily k Vyšehradu včas. Posádka byla zachráněna a husité utrpěli těžké ztráty. Obléhání Prahy pokračuje a husitská věc je v ohrožení.'
        },

        maxTurns: 17,
        playerFaction: 'hussites'
    },

    // ==========================================
    // BITVA: ŽATEC (10. září - 2. října 1421) - 2. křížová výprava
    // ==========================================
    zatec_1421: {
        id: 'zatec_1421',
        name: 'Obrana Žatce',
        date: '10. září 1421',
        type: 'defensive_battle',
        difficulty: 3,
        description: 'Druhá křížová výprava obléhá "pevnost Slunce". Obrovská přesila proti žatecké posádce. Udržte hradby, než se výprava zlomí.',
        historicalSignificance: 'Neúspěch u Žatce nalomil 2. křížovou výpravu - bez jediné polní bitvy se Žižkou.',

        briefing: {
            hussites: 'Žatec - "pevnost Slunce" - obléhá obrovská křižácká výprava. Ohře vás chrání ze tří stran, útok jde jen na západní hradbu. Žádný slavný velitel zde není - drží celá obec. Odrazte útoky, než výpravu zlomí hlad a spory knížat.',
            crusaders: 'Rozbijte žateckou hradbu děly a vezměte město. Erkinger vede útok. Padne-li Žatec, husitský severozápad je váš.'
        },

        mapSize: { width: 18, height: 11 },

        terrain: {
            // Město Žatec na ostrožně - hradby a zástavba (obrana)
            town: [
                [8,3],[9,3],[10,3],[11,3],[12,3],[13,3],[14,3],[15,3],
                [8,4],[9,4],[10,4],[11,4],[12,4],[13,4],[14,4],[15,4],
                [8,5],[9,5],[10,5],[11,5],[12,5],[13,5],[14,5],[15,5],
                [8,6],[9,6],[10,6],[11,6],[12,6],[13,6],[14,6],[15,6],
                [8,7],[9,7],[10,7],[11,7],[12,7],[13,7],[14,7],[15,7]
            ],
            // Řeka Ohře - obtéká ostrožnu ze tří stran (S, V, J), neprůchodná
            water: [
                [7,2],[8,2],[9,2],[10,2],[11,2],[12,2],[13,2],[14,2],[15,2],[16,2],
                [16,3],[16,4],[16,5],[16,6],[16,7],
                [7,8],[8,8],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[15,8],[16,8]
            ],
            // Glacis před západní hradbou - útočníci ho přecházejí pomalu pod palbou
            slope: [
                [6,3],[7,3],[6,4],[7,4],[6,5],[7,5],[6,6],[7,6],[6,7],[7,7]
            ],
            plains: 'default'
        },

        forces: {
            hussites: {
                commander: 'Žatecký hejtman (jméno nedoloženo)',
                units: [
                    // Velitel obrany - bezejmenný žatecký hejtman, uvnitř města
                    { type: 'ZATECKY_HEJTMAN', col: 11, row: 5 },
                    // Západní hradba - hlavní obranná linie
                    { type: 'SUDLICNICI', col: 8, row: 3 },
                    { type: 'CEPNICI', col: 8, row: 4 },
                    { type: 'KUSINICI_HUSITI', col: 8, row: 5 },
                    { type: 'CEPNICI', col: 8, row: 6 },
                    { type: 'SUDLICNICI', col: 8, row: 7 },
                    // Druhá řada - dělo a palné zbraně (Žatec je měl)
                    { type: 'TARASNICE', col: 9, row: 4 },
                    { type: 'RUCNICARI', col: 9, row: 5 },
                    { type: 'KUSINICI_HUSITI', col: 9, row: 6 },
                    // Záloha
                    { type: 'CEPNICI', col: 10, row: 4 },
                    { type: 'KUSINICI_HUSITI', col: 10, row: 6 }
                ]
            },
            crusaders: {
                commander: 'Erkinger ze Seinsheim',
                units: [
                    // VELITEL - Erkinger ze Seinsheim
                    { type: 'ERKINGER_SEINSHEIM', col: 2, row: 5 },
                    // Obléhací děla - bombardují hradbu
                    { type: 'HOUFNICE', col: 0, row: 4 },
                    { type: 'HOUFNICE', col: 0, row: 6 },
                    // Těžká jízda a pěchota - útok na hradby
                    { type: 'TEZKY_RYTIR', col: 1, row: 3 },
                    { type: 'TEZKY_RYTIR', col: 1, row: 4 },
                    { type: 'TEZKY_RYTIR', col: 1, row: 6 },
                    { type: 'TEZKY_RYTIR', col: 1, row: 7 },
                    { type: 'TEZKOODENCI', col: 2, row: 4 },
                    { type: 'TEZKOODENCI', col: 2, row: 6 },
                    { type: 'HALAPARTNICI', col: 3, row: 3 },
                    { type: 'HALAPARTNICI', col: 3, row: 7 },
                    { type: 'KOPINICI', col: 3, row: 4 },
                    { type: 'KOPINICI', col: 3, row: 6 },
                    { type: 'KUSNICI', col: 3, row: 5 }
                ]
            }
        },

        phases: [
            {
                id: 1,
                name: 'Obležení',
                turnRange: [1, 3],
                description: 'Křižáci obkličují Žatec a zahajují palbu z děl.',
                events: [
                    { trigger: 'turn_1', message: 'Křižácké vojsko obklíčilo Žatec. Děla pálí na hradby!' }
                ]
            },
            {
                id: 2,
                name: 'Šest útoků',
                turnRange: [4, 8],
                description: 'Erkinger žene pěchotu na hradby - jeden útok za druhým.',
                events: [
                    { trigger: 'turn_4', message: 'Erkinger zahajuje útok na západní hradbu! Držte linii!' }
                ]
            },
            {
                id: 3,
                name: 'Požár ležení',
                turnRange: [9, 12],
                description: 'Křižácké ležení hoří, knížata se hádají, tábor svírá hlad.',
                events: [
                    { trigger: 'turn_10', type: 'panic', faction: 'crusaders', level: 2, title: 'Požár ležení!', text: 'Křižácké ležení vzplálo! Hlad, spory knížat a zprávy o blížících se posilách lámou výpravu.' }
                ]
            }
        ],

        victoryConditions: {
            primary: {
                type: 'survive',
                turns: 12,
                minUnitsPercent: 50,
                description: 'Udržte hradby do kola 12 s alespoň 50% obránců'
            },
            secondary: [
                { type: 'kill_commander', description: 'Zabijte Erkingera ze Seinsheim' }
            ]
        },

        debriefing: {
            victory: 'Žatec obstál! Šest útoků odraženo, ležení v plamenech - druhá křížová výprava se rozpadá, aniž stanula proti Žižkovi. "Pevnost Slunce" obhájila celá obec, beze jména jediného hrdiny. Sláva města, ne muže.',
            defeat: 'Hradby Žatce padly. Křižáci vnikli do "pevnosti Slunce" a husitský severozápad leží otevřený. Druhá výprava slaví krvavý úspěch.'
        },

        maxTurns: 12,
        playerFaction: 'hussites'
    },

    // ==========================================
    // BITVA: KUTNÁ HORA (21.-22. prosince 1421)
    // ==========================================
    kutna_hora_1421: {
        id: 'kutna_hora_1421',
        name: 'Bitva u Kutné Hory',
        date: '21. prosince 1421',
        type: 'breakout_battle',
        difficulty: 4,
        description: 'Žižka obklíčen přesilou u Kutné Hory po zradě měšťanů. Musí v noci prorazit vozovou hradbou!',
        historicalSignificance: 'První ofenzivní použití palných zbraní z pohybující se vozové hradby. Geniální taktický ústup.',

        briefing: {
            hussites: 'Kutnohorští horníci vás zradili a vpustili křižáky do města! Jste v obklíčení. Připravte noční průlom vozovou hradbou - musíte prorazit na jihozápad ke Kolínu!',
            crusaders: 'Husité jsou v pasti! Obklíčili jsme je před městem. Zničte Žižkovu vozovou hradbu dříve, než unikne!'
        },

        mapSize: { width: 16, height: 14 },

        mapLabels: [
            { text: 'Kutná Hora', hexes: [[12,1],[13,1],[14,1],[15,1],[12,2],[13,2],[14,2],[15,2],[12,3],[13,3],[14,3],[15,3]] },
            { text: 'Kaňk', hexes: [[13,5],[14,5],[15,5],[14,6],[15,6]] }
        ],

        terrain: {
            // Kutná Hora - město (zradilo, v rukou křižáků)
            town: [
                [12,1], [13,1], [14,1], [15,1],
                [12,2], [13,2], [14,2], [15,2],
                [12,3], [13,3], [14,3], [15,3]
            ],
            // Vrch Kaňk - severovýchodně
            hills: [
                [13,5], [14,5], [15,5],
                [14,6], [15,6]
            ],
            // Cesta ke Kolínu (jihozápad - cíl útěku)
            road: [
                [8,7], [7,8], [6,9], [5,10], [4,11], [3,12], [2,13],
                // Cesta od města
                [12,4], [11,5], [10,6], [9,7]
            ],
            // Lesy kolem
            forest: [
                [0,0], [1,0], [2,0],
                [0,1], [1,1], [2,1],
                [0,2], [1,2],
                [0,10], [1,10],
                [0,11], [1,11], [2,11],
                [14,10], [15,10],
                [14,11], [15,11], [15,12]
            ],
            plains: 'default'
        },

        forces: {
            hussites: {
                commander: 'Jan Žižka z Trocnova',
                units: [
                    // VELITEL - Žižka (za vozovou hradbou)
                    { type: 'JAN_ZIZKA', col: 8, row: 6 },
                    // Vozová hradba - formace pro průlom (obdélník 3x3 bez středu)
                    { type: 'VOZOVA_HRADBA', col: 7, row: 5 },
                    { type: 'VOZOVA_HRADBA', col: 8, row: 5 },
                    { type: 'VOZOVA_HRADBA', col: 9, row: 5 },
                    { type: 'VOZOVA_HRADBA', col: 7, row: 6 },
                    { type: 'VOZOVA_HRADBA', col: 9, row: 6 },
                    { type: 'VOZOVA_HRADBA', col: 7, row: 7 },
                    { type: 'VOZOVA_HRADBA', col: 8, row: 7 },
                    { type: 'VOZOVA_HRADBA', col: 9, row: 7 },
                    // Pěchota za hradbou (řádek 8)
                    { type: 'CEPNICI', col: 7, row: 8 },
                    { type: 'CEPNICI', col: 9, row: 8 },
                    { type: 'SUDLICNICI', col: 8, row: 8 },
                    // Střelci před hradbou (řádek 4)
                    { type: 'RUCNICARI', col: 7, row: 4 },
                    { type: 'RUCNICARI', col: 9, row: 4 },
                    { type: 'KUSINICI_HUSITI', col: 6, row: 5 },
                    { type: 'KUSINICI_HUSITI', col: 10, row: 5 }
                ]
            },
            crusaders: {
                commander: 'Zikmund Lucemburský',
                units: [
                    // VELITEL - Zikmund (za městem, bezpečně)
                    { type: 'ZIKMUND', col: 13, row: 3 },
                    // Uherská jízda - severní obklíčení
                    { type: 'TEZKY_RYTIR', col: 6, row: 2 },
                    { type: 'TEZKY_RYTIR', col: 7, row: 2 },
                    { type: 'TEZKY_RYTIR', col: 8, row: 2 },
                    { type: 'TEZKY_RYTIR', col: 9, row: 2 },
                    { type: 'LEHKA_JIZDA', col: 5, row: 3 },
                    { type: 'LEHKA_JIZDA', col: 10, row: 3 },
                    // Východní blok (od města)
                    { type: 'KOPINICI', col: 11, row: 5 },
                    { type: 'KOPINICI', col: 11, row: 6 },
                    { type: 'KOPINICI', col: 11, row: 7 },
                    { type: 'HALAPARTNICI', col: 12, row: 6 },
                    // Západní blok
                    { type: 'TEZKY_RYTIR', col: 4, row: 5 },
                    { type: 'TEZKY_RYTIR', col: 4, row: 7 },
                    { type: 'LEHKA_JIZDA', col: 5, row: 6 },
                    // Jižní blok (blokuje cestu ke Kolínu) - vede Pippo Spano
                    { type: 'FILIPPO_SCOLARI', col: 6, row: 10 },
                    { type: 'KOPINICI', col: 6, row: 9 },
                    { type: 'KOPINICI', col: 7, row: 9 },
                    { type: 'KOPINICI', col: 8, row: 9 },
                    { type: 'LEHKA_JIZDA', col: 5, row: 10 },
                    { type: 'LEHKA_JIZDA', col: 9, row: 10 },
                    // Střelci
                    { type: 'KUSNICI', col: 10, row: 4 },
                    { type: 'KUSNICI', col: 6, row: 4 },
                    { type: 'KUSNICI', col: 10, row: 8 }
                ]
            }
        },

        phases: [
            {
                id: 1,
                name: 'Obklíčení',
                turnRange: [1, 2],
                description: 'Kutnohorští zradili! Křižáci svírají husity ze všech stran.',
                events: [
                    { trigger: 'turn_1', message: 'Kutnohorští horníci otevřeli Kolínskou bránu! Křižáci proudí do města - jste v obklíčení!' },
                    { trigger: 'turn_2', message: 'Žižka připravuje noční průlom. Formujte vozovou hradbu směrem na jihozápad!' }
                ]
            },
            {
                id: 2,
                name: 'Noční průlom',
                turnRange: [3, 5],
                description: 'V pět ráno Žižka zahajuje průlom! Palné zbraně střílejí z jedoucích vozů.',
                events: [
                    { trigger: 'turn_3', message: 'PRŮLOM! Palte z vozů za jízdy! Ručničáři - palba do tmy!' },
                    { trigger: 'turn_4', message: 'Křižáci v nočním zmatku nedokáží koordinovat obranu!' }
                ]
            },
            {
                id: 3,
                name: 'Ústup ke Kaňku',
                turnRange: [6, 8],
                description: 'Husité prorazili! Ustupují ke Kolínu pod ochranou vozové hradby.',
                events: [
                    { trigger: 'turn_6', message: 'Prorazili jste obklíčení! Ustupujte na jihozápad ke Kolínu!' },
                    { trigger: 'turn_8', message: 'Jste v bezpečí! Křižáci vás nedokáží zastavit. Žižka již plánuje protiútok...' }
                ]
            }
        ],

        victoryConditions: {
            primary: {
                type: 'escape',
                escapeZone: [[2,12], [2,13], [3,12], [3,13]],
                unitsRequired: 5,
                description: 'Dostaňte alespoň 5 jednotek na jihozápadní okraj mapy (ke Kolínu)'
            },
            secondary: [
                { type: 'survive_commander', description: 'Žižka musí přežít' },
                { type: 'save_wagons', count: 4, description: 'Zachraňte alespoň 4 vozy' }
            ]
        },

        specialMechanics: {
            betrayal: {
                description: 'Kutnohorští měšťané zradili husity',
                effect: 'city_hostile',
                note: 'Město je v rukou nepřítele od začátku'
            },
            nightBreakout: {
                description: 'Noční průlom - snížená viditelnost',
                effect: 'reduced_enemy_accuracy',
                note: 'Od tahu 3: křižáci mají -20% přesnost střelby'
            },
            mobileFirearms: {
                description: 'Střelba z jedoucích vozů',
                effect: 'wagons_can_shoot_after_move',
                note: 'Historicky první použití palných zbraní za pohybu'
            }
        },

        debriefing: {
            victory: 'Geniální noční průlom! Žižka vyvedl celou vozovou hradbu z obklíčení pod palbou vlastních hakovnic. Toto je první zdokumentované použití palných zbraní z jedoucích vozů. Kutnohorští zrádci budou potrestáni, ale Žižkovo vojsko uniklo do bezpečí.',
            defeat: 'Průlom selhal. Vozová hradba byla rozbita a Žižkova armáda zničena. Kutná Hora zůstává v rukou nepřítele a husitské hnutí přichází o svého nejschopnějšího vojevůdce.'
        },

        maxTurns: 8,
        playerFaction: 'hussites'
    },

    // ==========================================
    // BITVA: NĚMECKÝ BROD (8.-10. ledna 1422)
    // ==========================================
    nemecky_brod_1422: {
        id: 'nemecky_brod_1422',
        name: 'Bitva u Německého Brodu',
        date: '8. ledna 1422',
        type: 'pursuit_battle',
        difficulty: 2,
        description: 'Pronásledování ustupujícího Zikmundova vojska od Kutné Hory. Led na Sázavě se propadá pod těžkými vozy.',
        historicalSignificance: 'Konec 2. křížové výpravy. Poslední Zikmundovo tažení v Čechách. Kořist 500 vozů.',

        briefing: {
            hussites: 'Zikmund prchá od Kutné Hory k Německému Brodu! Pronásledujte ustupující vojsko a zničte ho dříve, než unikne přes Sázavu. Pozor - led na řece je tenký!',
            crusaders: 'Ústup! Musíte se dostat přes Sázavu k Německému Brodu. Most je přeplněný - část vojska musí přes zamrzlou řeku.'
        },

        mapSize: { width: 16, height: 16 },

        mapLabels: [
            { text: 'Německý Brod', hexes: [[7,14],[8,14],[9,14],[7,15],[8,15],[9,15]] },
            { text: 'Sázava', hexes: [[0,12],[1,12],[2,12],[3,12],[4,12],[5,12],[6,12],[7,12],[8,12],[9,12],[10,12],[11,12],[12,12],[13,12],[14,12],[15,12]] }
        ],

        terrain: {
            // Kopec u Habrů - nahoře vlevo
            hills: [
                [3,1], [4,1], [5,1],
                [3,2], [4,2], [5,2]
            ],
            // Zamrzlá Sázava - v dolní třetině mapy (brod u [8,12] je v road)
            water: [
                [0,12], [1,12], [2,12], [3,12], [4,12], [5,12], [6,12], [7,12],
                [9,12], [10,12], [11,12], [12,12], [13,12], [14,12], [15,12]
            ],
            // Most přes Sázavu (úzký průchod)
            road: [
                [8,11], [8,12], [8,13],
                // Cesta od severu k mostu
                [8,0], [8,1], [8,2], [8,3], [8,4], [8,5],
                [8,6], [8,7], [8,8], [8,9], [8,10]
            ],
            // Les kolem cesty
            forest: [
                [5,3], [6,3], [7,3],
                [9,3], [10,3], [11,3],
                [5,4], [6,4],
                [10,4], [11,4],
                [0,5], [1,5],
                [13,5], [14,5], [15,5],
                [13,6], [14,6]
            ],
            // Německý Brod - město za řekou
            town: [
                [7,14], [8,14], [9,14],
                [7,15], [8,15], [9,15]
            ],
            plains: 'default'
        },

        forces: {
            hussites: {
                commander: 'Jan Žižka z Trocnova',
                units: [
                    // VELITEL - Žižka (již slepý na obě oči) - přichází ze severu
                    { type: 'JAN_ZIZKA', col: 8, row: 1 },
                    // Vozová hradba - hlavní síla
                    { type: 'VOZOVA_HRADBA', col: 7, row: 2 },
                    { type: 'VOZOVA_HRADBA', col: 8, row: 2 },
                    { type: 'VOZOVA_HRADBA', col: 9, row: 2 },
                    // Táborité - pěchota
                    { type: 'CEPNICI', col: 6, row: 3 },
                    { type: 'CEPNICI', col: 7, row: 3 },
                    { type: 'CEPNICI', col: 9, row: 3 },
                    { type: 'CEPNICI', col: 10, row: 3 },
                    { type: 'SUDLICNICI', col: 6, row: 4 },
                    { type: 'SUDLICNICI', col: 10, row: 4 },
                    // Střelci
                    { type: 'KUSINICI_HUSITI', col: 7, row: 4 },
                    { type: 'KUSINICI_HUSITI', col: 9, row: 4 },
                    { type: 'RUCNICARI', col: 8, row: 3 },
                    // Jízda - pronásledování (křídla)
                    { type: 'JIZDA_HUSITI', col: 4, row: 2 },
                    { type: 'JIZDA_HUSITI', col: 12, row: 2 }
                ]
            },
            crusaders: {
                commander: 'Filippo Scolari',
                units: [
                    // VELITEL - Scolari (velí ústupu, blíž k řece)
                    { type: 'FILIPPO_SCOLARI', col: 8, row: 9 },
                    // Uherská jízda - prchá k řece
                    { type: 'TEZKY_RYTIR', col: 7, row: 10 },
                    { type: 'TEZKY_RYTIR', col: 8, row: 10 },
                    { type: 'TEZKY_RYTIR', col: 9, row: 10 },
                    { type: 'LEHKA_JIZDA', col: 6, row: 9 },
                    { type: 'LEHKA_JIZDA', col: 10, row: 9 },
                    // Německá pěchota - zadní voj (blíž k husitům)
                    { type: 'KOPINICI', col: 7, row: 6 },
                    { type: 'KOPINICI', col: 8, row: 6 },
                    { type: 'KOPINICI', col: 9, row: 6 },
                    { type: 'HALAPARTNICI', col: 7, row: 7 },
                    { type: 'HALAPARTNICI', col: 9, row: 7 },
                    // Střelci - krytí ústupu
                    { type: 'KUSNICI', col: 8, row: 7 },
                    { type: 'KUSNICI', col: 10, row: 8 },
                    // Těžkoodění - stráž u mostu
                    { type: 'TEZKOODENCI', col: 7, row: 11 },
                    { type: 'TEZKOODENCI', col: 9, row: 11 }
                ]
            }
        },

        phases: [
            {
                id: 1,
                name: 'Pronásledování od Kutné Hory',
                turnRange: [1, 3],
                description: 'Žižkovo vojsko pronásleduje ustupující křižáky.',
                events: [
                    { trigger: 'turn_1', message: 'Zikmund uprchl! Scolariho vojsko ustupuje k Německému Brodu. Pronásledujte je!' },
                    { trigger: 'turn_2', message: 'Křižáci zanechávají kořist po cestě. Nedejte se rozptýlit - ničte vojsko!' }
                ]
            },
            {
                id: 2,
                name: 'Srážka u Habrů',
                turnRange: [4, 6],
                description: 'Křižáci se pokouší zastavit husity na kopci u Habrů.',
                events: [
                    { trigger: 'turn_4', message: 'Scolariho zadní voj se pokouší zastavit postup na kopci u Habrů!' },
                    { trigger: 'turn_5', message: 'Křižáci neudrží pozice - začínají prchat k řece!' }
                ]
            },
            {
                id: 3,
                name: 'Útěk přes Sázavu',
                turnRange: [7, 9],
                description: 'Panikařící vojsko se valí k mostu a na zamrzlou řeku.',
                events: [
                    { trigger: 'turn_7', message: 'Most je přeplněný! Část vojska se pokouší přejít přes zamrzlou Sázavu!' },
                    { trigger: 'turn_8', message: 'Led praská pod těžkými vozy! Řeka pohlcuje prchající!' }
                ]
            },
            {
                id: 4,
                name: 'Zničení ustupujícího vojska',
                turnRange: [10, 12],
                description: 'Husité dobíjejí zbytky královského vojska.',
                events: [
                    { trigger: 'turn_10', message: 'Královské vojsko je rozprášeno! Sbírejte kořist a dobijte zbytky odporu.' },
                    { trigger: 'turn_12', message: 'Vítězství! 500 vozů kořisti ukořistěno. Druhá křížová výprava skončila.' }
                ]
            }
        ],

        victoryConditions: {
            primary: {
                type: 'destroy_percent',
                percent: 70,
                description: 'Zničte alespoň 70% královského vojska'
            },
            secondary: [
                { type: 'kill_commander', target: 'FILIPPO_SCOLARI', description: 'Porazte Filippo Scolariho' },
                { type: 'fast_victory', maxTurns: 10, description: 'Zvítězte do 10. kola' }
            ]
        },

        specialMechanics: {
            frozenRiver: {
                description: 'Zamrzlá Sázava - tenký led',
                effect: 'heavy_units_drown',
                note: 'Těžké jednotky (rytíři, vozy) riskují propadnutí při přechodu řeky'
            },
            pursuit: {
                description: 'Pronásledování - křižáci ustupují',
                effect: 'enemy_retreating',
                note: 'AI křižáků se snaží utéct přes řeku, ne bojovat'
            },
            bridgeBottleneck: {
                description: 'Most je úzký - jen 1 jednotka za tah',
                effect: 'bridge_limit',
                position: [8, 12]
            }
        },

        debriefing: {
            victory: 'Katastrofa křižáckého vojska! Zikmundovi muži prchali přes zamrzlou Sázavu a led se pod nimi propadal. Desítky rytířů utonuly ve svých zbrojích. 500 vozů s proviantem padlo do vašich rukou. 2. křížová výprava končí naprostým debaklem.',
            defeat: 'Zikmund unikl! Většina jeho vojska překročila Sázavu a spálila most za sebou. Kořist je minimální a příští křížová výprava přijde mnohem dříve.'
        },

        maxTurns: 12,
        playerFaction: 'hussites'
    },

    // ==========================================
    // BITVA: MOST (5. srpna 1421)
    // ==========================================
    most_1421: {
        id: 'most_1421',
        name: 'Bitva u Mostu',
        date: '5. srpna 1421',
        type: 'dual_objective_battle',
        difficulty: 4,
        description: 'Želivského neúspěšné obléhání hradu Hněvín. Pražané obléhají, ale z jihu přichází pomoc.',
        historicalSignificance: 'První velká porážka husitů. Ukázala, že bez Žižky a bez vozové hradby husité prohrávají.',

        briefing: {
            hussites: 'Hrad Hněvín je téměř náš! Posádka nabídla kapitulaci, ale Želivský ji odmítl. Máš dva cíle: dobýt hrad NEBO zablokovat městskou bránu, odkud může přijít posila. Na obojí nemáš dost mužů - rozhodni se!',
            crusaders: 'Držte hrad za každou cenu! Posily markraběte Fridricha jsou na cestě. Mostečtí vyrazí z brány a udeří husitům do boku.'
        },

        mapSize: { width: 18, height: 16 },

        mapLabels: [
            { text: 'Hrad Hněvín', hexes: [[8,0],[9,0],[10,0],[8,1],[9,1],[10,1]] },
            { text: 'Most', hexes: [[7,13],[8,13],[9,13],[10,13],[7,14],[8,14],[9,14],[10,14],[8,15],[9,15]] },
            { text: 'Klášter', hexes: [[8,7],[9,7]] }
        ],

        terrain: {
            // Hrad Hněvín (sever) + Město Most (jih)
            town: [
                // Hrad Hněvín
                [8,0], [9,0], [10,0],
                [8,1], [9,1], [10,1],
                // Město Most
                [7,13], [8,13], [9,13], [10,13],
                [7,14], [8,14], [9,14], [10,14],
                [8,15], [9,15]
            ],
            // Svahy kopce
            hills: [
                [7,1], [11,1],
                [6,2], [7,2], [8,2], [9,2], [10,2], [11,2], [12,2],
                [6,3], [7,3], [8,3], [9,3], [10,3], [11,3], [12,3],
                [7,4], [8,4], [9,4], [10,4], [11,4]
            ],
            // Klášter - husitský tábor
            church: [
                [8,7], [9,7]
            ],
            // Cesta od brány (končí před městem)
            road: [
                [9,10], [9,11], [9,12]
            ],
            // Lesy po stranách
            forest: [
                [0,4], [1,4], [2,4],
                [0,5], [1,5], [2,5],
                [15,4], [16,4], [17,4],
                [15,5], [16,5], [17,5],
                [0,10], [1,10],
                [16,10], [17,10]
            ],
            plains: 'default'
        },

        forces: {
            hussites: {
                commander: 'Jan Želivský',
                units: [
                    // VELITEL - Želivský (u kláštera)
                    { type: 'JAN_ZELIVSKY', col: 9, row: 6 },
                    // Pěchota - připravena k útoku na hrad
                    { type: 'CEPNICI', col: 8, row: 5 },
                    { type: 'CEPNICI', col: 9, row: 5 },
                    { type: 'CEPNICI', col: 10, row: 5 },
                    { type: 'SUDLICNICI', col: 7, row: 5 },
                    { type: 'SUDLICNICI', col: 11, row: 5 },
                    { type: 'SUDLICNICI', col: 9, row: 4 },
                    // Střelci
                    { type: 'KUSINICI_HUSITI', col: 7, row: 6 },
                    { type: 'KUSINICI_HUSITI', col: 11, row: 6 },
                    { type: 'RUCNICARI', col: 8, row: 6 },
                    { type: 'RUCNICARI', col: 10, row: 6 },
                    // Obléhací zařízení
                    { type: 'HOUFNICE', col: 9, row: 7 },
                    // Vozy (málo užitečné na svahu)
                    { type: 'VOZOVA_HRADBA', col: 8, row: 8 },
                    { type: 'VOZOVA_HRADBA', col: 10, row: 8 }
                ]
            },
            crusaders: {
                commander: 'Fridrich IV. Bojovný',
                units: [
                    // HRADNÍ POSÁDKA (na hradě)
                    { type: 'KOPINICI', col: 8, row: 1 },
                    { type: 'KOPINICI', col: 10, row: 1 },
                    { type: 'KUSNICI', col: 9, row: 0 },
                    { type: 'KUSNICI', col: 9, row: 1 },
                    // MOSTECKÁ POSÁDKA (ve městě - vyjde v tahu 3)
                    // Přidány jako reinforcements
                ]
            }
        },

        reinforcements: {
            // Mostecká posádka - boční úder
            mostecka_posadka: {
                turn: 3,
                faction: 'crusaders',
                message: 'Mostecká hotovost vyráží z městské brány!',
                units: [
                    { type: 'KOPINICI', col: 9, row: 12 },
                    { type: 'KOPINICI', col: 8, row: 12 },
                    { type: 'KOPINICI', col: 10, row: 12 },
                    { type: 'TEZKY_RYTIR', col: 9, row: 13 }
                ]
            },
            // Míšeňská armáda - hlavní posily
            misenska_armada: {
                turn: 5,
                faction: 'crusaders',
                message: 'Míšeňská armáda markraběte Fridricha přichází ze severu!',
                units: [
                    { type: 'FRIDRICH_MISNENSKY', col: 9, row: 0 },
                    { type: 'TEZKY_RYTIR', col: 7, row: 0 },
                    { type: 'TEZKY_RYTIR', col: 8, row: 0 },
                    { type: 'TEZKY_RYTIR', col: 10, row: 0 },
                    { type: 'KOPINICI', col: 11, row: 0 },
                    { type: 'KOPINICI', col: 6, row: 0 },
                    { type: 'KOPINICI', col: 12, row: 0 },
                    { type: 'KUSNICI', col: 7, row: 1 },
                    { type: 'KUSNICI', col: 11, row: 1 }
                ]
            }
        },

        phases: [
            {
                id: 1,
                name: 'Obléhání',
                turnRange: [1, 2],
                description: 'Hrad Hněvín je na dosah. Posádka nabídla kapitulaci, ale Želivský odmítl.',
                events: [
                    { trigger: 'turn_1', message: 'Želivský: "Žádná milost pro zrádce! Dobyjeme hrad silou!"' },
                    { trigger: 'turn_2', message: 'Hradní posádka se houževnatě brání. Z města se ozývá ruch...' }
                ]
            },
            {
                id: 2,
                name: 'Boční úder',
                turnRange: [3, 4],
                description: 'Mostečtí vyrazili z brány! Úder do boku husitského vojska.',
                events: [
                    { trigger: 'turn_3', message: 'Z městské brány vyráží mostecká hotovost! Úder do boku!' },
                    { trigger: 'turn_4', message: 'Musíte se rozhodnout - pokračovat v útoku na hrad, nebo se otočit?' }
                ]
            },
            {
                id: 3,
                name: 'Příchod posil',
                turnRange: [5, 7],
                description: 'Míšeňská armáda! Markrabě Fridrich přichází ze severu!',
                events: [
                    { trigger: 'turn_5', message: 'Na obzoru míšeňské prapory! Markrabě Fridrich přichází s posilami!' },
                    { trigger: 'turn_6', message: 'Útok na hrad je nyní velmi riskantní. Zvažte alternativní cíl.' }
                ]
            },
            {
                id: 4,
                name: 'Rozhodnutí',
                turnRange: [8, 10],
                description: 'Splňte alespoň jeden cíl, nebo čelíte porážce.',
                events: [
                    { trigger: 'turn_8', message: 'Čas se krátí! Držte bránu, nebo dobyjte hrad!' },
                    { trigger: 'turn_10', message: 'Poslední šance! Buď splníte cíl, nebo je vše ztraceno.' }
                ]
            }
        ],

        victoryConditions: {
            primary: {
                type: 'dual_objective',
                description: 'Splň JEDEN z cílů: Dobij hrad Hněvín NEBO udrž městskou bránu zablokovanou',
                objectives: [
                    {
                        id: 'capture_castle',
                        type: 'capture_position',
                        positions: [[9,0], [9,1]],
                        holdTurns: 2,
                        description: 'Dobij a udrž hrad Hněvín (2 kola)'
                    },
                    {
                        id: 'block_gate',
                        type: 'capture_position',
                        positions: [[9,12]],
                        // Brána je 5 hexů od nejbližší jednotky (pohyb 2) - obsadit ji lze
                        // nejdřív v kole 3, při maxTurns 10 je tedy strop držení 8 kol
                        holdTurns: 6,
                        description: 'Zablokuj městskou bránu a udrž 6 kol'
                    }
                ]
            },
            secondary: [
                { type: 'both_objectives', description: 'Splň OBA cíle' },
                { type: 'survive_commander', description: 'Želivský přežije' },
                { type: 'protect_artillery', description: 'Zachraň houfnici' },
                { type: 'max_losses', maxLosses: 5, description: 'Méně než 5 ztracených jednotek' }
            ]
        },

        specialMechanics: {
            weakCommander: {
                description: 'Želivský je kněz, ne voják',
                effect: 'reduced_aura',
                note: 'Menší velitelská aura, žádné bojové bonusy'
            },
            flanking: {
                description: 'Boční úder z města',
                effect: 'reinforcements_from_south',
                note: 'V tahu 3 vyrazí mostecká posádka z brány'
            },
            dualObjective: {
                description: 'Dva cíle - stačí splnit jeden',
                effect: 'alternative_victory',
                note: 'Dobij hrad NEBO zablokuj bránu'
            }
        },

        debriefing: {
            victory: 'Hrad Hněvín je váš! Kombinace dobývání hradu a blokování městské brány se vyplatila. Most je pod husitskou kontrolou a cesta do Saska otevřena pro budoucí spanilé jízdy.',
            defeat: 'Mostečtí měšťané a posádka hradu udrželi své pozice. Husitský útok selhal a vojsko musí ustoupit. Severozápadní Čechy zůstávají v rukou nepřítele.'
        },

        maxTurns: 10,
        playerFaction: 'hussites'
    },

    // ==========================================
    // BITVA 3: ÚSTÍ NAD LABEM (16. června 1426)
    // ==========================================
    usti_1426: {
        id: 'usti_1426',
        name: 'Bitva u Ústí nad Labem',
        date: '16. června 1426',
        type: 'field_battle',
        difficulty: 2,
        description: 'Nejkrvavější porážka křižáků. Husité s dvojitou vozovou hradbou decimují útočící Sasy.',
        historicalSignificance: 'Poslední velký čelní útok na vozovou hradbu. Ztráty křižáků: 4000, husitů: 30.',

        briefing: {
            hussites: 'Postavte dvojitou vozovou hradbu na návrší Na Běhání. Nechte nepřítele přijít k vám a zničte ho palbou.',
            crusaders: 'Prorazte husitské opevnění a osvoboďte obležené Ústí nad Labem.'
        },

        mapSize: { width: 22, height: 14 },

        terrain: {
            // Návrší Na Běhání (kóta 212)
            hills: [
                [14,4], [15,4], [16,4], [17,4], [18,4],
                [14,5], [15,5], [16,5], [17,5], [18,5],
                [14,6], [15,6], [16,6], [17,6], [18,6],
                [15,7], [16,7], [17,7]
            ],
            // Potok Ždírnice pod kopcem
            water: [
                [10,3], [11,4], [12,5], [11,6], [10,7]
            ],
            // Cesta od Chabařovic
            road: [
                [0,5], [1,5], [2,5], [3,5], [4,5], [5,5]
            ],
            plains: 'default'
        },

        forces: {
            hussites: {
                commander: 'Prokop Holý',
                units: [
                    // VELITEL - Prokop Holý
                    { type: 'PROKOP_HOLY', col: 17, row: 5 },
                    // Dvojitá vozová hradba - vnější linie (první pás)
                    { type: 'VOZOVA_HRADBA', col: 14, row: 4 },
                    { type: 'VOZOVA_HRADBA', col: 14, row: 5 },
                    { type: 'VOZOVA_HRADBA', col: 14, row: 6 },
                    // Vnitřní linie (druhý pás)
                    { type: 'VOZOVA_HRADBA', col: 16, row: 4 },
                    { type: 'VOZOVA_HRADBA', col: 16, row: 5 },
                    { type: 'VOZOVA_HRADBA', col: 16, row: 6 },
                    // Pěchota mezi vozy
                    { type: 'CEPNICI', col: 15, row: 4 },
                    { type: 'CEPNICI', col: 15, row: 6 },
                    { type: 'SUDLICNICI', col: 15, row: 5 },
                    // Střelci za vnitřní linií
                    { type: 'KUSINICI_HUSITI', col: 17, row: 4 },
                    { type: 'KUSINICI_HUSITI', col: 17, row: 6 },
                    { type: 'RUCNICARI', col: 18, row: 5 },
                    // Dělostřelectvo - houfnice a tarasnice
                    { type: 'HOUFNICE', col: 18, row: 4 },
                    { type: 'TARASNICE', col: 17, row: 7 },
                    { type: 'TARASNICE', col: 18, row: 6 },
                    // Jízda - křídla
                    { type: 'JIZDA_HUSITI', col: 13, row: 5 },
                    { type: 'JIZDA_HUSITI', col: 13, row: 7 }
                ]
            },
            crusaders: {
                commander: 'Fridrich Saský',
                units: [
                    // VELITEL - vévoda Fridrich Saský (Bojovný)
                    { type: 'FRIDRICH_SASKY', col: 2, row: 5 },
                    // Saská a míšeňská jízda - hlavní útočná síla
                    { type: 'TEZKY_RYTIR', col: 3, row: 4 },
                    { type: 'TEZKY_RYTIR', col: 3, row: 5 },
                    { type: 'TEZKY_RYTIR', col: 3, row: 6 },
                    { type: 'TEZKOODENCI', col: 4, row: 4 },
                    { type: 'TEZKOODENCI', col: 4, row: 6 },
                    // Pěchota
                    { type: 'HALAPARTNICI', col: 1, row: 4 },
                    { type: 'HALAPARTNICI', col: 1, row: 6 },
                    { type: 'KOPINICI', col: 0, row: 4 },
                    { type: 'KOPINICI', col: 0, row: 6 },
                    // Střelci
                    { type: 'KUSNICI', col: 2, row: 3 },
                    { type: 'KUSNICI', col: 2, row: 7 },
                    { type: 'LUCISTNICI', col: 1, row: 3 },
                    { type: 'LUCISTNICI', col: 1, row: 7 },
                    // Lehká jízda
                    { type: 'LEHKA_JIZDA', col: 5, row: 5 }
                ]
            }
        },

        phases: [
            {
                id: 1,
                name: 'Křižácký útok',
                turnRange: [1, 4],
                description: 'Němci útočí v parném vedru.',
                events: [
                    { trigger: 'turn_1', message: 'Saské vojsko zahajuje útok v nesnesitelném vedru!' }
                ]
            },
            {
                id: 2,
                name: 'Palba z vozů',
                turnRange: [5, 8],
                description: 'Husitské palné zbraně decimují útočníky.',
                events: []
            },
            {
                id: 3,
                name: 'Panika a útěk',
                turnRange: [9, 12],
                description: 'Křižáci se dávají na bezhlavý útěk.',
                events: [
                    { trigger: 'turn_9', message: '"Běží! Němci běží!" - křižáci prchají!' }
                ]
            }
        ],

        victoryConditions: {
            primary: {
                type: 'destroy_percent',
                percent: 50,
                description: 'Udržte vozovou hradbu a zničte 50% křižáků'
            },
            secondary: [
                { type: 'destroy_percent', percent: 75, description: 'Zničte 75% nepřátel (historický výsledek)' }
            ]
        },

        debriefing: {
            victory: 'Masakr Na Běhání! 4000 křižáků padlo, zatímco husité ztratili pouhých 30 mužů. Dvojitá vozová hradba se ukázala jako nepřekonatelná překážka. Saské vévodství je zdecimováno a už nikdy nevyšle vojsko proti husitům.',
            defeat: 'Saská jízda prorazila vaši hradbu! Katastrofální porážka husitů mění rovnováhu sil. Bez vozové hradby jste bezbranní proti těžké jízdě.'
        },

        maxTurns: 12,
        playerFaction: 'hussites'
    },

    // ==========================================
    // BITVA: TACHOV (3.-4. srpna 1427)
    // ==========================================
    tachov_1427: {
        id: 'tachov_1427',
        name: 'Bitva u Tachova',
        date: '3.-4. srpna 1427',
        type: 'pursuit_battle',
        difficulty: 1,
        description: 'Čtvrtá křížová výprava končí útěkem. Křižáci prchají před husity, aniž by se odvážili bojovat.',
        historicalSignificance: 'Psychologické vítězství husitů - samotná jejich pověst stačí k porážce křižáků. Kardinál Beaufort roztrhá říšské korouhve.',

        briefing: {
            hussites: 'Křižáci neúspěšně obléhali Stříbro a nyní se stahují k Tachovu. Přibližte se rychle a využijte jejich demoralizace. Pronásledujte prchající a zajměte Tachov!',
            crusaders: 'Husité se blíží! Vaše vojsko je demoralizované po neúspěšném obléhání Stříbra. Pokuste se zorganizovat obranu, nebo ustupte k bavorským hranicím.'
        },

        mapSize: { width: 22, height: 14 },

        terrain: {
            // Město Tachov
            town: [
                [16,5], [17,5], [16,6], [17,6]
            ],
            // Vrch u Tachova (pozice křižáckého velení)
            hills: [
                [18,4], [19,4], [18,5], [19,5]
            ],
            // Šumavské hvozdy směrem k Bavorsku
            forest: [
                [19,0], [20,0], [21,0],
                [19,1], [20,1], [21,1],
                [20,2], [21,2],
                [19,11], [20,11], [21,11],
                [19,12], [20,12], [21,12],
                [20,13], [21,13]
            ],
            // Cesta od Stříbra (západ)
            road: [
                [0,6], [1,6], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [10,6], [11,6], [12,6]
            ],
            // Cesta k Bavorsku (východ) - úniková trasa
            road2: [
                [19,6], [20,6], [21,6]
            ],
            // Křižácký tábor severně od města (pláně)
            plains: 'default'
        },

        // Speciální hexy pro únik
        escapeZone: [[20,6], [21,6], [20,5], [21,5], [20,7], [21,7]],

        mapLabels: [
            { text: 'Tachov', hexes: [[16,5], [17,5], [16,6], [17,6]] },
            { text: 'K Bavorsku', hexes: [[20,6], [21,6]] },
            { text: 'Od Stříbra', hexes: [[0,6], [1,6]] },
            { text: 'Vrch', hexes: [[18,4], [19,4]] }
        ],

        forces: {
            hussites: {
                commander: 'Prokop Holý',
                units: [
                    // VELITEL - Prokop Holý
                    { type: 'PROKOP_HOLY', col: 3, row: 6 },
                    // Táborité - hlavní síla
                    { type: 'VOZOVA_HRADBA', col: 2, row: 5 },
                    { type: 'VOZOVA_HRADBA', col: 2, row: 6 },
                    { type: 'VOZOVA_HRADBA', col: 2, row: 7 },
                    { type: 'CEPNICI', col: 3, row: 5 },
                    { type: 'CEPNICI', col: 3, row: 7 },
                    { type: 'SUDLICNICI', col: 4, row: 5 },
                    { type: 'SUDLICNICI', col: 4, row: 7 },
                    // Sirotci
                    { type: 'CEPNICI', col: 1, row: 6 },
                    { type: 'SUDLICNICI', col: 1, row: 5 },
                    // Střelci
                    { type: 'KUSINICI_HUSITI', col: 1, row: 7 },
                    { type: 'RUCNICARI', col: 0, row: 6 },
                    // Dělostřelectvo
                    { type: 'HOUFNICE', col: 0, row: 5 },
                    { type: 'TARASNICE', col: 0, row: 7 },
                    // Pražané
                    { type: 'PAVEZNICI', col: 4, row: 6 },
                    // Jízda - pronásledování
                    { type: 'JIZDA_HUSITI', col: 5, row: 4 },
                    { type: 'JIZDA_HUSITI', col: 5, row: 8 }
                ]
            },
            crusaders: {
                commander: 'Ota z Ziegenheimu',
                units: [
                    // Křižácké velení na vrchu - demoralizované
                    { type: 'TEZKY_RYTIR', col: 18, row: 4 },
                    { type: 'TEZKY_RYTIR', col: 19, row: 4 },
                    // Hlavní síla v táboře severně od Tachova
                    { type: 'TEZKOODENCI', col: 15, row: 3 },
                    { type: 'TEZKOODENCI', col: 16, row: 3 },
                    { type: 'KOPINICI', col: 14, row: 4 },
                    { type: 'KOPINICI', col: 14, row: 5 },
                    { type: 'HALAPARTNICI', col: 15, row: 4 },
                    // Angličtí lučištníci kardinála Beauforta
                    { type: 'LUCISTNICI', col: 17, row: 3 },
                    { type: 'LUCISTNICI', col: 18, row: 3 },
                    // Lehká jízda - průzkum
                    { type: 'LEHKA_JIZDA', col: 13, row: 5 },
                    { type: 'LEHKA_JIZDA', col: 13, row: 7 },
                    // Jízda Jindřicha z Plavna (vrátila se bez boje)
                    { type: 'TEZKY_RYTIR', col: 12, row: 6 },
                    // Oddíly plzeňského landfrýdu
                    { type: 'KUSNICI', col: 14, row: 6 },
                    { type: 'KUSNICI', col: 15, row: 5 }
                ]
            }
        },

        phases: [
            {
                id: 1,
                name: 'Husitský pochod',
                turnRange: [1, 2],
                description: 'Husité postupují od Stříbra. Křižáci vysílají jízdu, aby zpomalila postup.',
                events: [
                    { trigger: 'turn_1', message: 'Husitské vojsko se blíží od Stříbra! 16 000 pěších a 1500 jezdců pod Prokopem Holým.' },
                    { trigger: 'turn_2', type: 'panic', faction: 'crusaders', level: 1, text: 'Jízda Jindřicha z Plavna se vrací bez boje - odmítli napadnout husity!' }
                ]
            },
            {
                id: 2,
                name: 'Panika v táboře',
                turnRange: [3, 5],
                description: 'Strach se šíří křižáckým táborem. Jednotky začínají dezertovat.',
                events: [
                    { trigger: 'turn_3', type: 'panic', faction: 'crusaders', level: 2, text: 'Celé oddíly křižáků opouštějí tábor a prchají k hranicím!' },
                    { trigger: 'turn_4', message: 'Kardinál Beaufort se marně snaží zastavit prchající vojáky.' },
                    { trigger: 'turn_5', type: 'panic', faction: 'crusaders', level: 3, text: 'Beaufort v hněvu roztrhá říšské korouhve a hodí je knížatům k nohám!' }
                ]
            },
            {
                id: 3,
                name: 'Útěk k Bavorsku',
                turnRange: [6, 10],
                description: 'Křižácká armáda prchá. Husité pronásledují a dobývají opuštěný tábor.',
                events: [
                    { trigger: 'turn_6', type: 'rout', faction: 'crusaders', text: 'Zbytky křižácké armády se dávají na útěk k bavorským hranicím!' },
                    { trigger: 'turn_7', message: 'Husité nacházejí opuštěný křižácký tábor plný zásob a výzbroje.' }
                ]
            }
        ],

        specialMechanics: {
            // Křižáci se snaží uprchnout
            pursuit: true,
            escapeTarget: { col: 21, row: 6 },
            // Demoralizace - křižáci mají sníženou morálku
            startingMorale: {
                crusaders: 40  // Křižáci začínají s nízkou morálkou
            }
        },

        victoryConditions: {
            primary: {
                type: 'destroy_or_rout',
                percent: 50,
                description: 'Zničte nebo rozprašte 50% křižácké armády'
            },
            secondary: [
                { type: 'capture_position', positions: [[16,5], [17,5]], description: 'Zajměte město Tachov', bonus: 'Historické vítězství' },
                { type: 'destroy_percent', percent: 75, description: 'Zničte 75% nepřátel před jejich útěkem' }
            ]
        },

        debriefing: {
            victory: 'Čtvrtá křížová výprava končí naprostým debaklem! Křižáci prchli, aniž by se odvážili bojovat. Kardinál Beaufort v zoufalství roztrhal říšské korouhve. O několik dní později husité dobývají Tachov - 11. srpna město a 14. srpna hrad. Prokop Holý se stává nejmocnějším mužem v Čechách.',
            defeat: 'Křižákům se podařilo překonat strach a zorganizovat obranu. Husitská pověst neporazitelnosti dostala trhlinu. Tachov zůstává v rukou nepřítele.'
        },

        maxTurns: 10,
        playerFaction: 'hussites'
    },

    // ==========================================
    // BITVA: NISA (18. března 1428) - Spanilá jízda do Slezska
    // ==========================================
    nisa_1428: {
        id: 'nisa_1428',
        name: 'Bitva u Nisy',
        date: '18. března 1428',
        type: 'assault_battle',
        difficulty: 2,
        description: 'Spanilá jízda do Slezska. Husité drtivě poráží slezské vojsko před hradbami města Nisa.',
        historicalSignificance: 'Jediná větší bitva slezské rejsy. Po tomto vítězství se města vzdávala bez boje nebo platila výpalné.',

        briefing: {
            hussites: 'Po úspěšné rejse do Uher pokračujeme do Slezska. Před hradbami Nisy nás očekává vojsko vratislavského biskupa. Rozdrťte je a vypálte předměstí!',
            crusaders: 'Husité táhnou na Nisu! Shromážděte sedláky a měšťany k obraně. Město musí být ubráněno za každou cenu!'
        },

        mapSize: { width: 20, height: 14 },

        terrain: {
            // Město Nisa (hradby na východě)
            town: [
                [16,5], [17,5], [18,5],
                [16,6], [17,6], [18,6],
                [16,7], [17,7], [18,7]
            ],
            // Předměstí (mezi husity a městem)
            church: [
                [13,5], [14,5], [13,6], [14,6]
            ],
            // Řeka Nisa (pod městem)
            water: [
                [15,9], [16,9], [17,9], [18,9], [19,9],
                [16,10], [17,10], [18,10], [19,10],
                [17,11], [18,11], [19,11]
            ],
            // Cesta od západu (odkud přicházejí husité)
            road: [
                [0,6], [1,6], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6]
            ],
            // Lesy kolem
            forest: [
                [0,0], [1,0], [2,0],
                [0,1], [1,1],
                [0,12], [1,12], [2,12],
                [0,13], [1,13], [2,13]
            ],
            // Kopce na severu
            hills: [
                [10,0], [11,0], [12,0],
                [10,1], [11,1], [12,1]
            ],
            plains: 'default'
        },

        mapLabels: [
            { text: 'Nisa', hexes: [[16,5], [17,5], [18,5], [16,6], [17,6], [18,6]] },
            { text: 'Předměstí', hexes: [[13,5], [14,5], [13,6], [14,6]] },
            { text: 'Řeka Nisa', hexes: [[16,9], [17,9], [18,9]] }
        ],

        forces: {
            hussites: {
                commander: 'Velek z Březnice',
                units: [
                    // Sirotci pod Velkem z Březnice
                    { type: 'VOZOVA_HRADBA', col: 3, row: 5 },
                    { type: 'VOZOVA_HRADBA', col: 3, row: 6 },
                    { type: 'VOZOVA_HRADBA', col: 3, row: 7 },
                    { type: 'CEPNICI', col: 4, row: 5 },
                    { type: 'CEPNICI', col: 4, row: 6 },
                    { type: 'CEPNICI', col: 4, row: 7 },
                    { type: 'SUDLICNICI', col: 5, row: 5 },
                    { type: 'SUDLICNICI', col: 5, row: 7 },
                    // Táboři pod Prokopem Holým
                    { type: 'PROKOP_HOLY', col: 2, row: 6 },
                    { type: 'PAVEZNICI', col: 5, row: 6 },
                    { type: 'KUSINICI_HUSITI', col: 2, row: 5 },
                    { type: 'KUSINICI_HUSITI', col: 2, row: 7 },
                    // Dělostřelectvo
                    { type: 'HOUFNICE', col: 1, row: 5 },
                    { type: 'HOUFNICE', col: 1, row: 7 },
                    { type: 'TARASNICE', col: 1, row: 6 },
                    // Ručničáři
                    { type: 'RUCNICARI', col: 4, row: 4 },
                    { type: 'RUCNICARI', col: 4, row: 8 },
                    // Jízda - pronásledování
                    { type: 'JIZDA_HUSITI', col: 6, row: 4 },
                    { type: 'JIZDA_HUSITI', col: 6, row: 8 }
                ]
            },
            crusaders: {
                commander: 'Půta z Častolovic',
                units: [
                    // Obrana města - vojsko biskupa Konráda pod Půtou z Častolovic
                    // Sedláci a měšťané (slabá pěchota)
                    { type: 'KOPINICI', col: 11, row: 5 },
                    { type: 'KOPINICI', col: 11, row: 6 },
                    { type: 'KOPINICI', col: 11, row: 7 },
                    { type: 'KOPINICI', col: 12, row: 5 },
                    { type: 'KOPINICI', col: 12, row: 7 },
                    { type: 'HALAPARTNICI', col: 12, row: 6 },
                    // Městská hotovost
                    { type: 'TEZKOODENCI', col: 13, row: 6 },
                    { type: 'TEZKOODENCI', col: 14, row: 6 },
                    { type: 'KUSNICI', col: 13, row: 7 },
                    { type: 'KUSNICI', col: 14, row: 7 },
                    // Rytíři Půty z Častolovic
                    { type: 'TEZKY_RYTIR', col: 10, row: 6 },
                    { type: 'TEZKY_RYTIR', col: 9, row: 6 },
                    { type: 'LEHKA_JIZDA', col: 10, row: 5 },
                    { type: 'LEHKA_JIZDA', col: 10, row: 7 },
                    // Obrana hradeb
                    { type: 'TEZKOODENCI', col: 15, row: 5 },
                    { type: 'TEZKOODENCI', col: 15, row: 7 },
                    { type: 'KUSNICI', col: 16, row: 5 },
                    { type: 'LUCISTNICI', col: 17, row: 6 }
                ]
            }
        },

        phases: [
            {
                id: 1,
                name: 'Husitský útok',
                turnRange: [1, 3],
                description: 'Husité zahajují útok na slezské vojsko před hradbami.',
                events: [
                    { trigger: 'turn_1', message: 'Husitské vojsko postupuje s vozy a děly proti obráncům Nisy!' },
                    { trigger: 'turn_2', message: 'Sedláci a vesničané se staví husitům na odpor před předměstím.' }
                ]
            },
            {
                id: 2,
                name: 'Průlom obrany',
                turnRange: [4, 6],
                description: 'Husité prolamují slezskou obranu.',
                events: [
                    { trigger: 'turn_4', type: 'panic', faction: 'crusaders', level: 1, text: 'Slezské oddíly začínají ustupovat pod tlakem husitského útoku!' },
                    { trigger: 'turn_5', message: 'Půta z Častolovic se snaží organizovat obranu u hradeb.' }
                ]
            },
            {
                id: 3,
                name: 'Masakr a útěk',
                turnRange: [7, 10],
                description: 'Obránci prchají, mnozí hynou v řece.',
                events: [
                    { trigger: 'turn_7', type: 'panic', faction: 'crusaders', level: 2, text: 'Obránci v panice prchají - mnoho jich hyne v řece Nise!' },
                    { trigger: 'turn_8', message: 'Husité pálí předměstí a útočí na hradby!' }
                ]
            }
        ],

        victoryConditions: {
            primary: {
                type: 'destroy_percent',
                percent: 60,
                description: 'Zničte 60% slezského vojska'
            },
            secondary: [
                { type: 'capture_position', positions: [[13,5], [14,5]], description: 'Vypalte předměstí (zajměte pozice)', bonus: 'Historické vítězství' },
                { type: 'destroy_percent', percent: 80, description: 'Zničte 80% nepřátel (2000 padlých)' }
            ]
        },

        debriefing: {
            victory: 'Drtivé vítězství! Slezské vojsko je rozprášeno, na dva tisíce obránců padlo nebo utonulo v řece Nise. Předměstí je v plamenech. Půta z Častolovic udržel město, ale už žádné slezské město se neodváží postavit husitům. Spanilá jízda pokračuje - města se vzdávají nebo platí výpalné.',
            defeat: 'Slezská obrana vydržela. Půta z Častolovic úspěšně ubránil Nisu. Spanilá jízda musí pokračovat jinudy a husitská pověst neporazitelnosti utrpěla trhlinu.'
        },

        maxTurns: 10,
        playerFaction: 'hussites',

        specialMechanics: {
            noFogOfWar: true  // Otevřená bitva - obě armády se vidí
        }
    },

    // ==========================================
    // BITVA 4: DOMAŽLICE (14. srpna 1431)
    // ==========================================
    domazlice_1431: {
        id: 'domazlice_1431',
        name: 'Bitva u Domažlic',
        date: '14. srpna 1431',
        type: 'pursuit_battle',
        difficulty: 1,
        description: 'Největší husitské vítězství. Samotný zvuk husitského chorálu způsobí útěk křižácké armády.',
        historicalSignificance: 'Křižáci prchají při zaslechnutí "Ktož jsú boží bojovníci". Konec čtvrté křížové výpravy.',

        briefing: {
            hussites: 'Blížíte se k Domažlicím rychlým pochodem. Křižáci jsou v panice - zpívejte chorál a pronásledujte prchající!',
            crusaders: 'Husité se blíží! Pokuste se zformovat obranu, nebo alespoň bezpečně ustupte do Bavorska.'
        },

        mapSize: { width: 24, height: 14 },

        terrain: {
            // Město Domažlice
            town: [
                [16,6], [17,6], [16,7], [17,7]
            ],
            // Šumavské hvozdy
            forest: [
                [20,0], [21,0], [22,0], [23,0],
                [20,1], [21,1], [22,1], [23,1],
                [21,2], [22,2], [23,2],
                [20,11], [21,11], [22,11], [23,11],
                [20,12], [21,12], [22,12], [23,12],
                [21,13], [22,13], [23,13]
            ],
            // Všerubský průsmyk (únik)
            road: [
                [22,6], [23,6], [22,7], [23,7]
            ],
            hills: [
                [12,5], [13,5], [12,6], [13,6]
            ],
            plains: 'default'
        },

        forces: {
            hussites: {
                commander: 'Prokop Holý',
                units: [
                    // Husitský proud
                    { type: 'VOZOVA_HRADBA', col: 2, row: 5 },
                    { type: 'VOZOVA_HRADBA', col: 2, row: 6 },
                    { type: 'VOZOVA_HRADBA', col: 2, row: 7 },
                    { type: 'VOZOVA_HRADBA', col: 2, row: 8 },
                    { type: 'CEPNICI', col: 3, row: 5 },
                    { type: 'CEPNICI', col: 3, row: 6 },
                    { type: 'CEPNICI', col: 3, row: 7 },
                    { type: 'SUDLICNICI', col: 4, row: 5 },
                    { type: 'SUDLICNICI', col: 4, row: 8 },
                    { type: 'KUSINICI_HUSITI', col: 1, row: 6 },
                    { type: 'KUSINICI_HUSITI', col: 1, row: 7 },
                    { type: 'RUCNICARI', col: 1, row: 5 },
                    { type: 'RUCNICARI', col: 1, row: 8 },
                    { type: 'HOUFNICE', col: 0, row: 6 },
                    { type: 'HOUFNICE', col: 0, row: 7 },
                    { type: 'JIZDA_HUSITI', col: 5, row: 4 },
                    { type: 'JIZDA_HUSITI', col: 5, row: 9 },
                    // Jízda - pronásledování
                    { type: 'JIZDA_HUSITI', col: 6, row: 6 },
                    { type: 'JIZDA_HUSITI', col: 6, row: 7 }
                ]
            },
            crusaders: {
                commander: 'Fridrich Braniborský',
                units: [
                    // Dezorganizované křižácké vojsko
                    { type: 'TEZKY_RYTIR', col: 14, row: 5 },
                    { type: 'TEZKY_RYTIR', col: 14, row: 8 },
                    { type: 'TEZKOODENCI', col: 15, row: 6 },
                    { type: 'TEZKOODENCI', col: 15, row: 7 },
                    { type: 'LEHKA_JIZDA', col: 16, row: 5 },
                    { type: 'LEHKA_JIZDA', col: 16, row: 8 },
                    { type: 'KOPINICI', col: 13, row: 6 },
                    { type: 'KOPINICI', col: 13, row: 7 },
                    { type: 'HALAPARTNICI', col: 14, row: 6 },
                    { type: 'HALAPARTNICI', col: 14, row: 7 },
                    { type: 'KUSNICI', col: 12, row: 5 },
                    { type: 'KUSNICI', col: 12, row: 8 }
                ]
            }
        },

        phases: [
            {
                id: 1,
                name: 'Husitský pochod',
                turnRange: [1, 3],
                description: 'Husité se rychle přibližují k Domažlicím.',
                events: [
                    { trigger: 'turn_1', message: 'Husitské vojsko urazilo 80 km za 2 dny a blíží se k Domažlicím!' },
                    { trigger: 'turn_2', type: 'panic', faction: 'crusaders', level: 1, text: 'Zvědové hlásí: Husité jsou blíž, než jsme čekali!' }
                ]
            },
            {
                id: 2,
                name: 'Chorál a panika',
                turnRange: [4, 6],
                description: 'Křižáci slyší "Ktož jsú boží bojovníci" a propadají panice.',
                events: [
                    { trigger: 'turn_4', type: 'activate_choral', duration: 3, text: 'Zvuk chorálu děsí křižáky!' },
                    { trigger: 'turn_4', type: 'panic', faction: 'crusaders', level: 2, text: 'Křižáci slyší husitský chorál a propadají strachu!' },
                    { trigger: 'turn_5', message: 'Kardinál Cesarini prchá a ztrácí kardinálský klobouk!' },
                    { trigger: 'turn_5', type: 'panic', faction: 'crusaders', level: 3, text: 'Panika se šíří křižáckým táborem!' }
                ]
            },
            {
                id: 3,
                name: 'Útěk k Bavorsku',
                turnRange: [7, 12],
                description: 'Křižáci prchají Všerubským průsmykem do Bavorska.',
                events: [
                    { trigger: 'turn_7', type: 'rout', faction: 'crusaders', text: 'Celá křižácká armáda se dává na útěk!' }
                ]
            }
        ],

        victoryConditions: {
            primary: {
                type: 'destroy_percent',
                percent: 60,
                description: 'Způsobte útěk křižácké armády (zničte 60%)'
            },
            secondary: [
                { type: 'capture_position', positions: [[16,6], [17,6]], description: 'Zajměte Domažlice' }
            ]
        },

        debriefing: {
            victory: 'Slavné vítězství! Samotný zvuk "Ktož jsú boží bojovníci" způsobil panický útěk křižácké armády. 5. křížová výprava končí absolutním debaklem - křižáci prchají, aniž by se pokusili o boj. Toto je vrchol husitské slávy!',
            defeat: 'Křižáci překonali svůj strach a zformovali obranu. I přes váš chorál se nezhroutili. Husitská pověst neporazitelnosti je otřesena.'
        },

        maxTurns: 12,
        playerFaction: 'hussites'
    },

    // ==========================================
    // BITVA: OBLÉHÁNÍ PLZNĚ (1433-1434)
    // ==========================================
    oblehani_plzne_1433: {
        id: 'oblehani_plzne_1433',
        name: 'Obléhání Plzně',
        date: 'Říjen 1433',
        type: 'siege_assault',
        difficulty: 3,
        description: 'Generální útok na katolickou Plzeň. Devět měsíců obléhání vyvrcholí pokusem o průlom hradeb.',
        historicalSignificance: 'Největší neúspěch husitů. Plzeň odolala téměř rok a získala velblouda do znaku.',

        briefing: {
            hussites: 'Po měsících obléhání je čas na rozhodující útok! Prorazte hradby a dobyjte město. Prokop Holý sleduje z týla - nesmi selhat!',
            crusaders: 'Husité chystají generální útok! Vilém Švihovský z Rýzmberka vede obranu. Udrž hradby za každou cenu!'
        },

        mapSize: { width: 22, height: 14 },

        terrain: {
            // Město Plzeň (východ mapy)
            town: [
                [16,4], [17,4], [18,4], [19,4],
                [16,5], [17,5], [18,5], [19,5],
                [16,6], [17,6], [18,6], [19,6],
                [16,7], [17,7], [18,7], [19,7],
                [16,8], [17,8], [18,8], [19,8]
            ],
            // Kostel sv. Bartoloměje (centrum města)
            church: [
                [17,6], [18,6]
            ],
            // Řeka Mže (jižně od města)
            water: [
                [14,10], [15,10], [16,10], [17,10], [18,10], [19,10], [20,10], [21,10],
                [15,11], [16,11], [17,11], [18,11], [19,11], [20,11], [21,11]
            ],
            // Příkopy a opevnění husitů (západ)
            trenches: [
                [6,4], [6,5], [6,6], [6,7], [6,8],
                [7,3], [7,9]
            ],
            // Husitské tábory (pět obléhacích bašt)
            hills: [
                [2,2], [3,2], [2,3], [3,3],   // Tábor 1 - sever
                [2,10], [3,10], [2,11], [3,11], // Tábor 2 - jih
                [0,6], [1,6], [0,7], [1,7]    // Hlavní tábor - střed
            ],
            // Cesty k hradbám
            road: [
                [8,6], [9,6], [10,6], [11,6], [12,6], [13,6], [14,6]
            ],
            road2: [
                [8,4], [9,4], [10,4], [11,4], [12,4],
                [8,8], [9,8], [10,8], [11,8], [12,8]
            ],
            // Zbytky lesů
            forest: [
                [0,0], [1,0], [0,1],
                [20,0], [21,0], [20,1], [21,1],
                [0,12], [1,12], [0,13], [1,13]
            ],
            plains: 'default'
        },

        mapLabels: [
            { text: 'Plzeň', hexes: [[17,5], [18,5], [17,6], [18,6], [17,7], [18,7]] },
            { text: 'Sv. Bartoloměj', hexes: [[17,6], [18,6]] },
            { text: 'Řeka Mže', hexes: [[16,10], [17,10], [18,10]] },
            { text: 'Husitský tábor', hexes: [[0,6], [1,6], [0,7], [1,7]] },
            { text: 'Příkopy', hexes: [[6,5], [6,6], [6,7]] }
        ],

        forces: {
            hussites: {
                commander: 'Prokop Holý',
                units: [
                    // Prokop Holý v týlu (po hádce s hejtmany)
                    { type: 'PROKOP_HOLY', col: 1, row: 6 },
                    // Vozová hradba - obléhací pozice
                    { type: 'VOZOVA_HRADBA', col: 5, row: 4 },
                    { type: 'VOZOVA_HRADBA', col: 5, row: 5 },
                    { type: 'VOZOVA_HRADBA', col: 5, row: 6 },
                    { type: 'VOZOVA_HRADBA', col: 5, row: 7 },
                    { type: 'VOZOVA_HRADBA', col: 5, row: 8 },
                    // Táboři - hlavní útočná síla (Jan Pardus z Horky)
                    { type: 'CEPNICI', col: 7, row: 5 },
                    { type: 'CEPNICI', col: 7, row: 6 },
                    { type: 'CEPNICI', col: 7, row: 7 },
                    { type: 'SUDLICNICI', col: 8, row: 5 },
                    { type: 'SUDLICNICI', col: 8, row: 7 },
                    // Sirotci (Bedřich ze Strážnice)
                    // POZOR: typ musí mít faction: 'hussites' - HALAPARTNICI jsou křižácká šablona
                    { type: 'PAVEZNICI', col: 8, row: 6 },
                    { type: 'SUDLICNICI', col: 9, row: 5 },
                    { type: 'SUDLICNICI', col: 9, row: 7 },
                    // Střelci
                    { type: 'KUSINICI_HUSITI', col: 6, row: 4 },
                    { type: 'KUSINICI_HUSITI', col: 6, row: 8 },
                    { type: 'RUCNICARI', col: 4, row: 5 },
                    { type: 'RUCNICARI', col: 4, row: 7 },
                    // Dělostřelectvo - klíč k průlomu hradeb
                    { type: 'HOUFNICE', col: 3, row: 5 },
                    { type: 'HOUFNICE', col: 3, row: 7 },
                    { type: 'TARASNICE', col: 3, row: 6 },
                    { type: 'BOMBARDA', col: 2, row: 6 },  // Dál vzadu, vedle Prokopa
                    // Jízda - záloha
                    { type: 'JIZDA_HUSITI', col: 2, row: 4 },
                    { type: 'JIZDA_HUSITI', col: 2, row: 8 }
                ]
            },
            crusaders: {
                commander: 'Vilém Švihovský z Rýzmberka',
                units: [
                    // Obrana hradeb - Vilém Švihovský a Děpolt z Dolan
                    // Těžkooděnci na hradbách
                    { type: 'TEZKOODENCI', col: 15, row: 4 },
                    { type: 'TEZKOODENCI', col: 15, row: 5 },
                    { type: 'TEZKOODENCI', col: 15, row: 6 },
                    { type: 'TEZKOODENCI', col: 15, row: 7 },
                    { type: 'TEZKOODENCI', col: 15, row: 8 },
                    // Kopiníci - záloha
                    { type: 'KOPINICI', col: 16, row: 5 },
                    { type: 'KOPINICI', col: 16, row: 7 },
                    { type: 'HALAPARTNICI', col: 16, row: 6 },
                    // Střelci na hradbách
                    { type: 'KUSNICI', col: 14, row: 4 },
                    { type: 'KUSNICI', col: 14, row: 5 },
                    { type: 'KUSNICI', col: 14, row: 7 },
                    { type: 'KUSNICI', col: 14, row: 8 },
                    { type: 'LUCISTNICI', col: 13, row: 5 },
                    { type: 'LUCISTNICI', col: 13, row: 7 },
                    // Městská děla
                    { type: 'POLNI_DELO', col: 14, row: 6 },
                    // Rytíři Viléma Švihovského - mobilní záloha
                    // Vilém je cílem podmínky kill_commander - musí být na mapě
                    { type: 'VILEM_SVIHOVSKY', col: 18, row: 5 },
                    { type: 'TEZKY_RYTIR', col: 17, row: 5 },
                    { type: 'TEZKY_RYTIR', col: 17, row: 7 },
                    { type: 'LEHKA_JIZDA', col: 18, row: 6 }
                ]
            }
        },

        phases: [
            {
                id: 1,
                name: 'Dělostřelecká příprava',
                turnRange: [1, 3],
                description: 'Husitská děla ostřelují hradby. Obránci odpovídají z městských pozic.',
                events: [
                    { trigger: 'turn_1', message: 'Husitské bombardy zahajují palbu na hradby Plzně!' },
                    { trigger: 'turn_2', message: 'Obránci se kryjí za cimbuřím. Vilém Švihovský povzbuzuje posádku.' },
                    { trigger: 'turn_3', message: 'V hradbách se objevují první trhliny!' }
                ]
            },
            {
                id: 2,
                name: 'Útok na hradby',
                turnRange: [4, 7],
                description: 'Pěchota postupuje k hradbám. Těžké ztráty na obou stranách.',
                events: [
                    { trigger: 'turn_4', message: 'Jan Pardus z Horky vede táborskou pěchotu do útoku!' },
                    { trigger: 'turn_5', message: 'Obránci lžou horkou smolu a kamení na útočníky.' },
                    { trigger: 'turn_6', message: 'Krvavé boje u hradeb! Husité se snaží prolomit obranu.' }
                ]
            },
            {
                id: 3,
                name: 'Výpad obránců',
                turnRange: [8, 10],
                description: 'Plzeňané provádějí odvážný výpad!',
                events: [
                    { trigger: 'turn_8', message: 'Vilém Švihovský vede výpad z bran! Překvapení útočníků!' },
                    { trigger: 'turn_9', type: 'morale_boost', faction: 'crusaders', modifier: 15, text: 'Obráncům roste sebedůvěra! Zajali husitského velblouda!' }
                ]
            },
            {
                id: 4,
                name: 'Rozhodnutí',
                turnRange: [11, 14],
                description: 'Útok buď uspěje, nebo husité budou muset ustoupit.',
                events: [
                    { trigger: 'turn_11', message: 'Poslední šance na průlom! Prokop Holý posílá zálohy.' },
                    { trigger: 'turn_13', message: 'Husitské ztráty jsou příliš vysoké. Někteří vojáci dezertují.' }
                ]
            }
        ],

        victoryConditions: {
            primary: {
                type: 'capture_position',
                positions: [[16,5], [16,6], [16,7], [17,5], [17,6], [17,7]],
                count: 3,
                description: 'Obsaďte alespoň 3 pozice uvnitř městských hradeb'
            },
            secondary: [
                { type: 'destroy_percent', percent: 70, description: 'Zničte 70% obránců' },
                { type: 'kill_commander', description: 'Zabijte Viléma Švihovského' }
            ]
        },

        defeatConditions: {
            primary: {
                type: 'lose_percent',
                percent: 60,
                description: 'Ztratíte 60% vojska'
            }
        },

        debriefing: {
            victory: 'Neuvěřitelný úspěch! Hradby Plzně padly po devíti měsících obléhání. Prokop Holý triumfuje a katolická bašta na západě Čech je dobyta. Historie se mění - bez Plzně ztrácí umírnění klíčového spojence a radikálové upevňují svou moc.',
            defeat: 'Plzeň odolala! Navzdory měsícům obléhání a opakovaným útokům hradby vydržely. Husité utrpěli těžké ztráty a musí odtáhnout. Toto fiasko oslabí Prokopa Holého a posílí jeho odpůrce. Plzeň získá za svou statečnost velblouda do znaku od císaře Zikmunda.'
        },

        maxTurns: 14,
        playerFaction: 'hussites'
    },

    // ==========================================
    // BITVA 5: LIPANY (30. května 1434)
    // ==========================================
    lipany_1434: {
        id: 'lipany_1434',
        name: 'Bitva u Lipan',
        date: '30. května 1434',
        type: 'civil_war',
        difficulty: 3,
        description: 'Bratrovražedná bitva mezi husity. Umírnění kališníci a katolíci porazí radikální Tábory a Sirotky.',
        historicalSignificance: 'Konec husitských válek. Smrt Prokopa Holého. Vítězství umírněných.',

        briefing: {
            hussites: 'Jako velitel radikálů musíte odrazit útok umírněných. Pozor na jejich léčku - klamný útěk!',
            crusaders: 'Vedete koalici umírněných. Použijte klamný útěk, vylákat radikály z vozové hradby a udeřte z boku jízdou.'
        },

        mapSize: { width: 22, height: 14 },

        terrain: {
            // Lipská hora - pozice radikálů
            hills: [
                [14,3], [15,3], [16,3],
                [14,4], [15,4], [16,4],
                [14,5], [15,5], [16,5]
            ],
            // Vesnice
            town: [
                [18,6], [19,6]
            ],
            // Rybník
            water: [
                [17,2], [18,2], [17,3], [18,3]
            ],
            // Potok Bylanka - skrytá pozice
            forest: [
                [4,6], [4,7], [4,8], [5,6], [5,7], [5,8]
            ],
            plains: 'default'
        },

        forces: {
            hussites: {
                commander: 'Prokop Holý',
                faction_name: 'Radikálové (Táboři a Sirotci)',
                units: [
                    // Prokop Holý - velitel radikálů (event v kole 12 i debriefing s ním počítají)
                    { type: 'PROKOP_HOLY', col: 16, row: 6 },
                    // Vozová hradba radikálů
                    { type: 'VOZOVA_HRADBA', col: 14, row: 3 },
                    { type: 'VOZOVA_HRADBA', col: 14, row: 4 },
                    { type: 'VOZOVA_HRADBA', col: 14, row: 5 },
                    { type: 'VOZOVA_HRADBA', col: 14, row: 6 },
                    // Pěchota
                    { type: 'CEPNICI', col: 15, row: 3 },
                    { type: 'CEPNICI', col: 15, row: 4 },
                    { type: 'CEPNICI', col: 15, row: 5 },
                    { type: 'SUDLICNICI', col: 15, row: 6 },
                    // Střelci
                    { type: 'KUSINICI_HUSITI', col: 16, row: 4 },
                    { type: 'KUSINICI_HUSITI', col: 16, row: 5 },
                    { type: 'RUCNICARI', col: 16, row: 3 },
                    // Dělostřelectvo
                    { type: 'HOUFNICE', col: 17, row: 4 },
                    { type: 'TARASNICE', col: 17, row: 5 },
                    // Jízda
                    { type: 'JIZDA_HUSITI', col: 13, row: 2 },
                    { type: 'JIZDA_HUSITI', col: 13, row: 7 },
                    // Kušiníci - střed
                    { type: 'KUSINICI_HUSITI', col: 12, row: 5 }
                ]
            },
            crusaders: {
                commander: 'Diviš Bořek z Miletínka',
                faction_name: 'Umírnění (Panská jednota)',
                units: [
                    // Diviš Bořek - velitel umírněných (cíl "kill_commander" ho vyžaduje na mapě,
                    // jinak je podmínka splněná automaticky - every() na prázdném poli)
                    { type: 'DIVIS_BOREK', col: 6, row: 4 },
                    // Vozová hradba umírněných (pražské vozy - modré)
                    { type: 'VOZOVA_HRADBA_PRASKY', col: 7, row: 5 },
                    { type: 'VOZOVA_HRADBA_PRASKY', col: 7, row: 6 },
                    { type: 'VOZOVA_HRADBA_PRASKY', col: 7, row: 7 },
                    // Pěchota (pražští cepníci - modří)
                    { type: 'CEPNICI_PRASKY', col: 8, row: 5 },
                    { type: 'CEPNICI_PRASKY', col: 8, row: 6 },
                    { type: 'KOPINICI', col: 8, row: 7 },
                    { type: 'HALAPARTNICI', col: 9, row: 5 },
                    { type: 'HALAPARTNICI', col: 9, row: 7 },
                    // Střelci (pražští kušiníci - modří)
                    { type: 'KUSINICI_PRASKY', col: 6, row: 5 },
                    { type: 'KUSINICI_PRASKY', col: 6, row: 7 },
                    // Dělostřelectvo (pražské houfnice - modré)
                    { type: 'HOUFNICE_PRASKY', col: 6, row: 6 },
                    // Skrytá šlechtická jízda (u Bylanky) - zůstávají rytíři (byli tam i katoličtí spojenci)
                    { type: 'TEZKY_RYTIR', col: 4, row: 6 },
                    { type: 'TEZKY_RYTIR', col: 4, row: 7 },
                    { type: 'TEZKOODENCI', col: 5, row: 6 },
                    { type: 'TEZKOODENCI', col: 5, row: 7 },
                    // Lehká jízda - pražská (modrá)
                    { type: 'JIZDA_PRASKY', col: 4, row: 8 }
                ]
            }
        },

        phases: [
            {
                id: 1,
                name: 'Patová situace',
                turnRange: [1, 4],
                description: 'Obě strany za vozovou hradbou, vyjednávání selhává.',
                events: [
                    { trigger: 'turn_1', message: 'Bratrovražedná bitva začíná...' }
                ]
            },
            {
                id: 2,
                name: 'Klamný útok',
                turnRange: [5, 7],
                description: 'Koalice vysílá pěchotu do zdánlivě zoufalého útoku.',
                events: [
                    { trigger: 'turn_5', message: 'Umírnění zahajují útok na vozovou hradbu!' },
                    { trigger: 'turn_6', message: 'Útok selhává - pěchota ustupuje v nepořádku!' }
                ]
            },
            {
                id: 3,
                name: 'Léčka',
                turnRange: [8, 10],
                description: 'Radikálové opouštějí hradbu a pronásledují. Jízda udeří z boku!',
                events: [
                    { trigger: 'turn_8', message: 'Pozor! Šlechtická jízda vyráží z úkrytu!' }
                ]
            },
            {
                id: 4,
                name: 'Zkáza radikálů',
                turnRange: [11, 15],
                description: 'Radikálové obklíčeni, krvavá řež.',
                events: [
                    { trigger: 'turn_12', message: 'Prokop Holý padl v boji!' }
                ]
            }
        ],

        victoryConditions: {
            primary: {
                type: 'destroy_percent',
                percent: 50,
                description: 'Udržte vozovou hradbu a zničte 50% koalice'
            },
            secondary: [
                { type: 'kill_commander', description: 'Zabijte Diviše Bořka' }
            ]
        },

        debriefing: {
            victory: 'Prokop Holý odhalil léčku umírněných včas! Radikálové zůstali ve vozové hradbě a odrazili klamný útěk. Koalice umírněných je poražena a radikální husitství přežívá. Historie se píše jinak...',
            defeat: 'Tragédie u Lipan. Radikálové uvěřili klamnému útěku a vyběhli z vozové hradby. Jízda umírněných udeřila z boku. Prokop Holý padl a s ním naděje radikálního husitství. Husitské války končí porážkou těch, kteří je začali.'
        },

        maxTurns: 15,
        playerFaction: 'hussites'
    },

    // ==========================================
    // BITVA: OBLÉHÁNÍ HRADU SION (1437)
    // ==========================================
    sion_1437: {
        id: 'sion_1437',
        name: 'Obléhání hradu Sion',
        date: '6. září 1437',
        type: 'last_stand',
        difficulty: 4,
        description: 'Poslední vzdor husitství. Jan Roháč z Dubé brání svůj malý hrad proti královské přesile.',
        historicalSignificance: 'Konec husitských válek. Po pádu Sionu bylo 52 obránců popraveno v Praze včetně Jana Roháče.',

        briefing: {
            hussites: 'Jste Jan Roháč z Dubé, poslední nepokořený husitský velitel. Čtyři měsíce jste odolávali obléhání, ale teď přišly uherské posily. Braňte Sion do posledního muže!',
            crusaders: 'Král Zikmund ztrácí trpělivost. S uherskými posilami konečně dobyjte ten prokletý hrádek a zajměte Roháče živého!'
        },

        mapSize: { width: 16, height: 12 },

        terrain: {
            // Hrad Sion na skalnatém ostrohu (střed-východ mapy)
            hills: [
                [10,4], [11,4], [12,4],
                [10,5], [11,5], [12,5],
                [10,6], [11,6], [12,6],
                [10,7], [11,7], [12,7]
            ],
            // Hradní budovy
            town: [
                [11,5], [11,6]
            ],
            // Potok Vrchlice (pod hradem) - klíčový zdroj vody!
            water: [
                [8,9], [9,9], [10,9], [11,9], [12,9], [13,9],
                [9,10], [10,10], [11,10], [12,10], [13,10]
            ],
            // Lesy kolem
            forest: [
                [0,0], [1,0], [2,0], [0,1], [1,1],
                [14,0], [15,0], [14,1], [15,1],
                [0,10], [1,10], [0,11], [1,11],
                [14,10], [15,10], [14,11], [15,11],
                [3,3], [3,4], [4,3],
                [13,3], [14,3], [14,4]
            ],
            // Cesta k hradu
            road: [
                [0,5], [1,5], [2,5], [3,5], [4,5], [5,5], [6,5], [7,5], [8,5], [9,5]
            ],
            // Příkopy kolem hradu (obranné)
            trenches: [
                [9,4], [9,5], [9,6], [9,7],
                [10,3], [11,3], [12,3],
                [13,4], [13,5], [13,6], [13,7],
                [10,8], [11,8], [12,8]
            ],
            plains: 'default'
        },

        mapLabels: [
            { text: 'Hrad Sion', hexes: [[11,5], [11,6]] },
            { text: 'Potok Vrchlice', hexes: [[9,9], [10,9], [11,9]] },
            { text: 'Příkopy', hexes: [[9,5], [9,6]] }
        ],

        forces: {
            hussites: {
                commander: 'Jan Roháč z Dubé',
                units: [
                    // Jan Roháč - velitel (speciální jednotka)
                    { type: 'JAN_ROHAC', col: 11, row: 5 },
                    // Veteráni z husitských válek
                    { type: 'CEPNICI', col: 10, row: 5 },
                    { type: 'CEPNICI', col: 12, row: 5 },
                    { type: 'CEPNICI', col: 11, row: 4 },
                    { type: 'SUDLICNICI', col: 10, row: 6 },
                    { type: 'SUDLICNICI', col: 12, row: 6 },
                    // Uprchlíci z Hradce Králové
                    { type: 'PAVEZNICI', col: 11, row: 6 },
                    { type: 'SUDLICNICI', col: 10, row: 4 },  // Husitští uprchlíci s vidlemi
                    // Střelci na hradbách
                    { type: 'KUSINICI_HUSITI', col: 12, row: 4 },
                    { type: 'KUSINICI_HUSITI', col: 10, row: 7 },
                    { type: 'RUCNICARI', col: 12, row: 7 },
                    // Puškař Zelený - jediné dělo
                    { type: 'TARASNICE', col: 11, row: 7 }
                ]
            },
            crusaders: {
                commander: 'Hynce Ptáček z Pirkštejna',
                units: [
                    // Česká zemská hotovost (Hynce Ptáček)
                    { type: 'KOPINICI', col: 3, row: 4 },
                    { type: 'KOPINICI', col: 3, row: 5 },
                    { type: 'KOPINICI', col: 3, row: 6 },
                    { type: 'HALAPARTNICI', col: 4, row: 4 },
                    { type: 'HALAPARTNICI', col: 4, row: 6 },
                    { type: 'TEZKOODENCI', col: 4, row: 5 },
                    // Střelci
                    { type: 'KUSNICI', col: 2, row: 4 },
                    { type: 'KUSNICI', col: 2, row: 6 },
                    { type: 'LUCISTNICI', col: 2, row: 5 },
                    // Děla (umírněné + královské)
                    { type: 'POLNI_DELO', col: 1, row: 5 },
                    { type: 'HOUFNICE_PRASKY', col: 1, row: 4 },  // Pražské houfnice umírněných
                    // Jízda Ptáčka
                    { type: 'LEHKA_JIZDA', col: 5, row: 3 },
                    { type: 'LEHKA_JIZDA', col: 5, row: 7 },
                    // Uherské posily (Michal Országh) - přijdou jako reinforcement
                    { type: 'TEZKY_RYTIR', col: 0, row: 5 }
                ],
                reinforcements: {
                    turn: 4,
                    message: 'Uherské posily Michala Országha dorazily!',
                    units: [
                        { type: 'TEZKY_RYTIR', col: 0, row: 4 },
                        { type: 'TEZKY_RYTIR', col: 0, row: 6 },
                        { type: 'TEZKOODENCI', col: 1, row: 3 },
                        { type: 'TEZKOODENCI', col: 1, row: 7 },
                        { type: 'LEHKA_JIZDA', col: 0, row: 3 },
                        { type: 'LEHKA_JIZDA', col: 0, row: 7 }
                    ]
                }
            }
        },

        phases: [
            {
                id: 1,
                name: 'Marné obléhání',
                turnRange: [1, 3],
                description: 'Ptáčkovo vojsko se snaží prorazit, ale hradby drží.',
                events: [
                    { trigger: 'turn_1', message: 'Čtyři měsíce obléhání. Ptáček váhá s rozhodným útokem - Roháč je jeho strýc...' },
                    { trigger: 'turn_2', message: 'Obránci trpí nedostatkem vody. Studna v hradu chybí!' },
                    { trigger: 'turn_3', message: 'Král Zikmund ztrácí trpělivost. Posílá uherské vojsko!' }
                ]
            },
            {
                id: 2,
                name: 'Příchod Uhrů',
                turnRange: [4, 6],
                description: 'Uherské posily mění rovnováhu sil.',
                events: [
                    { trigger: 'turn_4', message: 'Michal Országh přivádí uherské rytíře! Situace je zoufalá.' },
                    { trigger: 'turn_5', type: 'morale_boost', faction: 'crusaders', modifier: 20, text: 'Uherští rytíři povzbuzují královské vojsko k rozhodnému útoku!' }
                ]
            },
            {
                id: 3,
                name: 'Poslední útok',
                turnRange: [7, 10],
                description: 'Generální útok na hradby. Obránci bojují o holé přežití.',
                events: [
                    { trigger: 'turn_7', message: 'Hradby se bortí pod palbou děl! Držte se!' },
                    { trigger: 'turn_8', type: 'panic', faction: 'hussites', level: 1, text: 'Někteří obránci ztrácejí naději. Jan Roháč je povzbuzuje k boji!' },
                    { trigger: 'turn_9', message: 'Nepřítel proniká přes příkopy!' }
                ]
            },
            {
                id: 4,
                name: 'Pád Sionu',
                turnRange: [11, 12],
                description: 'Poslední odpor. Každý padlý obránce je hrdina.',
                events: [
                    { trigger: 'turn_11', message: 'Hradby padly! Boj muže proti muži v troskách hradu.' },
                    { trigger: 'turn_12', message: 'Je konec... Ale památka na Sion nikdy nezemře.' }
                ]
            }
        ],

        victoryConditions: {
            primary: {
                type: 'survive_turns',
                turns: 12,
                description: 'Udržte hrad 12 kol (do soumraku)'
            },
            secondary: [
                { type: 'destroy_percent', percent: 40, description: 'Zničte 40% útočníků' },
                { type: 'survive_commander', description: 'Jan Roháč přežije' }
            ]
        },

        defeatConditions: {
            primary: {
                type: 'commander_death',
                description: 'Jan Roháč padne nebo je zajat'
            },
            alternative: {
                type: 'lose_positions',
                positions: [[11,5], [11,6]],
                description: 'Nepřítel obsadí hradní jádro'
            }
        },

        specialMechanics: {
            noWater: true,  // Hrad nemá studnu - morálka klesá každé 2 kola
            lastStand: true // Speciální bonusy pro obránce
        },

        debriefing: {
            victory: 'Neuvěřitelné! Jan Roháč a jeho věrní vydrželi do setmění. Pod rouškou noci se podařilo části posádky uniknout. Roháč žije a stává se legendou - symbolem nezlomného odporu. Husitský duch nikdy nezemře!',
            defeat: 'Hrad Sion padl. Jan Roháč byl zajat při obědě, když nepočítal s tak rychlým útokem Uhrů. Spolu s 52 obránci byl odvlečen do Prahy. 9. září 1437 byli všichni popraveni na Staroměstském náměstí. Roháč visel nejvýše - na zlatém řetězu. Husitské války skončily na šibenici.'
        },

        maxTurns: 12,
        playerFaction: 'hussites'
    },

    // ==========================================
    // BITVA: HOŘICE (20. dubna 1423)
    // ==========================================
    horice_1423: {
        id: 'horice_1423',
        name: 'Bitva u Hořic',
        date: '20. dubna 1423',
        type: 'field_battle',
        difficulty: 3,
        description: 'Žižka a Diviš Bořek s orebitskou pěchotou a jízdou čelí katolické šlechtě na kopci Gothard. Bitva bez vozové hradby - čistá polní bitva.',
        historicalSignificance: 'Rozhodující porážka katolické šlechty v severovýchodních Čechách. Husité ukořistili katolické vozy a děla.',

        briefing: {
            hussites: 'Zaujměte výhodnou pozici na kopci Gothard. Nemáte vozy, ale kopec poskytuje přirozenou obranu. Katolická šlechta pod Čeňkem z Vartenberka se blíží s přesilou jízdy. Využijte terén a palné zbraně!',
            crusaders: 'Husitští kacíři se opevnili na kopci bez vozů. Máte početní převahu v jízdě - rozdrťte je dříve, než se zformují!'
        },

        mapSize: { width: 18, height: 14 },

        terrain: {
            // Kopec Gothard (357m) - střed mapy, vyvýšená pozice
            hills: [
                [8,4], [9,4], [10,4], [11,4],
                [7,5], [8,5], [9,5], [10,5], [11,5], [12,5],
                [7,6], [8,6], [9,6], [10,6], [11,6], [12,6],
                [8,7], [9,7], [10,7], [11,7]
            ],
            // Cesta z Hořic (od severu, končí před kopci)
            road: [
                [9,0], [9,1], [9,2], [9,3],
                [0,10], [1,10], [2,10], [3,10], [4,10], [5,10]
            ],
            // Lesy na okrajích
            forest: [
                [0,0], [1,0], [2,0],
                [0,1], [1,1],
                [15,0], [16,0], [17,0],
                [16,1], [17,1],
                [0,12], [1,12], [2,12],
                [0,13], [1,13], [2,13],
                [15,12], [16,12], [17,12],
                [15,13], [16,13], [17,13]
            ],
            // Město Hořice (severní okraj)
            town: [
                [8,0], [10,0],
                [8,1], [10,1]
            ],
            plains: 'default'
        },

        forces: {
            hussites: {
                commander: 'Jan Žižka z Trocnova',
                units: [
                    // VELITELÉ
                    { type: 'JAN_ZIZKA', col: 9, row: 5 },
                    { type: 'DIVIS_BOREK', col: 10, row: 5 },
                    // Orebitská pěchota - hlavní síla (cepníci a sudličníci)
                    { type: 'CEPNICI', col: 8, row: 4 },
                    { type: 'CEPNICI', col: 10, row: 4 },
                    { type: 'CEPNICI', col: 8, row: 5 },
                    { type: 'CEPNICI', col: 11, row: 5 },
                    { type: 'SUDLICNICI', col: 7, row: 5 },
                    { type: 'SUDLICNICI', col: 12, row: 5 },
                    { type: 'SUDLICNICI', col: 8, row: 6 },
                    { type: 'SUDLICNICI', col: 11, row: 6 },
                    // Kopiníci s pavézami - obrana proti jízdě
                    { type: 'KOPINICI_HUSITI', col: 7, row: 6 },
                    { type: 'KOPINICI_HUSITI', col: 12, row: 6 },
                    { type: 'PAVEZNICI', col: 9, row: 4 },
                    { type: 'PAVEZNICI', col: 11, row: 4 },
                    // Střelci na vrcholu kopce
                    { type: 'KUSINICI_HUSITI', col: 9, row: 6 },
                    { type: 'KUSINICI_HUSITI', col: 10, row: 6 },
                    { type: 'RUCNICARI', col: 8, row: 7 },
                    { type: 'RUCNICARI', col: 10, row: 7 },
                    // Děla (lehké polní kusy)
                    { type: 'HOUFNICE', col: 9, row: 7 },
                    // Orebitská jízda na křídlech
                    { type: 'JIZDA_HUSITI', col: 5, row: 5 },
                    { type: 'JIZDA_HUSITI', col: 6, row: 6 },
                    { type: 'JIZDA_HUSITI', col: 13, row: 5 },
                    { type: 'JIZDA_HUSITI', col: 14, row: 6 }
                ]
            },
            crusaders: {
                commander: 'Čeněk z Vartenberka',
                units: [
                    // VELITEL
                    { type: 'CENEK_VARTENBERK', col: 9, row: 11 },
                    // Další velitelé
                    { type: 'ARNOST_FLASKA', col: 7, row: 11 },
                    { type: 'JINDRICH_BERKA', col: 11, row: 11 },
                    // Těžká jízda - hlavní útočná síla
                    { type: 'TEZKY_RYTIR', col: 6, row: 10 },
                    { type: 'TEZKY_RYTIR', col: 7, row: 10 },
                    { type: 'TEZKY_RYTIR', col: 8, row: 10 },
                    { type: 'TEZKY_RYTIR', col: 9, row: 10 },
                    { type: 'TEZKY_RYTIR', col: 10, row: 10 },
                    { type: 'TEZKY_RYTIR', col: 11, row: 10 },
                    { type: 'TEZKY_RYTIR', col: 12, row: 10 },
                    // Lehká jízda na křídlech
                    { type: 'LEHKA_JIZDA', col: 4, row: 10 },
                    { type: 'LEHKA_JIZDA', col: 5, row: 10 },
                    { type: 'LEHKA_JIZDA', col: 13, row: 10 },
                    { type: 'LEHKA_JIZDA', col: 14, row: 10 },
                    // Pěchota
                    { type: 'KOPINICI', col: 6, row: 12 },
                    { type: 'KOPINICI', col: 7, row: 12 },
                    { type: 'KOPINICI', col: 8, row: 12 },
                    { type: 'KOPINICI', col: 10, row: 12 },
                    { type: 'KOPINICI', col: 11, row: 12 },
                    { type: 'KOPINICI', col: 12, row: 12 },
                    { type: 'HALAPARTNICI', col: 9, row: 12 },
                    // Střelci
                    { type: 'KUSNICI', col: 5, row: 11 },
                    { type: 'KUSNICI', col: 13, row: 11 }
                    // Poznámka: Katolické vozy byly ukořistěny až PO bitvě, nejsou v počátečním setupu
                ]
            }
        },

        phases: [
            {
                id: 1,
                name: 'Zaujmutí pozic',
                turnRange: [1, 2],
                description: 'Husité se opevňují na kopci Gothard, katolíci se shromažďují.',
                events: [
                    { trigger: 'turn_1', message: 'Žižka: "Na kopec! Držte svahy, střelci dopředu!"' },
                    { trigger: 'turn_2', message: 'Katolická šlechta se formuje k útoku pod kopcem.' }
                ]
            },
            {
                id: 2,
                name: 'Čelní útok',
                turnRange: [3, 5],
                description: 'Čeněk z Vartenberka vrhá jízdu do čelního útoku na kopec.',
                events: [
                    { trigger: 'turn_3', message: 'Čeněk z Vartenberka: "Vpřed! Rozdrťte kacíře!"' },
                    { trigger: 'turn_4', message: 'Těžká jízda naráží na husitskou pěchotu! Útok vázne ve strmém svahu.' },
                    { trigger: 'turn_5', type: 'cavalry_charge_blocked', text: 'Jízda nemůže překonat strmý svah a sudlice!' }
                ]
            },
            {
                id: 3,
                name: 'Tříhodinový boj',
                turnRange: [6, 8],
                description: 'Zuřivé boje na svazích Gothardu. Katolíci utrpí těžké ztráty.',
                events: [
                    { trigger: 'turn_6', message: 'Husitské houfnice a střelci kosí útočníky!' },
                    { trigger: 'turn_7', message: 'Arnošt Flaška padl v boji!' },
                    { trigger: 'turn_7', type: 'morale_drop', faction: 'crusaders', amount: 2, text: 'Smrt Arnošta Flašky otřásla katolíky.' }
                ]
            },
            {
                id: 4,
                name: 'Husitský protiútok',
                turnRange: [9, 11],
                description: 'Žižka nařizuje protiútok. Orebitská jízda a pěchota vyráží z kopce.',
                events: [
                    { trigger: 'turn_9', message: 'Žižka: "Teď! Vpřed, za kalich!"' },
                    { trigger: 'turn_10', message: 'Katolíci se dávají na útěk! Čeněk prchá s hrstkou mužů!' }
                ]
            },
            {
                id: 5,
                name: 'Pronásledování',
                turnRange: [12, 14],
                description: 'Husité pronásledují prchající katolíky a ukořisťují jejich vozy.',
                events: [
                    { trigger: 'turn_12', message: 'Ukořistěny všechny katolické vozy a děla!' },
                    { trigger: 'turn_13', message: 'Čeněk z Vartenberka uprchl. Husitské vítězství je úplné.' }
                ]
            }
        ],

        victoryConditions: {
            primary: {
                type: 'destroy_percent',
                percent: 60,
                description: 'Zničte 60% katolického vojska'
            },
            secondary: [
                { type: 'hold_position', positions: [[8,5], [9,5], [10,5], [11,5]], description: 'Udržte kopec Gothard po celou bitvu' }
            ]
        },

        debriefing: {
            victory: 'Rozhodující vítězství na Gothardu! Orebité pod vedením Žižky a Diviše Bořka prokázali, že i bez vozové hradby dokáží porazit přesilu jízdy. Čeněk z Vartenberka ztratil všechny vozy a děla, která husité ukořistili. Katolická šlechta v severovýchodních Čechách je zlomena.',
            defeat: 'Katolická přesila prolomena. Kopec Gothard padl a s ním i naděje na udržení východních Čech. Husitské síly jsou rozptýleny a Čeněk z Vartenberka slaví vítězství.'
        },

        maxTurns: 14,
        playerFaction: 'hussites'
    },

    // ==========================================
    // BITVA U MALEŠOVA (7. června 1424)
    // ==========================================
    malesov_1424: {
        id: 'malesov_1424',
        name: 'Bitva u Malešova',
        date: '7. června 1424',
        type: 'field_battle',
        difficulty: 4,
        description: 'Žižkovo mistrovské dílo. Slepý hejtman využívá terén k drtivé porážce protihusitské koalice.',
        historicalSignificance: 'Nejkrvavější bitva husitských válek. Padlo 1200 koaličních vojáků proti 200 husitům. Žižka se stal nejmocnějším mužem v Čechách.',

        briefing: {
            hussites: 'Protižižkovská koalice vás dostihla u Malešova. Využijte svah nad údolím potoka Bohynka. Nepřítel má početní převahu, ale terén je na vaší straně!',
            crusaders: 'Konečně jsme Žižku dostihli! Má méně mužů. Vtrhneme do údolí a rozdrtíme kacíře jednou provždy!'
        },

        mapSize: { width: 18, height: 14 },

        terrain: {
            // Svah nad údolím Bohynky (husitská pozice - horní část mapy)
            hills: [
                [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [10,2], [11,2], [12,2], [13,2],
                [5,3], [6,3], [7,3], [8,3], [9,3], [10,3], [11,3], [12,3],
                [6,4], [7,4], [8,4], [9,4], [10,4], [11,4]
            ],
            // Potok Bohynka (střed mapy - úzké údolí s brody)
            water: [
                [0,7], [1,7], [2,7], [3,7], [4,7], [5,7],
                // Brod u cesty: [9,7] vynechán
                [13,7], [14,7], [15,7], [16,7], [17,7]
            ],
            // Bažinaté údolí potoka (zpomaluje postup, ale průchodné)
            swamp: [
                [2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [10,6], [11,6], [12,6], [13,6], [14,6], [15,6],
                [6,7], [7,7], [8,7], [9,7], [10,7], [11,7], [12,7],  // Údolí kolem brodu
                [2,8], [3,8], [4,8], [5,8], [6,8], [7,8], [10,8], [11,8], [12,8], [13,8], [14,8], [15,8]
            ],
            // Cesta k Malešovu (od jihu)
            road: [
                [9,13], [9,12], [9,11], [9,10], [9,9], [9,8]
            ],
            // Lesy na okrajích
            forest: [
                [0,0], [1,0], [2,0], [0,1], [1,1],
                [15,0], [16,0], [17,0], [16,1], [17,1],
                [0,12], [1,12], [0,13], [1,13],
                [16,12], [17,12], [16,13], [17,13]
            ],
            // Tvrz Malešov (jihovýchod)
            town: [
                [14,11], [15,11],
                [14,12], [15,12]
            ],
            plains: 'default'
        },

        forces: {
            hussites: {
                commander: 'Jan Žižka z Trocnova',
                units: [
                    // VELITELÉ - Žižka a jeho průvodci
                    { type: 'JAN_ZIZKA', col: 8, row: 3 },
                    { type: 'JAN_ROHAC', col: 9, row: 3 },
                    { type: 'JAN_HVEZDA', col: 10, row: 3 },
                    { type: 'HYNEK_PODEBRADY', col: 7, row: 3 },
                    // Vozová hradba na svahu (tvořící obrannou linii)
                    { type: 'VOZOVA_HRADBA', col: 5, row: 4 },
                    { type: 'VOZOVA_HRADBA', col: 6, row: 4 },
                    { type: 'VOZOVA_HRADBA', col: 7, row: 4 },
                    { type: 'VOZOVA_HRADBA', col: 8, row: 4 },
                    { type: 'VOZOVA_HRADBA', col: 9, row: 4 },
                    { type: 'VOZOVA_HRADBA', col: 10, row: 4 },
                    { type: 'VOZOVA_HRADBA', col: 11, row: 4 },
                    { type: 'VOZOVA_HRADBA', col: 12, row: 4 },
                    // Pěchota za hradbou
                    { type: 'CEPNICI', col: 6, row: 3 },
                    { type: 'CEPNICI', col: 11, row: 3 },
                    { type: 'SUDLICNICI', col: 5, row: 3 },
                    { type: 'SUDLICNICI', col: 12, row: 3 },
                    { type: 'KOPINICI_HUSITI', col: 7, row: 2 },
                    { type: 'KOPINICI_HUSITI', col: 10, row: 2 },
                    // Střelci (ručnice a kuše)
                    { type: 'RUCNICARI', col: 8, row: 2 },
                    { type: 'RUCNICARI', col: 9, row: 2 },
                    { type: 'KUSINICI_HUSITI', col: 6, row: 2 },
                    { type: 'KUSINICI_HUSITI', col: 11, row: 2 },
                    // Děla na svahu
                    { type: 'HOUFNICE', col: 5, row: 2 },
                    { type: 'HOUFNICE', col: 12, row: 2 },
                    // Jízda na křídlech (pro protiútok)
                    { type: 'JIZDA_HUSITI', col: 4, row: 3 },
                    { type: 'JIZDA_HUSITI', col: 13, row: 3 }
                ]
            },
            crusaders: {
                commander: 'Čeněk z Vartenberka',
                units: [
                    // VELITELÉ koalice
                    { type: 'CENEK_VARTENBERK', col: 9, row: 11 },
                    { type: 'ARNOST_FLASKA', col: 7, row: 11 },
                    { type: 'JINDRICH_BERKA', col: 11, row: 11 },
                    // Těžká jízda - hlavní síla (7-8000 mužů historicky)
                    { type: 'TEZKY_RYTIR', col: 5, row: 10 },
                    { type: 'TEZKY_RYTIR', col: 6, row: 10 },
                    { type: 'TEZKY_RYTIR', col: 7, row: 10 },
                    { type: 'TEZKY_RYTIR', col: 8, row: 10 },
                    { type: 'TEZKY_RYTIR', col: 9, row: 10 },
                    { type: 'TEZKY_RYTIR', col: 10, row: 10 },
                    { type: 'TEZKY_RYTIR', col: 11, row: 10 },
                    { type: 'TEZKY_RYTIR', col: 12, row: 10 },
                    { type: 'TEZKY_RYTIR', col: 13, row: 10 },
                    // Lehká jízda na křídlech
                    { type: 'LEHKA_JIZDA', col: 3, row: 10 },
                    { type: 'LEHKA_JIZDA', col: 4, row: 10 },
                    { type: 'LEHKA_JIZDA', col: 14, row: 10 },
                    { type: 'LEHKA_JIZDA', col: 15, row: 10 },
                    // Pražská pěchota (umírnění husité)
                    { type: 'KOPINICI', col: 6, row: 12 },
                    { type: 'KOPINICI', col: 7, row: 12 },
                    { type: 'KOPINICI', col: 8, row: 12 },
                    { type: 'KOPINICI', col: 9, row: 12 },
                    { type: 'KOPINICI', col: 10, row: 12 },
                    { type: 'KOPINICI', col: 11, row: 12 },
                    { type: 'KOPINICI', col: 12, row: 12 },
                    { type: 'HALAPARTNICI', col: 5, row: 12 },
                    { type: 'HALAPARTNICI', col: 13, row: 12 },
                    // Katoličtí střelci
                    { type: 'KUSNICI', col: 5, row: 11 },
                    { type: 'KUSNICI', col: 13, row: 11 },
                    { type: 'KUSNICI', col: 6, row: 11 },
                    { type: 'KUSNICI', col: 12, row: 11 },
                    // Záloha pěchoty
                    { type: 'KOPINICI', col: 7, row: 13 },
                    { type: 'KOPINICI', col: 8, row: 13 },
                    { type: 'KOPINICI', col: 10, row: 13 },
                    { type: 'KOPINICI', col: 11, row: 13 }
                ]
            }
        },

        phases: [
            {
                id: 1,
                name: 'Zaujmutí pozic',
                turnRange: [1, 2],
                description: 'Žižka rozpoznává terén s pomocí Roháče a Hvězdy. Husité se opevňují na svahu.',
                events: [
                    { trigger: 'turn_1', message: 'Jan Roháč: "Pane hejtmane, máme dobrý svah nad údolím. Potok Bohynka nám kryje střed."' },
                    { trigger: 'turn_2', message: 'Jan Hvězda: "Znám tato místa. Údolí je úzké - nepřítel se nebude moci rozvinout."' }
                ]
            },
            {
                id: 2,
                name: 'Koaliční útok',
                turnRange: [3, 5],
                description: 'Protižižkovská koalice vrhá jízdu do údolí. Nepřítel se nemůže plně rozvinout.',
                events: [
                    { trigger: 'turn_3', message: 'Čeněk z Vartenberka: "Do útoku! Rozdrtíme slepce jednou provždy!"' },
                    { trigger: 'turn_4', message: 'Těžká jízda vjíždí do úzkého údolí... Řady se tísní!' },
                    { trigger: 'turn_5', type: 'terrain_penalty', faction: 'crusaders', text: 'Jízda ztrácí hybnost v bažinatém údolí!' }
                ]
            },
            {
                id: 3,
                name: 'Krvavé údolí',
                turnRange: [6, 8],
                description: 'Husitská palba z vrchu kosí útočníky. Nejkrvavější fáze bitvy.',
                events: [
                    { trigger: 'turn_6', message: 'Houfnice a ručnice pálí do natěsnaných řad nepřítele!' },
                    { trigger: 'turn_7', message: 'Ztráty koalice rostou! Údolí se barví krví!' },
                    { trigger: 'turn_8', type: 'morale_drop', faction: 'crusaders', amount: 3, text: 'Koaliční vojsko ztrácí odvahu v zabijácké palbě.' }
                ]
            },
            {
                id: 4,
                name: 'Žižkův protiútok',
                turnRange: [9, 11],
                description: 'Žižka nařizuje smrtící protiútok ze svahu dolů.',
                events: [
                    { trigger: 'turn_9', message: 'Žižka: "Teď! Dolů z kopce! Za pravdu Boží!"' },
                    { trigger: 'turn_10', message: 'Husitská jízda a pěchota se řítí ze svahu na dezorientovaného nepřítele!' },
                    { trigger: 'turn_11', type: 'charge_bonus', faction: 'hussites', amount: 15, text: 'Útok z kopce! +15% k útoku husitských jednotek.' }
                ]
            },
            {
                id: 5,
                name: 'Zhroucení koalice',
                turnRange: [12, 15],
                description: 'Koaliční vojsko se hroutí. Zadní voje prchají bez boje.',
                events: [
                    { trigger: 'turn_12', message: 'Koalice se hroutí! Muži prchají směrem k Malešovu!' },
                    { trigger: 'turn_13', message: 'Čeněk z Vartenberka: "Zpět! Všichni zpět!" Zadní voje už ani nevstoupily do boje.' },
                    { trigger: 'turn_14', message: '1200 koaličních vojáků padlo. Husité ztratili jen 200 mužů.' },
                    { trigger: 'turn_15', message: 'Žižka ovládl bojiště. Cesta na Kutnou Horu je volná!' }
                ]
            }
        ],

        victoryConditions: {
            primary: {
                type: 'destroy_percent',
                percent: 55,
                description: 'Zničte 55% koaličního vojska'
            },
            secondary: [
                { type: 'hold_position', positions: [[7,3], [8,3], [9,3], [10,3]], description: 'Udržte velitelskou pozici na svahu' },
                { type: 'survive_commander', description: 'Jan Žižka musí přežít' },
                { type: 'max_losses', maxLosses: 30, description: 'Ztratit méně než 30% vlastních jednotek' }
            ]
        },

        debriefing: {
            victory: 'Geniální vítězství slepého vojevůdce! Žižka využil terénu a disciplíny svých mužů k drtivé porážce koalice Pražanů a katolíků. 1200 koaličních vojáků padlo, zatímco husité ztratili pouze 200 mužů. Cesta na Kutnou Horu je volná!',
            defeat: 'Koalice překonala Žižkovu obranu. Táborité a sirotci utrpěli těžké ztráty. Slepý vojevůdce přišel o svou reputaci neporazitelnosti a husitské hnutí je opět rozděleno.'
        },

        maxTurns: 15,
        playerFaction: 'hussites'
    }
};

// Pomocné funkce pro práci se scénáři
const ScenarioManager = {
    // Získání seznamu všech scénářů
    getScenarioList: function() {
        return Object.values(Scenarios).map(s => {
            // Aplikuj lokalizaci pokud je dostupná
            const localized = (typeof getLocalizedScenario === 'function')
                ? getLocalizedScenario(s.id, s)
                : s;

            return {
                id: localized.id,
                name: localized.name,
                date: localized.date,
                difficulty: localized.difficulty,
                description: localized.description
            };
        });
    },

    // Získání konkrétního scénáře
    getScenario: function(id) {
        const baseScenario = Scenarios[id];
        if (!baseScenario) return null;

        // Aplikuj lokalizaci pokud je dostupná
        if (typeof getLocalizedScenario === 'function') {
            return getLocalizedScenario(id, baseScenario);
        }

        return baseScenario;
    },

    // Vytvoření terénu pro scénář
    applyScenarioTerrain: function(hexGrid, scenario) {
        const terrain = scenario.terrain;

        // Projít všechny hexy a nastavit výchozí terén
        for (const [key, hex] of hexGrid.hexes) {
            hex.terrain = 'plains';
        }

        // Aplikovat specifické terény (s převodem souřadnic pro okrajové hexagony)
        for (const [terrainType, positions] of Object.entries(terrain)) {
            if (terrainType === 'plains' || !Array.isArray(positions)) continue;

            for (const [col, row] of positions) {
                // Převod souřadnic ze scénáře na skutečné souřadnice mapy
                const mapped = hexGrid.scenarioToMap(col, row);
                const hex = hexGrid.getHex(mapped.col, mapped.row);
                if (hex) {
                    hex.terrain = terrainType;
                }
            }
        }
    },

    // Vytvoření jednotek pro scénář
    createScenarioUnits: function(scenario, unitFactory, hexGrid) {
        const units = [];

        // Husitské jednotky
        for (const unitDef of scenario.forces.hussites.units) {
            try {
                // Převod souřadnic ze scénáře na skutečné souřadnice mapy
                const mapped = hexGrid.scenarioToMap(unitDef.col, unitDef.row);
                const unit = unitFactory.createUnit(unitDef.type, mapped.col, mapped.row);
                // Strana ve scénáři přebíjí frakci šablony (např. Diviš Bořek je
                // husitská šablona, ale u Lipan velí straně protivníka)
                unit.faction = 'hussites';
                units.push(unit);
            } catch (e) {
                console.error(`Failed to create hussite unit: ${unitDef.type}`, e);
            }
        }

        // Křižácké jednotky
        for (const unitDef of scenario.forces.crusaders.units) {
            try {
                // Převod souřadnic ze scénáře na skutečné souřadnice mapy
                const mapped = hexGrid.scenarioToMap(unitDef.col, unitDef.row);
                const unit = unitFactory.createUnit(unitDef.type, mapped.col, mapped.row);
                unit.faction = 'crusaders';
                units.push(unit);
            } catch (e) {
                console.error(`Failed to create crusader unit: ${unitDef.type}`, e);
            }
        }

        return units;
    },

    // Kontrola událostí fáze - vrací seznam eventů pro daný tah
    // game parametr je volitelný - potřebný pro podmíněné eventy
    checkPhaseEvents: function(scenario, turn, game) {
        const events = [];
        for (const phase of scenario.phases) {
            if (turn >= phase.turnRange[0] && turn <= phase.turnRange[1]) {
                for (let i = 0; i < phase.events.length; i++) {
                    const event = phase.events[i];
                    const eventId = event.id || `phase${phase.id}_evt${i}`;

                    // Podmíněný event: trigger je nejdřívější kolo, triggerBefore nejpozdější
                    if (event.condition) {
                        const triggerFrom = event.trigger ? parseInt(event.trigger.replace('turn_', '')) : phase.turnRange[0];
                        const triggerTo = event.triggerBefore ? parseInt(event.triggerBefore.replace('turn_', '')) : phase.turnRange[1];
                        if (turn < triggerFrom || turn > triggerTo) continue;

                        // Kontrola podmínky - potřebuje game objekt
                        if (!game || !this.checkEventCondition(game, event.condition)) continue;
                    } else {
                        // Standardní event - přesná shoda kola
                        if (event.trigger !== `turn_${turn}`) continue;
                    }

                    // Pokud event má explicitní typ, použijeme ho, jinak 'message'
                    if (event.type) {
                        events.push({
                            turn: turn,
                            type: event.type,
                            id: eventId,
                            title: phase.name,
                            text: event.text || event.message,
                            // Předáme všechny další parametry eventu
                            faction: event.faction,
                            level: event.level,
                            duration: event.duration,
                            modifier: event.modifier,
                            changes: event.changes,
                            area: event.condition?.area
                        });
                    } else {
                        // Zpětná kompatibilita - prosté zprávy
                        events.push({
                            turn: turn,
                            type: 'message',
                            id: eventId,
                            title: phase.name,
                            text: event.message
                        });
                    }
                }
            }
        }
        return events;
    },

    // Kontrola podmínky eventu
    checkEventCondition: function(game, condition) {
        switch (condition.type) {
            case 'units_in_area': {
                const area = condition.area;
                const count = game.units.filter(u =>
                    u.faction === condition.faction &&
                    u.health > 0 &&
                    u.col >= area.minCol && u.col <= area.maxCol &&
                    u.row >= area.minRow && u.row <= area.maxRow
                ).length;
                return count >= (condition.minCount || 1);
            }
            case 'no_units_in_area': {
                const area = condition.area;
                const count = game.units.filter(u =>
                    u.faction === condition.faction &&
                    u.health > 0 &&
                    u.col >= area.minCol && u.col <= area.maxCol &&
                    u.row >= area.minRow && u.row <= area.maxRow
                ).length;
                return count === 0;
            }
            case 'faction_losses_percent': {
                const initial = condition.faction === (game.currentScenario?.playerFaction || 'hussites')
                    ? game.initialPlayerUnits
                    : game.initialEnemyUnits;
                const current = game.units.filter(u => u.faction === condition.faction && u.health > 0).length;
                const lossPercent = ((initial - current) / initial) * 100;
                return lossPercent >= (condition.percent || 50);
            }
            case 'units_routing': {
                const routingCount = game.units.filter(u =>
                    u.faction === condition.faction &&
                    u.health > 0 &&
                    u.isRouting
                ).length;
                return routingCount >= (condition.minCount || 1);
            }
            default:
                return true;
        }
    },

    // Získání aktuální fáze
    getCurrentPhase: function(scenario, turn) {
        for (const phase of scenario.phases) {
            if (turn >= phase.turnRange[0] && turn <= phase.turnRange[1]) {
                return phase;
            }
        }
        return scenario.phases[scenario.phases.length - 1];
    },

    // Kontrola posil - vrací seznam posil pro daný tah a frakci
    checkReinforcements: function(scenario, turn, faction) {
        const forces = scenario.forces[faction];
        const reinforcements = [];

        if (forces.reinforcements && forces.reinforcements.turn === turn) {
            // Stará struktura - jednotlivé posily
            for (const unitDef of forces.reinforcements.units) {
                reinforcements.push({
                    turn: turn,
                    type: unitDef.type,
                    position: [unitDef.col, unitDef.row],
                    count: 1
                });
            }
        }

        return reinforcements;
    }
};
