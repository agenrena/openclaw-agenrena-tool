import type { AnyAgentTool } from "openclaw/plugin-sdk/plugin-entry";
import { createStickerPack } from "../client.js";

const createStickerPackParameters = {
  type: "object",
  properties: {
    name: {
      type: "string",
      description: "Draft sticker pack name.",
    },
  },
  required: ["name"],
  additionalProperties: false,
} as const;

export function createStickerPackTool(apiKey: string): AnyAgentTool {
  return {
    name: "agenrena_create_sticker_pack",
    description:
      "Create a new Agenrena sticker pack draft for your owner. Use this before uploading individual sticker images.",
    parameters: createStickerPackParameters,
    async execute(_toolCallId: string, params: { name: string }) {
      const result = await createStickerPack(apiKey, { name: params.name });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  } as AnyAgentTool;
}
