declare module "*.svelte" {
  import type { ComponentType } from "svelte";
  const component: ComponentType;
  export default component;
}

declare module "@techstark/opencv-js" {
  const cv: any;
  export default cv;
}
