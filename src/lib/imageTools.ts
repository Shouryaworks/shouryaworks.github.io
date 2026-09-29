/**
 * Client-side image handling for the admin image library.
 *
 * Uploads are resized and re-encoded to WebP in the browser before they are
 * sent anywhere, which keeps the request small, gives every upload a real 1x/2x
 * pair for `srcset`, and means the public site never has to download a 6 MB
 * original. Nothing is upscaled: if the source is already smaller than the
 * target width the original pixels are kept.
 */

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

const ACCEPTED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/jpg",
];

export const ACCEPT_ATTRIBUTE = "image/jpeg,image/png,image/webp,image/avif,image/gif";

export type OptimizeResult = {
  /** 1x variant */
  one: Blob;
  /** 2x variant — only produced when it is genuinely larger than the 1x one */
  two: Blob | null;
  width: number;
  height: number;
  width2x: number;
  bytes: number;
  format: string;
  /** set when the source could not be re-encoded and was passed through */
  passthrough?: boolean;
};

export function validateImageFile(file: File): { ok: true } | { ok: false; error: string } {
  if (!file.type || !ACCEPTED.includes(file.type.toLowerCase())) {
    return {
      ok: false,
      error: `“${file.name}” is not a supported image. Use JPG, PNG, WebP, AVIF or GIF.`,
    };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `“${file.name}” is ${Math.round(file.size / 1024 / 1024)} MB. The limit is 20 MB — resize it or export it as WebP first.`,
    };
  }
  return { ok: true };
}

type Drawable = ImageBitmap | HTMLImageElement;

async function decode(file: Blob): Promise<Drawable> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      /* Safari and older Chrome fall through to the <img> path. */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("This file could not be decoded as an image."));
      image.src = url;
    });
    return image;
  } finally {
    // The bitmap is already decoded by the time onload resolves.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

const sourceSize = (image: Drawable) => ({
  width: "naturalWidth" in image ? image.naturalWidth : image.width,
  height: "naturalHeight" in image ? image.naturalHeight : image.height,
});

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      "image/webp",
      quality,
    );
  });
}

async function encode(
  image: Drawable,
  width: number,
  height: number,
  quality: number,
): Promise<Blob | null> {
  if (width < 1 || height < 1) return null;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image as CanvasImageSource, 0, 0, width, height);
  return canvasToBlob(canvas, quality);
}

export type OptimizeOptions = {
  /** widest the 1x variant may be */
  maxWidth?: number;
  /** widest the 2x variant may be */
  maxWidth2x?: number;
  quality?: number;
};

export async function optimizeImage(
  file: File,
  { maxWidth = 1600, maxWidth2x = 2400, quality = 0.82 }: OptimizeOptions = {},
): Promise<OptimizeResult> {
  const image = await decode(file);
  const source = sourceSize(image);
  if (!source.width || !source.height) {
    throw new Error("That image has no readable dimensions.");
  }

  const scale1 = Math.min(1, maxWidth / source.width);
  const width = Math.max(1, Math.round(source.width * scale1));
  const height = Math.max(1, Math.round(source.height * scale1));

  const target2x = Math.min(maxWidth2x, source.width * 2);
  const scale2 = Math.min(1, target2x / source.width);
  const width2x = Math.max(1, Math.round(source.width * scale2));
  const height2x = Math.max(1, Math.round(source.height * scale2));

  const one = (await encode(image, width, height, quality)) ?? file;
  const passthrough = one === file;

  let two: Blob | null = null;
  // A 2x variant only helps when it really carries more pixels than the 1x one.
  if (width2x > width * 1.2) {
    two = (await encode(image, width2x, height2x, Math.max(0.7, quality - 0.04))) ?? null;
  }

  if ("close" in image && typeof image.close === "function") image.close();

  return {
    one,
    two,
    width,
    height,
    width2x: two ? width2x : width,
    bytes: one.size + (two?.size ?? 0),
    format: one.type || file.type,
    passthrough,
  };
}

/** Reads the real size of an already-hosted image so the library stays honest. */
export async function probeImage(
  src: string,
): Promise<{ width: number; height: number; bytes: number } | null> {
  try {
    const response = await fetch(src);
    if (!response.ok) return null;
    const bytes = Number(response.headers.get("content-length") ?? 0);
    const bitmap = await createImageBitmap(await response.blob());
    const result = { width: bitmap.width, height: bitmap.height, bytes };
    bitmap.close();
    return result;
  } catch {
    return null;
  }
}
