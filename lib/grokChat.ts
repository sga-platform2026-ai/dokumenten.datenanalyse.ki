import {
  getGrokRuntimeConfig,
  type GrokReasoningEffort,
  type GrokRuntimeConfig,
} from "@/lib/grokConfig";

interface GrokChoice {
  message?: {
    content?: string;
  };
}

interface GrokApiResponse {
  choices?: GrokChoice[];
}

interface GrokChatRequestBody {
  model: string;
  messages: Array<{ role: "system" | "user"; content: string }>;
  temperature: number;
  max_tokens: number;
  reasoning_effort?: GrokReasoningEffort;
}

export type GrokCallProfile = "article" | "letter";

export interface GrokChatParams {
  apiKey: string;
  apiUrl: string;
  model: string;
  system: string;
  user: string;
  temperature: number;
  maxTokens: number;
  reasoningEffort: GrokReasoningEffort;
  signal?: AbortSignal;
}

function paramsForProfile(
  config: GrokRuntimeConfig,
  profile: GrokCallProfile,
): Pick<GrokChatParams, "temperature" | "maxTokens" | "reasoningEffort"> {
  if (profile === "letter") {
    return {
      temperature: config.letterTemperature,
      maxTokens: config.letterMaxTokens,
      reasoningEffort: config.letterReasoningEffort,
    };
  }
  return {
    temperature: config.temperature,
    maxTokens: config.maxTokens,
    reasoningEffort: config.reasoningEffort,
  };
}

export async function grokChat(params: GrokChatParams): Promise<string> {
  const body: GrokChatRequestBody = {
    model: params.model,
    messages: [
      { role: "system", content: params.system },
      { role: "user", content: params.user },
    ],
    temperature: params.temperature,
    max_tokens: params.maxTokens,
    reasoning_effort: params.reasoningEffort,
  };

  const response = await fetch(params.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify(body),
    signal: params.signal,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `GROK API Fehler (${response.status}): ${errorBody.slice(0, 300)}`,
    );
  }

  const data = (await response.json()) as GrokApiResponse;
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("GROK API lieferte keine Inhalte.");
  }

  return content;
}

/** Grok-Aufruf mit Einstellungen aus `config/Grok-Konfiguration.md` + API-Key aus Env. */
export async function grokChatFromConfig(options: {
  system: string;
  user: string;
  profile?: GrokCallProfile;
  signal?: AbortSignal;
}): Promise<string> {
  const config = getGrokRuntimeConfig();
  if (!config.apiKey) {
    throw new Error("GROK_API_KEY fehlt in .env.local");
  }

  const profile = options.profile ?? "article";
  const profileParams = paramsForProfile(config, profile);

  return grokChat({
    apiKey: config.apiKey,
    apiUrl: config.apiUrl,
    model: config.model,
    system: options.system,
    user: options.user,
    temperature: profileParams.temperature,
    maxTokens: profileParams.maxTokens,
    reasoningEffort: profileParams.reasoningEffort,
    signal: options.signal,
  });
}
