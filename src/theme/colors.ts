import { ThemeMode } from '@/types';

export type ThemeColorType = {
  theme: string;

  primary: string;
  primaryContainer: string;
  secondary: string;
  secondaryContainer: string;
  surface: string;
  surfaceVariant: string;
  background: string;
  error: string;
  errorContainer: string;

  onPrimary: string;
  onPrimaryContainer: string;
  onSecondary: string;
  onSecondaryContainer: string;
  onSurface: string;
  onSurfaceVariant: string;
  onSurfaceVariant1: string;
  onBackground: string;
  outline: string;
  neutralSurface: string;
  onCustom: string;
  onCustomVariant: string;

  surface1: string;
  surface2: string;
  surface3: string;
  surface4: string;
  surface5: string;

  transparent1: string;
  transparent2: string;
  transparent3: string;
  transparent4: string;
  transparent5: string;
  neutral: string;
  neutralVariant: string;
  transparentInverse1: string;
  transparentInverse2: string;
  transparentInverse3: string;
  transparentInverse4: string;
  transparentInverse5: string;
  neutralInverse: string;
  neutralVariantInverse: string;
};

// Exported from: https://appschemer.com/palette?mainColor=%237728dc&colorHarmony=tetradic&options=0145550010
const COLOR_SCHEME = {
  accent: {
    '100': '#e5d3fd',
    '200': '#c9a4f9',
    '300': '#ae78f2',
    '400': '#924fe8',
    '500': '#7728dc',
    '600': '#6022af',
    '700': '#491e80',
    '800': '#321754',
    '900': '#1a0d2b',
  },
  secondary: {
    '100': '#fbd3fd',
    '200': '#f4a4f9',
    '300': '#ea78f2',
    '400': '#df4fe8',
    '500': '#d128dc',
    '600': '#a622af',
    '700': '#7a1e80',
    '800': '#501754',
    '900': '#290d2b',
  },
  otherHarmonyColors: [
    {
      '100': '#fdfbd3',
      '200': '#f9f4a4',
      '300': '#f2ea78',
      '400': '#e8df4f',
      '500': '#dcd128',
      '600': '#afa622',
      '700': '#807a1e',
      '800': '#545017',
      '900': '#2b290d',
    },
    {
      '100': '#d5fdd3',
      '200': '#a9f9a4',
      '300': '#80f278',
      '400': '#58e84f',
      '500': '#33dc28',
      '600': '#2baf22',
      '700': '#24801e',
      '800': '#1b5417',
      '900': '#0f2b0d',
    },
    {
      '100': '#d3d5fd',
      '200': '#a4a9f9',
      '300': '#7880f2',
      '400': '#4f58e8',
      '500': '#2833dc',
      '600': '#222baf',
      '700': '#1e2480',
      '800': '#171b54',
      '900': '#0d0f2b',
    },
  ],
  text: {
    '100': '#fcfcfd',
    '200': '#eae8ee',
    '300': '#ccc9cf',
    '400': '#a5a4a8',
    '500': '#7f7c83',
    '600': '#65616b',
    '700': '#4c4554',
    '800': '#322b3b',
    '900': '#19141f',
  },
  background: {
    '100': '#fcfcfd',
    '200': '#e8e8ee',
    '300': '#c9cacf',
    '400': '#a4a4a8',
    '500': '#7c7d83',
    '600': '#61626b',
    '700': '#454654',
    '800': '#2b2c3b',
    '900': '#14151f',
  },
  disabled: {
    '100': '#fcfcfc',
    '200': '#ebebeb',
    '300': '#cccccc',
    '400': '#a6a6a6',
    '500': '#808080',
    '600': '#666666',
    '700': '#4d4d4d',
    '800': '#333333',
    '900': '#1a1a1a',
  },
  divider: {
    '100': '#fcfcfd',
    '200': '#eae8ee',
    '300': '#ccc9cf',
    '400': '#a5a4a8',
    '500': '#7f7c83',
    '600': '#65616b',
    '700': '#4c4554',
    '800': '#322b3b',
    '900': '#19141f',
  },
  icon: {
    '100': '#fbd3fd',
    '200': '#f4a4f9',
    '300': '#ea78f2',
    '400': '#df4fe8',
    '500': '#d128dc',
    '600': '#a622af',
    '700': '#7a1e80',
    '800': '#501754',
    '900': '#290d2b',
  },
  semantic: {
    info: {
      '100': '#9e9eff',
      '200': '#6d6dfd',
      '300': '#4040f7',
      '400': '#1515ef',
      '500': '#1313be',
      '600': '#12128c',
      '700': '#0f0f5c',
      '800': '#09092f',
      '900': '#010104',
    },
    negative: {
      '100': '#ff9e9e',
      '200': '#fd6d6d',
      '300': '#f74040',
      '400': '#ef1515',
      '500': '#be1313',
      '600': '#8c1212',
      '700': '#5c0f0f',
      '800': '#2f0909',
      '900': '#040101',
    },
    positive: {
      '100': '#9eff9e',
      '200': '#6dfd6d',
      '300': '#40f740',
      '400': '#15ef15',
      '500': '#13be13',
      '600': '#128c12',
      '700': '#0f5c0f',
      '800': '#092f09',
      '900': '#010401',
    },
    special: {
      '100': '#ff9eff',
      '200': '#fd6dfd',
      '300': '#f740f7',
      '400': '#ef15ef',
      '500': '#be13be',
      '600': '#8c128c',
      '700': '#5c0f5c',
      '800': '#2f092f',
      '900': '#040104',
    },
    warning: {
      '100': '#ffe7b7',
      '200': '#fdd586',
      '300': '#f8c358',
      '400': '#f0af2d',
      '500': '#d59515',
      '600': '#a27315',
      '700': '#725212',
      '800': '#44320d',
      '900': '#181206',
    },
  },
  black: '#19141f',
  white: '#ffffff',
  referencePalette: {
    main: {
      '100': '#e5d3fd',
      '200': '#c9a4f9',
      '300': '#ae78f2',
      '400': '#924fe8',
      '500': '#7728dc',
      '600': '#6022af',
      '700': '#491e80',
      '800': '#321754',
      '900': '#1a0d2b',
    },
    harmony: [
      {
        '100': '#e5d3fd',
        '200': '#c9a4f9',
        '300': '#ae78f2',
        '400': '#924fe8',
        '500': '#7728dc',
        '600': '#6022af',
        '700': '#491e80',
        '800': '#321754',
        '900': '#1a0d2b',
      },
      {
        '100': '#fbd3fd',
        '200': '#f4a4f9',
        '300': '#ea78f2',
        '400': '#df4fe8',
        '500': '#d128dc',
        '600': '#a622af',
        '700': '#7a1e80',
        '800': '#501754',
        '900': '#290d2b',
      },
      {
        '100': '#fdfbd3',
        '200': '#f9f4a4',
        '300': '#f2ea78',
        '400': '#e8df4f',
        '500': '#dcd128',
        '600': '#afa622',
        '700': '#807a1e',
        '800': '#545017',
        '900': '#2b290d',
      },
      {
        '100': '#d5fdd3',
        '200': '#a9f9a4',
        '300': '#80f278',
        '400': '#58e84f',
        '500': '#33dc28',
        '600': '#2baf22',
        '700': '#24801e',
        '800': '#1b5417',
        '900': '#0f2b0d',
      },
      {
        '100': '#d3d5fd',
        '200': '#a4a9f9',
        '300': '#7880f2',
        '400': '#4f58e8',
        '500': '#2833dc',
        '600': '#222baf',
        '700': '#1e2480',
        '800': '#171b54',
        '900': '#0d0f2b',
      },
    ],
    neutrals: [
      {
        '100': '#fcfcfd',
        '200': '#eae8ee',
        '300': '#ccc9cf',
        '400': '#a5a4a8',
        '500': '#7f7c83',
        '600': '#65616b',
        '700': '#4c4554',
        '800': '#322b3b',
        '900': '#19141f',
      },
      {
        '100': '#fdfcfd',
        '200': '#ede8ee',
        '300': '#cec9cf',
        '400': '#a8a4a8',
        '500': '#827c83',
        '600': '#6a616b',
        '700': '#534554',
        '800': '#3a2b3b',
        '900': '#1e141f',
      },
      {
        '100': '#fdfdfc',
        '200': '#eeede8',
        '300': '#cfcec9',
        '400': '#a8a8a4',
        '500': '#83827c',
        '600': '#6b6a61',
        '700': '#545345',
        '800': '#3b3a2b',
        '900': '#1f1e14',
      },
      {
        '100': '#fcfdfc',
        '200': '#e8eee8',
        '300': '#cacfc9',
        '400': '#a4a8a4',
        '500': '#7d837c',
        '600': '#626b61',
        '700': '#465445',
        '800': '#2c3b2b',
        '900': '#151f14',
      },
      {
        '100': '#fcfcfd',
        '200': '#e8e8ee',
        '300': '#c9cacf',
        '400': '#a4a4a8',
        '500': '#7c7d83',
        '600': '#61626b',
        '700': '#454654',
        '800': '#2b2c3b',
        '900': '#14151f',
      },
    ],
  },
};

