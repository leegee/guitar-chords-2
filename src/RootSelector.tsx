type RootSelectorProps = {
    rootNote: string;
    setRootNote: (note: string) => void;
    options: string[];
};

const RootSelector = (props: RootSelectorProps) => {
    return (
        <label>
            Select root note:
            <select value={props.rootNote} onChange={(e) => props.setRootNote(e.currentTarget.value)}>
                {props.options.map(note => (
                    <option value={note}>{note}</option>
                ))}
            </select>
        </label>
    );
};

export default RootSelector;
