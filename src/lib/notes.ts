export const chromaticScale = [
    "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
];

export function normalizeNoteName(note: string): string {
    switch (note) {
        case "Db": return "C#";
        case "Eb": return "D#";
        case "Gb": return "F#";
        case "Ab": return "G#";
        case "Bb": return "A#";
        default: return note;
    }
}

export function getMajorChordNotes(root: string): Set<string> {
    const normalizedRoot = normalizeNoteName(root);
    const rootIndex = chromaticScale.indexOf(normalizedRoot);
    if (rootIndex === -1) {
        throw new Error(`Invalid root note: ${root}`);
    }

    const major3rd = chromaticScale[(rootIndex + 4) % 12]; // 4 semitones up
    const perfect5th = chromaticScale[(rootIndex + 7) % 12]; // 7 semitones up

    return new Set([normalizedRoot, major3rd, perfect5th]);
}

export function getMinorChordNotes(root: string): Set<string> {
    const normalizedRoot = normalizeNoteName(root);
    const rootIndex = chromaticScale.indexOf(normalizedRoot);
    if (rootIndex === -1) {
        throw new Error(`Invalid root note: ${root}`);
    }

    const minor3rd = chromaticScale[(rootIndex + 3) % 12]; // 3 semitones up
    const perfect5th = chromaticScale[(rootIndex + 7) % 12]; // 7 semitones up

    return new Set([normalizedRoot, minor3rd, perfect5th]);
}
