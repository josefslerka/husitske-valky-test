// Prohlížečový adaptér bitvy: vstupy, kamera, Canvas a krátkodobé UI.
// Herní stav mění výhradně voláním příkazů Game; render stav pouze čte.
class BattleView {
    constructor(game) {
        this.game = game;
        this.animationLoop = null;
        this.eventNotificationQueue = [];
        this.activeEventNotification = null;
        this.eventNotificationTimer = null;
        this.eventAbortController = new AbortController();
        this.minimap = new Minimap(document.getElementById('minimap'), game.hexGrid);
        this.panels = new BattlePanels(game);
        this.tooltip = new BattleTooltip(game);
        this.setupEventListeners();
    }

    destroy() {
        this.stopAnimationLoop();
        this.eventAbortController.abort();
        this.minimap.destroy();
        this.tooltip.hideTooltip();
        this.clearEventNotifications();
        this.showAIThinking(false);
    }

    factionLabel(faction) { return this.panels.factionLabel(faction); }
    updateUI() { return this.panels.updateUI(); }
    updateEndTurnButton() { return this.panels.updateEndTurnButton(); }
    updateArmyOverview() { return this.panels.updateArmyOverview(); }
    renderMoraleBar(prefix, faction, aliveCount) { return this.panels.renderMoraleBar(prefix, faction, aliveCount); }
    updateUnitPanel(unit) { return this.panels.updateUnitPanel(unit); }
    updateChoralButton() { return this.panels.updateChoralButton(); }

    showPhase(phase) { this.panels.showPhase(phase); }
    showPhaseBanner(name, description) { this.panels.showPhaseBanner(name, description); }
    updatePhaseDescription(description) { this.panels.updatePhaseDescription(description); }
    handleMouseMove(event) { this.tooltip.handleMouseMove(event); }
    hideTooltip() { this.tooltip.hideTooltip(); }

    handleClick(event) {
        const grid = this.game.hexGrid;
        const rect = grid.canvas.getBoundingClientRect();
        this.game.handleHexClick(grid.pixelToHex(event.clientX - rect.left, event.clientY - rect.top));
    }

    configureScenario(scenario) {
        // Nastavení zvýrazněné cílové zóny (escape zóna nebo breakthrough pozice)
        // Game už převedl souřadnice vítězných podmínek na mapu.
        const _primary = scenario.victoryConditions && scenario.victoryConditions.primary;
        if (_primary) {
            const zoneHexes = _primary.type === 'escape' ? (_primary.escapeZone || [])
                            : _primary.type === 'breakthrough' ? (_primary.positions || [])
                            : [];
            if (zoneHexes.length > 0) {
                this.game.hexGrid.setEscapeZone(zoneHexes.map(([col, row]) => ({ col, row })), _primary.zoneLabel || '');
            }
        }

        // Nastavení map labels (názvy měst, řek, etc.) - s převodem souřadnic
        this.game.hexGrid.mapLabels = (scenario.mapLabels || []).map(label => ({
            text: label.text,
            offset: Array.isArray(label.offset) ? [...label.offset] : [0, 0],
            hexes: label.hexes.map(([col, row]) => {
                const mapped = this.game.hexGrid.scenarioToMap(col, row);
                return [mapped.col, mapped.row];
            })
        }));
    }

    showSelection(unit, { moves = true, attacks = true } = {}) {
        const grid = this.game.hexGrid;
        grid.setSelected(unit.col, unit.row);
        if (!moves) grid.setHighlighted([]);
        else if (unit.canMove()) grid.setHighlighted(this.game.getValidMoves(unit));
        if (attacks && unit.canAttack()) grid.setAttackable(this.game.combatSystem.getValidAttackTargets(unit));
    }

    clearSelection() {
        this.game.hexGrid.setSelected(null, null);
        this.game.hexGrid.clearHighlights();
    }

    showMoveRange(unit) {
        this.game.hexGrid.setHighlighted(unit.canMove() ? this.game.getValidMoves(unit) : []);
    }

    clearLog() {
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
    }

