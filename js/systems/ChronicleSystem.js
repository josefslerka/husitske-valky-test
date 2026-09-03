// WP2b: Kronika jako nespolehlivý vypravěč.
// Ukládá DATA o bitvách (ne text) do localStorage. Text se generuje AŽ při
// zobrazení, v aktuálním jazyce, a ZÁMĚRNĚ lže: ztráty vítěze podhodnocuje,
// ztráty poraženého nadsazuje, porážky svádí na zradu/počasí/přesilu.
// "Pramenná kritika" pak ukáže skutečná čísla. Josefova source-criticism metoda
// povýšená na mechaniku.

const ChronicleSystem = {
    STORAGE_KEY: 'hussiteChronicle',

    getEntries() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
        } catch (e) {
            return [];
        }
    },

    // Zápis jednoho záznamu (data-only). Bez scenarioId (rychlá bitva) se neukládá.
    record(entry) {
        if (!entry || !entry.scenarioId) return;
        const entries = this.getEntries();
        entries.push(entry);
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
        } catch (e) {
            console.warn('Chronicle: nelze uložit', e);
        }
    },

    // Shrnutí aktu se zapisuje jednou, až když hráč vyhraje všechny jeho bitvy.
    recordActSummary(actId) {
        if (!Number.isInteger(Number(actId))) return;
        const entries = this.getEntries();
        if (entries.some(entry => entry.type === 'actSummary' && Number(entry.actId) === Number(actId))) return;
        entries.push({ type: 'actSummary', actId: Number(actId), ts: Date.now() });
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
        } catch (e) {
            console.warn('Chronicle: nelze uložit shrnutí aktu', e);
        }
    },

    clear() {
        localStorage.removeItem(this.STORAGE_KEY);
    },

    // Lokalizované jméno bitvy ze scénáře. Odřízne prefix "Bitva u "/"Battle of ",
    // ať rámec "svedena bitva {battle}" nezní jako "svedena bitva Bitva u...".
    _battleName(scenarioId) {
        const base = (typeof ScenarioManager !== 'undefined') ? ScenarioManager.getScenario(scenarioId) : null;
        if (!base) return scenarioId;
        const loc = (typeof getLocalizedScenario === 'function') ? getLocalizedScenario(scenarioId, base) : base;
        const name = loc.name || scenarioId;
        return name.replace(/^(Bitva u |Bitva |Battle of |Battle at )/i, '');
    },

    // První (lokalizovaná) trivia z battleLore jako "podpis" kronikáře
    _signature(scenarioId) {
        let lore = (typeof getBattleLore === 'function') ? getBattleLore(scenarioId) : null;
        if (lore && typeof getLocalizedBattleLore === 'function') lore = getLocalizedBattleLore(scenarioId, lore);
        if (lore && Array.isArray(lore.trivia) && lore.trivia.length) return lore.trivia[0];
        return '';
    },

    _enemyChronicle(scenarioId) {
        let lore = (typeof getBattleLore === 'function') ? getBattleLore(scenarioId) : null;
        if (lore && typeof getLocalizedBattleLore === 'function') lore = getLocalizedBattleLore(scenarioId, lore);
        return lore?.enemyChronicle || null;
    },

    _formatEnemyChronicle(chronicle, includeCounter = false) {
        if (!chronicle?.text) return '';
        let text = `${chronicle.text} — ${chronicle.source}`;
        if (includeCounter && chronicle.counterText) {
            text += `\n\n${chronicle.counterText} — ${chronicle.counterSource}`;
        }
        return text;
    },

    getEnemyChronicleText(scenarioId, includeCounter = false) {
        return this._formatEnemyChronicle(this._enemyChronicle(scenarioId), includeCounter);
    },

    generateActSummary(entry) {
        return {
            title: i18n.t('chronicle.actSummaryTitle', { act: entry.actId }),
            text: i18n.t(`chronicle.actSummaries.${entry.actId}`)
        };
    },

    // Vygeneruje STYLIZOVANÝ (lživý) dobový text v aktuálním jazyce.
    generateText(entry) {
        const year = (String(entry.scenarioId).match(/_(\d{4})$/) || [])[1] || '';
        const battle = this._battleName(entry.scenarioId);
        const enemyChronicle = this._enemyChronicle(entry.scenarioId);

        // Při porážce přebírá kanonický hlas vítězná protistrana.
        if (entry.result !== 'victory' && enemyChronicle) {
            return this._formatEnemyChronicle(enemyChronicle, Boolean(enemyChronicle.counterText));
        }

        let body;
        if (entry.result === 'victory') {
            // Vlastní ztráty PODHODNOŤ (třetina, min 1)
            const shown = Math.max(1, Math.floor((entry.playerLosses || 0) / 3));
            const ownLosses = i18n.t('chronicle.victoryOwnLosses', { n: shown });
            // Nepřátelské NADSAĎ
            const enemyLosses = (entry.enemyTotal > 0 && (entry.enemyLosses / entry.enemyTotal) > 0.5)
                ? i18n.t('chronicle.victoryEnemyMany')
                : i18n.t('chronicle.victoryEnemySome');
            body = i18n.t('chronicle.victoryBody', { enemyLosses, ownLosses });
        } else {
            // Porážka: NIKDY nepřiznat slabost - viníka deterministicky
            const idx = (String(entry.scenarioId).length + (entry.turns || 0)) % 3;
            const excuse = i18n.t('chronicle.defeatExcuse' + idx);
            body = i18n.t('chronicle.defeatBody', { excuse });
        }

        let text = i18n.t('chronicle.frame', { year, battle, body });
        const sign = this._signature(entry.scenarioId);
        if (sign) text += ' — ' + sign + '.';
        if (entry.blind) text += ' ' + i18n.t('chronicle.blindLine');
        // Sion vždy zachová oba navzájem soupeřící prameny, i když
        // hráč vytvořil kontrafaktuální vítězství obránců.
        if (enemyChronicle?.counterText) {
            text += `\n\n${this._formatEnemyChronicle(enemyChronicle, true)}`;
        }
        return text;
    },

    // Pravda pro "Pramennou kritiku"
    truthText(entry) {
        return i18n.t('chronicle.truth', {
            pLoss: entry.playerLosses || 0,
            pTotal: entry.playerTotal || 0,
            eLoss: entry.enemyLosses || 0,
            eTotal: entry.enemyTotal || 0,
            fled: entry.fled || 0
        });
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChronicleSystem;
}
