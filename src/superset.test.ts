import assert from "node:assert";
import test from "node:test";
import {
    isSuperset,
    type FingerPosition,
} from "./lib/chord-finder";

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
    assert.ok(isSuperset(shapeB, shapeA), "shapeB should be a superset of shapeA");
    assert.ok(!isSuperset(shapeA, shapeB), "shapeA should NOT be a superset of shapeB");
});
