#!/usr/bin/env node
const assert = require('node:assert/strict');
const { createHarness } = require('./helpers/game-harness');
const tests = [];
const test = (name, run) => tests.push({ name, run });

// Malý skutečný scénář: žádné přepisování metod Game ani ScenarioManager.
function fixture(overrides = {}) {
    const h = createHarness();
    h.Scenarios.event_regression = {
        id: 'event_regression', name: 'Regresní bitva', playerFaction: 'hussites',
        mapSize: { width: 16, height: 10 }, terrain: {},
        briefing: { hussites: 'Začátek bitvy' },
        forces: {
            hussites: { units: [{ type: 'CEPNICI', col: 1, row: 1 }] },
            crusaders: { units: [{ type: 'KOPINICI', col: 13, row: 8 }] }
        },
        phases: [
            { id: 1, name: 'Obrana', turnRange: [1, 2], events: [] },
            { id: 2, name: 'Protiútok', turnRange: [3, 6], events: [] }
        ],
        ...overrides
    };
    delete h.context.document;
    delete h.context.window;
    const game = h.newGame('event_regression');
    return { h, game, player: game.units[0], enemy: game.units[1] };
}

function addReinforcements(scenario, turn = 3) {
    scenario.forces.hussites.reinforcements = {
        turn, message: 'Husitské posily', units: [{ type: 'CEPNICI', col: 2, row: 1 }]
    };
    scenario.forces.crusaders.reinforcements = {
        turn, message: 'Křižácké posily', units: [{ type: 'HOUFNICE', col: 12, row: 8 }]
    };
    scenario.reinforcements = {
        allies: { turn, faction: 'hussites', message: 'Spojenci', units: [{ type: 'RUCNICARI', col: 3, row: 1 }] },
        reserve: { turn: turn + 1, units: [{ type: 'HALAPARTNICI', col: 11, row: 8 }] }
    };
}

function refresh(game, turn) {
    game.turnNumber = turn;
    game.updatePhase();
    game.checkPhaseEvents();
}

test('fáze přechází na hranici kola a opakovaná kontrola neopakuje log', () => {
    const { game } = fixture();
    assert.equal(game.currentPhase.id, 1);
    const before = game.log.length;
    game.updatePhase(); refresh(game, 2);
    assert.equal(game.currentPhase.id, 1);
    assert.equal(game.log.length, before);
    refresh(game, 3);
    assert.equal(game.currentPhase.id, 2);
    assert.equal(game.log.length, before + 1);
    refresh(game, 7);
    assert.equal(game.currentPhase.id, 2, 'po konci rozsahu zůstane poslední fáze');
    assert.equal(game.log.length, before + 1);
});

test('události stejného typu a kola mají samostatná ID a proběhnou právě jednou', () => {
    const { game } = fixture({ phases: [{ id: 1, name: 'Útok', turnRange: [1, 5], events: [
        { trigger: 'turn_1', type: 'message', text: 'První zpráva' },
        { id: 'second', trigger: 'turn_1', type: 'message', title: 'Titulek', text: 'Druhá zpráva' },
        { trigger: 'turn_2', type: 'message', text: 'Pozdější zpráva' }
    ] }] });
    game.checkPhaseEvents(); game.checkPhaseEvents();
    assert.deepEqual(game.view.notifications.map(event => event.text), ['První zpráva', 'Druhá zpráva']);
    assert.deepEqual([...game.processedEvents], ['phase1_evt0', 'second']);
    assert.equal(game.view.notifications[0].title, 'Útok');
    assert.equal(game.view.notifications[1].title, 'Titulek');
    refresh(game, 2); game.checkPhaseEvents();
    assert.equal(game.view.notifications.length, 3);
});

test('podmíněný event čeká na podmínku i časové okno a později se neopakuje', () => {
    const area = { minCol: 0, maxCol: 3, minRow: 0, maxRow: 3 };
    const { game, enemy } = fixture({ phases: [{ id: 1, name: 'Léčka', turnRange: [1, 6], events: [
        { id: 'ambush', trigger: 'turn_2', triggerBefore: 'turn_4', type: 'message', text: 'Léčka',
            condition: { type: 'units_in_area', faction: 'crusaders', area } },
        { id: 'expired', trigger: 'turn_1', triggerBefore: 'turn_2', type: 'message', text: 'Pozdě',
            condition: { type: 'units_routing', faction: 'crusaders' } }
    ] }] });
    enemy.col = 2; enemy.row = 2;
    game.checkPhaseEvents();
    assert.equal(game.processedEvents.size, 0, 'podmínka sama před triggerem nestačí');
    enemy.col = 13; enemy.row = 8;
    refresh(game, 2);
    assert.equal(game.processedEvents.size, 0, 'čas sám bez podmínky nestačí');
    enemy.col = 2; enemy.row = 2; enemy.isRouting = true;
    refresh(game, 3); refresh(game, 4); refresh(game, 5);
    assert.deepEqual([...game.processedEvents], ['ambush']);
    assert.equal(game.view.notifications.length, 1);
});

