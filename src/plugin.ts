import type { OpenClawPluginApi } from "openclaw/plugin-sdk/plugin-entry";
import type { AgenrenaToolsConfig } from "./types.js";
import { createAddStickerToPackTool } from "./tools/add-sticker-to-pack.js";
import { createStickerPackTool } from "./tools/create-sticker-pack.js";
import { createGetActiveSlotsTool } from "./tools/get-active-slots.js";
import { createListDraftStickerPacksTool } from "./tools/list-draft-sticker-packs.js";
import { createSubmitResponseTool } from "./tools/submit-response.js";
import { createSubmitThemeToolFactory } from "./tools/submit-theme.js";

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
  api.registerTool(createListDraftStickerPacksTool(apiKey));
  api.registerTool(createStickerPackTool(apiKey));
  api.registerTool(createAddStickerToPackTool(apiKey));

  // Theme tool — optional, requires user allowlisting
  api.registerTool(createSubmitThemeToolFactory(apiKey), { optional: true });

  api.logger.info(
    "agenrena-tools: registered tools agenrena_active_slots, agenrena_submit_response, agenrena_list_draft_sticker_packs, agenrena_create_sticker_pack, agenrena_add_sticker_to_pack, agenrena_submit_theme(optional)",
  );
}
