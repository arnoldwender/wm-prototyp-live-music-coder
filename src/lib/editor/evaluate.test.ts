// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createEvaluator } from './evaluate';

describe('createEvaluator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('debounces evaluation calls', async () => {
    const evalFn = vi.fn().mockResolvedValue(undefined);
    const evaluator = createEvaluator(evalFn, 100);

    evaluator.evaluate('code1');
    evaluator.evaluate('code2');
    evaluator.evaluate('code3');

    /* Only the last call should fire after debounce */
    await vi.advanceTimersByTimeAsync(150);
    expect(evalFn).toHaveBeenCalledTimes(1);
    expect(evalFn).toHaveBeenCalledWith('code3');
  });

  it('reports errors via callback', async () => {
    const error = new Error('syntax error');
    const evalFn = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();
    const evaluator = createEvaluator(evalFn, 50, onError);

    evaluator.evaluate('bad code');
    await vi.advanceTimersByTimeAsync(100);
    expect(onError).toHaveBeenCalledWith(error);
  });

  it('can be cancelled', async () => {
    const evalFn = vi.fn().mockResolvedValue(undefined);
    const evaluator = createEvaluator(evalFn, 100);

    evaluator.evaluate('code');
    evaluator.cancel();
    await vi.advanceTimersByTimeAsync(150);
    expect(evalFn).not.toHaveBeenCalled();
  });

  it('clears error on successful evaluation', async () => {
    const evalFn = vi.fn().mockResolvedValue(undefined);
    const onError = vi.fn();
    const onSuccess = vi.fn();
    const evaluator = createEvaluator(evalFn, 50, onError, onSuccess);

    evaluator.evaluate('good code');
    await vi.advanceTimersByTimeAsync(100);
    expect(onSuccess).toHaveBeenCalled();
  });
});
