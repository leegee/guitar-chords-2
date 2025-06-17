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

export const chordFormulas: Record<string, number[]> = {
    major: [0, 4, 7],
    minor: [0, 3, 7],
    dominant7: [0, 4, 7, 10],
    major7: [0, 4, 7, 11],
    minor7: [0, 3, 7, 10],
    sus2: [0, 2, 7],
    sus4: [0, 5, 7],
    dim: [0, 3, 6],
    aug: [0, 4, 8],
    ninth: [0, 4, 7, 10, 14],

    sixth: [0, 4, 7, 9],
    minor6: [0, 3, 7, 9],
    diminished7: [0, 3, 6, 9],
    halfDim7: [0, 3, 6, 10],
    augmented7: [0, 4, 8, 10],
    add9: [0, 4, 7, 14],
    minorAdd9: [0, 3, 7, 14],
    eleventh: [0, 4, 7, 10, 14, 17],
    thirteenth: [0, 4, 7, 10, 14, 17, 21],

    sus2add4: [0, 2, 5, 7],
    sus4add9: [0, 5, 7, 14],
};

export const chordTypeLabels: Record<string, string> = {
    major: "Major",
    minor: "Minor",
    dominant7: "Dominant 7th",
    major7: "Major 7th",
    minor7: "Minor 7th",
    sus2: "Sus 2",
    sus4: "Sus 4",
    dim: "Diminished",
    aug: "Augmented",
    ninth: "9th",
    sixth: "6th",
    minor6: "Minor 6th",
    diminished7: "Diminished 7th",
    halfDim7: "Half-Diminished 7th",
    augmented7: "Augmented 7th",
    add9: "Add 9",
    minorAdd9: "Minor Add 9",
    eleventh: "11th",
    thirteenth: "13th",
};

/**
 * Get chord notes by root and chord type.
 * Throws error if unknown chord type or invalid root note.
 */
export function getChordNotes(root: string, type: string): Set<string> {
    const intervals = chordFormulas[type];
    if (!intervals) throw new Error(`Unknown chord type: ${type}`);

    const normalizedRoot = normalizeNoteName(root);
    const rootIndex = chromaticScale.indexOf(normalizedRoot);
    if (rootIndex === -1) throw new Error(`Invalid root note: ${root}`);

    const notes = intervals.map(interval => chromaticScale[(rootIndex + interval) % 12]);
    return new Set(notes);
}

export function getMajorChordNotes(root: string): Set<string> {
    return getChordNotes(root, "major");
}

export function getMinorChordNotes(root: string): Set<string> {
    return getChordNotes(root, "minor");
}
