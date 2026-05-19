const DEFAULT_GROK_URL = "https://api.x.ai/v1/chat/completions";
const DEFAULT_MAX_TOKENS = 8192;

interface GrokChoice {
  message?: {
    content?: string;
  };
}

interface GrokApiResponse {
  choices?: GrokChoice[];
}

export interface GrokChatParams {
  apiKey: string;
  apiUrl?: string;
  model: string;
  system: string;
  user: string;
  temperature: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export async function grokChat({
  apiKey,
  apiUrl = DEFAULT_GROK_URL,
  model,
  system,
  user,
  temperature,
  maxTokens = DEFAULT_MAX_TOKENS,
  signal,
}: GrokChatParams): Promise<string> {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature,
      max_tokens: maxTokens,
    }),
    signal,
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
