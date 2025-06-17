// App.tsx
import { type ChordSpec, type ConstraintProfile, generateCandidateShapes } from './lib/chord-finder';
import ChordDiagram from './ChordDiagram';
import './style.css';

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

const chordShapes = generateCandidateShapes(G, constraints);

export default function App() {
    return (
        <div>
            <h1>G</h1>
            <div class="card">
                {chordShapes.map((shape) => (
                    <ChordDiagram shape={shape} />
                ))}
            </div>
        </div>
    );
}
