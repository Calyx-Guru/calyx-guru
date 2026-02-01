import { ThemeMode } from '@/types';

export type ColorType =
  | 'primary'
  | 'secondary'
  | 'disabled'
  | 'contrast'
  | 'link'
  | 'error'
  | 'warning'
  | 'success';

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
  buttonBg: string;
  primary: string;
  secondary: string;
  disabled: string;
  contrast: string;
  link: string;
  error: string;
  warning: string;
  success: string;
};

const colors: Record<ThemeMode, ThemeColorType> = {
  system: {
    theme: 'system',
    color: 'black',
    background: '#0D114E',
    white: 'white',
    input: 'transparent',
    border: 'black',
    grey: 'grey',
    tab: 'white',
    astroCard: '#532929',
    overlay: 'rgba(255, 255, 255, 1)',
    buttonBg: '#7728DC',
    primary: '#7728DC',
    secondary: '#FF4081',
    disabled: '#BDBDBD',
    contrast: '#000000',
    link: '#1E88E5',
    error: '#D32F2F',
    warning: '#FBC02D',
    success: '#388E3C',
  },
  light: {
    theme: 'light',
    color: 'black',
    background: '#0D114E',
    white: 'white',
    input: 'transparent',
    border: 'black',
    grey: 'grey',
    tab: 'white',
    astroCard: '#532929',
    overlay: 'rgba(255, 255, 255, 1)',
    buttonBg: '#7728DC',
    primary: '#7728DC',
    secondary: '#FF4081',
    disabled: '#BDBDBD',
    contrast: '#000000',
    link: '#1E88E5',
    error: '#D32F2F',
    warning: '#FBC02D',
    success: '#388E3C',
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
    buttonBg: '#7728DC',
    primary: '#F1F1F1',
    secondary: '#FF4081',
    disabled: '#555555',
    contrast: '#FFFFFF',
    link: '#64B5F6',
    error: '#EF9A9A',
    warning: '#FFF59D',
    success: '#A5D6A7',
  },
};

export default colors;
