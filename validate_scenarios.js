#!/usr/bin/env node

// Validace všech scénářů v scenarios.js
const fs = require('fs');
const path = require('path');

// Načtení a zpracování unit types
const unitTypesPath = path.join(__dirname, 'js/data/unitTypes.js');
let unitTypesCode = fs.readFileSync(unitTypesPath, 'utf8');

// Přidání exportu pro Node.js, pokud neexistuje
if (!unitTypesCode.includes('module.exports')) {
    unitTypesCode += '\nif (typeof module !== "undefined" && module.exports) { module.exports = { UnitTypes }; }';
}

// Načtení scenarios
const scenariosPath = path.join(__dirname, 'js/data/scenarios.js');
let scenariosCode = fs.readFileSync(scenariosPath, 'utf8');

// Přidání exportu pro Node.js, pokud neexistuje
if (!scenariosCode.includes('module.exports')) {
    scenariosCode += '\nif (typeof module !== "undefined" && module.exports) { module.exports = { Scenarios }; }';
}

// Vytvoření dočasných souborů
const tmpDir = path.join(__dirname, '.tmp');
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
}

const tmpUnitTypesPath = path.join(tmpDir, 'unitTypes.js');
const tmpScenariosPath = path.join(tmpDir, 'scenarios.js');

fs.writeFileSync(tmpUnitTypesPath, unitTypesCode);
fs.writeFileSync(tmpScenariosPath, scenariosCode);

// Načtení modulů
const { UnitTypes } = require(tmpUnitTypesPath);
const { Scenarios } = require(tmpScenariosPath);

// Smazání dočasných souborů
fs.unlinkSync(tmpUnitTypesPath);
fs.unlinkSync(tmpScenariosPath);
fs.rmdirSync(tmpDir);

// Victory condition types implementované v VictoryConditionsSystem.js
const implementedVictoryTypes = [
    'survive',
    'destroy_percent',
    'hold_position',
    'escape',
    'survive_turns',
    'capture_position',
    'dual_objective',
    'destroy_or_rout',
    'dual_objective_battle',
    'tutorial_complete'
];

const implementedSecondaryTypes = [
    'kill_commander',
    'no_losses',
    'max_losses',
    'fast_victory',
    'hold_position',
    'capture_position',
    'destroy_percent',
    'capture_wagons',
    'survive_commander',
    'eliminate_commander',
    'kill_commander_alt',
    'protect_wagons',
    'save_wagons',
    'protect_artillery',
    'both_objectives'
];

const implementedDefeatTypes = [
    'commander_death',
    'lose_positions',
    'lose_percent'
];

