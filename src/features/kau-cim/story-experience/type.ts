export type Phase = "video" | "slideshow" | "result";
export type Slide = Kaucim.Slide;

export interface Properties {
  video: string | number;
  verdict: string;
  slides: Slide[];
  summary: Pick<Kaucim.Summary, "title" | "powerChange">;
  showIntroVideo?: boolean;
  showResultPopup?: boolean;
  onResultDismiss: () => void;
}
