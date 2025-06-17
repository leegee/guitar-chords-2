import './ChordDiagram.scss';
import { For, Show } from "solid-js";
import type { FingerPosition } from "../lib/chord-finder";

type ChordDiagramProps = {
  shape: FingerPosition[];
};

export default function ChordDiagram(props: ChordDiagramProps) {
  const PADDING_FRETS = 1; // Show one fret beyond max used

  const stringCount = Math.max(...props.shape.map(p => p.string));

  // Strings descending order (highest string number = lowest pitch string)
  const stringOrder = Array.from({ length: stringCount }, (_, i) => stringCount - i);

  const fretted = () => props.shape.filter(p => p.fret > 0).map(p => p.fret);
  const minFret = () => (fretted().length > 0 ? Math.min(...fretted()) : 1);
  const maxFretUsed = () => (fretted().length > 0 ? Math.max(...fretted()) : 1);

  const startFret = () => (minFret() > 1 ? minFret() : 1);
  const numFrets = () => (maxFretUsed() - startFret() + 1) + PADDING_FRETS;

  const findPos = (s: number) => props.shape.find(p => p.string === s);

  return (
    <section class="chord-diagram">
      <div class="nut">
        <div class="fret-label">
          <Show when={startFret() > 1}>{startFret()}fr</Show>
        </div>
        <For each={stringOrder}>
          {(s) => {
            const pos = findPos(s);
            return (
              <div class="marker">
                <Show when={pos} fallback="?">
                  {pos!.fret === -1 ? (
                    "x"
                  ) : pos!.fret === 0 ? (
                    "o"
                  ) : (
                    ""
                  )}
                </Show>
              </div>
            );
          }}
        </For>
      </div>

      {/* Fret Rows */}
      <For each={Array.from({ length: numFrets() }, (_, i) => startFret() + i)}>
        {(fret) => {
          const fretMod = fret % 12;
          const showFretNum = [0, 3, 5, 7, 9].includes(fretMod);
          return (
            <div class="fret-row">
              <div class="fret-label">
                <Show when={showFretNum}>{fret}</Show>
              </div>
              <For each={stringOrder}>
                {(s) => {
                  const pos = findPos(s);
                  const match = pos?.fret === fret;
                  return (
                    <div class="note">
                      {match ? (pos?.finger?.toString() ?? "●") : "\u00A0"}
                    </div>
                  );
                }}
              </For>
            </div>
          )
        }}
      </For>
    </section>
  );
}
