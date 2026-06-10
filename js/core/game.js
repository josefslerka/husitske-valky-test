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
        this.initialPlayerUnits = 0;
        this.initialEnemyUnits = 0;

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

        // Regenerace - sledování jednotek které již regenerovaly
        this.regeneratedUnits = new Set();

        // Mlha války - viditelnost
        this.fogOfWar = true; // Zapnuto defaultně
        this.visibleHexes = new Set(); // Hexy viditelné hráčem
        this.exploredHexes = new Set(); // Hexy které hráč někdy viděl

        // Morální zlom - útěk nepřátel
        this.moraleBroken = false;
        this.routingUnits = new Set(); // Jednotky na útěku

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
        this.gameState = 'destroyed';
    }

    // Inicializace nové hry (výchozí bez scénáře)
    initGame() {
        this.units = [];
        this.currentFaction = 'hussites';
        this.turnNumber = 1;
        this.selectedUnit = null;
        this.gameState = 'playing';
        this.log = [];
        this.currentScenario = null;
        this.currentPhase = null;
        this.processedEvents = new Set();

        // Reset speciálních schopností
        this.choralUsed = false;
        this.choralActive = false;
        this.choralTurnsRemaining = 0;
        this.regeneratedUnits = new Set();
        this.escapedUnits = 0;

        // Reset mlhy války a morálky (fogOfWar se nastaví z main.js podle nastavení)
        // this.fogOfWar zůstává jak bylo nastaveno
        this.visibleHexes = new Set();
        this.exploredHexes = new Set();
        this.moraleBroken = false;
        this.routingUnits = new Set();

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
        this.log = [];
        this.currentScenario = scenario;
        this.processedEvents = new Set();
        this.currentPhase = null;  // Reset fáze při načtení scénáře

        // Reset statistik
        this.enemiesKilled = 0;
        this.unitsLost = 0;

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
        this.regeneratedUnits = new Set();
        this.escapedUnits = 0;
        this.objectiveHeldTurns = {};  // Pro dual_objective sledování

        // Reset mlhy války a morálky (fogOfWar se nastaví z main.js podle nastavení)
        // this.fogOfWar zůstává jak bylo nastaveno před voláním této metody
        this.visibleHexes = new Set();
        this.exploredHexes = new Set();
        this.moraleBroken = false;
        this.routingUnits = new Set();

        // Aplikace terénu ze scénáře
        ScenarioManager.applyScenarioTerrain(this.hexGrid, scenario);

        // Převod souřadnic ve victoryConditions na mapové souřadnice
        this.convertVictoryConditionPositions(scenario);

        // Nastavení escape zóny (pokud existuje)
        if (scenario.victoryConditions && scenario.victoryConditions.primary && scenario.victoryConditions.primary.type === 'escape') {
            const escapeZone = scenario.victoryConditions.primary.escapeZone || [];
            // escapeZone je již převedena v convertVictoryConditionPositions
            this.hexGrid.setEscapeZone(escapeZone.map(([col, row]) => ({ col, row })));
        }

        // Nastavení map labels (názvy měst, řek, etc.) - s převodem souřadnic
        this.hexGrid.mapLabels = (scenario.mapLabels || []).map(label => ({
            text: label.text,
            hexes: label.hexes.map(([col, row]) => {
                const mapped = this.hexGrid.scenarioToMap(col, row);
                return [mapped.col, mapped.row];
            })
        }));

        // Vytvoření jednotek ze scénáře
        this.units = ScenarioManager.createScenarioUnits(scenario, this.unitFactory, this.hexGrid);

        // Aplikace speciální počáteční morálky (např. Tachov - demoralizovaní křižáci)
        if (scenario.specialMechanics && scenario.specialMechanics.startingMorale) {
            for (const [faction, morale] of Object.entries(scenario.specialMechanics.startingMorale)) {
                for (const unit of this.units) {
                    if (unit.faction === faction) {
                        unit.morale = morale;
                    }
                }
            }
            this.addLog(i18n.t('gameLog.enemyDemoralized'), 'morale');
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

        // Vycentruj pohled na střed husitských jednotek
        this.centerOnPlayerForces();
    }

    // Vycentrování pohledu na střed hráčových jednotek při startu
    centerOnPlayerForces() {
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) return;

        // Najdi všechny husitské jednotky
        const playerUnits = this.units.filter(u => u.faction === 'hussites');
        if (playerUnits.length === 0) return;

        // Spočítej střed jejich pozic
        let sumX = 0, sumY = 0;
        for (const unit of playerUnits) {
            const pos = this.hexGrid.hexToPixel(unit.col, unit.row);
            sumX += pos.x;
            sumY += pos.y;
        }
        const centerX = sumX / playerUnits.length;
        const centerY = sumY / playerUnits.length;

        // Centruj pohled
        const containerWidth = mapContainer.clientWidth;
        const containerHeight = mapContainer.clientHeight;

        mapContainer.scrollLeft = centerX - containerWidth / 2;
        mapContainer.scrollTop = centerY - containerHeight / 2;
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
                this.showEventNotification(event.title || 'Zpráva', event.text);
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
                    this.showEventNotification('Morálka', event.text);
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
                    const panicLevel = event.level || 1; // 1 = mírná, 2 = střední, 3 = těžká

                    for (const unit of affectedUnits) {
                        // Snížení útoku kvůli panice
                        const attackPenalty = panicLevel * 5;
                        unit.attack = Math.max(1, unit.attack - attackPenalty);

                        // Těžká panika může způsobit okamžitý útěk některých jednotek
                        if (panicLevel >= 3 && Math.random() < 0.3) {
                            this.routingUnits.add(unit);
                            unit.isRouting = true;
                            this.addLog(i18n.t('gameLog.panicFlee', {unit: unit.name}), 'morale');
                        }
                    }

                    if (event.text) {
                        this.showEventNotification('Panika!', event.text);
                    }
                    this.addLog(i18n.t('gameLog.enemyPanic', {penalty: panicLevel * 5}), 'morale');
                }
                break;

            case 'rout':
                // Hromadný útěk - celá armáda začne prchat
                if (event.faction) {
                    const routingFaction = this.units.filter(u => u.faction === event.faction && u.health > 0);
                    for (const unit of routingFaction) {
                        this.routingUnits.add(unit);
                        unit.isRouting = true;
                    }
                    this.moraleBroken = true;
                    if (event.text) {
                        this.showEventNotification('Hromadný útěk!', event.text);
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
                        this.showEventNotification(event.title || 'Příkopy', event.text);
                    }
                    this.addLog('Husitské jednotky v příkopech získávají +3 k obraně!', 'turn');
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
                        this.showEventNotification(event.title || 'Sesednutí!', event.text);
                    }
                    if (dismountedUnits.length > 0) {
                        this.addLog(`${dismountedUnits.length} jízdních jednotek muselo sesednout na svahu!`, 'combat');
                    }
                }
                break;

            case 'tutorial':
                // Pozůstatek tutoriálových TIPů ve scénářích - jen zobrazit text
                if (event.text) {
                    this.showEventNotification('💡 TIP', event.text);
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
                        this.showEventNotification('Morálka', event.text);
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
                        this.showEventNotification('Útok jízdy zastaven', event.text);
                    }
                    if (blocked > 0) {
                        this.addLog(`${blocked} jízdních jednotek ztratilo bonus nárazu!`, 'combat');
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
                        this.showEventNotification('Vozová hradba', event.text);
                    }
                    if (boosted > 0) {
                        this.addLog(`${boosted} jednotek za vozy získává +3 k obraně!`, 'turn');
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
                        this.showEventNotification('Terén', event.text);
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
                        this.showEventNotification('Útok!', event.text);
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
                        this.showEventNotification(event.title || 'Masakr!', event.text);
                    }
                    if (massacreTargets.length > 0) {
                        this.addLog(`Masakr! ${massacreTargets.length} nepřátelských jednotek utrpělo těžké ztráty.`, 'combat');
                    }
                    this.render();
                }
                break;

            default:
                // Neznámý typ eventu - zobraz aspoň vyprávění, ať se text
                // tiše neztratí, a upozorni do konzole
                if (event.text || event.message) {
                    this.showEventNotification(event.title || 'Událost', event.text || event.message);
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
                    this.showEventNotification('Posily!', hussiteForces.reinforcements.message);
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
                    this.showEventNotification('Posily nepřítele!', crusaderForces.reinforcements.message);
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
                            const title = reinf.faction === 'hussites' ? 'Posily!' : 'Posily nepřítele!';
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
            this.units.push(unit);

            this.addLog(i18n.t('gameLog.reinforcements', {unit: unit.name}), 'turn');
        }

        this.updateArmyOverview();
        this.render();
    }

    // Zobrazení notifikace eventu
    showEventNotification(title, text) {
        // Vytvoření notifikace
        const notification = document.createElement('div');
        notification.className = 'event-notification';
        notification.innerHTML = `
            <h3>${title}</h3>
            <p>${text}</p>
            <button>Pokračovat</button>
        `;

        document.body.appendChild(notification);

        // Zavření notifikace
        notification.querySelector('button').addEventListener('click', () => {
            notification.remove();
        });

        // Automatické zavření po 10 sekundách
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
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

        // Tlačítko konce tahu
        document.getElementById('btn-end-turn').addEventListener('click', () => this.endTurn(), { signal });

        // Tlačítko obrany
        document.getElementById('btn-defend').addEventListener('click', () => this.combatSystem.defendSelectedUnit(), { signal });

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
            const factionName = unit.faction === 'hussites' ? 'Husité' : 'Křižáci';
            const healthPercent = Math.round((unit.health / unit.maxHealth) * 100);

            // Získej viditelnost jednotky
            const visionRange = this.fogOfWarSystem.getUnitSightRange(unit);

            html = `
                <div class="tooltip-title">${unit.name}</div>
                <div class="tooltip-faction">${factionName}</div>
                <div class="tooltip-stats">
                    <div class="tooltip-stat"><span class="label">HP:</span> ${unit.health}/${unit.maxHealth}</div>
                    <div class="tooltip-stat"><span class="label">Útok:</span> ${unit.attack}</div>
                    <div class="tooltip-stat"><span class="label">Obrana:</span> ${unit.defense}</div>
                    <div class="tooltip-stat"><span class="label">Dosah:</span> ${unit.special === 'reach' && unit.range === 1 ? '1-2' : unit.range}</div>
                    <div class="tooltip-stat"><span class="label">Pohyb:</span> ${unit.movement}</div>
                    <div class="tooltip-stat"><span class="label">👁 Viditelnost:</span> ${visionRange}</div>
                </div>
            `;

            // Speciální schopnost (přeskočíme commander - ten má vlastní sekci)
            if (unit.special && unit.special !== 'commander') {
                const specialNames = {
                    armorPiercing: 'Drtivý úder (+30% vs obrněné)',
                    reach: 'Dosah (útok přes spojence)',
                    shieldWall: 'Štítová zeď (chrání střelce)',
                    antiCavalry: 'Proti jízdě (+50% poškození)',
                    terror: 'Děs (-10% útok nepříteli)',
                    areaAttack: 'Plošný útok (50% splash)',
                    mobile: 'Mobilní (střelba po pohybu)',
                    wagenburg: 'Vozová hradba (+obrana s vozy)',
                    pursuit: 'Pronásledování (+30% vs oslabené)',
                    charge: 'Náraz (+50% z pohybu)',
                    scout: 'Zvěd (6 viditelnost, rychlý únik, skrytý pohyb)',
                    dismount: 'Sesazení (30% šance)',
                    elite: 'Elitní (+10% ke všemu)',
                    rapidFire: 'Rychlostřelba (2 útoky/tah)',
                    siege: 'Obléhání (+100% vs vozy)',
                    veteran: 'Veterán (+10% ke všemu)'
                };
                const specialName = specialNames[unit.special] || unit.special;
                html += `<div class="tooltip-special">${specialName}</div>`;
            }

            // Velitel - speciální zobrazení
            if (unit.special === 'commander' || unit.unitClass === 'commander') {
                html += `<div class="tooltip-special" style="color: #ffd700;">👑 Velitel</div>`;
            }

            if (unit.isDefending) {
                html += `<div class="tooltip-bonus">Obranný postoj (+30% obrana)</div>`;
            }

            if (unit.isTerrified) {
                html += `<div class="tooltip-debuff">Vyděšen (-10% útok)</div>`;
            }

            // Morálka
            html += `<div class="tooltip-morale" style="margin-top: 5px; padding-top: 5px; border-top: 1px solid #444;">
                <span class="label">Morálka:</span>
                <span style="color: ${unit.getMoraleColor()}">${unit.getMoraleStatus()} (${Math.round(unit.morale)}%)</span>
            </div>`;

            if (unit.isRouting) {
                html += `<div class="tooltip-debuff" style="color: #ff4444; font-weight: bold;">🏃 PRCHÁ!</div>`;
            }

            // Informace o zbývajících útocích pro rapidFire
            if (unit.special === 'rapidFire' && unit.attackCount > 0 && unit.attackCount < 2) {
                html += `<div class="tooltip-info">Zbývá ${2 - unit.attackCount} útok</div>`;
            }

            // Preview poškození při útoku - pokud je vybraná jednotka a toto je nepřítel
            if (this.selectedUnit && this.selectedUnit.faction !== unit.faction) {
                const damagePreview = this.combatSystem.calculateDamagePreview(this.selectedUnit, unit);
                if (damagePreview) {
                    html += `
                        <div class="tooltip-damage-preview">
                            <div class="damage-title">⚔️ Odhad poškození:</div>
                            <div class="damage-value">${damagePreview.min} - ${damagePreview.max} HP</div>
                            ${damagePreview.special ? `<div class="damage-range">${damagePreview.special}</div>` : ''}
                            ${unit.health <= damagePreview.max ? '<div class="damage-range" style="color: #ff6b6b;">Možné zabití!</div>' : ''}
                        </div>
                    `;
                }
            }
        }

        // Přidat info o terénu
        const hasFrozenRiver = this.currentScenario?.specialMechanics?.frozenRiver;

        const terrainNames = {
            plains: 'Pláně',
            forest: 'Les',
            hills: 'Kopce',
            water: hasFrozenRiver ? '❄️ Zamrzlá řeka' : 'Voda',
            town: 'Město',
            road: 'Cesta',
            road2: 'Cesta',
            dam: 'Hráz',
            mud: 'Bahno',
            swamp: 'Bažina',
            slope: 'Svah',
            trenches: 'Příkopy',
            church: 'Kostel'
        };

        const terrainBonuses = {
            plains: '',
            forest: '+20% obrana',
            hills: '+30% obrana',
            water: hasFrozenRiver ? '⚠️ Tenký led - těžké jednotky riskují propadnutí' : 'Neprůchodné',
            town: '+40% obrana',
            road: 'Rychlý pohyb',
            road2: 'Rychlý pohyb',
            dam: '+20% obrana',
            mud: 'Zpomaluje',
            swamp: 'Zpomaluje, +10% obrana',
            slope: '+10% obrana',
            trenches: '+30% obrana',
            church: '+20% obrana'
        };

        // Najdi map label pro tento hex
        const mapLabel = (this.hexGrid.mapLabels || []).find(l =>
            l.hexes && l.hexes.some(([c, r]) => c === hex.col && r === hex.row)
        );
        const locationName = mapLabel ? mapLabel.text : null;

        html += `
            <div class="tooltip-terrain">
                <strong>${locationName || terrainNames[terrain] || terrain}</strong>
                ${terrainBonuses[terrain] ? `<div class="tooltip-bonus">${terrainBonuses[terrain]}</div>` : ''}
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

        // Získej pozici jednotky v pixelech
        const pos = this.hexGrid.hexToPixel(unit.col, unit.row);

        // Centruj pohled na jednotku
        const containerWidth = mapContainer.clientWidth;
        const containerHeight = mapContainer.clientHeight;

        mapContainer.scrollLeft = pos.x - containerWidth / 2;
        mapContainer.scrollTop = pos.y - containerHeight / 2;
    }

    getUnitAt(col, row) {
        return this.units.find(u => u.col === col && u.row === row && u.health > 0);
    }

    // Získání validních pohybů pomocí BFS (jednotky nemohou procházet skrz sebe)
    getValidMoves(unit) {
        const moves = [];
        const range = unit.movement;

        // BFS pro nalezení všech dosažitelných polí
        const visited = new Set();
        const queue = [{ col: unit.col, row: unit.row, distance: 0 }];
        visited.add(`${unit.col},${unit.row}`);

        while (queue.length > 0) {
            const current = queue.shift();

            // Pokud jsme dosáhli maximálního dosahu, nepokračujeme dál
            if (current.distance >= range) continue;

            // Získáme sousedy aktuálního hexu
            const neighbors = this.hexGrid.getNeighbors(current.col, current.row);

            for (const neighbor of neighbors) {
                const key = `${neighbor.col},${neighbor.row}`;
                if (visited.has(key)) continue;
                visited.add(key);

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

                // Kontrola, zda je pole obsazené
                const unitAtHex = this.getUnitAt(neighbor.col, neighbor.row);

                if (unitAtHex) {
                    // Nelze vstoupit na obsazené pole
                    // Ale pokud je to spojenecká jednotka, můžeme přes ni projít (ale ne skončit na ní)
                    if (unitAtHex.faction === unit.faction) {
                        // Můžeme pokračovat v hledání přes spojence, ale nemůžeme tam skončit
                        queue.push({ col: neighbor.col, row: neighbor.row, distance: current.distance + 1 });
                    }
                    // Přes nepřátele nelze projít vůbec
                    continue;
                }

                // Prázdné pole - můžeme tam vstoupit
                moves.push({ col: neighbor.col, row: neighbor.row });

                // ZOC (Zone of Control) - kontrola, zda hex sousedí s nepřátelskou jednotkou s ZOC
                // Pokud ano, pohyb zde KONČÍ - nemůžeme pokračovat dál
                const isInEnemyZOC = this.isHexInEnemyZOC(neighbor.col, neighbor.row, unit.faction);

                if (!isInEnemyZOC) {
                    // Můžeme pokračovat dál pouze pokud nejsme v nepřátelské ZOC
                    queue.push({ col: neighbor.col, row: neighbor.row, distance: current.distance + 1 });
                }
                // Pokud jsme v ZOC, hex je dosažitelný, ale nemůžeme z něj pokračovat
            }
        }

        return moves;
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
            this.showEventNotification('Propadnutí!', `${unit.name} se propadl pod tenký led!`);
            unit.health = 0;
            this.units = this.units.filter(u => u !== unit);
            this.trackUnitDeath(unit, null);
            this.deselectUnit();
            this.render();
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
                if (primaryType === 'survive' || primaryType === 'survive_turns') {
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

            // Kontrola šíření paniky při morálním zlomu
            this.moraleSystem.checkRoutSpread();

            // Pasivní regenerace morálky pro jednotky které neprchají
            this.moraleSystem.regenerateMorale();
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
            if (primaryType === 'survive' || primaryType === 'hold_position' || primaryType === 'survive_turns') {
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

        // Fallback na generické zprávy
        if (!message) {
            if (isVictory) {
                message = 'Boží bojovníci zvítězili! Křižácká vojska byla poražena.';
            } else {
                message = 'Křižácká výprava uspěla. Husité byli poraženi.';
            }
        }

        if (isVictory) {
            Sound.playVictory();
        } else {
            Sound.playDefeat();
        }

        // Statistiky hry
        const stats = {
            turns: this.turnNumber,
            enemiesKilled: this.enemiesKilled || 0,
            unitsLost: this.unitsLost || 0,
            secondaryObjectives: this.secondaryResults || []
        };

        // Použít nový gameover modal pokud existuje
        if (typeof window.showGameOver === 'function') {
            window.showGameOver(isVictory, message, stats);
        } else {
            // Fallback na starý modal
            const modal = document.getElementById('victory-modal');
            const title = document.getElementById('victory-title');
            const msgEl = document.getElementById('victory-message');

            title.textContent = isVictory ? 'Vítězství Husitů!' : 'Vítězství Křižáků!';
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
                indicator.classList.remove('hidden');
            } else {
                indicator.classList.add('hidden');
            }
        }
    }


    // Aktualizace UI
    updateUI() {
        // Aktuální hráč
        const playerSpan = document.getElementById('current-player');
        const factionName = i18n.t(`factions.${this.currentFaction}`);
        playerSpan.textContent = `${i18n.t('game.turnLabel')} ${factionName}`;
        playerSpan.className = this.currentFaction === 'crusaders' ? 'crusaders' : '';

        // Číslo kola
        document.getElementById('turn-number').textContent = `${i18n.t('game.roundLabel')} ${this.turnNumber}`;

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
    }

    updateUnitPanel(unit) {
        const infoDiv = document.getElementById('unit-info');
        const actionsDiv = document.getElementById('unit-actions');
        const attackBtn = document.getElementById('btn-attack');

        if (!unit) {
            infoDiv.innerHTML = '<p class="no-selection">Vyberte jednotku</p>';
            actionsDiv.classList.add('hidden');
            return;
        }

        // Popis speciálních schopností
        const specialNames = {
            armorPiercing: 'Drtivý úder (+30% vs obrněné)',
            reach: 'Dosah (útok přes spojence)',
            shieldWall: 'Štítová zeď (+20% obrana střelcům)',
            antiCavalry: 'Proti jízdě (+50% poškození)',
            wagenburg: 'Vozová hradba (+15% obrana/vůz)',
            terror: 'Děs (-10% útok nepříteli)',
            pursuit: 'Pronásledování (+30% vs oslabené)',
            charge: 'Náraz (+50% po pohybu)',
            scout: 'Průzkum (+1 dohled)',
            dismount: 'Sesazení (30% šance zpomalit)',
            elite: 'Elitní (+10% ke všemu)',
            veteran: 'Veterán (+10% ke všemu)',
            rapidFire: 'Rychlostřelba (2 útoky, 75% poškození)',
            siege: 'Obléhání (+100% vs vozy)',
            areaAttack: 'Plošný útok (50% sousedům)',
            mobile: 'Mobilní (střelba po pohybu)'
        };

        // Speciální schopnost HTML
        let specialHtml = '';
        if (unit.special && unit.special !== 'commander') {
            const specialName = specialNames[unit.special] || unit.special;
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
            if (abilities.moraleBonus) abilitiesText.push(`+${abilities.moraleBonus} morálka`);
            if (abilities.attackBonus) abilitiesText.push(`+${abilities.attackBonus} útok`);
            if (abilities.defenseBonus) abilitiesText.push(`+${abilities.defenseBonus} obrana`);
            if (abilities.wagonBonus) abilitiesText.push(`+${abilities.wagonBonus} vozy`);
            if (abilities.cavalryBonus) abilitiesText.push(`+${abilities.cavalryBonus} jízda`);

            commanderHtml = `
                <div class="commander-info" style="margin: 10px 0; padding: 10px; background: rgba(139, 69, 19, 0.3); border: 2px solid #8b4513; border-radius: 6px;">
                    <div style="color: #ffd700; font-weight: bold; font-size: 1.1rem; margin-bottom: 8px;">
                        👑 VELITEL
                    </div>
                    <div style="color: #d4af37; font-size: 0.85rem; margin-bottom: 5px;">
                        Dosah aury: ${abilities.auraRange} polí
                    </div>
                    <div style="color: #aaa; font-size: 0.8rem;">
                        Bonusy: ${abilitiesText.join(', ')}
                    </div>
                    ${abilities.fearRange ? `<div style="color: #ff6b6b; font-size: 0.8rem; margin-top: 3px;">Strach: ${abilities.fearPenalty} morálky (${abilities.fearRange} polí)</div>` : ''}
                    ${abilities.rallyBonus ? `<div style="color: #66ff66; font-size: 0.8rem; margin-top: 3px;">Rally bonus: +${abilities.rallyBonus}%</div>` : ''}
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
                            <span class="aura-title">V auře velitele${nearestInfo ? ` (${nearestInfo.commander.name})` : ''}</span>
                        </div>
                        <div class="aura-values">
                            ${bonuses.attack > 0 ? `<span class="aura-value positive">+${bonuses.attack} útok</span>` : ''}
                            ${bonuses.defense > 0 ? `<span class="aura-value positive">+${bonuses.defense} obrana</span>` : ''}
                            ${bonuses.morale > 0 ? `<span class="aura-value positive">+${bonuses.morale} morálka</span>` : ''}
                        </div>
                    </div>
                `;
            }

            if (fearPenalty > 0) {
                auraEffectHtml += `
                    <div class="aura-effect aura-fear">
                        <div class="aura-header">
                            <span class="aura-icon">⚠️</span>
                            <span class="aura-title">Nepřátelský velitel!</span>
                        </div>
                        <div class="aura-values">
                            <span class="aura-value negative">-${fearPenalty} morálka</span>
                        </div>
                    </div>
                `;
            }
        }

        // Status efekty
        let statusHtml = '';
        if (unit.isTerrified) {
            statusHtml += '<span style="color: #ff8844; font-size: 0.85rem;">😨 Vyděšený (-10% útok)</span><br>';
        }
        if (unit.isDefending) {
            statusHtml += '<span style="color: #4488ff; font-size: 0.85rem;">🛡️ Obranný postoj (-30% poškození)</span><br>';
        }
        if (unit.isRouting) {
            statusHtml += '<span style="color: #ff4444; font-size: 0.85rem;">🏃 PRCHÁ!</span><br>';
        }

        // Obklíčení - dynamická kontrola
        const surroundInfo = this.checkSurrounded(unit);
        if (surroundInfo.surrounded) {
            const levelText = surroundInfo.level === 1 ? 'Částečně obklíčen' :
                              surroundInfo.level === 2 ? 'Silně obklíčen' : 'Zcela obklíčen';
            const penalty = surroundInfo.level * 10;
            statusHtml += `<span style="color: #ff6666; font-size: 0.85rem;">⚔️ ${levelText} (-${penalty}% obrana, -${surroundInfo.level * 5} morálka/tah)</span><br>`;
        }

        infoDiv.innerHTML = `
            <h3>${unit.name}</h3>
            <p style="font-size: 0.8rem; color: #999; margin-bottom: 8px; font-style: italic;">${unit.description}</p>
            ${commanderHtml}
            ${specialHtml}

            ${auraEffectHtml}

            <div class="unit-stats-grid">
                <div class="unit-stat">
                    <span><span class="stat-icon">⚔</span><span class="label">Útok</span></span>
                    <span class="value">${unit.attack}</span>
                </div>
                <div class="unit-stat">
                    <span><span class="stat-icon">🛡</span><span class="label">Obrana</span></span>
                    <span class="value">${unit.defense}</span>
                </div>
                <div class="unit-stat">
                    <span><span class="stat-icon">📏</span><span class="label">Dosah</span></span>
                    <span class="value">${unit.range}</span>
                </div>
                <div class="unit-stat">
                    <span><span class="stat-icon">👣</span><span class="label">Pohyb</span></span>
                    <span class="value">${unit.movement}</span>
                </div>
            </div>

            <div class="health-bar" style="margin-top: 8px; position: relative;">
                <div class="health-bar-fill" style="width: ${(unit.health / unit.maxHealth) * 100}%"></div>
                <span class="health-bar-text">${unit.health}/${unit.maxHealth}</span>
            </div>

            <div class="morale-section" style="padding-top: 8px; border-top: 1px solid rgba(201, 162, 39, 0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-size: 0.75rem; color: #888; text-transform: uppercase;">Morálka</span>
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
            version: 2,
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
            escapedUnits: this.escapedUnits || 0,
            stats: this.stats,
            initialPlayerUnits: this.initialPlayerUnits,
            initialEnemyUnits: this.initialEnemyUnits,
            // Chorál a morální zlom
            choralUsed: this.choralUsed,
            choralActive: this.choralActive,
            choralTurnsRemaining: this.choralTurnsRemaining,
            moraleBroken: this.moraleBroken,
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

            // Kontrola verze (v1 = staré savy bez stavu scénáře)
            if (saveData.version !== 1 && saveData.version !== 2) {
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
            this.escapedUnits = saveData.escapedUnits || 0;
            if (saveData.stats) {
                this.stats = saveData.stats;
            }
            if (saveData.initialPlayerUnits !== undefined) {
                this.initialPlayerUnits = saveData.initialPlayerUnits;
                this.initialEnemyUnits = saveData.initialEnemyUnits;
            }

            // Chorál a morální zlom
            this.choralUsed = saveData.choralUsed || false;
            this.choralActive = saveData.choralActive || false;
            this.choralTurnsRemaining = saveData.choralTurnsRemaining || 0;
            this.moraleBroken = saveData.moraleBroken || false;

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
        const neighbors = this.hexGrid.getNeighbors(unit.col, unit.row);
        const enemyFaction = unit.faction === 'hussites' ? 'crusaders' : 'hussites';

        // Zjistíme, na kterých směrech jsou nepřátelé (0-5)
        const enemyDirections = [];
        for (let i = 0; i < 6; i++) {
            if (i < neighbors.length) {
                const neighbor = neighbors[i];
                const enemyAtPos = this.units.find(u =>
                    u.col === neighbor.col &&
                    u.row === neighbor.row &&
                    u.faction === enemyFaction &&
                    u.health > 0
                );
                if (enemyAtPos) {
                    enemyDirections.push(i);
                }
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

    // Sledování smrti jednotek pro statistiky
    trackUnitDeath(deadUnit, killer) {
        const playerFaction = this.currentScenario?.playerFaction || 'hussites';

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
        // Kontrola terénu - město
        const terrain = this.hexGrid.getTerrain(unit.col, unit.row);
        if (terrain && terrain.type === 'town') {
            return { type: 'town', name: 'město' };
        }

        // Kontrola sousedních polí pro vozy
        const neighbors = this.hexGrid.getNeighbors(unit.col, unit.row);
        for (const neighbor of neighbors) {
            const adjacentUnit = this.getUnitAt(neighbor.col, neighbor.row);
            if (adjacentUnit &&
                adjacentUnit.faction === unit.faction &&
                adjacentUnit.health > 0 &&
                adjacentUnit.isWagon && adjacentUnit.isWagon()) {
                return { type: 'wagon', name: 'vozová hradba' };
            }
        }

        return null;
    }

    // Pasivní regenerace zdraví na konci tahu
    regenerateHealth() {
        // Regenerace pouze na začátku husitského tahu (po křižáckém tahu)
        if (this.currentFaction !== 'hussites') return;

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
        phaseName.textContent = '⚔️ Chorál!';
        phaseDesc.textContent = '+50% útok, -20% obrana (2 kola)';

        // Aktualizace tlačítka
        this.updateChoralButton();

        this.render();
        return true;
    }

    // Aktualizace stavu tlačítka chorálu
    updateChoralButton() {
        const choralBtn = document.getElementById('btn-choral');
        if (!choralBtn) return;

        if (this.choralActive) {
            // Chorál je aktivní - zobrazit zbývající kola
            choralBtn.disabled = true;
            choralBtn.classList.add('active');
            choralBtn.textContent = `⚔️ Chorál (${this.choralTurnsRemaining} kola)`;
        } else if (this.choralUsed) {
            // Chorál byl použit a už vypršel
            choralBtn.disabled = true;
            choralBtn.classList.remove('active');
            choralBtn.textContent = '⚔️ Chorál (použit)';
        } else {
            choralBtn.disabled = this.currentFaction !== 'hussites';
            choralBtn.classList.remove('active');
            choralBtn.textContent = '⚔️ Chorál';
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
                phaseDesc.textContent = `+50% útok, -20% obrana (${this.choralTurnsRemaining} kolo)`;
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

        const neighbors = this.hexGrid.getNeighbors(unit.col, unit.row);
        let adjacentWagons = 0;
        const wagonNeighbors = [];

        for (const neighbor of neighbors) {
            const adjacentUnit = this.getUnitAt(neighbor.col, neighbor.row);
            if (adjacentUnit &&
                adjacentUnit.faction === unit.faction &&
                adjacentUnit.health > 0 &&
                adjacentUnit.isWagon && adjacentUnit.isWagon()) {
                adjacentWagons++;
                wagonNeighbors.push(adjacentUnit);
            }
        }

        // Pro linii potřebujeme alespoň 2 sousední vozy (celkem 3+ v linii)
        if (adjacentWagons >= 2) {
            return {
                inLine: true,
                wagonCount: adjacentWagons + 1,
                defenseBonus: 10 // Extra +10% obrana za formaci
            };
        }

        return null;
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
