export type PdfDims = { width: number; height: number };

export type Placement = {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const computeAutoPlacement = (dims: PdfDims): Placement => {
  const margin = Math.max(dims.width * 0.08, 32);
  const blockWidth = Math.min(dims.width * 0.45, 320);
  const blockHeight = 140;

  const defaultX = (dims.width - blockWidth) / 2;
  const defaultY = margin; // bottom-center goal

  return {
    page: 1,
    x: clamp(defaultX, margin, dims.width - margin - blockWidth),
    y: clamp(defaultY, margin, dims.height - margin - blockHeight),
    width: blockWidth,
    height: blockHeight,
  };
};

export const scalePlacement = (placement: Placement, scale: number): Placement => ({
  ...placement,
  x: placement.x * scale,
  y: placement.y * scale,
  width: placement.width * scale,
  height: placement.height * scale,
});

export const normalizePlacement = (placement: Placement, scale: number): Placement => ({
  ...placement,
  x: placement.x / scale,
  y: placement.y / scale,
  width: placement.width / scale,
  height: placement.height / scale,
});

export const movePlacement = (placement: Placement, dx: number, dy: number, dims: PdfDims): Placement => {
  const next = { ...placement, x: placement.x + dx, y: placement.y + dy };
  next.x = clamp(next.x, 0, dims.width - next.width);
  next.y = clamp(next.y, 0, dims.height - next.height);
  return next;
};
