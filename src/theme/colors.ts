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
  text: string;
  astroCard: string;
  overlay: string;
  buttonBg: string;
  primary: string;
  secondary: string;
  success: string;
  info: string;
  warning: string;
  danger: string;
  light: string;
  dark: string;
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
    text: 'black',
    astroCard: '#532929',
    overlay: 'rgba(255, 255, 255, 1)',
    buttonBg: '#7728DC',
    primary: '#7728DC',
    secondary: '#FF4081',
    info: '#1976D2',
    warning: '#FBC02D',
    danger: '#D32F2F',
    success: '#388E3C',
    light: '#F5F5F5',
    dark: '#212121',
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
    text: 'black',
    astroCard: '#532929',
    overlay: 'rgba(255, 255, 255, 1)',
    buttonBg: '#7728DC',
    primary: '#7728DC',
    secondary: '#FF4081',
    info: '#1976D2',
    warning: '#FBC02D',
    danger: '#D32F2F',
    success: '#388E3C',
    light: '#F5F5F5',
    dark: '#212121',
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
    text: 'white',
    astroCard: '#F1F1F1',
    buttonBg: '#7728DC',
    primary: '#7728DC',
    secondary: '#FF4081',
    info: '#1976D2',
    warning: '#FBC02D',
    danger: '#D32F2F',
    success: '#388E3C',
    light: '#F5F5F5',
    dark: '#212121',
  },
};

export default colors;