const COLOR_VARIATIONS = {
  mainColor: {
    main: 500,
    lighter: 400,
    darker: 600,
  },
  neutrals: {
    light1: 100,
    light2: 200,
    lighter: 400,
    main: 500,
    darker: 600,
    dark2: 800,
    dark1: 900,
  },
  semantic: {
    main: 500,
    lighter: 300,
    darker: 700,
  },
};

const LIGHT_COLOR_SCHEME: ThemeColorType = {
  theme: 'light',

  primary: COLOR_SCHEME.accent['500'],
  primaryContainer: COLOR_SCHEME.accent['100'],
  secondary: COLOR_SCHEME.secondary['500'],
  secondaryContainer: COLOR_SCHEME.secondary['100'],
  surface: COLOR_SCHEME.background['100'],
  surfaceVariant: COLOR_SCHEME.background['200'],
  background: COLOR_SCHEME.background['100'],
  error: COLOR_SCHEME.semantic.negative['500'],
  errorContainer: COLOR_SCHEME.semantic.negative['100'],
  onPrimary: COLOR_SCHEME.white,
  onPrimaryContainer: COLOR_SCHEME.black,
  onSecondary: COLOR_SCHEME.white,
  onSecondaryContainer: COLOR_SCHEME.black,
  onSurface: COLOR_SCHEME.text['900'],
  onSurfaceVariant: COLOR_SCHEME.text['600'],
  onSurfaceVariant1: COLOR_SCHEME.text['300'],
  onBackground: COLOR_SCHEME.text['900'],
  outline: COLOR_SCHEME.divider['500'],
  neutralSurface: '#FFFFFF99',
  onCustom: '#FFFFFF',
  onCustomVariant: '#FFFFFFB3',

  surface1: '#F2F5F9',
  surface2: '#EDF0F6',
  surface3: '#E8ECF4',
  surface4: '#E6EAF3',
  surface5: '#E3E7F1',

  transparent1: '#FFFFFF14',
  transparent2: '#FFFFFF29',
  transparent3: '#FFFFFF8F',
  transparent4: '#FFFFFFB8',
  transparent5: '#FFFFFFF5',
  neutral: '#FFFFFF',
  neutralVariant: '#FFFFFFB8',
  transparentInverse1: '#0000000A',
  transparentInverse2: '#00000014',
  transparentInverse3: '#00000066',
  transparentInverse4: '#000000B8',
  transparentInverse5: '#000000E0',
  neutralInverse: '#121212',
  neutralVariantInverse: '#5C5C5C',
};

