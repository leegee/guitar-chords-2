import type { FingerPosition } from "./chord-finder";

export function renderChordHTML(shape: FingerPosition[]): string {
    const strings = [6, 5, 4, 3, 2, 1];

    // Determine the maximum fret used (>0)
    const fretsUsed = shape.filter(p => p.fret > 0).map(p => p.fret);
    const maxFret = fretsUsed.length ? Math.max(...fretsUsed) : 1;

    // Top row: string markers (x, o, or blank)
    const topRow = strings.map(s => {
        const pos = shape.find(p => p.string === s);
        if (!pos) return '<div class="marker">&nbsp;</div>';
        if (pos.fret === -1) return '<div class="marker">x</div>';
        if (pos.fret === 0) return '<div class="marker">o</div>';
        return '<div class="marker">&nbsp;</div>';
    }).join('');

    // Fret rows
    const fretRows = [];
    for (let fret = 1; fret <= maxFret; fret++) {
        const rowNotes = strings.map(s => {
            const pos = shape.find(p => p.string === s);
            return pos?.fret === fret
                ? '<div class="note">&#9679;</div>' // filled circle
                : '<div class="note">&nbsp;</div>';
        }).join('');

        fretRows.push(`<div class="fret-row"><div class="fret-label">${fret}</div>${rowNotes}</div>`);
    }

    return `
    <div class="chord-diagram">
      <div class="top-row"><div class="fret-label"></div>${topRow}</div>
      ${fretRows.join('\n')}
    </div>
  `;
}
