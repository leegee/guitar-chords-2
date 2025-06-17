import './TuningSelector.scss';
import { For } from "solid-js";
import type { TuningOption } from '../lib/tunings';

type Props = {
    options: TuningOption[];
    selected: Record<number, string>;
    onChange: (tuning: Record<number, string>) => void;
};

export default function TuningSelector(props: Props) {
    return (
        <section class="tuning-selector">
            <select
                onInput={(e) => {
                    const selected = props.options[parseInt(e.currentTarget.value)];
                    props.onChange(selected.tuning);
                }}
            >
                <For each={props.options}>
                    {(option, i) => (
                        <option
                            value={i()}
                            selected={
                                JSON.stringify(option.tuning) ===
                                JSON.stringify(props.selected)
                            }
                        >
                            {option.label}
                        </option>
                    )}
                </For>
            </select>

            <div class="selected-tuning">
                <For each={Object.entries(props.selected).sort((a, b) => Number(b[0]) - Number(a[0]))}>
                    {([, note]) => (
                        <span class='string'>
                            {note}
                        </span>
                    )}
                </For>
            </div>

        </section>
    );
}
