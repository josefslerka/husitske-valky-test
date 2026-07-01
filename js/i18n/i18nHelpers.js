// Helper funkce pro lokalizaci herních dat
// Propojuje data objekty (UnitTypes, Scenarios, atd.) s i18n překlady

/**
 * Získá lokalizovaná data jednotky
 * @param {string} unitTypeKey - Klíč typu jednotky (např. 'CEPNICI')
 * @param {object} baseUnit - Základní data jednotky z UnitTypes
 * @returns {object} Jednotka s přeloženými texty
 */
function getLocalizedUnit(unitTypeKey, baseUnit) {
    if (!baseUnit || typeof i18n === 'undefined') {
        return baseUnit;
    }

    // Zkopíruj základní data
    const localizedUnit = { ...baseUnit };

    // Přelož texty pokud existují v i18n
    const unitKey = `units.${unitTypeKey}`;

    if (i18n.hasTranslation(`${unitKey}.name`)) {
        localizedUnit.name = i18n.t(`${unitKey}.name`);
    }

    if (i18n.hasTranslation(`${unitKey}.description`)) {
        localizedUnit.description = i18n.t(`${unitKey}.description`);
    }

    // Přelož lore sekci
    if (baseUnit.lore && i18n.hasTranslation(`${unitKey}.lore.description`)) {
        localizedUnit.lore = {
            description: i18n.t(`${unitKey}.lore.description`),
            equipment: i18n.t(`${unitKey}.lore.equipment`),
            origin: i18n.t(`${unitKey}.lore.origin`),
            historicalNote: i18n.t(`${unitKey}.lore.historicalNote`)
        };
    }

    return localizedUnit;
}

/**
 * Získá lokalizovaná data scénáře
 * @param {string} scenarioId - ID scénáře (např. 'sudomere_1420')
 * @param {object} baseScenario - Základní data scénáře
 * @returns {object} Scénář s přeloženými texty
 */
