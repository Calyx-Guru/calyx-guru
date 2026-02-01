import { SizeType } from '@/types';

export type SpacingType = {
  layout: Record<SizeType, number>;
  text: Record<SizeType, number>;
  dense: Record<SizeType, number>;
  buttonWidth: Record<SizeType, number>;
  buttonHeight: Record<SizeType, number>;
};

export const spacing: SpacingType = {
  layout: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 40,
    '3xl': 48,
  },

  text: {
    xs: 6,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 30,
    '3xl': 36,
  },

  dense: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
  },

  buttonWidth: {
    xs: 48,
    sm: 60,
    md: 72,
    lg: 84,
    xl: 96,
    '2xl': 112,
    '3xl': 128,
  },

  buttonHeight: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 56,
    '2xl': 64,
    '3xl': 72,
  },
};

export const baseSpacing = spacing;
