import { createSignal } from 'solid-js';
import { type ConstraintProfile, generateCandidateShapes } from './lib/chord-finder';
import ChordDiagram from './ChordDiagram';
import './style.css';
import { chromaticScale, getMajorChordNotes } from './lib/notes';

const constraints: ConstraintProfile = {
    maxFingers: 4,
    maxFretSpan: 4,
    allowBarres: true,
    allowOpenStrings: true,
    allowMutedStrings: true,
    requireRootInBass: false,
};

export default function App() {
    const [rootNote, setRootNote] = createSignal("G");

    const chordSpec = () => ({
        rootNote: rootNote(),
        notes: getMajorChordNotes(rootNote()),
    });

    const chordShapes = () => generateCandidateShapes(chordSpec(), constraints);

    return (
        <main>
            <h1>Major Chord Shapes</h1>

            <label>
                Select root note:
                <select value={rootNote()} onChange={(e) => setRootNote(e.currentTarget.value)}>
                    {chromaticScale.map(note => (
                        <option value={note}>{note}</option>
                    ))}
                </select>
            </label>

            <section class="chord-diagrams">
                {chordShapes().map((shape) => (
                    <ChordDiagram shape={shape} />
                ))}
            </section>
        </main>
    );
}
