// Hlavní vstupní bod - inicializace hry

// Custom confirm dialog
function showConfirmDialog(message, title = null) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirm-modal');
        const titleEl = document.getElementById('confirm-title');
        const messageEl = document.getElementById('confirm-message');
        const okBtn = document.getElementById('confirm-ok');
        const cancelBtn = document.getElementById('confirm-cancel');

        // Použij i18n pro výchozí titulek
        titleEl.textContent = title || (typeof i18n !== 'undefined' ? i18n.t('confirm.title') : 'Potvrzení');
        messageEl.textContent = message;
        modal.classList.remove('hidden');

        const handleOk = () => {
            modal.classList.add('hidden');
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
            resolve(true);
        };

        const handleCancel = () => {
            modal.classList.add('hidden');
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
            resolve(false);
        };

        okBtn.addEventListener('click', handleOk);
        cancelBtn.addEventListener('click', handleCancel);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Reference na obrazovky
    const mainMenu = document.getElementById('main-menu');
    const gameContainer = document.getElementById('game-container');

    // Reference na modaly
    const missionModal = document.getElementById('mission-modal');
    const helpModal = document.getElementById('help-modal');
    const pauseModal = document.getElementById('pause-modal');
    const settingsModal = document.getElementById('settings-modal');
    const aboutModal = document.getElementById('about-modal');
    const gameoverModal = document.getElementById('gameover-modal');
    const objectivesPanel = document.getElementById('objectives-panel');

    // Získání canvasu
    const canvas = document.getElementById('game-canvas');

    // Herní proměnné
    let hexGrid = null;
    let game = null;
    let selectedScenario = null;

    // Úklid staré instance hry - jinak její listenery a animační smyčka
    // zůstávají aktivní a každý klik na tlačítka se zpracuje vícekrát
    function destroyCurrentGame() {
        if (game && typeof game.destroy === 'function') {
            game.destroy();
        }
        game = null;
    }

    // Nastavení hry
    const gameSettings = {
        soundEnabled: true,
        soundVolume: 70,
        aiSpeed: 'normal',
        showDamage: true,
        confirmEndTurn: false,
        difficultyLevel: 'beginner' // 'beginner' = bez mlhy, 'advanced' = s mlhou války
    };

    // Nastavení musí být dostupné i pro game.js / ai.js / CombatSystem
    // (confirmEndTurn, aiSpeed, showDamage)
    window.gameSettings = gameSettings;

    // Načtení uložených nastavení
    loadSettings();

    // Aplikace hlasitosti z uložených nastavení
    applyVolumeSettings();

    function applyVolumeSettings() {
        const vol = (gameSettings.soundVolume !== undefined ? gameSettings.soundVolume : 70) / 100;
        Sound.setVolume(vol);
        Music.setVolume(vol);
    }

    // =============================================
    // HLAVNÍ MENU
    // =============================================

    // Tlačítko Nová hra
    document.getElementById('btn-new-campaign').addEventListener('click', () => {
        showMissionSelection();
    });

    // Tlačítko Pokračovat
    document.getElementById('btn-continue').addEventListener('click', () => {
        const savedGame = localStorage.getItem('husitskeValky_save');
        if (savedGame) {
            startGameFromSave();
        }
    });

    // Kontrola zda existuje uložená hra
    checkSavedGame();

    // Tlačítko Rychlá bitva (spustí výchozí bitvu bez scénáře)
    document.getElementById('btn-quick-battle').addEventListener('click', () => {
        startQuickBattle();
    });

    // Tlačítko Encyklopedie
    document.getElementById('btn-encyclopedia').addEventListener('click', () => {
        showEncyclopedia();
    });

    // WP2b: Tlačítko Kronika
    const chronicleModal = document.getElementById('chronicle-modal');
    const btnChronicle = document.getElementById('btn-chronicle');
    if (btnChronicle) {
        btnChronicle.addEventListener('click', () => showChronicle());
    }
    const chronicleClose = document.getElementById('chronicle-close');
    if (chronicleClose) {
        chronicleClose.addEventListener('click', () => chronicleModal.classList.add('hidden'));
    }
    if (chronicleModal) {
        chronicleModal.addEventListener('click', (e) => {
            if (e.target === chronicleModal) chronicleModal.classList.add('hidden');
        });
    }

    // Tlačítko Nastavení
    document.getElementById('btn-settings').addEventListener('click', () => {
        showSettings();
    });

    // Tlačítko O hře
    document.getElementById('btn-about').addEventListener('click', () => {
        showAbout();
    });

    // Tlačítko Hudba v hlavním menu
    const menuMusicBtn = document.getElementById('btn-menu-music');
    menuMusicBtn.addEventListener('click', () => {
        const isPlaying = Music.toggle();
        if (isPlaying) {
            menuMusicBtn.textContent = i18n.t('menu.musicPlaying');
            menuMusicBtn.classList.add('playing');
        } else {
            menuMusicBtn.textContent = i18n.t('menu.music');
            menuMusicBtn.classList.remove('playing');
        }
    });

    // Tlačítko přepínání jazyka v hlavním menu
    const languageToggleBtn = document.getElementById('btn-language-toggle');
    const currentLangFlag = document.getElementById('current-lang-flag');

    // Aktualizuj vlajku podle aktuálního jazyka
    function updateLanguageFlag() {
        const currentLang = i18n.getCurrentLanguage();
        currentLangFlag.textContent = currentLang === 'cs' ? '🇨🇿' : '🇬🇧';
    }

    languageToggleBtn.addEventListener('click', async () => {
        const currentLang = i18n.getCurrentLanguage();
        const newLang = currentLang === 'cs' ? 'en' : 'cs';
        await i18n.setLanguage(newLang);
        updateLanguageFlag();
    });

    // Nastav správnou vlajku při načtení
    updateLanguageFlag();

    // =============================================
    // VÝBĚR MISÍ - KAMPAŇ S AKTY
    // =============================================

    let currentAct = 1;

    function showMissionSelection() {
        mainMenu.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        missionModal.classList.remove('hidden');

        const missionList = document.getElementById('mission-list');
        const missionDetails = document.getElementById('mission-details');
        const campaignActs = document.getElementById('campaign-acts');

        // Zobrazení seznamu, skrytí detailů
        missionList.classList.remove('hidden');
        missionDetails.classList.add('hidden');
        if (campaignActs) campaignActs.classList.remove('hidden');

        // Inicializace záložek aktů
        initActTabs();

        // Zobrazení bitev aktuálního aktu
        showActBattles(currentAct);
    }

    function initActTabs() {
        const tabs = document.querySelectorAll('.act-tab');
        tabs.forEach(tab => {
            // Volá se při každém otevření výběru misí - bez guardu se
            // listenery hromadí a klik se zpracuje vícekrát
            if (tab.dataset.listenerAdded) return;
            tab.dataset.listenerAdded = 'true';
            tab.addEventListener('click', () => {
                const actId = parseInt(tab.dataset.act);

                // Aktivace záložky
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                currentAct = actId;
                showActBattles(actId);
            });
        });
    }

    function showActBattles(actId) {
        const act = Campaign.getAct(actId);
        if (!act) return;

        const missionList = document.getElementById('mission-list');
        const actDescription = document.getElementById('act-description');

        // Aktualizace popisu aktu
        if (actDescription) {
            const descKey = `campaign.act${actId}.description`;
            const description = typeof i18n !== 'undefined' ? i18n.t(descKey) : act.description;
            actDescription.innerHTML = `<p data-i18n="${descKey}">${description}</p>`;
        }

        // Naplnění seznamu bitev
        missionList.innerHTML = '';

        let battleNumber = 1;
        act.battles.forEach((battleRef) => {
            const scenario = ScenarioManager.getScenario(battleRef.id);
            const isLocked = battleRef.locked || !battleRef.available;

            const card = document.createElement('div');
            card.className = 'mission-card' + (isLocked ? ' locked' : '');
            card.dataset.scenarioId = battleRef.id;

            if (scenario) {
                // Hvězdičky obtížnosti s popiskem
                const difficultyLabels = ['', i18n.t('difficulty.veryEasy'), i18n.t('difficulty.easy'), i18n.t('difficulty.medium'), i18n.t('difficulty.hard'), i18n.t('difficulty.veryHard')];
                let starsHtml = '';
                for (let i = 1; i <= 5; i++) {
                    starsHtml += `<span class="star ${i <= scenario.difficulty ? 'filled' : ''}">★</span>`;
                }
                const difficultyTooltip = difficultyLabels[scenario.difficulty] || '';

                // Tutorial marker
                const tutorialMarker = scenario.tutorial ? `<span class="tutorial-marker">${i18n.t('mission.tutorial')}</span>` : '';

                card.innerHTML = `
                    <div class="mission-card-number">${isLocked ? '🔒' : battleNumber}</div>
                    <div class="mission-card-info">
                        <div class="mission-card-title">${scenario.name}${tutorialMarker}</div>
                        <div class="mission-card-date">${scenario.date}</div>
                        <div class="mission-card-desc">${isLocked ? i18n.t('mission.locked') : scenario.description}</div>
                    </div>
                    <div class="mission-card-difficulty" title="${i18n.t('mission.difficulty')}: ${difficultyTooltip}">${starsHtml}</div>
                `;

                if (!isLocked) {
                    card.addEventListener('click', () => showMissionDetails(battleRef.id));
                    battleNumber++;
                }
            } else {
                // Scénář zatím neexistuje - zobrazíme placeholder
                const placeholderNames = {
                    'kutna_hora_1421': 'Bitva u Kutné Hory',
                    'nemecky_brod_1422': 'Bitva u Německého Brodu',
                    'most_1421': 'Bitva u Mostu',
                    'horice_1423': 'Bitva u Hořic',
                    'malesov_1424': 'Bitva u Malešova',
                    'tachov_1427': 'Bitva u Tachova',
                    'spanila_jizda_1428': 'Spanilá jízda',
                    'oblehani_plzne_1433': 'Obléhání Plzně',
                    'sion_1437': 'Obléhání Sionu'
                };

                const placeholderDates = {
                    'kutna_hora_1421': 'prosinec 1421',
                    'nemecky_brod_1422': 'leden 1422',
                    'most_1421': 'srpen 1421',
                    'horice_1423': 'duben 1423',
                    'malesov_1424': 'červen 1424',
                    'tachov_1427': 'srpen 1427',
                    'spanila_jizda_1428': '1428-1430',
                    'oblehani_plzne_1433': '1433-1434',
                    'sion_1437': 'únor 1437'
                };

                card.innerHTML = `
                    <div class="mission-card-number">🔒</div>
                    <div class="mission-card-info">
                        <div class="mission-card-title">${placeholderNames[battleRef.id] || i18n.t('mission.unknown')}</div>
                        <div class="mission-card-date">${placeholderDates[battleRef.id] || '???'}</div>
                        <div class="mission-card-desc">${i18n.t('mission.preparing')}</div>
                    </div>
                    <div class="mission-card-difficulty">
                        <span class="star">★</span>
                        <span class="star">★</span>
                        <span class="star">★</span>
                    </div>
                `;
            }

            missionList.appendChild(card);
        });
    }

    function showMissionDetails(scenarioId) {
        let scenario = ScenarioManager.getScenario(scenarioId);
        if (!scenario) return;

        // Použij lokalizovanou verzi scénáře
        if (typeof getLocalizedScenario === 'function') {
            scenario = getLocalizedScenario(scenarioId, scenario);
        }

        selectedScenario = scenario;

        const missionList = document.getElementById('mission-list');
        const missionDetails = document.getElementById('mission-details');
        const campaignActs = document.getElementById('campaign-acts');
        const actDescription = document.getElementById('act-description');
        const tutorialBadge = document.getElementById('mission-tutorial-badge');

        // Skrytí seznamu a záložek, zobrazení detailů
        missionList.classList.add('hidden');
        missionDetails.classList.remove('hidden');
        if (campaignActs) campaignActs.classList.add('hidden');
        if (actDescription) actDescription.classList.add('hidden');

        // Naplnění detailů
        document.getElementById('mission-title').textContent = scenario.name;
        document.getElementById('mission-date').textContent = scenario.date;
        document.getElementById('mission-description').textContent = scenario.description;
        document.getElementById('mission-briefing').textContent = scenario.briefing.hussites;

        // Tutorial badge
        if (tutorialBadge) {
            if (scenario.tutorial) {
                tutorialBadge.classList.remove('hidden');
            } else {
                tutorialBadge.classList.add('hidden');
            }
        }

        // Cíle mise
        const objectivesList = document.getElementById('mission-objectives-list');
        objectivesList.innerHTML = '';

        // Hlavní cíl
        const primaryLi = document.createElement('li');
        primaryLi.className = 'primary';
        primaryLi.textContent = scenario.victoryConditions.primary.description;
        objectivesList.appendChild(primaryLi);

        // Sekundární cíle
        if (scenario.victoryConditions.secondary) {
            for (const secondary of scenario.victoryConditions.secondary) {
                const li = document.createElement('li');
                li.className = 'secondary';
                li.textContent = secondary.description;
                objectivesList.appendChild(li);
            }
        }

        // Historické poznámky z battleLore
        const historySection = document.getElementById('mission-history');

        if (historySection && typeof getBattleLore === 'function') {
            let lore = getBattleLore(scenarioId);

            // Použij lokalizovanou verzi lore
            if (lore && typeof getLocalizedBattleLore === 'function') {
                lore = getLocalizedBattleLore(scenarioId, lore);
            }

            if (lore) {
                historySection.classList.remove('hidden');

                // Husitská strana
                const hussiteCommanders = document.getElementById('history-hussite-commanders');
                const hussiteStrength = document.getElementById('history-hussite-strength');
                if (lore.hussiteSide) {
                    hussiteCommanders.textContent = lore.hussiteSide.commanders.join(', ');
                    hussiteStrength.textContent = lore.hussiteSide.strength;
                }

                // Nepřátelská strana
                const enemyCommanders = document.getElementById('history-enemy-commanders');
                const enemyStrength = document.getElementById('history-enemy-strength');
                if (lore.enemySide) {
                    enemyCommanders.textContent = lore.enemySide.commanders.join(', ');
                    enemyStrength.textContent = lore.enemySide.strength;
                }

                // Citát
                const quoteSection = document.getElementById('history-quote');
                const quoteText = document.getElementById('history-quote-text');
                const quoteSource = document.getElementById('history-quote-source');
                if (lore.quotes && lore.quotes.length > 0) {
                    const quote = lore.quotes[0];
                    quoteText.textContent = `"${quote.text}"`;
                    quoteSource.textContent = `— ${quote.source}`;
                    quoteSection.classList.remove('hidden');
                } else {
                    quoteSection.classList.add('hidden');
                }

                // Spolehlivost pramenů
                const reliabilityEl = document.getElementById('history-reliability');
                if (reliabilityEl && lore.reliability) {
                    reliabilityEl.textContent = `${i18n.t('mission.reliabilityLabel')} ${lore.reliability}`;
                }
            } else {
                historySection.classList.add('hidden');
            }
        }
    }

    // Tlačítko zpět na seznam
    document.getElementById('btn-back-to-list').addEventListener('click', () => {
        const missionList = document.getElementById('mission-list');
        const missionDetails = document.getElementById('mission-details');
        const campaignActs = document.getElementById('campaign-acts');
        const actDescription = document.getElementById('act-description');

        missionDetails.classList.add('hidden');
        missionList.classList.remove('hidden');
        if (campaignActs) campaignActs.classList.remove('hidden');
        if (actDescription) actDescription.classList.remove('hidden');
        selectedScenario = null;
    });

    // Tlačítko zahájit bitvu
    document.getElementById('btn-start-mission').addEventListener('click', () => {
        if (!selectedScenario) return;
        startMission(selectedScenario);
    });

    function startMission(scenario) {
        // Zastavení hudby z hlavního menu
        Music.stop();
        menuMusicBtn.textContent = '🎵 Hudba';
        menuMusicBtn.classList.remove('playing');

        // Skrytí modalu
        missionModal.classList.add('hidden');

        // Aktualizace headeru s názvem bitvy a datem
        document.getElementById('battle-name').textContent = scenario.name;
        document.getElementById('battle-date').textContent = scenario.date;

        // Vytvoření nové hexové mapy podle velikosti scénáře
        const mapSize = scenario.mapSize;
        hexGrid = new HexGrid(canvas, mapSize.width, mapSize.height, 40);

        // Vytvoření nové instance hry s novým gridem
        destroyCurrentGame();
        game = new Game(hexGrid);
        game.currentScenario = scenario;

        // Nastavení mlhy války podle obtížnosti (pokud scénář nemá noFogOfWar)
        if (scenario.specialMechanics && scenario.specialMechanics.noFogOfWar) {
            game.fogOfWar = false;
        } else {
            game.fogOfWar = (gameSettings.difficultyLevel === 'advanced');
        }

        // Inicializace hry se scénářem
        game.initGameWithScenario(scenario);

        // Aktualizace cílů mise v panelu
        updateObjectivesPanel(scenario);

        // Cíle jsou dostupné v dolní liště; na startu nekolidují s úvodní
        // událostí/tipem, aby první pohled zůstal čistý.
        if (objectivesPanel) {
            objectivesPanel.classList.add('hidden');
        }

        // Export pro debugging
        window.game = game;
        window.hexGrid = hexGrid;

        // Kamera až po dokončení UI startu mise, jinak se rámování počítá
        // proti přechodnému layoutu modalu/panelů.
        requestAnimationFrame(() => game.centerOnPlayerForces());
        setTimeout(() => game.centerOnPlayerForces(), 120);
    }

    function startQuickBattle() {
        // Zastavení hudby z hlavního menu
        Music.stop();
        menuMusicBtn.textContent = '🎵 Hudba';
        menuMusicBtn.classList.remove('playing');

        mainMenu.classList.add('hidden');
        gameContainer.classList.remove('hidden');

        // Aktualizace headeru pro rychlou bitvu
        document.getElementById('battle-name').textContent = i18n.t('quickBattle.name');
        document.getElementById('battle-date').textContent = i18n.t('quickBattle.date');

        // Vytvoření výchozí hexové mapy
        hexGrid = new HexGrid(canvas, 16, 10, 40);

        // Vytvoření instance hry
        destroyCurrentGame();
        game = new Game(hexGrid);

        // Nastavení mlhy války podle obtížnosti
        // Pro quick battle není scenario, takže vždy používáme nastavení
        game.fogOfWar = (gameSettings.difficultyLevel === 'advanced');

        // Inicializace bez scénáře (výchozí armády)
        game.initGame();

        // Export pro debugging
        window.game = game;
        window.hexGrid = hexGrid;
    }

    function startGameFromSave() {
        // Save je potřeba přečíst předem - určuje scénář, a tím velikost
        // mapy, terén a podmínky vítězství
        let saveData = null;
        try {
            saveData = JSON.parse(localStorage.getItem('husitskeValky_save'));
        } catch (e) {
            console.error('Poškozený save:', e);
            return;
        }
        if (!saveData) return;

        const scenario = saveData.scenarioId
            ? ScenarioManager.getScenario(saveData.scenarioId)
            : null;

        mainMenu.classList.add('hidden');
        gameContainer.classList.remove('hidden');

        destroyCurrentGame();

        if (scenario) {
            // Stejná příprava jako startMission: grid dle scénáře, terén,
            // podmínky vítězství... loadGame pak přepíše dynamický stav
            const mapSize = scenario.mapSize;
            hexGrid = new HexGrid(canvas, mapSize.width, mapSize.height, 40);
            game = new Game(hexGrid);
            game.fogOfWar = (gameSettings.difficultyLevel === 'advanced');
            game.initGameWithScenario(scenario);

            document.getElementById('battle-name').textContent = scenario.name;
            document.getElementById('battle-date').textContent = scenario.date;
            updateObjectivesPanel(scenario);
            selectedScenario = scenario;
        } else {
            // Starý save nebo rychlá bitva - výchozí mapa
            hexGrid = new HexGrid(canvas, 16, 10, 40);
            game = new Game(hexGrid);
            game.initGame();
        }

        // Načtení hry (jednotky, kolo, průběh scénáře, mlha války)
        game.loadGame();

        // Export pro debugging
        window.game = game;
        window.hexGrid = hexGrid;
    }

    // =============================================
    // CÍLE MISE - IN GAME
    // =============================================

    function updateObjectivesPanel(scenario) {
        if (!scenario || !scenario.victoryConditions) return;

        const primaryObjective = document.getElementById('primary-objective');
        const secondaryObjectives = document.getElementById('secondary-objectives');

        primaryObjective.textContent = scenario.victoryConditions.primary.description;

        // Trvalý cíl v hlavičce - vždy viditelný během hry (ne jen v skrytém panelu)
        const objectiveHud = document.getElementById('objective-hud');
        const objectiveHudText = document.getElementById('objective-hud-text');
        if (objectiveHud && objectiveHudText) {
            objectiveHudText.textContent = scenario.victoryConditions.primary.description;
            objectiveHud.classList.remove('hidden');
        }

        secondaryObjectives.innerHTML = '';
        if (scenario.victoryConditions.secondary) {
            for (const secondary of scenario.victoryConditions.secondary) {
                const div = document.createElement('div');
                div.className = 'objective secondary';
                div.innerHTML = `
                    <span class="objective-status">◇</span>
                    <span class="objective-text">${secondary.description}</span>
                `;
                secondaryObjectives.appendChild(div);
            }
        }
    }

    // Tlačítko Cíle
    const btnObjectives = document.getElementById('btn-objectives');
    const btnCloseObjectives = document.getElementById('btn-close-objectives');

    if (btnObjectives) {
        btnObjectives.addEventListener('click', () => {
            if (objectivesPanel) objectivesPanel.classList.toggle('hidden');
        });
    }

    // Zavření panelu cílů
    if (btnCloseObjectives) {
        btnCloseObjectives.addEventListener('click', () => {
            if (objectivesPanel) objectivesPanel.classList.add('hidden');
        });
    }

    // =============================================
    // SBALOVACÍ PANELY
    // =============================================

    const unitPanel = document.getElementById('unit-panel');
    const infoPanel = document.getElementById('info-panel');
    const toggleLeft = document.getElementById('toggle-left');
    const toggleRight = document.getElementById('toggle-right');

    // Toggle levého panelu.
    // Na šířkách <=1200px (vč. mobilních lišt "polního rukopisu" <=900px) media
    // query obsah panelu skrývá a zpět ho umí přivést jen třída .expanded -
    // tu ale tenhle handler nikdy nenastavoval (přepínal jen .collapsed),
    // takže se panely na malých obrazovkách nedaly rozbalit vůbec.
    if (toggleLeft && unitPanel) {
        toggleLeft.addEventListener('click', () => {
            if (window.innerWidth <= 1200) {
                unitPanel.classList.toggle('expanded');
                toggleLeft.textContent = unitPanel.classList.contains('expanded') ? '◀' : '▶';
            } else {
                unitPanel.classList.toggle('collapsed');
                toggleLeft.textContent = unitPanel.classList.contains('collapsed') ? '▶' : '◀';
            }
        });
    }

    // Toggle pravého panelu (zrcadlově k levému)
    if (toggleRight && infoPanel) {
        toggleRight.addEventListener('click', () => {
            if (window.innerWidth <= 1200) {
                infoPanel.classList.toggle('expanded');
                toggleRight.textContent = infoPanel.classList.contains('expanded') ? '▶' : '◀';
            } else {
                infoPanel.classList.toggle('collapsed');
                toggleRight.textContent = infoPanel.classList.contains('collapsed') ? '◀' : '▶';
            }
        });
    }

    // Responzivita - automatické sbíhání/rozbalení na menších obrazovkách
    function handleResize() {
        if (!unitPanel || !infoPanel || !toggleLeft || !toggleRight) return;

        const width = window.innerWidth;
        if (width <= 1200) {
            // Malé a střední obrazovky - obsah panelů skrývá media query,
            // rozbaluje se kliknutím na šipku (třída .expanded). Šipky ukažme
            // směrem "rozbalit", dokud rozbaleno není.
            if (!unitPanel.classList.contains('expanded')) {
                unitPanel.classList.add('collapsed');
                toggleLeft.textContent = '▶';
            }
            if (!infoPanel.classList.contains('expanded')) {
                infoPanel.classList.add('collapsed');
                toggleRight.textContent = '◀';
            }
        } else {
            // Na velkých obrazovkách - normální stav (expanded už není potřeba)
            unitPanel.classList.remove('collapsed', 'expanded');
            infoPanel.classList.remove('collapsed', 'expanded');
            toggleLeft.textContent = '◀';
            toggleRight.textContent = '▶';
        }
    }

    window.addEventListener('resize', handleResize);

    // =============================================
    // PAUSE MENU
    // =============================================

    // Tlačítko Menu ve footeru - otevře dropdown nebo pause menu
    const footerMenu = document.querySelector('.footer-menu');
    const menuBtn = document.getElementById('btn-menu');

    // Klik na tlačítko Menu přepne dropdown
    if (menuBtn && footerMenu) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            footerMenu.classList.toggle('open');
        });
    }

    // Zavření dropdown menu při kliku mimo
    document.addEventListener('click', (e) => {
        if (footerMenu && !footerMenu.contains(e.target)) {
            footerMenu.classList.remove('open');
        }
    });

    // Položky v dropdown menu
    const btnSave = document.getElementById('btn-save');
    const btnLoad = document.getElementById('btn-load');
    const btnSound = document.getElementById('btn-sound');
    const btnHelp = document.getElementById('btn-help');

    if (btnSave) {
        btnSave.addEventListener('click', () => {
            if (game) game.saveGame();
            if (footerMenu) footerMenu.classList.remove('open');
        });
    }

    if (btnLoad) {
        btnLoad.addEventListener('click', () => {
            if (game) game.loadGame();
            if (footerMenu) footerMenu.classList.remove('open');
        });
    }

    if (btnSound) {
        btnSound.addEventListener('click', () => {
            gameSettings.soundEnabled = !gameSettings.soundEnabled;
            if (gameSettings.soundEnabled) {
                btnSound.innerHTML = i18n.t('game.sound');
                Sound.unmute();
            } else {
                btnSound.innerHTML = i18n.t('game.soundOff');
                Sound.mute();
            }
            if (footerMenu) footerMenu.classList.remove('open');
        });
    }

    if (btnHelp) {
        btnHelp.addEventListener('click', () => {
            if (game) populateHelpUnits(game);
            helpModal.classList.remove('hidden');
            if (footerMenu) footerMenu.classList.remove('open');
        });
    }

    function showPauseMenu() {
        pauseModal.classList.remove('hidden');
        if (game) {
            game.isPaused = true;
        }
    }

    function hidePauseMenu() {
        pauseModal.classList.add('hidden');
        if (game) {
            game.isPaused = false;
        }
    }

    // Tlačítko Pokračovat
    document.getElementById('btn-resume').addEventListener('click', () => {
        hidePauseMenu();
    });

    // Tlačítko Cíle mise v pause menu
    document.getElementById('btn-pause-objectives').addEventListener('click', () => {
        hidePauseMenu();
        objectivesPanel.classList.remove('hidden');
    });

    // Tlačítko Uložit v pause menu
    document.getElementById('btn-pause-save').addEventListener('click', () => {
        if (game) {
            game.saveGame();
        }
        hidePauseMenu();
    });

    // Tlačítko Načíst v pause menu
    document.getElementById('btn-pause-load').addEventListener('click', () => {
        if (game) {
            game.loadGame();
        }
        hidePauseMenu();
    });

    // Tlačítko Nastavení v pause menu
    document.getElementById('btn-pause-settings').addEventListener('click', () => {
        hidePauseMenu();
        showSettings();
    });

    // Tlačítko Nápověda v pause menu
    document.getElementById('btn-pause-help').addEventListener('click', () => {
        hidePauseMenu();
        if (game) {
            populateHelpUnits(game);
        }
        helpModal.classList.remove('hidden');
    });

    // Tlačítko Hlavní menu
    document.getElementById('btn-quit-to-menu').addEventListener('click', () => {
        hidePauseMenu();
        returnToMainMenu();
    });

    // Klik na logo - návrat do hlavního menu
    const logoHomeBtn = document.getElementById('logo-home-btn');
    if (logoHomeBtn) {
        logoHomeBtn.addEventListener('click', async () => {
            const confirmed = await showConfirmDialog(
                typeof i18n !== 'undefined' ? i18n.t('game.confirmReturn') : 'Opravdu chcete opustit bitvu a vrátit se do hlavního menu?',
                typeof i18n !== 'undefined' ? i18n.t('game.returnToMenu') : 'Návrat do menu'
            );
            if (confirmed) {
                returnToMainMenu();
            }
        });
    }

    function returnToMainMenu() {
        // Zastavení hry (listenery + animační smyčka)
        destroyCurrentGame();

        // Skrytí všech modalů a herní obrazovky
        missionModal.classList.add('hidden');
        pauseModal.classList.add('hidden');
        gameoverModal.classList.add('hidden');
        objectivesPanel.classList.add('hidden');
        gameContainer.classList.add('hidden');

        // Skrýt i starý victory modal
        const oldVictoryModal = document.getElementById('victory-modal');
        if (oldVictoryModal) {
            oldVictoryModal.classList.add('hidden');
        }

        // Zobrazení hlavního menu
        mainMenu.classList.remove('hidden');

        // Reset herních proměnných
        game = null;
        hexGrid = null;
        selectedScenario = null;

        // Kontrola uložené hry
        checkSavedGame();
    }

    // Expozice funkce pro globální přístup (např. z game.js)
    window.returnToMainMenu = returnToMainMenu;

    // =============================================
    // NASTAVENÍ
    // =============================================

    function showSettings() {
        // Naplnění hodnot z aktuálního nastavení
        document.getElementById('sound-enabled').checked = gameSettings.soundEnabled;
        document.getElementById('sound-volume').value = gameSettings.soundVolume;
        document.getElementById('ai-speed').value = gameSettings.aiSpeed;
        document.getElementById('show-damage').checked = gameSettings.showDamage;
        document.getElementById('confirm-end-turn').checked = gameSettings.confirmEndTurn;
        document.getElementById('difficulty-level').value = gameSettings.difficultyLevel;

        // Nastavení aktuálního jazyka
        const languageSelect = document.getElementById('language-select');
        if (languageSelect && typeof i18n !== 'undefined') {
            languageSelect.value = i18n.getCurrentLanguage();
        }

        settingsModal.classList.remove('hidden');
    }

    function hideSettings() {
        settingsModal.classList.add('hidden');
    }

    function showAbout() {
        aboutModal.classList.remove('hidden');
    }

    function hideAbout() {
        aboutModal.classList.add('hidden');
    }

    // Zavření about modalu
    document.getElementById('about-close').addEventListener('click', () => {
        hideAbout();
    });

    // Tlačítko Uložit nastavení
    document.getElementById('btn-settings-save').addEventListener('click', async () => {
        gameSettings.soundEnabled = document.getElementById('sound-enabled').checked;
        gameSettings.soundVolume = parseInt(document.getElementById('sound-volume').value);
        gameSettings.aiSpeed = document.getElementById('ai-speed').value;
        gameSettings.showDamage = document.getElementById('show-damage').checked;
        gameSettings.confirmEndTurn = document.getElementById('confirm-end-turn').checked;
        gameSettings.difficultyLevel = document.getElementById('difficulty-level').value;

        // Aplikace jazyka
        const languageSelect = document.getElementById('language-select');
        if (languageSelect && typeof i18n !== 'undefined') {
            const selectedLanguage = languageSelect.value;
            if (selectedLanguage !== i18n.getCurrentLanguage()) {
                await i18n.setLanguage(selectedLanguage);
            }
        }

        // Aplikace nastavení
        if (gameSettings.soundEnabled) {
            Sound.enable();
        } else {
            Sound.disable();
        }

        // Aplikace hlasitosti (posuvník dosud neměl žádný efekt)
        applyVolumeSettings();

        // Aplikace obtížnosti na běžící hru
        if (game) {
            game.fogOfWar = (gameSettings.difficultyLevel === 'advanced');
            game.render();
        }

        // Uložení do localStorage
        saveSettings();

        hideSettings();
    });

    // Tlačítko Zrušit nastavení
    document.getElementById('btn-settings-cancel').addEventListener('click', () => {
        hideSettings();
    });

    // Zavření nastavení tlačítkem X
    document.getElementById('settings-close').addEventListener('click', () => {
        hideSettings();
    });

    // Zavření mission modalu tlačítkem X
    const missionCloseBtn = document.getElementById('mission-close');
    if (missionCloseBtn) {
        missionCloseBtn.addEventListener('click', () => {
            missionModal.classList.add('hidden');
            returnToMainMenu();
        });
    }

    // Zavření pause modalu tlačítkem X
    const pauseCloseBtn = document.getElementById('pause-close');
    if (pauseCloseBtn) {
        pauseCloseBtn.addEventListener('click', () => {
            hidePauseMenu();
        });
    }

    // Zavření tutorial modalu tlačítkem X
    const tutorialCloseBtn = document.getElementById('tutorial-close');
    if (tutorialCloseBtn) {
        tutorialCloseBtn.addEventListener('click', () => {
            const tutorialModal = document.getElementById('tutorial-modal');
            if (tutorialModal) tutorialModal.classList.add('hidden');
        });
    }

    function saveSettings() {
        localStorage.setItem('husitskeValky_settings', JSON.stringify(gameSettings));
    }

    function loadSettings() {
        const saved = localStorage.getItem('husitskeValky_settings');
        if (saved) {
            const loaded = JSON.parse(saved);
            Object.assign(gameSettings, loaded);

            // Aplikace zvuku
            if (!gameSettings.soundEnabled) {
                Sound.disable();
            }
        }
    }

    function checkSavedGame() {
        const savedGame = localStorage.getItem('husitskeValky_save');
        const continueBtn = document.getElementById('btn-continue');
        if (savedGame) {
            continueBtn.disabled = false;
        } else {
            continueBtn.disabled = true;
        }
    }

    // =============================================
    // ENCYKLOPEDIE (z hlavního menu)
    // =============================================

    function showEncyclopedia() {
        // Bez instance hry vypíše populateHelpUnits všechny typy jednotek,
        // což je pro encyklopedii přesně to, co chceme (a nevzniká temp hra
        // s vlastní animační smyčkou a listenery na živém canvasu)
        populateHelpUnits(null);

        // Inicializuj obsah encyklopedie
        if (typeof initEncyclopediaContent === 'function') {
            initEncyclopediaContent();
        }

        helpModal.classList.remove('hidden');
    }

    // WP2b: Kronika - vygeneruje dobové (lživé) zápisy + pramennou kritiku
    function showChronicle() {
        const modal = document.getElementById('chronicle-modal');
        const list = document.getElementById('chronicle-list');
        if (!modal || !list) return;

        const entries = (typeof ChronicleSystem !== 'undefined') ? ChronicleSystem.getEntries() : [];

        if (!entries.length) {
            list.innerHTML = `<p class="chronicle-empty">${i18n.t('chronicle.empty')}</p>`;
            modal.classList.remove('hidden');
            return;
        }

        // Seřadit podle pořadí bitev v KAMPANI (campaign.js), ne podle pořadí
        // definice v scenarios.js - to se liší (Malešov 1424 je v kampani před Ústím 1426).
        const order = (typeof Campaign !== 'undefined' && Array.isArray(Campaign.acts))
            ? Campaign.acts.reduce((acc, a) => acc.concat((a.battles || []).map(b => b.id)), [])
            : ScenarioManager.getScenarioList().map(s => s.id);
        const sorted = entries.slice().sort((a, b) => {
            const ia = order.indexOf(a.scenarioId), ib = order.indexOf(b.scenarioId);
            return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
        });

        list.innerHTML = sorted.map((entry, i) => {
            const text = ChronicleSystem.generateText(entry);
            const initial = text.charAt(0);
            const rest = text.slice(1);
            const truth = ChronicleSystem.truthText(entry);
            const cls = entry.result === 'victory' ? 'chronicle-victory' : 'chronicle-defeat';
            return `
                <div class="chronicle-entry ${cls}">
                    <p class="chronicle-text"><span class="chronicle-initial">${initial}</span>${rest}</p>
                    <button class="chronicle-critic-btn" data-idx="${i}">🔍 ${i18n.t('chronicle.sourceCritic')}</button>
                    <p class="chronicle-truth hidden" data-truth="${i}">${truth}</p>
                </div>
            `;
        }).join('');

        list.querySelectorAll('.chronicle-critic-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = btn.getAttribute('data-idx');
                const truthEl = list.querySelector(`[data-truth="${idx}"]`);
                if (truthEl) truthEl.classList.toggle('hidden');
            });
        });

        modal.classList.remove('hidden');
    }

    // =============================================
    // GAME OVER
    // =============================================

    // Expozice funkce pro zobrazení game over (volána z game.js)
    window.showGameOver = function(isVictory, message, stats) {
        const gameoverModal = document.getElementById('gameover-modal');
        try {
        const banner = document.getElementById('gameover-banner');
        const title = document.getElementById('gameover-title');
        const msgEl = document.getElementById('gameover-message');
        const nextBtn = document.getElementById('btn-next-mission');

        // Spočítej statistiky
        const turns = stats?.turns || game?.turnNumber || 0;
        const enemiesKilled = stats?.enemiesKilled || 0;
        const unitsLost = stats?.unitsLost || 0;
        const initialEnemies = game?.initialEnemyUnits || enemiesKilled;
        const initialPlayerUnits = game?.initialPlayerUnits || (unitsLost + (game?.units?.filter(u => u.faction === 'hussites' && u.health > 0).length || 0));

        // Procenta
        const enemyWipeout = initialEnemies > 0 ? enemiesKilled / initialEnemies : 0;
        const lossRatio = initialPlayerUnits > 0 ? unitsLost / initialPlayerUnits : 0;

        banner.className = isVictory ? 'victory' : 'defeat';
        banner.textContent = isVictory ? '🏆' : '💀';

        // Konkrétní důvod výsledku ("Přežilo jen 36 % jednotek (potřeba 50 %)")
        // - dosud byl jen v herním logu, kde si ho hráč nevšiml
        const reasonEl = document.getElementById('gameover-reason');
        if (reasonEl) {
            if (stats?.reason) {
                reasonEl.textContent = stats.reason;
                reasonEl.classList.remove('hidden');
            } else {
                reasonEl.classList.add('hidden');
            }
        }

        // Dynamický titulek podle výsledku
        let titleText = isVictory ? i18n.t('gameover.victory') : i18n.t('gameover.defeat');
        if (isVictory) {
            if (enemyWipeout >= 1) {
                titleText = i18n.t('gameover.totalVictory');
            } else if (lossRatio <= 0.1) {
                titleText = i18n.t('gameover.gloriousVictory');
            } else if (lossRatio >= 0.6) {
                titleText = i18n.t('gameover.pyrrhicVictory');
            }
        }
        title.textContent = titleText;
        title.className = isVictory ? 'victory' : 'defeat';

        // Dynamická hláška podle stavu bitvy
        let dynamicMessage = message;
        if (!dynamicMessage && isVictory) {
            if (enemyWipeout >= 1 && lossRatio <= 0.2) {
                dynamicMessage = i18n.t('victory.totalWipeout');
            } else if (enemyWipeout >= 1) {
                dynamicMessage = i18n.t('victory.enemyDestroyed');
            } else if (lossRatio <= 0.1) {
                dynamicMessage = i18n.t('victory.flawless');
            } else if (lossRatio >= 0.6) {
                dynamicMessage = i18n.t('victory.costly');
            } else if (lossRatio >= 0.4) {
                dynamicMessage = i18n.t('victory.hardFought');
            } else {
                dynamicMessage = i18n.t('victory.standard');
            }
        } else if (!dynamicMessage) {
            dynamicMessage = i18n.t('victory.defeat');
        }
        msgEl.textContent = dynamicMessage;

        // Rychlé hodnocení
        const ratingEnemies = document.getElementById('rating-enemies');
        const ratingLosses = document.getElementById('rating-losses');
        const ratingTurns = document.getElementById('rating-turns');

        if (ratingEnemies) {
            ratingEnemies.textContent = `${enemiesKilled}/${initialEnemies}`;
            ratingEnemies.className = 'rating-value ' + (enemyWipeout >= 1 ? 'good' : '');
        }
        if (ratingLosses) {
            ratingLosses.textContent = unitsLost.toString();
            ratingLosses.className = 'rating-value ' + (lossRatio >= 0.5 ? 'bad' : lossRatio <= 0.2 ? 'good' : '');
        }
        if (ratingTurns) {
            ratingTurns.textContent = turns.toString();
        }

        // Rozšířené statistiky
        // Doba hry
        const duration = stats?.duration || (game?.gameDuration ? Math.floor((Date.now() - game.gameDuration) / 1000) : 0);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        document.getElementById('stat-duration').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Bojové statistiky
        document.getElementById('stat-total-damage').textContent = stats?.totalDamage || game?.stats?.totalDamage || 0;
        document.getElementById('stat-damage-taken').textContent = stats?.damageTaken || game?.stats?.damageTaken || 0;

        // Průměrné zdraví přeživších
        const survivingUnits = game ? game.units.filter(u => u.faction === 'hussites' && u.health > 0) : [];
        if (survivingUnits.length > 0) {
            const avgHealth = Math.round(survivingUnits.reduce((sum, u) => sum + (u.health / u.maxHealth * 100), 0) / survivingUnits.length);
            document.getElementById('stat-avg-health').textContent = `${avgHealth}%`;
        } else {
            document.getElementById('stat-avg-health').textContent = '0%';
        }

        // MVP - hrdina bitvy
        const mvpSection = document.getElementById('stats-mvp');
        const mvpIcon = document.getElementById('stat-mvp-icon');
        const mvpName = document.getElementById('stat-mvp-name');
        const mvpStats = document.getElementById('stat-mvp-stats');

        if (game?.stats?.unitKills && Object.keys(game.stats.unitKills).length > 0) {
            // Najdi jednotku s nejvíce zabití
            let maxKills = 0;
            let mvpUnit = null;
            for (const [unitId, kills] of Object.entries(game.stats.unitKills)) {
                if (kills > maxKills) {
                    maxKills = kills;
                    const unit = game.units.find(u => u.id === unitId);
                    if (unit && unit.faction === 'hussites') {
                        mvpUnit = unit;
                    }
                }
            }

            if (mvpUnit && maxKills > 0) {
                mvpSection.classList.remove('hidden');
                mvpIcon.textContent = UnitTypes[mvpUnit.type]?.symbol || '⚔';
                mvpName.textContent = mvpUnit.name;
                const damage = game.stats.unitDamage?.[mvpUnit.id] || 0;
                mvpStats.textContent = `${maxKills} ${i18n.t('gameover.kills')} • ${damage} ${i18n.t('gameover.damage')}`;
            } else {
                mvpSection.classList.add('hidden');
            }
        } else {
            mvpSection.classList.add('hidden');
        }

        // Sekundární cíle
        const objectivesContainer = document.getElementById('gameover-secondary-objectives');
        if (objectivesContainer && stats?.secondaryObjectives && stats.secondaryObjectives.length > 0) {
            let html = `<div class="secondary-objectives-header">${i18n.t('gameover.bonusObjectives')}:</div>`;
            for (const obj of stats.secondaryObjectives) {
                const icon = obj.achieved ? '✓' : '✗';
                const statusClass = obj.achieved ? 'achieved' : 'failed';
                html += `<div class="secondary-objective ${statusClass}">${icon} ${obj.description}</div>`;
            }
            objectivesContainer.innerHTML = html;
            objectivesContainer.classList.remove('hidden');
        } else if (objectivesContainer) {
            objectivesContainer.innerHTML = '';
            objectivesContainer.classList.add('hidden');
        }

        // Tlačítko další mise (pouze při vítězství a pokud existuje další mise)
        if (isVictory && selectedScenario) {
            const scenarios = ScenarioManager.getScenarioList();
            const currentIndex = scenarios.findIndex(s => s.id === selectedScenario.id);
            if (currentIndex < scenarios.length - 1) {
                nextBtn.classList.remove('hidden');
            } else {
                nextBtn.classList.add('hidden');
            }
        } else {
            nextBtn.classList.add('hidden');
        }

        // Trivia - "Věděli jste, že...?" (pouze při vítězství)
        const triviaSection = document.getElementById('gameover-trivia');
        const triviaText = document.getElementById('gameover-trivia-text');
        if (triviaSection && triviaText && isVictory && selectedScenario) {
            const trivia = typeof getRandomTrivia === 'function' ? getRandomTrivia(selectedScenario.id) : null;
            if (trivia) {
                triviaText.textContent = trivia;
                triviaSection.classList.remove('hidden');
            } else {
                triviaSection.classList.add('hidden');
            }
        } else if (triviaSection) {
            triviaSection.classList.add('hidden');
        }

        // WP2a: Vy vs. kronika - srovnání tvého výsledku s údaji kronik
        const chronicleEl = document.getElementById('gameover-chronicle');
        if (chronicleEl) {
            const sid = stats?.scenarioId || selectedScenario?.id;
            let lore = (sid && typeof getBattleLore === 'function') ? getBattleLore(sid) : null;
            if (lore && typeof getLocalizedBattleLore === 'function') lore = getLocalizedBattleLore(sid, lore);
            const lossesBy = stats?.lossesByFaction || {};
            const fledBy = stats?.fledByFaction || {};
            const aliveBy = stats?.aliveByFaction || {};
            if (lore && lore.casualties) {
                const gone = (f) => (lossesBy[f] || 0) + (fledBy[f] || 0);
                const pLost = gone('hussites'), pTotal = (aliveBy.hussites || 0) + pLost;
                const eLost = gone('crusaders'), eTotal = (aliveBy.crusaders || 0) + eLost;
                document.getElementById('chronicle-yours').textContent =
                    i18n.t('gameover.yourLosses', { x: pLost, y: pTotal, a: eLost, b: eTotal, n: turns });
                document.getElementById('chronicle-says').textContent =
                    i18n.t('gameover.chronicleSays', { h: lore.casualties.hussites, e: lore.casualties.enemy });
                document.getElementById('chronicle-note').textContent = i18n.t('gameover.chronicleNote');
                chronicleEl.classList.remove('hidden');
            } else {
                chronicleEl.classList.add('hidden');
            }
        }

        } catch (e) {
            console.error('Chyba v showGameOver:', e);
        }
        // Modal zobrazíme vždy, i pokud nastala chyba ve statistikách
        gameoverModal.classList.remove('hidden');
    };

    // Tlačítko Zkusit znovu
    document.getElementById('btn-retry').addEventListener('click', () => {
        gameoverModal.classList.add('hidden');
        if (selectedScenario) {
            startMission(selectedScenario);
        } else {
            startQuickBattle();
        }
    });

    // Tlačítko Další mise
    document.getElementById('btn-next-mission').addEventListener('click', () => {
        gameoverModal.classList.add('hidden');

        const scenarios = ScenarioManager.getScenarioList();
        const currentIndex = scenarios.findIndex(s => s.id === selectedScenario.id);
        if (currentIndex < scenarios.length - 1) {
            const nextScenario = ScenarioManager.getScenario(scenarios[currentIndex + 1].id);
            selectedScenario = nextScenario;
            startMission(nextScenario);
        }
    });

    // Tlačítko Hlavní menu z game over
    document.getElementById('btn-gameover-menu').addEventListener('click', () => {
        gameoverModal.classList.add('hidden');
        returnToMainMenu();
    });

    // =============================================
    // HELP MODAL
    // =============================================

    const helpClose = document.getElementById('help-close');
    const helpTabs = document.querySelectorAll('.help-tab');

    // Zavření help modalu
    if (helpClose) {
        helpClose.addEventListener('click', () => {
            helpModal.classList.add('hidden');
        });
    }

    // Zavření kliknutím mimo modal
    if (helpModal) {
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.classList.add('hidden');
            }
        });
    }

    // Přepínání záložek
    helpTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            helpTabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.help-tab-content').forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById('tab-' + tabId).classList.add('active');
        });
    });

    // =============================================
    // KLÁVESOVÉ ZKRATKY
    // =============================================

    document.addEventListener('keydown', (e) => {
        // Escape - zavření modalů nebo pause menu
        if (e.key === 'Escape') {
            if (helpModal && !helpModal.classList.contains('hidden')) {
                helpModal.classList.add('hidden');
            } else if (settingsModal && !settingsModal.classList.contains('hidden')) {
                settingsModal.classList.add('hidden');
            } else if (pauseModal && !pauseModal.classList.contains('hidden')) {
                hidePauseMenu();
            } else if (objectivesPanel && !objectivesPanel.classList.contains('hidden')) {
                objectivesPanel.classList.add('hidden');
            } else if (game && gameContainer && !gameContainer.classList.contains('hidden')) {
                // Pokud jsme ve hře, zobrazíme pause menu
                showPauseMenu();
            }
        }

        // Tab - výběr další jednotky která může jednat
        if (e.key === 'Tab' && game && gameContainer && !gameContainer.classList.contains('hidden')) {
            // Pouze pokud nejsou otevřené modaly
            if ((helpModal && !helpModal.classList.contains('hidden')) ||
                (settingsModal && !settingsModal.classList.contains('hidden')) ||
                (pauseModal && !pauseModal.classList.contains('hidden')) ||
                (missionModal && !missionModal.classList.contains('hidden'))) {
                return;
            }

            e.preventDefault(); // Zabraň přepínání focusu

            if (game.currentFaction === 'hussites') {
                game.selectNextUnit();
            }
        }

        // Space/Enter - ukončení tahu
        if ((e.key === ' ' || e.key === 'Enter') && game && gameContainer && !gameContainer.classList.contains('hidden')) {
            // Pouze pokud nejsou otevřené modaly
            if ((helpModal && !helpModal.classList.contains('hidden')) ||
                (settingsModal && !settingsModal.classList.contains('hidden')) ||
                (pauseModal && !pauseModal.classList.contains('hidden')) ||
                (missionModal && !missionModal.classList.contains('hidden'))) {
                return;
            }

            // Pokud všechny jednotky jednaly, Space/Enter ukončí tah
            if (game.currentFaction === 'hussites' && game.allPlayerUnitsActed()) {
                e.preventDefault();
                game.endTurn();
            }
        }
    });

    // =============================================
    // TUTORIÁL - Event listener pro "Pokračovat"
    // =============================================
    const tutorialContinueBtn = document.getElementById('tutorial-continue');
    if (tutorialContinueBtn) {
        tutorialContinueBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (window.game && window.game.isTutorial) {
                window.game.tutorialSystem.closeTutorialDialog();
            } else {
                // Zavřít dialog i když není tutoriál aktivní
                const modal = document.getElementById('tutorial-modal');
                if (modal) modal.classList.add('hidden');
            }
        });
    }

    // Expozice returnToMainMenu pro tutorial
    window.returnToMainMenu = returnToMainMenu;
});

