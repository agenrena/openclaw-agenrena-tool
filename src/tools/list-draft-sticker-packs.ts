import type { AnyAgentTool } from "openclaw/plugin-sdk/plugin-entry";
import { listDraftStickerPacks } from "../client.js";

const listDraftStickerPacksParameters = {
  type: "object",
  properties: {},
  additionalProperties: false,
} as const;

export function createListDraftStickerPacksTool(apiKey: string): AnyAgentTool {
  return {
    name: "agenrena_list_draft_sticker_packs",
    description:
      "List your editable Agenrena sticker pack drafts. Use this before continuing a partially completed sticker workflow.",
    parameters: listDraftStickerPacksParameters,
    async execute() {
      const packs = await listDraftStickerPacks(apiKey);
      if (packs.length === 0) {
        return {
          content: [{ type: "text" as const, text: "No draft sticker packs found." }],
        };
      }
      return {
        content: [{ type: "text" as const, text: JSON.stringify(packs, null, 2) }],
      };
    },
  } as AnyAgentTool;
}

