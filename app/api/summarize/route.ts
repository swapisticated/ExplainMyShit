import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const geminiApiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"; // Gemini API URL
    const geminiApiKey = process.env.GEMINI_API_KEY; // Store your Gemini API key in an environment variable

    try {
        const { content, branch } = await request.json();

        if (!content) {
            return NextResponse.json({ error: "Missing content" }, { status: 400 });
        }

        // Prepare the request body for Gemini API
        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: `You are an expert senior software engineer. Summarize this code file clearly and briefly, like you are explaining it to a junior developer who is new to the project and the codebase is large and complex and they are not familiar with the code.

                            keep the tone of your response friendly and subtle, like you are helping a friend. 
                                                        
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

        // Make the POST request to Gemini API
        const response = await fetch(`${geminiApiUrl}?key=${geminiApiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json({ summary: data }); // Adjust based on Gemini's API response structure
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
    }
}