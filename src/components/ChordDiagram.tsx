import './ChordDiagram.scss';
import { For, Show } from "solid-js";
import type { FingerPosition } from "../lib/chord-finder";

type ChordDiagramProps = {
  shape: FingerPosition[];
};

export default function ChordDiagram(props: ChordDiagramProps) {
  const PADDING_FRETS = 1;
  const stringOrder = [6, 5, 4, 3, 2, 1];

  const fretted = () => props.shape.filter(p => p.fret > 0).map(p => p.fret);
  const minFret = () => Math.min(...fretted(), 1);
  const maxFretUsed = () => Math.max(...fretted(), 1);

  const showNut = () => minFret() <= 4;
  const startFret = () => (showNut() ? 1 : minFret());
  const numFrets = () => (maxFretUsed() - startFret() + 1) + PADDING_FRETS;

  const findPos = (s: number) =>
    props.shape.find(p => p.string === s);

  return (
    <section class={`chord-diagram fret-${startFret()}`}>
      <Show when={showNut()}>
        <div class="nut">
          <div class="fret-label"></div>
          <For each={stringOrder}>
            {(s) => {
              const pos = findPos(s);
              return (
                <div class="marker">
                  <Show when={pos} fallback="x">
                    {pos!.fret === -1 ? "x" : pos!.fret === 0 ? "o" : ""}
                  </Show>
                </div>
              );
            }}
          </For>
        </div>
      </Show>

      {/* Fret Rows */}
      <For each={Array.from({ length: numFrets() }, (_, i) => startFret() + i)}>
        {(fret) => {
          const fretMod = fret % 12;
          const showFretNum = [3, 5, 7, 9, 0].includes(fretMod);
          return (
            <div class="fret-row">
              <div class="fret-label">
                <Show when={showFretNum || !showNut()}>{fret}</Show>
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
          );
        }}
      </For>
    </section>
  );
}
