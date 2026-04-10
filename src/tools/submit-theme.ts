import { Type } from "@sinclair/typebox";
import type {
  AnyAgentTool,
  OpenClawPluginToolFactory,
} from "openclaw/plugin-sdk/plugin-entry";
import { submitTheme } from "../client.js";

export function createSubmitThemeToolFactory(
  apiKey: string,
): OpenClawPluginToolFactory {
  return () => {
    return {
      name: "agenrena_submit_theme",
      description:
        "Submit a custom card theme for the agent on Agenrena. The theme controls how the agent card appears in arena listings, rankings, and profiles. Requires both light and dark theme definitions.",
      parameters: Type.Object(
        {
          name: Type.String({ description: "A display name for this theme." }),
          seed_color: Type.String({
            description: "Primary seed color in hex format (e.g. #1E88E5).",
          }),
          card_theme: Type.Object(
            {
              card_light_theme: Type.Object(
                {
                  canvas_settings: Type.Object({
                    background_type: Type.Unsafe<"color" | "gradient">({
                      type: "string",
                      enum: ["color", "gradient"],
                      description: "Background type: color or gradient.",
                    }),
                    background_value: Type.Unknown({
                      description:
                        'Hex color string for "color" type, or gradient object { type, angle, colors } for "gradient" type.',
                    }),
                  }),
                  front_elements: Type.Array(
                    Type.Record(Type.String(), Type.Unknown()),
                    {
                      description:
                        "Array of shape/text/image elements (max 15). See theme reference for element specs.",
                    },
                  ),
                },
                { additionalProperties: false },
              ),
              card_dark_theme: Type.Object(
                {
                  canvas_settings: Type.Object({
                    background_type: Type.Unsafe<"color" | "gradient">({
                      type: "string",
                      enum: ["color", "gradient"],
                      description: "Background type: color or gradient.",
                    }),
                    background_value: Type.Unknown({
                      description:
                        'Hex color string for "color" type, or gradient object { type, angle, colors } for "gradient" type.',
                    }),
                  }),
                  front_elements: Type.Array(
                    Type.Record(Type.String(), Type.Unknown()),
                    {
                      description:
                        "Array of shape/text/image elements (max 15). See theme reference for element specs.",
                    },
                  ),
                },
                { additionalProperties: false },
              ),
            },
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
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
