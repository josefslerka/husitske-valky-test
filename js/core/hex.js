// Hexová mapa - systém pro vykreslování a správu hexagonální mapy

class HexGrid {
    constructor(canvas, cols, rows, hexSize) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cols = cols;
        this.rows = rows;
        this.hexSize = hexSize;

        // Pro kompatibilitu s kódem, který volá scenarioToMap
        this.marginCols = 0;
        this.marginRows = 0;

        // Výpočet rozměrů hexagonu (pointy-top orientace)
        this.hexWidth = hexSize * 2;
        this.hexHeight = Math.sqrt(3) * hexSize;

        // Padding kolem mapy (aby okrajové hexy nebyly oříznuté)
        // Větší padding vlevo a nahoře pro volný prostor
        this.padding = this.hexSize * 1.5;
        this.paddingLeft = this.hexSize * 2;    // Větší padding vlevo
        this.paddingTop = this.hexSize * 1.5;   // Větší padding nahoře

        // Nastavení velikosti canvasu (s paddingem na všech stranách)
        this.canvas.width = this.cols * this.hexWidth * 0.75 + this.hexWidth * 0.25 + this.paddingLeft + this.padding;
        this.canvas.height = this.rows * this.hexHeight + this.hexHeight * 0.5 + this.paddingTop + this.padding;

        // Mapa hexů - ukládá terén a jednotky
        this.hexes = new Map();
        this.initializeHexes();

        // Stav výběru
        this.selectedHex = null;
        this.highlightedHexes = [];
        this.attackableHexes = [];
        this.escapeZoneHexes = [];
        this.escapeZoneLabel = '';
        this.mapLabels = [];

