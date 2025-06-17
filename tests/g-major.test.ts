import assert from "node:assert";
import test from "node:test";
import { printChordDiagram } from "../src/lib/print-chord-diagram";
import {
    generateCandidateShapes,
    type ChordSpec,
    type ConstraintProfile,
    type FingerPosition,
    type StringNumber,
} from "../src/lib/chord-finder";
import { chromaticScale } from "../src/lib/notes";

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

        // printChordDiagram(shape);
        // console.log("---");
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

    function matchesBarredG(shape: FingerPosition[]): boolean {
        const shapeMap = new Map(shape.map(fp => [fp.string, fp.fret]));

        for (const stringNum of [6, 5, 4, 3, 2, 1]) {
            const fret = shapeMap.get(stringNum as StringNumber);
            if (fret === undefined) return false;

            const expectedFret = classicGShape[stringNum];
            if (fret !== expectedFret) return false;
        }

        // printChordDiagram(shape);
        // console.log("---");
        return true;
    }

    const foundClassicShape = shapes.some(matchesBarredG);
    assert.ok(foundClassicShape, "G as barred E not found");
});

test("Muted shape [-1,5,5,4,3,3] does not appear", () => {
    const shapes = generateCandidateShapes(G, constraints);

    // Define the muted shape you want to exclude
    const mutedShape: Record<number, number> = {
        6: -1,
        5: 5,
        4: 5,
        3: 4,
        2: 3,
        1: 3,
    };

    function matchesMutedShape(shape: FingerPosition[]): boolean {
        const shapeMap = new Map(shape.map(fp => [fp.string, fp.fret]));
        for (const stringNum of [6, 5, 4, 3, 2, 1]) {
            const fret = shapeMap.get(stringNum as StringNumber);
            if (fret === undefined) return false;
            if (fret !== mutedShape[stringNum]) return false;
        }
        return true;
    }

    for (const shape of shapes) {
        printChordDiagram(shape);
    }
    console.log("---");

    const foundMutedShape = shapes.some(matchesMutedShape);
    assert.ok(!foundMutedShape, "Muted shape [-1,5,5,4,3,3] should not be present");
});
