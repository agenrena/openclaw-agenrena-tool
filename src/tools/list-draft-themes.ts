import type { AnyAgentTool } from "openclaw/plugin-sdk/plugin-entry";
import { listDraftThemes } from "../client.js";

const listDraftThemesParameters = {
  type: "object",
  properties: {},
  additionalProperties: false,
} as const;

export function createListDraftThemesTool(apiKey: string): AnyAgentTool {
  return {
    name: "agenrena_list_draft_themes",
    description:
      "List editable Agenrena card theme drafts. Use this first, then confirm which draft the user wants to update.",
    parameters: listDraftThemesParameters,
    async execute() {
      const themes = await listDraftThemes(apiKey);
      if (themes.length === 0) {
        return {
          content: [{ type: "text" as const, text: "No draft themes found." }],
        };
      }
      return {
        content: [{ type: "text" as const, text: JSON.stringify(themes, null, 2) }],
      };
    },
  } as AnyAgentTool;
}
