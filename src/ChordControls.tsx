type ChordControlsProps = {
    rootNote: string;
    setRootNote: (note: string) => void;
    chordType: string;
    setChordType: (type: string) => void;
    rootOptions: string[];
    chordTypeOptions: string[];
};

const ChordControls = (props: ChordControlsProps) => {
    return (
        <section>
            <label>
                <select value={props.rootNote} onChange={e => props.setRootNote(e.currentTarget.value)}>
                    {props.rootOptions.map(note => (
                        <option value={note}>{note}</option>
                    ))}
                </select>
            </label>

            &nbsp;

            <label>
                <select value={props.chordType} onChange={e => props.setChordType(e.currentTarget.value)}>
                    {props.chordTypeOptions.map(type => (
                        <option value={type}>{type}</option>
                    ))}
                </select>
            </label>
        </section>
    );
};

export default ChordControls;
