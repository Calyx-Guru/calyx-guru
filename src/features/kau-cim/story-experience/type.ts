export type Phase = "video" | "slideshow" | "result";
export type Slide = Kaucim.Slide;

export interface Properties {
  video: string | number;
  verdict: string;
  slides: Slide[];
  summary: Pick<Kaucim.Summary, "title" | "powerChange">;
  onResultDismiss: () => void;
}
