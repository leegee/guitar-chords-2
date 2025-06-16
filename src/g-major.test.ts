import assert from "node:assert";
import test from "node:test";
import {
    generateCandidateShapes,
    printChordDiagram,
    type ChordSpec,
    type ConstraintProfile,
    type FingerPosition,
    type StringNumber,
} from "./lib/chord-finder";

const G: ChordSpec = {
    notes: new Set(["G", "B", "D"]),
    rootNote: "G",
};

const constraints: ConstraintProfile = {
    maxFingers: 4,
    maxFretSpan: 4,
    allowBarres: true,
    allowOpenStrings: true,
    allowMutedStrings: true,
    requireRootInBass: false,
};

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

export function noteAt(stringNum: number, fret: number): string | null {
    if (fret < 0) return null;
    const openNote = openStringNotes[stringNum as 6 | 5 | 4 | 3 | 2 | 1];
    const openIndex = chromaticScale.indexOf(openNote);
    if (openIndex === -1) return null;
    return chromaticScale[(openIndex + fret) % chromaticScale.length];
}

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

        // printChordDiagram(shape);
        // console.log("\n");
    }
});

test("Open G chord contains classic root-position shape", () => {
    const shapes = generateCandidateShapes(G, constraints);

    assert.ok(shapes.length > 0, "No chord shapes generated");

    const classicGShape: Record<number, number> = {
        6: 3,
        5: 2,
        4: 0,
        3: 0,
        2: 0,
        1: 3,
    };

    function matchesClassicG(shape: FingerPosition[]): boolean {
        debugger;
        const shapeMap = new Map(shape.map(fp => [fp.string, fp.fret]));

        for (const stringNum of [6, 5, 4, 3, 2, 1]) {
            const fret = shapeMap.get(stringNum as StringNumber);
            if (fret === undefined) return false;

            const expectedFret = classicGShape[stringNum];
            if (fret !== expectedFret) return false;
        }

        printChordDiagram(shape);
        console.log("---");
        return true;
    }

    const foundClassicShape = shapes.some(matchesClassicG);
    assert.ok(foundClassicShape, "Classic open G chord shape not found");
});



test("G as barred E", () => {
    const shapes = generateCandidateShapes(G, constraints);

    assert.ok(shapes.length > 0, "No chord shapes generated");

    const classicGShape: Record<number, number> = {
        6: 3,
        5: 5,
        4: 5,
        3: 4,
        2: 3,
        1: 3,
    };

    function matchesClassicG(shape: FingerPosition[]): boolean {
        debugger;
        const shapeMap = new Map(shape.map(fp => [fp.string, fp.fret]));

        for (const stringNum of [6, 5, 4, 3, 2, 1]) {
            const fret = shapeMap.get(stringNum as StringNumber);
            if (fret === undefined) return false;

            const expectedFret = classicGShape[stringNum];
            if (fret !== expectedFret) return false;
        }

        printChordDiagram(shape);
        console.log("---");
        return true;
    }

    const foundClassicShape = shapes.some(matchesClassicG);
    assert.ok(foundClassicShape, "G as barred E not found");
});
