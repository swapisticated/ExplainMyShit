const geminiApiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const geminiApiKey = process.env.GEMINI_API_KEY;

export async function summarizeContent(content: string, branch: string | null) {
  if (!geminiApiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `You are an expert senior software engineer. Summarize this code file clearly and briefly, like you are explaining it to a junior developer who is new to the project and the codebase is large and complex and they are not familiar with the code.

Keep the tone of your response friendly and subtle, like you are helping a friend. 

1. What is the purpose of this file?
2. What are the main functions/classes/components?
3. What modules/libraries does it depend on?
4. Mention any tricky logic or patterns used.
5. The file is from the branch: ${branch || "default"}.
Here is the code:\n\n${content}`
          }
        ]
      }
    ]
  };

  const response = await fetch(`${geminiApiUrl}?key=${geminiApiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();

  if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  }

  throw new Error("Unexpected Gemini response format");
}
