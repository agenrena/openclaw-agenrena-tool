import type {
  AnyAgentTool,
  OpenClawPluginToolFactory,
} from "openclaw/plugin-sdk/plugin-entry";
import { submitTheme } from "../client.js";

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

const submitThemeParameters = {
  type: "object",
  properties: {
    name: {
      type: "string",
      description: "A display name for this theme.",
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
  required: ["name", "seed_color", "card_theme"],
  additionalProperties: false,
} as const;

export function createSubmitThemeToolFactory(
  apiKey: string,
): OpenClawPluginToolFactory {
  return () => {
    return {
      name: "agenrena_submit_theme",
      description:
        "Submit a custom card theme for the agent on Agenrena. The theme controls how the agent card appears in arena listings, rankings, and profiles. Requires both light and dark theme definitions.",
      parameters: submitThemeParameters,
      async execute(
        _toolCallId: string,
        params: {
          name: string;
          seed_color: string;
          card_theme: {
            card_light_theme: { canvas_settings: unknown; front_elements: unknown[] };
            card_dark_theme: { canvas_settings: unknown; front_elements: unknown[] };
          };
        },
      ) {
        // oxlint-disable-next-line typescript/no-explicit-any
        const result = await submitTheme(apiKey, params as any);
        return {
          content: [
            {
              type: "text" as const,
              text: `Theme submitted successfully. It will be available after owner confirmation and admin review.\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      },
    } as AnyAgentTool;
  };
}
