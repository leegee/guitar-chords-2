import { chromaticScale } from "./notes";

export type StringNumber = number;
type FretNumber = number; // 0 = open, -1 = muted

export interface ChordSpec {
  notes: Set<string>; // e.g. {"D", "F#", "A", "B"} for D6
  rootNote: string;   // e.g. "D"
}

export interface FingerPosition {
  string: StringNumber;
  fret: FretNumber;
  finger?: number;
}

export interface ConstraintProfile {
  maxFingers: number;
  maxFretSpan: number;
  allowBarres: boolean;
  allowOpenStrings: boolean;
  allowMutedStrings: boolean;
  requireRootInBass: boolean;
  tuning: Record<StringNumber, string>; // tuning per string number
}

function getStringCount(tuning: Record<StringNumber, string>): number {
  return Object.keys(tuning).length;
}

const FIXED_MAX_FRET = 7;

function noteAt(
  stringNum: StringNumber,
  fret: FretNumber,
  tuning: Record<StringNumber, string>
): string | null {
  if (fret < 0) return null; // muted string, no note
  const openNote = tuning[stringNum];
  if (!openNote) return null;
  const openIndex = chromaticScale.indexOf(openNote);
  if (openIndex === -1) return null;
  const noteIndex = (openIndex + fret) % chromaticScale.length;
  return chromaticScale[noteIndex];
}

function countFingers(shape: FingerPosition[]): number {
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

  for (const [_fret, strings] of fretToStrings.entries()) {
    const sortedStrings = strings.slice().sort((a, b) => a - b);

    for (let i = 1; i < sortedStrings.length; i++) {
      if (sortedStrings[i] === sortedStrings[i - 1] + 1) {
        continue;
      } else {
        fingerCount += 1;
      }
    }

    fingerCount += 1;
  }

  return fingerCount;
}

function fretSpan(shape: FingerPosition[]): number {
  const frets = shape.filter(pos => pos.fret > 0).map(pos => pos.fret);
  if (frets.length === 0) return 0;
  return Math.max(...frets) - Math.min(...frets);
}

/*
function barreIsValid(shape: FingerPosition[], constraints: ConstraintProfile): boolean {
  if (!constraints.allowBarres) return true;

  const fretMap = new Map<number, number[]>();

  for (const pos of shape) {
    if (pos.fret <= 0) continue;

    if (!fretMap.has(pos.fret)) {
      fretMap.set(pos.fret, []);
    }
    fretMap.get(pos.fret)!.push(pos.string);
  }

  for (const [_fret, strings] of fretMap.entries()) {
    if (strings.length >= 2) {
      const sorted = strings.slice().sort((a, b) => a - b);
      // ...er
    }
  }

  return true;
}
*/

function rootInBass(shape: FingerPosition[], chordSpec: ChordSpec, tuning: Record<StringNumber, string>): boolean {
  // Sort by string descending (lowest pitch string has highest string number)
  const played = shape.filter(pos => pos.fret >= 0).sort((a, b) => b.string - a.string);
  if (played.length === 0) return false;
  const lowestNote = noteAt(played[0].string, played[0].fret, tuning);
  return lowestNote === chordSpec.rootNote;
}

function shapeCoversNotes(shape: FingerPosition[], chordSpec: ChordSpec, tuning: Record<StringNumber, string>): boolean {
  const notesInShape = new Set<string>();
  for (const pos of shape) {
    if (pos.fret < 0) continue;
    const note = noteAt(pos.string, pos.fret, tuning);
    if (note) notesInShape.add(note);
  }
  for (const note of chordSpec.notes) {
    if (!notesInShape.has(note)) return false;
  }
  return true;
}

function violatesConstraints(shape: FingerPosition[], constraints: ConstraintProfile): boolean {
  if (countFingers(shape) > constraints.maxFingers) return true;
  if (fretSpan(shape) > constraints.maxFretSpan) return true;
  // if (!barreIsValid(shape, constraints)) return true;
  return false;
}

function countPlayedStrings(shape: FingerPosition[]): number {
  return shape.filter(pos => pos.fret !== -1).length;
}

function normalize(shape: FingerPosition[], stringCount: number): FingerPosition[] {
  const map = new Map<number, FingerPosition>();
  for (const pos of shape) {
    map.set(pos.string, pos);
  }
  const fullShape: FingerPosition[] = [];
  for (let s = stringCount; s >= 1; s--) {
    if (map.has(s)) {
      fullShape.push(map.get(s)!);
    } else {
      fullShape.push({ string: s as StringNumber, fret: -1 });
    }
  }
  return fullShape;
}

export function isSuperset(
  superset: FingerPosition[],
  subset: FingerPosition[],
  tuning: Record<StringNumber, string>
): boolean {
  const stringCount = getStringCount(tuning);
  const supNorm = normalize(superset, stringCount);
  const subNorm = normalize(subset, stringCount);

  for (let i = 0; i < stringCount; i++) {
    const supFret = supNorm[i].fret;
    const subFret = subNorm[i].fret;

    if (subFret !== -1) {
      if (supFret === -1 || supFret !== subFret) {
        return false;
      }
    }
  }
  return true;
}

function removeMutedSubsets(shapes: FingerPosition[][], tuning: Record<StringNumber, string>): FingerPosition[][] {
  const sorted = [...shapes].sort((a, b) => countPlayedStrings(b) - countPlayedStrings(a));

  const result: FingerPosition[][] = [];

  for (const shape of sorted) {
    const isRedundant = result.some(existing => isSuperset(existing, shape, tuning));
    if (!isRedundant) {
      result.push(shape);
    }
  }

  return result;
}

export function generateCandidateShapes(
  chordSpec: ChordSpec,
  constraints: ConstraintProfile
): FingerPosition[][] {
  const results: FingerPosition[][] = [];
  const { tuning } = constraints;
  const stringCount = getStringCount(tuning);

  // Strings descending
  const strings: StringNumber[] = Array.from(
    { length: stringCount },
    (_, i) => stringCount - i
  );

  function recurse(stringIndex: number, currentShape: FingerPosition[]) {
    if (stringIndex === strings.length) {
      if (
        !violatesConstraints(currentShape, constraints) &&
        shapeCoversNotes(currentShape, chordSpec, tuning) &&
        (!constraints.requireRootInBass || rootInBass(currentShape, chordSpec, tuning))
      ) {
        results.push([...currentShape]);
      }
      return;
    }

    const stringNum = strings[stringIndex];

    const possibleFrets: FretNumber[] = [];

    for (let fret = 0; fret <= FIXED_MAX_FRET; fret++) {
      const note = noteAt(stringNum, fret, tuning);
      if (note && chordSpec.notes.has(note)) {
        possibleFrets.push(fret);
      }
    }

    if (constraints.allowMutedStrings) {
      possibleFrets.push(-1);
    }

    for (const fret of possibleFrets) {
      const newShape = [...currentShape, { string: stringNum, fret }];
      if (!violatesConstraints(newShape, constraints)) {
        recurse(stringIndex + 1, newShape);
      }
    }
  }

  recurse(0, []);

  // Filter duplicates by normalized shape key
  const uniqueMap = new Map<string, FingerPosition[]>();

  for (const shape of results) {
    const norm = normalize(shape, stringCount);
    const key = norm.map(pos => `${pos.string}:${pos.fret}`).join(",");
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, norm);
    }
  }

  return removeMutedSubsets(Array.from(uniqueMap.values()), tuning);
}
