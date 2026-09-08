declare module "perspective-transform" {
  export default function perspectiveTransform(source: number[], destination: number[]): {
    transform(x: number, y: number): [number, number];
    transformInverse(x: number, y: number): [number, number];
  };
}
