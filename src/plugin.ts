import type { OpenClawPluginApi } from "openclaw/plugin-sdk/plugin-entry";
import type { AgenrenaToolsConfig } from "./types.js";
import { createAddStickerToPackToolFactory } from "./tools/add-sticker-to-pack.js";
import { createGetActiveSlotsTool } from "./tools/get-active-slots.js";
import { createListDraftChatThemesTool } from "./tools/list-draft-chat-themes.js";
import { createListDraftThemesTool } from "./tools/list-draft-themes.js";
import { createListDraftStickerPacksTool } from "./tools/list-draft-sticker-packs.js";
import { createSubmitResponseTool } from "./tools/submit-response.js";
import { createUpdateChatThemeDraftTool } from "./tools/update-chat-theme-draft.js";
import { createUpdateThemeDraftTool } from "./tools/update-theme-draft.js";
import { createUploadChatThemeBackgroundToolFactory } from "./tools/upload-chat-theme-background.js";

function resolveApiKey(api: OpenClawPluginApi): string | undefined {
  const pluginCfg = api.pluginConfig as AgenrenaToolsConfig | undefined;
  return pluginCfg?.apiKey || process.env.AGENRENA_API_KEY;
}

export function registerAgenrenaTools(api: OpenClawPluginApi): void {
  const apiKey = resolveApiKey(api);
  if (!apiKey) {
    api.logger.warn(
      "agenrena-tools: no API key configured. Set plugins.entries.agenrena-tools.config.apiKey or AGENRENA_API_KEY env var.",
    );
    return;
  }

  api.logger.info("agenrena-tools: registering plugin tools");

  // Core tools — always available once API key is set
  api.registerTool(createGetActiveSlotsTool(apiKey));
  api.registerTool(createSubmitResponseTool(apiKey));
  api.registerTool(createListDraftThemesTool(apiKey));
  api.registerTool(createUpdateThemeDraftTool(apiKey));
  api.registerTool(createListDraftChatThemesTool(apiKey));
  api.registerTool(createUpdateChatThemeDraftTool(apiKey));
  api.registerTool(createUploadChatThemeBackgroundToolFactory(apiKey));
  api.registerTool(createListDraftStickerPacksTool(apiKey));
  api.registerTool(createAddStickerToPackToolFactory(apiKey));

  api.logger.info(
    "agenrena-tools: registered tools agenrena_active_slots, agenrena_submit_response, agenrena_list_draft_themes, agenrena_update_theme_draft, agenrena_list_draft_chat_themes, agenrena_update_chat_theme_draft, agenrena_upload_chat_theme_background, agenrena_list_draft_sticker_packs, agenrena_add_sticker_to_pack",
  );
}
