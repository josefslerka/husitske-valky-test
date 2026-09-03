// Herní logika - řízení tahů, soubojů a stavu hry

class Game {
    constructor(hexGrid) {
        this.hexGrid = hexGrid;
        this.unitFactory = new UnitFactory();
        this.combatSystem = new CombatSystem(this);
        this.fogOfWarSystem = new FogOfWarSystem(this);
        this.victoryConditionsSystem = new VictoryConditionsSystem(this);
        this.tutorialSystem = new TutorialSystem(this);
        this.moraleSystem = new MoraleSystem(this);

        this.units = [];
        this.currentFaction = 'hussites'; // Husité začínají
        this.turnNumber = 1;

        this.selectedUnit = null;
        this.gameState = 'playing'; // playing, victory

        this.log = [];

        // Scénář a fáze
        this.currentScenario = null;
        this.currentPhase = null;
        this.processedEvents = new Set(); // Sledování již zpracovaných eventů

        // Statistiky hry
        this.enemiesKilled = 0;
        this.unitsLost = 0;
        // WP2a: přesné ztráty per frakce (zabití vs. uprchlí) pro "Vy vs. kronika"
        this.lossesByFaction = { hussites: 0, crusaders: 0 };
        this.fledByFaction = { hussites: 0, crusaders: 0 };
        this.initialPlayerUnits = 0;
        this.initialEnemyUnits = 0;
        this.campaignRecorded = false;
        this.campaignReputation = 50;

        // Rozšířené statistiky
        this.gameDuration = Date.now(); // Čas začátku hry
        this.stats = {
            totalDamage: 0,      // Celkové způsobené poškození
            damageTaken: 0,      // Celkové obdržené poškození
            unitKills: {},       // Zabití podle jednotky { unitId: počet }
            unitDamage: {}       // Poškození podle jednotky { unitId: celkem }
        };

        // Animační smyčka
        this.isAnimating = false;
        this.animationLoop = null;

        // Undo systém - uložení posledního pohybu
        this.lastMove = null;  // { unit, fromCol, fromRow }

        // Chorál - jednorázová schopnost
        this.choralUsed = false;
        this.choralActive = false;
        this.choralTurnsRemaining = 0;

        // Skriptovaný postoj AI (WP0) - řízení chování nepřítele přes eventy
        this.aiStance = { mode: 'default', target: null, untilTurn: null, proximity: 3 };

        // Příběhové notifikace se zobrazují postupně. Některá kola spouštějí
        // 2-3 eventy zároveň; bez fronty se karty kreslily přes sebe.
        this.eventNotificationQueue = [];
        this.activeEventNotification = null;
        this.eventNotificationTimer = null;

        // Regenerace - sledování jednotek které již regenerovaly
        this.regeneratedUnits = new Set();

        // Mlha války - viditelnost
        this.fogOfWar = true; // Zapnuto defaultně
        this.visibleHexes = new Set(); // Hexy viditelné hráčem
        this.exploredHexes = new Set(); // Hexy které hráč někdy viděl

        // Morální zlom - útěk nepřátel
        this.moraleBroken = false;
        this.routingUnits = new Set(); // Jednotky na útěku

        // Okno protiútoku - kolísání armád
        // armyMorale: průměrná morálka živých jednotek frakce (0-100), přepočítává se
        // wavering: zda frakce právě kolísá (mezi prahem zlomu a vzpamatování)
        this.armyMorale = { hussites: 100, crusaders: 100 };
        this.wavering = { hussites: false, crusaders: false };

        // Přeskočení animace tahu AI (klik na indikátor "Křižáci přemýšlí")
        // - sticky pro celou bitvu: jakmile zapnuto, AI tahy běží zrychleně
        this.fastForwardAI = false;

        // Tutoriál
        this.isTutorial = false;
        this.tutorialStep = 0;
        this.tutorialSteps = [];
        this.tutorialBlockedActions = new Set();
        this.tutorialWaitingFor = null;

        // Inicializace minimapy
        const minimapCanvas = document.getElementById('minimap');
        this.minimap = new Minimap(minimapCanvas, hexGrid);

        // Controller pro hromadné odebrání všech listenerů při destroy()
        this.eventAbortController = new AbortController();

        this.setupEventListeners();
    }

    // Úklid instance - bez něj zůstávají listenery a animační smyčka
    // staré hry aktivní na sdíleném canvasu a tlačítkách
    destroy() {
        this.stopAnimationLoop();
        this.eventAbortController.abort();
        this.hideTooltip();
        this.clearEventNotifications();
        this.gameState = 'destroyed';
    }

    // Inicializace nové hry (výchozí bez scénáře)
    initGame() {
        this.units = [];
        this.currentFaction = 'hussites';
        this.turnNumber = 1;
        this.selectedUnit = null;
        this.gameState = 'playing';
        this.clearLog();
        this.currentScenario = null;
        this.currentPhase = null;
        this.processedEvents = new Set();
        this.campaignRecorded = false;
        this.campaignReputation = 50; // Rychlá bitva je vždy neutrální.

        // Reset speciálních schopností
        this.choralUsed = false;
        this.choralActive = false;
        this.choralTurnsRemaining = 0;
        this.aiStance = { mode: 'default', target: null, untilTurn: null, proximity: 3 };
        this.regeneratedUnits = new Set();
        this.escapedUnits = 0;

        // Reset mlhy války a morálky (fogOfWar se nastaví z main.js podle nastavení)
        // this.fogOfWar zůstává jak bylo nastaveno
        this.visibleHexes = new Set();
        this.exploredHexes = new Set();
        this.moraleBroken = false;
        this.routingUnits = new Set();
        this.armyMorale = { hussites: 100, crusaders: 100 };
        this.wavering = { hussites: false, crusaders: false };

        // Vytvoření armád
        const hussites = this.unitFactory.createHussiteArmy();
        const crusaders = this.unitFactory.createCrusaderArmy();
        this.units = [...hussites, ...crusaders];

        // Nastavení terénu
        this.setupTerrain();

        // Skrytí phase panelu
        document.getElementById('phase-panel').classList.add('hidden');

        // Aktualizace UI
        this.updateUI();
        this.addLog(i18n.t('gameLog.gameStart'), 'turn');

        // Spuštění animační smyčky
        this.startAnimationLoop();

        this.render();
    }

    // Převod souřadnic ve victoryConditions na mapové souřadnice (s okrajem)
    convertVictoryConditionPositions(scenario) {
        if (!scenario.victoryConditions) return;

        // Kontrola, jestli už byl převod proveden (aby se nepřevádělo při restartu)
        if (scenario._positionsConverted) return;
        scenario._positionsConverted = true;

        const convertPositions = (positions) => {
            if (!Array.isArray(positions)) return positions;
            return positions.map(([col, row]) => {
                const mapped = this.hexGrid.scenarioToMap(col, row);
                return [mapped.col, mapped.row];
            });
        };

        // Primary conditions
        const primary = scenario.victoryConditions.primary;
        if (primary) {
            if (primary.positions) {
                primary.positions = convertPositions(primary.positions);
            }
            if (primary.escapeZone) {
                primary.escapeZone = convertPositions(primary.escapeZone);
            }
            // Dual objective
            if (primary.objectives) {
                for (const obj of primary.objectives) {
                    if (obj.positions) {
                        obj.positions = convertPositions(obj.positions);
                    }
                }
            }
        }

        // Secondary conditions
        if (scenario.victoryConditions.secondary) {
            for (const sec of scenario.victoryConditions.secondary) {
                if (sec.positions) {
                    sec.positions = convertPositions(sec.positions);
                }
            }
        }
    }

    // Inicializace hry se scénářem
    initGameWithScenario(scenario) {
        this.units = [];
        this.currentFaction = 'hussites';
        this.turnNumber = 1;
        this.selectedUnit = null;
        this.gameState = 'playing';
        this.clearLog();
        this.currentScenario = scenario;
        this.processedEvents = new Set();
        this.currentPhase = null;  // Reset fáze při načtení scénáře

        // Reset statistik
        this.enemiesKilled = 0;
        this.unitsLost = 0;
        this.lossesByFaction = { hussites: 0, crusaders: 0 };  // WP2a
        this.fledByFaction = { hussites: 0, crusaders: 0 };
        this.chronicleRecorded = false;  // WP2b: zápis do kroniky jen jednou za bitvu
        this.campaignRecorded = false;
        this.campaignReputation = typeof CampaignProgressSystem !== 'undefined'
            ? CampaignProgressSystem.getReputation()
            : 50;

        // Reset rozšířených statistik
        this.gameDuration = Date.now();
        this.stats = {
            totalDamage: 0,
            damageTaken: 0,
            unitKills: {},
            unitDamage: {}
        };

        // Reset speciálních schopností
        this.choralUsed = false;
        this.choralActive = false;
        this.choralTurnsRemaining = 0;
        this.aiStance = { mode: 'default', target: null, untilTurn: null, proximity: 3 };
        this.regeneratedUnits = new Set();
        this.escapedUnits = 0;
        this.objectiveHeldTurns = {};  // Pro dual_objective sledování

        // Reset mlhy války a morálky (fogOfWar se nastaví z main.js podle nastavení)
        // this.fogOfWar zůstává jak bylo nastaveno před voláním této metody
        this.visibleHexes = new Set();
        this.exploredHexes = new Set();
        this.moraleBroken = false;
        this.routingUnits = new Set();
        this.armyMorale = { hussites: 100, crusaders: 100 };
        this.wavering = { hussites: false, crusaders: false };

        // Aplikace terénu ze scénáře
        ScenarioManager.applyScenarioTerrain(this.hexGrid, scenario);

        // Převod souřadnic ve victoryConditions na mapové souřadnice
        this.convertVictoryConditionPositions(scenario);

        // Nastavení zvýrazněné cílové zóny (escape zóna nebo breakthrough pozice)
        // Souřadnice jsou už převedené v convertVictoryConditionPositions výše.
        const _primary = scenario.victoryConditions && scenario.victoryConditions.primary;
        if (_primary) {
            const zoneHexes = _primary.type === 'escape' ? (_primary.escapeZone || [])
                            : _primary.type === 'breakthrough' ? (_primary.positions || [])
                            : [];
            if (zoneHexes.length > 0) {
                this.hexGrid.setEscapeZone(zoneHexes.map(([col, row]) => ({ col, row })), _primary.zoneLabel || '');
            }
        }

        // Nastavení map labels (názvy měst, řek, etc.) - s převodem souřadnic
        this.hexGrid.mapLabels = (scenario.mapLabels || []).map(label => ({
            text: label.text,
            offset: Array.isArray(label.offset) ? [...label.offset] : [0, 0],
            hexes: label.hexes.map(([col, row]) => {
                const mapped = this.hexGrid.scenarioToMap(col, row);
                return [mapped.col, mapped.row];
            })
        }));

        // Vytvoření jednotek ze scénáře
        this.units = ScenarioManager.createScenarioUnits(scenario, this.unitFactory, this.hexGrid);

        // Aplikace speciální počáteční morálky (např. Tachov - demoralizovaní křižáci)
        if (scenario.specialMechanics && scenario.specialMechanics.startingMorale) {
            const reputationModifier = typeof CampaignProgressSystem !== 'undefined'
                ? CampaignProgressSystem.getStartingMoraleModifier(scenario.id, this.campaignReputation)
                : 0;
            for (const [faction, morale] of Object.entries(scenario.specialMechanics.startingMorale)) {
                for (const unit of this.units) {
                    if (unit.faction === faction) {
                        const adjustedMorale = faction === 'crusaders' ? morale + reputationModifier : morale;
                        unit.morale = Math.max(0, Math.min(unit.maxMorale, adjustedMorale));
                    }
                }
            }
            this.addLog(i18n.t('gameLog.enemyDemoralized'), 'morale');
            if (typeof CampaignProgressSystem !== 'undefined' && CampaignProgressSystem.affectsReputationBattle(scenario.id)) {
                this.addLog(i18n.t(CampaignProgressSystem.getNarrativeKey(this.campaignReputation)), 'morale');
            }
        }

        // Uložení počátečních počtů jednotek pro statistiky
        const playerFaction = scenario.playerFaction || 'hussites';
        this.initialPlayerUnits = this.units.filter(u => u.faction === playerFaction).length;
        this.initialEnemyUnits = this.units.filter(u => u.faction !== playerFaction).length;

        // Nastavení první fáze
        this.updatePhase();

        // Aktualizace UI
        this.updateUI();
        this.addLog(`--- ${scenario.name} ---`, 'turn');
        this.addLog(scenario.briefing.hussites, 'turn');
        this.addLog(i18n.t('gameLog.hussitesStart'), 'turn');

        // Spuštění animační smyčky
        this.startAnimationLoop();

        this.render();

        // Zkontrolovat eventy první fáze
        this.checkPhaseEvents();

        // Inicializace tutoriálu
        if (scenario.type === 'tutorial' && scenario.tutorialSteps) {
            this.tutorialSystem.initTutorial(scenario.tutorialSteps);
        }

        // Vycentruj pohled na taktické ohnisko bitvy
        this.centerOnPlayerForces();
    }

    // Vycentrování pohledu na počáteční situaci: rámuj střet armád jako
    // taktickou scénu, ne surový roh mapy ani čistě vlastní okraj.
    centerOnPlayerForces() {
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) return;

