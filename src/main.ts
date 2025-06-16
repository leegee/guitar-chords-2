export type StringNumber = 1 | 2 | 3 | 4 | 5 | 6;
type FretNumber = number; // 0 = open, -1 = muted

export interface ChordSpec {
  notes: Set<string>; // e.g. {"D", "F#", "A", "B"} for D6
  rootNote: string;   // e.g. "D"
}

export interface FingerPosition {
  string: StringNumber;
  fret: FretNumber; // -1 for muted
}

export interface ConstraintProfile {
  maxFingers: number;
  maxFretSpan: number;
  allowBarres: boolean;
  barOnlyAdjacentStrings: boolean;
  allowOpenStrings: boolean;
  allowMutedStrings: boolean;
  requireRootInBass: boolean;
}

const FIXED_MAX_FRET = 5;

// Standard tuning notes on open strings, low E=string 6
const openStringNotes: Record<StringNumber, string> = {
  6: "E",
  5: "A",
  4: "D",
  3: "G",
  2: "B",
  1: "E",
};

// Simple chromatic scale for note calculations
const chromaticScale = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
];

function noteAt(stringNum: StringNumber, fret: FretNumber): string | null {
  if (fret < 0) return null; // muted string, no note
  const openNote = openStringNotes[stringNum];
  const openIndex = chromaticScale.indexOf(openNote);
  if (openIndex === -1) return null;
  const noteIndex = (openIndex + fret) % chromaticScale.length;
  return chromaticScale[noteIndex];
}

// Utility: count fingers used (exclude muted strings)
function countFingers(shape: FingerPosition[]): number {
  return shape.filter(pos => pos.fret >= 0).length;
}

// Utility: calculate fret span
function fretSpan(shape: FingerPosition[]): number {
  const frets = shape
    .filter(pos => pos.fret >= 0)
    .map(pos => pos.fret);
  if (frets.length === 0) return 0;
  return Math.max(...frets) - Math.min(...frets);
}

// Check if barre shape is valid (if barre used and barOnlyAdjacentStrings is true)
function barreIsValid(shape: FingerPosition[], constraints: ConstraintProfile): boolean {
  if (!constraints.allowBarres) return true;
  // Detect barre: multiple strings fretted at same fret with one finger
  // Simplify: if any fret is used on >1 string, check adjacency
  const fretMap = new Map<number, number[]>();
  for (const pos of shape) {
    if (pos.fret < 0) continue;
    if (!fretMap.has(pos.fret)) fretMap.set(pos.fret, []);
    fretMap.get(pos.fret)!.push(pos.string);
  }
  for (const [_fret, strings] of fretMap.entries()) {
    if (strings.length > 1) {
      if (constraints.barOnlyAdjacentStrings) {
        // Check if strings are contiguous
        const sorted = strings.sort((a, b) => a - b);
        for (let i = 1; i < sorted.length; i++) {
          if (sorted[i] !== sorted[i - 1] + 1) return false;
        }
      }
    }
  }
  return true;
}

// Check if root is in bass (lowest played string)
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

// Check if shape violates constraints early (partial shape)
function violatesConstraints(shape: FingerPosition[], constraints: ConstraintProfile): boolean {
  if (countFingers(shape) > constraints.maxFingers) return true;
  if (fretSpan(shape) > constraints.maxFretSpan) return true;
  if (!barreIsValid(shape, constraints)) return true;
  // Can add more early pruning here if needed
  return false;
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

    // const maxFretToCheck = constraints.maxFretSpan + 2;

    for (let fret = 0; fret <= FIXED_MAX_FRET; fret++) {
      const note = noteAt(stringNum, fret);
      if (note && chordSpec.notes.has(note)) {
        possibleFrets.push(fret);
      }
    }

    if (constraints.allowMutedStrings) {
      possibleFrets.push(-1); // muted
    }

    if (
      constraints.allowOpenStrings &&
      !possibleFrets.includes(0) &&
      chordSpec.notes.has(openStringNotes[stringNum])
    ) {
      possibleFrets.push(0);
    }

    for (const fret of possibleFrets) {
      const newShape = [...currentShape, { string: stringNum, fret }];
      if (!violatesConstraints(newShape, constraints)) {
        recurse(stringIndex + 1, newShape);
      }
    }
  }

  recurse(0, []);

  // Filter duplicates by generating a key string from each shape
  const uniqueMap = new Map<string, FingerPosition[]>();
  for (const shape of results) {
    // Sort shape by string descending (6 to 1)
    const sorted = shape.slice().sort((a, b) => b.string - a.string);
    const key = sorted.map(pos => pos.fret).join(",");
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, shape);
    }
  }

  return Array.from(uniqueMap.values());
}


export function printChordDiagram(shape: FingerPosition[]): void {
  // Sort shape by string ascending (6 to 1 left to right)
  const strings: StringNumber[] = [6, 5, 4, 3, 2, 1];

  // Find max fret used (ignore muted)
  const fretsUsed = shape.filter(p => p.fret > 0).map(p => p.fret);
  const maxFret = fretsUsed.length ? Math.max(...fretsUsed) : 1;

  // Build header with string numbers
  const header = strings.map(s => ` ${s} `).join("|");
  console.log(`  ${header}`);

  // First line: mark open or muted strings
  const openMutedLine = strings
    .map((s) => {
      const pos = shape.find(p => p.string === s);
      if (!pos) return "   ";
      if (pos.fret === -1) return " X ";
      if (pos.fret === 0) return " 0 ";
      return "   ";
    })
    .join("|");
  console.log(`  ${openMutedLine}`);

  // Draw frets from 1 to maxFret
  for (let fret = 1; fret <= maxFret; fret++) {
    const line = strings
      .map((s) => {
        const pos = shape.find(p => p.string === s);
        if (!pos) return "   ";
        return pos.fret === fret ? " ● " : "   ";
      })
      .join("|");
    console.log(`${fret} ${line}`);
  }
}
