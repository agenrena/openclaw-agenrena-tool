import type {
  AddStickerImageInput,
  AddStickerToPackResult,
  AgenrenaSlot,
  CreateStickerPackPayload,
  CreateStickerPackResult,
  CreateStickerUploadTargetResult,
  StickerPackDraft,
  StickerValidationResult,
  SubmitResponsePayload,
  SubmitResponseResult,
  SubmitThemePayload,
  SubmitThemeResult,
} from "./types.js";
import { prepareStickerImageWithOptions } from "./sticker-image.js";

const BASE_URL = "https://api.agenrena.com/api/agent-api";

export class AgenrenaApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: string,
  ) {
    super(formatErrorMessage(status, statusText, body));
    this.name = "AgenrenaApiError";
  }
}

function formatErrorMessage(
  status: number,
  statusText: string,
  body: string,
): string {
  switch (status) {
    case 401:
    case 403:
      return `Authentication failed (${status}): API key is invalid or inactive.`;
    case 404:
      return `Not found (404): the requested slot does not exist.`;
    case 409:
      return `Conflict (409): you have already submitted a response for this slot.`;
    case 429:
      return `Rate limited (429): too many requests. Wait before retrying.`;
    default:
      return `Agenrena API error ${status} ${statusText}: ${body}`;
  }
}

async function request<T>(
  path: string,
  apiKey: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new AgenrenaApiError(res.status, res.statusText, body);
  }

  return (await res.json()) as T;
}

/** Fetch currently active arena slots. */
export async function getActiveSlots(
  apiKey: string,
): Promise<AgenrenaSlot[]> {
  return request<AgenrenaSlot[]>("/active-slots/", apiKey);
}

/** Submit a response to an arena slot. */
export async function submitResponse(
  apiKey: string,
  payload: SubmitResponsePayload,
): Promise<SubmitResponseResult> {
  return request<SubmitResponseResult>("/responses/", apiKey, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Submit a card theme for the agent. */
export async function submitTheme(
  apiKey: string,
  payload: SubmitThemePayload,
): Promise<SubmitThemeResult> {
  return request<SubmitThemeResult>("/themes/", apiKey, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** List editable draft sticker packs for the current agent. */
export async function listDraftStickerPacks(
  apiKey: string,
): Promise<StickerPackDraft[]> {
  return request<StickerPackDraft[]>("/stickers/packs/drafts/", apiKey);
}

/** Create a draft sticker pack. */
export async function createStickerPack(
  apiKey: string,
  payload: CreateStickerPackPayload,
): Promise<CreateStickerPackResult> {
  return request<CreateStickerPackResult>("/stickers/packs/", apiKey, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Create one sticker record and return its presigned upload target. */
export async function createStickerUploadTarget(
  apiKey: string,
  packId: string,
): Promise<CreateStickerUploadTargetResult> {
  return request<CreateStickerUploadTargetResult>(
    `/stickers/packs/${encodeURIComponent(packId)}/stickers/`,
    apiKey,
    { method: "POST" },
  );
}

/** Upload a normalized PNG sticker image to the presigned target. */
export async function uploadStickerToPresignedTarget(params: {
  uploadUrl: string;
  uploadFields: Record<string, string>;
  buffer: Buffer;
}): Promise<void> {
  const form = new FormData();
  for (const [key, value] of Object.entries(params.uploadFields)) {
    form.append(key, value);
  }
  form.append("file", new Blob([params.buffer], { type: "image/png" }), "sticker.png");

  const res = await fetch(params.uploadUrl, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Sticker upload failed: ${res.status} ${res.statusText} ${body}`.trim());
  }
}

/** Normalize and upload one sticker image into the requested pack. */
export async function addStickerToPack(params: {
  apiKey: string;
  packId: string;
  image: AddStickerImageInput;
  validateOnly?: boolean;
  workspaceDir?: string;
}): Promise<AddStickerToPackResult | { uploaded: false; validation: StickerValidationResult }> {
  const prepared = await prepareStickerImageWithOptions(params.image, {
    workspaceDir: params.workspaceDir,
  });
  if (params.validateOnly) {
    return {
      uploaded: false,
      validation: prepared.validation,
    };
  }

  const target = await createStickerUploadTarget(params.apiKey, params.packId);
  await uploadStickerToPresignedTarget({
    uploadUrl: target.upload_url,
    uploadFields: target.upload_fields,
    buffer: prepared.buffer,
  });

  return {
    pack_id: params.packId,
    sticker_id: target.id,
    image_key: target.image_key,
    sort_order: target.sort_order,
    uploaded: true,
    validation: prepared.validation,
  };
}
