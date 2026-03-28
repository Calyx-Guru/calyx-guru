declare module "*.png" {
  const source: ImageModule;
  export default source;
}

declare module "*.mp4" {
  const source: VideoModule;
  export default source;
}
