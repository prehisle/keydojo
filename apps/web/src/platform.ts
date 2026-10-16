import type { CaptureEnv, Platform } from '@keydojo/core';

export function detectPlatform(): Platform {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const p = nav.userAgentData?.platform ?? navigator.platform ?? navigator.userAgent;
  if (/mac|iphone|ipad/i.test(p)) return 'mac';
  if (/win/i.test(p)) return 'windows';
  return 'linux';
}

type KeyboardLock = { lock?: (codes?: string[]) => Promise<void>; unlock?: () => void };

function keyboardApi(): KeyboardLock | undefined {
  return (navigator as Navigator & { keyboard?: KeyboardLock }).keyboard;
}

/** Whether the Keyboard Lock API is available (Chromium only). */
export function canLockKeyboard(): boolean {
  return typeof keyboardApi()?.lock === 'function';
}

/**
 * Enter fullscreen and lock the keyboard. In this state Chromium hands the page shortcuts
 * like Ctrl+W and Ctrl+T, so it behaves like the desktop build. Hold Esc to leave.
 */
export async function enterKeyboardLock(): Promise<boolean> {
  try {
    await document.documentElement.requestFullscreen();
    await keyboardApi()?.lock?.();
    return true;
  } catch {
    return false;
  }
}

export function currentCaptureEnv(): CaptureEnv {
  // Tauri injects this global; the desktop shell sees every non-OS shortcut.
  if ('__TAURI_INTERNALS__' in window) return 'desktop';
  return document.fullscreenElement && canLockKeyboard() ? 'desktop' : 'browser';
}
