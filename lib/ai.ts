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

export async function analyzeContent(query: string, sources: { url: string; content: string }[]) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    console.warn('HUGGINGFACE_API_KEY is not set');
    return { relevant: false, summary: 'API Key missing' };
  }

  const hf = new HfInference(apiKey);
  const model = "meta-llama/Meta-Llama-3-8B-Instruct";

  // Prepare content for prompt
  // Limit total size to avoid context overflow. 
  // ~2000 chars per source for 3-4 sources max.
  const combinedContent = sources.map((s, i) => `
    SOURCE ${i + 1} (${s.url}):
    """
    ${s.content.slice(0, 2000)}
    """
  `).join('\n\n');

  const prompt = `
    You are a smart news analyst.
    
    USER TOPIC: "${query}"
    
    BELOW ARE NEWS EXCERPTS FROM MULTIPLE SOURCES:
    ${combinedContent}
    
    INSTRUCTIONS:
    1. Read all sources.
    2. Determine if there is meaningful news about the USER TOPIC.
    3. Synthesize a "Consensus Summary" that combines facts from these sources.
    4. If sources disagree, note the conflict.
    5. If no relevant news is found in ANY source, set "relevant": false.
    
    CRITICAL: RETURN ONLY VALID JSON.
    
    JSON FORMAT:
    {
      "relevant": boolean,
      "summary": "Concise consensus summary (2-4 sentences)."
    }
  `;

  try {
    const chatCompletion = await hf.chatCompletion({
      model: model,
      messages: [
        { role: "system", content: "You are a JSON-only API. You must return raw JSON without markdown." },
        { role: "user", content: prompt }
      ],
      max_tokens: 600,
      temperature: 0.2,
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