const DARK_COLOR_SCHEME: ThemeColorType = {
  theme: 'dark',

  primary: COLOR_SCHEME.accent['300'],
  primaryContainer: COLOR_SCHEME.accent['800'],
  secondary: COLOR_SCHEME.secondary['300'],
  secondaryContainer: COLOR_SCHEME.secondary['800'],
  surface: COLOR_SCHEME.background['900'],
  surfaceVariant: COLOR_SCHEME.background['800'],
  background: COLOR_SCHEME.background['900'],
  error: COLOR_SCHEME.semantic.negative['100'],
  errorContainer: COLOR_SCHEME.semantic.negative['800'],

  onPrimary: COLOR_SCHEME.text['900'],
  onPrimaryContainer: COLOR_SCHEME.text['200'],
  onSecondary: COLOR_SCHEME.referencePalette.neutrals[1]['800'],
  onSecondaryContainer: COLOR_SCHEME.referencePalette.neutrals[1]['200'],
  onSurface: COLOR_SCHEME.text['100'],
  onSurfaceVariant: COLOR_SCHEME.text['600'],
  onSurfaceVariant1: COLOR_SCHEME.text['300'],
  onBackground: COLOR_SCHEME.text['100'],
  outline: COLOR_SCHEME.divider['600'],
  neutralSurface: '#FFFFFF14',
  onCustom: '#FFFFFF',
  onCustomVariant: '#FFFFFFB3',

  surface1: '#23242A',
  surface2: '#272A31',
  surface3: '#2C2F37',
  surface4: '#2E3039',
  surface5: '#31343E',

  transparent1: '#FFFFFF0A',
  transparent2: '#FFFFFF1F',
  transparent3: '#FFFFFF29',
  transparent4: '#FFFFFF7A',
  transparent5: '#FFFFFFB8',
  neutral: '#121212',
  neutralVariant: '#5C5C5C',
  transparentInverse1: '#0000000A',
  transparentInverse2: '#00000014',
  transparentInverse3: '#00000029',
  transparentInverse4: '#000000B8',
  transparentInverse5: '#000000F5',
  neutralInverse: '#FFFFFFE0',
  neutralVariantInverse: '#FFFFFFA3',
};

const colors: Record<ThemeMode, ThemeColorType> = {
  system: {
    ...LIGHT_COLOR_SCHEME,
    theme: 'system',
  },
  light: LIGHT_COLOR_SCHEME,
  dark: DARK_COLOR_SCHEME,
};

export default colors;
