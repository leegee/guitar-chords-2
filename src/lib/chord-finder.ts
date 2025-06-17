import { chromaticScale } from "./notes";

export type StringNumber = 1 | 2 | 3 | 4 | 5 | 6;
type FretNumber = number; // 0 = open, -1 = muted

export interface ChordSpec {
  notes: Set<string>; // e.g. {"D", "F#", "A", "B"} for D6
  rootNote: string;   // e.g. "D"
}

export interface FingerPosition {
  string: StringNumber;
  fret: FretNumber; // -1 for muted
  finger?: number;
}

export interface ConstraintProfile {
  maxFingers: number;
  maxFretSpan: number;
  allowBarres: boolean;
  allowOpenStrings: boolean;
  allowMutedStrings: boolean;
  requireRootInBass: boolean;
}

const FIXED_MAX_FRET = 7;

// Standard tuning notes on open strings, low E=string 6
const openStringNotes: Record<StringNumber, string> = {
  6: "E",
  5: "A",
  4: "D",
  3: "G",
  2: "B",
  1: "E",
};

function noteAt(stringNum: StringNumber, fret: FretNumber): string | null {
  if (fret < 0) return null; // muted string, no note
  const openNote = openStringNotes[stringNum];
  const openIndex = chromaticScale.indexOf(openNote);
  if (openIndex === -1) return null;
  const noteIndex = (openIndex + fret) % chromaticScale.length;
  return chromaticScale[noteIndex];
}


function countFingers(shape: FingerPosition[]): number {
  // Map frets to array of strings fretted on that fret
  const fretToStrings = new Map<number, number[]>();

  for (const pos of shape) {
    if (pos.fret > 0) {
      if (!fretToStrings.has(pos.fret)) {
        fretToStrings.set(pos.fret, []);
      }
      fretToStrings.get(pos.fret)!.push(pos.string);
    }
  }

  let fingerCount = 0;

  // Barre: For each fret, count groups of adjacent strings as 1 finger each
  for (const [_fret, strings] of fretToStrings.entries()) {
    const sortedStrings = strings.sort((a, b) => a - b);

    // Count runs of adjacent strings
    let currRunCount = 1;

    for (let i = 1; i < sortedStrings.length; i++) {
      if (sortedStrings[i] === sortedStrings[i - 1] + 1) {
        // Adjacent string
        continue;
      } else {
        // Non-adjacent string
        fingerCount += 1;
        currRunCount = 1; // reset for new run
      }
    }

    // Count finger for the last run in this fret group
    fingerCount += 1;
  }

  return fingerCount;
}


function fretSpan(shape: FingerPosition[]): number {
  const frets = shape
    .filter(pos => pos.fret > 0)
    .map(pos => pos.fret);
  if (frets.length === 0) return 0;
  return Math.max(...frets) - Math.min(...frets);
}

function barreIsValid(shape: FingerPosition[], constraints: ConstraintProfile): boolean {
  if (!constraints.allowBarres) return true;

  // Map frets to list of strings fretted at that fret
  const fretMap = new Map<number, number[]>();

  for (const pos of shape) {
    if (pos.fret <= 0) continue; // Skip muted (-1) and open (0) strings

    if (!fretMap.has(pos.fret)) {
      fretMap.set(pos.fret, []);
    }
    fretMap.get(pos.fret)!.push(pos.string);
  }

  for (const [_fret, strings] of fretMap.entries()) {
    if (strings.length >= 2) {
      const sorted = strings.sort((a, b) => a - b);

      // Count longest run of adjacent strings at this fret
      let maxAdj = 1;
      let currAdj = 1;

      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === sorted[i - 1] + 1) {
          currAdj++;
          maxAdj = Math.max(maxAdj, currAdj);
        } else {
          currAdj = 1;
        }
      }

    }
  }

  return true; // no invalid barres found
}


function rootInBass(shape: FingerPosition[], chordSpec: ChordSpec): boolean {
  // Sort by string descending (6 to 1)
  const played = shape
    .filter(pos => pos.fret >= 0)
    .sort((a, b) => b.string - a.string);
  if (played.length === 0) return false;
  const lowestNote = noteAt(played[0].string, played[0].fret);
  return lowestNote === chordSpec.rootNote;
}

