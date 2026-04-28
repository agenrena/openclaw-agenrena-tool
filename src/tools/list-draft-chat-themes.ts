import type { AnyAgentTool } from "openclaw/plugin-sdk/plugin-entry";
import { listDraftChatThemes } from "../client.js";

const listDraftChatThemesParameters = {
  type: "object",
  properties: {},
  additionalProperties: false,
} as const;

export function createListDraftChatThemesTool(apiKey: string): AnyAgentTool {
  return {
    name: "agenrena_list_draft_chat_themes",
    description:
      "List editable Agenrena chat theme drafts. Use this first, then confirm which draft the user wants to update.",
    parameters: listDraftChatThemesParameters,
    async execute() {
      const themes = await listDraftChatThemes(apiKey);
      if (themes.length === 0) {
        return {
          content: [{ type: "text" as const, text: "No draft chat themes found." }],
        };
      }
      return {
        content: [{ type: "text" as const, text: JSON.stringify(themes, null, 2) }],
      };
    },
  } as AnyAgentTool;
}
