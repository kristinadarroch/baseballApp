import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { ConnectionProvider, GameState, useConnection } from '../ConnectionContext';

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

const TEST_POLL_INTERVAL_MS = 150;
const TEST_RESET_DEBOUNCE_MS = 500;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ConnectionProvider>{children}</ConnectionProvider>
);

const latchedArray = (count: number, slots: number) =>
  Array.from({ length: slots }, (_, index) => (index < count ? 1 : 0));

const clickerState = ({
  balls = 0,
  strikes = 0,
  outs = 0,
  run = 0,
}: {
  balls?: number;
  strikes?: number;
  outs?: number;
  run?: number;
} = {}): GameState => ({
  balls: latchedArray(balls, 3),
  strikes: latchedArray(strikes, 2),
  outs: latchedArray(outs, 2),
  run,
});

const responseFor = (state: GameState) =>
  Promise.resolve({
    ok: true,
    json: async () => state,
  } as Response);

const queueStatus = (state: GameState) => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => state,
  } as Response);
};

const setDefaultStatus = (state: GameState) => {
  mockFetch.mockImplementation(() => responseFor(state));
};

const pollClicker = async (state: GameState) => {
  const nextCallCount = mockFetch.mock.calls.length + 1;
  setDefaultStatus(state);
  queueStatus(state);

  act(() => {
    jest.advanceTimersByTime(TEST_POLL_INTERVAL_MS);
  });

  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledTimes(nextCallCount);
  });
};

const settleClickerReset = async () => {
  act(() => {
    jest.advanceTimersByTime(TEST_RESET_DEBOUNCE_MS + 200);
  });
};

const createClickerGameDriver = () => {
  let runLatch = 0;

  const scoreRun = async () => {
    runLatch = runLatch === 0 ? 1 : 0;
    await pollClicker(clickerState({ run: runLatch }));
  };

  const scoreRuns = async (runCount: number) => {
    for (let i = 0; i < runCount; i++) {
      await scoreRun();
    }
  };

  const retireSide = async () => {
    await pollClicker(clickerState({ outs: 1, run: runLatch }));
    await pollClicker(clickerState({ outs: 2, run: runLatch }));
    await pollClicker(clickerState({ outs: 0, run: runLatch }));
    await settleClickerReset();
  };

  const playHalfInning = async (runs: number) => {
    await scoreRuns(runs);
    await retireSide();
  };

  return {
    playHalfInning,
  };
};

const startConnectedGame = async (
  result: { current: ReturnType<typeof useConnection> }
) => {
  queueStatus(clickerState());

  act(() => {
    result.current.connect();
  });

  await waitFor(() => {
    expect(result.current.isConnected).toBe(true);
  });

  act(() => {
    result.current.beginGame();
  });

  await waitFor(() => {
    expect(result.current.fullGameState.gameStarted).toBe(true);
  });
};