// Check if shape covers all required chord notes
function shapeCoversNotes(shape: FingerPosition[], chordSpec: ChordSpec): boolean {
  const notesInShape = new Set<string>();
  for (const pos of shape) {
    if (pos.fret < 0) continue;
    const note = noteAt(pos.string, pos.fret);
    if (note) notesInShape.add(note);
  }
  for (const note of chordSpec.notes) {
    if (!notesInShape.has(note)) return false;
  }
  return true;
}

// Check if shape violates constraints (partial shape)
function violatesConstraints(shape: FingerPosition[], constraints: ConstraintProfile): boolean {
  if (countFingers(shape) > constraints.maxFingers) return true;
  if (fretSpan(shape) > constraints.maxFretSpan) return true;
  if (!barreIsValid(shape, constraints)) return true;
  return false;
}

function countPlayedStrings(shape: FingerPosition[]): number {
  return shape.filter(pos => pos.fret !== -1).length;
}

export function isSuperset(
  superset: FingerPosition[],
  subset: FingerPosition[]
): boolean {
  const sup = superset.slice().sort((a, b) => b.string - a.string);
  const sub = subset.slice().sort((a, b) => b.string - a.string);

  // Both should have length 6, if not pad missing strings as muted (-1)
  function normalize(shape: FingerPosition[]): FingerPosition[] {
    const map = new Map<number, FingerPosition>();
    for (const pos of shape) {
      map.set(pos.string, pos);
    }
    const fullShape: FingerPosition[] = [];
    for (let s = 6; s >= 1; s--) {
      if (map.has(s)) {
        fullShape.push(map.get(s)!);
      } else {
        fullShape.push({ string: s as StringNumber, fret: -1 }); // muted by default if missing
      }
    }
    return fullShape;
  }

  const supNorm = normalize(sup);
  const subNorm = normalize(sub);

  for (let i = 0; i < 6; i++) {
    const supFret = supNorm[i].fret;
    const subFret = subNorm[i].fret;

    // If subset has string muted or fretted, superset must match exactly
    if (subFret !== -1) {
      if (supFret === -1 || supFret !== subFret) {
        return false;
      }
    }
  }
  return true;
}

function removeMutedSubsets(shapes: FingerPosition[][]): FingerPosition[][] {
  const sorted = [...shapes].sort((a, b) => countPlayedStrings(b) - countPlayedStrings(a));

  const result: FingerPosition[][] = [];

  for (const shape of sorted) {
    const isRedundant = result.some(existing => isSuperset(existing, shape));

    if (!isRedundant) {
      result.push(shape);
    }
  }

  return result;
}


export function generateCandidateShapes(
  chordSpec: ChordSpec,
  constraints: ConstraintProfile,
): FingerPosition[][] {
  const results: FingerPosition[][] = [];
  const strings: StringNumber[] = [6, 5, 4, 3, 2, 1];

  function recurse(stringIndex: number, currentShape: FingerPosition[]) {
    if (stringIndex === strings.length) {
      // All strings assigned, check full constraints
      if (
        !violatesConstraints(currentShape, constraints) &&
        shapeCoversNotes(currentShape, chordSpec) &&
        (!constraints.requireRootInBass || rootInBass(currentShape, chordSpec))
      ) {
        results.push([...currentShape]);
      }
      return;
    }

    const stringNum = strings[stringIndex];

    // Get possible frets for this string under chordSpec and constraints
    const possibleFrets: FretNumber[] = [];

    for (let fret = 0; fret <= FIXED_MAX_FRET; fret++) {
      const note = noteAt(stringNum, fret);
      if (note && chordSpec.notes.has(note)) {
        possibleFrets.push(fret);
      }
    }

    if (constraints.allowMutedStrings) {
      possibleFrets.push(-1); // muted
    }

    for (const fret of possibleFrets) {
      const newShape = [...currentShape, { string: stringNum, fret }];
      if (!violatesConstraints(newShape, constraints)) {
        recurse(stringIndex + 1, newShape);
      }
    }
  }

  recurse(0, []);

  // Filter duplicates by generating a unique key string from each shape
  const uniqueMap = new Map<string, FingerPosition[]>();
  for (const shape of results) {
    // Sort shape by string descending (6 to 1)
    const sorted = shape.slice().sort((a, b) => b.string - a.string);
    const key = sorted.map(pos => pos.fret).join(",");
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, shape);
    }
  }

  const uniqueArray = Array.from(uniqueMap.values());
  return removeMutedSubsets(uniqueArray);
}


