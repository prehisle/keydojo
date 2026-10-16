import { sequenceId, strokeParts, type KeySequence, type KeyStroke, type Platform } from '@keydojo/core';

export function StrokeCaps({ stroke, platform }: { stroke: KeyStroke; platform: Platform }) {
  return (
    <span className="stroke">
      {strokeParts(stroke, platform).map((part, i) => (
        <kbd key={i}>{part}</kbd>
      ))}
    </span>
  );
}

export function SequenceCaps({ sequence, platform }: { sequence: readonly KeyStroke[] | KeySequence; platform: Platform }) {
  return (
    <span className="sequence" data-binding={sequenceId([...sequence])}>
      {sequence.map((s, i) => (
        <StrokeCaps key={i} stroke={s} platform={platform} />
      ))}
    </span>
  );
}

/** All bindings of a shortcut, separated by "or". */
export function BindingsCaps({ bindings, platform }: { bindings: KeySequence[]; platform: Platform }) {
  return (
    <span className="bindings">
      {bindings.map((b, i) => (
        <span key={i}>
          {i > 0 && <span className="or">or</span>}
          <SequenceCaps sequence={b} platform={platform} />
        </span>
      ))}
    </span>
  );
}
