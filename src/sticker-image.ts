import {
  getDefaultMediaLocalRoots,
  getImageMetadata,
} from "openclaw/plugin-sdk/media-runtime";
import { loadWebMedia } from "openclaw/plugin-sdk/web-media";
import type { AddStickerImageInput, StickerValidationResult } from "./types.js";

const STICKER_DIMENSION = 512;
const MAX_STICKER_BYTES = 500 * 1024;
const DATA_URL_RE = /^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,(.+)$/i;

function resolveSingleImageSource(input: AddStickerImageInput): {
  kind: "generic" | "url" | "data_url" | "base64";
  value: string;
} {
  const candidates = [
    input.image?.trim() ? { kind: "generic" as const, value: input.image.trim() } : null,
    input.image_url?.trim() ? { kind: "url" as const, value: input.image_url.trim() } : null,
    input.image_data_url?.trim()
      ? { kind: "data_url" as const, value: input.image_data_url.trim() }
      : null,
    input.image_base64?.trim()
      ? { kind: "base64" as const, value: input.image_base64.trim() }
      : null,
  ].filter(Boolean);

  if (candidates.length !== 1) {
    throw new Error(
      "Provide exactly one of image, image_url, image_data_url, or image_base64 when adding a sticker.",
    );
  }

  const source = candidates[0];
  if (!source) {
    throw new Error(
      "Provide exactly one of image, image_url, image_data_url, or image_base64 when adding a sticker.",
    );
  }
  return source;
}

function decodeDataUrl(value: string): { buffer: Buffer; contentType: string } {
  const match = DATA_URL_RE.exec(value.trim());
  if (!match?.[2]) {
    throw new Error("image_data_url must be a valid base64 data URL.");
  }
  return {
    buffer: Buffer.from(match[2], "base64"),
    contentType: (match[1] || "application/octet-stream").toLowerCase(),
  };
}

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
  const source = resolveSingleImageSource(input);

  if (source.kind === "generic" || source.kind === "url") {
    const localRoots = Array.from(
      new Set([
        ...getDefaultMediaLocalRoots(),
        ...(options.workspaceDir?.trim() ? [options.workspaceDir.trim()] : []),
      ]),
    );
    const loaded = await loadWebMedia(source.value, {
      maxBytes: 8 * 1024 * 1024,
      optimizeImages: false,
      localRoots,
      ...(options.workspaceDir?.trim() ? { workspaceDir: options.workspaceDir.trim() } : {}),
    });
    return {
      buffer: loaded.buffer,
      contentType: (loaded.contentType || "application/octet-stream").toLowerCase(),
      fileName: loaded.fileName,
    };
  }

  if (source.kind === "data_url") {
    const decoded = decodeDataUrl(source.value);
    return {
      buffer: decoded.buffer,
      contentType: decoded.contentType,
    };
  }

  const mimeType = input.mime_type?.trim().toLowerCase();
  if (!mimeType) {
    throw new Error("mime_type is required when image_base64 is used.");
  }
  return {
    buffer: Buffer.from(source.value, "base64"),
    contentType: mimeType,
  };
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
