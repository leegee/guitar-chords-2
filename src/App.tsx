import { createSignal } from 'solid-js';
import { type ConstraintProfile, generateCandidateShapes } from './lib/chord-finder';
import ChordDiagram from './components/ChordDiagram';
import RootSelector from './RootSelector';
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

            <RootSelector rootNote={rootNote()} setRootNote={setRootNote} options={chromaticScale} />

            <section class="chord-diagrams">
                {chordShapes().map((shape) => (
                    <ChordDiagram shape={shape} />
                ))}
            </section>
        </main>
    );
}
