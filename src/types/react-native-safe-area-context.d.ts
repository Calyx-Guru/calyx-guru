declare module "react-native-safe-area-context" {
  import type { ComponentType, ReactNode } from "react";
  import type { ViewProps } from "react-native";

  export type Edge = "top" | "right" | "bottom" | "left";

  export interface EdgeInsets {
    top: number;
    right: number;
    bottom: number;
    left: number;
  }

  export interface SafeAreaProviderProps extends ViewProps {
    children?: ReactNode;
    initialMetrics?: {
      frame: { x: number; y: number; width: number; height: number };
      insets: EdgeInsets;
    } | null;
  }

  export interface SafeAreaViewProps extends ViewProps {
    children?: ReactNode;
    edges?: readonly Edge[];
  }

  export const SafeAreaProvider: ComponentType<SafeAreaProviderProps>;
  export const SafeAreaView: ComponentType<SafeAreaViewProps>;
  export function useSafeAreaInsets(): EdgeInsets;
}
