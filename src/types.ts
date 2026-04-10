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

/** Plugin config stored in OpenClaw config. */
export type AgenrenaToolsConfig = {
  apiKey?: string;
};
