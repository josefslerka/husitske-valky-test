// Jednoduchá AI pro křižáky

const AI = {
    // Mapování herních terénů na klíče v tactics.terrain
    terrainMapping: {
        forest: 'forest',
        hills: 'hill',
        water: 'water',
        plains: 'road',
        town: 'village',
        church: 'village',
        dam: 'road',
        road: 'road',
        road2: 'road',
        mud: 'water',
        swamp: 'water',
        slope: 'hill',
        trenches: 'village'
    },

    // Získá terrain bonus pro konkrétní jednotku na daném terénu
    getUnitTerrainBonus: function(unit, terrain) {
        const unitType = UnitTypes[unit.type];
        if (unitType && unitType.tactics && unitType.tactics.terrain) {
            const terrainKey = this.terrainMapping[terrain];
            if (terrainKey && unitType.tactics.terrain[terrainKey] !== undefined) {
                const modifier = unitType.tactics.terrain[terrainKey];
                // null = neprůchodný terén (velká penalizace)
                if (modifier === null) {
                    return -50; // Velký malus pro neprůchodný terén
                }
                // Převod z celého čísla (např. 10, -20) na skóre
                return modifier;
            }
        }
        // Fallback na generické bonusy
        const defaultBonuses = {
            plains: 0,
            forest: 15,
            hills: 20,
            town: 25,
            water: -20,
            dam: 10,
            mud: -10,
            swamp: -10,
            slope: 10,
            trenches: 25,
            church: 20
        };
        return defaultBonuses[terrain] || 0;
    },

    // Hlavní funkce - provede celý tah
    takeTurn: function(game) {
        const units = game.getUnitsOfFaction('crusaders');
        const enemies = game.getEnemyUnits('crusaders');

        if (units.length === 0 || enemies.length === 0) {
            if (game.showAIThinking) game.showAIThinking(false);
            game.endTurn();
            return;
        }

        // Zpracování jednotek postupně s prodlevou pro vizuální efekt
        this.processUnits(game, units, 0);
    },

    processUnits: function(game, units, index) {
        if (index >= units.length || game.gameState !== 'playing') {
            // Všechny jednotky hotové, skryjeme AI indikátor
            if (game.showAIThinking) game.showAIThinking(false);
            // Ukončíme tah pouze pokud hra stále běží
            if (game.gameState === 'playing') {
                setTimeout(() => game.endTurn(), 300);
            }
            return;
        }

        const unit = units[index];

        if (!unit.canAct() || unit.health <= 0) {
            // Jednotka nemůže jednat, přejdi na další
            this.processUnits(game, units, index + 1);
            return;
        }

        // Rozhodnutí AI pro jednotku
        const action = this.decideAction(game, unit);

        if (action) {
            this.executeAction(game, unit, action);
        }

        // Pokračuj na další jednotku po krátké prodlevě
        const delay = action && action.type === 'attack' ? 700 : 500;
        setTimeout(() => {
            this.processUnits(game, units, index + 1);
        }, delay);
    },

    decideAction: function(game, unit) {
        const enemies = game.getEnemyUnits('crusaders');
        const isCommander = unit.isCommander && unit.isCommander();

        // Pursuit mechanic - AI ustupuje směrem k cílovému bodu
        if (game.currentScenario && game.currentScenario.specialMechanics &&
            game.currentScenario.specialMechanics.pursuit && unit.canMove()) {
            const retreatTarget = this.findRetreatMove(game, unit);
            if (retreatTarget) {
                // 60% šance na ústup místo boje
                if (Math.random() < 0.6) {
                    return { type: 'move', col: retreatTarget.col, row: retreatTarget.row };
                }
            }
        }

        // === OCHRANA VELITELE ===
        // Velitel by měl zůstat vzadu a být chráněn spojenci
        if (isCommander) {
            // Spočítej okolní spojence
            const neighbors = game.hexGrid.getNeighbors(unit.col, unit.row);
            let adjacentAllies = 0;
            let nearbyEnemies = 0;

            for (const neighbor of neighbors) {
                const nearUnit = game.getUnitAt(neighbor.col, neighbor.row);
                if (nearUnit && nearUnit.health > 0) {
                    if (nearUnit.faction === unit.faction) {
                        adjacentAllies++;
                    } else {
                        nearbyEnemies++;
                    }
                }
            }

            // Pokud je velitel v nebezpečí (málo spojenců nebo blízko nepřátel), ustup
            if (unit.canMove() && (adjacentAllies < 2 || nearbyEnemies > 0)) {
                const safeMove = this.findSafeMove(game, unit, enemies);
                if (safeMove) {
                    return { type: 'move', col: safeMove.col, row: safeMove.row };
                }
            }

            // Velitel útočí jen na dálku nebo když je to bezpečné
            if (unit.canAttack() && unit.range > 1) {
                const attackTarget = this.findBestAttackTarget(game, unit, enemies);
                if (attackTarget) {
                    return { type: 'attack', target: attackTarget };
                }
            }

            // Velitel se snaží zůstat za svými jednotkami
            if (unit.canMove()) {
                const supportMove = this.findCommanderSupportPosition(game, unit, enemies);
                if (supportMove) {
                    return { type: 'move', col: supportMove.col, row: supportMove.row };
                }
            }

            // Obranný postoj pokud nic jiného
            if (unit.canAct()) {
                return { type: 'defend' };
            }
            return null;
        }

        // Speciální taktika pro jednotky s charge - nejprve pohyb, pak útok
        if (unit.special === 'charge' && unit.canMove() && unit.canAttack()) {
            const chargeTarget = this.findChargeOpportunity(game, unit, enemies);
            if (chargeTarget) {
                return { type: 'move', col: chargeTarget.moveCol, row: chargeTarget.moveRow,
                         followUpAttack: chargeTarget.target };
            }
        }

        // 1. Pokus o útok, pokud je v dosahu nepřítel
        if (unit.canAttack()) {
            const attackTarget = this.findBestAttackTarget(game, unit, enemies);
            if (attackTarget) {
                return { type: 'attack', target: attackTarget };
            }
        }

        // 2. Pohyb směrem k nejbližšímu nepříteli
        if (unit.canMove()) {
            const moveTarget = this.findBestMove(game, unit, enemies);
            if (moveTarget) {
                return { type: 'move', col: moveTarget.col, row: moveTarget.row };
            }
        }

        // 3. Pokud nemůžeme nic dělat, zaujmeme obranný postoj
        if (unit.canAct()) {
            return { type: 'defend' };
        }

        return null;
    },

    // Hledání příležitosti pro charge útok (pohyb + útok)
    findChargeOpportunity: function(game, unit, enemies) {
        const validMoves = game.getValidMoves(unit);
        let bestOpportunity = null;
        let bestScore = -Infinity;

        for (const move of validMoves) {
            // Zkontrolujeme terrain bonus pro tuto pozici
            const terrain = game.hexGrid.getTerrain(move.col, move.row);
            const terrainBonus = this.getUnitTerrainBonus(unit, terrain);

            // Přeskočíme pozice s velkým terrain malusem (např. les pro jízdu)
            if (terrainBonus < -30) continue;

            // Po přesunu - kteří nepřátelé jsou v dosahu?
            for (const enemy of enemies) {
                const dist = game.hexGrid.getDistance(move.col, move.row, enemy.col, enemy.row);
                if (dist <= unit.range) {
                    // Spočítáme skóre - bonus za charge
                    let score = 100 - enemy.health;
                    score += unit.attack * 0.5; // Charge bonus poškození

                    // Přidáme terrain bonus/malus
                    score += terrainBonus * 0.5;

                    // Preferujeme cíle, které můžeme zabít
                    const estimatedDamage = unit.attack * 1.5 - enemy.defense * 0.5;
                    if (enemy.health <= estimatedDamage) {
                        score += 80;
                    }

                    // Bonus proti střelcům a dělům
                    if (enemy.isRanged()) {
                        score += 30;
                    }

                    if (score > bestScore) {
                        bestScore = score;
                        bestOpportunity = {
                            moveCol: move.col,
                            moveRow: move.row,
                            target: enemy
                        };
                    }
                }
            }
        }

        return bestOpportunity;
    },

    findBestAttackTarget: function(game, unit, enemies) {
        let bestTarget = null;
        let bestScore = -Infinity;

        for (const enemy of enemies) {
            const distance = game.hexGrid.getDistance(unit.col, unit.row, enemy.col, enemy.row);

            // Kontrola dosahu včetně reach schopnosti
            let inRange = distance <= unit.range;
            if (unit.special === 'reach' && distance === 2 && unit.range === 1) {
                inRange = game.canReachThrough(unit, enemy);
            }

            if (inRange) {
                // Skóre cíle - preferujeme slabší jednotky a ty, které můžeme zabít
                let score = 100 - enemy.health;

                // Výpočet odhadovaného poškození včetně speciálních schopností
                let estimatedDamage = unit.attack;

                // AntiCavalry bonus
                if (unit.special === 'antiCavalry' && enemy.isCavalry()) {
                    estimatedDamage *= 1.5;
                    score += 30; // Preferujeme cíle kde využijeme schopnost
                }

                // ArmorPiercing bonus
                if (unit.special === 'armorPiercing' && (enemy.isHeavyCavalry() || enemy.isWagon())) {
                    estimatedDamage *= 1.3;
                    score += 25;
                }

                // Pursuit bonus
                if (unit.special === 'pursuit' && enemy.health < enemy.maxHealth * 0.5) {
                    estimatedDamage *= 1.3;
                    score += 20;
                }

                // Siege bonus proti vozům
                if (unit.special === 'siege' && enemy.isWagon()) {
                    estimatedDamage *= 2.0;
                    score += 40;
                }

                // Dismount - preferujeme jízdu
                if (unit.special === 'dismount' && enemy.isCavalry()) {
                    score += 15;
                }

                estimatedDamage = Math.max(5, estimatedDamage - enemy.defense * 0.5);

                // Bonus za možnost zabití
                if (enemy.health <= estimatedDamage) {
                    score += 50;
                }

                // Bonus za střelce a děla (jsou nebezpeční)
                if (enemy.isRanged()) {
                    score += 20;
                }

                // Malus za útok na vozy ve vozové hradbě
                if (enemy.isWagon()) {
                    const neighbors = game.hexGrid.getNeighbors(enemy.col, enemy.row);
                    let adjacentWagons = 0;
                    for (const n of neighbors) {
                        const u = game.getUnitAt(n.col, n.row);
                        if (u && u.isWagon() && u.faction === enemy.faction) {
                            adjacentWagons++;
                        }
                    }
                    if (adjacentWagons > 0) {
                        score -= adjacentWagons * 10; // Méně atraktivní cíl
                    }
                }

                if (score > bestScore) {
                    bestScore = score;
                    bestTarget = enemy;
                }
            }
        }

        return bestTarget;
    },

    findBestMove: function(game, unit, enemies) {
        const validMoves = game.getValidMoves(unit);

        if (validMoves.length === 0) {
            return null;
        }

        let bestMove = null;
        let bestScore = -Infinity;

        // Najdeme nejbližšího nepřítele
        let closestEnemy = null;
        let closestDistance = Infinity;

        for (const enemy of enemies) {
            const dist = game.hexGrid.getDistance(unit.col, unit.row, enemy.col, enemy.row);
            if (dist < closestDistance) {
                closestDistance = dist;
                closestEnemy = enemy;
            }
        }

        if (!closestEnemy) {
            return validMoves[0];
        }

        for (const move of validMoves) {
            let score = 0;

            // Vzdálenost k nejbližšímu nepříteli
            const distToEnemy = game.hexGrid.getDistance(move.col, move.row, closestEnemy.col, closestEnemy.row);

            // Chceme se přiblížit, ale zůstat v útočném dosahu
            if (distToEnemy <= unit.range) {
                // Jsme v dosahu - super!
                score += 100;
                // Preferujeme vzdálenější pozici v rámci dosahu (bezpečnější)
                score += distToEnemy * 5;
            } else {
                // Chceme se přiblížit
                score += (10 - distToEnemy) * 10;
            }

            // Bonus za terén - používáme unit-specific modifikátory
            const terrain = game.hexGrid.getTerrain(move.col, move.row);
            score += this.getUnitTerrainBonus(unit, terrain);

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    },

    // Pursuit - najdi nejlepší ústupový hex směrem k mostu/řece
    findRetreatMove: function(game, unit) {
        const validMoves = game.getValidMoves(unit);
        if (validMoves.length === 0) return null;

        // Cíl ústupu - most (bridgeBottleneck position) nebo spodek mapy
        let targetCol, targetRow;
        if (game.currentScenario.specialMechanics.bridgeBottleneck) {
            const pos = game.currentScenario.specialMechanics.bridgeBottleneck.position;
            targetCol = pos[0];
            targetRow = pos[1];
        } else {
            // Defaultní ústup na spodek mapy
            targetCol = Math.floor(game.hexGrid.cols / 2);
            targetRow = game.hexGrid.rows - 1;
        }

        let bestMove = null;
        let bestDist = Infinity;

        for (const move of validMoves) {
            const dist = game.hexGrid.getDistance(move.col, move.row, targetCol, targetRow);
            if (dist < bestDist) {
                bestDist = dist;
                bestMove = move;
            }
        }

        // Jen ústup pokud jsme dál od cíle než 2 hexy
        const currentDist = game.hexGrid.getDistance(unit.col, unit.row, targetCol, targetRow);
        if (currentDist <= 2) return null; // Už jsme u cíle

        return bestMove;
    },

    // Najde bezpečnou pozici pro velitele (pryč od nepřátel, blízko spojenců)
    findSafeMove: function(game, unit, enemies) {
        const validMoves = game.getValidMoves(unit);
        if (validMoves.length === 0) return null;

        const allies = game.getUnitsOfFaction(unit.faction).filter(u => u !== unit && u.health > 0);
        let bestMove = null;
        let bestScore = -Infinity;

        for (const move of validMoves) {
            let score = 0;

            // Vzdálenost od nepřátel - čím dále, tím lépe
            for (const enemy of enemies) {
                const dist = game.hexGrid.getDistance(move.col, move.row, enemy.col, enemy.row);
                score += dist * 10;
            }

            // Blízkost spojenců - chceme být blízko, ale ne přímo vedle
            const neighbors = game.hexGrid.getNeighbors(move.col, move.row);
            let adjacentAllies = 0;
            for (const neighbor of neighbors) {
                const nearUnit = game.getUnitAt(neighbor.col, neighbor.row);
                if (nearUnit && nearUnit.faction === unit.faction && nearUnit.health > 0) {
                    adjacentAllies++;
                }
            }
            score += adjacentAllies * 30; // Bonus za okolní spojence

            // Bonus za terén
            const terrain = game.hexGrid.getTerrain(move.col, move.row);
            score += this.getUnitTerrainBonus(unit, terrain);

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    },

    // Najde pozici kde velitel může podporovat své jednotky (blízko, ale za nimi)
    findCommanderSupportPosition: function(game, unit, enemies) {
        const validMoves = game.getValidMoves(unit);
        if (validMoves.length === 0) return null;

        const allies = game.getUnitsOfFaction(unit.faction).filter(u => u !== unit && u.health > 0);
        if (allies.length === 0) return null;

        // Najdi průměrnou pozici spojenců
        let avgCol = 0, avgRow = 0;
        for (const ally of allies) {
            avgCol += ally.col;
            avgRow += ally.row;
        }
        avgCol = Math.round(avgCol / allies.length);
        avgRow = Math.round(avgRow / allies.length);

        // Najdi průměrnou pozici nepřátel
        let enemyAvgCol = 0, enemyAvgRow = 0;
        for (const enemy of enemies) {
            enemyAvgCol += enemy.col;
            enemyAvgRow += enemy.row;
        }
        enemyAvgCol = Math.round(enemyAvgCol / enemies.length);
        enemyAvgRow = Math.round(enemyAvgRow / enemies.length);

        let bestMove = null;
        let bestScore = -Infinity;

        for (const move of validMoves) {
            let score = 0;

            // Chceme být blízko spojenců (v dosahu aury)
            const distToAllies = game.hexGrid.getDistance(move.col, move.row, avgCol, avgRow);
            if (distToAllies <= 4) {
                score += (5 - distToAllies) * 20;
            }

            // Ale dál od nepřátel než spojenci (za linií)
            const distToEnemies = game.hexGrid.getDistance(move.col, move.row, enemyAvgCol, enemyAvgRow);
            const alliesToEnemies = game.hexGrid.getDistance(avgCol, avgRow, enemyAvgCol, enemyAvgRow);
            if (distToEnemies > alliesToEnemies) {
                score += 50; // Bonus za pozici za linií
            }

            // Počet spojenců v okolí
            const neighbors = game.hexGrid.getNeighbors(move.col, move.row);
            let adjacentAllies = 0;
            for (const neighbor of neighbors) {
                const nearUnit = game.getUnitAt(neighbor.col, neighbor.row);
                if (nearUnit && nearUnit.faction === unit.faction && nearUnit.health > 0) {
                    adjacentAllies++;
                }
            }
            score += adjacentAllies * 25;

            // Terrain bonus
            const terrain = game.hexGrid.getTerrain(move.col, move.row);
            score += this.getUnitTerrainBonus(unit, terrain);

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    },

    executeAction: function(game, unit, action) {
        switch (action.type) {
            case 'attack':
                game.addLog(i18n.t('gameLog.aiAttacking', { unitName: unit.name, targetName: action.target.name }), 'combat');
                game.combatSystem.performAttack(unit, action.target);
                break;

            case 'move':
                if (action.followUpAttack) {
                    // Charge útok - pohyb a pak útok
                    game.addLog(i18n.t('gameLog.aiCharging', { unitName: unit.name }), 'combat');
                    game.moveUnit(unit, action.col, action.row);
                    // Útok po krátkém zpoždění
                    setTimeout(() => {
                        if (unit.canAttack() && action.followUpAttack.health > 0) {
                            game.combatSystem.performAttack(unit, action.followUpAttack);
                        }
                    }, 400);
                } else {
                    game.addLog(i18n.t('gameLog.aiMoving', { unitName: unit.name }), 'move');
                    game.moveUnit(unit, action.col, action.row);
                }
                break;

            case 'defend':
                Sound.playDefend();
                unit.defend();
                game.addLog(i18n.t('gameLog.aiDefending', { unitName: unit.name }), 'move');
                game.render();
                break;
        }
    }
};
