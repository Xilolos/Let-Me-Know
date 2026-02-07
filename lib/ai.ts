import { HfInference } from '@huggingface/inference';

// Helper to extract JSON from chatty responses
function extractJson(text: string) {
  try {
    // 1. Try direct parse
    return JSON.parse(text);
  } catch (e) {
    // 2. Try to find JSON block
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e2) {
        // ignore
      }
    }
  }
  return null;
}

export async function analyzeContent(query: string, content: string) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    console.warn('HUGGINGFACE_API_KEY is not set');
    return { relevant: false, summary: 'API Key missing' };
  }

  const hf = new HfInference(apiKey);
  // Use Llama 3 8B Instruct - highly reliable on free tier
  const model = "meta-llama/Meta-Llama-3-8B-Instruct";

  // Truncate content further for open models to stay within context window safely
  const safeContent = content.slice(0, 8000);

  const prompt = `
    You are a helpful news assistant.
    
    USER QUERY: "${query}"
    
    WEBPAGE CONTENT:
    ---
    ${safeContent}
    ---
    
    INSTRUCTIONS:
    1. Analyze the content to see if it contains NEW or RELEVANT information about the USER QUERY.
    2. If yes, summarize it in 2-3 sentences.
    3. If no, say "No relevant news found."
    
    CRITICAL: YOU MUST RETURN ONLY VALID JSON. NO MARKDOWN. NO PREAMBLE.
    
    JSON FORMAT:
    {
      "relevant": boolean,
      "summary": "string"
    }
  `;

  try {
    const chatCompletion = await hf.chatCompletion({
      model: model,
      messages: [
        { role: "system", content: "You are a JSON-only API. You must return raw JSON without markdown blocks." },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.1, // Low temp for deterministic format
    });

    const text = chatCompletion.choices[0].message.content || "{}";
    const data = extractJson(text);

    if (!data) {
      console.warn("HF returned invalid JSON:", text);
      return { relevant: false, summary: "Error: AI response invalid" };
    }

    return data;

  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    const msg = error.message || 'Unknown error';
    return { relevant: false, summary: `AI Analysis Failed: ${msg}`, error: true };
  }
}

export async function generateSearchQueries(topic: string): Promise<string[]> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) return [topic];

  const hf = new HfInference(apiKey);
  const model = "meta-llama/Meta-Llama-3-8B-Instruct";

  const prompt = `
    The user wants to find information about: "${topic}".
    Translate this into 3 distinct, effective Google search queries.
    
    RULES:
    1. Queries must be KEYWORD-BASED (concise).
    2. Include "news", "latest", or "official".
    
    CRITICAL: RETURN ONLY A JSON ARRAY OF STRINGS. NO MARKDOWN.
    Example: ["query 1", "query 2", "query 3"]
  `;

  try {
    const chatCompletion = await hf.chatCompletion({
      model: model,
      messages: [
        { role: "system", content: "You are a JSON-only API. You must return raw JSON without markdown blocks." },
        { role: "user", content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.3,
    });

    const text = chatCompletion.choices[0].message.content || "[]";
    const queries = extractJson(text);

    return Array.isArray(queries) ? queries : [topic];
  } catch (e: any) {
    console.error('AI Query Gen Error:', e);
    return [topic];
  }
}
