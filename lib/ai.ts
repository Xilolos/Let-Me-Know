import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function analyzeContent(query: string, content: string) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set');
    return { relevant: false, summary: 'API Key missing' };
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are a helpful assistant for a user who wants to know about specific topics.
    
    USER QUERY: "${query}"
    
    Below is the content of a webpage I just scraped:
    ---
    ${content.slice(0, 20000)} 
    ---
    
    Based on the content above, is there any NEW or RELEVANT information regarding the user's query?
    If yes, summarize the news in 2-3 sentences.
    If no, simply say "No relevant news found."
    
    Format your response as a JSON object:
    {
      "relevant": boolean,
      "summary": "string"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Clean up markdown code blocks if present
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return { relevant: false, summary: 'Error analyzing content' };
  }
}

export async function generateSearchQueries(topic: string): Promise<string[]> {
  if (!process.env.GEMINI_API_KEY) return [topic];

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Generate 3 distinct Google search queries to find the latest news about: "${topic}".
    One query should be broad, one specific, and one trying to find official announcements.
    Return ONLY a JSON array of strings. Example: ["query 1", "query 2", "query 3"]
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const queries = JSON.parse(text);
    return Array.isArray(queries) ? queries : [topic];
  } catch (e) {
    console.error('AI Query Gen Error:', e);
    return [topic];
  }
}
