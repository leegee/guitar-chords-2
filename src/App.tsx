import './App.scss';
import { createSignal } from 'solid-js';
import {
    type ChordSpec,
    type ConstraintProfile,
    generateCandidateShapes,
} from './lib/chord-finder';
import ChordDiagram from './components/ChordDiagram';
import ChordControls from './components/ChordControls';
import TuningSelector from './components/TuningSelector';
import { tuningOptions } from './lib/tunings';
import {
    chordTypeLabels,
    chromaticScale,
    getChordNotes,
    chordFormulas
} from './lib/notes';

export default function App() {
    const [rootNote, setRootNote] = createSignal("G");
    const [chordType, setChordType] = createSignal("major");
    const [tuning, setTuning] = createSignal(tuningOptions[0].tuning);

    const chordTypes = Object.keys(chordFormulas);

    const chordSpec = (): ChordSpec => {
        const root = rootNote();
        const type = chordType();
        const notes = getChordNotes(root, type);
        return { rootNote: root, notes };
    };

    const constraints = (): ConstraintProfile => ({
        maxFingers: 4,
        maxFretSpan: 4,
        allowBarres: true,
        allowOpenStrings: true,
        allowMutedStrings: true,
        requireRootInBass: false,
        tuning: tuning(),
    });

    const chordShapes = () => generateCandidateShapes(chordSpec(), constraints());

    return (
        <main>
            <h1>Chord Shapes</h1>

            <TuningSelector
                options={tuningOptions}
                selected={tuning()}
                onChange={setTuning}
            />

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
