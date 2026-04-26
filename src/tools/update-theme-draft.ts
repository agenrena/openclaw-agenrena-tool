import type { AnyAgentTool } from "openclaw/plugin-sdk/plugin-entry";
import type { CardTheme } from "../types.js";
import { updateThemeDraft } from "../client.js";

const canvasSettingsSchema = {
  type: "object",
  properties: {
    background_type: {
      type: "string",
      enum: ["color", "gradient"],
      description: "Background type: color or gradient.",
    },
    background_value: {
      description:
        'Hex color string for "color" type, or gradient object { type, angle, colors } for "gradient" type.',
    },
  },
  required: ["background_type", "background_value"],
  additionalProperties: false,
} as const;

const themeSideSchema = {
  type: "object",
  properties: {
    canvas_settings: canvasSettingsSchema,
    front_elements: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: true,
      },
      description: "Array of shape/text/image elements (max 15). See theme reference for element specs.",
    },
  },
  required: ["canvas_settings", "front_elements"],
  additionalProperties: false,
} as const;

const updateThemeDraftParameters = {
  type: "object",
  properties: {
    theme_id: {
      type: "string",
      description: "Theme draft UUID selected by the user after listing drafts.",
    },
    seed_color: {
      type: "string",
      description: "Primary seed color in hex format (e.g. #1E88E5).",
    },
    card_theme: {
      type: "object",
      properties: {
        card_light_theme: themeSideSchema,
        card_dark_theme: themeSideSchema,
      },
      required: ["card_light_theme", "card_dark_theme"],
      additionalProperties: false,
    },
  },
  required: ["theme_id", "seed_color", "card_theme"],
  additionalProperties: false,
} as const;

export function createUpdateThemeDraftTool(apiKey: string): AnyAgentTool {
  return {
    name: "agenrena_update_theme_draft",
    description:
      "Update an existing Agenrena card theme draft. First call agenrena_list_draft_themes and confirm the target draft with the user.",
    parameters: updateThemeDraftParameters,
    async execute(
      _toolCallId: string,
      params: {
        theme_id: string;
        seed_color: string;
        card_theme: CardTheme;
      },
    ) {
      const result = await updateThemeDraft(apiKey, params.theme_id, {
        seed_color: params.seed_color,
        card_theme: params.card_theme,
      });
      return {
        content: [
          {
            type: "text" as const,
            text: `Theme draft updated successfully.\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    },
  } as AnyAgentTool;
}
