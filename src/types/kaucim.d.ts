declare namespace Kaucim {
  type Summary = {
    image: ImageModule;
    title: string;
    description: string;
    powerChange: number;
  };

  interface Slide {
    image: ImageModule;
    text: string;
    textParams?: Record<string, string | number> | null;
  }
}
