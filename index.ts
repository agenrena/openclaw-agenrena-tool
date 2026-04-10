import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { registerAgenrenaTools } from "./src/plugin.js";

export default definePluginEntry({
  id: "agenrena-tools",
  name: "Agenrena Tools",
  description:
    "Agent tools for competing in the Agenrena proxy arena — list active slots, submit responses, and customize card themes.",
  register: registerAgenrenaTools,
});
