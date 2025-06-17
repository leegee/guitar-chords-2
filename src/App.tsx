import './App.scss';
import { createSignal } from 'solid-js';
import { type ConstraintProfile, generateCandidateShapes } from './lib/chord-finder';
import ChordDiagram from './components/ChordDiagram';
import ChordControls from './components/ChordControls';
import { chordTypeLabels, chromaticScale, getChordNotes, chordFormulas } from './lib/notes';

const constraints: ConstraintProfile = {
    maxFingers: 4,
    maxFretSpan: 4,
    allowBarres: true,
    allowOpenStrings: true,
    allowMutedStrings: true,
    requireRootInBass: false,
};

const chordTypes = Object.keys(chordFormulas);

export interface ChordSpec {
    rootNote: string;
    notes: Set<string>;
}

export default function App() {
    const [rootNote, setRootNote] = createSignal("G");
    const [chordType, setChordType] = createSignal("major");

    const chordSpec = (): ChordSpec => {
        const root = rootNote();
        const type = chordType();
        const notes = getChordNotes(root, type);
        return { rootNote: root, notes };
    };

    const chordShapes = () => generateCandidateShapes(chordSpec(), constraints);

    return (
        <main>
            <h1>Chord Shapes</h1>

            <ChordControls
                rootNote={rootNote()}
                setRootNote={setRootNote}
                chordType={chordType()}
                setChordType={setChordType}
                rootOptions={chromaticScale}
                chordTypeOptions={chordTypes}
                chordTypeLabels={chordTypeLabels}
            />

            <section class="chord-diagrams">
                {chordShapes().map(shape => (
                    <ChordDiagram shape={shape} />
                ))}
            </section>
        </main>
    );
}