        const framedUnits = this.units.filter(u => u.health > 0);
        if (framedUnits.length === 0) return;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const unit of framedUnits) {
            const pos = this.hexGrid.hexToPixel(unit.col, unit.row);
            minX = Math.min(minX, pos.x);
            minY = Math.min(minY, pos.y);
            maxX = Math.max(maxX, pos.x);
            maxY = Math.max(maxY, pos.y);
        }

        const padding = this.hexGrid.hexSize * 2.2;

        const applyScroll = () => {
            const containerWidth = mapContainer.clientWidth;
            const containerHeight = mapContainer.clientHeight;
            const maxLeft = Math.max(0, this.hexGrid.canvas.width - containerWidth);
            const maxTop = Math.max(0, this.hexGrid.canvas.height - containerHeight);

            const focusX = (minX + maxX) / 2;
            const focusY = (minY + maxY) / 2;
            const encounterWidth = maxX - minX + padding * 2;
            const encounterHeight = maxY - minY + padding * 2;

            let left = focusX - containerWidth / 2;
            let top = focusY - containerHeight / 2;

            if (encounterWidth <= containerWidth) {
                left = minX - (containerWidth - encounterWidth) / 2 - padding;
            }

            if (encounterHeight <= containerHeight) {
                top = minY - (containerHeight - encounterHeight) / 2 - padding;
            }

            if (minY < this.hexGrid.canvas.height * 0.58) {
                top = minY - containerHeight * 0.43;
            }

            mapContainer.scrollLeft = Math.max(0, Math.min(maxLeft, left));
            mapContainer.scrollTop = Math.max(0, Math.min(maxTop, top));
        };

        applyScroll();
        requestAnimationFrame(applyScroll);
        setTimeout(applyScroll, 80);
    }

    // Aktualizace aktuální fáze
    updatePhase() {
        if (!this.currentScenario) {
            document.getElementById('phase-panel').classList.add('hidden');
            return;
        }

        const newPhase = ScenarioManager.getCurrentPhase(this.currentScenario, this.turnNumber);

        if (newPhase && (!this.currentPhase || newPhase.id !== this.currentPhase.id)) {
            this.currentPhase = newPhase;

            // Zobrazení phase panelu
            const phasePanel = document.getElementById('phase-panel');
            const phaseIcon = document.getElementById('phase-icon');
            document.getElementById('phase-name').textContent = newPhase.name;
            document.getElementById('phase-description').textContent = newPhase.description || '';

            // Nastavení ikony podle typu fáze
            const phaseIcons = {
                'surprise': '⚡',
                'attack': '⚔',
                'defense': '🛡',
                'retreat': '🏃',
                'reinforcement': '📯',
                'ambush': '🎯',
                'siege': '🏰',
                'default': '⚔'
            };
            const phaseName = newPhase.name.toLowerCase();
            let icon = phaseIcons.default;
            if (phaseName.includes('překvap') || phaseName.includes('surprise')) icon = phaseIcons.surprise;
            else if (phaseName.includes('útok') || phaseName.includes('attack')) icon = phaseIcons.attack;
            else if (phaseName.includes('obran') || phaseName.includes('defense')) icon = phaseIcons.defense;
            else if (phaseName.includes('ústup') || phaseName.includes('retreat')) icon = phaseIcons.retreat;
            else if (phaseName.includes('posil') || phaseName.includes('reinforcement')) icon = phaseIcons.reinforcement;
            else if (phaseName.includes('léčk') || phaseName.includes('ambush')) icon = phaseIcons.ambush;
            else if (phaseName.includes('oblé') || phaseName.includes('siege')) icon = phaseIcons.siege;

            if (phaseIcon) phaseIcon.textContent = icon;
            phasePanel.classList.remove('hidden');

            // Log změny fáze
            this.addLog(`--- ${newPhase.name} ---`, 'turn');
        }
    }

    // Kontrola a zpracování eventů fáze
    checkPhaseEvents() {
        if (!this.currentScenario) return;

        const events = ScenarioManager.checkPhaseEvents(this.currentScenario, this.turnNumber, this);

        for (const event of events) {
            // Použít event id pro dedup (podmíněné eventy nemají fixní kolo)
            const eventKey = event.id || `${event.turn}-${event.type}`;
            if (this.processedEvents.has(eventKey)) continue;

            this.processedEvents.add(eventKey);
            this.processEvent(event);
        }

        // Kontrola posil
        this.checkReinforcements();
    }

    // Zpracování jednotlivého eventu
    processEvent(event) {
        switch (event.type) {
            case 'message':
                this.showEventNotification(event.title || i18n.t('messages.messageTitle'), event.text);
                break;

            case 'reinforcement':
                // Posily jsou zpracovány v checkReinforcements
                break;

            case 'terrain_change':
                if (event.changes) {
                    for (const change of event.changes) {
                        this.hexGrid.setTerrain(change.col, change.row, change.terrain);
                    }
                    this.render();
                }
                break;

            case 'morale':
                // Efekt na morálku - upravíme útok jednotek
                const moraleModifier = event.modifier || (event.amount ? -event.amount : 0);
                if (event.faction && moraleModifier) {
                    for (const unit of this.units) {
                        if (unit.faction === event.faction && unit.health > 0) {
                            unit.attack = Math.max(1, unit.attack + moraleModifier);
                            // Snížení morálky jednotek
                            if (unit.morale !== undefined) {
                                unit.morale = Math.max(0, unit.morale + moraleModifier * 5);
                            }
                        }
                    }
                }
                if (event.text) {
                    this.showEventNotification(event.title || i18n.t('messages.moraleTitle'), event.text);
                }
                break;

            case 'activate_choral':
                // Automatická aktivace chorálu (např. Domažlice)
                if (!this.choralUsed) {
                    this.choralUsed = true;
                    this.choralActive = true;
                    this.choralTurnsRemaining = event.duration || 3;

                    this.addLog(i18n.t('gameLog.choralActivated'), 'turn');

                    // Vizuální efekt
                    const phasePanel = document.getElementById('phase-panel');
                    const phaseName = document.getElementById('phase-name');
                    const phaseDesc = document.getElementById('phase-description');
                    phasePanel.classList.remove('hidden');
                    phaseName.textContent = i18n.t('gameLog.choralName');
                    phaseDesc.textContent = event.text || i18n.t('gameLog.choralEffect');

                    this.updateChoralButton();

                    // WP4: psychologický šok na nepřítele (stejně jako u ručního chorálu)
                    this.applyChoralShock();

                    // Přehrát zvuk chorálu
                    if (typeof Music !== 'undefined' && Music.playChoral) {
                        Music.playChoral();
                    }
                }
                break;

            case 'panic':
                // Panika - snížení morálky a možný útěk jednotek
                if (event.faction) {
                    const affectedUnits = this.units.filter(u => u.faction === event.faction && u.health > 0);
                    const basePanicLevel = event.level || 1; // 1 = mírná, 2 = střední, 3 = těžká
                    const panicLevel = typeof CampaignProgressSystem !== 'undefined'
                        ? CampaignProgressSystem.adjustPanicLevel(
                            basePanicLevel,
                            this.currentScenario?.id,
                            this.campaignReputation
                        )
                        : basePanicLevel;

                    for (const unit of affectedUnits) {
                        // Snížení útoku kvůli panice
                        const attackPenalty = panicLevel * 5;
                        unit.attack = Math.max(1, unit.attack - attackPenalty);

                        // Těžká panika může způsobit okamžitý útěk některých jednotek
                        if (panicLevel >= 3 && Math.random() < 0.3) {
                            this.routingUnits.add(unit.id || `${unit.col}-${unit.row}`);
                            unit.isRouting = true;
                            this.addLog(i18n.t('gameLog.panicFlee', {unit: unit.name}), 'morale');
                        }
                    }

                    if (event.text) {
                        const reputationLine = typeof CampaignProgressSystem !== 'undefined'
                            && CampaignProgressSystem.affectsReputationBattle(this.currentScenario?.id)
                            && basePanicLevel >= 2
                            ? `\n\n${i18n.t(CampaignProgressSystem.getNarrativeKey(this.campaignReputation))}`
                            : '';
                        this.showEventNotification(event.title || i18n.t('messages.panicTitle'), event.text + reputationLine);
                    }
                    this.addLog(i18n.t('gameLog.enemyPanic', {penalty: panicLevel * 5}), 'morale');
                }
                break;

            case 'ai_stance':
                // Skriptovaný postoj AI (WP0): lure/retreat/hold/defensive/aggressive/default.
                // Souřadnice targetu jsou ve scénářových souřadnicích - převedeme na mapové
                // stejně jako umisťování jednotek (scenarioToMap; dnes identita, ale robustně).
                {
                    let mappedTarget = null;
                    if (event.target && typeof event.target.col === 'number') {
                        mappedTarget = this.hexGrid.scenarioToMap(event.target.col, event.target.row);
                    }
                    this.aiStance = {
                        mode: event.mode || 'default',
                        target: mappedTarget,
                        untilTurn: (typeof event.untilTurn === 'number') ? event.untilTurn : null,
                        proximity: (typeof event.proximity === 'number') ? event.proximity : 3
                    };
                    if (event.text) {
                        this.showEventNotification(event.title || i18n.t('messages.orderTitle'), event.text);
                    }
                }
                break;

            case 'rout':
                // Hromadný útěk. U Tachova a Domažlic určí podíl prchajících
                // pověst vybudovaná v předchozích bitvách; jinde zůstává 100 %.
                if (event.faction) {
                    const routingFaction = this.units
                        .filter(u => u.faction === event.faction && u.health > 0)
                        .sort((a, b) => (a.morale - b.morale) || (a.health - b.health));
                    const routFraction = typeof CampaignProgressSystem !== 'undefined'
                        ? CampaignProgressSystem.getRoutFraction(
                            this.currentScenario?.id,
                            this.campaignReputation
                        )
                        : 1;
                    const routingCount = Math.max(1, Math.ceil(routingFaction.length * routFraction));
                    for (const unit of routingFaction.slice(0, routingCount)) {
                        this.routingUnits.add(unit.id || `${unit.col}-${unit.row}`);
                        unit.isRouting = true;
                    }
                    this.moraleBroken = routFraction >= 0.75;
                    if (event.text) {
                        this.showEventNotification(event.title || i18n.t('messages.massRoutTitle'), event.text);
                    }
                    this.addLog(i18n.t('gameLog.armyRouting'), 'morale');
                }
                break;

            case 'trench_bonus':
                // Bonus obrany pro jednotky v zákopech
                {
                    const trenchUnits = this.units.filter(u =>
                        u.faction === 'hussites' && u.health > 0 &&
                        this.hexGrid.getTerrain(u.col, u.row) === 'trenches'
                    );
                    for (const unit of trenchUnits) {
                        unit.defense = (unit.defense || 0) + 3;
                    }
                    if (event.text) {
                        this.showEventNotification(event.title || i18n.t('messages.trenchesTitle'), event.text);
                    }
                    this.addLog(i18n.t('gameLog.trenchBonus'), 'turn');
                }
                break;

            case 'dismount':
                // Jízdní jednotky na svahu ztrácí charge bonus a pohyb
                {
                    const faction = event.faction || 'crusaders';
                    const dismountedUnits = this.units.filter(u =>
                        u.faction === faction && u.health > 0 &&
                        u.isCavalry && u.isCavalry() &&
                        this.hexGrid.getTerrain(u.col, u.row) === 'slope'
                    );
                    for (const unit of dismountedUnits) {
                        unit.special = null; // Ztráta charge bonusu
                        unit.movement = Math.max(1, unit.movement - 1);
                        unit.dismounted = true;
                    }
                    if (event.text) {
                        this.showEventNotification(event.title || i18n.t('messages.dismountTitle'), event.text);
                    }
                    if (dismountedUnits.length > 0) {
                        this.addLog(i18n.t('gameLog.dismountedUnits', { count: dismountedUnits.length }), 'combat');
                    }
                }
                break;

            case 'tutorial':
                // Pozůstatek tutoriálových TIPů ve scénářích - jen zobrazit text
                if (event.text) {
                    this.showEventNotification(i18n.t('messages.tipTitle'), event.text);
                }
                break;

            case 'morale_boost':
            case 'morale_drop':
                // Plošná změna morálky frakce. Boost má v datech "modifier"
                // v bodech morálky (15, 20), drop má "amount" v malých
                // jednotkách (2, 3) - škálujeme ×5 jako stávající event 'morale'
                {
                    const faction = event.faction || 'crusaders';
                    const change = event.type === 'morale_boost'
                        ? (event.modifier || (event.amount || 2) * 5)
                        : -((event.amount || 2) * 5);
                    for (const unit of this.units) {
                        if (unit.faction === faction && unit.health > 0 && unit.morale !== undefined) {
                            unit.morale = Math.max(0, Math.min(100, unit.morale + change));
                        }
                    }
                    if (event.text) {
                        this.showEventNotification(event.title || i18n.t('messages.moraleTitle'), event.text);
                    }
                }
                break;

            case 'cavalry_charge_blocked':
                // Jízda ztrácí bonus nárazu (vozová hradba, svah, sudlice)
                {
                    const faction = event.faction || 'crusaders';
                    let blocked = 0;
                    for (const unit of this.units) {
                        if (unit.faction === faction && unit.health > 0 &&
                            unit.isCavalry && unit.isCavalry() && unit.special === 'charge') {
                            unit.special = null;
                            blocked++;
                        }
                    }
                    if (event.text) {
                        this.showEventNotification(event.title || i18n.t('messages.cavalryStoppedTitle'), event.text);
                    }
                    if (blocked > 0) {
                        this.addLog(i18n.t('gameLog.chargeBlocked', { count: blocked }), 'combat');
                    }
                }
                break;

            case 'wagon_bonus':
                // Bonus obrany jednotkám sousedícím s vlastním vozem
                {
                    const faction = event.faction || 'hussites';
                    let boosted = 0;
                    for (const unit of this.units) {
                        if (unit.faction !== faction || unit.health <= 0) continue;
                        if (unit.isWagon && unit.isWagon()) continue;
                        const nearWagon = this.hexGrid.getNeighbors(unit.col, unit.row).some(n => {
                            const u = this.getUnitAt(n.col, n.row);
                            return u && u.faction === faction && u.health > 0 && u.isWagon && u.isWagon();
                        });
                        if (nearWagon) {
                            unit.defense += 3;
                            boosted++;
                        }
                    }
                    if (event.text) {
                        this.showEventNotification(event.title || i18n.t('messages.wagonFortTitle'), event.text);
                    }
                    if (boosted > 0) {
                        this.addLog(i18n.t('gameLog.wagonBonusApplied', { count: boosted }), 'turn');
                    }
                }
                break;

            case 'terrain_penalty':
                // Jízda frakce ztrácí pohyb (bažina, rozbahněné údolí)
                {
                    const faction = event.faction || 'crusaders';
                    for (const unit of this.units) {
                        if (unit.faction === faction && unit.health > 0 &&
                            unit.isCavalry && unit.isCavalry()) {
                            unit.movement = Math.max(1, unit.movement - 1);
                        }
                    }
                    if (event.text) {
                        this.showEventNotification(event.title || i18n.t('messages.terrainTitle'), event.text);
                    }
                }
                break;

            case 'charge_bonus':
                // Procentní bonus k útoku frakce (např. útok z kopce)
                {
                    const faction = event.faction || 'hussites';
                    const percent = event.amount || 10;
                    for (const unit of this.units) {
                        if (unit.faction === faction && unit.health > 0) {
                            unit.attack = Math.round(unit.attack * (1 + percent / 100));
                        }
                    }
                    if (event.text) {
                        this.showEventNotification(event.title || i18n.t('messages.attackTitle'), event.text);
                    }
                }
                break;

            case 'massacre':
                // Routující jednotky v oblasti dostanou těžké ztráty
                {
                    const area = event.area;
                    const massacreTargets = this.units.filter(u =>
                        u.faction === (event.faction || 'crusaders') &&
                        u.health > 0 &&
                        u.isRouting &&
                        (!area || (u.col >= area.minCol && u.col <= area.maxCol &&
                                   u.row >= area.minRow && u.row <= area.maxRow))
                    );
                    for (const unit of massacreTargets) {
                        const damage = Math.floor(unit.health * 0.5);
                        unit.health -= damage;
                        if (unit.health <= 0) {
                            unit.health = 0;
                            // Statistiky podle frakce hráče + jednotné efekty smrti
                            this.combatSystem.trackUnitDeath(unit, null);
                            this.handleUnitDeath(unit);
                        }
                    }
                    if (event.text) {
                        this.showEventNotification(event.title || i18n.t('messages.massacreTitle'), event.text);
                    }
                    if (massacreTargets.length > 0) {
                        this.addLog(i18n.t('gameLog.massacreResult', { count: massacreTargets.length }), 'combat');
                    }
                    this.render();
                }
                break;

            default:
                // Neznámý typ eventu - zobraz aspoň vyprávění, ať se text
                // tiše neztratí, a upozorni do konzole
                if (event.text || event.message) {
                    this.showEventNotification(event.title || i18n.t('messages.eventTitle'), event.text || event.message);
                }
                console.warn(`Neimplementovaný typ eventu: ${event.type}`);
                break;
        }
    }

    // Kontrola posil
    checkReinforcements() {
        if (!this.currentScenario) return;

        // Posily pro husity
        const hussiteForces = this.currentScenario.forces.hussites;
        if (hussiteForces.reinforcements && hussiteForces.reinforcements.turn === this.turnNumber) {
            const reinfKey = `reinf-hussites-${this.turnNumber}`;
            if (!this.processedEvents.has(reinfKey)) {
                this.processedEvents.add(reinfKey);

                // Zobrazit zprávu o posilách
                if (hussiteForces.reinforcements.message) {
                    this.showEventNotification(i18n.t('messages.reinforcementsTitle'), hussiteForces.reinforcements.message);
                }

                // Vytvořit jednotky
                for (const unitDef of hussiteForces.reinforcements.units) {
                    // Převod souřadnic ze scénáře na skutečné souřadnice mapy
                    const mapped = this.hexGrid.scenarioToMap(unitDef.col, unitDef.row);
                    this.spawnReinforcements({
                        turn: this.turnNumber,
                        type: unitDef.type,
                        position: [mapped.col, mapped.row],
                        count: 1
                    }, 'hussites');
                }
            }
        }

        // Posily pro křižáky
        const crusaderForces = this.currentScenario.forces.crusaders;
        if (crusaderForces.reinforcements && crusaderForces.reinforcements.turn === this.turnNumber) {
            const reinfKey = `reinf-crusaders-${this.turnNumber}`;
            if (!this.processedEvents.has(reinfKey)) {
                this.processedEvents.add(reinfKey);

                // Zobrazit zprávu o posilách
                if (crusaderForces.reinforcements.message) {
                    this.showEventNotification(i18n.t('messages.enemyReinforcementsTitle'), crusaderForces.reinforcements.message);
                }

                // Vytvořit jednotky
                for (const unitDef of crusaderForces.reinforcements.units) {
                    // Převod souřadnic ze scénáře na skutečné souřadnice mapy
                    const mapped = this.hexGrid.scenarioToMap(unitDef.col, unitDef.row);
                    this.spawnReinforcements({
                        turn: this.turnNumber,
                        type: unitDef.type,
                        position: [mapped.col, mapped.row],
                        count: 1
                    }, 'crusaders');
                }
            }
        }

        // Nový systém: posily na úrovni scénáře (více skupin)
        if (this.currentScenario.reinforcements) {
            for (const [key, reinf] of Object.entries(this.currentScenario.reinforcements)) {
                if (reinf.turn === this.turnNumber) {
                    const reinfKey = `reinf-scenario-${key}-${this.turnNumber}`;
                    if (!this.processedEvents.has(reinfKey)) {
                        this.processedEvents.add(reinfKey);

                        // Zobrazit zprávu
                        if (reinf.message) {
                            const title = i18n.t(reinf.faction === 'hussites'
                                ? 'messages.reinforcementsTitle'
                                : 'messages.enemyReinforcementsTitle');
                            this.showEventNotification(title, reinf.message);
                        }

                        // Vytvořit jednotky
                        for (const unitDef of reinf.units) {
                            // Převod souřadnic ze scénáře na skutečné souřadnice mapy
                            const mapped = this.hexGrid.scenarioToMap(unitDef.col, unitDef.row);
                            this.spawnReinforcements({
                                turn: this.turnNumber,
                                type: unitDef.type,
                                position: [mapped.col, mapped.row],
                                count: 1
                            }, reinf.faction || 'crusaders');
                        }
                    }
                }
            }
        }
    }

    // Vytvoření posil
    spawnReinforcements(reinf, faction) {
        const unitType = UnitTypes[reinf.type];
        if (!unitType) {
            console.error(`spawnReinforcements: Unknown unit type ${reinf.type}`);
            return;
        }

        // Najít volnou pozici poblíž zadané
        let spawnCol = reinf.position[0];
        let spawnRow = reinf.position[1];

        // Pokud je pozice obsazená, hledáme nejbližší volnou
        if (this.getUnitAt(spawnCol, spawnRow)) {
            const neighbors = this.hexGrid.getNeighbors(spawnCol, spawnRow);
            for (const n of neighbors) {
                if (!this.getUnitAt(n.col, n.row) && !this.hexGrid.isImpassable(n.col, n.row)) {
                    spawnCol = n.col;
                    spawnRow = n.row;
                    break;
                }
            }
        }

        const count = reinf.count || 1;
        for (let i = 0; i < count; i++) {
            const unit = this.unitFactory.createUnit(reinf.type, spawnCol, spawnRow);
            unit.faction = faction;
            unit.isReinforcement = true; // posily se nepočítají do přežití původní obrany
            this.units.push(unit);

            this.addLog(i18n.t('gameLog.reinforcements', {unit: unit.name}), 'turn');
        }

        this.updateArmyOverview();
        this.render();
    }

    clearEventNotifications() {
        this.eventNotificationQueue = [];
        if (this.eventNotificationTimer) {
            clearTimeout(this.eventNotificationTimer);
            this.eventNotificationTimer = null;
        }
        if (this.activeEventNotification) {
            this.activeEventNotification.remove();
            this.activeEventNotification = null;
        }
    }

    // Zařazení notifikace eventu. Jednotlivé zprávy se zobrazují sekvenčně,
    // aby se při více událostech v jednom kole nepřekrývaly.
    showEventNotification(title, text) {
        if (!text || this.gameState === 'destroyed') return;
        this.eventNotificationQueue.push({ title, text });
        this.showNextEventNotification();
    }

    showNextEventNotification() {
        if (this.activeEventNotification || this.eventNotificationQueue.length === 0 ||
            this.gameState === 'destroyed') return;

        const { title, text } = this.eventNotificationQueue.shift();
        const notification = document.createElement('div');
        notification.className = 'event-notification';
        const heading = document.createElement('h3');
        const body = document.createElement('p');
        const button = document.createElement('button');
        heading.textContent = title || '';
        body.textContent = text;
        button.textContent = i18n.t('menu.continue');
        notification.append(heading, body, button);

        document.body.appendChild(notification);
        this.activeEventNotification = notification;

        const closeNotification = () => {
            if (this.eventNotificationTimer) {
                clearTimeout(this.eventNotificationTimer);
                this.eventNotificationTimer = null;
            }
            notification.remove();
            if (this.activeEventNotification === notification) {
                this.activeEventNotification = null;
            }
            this.showNextEventNotification();
        };

        button.addEventListener('click', closeNotification, { once: true });
        this.eventNotificationTimer = setTimeout(closeNotification, 10000);
    }

    // ==========================================
    // OKNO PROTIÚTOKU - kolísání armád
    // ==========================================

    // Průměrná morálka živých jednotek frakce (0-100).
    // Prchající jednotky mají morálku nízkou, takže táhnou průměr dolů samy.
    getArmyMorale(faction) {
        const living = this.units.filter(u => u.faction === faction && u.health > 0);
        if (living.length === 0) return 0;
        let sum = 0;
        for (const u of living) {
            const max = u.maxMorale || 100;
            sum += Math.max(0, Math.min(100, (u.morale / max) * 100));
        }
        return Math.round(sum / living.length);
    }

    // Aktualizace stavu kolísání obou armád s hysterezí.
    // Pod WAVER_ENTER armáda začne kolísat → otevře se okno protiútoku.
    // Nad WAVER_EXIT se vzpamatuje → okno se zavře.
    // Volá se po každém útoku (combat) a po zpracování morálky na konci tahu.
    // Hystereze brání blikání stavu kolem prahu.
    updateWaveringState() {
        if (this.gameState !== 'playing' || this.isTutorial) return;

        const WAVER_ENTER = 40;
        const WAVER_EXIT = 55;
        const playerFaction = this.currentScenario?.playerFaction || 'hussites';

        for (const faction of ['hussites', 'crusaders']) {
            this.armyMorale[faction] = this.getArmyMorale(faction);

            const living = this.units.filter(u => u.faction === faction && u.health > 0);
            // Bez živých jednotek nemá kolísání smysl (hra stejně končí)
            if (living.length === 0) { this.wavering[faction] = false; continue; }

            const morale = this.armyMorale[faction];
            const wasWavering = this.wavering[faction];

            if (!wasWavering && morale < WAVER_ENTER) {
                this.wavering[faction] = true;
                this.onWaveringStart(faction, faction === playerFaction);
            } else if (wasWavering && morale > WAVER_EXIT) {
                this.wavering[faction] = false;
                this.onWaveringEnd(faction);
            }
        }
    }

    // Armáda začíná kolísat - okno protiútoku se otevírá
    onWaveringStart(faction, isPlayer) {
        const factionName = i18n.t(`factions.${faction}`);
        if (isPlayer) {
            const msg = i18n.t('gameLog.armyWaveringPlayer', { faction: factionName });
            this.addLog('⚠️ ' + msg, 'morale');
            this.showEventNotification('⚠️ ' + i18n.t('game.wavering'), msg);
            if (typeof Sound !== 'undefined' && Sound.playDefeat) Sound.playDefeat();
        } else {
            const msg = i18n.t('gameLog.armyWavering', { faction: factionName });
            this.addLog('⚔️ ' + msg, 'morale');
            this.showEventNotification('⚔️ ' + i18n.t('game.wavering'), msg);
            if (typeof Sound !== 'undefined' && Sound.playWagonFort) Sound.playWagonFort();
        }
    }

    // Armáda se vzpamatovala - okno protiútoku se zavřelo
    onWaveringEnd(faction) {
        const factionName = i18n.t(`factions.${faction}`);
        this.addLog(i18n.t('gameLog.armyRecovered', { faction: factionName }), 'morale');
    }

    startAnimationLoop() {
        if (this.animationLoop) return;

        const animate = () => {
            this.render();
            this.animationLoop = requestAnimationFrame(animate);
        };

        this.animationLoop = requestAnimationFrame(animate);
    }

    stopAnimationLoop() {
        if (this.animationLoop) {
            cancelAnimationFrame(this.animationLoop);
            this.animationLoop = null;
        }
    }

    setupTerrain() {
        // Lesy na levé straně (husitská strana)
        this.hexGrid.setTerrain(4, 2, 'forest');
        this.hexGrid.setTerrain(4, 3, 'forest');
        this.hexGrid.setTerrain(5, 2, 'forest');
        this.hexGrid.setTerrain(3, 8, 'forest');
        this.hexGrid.setTerrain(4, 8, 'forest');

        // Lesy uprostřed
        this.hexGrid.setTerrain(7, 1, 'forest');
        this.hexGrid.setTerrain(8, 1, 'forest');
        this.hexGrid.setTerrain(7, 8, 'forest');
        this.hexGrid.setTerrain(8, 8, 'forest');
        this.hexGrid.setTerrain(8, 9, 'forest');

        // Lesy na pravé straně
        this.hexGrid.setTerrain(11, 2, 'forest');
        this.hexGrid.setTerrain(10, 7, 'forest');
        this.hexGrid.setTerrain(11, 7, 'forest');

        // Kopce uprostřed - strategická pozice
        this.hexGrid.setTerrain(7, 4, 'hills');
        this.hexGrid.setTerrain(8, 4, 'hills');
        this.hexGrid.setTerrain(7, 5, 'hills');
        this.hexGrid.setTerrain(8, 5, 'hills');
        this.hexGrid.setTerrain(9, 5, 'hills');

        // Kopce na bocích
        this.hexGrid.setTerrain(5, 6, 'hills');
        this.hexGrid.setTerrain(6, 7, 'hills');
        this.hexGrid.setTerrain(10, 3, 'hills');
        this.hexGrid.setTerrain(11, 4, 'hills');

        // Města
        this.hexGrid.setTerrain(1, 4, 'town');  // Husitské město (zázemí)
        this.hexGrid.setTerrain(8, 3, 'town');  // Neutrální město uprostřed
        this.hexGrid.setTerrain(14, 4, 'town'); // Křižácké město (zázemí)

        // Řeka teče středem mapy
        this.hexGrid.setTerrain(6, 0, 'water');
        this.hexGrid.setTerrain(6, 1, 'water');
        this.hexGrid.setTerrain(5, 1, 'water');
        this.hexGrid.setTerrain(9, 6, 'water');
        this.hexGrid.setTerrain(9, 7, 'water');
        this.hexGrid.setTerrain(10, 8, 'water');
        this.hexGrid.setTerrain(10, 9, 'water');
    }

    setupEventListeners() {
        // Všechny listenery sdílí abort signál - destroy() je odebere najednou
        const signal = this.eventAbortController.signal;

        // Klik na canvas
        this.hexGrid.canvas.addEventListener('click', (e) => this.handleClick(e), { signal });

        // Hover pro tooltip
        this.hexGrid.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e), { signal });
        this.hexGrid.canvas.addEventListener('mouseleave', () => this.hideTooltip(), { signal });

        // Tlačítko konce tahu (s volitelným potvrzením z nastavení)
        document.getElementById('btn-end-turn').addEventListener('click', async () => {
            if (window.gameSettings && window.gameSettings.confirmEndTurn &&
                this.currentFaction === 'hussites' && this.gameState === 'playing' &&
                typeof showConfirmDialog === 'function') {
                const confirmed = await showConfirmDialog(
                    i18n.t('game.confirmEndTurnPrompt'),
                    i18n.t('game.endTurn')
                );
                if (!confirmed) return;
            }
            this.endTurn();
        }, { signal });

        // Klik na indikátor "Křižáci přemýšlí" zrychlí (přeskočí) animaci tahu AI.
        // Sticky: jakmile hráč klikne, AI tahy běží zrychleně až do konce bitvy.
        const aiThinking = document.getElementById('ai-thinking');
        if (aiThinking) {
            aiThinking.addEventListener('click', () => {
                if (this.currentFaction !== 'hussites' && !this.fastForwardAI) {
                    this.fastForwardAI = true;
                    aiThinking.classList.add('skipping');
                }
            }, { signal });
        }

        // Tlačítko útoku - zvýrazní platné cíle vybrané jednotky
        const attackBtn = document.getElementById('btn-attack');
        if (attackBtn) {
            attackBtn.addEventListener('click', () => {
                if (!this.selectedUnit || !this.selectedUnit.canAttack()) return;
                const targets = this.combatSystem.getValidAttackTargets(this.selectedUnit);
                this.hexGrid.setAttackable(targets);
                this.render();
                this.addLog(i18n.t('gameLog.selectAttackTarget'), 'combat');
            }, { signal });
        }

        // Tlačítko obrany
        document.getElementById('btn-defend').addEventListener('click', () => this.combatSystem.defendSelectedUnit(), { signal });

        // WP1: tlačítka vozové hradby - sepnout/rozevřít jeden vůz nebo celou linii
        const formationBtn = document.getElementById('btn-formation');
        if (formationBtn) {
            formationBtn.addEventListener('click', () => {
                if (this.selectedUnit) this.toggleWagonFormation(this.selectedUnit);
            }, { signal });
        }
        const formationLineBtn = document.getElementById('btn-formation-line');
        if (formationLineBtn) {
            formationLineBtn.addEventListener('click', () => {
                if (this.selectedUnit) this.toggleWagonFormationLine(this.selectedUnit);
            }, { signal });
        }
        // P4: pochod hradby (přepnout linii mezi pevnou zdí a pochodovým šikem)
        const formationMarchBtn = document.getElementById('btn-formation-march');
        if (formationMarchBtn) {
            formationMarchBtn.addEventListener('click', () => {
                if (this.selectedUnit) this.toggleWagonMarch(this.selectedUnit);
            }, { signal });
        }

        // Tlačítko undo (vrátit pohyb)
        document.getElementById('btn-undo').addEventListener('click', () => this.undoLastMove(), { signal });

        // Tlačítko chorálu
        const choralBtn = document.getElementById('btn-choral');
        if (choralBtn) {
            choralBtn.addEventListener('click', () => this.activateChoral(), { signal });
        }

        // Tlačítko nové hry ze starého victory modalu (pro zpětnou kompatibilitu)
        const oldNewGameBtn = document.getElementById('btn-new-game');
        if (oldNewGameBtn) {
            oldNewGameBtn.addEventListener('click', () => {
                document.getElementById('victory-modal').classList.add('hidden');
                // Pokusit se vrátit do hlavního menu
                if (typeof window.returnToMainMenu === 'function') {
                    window.returnToMainMenu();
                } else {
                    this.initGame();
                }
            }, { signal });
        }

        // Reference na tooltip element
        this.tooltip = document.getElementById('tooltip');
        this.lastHoveredHex = null;
        this.lastTooltipContent = null; // Cache pro obsah tooltipu
    }

    handleMouseMove(event) {
        const rect = this.hexGrid.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const hex = this.hexGrid.pixelToHex(x, y);

        if (!hex) {
            this.hideTooltip();
            return;
        }

        // Kontrola, zda jsme na stejném hexu
        if (this.lastHoveredHex &&
            this.lastHoveredHex.col === hex.col &&
            this.lastHoveredHex.row === hex.row) {
            // Tooltip již je zobrazen, není potřeba jej aktualizovat
            return;
        }

        this.lastHoveredHex = hex;
        this.showTooltip(hex, event.clientX, event.clientY);
    }

    showTooltip(hex, mouseX, mouseY) {
        // Mlha války: neprozkoumaný hex neprozrazuje vůbec nic
        if (this.fogOfWar && !this.fogOfWarSystem.isHexExplored(hex.col, hex.row)) {
            this.hideTooltip();
            return;
        }

        let unit = this.getUnitAt(hex.col, hex.row);
        // Nepřítel skrytý v mlze se v tooltipu chová, jako by tam nebyl
        if (unit && !this.fogOfWarSystem.isEnemyVisible(unit)) {
            unit = null;
        }
        const terrain = this.hexGrid.getTerrain(hex.col, hex.row);

        let html = '';

        if (unit) {
            const factionName = i18n.t(`factions.${unit.faction}`);
            const healthPercent = Math.round((unit.health / unit.maxHealth) * 100);

            // Získej viditelnost jednotky
            const visionRange = this.fogOfWarSystem.getUnitSightRange(unit);

            html = `
                <div class="tooltip-title">${unit.name}</div>
                <div class="tooltip-faction">${factionName}</div>
                <div class="tooltip-stats">
                    <div class="tooltip-stat"><span class="label">HP:</span> ${unit.health}/${unit.maxHealth}</div>
                    <div class="tooltip-stat"><span class="label">${i18n.t('help.unitStats.attack')}:</span> ${unit.attack}</div>
                    <div class="tooltip-stat"><span class="label">${i18n.t('help.unitStats.defense')}:</span> ${unit.defense}</div>
                    <div class="tooltip-stat"><span class="label">${i18n.t('help.unitStats.range')}:</span> ${unit.special === 'reach' && unit.range === 1 ? '1-2' : unit.range}</div>
                    <div class="tooltip-stat"><span class="label">${i18n.t('help.unitStats.movement')}:</span> ${unit.movement}</div>
                    <div class="tooltip-stat"><span class="label">👁 ${i18n.t('tooltip.visibility')}:</span> ${visionRange}</div>
                </div>
            `;

            // Speciální schopnost (přeskočíme commander - ten má vlastní sekci)
            if (unit.special && unit.special !== 'commander') {
                const specialKey = `special.${unit.special}`;
                const specialName = i18n.hasTranslation(specialKey) ? i18n.t(specialKey) : unit.special;
                html += `<div class="tooltip-special">${specialName}</div>`;
            }

            // Velitel - speciální zobrazení
            if (unit.special === 'commander' || unit.unitClass === 'commander') {
                html += `<div class="tooltip-special" style="color: #ffd700;">👑 ${i18n.t('tooltip.commander')}</div>`;
            } else {
                // Aura velitele - jednotka v dosahu spřáteleného velitele dostává bonus
                const aura = this.getCommanderBonuses(unit);
                if (aura && (aura.attack || aura.defense || aura.morale)) {
                    const parts = [];
                    if (aura.attack) parts.push(i18n.t('tooltip.attackBonus', { value: aura.attack }));
                    if (aura.defense) parts.push(i18n.t('tooltip.defenseBonus', { value: aura.defense }));
                    if (aura.morale) parts.push(i18n.t('tooltip.moraleBonus', { value: aura.morale }));
                    html += `<div class="tooltip-bonus">👑 ${i18n.t('tooltip.inAura')}: ${aura.commander} (${parts.join(', ')})</div>`;
                }
            }

            if (unit.isDefending) {
                html += `<div class="tooltip-bonus">${i18n.t('tooltip.defensiveStance')}</div>`;
            }

            if (unit.isTerrified) {
                html += `<div class="tooltip-debuff">${i18n.t('tooltip.terrified')}</div>`;
            }

            // Morálka
            html += `<div class="tooltip-morale" style="margin-top: 5px; padding-top: 5px; border-top: 1px solid #444;">
                <span class="label">${i18n.t('game.moraleLabel')}:</span>
                <span style="color: ${unit.getMoraleColor()}">${unit.getMoraleStatus()} (${Math.round(unit.morale)}%)</span>
            </div>`;

            if (unit.isRouting) {
                html += `<div class="tooltip-debuff" style="color: #ff4444; font-weight: bold;">🏃 ${i18n.t('tooltip.routing')}</div>`;
            }

            // Informace o zbývajících útocích pro rapidFire
            if (unit.special === 'rapidFire' && unit.attackCount > 0 && unit.attackCount < 2) {
                html += `<div class="tooltip-info">${i18n.t('tooltip.attacksRemaining', { count: 2 - unit.attackCount })}</div>`;
            }

            // Náhled šancí při útoku - pokud je vybraná jednotka a toto je nepřítel
            if (this.selectedUnit && this.selectedUnit.faction !== unit.faction) {
                const p = this.combatSystem.calculateDamagePreview(this.selectedUnit, unit);
                if (p) {
                    const dmg = p.min === p.max ? `${p.min}` : `${p.min} - ${p.max}`;
                    let killLine = '';
                    if (p.killsCertain) {
                        killLine = `<div class="damage-range" style="color: #ff6b6b; font-weight: bold;">💀 ${i18n.t('tooltip.killsTarget')}</div>`;
                    } else if (p.killsPossible) {
                        killLine = `<div class="damage-range" style="color: #ffb86b;">${i18n.t('tooltip.mayKill')}</div>`;
                    }
                    let counterLine = '';
                    if (p.counter) {
                        const c = p.counter.min === p.counter.max ? `${p.counter.min}` : `${p.counter.min} - ${p.counter.max}`;
                        const counterKill = p.counter.killsAttackerCertain
                            ? ` <span style="color: #ff6b6b; font-weight: bold;">${i18n.t('tooltip.attackerFalls')}</span>`
                            : (p.counter.killsAttackerPossible ? ` <span style="color: #ffb86b;">${i18n.t('tooltip.deathRisk')}</span>` : '');
                        counterLine = `<div class="damage-range" style="color: #ff9999;">↩️ ${i18n.t('tooltip.counterattack', { damage: c })}${counterKill}</div>`;
                    }
                    html += `
                        <div class="tooltip-damage-preview">
                            <div class="damage-title">⚔️ ${i18n.t('tooltip.damageEstimate')}</div>
                            <div class="damage-value">${dmg} HP</div>
                            ${killLine}
                            ${counterLine}
                        </div>
                    `;
                }
            }
        }

        // Přidat info o terénu
        const hasFrozenRiver = this.currentScenario?.specialMechanics?.frozenRiver;

        const terrainNames = {
            plains: i18n.t('terrain.plains'),
            forest: i18n.t('terrain.forest'),
            hills: i18n.t('terrain.hills'),
            water: hasFrozenRiver ? i18n.t('tooltip.frozenRiver') : i18n.t('terrain.water'),
            town: i18n.t('terrain.town'),
            road: i18n.t('terrain.road'),
            road2: i18n.t('terrain.road'),
            dam: i18n.t('terrain.dam'),
            mud: i18n.t('terrain.mud'),
            swamp: i18n.hasTranslation('terrain.swamp') ? i18n.t('terrain.swamp') : i18n.t('terrain.mud'),
            slope: i18n.t('terrain.slope'),
            trenches: i18n.t('terrain.trenches'),
            church: i18n.t('terrain.church')
        };

        const terrainBonuses = {
            plains: '',
            forest: i18n.t('tooltip.defenseModifier', { value: '+20' }),
            hills: i18n.t('tooltip.defenseModifier', { value: '+30' }),
            water: hasFrozenRiver ? i18n.t('tooltip.thinIce') : i18n.t('tooltip.impassable'),
            town: i18n.t('tooltip.defenseModifier', { value: '+40' }),
            road: i18n.t('tooltip.fastMovement'),
            road2: i18n.t('tooltip.fastMovement'),
            dam: i18n.t('tooltip.defenseModifier', { value: '+20' }),
            mud: i18n.t('tooltip.slows'),
            swamp: `${i18n.t('tooltip.slows')}, ${i18n.t('tooltip.defenseModifier', { value: '+10' })}`,
            slope: i18n.t('tooltip.defenseModifier', { value: '+10' }),
            trenches: i18n.t('tooltip.defenseModifier', { value: '+30' }),
            church: i18n.t('tooltip.defenseModifier', { value: '+20' })
        };

        // Najdi map label pro tento hex
        const mapLabel = (this.hexGrid.mapLabels || []).find(l =>
            l.hexes && l.hexes.some(([c, r]) => c === hex.col && r === hex.row)
        );
        const locationName = mapLabel ? mapLabel.text : null;

        // Terénní modifikátory KONKRÉTNÍ jednotky (skutečná čísla, co počítá souboj),
        // ne generická. U střelců z kopce se tím ukáže i útočný bonus z výšiny.
        let terrainLines;
        if (unit) {
            const tDef = Math.round(unit.getTerrainDefenseBonus(terrain) * 100);
            const tAtk = Math.round(unit.getTerrainAttackBonus(terrain) * 100);
            const line = (val, key, extra = '') => !val ? '' :
                `<div class="tooltip-bonus"${val < 0 ? ' style="color: #b02323"' : ''}>${i18n.t(key, { value: val > 0 ? `+${val}` : val })}${extra}</div>`;
            const highGround = (terrain === 'hills' || terrain === 'slope') && tAtk > 0 && unit.isRanged();
            const moveNote = { road: i18n.t('tooltip.fastMovement'), road2: i18n.t('tooltip.fastMovement'),
                mud: i18n.t('tooltip.slows'), swamp: i18n.t('tooltip.slows'), slope: i18n.t('tooltip.slows'),
                water: hasFrozenRiver ? i18n.t('tooltip.thinIce') : i18n.t('tooltip.impassable') }[terrain];
            terrainLines = line(tDef, 'tooltip.defenseModifier')
                + line(tAtk, 'tooltip.attackModifier', highGround ? i18n.t('tooltip.highGroundSuffix') : '')
                + (moveNote ? `<div class="tooltip-bonus" style="color: #6b5c38">${moveNote}</div>` : '');
        } else {
            terrainLines = terrainBonuses[terrain] ? `<div class="tooltip-bonus">${terrainBonuses[terrain]}</div>` : '';
        }

        html += `
            <div class="tooltip-terrain">
                <strong>${locationName || terrainNames[terrain] || terrain}</strong>
                ${terrainLines}
            </div>
        `;

        // Aktualizovat tooltip jen pokud se obsah změnil (optimalizace pro animationLoop)
        if (html !== this.lastTooltipContent) {
            this.tooltip.innerHTML = html;
            this.lastTooltipContent = html;
        }

        this.tooltip.classList.remove('hidden');
        this.positionTooltip(mouseX, mouseY);
    }

    positionTooltip(mouseX, mouseY) {
        const mapContainer = document.getElementById('map-container');
        const containerRect = mapContainer.getBoundingClientRect();

        // Větší offset od kurzoru pro lepší stabilitu
        const offset = 20;

        // Pozice relativní k map-container + scroll offset
        let left = mouseX - containerRect.left + mapContainer.scrollLeft + offset;
        let top = mouseY - containerRect.top + mapContainer.scrollTop + offset;

        // Kontrola přetečení (relativně k viditelné oblasti)
        const tooltipRect = this.tooltip.getBoundingClientRect();
        if (mouseX + tooltipRect.width + offset > containerRect.right) {
            left = mouseX - containerRect.left + mapContainer.scrollLeft - tooltipRect.width - offset;
        }
        if (mouseY + tooltipRect.height + offset > containerRect.bottom) {
            top = mouseY - containerRect.top + mapContainer.scrollTop - tooltipRect.height - offset;
        }

        this.tooltip.style.left = `${left}px`;
        this.tooltip.style.top = `${top}px`;
    }

    hideTooltip() {
        this.tooltip.classList.add('hidden');
        this.lastHoveredHex = null;
        this.lastTooltipContent = null; // Vyčistit cache
    }

    handleClick(event) {
        if (this.gameState !== 'playing') return;
        if (this.currentFaction !== 'hussites') return; // Blokace během tahu AI

        const rect = this.hexGrid.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const hex = this.hexGrid.pixelToHex(x, y);
        if (!hex) return;

        const clickedUnit = this.getUnitAt(hex.col, hex.row);

        // Pokud máme vybranou jednotku
        if (this.selectedUnit) {
            // Klik na nepřátelskou jednotku v dosahu - útok
            if (clickedUnit && clickedUnit.faction !== this.currentFaction) {
                if (this.combatSystem.canAttack(this.selectedUnit, clickedUnit)) {
                    this.combatSystem.performAttack(this.selectedUnit, clickedUnit);
                    return;
                } else {
                    Sound.playInvalid();
                }
            }

            // P4: skupinový pochod - klik na sousední hex se sepnutou POCHODOVOU
            // hradbou posune celou linii tím směrem (místo pohybu jediného vozu).
            if (!clickedUnit && this.selectedUnit.isWagon() && this.selectedUnit.marching &&
                this.selectedUnit.formationClosed && !this.selectedUnit.hasMoved) {
                const dir = this.hexGrid.directionTo(this.selectedUnit.col, this.selectedUnit.row, hex.col, hex.row);
                if (dir !== -1) {
                    this.marchWagonLine(this.selectedUnit, dir);
                    return;
                }
            }

            // Klik na prázdný hex v dosahu pohybu
            if (!clickedUnit && this.canMoveTo(this.selectedUnit, hex.col, hex.row)) {
                this.moveUnit(this.selectedUnit, hex.col, hex.row);
                return;
            }

            // Klik na stejnou jednotku - zrušení výběru
            if (clickedUnit === this.selectedUnit) {
                this.deselectUnit();
                return;
            }
        }

        // Klik na vlastní jednotku - výběr
        if (clickedUnit && clickedUnit.faction === this.currentFaction && clickedUnit.canAct()) {
            this.selectUnit(clickedUnit);
        } else {
            this.deselectUnit();
        }
    }

    selectUnit(unit) {
        this.selectedUnit = unit;
        this.hexGrid.setSelected(unit.col, unit.row);

        // Tutoriál - trigger výběru jednotky
        if (this.isTutorial) {
            this.tutorialSystem.triggerTutorialEvent('unit_selected', { unit });
        }

        // Zvuk výběru
        Sound.playSelect();

        // Zobrazení možných pohybů
        if (unit.canMove()) {
            const moveRange = this.getValidMoves(unit);
            this.hexGrid.setHighlighted(moveRange);
        }

        // Zobrazení možných cílů útoku
        if (unit.canAttack()) {
            const attackTargets = this.combatSystem.getValidAttackTargets(unit);
            this.hexGrid.setAttackable(attackTargets);
        }

        this.updateUnitPanel(unit);
        this.render();
    }

    deselectUnit() {
        this.selectedUnit = null;
        this.hexGrid.setSelected(null, null);
        this.hexGrid.clearHighlights();
        this.updateUnitPanel(null);
        this.render();
    }

    // Výběr další jednotky která může jednat (klávesa Tab)
    selectNextUnit() {
        // Získej všechny jednotky hráče které můžou jednat
        const actableUnits = this.units.filter(u =>
            u.faction === this.currentFaction &&
            u.health > 0 &&
            u.canAct()
        );

        if (actableUnits.length === 0) {
            // Žádná jednotka nemůže jednat
            this.deselectUnit();
            return;
        }

        // Najdi index aktuálně vybrané jednotky
        let currentIndex = -1;
        if (this.selectedUnit) {
            currentIndex = actableUnits.findIndex(u => u === this.selectedUnit);
        }

        // Vyber další jednotku (cyklicky)
        const nextIndex = (currentIndex + 1) % actableUnits.length;
        const nextUnit = actableUnits[nextIndex];

        this.selectUnit(nextUnit);

        // Vycentruj pohled na vybranou jednotku
        this.centerOnUnit(nextUnit);
    }

    // Vycentrování pohledu na jednotku
    centerOnUnit(unit) {
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer || !unit) return;

        requestAnimationFrame(() => {
            const pos = this.hexGrid.hexToPixel(unit.col, unit.row);
            const containerWidth = mapContainer.clientWidth;
            const containerHeight = mapContainer.clientHeight;
            const maxLeft = Math.max(0, this.hexGrid.canvas.width - containerWidth);
            const maxTop = Math.max(0, this.hexGrid.canvas.height - containerHeight);

            mapContainer.scrollLeft = Math.max(0, Math.min(maxLeft, pos.x - containerWidth / 2));
            mapContainer.scrollTop = Math.max(0, Math.min(maxTop, pos.y - containerHeight / 2));
        });
    }

    getUnitAt(col, row) {
        return this.units.find(u => u.col === col && u.row === row && u.health > 0);
    }

    // Získání validních pohybů pomocí BFS (jednotky nemohou procházet skrz sebe)
    // Cena vstupu na hex podle terénu (v pohybových bodech).
    // Jízda platí v těžkém terénu přirážku - lekce ze Sudoměře: rytíř
    // v bahně udělá hex za kolo, zatímco cepník projde
    getTerrainMoveCost(terrain, unit) {
        const baseCosts = {
            forest: 2,
            hills: 2,
            slope: 2,
            mud: 2,
            swamp: 3
        };
        let cost = baseCosts[terrain] || 1;
        if (unit.isCavalry && unit.isCavalry() &&
            (terrain === 'mud' || terrain === 'swamp' || terrain === 'forest')) {
            cost += 1;
        }
        return cost;
    }

    getValidMoves(unit) {
        // Obrana proti budoucím voláním, co zapomenou zkontrolovat canMove()
        // (řešilo se per-call-site u AI/hráče, ale sepnutý vůz nemá pohybovat
        // ani při pozdějším přidaném volání, které na to zapomene)
        if (!unit.canMove()) return [];

        // P4: pochodová hradba se hýbe jako SKUPINA - platné cíle jsou směry, kam
        // se posune celá linie (ne kam dojde jeden vůz). Vrať skupinové cíle.
        if (unit.isWagon() && unit.marching && unit.formationClosed) {
            return this.getWagonMarchTargets(unit);
        }

        const range = unit.movement;

        // Dijkstra s terénními cenami (dřív uniformní BFS - bahno, les
        // i bažina stály 1 a tooltip "Zpomaluje" byl planý slib)
        const startKey = `${unit.col},${unit.row}`;
        const best = new Map([[startKey, 0]]);   // klíč -> nejnižší cena dosažení
        const endable = new Set();               // hexy, kde smí pohyb skončit
        const queue = [{ col: unit.col, row: unit.row, cost: 0 }];

        while (queue.length > 0) {
            // Výběr uzlu s nejnižší cenou (mapy jsou malé, sort stačí)
            queue.sort((a, b) => a.cost - b.cost);
            const current = queue.shift();
            const currentKey = `${current.col},${current.row}`;
            if (current.cost > best.get(currentKey)) continue; // zastaralý záznam

            if (current.cost >= range) continue;

            const neighbors = this.hexGrid.getNeighbors(current.col, current.row);

            for (const neighbor of neighbors) {
                // Kontrola, zda je pole platné
                if (neighbor.col < 0 || neighbor.col >= this.hexGrid.cols ||
                    neighbor.row < 0 || neighbor.row >= this.hexGrid.rows) continue;

                const terrain = this.hexGrid.getTerrain(neighbor.col, neighbor.row);

                // Voda - normálně neprůchodná, ale zamrzlá řeka (frozenRiver) je průchodná
                if (terrain === 'water') {
                    if (this.currentScenario && this.currentScenario.specialMechanics &&
                        this.currentScenario.specialMechanics.frozenRiver) {
                        // Zamrzlá řeka - průchodná, ale nebezpečná (řeší se v moveUnit)
                    } else {
                        continue;
                    }
                }

                // Bridge bottleneck - jen 1 jednotka za tah přes most
                if (this.currentScenario && this.currentScenario.specialMechanics &&
                    this.currentScenario.specialMechanics.bridgeBottleneck) {
                    const bridgePos = this.currentScenario.specialMechanics.bridgeBottleneck.position;
                    if (bridgePos && neighbor.col === bridgePos[0] && neighbor.row === bridgePos[1]) {
                        if (this.bridgeUsedThisTurn) continue;
                    }
                }

                const stepCost = this.getTerrainMoveCost(terrain, unit);

                // Garance jednoho kroku: na hex sousedící s výchozí pozicí
                // se jednotka dostane vždy, i když na něj "nemá" body
                // (jinak by pomalá jednotka před bažinou zamrzla na místě)
                const newCost = current.cost === 0
                    ? Math.min(stepCost, range)
                    : current.cost + stepCost;
                if (newCost > range) continue;

                const key = `${neighbor.col},${neighbor.row}`;
                if (newCost >= (best.get(key) ?? Infinity)) continue;
                best.set(key, newCost);

                // Kontrola, zda je pole obsazené
                const unitAtHex = this.getUnitAt(neighbor.col, neighbor.row);

                if (unitAtHex) {
                    // Přes spojence lze projít (ale ne skončit), přes nepřátele vůbec
                    if (unitAtHex.faction === unit.faction) {
                        queue.push({ col: neighbor.col, row: neighbor.row, cost: newCost });
                    }
                    continue;
                }

                // Prázdné pole - lze tam skončit
                endable.add(key);

                // ZOC (Zone of Control) - v nepřátelské zóně pohyb KONČÍ
                if (!this.isHexInEnemyZOC(neighbor.col, neighbor.row, unit.faction)) {
                    queue.push({ col: neighbor.col, row: neighbor.row, cost: newCost });
                }
            }
        }

        return [...endable].map(key => {
            const [col, row] = key.split(',').map(Number);
            return { col, row };
        });
    }

    // Kontrola, zda je hex v zóně kontroly nepřátelské jednotky
    isHexInEnemyZOC(col, row, friendlyFaction) {
        const neighbors = this.hexGrid.getNeighbors(col, row);

        for (const neighbor of neighbors) {
            const unitAtHex = this.getUnitAt(neighbor.col, neighbor.row);
            if (unitAtHex && unitAtHex.faction !== friendlyFaction && unitAtHex.health > 0) {
                // Zkontrolujeme, zda má jednotka ZOC
                const unitType = UnitTypes[unitAtHex.type];
                if (unitType && unitType.tactics && unitType.tactics.zoc === true) {
                    return true;
                }
            }
        }

        return false;
    }

    canMoveTo(unit, col, row) {
        if (!unit.canMove()) return false;

        const moves = this.getValidMoves(unit);
        return moves.some(m => m.col === col && m.row === row);
    }

    moveUnit(unit, col, row) {
        const oldCol = unit.col;
        const oldRow = unit.row;

        // Uložení pozice pro možnost undo (pouze pokud jednotka ještě neútočila)
        if (!unit.hasAttacked) {
            this.lastMove = {
                unit: unit,
                fromCol: oldCol,
                fromRow: oldRow
            };
        }

        // Zvuk pohybu podle typu jednotky
        if (unit.type === 'JIZDA_HUSITI' || unit.type === 'TEZKA_JIZDA') {
            Sound.playHorse();
        } else if (unit.type === 'VOZOVA_HRADBA') {
            Sound.playWagonFort();
        } else {
            Sound.playMove();
        }

        unit.moveTo(col, row);

        this.addLog(i18n.t('gameLog.moved', {unit: unit.name, oldCol, oldRow, col, row}), 'move');

        // Označení mostu jako použitého (bridge bottleneck)
        if (this.currentScenario && this.currentScenario.specialMechanics &&
            this.currentScenario.specialMechanics.bridgeBottleneck) {
            const bridgePos = this.currentScenario.specialMechanics.bridgeBottleneck.position;
            if (bridgePos && col === bridgePos[0] && row === bridgePos[1]) {
                this.bridgeUsedThisTurn = true;
            }
        }

        // Kontrola zamrzlé řeky - těžké jednotky riskují propadnutí
        if (this.checkFrozenRiver(unit)) {
            return; // Jednotka se propadla
        }

        // Kontrola escape zóny
        if (this.checkEscapeZone(unit)) {
            return; // Jednotka unikla, nepokračujeme
        }

        // Overwatch: nepřátelští střelci, kteří drželi pozici i palbu,
        // reagují na pohyb v dostřelu
        this.triggerOverwatch(unit);
        if (unit.health <= 0) {
            // Jednotku srazila reakční palba - nepokračujeme
            this.deselectUnit();
            this.updateUnitPanel(null);
            this.render();
            this.victoryConditionsSystem.checkVictory();
            return;
        }

        // Pokud může ještě útočit, zobrazíme cíle
        if (unit.canAttack()) {
            this.hexGrid.setSelected(unit.col, unit.row);
            this.hexGrid.setHighlighted([]);
            const attackTargets = this.combatSystem.getValidAttackTargets(unit);
            this.hexGrid.setAttackable(attackTargets);
        } else {
            this.deselectUnit();
        }

        // Tutoriál - trigger pohybu jednotky
        if (this.isTutorial) {
            this.tutorialSystem.triggerTutorialEvent('unit_moved', { unit, col, row });
        }

        this.updateUnitPanel(unit);
        this.render();
        this.victoryConditionsSystem.checkVictory();
    }

    // Overwatch (krycí palba): střelci s dosahem 2+, kteří ve svém tahu
    // nehnuli ani nevystřelili, automaticky pálí na nepřítele, který se
    // pohne v jejich dostřelu. Zadržený výstřel - canAttack() hlídá,
    // že jednotka střílí jen jednou za kolo (aktivně NEBO reakčně).
    // Síla vozové hradby: přiblížit se k ní něco stojí už cestou.
    triggerOverwatch(movedUnit) {
        if (!movedUnit || movedUnit.health <= 0) return;

        const watcherFaction = movedUnit.faction === 'hussites' ? 'crusaders' : 'hussites';
        const watchers = this.units.filter(u =>
            u.faction === watcherFaction &&
            u.health > 0 &&
            u.range >= 2 &&
            !u.hasMoved &&
            u.canAttack()
        );

        for (const watcher of watchers) {
            if (movedUnit.health <= 0) break; // cíl už padl

            const dist = this.hexGrid.getDistance(watcher.col, watcher.row, movedUnit.col, movedUnit.row);
            if (dist < 1 || dist > watcher.range) continue;

            // Mlha války: na neviditelný cíl se nestřílí
            if (watcher.faction === 'hussites' &&
                !this.fogOfWarSystem.isEnemyVisible(movedUnit)) continue;

            this.addLog(i18n.t('gameLog.overwatchFire', { unit: watcher.name, target: movedUnit.name }), 'combat');
            this.combatSystem.performAttack(watcher, movedUnit);
        }
    }

    // Kontrola, zda jednotka vstoupila do escape zóny
    checkEscapeZone(unit) {
        if (!this.currentScenario) return false;
        const conditions = this.currentScenario.victoryConditions;
        if (!conditions || !conditions.primary || conditions.primary.type !== 'escape') return false;

        const escapeZone = conditions.primary.escapeZone || [];
        const playerFaction = this.currentScenario.playerFaction || 'hussites';

        // Jen hráčské jednotky mohou uniknout
        if (unit.faction !== playerFaction) return false;

        // Je jednotka v escape zóně?
        const inZone = escapeZone.some(([col, row]) => unit.col === col && unit.row === row);
        if (!inZone) return false;

        // Jednotka unikla!
        this.escapedUnits = (this.escapedUnits || 0) + 1;
        const required = conditions.primary.unitsRequired || 5;
        this.addLog(i18n.t('gameLog.escaped', {unit: unit.name, escaped: this.escapedUnits, required}), 'turn');

        // Odstranit jednotku z mapy
        this.units = this.units.filter(u => u !== unit);
        this.deselectUnit();
        this.render();

        // Kontrola vítězství
        if (this.escapedUnits >= required) {
            this.addLog(i18n.t('gameLog.escapeSuccess'), 'turn');
            this.showVictory(playerFaction);
        }

        return true;
    }

    // Kontrola zamrzlé řeky - těžké jednotky mohou propadnout ledem
    checkFrozenRiver(unit) {
        if (!this.currentScenario || !this.currentScenario.specialMechanics) return false;
        if (!this.currentScenario.specialMechanics.frozenRiver) return false;

        const terrain = this.hexGrid.getTerrain(unit.col, unit.row);
        if (terrain !== 'water') return false;

        // Těžké jednotky (jízda, vozy) mají šanci propadnout
        const isHeavy = unit.isCavalry() || unit.isWagon() || unit.type === 'TEZKY_RYTIR' || unit.type === 'TEZKOODENCI';
        const drownChance = isHeavy ? 0.4 : 0.1; // 40% pro těžké, 10% pro lehké

        if (Math.random() < drownChance) {
            this.addLog(i18n.t('gameLog.iceBroke', {unit: unit.name}), 'combat');
            this.showEventNotification(
                i18n.t('messages.iceBreakTitle'),
                i18n.t('messages.iceBreakText', { unit: unit.name })
            );
            unit.health = 0;
            this.units = this.units.filter(u => u !== unit);
            this.trackUnitDeath(unit, null);
            this.handleUnitDeath(unit, null);
            this.deselectUnit();
            this.render();
            this.victoryConditionsSystem.checkVictory();
            return true;
        } else {
            this.addLog(i18n.t('gameLog.iceCrossed', {unit: unit.name}), 'move');
            return false;
        }
    }


    // Vrácení posledního pohybu (undo)
    undoLastMove() {
        if (!this.lastMove) return false;

        const { unit, fromCol, fromRow } = this.lastMove;

        // Kontrola, že jednotka ještě neprovedla útok
        if (unit.hasAttacked) {
            this.lastMove = null;
            return false;
        }

        // Vrácení jednotky na původní pozici
        unit.col = fromCol;
        unit.row = fromRow;
        unit.hasMoved = false;

        this.addLog(i18n.t('gameLog.unitReturned', {unit: unit.name, col: fromCol, row: fromRow}), 'move');

        // Vymazání undo
        this.lastMove = null;

        // Znovu vybrat jednotku
        this.selectUnit(unit);

        Sound.playSelect();
        this.render();

        return true;
    }

    // Kontrola, zda je možné provést undo
    canUndo() {
        if (!this.lastMove) return false;
        const { unit } = this.lastMove;
        // Undo je možné pouze pokud jednotka neprovedla útok
        return !unit.hasAttacked && unit.health > 0;
    }



    endTurn() {
        // Pokud hra již skončila, neděláme nic
        if (this.gameState !== 'playing') return;

        this.deselectUnit();

        // Reset undo při přepnutí tahu
        this.lastMove = null;

        Sound.playEndTurn();

        // Tutoriál - trigger konce tahu
        if (this.isTutorial) {
            this.tutorialSystem.triggerTutorialEvent('turn_ended');
        }

        // Přepnutí strany
        if (this.currentFaction === 'hussites') {
            this.currentFaction = 'crusaders';
            this.addLog(i18n.t('gameLog.turnCrusaders'), 'turn');
            Sound.playAITurn();
        } else {
            this.currentFaction = 'hussites';
            this.turnNumber++;
            this.addLog(i18n.t('gameLog.turnNumber', {turn: this.turnNumber}), 'turn');
            this.addLog(i18n.t('gameLog.turnHussites'), 'turn');
            Sound.playPlayerTurn();

            // Tutoriál - trigger začátku kola
            if (this.isTutorial) {
                this.tutorialSystem.triggerTutorialEvent(`turn_${this.turnNumber}_start`);
            }

            // Aktualizace fáze a kontrola eventů na začátku nového kola
            this.updatePhase();
            this.checkPhaseEvents();

            // Kontrola posil
            this.checkReinforcements();

            // Po příchodu posil - okamžitá kontrola podmínky přežití
            if (this.currentScenario && this.currentScenario.victoryConditions) {
                const primaryType = this.currentScenario.victoryConditions.primary?.type;
                if (primaryType === 'survive' || primaryType === 'survive_turns' || primaryType === 'breakthrough') {
                    this.victoryConditionsSystem.checkScenarioVictoryConditions();
                    if (this.gameState !== 'playing') {
                        this.updateUI();
                        this.render();
                        return;
                    }
                }
            }

            // Kontrola limitu tahů ve scénáři
            if (this.currentScenario && this.currentScenario.maxTurns) {
                if (this.turnNumber > this.currentScenario.maxTurns) {
                    // Čas vypršel - zkontrolovat vítězné podmínky
                    this.victoryConditionsSystem.checkScenarioVictoryConditions();
                    return;
                }
            }
        }

        // Reset jednotek aktuální frakce
        for (const unit of this.units) {
            if (unit.faction === this.currentFaction && unit.health > 0) {
                unit.resetTurn();
            }
        }

        // Reset bridge bottleneck pro novou frakci
        this.bridgeUsedThisTurn = false;

        // Aplikace velitelských aur (bonusy/postihy na začátku tahu)
        this.applyCommanderAuras();

        // Reset průlomu vozové hradby
        this.resetBreachedWagons();

        // Aplikace efektů obklíčení
        this.applySurroundedEffects();

        // Zpracování morálky - vypnuto v tutoriálu
        if (!this.isTutorial) {
            // Zpracování prchajících jednotek na konci tahu
            this.moraleSystem.processRoutingUnits();
            this.victoryConditionsSystem.checkVictory();
            if (this.gameState !== 'playing') return;

            // Kontrola šíření paniky při morálním zlomu
            this.moraleSystem.checkRoutSpread();

            // Pasivní regenerace morálky pro jednotky které neprchají
            this.moraleSystem.regenerateMorale();

            // Okno protiútoku - po zpracování morálky přehodnotit kolísání
            // (zachytí jak nový zlom z kaskády útěků, tak vzpamatování z regenerace)
            this.updateWaveringState();
        }

        // Pasivní regenerace zdraví (u vozů/města)
        this.regenerateHealth();

        // Aktualizace chorálu
        this.updateChoral();

        // Kontrola dual_objective pozic (na konci husitského tahu)
        if (this.currentFaction === 'crusaders') {
            this.victoryConditionsSystem.checkDualObjectiveProgress();
        }

        // Kontrola primary victory conditions (pro typy s časovým limitem)
        if (this.currentFaction === 'crusaders' && this.currentScenario && this.currentScenario.victoryConditions) {
            const primaryType = this.currentScenario.victoryConditions.primary?.type;
            // survive, hold_position, survive_turns mají vnitřní stráž na kola
            if (primaryType === 'survive' || primaryType === 'hold_position' || primaryType === 'survive_turns' || primaryType === 'breakthrough') {
                this.victoryConditionsSystem.checkScenarioVictoryConditions();
                if (this.gameState !== 'playing') return;
            }
            // Průběžná kontrola pro destroy/capture typy (pouze vítězství, ne porážka)
            this.victoryConditionsSystem.checkMidGameVictory();
            if (this.gameState !== 'playing') return;
        }

        this.updateUI();
        this.render();

        // Pokud jsou na tahu křižáci, spustíme AI
        if (this.currentFaction === 'crusaders') {
            setTimeout(() => this.runAI(), 500);
        }
    }

    // Kontrola postupu v dual_objective cílech

    showVictory(winner) {
        this.gameState = 'victory';

        const isVictory = (winner === 'hussites');
        let message;

        // Zkusíme použít debriefing ze scénáře
        if (this.currentScenario && this.currentScenario.debriefing) {
            message = isVictory
                ? this.currentScenario.debriefing.victory
                : this.currentScenario.debriefing.defeat;
        }

        if (this.currentScenario?.id && typeof ChronicleSystem !== 'undefined'
            && typeof ChronicleSystem.getEnemyChronicleText === 'function') {
            if (!isVictory) {
                // Dějiny právě napsal vítěz: porážku rámuje jeho kronika,
                // ne husitský debriefing.
                message = ChronicleSystem.getEnemyChronicleText(this.currentScenario.id, true) || message;
            } else if (this.currentScenario.id === 'sion_1437') {
                const competingAccounts = ChronicleSystem.getEnemyChronicleText(this.currentScenario.id, true);
                if (competingAccounts) {
                    message = `${message}\n\n${i18n.t('chronicle.competingAccounts')}\n${competingAccounts}`;
                }
            }
        }

        // Fallback na generické zprávy
        if (!message) {
            message = i18n.t(isVictory ? 'gameLog.victoryDestroyArmy' : 'gameLog.defeatDestroyOrRout');
        }

        if (isVictory) {
            Sound.playVictory();
        } else {
            Sound.playDefeat();
        }

        // Statistiky hry
        // turnNumber se zvyšuje na ZAČÁTKU kola - když vyhodnocení proběhne
        // po dokončení posledního kola, čítač už ukazuje kolo, které se
        // nikdy nehrálo (u 12kolové mise "13"). Stropujeme na maxTurns.
        // Časové mise (survive/hold/survive_turns) se vyhodnocují až na začátku
        // kola po deadline (turnNumber už tiknul), a deadline může být dřív než
        // maxTurns - strop na maxTurns proto nestačí. VictoryConditionsSystem
        // proto u nich nastaví gameOverTurn na skutečný počet odehraných kol;
        // má přednost a drží stat KOLA v souladu s textem ("do kola 5").
        const maxTurns = this.currentScenario && this.currentScenario.maxTurns;
        const completedTurns = (this.gameOverTurn != null)
            ? this.gameOverTurn
            : (maxTurns ? Math.min(this.turnNumber, maxTurns) : this.turnNumber);
        const stats = {
            turns: completedTurns,
            enemiesKilled: this.enemiesKilled || 0,
            unitsLost: this.unitsLost || 0,
            secondaryObjectives: this.secondaryResults || [],
            // Konkrétní důvod výsledku (nastavuje VictoryConditionsSystem.outcome)
            reason: this.gameOverReason || null,
            // WP2a: data pro "Vy vs. kronika"
            scenarioId: this.currentScenario && this.currentScenario.id,
            lossesByFaction: this.lossesByFaction,
            fledByFaction: this.fledByFaction,
            aliveByFaction: this.units.reduce((acc, u) => {
                if (u.health > 0) acc[u.faction] = (acc[u.faction] || 0) + 1;
                return acc;
            }, { hussites: 0, crusaders: 0 })
        };
        this.gameOverReason = null;
        this.gameOverTurn = null;

        // Trvalý postup kampaně a pověst. Zapisuje se jednou; opakované
        // otevření modalu ani dvojí victory check reputaci nezmění.
        if (typeof CampaignProgressSystem !== 'undefined' && !this.campaignRecorded
            && this.currentScenario?.id) {
            this.campaignRecorded = true;
            const alive = stats.aliveByFaction;
            const playerLosses = (this.lossesByFaction.hussites || 0) + (this.fledByFaction.hussites || 0);
            const playerTotal = (alive.hussites || 0) + playerLosses;
            stats.campaignProgress = CampaignProgressSystem.recordBattle({
                scenarioId: this.currentScenario.id,
                result: isVictory ? 'victory' : 'defeat',
                turns: completedTurns,
                maxTurns: maxTurns || null,
                lossRatio: playerTotal > 0 ? playerLosses / playerTotal : 1
            });

            if (stats.campaignProgress?.actCompleted && typeof ChronicleSystem !== 'undefined'
                && typeof ChronicleSystem.recordActSummary === 'function') {
                ChronicleSystem.recordActSummary(stats.campaignProgress.actCompleted);
            }
        }

        // WP2b: zápis do Kroniky (jednou za bitvu, jen scénáře - ne rychlá bitva)
        if (typeof ChronicleSystem !== 'undefined' && !this.chronicleRecorded
            && this.currentScenario && this.currentScenario.id) {
            this.chronicleRecorded = true;
            const alive = stats.aliveByFaction;
            const pLost = (this.lossesByFaction.hussites || 0) + (this.fledByFaction.hussites || 0);
            const eKilled = this.lossesByFaction.crusaders || 0;
            const eFled = this.fledByFaction.crusaders || 0;
            ChronicleSystem.record({
                scenarioId: this.currentScenario.id,
                result: isVictory ? 'victory' : 'defeat',
                playerLosses: pLost,
                playerTotal: (alive.hussites || 0) + pLost,
                enemyLosses: eKilled,
                enemyTotal: (alive.crusaders || 0) + eKilled + eFled,
                fled: eFled,
                turns: completedTurns,
                blind: this.blindMode || false,
                ts: Date.now()
            });
        }

        // Použít nový gameover modal pokud existuje
        if (typeof window.showGameOver === 'function') {
            window.showGameOver(isVictory, message, stats);
        } else {
            // Fallback na starý modal
            const modal = document.getElementById('victory-modal');
            const title = document.getElementById('victory-title');
            const msgEl = document.getElementById('victory-message');

            title.textContent = i18n.t(isVictory ? 'gameLog.victoryHussites' : 'gameLog.victoryCrusaders');
            msgEl.textContent = message;
            modal.classList.remove('hidden');
        }
    }

    runAI() {
        if (this.gameState !== 'playing') return;
        if (this.currentFaction !== 'crusaders') return;

        // Zobrazení AI thinking indikátoru
        this.showAIThinking(true);

        // AI je implementována v ai.js
        if (typeof AI !== 'undefined') {
            AI.takeTurn(this);
        } else {
            // Fallback - jednoduše ukončí tah
            this.showAIThinking(false);
            this.endTurn();
        }
    }

    // Zobrazení/skrytí AI thinking indikátoru
    showAIThinking(show) {
        const indicator = document.getElementById('ai-thinking');
        if (indicator) {
            if (show) {
                // WP5: text nese jméno strany, která je právě na tahu (AI = currentFaction)
                const textEl = indicator.querySelector('.ai-thinking-text');
                if (textEl) {
                    textEl.textContent = i18n.t('game.aiThinkingNamed', { faction: this.factionLabel(this.currentFaction) });
                }
                indicator.classList.remove('hidden');
            } else {
                indicator.classList.add('hidden');
            }
        }
    }


    // WP5: zobrazované jméno strany pro aktuální scénář.
    // Živý lookup přes i18n (scenarios.<id>.factionNames.<faction>) - přežije přepnutí
    // jazyka; fallback na generické factions.<faction> (Husité/Křižáci).
    factionLabel(faction) {
        const id = this.currentScenario && this.currentScenario.id;
        if (id && typeof i18n !== 'undefined') {
            const key = `scenarios.${id}.factionNames.${faction}`;
            if (i18n.hasTranslation(key)) return i18n.t(key);
            // fallback na kanonickou hodnotu ze scénáře (pro jazyk bez locale záznamu)
            const fn = this.currentScenario.factionNames;
            if (fn && fn[faction]) return fn[faction];
        }
        return i18n.t(`factions.${faction}`);
    }

    // Aktualizace UI
    updateUI() {
        // Aktuální hráč
        const playerSpan = document.getElementById('current-player');
        const factionName = this.factionLabel(this.currentFaction);
        playerSpan.textContent = `${i18n.t('game.turnLabel')} ${factionName}`;
        playerSpan.className = this.currentFaction === 'crusaders' ? 'crusaders' : '';

        // Číslo kola - u misí s limitem ukaž i deadline (Kolo X/Y)
        const maxT = this.currentScenario && this.currentScenario.maxTurns;
        document.getElementById('turn-number').textContent = maxT
            ? `${i18n.t('game.roundLabel')} ${this.turnNumber}/${maxT}`
            : `${i18n.t('game.roundLabel')} ${this.turnNumber}`;

        // Přehled armád
        this.updateArmyOverview();

        // Aktualizace tlačítka chorálu
        this.updateChoralButton();

        // Aktualizace pulsujícího efektu tlačítka Ukončit tah
        this.updateEndTurnButton();
    }

    // Kontrola zda všechny jednotky hráče již jednaly
    allPlayerUnitsActed() {
        const playerUnits = this.units.filter(u =>
            u.faction === this.currentFaction && u.health > 0
        );

        // Pokud nejsou žádné živé jednotky, vrátíme true
        if (playerUnits.length === 0) return true;

        // Zkontrolujeme, zda všechny jednotky již nemůžou jednat
        return playerUnits.every(u => !u.canAct());
    }

    // Aktualizace tlačítka Ukončit tah - pulsuje když všechny jednotky jednaly
    updateEndTurnButton() {
        const endTurnBtn = document.getElementById('btn-end-turn');
        if (!endTurnBtn) return;

        // Pouze pro hráčskou frakci (husité)
        if (this.currentFaction === 'hussites' && this.allPlayerUnitsActed()) {
            endTurnBtn.classList.add('pulse');
        } else {
            endTurnBtn.classList.remove('pulse');
        }
    }

    updateArmyOverview() {
        const hussiteSection = document.getElementById('hussite-section');
        const crusaderSection = document.getElementById('crusader-section');
        const hussiteList = document.getElementById('hussite-units');
        const crusaderList = document.getElementById('crusader-units');

        hussiteList.innerHTML = '';
        crusaderList.innerHTML = '';

        // Počítadla jednotek
        let hussiteAlive = 0, hussiteTotal = 0;
        let crusaderAlive = 0, crusaderTotal = 0;

        for (const unit of this.units) {
            const li = document.createElement('li');
            li.className = 'unit-list-item';

            // Získání symbolu jednotky
            const unitType = UnitTypes[unit.type];
            const symbol = unitType?.symbol || '?';

            // Výpočet procenta zdraví pro barvu
            const healthPercent = (unit.health / unit.maxHealth) * 100;
            let healthClass = 'health-high';
            if (healthPercent <= 30) {
                healthClass = 'health-critical';
            } else if (healthPercent <= 60) {
                healthClass = 'health-medium';
            }

            if (unit.health <= 0) {
                li.classList.add('destroyed');
                li.innerHTML = `
                    <span class="unit-icon destroyed">✝</span>
                    <span class="unit-name">${unit.name}</span>
                `;
            } else {
                li.innerHTML = `
                    <span class="unit-icon">${symbol}</span>
                    <span class="unit-name">${unit.name}</span>
                    <span class="unit-health ${healthClass}">${unit.health}</span>
                `;

                if (unit.faction === this.currentFaction && !unit.canAct()) {
                    li.classList.add('exhausted');
                }
            }

            // Označení aktivní (vybrané) jednotky
            if (this.selectedUnit === unit) {
                li.classList.add('active');
            }

            // Kliknutí na jednotku v přehledu - vybere jednotku
            if (unit.health > 0) {
                li.addEventListener('click', () => {
                    // Pouze husitské jednotky jsou vybíratelné hráčem
                    if (unit.faction === 'hussites' && this.currentFaction === 'hussites') {
                        this.selectUnit(unit);
                        this.render();
                    }
                });
            }

            if (unit.faction === 'hussites') {
                hussiteList.appendChild(li);
                hussiteTotal++;
                if (unit.health > 0) hussiteAlive++;
            } else {
                crusaderList.appendChild(li);
                crusaderTotal++;
                if (unit.health > 0) crusaderAlive++;
            }
        }

        // Aktualizace počítadel v hlavičkách
        const hussiteCount = hussiteSection?.querySelector('.faction-count');
        const crusaderCount = crusaderSection?.querySelector('.faction-count');
        if (hussiteCount) hussiteCount.textContent = `${hussiteAlive}/${hussiteTotal}`;
        if (crusaderCount) crusaderCount.textContent = `${crusaderAlive}/${crusaderTotal}`;

        // WP5: per-scénář jména stran v hlavičkách (data-i18n odstraněn v HTML, řídíme ručně)
        const hussiteName = hussiteSection?.querySelector('.faction-name');
        const crusaderName = crusaderSection?.querySelector('.faction-name');
        if (hussiteName) hussiteName.textContent = this.factionLabel('hussites');
        if (crusaderName) crusaderName.textContent = this.factionLabel('crusaders');

        // Lišty morálky armád (okno protiútoku)
        this.renderMoraleBar('hussite', 'hussites', hussiteAlive);
        this.renderMoraleBar('crusader', 'crusaders', crusaderAlive);
    }

    // Vykreslení lišty morálky jedné armády
    renderMoraleBar(prefix, faction, aliveCount) {
        const bar = document.getElementById(`${prefix}-morale`);
        const fill = document.getElementById(`${prefix}-morale-fill`);
        const text = document.getElementById(`${prefix}-morale-text`);
        if (!bar || !fill || !text) return;

        // Bez živých jednotek lišta zmizí
        if (aliveCount === 0) {
            bar.style.display = 'none';
            return;
        }
        bar.style.display = '';

        const morale = this.getArmyMorale(faction);
        this.armyMorale[faction] = morale;

        fill.style.width = `${morale}%`;
        fill.classList.remove('morale-medium', 'morale-low');
        if (morale < 40) {
            fill.classList.add('morale-low');
        } else if (morale < 60) {
            fill.classList.add('morale-medium');
        }

        const isWavering = this.wavering && this.wavering[faction];
        bar.classList.toggle('wavering', !!isWavering);

        const label = i18n.t('game.moraleLabel');
        text.textContent = isWavering
            ? `${i18n.t('game.wavering')} ${morale}%`
            : `${label} ${morale}%`;
        bar.title = `${label}: ${morale}%`;
    }

    updateUnitPanel(unit) {
        const infoDiv = document.getElementById('unit-info');
        const actionsDiv = document.getElementById('unit-actions');
        const attackBtn = document.getElementById('btn-attack');
        const unitPanel = document.getElementById('unit-panel');

        if (!unit) {
            if (unitPanel) {
                unitPanel.classList.add('empty-unit-panel');
            }
            infoDiv.innerHTML = `<p class="no-selection">${i18n.t('tooltip.selectUnit')}</p>`;
            actionsDiv.classList.add('hidden');
            return;
        }
        if (unitPanel) {
            unitPanel.classList.remove('empty-unit-panel');
        }

        // Speciální schopnost HTML
        let specialHtml = '';
        if (unit.special && unit.special !== 'commander') {
            const specialKey = `special.${unit.special}`;
            const specialName = i18n.hasTranslation(specialKey) ? i18n.t(specialKey) : unit.special;
            specialHtml = `
                <div class="unit-special" style="margin: 10px 0; padding: 8px; background: rgba(212, 175, 55, 0.15); border: 1px solid #5c4a1f; border-radius: 4px;">
                    <span style="color: #d4af37; font-weight: bold;">⚡ ${specialName}</span>
                </div>
            `;
        }

        // Velitelské schopnosti HTML
        let commanderHtml = '';
        if (unit.isCommander && unit.isCommander()) {
            const abilities = unit.getCommanderAbilities();
            let abilitiesText = [];
            if (abilities.moraleBonus) abilitiesText.push(i18n.t('tooltip.moraleBonus', { value: abilities.moraleBonus }));
            if (abilities.attackBonus) abilitiesText.push(i18n.t('tooltip.attackBonus', { value: abilities.attackBonus }));
            if (abilities.defenseBonus) abilitiesText.push(i18n.t('tooltip.defenseBonus', { value: abilities.defenseBonus }));
            if (abilities.wagonBonus) abilitiesText.push(i18n.t('tooltip.wagonsBonus', { value: abilities.wagonBonus }));
            if (abilities.cavalryBonus) abilitiesText.push(i18n.t('tooltip.cavalryBonus', { value: abilities.cavalryBonus }));

            commanderHtml = `
                <div class="commander-info" style="margin: 10px 0; padding: 10px; background: rgba(139, 69, 19, 0.3); border: 2px solid #8b4513; border-radius: 6px;">
                    <div style="color: #ffd700; font-weight: bold; font-size: 1.1rem; margin-bottom: 8px;">
                        👑 ${i18n.t('tooltip.commander').toUpperCase()}
                    </div>
                    <div style="color: #d4af37; font-size: 0.85rem; margin-bottom: 5px;">
                        ${i18n.t('tooltip.auraRange', { value: abilities.auraRange })}
                    </div>
                    <div style="color: #aaa; font-size: 0.8rem;">
                        ${i18n.t('tooltip.bonuses', { values: abilitiesText.join(', ') })}
                    </div>
                    ${abilities.fearRange ? `<div style="color: #ff6b6b; font-size: 0.8rem; margin-top: 3px;">${i18n.t('tooltip.fear', { penalty: abilities.fearPenalty, range: abilities.fearRange })}</div>` : ''}
                    ${abilities.rallyBonus ? `<div style="color: #2f7d31; font-size: 0.8rem; margin-top: 3px;">${i18n.t('tooltip.rallyBonus', { value: abilities.rallyBonus })}</div>` : ''}
                </div>
            `;
        }

        // Velitelský bonus pokud je jednotka v auře
        let auraEffectHtml = '';
        if (!unit.isCommander || !unit.isCommander()) {
            const bonuses = this.getCommanderBonuses(unit);
            const fearPenalty = this.getEnemyCommanderFearPenalty(unit);

            if (bonuses && (bonuses.morale > 0 || bonuses.attack > 0 || bonuses.defense > 0)) {
                const nearestInfo = this.getNearestCommander(unit);
                auraEffectHtml = `
                    <div class="aura-effect aura-bonus">
                        <div class="aura-header">
                            <span class="aura-icon">👑</span>
                            <span class="aura-title">${i18n.t('tooltip.inAura')}${nearestInfo ? ` (${nearestInfo.commander.name})` : ''}</span>
                        </div>
                        <div class="aura-values">
                            ${bonuses.attack > 0 ? `<span class="aura-value positive">${i18n.t('tooltip.attackBonus', { value: bonuses.attack })}</span>` : ''}
                            ${bonuses.defense > 0 ? `<span class="aura-value positive">${i18n.t('tooltip.defenseBonus', { value: bonuses.defense })}</span>` : ''}
                            ${bonuses.morale > 0 ? `<span class="aura-value positive">${i18n.t('tooltip.moraleBonus', { value: bonuses.morale })}</span>` : ''}
                        </div>
                    </div>
                `;
            }

            if (fearPenalty > 0) {
                auraEffectHtml += `
                    <div class="aura-effect aura-fear">
                        <div class="aura-header">
                            <span class="aura-icon">⚠️</span>
                            <span class="aura-title">${i18n.t('tooltip.enemyCommander')}</span>
                        </div>
                        <div class="aura-values">
                            <span class="aura-value negative">-${i18n.t('tooltip.moraleBonus', { value: fearPenalty }).replace(/^\+/, '')}</span>
                        </div>
                    </div>
                `;
            }
        }

        // Status efekty
        let statusHtml = '';
        if (unit.isTerrified) {
            statusHtml += `<span style="color: #ff8844; font-size: 0.85rem;">😨 ${i18n.t('tooltip.terrified')}</span><br>`;
        }
        if (unit.isDefending) {
            statusHtml += `<span style="color: #4488ff; font-size: 0.85rem;">🛡️ ${i18n.t('tooltip.defensiveStance')}</span><br>`;
        }
        // WP1/P4: stav vozové hradby - pevná zeď (nehýbe se) vs pochod (poloviční kryt)
        if (unit.isWagon() && unit.formationClosed) {
            if (unit.marching) {
                statusHtml += `<span style="color: #d0b060; font-size: 0.85rem;">➡ ${i18n.t('game.wagonMarchHint')}</span><br>`;
            } else {
                statusHtml += `<span style="color: #c9a227; font-size: 0.85rem;">⛓ ${i18n.t('game.wagonChainedHint')}</span><br>`;
            }
        }
        if (unit.isRouting) {
            statusHtml += `<span style="color: #ff4444; font-size: 0.85rem;">🏃 ${i18n.t('tooltip.routing')}</span><br>`;
        }

        // Obklíčení - dynamická kontrola
        const surroundInfo = this.checkSurrounded(unit);
        if (surroundInfo.surrounded) {
            const levelText = i18n.t(`tooltip.surrounded${surroundInfo.level}`);
            const penalty = surroundInfo.level * 10;
            statusHtml += `<span style="color: #ff6666; font-size: 0.85rem;">⚔️ ${i18n.t('tooltip.surroundedEffect', {
                state: levelText,
                defense: penalty,
                morale: surroundInfo.level * 5
            })}</span><br>`;
        }

        infoDiv.innerHTML = `
            <h3>${unit.name}</h3>
            <p style="font-size: 0.8rem; color: #999; margin-bottom: 8px; font-style: italic;">${unit.description}</p>
            ${commanderHtml}
            ${specialHtml}

            ${auraEffectHtml}

            <div class="unit-stats-grid">
                <div class="unit-stat">
                    <span><span class="stat-icon">⚔</span><span class="label">${i18n.t('help.unitStats.attack')}</span></span>
                    <span class="value">${unit.attack}</span>
                </div>
                <div class="unit-stat">
                    <span><span class="stat-icon">🛡</span><span class="label">${i18n.t('help.unitStats.defense')}</span></span>
                    <span class="value">${unit.defense}</span>
                </div>
                <div class="unit-stat">
                    <span><span class="stat-icon">📏</span><span class="label">${i18n.t('help.unitStats.range')}</span></span>
                    <span class="value">${unit.range}</span>
                </div>
                <div class="unit-stat">
                    <span><span class="stat-icon">👣</span><span class="label">${i18n.t('help.unitStats.movement')}</span></span>
                    <span class="value">${unit.movement}</span>
                </div>
            </div>

            <div class="health-bar" style="margin-top: 8px; position: relative;">
                <div class="health-bar-fill" style="width: ${(unit.health / unit.maxHealth) * 100}%"></div>
                <span class="health-bar-text">${unit.health}/${unit.maxHealth}</span>
            </div>

            <div class="morale-section" style="padding-top: 8px; border-top: 1px solid rgba(201, 162, 39, 0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-size: 0.75rem; color: #888; text-transform: uppercase;">${i18n.t('game.moraleLabel')}</span>
                    <span style="color: ${unit.getMoraleColor()}; font-weight: bold;">${unit.getMoraleStatus()}</span>
                </div>
                <div class="morale-bar" style="width: 100%; height: 6px; background: rgba(0,0,0,0.4); border-radius: 3px; overflow: hidden;">
                    <div style="width: ${(unit.morale / unit.maxMorale) * 100}%; height: 100%; background: ${unit.getMoraleColor()}; transition: width 0.3s;"></div>
                </div>
            </div>
            ${statusHtml ? `<div class="status-effects" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(201, 162, 39, 0.3);">${statusHtml}</div>` : ''}
        `;

        if (unit.faction === this.currentFaction) {
            actionsDiv.classList.remove('hidden');
            attackBtn.disabled = !unit.canAttack();

            // WP1: tlačítka hradby - jen pro hráčův vůz, který ještě nejednal
            const formationBtn = document.getElementById('btn-formation');
            const formationLineBtn = document.getElementById('btn-formation-line');
            const formationMarchBtn = document.getElementById('btn-formation-march');
            if (formationBtn && formationLineBtn) {
                if (unit.isWagon() && !unit.hasMoved) {
                    formationBtn.textContent = i18n.t(unit.formationClosed ? 'game.openFort' : 'game.closeFort');
                    formationLineBtn.textContent = i18n.t('game.toggleFortLine');
                    formationBtn.classList.remove('hidden');
                    formationLineBtn.classList.remove('hidden');
                } else {
                    formationBtn.classList.add('hidden');
                    formationLineBtn.classList.add('hidden');
                }
            }
            // P4: pochod hradby - dostupný pro sepnutý vůz (přepnutí zdarma; ukážeme
            // i po pohybu, aby šlo zastavit a získat příště plný kryt)
            if (formationMarchBtn) {
                if (unit.isWagon() && unit.formationClosed) {
                    formationMarchBtn.textContent = i18n.t(unit.marching ? 'game.stopMarch' : 'game.startMarch');
                    formationMarchBtn.classList.remove('hidden');
                } else {
                    formationMarchBtn.classList.add('hidden');
                }
            }

            // Tlačítko undo - zobrazit pouze pokud je možné vrátit pohyb
            const undoBtn = document.getElementById('btn-undo');
            if (this.canUndo() && this.lastMove && this.lastMove.unit === unit) {
                undoBtn.classList.remove('hidden');
            } else {
                undoBtn.classList.add('hidden');
            }
        } else {
            actionsDiv.classList.add('hidden');
        }
    }

    clearLog() {
        this.log = [];
        const logDiv = document.getElementById('game-log');
        if (logDiv) logDiv.replaceChildren();
    }

    addLog(message, type = '') {
        const logDiv = document.getElementById('game-log');
        const p = document.createElement('p');
        p.textContent = message;
        if (type) p.classList.add(type);

        logDiv.appendChild(p);
        logDiv.scrollTop = logDiv.scrollHeight;

        this.log.push({ message, type });
    }

    render() {
        // Aktualizace viditelnosti před renderem
        this.fogOfWarSystem.updateVisibility();

        const aliveUnits = this.units.filter(u => u.health > 0);

        // Filtrování viditelných jednotek pro render
        const visibleUnits = this.fogOfWar
            ? aliveUnits.filter(u => u.faction === 'hussites' || this.fogOfWarSystem.isEnemyVisible(u))
            : aliveUnits;

        // Předání informací o mlze do rendereru
        this.hexGrid.render(visibleUnits, {
            fogOfWar: this.fogOfWar,
            visibleHexes: this.visibleHexes,
            exploredHexes: this.exploredHexes
        });
        this.minimap.render(visibleUnits);
    }

    // Pomocné metody pro AI
    getUnitsOfFaction(faction) {
        return this.units.filter(u => u.faction === faction && u.health > 0);
    }

    getEnemyUnits(faction) {
        return this.units.filter(u => u.faction !== faction && u.health > 0);
    }

    // Uložení hry do localStorage
    saveGame() {
        const saveData = {
            version: 3,
            scenarioId: this.currentScenario ? this.currentScenario.id : null,
            turnNumber: this.turnNumber,
            currentFaction: this.currentFaction,
            gameState: this.gameState,
            units: this.units.map(u => u.serialize()),
            nextUnitId: this.unitFactory.nextId,
            // Průběh scénáře - bez něj by se po načtení znovu spouštěly
            // eventy a podmínky vítězství by počítaly se špatnými čísly
            processedEvents: [...this.processedEvents],
            objectiveHeldTurns: this.objectiveHeldTurns || {},
            enemiesKilled: this.enemiesKilled,
            unitsLost: this.unitsLost,
            lossesByFaction: this.lossesByFaction,  // WP2a
            fledByFaction: this.fledByFaction,
            escapedUnits: this.escapedUnits || 0,
            stats: this.stats,
            initialPlayerUnits: this.initialPlayerUnits,
            initialEnemyUnits: this.initialEnemyUnits,
            elapsedGameTime: Math.max(0, Date.now() - this.gameDuration),
            bridgeUsedThisTurn: Boolean(this.bridgeUsedThisTurn),
            campaignReputation: this.campaignReputation,
            aiStance: {
                mode: this.aiStance?.mode || 'default',
                target: this.aiStance?.target ? { ...this.aiStance.target } : null,
                untilTurn: this.aiStance?.untilTurn ?? null,
                proximity: this.aiStance?.proximity ?? 3
            },
            // Chorál a morální zlom
            choralUsed: this.choralUsed,
            choralActive: this.choralActive,
            choralTurnsRemaining: this.choralTurnsRemaining,
            moraleBroken: this.moraleBroken,
            wavering: this.wavering,
            // Mlha války
            fogOfWar: this.fogOfWar,
            exploredHexes: [...this.exploredHexes],
            savedAt: new Date().toISOString()
        };

        try {
            localStorage.setItem('husitskeValky_save', JSON.stringify(saveData));
            this.addLog(i18n.t('gameLog.gameSaved'), 'turn');
            Sound.playSelect();
            return true;
        } catch (e) {
            console.error('Chyba při ukládání:', e);
            this.addLog(i18n.t('gameLog.saveError'), 'combat');
            return false;
        }
    }

    // Načtení hry z localStorage
    loadGame() {
        try {
            const saveString = localStorage.getItem('husitskeValky_save');
            if (!saveString) {
                this.addLog(i18n.t('gameLog.noSaveFound'), 'combat');
                return false;
            }

            const saveData = JSON.parse(saveString);

            // Kontrola verze (v1/v2 = staré savy bez úplného stavu scénáře)
            if (saveData.version !== 1 && saveData.version !== 2 && saveData.version !== 3) {
                this.addLog(i18n.t('gameLog.saveIncompatible'), 'combat');
                return false;
            }

            // Obnovení stavu
            this.turnNumber = saveData.turnNumber;
            this.currentFaction = saveData.currentFaction;
            this.gameState = saveData.gameState;
            this.unitFactory.nextId = saveData.nextUnitId;

            // Obnovení jednotek
            this.units = saveData.units.map(data => Unit.deserialize(data));

            // Terén: pokud běží scénář, aplikoval ho už initGameWithScenario
            // (volá se před loadGame ze startGameFromSave). Default mapu
            // stavíme jen pro hry bez scénáře - dřívější bezpodmínečné
            // setupTerrain() přepisovalo mapu scénáře výchozí mapou.
            if (!this.currentScenario) {
                this.setupTerrain();
            }

            // Průběh scénáře
            this.processedEvents = new Set(saveData.processedEvents || []);
            this.objectiveHeldTurns = saveData.objectiveHeldTurns || {};
            this.enemiesKilled = saveData.enemiesKilled || 0;
            this.unitsLost = saveData.unitsLost || 0;
            this.lossesByFaction = saveData.lossesByFaction || { hussites: 0, crusaders: 0 };  // WP2a
            this.fledByFaction = saveData.fledByFaction || { hussites: 0, crusaders: 0 };
            this.escapedUnits = saveData.escapedUnits || 0;
            if (saveData.stats) {
                this.stats = saveData.stats;
            }
            if (saveData.initialPlayerUnits !== undefined) {
                this.initialPlayerUnits = saveData.initialPlayerUnits;
                this.initialEnemyUnits = saveData.initialEnemyUnits;
            }
            if (typeof saveData.elapsedGameTime === 'number') {
                this.gameDuration = Date.now() - Math.max(0, saveData.elapsedGameTime);
            }
            this.bridgeUsedThisTurn = Boolean(saveData.bridgeUsedThisTurn);
            if (typeof saveData.campaignReputation === 'number') {
                this.campaignReputation = Math.max(0, Math.min(100, saveData.campaignReputation));
            }
            this.campaignRecorded = false;
            if (saveData.aiStance && typeof saveData.aiStance === 'object') {
                this.aiStance = {
                    mode: saveData.aiStance.mode || 'default',
                    target: saveData.aiStance.target ? { ...saveData.aiStance.target } : null,
                    untilTurn: saveData.aiStance.untilTurn ?? null,
                    proximity: saveData.aiStance.proximity ?? 3
                };
            }

            // Chorál a morální zlom
            this.choralUsed = saveData.choralUsed || false;
            this.choralActive = saveData.choralActive || false;
            this.choralTurnsRemaining = saveData.choralTurnsRemaining || 0;
            this.moraleBroken = saveData.moraleBroken || false;
            this.wavering = saveData.wavering || { hussites: false, crusaders: false };

            // Mlha války
            if (saveData.fogOfWar !== undefined) {
                this.fogOfWar = saveData.fogOfWar;
            }
            this.exploredHexes = new Set(saveData.exploredHexes || []);
            this.visibleHexes = new Set();

            // Routující jednotky - stav je per-unit (isRouting), Set jen sleduje
            this.routingUnits = new Set(
                this.units.filter(u => u.isRouting).map(u => u.id)
            );

            // Fáze scénáře podle načteného kola
            if (this.currentScenario) {
                this.updatePhase();
            }

            // Reset výběru
            this.selectedUnit = null;
            this.hexGrid.setSelected(null, null);
            this.hexGrid.clearHighlights();

            // Aktualizace UI
            this.updateUI();
            this.updateUnitPanel(null);
            this.render();

            this.addLog(i18n.t('gameLog.gameLoaded', {turn: this.turnNumber, faction: this.currentFaction === 'hussites' ? i18n.t('factions.hussites') : i18n.t('factions.crusaders')}), 'turn');
            Sound.playSelect();

            // Pokud je na tahu AI, spustíme ji
            if (this.currentFaction === 'crusaders' && this.gameState === 'playing') {
                setTimeout(() => this.runAI(), 500);
            }

            return true;
        } catch (e) {
            console.error('Chyba při načítání:', e);
            this.addLog(i18n.t('gameLog.loadError'), 'combat');
            return false;
        }
    }

    // Kontrola, zda existuje uložená hra
    hasSavedGame() {
        return localStorage.getItem('husitskeValky_save') !== null;
    }

    // Smazání uložené hry
    deleteSave() {
        localStorage.removeItem('husitskeValky_save');
    }

    // ==========================================
    // SYSTÉM MORÁLKY
    // ==========================================

    // Jednotné zpracování smrti jednotky. Každý kill-path (přímý zásah,
    // protiútok, plošný útok, eventy) musí projít tudy - jinak smrt
    // velitele nespustí kolaps morálky a zničený vůz neotevře průlom.
    handleUnitDeath(victim, killer = null) {
        // Dedup (stejný důvod jako trackUnitDeath): jinak by dvojí volání
        // dvakrát srazilo morálku armády, dvakrát řešilo smrt velitele/vozu
        // a dvakrát odměnilo zabijáka.
        if (victim._deathHandled) return;
        victim._deathHandled = true;

        if (victim.isCommander && victim.isCommander()) {
            this.onCommanderDeath(victim);
        }
        if (victim.isWagon && victim.isWagon()) {
            this.onWagonDestroyed(victim);
        }
        this.applyMoraleLossOnDeath(victim);

        // Vítězství v souboji zvyšuje morálku přeživšího vítěze
        if (killer && killer.health > 0) {
            killer.increaseMorale(10, i18n.t('gameLog.combatVictory'));
        }
    }

    // Aplikace ztráty morálky při smrti jednotky na blízké spojence
    applyMoraleLossOnDeath(deadUnit) {
        // Vypnuto v tutoriálu
        if (this.isTutorial) return;

        const neighbors = this.hexGrid.getNeighbors(deadUnit.col, deadUnit.row);

        for (const neighbor of neighbors) {
            const nearbyUnit = this.getUnitAt(neighbor.col, neighbor.row);
            if (nearbyUnit && nearbyUnit.faction === deadUnit.faction && nearbyUnit.health > 0) {
                // Blízké jednotky ztrácí 15 morálky při smrti spojence
                const result = nearbyUnit.reduceMorale(15, 'Smrt spojence');
                if (result.startedRouting) {
                    this.addLog(i18n.t('gameLog.fleeingNearDeath', {unit: nearbyUnit.name, deadUnit: deadUnit.name}), 'morale');
                }
            }
        }

        // Všechny jednotky stejné frakce ztrácí trochu morálky (5)
        for (const unit of this.units) {
            if (unit.faction === deadUnit.faction && unit.health > 0 && unit.id !== deadUnit.id) {
                const result = unit.reduceMorale(5, 'Ztráta spojence');
                if (result.startedRouting) {
                    this.addLog(i18n.t('gameLog.fleeingCasualties', {unit: unit.name}), 'morale');
                }
            }
        }

        // Kontrola morálního zlomu po smrti jednotky
        this.moraleSystem.checkMoraleBreak();
    }


    // ==========================================
    // SYSTÉM VELITELŮ
    // ==========================================

    // Získání všech velitelů dané frakce
    getCommanders(faction) {
        return this.units.filter(u => u.faction === faction && u.health > 0 && u.isCommander());
    }

    // Získání nejbližšího velitele pro jednotku
    getNearestCommander(unit) {
        const commanders = this.getCommanders(unit.faction);
        let nearest = null;
        let nearestDistance = Infinity;

        for (const commander of commanders) {
            const dist = this.hexGrid.getDistance(unit.col, unit.row, commander.col, commander.row);
            if (dist < nearestDistance) {
                nearestDistance = dist;
                nearest = commander;
            }
        }

        return nearest ? { commander: nearest, distance: nearestDistance } : null;
    }

    // Kontrola, zda je jednotka v dosahu velitelské aury
    isInCommanderAura(unit) {
        const commanders = this.getCommanders(unit.faction);

        for (const commander of commanders) {
            const abilities = commander.getCommanderAbilities();
            if (!abilities) continue;

            const distance = this.hexGrid.getDistance(unit.col, unit.row, commander.col, commander.row);
            if (distance <= abilities.auraRange && distance > 0) {
                return { commander, abilities, distance };
            }
        }

        return null;
    }


    // Získání bonusů z velitelské aury pro jednotku
    getCommanderBonuses(unit) {
        const auraInfo = this.isInCommanderAura(unit);
        if (!auraInfo) return null;

        const { commander, abilities } = auraInfo;
        const bonuses = {
            commander: commander.name,
            attack: abilities.attackBonus || 0,
            defense: abilities.defenseBonus || 0,
            morale: abilities.moraleBonus || 0,
            rally: abilities.rallyBonus || 0
        };

        // Speciální bonusy podle typu jednotky
        if (unit.isWagon() && abilities.wagonBonus) {
            bonuses.defense += abilities.wagonBonus;
        }
        if (unit.isCavalry() && abilities.cavalryBonus) {
            bonuses.attack += abilities.cavalryBonus;
        }

        return bonuses;
    }

    // Aplikace efektu strachu od nepřátelského velitele
    getEnemyCommanderFearPenalty(unit) {
        const enemyFaction = unit.faction === 'hussites' ? 'crusaders' : 'hussites';
        const enemyCommanders = this.getCommanders(enemyFaction);

        let totalPenalty = 0;

        for (const commander of enemyCommanders) {
            const abilities = commander.getCommanderAbilities();
            if (!abilities || !abilities.fearRange) continue;

            const distance = this.hexGrid.getDistance(unit.col, unit.row, commander.col, commander.row);
            if (distance <= abilities.fearRange) {
                totalPenalty += abilities.fearPenalty || 0;
            }
        }

        return totalPenalty;
    }

    // Aplikace velitelských bonusů na začátku tahu
    applyCommanderAuras() {
        for (const unit of this.units) {
            if (unit.health <= 0 || unit.isCommander()) continue;
            // Jen frakce, jejíž tah právě začíná - endTurn běží 2x za kolo
            // a bez filtru by aury tikaly dvojnásobnou rychlostí
            if (unit.faction !== this.currentFaction) continue;

            // Bonusy od spojeneckého velitele
            const bonuses = this.getCommanderBonuses(unit);
            if (bonuses) {
                // Bonus k morálce (pokud není na maximu)
                if (unit.morale < unit.maxMorale) {
                    const moraleGain = Math.min(bonuses.morale / 5, unit.maxMorale - unit.morale);
                    if (moraleGain > 0) {
                        unit.increaseMorale(moraleGain, `Vedení: ${bonuses.commander}`);
                    }
                }
            }

            // Postih od nepřátelského velitele
            const fearPenalty = this.getEnemyCommanderFearPenalty(unit);
            if (fearPenalty > 0 && unit.morale > 30) {
                unit.reduceMorale(fearPenalty / 2, 'Strach z nepřátelského velitele');
            }
        }
    }

    // Efekt smrti velitele
    onCommanderDeath(commander) {
        this.addLog(i18n.t('gameLog.commanderFallen', {commander: commander.name}), 'commander');

        // Masivní ztráta morálky pro celou armádu
        for (const unit of this.units) {
            if (unit.faction === commander.faction && unit.health > 0) {
                const moraleLoss = 25; // Velká ztráta
                const result = unit.reduceMorale(moraleLoss, `Smrt velitele ${commander.name}`);
                if (result.startedRouting) {
                    this.addLog(i18n.t('gameLog.fleeingCommander', {unit: unit.name}), 'morale');
                }
            }
        }

        // Bonus morálky pro nepřítele
        const enemyFaction = commander.faction === 'hussites' ? 'crusaders' : 'hussites';
        for (const unit of this.units) {
            if (unit.faction === enemyFaction && unit.health > 0) {
                unit.increaseMorale(10, `Zabili jsme ${commander.name}!`);
            }
        }
    }

    // ==========================================
    // SYSTÉM OBKLÍČENÍ
    // ==========================================

    // Kontrola, zda je jednotka obklíčena (nepřátelé na protilehlých stranách)
    // Vrací: { surrounded: bool, level: 0-3, directions: [[dir1, dir2], ...] }
    checkSurrounded(unit) {
        const enemyFaction = unit.faction === 'hussites' ? 'crusaders' : 'hussites';

        // Zjistíme, na kterých směrech jsou nepřátelé (0-5).
        // POZOR: nelze použít hexGrid.getNeighbors() - ten hexy mimo mapu
        // vyfiltruje a pole zkomprimuje, takže index != směr a protilehlé
        // páry by na okraji mapy párovaly náhodné dvojice. Směrové tabulky
        // odpovídají getNeighbors v hex.js (odd-q offset).
        const isOddCol = unit.col % 2 === 1;
        const directions = isOddCol ? [
            [0, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]
        ] : [
            [0, -1], [1, -1], [1, 0], [0, 1], [-1, 0], [-1, -1]
        ];

        const enemyDirections = [];
        for (let i = 0; i < 6; i++) {
            const nc = unit.col + directions[i][0];
            const nr = unit.row + directions[i][1];
            // Směr mimo mapu nemůže obsahovat nepřítele
            if (nc < 0 || nc >= this.hexGrid.cols || nr < 0 || nr >= this.hexGrid.rows) continue;
            const enemyAtPos = this.units.find(u =>
                u.col === nc &&
                u.row === nr &&
                u.faction === enemyFaction &&
                u.health > 0
            );
            if (enemyAtPos) {
                enemyDirections.push(i);
            }
        }

        // Protilehlé páry směrů v hex gridu: (0,3), (1,4), (2,5)
        const oppositePairs = [[0, 3], [1, 4], [2, 5]];
        const surroundedPairs = [];

        for (const [dir1, dir2] of oppositePairs) {
            if (enemyDirections.includes(dir1) && enemyDirections.includes(dir2)) {
                surroundedPairs.push([dir1, dir2]);
            }
        }

        return {
            surrounded: surroundedPairs.length > 0,
            level: surroundedPairs.length, // 1 = částečně, 2 = silně, 3 = zcela obklíčen
            directions: surroundedPairs,
            enemyCount: enemyDirections.length
        };
    }


    // Aplikace efektů obklíčení na začátku tahu
    applySurroundedEffects() {
        for (const unit of this.units) {
            if (unit.health <= 0) continue;
            // Jen frakce na tahu - jinak ztráta morálky z obklíčení tiká
            // 2x za kolo (endTurn běží při přepnutí na obě strany)
            if (unit.faction !== this.currentFaction) continue;

            const surroundInfo = this.checkSurrounded(unit);
            if (surroundInfo.surrounded) {
                unit.isSurrounded = true;
                unit.surroundedLevel = surroundInfo.level;

                // Ztráta morálky za obklíčení
                const moraleLoss = surroundInfo.level * 5;
                const result = unit.reduceMorale(moraleLoss, 'Obklíčení');

                if (result.startedRouting) {
                    this.addLog(i18n.t('gameLog.fleeingSurrounded', {unit: unit.name}), 'morale');
                }
            } else {
                unit.isSurrounded = false;
                unit.surroundedLevel = 0;
            }
        }
    }

    // WP2a: přesné počítání ztrát per frakce (zabití vs. uprchlí). Volá se z OBOU
    // death-path (Game.trackUnitDeath i CombatSystem.trackUnitDeath), ať sedí i led
    // u Německého Brodu (utonulí se z this.units odebírají).
    recordLoss(deadUnit) {
        if (!this.lossesByFaction) this.lossesByFaction = { hussites: 0, crusaders: 0 };
        if (!this.fledByFaction) this.fledByFaction = { hussites: 0, crusaders: 0 };
        const bucket = deadUnit.escaped ? this.fledByFaction : this.lossesByFaction;
        bucket[deadUnit.faction] = (bucket[deadUnit.faction] || 0) + 1;
    }

    // Sledování smrti jednotek pro statistiky
    trackUnitDeath(deadUnit, killer) {
        // Dedup: dva útoky na týž cíl v jednom 300ms okně (damage se aplikuje
        // se zpožděním) jinak započítají smrt dvakrát - nafoukne enemiesKilled
        // (a tím destroy_percent vítězství), ztráty i čísla v kronice.
        if (deadUnit._deathCounted) return;
        deadUnit._deathCounted = true;

        const playerFaction = this.currentScenario?.playerFaction || 'hussites';
        this.recordLoss(deadUnit);

        if (deadUnit.faction === playerFaction) {
            // Hráč ztratil jednotku
            this.unitsLost++;
        } else {
            // Hráč zabil nepřítele
            this.enemiesKilled++;

            // Sledování zabití pro MVP
            if (killer && killer.faction === playerFaction) {
                if (!this.stats.unitKills[killer.id]) {
                    this.stats.unitKills[killer.id] = 0;
                }
                this.stats.unitKills[killer.id]++;
            }
        }
    }

    // Sledování poškození pro statistiky
    trackDamage(attacker, defender, damage) {
        const playerFaction = this.currentScenario?.playerFaction || 'hussites';

        if (attacker.faction === playerFaction) {
            // Hráč způsobil poškození
            this.stats.totalDamage += damage;

            // Sledování poškození pro MVP
            if (!this.stats.unitDamage[attacker.id]) {
                this.stats.unitDamage[attacker.id] = 0;
            }
            this.stats.unitDamage[attacker.id] += damage;
        } else {
            // Hráč obdržel poškození
            this.stats.damageTaken += damage;
        }
    }

    // isUnitNearWagonOrTown - helper pro regeneraci
    // =============================================
    // PASIVNÍ REGENERACE ZDRAVÍ
    // =============================================

    // Kontrola, zda je jednotka u vozové hradby nebo v městě (pro regeneraci)
    isUnitNearWagonOrTown(unit) {
        // Kontrola terénu - město (getTerrain vrací string, ne objekt)
        const terrain = this.hexGrid.getTerrain(unit.col, unit.row);
        if (terrain === 'town') {
            return { type: 'town', name: i18n.t('terrain.town') };
        }

        // Kontrola sousedních polí pro vozy
        const neighbors = this.hexGrid.getNeighbors(unit.col, unit.row);
        for (const neighbor of neighbors) {
            const adjacentUnit = this.getUnitAt(neighbor.col, neighbor.row);
            if (adjacentUnit &&
                adjacentUnit.faction === unit.faction &&
                adjacentUnit.health > 0 &&
                adjacentUnit.isWagon && adjacentUnit.isWagon()) {
                return { type: 'wagon', name: i18n.t('messages.wagonFortTitle') };
            }
        }

        return null;
    }

    // Pasivní regenerace zdraví na konci tahu
    regenerateHealth() {
        // Regenerace pouze na začátku husitského tahu (po křižáckém tahu)
        if (this.currentFaction !== 'hussites') return;

        // Set se čistí každé kolo - bez toho by se každá jednotka vyléčila
        // jen jednou za celou hru místo jednou za kolo
        this.regeneratedUnits.clear();

        const HEAL_AMOUNT = 10;
        const MAX_HEAL_PERCENT = 0.5; // Max 50% maxHealth

        for (const unit of this.units) {
            // Přeskočit mrtvé, vozy a jednotky které již regenerovaly
            if (unit.health <= 0) continue;
            if (unit.isWagon && unit.isWagon()) continue;
            if (this.regeneratedUnits.has(unit.id || `${unit.col}-${unit.row}`)) continue;

            // Kontrola, zda je jednotka u vozu nebo v městě
            const healSource = this.isUnitNearWagonOrTown(unit);
            if (!healSource) continue;

            // Max heal = 50% maxHealth
            const maxHealableHealth = Math.floor(unit.maxHealth * MAX_HEAL_PERCENT);
            if (unit.health >= maxHealableHealth) continue;

            // Vypočítat kolik můžeme vyléčit
            const healAmount = Math.min(HEAL_AMOUNT, maxHealableHealth - unit.health);
            if (healAmount <= 0) continue;

            // Vyléčit a označit jako regenerovanou
            unit.health += healAmount;
            this.regeneratedUnits.add(unit.id || `${unit.col}-${unit.row}`);

            this.addLog(i18n.t('gameLog.unitHealing', {unit: unit.name, amount: healAmount, source: healSource.name}), 'move');
        }
    }

    // =============================================
    // CHORÁL "KTOŽ JSÚ BOŽÍ BOJOVNÍCI"
    // =============================================

    // Aktivace chorálu - jednorázová schopnost
    activateChoral() {
        if (this.choralUsed) {
            this.addLog(i18n.t('gameLog.choralAlreadyUsed'), 'turn');
            return false;
        }

        if (this.currentFaction !== 'hussites') {
            this.addLog(i18n.t('gameLog.choralWrongFaction'), 'turn');
            return false;
        }

        this.choralUsed = true;
        this.choralActive = true;
        this.choralTurnsRemaining = 2;

        this.addLog(i18n.t('gameLog.choralActivated'), 'turn');

        // Vizuální efekt - změna phase panelu
        const phasePanel = document.getElementById('phase-panel');
        const phaseName = document.getElementById('phase-name');
        const phaseDesc = document.getElementById('phase-description');

        phasePanel.classList.remove('hidden');
        phaseName.textContent = `⚔️ ${i18n.t('game.choralActive')}`;
        phaseDesc.textContent = i18n.t('game.choralEffect', { turns: 2 });

        // WP4: psychologický šok chorálu na nepřítele + přehrání hymnu
        this.applyChoralShock();
        if (typeof Music !== 'undefined' && Music.playChoral) {
            Music.playChoral();
        }

        // Aktualizace tlačítka
        this.updateChoralButton();

        this.render();
        return true;
    }

    // WP4: chorál jako psychologická zbraň. U Domažlic ho slyšeli na kilometry a
    // křižáci se dali na útěk od pouhého zvuku. Nepřítel -8 morálka (+ 30% test
    // okamžitého útěku při morálce <25), husité +5. Volá se při každé aktivaci chorálu.
    applyChoralShock() {
        let routed = 0;
        const moraleDamage = typeof CampaignProgressSystem !== 'undefined'
            ? CampaignProgressSystem.getChoralMoraleDamage(
                this.currentScenario?.id,
                8,
                this.campaignReputation
            )
            : 8;
        for (const unit of this.units) {
            if (unit.health <= 0) continue;
            if (unit.faction === 'hussites') {
                unit.morale = Math.min(unit.maxMorale, unit.morale + 5);
            } else {
                unit.morale = Math.max(0, unit.morale - moraleDamage);
                // Po zásahu nízká morálka -> okamžitý útěk (zrcadlí panic level 3)
                if (unit.morale < 25 && Math.random() < 0.3) {
                    this.routingUnits.add(unit.id || `${unit.col}-${unit.row}`);
                    unit.isRouting = true;
                    routed++;
                    this.addLog(i18n.t('gameLog.panicFlee', {unit: unit.name}), 'morale');
                }
            }
        }
        this.addLog(i18n.t('gameLog.choralShockEnemy'), 'morale');
        this.updateWaveringState();   // morálka armád se změnila -> okno protiútoku
        this.updateArmyOverview();
        return routed;
    }

    // Aktualizace stavu tlačítka chorálu
    updateChoralButton() {
        const choralBtn = document.getElementById('btn-choral');
        if (!choralBtn) return;

        if (this.choralActive) {
            // Chorál je aktivní - zobrazit zbývající kola
            choralBtn.disabled = true;
            choralBtn.classList.add('active');
            choralBtn.textContent = `⚔️ ${i18n.t('game.choral')} (${this.choralTurnsRemaining})`;
        } else if (this.choralUsed) {
            // Chorál byl použit a už vypršel
            choralBtn.disabled = true;
            choralBtn.classList.remove('active');
            choralBtn.textContent = `⚔️ ${i18n.t('game.choralUsed')}`;
        } else {
            choralBtn.disabled = this.currentFaction !== 'hussites';
            choralBtn.classList.remove('active');
            choralBtn.textContent = `⚔️ ${i18n.t('game.choral')}`;
        }
    }

    // Aktualizace stavu chorálu na konci tahu
    updateChoral() {
        if (!this.choralActive) return;

        // Snížit pouze na začátku husitského tahu
        if (this.currentFaction !== 'hussites') return;

        this.choralTurnsRemaining--;

        if (this.choralTurnsRemaining <= 0) {
            this.choralActive = false;
            this.addLog(i18n.t('gameLog.choralExpired'), 'turn');

            // Obnovit phase panel na aktuální fázi nebo schovat
            const phasePanel = document.getElementById('phase-panel');
            if (this.currentPhase) {
                // Obnovit zobrazení aktuální fáze
                document.getElementById('phase-name').textContent = this.currentPhase.name;
                document.getElementById('phase-description').textContent = this.currentPhase.description || '';
            } else {
                phasePanel.classList.add('hidden');
            }
        } else {
            this.addLog(i18n.t('gameLog.choralRemaining', {turns: this.choralTurnsRemaining}), 'turn');
            // Aktualizovat phase panel
            const phaseDesc = document.getElementById('phase-description');
            if (phaseDesc) {
                phaseDesc.textContent = i18n.t('game.choralEffect', { turns: this.choralTurnsRemaining });
            }
        }

        // Aktualizovat tlačítko
        this.updateChoralButton();
    }

    // Získání bonusu/postihu z chorálu

    // =============================================
    // VOZOVÁ HRADBA - FORMACE
    // =============================================

    // Kontrola, zda je jednotka v linii vozové hradby (3+ vozy vedle sebe)
    isInWagonLine(unit) {
        if (!unit.isWagon || !unit.isWagon()) return null;
        // WP1: jen SEPNUTÝ vůz drží linii; rozpojený z ní vypadává
        if (!unit.formationClosed) return null;

        const neighbors = this.hexGrid.getNeighbors(unit.col, unit.row);
        let adjacentWagons = 0;
        const wagonNeighbors = [];

        for (const neighbor of neighbors) {
            const adjacentUnit = this.getUnitAt(neighbor.col, neighbor.row);
            if (adjacentUnit &&
                adjacentUnit.faction === unit.faction &&
                adjacentUnit.health > 0 &&
                adjacentUnit.isWagon && adjacentUnit.isWagon() &&
                adjacentUnit.formationClosed) {  // WP1: jen sepnutí sousedé tvoří řetěz
                adjacentWagons++;
                wagonNeighbors.push(adjacentUnit);
            }
        }

        // Pro linii potřebujeme alespoň 2 sousední vozy (celkem 3+ v linii)
        if (adjacentWagons >= 2) {
            return {
                inLine: true,
                wagonCount: adjacentWagons + 1,
                // P4: pochodová linie drží jen POLOVIČNÍ formační kryt (hradba za pohybu)
                defenseBonus: unit.marching ? 5 : 10
            };
        }

        return null;
    }

    // WP1: přepnutí stavu jednoho vozu (sepnout/rozevřít). Utratí pohyb, střílet smí dál.
    toggleWagonFormation(unit) {
        if (!unit || !unit.isWagon() || unit.faction !== this.currentFaction) return false;
        if (unit.hasMoved) return false; // vůz už v tomto tahu jednal
        unit.formationClosed = !unit.formationClosed;
        unit.hasMoved = true;
        this.addLog(i18n.t(unit.formationClosed ? 'gameLog.wagonClosed' : 'gameLog.wagonOpened', { unit: unit.name }), 'turn');
        this.updateUnitPanel(unit);
        this.render();
        return true;
    }

    // WP1: přepne celou souvisle propojenou řadu vozů (BFS přes hex-sousednost).
    // Cílový stav udá výchozí vůz; už jednavší vozy se přeskočí, ale souvislost drží.
    toggleWagonFormationLine(startUnit) {
        if (!startUnit || !startUnit.isWagon() || startUnit.faction !== this.currentFaction) return false;
        if (startUnit.hasMoved) return false; // vůz už v tomto tahu jednal (souměrné s toggleWagonFormation)
        const targetState = !startUnit.formationClosed;
        const visited = new Set([startUnit.id]);
        const queue = [startUnit];
        let toggled = 0;
        while (queue.length) {
            const w = queue.shift();
            if (!w.hasMoved && w.formationClosed !== targetState) {
                w.formationClosed = targetState;
                w.hasMoved = true;
                toggled++;
            }
            for (const n of this.hexGrid.getNeighbors(w.col, w.row)) {
                const u = this.getUnitAt(n.col, n.row);
                if (u && u.health > 0 && u.faction === startUnit.faction && u.isWagon() && !visited.has(u.id)) {
                    visited.add(u.id);
                    queue.push(u);
                }
            }
        }
        if (toggled > 0) {
            this.addLog(i18n.t(targetState ? 'gameLog.wagonLineClosed' : 'gameLog.wagonLineOpened', { count: toggled }), 'turn');
        }
        this.updateUnitPanel(startUnit);
        this.render();
        return toggled > 0;
    }

    // P4: souvislá řada spřátelených vozů (BFS přes hex-sousednost).
    // closedOnly=true zahrne jen SEPNUTÉ vozy (pro pochodovou linii a hradbu).
    connectedWagonLine(startUnit, closedOnly = false) {
        const line = [];
        const visited = new Set([startUnit.id]);
        const queue = [startUnit];
        while (queue.length) {
            const w = queue.shift();
            if (!closedOnly || w.formationClosed) line.push(w);
            for (const n of this.hexGrid.getNeighbors(w.col, w.row)) {
                const u = this.getUnitAt(n.col, n.row);
                if (u && u.health > 0 && u.faction === startUnit.faction &&
                    u.isWagon() && !visited.has(u.id) &&
                    (!closedOnly || u.formationClosed)) {
                    visited.add(u.id);
                    queue.push(u);
                }
            }
        }
        return line;
    }

    // P4: přepne celou souvislou řadu SEPNUTÝCH vozů mezi pevnou hradbou a
    // pochodovým šikem. Zdarma (neutratí tah) - je to změna postoje; cenu platí
    // až samotný pochod. Rozpojený vůz nelze rozpochodovat - nejdřív sepni hradbu.
    toggleWagonMarch(startUnit) {
        if (!startUnit || !startUnit.isWagon() || startUnit.faction !== this.currentFaction) return false;
        if (!startUnit.formationClosed) {
            this.addLog(i18n.t('gameLog.wagonMustCloseFirst'), 'turn');
            Sound.playInvalid();
            return false;
        }
        const targetMarching = !startUnit.marching;
        const line = this.connectedWagonLine(startUnit, true);
        let changed = 0;
        for (const w of line) {
            if (w.marching !== targetMarching) {
                w.marching = targetMarching;
                changed++;
            }
        }
        if (changed > 0) {
            this.addLog(i18n.t(targetMarching ? 'gameLog.wagonMarchOn' : 'gameLog.wagonMarchOff', { count: changed }), 'turn');
        }
        this.updateUnitPanel(startUnit);
        // pochodová hradba smí jet - přepočítej zvýraznění pohybu
        if (this.selectedUnit === startUnit) {
            this.hexGrid.setHighlighted(startUnit.canMove() ? this.getValidMoves(startUnit) : []);
        }
        this.render();
        return changed > 0;
    }

    _marchBlocked() {
        this.addLog(i18n.t('gameLog.wagonMarchBlocked'), 'turn');
        Sound.playInvalid();
        return false;
    }

    // P4: hexy, kam může pochodová linie (obsahující unit) šlápnout - jeden hex
    // v každém ze 6 směrů, ale JEN pokud tam projdou VŠECHNY vozy linie (tuhý posun).
    getWagonMarchTargets(unit) {
        const line = this.connectedWagonLine(unit, true).filter(w => w.marching);
        if (line.length === 0 || line.some(w => w.hasMoved)) return [];
        const lineIds = new Set(line.map(w => w.id));
        const frozen = this.currentScenario?.specialMechanics?.frozenRiver;
        const result = [];
        for (let dir = 0; dir < 6; dir++) {
            let ok = true;
            for (const w of line) {
                const t = this.hexGrid.getNeighborInDirection(w.col, w.row, dir);
                if (!this.hexGrid.inBounds(t.col, t.row)) { ok = false; break; }
                if (this.hexGrid.getTerrain(t.col, t.row) === 'water' && !frozen) { ok = false; break; }
                const occ = this.getUnitAt(t.col, t.row);
                if (occ && !lineIds.has(occ.id)) { ok = false; break; }
            }
            if (ok) {
                const t = this.hexGrid.getNeighborInDirection(unit.col, unit.row, dir);
                result.push({ col: t.col, row: t.row });
            }
        }
        return result;
    }

    // P4: skupinový pochod - posune celou souvislou pochodovou linii o 1 hex ve
    // směru dir (index 0-5) jako TUHÝ celek. Buď se pohnou všechny vozy, nebo
    // žádný (když je kterýkoli cíl mimo mapu / voda / obsazený cizí jednotkou).
    marchWagonLine(startUnit, dir) {
        if (!startUnit || !startUnit.isWagon() || !startUnit.marching) return false;
        if (startUnit.faction !== this.currentFaction) return false;

        const line = this.connectedWagonLine(startUnit, true).filter(w => w.marching);
        if (line.some(w => w.hasMoved)) {
            this.addLog(i18n.t('gameLog.wagonAlreadyMoved'), 'turn');
            Sound.playInvalid();
            return false;
        }

        const lineIds = new Set(line.map(w => w.id));
        const frozen = this.currentScenario?.specialMechanics?.frozenRiver;
        const targets = [];
        for (const w of line) {
            const t = this.hexGrid.getNeighborInDirection(w.col, w.row, dir);
            if (!this.hexGrid.inBounds(t.col, t.row)) return this._marchBlocked();
            if (this.hexGrid.getTerrain(t.col, t.row) === 'water' && !frozen) return this._marchBlocked();
            const occ = this.getUnitAt(t.col, t.row);
            if (occ && !lineIds.has(occ.id)) return this._marchBlocked();
            targets.push({ w, col: t.col, row: t.row });
        }

        // Skupinový pochod je nevratný; undo neřešíme. Overwatch a zamrzlá řeka se
        // u skupinového pochodu záměrně neaplikují - cenou pochodu je poloviční kryt.
        this.lastMove = null;
        Sound.playWagonFort();
        for (const { w, col, row } of targets) {
            w.col = col;
            w.row = row;
            w.hasMoved = true;
        }
        this.addLog(i18n.t('gameLog.wagonMarched', { count: line.length }), 'move');

        if (this.fogOfWar) this.fogOfWarSystem.updateVisibility();
        // escape zóny - pochodová hradba může odvézt jednotky do bezpečí
        for (const { w } of targets) {
            if (w.health > 0) this.checkEscapeZone(w);
        }

        // ponech výběr, přepočítej zvýraznění (linie už tento tah jela -> prázdné)
        if (this.selectedUnit && lineIds.has(this.selectedUnit.id)) {
            this.hexGrid.setSelected(this.selectedUnit.col, this.selectedUnit.row);
            this.hexGrid.setHighlighted([]);
            this.updateUnitPanel(this.selectedUnit);
        }
        this.render();
        this.victoryConditionsSystem.checkVictory();
        return true;
    }

    // Kontrola, zda je střelec za vozovou hradbou (střílna)
    isShooterBehindWagon(shooter) {
        // Pouze pro střelecké jednotky
        if (!shooter.range || shooter.range <= 1) return null;
        if (shooter.faction !== 'hussites') return null;

        // Kontrola, zda je vedle vozu (za hradbou)
        const neighbors = this.hexGrid.getNeighbors(shooter.col, shooter.row);

        for (const neighbor of neighbors) {
            const adjacentUnit = this.getUnitAt(neighbor.col, neighbor.row);
            if (adjacentUnit &&
                adjacentUnit.faction === shooter.faction &&
                adjacentUnit.health > 0 &&
                adjacentUnit.isWagon && adjacentUnit.isWagon()) {
                return {
                    behindWagon: true,
                    attackBonus: 5, // +5 k útoku ze střílny
                    defenseBonus: 10 // Také lepší krytí
                };
            }
        }

        return null;
    }

    // Efekt průlomu - když je vůz zničen, okolní vozy dočasně ztratí bonus
    onWagonDestroyed(wagon) {
        const neighbors = this.hexGrid.getNeighbors(wagon.col, wagon.row);

        for (const neighbor of neighbors) {
            const adjacentUnit = this.getUnitAt(neighbor.col, neighbor.row);
            if (adjacentUnit &&
                adjacentUnit.faction === wagon.faction &&
                adjacentUnit.health > 0 &&
                adjacentUnit.isWagon && adjacentUnit.isWagon()) {
                // Označit vůz jako "průlom" - ztráta formačního bonusu na 1 kolo
                adjacentUnit.breachedTurns = 1;
                this.addLog(i18n.t('gameLog.wagonBreakthrough', {unit: adjacentUnit.name}), 'combat');
            }
        }
    }


    // Reset průlomu na začátku tahu
    resetBreachedWagons() {
        for (const unit of this.units) {
            if (unit.breachedTurns && unit.breachedTurns > 0) {
                unit.breachedTurns--;
            }
        }
    }
}
