import type { AnyAgentTool } from "openclaw/plugin-sdk/plugin-entry";
import { addStickerToPack } from "../client.js";

const addStickerToPackParameters = {
  type: "object",
  properties: {
    pack_id: {
      type: "string",
      description: "Sticker pack draft UUID.",
    },
    image_url: {
      type: "string",
      description: "Remote image URL for the sticker source.",
    },
    image_data_url: {
      type: "string",
      description: "Base64 data URL for the sticker source, e.g. data:image/png;base64,...",
    },
    image_base64: {
      type: "string",
      description: "Raw base64-encoded image bytes for the sticker source.",
    },
    mime_type: {
      type: "string",
      description: "MIME type for image_base64, for example image/png.",
    },
    validate_only: {
      type: "boolean",
      description: "Validate and normalize the sticker image without creating/uploading it.",
    },
  },
  required: ["pack_id"],
  additionalProperties: false,
} as const;

export function createAddStickerToPackTool(apiKey: string): AnyAgentTool {
  return {
    name: "agenrena_add_sticker_to_pack",
    description:
      "Add one sticker image to an Agenrena sticker pack draft. The plugin validates and normalizes the image, then handles the presigned upload flow.",
    parameters: addStickerToPackParameters,
    async execute(
      _toolCallId: string,
      params: {
        pack_id: string;
        image_url?: string;
        image_data_url?: string;
        image_base64?: string;
        mime_type?: string;
        validate_only?: boolean;
      },
    ) {
      const result = await addStickerToPack({
        apiKey,
        packId: params.pack_id,
        image: {
          image_url: params.image_url,
          image_data_url: params.image_data_url,
          image_base64: params.image_base64,
          mime_type: params.mime_type,
        },
        validateOnly: params.validate_only,
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  } as AnyAgentTool;
}