test('oba formáty posil přijdou ve správném kole, na správnou stranu a jen jednou', () => {
    const { game } = fixture();
    addReinforcements(game.currentScenario);
    refresh(game, 2);
    assert.equal(game.units.length, 2);
    refresh(game, 3); game.checkReinforcements(); game.checkPhaseEvents();
    assert.equal(game.units.length, 5);
    assert.equal(game.initialPlayerUnits, 1);
    assert.equal(game.initialEnemyUnits, 1);
    const added = game.units.filter(unit => unit.isReinforcement);
    assert.deepEqual(Array.from(added, unit => [unit.type, unit.faction, unit.col, unit.row]), [
        ['CEPNICI', 'hussites', 2, 1], ['HOUFNICE', 'crusaders', 12, 8], ['RUCNICARI', 'hussites', 3, 1]
    ]);
    assert.equal(game.view.notifications.length, 3);
    assert.deepEqual([...game.processedEvents], ['reinf-hussites-3', 'reinf-crusaders-3', 'reinf-scenario-allies-3']);
    refresh(game, 4); game.checkReinforcements();
    assert.equal(game.units.length, 6);
    assert.equal(game.units[5].faction, 'crusaders', 'výchozí frakce scénářových posil');
});

test('obsazený vstup posil použije sousední volný průchodný hex', () => {
    const { game, player } = fixture();
    const neighbors = game.hexGrid.getNeighbors(player.col, player.row);
    game.hexGrid.setTerrain(neighbors[0].col, neighbors[0].row, 'water');
    game.spawnReinforcements({ type: 'CEPNICI', position: [player.col, player.row], count: 1 }, 'hussites');
    const unit = game.units[2];
    assert.equal(unit.col, neighbors[1].col); assert.equal(unit.row, neighbors[1].row);
    assert.equal(unit.isReinforcement, true);
});

test('přechod z nepřátelského tahu vyřídí fázi, event i posily právě jednou', () => {
    const { game } = fixture();
    addReinforcements(game.currentScenario);
    game.currentScenario.phases[1].events = [{ trigger: 'turn_3', type: 'message', text: 'Nová fáze' }];
    game.currentFaction = 'crusaders'; game.turnNumber = 2;
    game.endTurn();
    assert.equal(game.currentFaction, 'hussites'); assert.equal(game.turnNumber, 3);
    assert.equal(game.currentPhase.id, 2); assert.equal(game.units.length, 5);
    assert.deepEqual(game.view.notifications.map(event => event.text), ['Nová fáze', 'Husitské posily', 'Křižácké posily', 'Spojenci']);
    assert.equal(game.gameState, 'playing');
});

test('načtení před příchodem posil nehraje úvod znovu a zachová budoucí eventy', () => {
    const { h, game, enemy } = fixture({ phases: [{ id: 1, name: 'Bitva', turnRange: [1, 6], events: [
        { id: 'initial', trigger: 'turn_1', type: 'morale_drop', amount: 3, text: 'Úvod' },
        { id: 'later', trigger: 'turn_3', type: 'morale_drop', amount: 2, text: 'Později' }
    ] }] });
    // Data patří scénáři, ne savu: registrovaná báze musí znát budoucí posily.
    addReinforcements(game.currentScenario);
    addReinforcements(h.Scenarios.event_regression);
    const morale = enemy.morale;
    assert.equal(game.saveGame(), true);
    const restored = h.SaveGameSystem.load(h.document.getElementById('game-canvas'), game);
    restored.checkPhaseEvents();
    assert.equal(restored.units[1].morale, morale);
    assert.equal(restored.view.notifications.length, 0);
    assert.deepEqual([...restored.processedEvents], ['initial']);
    refresh(restored, 3); restored.checkPhaseEvents();
    assert.equal(restored.units[1].morale, morale - 10);
    assert.equal(restored.units.length, 5);
    assert.equal(restored.view.notifications.filter(event => event.text === 'Později').length, 1);
});

