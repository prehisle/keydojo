import { sequenceId, strokeParts, type KeySequence, type KeyStroke, type LabelOptions, type Platform } from '@keydojo/core';
import { createContext, useContext } from 'react';
import { useI18n } from '../i18n';

/** Labelling rules of the plugin being shown. */
export const KeyLabels = createContext<LabelOptions>({});

export function StrokeCaps({ stroke, platform }: { stroke: KeyStroke; platform: Platform }) {
  const labels = useContext(KeyLabels);
  return (
    <span className="stroke">
      {strokeParts(stroke, platform, labels).map((part, i) => (
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
  const { m } = useI18n();
  return (
    <span className="bindings">
      {bindings.map((b, i) => (
        <span key={i}>
          {i > 0 && <span className="or">{m.or}</span>}
          <SequenceCaps sequence={b} platform={platform} />
        </span>
      ))}
    </span>
  );
}
