import {
  createChatThemeBackgroundUploadTarget,
  uploadChatThemeBackgroundToPresignedTarget,
} from "./client.js";
import { loadImageSourceWithOptions } from "./image-source.js";
import type {
  ChatThemeBackgroundUploadResult,
  ChatThemeBackgroundValidationResult,
  ImageBackgroundInput,
} from "./types.js";

const MAX_BACKGROUND_BYTES = 2 * 1024 * 1024;
const SUPPORTED_CONTENT_TYPES = new Set(["image/jpeg", "image/png"]);

function normalizeContentType(contentType: string, fileName?: string): "image/jpeg" | "image/png" {
  const lower = contentType.toLowerCase();
  if (lower === "image/jpg") {
    return "image/jpeg";
  }
  if (SUPPORTED_CONTENT_TYPES.has(lower)) {
    return lower as "image/jpeg" | "image/png";
  }

  const fileNameLower = fileName?.toLowerCase();
  if (fileNameLower?.endsWith(".jpg") || fileNameLower?.endsWith(".jpeg")) {
    return "image/jpeg";
  }
  if (fileNameLower?.endsWith(".png")) {
    return "image/png";
  }

  throw new Error("Chat theme background must be image/jpeg or image/png.");
}

export async function prepareChatThemeBackground(
  input: ImageBackgroundInput,
  options: {
    workspaceDir?: string;
  },
): Promise<{
  buffer: Buffer;
  validation: ChatThemeBackgroundValidationResult;
}> {
  const loaded = await loadImageSourceWithOptions(input, {
    context: "a chat theme background",
    maxBytes: MAX_BACKGROUND_BYTES,
    workspaceDir: options.workspaceDir,
  });
  const contentType = normalizeContentType(loaded.contentType, loaded.fileName);

  if (loaded.buffer.length > MAX_BACKGROUND_BYTES) {
    throw new Error(
      `Chat theme background is too large (${loaded.buffer.length} bytes > ${MAX_BACKGROUND_BYTES} bytes).`,
    );
  }

  return {
    buffer: loaded.buffer,
    validation: {
      content_type: contentType,
      bytes: loaded.buffer.length,
    },
  };
}

export async function uploadChatThemeBackground(params: {
  apiKey: string;
  themeId: string;
  variant: "light" | "dark";
  image: ImageBackgroundInput;
  validateOnly?: boolean;
  workspaceDir?: string;
}): Promise<
  | ChatThemeBackgroundUploadResult
  | { uploaded: false; validation: ChatThemeBackgroundValidationResult }
> {
  const prepared = await prepareChatThemeBackground(params.image, {
    workspaceDir: params.workspaceDir,
  });
  if (params.validateOnly) {
    return {
      uploaded: false,
      validation: prepared.validation,
    };
  }

  const target = await createChatThemeBackgroundUploadTarget(params.apiKey, params.themeId, {
    variant: params.variant,
    content_type: prepared.validation.content_type,
  });
  await uploadChatThemeBackgroundToPresignedTarget({
    uploadUrl: target.upload_url,
    uploadFields: target.upload_fields,
    buffer: prepared.buffer,
    contentType: prepared.validation.content_type,
  });

  return {
    theme_id: params.themeId,
    variant: target.variant,
    image_key: target.image_key,
    image_url: target.image_url,
    uploaded: true,
    validation: prepared.validation,
  };
}
