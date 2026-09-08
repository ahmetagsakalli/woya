import { z } from "zod";

export const pointSchema = z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) });
export type Point = z.infer<typeof pointSchema>;
export type Quad = [Point, Point, Point, Point];

export function validQuad(q: Quad) {
  // Clockwise convex corners, starting at top-left; reject crossed or tiny selections.
  return q.every((a, i) => {
    const b = q[(i + 1) % 4], c = q[(i + 2) % 4];
    return (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x) > 0.0004;
  });
}
export const cropRegionSchema = z.object({
  quad: z.tuple([pointSchema, pointSchema, pointSchema, pointSchema]).refine(validQuad, "Köşeler kesişmemeli; alan çok küçük olmamalı."),
  aspect: z.number().min(0.2).max(5),
  mask: z.enum(["rectangle", "ellipse"]),
}).refine((v) => v.mask !== "ellipse" || v.aspect === 1, "Yuvarlak kesim için oran 1 : 1 olmalı.");
export type CropRegion = z.infer<typeof cropRegionSchema>;
export const partNames = { left: "Sol tablo", center: "Saat", right: "Sağ tablo" } as const;
export type CropPart = keyof typeof partNames;
export const cropRegionsSchema = z.object({
  left: cropRegionSchema.optional(),
  center: cropRegionSchema,
  right: cropRegionSchema.optional(),
}).refine((v) => Boolean(v.left) === Boolean(v.right), "İki tabloyu da seçin.");
export type CropRegions = z.infer<typeof cropRegionsSchema>;

export function defaultRegions(set: boolean): CropRegions {
  const region = (left: number, right: number, aspect: number): CropRegion => ({
    quad: [{ x: left, y: 0.15 }, { x: right, y: 0.15 }, { x: right, y: 0.85 }, { x: left, y: 0.85 }],
    aspect, mask: "rectangle",
  });
  return set
    ? { left: region(0.06, 0.3, 5 / 7), center: region(0.35, 0.65, 1), right: region(0.7, 0.94, 5 / 7) }
    : { center: region(0.1, 0.9, 1) };
}
