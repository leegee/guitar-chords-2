import type { FingerPosition, StringNumber } from "./chord-finder";

export function printChordDiagram(shape: FingerPosition[]): void {
    // Sort shape by string ascending (6 to 1 left to right)
    const strings: StringNumber[] = [6, 5, 4, 3, 2, 1];

    // Find max fret used (ignore muted)
    const fretsUsed = shape.filter(p => p.fret > 0).map(p => p.fret);
    const maxFret = fretsUsed.length ? Math.max(...fretsUsed) : 1;

    // Build header with string numbers
    const header = strings.map(s => ` ${s} `).join("|");
    console.log(`  ${header}`);

    // First line: mark open or muted strings
    const openMutedLine = strings
        .map((s) => {
            const pos = shape.find(p => p.string === s);
            if (!pos) return "   ";
            if (pos.fret === -1) return " X ";
            if (pos.fret === 0) return " 0 ";
            return "   ";
        })
        .join("|");
    console.log(`  ${openMutedLine}`);

    // Draw frets from 1 to maxFret
    for (let fret = 1; fret <= maxFret; fret++) {
        const line = strings
            .map((s) => {
                const pos = shape.find(p => p.string === s);
                if (!pos) return "   ";
                return pos.fret === fret ? " ● " : "   ";
            })
            .join("|");
        console.log(`${fret} ${line}`);
    }
}
