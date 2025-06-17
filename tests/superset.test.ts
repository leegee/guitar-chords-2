import assert from "node:assert";
import test from "node:test";
import {
    isSuperset,
    type FingerPosition,
    type StringNumber,
} from "../src/lib/chord-finder";

const standardTuning: Record<StringNumber, string> = {
    6: "E",
    5: "A",
    4: "D",
    3: "G",
    2: "B",
    1: "E",
};

const shapeA: FingerPosition[] = [
    { string: 6, fret: -1 },
    { string: 5, fret: 5 },
    { string: 4, fret: 5 },
    { string: 3, fret: 4 },
    { string: 2, fret: 3 },
    { string: 1, fret: 3 },
];

const shapeB: FingerPosition[] = [
    { string: 6, fret: 3 },
    { string: 5, fret: 5 },
    { string: 4, fret: 5 },
    { string: 3, fret: 4 },
    { string: 2, fret: 3 },
    { string: 1, fret: 3 },
];

test("Superset", () => {
    // shapeB should be a superset of shapeA (because shapeB covers or overrides all positions of shapeA)
    assert.ok(isSuperset(shapeB, shapeA, standardTuning), "shapeB should be a superset of shapeA");

    // shapeA should NOT be a superset of shapeB (since string 6 fret differs)
    assert.ok(!isSuperset(shapeA, shapeB, standardTuning), "shapeA should NOT be a superset of shapeB");
});
