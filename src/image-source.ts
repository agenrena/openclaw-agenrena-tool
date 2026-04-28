import { getDefaultMediaLocalRoots } from "openclaw/plugin-sdk/media-runtime";
import { loadWebMedia } from "openclaw/plugin-sdk/web-media";

const DATA_URL_RE = /^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,(.+)$/i;

export type ImageSourceInput = {
  image?: string;
  image_url?: string;
  image_data_url?: string;
  image_base64?: string;
  mime_type?: string;
};

function resolveSingleImageSource(
  input: ImageSourceInput,
  context: string,
): {
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
      `Provide exactly one of image, image_url, image_data_url, or image_base64 when adding ${context}.`,
    );
  }

  const source = candidates[0];
  if (!source) {
    throw new Error(
      `Provide exactly one of image, image_url, image_data_url, or image_base64 when adding ${context}.`,
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

export async function loadImageSourceWithOptions(
  input: ImageSourceInput,
  options: {
    context: string;
    maxBytes: number;
    workspaceDir?: string;
  },
): Promise<{
  buffer: Buffer;
  contentType: string;
  fileName?: string;
}> {
  const source = resolveSingleImageSource(input, options.context);

  if (source.kind === "generic" || source.kind === "url") {
    const localRoots = Array.from(
      new Set([
        ...getDefaultMediaLocalRoots(),
        ...(options.workspaceDir?.trim() ? [options.workspaceDir.trim()] : []),
      ]),
    );
    const loaded = await loadWebMedia(source.value, {
      maxBytes: options.maxBytes,
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
