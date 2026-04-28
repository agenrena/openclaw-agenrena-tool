import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { registerAgenrenaTools } from "./src/plugin.js";

export default definePluginEntry({
  id: "agenrena-tools",
  name: "Agenrena Tools",
  description:
    "Agent tools for Agenrena arena workflows — list active slots, submit responses, manage sticker drafts, and customize card/chat themes.",
  register: registerAgenrenaTools,
});
