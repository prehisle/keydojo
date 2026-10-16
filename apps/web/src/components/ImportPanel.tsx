import type { ConfigImporter, Platform, SettingValues, ShortcutPackDef } from '@keydojo/core';
import { useState } from 'react';
import type { ImportedPack } from '../storage';

interface Props {
  importers: ConfigImporter[];
  platform: Platform;
  settings: SettingValues;
  baseDef: ShortcutPackDef;
  imported: ImportedPack | null;
  onImport(v: ImportedPack | null): void;
}

export function ImportPanel({ importers, platform, settings, baseDef, imported, onImport }: Props) {
  const [importerId, setImporterId] = useState(importers[0]!.id);
  const [text, setText] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const importer = importers.find((i) => i.id === importerId)!;

  const run = (content: string) => {
    const result = importer.parse(content, { platform, settings, base: baseDef });
    setWarnings(result.warnings);
    if (result.pack.shortcuts.length > 0) {
      onImport({ importerId, importedAt: Date.now(), pack: result.pack });
      setText('');
    }
  };

  const onFile = async (file: File | undefined) => {
    if (file) run(await file.text());
  };

  return (
    <section className="panel">
      <h3>Use your own bindings</h3>
      {imported ? (
        <p>
          Using <strong>{imported.pack.name}</strong> ({imported.pack.shortcuts.length} shortcuts), imported{' '}
          {new Date(imported.importedAt).toLocaleString()}.{' '}
          <button className="link" onClick={() => onImport(null)}>
            Revert to defaults
          </button>
        </p>
      ) : (
        <p className="muted">Currently using the built-in defaults.</p>
      )}

      {importers.length > 1 && (
        <select value={importerId} onChange={(e) => setImporterId(e.target.value)}>
          {importers.map((i) => (
            <option key={i.id} value={i.id}>
              {i.label}
            </option>
          ))}
        </select>
      )}
      <p className="muted small">{importer.instructions}</p>
      <div className="row">
        <label className="button secondary">
          Load file…
          <input type="file" accept={importer.accept} hidden onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        <span className="muted">or paste below</span>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Paste ${importer.label} contents here`}
        rows={5}
      />
      <button disabled={!text.trim()} onClick={() => run(text)}>
        Import
      </button>
      {warnings.length > 0 && (
        <ul className="warnings">
          {warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
