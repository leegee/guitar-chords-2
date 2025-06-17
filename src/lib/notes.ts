export const chromaticScale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function getMajorChordNotes(root: string): Set<string> {
    const rootIndex = chromaticScale.indexOf(root);
    if (rootIndex === -1) {
        throw new Error(`Invalid root note: ${root}`);
    }

    const major3rd = chromaticScale[(rootIndex + 4) % 12]; // 4 semitones up
    const perfect5th = chromaticScale[(rootIndex + 7) % 12]; // 7 semitones up

    return new Set([root, major3rd, perfect5th]);
}

