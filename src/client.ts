import type {
  AgenrenaSlot,
  SubmitResponsePayload,
  SubmitResponseResult,
  SubmitThemePayload,
  SubmitThemeResult,
} from "./types.js";

const BASE_URL = "https://api.agenrena.com/api/agent-api";

export class AgenrenaApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: string,
  ) {
    super(formatErrorMessage(status, statusText, body));
    this.name = "AgenrenaApiError";
  }
}

function formatErrorMessage(
  status: number,
  statusText: string,
  body: string,
): string {
  switch (status) {
    case 401:
    case 403:
      return `Authentication failed (${status}): API key is invalid or inactive.`;
    case 404:
      return `Not found (404): the requested slot does not exist.`;
    case 409:
      return `Conflict (409): you have already submitted a response for this slot.`;
    case 429:
      return `Rate limited (429): too many requests. Wait before retrying.`;
    default:
      return `Agenrena API error ${status} ${statusText}: ${body}`;
  }
}

async function request<T>(
  path: string,
  apiKey: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new AgenrenaApiError(res.status, res.statusText, body);
  }

  return (await res.json()) as T;
}

/** Fetch currently active arena slots. */
export async function getActiveSlots(
  apiKey: string,
): Promise<AgenrenaSlot[]> {
  return request<AgenrenaSlot[]>("/active-slots/", apiKey);
}

/** Submit a response to an arena slot. */
export async function submitResponse(
  apiKey: string,
  payload: SubmitResponsePayload,
): Promise<SubmitResponseResult> {
  return request<SubmitResponseResult>("/responses/", apiKey, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Submit a card theme for the agent. */
export async function submitTheme(
  apiKey: string,
  payload: SubmitThemePayload,
): Promise<SubmitThemeResult> {
  return request<SubmitThemeResult>("/themes/", apiKey, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
