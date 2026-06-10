class Unit {
    constructor(type, col, row, id) {
        const template = UnitTypes[type];

        if (!template) {
            console.error('Unknown unit type:', type);
            throw new Error(`Unknown unit type: ${type}`);
        }

        this.id = id;
        this.type = type;
        this.name = template.name;
        this.faction = template.faction;
        this.symbol = template.symbol;

        this.maxHealth = template.maxHealth;
        this.health = template.maxHealth;
        this.attack = template.attack;
        this.defense = template.defense;
        this.range = template.range;
        this.movement = template.movement;
        this.description = template.description;

        // Nové vlastnosti
        this.special = template.special || null;
        this.unitClass = template.unitClass || 'infantry';

        // Velitelské schopnosti (pokud je velitel)
        this.commanderAbilities = template.commanderAbilities || null;

        // Morálka - základní hodnota podle typu jednotky
        this.maxMorale = template.baseMorale || this.getDefaultMorale();
        this.morale = this.maxMorale;

        this.col = col;
        this.row = row;

        this.hasMoved = false;
        this.hasAttacked = false;
        this.attackCount = 0;  // Počet provedených útoků (pro rapidFire)
        this.isDefending = false;
        this.isTerrified = false;  // Efekt děsu z ručnic
        this.chargeBonus = false;  // Bonus z nárazu
        this.isRouting = false;    // Jednotka prchá
        this.rallyAttempts = 0;    // Počet pokusů o rally
    }

    // Kontrola, zda je jednotka velitel
    isCommander() {
        return this.unitClass === 'commander' || this.special === 'commander';
    }

    // Získání velitelských schopností
    getCommanderAbilities() {
        return this.commanderAbilities || null;
    }

    // Výchozí morálka podle typu jednotky
    getDefaultMorale() {
        switch (this.unitClass) {
            case 'commander': return 95;      // Velitelé - velmi vysoká morálka
            case 'heavyCavalry': return 90;   // Elitní jednotky - vysoká morálka
            case 'cavalry': return 75;
            case 'wagon': return 85;          // Vozy - odhodlání bránit se
            case 'artillery': return 60;      // Dělostřelectvo - nižší
            case 'ranged': return 65;
            case 'infantry':
            default: return 70;
        }
    }

    // Kontrola, zda je jednotka jízda
    isCavalry() {
        return this.unitClass === 'cavalry' || this.unitClass === 'heavyCavalry';
    }

    // Kontrola, zda je jednotka těžká jízda (obrněná)
    isHeavyCavalry() {
        return this.unitClass === 'heavyCavalry';
    }

    // Kontrola, zda je jednotka vůz
    isWagon() {
        return this.unitClass === 'wagon';
    }

    // Kontrola, zda je jednotka střelec
    isRanged() {
        return this.unitClass === 'ranged' || this.unitClass === 'artillery';
    }

    // Spočítání sousedních vozů (pro wagenburg bonus)
    countAdjacentWagons(target, gameContext) {
        if (!gameContext || !gameContext.getNeighbors || !gameContext.getUnitAt) {
            return 0;
        }

        const neighbors = gameContext.getNeighbors(target.col, target.row);
        let wagonCount = 0;

        for (const neighbor of neighbors) {
            const unit = gameContext.getUnitAt(neighbor.col, neighbor.row);
            if (unit && unit.isWagon() && unit.faction === target.faction) {
                wagonCount++;
            }
        }

        return wagonCount;
    }

    // Spočítání sousedních spojenců (pro bodyguard bonus velitele)
    countAdjacentAllies(target, gameContext) {
        if (!gameContext || !gameContext.getNeighbors || !gameContext.getUnitAt) {
            return 0;
        }

        const neighbors = gameContext.getNeighbors(target.col, target.row);
        let allyCount = 0;

        for (const neighbor of neighbors) {
            const unit = gameContext.getUnitAt(neighbor.col, neighbor.row);
            if (unit && unit.faction === target.faction && unit.health > 0) {
                allyCount++;
            }
        }

        return allyCount;
    }

    // Získání bonusu ze štítové zdi (pavézníci chrání střelce)
    getShieldWallBonus(target, gameContext) {
        if (!gameContext || !gameContext.getNeighbors || !gameContext.getUnitAt) {
            return 0;
        }

        const neighbors = gameContext.getNeighbors(target.col, target.row);
        let shieldCount = 0;

        for (const neighbor of neighbors) {
            const unit = gameContext.getUnitAt(neighbor.col, neighbor.row);
            if (unit && unit.special === 'shieldWall' && unit.faction === target.faction) {
                shieldCount++;
            }
        }

        // +20% obrana za každého sousedního pavézníka (max +40%)
        return Math.min(0.4, shieldCount * 0.2);
    }

    // Získání cílů pro plošný útok (nepřátelské jednotky sousedící s hlavním cílem)
    getAreaDamageTargets(target, gameContext) {
        if (!gameContext || !gameContext.getNeighbors || !gameContext.getUnitAt) {
            return [];
        }

        const neighbors = gameContext.getNeighbors(target.col, target.row);
        const targets = [];

        for (const neighbor of neighbors) {
            const unit = gameContext.getUnitAt(neighbor.col, neighbor.row);
            // Pouze nepřátelské jednotky (jiná frakce než útočník)
            if (unit && unit.faction !== this.faction) {
                targets.push({ unit, col: neighbor.col, row: neighbor.row });
            }
        }

        return targets;
    }

    // Reset na začátku tahu
    resetTurn() {
        this.hasMoved = false;
        this.hasAttacked = false;
        this.attackCount = 0;
        this.isDefending = false;
        this.isTerrified = false;
        this.chargeBonus = false;
    }

    // Pohyb na novou pozici
    moveTo(col, row) {
        this.col = col;
        this.row = row;
        this.hasMoved = true;
    }

    // Útok na cíl
    // gameContext obsahuje: { getNeighbors, getUnitAt, hexGrid } pro výpočet bonusů z okolí
    attackTarget(target, terrain, attackerTerrain = 'plains', hasMovedThisTurn = false, gameContext = null) {
        this.attackCount++;

        // RapidFire - lučištníci mohou útočit dvakrát, ale hasAttacked nastavíme až po druhém útoku
        if (this.special === 'rapidFire') {
            if (this.attackCount >= 2) {
                this.hasAttacked = true;
            }
        } else {
            this.hasAttacked = true;
        }

        // Výpočet poškození útočníka
        let damage = this.attack;

        // RapidFire - snížené poškození za rychlostřelbu (75% za každý útok)
        if (this.special === 'rapidFire') {
            damage *= 0.75;
        }

        // === SPECIÁLNÍ SCHOPNOSTI ÚTOČNÍKA ===

        // Charge (náraz) - bonus při útoku z pohybu
        if (this.special === 'charge' && hasMovedThisTurn) {
            const chargeBonus = this.type === 'TEZKY_RYTIR' ? 0.5 : 0.3;
            damage *= (1 + chargeBonus);
            this.chargeBonus = true;
        }

        // ArmorPiercing (drtivý úder) - bonus proti obrněným (těžká jízda, vozy)
        if (this.special === 'armorPiercing' && (target.isHeavyCavalry() || target.isWagon())) {
            damage *= 1.3;
        }

        // AntiCavalry - bonus proti jízdě
        if (this.special === 'antiCavalry' && target.isCavalry()) {
            damage *= 1.5;
        }

        // Pursuit (pronásledování) - bonus proti oslabeným jednotkám
        if (this.special === 'pursuit' && target.health < target.maxHealth * 0.5) {
            damage *= 1.3;
        }

        // Siege (obléhání) - bonus proti vozům
        if (this.special === 'siege' && target.isWagon()) {
            damage *= 2.0;
        }

        // Elite - obecný bonus
        if (this.special === 'elite') {
            damage *= 1.1;
        }

        // Veteran - obecný bonus
        if (this.special === 'veteran') {
            damage *= 1.1;
        }

        // Terror efekt na útočníka (z předchozího tahu)
        if (this.isTerrified) {
            damage *= 0.9;
        }

        // === VELITELSKÉ BONUSY ===
        // Bonus k útoku od velitele
        if (gameContext && gameContext.attackerCommanderBonus) {
            damage += gameContext.attackerCommanderBonus;
        }
        // Postih za strach z nepřátelského velitele
        if (gameContext && gameContext.attackerFearPenalty) {
            damage *= (1 - gameContext.attackerFearPenalty / 100);
        }

        // === CHORÁL "KTOŽ JSÚ BOŽÍ BOJOVNÍCI" ===
        // +50% útok pro husitské jednotky během chorálu
        if (gameContext && gameContext.choralAttackBonus) {
            damage *= (1 + gameContext.choralAttackBonus);
        }

        // === FORMACE VOZOVÉ HRADBY ===
        // Bonus k útoku ze střílny (střelci za vozy)
        if (gameContext && gameContext.attackerFormationAttack) {
            damage += gameContext.attackerFormationAttack;
        }

        // === SPECIÁLNÍ MECHANIKY SCÉNÁŘE ===
        // Noční průlom - snížená přesnost útočníka
        if (gameContext && gameContext.nightPenalty) {
            damage *= (1 - gameContext.nightPenalty);
        }
        // Terénní past - jízda na svahu ztrácí sílu
        if (gameContext && gameContext.terrainTrapPenalty) {
            damage *= (1 - gameContext.terrainTrapPenalty);
        }

        // === ÚTOČNÝ BONUS ZA TERÉN ===
        // Bonus/malus k útoku podle terénu, na kterém útočník stojí
        const terrainAttackBonus = this.getTerrainAttackBonus(attackerTerrain);
        damage *= (1 + terrainAttackBonus);

        // === WEAKNESS BONUS (Slabiny cíle) ===
        // Bonus k útoku pokud útočník využívá slabinu cíle
        const weaknessBonus = this.getWeaknessBonus(target, hasMovedThisTurn);
        if (weaknessBonus > 0) {
            damage *= (1 + weaknessBonus);
        }

        // === OBRANNÉ BONUSY CÍLE ===

        // Bonus za obranný postoj
        if (target.isDefending) {
            damage *= 0.7;
        }

        // AntiCavalry obrana - kopiníci mají bonus proti jízdě
        if (target.special === 'antiCavalry' && this.isCavalry()) {
            damage *= 0.7;  // Snížení poškození od jízdy
        }

        // === WAGENBURG (Vozová hradba) ===
        // Vozy vedle sebe dostávají bonus k obraně
        if (target.special === 'wagenburg' && gameContext) {
            const adjacentWagons = this.countAdjacentWagons(target, gameContext);
            if (adjacentWagons > 0) {
                // +15% obrana za každý sousední vůz (max +45%)
                const wagonBonus = Math.min(0.45, adjacentWagons * 0.15);
                damage *= (1 - wagonBonus);
            }
        }

        // === SHIELD WALL (Štítová zeď) ===
        // Střelci vedle pavézníků dostávají bonus k obraně
        if (target.isRanged() && gameContext) {
            const shieldBonus = this.getShieldWallBonus(target, gameContext);
            if (shieldBonus > 0) {
                damage *= (1 - shieldBonus);
            }
        }

        // Bonus za terén obránce
        const terrainDefenseBonus = this.getTerrainDefenseBonus(terrain);
        damage *= (1 - terrainDefenseBonus);

        // Náhodný faktor (±20%)
        damage *= 0.8 + Math.random() * 0.4;

        // === BODYGUARD (Ochrana velitele) ===
        // Velitel dostává redukované poškození, pokud má kolem sebe spojence
        if (target.isCommander && target.isCommander() && gameContext) {
            const adjacentAllies = this.countAdjacentAllies(target, gameContext);
            if (adjacentAllies > 0) {
                // -15% poškození za každého spojence (max -60%)
                const bodyguardReduction = Math.min(0.60, adjacentAllies * 0.15);
                damage *= (1 - bodyguardReduction);
            }
        }

        // Odečtení obrany (armorPiercing střelci ignorují část)
        let defenseValue = target.defense;
        // Velitelský bonus k obraně
        if (gameContext && gameContext.defenderCommanderBonus) {
            defenseValue += gameContext.defenderCommanderBonus;
        }
        // Postih za obklíčení (-10% až -30%)
        if (gameContext && gameContext.defenderSurroundedPenalty) {
            defenseValue *= (1 - gameContext.defenderSurroundedPenalty / 100);
        }
        // Postih za chorál (-20% obrana pro husity během chorálu)
        if (gameContext && gameContext.choralDefensePenalty) {
            defenseValue *= (1 - gameContext.choralDefensePenalty);
        }
        // Bonus z formace vozové hradby (linie + střílna)
        if (gameContext && gameContext.defenderFormationDefense) {
            defenseValue *= (1 + gameContext.defenderFormationDefense / 100);
        }
        // lastStand bonus - obrana hradu/města (Sion)
        if (gameContext && gameContext.lastStandBonus) {
            defenseValue *= (1 + gameContext.lastStandBonus);
        }
        let defenseReduction = defenseValue * 0.5;
        if (this.special === 'armorPiercing' && this.isRanged()) {
            defenseReduction *= 0.7;  // Ignoruje 30% obrany
        }
        damage = Math.max(5, damage - defenseReduction);

        damage = Math.round(damage);
        target.health -= damage;

        const result = {
            damage: damage,
            killed: target.health <= 0,
            counterDamage: 0,
            attackerKilled: false,
            specialEffects: [],
            areaDamage: []  // Plošné poškození sousedním jednotkám
        };

        // === PLOŠNÝ ÚTOK (areaAttack) ===
        // Houfnice způsobují poškození sousedním nepřátelským jednotkám
        if (this.special === 'areaAttack' && gameContext) {
            const areaTargets = this.getAreaDamageTargets(target, gameContext);
            for (const areaTarget of areaTargets) {
                // 50% poškození pro sousední jednotky
                const areaDmg = Math.round(damage * 0.5);
                areaTarget.unit.health -= areaDmg;
                result.areaDamage.push({
                    unit: areaTarget.unit,
                    damage: areaDmg,
                    killed: areaTarget.unit.health <= 0
                });
            }
            if (areaTargets.length > 0) {
                result.specialEffects.push('areaAttack');
            }
        }

        // === SPECIÁLNÍ EFEKTY PO ÚTOKU ===

        // Terror - ručničáři způsobují děs
        if (this.special === 'terror' && !result.killed) {
            target.isTerrified = true;
            result.specialEffects.push('terror');
        }

        // Dismount - halapartníci mohou sesadit jezdce
        if (this.special === 'dismount' && target.isCavalry() && !result.killed) {
            if (Math.random() < 0.3) {  // 30% šance
                target.movement = Math.max(1, target.movement - 2);
                result.specialEffects.push('dismount');
            }
        }

        // Protiútok - pouze pokud obránce přežil a může útočit (melee vs melee)
        // Jen těžká pěchota (útok ≥ 28) může provést protiútok
        if (!result.killed && target.range === 1 && this.range === 1 &&
            target.unitClass === 'infantry' && target.attack >= 28) {
            result.counterDamage = this.calculateCounterDamage(target, attackerTerrain);
            this.health -= result.counterDamage;
            result.attackerKilled = this.health <= 0;
        }

        return result;
    }

    // Výpočet poškození protiútoku (25% síly normálního útoku)
    calculateCounterDamage(defender, attackerTerrain) {
        let counterDamage = defender.attack * 0.25;

        // Bonus za terén útočníka (nyní obránce protiútokem)
        const terrainBonus = this.getTerrainDefenseBonus(attackerTerrain);
        counterDamage *= (1 - terrainBonus);

        // Náhodný faktor
        counterDamage *= 0.8 + Math.random() * 0.4;

        // Odečtení obrany útočníka
        counterDamage = Math.max(3, counterDamage - this.defense * 0.3);

        return Math.round(counterDamage);
    }

    getTerrainDefenseBonus(terrain) {
        // Mapování herních terénů na klíče v tactics.terrain
        const terrainMapping = {
            forest: 'forest',
            hills: 'hill',
            water: 'water',
            plains: 'road',
            town: 'village',
            church: 'village',
            dam: 'road',
            mud: 'water',
            swamp: 'water',
            slope: 'hill',
            trenches: 'village'
        };

        // Zkusíme najít unit-specific modifikátor
        const unitType = UnitTypes[this.type];
        if (unitType && unitType.tactics && unitType.tactics.terrain) {
            const terrainKey = terrainMapping[terrain];
            if (terrainKey && unitType.tactics.terrain[terrainKey] !== undefined) {
                const modifier = unitType.tactics.terrain[terrainKey];
                // null = neprůchodný terén (velká penalizace)
                if (modifier === null) {
                    return -0.5;
                }
                // Převod z celého čísla (např. 10, -20) na desetinný (0.1, -0.2)
                return modifier / 100;
            }
        }

        // Fallback na generické bonusy pro jednotky bez tactics.terrain
        const defaultBonuses = {
            plains: 0,
            forest: 0.2,
            hills: 0.3,
            town: 0.4,
            water: -0.2,
            dam: 0.2,
            mud: 0,
            swamp: 0.1,
            slope: 0.1,
            trenches: 0.3,
            church: 0.2
        };
        return defaultBonuses[terrain] || 0;
    }

    // Útočný bonus podle terénu útočníka
    getTerrainAttackBonus(terrain) {
        // Mapování herních terénů na klíče v tactics.attackTerrain
        const terrainMapping = {
            forest: 'forest',
            hills: 'hill',
            water: 'water',
            plains: 'road',
            town: 'village',
            church: 'village',
            dam: 'road',
            mud: 'water',
            swamp: 'water',
            slope: 'hill',
            trenches: 'village'
        };

        // Zkusíme najít unit-specific modifikátor
        const unitType = UnitTypes[this.type];
        if (unitType && unitType.tactics && unitType.tactics.attackTerrain) {
            const terrainKey = terrainMapping[terrain];
            if (terrainKey && unitType.tactics.attackTerrain[terrainKey] !== undefined) {
                const modifier = unitType.tactics.attackTerrain[terrainKey];
                // null = nemůže útočit z tohoto terénu
                if (modifier === null) {
                    return -0.5;
                }
                // Převod z celého čísla (např. 10, -20) na desetinný (0.1, -0.2)
                return modifier / 100;
            }
        }

        // Fallback na generické útočné bonusy
        const defaultBonuses = {
            plains: 0,
            forest: 0.1,     // Mírný bonus - krytí, překvapení
            hills: 0.2,      // Bonus za vyšší pozici
            town: 0,         // Žádný bonus
            water: -0.3,     // Velký postih
            dam: 0,
            mud: -0.1,       // Mírný postih
            swamp: -0.15,    // Postih - bažina zpomaluje útok
            slope: 0.15,     // Bonus za svah (útok z kopce dolů)
            trenches: 0.1,   // Mírný bonus - krytí
            church: 0
        };
        return defaultBonuses[terrain] || 0;
    }

    // Výpočet bonusu za využití slabiny cíle
    // Slabiny: 'ranged', 'cavalry', 'cavalry_charge', 'close_combat', 'flanking', 'armored_targets'
    getWeaknessBonus(target, hasMovedThisTurn = false) {
        const targetType = UnitTypes[target.type];
        if (!targetType || !targetType.tactics || !targetType.tactics.weaknesses) {
            return 0;
        }

        const weaknesses = targetType.tactics.weaknesses;
        let bonus = 0;

        // 'ranged' - slabost proti střelcům
        if (weaknesses.includes('ranged') && this.isRanged()) {
            bonus += 0.2;  // +20% poškození
        }

        // 'cavalry' - slabost proti jízdě obecně
        if (weaknesses.includes('cavalry') && this.isCavalry()) {
            bonus += 0.2;  // +20% poškození
        }

        // 'cavalry_charge' - slabost proti nárazu jízdy (pouze při útoku z pohybu)
        if (weaknesses.includes('cavalry_charge') && this.isCavalry() && hasMovedThisTurn) {
            bonus += 0.25;  // +25% poškození při nárazu
        }

        // 'close_combat' - slabost v boji zblízka
        if (weaknesses.includes('close_combat') && this.range === 1) {
            bonus += 0.15;  // +15% poškození
        }

        // 'flanking' - slabost proti obklíčení (implementace vyžaduje gameContext)
        // Prozatím jednoduchá verze - bonus pro pěchotu
        if (weaknesses.includes('flanking') && this.unitClass === 'infantry') {
            bonus += 0.1;  // +10% poškození
        }

        // 'armored_targets' - slabost při boji proti obrněným (střelci vs těžká pěchota/jízda)
        if (weaknesses.includes('armored_targets') && (target.isHeavyCavalry() || target.defense >= 30)) {
            // Toto je slabina střelců - pokud útočíme na obrněný cíl, snížíme účinnost
            // Ale tato logika je opačná - weaknesses jsou slabiny CÍle, ne útočníka
            // Takže 'armored_targets' znamená, že CÍL je slabý proti obrněným protivníkům
            // To nedává úplně smysl... Tento typ slabiny přeskočíme
        }

        return bonus;
    }

    // Přepnutí do obranného postoje
    defend() {
        this.isDefending = true;
        this.hasMoved = true;
        this.hasAttacked = true;
    }

    // Kontrola, zda může jednotka ještě táhnout
    canAct() {
        return !this.hasMoved || !this.hasAttacked;
    }

    canMove() {
        return !this.hasMoved;
    }

    canAttack() {
        // Prchající jednotky nemohou útočit
        if (this.isRouting) {
            return false;
        }
        // RapidFire - lučištníci mohou útočit dvakrát
        if (this.special === 'rapidFire') {
            return this.attackCount < 2;
        }
        // Mobilní dělostřelectvo může střílet i po pohybu
        if (this.special === 'mobile') {
            return !this.hasAttacked;
        }
        // Normálně: dělostřelectvo nemůže střílet po pohybu
        if (this.unitClass === 'artillery' && this.hasMoved) {
            return false;
        }
        return !this.hasAttacked;
    }

    // Počet zbývajících útoků
    getRemainingAttacks() {
        if (this.special === 'rapidFire') {
            return 2 - this.attackCount;
        }
        return this.hasAttacked ? 0 : 1;
    }

    // Kontrola, zda může střílet po pohybu
    canFireAfterMove() {
        return this.special === 'mobile';
    }

    // ==========================================
    // SYSTÉM MORÁLKY
    // ==========================================

    // Snížení morálky
    reduceMorale(amount, reason) {
        const oldMorale = this.morale;
        this.morale = Math.max(0, this.morale - amount);

        // Kontrola zda jednotka začne prchat (velitelé neprchou)
        if (this.morale <= 20 && !this.isRouting && !this.isCommander()) {
            this.isRouting = true;
            return {
                oldMorale,
                newMorale: this.morale,
                reason,
                startedRouting: true
            };
        }

        return {
            oldMorale,
            newMorale: this.morale,
            reason,
            startedRouting: false
        };
    }

    // Zvýšení morálky
    increaseMorale(amount, reason) {
        const oldMorale = this.morale;
        this.morale = Math.min(this.maxMorale, this.morale + amount);

        return {
            oldMorale,
            newMorale: this.morale,
            reason
        };
    }

    // Pokus o rally (zastavení útěku)
    attemptRally(leaderNearby = false) {
        if (!this.isRouting) return { success: true, message: 'Jednotka neprchá' };

        this.rallyAttempts++;

        // Základní šance na rally: 30% + 5% za každý bod morálky nad 0
        // Bonus +20% pokud je velitel poblíž
        let chance = 30 + (this.morale * 0.5);
        if (leaderNearby) chance += 20;
        if (this.special === 'veteran' || this.special === 'elite') chance += 15;

        // Maximální 3 pokusy, pak jednotka dezertuje
        if (this.rallyAttempts >= 3) {
            return {
                success: false,
                message: 'Jednotka dezertovala!',
                deserted: true
            };
        }

        const roll = Math.random() * 100;
        if (roll < chance) {
            this.isRouting = false;
            this.morale = Math.max(30, this.morale); // Minimální morálka po rally
            this.rallyAttempts = 0;
            return {
                success: true,
                message: 'Rally úspěšné!',
                newMorale: this.morale
            };
        }

        return {
            success: false,
            message: `Rally selhalo (pokus ${this.rallyAttempts}/3)`,
            chance: Math.round(chance)
        };
    }

    // Získat stav morálky jako text
    getMoraleStatus() {
        if (this.isRouting) return 'Prchá!';
        if (this.morale >= 80) return 'Vynikající';
        if (this.morale >= 60) return 'Dobrá';
        if (this.morale >= 40) return 'Normální';
        if (this.morale >= 20) return 'Nízká';
        return 'Kritická';
    }

    // Získat barvu morálky pro UI
    getMoraleColor() {
        if (this.isRouting) return '#ff4444';
        if (this.morale >= 80) return '#44ff44';
        if (this.morale >= 60) return '#88cc44';
        if (this.morale >= 40) return '#cccc44';
        if (this.morale >= 20) return '#cc8844';
        return '#ff4444';
    }

    // Serializace pro ukládání
    serialize() {
        return {
            id: this.id,
            type: this.type,
            col: this.col,
            row: this.row,
            health: this.health,
            hasMoved: this.hasMoved,
            hasAttacked: this.hasAttacked,
            attackCount: this.attackCount,
            isDefending: this.isDefending,
            isTerrified: this.isTerrified,
            movement: this.movement,  // Uložit i změněný pohyb (dismount)
            morale: this.morale,
            isRouting: this.isRouting,
            rallyAttempts: this.rallyAttempts,
            // Hodnoty, které mohou být za hry přepsány (strana scénáře,
            // posily s přepsanou frakcí, eventy měnící staty)
            faction: this.faction,
            attack: this.attack,
            defense: this.defense,
            special: this.special
        };
    }

    // Deserializace
    static deserialize(data) {
        const unit = new Unit(data.type, data.col, data.row, data.id);
        unit.health = data.health;
        unit.hasMoved = data.hasMoved;
        unit.hasAttacked = data.hasAttacked;
        unit.attackCount = data.attackCount || 0;
        unit.isDefending = data.isDefending;
        unit.isTerrified = data.isTerrified || false;
        if (data.movement !== undefined) {
            unit.movement = data.movement;
        }
        // Morálka
        if (data.morale !== undefined) {
            unit.morale = data.morale;
        }
        unit.isRouting = data.isRouting || false;
        unit.rallyAttempts = data.rallyAttempts || 0;
        // Přepsané hodnoty - bez nich by jednotka po načtení spadla
        // zpět na šablonu (a posila s přepsanou frakcí by změnila stranu)
        if (data.faction !== undefined) unit.faction = data.faction;
        if (data.attack !== undefined) unit.attack = data.attack;
        if (data.defense !== undefined) unit.defense = data.defense;
        if (data.special !== undefined) unit.special = data.special;
        return unit;
    }
}

// Továrna na jednotky
