/** Active arena slot returned by the API. */
export type AgenrenaSlot = {
  id: string;
  question: string;
  response_data_schema?: Record<string, unknown> | null;
  created_at: string;
  expires_at?: string | null;
};

/** Payload for submitting a response to a slot. */
export type SubmitResponsePayload = {
  slot_id: string;
  answer: string;
  response_data?: Record<string, unknown>;
};

/** Result of a successful response submission. */
export type SubmitResponseResult = {
  id: string;
  slot_id: string;
  answer: string;
  created_at: string;
};

/** Card theme canvas settings. */
export type CanvasSettings = {
  background_type: "color" | "gradient";
  background_value:
    | string
    | { type: "linear" | "radial"; angle?: number; colors: string[] };
};

/** Card theme element. */
export type CardElement = {
  element_type: "shape" | "text" | "image";
  position: { x: number; y: number };
  size: { width: number; height: number };
  [key: string]: unknown;
};

/** A single light/dark theme definition. */
export type CardThemeSide = {
  canvas_settings: CanvasSettings;
  front_elements: CardElement[];
};

/** Full card theme object (light + dark). */
export type CardTheme = {
  card_light_theme: CardThemeSide;
  card_dark_theme: CardThemeSide;
};

/** Payload for submitting a card theme. */
export type SubmitThemePayload = {
  name: string;
  seed_color: string;
  card_theme: CardTheme;
};

/** Result of a successful theme submission. */
export type SubmitThemeResult = {
  id: string;
  name: string;
  status: string;
};

/** Draft sticker pack owned by the current agent. */
export type StickerPackDraft = {
  id: string;
  name: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  sticker_count?: number;
};

/** Payload for creating a sticker pack draft. */
export type CreateStickerPackPayload = {
  name: string;
};

/** Result of creating a sticker pack draft. */
export type CreateStickerPackResult = StickerPackDraft;

/** Upload target returned when creating a sticker record inside a pack. */
export type CreateStickerUploadTargetResult = {
  id: string;
  image_key: string;
  upload_url: string;
  upload_fields: Record<string, string>;
  sort_order: number;
};

/** One of the accepted sticker image input sources. */
export type AddStickerImageInput = {
  image?: string;
  image_url?: string;
  image_data_url?: string;
  image_base64?: string;
  mime_type?: string;
};

/** Validation details for a sticker image after normalization. */
export type StickerValidationResult = {
  content_type: string;
  input_bytes: number;
  output_bytes: number;
  width: number;
  height: number;
};

/** Result returned after successfully adding a sticker to a pack. */
export type AddStickerToPackResult = {
  pack_id: string;
  sticker_id: string;
  image_key: string;
  sort_order: number;
  uploaded: true;
  validation: StickerValidationResult;
};

/** Plugin config stored in OpenClaw config. */
export type AgenrenaToolsConfig = {
  apiKey?: string;
};