test('načtení po příchodu posil zachová ID, účinky i deduplikaci obou formátů', () => {
    const { h, game } = fixture();
    addReinforcements(game.currentScenario);
    addReinforcements(h.Scenarios.event_regression);
    refresh(game, 3);
    const ids = Array.from(game.units, unit => unit.id);
    const processed = [...game.processedEvents];
    assert.equal(game.saveGame(), true);
    const restored = h.SaveGameSystem.load(h.document.getElementById('game-canvas'), game);
    restored.checkPhaseEvents(); restored.checkReinforcements();
    assert.deepEqual(Array.from(restored.units, unit => unit.id), ids);
    assert.deepEqual([...restored.processedEvents], processed);
    assert.equal(restored.currentPhase.id, 2);
    assert.equal(restored.view.notifications.length, 0);
    refresh(restored, 4);
    assert.equal(restored.units.length, 6);
    assert.equal(new Set(restored.units.map(unit => unit.id)).size, 6);
});

test('nová bitva nepřebírá zpracované eventy předchozího scénáře', () => {
    const { h, game } = fixture({ phases: [{ id: 1, name: 'Úvod', turnRange: [1, 3], events: [
        { id: 'opening', trigger: 'turn_1', type: 'message', text: 'Úvodní zpráva' }
    ] }] });
    assert.equal(game.processedEvents.size, 1);
    game.destroy();
    const restarted = h.newGame('event_regression');
    assert.deepEqual([...restarted.processedEvents], ['opening']);
    assert.equal(restarted.view.notifications.length, 1);
    restarted.initGame();
    assert.equal(restarted.currentScenario, null); assert.equal(restarted.currentPhase, null);
    assert.equal(restarted.processedEvents.size, 0);
    const count = restarted.units.length;
    restarted.checkPhaseEvents(); restarted.checkReinforcements();
    assert.equal(restarted.units.length, count);
});

// Mechanické účinky událostí: očekávané hodnoty jsou zachycené před extrakcí.
for (const [name, event, verify] of [
    ['morale', { type: 'morale', faction: 'crusaders', amount: 3 }, ({ enemy }, before) => {
        assert.equal(enemy.attack, before.attack - 3); assert.equal(enemy.morale, before.morale - 15);
    }],
    ['morale_boost', { type: 'morale_boost', modifier: 15 }, ({ enemy }, before) => {
        assert.equal(enemy.morale, before.morale + 15); assert.equal(enemy.attack, before.attack);
    }],
    ['morale_drop', { type: 'morale_drop', amount: 3 }, ({ enemy }, before) => {
        assert.equal(enemy.morale, before.morale - 15); assert.equal(enemy.attack, before.attack);
    }],
    ['panic', { type: 'panic', faction: 'crusaders', level: 2 }, ({ enemy }, before) => {
        assert.equal(enemy.attack, before.attack - 10); assert.equal(enemy.morale, before.morale);
    }],
    ['rout', { type: 'rout', faction: 'crusaders' }, ({ game, enemy }) => {
        assert.equal(enemy.isRouting, true); assert.equal(game.routingUnits.has(enemy.id), true);
        assert.equal(game.moraleBroken, true);
    }],
    ['charge_bonus', { type: 'charge_bonus', faction: 'crusaders', amount: 15 }, ({ enemy }, before) => {
        assert.equal(enemy.attack, Math.round(before.attack * 1.15));
    }],
    ['terrain_change', { type: 'terrain_change', changes: [{ col: 4, row: 4, terrain: 'mud' }] }, ({ game }) => {
        assert.equal(game.hexGrid.getTerrain(4, 4), 'mud');
    }],
    ['ai_stance', { type: 'ai_stance', mode: 'lure', target: { col: 4, row: 4 }, untilTurn: 5, proximity: 2 }, ({ game }) => {
        assert.deepEqual({ ...game.aiStance, target: { ...game.aiStance.target } }, {
            mode: 'lure', target: { col: 4, row: 4 }, untilTurn: 5, proximity: 2
        });
    }]
]) {
    test(`event ${name} zachová původní mechanický účinek`, () => {
        const state = fixture();
        state.enemy.morale = 60;
        const before = { attack: state.enemy.attack, morale: state.enemy.morale };
        state.game.processEvent(event);
        verify(state, before);
    });
}

let failures = 0;
for (const { name, run } of tests) {
    try { run(); console.log(`✓ ${name}`); }
    catch (error) { failures++; console.error(`✗ ${name}\n${error.stack}`); }
}
console.log(`\n${tests.length - failures}/${tests.length} scenario event testů.`);
if (failures) process.exitCode = 1;
