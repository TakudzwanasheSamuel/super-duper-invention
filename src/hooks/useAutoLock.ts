import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useUserStore } from '@/store/useUserStore';
import {
  LAST_ACTIVE_TIMESTAMP_KEY,
  PIN_LOCK_TIMEOUT_MS,
} from '@/constants/auth';

/**
 * Re-lock the app after a period of inactivity.
 *
 * When the app goes to the background we stamp the current time. When it
 * comes back to the foreground, if more than PIN_LOCK_TIMEOUT_MS has passed
 * we flip `isUnlocked` back to false. The root layout's navigation effect
 * will then send the user to the PIN screen.
 *
 * This needs to live at the root (mounted for the whole app lifetime), not
 * on the PinLockScreen itself — otherwise the listener is unmounted while
 * the user is browsing tabs and the auto-lock never triggers.
 */
export function useAutoLock(enabled: boolean) {
  const lastStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    if (!enabled) return;

    const handleChange = async (next: AppStateStatus) => {
      const prev = lastStateRef.current;
      lastStateRef.current = next;

      if (next === 'background' || next === 'inactive') {
        try {
          await SecureStore.setItemAsync(
            LAST_ACTIVE_TIMESTAMP_KEY,
            Date.now().toString(),
          );
        } catch {
          // Non-fatal — worst case, we don't auto-lock this session.
        }
        return;
      }

      if (next === 'active' && (prev === 'background' || prev === 'inactive')) {
        try {
          const stamped = await SecureStore.getItemAsync(LAST_ACTIVE_TIMESTAMP_KEY);
          if (!stamped) return;
          const idleMs = Date.now() - parseInt(stamped, 10);
          if (Number.isFinite(idleMs) && idleMs > PIN_LOCK_TIMEOUT_MS) {
            useUserStore.getState().setUnlocked(false);
          }
        } catch {
          // Ignore.
        }
      }
    };

    const sub = AppState.addEventListener('change', handleChange);
    return () => sub.remove();
  }, [enabled]);
}
