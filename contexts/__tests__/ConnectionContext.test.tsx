import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { ConnectionProvider, GameState, useConnection } from '../ConnectionContext';

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
const TEST_POLL_INTERVAL_MS = 150;
const TEST_RESET_DEBOUNCE_MS = 500;

describe('ConnectionContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ConnectionProvider>{children}</ConnectionProvider>
  );

  describe('Initial State', () => {
    it('should have correct initial values', () => {
      const { result } = renderHook(() => useConnection(), { wrapper });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.gameState).toBeNull();
      expect(result.current.balls).toBe(0);
      expect(result.current.strikes).toBe(0);
      expect(result.current.outs).toBe(0);
      expect(result.current.runs).toBe(0);
    });
  });

  describe('Run Counter', () => {
    it('should increment runs on button toggle to high (0→1) after initial baseline', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          balls: [0, 0, 0, 0],
          strikes: [0, 0, 0],
          outs: [0, 0, 0],
          run: 0,
        }),
      } as Response);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          balls: [0, 0, 0, 0],
          strikes: [0, 0, 0],
          outs: [0, 0, 0],
          run: 1,
        }),
      } as Response);

      const { result } = renderHook(() => useConnection(), { wrapper });

      act(() => {
        result.current.connect();
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      act(() => {
        jest.advanceTimersByTime(TEST_POLL_INTERVAL_MS);
      });

      await waitFor(() => {
        expect(result.current.runs).toBe(1);
      });
    });

    it('should increment runs on each button toggle (both high and low)', async () => {
      const { result } = renderHook(() => useConnection(), { wrapper });

      // Initial baseline - do not count the state that existed before connecting.
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          balls: [0, 0, 0, 0],
          strikes: [0, 0, 0],
          outs: [0, 0, 0],
          run: 0,
        }),
      } as Response);

      act(() => {
        result.current.connect();
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      const toggles = [1, 0, 1, 0];

      for (const [index, run] of toggles.entries()) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            balls: [0, 0, 0, 0],
            strikes: [0, 0, 0],
            outs: [0, 0, 0],
            run,
          }),
        } as Response);

        act(() => {
          jest.advanceTimersByTime(TEST_POLL_INTERVAL_MS);
        });

        await waitFor(() => {
          expect(result.current.runs).toBe(index + 1);
        });
      }
    });

    it('should not increment when state stays the same (latch held)', async () => {
      const { result } = renderHook(() => useConnection(), { wrapper });

      // Initial baseline
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          balls: [0, 0, 0, 0],
          strikes: [0, 0, 0],
          outs: [0, 0, 0],
          run: 0,
        }),
      } as Response);

      act(() => {
        result.current.connect();
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Toggle to high
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          balls: [0, 0, 0, 0],
          strikes: [0, 0, 0],
          outs: [0, 0, 0],
          run: 1,
        }),
      } as Response);

      act(() => {
        jest.advanceTimersByTime(TEST_POLL_INTERVAL_MS);
      });

      await waitFor(() => {
        expect(result.current.runs).toBe(1);
      });

      // Latch stays high (no change)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          balls: [0, 0, 0, 0],
          strikes: [0, 0, 0],
          outs: [0, 0, 0],
          run: 1, // Still high
        }),
      } as Response);

      act(() => {
        jest.advanceTimersByTime(TEST_POLL_INTERVAL_MS);
      });

      await waitFor(() => {
        expect(result.current.runs).toBe(1); // Should not increment - no state change
      });
    });

    it('should reset runs on disconnect', async () => {
      const { result } = renderHook(() => useConnection(), { wrapper });

      // Initial baseline
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          balls: [0, 0, 0, 0],
          strikes: [0, 0, 0],
          outs: [0, 0, 0],
          run: 0,
        }),
      } as Response);

      act(() => {
        result.current.connect();
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          balls: [0, 0, 0, 0],
          strikes: [0, 0, 0],
          outs: [0, 0, 0],
          run: 1,
        }),
      } as Response);

      act(() => {
        jest.advanceTimersByTime(TEST_POLL_INTERVAL_MS);
      });

      await waitFor(() => {
        expect(result.current.runs).toBe(1);
      });

      // Disconnect
      act(() => {
        result.current.disconnect();
      });

      expect(result.current.runs).toBe(0);
    });
  });

  describe('Connection', () => {
    it('should set isConnected to true on successful connection', async () => {
      const mockData: GameState = {
        balls: [0, 0, 0, 0],
        strikes: [0, 0, 0],
        outs: [0, 0, 0],
        run: 0,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const { result } = renderHook(() => useConnection(), { wrapper });

      act(() => {
        result.current.connect();
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      expect(result.current.gameState).toEqual(mockData);
    });

    it('should set error on connection failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useConnection(), { wrapper });

      act(() => {
        result.current.connect();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });

      expect(result.current.isConnected).toBe(false);
    });

    it('should stay connected through a transient poll failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          balls: [0, 0, 0, 0],
          strikes: [0, 0, 0],
          outs: [0, 0, 0],
          run: 0,
        }),
      } as Response);

      const { result } = renderHook(() => useConnection(), { wrapper });

      act(() => {
        result.current.connect();
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      mockFetch.mockRejectedValueOnce(new Error('Network hiccup'));

      act(() => {
        jest.advanceTimersByTime(TEST_POLL_INTERVAL_MS);
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Network hiccup');
      });

      expect(result.current.isConnected).toBe(true);
    });

    it('should fall back to the default AP IP when a saved IP fails', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            balls: [0, 0, 0, 0],
            strikes: [0, 0, 0],
            outs: [0, 0, 0],
            run: 0,
          }),
        } as Response);

      const { result } = renderHook(() => useConnection(), { wrapper });

      await act(async () => {
        await result.current.setEsp32IpAddress('192.168.0.99');
      });

      act(() => {
        result.current.connect();
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      expect(mockFetch.mock.calls[0][0]).toContain('http://192.168.0.99/status');
      expect(mockFetch.mock.calls[1][0]).toContain('http://192.168.4.1/status');
      expect(result.current.esp32IpAddress).toBe('192.168.4.1');
    });
  });

  describe('Button Press Detection (Rising Edge)', () => {
    it('should detect ball button 2 press and set count to 2', async () => {
      const mockData: GameState = {
        balls: [0, 1, 0, 0], // Button 2 pressed
        strikes: [0, 0, 0],
        outs: [0, 0, 0],
        run: 0,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      const { result } = renderHook(() => useConnection(), { wrapper });

      act(() => {
        result.current.connect();
      });

      await waitFor(() => {
        expect(result.current.balls).toBe(2);
      });
    });

    it('should detect strike button 1 press and set count to 1', async () => {
      const mockData: GameState = {
        balls: [0, 0, 0, 0],
        strikes: [1, 0, 0], // Button 1 pressed
        outs: [0, 0, 0],
        run: 0,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      const { result } = renderHook(() => useConnection(), { wrapper });

      act(() => {
        result.current.connect();
      });

      await waitFor(() => {
        expect(result.current.strikes).toBe(1);
      });
    });

    it('should detect out button 3 press and set count to 3', async () => {
      const mockData: GameState = {
        balls: [0, 0, 0, 0],
        strikes: [0, 0, 0],
        outs: [0, 0, 1], // Button 3 pressed
        run: 0,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      const { result } = renderHook(() => useConnection(), { wrapper });

      act(() => {
        result.current.connect();
      });

      await waitFor(() => {
        expect(result.current.outs).toBe(3);
      });
    });
  });

  describe('Persistent State', () => {
    it('should maintain ball count after button release', async () => {
      const { result } = renderHook(() => useConnection(), { wrapper });

      // First: Button 2 pressed
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          balls: [0, 1, 0, 0],
          strikes: [0, 0, 0],
          outs: [0, 0, 0],
          run: 0,
        }),
      } as Response);

      act(() => {
        result.current.connect();
      });

      await waitFor(() => {
        expect(result.current.balls).toBe(2);
      });


    //   here
    // so the arrays are the highs of the buttons pressed on the esp32 board
    // example: balls: [0, 1, 0, 0] means ball 2 is high, so there have been 2 balls
    // example: outs: [0, 0, 1] means out 3 is high, so there have been 3 outs
    // example: strikes: [0, 1, 0] means strike 2 is high, so there have been 2 strikes
    // example runs: the users presses the run button for the first time, so there have been 1 run
    // example runs: the users presses the run button for the second time, so there have been 2 runs
    // example runs: the users presses the run button for the third time, so there have been 3 runs
    // example runs: the users presses the run button for the fourth time, so there have been 4 runs
    // example runs: the users presses the run button for the fifth time, so there have been 5 runs
    // example runs: the users presses the run button for the sixth time, so there have been 6 runs
    // example runs: the users presses the run button for the seventh time, so there have been 7 runs
    // example runs: the users presses the run button for the eighth time, so there have been 8 runs

      // Second: Button released but state should persist
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          balls: [0, 0, 0, 0], // Released - but NOT all zeros from our perspective yet
          strikes: [0, 0, 0],
          outs: [0, 0, 0],
          run: 0,
        }),
      } as Response);

      // Trigger another poll
      act(() => {
        jest.advanceTimersByTime(TEST_POLL_INTERVAL_MS + TEST_RESET_DEBOUNCE_MS);
      });

      await waitFor(() => {
        expect(result.current.balls).toBe(0); // Reset when all zeros
      });
    });
  });

  describe('Reset on All Zeros', () => {
    it('should reset balls to 0 when all buttons are released', async () => {
      const { result } = renderHook(() => useConnection(), { wrapper });

      // Set balls to 3
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          balls: [0, 0, 1, 0],
          strikes: [0, 0, 0],
          outs: [0, 0, 0],
          run: 0,
        }),
      } as Response);

      act(() => {
        result.current.connect();
      });

      await waitFor(() => {
        expect(result.current.balls).toBe(3);
      });

      // Release all buttons
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          balls: [0, 0, 0, 0],
          strikes: [0, 0, 0],
          outs: [0, 0, 0],
          run: 0,
        }),
      } as Response);

      act(() => {
        jest.advanceTimersByTime(TEST_POLL_INTERVAL_MS + TEST_RESET_DEBOUNCE_MS);
      });

      await waitFor(() => {
        expect(result.current.balls).toBe(0);
      });
    });
  });

  describe('Independent Tracking', () => {
    it('should track balls, strikes, and outs independently', async () => {
      const { result } = renderHook(() => useConnection(), { wrapper });

      // Set balls to 2
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          balls: [0, 1, 0, 0],
          strikes: [0, 0, 0],
          outs: [0, 0, 0],
          run: 0,
        }),
      } as Response);

      act(() => {
        result.current.connect();
      });

      await waitFor(() => {
        expect(result.current.balls).toBe(2);
      });

      // Add strike without affecting balls
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          balls: [0, 1, 0, 0], // Still pressed
          strikes: [1, 0, 0], // Strike added
          outs: [0, 0, 0],
          run: 0,
        }),
      } as Response);

      act(() => {
        jest.advanceTimersByTime(TEST_POLL_INTERVAL_MS);
      });

      await waitFor(() => {
        expect(result.current.balls).toBe(2);
        expect(result.current.strikes).toBe(1);
        expect(result.current.outs).toBe(0);
      });
    });

    it('should not affect other counts when resetting one', async () => {
      const { result } = renderHook(() => useConnection(), { wrapper });

      // Set both balls and strikes
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          balls: [0, 1, 0, 0],
          strikes: [0, 1, 0],
          outs: [0, 0, 0],
          run: 0,
        }),
      } as Response);

      act(() => {
        result.current.connect();
      });

      await waitFor(() => {
        expect(result.current.balls).toBe(2);
        expect(result.current.strikes).toBe(2);
      });

      // Reset balls but keep strikes
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          balls: [0, 0, 0, 0], // Reset
          strikes: [0, 1, 0], // Still set
          outs: [0, 0, 0],
          run: 0,
        }),
      } as Response);

      act(() => {
        jest.advanceTimersByTime(TEST_POLL_INTERVAL_MS + TEST_RESET_DEBOUNCE_MS);
      });

      await waitFor(() => {
        expect(result.current.balls).toBe(0);
        expect(result.current.strikes).toBe(2); // Unchanged
      });
    });
  });

  describe('Disconnect', () => {
    it('should reset all state on disconnect', async () => {
      const { result } = renderHook(() => useConnection(), { wrapper });

      // Connect and set some state
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          balls: [0, 1, 0, 0],
          strikes: [1, 0, 0],
          outs: [0, 1, 0],
          run: 1,
        }),
      } as Response);

      act(() => {
        result.current.connect();
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
        expect(result.current.balls).toBe(2);
      });

      // Disconnect
      act(() => {
        result.current.disconnect();
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.balls).toBe(0);
      expect(result.current.strikes).toBe(0);
      expect(result.current.outs).toBe(0);
      expect(result.current.runs).toBe(0);
      expect(result.current.gameState).toBeNull();
    });
  });

  describe('Polling', () => {
    it('should poll every 150ms when connected', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          balls: [0, 0, 0, 0],
          strikes: [0, 0, 0],
          outs: [0, 0, 0],
          run: 0,
        }),
      } as Response);

      const { result } = renderHook(() => useConnection(), { wrapper });

      act(() => {
        result.current.connect();
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      // Advance time and check polling
      act(() => {
        jest.advanceTimersByTime(TEST_POLL_INTERVAL_MS);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });

      act(() => {
        jest.advanceTimersByTime(TEST_POLL_INTERVAL_MS);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(3);
      });
    });

    it('should stop polling on disconnect', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          balls: [0, 0, 0, 0],
          strikes: [0, 0, 0],
          outs: [0, 0, 0],
          run: 0,
        }),
      } as Response);

      const { result } = renderHook(() => useConnection(), { wrapper });

      act(() => {
        result.current.connect();
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      // Disconnect
      act(() => {
        result.current.disconnect();
      });

      const callCountAfterDisconnect = mockFetch.mock.calls.length;

      // Advance time - should not poll anymore
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(mockFetch).toHaveBeenCalledTimes(callCountAfterDisconnect);
    });
  });
});
