export type Phase = "video" | "slideshow" | "result";
export type Slide = Kaucim.Slide;

export interface Properties {
  video: string | number;
  slides: Slide[];
  summary: Pick<Kaucim.Summary, "title" | "powerChange">;
  onResultDismiss: () => void;
}
