import type { AnyAgentTool } from "openclaw/plugin-sdk/plugin-entry";
import { updateChatThemeDraft } from "../client.js";
import type { ChatTheme } from "../types.js";

const hexColorDescription = "Hex color string in #RRGGBB or #RRGGBBAA format.";

const backgroundSchema = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: ["solid", "gradient", "image"],
      description:
        "Use color for solid, gradient for gradient, or image_url for uploaded image backgrounds.",
    },
    color: { type: "string", description: hexColorDescription },
    gradient: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["linear", "radial"] },
        colors: {
          type: "array",
          items: { type: "string", description: hexColorDescription },
          minItems: 2,
          maxItems: 5,
        },
        stops: {
          type: "array",
          items: { type: "number", minimum: 0, maximum: 1 },
          minItems: 2,
          maxItems: 5,
        },
        begin: {
          type: "string",
          enum: [
            "topLeft",
            "topCenter",
            "topRight",
            "centerLeft",
            "center",
            "centerRight",
            "bottomLeft",
            "bottomCenter",
            "bottomRight",
          ],
        },
        end: {
          type: "string",
          enum: [
            "topLeft",
            "topCenter",
            "topRight",
            "centerLeft",
            "center",
            "centerRight",
            "bottomLeft",
            "bottomCenter",
            "bottomRight",
          ],
        },
      },
      additionalProperties: false,
    },
    image_url: {
      type: "string",
      description:
        "Final CDN URL returned by agenrena_upload_chat_theme_background. Required for submitted image backgrounds.",
    },
  },
  required: ["type"],
  additionalProperties: false,
} as const;

const bubbleSchema = {
  type: "object",
  properties: {
    color: { type: "string", description: hexColorDescription },
    border_radius: { type: "number", minimum: 8, maximum: 24 },
    border_radius_grouped: { type: "number", minimum: 2, maximum: 8 },
  },
  required: ["color", "border_radius", "border_radius_grouped"],
  additionalProperties: false,
} as const;

const chatThemeVariantSchema = {
  type: "object",
  properties: {
    background: backgroundSchema,
    bubble_self: bubbleSchema,
    bubble_other: bubbleSchema,
    text_self_color: { type: "string", description: hexColorDescription },
    text_other_color: { type: "string", description: hexColorDescription },
    timestamp_self_color: { type: "string", description: hexColorDescription },
    timestamp_other_color: { type: "string", description: hexColorDescription },
    date_chip: {
      type: "object",
      properties: {
        background_color: { type: "string", description: hexColorDescription },
        text_color: { type: "string", description: hexColorDescription },
      },
      required: ["background_color", "text_color"],
      additionalProperties: false,
    },
    composer: {
      type: "object",
      properties: {
        background_color: { type: "string", description: hexColorDescription },
        input_background_color: { type: "string", description: hexColorDescription },
        icon_color: { type: "string", description: hexColorDescription },
        text_color: { type: "string", description: hexColorDescription },
        hint_color: { type: "string", description: hexColorDescription },
      },
      required: [
        "background_color",
        "input_background_color",
        "icon_color",
        "text_color",
        "hint_color",
      ],
      additionalProperties: false,
    },
    accent_color: { type: "string", description: hexColorDescription },
    link_preview: {
      type: "object",
      properties: {
        background_self: { type: "string", description: hexColorDescription },
        background_other: { type: "string", description: hexColorDescription },
        description_self_color: { type: "string", description: hexColorDescription },
        description_other_color: { type: "string", description: hexColorDescription },
      },
      required: [
        "background_self",
        "background_other",
        "description_self_color",
        "description_other_color",
      ],
      additionalProperties: false,
    },
  },
  required: [
    "background",
    "bubble_self",
    "bubble_other",
    "text_self_color",
    "text_other_color",
    "timestamp_self_color",
    "timestamp_other_color",
    "date_chip",
    "composer",
    "accent_color",
    "link_preview",
  ],
  additionalProperties: false,
} as const;

const updateChatThemeDraftParameters = {
  type: "object",
  properties: {
    theme_id: {
      type: "string",
      description: "Chat theme draft UUID selected by the user after listing drafts.",
    },
    chat_theme: {
      type: "object",
      properties: {
        light: chatThemeVariantSchema,
        dark: chatThemeVariantSchema,
      },
      required: ["light", "dark"],
      additionalProperties: false,
    },
  },
  required: ["theme_id", "chat_theme"],
  additionalProperties: false,
} as const;

export function createUpdateChatThemeDraftTool(apiKey: string): AnyAgentTool {
  return {
    name: "agenrena_update_chat_theme_draft",
    description:
      "Update an existing Agenrena chat theme draft. First call agenrena_list_draft_chat_themes and confirm the target draft with the user.",
    parameters: updateChatThemeDraftParameters,
    async execute(
      _toolCallId: string,
      params: {
        theme_id: string;
        chat_theme: ChatTheme;
      },
    ) {
      const result = await updateChatThemeDraft(apiKey, params.theme_id, {
        chat_theme: params.chat_theme,
      });
      return {
        content: [
          {
            type: "text" as const,
            text: `Chat theme draft updated successfully.\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    },
  } as AnyAgentTool;
}
