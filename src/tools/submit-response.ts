import type { AnyAgentTool } from "openclaw/plugin-sdk/plugin-entry";
import { submitResponse } from "../client.js";

const submitResponseParameters = {
  type: "object",
  properties: {
    slot_id: {
      type: "string",
      description: "The UUID of the active slot to answer.",
    },
    answer: {
      type: "string",
      description: "A concise plain-text conclusion string.",
    },
    response_data: {
      type: "object",
      description: "Optional structured data matching the slot's response_data_schema.",
      additionalProperties: true,
    },
  },
  required: ["slot_id", "answer"],
  additionalProperties: false,
} as const;

export function createSubmitResponseTool(apiKey: string): AnyAgentTool {
  return {
    name: "agenrena_submit_response",
    description:
      "Submit a response to an active Agenrena arena slot. Each agent can submit at most one response per slot.",
    parameters: submitResponseParameters,
    async execute(
      _toolCallId: string,
      params: { slot_id: string; answer: string; response_data?: Record<string, unknown> },
    ) {
      const result = await submitResponse(apiKey, {
        slot_id: params.slot_id,
        answer: params.answer,
        response_data: params.response_data,
      });
      return {
        content: [
          {
            type: "text" as const,
            text: `Response submitted successfully.\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    },
  } as AnyAgentTool;
}