// =============================================
// POMOCNÉ FUNKCE
// =============================================

// Funkce pro naplnění seznamu jednotek v helpu
function populateHelpUnits(game) {
    const container = document.getElementById('help-units-list');
    container.innerHTML = '';

    // Získání unikátních typů jednotek
    const unitTypesInBattle = new Map();

    // Pokud máme hru s jednotkami, použijeme je
    if (game && game.units && game.units.length > 0) {
        for (const unit of game.units) {
            if (!unitTypesInBattle.has(unit.type)) {
                // Použij lokalizovanou verzi jednotky
                const localizedUnit = typeof getLocalizedUnit === 'function'
                    ? getLocalizedUnit(unit.type, UnitTypes[unit.type])
                    : UnitTypes[unit.type];
                unitTypesInBattle.set(unit.type, localizedUnit);
            }
        }
    } else {
        // Jinak zobrazíme všechny typy jednotek
        for (const [key, value] of Object.entries(UnitTypes)) {
            // Použij lokalizovanou verzi jednotky
            const localizedUnit = typeof getLocalizedUnit === 'function'
                ? getLocalizedUnit(key, value)
                : value;
            unitTypesInBattle.set(key, localizedUnit);
        }
    }

    // Popis speciálních schopností - použij i18n pokud je dostupné
    const getSpecialDescription = (special) => {
        if (typeof i18n !== 'undefined' && i18n.hasTranslation(`special.${special}`)) {
            return i18n.t(`special.${special}`);
        }
        // Fallback na české texty
        const specialDescriptions = {
            armorPiercing: 'Drtivý úder (+30% vs obrněné)',
            reach: 'Dosah (útok přes spojence)',
            shieldWall: 'Štítová zeď (+20% obrana střelcům)',
            antiCavalry: 'Proti jízdě (+50% poškození)',
            wagenburg: 'Vozová hradba (+15% obrana/vůz)',
            terror: 'Děsivý (-10% útok nepříteli)',
            pursuit: 'Pronásledování (+30% vs oslabené)',
            charge: 'Náraz (+50% po pohybu)',
            scout: 'Průzkum (+1 dohled)',
            dismount: 'Sesazení (30% šance zpomalit jízdu)',
            elite: 'Elitní (+10% ke všemu)',
            veteran: 'Veterán (+10% ke všemu)',
            rapidFire: 'Rychlostřelba (2 útoky, 75% poškození)',
            siege: 'Obléhání (+100% vs vozy)',
            areaAttack: 'Plošný útok (50% sousedům)',
            mobile: 'Mobilní (střelba po pohybu)'
        };
        return specialDescriptions[special] || special;
    };

    // Třídy jednotek - popis
    const getClassName = (unitClass) => {
        if (typeof i18n !== 'undefined' && i18n.hasTranslation(`unitClass.${unitClass}`)) {
            return i18n.t(`unitClass.${unitClass}`);
        }
        // Fallback na české texty
        const classNames = {
            infantry: 'Pěchota',
            ranged: 'Střelci',
            artillery: 'Dělostřelectvo',
            cavalry: 'Lehká jízda',
            heavyCavalry: 'Těžká jízda',
            wagon: 'Vozy'
        };
        return classNames[unitClass] || unitClass;
    };

    // Seřazení podle frakce a typu
    const sortedTypes = Array.from(unitTypesInBattle.values()).sort((a, b) => {
        if (a.faction !== b.faction) {
            return a.faction === 'hussites' ? -1 : 1;
        }
        return a.name.localeCompare(b.name, 'cs');
    });

    let currentFaction = null;

    for (const unitType of sortedTypes) {
        // Přidání nadpisu frakce
        if (unitType.faction !== currentFaction) {
            currentFaction = unitType.faction;
            const header = document.createElement('h4');
            header.className = 'help-faction-header';
            header.textContent = typeof i18n !== 'undefined'
                ? i18n.t('factions.' + currentFaction)
                : (currentFaction === 'hussites' ? 'Husité' : 'Křižáci');
            header.style.gridColumn = '1 / -1';
            header.style.color = '#d4af37';
            header.style.marginTop = currentFaction === 'hussites' ? '0' : '20px';
            header.style.marginBottom = '10px';
            header.style.paddingBottom = '5px';
            header.style.borderBottom = '1px solid #5c4a1f';
            container.appendChild(header);
        }

        const card = document.createElement('div');
        card.className = 'help-unit-card';

        // Header s ikonou a základními info
        const cardHeader = document.createElement('div');
        cardHeader.className = 'help-unit-header';

        const icon = document.createElement('div');
        icon.className = 'help-unit-icon ' + unitType.faction;
        icon.textContent = unitType.symbol;

        const headerInfo = document.createElement('div');
        headerInfo.className = 'help-unit-header-info';

        const name = document.createElement('h4');
        name.className = 'help-unit-name';
        name.textContent = unitType.name;

        const classLabel = document.createElement('span');
        classLabel.className = 'help-unit-class';
        classLabel.textContent = getClassName(unitType.unitClass);

        headerInfo.appendChild(name);
        headerInfo.appendChild(classLabel);
        cardHeader.appendChild(icon);
        cardHeader.appendChild(headerInfo);

        // Statistiky v gridu
        const stats = document.createElement('div');
        stats.className = 'help-unit-stats-grid';
        const healthLabel = typeof i18n !== 'undefined' ? i18n.t('help.unitStats.health') : 'Zdraví';
        const attackLabel = typeof i18n !== 'undefined' ? i18n.t('help.unitStats.attack') : 'Útok';
        const defenseLabel = typeof i18n !== 'undefined' ? i18n.t('help.unitStats.defense') : 'Obrana';
        const rangeLabel = typeof i18n !== 'undefined' ? i18n.t('help.unitStats.range') : 'Dosah';
        const movementLabel = typeof i18n !== 'undefined' ? i18n.t('help.unitStats.movement') : 'Pohyb';
        stats.innerHTML = `
            <div class="stat-item"><span class="stat-icon">❤</span><span class="stat-value">${unitType.maxHealth}</span><span class="stat-label">${healthLabel}</span></div>
            <div class="stat-item"><span class="stat-icon">⚔</span><span class="stat-value">${unitType.attack}</span><span class="stat-label">${attackLabel}</span></div>
            <div class="stat-item"><span class="stat-icon">🛡</span><span class="stat-value">${unitType.defense}</span><span class="stat-label">${defenseLabel}</span></div>
            <div class="stat-item"><span class="stat-icon">📏</span><span class="stat-value">${unitType.range}</span><span class="stat-label">${rangeLabel}</span></div>
            <div class="stat-item"><span class="stat-icon">👣</span><span class="stat-value">${unitType.movement}</span><span class="stat-label">${movementLabel}</span></div>
        `;

        // Speciální schopnost
        let specialHtml = '';
        if (unitType.special) {
            const specialName = getSpecialDescription(unitType.special);
            specialHtml = `<div class="help-unit-special">⚡ ${specialName}</div>`;
        }

        // Popis jednotky
        let descHtml = '';
        if (unitType.description) {
            descHtml = `<p class="help-unit-description">${unitType.description}</p>`;
        }

        // Rozšířené informace (lore) - vždy zobrazené
        let loreHtml = '';
        if (unitType.lore) {
            loreHtml = '<div class="help-unit-lore">';

            if (unitType.lore.description) {
                loreHtml += `<p class="lore-description">${unitType.lore.description}</p>`;
            }

            if (unitType.lore.equipment) {
                const equipmentLabel = typeof i18n !== 'undefined' ? i18n.t('help.equipment') : 'Výzbroj';
                loreHtml += `<div class="lore-item"><span class="lore-label">${equipmentLabel}:</span> ${unitType.lore.equipment}</div>`;
            }

            if (unitType.lore.origin) {
                const originLabel = typeof i18n !== 'undefined' ? i18n.t('help.origin') : 'Původ';
                loreHtml += `<div class="lore-item"><span class="lore-label">${originLabel}:</span> ${unitType.lore.origin}</div>`;
            }

            if (unitType.lore.historicalNote) {
                // Odstranit uvozovky na začátku pokud tam jsou
                let quote = unitType.lore.historicalNote;
                if (!quote.startsWith('"')) {
                    quote = '"' + quote;
                }
                if (!quote.endsWith('"') && !quote.includes('" -')) {
                    quote = quote + '"';
                }
                loreHtml += `<blockquote class="lore-quote">${quote}</blockquote>`;
            }

            loreHtml += '</div>';
        }

        // Sestavení karty
        card.appendChild(cardHeader);
        card.innerHTML += stats.outerHTML;
        card.innerHTML += specialHtml;
        card.innerHTML += descHtml;
        card.innerHTML += loreHtml;

        container.appendChild(card);
    }
}
