// CombatSystem - Správa bojové logiky
class CombatSystem {
    constructor(game) {
        this.game = game;
    }

    // Získání validních cílů pro útok
    getValidAttackTargets(unit) {
        const targets = [];

        for (const enemy of this.game.units) {
            if (enemy.faction === unit.faction || enemy.health <= 0) continue;

            // Mlha války: jednotku skrytou v mlze nelze zaměřit - červené
            // zvýraznění hexu by jinak prozradilo její pozici
            if (!this.game.fogOfWarSystem.isEnemyVisible(enemy)) continue;

            const distance = this.game.hexGrid.getDistance(unit.col, unit.row, enemy.col, enemy.row);

            // Normální dosah
            if (distance <= unit.range) {
                targets.push({ col: enemy.col, row: enemy.row });
            }
            // Schopnost reach - útok přes sousední spojeneckou jednotku (dosah 2)
            else if (unit.special === 'reach' && distance === 2 && unit.range === 1) {
                if (this.canReachThrough(unit, enemy)) {
                    targets.push({ col: enemy.col, row: enemy.row });
                }
            }
        }

        return targets;
    }

    // Kontrola, zda může jednotka s reach útočit přes spojeneckou jednotku
    canReachThrough(attacker, target) {
        // Najdeme sousedy útočníka
        const attackerNeighbors = this.game.hexGrid.getNeighbors(attacker.col, attacker.row);
        // Najdeme sousedy cíle
        const targetNeighbors = this.game.hexGrid.getNeighbors(target.col, target.row);

        // Hledáme společného souseda, kde je spojenecká jednotka
        for (const an of attackerNeighbors) {
            for (const tn of targetNeighbors) {
                if (an.col === tn.col && an.row === tn.row) {
                    // Našli jsme společný hex - je tam spojenecká jednotka?
                    const unitBetween = this.game.getUnitAt(an.col, an.row);
                    if (unitBetween && unitBetween.faction === attacker.faction) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Kontrola, zda může útočník zaútočit na obránce
    canAttack(attacker, defender) {
        if (!attacker.canAttack()) return false;
        if (defender.faction === attacker.faction) return false;

        const distance = this.game.hexGrid.getDistance(attacker.col, attacker.row, defender.col, defender.row);

        // Normální dosah
        if (distance <= attacker.range) {
            return true;
        }

        // Schopnost reach
        if (attacker.special === 'reach' && distance === 2 && attacker.range === 1) {
            return this.canReachThrough(attacker, defender);
        }

        return false;
    }

    // Provedení útoku
    performAttack(attacker, defender) {
        const defenderTerrain = this.game.hexGrid.getTerrain(defender.col, defender.row);
        const attackerTerrain = this.game.hexGrid.getTerrain(attacker.col, attacker.row);
        const hasMovedThisTurn = attacker.hasMoved;

        // Zrušit možnost undo - útok je nevratná akce
        if (this.game.lastMove && this.game.lastMove.unit === attacker) {
            this.game.lastMove = null;
        }

        // Animace útoku
        this.game.hexGrid.addAttackAnimation(attacker.col, attacker.row, defender.col, defender.row);

        // Zvuk útoku podle dosahu
        if (attacker.range > 1) {
            Sound.playRangedAttack();
        } else {
            Sound.playMeleeAttack();
        }

        // Vytvoření gameContext pro speciální schopnosti
        const attackerBonuses = this.game.getCommanderBonuses(attacker);
        const defenderBonuses = this.game.getCommanderBonuses(defender);
        const attackerFearPenalty = this.game.getEnemyCommanderFearPenalty(attacker);
        const defenderFearPenalty = this.game.getEnemyCommanderFearPenalty(defender);
        const defenderSurrounded = this.getSurroundedPenalty(defender);

        // Bonusy z chorálu (pouze pro husity)
        const choralMods = attacker.faction === 'hussites' ? this.getChoralModifiers() : null;
        const defenderChoralMods = defender.faction === 'hussites' ? this.getChoralModifiers() : null;

        // Bonusy z formace vozové hradby
        const attackerFormation = this.getWagonFormationBonuses(attacker);
        const defenderFormation = this.getWagonFormationBonuses(defender);

        // Speciální mechaniky scénáře
        const scenarioMechanics = this.getActiveScenarioMechanics(attacker, defender);

        const gameContext = {
            getNeighbors: (col, row) => this.game.hexGrid.getNeighbors(col, row),
            getUnitAt: (col, row) => this.game.getUnitAt(col, row),
            // Velitelské bonusy
            attackerCommanderBonus: attackerBonuses ? attackerBonuses.attack : 0,
            defenderCommanderBonus: defenderBonuses ? defenderBonuses.defense : 0,
            attackerFearPenalty: attackerFearPenalty || 0,
            defenderFearPenalty: defenderFearPenalty || 0,
            // Obklíčení obránce
            defenderSurroundedPenalty: defenderSurrounded ? defenderSurrounded.defensePenalty : 0,
            // Chorál - +50% útok, -20% obrana pro husity
            choralAttackBonus: choralMods ? choralMods.attackBonus : 0,
            choralDefensePenalty: defenderChoralMods ? defenderChoralMods.defensePenalty : 0,
            // Formace vozové hradby
            attackerFormationAttack: attackerFormation.attack,
            attackerFormationDefense: attackerFormation.defense,
            defenderFormationDefense: defenderFormation.defense,
            // Speciální mechaniky scénáře
            nightPenalty: scenarioMechanics.nightPenalty || 0,
            terrainTrapPenalty: scenarioMechanics.terrainTrapPenalty || 0,
            lastStandBonus: scenarioMechanics.lastStandBonus || 0,
            // Okno protiútoku - bonus proti kolísající armádě
            defenderWavering: this.game.wavering && this.game.wavering[defender.faction] || false,
            // WP1: výpad z hradby - +10 % útok, pokud útočník stojí vedle ROZPOJENÉHO
            // vozu A cíl je v kolísající armádě (aplikuje se jen uvnitř okna protiútoku)
            attackerSallyBonus: (this.game.wavering && this.game.wavering[defender.faction] &&
                this.isNextToOpenWagon(attacker)) ? 0.10 : 0
        };

        // Zpoždění pro zobrazení animace
        setTimeout(() => {
            const result = attacker.attackTarget(defender, defenderTerrain, attackerTerrain, hasMovedThisTurn, gameContext);

            // Zvuk zásahu
            Sound.playHit();

            // Animace exploze na cíli
            this.game.hexGrid.addExplosionAnimation(defender.col, defender.row);

            // Floating damage number
            this.showDamageNumber(defender.col, defender.row, result.damage);

            // Sledování poškození pro statistiky
            this.trackDamage(attacker, defender, result.damage);

            // Zpracování plošného útoku (areaAttack)
            if (result.areaDamage && result.areaDamage.length > 0) {
                for (const areaDmg of result.areaDamage) {
                    this.game.hexGrid.addExplosionAnimation(areaDmg.unit.col, areaDmg.unit.row);
                    this.trackDamage(attacker, areaDmg.unit, areaDmg.damage);

                    if (areaDmg.killed) {
                        this.game.addLog(i18n.t('gameLog.areaKill', { attacker: attacker.name, target: areaDmg.unit.name, nearby: defender.name, damage: areaDmg.damage }), 'combat');
                        this.trackUnitDeath(areaDmg.unit, attacker);
                        this.game.handleUnitDeath(areaDmg.unit, attacker);
                    } else {
                        this.game.addLog(i18n.t('gameLog.areaHit', { attacker: attacker.name, target: areaDmg.unit.name, nearby: defender.name, damage: areaDmg.damage, health: areaDmg.unit.health }), 'combat');
                    }
                }
            }

            if (result.killed) {
                this.game.addLog(i18n.t('gameLog.destroyed', { attacker: attacker.name, defender: defender.name, damage: result.damage }), 'combat');
                Sound.playDeath();

                // Aktualizace statistik + jednotné efekty smrti (velitel, vůz, morálka)
                this.trackUnitDeath(defender, attacker);
                this.game.handleUnitDeath(defender, attacker);
            } else {
                this.game.addLog(i18n.t('gameLog.attacked', { attacker: attacker.name, defender: defender.name, damage: result.damage, health: defender.health }), 'combat');

                // Snížení morálky obránce při těžkém zásahu (vypnuto v tutoriálu)
                if (!this.game.isTutorial) {
                    const damagePercent = result.damage / defender.maxHealth;
                    if (damagePercent > 0.3) {
                        const moraleLoss = Math.round(damagePercent * 20);
                        const moraleResult = defender.reduceMorale(moraleLoss, 'Těžké zranění');
                        if (moraleResult.startedRouting) {
                            this.game.addLog(i18n.t('gameLog.moraleBreak', { unit: defender.name }), 'morale');
                        }
                    }
                }

                // Protiútok
                if (result.counterDamage > 0) {
                    setTimeout(() => {
                        this.game.hexGrid.addAttackAnimation(defender.col, defender.row, attacker.col, attacker.row);
                        Sound.playMeleeAttack();

                        setTimeout(() => {
                            this.game.hexGrid.addExplosionAnimation(attacker.col, attacker.row);
                            Sound.playHit();

                            this.showDamageNumber(attacker.col, attacker.row, result.counterDamage);
                            this.trackDamage(defender, attacker, result.counterDamage);

                            if (result.attackerKilled) {
                                this.game.addLog(i18n.t('gameLog.counterKill', { defender: defender.name, attacker: attacker.name, damage: result.counterDamage }), 'combat');
                                Sound.playDeath();
                                this.trackUnitDeath(attacker, defender);
                                this.game.handleUnitDeath(attacker, defender);
                            } else {
                                this.game.addLog(i18n.t('gameLog.counterAttack', { defender: defender.name, damage: result.counterDamage, attacker: attacker.name, health: attacker.health }), 'combat');
                            }

                            this.game.updateArmyOverview();
                            this.game.updateWaveringState();
                            this.game.render();
                            this.game.victoryConditionsSystem.checkVictory();
                        }, 200);
                    }, 300);

                    this.game.deselectUnit();
                    return;
                }
            }

            // Tutoriál trigger
            if (this.game.isTutorial) {
                this.game.triggerTutorialEvent('attack_performed', { attacker, defender, result });
            }

            this.game.deselectUnit();
            this.game.updateArmyOverview();
            this.game.updateWaveringState();
            this.game.render();
            this.game.victoryConditionsSystem.checkVictory();
        }, 300);
    }

    // Obrana vybrané jednotky
    defendSelectedUnit() {
        if (!this.game.selectedUnit) return;

        // Zrušit možnost undo - obrana je nevratná akce
        if (this.game.lastMove && this.game.lastMove.unit === this.game.selectedUnit) {
            this.game.lastMove = null;
        }

        Sound.playDefend();

        this.game.selectedUnit.defend();
        this.game.addLog(i18n.t('gameLog.defensiveStance', { unit: this.game.selectedUnit.name }), 'move');

        // Tutoriál trigger
        if (this.game.isTutorial) {
            this.game.triggerTutorialEvent('defend_performed', { unit: this.game.selectedUnit });
        }

        this.game.deselectUnit();
        this.game.render();
    }

    // Výpočet odhadu poškození pro tooltip
    calculateDamagePreview(attacker, defender) {
        if (!attacker || !defender) return null;
        if (attacker.faction === defender.faction) return null;

        // Základní poškození
        let baseDamage = attacker.attack;
        let special = '';

        // RapidFire - snížené poškození
        if (attacker.special === 'rapidFire') {
            baseDamage *= 0.75;
            special = 'Rychlostřelba (2x útok)';
        }

        // Charge bonus
        if (attacker.special === 'charge' && !attacker.hasMoved) {
            const chargeBonus = attacker.type === 'TEZKY_RYTIR' ? 0.5 : 0.3;
            baseDamage *= (1 + chargeBonus);
            special = 'Náraz po pohybu';
        }

        // ArmorPiercing
        if (attacker.special === 'armorPiercing' && (defender.isHeavyCavalry() || defender.isWagon())) {
            baseDamage *= 1.3;
            special = 'Drtivý úder vs obrněné';
        }

        // AntiCavalry
        if (attacker.special === 'antiCavalry' && defender.isCavalry()) {
            baseDamage *= 1.5;
            special = 'Bonus vs jízda';
        }

        // Pursuit
        if (attacker.special === 'pursuit' && defender.health < defender.maxHealth * 0.5) {
            baseDamage *= 1.3;
            special = 'Pronásledování oslabených';
        }

        // Siege
        if (attacker.special === 'siege' && defender.isWagon()) {
            baseDamage *= 2.0;
            special = 'Obléhání vozů';
        }

        // Elite/Veteran
        if (attacker.special === 'elite' || attacker.special === 'veteran') {
            baseDamage *= 1.1;
        }

        // Terror efekt
        if (attacker.isTerrified) {
            baseDamage *= 0.9;
        }

        // Obranný postoj obránce
        if (defender.isDefending) {
            baseDamage *= 0.7;
        }

        // AntiCavalry obrana
        if (defender.special === 'antiCavalry' && attacker.isCavalry()) {
            baseDamage *= 0.7;
        }

        // Terénní bonus obránce
        const terrain = this.game.hexGrid.getTerrain(defender.col, defender.row);
        const terrainBonus = {
            plains: 0, forest: 0.2, hills: 0.3, town: 0.4, swamp: 0.1,
            road: 0, road2: 0, dam: 0.2, slope: 0.1, trenches: 0.3, church: 0.2
        };
        baseDamage *= (1 - (terrainBonus[terrain] || 0));

        // Odpočet obrany
        let defenseReduction = defender.defense * 0.5;
        baseDamage = Math.max(5, baseDamage - defenseReduction);

        // Náhodný faktor ±20%
        const minDamage = Math.round(baseDamage * 0.8);
        const maxDamage = Math.round(baseDamage * 1.2);

        return {
            min: minDamage,
            max: maxDamage,
            special: special
        };
    }

    // Zobrazení floating damage čísla
    showDamageNumber(col, row, damage, isHeal = false) {
        // Nastavení "Zobrazovat poškození" dosud nemělo žádný efekt
        if (window.gameSettings && window.gameSettings.showDamage === false) return;
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;

        const canvasRect = canvas.getBoundingClientRect();
        const hexCenter = this.game.hexGrid.hexToPixel(col, row);

        const x = canvasRect.left + hexCenter.x;
        const y = canvasRect.top + hexCenter.y - 20;

        const damageEl = document.createElement('div');
        damageEl.className = 'damage-number' + (isHeal ? ' heal' : '');
        damageEl.textContent = (isHeal ? '+' : '-') + damage;
        damageEl.style.left = x + 'px';
        damageEl.style.top = y + 'px';

        document.body.appendChild(damageEl);

        setTimeout(() => {
            if (damageEl.parentNode) {
                damageEl.parentNode.removeChild(damageEl);
            }
        }, 1200);
    }

    // Pomocné metody - získání bonusů a penalizací

    getSurroundedPenalty(unit) {
        const surroundInfo = this.game.checkSurrounded(unit);
        if (!surroundInfo.surrounded) return null;

        return {
            defensePenalty: surroundInfo.level * 10,
            moralePenalty: surroundInfo.level * 5,
            level: surroundInfo.level
        };
    }

    getActiveScenarioMechanics(attacker, defender) {
        const result = { nightPenalty: 0, terrainTrapPenalty: 0, lastStandBonus: 0 };
        if (!this.game.currentScenario || !this.game.currentScenario.specialMechanics) return result;

        const mechanics = this.game.currentScenario.specialMechanics;
        const playerFaction = this.game.currentScenario.playerFaction || 'hussites';
        const enemyFaction = playerFaction === 'hussites' ? 'crusaders' : 'hussites';

        // nightBreakout
        if (mechanics.nightBreakout && this.game.turnNumber >= 3) {
            if (attacker.faction === enemyFaction) {
                result.nightPenalty = 0.2;
            }
        }

        // terrainTrap
        if (mechanics.terrainTrap) {
            const attackerTerrain = this.game.hexGrid.getTerrain(attacker.col, attacker.row);
            if (attacker.isCavalry() && attackerTerrain === 'slope') {
                result.terrainTrapPenalty = 0.3;
            }
        }

        // lastStand
        if (mechanics.lastStand && defender.faction === playerFaction) {
            const defenderTerrain = this.game.hexGrid.getTerrain(defender.col, defender.row);
            if (defenderTerrain === 'hills' || defenderTerrain === 'town' || defenderTerrain === 'trenches') {
                result.lastStandBonus = 0.2;

                const unitType = UnitTypes[defender.type];
                if (unitType && unitType.commanderAbilities && unitType.commanderAbilities.lastStandBonus) {
                    result.lastStandBonus += unitType.commanderAbilities.lastStandBonus / 100;
                }
            }
        }

        return result;
    }

    getChoralModifiers() {
        if (!this.game.choralActive) return null;

        return {
            attackBonus: 0.5,
            defensePenalty: 0.2
        };
    }

    getWagonFormationBonuses(unit) {
        const bonuses = {
            attack: 0,
            defense: 0,
            description: []
        };

        // Bonus za linii vozů
        if (unit.isWagon && unit.isWagon()) {
            const lineInfo = this.game.isInWagonLine(unit);
            if (lineInfo && !unit.breachedTurns) {
                bonuses.defense += lineInfo.defenseBonus;
                bonuses.description.push(`Linie vozů (+${lineInfo.defenseBonus}% obrana)`);
            }
            if (unit.breachedTurns) {
                bonuses.description.push('Průlom! (bez formačního bonusu)');
            }
        }

        // Bonus pro střelce za vozem
        const shooterBonus = this.game.isShooterBehindWagon(unit);
        if (shooterBonus) {
            bonuses.attack += shooterBonus.attackBonus;
            bonuses.defense += shooterBonus.defenseBonus;
            bonuses.description.push(`Střílna (+${shooterBonus.attackBonus} útok, +${shooterBonus.defenseBonus}% obrana)`);
        }

        // WP1: kryt za sepnutou hradbou - NE-vozová jednotka vedle spřáteleného
        // ZAVŘENÉHO vozu dostane +5 % obrana ("kryjeme se za vozy").
        if (unit.isWagon && !unit.isWagon() && this.isBehindClosedWagon(unit)) {
            bonuses.defense += 5;
            bonuses.description.push('Kryt za hradbou (+5% obrana)');
        }

        return bonuses;
    }

    // WP1: stojí jednotka vedle spřáteleného SEPNUTÉHO vozu? (kryt za hradbou)
    isBehindClosedWagon(unit) {
        for (const n of this.game.hexGrid.getNeighbors(unit.col, unit.row)) {
            const u = this.game.getUnitAt(n.col, n.row);
            if (u && u.health > 0 && u.faction === unit.faction && u.isWagon() && u.formationClosed) {
                return true;
            }
        }
        return false;
    }

    // WP1: stojí jednotka vedle spřáteleného ROZPOJENÉHO vozu? (výpad z hradby)
    isNextToOpenWagon(unit) {
        if (!unit || unit.isWagon()) return false; // výpad dělá pěchota/jízda, ne vůz sám
        for (const n of this.game.hexGrid.getNeighbors(unit.col, unit.row)) {
            const u = this.game.getUnitAt(n.col, n.row);
            if (u && u.health > 0 && u.faction === unit.faction && u.isWagon() && !u.formationClosed) {
                return true;
            }
        }
        return false;
    }

    // Sledování poškození a úmrtí pro statistiky
    trackDamage(attacker, defender, damage) {
        const playerFaction = this.game.currentScenario?.playerFaction || 'hussites';

        if (attacker.faction === playerFaction) {
            this.game.stats.totalDamage += damage;
            if (!this.game.stats.unitDamage[attacker.id]) {
                this.game.stats.unitDamage[attacker.id] = 0;
            }
            this.game.stats.unitDamage[attacker.id] += damage;
        }

        if (defender.faction === playerFaction) {
            this.game.stats.damageTaken += damage;
        }
    }

    trackUnitDeath(deadUnit, killer) {
        const playerFaction = this.game.currentScenario?.playerFaction || 'hussites';
        this.game.recordLoss(deadUnit);  // WP2a: přesné ztráty per frakce

        if (deadUnit.faction === playerFaction) {
            this.game.unitsLost++;
        } else {
            this.game.enemiesKilled++;

            if (killer && killer.faction === playerFaction) {
                if (!this.game.stats.unitKills[killer.id]) {
                    this.game.stats.unitKills[killer.id] = 0;
                }
                this.game.stats.unitKills[killer.id]++;
            }
        }
    }
}
