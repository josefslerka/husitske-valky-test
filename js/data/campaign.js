// Systém historických scénářů/misí

// ==========================================
// STRUKTURA KAMPANĚ - 4 AKTY
// ==========================================
const Campaign = {
    name: 'Husitské války 1419-1437',
    description: 'Prožijte celé husitské války od prvních střetnutí až po bitvu u Lipan.',

    acts: [
        {
            id: 1,
            name: 'AKT I: ZROZENÍ',
            subtitle: '1419-1420',
            description: 'První léta revoluce. Od defenestrace k obraně Prahy.',
            battles: [
                { id: 'zivohost_1419', available: true },
                { id: 'nekmir_1419', available: true },
                { id: 'sudomere_1420', available: true },
                { id: 'vitkov_1420', available: true },
                { id: 'vysehrad_1420', available: true }
            ],
            unlockCondition: null // Vždy odemčeno
        },
        {
            id: 2,
            name: 'AKT II: ŽIŽKOVA ÉRA',
            subtitle: '1421-1424',
            description: 'Pod Žižkovým velením husité porážejí jednu křížovou výpravu za druhou.',
            battles: [
                { id: 'kutna_hora_1421', available: true },
                { id: 'nemecky_brod_1422', available: true },
                { id: 'most_1421', available: true },
                { id: 'horice_1423', available: true },
                { id: 'malesov_1424', available: true }
            ],
            unlockCondition: { act: 1, battlesRequired: 3 }
        },
        {
            id: 3,
            name: 'AKT III: PROKOPOVA ÉRA',
            subtitle: '1425-1431',
            description: 'Husité přecházejí do ofenzivy. Spanilé jízdy a konec křížových výprav.',
            battles: [
                { id: 'usti_1426', available: true },
                { id: 'tachov_1427', available: true },
                { id: 'nisa_1428', available: true },
                { id: 'domazlice_1431', available: true }
            ],
            unlockCondition: { act: 2, battlesRequired: 3 }
        },
        {
            id: 4,
            name: 'AKT IV: KONEC',
            subtitle: '1433-1437',
            description: 'Rozkol mezi husity vede k tragickému konci u Lipan.',
            battles: [
                { id: 'oblehani_plzne_1433', available: true },
                { id: 'lipany_1434', available: true },
                { id: 'sion_1437', available: true }
            ],
            unlockCondition: { act: 3, battlesRequired: 2 }
        }
    ],

    // Získání aktu podle ID
    getAct: function(actId) {
        return this.acts.find(a => a.id === actId);
    },

    // Získání všech dostupných bitev
    getAvailableBattles: function() {
        const available = [];
        for (const act of this.acts) {
            for (const battle of act.battles) {
                if (battle.available && !battle.locked) {
                    available.push({
                        ...battle,
                        actId: act.id,
                        actName: act.name
                    });
                }
            }
        }
        return available;
    },

    // Kontrola, zda je bitva k dispozici
    isBattleAvailable: function(battleId) {
        for (const act of this.acts) {
            const battle = act.battles.find(b => b.id === battleId);
            if (battle) {
                return battle.available && !battle.locked;
            }
        }
        return false;
    }
};