describe('ConnectionContext clicker game E2E flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    setDefaultStatus(clickerState());
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('individual clicker positions', () => {
    it.each([
      ['Ball 1', 1],
      ['Ball 2', 2],
      ['Ball 3', 3],
    ])('records %s from the ball wheel', async (_label, ballCount) => {
      const { result } = renderHook(() => useConnection(), { wrapper });

      await startConnectedGame(result);
      await pollClicker(clickerState({ balls: ballCount }));

      await waitFor(() => {
        expect(result.current.balls).toBe(ballCount);
        expect(result.current.strikes).toBe(0);
        expect(result.current.outs).toBe(0);
        expect(result.current.runs).toBe(0);
      });

      act(() => {
        result.current.disconnect();
      });
    });

    it.each([
      ['Strike 1', 1],
      ['Strike 2', 2],
    ])('records %s from the strike wheel', async (_label, strikeCount) => {
      const { result } = renderHook(() => useConnection(), { wrapper });

      await startConnectedGame(result);
      await pollClicker(clickerState({ strikes: strikeCount }));

      await waitFor(() => {
        expect(result.current.balls).toBe(0);
        expect(result.current.strikes).toBe(strikeCount);
        expect(result.current.outs).toBe(0);
        expect(result.current.runs).toBe(0);
      });

      act(() => {
        result.current.disconnect();
      });
    });

    it.each([
      ['Out 1', [1], 1, 1],
      ['Out 2', [1, 2], 2, 2],
    ])('records %s from the displayed out wheel', async (
      _label,
      outSequence,
      outCount,
      batterPosition
    ) => {
      const { result } = renderHook(() => useConnection(), { wrapper });

      await startConnectedGame(result);
      for (const nextOutCount of outSequence) {
        await pollClicker(clickerState({ outs: nextOutCount }));
      }

      await waitFor(() => {
        expect(result.current.balls).toBe(0);
        expect(result.current.strikes).toBe(0);
        expect(result.current.outs).toBe(outCount);
        expect(result.current.runs).toBe(0);
        expect(result.current.fullGameState.visitorBatterPosition).toBe(batterPosition);
      });

      act(() => {
        result.current.disconnect();
      });
    });

    it.each([
      ['Run toggle high', 1, 1],
      ['Run toggle low', 0, 2],
    ])('records %s from the run latch', async (_label, runState, expectedRuns) => {
      const { result } = renderHook(() => useConnection(), { wrapper });

      await startConnectedGame(result);
      await pollClicker(clickerState({ run: 1 }));

      if (expectedRuns === 2) {
        await pollClicker(clickerState({ run: runState }));
      }

      await waitFor(() => {
        expect(result.current.runs).toBe(expectedRuns);
        expect(result.current.fullGameState.visitorScore).toBe(expectedRuns);
      });

      act(() => {
        result.current.disconnect();
      });
    });
  });

  it('treats a two-position out-wheel reset as the hidden third out', async () => {
    const { result } = renderHook(() => useConnection(), { wrapper });

    await startConnectedGame(result);

    await pollClicker(clickerState({ outs: 1 }));
    await waitFor(() => {
      expect(result.current.outs).toBe(1);
      expect(result.current.fullGameState.visitorBatterPosition).toBe(1);
    });

    await pollClicker(clickerState({ outs: 2 }));
    await waitFor(() => {
      expect(result.current.outs).toBe(2);
      expect(result.current.fullGameState.visitorBatterPosition).toBe(2);
    });

    await pollClicker(clickerState({ outs: 0 }));
    await settleClickerReset();

    await waitFor(() => {
      expect(result.current.outs).toBe(0);
      expect(result.current.fullGameState.isTopOfInning).toBe(false);
      expect(result.current.fullGameState.currentBatterTeam).toBe('home');
      expect(result.current.fullGameState.totalOuts).toBe(3);
      expect(result.current.fullGameState.currentInningOuts).toBe(3);
      expect(result.current.fullGameState.visitorBatterPosition).toBe(3);
    });

    act(() => {
      result.current.disconnect();
    });
  });

  it('plays a complete first inning from clicker statuses and records scores by half-inning', async () => {
    const { result } = renderHook(() => useConnection(), { wrapper });

    await startConnectedGame(result);

    await pollClicker(clickerState({ run: 1 }));
    await waitFor(() => {
      expect(result.current.runs).toBe(1);
      expect(result.current.fullGameState.visitorScore).toBe(1);
    });

    await pollClicker(clickerState({ run: 0 }));
    await waitFor(() => {
      expect(result.current.runs).toBe(2);
      expect(result.current.fullGameState.visitorScore).toBe(2);
    });

    await pollClicker(clickerState({ outs: 1, run: 0 }));
    await pollClicker(clickerState({ outs: 2, run: 0 }));
    await pollClicker(clickerState({ outs: 0, run: 0 }));
    await settleClickerReset();

    await waitFor(() => {
      expect(result.current.runs).toBe(0);
      expect(result.current.fullGameState.isTopOfInning).toBe(false);
      expect(result.current.fullGameState.currentBatterTeam).toBe('home');
      expect(result.current.fullGameState.visitorScore).toBe(2);
      expect(result.current.fullGameState.visitorInningScores[0]).toBe(2);
      expect(result.current.fullGameState.totalOuts).toBe(3);
      expect(result.current.fullGameState.currentInningOuts).toBe(3);
    });

    await pollClicker(clickerState({ run: 1 }));
    await waitFor(() => {
      expect(result.current.runs).toBe(1);
      expect(result.current.fullGameState.homeScore).toBe(1);
    });

    await pollClicker(clickerState({ outs: 1, run: 1 }));
    await pollClicker(clickerState({ outs: 2, run: 1 }));
    await pollClicker(clickerState({ outs: 0, run: 1 }));
    await settleClickerReset();

    await waitFor(() => {
      expect(result.current.runs).toBe(0);
      expect(result.current.fullGameState.inning).toBe(2);
      expect(result.current.fullGameState.isTopOfInning).toBe(true);
      expect(result.current.fullGameState.currentBatterTeam).toBe('visitor');
      expect(result.current.fullGameState.visitorScore).toBe(2);
      expect(result.current.fullGameState.homeScore).toBe(1);
      expect(result.current.fullGameState.homeInningScores[0]).toBe(1);
      expect(result.current.fullGameState.totalOuts).toBe(6);
      expect(result.current.fullGameState.currentInningOuts).toBe(0);
    });

    act(() => {
      result.current.disconnect();
    });
  });

  it('mocks a full tied nine-inning game and advances to extra innings', async () => {
    const { result } = renderHook(() => useConnection(), { wrapper });
    const visitorRunsByInning = [1, 0, 0, 2, 0, 0, 1, 0, 0];
    const homeRunsByInning = [0, 1, 0, 0, 2, 0, 0, 1, 0];
    const driver = createClickerGameDriver();

    await startConnectedGame(result);

    for (let inningIndex = 0; inningIndex < 9; inningIndex++) {
      await driver.playHalfInning(visitorRunsByInning[inningIndex]);

      await waitFor(() => {
        expect(result.current.fullGameState.currentBatterTeam).toBe('home');
        expect(result.current.fullGameState.visitorInningScores[inningIndex]).toBe(
          visitorRunsByInning[inningIndex]
        );
      });

      await driver.playHalfInning(homeRunsByInning[inningIndex]);

      await waitFor(() => {
        expect(result.current.fullGameState.currentBatterTeam).toBe('visitor');
        expect(result.current.fullGameState.homeInningScores[inningIndex]).toBe(
          homeRunsByInning[inningIndex]
        );
      });
    }

    const visitorTotal = visitorRunsByInning.reduce((total, runs) => total + runs, 0);
    const homeTotal = homeRunsByInning.reduce((total, runs) => total + runs, 0);

    await waitFor(() => {
      expect(visitorTotal).toBe(homeTotal);
      expect(result.current.fullGameState.inning).toBe(10);
      expect(result.current.fullGameState.isTopOfInning).toBe(true);
      expect(result.current.fullGameState.currentBatterTeam).toBe('visitor');
      expect(result.current.fullGameState.totalOuts).toBe(54);
      expect(result.current.fullGameState.currentInningOuts).toBe(0);
      expect(result.current.fullGameState.visitorScore).toBe(visitorTotal);
      expect(result.current.fullGameState.homeScore).toBe(homeTotal);
      expect(result.current.fullGameState.visitorInningScores).toEqual(visitorRunsByInning);
      expect(result.current.fullGameState.homeInningScores).toEqual(homeRunsByInning);
      expect(result.current.fullGameState.visitorBatterPosition).toBe(
        (27 + visitorTotal) % 9
      );
      expect(result.current.fullGameState.homeBatterPosition).toBe((27 + homeTotal) % 9);
    });

    act(() => {
      result.current.disconnect();
    });
  });
});