    showGameOver(isVictory, message, stats) {
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

    centerOnPlayerForces() {
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) return;

        const framedUnits = this.game.units.filter(u => u.health > 0);
        if (framedUnits.length === 0) return;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const unit of framedUnits) {
            const pos = this.game.hexGrid.hexToPixel(unit.col, unit.row);
            minX = Math.min(minX, pos.x);
            minY = Math.min(minY, pos.y);
            maxX = Math.max(maxX, pos.x);
            maxY = Math.max(maxY, pos.y);
        }

        const padding = this.game.hexGrid.hexSize * 2.2;

        const applyScroll = () => {
            if (this.game.gameState === 'destroyed') return;
            const containerWidth = mapContainer.clientWidth;
            const containerHeight = mapContainer.clientHeight;
            const maxLeft = Math.max(0, this.game.hexGrid.canvas.width - containerWidth);
            const maxTop = Math.max(0, this.game.hexGrid.canvas.height - containerHeight);

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

            if (minY < this.game.hexGrid.canvas.height * 0.58) {
                top = minY - containerHeight * 0.43;
            }

            mapContainer.scrollLeft = Math.max(0, Math.min(maxLeft, left));
            mapContainer.scrollTop = Math.max(0, Math.min(maxTop, top));
        };

        applyScroll();
        requestAnimationFrame(applyScroll);
        this.game.actions.wait(80).then(active => { if (active) applyScroll(); });
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

    showEventNotification(title, text) {
        if (!text || this.game.gameState === 'destroyed') return;
        this.eventNotificationQueue.push({ title, text });
        this.showNextEventNotification();
    }

    showNextEventNotification() {
        if (this.activeEventNotification || this.eventNotificationQueue.length === 0 ||
            this.game.gameState === 'destroyed') return;

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

    setupEventListeners() {
        // Všechny listenery sdílí abort signál - destroy() je odebere najednou
        const signal = this.eventAbortController.signal;

        // Klik na canvas
        this.game.hexGrid.canvas.addEventListener('click', (e) => this.handleClick(e), { signal });

        // Hover pro tooltip
        this.game.hexGrid.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e), { signal });
        this.game.hexGrid.canvas.addEventListener('mouseleave', () => this.hideTooltip(), { signal });

        // Tlačítko konce tahu (s volitelným potvrzením z nastavení)
        document.getElementById('btn-end-turn').addEventListener('click', async () => {
            if (this.game.currentFaction !== 'hussites' || !this.game.canStartAction()) return;
            if (window.gameSettings && window.gameSettings.confirmEndTurn &&
                this.game.currentFaction === 'hussites' && this.game.gameState === 'playing' &&
                typeof showConfirmDialog === 'function') {
                const confirmed = await showConfirmDialog(
                    i18n.t('game.confirmEndTurnPrompt'),
                    i18n.t('game.endTurn')
                );
                if (!confirmed) return;
            }
            if (this.game.currentFaction === 'hussites') this.game.endTurn();
        }, { signal });

        // Klik na indikátor "Křižáci přemýšlí" zrychlí (přeskočí) animaci tahu AI.
        // Sticky: jakmile hráč klikne, AI tahy běží zrychleně až do konce bitvy.
        const aiThinking = document.getElementById('ai-thinking');
        if (aiThinking) {
            aiThinking.addEventListener('click', () => {
                if (this.game.skipAIAnimations()) {
                    aiThinking.classList.add('skipping');
                }
            }, { signal });
        }

        // Tlačítko útoku - zvýrazní platné cíle vybrané jednotky
        const attackBtn = document.getElementById('btn-attack');
        if (attackBtn) {
            attackBtn.addEventListener('click', () => {
                if (!this.game.selectedUnit || !this.game.selectedUnit.canAttack()) return;
                const targets = this.game.combatSystem.getValidAttackTargets(this.game.selectedUnit);
                this.game.hexGrid.setAttackable(targets);
                this.render();
                this.game.addLog(i18n.t('gameLog.selectAttackTarget'), 'combat');
            }, { signal });
        }

