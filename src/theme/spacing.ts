export type SpacingType = {
  layout: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  text: {
    sm: number;
    md: number;
    lg: number;
  };

  dense: {
    xs: number;
    sm: number;
    md: number;
  };
};

export const spacing: SpacingType = {
  layout: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  text: {
    sm: 8,
    md: 12,
    lg: 16,
  },

  dense: {
    xs: 2,
    sm: 4,
    md: 8,
  },
};

export const baseSpacing = spacing;
