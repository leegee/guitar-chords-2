import './ChordControls.scss';

type ChordControlsProps = {
    rootNote: string;
    setRootNote: (note: string) => void;
    chordType: string;
    setChordType: (type: string) => void;
    rootOptions: string[];
    chordTypeOptions: string[];
    chordTypeLabels?: Record<string, string>;
};

const ChordControls = (props: ChordControlsProps) => {
    return (
        <section class='chord-controls'>
            <label>
                <select
                    value={props.rootNote}
                    onInput={(e) => props.setRootNote((e.target as HTMLSelectElement).value)}
                >
                    {props.rootOptions.map((note) => (
                        <option value={note}>
                            {note}
                        </option>
                    ))}
                </select>
            </label>

            &nbsp;&nbsp;

            <label>
                <select
                    value={props.chordType}
                    onInput={(e) => props.setChordType((e.target as HTMLSelectElement).value)}
                >
                    {props.chordTypeOptions.map((type) => (
                        <option value={type}>
                            {props.chordTypeLabels ? props.chordTypeLabels[type] ?? type : type}
                        </option>
                    ))}
                </select>
            </label>
        </section>
    );
};

export default ChordControls;
