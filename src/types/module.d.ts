type VideoModule = any;
type ImageModule = any;

declare module "*.png" {
  const source: ImageModule;
  export default source;
}

declare module "*.mp4" {
  const source: VideoModule;
  export default source;
}

declare module "*.webm" {
  const source: VideoModule;
  export default source;
}
