/** A binding as tmux sees it: a key in a key table. */
export interface TmuxBinding {
  id: string;
  action: string;
  /** tmux key notation, e.g. `%`, `C-Up`, `M-1`. */
  key: string;
  /** Key table. `prefix` bindings are pressed after the prefix key. */
  table?: 'prefix' | 'root' | 'copy-mode' | 'copy-mode-vi';
  tags: string[];
  level?: 1 | 2 | 3;
}

/** tmux 3.x default bindings (`tmux -f /dev/null list-keys`). */
export const DEFAULT_BINDINGS: TmuxBinding[] = [
  // Sessions
  { id: 'detach', action: 'Detach from the session', key: 'd', tags: ['session'] },
  { id: 'choose-session', action: 'Choose a session from a list', key: 's', tags: ['session'] },
  { id: 'rename-session', action: 'Rename the current session', key: '$', tags: ['session'], level: 2 },
  { id: 'prev-session', action: 'Switch to the previous session', key: '(', tags: ['session'], level: 2 },
  { id: 'next-session', action: 'Switch to the next session', key: ')', tags: ['session'], level: 2 },
  { id: 'last-session', action: 'Switch to the last used session', key: 'L', tags: ['session'], level: 3 },

  // Windows
  { id: 'new-window', action: 'Create a new window', key: 'c', tags: ['window'] },
  { id: 'next-window', action: 'Next window', key: 'n', tags: ['window'] },
  { id: 'prev-window', action: 'Previous window', key: 'p', tags: ['window'] },
  { id: 'last-window', action: 'Last used window', key: 'l', tags: ['window'] },
  { id: 'select-window-0', action: 'Go to window 0', key: '0', tags: ['window'] },
  { id: 'select-window-1', action: 'Go to window 1', key: '1', tags: ['window'] },
  { id: 'select-window-2', action: 'Go to window 2', key: '2', tags: ['window'], level: 2 },
  { id: 'choose-window', action: 'Choose a window from a tree', key: 'w', tags: ['window'] },
  { id: 'rename-window', action: 'Rename the current window', key: ',', tags: ['window'] },
  { id: 'kill-window', action: 'Kill the current window', key: '&', tags: ['window'] },
  { id: 'find-window', action: 'Search for a window', key: 'f', tags: ['window'], level: 3 },
  { id: 'select-window-prompt', action: 'Go to a window by index (prompt)', key: "'", tags: ['window'], level: 3 },
  { id: 'move-window', action: 'Move the window to another index', key: '.', tags: ['window'], level: 3 },

  // Panes
  { id: 'split-horizontal', action: 'Split pane left / right', key: '%', tags: ['pane'] },
  { id: 'split-vertical', action: 'Split pane top / bottom', key: '"', tags: ['pane'] },
  { id: 'select-pane-up', action: 'Move to the pane above', key: 'Up', tags: ['pane'] },
  { id: 'select-pane-down', action: 'Move to the pane below', key: 'Down', tags: ['pane'] },
  { id: 'select-pane-left', action: 'Move to the pane on the left', key: 'Left', tags: ['pane'] },
  { id: 'select-pane-right', action: 'Move to the pane on the right', key: 'Right', tags: ['pane'] },
  { id: 'next-pane', action: 'Cycle to the next pane', key: 'o', tags: ['pane'] },
  { id: 'last-pane', action: 'Go to the last active pane', key: ';', tags: ['pane'] },
  { id: 'zoom-pane', action: 'Zoom / unzoom the current pane', key: 'z', tags: ['pane'] },
  { id: 'kill-pane', action: 'Kill the current pane', key: 'x', tags: ['pane'] },
  { id: 'display-panes', action: 'Show pane numbers', key: 'q', tags: ['pane'], level: 2 },
  { id: 'break-pane', action: 'Break the pane out into its own window', key: '!', tags: ['pane'], level: 2 },
  { id: 'swap-pane-up', action: 'Swap the pane with the previous one', key: '{', tags: ['pane'], level: 2 },
  { id: 'swap-pane-down', action: 'Swap the pane with the next one', key: '}', tags: ['pane'], level: 2 },
  { id: 'next-layout', action: 'Cycle through pane layouts', key: 'Space', tags: ['pane', 'layout'], level: 2 },
  { id: 'spread-panes', action: 'Spread panes out evenly', key: 'E', tags: ['pane', 'layout'], level: 3 },
  { id: 'layout-even-h', action: 'Layout: even-horizontal', key: 'M-1', tags: ['layout'], level: 3 },
  { id: 'layout-even-v', action: 'Layout: even-vertical', key: 'M-2', tags: ['layout'], level: 3 },
  { id: 'layout-main-h', action: 'Layout: main-horizontal', key: 'M-3', tags: ['layout'], level: 3 },
  { id: 'layout-main-v', action: 'Layout: main-vertical', key: 'M-4', tags: ['layout'], level: 3 },
  { id: 'layout-tiled', action: 'Layout: tiled', key: 'M-5', tags: ['layout'], level: 3 },
  { id: 'resize-up', action: 'Resize pane up by 1 cell', key: 'C-Up', tags: ['pane', 'resize'], level: 2 },
  { id: 'resize-down', action: 'Resize pane down by 1 cell', key: 'C-Down', tags: ['pane', 'resize'], level: 2 },
  { id: 'resize-left', action: 'Resize pane left by 1 cell', key: 'C-Left', tags: ['pane', 'resize'], level: 2 },
  { id: 'resize-right', action: 'Resize pane right by 1 cell', key: 'C-Right', tags: ['pane', 'resize'], level: 2 },
  { id: 'resize-up-5', action: 'Resize pane up by 5 cells', key: 'M-Up', tags: ['pane', 'resize'], level: 3 },
  { id: 'resize-down-5', action: 'Resize pane down by 5 cells', key: 'M-Down', tags: ['pane', 'resize'], level: 3 },
  { id: 'mark-pane', action: 'Mark the current pane', key: 'm', tags: ['pane'], level: 3 },

  // Copy mode & misc
  { id: 'copy-mode', action: 'Enter copy mode (scrollback)', key: '[', tags: ['copy'] },
  { id: 'paste-buffer', action: 'Paste the most recent buffer', key: ']', tags: ['copy'] },
  { id: 'choose-buffer', action: 'Choose a paste buffer', key: '=', tags: ['copy'], level: 3 },
  { id: 'command-prompt', action: 'Open the tmux command prompt', key: ':', tags: ['misc'] },
  { id: 'list-keys', action: 'List all key bindings', key: '?', tags: ['misc'] },
  { id: 'clock-mode', action: 'Show a big clock', key: 't', tags: ['misc'], level: 3 },
  { id: 'display-message', action: 'Show pane / window info', key: 'i', tags: ['misc'], level: 3 },
  { id: 'customize-mode', action: 'Open the options customize mode', key: 'C', tags: ['misc'], level: 3 },

  // copy-mode-vi table (used with `setw -g mode-keys vi`); pressed inside copy mode.
  { id: 'vi-begin-selection', action: 'Copy mode (vi): start selection', key: 'Space', table: 'copy-mode-vi', tags: ['copy', 'vi'], level: 2 },
  { id: 'vi-copy-selection', action: 'Copy mode (vi): copy selection and exit', key: 'Enter', table: 'copy-mode-vi', tags: ['copy', 'vi'], level: 2 },
  { id: 'vi-search-forward', action: 'Copy mode (vi): search down', key: '/', table: 'copy-mode-vi', tags: ['copy', 'vi'], level: 2 },
  { id: 'vi-search-backward', action: 'Copy mode (vi): search up', key: '?', table: 'copy-mode-vi', tags: ['copy', 'vi'], level: 2 },
  { id: 'vi-cancel', action: 'Copy mode (vi): exit', key: 'q', table: 'copy-mode-vi', tags: ['copy', 'vi'], level: 2 },
  { id: 'vi-rect-toggle', action: 'Copy mode (vi): toggle rectangle selection', key: 'C-v', table: 'copy-mode-vi', tags: ['copy', 'vi'], level: 3 },
];
