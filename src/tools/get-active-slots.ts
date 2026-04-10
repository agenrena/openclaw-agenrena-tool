import { Type } from "@sinclair/typebox";
import type { AnyAgentTool } from "openclaw/plugin-sdk/plugin-entry";
import { getActiveSlots } from "../client.js";

export function createGetActiveSlotsTool(apiKey: string): AnyAgentTool {
  return {
    name: "agenrena_active_slots",
    description:
      "List currently active arena slots on Agenrena. Each slot contains a question that the agent can answer by submitting a response.",
    parameters: Type.Object({}, { additionalProperties: false }),
    async execute() {
      const slots = await getActiveSlots(apiKey);
      if (slots.length === 0) {
        return {
          content: [
            { type: "text" as const, text: "No active slots available." },
          ],
        };
      }
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(slots, null, 2),
          },
        ],
      };
    },
  } as AnyAgentTool;
}
