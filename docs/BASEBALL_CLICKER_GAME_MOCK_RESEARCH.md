# Baseball Clicker Game Mock Research

## Sources

- MLB Official Baseball Rules 2026:
  https://mktg.mlbstatic.com/mlb/official-information/2026-official-baseball-rules.pdf

## Rule anchors used by the mock

- A run is scored when an offensive player legally advances through first, second, third, and home before three outs end the inning.
- When three offensive players are legally put out, that team takes the field and the opposing team bats.
- A regulation game is nine innings unless extended because of a tie score, shortened because the home team does not need all of the ninth, or called by rule.
- If the score is tied after nine completed innings, play continues into extra innings.
- Four balls award first base, and three strikes produce a strikeout in the scorer's rules.

## Clicker-model decisions

- The app treats the run button as the scoring source of truth because the physical clicker does not expose runners, bases, hits, walks, errors, force plays, or appeals.
- The physical out wheel exposes two displayed positions. Resetting the wheel from out 2 to 0 is treated as the hidden third out and ends the half-inning.
- The full-game mock uses a tied nine-inning game so advancing to the 10th inning is correct under regulation-game rules.
- The mock verifies inning progression, side switching, score accumulation, inning-score buckets, total outs, and batter-position advancement under the app's current simplified model.

## Not modeled yet

- Automatic game-ending conditions when the home team leads after the top of the ninth.
- Walk-off endings in the bottom of the ninth or extras.
- The automatic runner on second in MLB regular-season extra innings.
- Batter reaching on walk, hit by pitch, dropped third strike, hit, error, fielder's choice, sacrifice, or runner/base-state advancement.
- Runs disallowed by force outs, appeals, missed bases, or third-out timing exceptions.
