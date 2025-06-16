import type { FingerPosition } from "./lib/chord-finder";

export function renderChordHTML(shape: FingerPosition[]): string {
    const NUM_FRETS = 5;

    // Find the minimum fret used (>0)
    const fretted = shape
        .filter(p => p.fret > 0)
        .map(p => p.fret);
    const minFret = Math.min(...fretted, 1);
    const startFret = minFret > 1 ? minFret : 1;

    const stringOrder = [6, 5, 4, 3, 2, 1];

    const topRow = stringOrder.map(s => {
        const pos = shape.find(p => p.string === s);
        if (!pos || pos.fret < 0) return '<div class="marker">x</div>';
        if (pos.fret === 0) return '<div class="marker">o</div>';
        return '<div class="marker">&nbsp;</div>';
    }).join('');

    // Fret rows with notes
    const fretRows = [];
    for (let fret = startFret; fret < startFret + NUM_FRETS; fret++) {
        const rowNotes = stringOrder.map(s => {
            const pos = shape.find(p => p.string === s);
            if (pos?.fret === fret) {
                return '<div class="note">&#9679;</div>'; // filled circle for finger
            } else {
                return '<div class="note">&nbsp;</div>';
            }
        }).join('');

        // Add fret number on the left only if startFret > 1
        const fretLabel = startFret > 1 ? `<div class="fret-label">${fret}</div>` : '<div class="fret-label"></div>';

        fretRows.push(`<div class="fret-row">${fretLabel}${rowNotes}</div>`);
    }

    // For the top row, add empty label div for alignment
    const topFretLabel = `<div class="fret-label">${startFret > 1 ? startFret + 'fr' : ''}</div>`;

    return `
    <div class="chord-diagram">
      <div class="top-row">${topFretLabel}${topRow}</div>
      ${fretRows.join('')}
    </div>
  `;
}
