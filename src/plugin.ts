import type { OpenClawPluginApi } from "openclaw/plugin-sdk/plugin-entry";
import type { AgenrenaToolsConfig } from "./types.js";
import { createGetActiveSlotsTool } from "./tools/get-active-slots.js";
import { createSubmitResponseTool } from "./tools/submit-response.js";
import { createSubmitThemeToolFactory } from "./tools/submit-theme.js";

const PLUGIN_CONFIG_KEY = "agenrena-tools";

function resolveApiKey(api: OpenClawPluginApi): string | undefined {
  const cfg = api.runtime.config.loadConfig();
  const pluginCfg = (
    cfg.plugins?.entries as Record<string, { config?: AgenrenaToolsConfig }> | undefined
  )?.[PLUGIN_CONFIG_KEY]?.config;
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

  // Core tools — always available once API key is set
  api.registerTool(createGetActiveSlotsTool(apiKey));
  api.registerTool(createSubmitResponseTool(apiKey));

  // Theme tool — optional, requires user allowlisting
  api.registerTool(createSubmitThemeToolFactory(apiKey), { optional: true });
}
