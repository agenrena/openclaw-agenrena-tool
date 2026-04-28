import { getImageMetadata } from "openclaw/plugin-sdk/media-runtime";
import { loadImageSourceWithOptions } from "./image-source.js";
import type { AddStickerImageInput, StickerValidationResult } from "./types.js";

const STICKER_DIMENSION = 512;
const MAX_STICKER_BYTES = 500 * 1024;

async function loadSourceImage(input: AddStickerImageInput): Promise<{
  buffer: Buffer;
  contentType: string;
  fileName?: string;
}> {
  return await loadSourceImageWithOptions(input, {});
}

async function loadSourceImageWithOptions(
  input: AddStickerImageInput,
  options: {
    workspaceDir?: string;
  },
): Promise<{
  buffer: Buffer;
  contentType: string;
  fileName?: string;
}> {
  return await loadImageSourceWithOptions(input, {
    context: "a sticker",
    maxBytes: 8 * 1024 * 1024,
    workspaceDir: options.workspaceDir,
  });
}

async function normalizeWithSharp(buffer: Buffer): Promise<{
  buffer: Buffer;
  width: number;
  height: number;
}> {
  const sharpModule = await import("sharp");
  const sharp = sharpModule.default;
  const colorDepthCandidates = [256, 128, 64, 32, 16];
  let smallest: Buffer | null = null;

  for (const colors of colorDepthCandidates) {
    const candidate = await sharp(buffer)
      .rotate()
      .resize({
        width: STICKER_DIMENSION,
        height: STICKER_DIMENSION,
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({
        compressionLevel: 9,
        palette: true,
        quality: 100,
        effort: 10,
        colors,
      })
      .toBuffer();

    if (!smallest || candidate.length < smallest.length) {
      smallest = candidate;
    }
    if (candidate.length <= MAX_STICKER_BYTES) {
      return {
        buffer: candidate,
        width: STICKER_DIMENSION,
        height: STICKER_DIMENSION,
      };
    }
  }

  if (!smallest) {
    throw new Error("Failed to normalize sticker image.");
  }

  return {
    buffer: smallest,
    width: STICKER_DIMENSION,
    height: STICKER_DIMENSION,
  };
}

export async function prepareStickerImage(input: AddStickerImageInput): Promise<{
  buffer: Buffer;
  validation: StickerValidationResult;
}> {
  return await prepareStickerImageWithOptions(input, {});
}

export async function prepareStickerImageWithOptions(
  input: AddStickerImageInput,
  options: {
    workspaceDir?: string;
  },
): Promise<{
  buffer: Buffer;
  validation: StickerValidationResult;
}> {
  const loaded = await loadSourceImageWithOptions(input, options);
  const inputBytes = loaded.buffer.length;

  try {
    const normalized = await normalizeWithSharp(loaded.buffer);
    if (normalized.buffer.length > MAX_STICKER_BYTES) {
      throw new Error(
        `Sticker image is still too large after normalization (${normalized.buffer.length} bytes > ${MAX_STICKER_BYTES} bytes).`,
      );
    }
    return {
      buffer: normalized.buffer,
      validation: {
        content_type: "image/png",
        input_bytes: inputBytes,
        output_bytes: normalized.buffer.length,
        width: normalized.width,
        height: normalized.height,
      },
    };
  } catch (error) {
    const meta = await getImageMetadata(loaded.buffer);
    const isPng =
      loaded.contentType === "image/png" || loaded.fileName?.toLowerCase().endsWith(".png");
    if (
      isPng &&
      meta?.width === STICKER_DIMENSION &&
      meta?.height === STICKER_DIMENSION &&
      loaded.buffer.length <= MAX_STICKER_BYTES
    ) {
      return {
        buffer: loaded.buffer,
        validation: {
          content_type: "image/png",
          input_bytes: inputBytes,
          output_bytes: loaded.buffer.length,
          width: meta.width,
          height: meta.height,
        },
      };
    }

    const fallbackReason =
      error instanceof Error ? error.message : "Unknown sticker normalization failure.";
    throw new Error(
      `Sticker image must end up as a 512x512 PNG under 500KB. ${fallbackReason}`,
    );
  }
}