// Validační funkce
function validateScenario(scenario) {
    const errors = [];
    const warnings = [];

    // 1. Validace pozic jednotek
    const mapWidth = scenario.mapSize.width;
    const mapHeight = scenario.mapSize.height;

    const allUnits = [
        ...(scenario.forces.hussites.units || []),
        ...(scenario.forces.crusaders.units || [])
    ];

    for (const unit of allUnits) {
        if (unit.col < 0 || unit.col >= mapWidth) {
            errors.push(`Unit ${unit.type} má col=${unit.col} mimo rozsah mapy (0-${mapWidth-1})`);
        }
        if (unit.row < 0 || unit.row >= mapHeight) {
            errors.push(`Unit ${unit.type} má row=${unit.row} mimo rozsah mapy (0-${mapHeight-1})`);
        }
    }

    // 1b. Kontrola překrývajících se jednotek
    const positionMap = new Map();
    for (const unit of allUnits) {
        const posKey = `${unit.col},${unit.row}`;
        if (positionMap.has(posKey)) {
            const existingUnit = positionMap.get(posKey);
            errors.push(`Překrytí jednotek na [${unit.col},${unit.row}]: ${existingUnit.type} a ${unit.type}`);
        } else {
            positionMap.set(posKey, unit);
        }
    }

    // 2. Validace unit types
    for (const unit of allUnits) {
        const upperType = unit.type.toUpperCase();
        if (!UnitTypes[upperType]) {
            errors.push(`Unit type '${unit.type}' neexistuje v UnitTypes`);
        }
    }

    // 3. Validace victory conditions
    if (scenario.victoryConditions) {
        const vc = scenario.victoryConditions;

        // Primary condition
        if (vc.primary) {
            if (!implementedVictoryTypes.includes(vc.primary.type)) {
                errors.push(`Primary victory type '${vc.primary.type}' není implementovaný`);
            }

            // Validace pozic v primary
            if (vc.primary.positions) {
                for (const pos of vc.primary.positions) {
                    if (pos[0] < 0 || pos[0] >= mapWidth) {
                        errors.push(`Victory condition position [${pos[0]}, ${pos[1]}] má col mimo mapu`);
                    }
                    if (pos[1] < 0 || pos[1] >= mapHeight) {
                        errors.push(`Victory condition position [${pos[0]}, ${pos[1]}] má row mimo mapu`);
                    }
                }
            }

            // Validace dual_objective
            if (vc.primary.type === 'dual_objective' && vc.primary.objectives) {
                for (const obj of vc.primary.objectives) {
                    if (obj.positions) {
                        for (const pos of obj.positions) {
                            if (pos[0] < 0 || pos[0] >= mapWidth) {
                                errors.push(`Objective '${obj.id}' position [${pos[0]}, ${pos[1]}] má col mimo mapu`);
                            }
                            if (pos[1] < 0 || pos[1] >= mapHeight) {
                                errors.push(`Objective '${obj.id}' position [${pos[0]}, ${pos[1]}] má row mimo mapu`);
                            }
                        }
                    }
                }
            }
        }

        // Secondary conditions
        if (vc.secondary) {
            for (const sec of vc.secondary) {
                if (!implementedSecondaryTypes.includes(sec.type)) {
                    errors.push(`Secondary victory type '${sec.type}' není implementovaný`);
                }

                if (sec.positions) {
                    for (const pos of sec.positions) {
                        if (pos[0] < 0 || pos[0] >= mapWidth) {
                            errors.push(`Secondary condition position [${pos[0]}, ${pos[1]}] má col mimo mapu`);
                        }
                        if (pos[1] < 0 || pos[1] >= mapHeight) {
                            errors.push(`Secondary condition position [${pos[0]}, ${pos[1]}] má row mimo mapu`);
                        }
                    }
                }
            }
        }
    }

    // 4. Validace defeat conditions
    if (scenario.defeatConditions) {
        const dc = scenario.defeatConditions;

        if (dc.primary && !implementedDefeatTypes.includes(dc.primary.type)) {
            errors.push(`Defeat condition type '${dc.primary.type}' není implementovaný`);
        }

        if (dc.alternative && !implementedDefeatTypes.includes(dc.alternative.type)) {
            errors.push(`Defeat condition type '${dc.alternative.type}' není implementovaný`);
        }

        if (dc.alternative && dc.alternative.positions) {
            for (const pos of dc.alternative.positions) {
                if (pos[0] < 0 || pos[0] >= mapWidth) {
                    errors.push(`Defeat condition position [${pos[0]}, ${pos[1]}] má col mimo mapu`);
                }
                if (pos[1] < 0 || pos[1] >= mapHeight) {
                    errors.push(`Defeat condition position [${pos[0]}, ${pos[1]}] má row mimo mapu`);
                }
            }
        }
    }

    // 5. Validace reinforcements
    if (scenario.phases) {
        for (const phase of scenario.phases) {
            if (phase.events) {
                for (const event of phase.events) {
                    if (event.type === 'reinforce' && event.units) {
                        for (const unit of event.units) {
                            if (unit.col < 0 || unit.col >= mapWidth) {
                                errors.push(`Reinforcement unit ${unit.type} má col=${unit.col} mimo mapu`);
                            }
                            if (unit.row < 0 || unit.row >= mapHeight) {
                                errors.push(`Reinforcement unit ${unit.type} má row=${unit.row} mimo mapu`);
                            }

                            const upperType = unit.type.toUpperCase();
                            if (!UnitTypes[upperType]) {
                                errors.push(`Reinforcement unit type '${unit.type}' neexistuje`);
                            }
                        }
                    }
                }
            }
        }
    }

    // 6. Balance check (včetně reinforcements)
    let hussitesCost = 0;
    let crusadersCost = 0;
    let hussitesReinforcements = 0;
    let crusadersReinforcements = 0;

    // Základní síly
    for (const unit of scenario.forces.hussites.units || []) {
        const upperType = unit.type.toUpperCase();
        const unitType = UnitTypes[upperType];
        if (unitType) {
            hussitesCost += unitType.cost;
        }
    }

    for (const unit of scenario.forces.crusaders.units || []) {
        const upperType = unit.type.toUpperCase();
        const unitType = UnitTypes[upperType];
        if (unitType) {
            crusadersCost += unitType.cost;
        }
    }

    // Posily na úrovni frakce
    if (scenario.forces.hussites.reinforcements && scenario.forces.hussites.reinforcements.units) {
        for (const unit of scenario.forces.hussites.reinforcements.units) {
            const upperType = unit.type.toUpperCase();
            const unitType = UnitTypes[upperType];
            if (unitType) {
                hussitesReinforcements += unitType.cost;
            }
        }
    }

    if (scenario.forces.crusaders.reinforcements && scenario.forces.crusaders.reinforcements.units) {
        for (const unit of scenario.forces.crusaders.reinforcements.units) {
            const upperType = unit.type.toUpperCase();
            const unitType = UnitTypes[upperType];
            if (unitType) {
                crusadersReinforcements += unitType.cost;
            }
        }
    }

    // Posily na úrovni scénáře
    if (scenario.reinforcements) {
        for (const [key, reinf] of Object.entries(scenario.reinforcements)) {
            if (reinf.units) {
                for (const unit of reinf.units) {
                    const upperType = unit.type.toUpperCase();
                    const unitType = UnitTypes[upperType];
                    if (unitType) {
                        if (reinf.faction === 'hussites') {
                            hussitesReinforcements += unitType.cost;
                        } else if (reinf.faction === 'crusaders') {
                            crusadersReinforcements += unitType.cost;
                        }
                    }
                }
            }
        }
    }

    const totalHussitesCost = hussitesCost + hussitesReinforcements;
    const totalCrusadersCost = crusadersCost + crusadersReinforcements;
    const balanceRatio = totalCrusadersCost > 0 ? (totalHussitesCost / totalCrusadersCost) : 0;

    return {
        errors,
        warnings,
        balance: {
            hussitesCost,
            crusadersCost,
            hussitesReinforcements,
            crusadersReinforcements,
            totalHussitesCost,
            totalCrusadersCost,
            ratio: balanceRatio
        }
    };
}

