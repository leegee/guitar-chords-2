import assert from "node:assert";
import test from "node:test"; // <-- import test function
import {
    generateCandidateShapes,
    printChordDiagram,
    type ChordSpec,
    type ConstraintProfile,
    type FingerPosition,
} from "./main";

const G: ChordSpec = {
    notes: new Set(["G", "B", "D"]),
    rootNote: "G",
};

const constraints: ConstraintProfile = {
    maxFingers: 4,
    maxFretSpan: 4,
    allowBarres: true,
    barOnlyAdjacentStrings: true,
    allowOpenStrings: true,
    allowMutedStrings: true,
    requireRootInBass: true,
};

function noteAt(stringNum: number, fret: number): string | null {
    const openStringNotes: Record<number, string> = {
        6: "E",
        5: "A",
        4: "D",
        3: "G",
        2: "B",
        1: "E",
    };
    const chromaticScale = [
        "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
    ];

    if (fret < 0) return null;
    const openNote = openStringNotes[stringNum as 6 | 5 | 4 | 3 | 2 | 1];
    const openIndex = chromaticScale.indexOf(openNote);
    if (openIndex === -1) return null;
    return chromaticScale[(openIndex + fret) % chromaticScale.length];
}

// Use node:test style
test("G major chord candidate shapes generate and include root note", () => {
    const chordShapes: FingerPosition[][] = generateCandidateShapes(G, constraints);

    assert.ok(chordShapes.length > 0, "No chord shapes generated");

    for (const shape of chordShapes) {
        const notesInShape = new Set(
            shape
                .map(fp => noteAt(fp.string, fp.fret))
                .filter((n): n is string => n !== null),
        );

        assert.ok(notesInShape.has("G"), "Chord shape missing root note G");

        printChordDiagram(shape);
        console.log("\n");
    }
});
