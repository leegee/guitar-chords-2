import type { FingerPosition } from "./lib/chord-finder";

export function renderChordHTML(shape: FingerPosition[]): string {
    const NUM_FRETS = 5;

    const fretted = shape
        .filter(p => p.fret > 0)
        .map(p => p.fret);
    const minFret = Math.min(...fretted, 1);
    const startFret = minFret > 1 ? minFret : 1;

    const stringOrder = [5, 4, 3, 2, 1, 0];

    // Top row: show x (muted), 0 (open), or blank
    const topRow = stringOrder.map(s => {
        const pos = shape.find(p => p.string === s);
        if (!pos || pos.fret < 0) return '<div class="marker">x</div>';
        if (pos.fret === 0) return '<div class="marker">o</div>';
        return '<div class="marker">&nbsp;</div>';
    }).join('');

    // Fret grid
    const fretRows = [];
    for (let fret = startFret; fret < startFret + NUM_FRETS; fret++) {
        const row = stringOrder.map(s => {
            const pos = shape.find(p => p.string === s);
            if (pos?.fret === fret) {
                return '<div class="note">&#9679;</div>';
            } else {
                return '<div class="note">&nbsp;</div>';
            }
        }).join('');
        fretRows.push(`<div class="fret-row">${row}</div>`);
    }

    const fretLabel = startFret > 1 ? `<div class="fret-label">${startFret}fr</div>` : '';

    return `
    <div class="chord-diagram">
      <div class="top-row">${topRow}</div>
      ${fretLabel}
      ${fretRows.join('')}
    </div>
  `;
}
