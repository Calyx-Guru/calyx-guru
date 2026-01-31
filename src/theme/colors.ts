import { ThemeMode } from '@/types';

export type ThemeColorType = {
  theme: string;
  color: string;
  background: string;
  white: string;
  input: string;
  border: string;
  grey: string;
  tab: string;
  astroCard: string;
  overlay: string;
};

const colors: Record<ThemeMode, ThemeColorType> = {
  system: {
    theme: 'system',
    color: 'black',
    background: '#FFF',
    white: 'white',
    input: 'transparent',
    border: 'black',
    grey: 'grey',
    tab: 'white',
    astroCard: '#532929',
    overlay: 'rgba(255, 255, 255, 1)',
  },
  light: {
    theme: 'light',
    color: 'black',
    background: '#FFF',
    white: 'white',
    input: 'transparent',
    border: 'black',
    grey: 'grey',
    tab: 'white',
    astroCard: '#532929',
    overlay: 'rgba(255, 255, 255, 1)',
  },
  dark: {
    theme: 'dark',
    color: 'white',
    white: 'white',
    grey: 'grey',
    background: '#0D114E',
    overlay: 'rgba(255, 255, 255, 1)',
    input: 'white',
    border: 'white',
    tab: '#0D114E',
    astroCard: '#F1F1F1',
  },
};

export default colors;
