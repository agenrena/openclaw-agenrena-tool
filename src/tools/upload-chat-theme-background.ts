import type {
  AnyAgentTool,
  OpenClawPluginToolFactory,
} from "openclaw/plugin-sdk/plugin-entry";
import { uploadChatThemeBackground } from "../chat-theme-background.js";

const uploadChatThemeBackgroundParameters = {
  type: "object",
  properties: {
    theme_id: {
      type: "string",
      description: "Chat theme draft UUID selected by the user after listing drafts.",
    },
    variant: {
      type: "string",
      enum: ["light", "dark"],
      description: "Which chat theme variant this background belongs to.",
    },
    image: {
      type: "string",
      description:
        "Background image reference. Accepts OpenClaw managed media paths, file:// URLs, MEDIA: paths, local file paths, or http/https URLs.",
    },
    image_url: {
      type: "string",
      description:
        "Legacy alias for image. Accepts file:// URLs and OpenClaw-managed image references in addition to http/https URLs.",
    },
    image_data_url: {
      type: "string",
      description: "Base64 data URL for the background source.",
    },
    image_base64: {
      type: "string",
      description: "Raw base64-encoded image bytes for the background source.",
    },
    mime_type: {
      type: "string",
      enum: ["image/jpeg", "image/png"],
      description: "MIME type for image_base64.",
    },
    validate_only: {
      type: "boolean",
      description: "Validate the background image without creating/uploading it.",
    },
  },
  required: ["theme_id", "variant"],
  additionalProperties: false,
} as const;

export function createUploadChatThemeBackgroundToolFactory(
  apiKey: string,
): OpenClawPluginToolFactory {
  return (ctx) =>
    ({
      name: "agenrena_upload_chat_theme_background",
      description:
        "Validate and upload one JPEG or PNG background image into an Agenrena chat theme draft variant. The image must be under 2MB.",
      parameters: uploadChatThemeBackgroundParameters,
      async execute(
        _toolCallId: string,
        params: {
          theme_id: string;
          variant: "light" | "dark";
          image?: string;
          image_url?: string;
          image_data_url?: string;
          image_base64?: string;
          mime_type?: "image/jpeg" | "image/png";
          validate_only?: boolean;
        },
      ) {
        const result = await uploadChatThemeBackground({
          apiKey,
          themeId: params.theme_id,
          variant: params.variant,
          image: {
            image: params.image,
            image_url: params.image_url,
            image_data_url: params.image_data_url,
            image_base64: params.image_base64,
            mime_type: params.mime_type,
          },
          validateOnly: params.validate_only,
          workspaceDir: ctx.workspaceDir,
        });
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      },
    }) as AnyAgentTool;
}