        // Tlačítko obrany
        document.getElementById('btn-defend').addEventListener('click', () => this.game.combatSystem.defendSelectedUnit(), { signal });

        // WP1: tlačítka vozové hradby - sepnout/rozevřít jeden vůz nebo celou linii
        const formationBtn = document.getElementById('btn-formation');
        if (formationBtn) {
            formationBtn.addEventListener('click', () => {
                if (this.game.selectedUnit) this.game.toggleWagonFormation(this.game.selectedUnit);
            }, { signal });
        }
        const formationLineBtn = document.getElementById('btn-formation-line');
        if (formationLineBtn) {
            formationLineBtn.addEventListener('click', () => {
                if (this.game.selectedUnit) this.game.toggleWagonFormationLine(this.game.selectedUnit);
            }, { signal });
        }
        // P4: pochod hradby (přepnout linii mezi pevnou zdí a pochodovým šikem)
        const formationMarchBtn = document.getElementById('btn-formation-march');
        if (formationMarchBtn) {
            formationMarchBtn.addEventListener('click', () => {
                if (this.game.selectedUnit) this.game.toggleWagonMarch(this.game.selectedUnit);
            }, { signal });
        }

        // Tlačítko undo (vrátit pohyb)
        document.getElementById('btn-undo').addEventListener('click', () => this.game.undoLastMove(), { signal });

        // Tlačítko chorálu
        const choralBtn = document.getElementById('btn-choral');
        if (choralBtn) {
            choralBtn.addEventListener('click', () => this.game.activateChoral(), { signal });
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
                    this.game.initGame();
                }
            }, { signal });
        }
    }

    centerOnUnit(unit) {
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer || !unit) return;

        requestAnimationFrame(() => {
            if (this.game.gameState === 'destroyed') return;
            const pos = this.game.hexGrid.hexToPixel(unit.col, unit.row);
            const containerWidth = mapContainer.clientWidth;
            const containerHeight = mapContainer.clientHeight;
            const maxLeft = Math.max(0, this.game.hexGrid.canvas.width - containerWidth);
            const maxTop = Math.max(0, this.game.hexGrid.canvas.height - containerHeight);

            mapContainer.scrollLeft = Math.max(0, Math.min(maxLeft, pos.x - containerWidth / 2));
            mapContainer.scrollTop = Math.max(0, Math.min(maxTop, pos.y - containerHeight / 2));
        });
    }

    showAIThinking(show) {
        const indicator = document.getElementById('ai-thinking');
        if (indicator) {
            if (show) {
                // WP5: text nese jméno strany, která je právě na tahu (AI = currentFaction)
                const textEl = indicator.querySelector('.ai-thinking-text');
                if (textEl) {
                    textEl.textContent = i18n.t('game.aiThinkingNamed', { faction: this.game.factionLabel(this.game.currentFaction) });
                }
                indicator.classList.remove('hidden');
            } else {
                indicator.classList.add('hidden');
            }
        }
    }

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

        // Odstranit i při zrušení časovače výměnou/ukončením bitvy.
        this.game.actions.wait(1200).then(() => {
            if (damageEl.parentNode) {
                damageEl.parentNode.removeChild(damageEl);
            }
        });
    }

    showAttackAnimation(fromCol, fromRow, toCol, toRow) {
        this.game.hexGrid.addAttackAnimation(fromCol, fromRow, toCol, toRow);
    }

    showExplosionAnimation(col, row) {
        this.game.hexGrid.addExplosionAnimation(col, row);
    }

    render() {
        const aliveUnits = this.game.units.filter(u => u.health > 0);

        // Filtrování viditelných jednotek pro render
        const visibleUnits = this.game.fogOfWar
            ? aliveUnits.filter(u => u.faction === 'hussites' || this.game.fogOfWarSystem.isEnemyVisible(u))
            : aliveUnits;

        // Předání informací o mlze do rendereru
        this.game.hexGrid.render(visibleUnits, {
            fogOfWar: this.game.fogOfWar,
            visibleHexes: this.game.visibleHexes,
            exploredHexes: this.game.exploredHexes
        });
        this.minimap.render(visibleUnits);
    }
}
