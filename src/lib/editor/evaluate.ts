/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Debounced code evaluator — bridges the editor to the
   audio orchestrator. Prevents rapid re-evaluation during
   typing. Reports errors for UI display via callbacks.
   ────────────────────────────────────────────────────────── */

/** Evaluator interface returned by createEvaluator */
export interface Evaluator {
  evaluate: (code: string) => void;
  cancel: () => void;
}

/** Create a debounced evaluator that calls evalFn after a delay.
 *  Successive calls reset the timer — only the last code wins. */
export function createEvaluator(
  evalFn: (code: string) => Promise<void>,
  debounceMs = 500,
  onError?: (error: Error) => void,
  onSuccess?: () => void,
): Evaluator {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return {
    evaluate(code: string) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          await evalFn(code);
          onSuccess?.();
        } catch (err) {
          onError?.(err instanceof Error ? err : new Error(String(err)));
        }
      }, debounceMs);
    },
    cancel() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    },
  };
}
