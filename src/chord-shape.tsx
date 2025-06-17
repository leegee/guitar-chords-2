import { For, Show } from "solid-js";
import type { FingerPosition } from "./lib/chord-finder";

type ChordDiagramProps = {
  shape: FingerPosition[];
};

export default function ChordDiagram(props: ChordDiagramProps) {
  const NUM_FRETS = 5;
  const stringOrder = [6, 5, 4, 3, 2, 1];

  const fretted = () =>
    props.shape.filter(p => p.fret > 0).map(p => p.fret);
  const minFret = () => Math.min(...fretted(), 1);
  const startFret = () => (minFret() > 1 ? minFret() : 1);

  const findPos = (s: number) =>
    props.shape.find(p => p.string === s);

  return (
    <div class="chord-diagram">
      {/* Nut */}
      <div class="nut">
        <div class="fret-label">
          <Show when={startFret() > 1}>{startFret()}fr</Show>
        </div>
        <For each={stringOrder}>
          {(s) => {
            const pos = findPos(s);
            return (
              <div class="marker">
                <Show when={pos} fallback="x">
                  <Show when={pos!.fret === 0} fallback="•">
                    o
                  </Show>
                </Show>
              </div>
            );
          }}
        </For>
      </div>

      {/* Fret Rows */}
      <For each={Array.from({ length: NUM_FRETS }, (_, i) => startFret() + i)}>
        {(fret) => (
          <div class="fret-row">
            <div class="fret-label">
              <Show when={startFret() > 1}>{fret}</Show>
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
        )}
      </For>
    </div>
  );
}