function getLocalizedScenario(scenarioId, baseScenario) {
    if (!baseScenario || typeof i18n === 'undefined') {
        return baseScenario;
    }

    const localizedScenario = { ...baseScenario };
    const scenarioKey = `scenarios.${scenarioId}`;

    // Základní texty
    if (i18n.hasTranslation(`${scenarioKey}.name`)) {
        localizedScenario.name = i18n.t(`${scenarioKey}.name`);
    }

    if (i18n.hasTranslation(`${scenarioKey}.date`)) {
        localizedScenario.date = i18n.t(`${scenarioKey}.date`);
    }

    if (i18n.hasTranslation(`${scenarioKey}.description`)) {
        localizedScenario.description = i18n.t(`${scenarioKey}.description`);
    }

    // Briefings
    if (baseScenario.briefing && i18n.hasTranslation(`${scenarioKey}.briefing.hussites`)) {
        localizedScenario.briefing = {
            hussites: i18n.t(`${scenarioKey}.briefing.hussites`),
            crusaders: i18n.t(`${scenarioKey}.briefing.crusaders`)
        };
    }

    // WP5: per-scénář jména stran (volitelné, jen kde je scénář definuje)
    if (baseScenario.factionNames) {
        localizedScenario.factionNames = { ...baseScenario.factionNames };
        for (const side of ['hussites', 'crusaders']) {
            const key = `${scenarioKey}.factionNames.${side}`;
            if (i18n.hasTranslation(key)) {
                localizedScenario.factionNames[side] = i18n.t(key);
            }
        }
    }

    // Victory conditions
    if (baseScenario.victoryConditions) {
        localizedScenario.victoryConditions = { ...baseScenario.victoryConditions };

        if (i18n.hasTranslation(`${scenarioKey}.objectives.primary`)) {
            localizedScenario.victoryConditions.primary = {
                ...baseScenario.victoryConditions.primary,
                description: i18n.t(`${scenarioKey}.objectives.primary`)
            };
        }

        // Secondary objectives
        if (baseScenario.victoryConditions.secondary) {
            localizedScenario.victoryConditions.secondary = baseScenario.victoryConditions.secondary.map((obj, index) => {
                const key = `${scenarioKey}.objectives.secondary.${index}`;
                if (i18n.hasTranslation(key)) {
                    return {
                        ...obj,
                        description: i18n.t(key)
                    };
                }
                return obj;
            });
        }
    }

    // Phases (with nested events)
    if (baseScenario.phases) {
        localizedScenario.phases = baseScenario.phases.map((phase, phaseIndex) => {
            const phaseKey = `${scenarioKey}.phases.${phaseIndex}`;
            const localizedPhase = { ...phase };

            if (i18n.hasTranslation(`${phaseKey}.name`)) {
                localizedPhase.name = i18n.t(`${phaseKey}.name`);
                localizedPhase.description = i18n.t(`${phaseKey}.description`);
            }

            // Translate events within phase
            if (phase.events) {
                localizedPhase.events = phase.events.map((event, eventIndex) => {
                    const eventKey = `${phaseKey}.events.${eventIndex}`;
                    const localizedEvent = { ...event };

                    if (event.message && i18n.hasTranslation(`${eventKey}.message`)) {
                        localizedEvent.message = i18n.t(`${eventKey}.message`);
                    }

                    if (event.text && i18n.hasTranslation(`${eventKey}.text`)) {
                        localizedEvent.text = i18n.t(`${eventKey}.text`);
                    }

                    return localizedEvent;
                });
            }

            return localizedPhase;
        });
    }

    // Historical significance
    if (i18n.hasTranslation(`${scenarioKey}.historicalSignificance`)) {
        localizedScenario.historicalSignificance = i18n.t(`${scenarioKey}.historicalSignificance`);
    }

    // Events (messages and dialogs)
    if (baseScenario.events) {
        localizedScenario.events = baseScenario.events.map((event, index) => {
            const eventKey = `${scenarioKey}.events.${index}`;
            const localizedEvent = { ...event };

            if (event.message && i18n.hasTranslation(`${eventKey}.message`)) {
                localizedEvent.message = i18n.t(`${eventKey}.message`);
            }

            if (event.text && i18n.hasTranslation(`${eventKey}.text`)) {
                localizedEvent.text = i18n.t(`${eventKey}.text`);
            }

            return localizedEvent;
        });
    }

    // Reinforcements message
    if (baseScenario.forces) {
        localizedScenario.forces = { ...baseScenario.forces };

        if (baseScenario.forces.hussites?.reinforcements?.message) {
            localizedScenario.forces.hussites = {
                ...baseScenario.forces.hussites,
                reinforcements: {
                    ...baseScenario.forces.hussites.reinforcements,
                    message: i18n.hasTranslation(`${scenarioKey}.reinforcements.hussites`)
                        ? i18n.t(`${scenarioKey}.reinforcements.hussites`)
                        : baseScenario.forces.hussites.reinforcements.message
                }
            };
        }

        if (baseScenario.forces.crusaders?.reinforcements?.message) {
            if (!localizedScenario.forces.crusaders) {
                localizedScenario.forces.crusaders = { ...baseScenario.forces.crusaders };
            }
            localizedScenario.forces.crusaders.reinforcements = {
                ...baseScenario.forces.crusaders.reinforcements,
                message: i18n.hasTranslation(`${scenarioKey}.reinforcements.crusaders`)
                    ? i18n.t(`${scenarioKey}.reinforcements.crusaders`)
                    : baseScenario.forces.crusaders.reinforcements.message
            };
        }
    }

    // Tutorial steps
    if (baseScenario.tutorialSteps) {
        localizedScenario.tutorialSteps = baseScenario.tutorialSteps.map((step, index) => {
            const stepKey = `${scenarioKey}.steps.${index}`;
            if (i18n.hasTranslation(`${stepKey}.title`)) {
                return {
                    ...step,
                    title: i18n.t(`${stepKey}.title`),
                    text: i18n.t(`${stepKey}.text`)
                };
            }
            return step;
        });
    }

    // Debriefing
    if (baseScenario.debriefing) {
        localizedScenario.debriefing = { ...baseScenario.debriefing };

        if (i18n.hasTranslation(`${scenarioKey}.debriefing.victory`)) {
            localizedScenario.debriefing.victory = i18n.t(`${scenarioKey}.debriefing.victory`);
        }

        if (i18n.hasTranslation(`${scenarioKey}.debriefing.defeat`)) {
            localizedScenario.debriefing.defeat = i18n.t(`${scenarioKey}.debriefing.defeat`);
        }
    }

    return localizedScenario;
}

/**
 * Získá lokalizovaná data battle lore
 * @param {string} battleId - ID bitvy (např. 'sudomere_1420')
 * @param {object} baseLore - Základní lore data
 * @returns {object} Lore s přeloženými texty
 */
