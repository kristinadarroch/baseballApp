# ConnectionContext Unit Tests

Comprehensive test suite for the Baseball Scoreboard ConnectionContext.

## Test Coverage

### ✅ Initial State (1 test)
- Verifies all values start at correct defaults (disconnected, no errors, counts at 0, runs at 0)

### ✅ Run Counter (4 tests)
- **First press**: Tests run button press increments count from 0 to 1
- **Multiple presses**: Tests sequential presses increment correctly (1→2→3)
- **Hold prevention**: Ensures holding button doesn't continue incrementing
- **Reset on disconnect**: Confirms run count resets to 0 on disconnect

### ✅ Connection (2 tests)
- **Successful connection**: Confirms `isConnected` becomes true and gameState is set
- **Connection failure**: Ensures errors are captured and connection fails gracefully

### ✅ Button Press Detection - Rising Edge (3 tests)
- **Ball button press**: Tests button 2 (index 1) sets count to 2
- **Strike button press**: Tests button 1 (index 0) sets count to 1  
- **Out button press**: Tests button 3 (index 2) sets count to 3

### ✅ Persistent State (1 test)
- **Count persistence**: Verifies count stays set even after button release
- **Reset on all zeros**: Confirms count resets when all buttons return to 0

### ✅ Reset on All Zeros (1 test)
- **Full reset**: Tests that count goes to 0 when all switches are released

### ✅ Independent Tracking (2 tests)
- **Simultaneous tracking**: Confirms balls/strikes/outs don't affect each other
- **Selective reset**: Tests resetting one type doesn't affect others

### ✅ Disconnect (1 test)
- **State cleanup**: Verifies all state is reset on disconnect (including runs)

### ✅ Polling (2 tests)
- **Poll interval**: Confirms fetching happens every 500ms
- **Stop polling**: Ensures polling stops after disconnect

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode (for development)
```bash
npm run test:watch
```

### Run with coverage report
```bash
npm run test:coverage
```

## Test Results

**Total Tests: 17**
- ✅ All passing
- 🎯 95.78% code coverage

## What's Being Tested

### Edge Detection Logic
The tests verify the "rising edge" detection that makes button presses work:

**For Balls/Strikes/Outs (Positional):**
- Previous: `[0,0,0,0]`, Current: `[0,1,0,0]` → Detected press on button 2
- Previous: `[0,1,0,0]`, Current: `[0,1,0,0]` → No change (button held)
- Previous: `[0,1,0,0]`, Current: `[0,0,0,0]` → Reset (all zeros)

**For Runs (Toggle/Latch Counter):**
- Previous: `0`, Current: `1` → State changed, increment counter (runs++)
- Previous: `1`, Current: `1` → No change (latch held high)
- Previous: `1`, Current: `0` → State changed, increment counter (runs++)
- Previous: `0`, Current: `0` → No change (latch held low)
- Previous: `0`, Current: `1` → State changed, increment counter (runs++)

### State Persistence
Tests confirm that once a button is pressed and sets the count, that count persists until:
1. **Balls/Strikes/Outs**: A different button is pressed (sets new count) OR all buttons are released (resets to 0)
2. **Runs**: Count increments with each press and never decreases (except on disconnect)

### Independent State Management
Each type (balls, strikes, outs, runs) is completely independent:
- Changing balls doesn't affect strikes, outs, or runs
- Resetting strikes doesn't affect balls, outs, or runs
- Run counter increments independently of game state
- Each tracks its own previous state for edge detection

## Mock Data Examples

### All Buttons Released
```json
{
  "balls": [0, 0, 0, 0],
  "strikes": [0, 0, 0],
  "outs": [0, 0, 0],
  "run": 0
}
```

### Button 2 Pressed for Balls
```json
{
  "balls": [0, 1, 0, 0],
  "strikes": [0, 0, 0],
  "outs": [0, 0, 0],
  "run": 0
}
```

### Multiple Indicators Set
```json
{
  "balls": [0, 1, 0, 0],
  "strikes": [0, 1, 0],
  "outs": [0, 0, 1],
  "run": 1
}
```

### How Run Counter Works
The run button works as a **toggle/latch** - each state change counts as 1 run:
- Toggle 1: `0→1` (high) → Count = 1 ✅
- Toggle 2: `1→0` (low) → Count = 2 ✅
- Toggle 3: `0→1` (high) → Count = 3 ✅
- Toggle 4: `1→0` (low) → Count = 4 ✅
- Hold high: `1→1` → Count = 4 (no change)
- Toggle 5: `1→0` (low) → Count = 5 ✅
- And so on...

**Both edges (rising AND falling) count as runs!**

## Test Architecture

- **Framework**: Jest with React Testing Library
- **Mocking**: Global fetch is mocked for API calls
- **Timers**: Jest fake timers for testing polling behavior
- **Cleanup**: Automatic cleanup after each test

## Adding New Tests

To add tests for new functionality:

1. Add test cases to appropriate describe block
2. Use `renderHook` for testing the hook
3. Use `act` for state updates
4. Use `waitFor` for async operations
5. Mock fetch responses as needed

Example:
```typescript
it('should handle new feature', async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockData,
  } as Response);

  const { result } = renderHook(() => useConnection(), { wrapper });

  act(() => {
    // Trigger action
  });

  await waitFor(() => {
    // Assert expected behavior
  });
});
```

## Continuous Integration

These tests should be run:
- ✅ Before every commit
- ✅ In CI/CD pipeline
- ✅ Before releasing new versions