// Hlavní validace
console.log('═══════════════════════════════════════════════════════════════');
console.log('  VALIDACE SCÉNÁŘŮ - scenarios.js');
console.log('═══════════════════════════════════════════════════════════════\n');

const results = {};
const balanceStats = [];
let totalScenarios = 0;
let validScenarios = 0;

for (const [id, scenario] of Object.entries(Scenarios)) {
    totalScenarios++;
    const result = validateScenario(scenario);
    results[id] = result;

    const isValid = result.errors.length === 0;
    if (isValid) validScenarios++;

    balanceStats.push({
        id,
        ratio: result.balance.ratio,
        hussitesCost: result.balance.totalHussitesCost,
        crusadersCost: result.balance.totalCrusadersCost,
        hasReinforcements: (result.balance.hussitesReinforcements + result.balance.crusadersReinforcements) > 0
    });

    // Výpis výsledků
    console.log(`\n${'─'.repeat(67)}`);
    console.log(`📋 Scénář: ${scenario.name || id}`);
    console.log(`   ID: ${id}`);
    console.log(`${'─'.repeat(67)}`);

    // Status jednotlivých kategorií
    const positionsOk = !result.errors.some(e => e.includes('mimo rozsah mapy'));
    const typesOk = !result.errors.some(e => e.includes('neexistuje v UnitTypes'));
    const victoryOk = !result.errors.some(e => e.includes('victory') || e.includes('Victory'));
    const reinforceOk = !result.errors.some(e => e.includes('Reinforcement'));

    console.log(`\n   ✓ Kategorie validace:`);
    console.log(`     ${positionsOk ? '✅' : '❌'} Pozice jednotek`);
    console.log(`     ${typesOk ? '✅' : '❌'} Unit types`);
    console.log(`     ${victoryOk ? '✅' : '❌'} Victory conditions`);
    console.log(`     ${reinforceOk ? '✅' : '❌'} Reinforcements`);

    // Balance
    console.log(`\n   💰 Balance:`);
    console.log(`     Hussites:  ${result.balance.hussitesCost.toString().padStart(6)} cost (start)`);
    if (result.balance.hussitesReinforcements > 0) {
        console.log(`              + ${result.balance.hussitesReinforcements.toString().padStart(4)} reinforcements = ${result.balance.totalHussitesCost} total`);
    }
    console.log(`     Crusaders: ${result.balance.crusadersCost.toString().padStart(6)} cost (start)`);
    if (result.balance.crusadersReinforcements > 0) {
        console.log(`              + ${result.balance.crusadersReinforcements.toString().padStart(4)} reinforcements = ${result.balance.totalCrusadersCost} total`);
    }
    console.log(`     Ratio:     ${result.balance.ratio.toFixed(2)} (hussites/crusaders) - včetně posil`);

    // Chyby
    if (result.errors.length > 0) {
        console.log(`\n   ❌ CHYBY (${result.errors.length}):`);
        result.errors.forEach((err, idx) => {
            console.log(`     ${idx + 1}. ${err}`);
        });
    } else {
        console.log(`\n   ✅ Žádné chyby`);
    }
}

