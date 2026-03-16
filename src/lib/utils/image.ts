import { MAX_IMAGE_DIMENSION, IMAGE_QUALITY } from "@/lib/constants";

const QUALITY = IMAGE_QUALITY / 100; // Canvas API uses 0-1 range

/**
 * Check if a file is HEIC/HEIF based on type or extension.
 * Works on both client File objects and server-side File-like objects.
 */
export function isHeicFile(file: { type: string; name: string }): boolean {
  return file.type === "image/heic" || file.type === "image/heif"
    || file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif");
}

/**
 * Compresses a standard image file (JPEG/PNG/WebP) on the client.
 * HEIC/HEIF files are sent raw to the server for conversion via sharp.
 * - Resizes so the longest side is at most MAX_IMAGE_DIMENSION
 * - Re-encodes as JPEG at configured quality
 * Returns a Blob ready for upload.
 */
export async function compressImage(file: File): Promise<Blob> {
  // HEIC files can't be reliably decoded in the browser — send raw to server
  if (isHeicFile(file)) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Scale down if larger than max dimension
      if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
        if (width > height) {
          height = Math.round(height * (MAX_IMAGE_DIMENSION / width));
          width = MAX_IMAGE_DIMENSION;
        } else {
          width = Math.round(width * (MAX_IMAGE_DIMENSION / height));
          height = MAX_IMAGE_DIMENSION;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Image compression failed"));
          }
        },
        "image/jpeg",
        QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}
