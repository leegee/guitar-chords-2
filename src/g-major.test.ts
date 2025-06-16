import assert from "node:assert";
import test from "node:test";
import {
    generateCandidateShapes,
    printChordDiagram,
    type ChordSpec,
    type ConstraintProfile,
    type FingerPosition,
    type StringNumber,
} from "./main";

const G: ChordSpec = {
    notes: new Set(["G", "B", "D"]),
    rootNote: "G",
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

test("G major chord candidate shapes generate and include root note", () => {
    const constraints: ConstraintProfile = {
        maxFingers: 4,
        maxFretSpan: 4,
        allowBarres: true,
        barOnlyAdjacentStrings: true,
        allowOpenStrings: true,
        allowMutedStrings: true,
        requireRootInBass: true,
    };

    const chordShapes: FingerPosition[][] = generateCandidateShapes(G, constraints);

    console.log(JSON.stringify(chordShapes))

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

test("Open G chord contains classic root-position shape", () => {
    const constraints: ConstraintProfile = {
        maxFingers: 4,
        maxFretSpan: 4,
        allowBarres: true,
        barOnlyAdjacentStrings: true,
        allowOpenStrings: true,
        allowMutedStrings: true,
        requireRootInBass: false,
    };

    const GChord: ChordSpec = {
        notes: new Set(["G", "B", "D", "E"]), // G major triad + open E included
        rootNote: "G",
    };

    const shapes = generateCandidateShapes(GChord, constraints);

    assert.ok(shapes.length > 0, "No chord shapes generated");

    // Define the classic open G shape (fret per string)
    // -1 = muted, 0 = open, >0 = fret number
    const classicGShape: Record<number, number> = {
        6: 3,
        5: 2,  // 2nd fret on 5th string (usually fingered), but classic G often fingers 2nd fret A string (B note)
        4: 0,
        3: 0,
        2: 0,
        1: 3,
    };

    // You can allow the 5th string to be either 0 (open) or 2 (fretted)
    function matchesClassicG(shape: FingerPosition[]): boolean {
        const shapeMap = new Map(shape.map(fp => [fp.string, fp.fret]));

        for (const stringNum of [6, 5, 4, 3, 2, 1]) {
            const fret = shapeMap.get(stringNum as StringNumber);
            if (fret === undefined) return false; // missing string

            const expectedFret = classicGShape[stringNum];
            if (stringNum === 5) {
                // 5th string allowed frets: 0 (open) or 2
                if (fret !== 0 && fret !== 2) return false;
            } else {
                if (fret !== expectedFret) return false;
            }
        }
        return true;
    }

    const foundClassicShape = shapes.some(matchesClassicG);

    assert.ok(foundClassicShape, "Classic open G chord shape not found");

    // Optionally print them
    console.log(`Found ${shapes.length} candidate shapes for G chord:`);
    for (const shape of shapes) {
        printChordDiagram(shape);
        console.log("---");
    }
});
