import { ThemeColors } from '../../constants/scoreboard-themes';

interface ScoreboardLayoutProps {
  themeColors: ThemeColors;
  visitorTeamName: string;
  homeTeamName: string;
  fullGameState: any;
  balls: number;
  strikes: number;
  outs: number;
  runs: number;
  currentBatterNumber: string | number;
  isTablet: boolean;
  getInningScore: (team: 'visitor' | 'home', inningIndex: number) => number | string;
}

export default ScoreboardLayoutProps;