        // Animace
        this.animations = [];
        this.animationFrame = 0;
    }

    initializeHexes() {
        for (let col = 0; col < this.cols; col++) {
            for (let row = 0; row < this.rows; row++) {
                const key = `${col},${row}`;

                // Generování náhodných pozic pro dekorace (jednou při inicializaci)
                const grassPositions = [];
                for (let i = 0; i < 8; i++) {
                    grassPositions.push({
                        dx: (Math.random() - 0.5) * this.hexSize * 0.8,
                        dy: (Math.random() - 0.5) * this.hexSize * 0.8
                    });
                }

                this.hexes.set(key, {
                    col: col,
                    row: row,
                    terrain: 'plains',
                    unit: null,
                    decorations: grassPositions,
                    isMargin: false
                });
            }
        }
    }

    // Kontrola, jestli hex je v okrajové (nehratelné) zóně - už se nepoužívá
    isMarginHex(col, row) {
        return false;
    }

    hexToPixel(col, row) {
        // Pointy-top: offset na lichých sloupcích
        // Použít větší padding vlevo a nahoře
        const x = this.paddingLeft + col * this.hexWidth * 0.75;
        const y = this.paddingTop + row * this.hexHeight + (col % 2 === 1 ? this.hexHeight / 2 : 0);
        return { x, y };
    }

    pixelToHex(px, py) {
        let closestHex = null;
        let closestDist = Infinity;

        for (let col = 0; col < this.cols; col++) {
            for (let row = 0; row < this.rows; row++) {
                const { x, y } = this.hexToPixel(col, row);
                const dist = Math.sqrt((px - x) ** 2 + (py - y) ** 2);
                if (dist < closestDist && dist < this.hexSize) {
                    closestDist = dist;
                    closestHex = { col, row };
                }
            }
        }

        return closestHex;
    }

    // Převod souřadnic ze scénáře na skutečné souřadnice mapy (s okrajem)
    scenarioToMap(col, row) {
        return {
            col: col + this.marginCols,
            row: row + this.marginRows
        };
    }

    // Převod skutečných souřadnic mapy na souřadnice scénáře
    mapToScenario(col, row) {
        return {
            col: col - this.marginCols,
            row: row - this.marginRows
        };
    }

    getNeighbors(col, row) {
        const neighbors = [];
        const isOddCol = col % 2 === 1;

        // Pointy-top: offset na lichých sloupcích
        const directions = isOddCol ? [
            [0, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]
        ] : [
            [0, -1], [1, -1], [1, 0], [0, 1], [-1, 0], [-1, -1]
        ];

        for (const [dc, dr] of directions) {
            const nc = col + dc;
            const nr = row + dr;
            if (nc >= 0 && nc < this.cols && nr >= 0 && nr < this.rows) {
                neighbors.push({ col: nc, row: nr });
            }
        }

        return neighbors;
    }

    inBounds(col, row) {
        return col >= 0 && col < this.cols && row >= 0 && row < this.rows;
    }

    // P4: soused v daném směru (index 0-5), BEZ ořezu na okraje - vrací i pozici
    // mimo mapu (volající si ošetří inBounds). Směrový index je konzistentní přes
    // paritu sloupce, takže posun všech vozů o stejný index = tuhý (rigidní) posun
    // celé skupiny stejným směrem (potřeba pro skupinový pochod vozové hradby).
    getNeighborInDirection(col, row, dir) {
        const isOddCol = col % 2 === 1;
        const directions = isOddCol ? [
            [0, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]
        ] : [
            [0, -1], [1, -1], [1, 0], [0, 1], [-1, 0], [-1, -1]
        ];
        const [dc, dr] = directions[dir];
        return { col: col + dc, row: row + dr };
    }

    // P4: index směru (0-5), pokud je (c2,r2) bezprostřední soused (c1,r1) v tom
    // směru; jinak -1. Slouží k odvození směru pochodu z kliknutého hexu.
    directionTo(c1, r1, c2, r2) {
        for (let d = 0; d < 6; d++) {
            const n = this.getNeighborInDirection(c1, r1, d);
            if (n.col === c2 && n.row === r2) return d;
        }
        return -1;
    }

    getDistance(col1, row1, col2, row2) {
        const cube1 = this.offsetToCube(col1, row1);
        const cube2 = this.offsetToCube(col2, row2);

        return Math.max(
            Math.abs(cube1.x - cube2.x),
            Math.abs(cube1.y - cube2.y),
            Math.abs(cube1.z - cube2.z)
        );
    }

    offsetToCube(col, row) {
        const x = col;
        const z = row - (col - (col & 1)) / 2;
        const y = -x - z;
        return { x, y, z };
    }

    getHexesInRange(col, row, range) {
        const result = [];

        for (let c = 0; c < this.cols; c++) {
            for (let r = 0; r < this.rows; r++) {
                if (c === col && r === row) continue;
                if (this.getDistance(col, row, c, r) <= range) {
                    result.push({ col: c, row: r });
                }
            }
        }

        return result;
    }

    // Vykreslení hexagonu s vylepšenou grafikou
    drawHex(col, row, fillColor, strokeColor, lineWidth = 1) {
        const { x, y } = this.hexToPixel(col, row);

        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            // Pointy-top: začínáme od -30° (-π/6)
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const hx = x + this.hexSize * Math.cos(angle);
            const hy = y + this.hexSize * Math.sin(angle);
            if (i === 0) {
                this.ctx.moveTo(hx, hy);
            } else {
                this.ctx.lineTo(hx, hy);
            }
        }
        this.ctx.closePath();

        this.ctx.fillStyle = fillColor;
        this.ctx.fill();
        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = lineWidth;
        this.ctx.stroke();
    }

    // Vylepšené vykreslení terénu
    drawTerrainDetailed(col, row, terrain, fogDarkness = 0) {
        const { x, y } = this.hexToPixel(col, row);
        const size = this.hexSize;
        const key = `${col},${row}`;
        const hex = this.hexes.get(key);

        switch (terrain) {
            case 'plains':
                this.drawPlains(x, y, size, hex ? hex.decorations : null);
                break;
            case 'forest':
                this.drawForest(x, y, size);
                break;
            case 'hills':
                this.drawHills(x, y, size);
                break;
            case 'water':
                this.drawWater(x, y, size);
                break;
            case 'town':
                this.drawTown(x, y, size);
                break;
            case 'road':
                this.drawRoad(x, y, size);
                break;
            case 'dam':
                this.drawDam(x, y, size);
                break;
            case 'mud':
                this.drawMud(x, y, size);
                break;
            case 'slope':
                this.drawSlope(x, y, size);
                break;
            case 'trenches':
                this.drawTrenches(x, y, size);
                break;
            case 'church':
                this.drawChurch(x, y, size);
                break;
        }
    }

    drawTrenches(x, y, size) {
        // Okopy - zemní val s příkopem a palisádou (husitská opevnění)
        // Příkop (tmavý)
        this.ctx.fillStyle = '#4a3a28';
        this.ctx.fillRect(x - 18, y + 2, 36, 11);
        // Zemní val (navršená hlína)
        this.ctx.fillStyle = '#7a5f3f';
        this.ctx.beginPath();
        this.ctx.moveTo(x - 18, y + 2);
        this.ctx.lineTo(x - 12, y - 8);
        this.ctx.lineTo(x + 12, y - 8);
        this.ctx.lineTo(x + 18, y + 2);
        this.ctx.closePath();
        this.ctx.fill();
        // Palisáda - kůly na valu
        this.ctx.strokeStyle = '#3a2a1a';
        this.ctx.lineWidth = 2;
        for (let i = -12; i <= 12; i += 5) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + i, y - 8);
            this.ctx.lineTo(x + i, y - 15);
            this.ctx.stroke();
        }
    }

    drawChurch(x, y, size) {
        // Kostel - loď s věží a křížem
        // Loď
        this.ctx.fillStyle = '#cfc3a8';
        this.ctx.fillRect(x - 12, y - 4, 22, 18);
        // Střecha lodi
        this.ctx.fillStyle = '#6b3a2a';
        this.ctx.beginPath();
        this.ctx.moveTo(x - 14, y - 4);
        this.ctx.lineTo(x - 1, y - 14);
        this.ctx.lineTo(x + 12, y - 4);
        this.ctx.closePath();
        this.ctx.fill();
        // Věž
        this.ctx.fillStyle = '#bfb398';
        this.ctx.fillRect(x + 4, y - 20, 9, 16);
        // Špička věže
        this.ctx.fillStyle = '#6b3a2a';
        this.ctx.beginPath();
        this.ctx.moveTo(x + 3, y - 20);
        this.ctx.lineTo(x + 8.5, y - 28);
        this.ctx.lineTo(x + 14, y - 20);
        this.ctx.closePath();
        this.ctx.fill();
        // Kříž
        this.ctx.strokeStyle = '#2a1a0a';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 8.5, y - 28);
        this.ctx.lineTo(x + 8.5, y - 33);
        this.ctx.moveTo(x + 6, y - 31);
        this.ctx.lineTo(x + 11, y - 31);
        this.ctx.stroke();
    }

    drawPlains(x, y, size, decorations) {
        // Tráva - drobné detaily (použití předgenerovaných pozic)
        this.ctx.strokeStyle = '#6b8e23';
        this.ctx.lineWidth = 1;

        if (decorations) {
            for (const pos of decorations) {
                const gx = x + pos.dx;
                const gy = y + pos.dy;

                this.ctx.beginPath();
                this.ctx.moveTo(gx, gy);
                this.ctx.lineTo(gx - 2, gy - 6);
                this.ctx.moveTo(gx, gy);
                this.ctx.lineTo(gx + 2, gy - 5);
                this.ctx.stroke();
            }
        }
    }

    drawForest(x, y, size) {
        // Stromy
        const trees = [
            { dx: 0, dy: -5 },
            { dx: -12, dy: 8 },
            { dx: 12, dy: 8 },
            { dx: -6, dy: -10 },
            { dx: 8, dy: -8 }
        ];

        for (const tree of trees) {
            const tx = x + tree.dx;
            const ty = y + tree.dy;

            // Kmen
            this.ctx.fillStyle = '#4a3728';
            this.ctx.fillRect(tx - 2, ty + 5, 4, 8);

            // Koruna
            this.ctx.fillStyle = '#1a5c1a';
            this.ctx.beginPath();
            this.ctx.moveTo(tx, ty - 8);
            this.ctx.lineTo(tx - 8, ty + 5);
            this.ctx.lineTo(tx + 8, ty + 5);
            this.ctx.closePath();
            this.ctx.fill();

            // Světlejší vrchol
            this.ctx.fillStyle = '#2d7a2d';
            this.ctx.beginPath();
            this.ctx.moveTo(tx, ty - 8);
            this.ctx.lineTo(tx - 5, ty);
            this.ctx.lineTo(tx + 5, ty);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }

    drawHills(x, y, size) {
        // Kopce - výraznější vizualizace strategické pozice
        const hills = [
            { dx: 0, dy: 2, w: 30, h: 18 },
            { dx: -12, dy: 10, w: 22, h: 12 },
            { dx: 14, dy: 8, w: 20, h: 11 }
        ];

        for (const hill of hills) {
            const hx = x + hill.dx;
            const hy = y + hill.dy;

            // Stín kopce - výraznější
            this.ctx.fillStyle = '#6a5040';
            this.ctx.beginPath();
            this.ctx.ellipse(hx + 2, hy + 4, hill.w / 2, hill.h / 2, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // Kopec - sytější barva
            this.ctx.fillStyle = '#c09050';
            this.ctx.beginPath();
            this.ctx.ellipse(hx, hy, hill.w / 2, hill.h / 2, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // Světlo na vrcholu
            this.ctx.fillStyle = '#e0b070';
            this.ctx.beginPath();
            this.ctx.ellipse(hx - 4, hy - 3, hill.w / 4, hill.h / 3, 0, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Malá šipka nahoru - indikátor výšky (strategická výhoda)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 12);
        this.ctx.lineTo(x - 5, y - 6);
        this.ctx.lineTo(x + 5, y - 6);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawWater(x, y, size) {
        // Vlnky
        this.ctx.strokeStyle = '#6ab0e8';
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';

        const waveOffset = (this.animationFrame % 60) / 60 * Math.PI * 2;

        for (let i = -2; i <= 2; i++) {
            const wy = y + i * 10;
            this.ctx.beginPath();
            this.ctx.moveTo(x - 20, wy);

            for (let wx = -20; wx <= 20; wx += 5) {
                const waveY = wy + Math.sin(wx * 0.2 + waveOffset + i) * 3;
                this.ctx.lineTo(x + wx, waveY);
            }
            this.ctx.stroke();
        }
    }

    drawTown(x, y, size) {
        // Hradby
        this.ctx.fillStyle = '#8b7355';
        this.ctx.fillRect(x - 18, y - 5, 36, 20);

        // Cimbuří
        this.ctx.fillStyle = '#6b5344';
        for (let i = -15; i <= 15; i += 10) {
            this.ctx.fillRect(x + i - 3, y - 10, 6, 5);
        }

        // Věž
        this.ctx.fillStyle = '#9a8a7a';
        this.ctx.fillRect(x - 8, y - 18, 16, 25);

        // Střecha věže
        this.ctx.fillStyle = '#8b0000';
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 28);
        this.ctx.lineTo(x - 10, y - 18);
        this.ctx.lineTo(x + 10, y - 18);
        this.ctx.closePath();
        this.ctx.fill();

        // Okno
        this.ctx.fillStyle = '#4a4a2a';
        this.ctx.fillRect(x - 3, y - 12, 6, 8);

        // Brána
        this.ctx.fillStyle = '#3a2a1a';
        this.ctx.beginPath();
        this.ctx.arc(x, y + 5, 6, Math.PI, 0);
        this.ctx.fill();
        this.ctx.fillRect(x - 6, y + 5, 12, 10);
    }

    drawRoad(x, y, size) {
        // Cesta - prašná silnice
        this.ctx.fillStyle = '#7a6a5a';
        this.ctx.fillRect(x - 20, y - 5, 40, 10);

        // Kameny
        this.ctx.fillStyle = '#5a4a3a';
        for (let i = -15; i <= 15; i += 8) {
            this.ctx.beginPath();
            this.ctx.arc(x + i, y + (i % 2 === 0 ? -2 : 2), 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawDam(x, y, size) {
        // Hráz mezi rybníky - zpevněná cesta
        this.ctx.fillStyle = '#6a5a4a';
        this.ctx.fillRect(x - 18, y - 8, 36, 16);

        // Kameny na okrajích
        this.ctx.fillStyle = '#5a4a3a';
        for (let i = -15; i <= 15; i += 6) {
            this.ctx.beginPath();
            this.ctx.arc(x + i, y - 6, 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(x + i + 3, y + 6, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Voda po stranách (naznačení)
        this.ctx.fillStyle = 'rgba(58, 128, 200, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(x - 25, y, 8, 15, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.ellipse(x + 25, y, 8, 15, 0, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawMud(x, y, size) {
        // Bahno - vypuštěný rybník
        // Tmavší bahnitá plocha
        this.ctx.fillStyle = '#4a3a2a';
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            // Pointy-top orientace
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const mx = x + (size - 5) * Math.cos(angle);
            const my = y + (size - 5) * Math.sin(angle);
            if (i === 0) {
                this.ctx.moveTo(mx, my);
            } else {
                this.ctx.lineTo(mx, my);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();

        // Kaluže vody
        this.ctx.fillStyle = 'rgba(58, 128, 200, 0.4)';
        this.ctx.beginPath();
        this.ctx.ellipse(x - 8, y - 5, 6, 4, 0.3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.ellipse(x + 5, y + 8, 8, 5, -0.2, 0, Math.PI * 2);
        this.ctx.fill();

        // Rákos/tráva
        this.ctx.strokeStyle = '#5a6a3a';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const rx = x + (Math.random() - 0.5) * 20;
            const ry = y + (Math.random() - 0.5) * 20;
            this.ctx.beginPath();
            this.ctx.moveTo(rx, ry);
            this.ctx.lineTo(rx - 2, ry - 8);
            this.ctx.moveTo(rx, ry);
            this.ctx.lineTo(rx + 2, ry - 7);
            this.ctx.stroke();
        }
    }

    drawSlope(x, y, size) {
        // Strmý svah - skalnaté úbočí
        // Skály
        this.ctx.fillStyle = '#5a5a5a';
        const rocks = [
            { dx: -10, dy: -8, w: 12, h: 8 },
            { dx: 5, dy: -5, w: 15, h: 10 },
            { dx: -5, dy: 5, w: 10, h: 8 },
            { dx: 8, dy: 8, w: 12, h: 7 }
        ];

        for (const rock of rocks) {
            this.ctx.fillStyle = '#5a5a5a';
            this.ctx.beginPath();
            this.ctx.moveTo(x + rock.dx, y + rock.dy - rock.h/2);
            this.ctx.lineTo(x + rock.dx + rock.w/2, y + rock.dy);
            this.ctx.lineTo(x + rock.dx + rock.w/3, y + rock.dy + rock.h/2);
            this.ctx.lineTo(x + rock.dx - rock.w/3, y + rock.dy + rock.h/2);
            this.ctx.lineTo(x + rock.dx - rock.w/2, y + rock.dy);
            this.ctx.closePath();
            this.ctx.fill();

            // Stín
            this.ctx.fillStyle = '#4a4a4a';
            this.ctx.beginPath();
            this.ctx.moveTo(x + rock.dx + rock.w/2, y + rock.dy);
            this.ctx.lineTo(x + rock.dx + rock.w/3, y + rock.dy + rock.h/2);
            this.ctx.lineTo(x + rock.dx, y + rock.dy + rock.h/3);
            this.ctx.closePath();
            this.ctx.fill();
        }

        // Šipky dolů (naznačení svahu)
        this.ctx.strokeStyle = '#3a3a3a';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 12);
        this.ctx.lineTo(x, y + 5);
        this.ctx.lineTo(x - 4, y + 1);
        this.ctx.moveTo(x, y + 5);
        this.ctx.lineTo(x + 4, y + 1);
        this.ctx.stroke();
    }

    // Barvy terénu pro základ hexu - výraznější kontrasty
    getTerrainColor(terrain) {
        const colors = {
            plains: '#7db560',    // Světle zelená louka
            forest: '#1a4520',    // Tmavě zelený les - výrazný kontrast
            hills: '#b09050',     // Hnědožluté kopce - výrazně odlišné
            water: '#2565b5',     // Sytá modrá voda
            town: '#8a7060',      // Hnědé město
            road: '#c5a575',      // Světlá písková cesta
            road2: '#c5a575',     // Druhá cesta
            dam: '#706050',       // Tmavší hráz
            mud: '#4a3828',       // Tmavé bahno
            swamp: '#5a7a4a',     // Tmavě zelená bažina
            slope: '#c08040',     // Výrazný svah - oranžovohnědá (strategická pozice!)
            trenches: '#3a3028',  // Tmavé příkopy
            church: '#d0c0a0'     // Světlý kostel
        };
        return colors[terrain] || colors.plains;
    }

    // Vylepšené vykreslení celé mapy
    render(units, fogOptions = null) {
        this.animationFrame++;

        // Pozadí
        this.ctx.fillStyle = '#25301f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Mlha války nastavení
        const fogOfWar = fogOptions && fogOptions.fogOfWar;
        const visibleHexes = fogOptions && fogOptions.visibleHexes;
        const exploredHexes = fogOptions && fogOptions.exploredHexes;

        // Vykreslení hexů
        for (const [key, hex] of this.hexes) {
            let baseColor = this.getTerrainColor(hex.terrain);
            let strokeColor = '#2a2a2a';
            let lineWidth = 1;

            // Mlha války - ztmavení neprozkoumáných a neviditelných hexů
            let fogDarkness = 0;
            if (fogOfWar) {
                const isVisible = visibleHexes && visibleHexes.has(key);
                const isExplored = exploredHexes && exploredHexes.has(key);

                if (!isExplored) {
                    // Neprozkoumané - tmavé
                    fogDarkness = 0.7;
                } else if (!isVisible) {
                    // Prozkoumané ale neviditelné - šedé
                    fogDarkness = 0.4;
                }
            }

            // Zvýraznění pro pohyb - výraznější pulsující efekt
            if (this.highlightedHexes.some(h => h.col === hex.col && h.row === hex.row)) {
                const movePulse = 0.25 + 0.1 * Math.sin(this.animationFrame * 0.08);
                strokeColor = '#40ff40';
                lineWidth = 4;
                // Zelený overlay - výraznější
                baseColor = this.blendColors(baseColor, '#30ff30', movePulse);
            }

            // Zvýraznění pro útok - výraznější pulsující červená
            if (this.attackableHexes.some(h => h.col === hex.col && h.row === hex.row)) {
                const attackPulse = 0.3 + 0.15 * Math.sin(this.animationFrame * 0.1);
                strokeColor = '#ff3030';
                lineWidth = 4;
                // Červený overlay - výraznější
                baseColor = this.blendColors(baseColor, '#ff2020', attackPulse);
            }

            // Zvýraznění escape zóny (pulsující zeleno-žlutá)
            if (this.escapeZoneHexes.some(h => h.col === hex.col && h.row === hex.row)) {
                const pulse = 0.3 + 0.15 * Math.sin(this.animationFrame * 0.05);
                baseColor = this.blendColors(baseColor, '#44ff44', pulse);
                strokeColor = '#00cc00';
                lineWidth = 3;
            }

            // Zvýraznění vybraného hexu
            if (this.selectedHex && this.selectedHex.col === hex.col && this.selectedHex.row === hex.row) {
                strokeColor = '#ffff00';
                lineWidth = 4;
            }

            // Aplikace mlhy na barvu
            if (fogDarkness > 0) {
                baseColor = this.blendColors(baseColor, '#000000', fogDarkness);
            }

            this.drawHex(hex.col, hex.row, baseColor, strokeColor, lineWidth);

            // Terén zobrazuj jen u prozkoumáných hexů
            if (!fogOfWar || (exploredHexes && exploredHexes.has(key))) {
                this.drawTerrainDetailed(hex.col, hex.row, hex.terrain, fogDarkness);
            }
        }

        // Názvy míst (mapLabels) - kreslíme POD jednotkami jako "tištěnou mapu".
        // Data ve scénářích existovala od začátku, ale sloužila jen tooltipu.
        this.drawMapLabels(fogOfWar, exploredHexes);

        // WP1: řetězy mezi sepnutými vozy (kreslíme POD jednotkami)
        this.drawWagonChains(units);

        // Vykreslení jednotek
        for (const unit of units) {
            this.drawUnitDetailed(unit);
        }

        // Text cílové zóny (data-driven label; kreslíme NAD jednotkami, ať ho nepřekryjí)
        if (this.escapeZoneHexes.length > 0 && this.escapeZoneLabel) {
            const avgCol = this.escapeZoneHexes.reduce((s, h) => s + h.col, 0) / this.escapeZoneHexes.length;
            const avgRow = this.escapeZoneHexes.reduce((s, h) => s + h.row, 0) / this.escapeZoneHexes.length;
            const center = this.hexToPixel(Math.round(avgCol), Math.round(avgRow));
            const ty = center.y - this.hexSize * 0.95;
            this.ctx.save();
            this.ctx.font = 'bold 15px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.lineWidth = 4;
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.strokeText(this.escapeZoneLabel, center.x, ty);
            this.ctx.fillStyle = '#0a7a0a';
            this.ctx.fillText(this.escapeZoneLabel, center.x, ty);
            this.ctx.restore();
        }

        // Vykreslení animací
        this.renderAnimations();
    }

    // Vykreslí názvy míst (mapLabels) na střed jejich hexů - kurzívou se světlým halo,
    // ať jsou čitelné na libovolném terénu. Respektuje fog of war: popisek se ukáže,
    // jakmile je prozkoumaný aspoň jeden z jeho hexů.
    drawMapLabels(fogOfWar, exploredHexes) {
        if (!this.mapLabels || this.mapLabels.length === 0) return;
        this.ctx.save();
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.font = `italic ${Math.round(this.hexSize * 0.55)}px Georgia, serif`;
        this.ctx.lineWidth = 3;
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = 'rgba(255, 248, 230, 0.85)';
        this.ctx.fillStyle = 'rgba(60, 40, 20, 0.85)';
        const occupied = [];
        for (const label of this.mapLabels) {
            if (!label.hexes || label.hexes.length === 0) continue;
            if (fogOfWar && exploredHexes) {
                const anyExplored = label.hexes.some(([c, r]) => exploredHexes.has(`${c},${r}`));
                if (!anyExplored) continue;
            }
            let sx = 0, sy = 0;
            for (const [c, r] of label.hexes) {
                const p = this.hexToPixel(c, r);
                sx += p.x;
                sy += p.y;
            }
            const offset = Array.isArray(label.offset) ? label.offset : [0, 0];
            const cx = sx / label.hexes.length + offset[0] * this.hexSize;
            const baseY = sy / label.hexes.length + offset[1] * this.hexSize;
            const metrics = this.ctx.measureText(label.text);
            const width = metrics.width + 8;
            const height = Math.round(this.hexSize * 0.7);
            let cy = baseY;

            // Datový offset řeší zamýšlené umístění; tento fallback
            // zabrání překrytí i po responzivním přepočtu mapy.
            for (let attempt = 0; attempt < 4; attempt++) {
                const box = {
                    left: cx - width / 2,
                    right: cx + width / 2,
                    top: cy - height / 2,
                    bottom: cy + height / 2
                };
                const overlaps = occupied.some(other =>
                    box.left < other.right && box.right > other.left &&
                    box.top < other.bottom && box.bottom > other.top
                );
                if (!overlaps) {
                    occupied.push(box);
                    break;
                }
                cy = baseY + (attempt % 2 === 0 ? 1 : -1) * Math.ceil((attempt + 1) / 2) * height;
            }

            this.ctx.strokeText(label.text, cx, cy);
            this.ctx.fillText(label.text, cx, cy);
        }
        this.ctx.restore();
    }

    // WP1: řetězy spojující sousední SEPNUTÉ vozy stejné frakce ("kolo na kolo").
    // Dedup přes u.id < nb.id, ať se každý pár nakreslí jen jednou.
    drawWagonChains(units) {
        const at = new Map();
        for (const u of units) {
            if (u.health > 0) at.set(`${u.col},${u.row}`, u);
        }
        this.ctx.save();
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        for (const u of units) {
            if (u.health <= 0 || !u.isWagon() || !u.formationClosed) continue;
            const a = this.hexToPixel(u.col, u.row);
            for (const n of this.getNeighbors(u.col, u.row)) {
                const nb = at.get(`${n.col},${n.row}`);
                if (nb && nb.isWagon() && nb.formationClosed && nb.faction === u.faction && u.id < nb.id) {
                    const b = this.hexToPixel(nb.col, nb.row);
                    // P4: pochodová linie (poloviční kryt) se kreslí čárkovaně a světleji,
                    // pevná zaklíněná hradba plnou tmavě zlatou čárou.
                    const marching = u.marching || nb.marching;
                    if (marching) {
                        this.ctx.strokeStyle = 'rgba(150, 128, 70, 0.55)';
                        this.ctx.setLineDash([5, 5]);
                    } else {
                        this.ctx.strokeStyle = 'rgba(90, 74, 31, 0.75)';
                        this.ctx.setLineDash([]);
                    }
                    this.ctx.beginPath();
                    this.ctx.moveTo(a.x, a.y);
                    this.ctx.lineTo(b.x, b.y);
                    this.ctx.stroke();
                }
            }
        }
        this.ctx.setLineDash([]);
        this.ctx.restore();
    }

    blendColors(color1, color2, ratio) {
        const hex = (c) => parseInt(c.slice(1), 16);
        const r1 = (hex(color1) >> 16) & 255;
        const g1 = (hex(color1) >> 8) & 255;
        const b1 = hex(color1) & 255;
        const r2 = (hex(color2) >> 16) & 255;
        const g2 = (hex(color2) >> 8) & 255;
        const b2 = hex(color2) & 255;

        const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
        const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
        const b = Math.round(b1 * (1 - ratio) + b2 * ratio);

        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }

    // Vylepšené vykreslení jednotky
    drawUnitDetailed(unit) {
        const { x, y } = this.hexToPixel(unit.col, unit.row);
        const size = this.hexSize * 0.65;  // Mírně větší jednotky

        // Stín - výraznější
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.beginPath();
        this.ctx.ellipse(x + 3, y + size * 0.5, size * 0.9, size * 0.35, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Základní barva frakce - výraznější kontrast
        const isHussite = unit.faction === 'hussites';
        const primaryColor = isHussite ? '#7a1010' : '#0a1a60';
        const secondaryColor = isHussite ? '#c93030' : '#3060c0';
        const borderColor = isHussite ? '#ff5040' : '#5080ff';
        const glowColor = isHussite ? 'rgba(200, 50, 50, 0.4)' : 'rgba(50, 80, 200, 0.4)';

        // Záře kolem jednotky
        this.ctx.shadowColor = glowColor;
        this.ctx.shadowBlur = 8;

        // Pozadí jednotky (štít)
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);

        // Gradient - sytější
        const gradient = this.ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x, y, size);
        gradient.addColorStop(0, secondaryColor);
        gradient.addColorStop(0.7, primaryColor);
        gradient.addColorStop(1, isHussite ? '#400808' : '#050820');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Reset stínu
        this.ctx.shadowBlur = 0;

        // Vnější okraj - výraznější
        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Světelný odlesk nahoře
        this.ctx.beginPath();
        this.ctx.arc(x, y - size * 0.3, size * 0.6, Math.PI * 1.1, Math.PI * 1.9);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Vnitřní okraj
        this.ctx.beginPath();
        this.ctx.arc(x, y, size - 4, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // Symbol jednotky
        this.drawUnitSymbol(x, y, unit);

        // Health bar
        this.drawHealthBar(x, y, size, unit);

        // Indikátor stavu akce
        if (unit.hasMoved && unit.hasAttacked) {
            // Plně vyčerpaná jednotka - ztmavení + ikona
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.font = 'bold 14px Arial';
            this.ctx.fillStyle = '#888';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('💤', x, y);
        } else if (unit.hasMoved && !unit.hasAttacked) {
            // Jednotka se pohnula, může ještě útočit - oranžový kroužek
            this.ctx.strokeStyle = '#ffa500';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([4, 2]);
            this.ctx.beginPath();
            this.ctx.arc(x, y, size + 2, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            // Malý symbol pohybu
            this.ctx.font = 'bold 9px Arial';
            this.ctx.fillStyle = '#ffa500';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('↻', x + size - 2, y - size + 6);
        } else if (!unit.hasMoved && unit.hasAttacked) {
            // Jednotka zaútočila, může se ještě pohnout
            this.ctx.strokeStyle = '#ff6666';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([4, 2]);
            this.ctx.beginPath();
            this.ctx.arc(x, y, size + 2, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            // Malý symbol útoku
            this.ctx.font = 'bold 9px Arial';
            this.ctx.fillStyle = '#ff6666';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('⚔', x + size - 2, y - size + 6);
        }

        // Obranný postoj
        if (unit.isDefending) {
            this.ctx.strokeStyle = '#00ffff';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 3]);
            this.ctx.beginPath();
            this.ctx.arc(x, y, size + 5, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }

        // Efekt děsu (terrified)
        if (unit.isTerrified) {
            this.ctx.strokeStyle = '#ff6600';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([3, 3]);
            this.ctx.beginPath();
            this.ctx.arc(x, y, size + 3, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            // Malá ikona děsu
            this.ctx.font = '10px Arial';
            this.ctx.fillStyle = '#ff6600';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('!', x + size - 5, y - size + 8);
        }

        // Indikátor rapidFire (zbývající útoky)
        if (unit.special === 'rapidFire' && unit.attackCount === 1) {
            this.ctx.font = 'bold 10px Arial';
            this.ctx.fillStyle = '#ffff00';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('1', x + size - 3, y + size - 3);
        }

        // Indikátor nárazu (charge bonus aktivní)
        if (unit.chargeBonus) {
            this.ctx.strokeStyle = '#ff0000';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(x - size, y);
            this.ctx.lineTo(x - size - 8, y);
            this.ctx.stroke();
            // Šipka
            this.ctx.beginPath();
            this.ctx.moveTo(x - size - 8, y - 4);
            this.ctx.lineTo(x - size - 8, y + 4);
            this.ctx.lineTo(x - size - 12, y);
            this.ctx.closePath();
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fill();
        }
    }

    drawUnitSymbol(x, y, unit) {
        this.ctx.save();
        this.ctx.translate(x, y);

        const type = unit.type;

        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;

        switch (type) {
            case 'VOZOVA_HRADBA':
                // Vůz s hradbou
                this.ctx.fillStyle = '#deb887';
                this.ctx.fillRect(-12, -5, 24, 10);
                this.ctx.strokeRect(-12, -5, 24, 10);
                // Kola
                this.ctx.beginPath();
                this.ctx.arc(-8, 8, 4, 0, Math.PI * 2);
                this.ctx.arc(8, 8, 4, 0, Math.PI * 2);
                this.ctx.fillStyle = '#4a3728';
                this.ctx.fill();
                this.ctx.stroke();
                // Štít
                this.ctx.fillStyle = '#8b0000';
                this.ctx.fillRect(-6, -8, 12, 6);
                break;

            case 'CEPNICI':
                // Cep
                this.ctx.strokeStyle = '#8b4513';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(-5, 10);
                this.ctx.lineTo(0, -5);
                this.ctx.stroke();
                // Hlavice
                this.ctx.fillStyle = '#555';
                this.ctx.beginPath();
                this.ctx.arc(3, -10, 6, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.strokeStyle = '#333';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
                break;

            case 'STRELCI':
                // Kuše
                this.ctx.strokeStyle = '#4a3728';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(-10, 0);
                this.ctx.lineTo(10, 0);
                this.ctx.stroke();
                // Tětiva
                this.ctx.strokeStyle = '#deb887';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(-10, 0);
                this.ctx.lineTo(0, 5);
                this.ctx.lineTo(10, 0);
                this.ctx.stroke();
                // Šipka
                this.ctx.fillStyle = '#333';
                this.ctx.beginPath();
                this.ctx.moveTo(0, -12);
                this.ctx.lineTo(-3, -5);
                this.ctx.lineTo(3, -5);
                this.ctx.closePath();
                this.ctx.fill();
                break;

            case 'JIZDA_HUSITI':
                // Kůň
                this.ctx.fillStyle = '#8b4513';
                this.ctx.beginPath();
                this.ctx.ellipse(0, 3, 10, 6, 0, 0, Math.PI * 2);
                this.ctx.fill();
                // Hlava
                this.ctx.beginPath();
                this.ctx.ellipse(10, -2, 5, 4, 0.3, 0, Math.PI * 2);
                this.ctx.fill();
                // Jezdec
                this.ctx.fillStyle = '#8b0000';
                this.ctx.fillRect(-3, -10, 6, 10);
                break;

            case 'TEZKA_JIZDA':
                // Obrněný kůň
                this.ctx.fillStyle = '#696969';
                this.ctx.beginPath();
                this.ctx.ellipse(0, 3, 12, 7, 0, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.strokeStyle = '#444';
                this.ctx.stroke();
                // Hlava s helmou
                this.ctx.beginPath();
                this.ctx.ellipse(12, -2, 5, 4, 0.3, 0, Math.PI * 2);
                this.ctx.fill();
                // Rytíř
                this.ctx.fillStyle = '#c0c0c0';
                this.ctx.fillRect(-4, -12, 8, 12);
                // Kříž
                this.ctx.fillStyle = '#00008b';
                this.ctx.fillRect(-1, -10, 2, 8);
                this.ctx.fillRect(-4, -7, 8, 2);
                break;

            case 'PECHOTA_KOPIM':
                // Kopí
                this.ctx.strokeStyle = '#8b4513';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(0, 12);
                this.ctx.lineTo(0, -10);
                this.ctx.stroke();
                // Hrot
                this.ctx.fillStyle = '#c0c0c0';
                this.ctx.beginPath();
                this.ctx.moveTo(0, -15);
                this.ctx.lineTo(-3, -10);
                this.ctx.lineTo(3, -10);
                this.ctx.closePath();
                this.ctx.fill();
                // Štít
                this.ctx.fillStyle = '#00008b';
                this.ctx.beginPath();
                this.ctx.ellipse(-6, 0, 5, 8, 0, 0, Math.PI * 2);
                this.ctx.fill();
                break;

            case 'KUSNICI':
                // Kuše (větší)
                this.ctx.strokeStyle = '#4a3728';
                this.ctx.lineWidth = 4;
                this.ctx.beginPath();
                this.ctx.moveTo(-12, 0);
                this.ctx.lineTo(12, 0);
                this.ctx.stroke();
                this.ctx.strokeStyle = '#deb887';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(-12, 0);
                this.ctx.lineTo(0, 6);
                this.ctx.lineTo(12, 0);
                this.ctx.stroke();
                // Šipka
                this.ctx.fillStyle = '#c0c0c0';
                this.ctx.beginPath();
                this.ctx.moveTo(0, -14);
                this.ctx.lineTo(-4, -6);
                this.ctx.lineTo(4, -6);
                this.ctx.closePath();
                this.ctx.fill();
                break;

            case 'ZOLDNERI':
                // Meč
                this.ctx.fillStyle = '#c0c0c0';
                this.ctx.fillRect(-2, -12, 4, 18);
                // Záštita
                this.ctx.fillStyle = '#8b4513';
                this.ctx.fillRect(-6, 4, 12, 3);
                // Jílec
                this.ctx.fillStyle = '#8b4513';
                this.ctx.fillRect(-2, 7, 4, 5);
                break;

            // === NOVÉ HUSITSKÉ JEDNOTKY ===

            case 'SUDLICNICI':
                // Sudlice (tyčová zbraň)
                this.ctx.strokeStyle = '#8b4513';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(0, 12);
                this.ctx.lineTo(0, -8);
                this.ctx.stroke();
                // Čepel sudlice
                this.ctx.fillStyle = '#c0c0c0';
                this.ctx.beginPath();
                this.ctx.moveTo(0, -15);
                this.ctx.lineTo(-5, -8);
                this.ctx.lineTo(-3, -8);
                this.ctx.lineTo(-3, -5);
                this.ctx.lineTo(3, -5);
                this.ctx.lineTo(3, -8);
                this.ctx.lineTo(5, -8);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.strokeStyle = '#666';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
                break;

            case 'PAVEZNICI':
            case 'PAVEZNICI_KRIZACI':
                // Velká pavéza
                this.ctx.fillStyle = unit.faction === 'hussites' ? '#8b0000' : '#00008b';
                this.ctx.beginPath();
                this.ctx.moveTo(0, -12);
                this.ctx.lineTo(-10, -8);
                this.ctx.lineTo(-10, 10);
                this.ctx.lineTo(0, 12);
                this.ctx.lineTo(10, 10);
                this.ctx.lineTo(10, -8);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.strokeStyle = '#deb887';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                // Kříž/kalich na štítu
                this.ctx.fillStyle = '#ffd700';
                if (unit.faction === 'hussites') {
                    // Kalich
                    this.ctx.beginPath();
                    this.ctx.moveTo(-4, 4);
                    this.ctx.lineTo(-2, -2);
                    this.ctx.lineTo(2, -2);
                    this.ctx.lineTo(4, 4);
                    this.ctx.lineTo(-4, 4);
                    this.ctx.fill();
                } else {
                    // Kříž
                    this.ctx.fillRect(-1, -6, 2, 10);
                    this.ctx.fillRect(-4, -3, 8, 2);
                }
                break;

            case 'KOPINICI_HUSITI':
            case 'KOPINICI':
                // Kopí
                this.ctx.strokeStyle = '#8b4513';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(0, 12);
                this.ctx.lineTo(0, -10);
                this.ctx.stroke();
                // Hrot
                this.ctx.fillStyle = '#c0c0c0';
                this.ctx.beginPath();
                this.ctx.moveTo(0, -15);
                this.ctx.lineTo(-3, -10);
                this.ctx.lineTo(3, -10);
                this.ctx.closePath();
                this.ctx.fill();
                // Štít
                this.ctx.fillStyle = unit.faction === 'hussites' ? '#8b0000' : '#00008b';
                this.ctx.beginPath();
                this.ctx.ellipse(-6, 0, 5, 8, 0, 0, Math.PI * 2);
                this.ctx.fill();
                break;

            case 'KUSINICI_HUSITI':
            case 'KUSNICI_JANOV':
                // Kuše (varianta)
                this.ctx.strokeStyle = '#4a3728';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(-10, 0);
                this.ctx.lineTo(10, 0);
                this.ctx.stroke();
                // Tětiva
                this.ctx.strokeStyle = '#deb887';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(-10, 0);
                this.ctx.lineTo(0, 5);
                this.ctx.lineTo(10, 0);
                this.ctx.stroke();
                // Šipka
                this.ctx.fillStyle = type === 'KUSNICI_JANOV' ? '#ffd700' : '#c0c0c0';
                this.ctx.beginPath();
                this.ctx.moveTo(0, -12);
                this.ctx.lineTo(-3, -5);
                this.ctx.lineTo(3, -5);
                this.ctx.closePath();
                this.ctx.fill();
                break;

            case 'RUCNICARI':
                // Ruční palná zbraň (píšťala)
                this.ctx.fillStyle = '#4a3728';
                this.ctx.fillRect(-2, -5, 4, 15);  // Pažba
                this.ctx.fillStyle = '#555';
                this.ctx.fillRect(-2, -12, 4, 8);  // Hlaveň
                // Záblesk
                this.ctx.fillStyle = '#ffa500';
                this.ctx.beginPath();
                this.ctx.moveTo(0, -15);
                this.ctx.lineTo(-4, -12);
                this.ctx.lineTo(4, -12);
                this.ctx.closePath();
                this.ctx.fill();
                break;

            case 'HOUFNICE':
                // Houfnice (dělo)
                this.ctx.fillStyle = '#4a3728';
                this.ctx.fillRect(-8, 2, 16, 8);  // Lafeta
                this.ctx.fillStyle = '#555';
                this.ctx.beginPath();
                this.ctx.ellipse(0, -2, 10, 5, 0, 0, Math.PI * 2);  // Hlaveň
                this.ctx.fill();
                this.ctx.fillStyle = '#333';
                this.ctx.beginPath();
                this.ctx.arc(-8, -2, 3, 0, Math.PI * 2);  // Ústí
                this.ctx.fill();
                // Kola
                this.ctx.beginPath();
                this.ctx.arc(-10, 8, 4, 0, Math.PI * 2);
                this.ctx.arc(10, 8, 4, 0, Math.PI * 2);
                this.ctx.fillStyle = '#4a3728';
                this.ctx.fill();
                break;

            case 'TARASNICE':
            case 'POLNI_DELO':
                // Menší dělo
                this.ctx.fillStyle = '#4a3728';
                this.ctx.fillRect(-6, 3, 12, 6);  // Lafeta
                this.ctx.fillStyle = '#666';
                this.ctx.fillRect(-8, -3, 16, 6);  // Hlaveň
                this.ctx.fillStyle = '#444';
                this.ctx.beginPath();
                this.ctx.arc(-8, 0, 2, 0, Math.PI * 2);  // Ústí
                this.ctx.fill();
                // Kola
                this.ctx.beginPath();
                this.ctx.arc(-7, 8, 3, 0, Math.PI * 2);
                this.ctx.arc(7, 8, 3, 0, Math.PI * 2);
                this.ctx.fillStyle = '#4a3728';
                this.ctx.fill();
                break;

            // === NOVÉ KŘIŽÁCKÉ JEDNOTKY ===

            case 'TEZKY_RYTIR':
                // Obrněný kůň (větší)
                this.ctx.fillStyle = '#696969';
                this.ctx.beginPath();
                this.ctx.ellipse(0, 3, 12, 7, 0, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.strokeStyle = '#444';
                this.ctx.stroke();
                // Hlava s helmou
                this.ctx.beginPath();
                this.ctx.ellipse(12, -2, 5, 4, 0.3, 0, Math.PI * 2);
                this.ctx.fill();
                // Rytíř v plné zbroji
                this.ctx.fillStyle = '#c0c0c0';
                this.ctx.fillRect(-4, -14, 8, 14);
                // Helma s chocholem
                this.ctx.fillStyle = '#888';
                this.ctx.beginPath();
                this.ctx.arc(0, -14, 5, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillStyle = '#ff0000';
                this.ctx.fillRect(-1, -20, 2, 6);
                // Kříž na hrudi
                this.ctx.fillStyle = '#00008b';
                this.ctx.fillRect(-1, -10, 2, 8);
                this.ctx.fillRect(-4, -7, 8, 2);
                break;

            case 'TEZKOODENCI':
                // Obrněný kůň
                this.ctx.fillStyle = '#696969';
                this.ctx.beginPath();
                this.ctx.ellipse(0, 3, 10, 6, 0, 0, Math.PI * 2);
                this.ctx.fill();
                // Hlava
                this.ctx.beginPath();
                this.ctx.ellipse(10, -1, 4, 3, 0.3, 0, Math.PI * 2);
                this.ctx.fill();
                // Rytíř
                this.ctx.fillStyle = '#a0a0a0';
                this.ctx.fillRect(-3, -10, 6, 10);
                // Kříž
                this.ctx.fillStyle = '#00008b';
                this.ctx.fillRect(-1, -8, 2, 6);
                this.ctx.fillRect(-3, -5, 6, 2);
                break;

            case 'LEHKA_JIZDA':
                // Lehký kůň
                this.ctx.fillStyle = '#8b4513';
                this.ctx.beginPath();
                this.ctx.ellipse(0, 3, 9, 5, 0, 0, Math.PI * 2);
                this.ctx.fill();
                // Hlava
                this.ctx.beginPath();
                this.ctx.ellipse(9, 0, 4, 3, 0.3, 0, Math.PI * 2);
                this.ctx.fill();
                // Jezdec (lehká výzbroj)
                this.ctx.fillStyle = '#2f4f4f';
                this.ctx.fillRect(-2, -8, 4, 8);
                // Kopí
                this.ctx.strokeStyle = '#8b4513';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(3, -5);
                this.ctx.lineTo(3, -18);
                this.ctx.stroke();
                break;

            case 'HALAPARTNICI':
                // Halaparta
                this.ctx.strokeStyle = '#8b4513';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(0, 12);
                this.ctx.lineTo(0, -8);
                this.ctx.stroke();
                // Čepel halapardny
                this.ctx.fillStyle = '#c0c0c0';
                this.ctx.beginPath();
                this.ctx.moveTo(0, -15);
                this.ctx.lineTo(-7, -8);
                this.ctx.lineTo(-5, -5);
                this.ctx.lineTo(0, -8);
                this.ctx.lineTo(5, -5);
                this.ctx.lineTo(7, -8);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.strokeStyle = '#666';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
                break;

            case 'LUCISTNICI':
                // Dlouhý luk
                this.ctx.strokeStyle = '#8b4513';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(5, 0, 15, Math.PI * 0.7, Math.PI * 1.3);
                this.ctx.stroke();
                // Tětiva
                this.ctx.strokeStyle = '#deb887';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(-3, -12);
                this.ctx.lineTo(-3, 12);
                this.ctx.stroke();
                // Šíp
                this.ctx.fillStyle = '#8b4513';
                this.ctx.fillRect(-6, -2, 12, 2);
                this.ctx.fillStyle = '#c0c0c0';
                this.ctx.beginPath();
                this.ctx.moveTo(-10, -1);
                this.ctx.lineTo(-6, -3);
                this.ctx.lineTo(-6, 1);
                this.ctx.closePath();
                this.ctx.fill();
                break;

            case 'BOMBARDA':
                // Velká bombarda
                this.ctx.fillStyle = '#4a3728';
                this.ctx.fillRect(-10, 4, 20, 8);  // Velká lafeta
                this.ctx.fillStyle = '#444';
                this.ctx.beginPath();
                this.ctx.ellipse(0, -2, 12, 7, 0, 0, Math.PI * 2);  // Masivní hlaveň
                this.ctx.fill();
                this.ctx.fillStyle = '#222';
                this.ctx.beginPath();
                this.ctx.arc(-10, -2, 4, 0, Math.PI * 2);  // Velké ústí
                this.ctx.fill();
                break;

            case 'POUTNICI':
                // Poutnická hůl s uzlíkem (bezbranní poutníci)
                this.ctx.strokeStyle = '#8b6914';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(-4, 11);
                this.ctx.lineTo(3, -9);
                this.ctx.stroke();
                // uzlík na holi
                this.ctx.fillStyle = '#c9a227';
                this.ctx.beginPath();
                this.ctx.arc(4, -10, 4, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.strokeStyle = '#6b5010';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
                break;

            default:
                this.ctx.font = 'bold 18px Arial';
                this.ctx.fillStyle = '#ffffff';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(unit.symbol, 0, 0);
        }

        this.ctx.restore();
    }

    drawHealthBar(x, y, size, unit) {
        const healthPercent = unit.health / unit.maxHealth;
        const barWidth = size * 1.5;
        const barHeight = 5;
        const barX = x - barWidth / 2;
        const barY = y + size + 5;

        // Pozadí
        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

        // Výplň
        let healthColor;
        if (healthPercent > 0.6) {
            healthColor = '#44ff44';
        } else if (healthPercent > 0.3) {
            healthColor = '#ffff44';
        } else {
            healthColor = '#ff4444';
        }

        // Gradient
        const gradient = this.ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
        gradient.addColorStop(0, healthColor);
        gradient.addColorStop(1, this.blendColors(healthColor, '#000000', 0.3));

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

        // Okraj
        this.ctx.strokeStyle = '#444';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
    }

    // Animace útoku
    addAttackAnimation(fromCol, fromRow, toCol, toRow) {
        const from = this.hexToPixel(fromCol, fromRow);
        const to = this.hexToPixel(toCol, toRow);

        this.animations.push({
            type: 'attack',
            fromX: from.x,
            fromY: from.y,
            toX: to.x,
            toY: to.y,
            progress: 0,
            duration: 20
        });
    }

    // Animace exploze
    addExplosionAnimation(col, row) {
        const { x, y } = this.hexToPixel(col, row);

        this.animations.push({
            type: 'explosion',
            x: x,
            y: y,
            progress: 0,
            duration: 30
        });
    }

    renderAnimations() {
        for (let i = this.animations.length - 1; i >= 0; i--) {
            const anim = this.animations[i];
            anim.progress++;

            switch (anim.type) {
                case 'attack':
                    this.renderAttackAnimation(anim);
                    break;
                case 'explosion':
                    this.renderExplosionAnimation(anim);
                    break;
            }

            if (anim.progress >= anim.duration) {
                this.animations.splice(i, 1);
            }
        }
    }

    renderAttackAnimation(anim) {
        const t = anim.progress / anim.duration;
        const x = anim.fromX + (anim.toX - anim.fromX) * t;
        const y = anim.fromY + (anim.toY - anim.fromY) * t;

        // Projektil
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 5, 0, Math.PI * 2);
        this.ctx.fill();

        // Záblesk
        this.ctx.fillStyle = `rgba(255, 200, 0, ${1 - t})`;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 10 * (1 - t), 0, Math.PI * 2);
        this.ctx.fill();
    }

    renderExplosionAnimation(anim) {
        const t = anim.progress / anim.duration;
        const size = 30 * t;
        const alpha = 1 - t;

        // Vnější kruh
        this.ctx.strokeStyle = `rgba(255, 100, 0, ${alpha})`;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(anim.x, anim.y, size, 0, Math.PI * 2);
        this.ctx.stroke();

        // Vnitřní záře
        this.ctx.fillStyle = `rgba(255, 200, 0, ${alpha * 0.5})`;
        this.ctx.beginPath();
        this.ctx.arc(anim.x, anim.y, size * 0.6, 0, Math.PI * 2);
        this.ctx.fill();
    }

    setTerrain(col, row, terrain) {
        const key = `${col},${row}`;
        if (this.hexes.has(key)) {
            this.hexes.get(key).terrain = terrain;
        }
    }

    getTerrain(col, row) {
        const key = `${col},${row}`;
        return this.hexes.has(key) ? this.hexes.get(key).terrain : null;
    }

    // Kontrola, jestli je hex neprůchodný (voda nebo mimo mapu)
    isImpassable(col, row) {
        const terrain = this.getTerrain(col, row);
        return terrain === 'water' || terrain === null;
    }

    getHex(col, row) {
        const key = `${col},${row}`;
        return this.hexes.get(key) || null;
    }

    setSelected(col, row) {
        this.selectedHex = col !== null ? { col, row } : null;
    }

    setHighlighted(hexes) {
        this.highlightedHexes = hexes || [];
    }

    setAttackable(hexes) {
        this.attackableHexes = hexes || [];
    }

    setEscapeZone(hexes, label = '') {
        this.escapeZoneHexes = hexes || [];
        this.escapeZoneLabel = label || '';
    }

    clearHighlights() {
        this.highlightedHexes = [];
        this.attackableHexes = [];
    }
}

// Třída pro minimapu
class Minimap {
    constructor(canvas, hexGrid) {
        this.eventAbortController = new AbortController();
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hexGrid = hexGrid;

        // Velikost minimapy
        this.scale = 0.12;  // Měřítko vůči hlavní mapě

        const mapWidth = hexGrid.cols * hexGrid.hexWidth * 0.75 + hexGrid.hexWidth * 0.25;
        const mapHeight = hexGrid.rows * hexGrid.hexHeight + hexGrid.hexHeight * 0.5;

        this.canvas.width = Math.max(160, mapWidth * this.scale + 10);
        this.canvas.height = Math.max(100, mapHeight * this.scale + 10);

        // Offset pro přepočet pozic (kompenzace paddingu)
        this.offsetX = hexGrid.paddingLeft;
        this.offsetY = hexGrid.paddingTop;

        // Padding
        this.padding = 5;

        // Drag & drop
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        let isDragging = false;
        let startX, startY;
        let startLeft, startTop;

        // Najdi #game-main jako kontejner pro positioning
        const getContainer = () => document.getElementById('game-main');

        const onMouseDown = (e) => {
            // Ignoruj kliknutí pravým tlačítkem
            if (e.button !== 0) return;

            isDragging = true;
            this.canvas.classList.add('dragging');

            startX = e.clientX;
            startY = e.clientY;

            // Získej aktuální pozici relativně ke kontejneru
            const rect = this.canvas.getBoundingClientRect();
            const container = getContainer();
            const containerRect = container.getBoundingClientRect();

            // Převeď na left/top místo right/bottom
            startLeft = rect.left - containerRect.left;
            startTop = rect.top - containerRect.top;

            // Přepni na absolutní pozicování pomocí left/top
            this.canvas.style.right = 'auto';
            this.canvas.style.bottom = 'auto';
            this.canvas.style.left = startLeft + 'px';
            this.canvas.style.top = startTop + 'px';

            e.preventDefault();
            e.stopPropagation();
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            const container = getContainer();
            const containerRect = container.getBoundingClientRect();

            // Omez pohyb v rámci kontejneru
            let newLeft = startLeft + dx;
            let newTop = startTop + dy;

            newLeft = Math.max(0, Math.min(newLeft, containerRect.width - this.canvas.width));
            newTop = Math.max(0, Math.min(newTop, containerRect.height - this.canvas.height));

            this.canvas.style.left = newLeft + 'px';
            this.canvas.style.top = newTop + 'px';

            e.preventDefault();
        };

        const onMouseUp = () => {
            if (!isDragging) return;
            isDragging = false;
            this.canvas.classList.remove('dragging');
        };

        const signal = this.eventAbortController.signal;
        this.canvas.addEventListener('mousedown', onMouseDown, { signal });
        document.addEventListener('mousemove', onMouseMove, { signal });
        document.addEventListener('mouseup', onMouseUp, { signal });
    }

    destroy() {
        this.eventAbortController.abort();
        this.canvas.classList.remove('dragging');
    }

    // Vykreslení minimapy
    render(units) {
        const ctx = this.ctx;
        const scale = this.scale;
        const padding = this.padding;

        // Pozadí
        ctx.fillStyle = '#1a0f0a';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Vykreslení hexů
        for (const [key, hex] of this.hexGrid.hexes) {
            const { x, y } = this.hexGrid.hexToPixel(hex.col, hex.row);
            // Odečíst offset paddingu pro minimapu
            const mx = (x - this.offsetX) * scale + padding;
            const my = (y - this.offsetY) * scale + padding;
            const size = this.hexGrid.hexSize * scale;

            // Barva terénu
            ctx.fillStyle = this.hexGrid.getTerrainColor(hex.terrain);
            ctx.beginPath();
            ctx.arc(mx, my, size * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }

        // Vykreslení jednotek
        for (const unit of units) {
            const { x, y } = this.hexGrid.hexToPixel(unit.col, unit.row);
            // Odečíst offset paddingu
            const mx = (x - this.offsetX) * scale + padding;
            const my = (y - this.offsetY) * scale + padding;

            // Barva frakce
            ctx.fillStyle = unit.faction === 'hussites' ? '#ff4444' : '#4444ff';
            ctx.beginPath();
            ctx.arc(mx, my, 4, 0, Math.PI * 2);
            ctx.fill();

            // Okraj
            ctx.strokeStyle = unit.faction === 'hussites' ? '#ffaaaa' : '#aaaaff';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Okraj minimapy
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, this.canvas.width - 2, this.canvas.height - 2);
    }
}
