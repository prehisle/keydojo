import { parseStroke, strokeId, type KeySequence, type Platform } from './keys';

/** Where the trainer runs. Browsers swallow more shortcuts than a desktop shell does. */
export type CaptureEnv = 'browser' | 'desktop';

// Grabbed by the OS / window manager; no app can see them.
const OS_RESERVED: Record<Platform, string[]> = {
  mac: ['Cmd+Tab', 'Cmd+Shift+Tab', 'Cmd+Space', 'Cmd+Q', 'Cmd+H', 'Cmd+M', 'Ctrl+Up', 'Ctrl+Down'],
  windows: ['Alt+Tab', 'Alt+Shift+Tab', 'Alt+F4', 'Ctrl+Alt+Delete', 'Ctrl+Shift+Esc'],
  linux: ['Alt+Tab', 'Alt+Shift+Tab', 'Alt+F4', 'Ctrl+Alt+Delete'],
};

// Additionally grabbed by browsers; `preventDefault()` has no effect on these.
const BROWSER_RESERVED: Record<Platform, string[]> = {
  mac: ['Cmd+W', 'Cmd+Shift+W', 'Cmd+T', 'Cmd+Shift+T', 'Cmd+N', 'Cmd+Shift+N'],
  windows: ['Ctrl+W', 'Ctrl+Shift+W', 'Ctrl+T', 'Ctrl+Shift+T', 'Ctrl+N', 'Ctrl+Shift+N', 'Ctrl+Tab', 'Ctrl+Shift+Tab'],
  linux: ['Ctrl+W', 'Ctrl+Shift+W', 'Ctrl+T', 'Ctrl+Shift+T', 'Ctrl+N', 'Ctrl+Shift+N', 'Ctrl+Tab', 'Ctrl+Shift+Tab', 'Ctrl+Q'],
};

const cache = new Map<string, Set<string>>();

function reservedSet(platform: Platform, env: CaptureEnv): Set<string> {
  const key = `${platform}:${env}`;
  let set = cache.get(key);
  if (!set) {
    const list = env === 'browser' ? [...OS_RESERVED[platform], ...BROWSER_RESERVED[platform]] : OS_RESERVED[platform];
    set = new Set(list.map((t) => strokeId(parseStroke(t, platform))));
    cache.set(key, set);
  }
  return set;
}

/** True if every stroke of the sequence can actually reach the trainer in this environment. */
export function isCapturable(seq: KeySequence, platform: Platform, env: CaptureEnv): boolean {
  const reserved = reservedSet(platform, env);
  return seq.every((s) => !reserved.has(strokeId(s)));
}
