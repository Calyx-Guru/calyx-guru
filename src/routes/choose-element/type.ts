export type { DateTimePickerEvent } from "@react-native-community/datetimepicker";

export type Stage =
  | "choose-element"
  | "choose-birthday"
  | "confirm-element"
  | "hatching-sequence"
  | "break-sequence";

export interface Properties {
  dateLabel: string;
}
