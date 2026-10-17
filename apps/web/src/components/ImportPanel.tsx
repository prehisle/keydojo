import type { ConfigImporter, Platform, SettingValues, ShortcutPackDef, ShortcutPlugin } from '@keydojo/core';
import { useState } from 'react';
import { useI18n } from '../i18n';
import type { ImportedPack } from '../storage';

interface Props {
  plugin: ShortcutPlugin;
  importers: ConfigImporter[];
  platform: Platform;
  settings: SettingValues;
  baseDef: ShortcutPackDef;
  imported: ImportedPack | null;
  onImport(v: ImportedPack | null): void;
}

export function ImportPanel({ plugin, importers, platform, settings, baseDef, imported, onImport }: Props) {
  const { m, p, locale } = useI18n();
  const tr = (text: string) => p(plugin, text);
  const [importerId, setImporterId] = useState(importers[0]!.id);
  const [text, setText] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const importer = importers.find((i) => i.id === importerId)!;

  const run = (content: string) => {
    const result = importer.parse(content, { platform, settings, base: baseDef, locale });
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
      <h3>{m.useYourOwn}</h3>
      {imported ? (
        <p>
          {m.usingImported(tr(imported.pack.name), imported.pack.shortcuts.length, new Date(imported.importedAt).toLocaleString(locale))}{' '}
          <button className="link" onClick={() => onImport(null)}>
            {m.revert}
          </button>
        </p>
      ) : (
        <p className="muted">{m.usingDefaults}</p>
      )}

      {importers.length > 1 && (
        <select value={importerId} onChange={(e) => setImporterId(e.target.value)}>
          {importers.map((i) => (
            <option key={i.id} value={i.id}>
              {tr(i.label)}
            </option>
          ))}
        </select>
      )}
      <p className="muted small">{tr(importer.instructions)}</p>
      <div className="row">
        <label className="button secondary">
          {m.loadFile}
          <input type="file" accept={importer.accept} hidden onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        <span className="muted">{m.orPaste}</span>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={m.pastePlaceholder(tr(importer.label))}
        rows={5}
      />
      <button disabled={!text.trim()} onClick={() => run(text)}>
        {m.import}
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
