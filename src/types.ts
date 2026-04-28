import type { ImageSourceInput } from "./image-source.js";

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

/** Editable card theme draft owned by the current agent. */
export type ThemeDraft = {
  id: string;
  name?: string;
  status?: string;
  seed_color?: string;
  card_theme?: CardTheme | null;
  created_at?: string;
  updated_at?: string;
};

/** Payload for updating a card theme draft. */
export type UpdateThemeDraftPayload = {
  seed_color: string;
  card_theme: CardTheme;
};

/** Result of a successful theme draft update. */
export type UpdateThemeDraftResult = {
  id: string;
  name?: string;
  status?: string;
  seed_color?: string;
  card_theme?: CardTheme | null;
};

export type ChatThemeBackground =
  | {
      type: "solid";
      color: string;
    }
  | {
      type: "gradient";
      gradient: {
        type: "linear" | "radial";
        colors: string[];
        stops: number[];
        begin: string;
        end: string;
      };
    }
  | {
      type: "image";
      image_url?: string;
    };

export type ChatThemeBubble = {
  color: string;
  border_radius: number;
  border_radius_grouped: number;
};

export type ChatThemeVariant = {
  background: ChatThemeBackground;
  bubble_self: ChatThemeBubble;
  bubble_other: ChatThemeBubble;
  text_self_color: string;
  text_other_color: string;
  timestamp_self_color: string;
  timestamp_other_color: string;
  date_chip: {
    background_color: string;
    text_color: string;
  };
  composer: {
    background_color: string;
    input_background_color: string;
    icon_color: string;
    text_color: string;
    hint_color: string;
  };
  accent_color: string;
  link_preview: {
    background_self: string;
    background_other: string;
    description_self_color: string;
    description_other_color: string;
  };
};

/** Full chat theme object (light + dark). */
export type ChatTheme = {
  light: ChatThemeVariant;
  dark: ChatThemeVariant;
};

/** Editable chat theme draft owned by the current user. */
export type ChatThemeDraft = {
  id: string;
  name?: string;
  status?: string;
  chat_theme?: ChatTheme | null;
  created_at?: string;
  updated_at?: string;
};

/** Payload for updating a chat theme draft. */
export type UpdateChatThemeDraftPayload = {
  chat_theme: ChatTheme;
};

/** Result of a successful chat theme draft update. */
export type UpdateChatThemeDraftResult = {
  id: string;
  name?: string;
  status?: string;
  chat_theme?: ChatTheme | null;
};

export type ChatThemeBackgroundUploadTarget = {
  variant: "light" | "dark";
  image_key: string;
  image_url: string;
  upload_url: string;
  upload_fields: Record<string, string>;
};

/** One accepted chat theme background image source. */
export type ImageBackgroundInput = ImageSourceInput;

export type ChatThemeBackgroundValidationResult = {
  content_type: "image/jpeg" | "image/png";
  bytes: number;
};

export type ChatThemeBackgroundUploadResult = {
  theme_id: string;
  variant: "light" | "dark";
  image_key: string;
  image_url: string;
  uploaded: true;
  validation: ChatThemeBackgroundValidationResult;
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

/** Upload target returned when creating a sticker record inside a pack. */
export type CreateStickerUploadTargetResult = {
  id: string;
  image_key: string;
  upload_url: string;
  upload_fields: Record<string, string>;
  sort_order: number;
  keyword?: string | null;
};

/** One of the accepted sticker image input sources. */
export type AddStickerImageInput = ImageSourceInput;

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
  keyword?: string | null;
  uploaded: true;
  validation: StickerValidationResult;
};

/** Plugin config stored in OpenClaw config. */
export type AgenrenaToolsConfig = {
  apiKey?: string;
};
