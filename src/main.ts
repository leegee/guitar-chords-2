import { renderChordHTML } from './chord-html';
import { type ChordSpec, type ConstraintProfile, type FingerPosition, generateCandidateShapes } from './lib/chord-finder';
import './style.css';

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
    requireRootInBass: false,
};

const chordShapes: FingerPosition[][] = generateCandidateShapes(G, constraints);

const shapesHTML = chordShapes
    .map(shape => renderChordHTML(shape))
    .join('');

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>G</h1>
    <div class="card">
      ${shapesHTML}
    </div>
  </div>
`;
