/**
 * Scoreboard Theme Configurations
 * Based on various professional scoreboard styles
 */

export type ScoreboardTheme = 
  | 'classic-green'
  | 'blue-digital'
  | 'red-led'
  | 'dark-modern'
  | 'varsity-blue';

export interface ThemeColors {
  background: string;
  primaryText: string;
  secondaryText: string;
  accentColor: string;
  ballIndicator: string;
  strikeIndicator: string;
  outIndicator: string;
  scoreGridBackground: string;
  scoreGridText: string;
  headerBackground: string;
  activeInningHighlight?: string;
}

export interface ScoreboardThemeConfig {
  id: ScoreboardTheme;
  name: string;
  description: string;
  colors: ThemeColors;
}

export const SCOREBOARD_THEMES: Record<ScoreboardTheme, ScoreboardThemeConfig> = {
  'classic-green': {
    id: 'classic-green',
    name: 'Classic Green',
    description: 'Traditional outfield scoreboard style',
    colors: {
      background: '#2d5016',
      primaryText: '#FF3B00',
      secondaryText: '#FFFFFF',
      accentColor: '#FFD700',
      ballIndicator: '#FFD700',
      strikeIndicator: '#FFD700',
      outIndicator: '#FFD700',
      scoreGridBackground: '#1a3309',
      scoreGridText: '#FF3B00',
      headerBackground: '#234010',
    },
  },
  'blue-digital': {
    id: 'blue-digital',
    name: 'Blue Digital',
    description: 'Modern blue digital display',
    colors: {
      background: '#1e3a5f',
      primaryText: '#FF3B00',
      secondaryText: '#FFFFFF',
      accentColor: '#4A90E2',
      ballIndicator: '#FF3B00',
      strikeIndicator: '#FF3B00',
      outIndicator: '#FF3B00',
      scoreGridBackground: '#162f4d',
      scoreGridText: '#FF3B00',
      headerBackground: '#0f1f35',
    },
  },
  'red-led': {
    id: 'red-led',
    name: 'Red LED',
    description: 'Classic LED red display',
    colors: {
      background: '#2a0a0a',
      primaryText: '#FFFFFF',
      secondaryText: '#FF6666',
      accentColor: '#FF0000',
      ballIndicator: '#FF0000',
      strikeIndicator: '#FF0000',
      outIndicator: '#FF0000',
      scoreGridBackground: '#1a0505',
      scoreGridText: '#FF0000',
      headerBackground: '#0f0303',
    },
  },
  'dark-modern': {
    id: 'dark-modern',
    name: 'Dark Modern',
    description: 'Sleek modern dark theme',
    colors: {
      background: '#1a1a1a',
      primaryText: '#00FF00',
      secondaryText: '#FFFFFF',
      accentColor: '#00FF00',
      ballIndicator: '#00FF00',
      strikeIndicator: '#FFFF00',
      outIndicator: '#FF0000',
      scoreGridBackground: '#0f0f0f',
      scoreGridText: '#00FF00',
      headerBackground: '#000000',
      activeInningHighlight: '#333333',
    },
  },
  'varsity-blue': {
    id: 'varsity-blue',
    name: 'Varsity Blue',
    description: 'Classic varsity scoreboard style',
    colors: {
      background: '#003366',
      primaryText: '#FF3B00',
      secondaryText: '#FFFFFF',
      accentColor: '#FFD700',
      ballIndicator: '#FFD700',
      strikeIndicator: '#FFD700',
      outIndicator: '#FFD700',
      scoreGridBackground: '#002147',
      scoreGridText: '#FF3B00',
      headerBackground: '#001a33',
    },
  },
};

export const DEFAULT_THEME: ScoreboardTheme = 'classic-green';

