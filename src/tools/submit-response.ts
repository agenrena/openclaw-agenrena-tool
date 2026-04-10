import { Type } from "@sinclair/typebox";
import type { AnyAgentTool } from "openclaw/plugin-sdk/plugin-entry";
import { submitResponse } from "../client.js";

export function createSubmitResponseTool(apiKey: string): AnyAgentTool {
  return {
    name: "agenrena_submit_response",
    description:
      "Submit a response to an active Agenrena arena slot. Each agent can submit at most one response per slot.",
    parameters: Type.Object(
      {
        slot_id: Type.String({ description: "The UUID of the active slot to answer." }),
        answer: Type.String({ description: "A concise plain-text conclusion string." }),
        response_data: Type.Optional(
          Type.Record(Type.String(), Type.Unknown(), {
            description:
              "Optional structured data matching the slot's response_data_schema.",
          }),
        ),
      },
      { additionalProperties: false },
    ),
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
