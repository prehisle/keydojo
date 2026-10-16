import type { ShortcutDef } from '@keydojo/core';

/**
 * A curated subset of VSCode's default keybindings. Ids are VSCode command ids so that
 * entries from a user's keybindings.json can be merged onto them.
 *
 * `keys` holds the Windows binding; `mac` / `linux` override where VSCode differs.
 * Sources: Help → Keyboard Shortcuts Reference for each platform.
 */
export const DEFAULT_SHORTCUTS: ShortcutDef[] = [
  // General
  { id: 'workbench.action.showCommands', action: 'Show the Command Palette', keys: ['Mod+Shift+P', 'F1'], tags: ['general'] },
  { id: 'workbench.action.quickOpen', action: 'Quick Open a file by name', keys: 'Mod+P', tags: ['general'] },
  { id: 'workbench.action.openSettings', action: 'Open Settings', keys: 'Mod+,', tags: ['general'] },
  { id: 'workbench.action.openGlobalKeybindings', action: 'Open Keyboard Shortcuts', keys: 'Mod+K Mod+S', tags: ['general'] },
  { id: 'workbench.action.newWindow', action: 'Open a new window', keys: 'Mod+Shift+N', tags: ['general'], level: 2 },
  { id: 'workbench.action.toggleZenMode', action: 'Toggle Zen Mode', keys: 'Mod+K Z', tags: ['general'], level: 3 },

  // Layout & views
  { id: 'workbench.action.toggleSidebarVisibility', action: 'Toggle the Side Bar', keys: 'Mod+B', tags: ['layout'] },
  { id: 'workbench.action.togglePanel', action: 'Toggle the Panel', keys: 'Mod+J', tags: ['layout'] },
  { id: 'workbench.action.terminal.toggleTerminal', action: 'Toggle the integrated terminal', keys: 'Ctrl+`', tags: ['layout', 'terminal'] },
  { id: 'workbench.action.terminal.new', action: 'Create a new terminal', keys: 'Ctrl+Shift+`', tags: ['terminal'], level: 2 },
  { id: 'workbench.view.explorer', action: 'Show the Explorer', keys: 'Mod+Shift+E', tags: ['layout'] },
  { id: 'workbench.view.search', action: 'Search across files', keys: 'Mod+Shift+F', tags: ['layout', 'search'] },
  { id: 'workbench.view.scm', action: 'Show Source Control', keys: 'Ctrl+Shift+G', tags: ['layout'], level: 2 },
  { id: 'workbench.view.extensions', action: 'Show Extensions', keys: 'Mod+Shift+X', tags: ['layout'], level: 2 },
  { id: 'markdown.showPreview', action: 'Open Markdown preview', keys: 'Mod+Shift+V', tags: ['layout'], level: 3 },
  { id: 'markdown.showPreviewToSide', action: 'Open Markdown preview to the side', keys: 'Mod+K V', tags: ['layout'], level: 3 },

  // Editor management
  { id: 'workbench.action.closeActiveEditor', action: 'Close the current editor', keys: ['Mod+W', 'Ctrl+F4'], mac: 'Cmd+W', tags: ['editors'] },
  { id: 'workbench.action.closeAllEditors', action: 'Close all editors', keys: 'Mod+K Mod+W', tags: ['editors'], level: 2 },
  { id: 'workbench.action.reopenClosedEditor', action: 'Reopen the last closed editor', keys: 'Mod+Shift+T', tags: ['editors'], level: 2 },
  { id: 'workbench.action.splitEditor', action: 'Split the editor', keys: 'Mod+\\', tags: ['editors'] },
  { id: 'workbench.action.focusFirstEditorGroup', action: 'Focus the first editor group', keys: 'Mod+1', tags: ['editors'], level: 2 },
  { id: 'workbench.action.focusSecondEditorGroup', action: 'Focus the second editor group', keys: 'Mod+2', tags: ['editors'], level: 2 },
  { id: 'workbench.action.nextEditor', action: 'Open the next editor tab', keys: 'Ctrl+PageDown', mac: 'Cmd+Alt+Right', tags: ['editors'] },
  { id: 'workbench.action.previousEditor', action: 'Open the previous editor tab', keys: 'Ctrl+PageUp', mac: 'Cmd+Alt+Left', tags: ['editors'] },

  // Basic editing
  { id: 'editor.action.copyLinesDownAction', action: 'Duplicate the line below', keys: 'Shift+Alt+Down', linux: 'Ctrl+Shift+Alt+Down', tags: ['editing'] },
  { id: 'editor.action.copyLinesUpAction', action: 'Duplicate the line above', keys: 'Shift+Alt+Up', linux: 'Ctrl+Shift+Alt+Up', tags: ['editing'], level: 2 },
  { id: 'editor.action.moveLinesDownAction', action: 'Move the line down', keys: 'Alt+Down', tags: ['editing'] },
  { id: 'editor.action.moveLinesUpAction', action: 'Move the line up', keys: 'Alt+Up', tags: ['editing'] },
  { id: 'editor.action.deleteLines', action: 'Delete the line', keys: 'Mod+Shift+K', tags: ['editing'] },
  { id: 'editor.action.insertLineAfter', action: 'Insert a line below', keys: 'Mod+Enter', tags: ['editing'] },
  { id: 'editor.action.insertLineBefore', action: 'Insert a line above', keys: 'Mod+Shift+Enter', tags: ['editing'], level: 2 },
  { id: 'editor.action.commentLine', action: 'Toggle line comment', keys: 'Mod+/', tags: ['editing'] },
  { id: 'editor.action.blockComment', action: 'Toggle block comment', keys: 'Shift+Alt+A', linux: 'Ctrl+Shift+A', tags: ['editing'], level: 2 },
  { id: 'editor.action.indentLines', action: 'Indent the line', keys: 'Mod+]', tags: ['editing'], level: 2 },
  { id: 'editor.action.outdentLines', action: 'Outdent the line', keys: 'Mod+[', tags: ['editing'], level: 2 },
  { id: 'editor.fold', action: 'Fold the region', keys: 'Ctrl+Shift+[', mac: 'Cmd+Alt+[', tags: ['editing'], level: 3 },
  { id: 'editor.unfold', action: 'Unfold the region', keys: 'Ctrl+Shift+]', mac: 'Cmd+Alt+]', tags: ['editing'], level: 3 },
  { id: 'editor.action.formatDocument', action: 'Format the document', keys: 'Shift+Alt+F', linux: 'Ctrl+Shift+I', tags: ['editing'] },
  { id: 'editor.action.triggerSuggest', action: 'Trigger suggestions', keys: 'Ctrl+Space', tags: ['editing'], level: 2 },
  { id: 'editor.action.quickFix', action: 'Quick Fix', keys: 'Mod+.', tags: ['editing'] },

  // Multi-cursor & selection
  { id: 'editor.action.addSelectionToNextFindMatch', action: 'Add the next occurrence to the selection', keys: 'Mod+D', tags: ['multi-cursor'] },
  { id: 'editor.action.selectHighlights', action: 'Select all occurrences of the selection', keys: 'Mod+Shift+L', tags: ['multi-cursor'] },
  { id: 'editor.action.insertCursorBelow', action: 'Add a cursor below', keys: 'Ctrl+Alt+Down', mac: 'Cmd+Alt+Down', linux: 'Shift+Alt+Down', tags: ['multi-cursor'] },
  { id: 'editor.action.insertCursorAbove', action: 'Add a cursor above', keys: 'Ctrl+Alt+Up', mac: 'Cmd+Alt+Up', linux: 'Shift+Alt+Up', tags: ['multi-cursor'] },
  { id: 'editor.action.insertCursorAtEndOfEachLineSelected', action: 'Add cursors at the end of each selected line', keys: 'Shift+Alt+I', tags: ['multi-cursor'], level: 2 },
  { id: 'cursorUndo', action: 'Undo the last cursor operation', keys: 'Mod+U', tags: ['multi-cursor'], level: 2 },
  { id: 'editor.action.smartSelect.expand', action: 'Expand the selection', keys: 'Shift+Alt+Right', mac: 'Ctrl+Shift+Cmd+Right', tags: ['multi-cursor'], level: 2 },
  { id: 'editor.action.smartSelect.shrink', action: 'Shrink the selection', keys: 'Shift+Alt+Left', mac: 'Ctrl+Shift+Cmd+Left', tags: ['multi-cursor'], level: 2 },

  // Navigation
  { id: 'workbench.action.gotoLine', action: 'Go to line', keys: 'Ctrl+G', tags: ['navigation'] },
  { id: 'workbench.action.gotoSymbol', action: 'Go to a symbol in the file', keys: 'Mod+Shift+O', tags: ['navigation'] },
  { id: 'workbench.action.showAllSymbols', action: 'Go to a symbol in the workspace', keys: 'Mod+T', tags: ['navigation'], level: 2 },
  { id: 'editor.action.revealDefinition', action: 'Go to definition', keys: 'F12', tags: ['navigation'] },
  { id: 'editor.action.peekDefinition', action: 'Peek definition', keys: 'Alt+F12', linux: 'Ctrl+Shift+F10', tags: ['navigation'], level: 2 },
  { id: 'editor.action.goToReferences', action: 'Show references', keys: 'Shift+F12', tags: ['navigation'] },
  { id: 'editor.action.rename', action: 'Rename the symbol', keys: 'F2', tags: ['navigation', 'refactor'] },
  { id: 'editor.action.jumpToBracket', action: 'Jump to the matching bracket', keys: 'Mod+Shift+\\', tags: ['navigation'], level: 2 },
  { id: 'workbench.action.navigateBack', action: 'Navigate back', keys: 'Alt+Left', mac: 'Ctrl+-', linux: 'Ctrl+Alt+-', tags: ['navigation'] },
  { id: 'workbench.action.navigateForward', action: 'Navigate forward', keys: 'Alt+Right', mac: 'Ctrl+Shift+-', linux: 'Ctrl+Shift+-', tags: ['navigation'], level: 2 },

  // Find
  { id: 'actions.find', action: 'Find in the file', keys: 'Mod+F', tags: ['search'] },
  { id: 'editor.action.startFindReplaceAction', action: 'Find and replace in the file', keys: 'Ctrl+H', mac: 'Cmd+Alt+F', tags: ['search'] },
  { id: 'workbench.action.replaceInFiles', action: 'Replace across files', keys: 'Mod+Shift+H', tags: ['search'], level: 2 },
  { id: 'editor.action.nextMatchFindAction', action: 'Find the next match', keys: 'F3', mac: 'Cmd+G', tags: ['search'], level: 2 },
  { id: 'editor.action.previousMatchFindAction', action: 'Find the previous match', keys: 'Shift+F3', mac: 'Cmd+Shift+G', tags: ['search'], level: 2 },

  // Debug
  { id: 'workbench.action.debug.start', action: 'Start debugging', keys: 'F5', tags: ['debug'] },
  { id: 'workbench.action.debug.run', action: 'Run without debugging', keys: 'Ctrl+F5', tags: ['debug'], level: 2 },
  { id: 'workbench.action.debug.stop', action: 'Stop debugging', keys: 'Shift+F5', tags: ['debug'], level: 2 },
  { id: 'editor.debug.action.toggleBreakpoint', action: 'Toggle a breakpoint', keys: 'F9', tags: ['debug'] },
  { id: 'workbench.action.debug.stepOver', action: 'Step over', keys: 'F10', tags: ['debug'] },
  { id: 'workbench.action.debug.stepInto', action: 'Step into', keys: 'F11', tags: ['debug'] },
  { id: 'workbench.action.debug.stepOut', action: 'Step out', keys: 'Shift+F11', tags: ['debug'], level: 2 },
];