function getLocalizedBattleLore(battleId, baseLore) {
    if (!baseLore || typeof i18n === 'undefined') {
        return baseLore;
    }

    const localizedLore = { ...baseLore };
    const loreKey = `battleLore.${battleId}`;

    // Základní texty
    const simpleFields = ['name', 'location', 'terrain', 'weather', 'outcome', 'aftermath', 'significance', 'reliability'];
    simpleFields.forEach(field => {
        if (i18n.hasTranslation(`${loreKey}.${field}`)) {
            localizedLore[field] = i18n.t(`${loreKey}.${field}`);
        }
    });

    // Strany konfliktu - velitelé jsou v locale JSON uloženi jako pole,
    // starší formát byl string oddělený čárkami; podpoř obojí
    const asCommanderList = (val) => Array.isArray(val) ? val : String(val).split(', ');

    if (baseLore.hussiteSide && i18n.hasTranslation(`${loreKey}.hussiteSide.commanders`)) {
        localizedLore.hussiteSide = {
            commanders: asCommanderList(i18n.t(`${loreKey}.hussiteSide.commanders`)),
            strength: i18n.t(`${loreKey}.hussiteSide.strength`),
            composition: i18n.t(`${loreKey}.hussiteSide.composition`)
        };
    }

    if (baseLore.enemySide && i18n.hasTranslation(`${loreKey}.enemySide.commanders`)) {
        localizedLore.enemySide = {
            commanders: asCommanderList(i18n.t(`${loreKey}.enemySide.commanders`)),
            strength: i18n.t(`${loreKey}.enemySide.strength`),
            composition: i18n.t(`${loreKey}.enemySide.composition`)
        };
    }

    // Casualties
    if (baseLore.casualties && i18n.hasTranslation(`${loreKey}.casualties.hussites`)) {
        localizedLore.casualties = {
            hussites: i18n.t(`${loreKey}.casualties.hussites`),
            enemy: i18n.t(`${loreKey}.casualties.enemy`)
        };
    }

    // Quotes
    if (baseLore.quotes) {
        localizedLore.quotes = baseLore.quotes.map((quote, index) => {
            const quoteKey = `${loreKey}.quotes.${index}`;
            if (i18n.hasTranslation(`${quoteKey}.text`)) {
                return {
                    text: i18n.t(`${quoteKey}.text`),
                    source: i18n.t(`${quoteKey}.source`)
                };
            }
            return quote;
        });
    }

    // Trivia
    if (baseLore.trivia) {
        localizedLore.trivia = baseLore.trivia.map((item, index) => {
            const triviaKey = `${loreKey}.trivia.${index}`;
            if (i18n.hasTranslation(triviaKey)) {
                return i18n.t(triviaKey);
            }
            return item;
        });
    }

    return localizedLore;
}

/**
 * Aktualizuje všechna zobrazená data po změně jazyka
 */
function updateGameDataLocalization() {
    // Tato funkce se zavolá po změně jazyka
    // Aktualizuje všechny zobrazené popisy, pokud jsou nějaké panely otevřené

    // WP5: pokud běží bitva, přegeneruj jména stran (tah, přehled armád, indikátor AI)
    if (window.game && window.game.gameState === 'playing' && typeof window.game.updateUI === 'function') {
        window.game.updateUI();
        const aiIndicator = document.getElementById('ai-thinking');
        if (aiIndicator && !aiIndicator.classList.contains('hidden')) {
            window.game.showAIThinking(true); // re-set textu indikátoru v novém jazyce
        }
    }

    // Pokud je otevřený help modal s jednotkami, aktualizuj ho
    const helpModal = document.getElementById('help-modal');
    if (helpModal && !helpModal.classList.contains('hidden')) {
        if (typeof populateHelpUnits === 'function' && window.game) {
            populateHelpUnits(window.game);
        }
        // Aktualizuj také encyklopedii
        if (typeof updateEncyclopediaContent === 'function') {
            updateEncyclopediaContent();
        }
    }

    // Pokud je otevřený mission modal, aktualizuj ho
    const missionModal = document.getElementById('mission-modal');
    if (missionModal && !missionModal.classList.contains('hidden')) {
        // Re-render mission list pokud existuje funkce
        if (typeof showActBattles === 'function' && window.currentAct) {
            showActBattles(window.currentAct);
        }
    }
}