// Sumarizace
console.log('\n\n');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  SUMARIZACE');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log(`📊 Celkem scénářů: ${totalScenarios}`);
console.log(`✅ 100% validních: ${validScenarios}`);
console.log(`❌ S chybami:      ${totalScenarios - validScenarios}\n`);

// Nejčastější problémy
const allErrors = [];
for (const result of Object.values(results)) {
    allErrors.push(...result.errors);
}

const errorTypes = {};
for (const error of allErrors) {
    // Extrakce typu chyby
    let type = 'Ostatní';
    if (error.includes('mimo rozsah mapy') || error.includes('mimo mapu')) {
        type = 'Pozice mimo mapu';
    } else if (error.includes('neexistuje v UnitTypes') || error.includes('neexistuje')) {
        type = 'Neexistující unit type';
    } else if (error.includes('victory') || error.includes('Victory')) {
        type = 'Victory conditions';
    } else if (error.includes('Defeat')) {
        type = 'Defeat conditions';
    } else if (error.includes('Reinforcement')) {
        type = 'Reinforcements';
    }

    errorTypes[type] = (errorTypes[type] || 0) + 1;
}

if (Object.keys(errorTypes).length > 0) {
    console.log('🔍 Nejčastější problémy:');
    const sorted = Object.entries(errorTypes).sort((a, b) => b[1] - a[1]);
    for (const [type, count] of sorted) {
        console.log(`   • ${type}: ${count}x`);
    }
    console.log('');
}

// Balance overview
const ratios = balanceStats.map(s => s.ratio).filter(r => r > 0);
const avgRatio = ratios.reduce((sum, r) => sum + r, 0) / ratios.length;
const minRatio = Math.min(...ratios);
const maxRatio = Math.max(...ratios);

console.log('⚖️  Balance overview:');
console.log(`   Průměrný ratio: ${avgRatio.toFixed(2)}`);
console.log(`   Min ratio:      ${minRatio.toFixed(2)}`);
console.log(`   Max ratio:      ${maxRatio.toFixed(2)}\n`);

// Top 5 nejlépe vyvážených
console.log('🎯 Top 5 nejlépe vyvážených scénářů (ratio ~ 1.0):');
const balancedScenarios = balanceStats
    .filter(s => s.ratio > 0)
    .sort((a, b) => Math.abs(1.0 - a.ratio) - Math.abs(1.0 - b.ratio))
    .slice(0, 5);

balancedScenarios.forEach((s, idx) => {
    console.log(`   ${idx + 1}. ${s.id.padEnd(30)} ratio: ${s.ratio.toFixed(2)}`);
});

// Top 5 nejvíce nevyvážených
console.log('\n⚠️  Top 5 nejvíce nevyvážených scénářů:');
const unbalancedScenarios = balanceStats
    .filter(s => s.ratio > 0)
    .sort((a, b) => Math.abs(1.0 - b.ratio) - Math.abs(1.0 - a.ratio))
    .slice(0, 5);

unbalancedScenarios.forEach((s, idx) => {
    const reinfMark = s.hasReinforcements ? ' 📯' : '';
    console.log(`   ${idx + 1}. ${s.id.padEnd(30)} ratio: ${s.ratio.toFixed(2)} (H:${s.hussitesCost} vs C:${s.crusadersCost})${reinfMark}`);
});

console.log('\n═══════════════════════════════════════════════════════════════\n');

// Exit code
process.exit(totalScenarios === validScenarios ? 0 : 1);
