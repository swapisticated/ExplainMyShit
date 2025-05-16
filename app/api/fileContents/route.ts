// import { NextRequest, NextResponse } from "next/server";
// import { Octokit } from "@octokit/rest";

// export async function POST(request: NextRequest) {
//   const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN || undefined });

//   async function fetchFileContent(owner: string, repo: string, path: string) {
//     const res = await octokit.repos.getContent({
//       owner,
//       repo,
//       path,
//     });
//     console.log('Raw GitHub Response:', res.data);

//     ifd (!("content" in res.data)) throw new Error("No content found");

//     const fileContent = Buffer.from(res.data.content, 'base64').toString('utf8');
//     return fileContent;
//   }
//   try {
//     const { owner, repo, path } = await request.json();

//     if (!owner || !repo || !path) {
//       return NextResponse.json({ error: "Missing required params" }, { status: 400 });
//     }

//     const content = await fetchFileContent(owner, repo, path);


//     return NextResponse.json({ content });
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

export async function POST(request: NextRequest) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN || undefined });

  async function fetchFileContent(owner: string, repo: string, path: string, branch: string | null) {

    const options: any = { owner, repo, path };
    if (branch) {
      options.ref = branch; // Add branch reference if provided
    }

    const res = await octokit.repos.getContent(options);
    // console.log('Raw GitHub Response:', res.data);

    if (!("content" in res.data)) throw new Error("No content found");

    const fileContent = Buffer.from(res.data.content, 'base64').toString('utf8');
    return fileContent;
  }

  // async function summarizeContent(content: string, branch: string | null) {
  //   const summarizeApiUrl = "http://localhost:3000/api/summarize"; // URL of the summarize API

  //   const response = await fetch(summarizeApiUrl, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ content,branch }),
  //   });

  //   if (!response.ok) {
  //     throw new Error(`Summarize API error: ${response.statusText}`);
  //   }

  //   const data = await response.json();
  //   return data.summary; // Adjust based on the summarize API response structure
  // }

  // try {
  //   const { owner, repo, path, branch } = await request.json();

  //   if (!owner || !repo || !path) {
  //     return NextResponse.json({ error: "Missing required params" }, { status: 400 });
  //   }

  //   // Fetch the file content from GitHub
  //   const content = await fetchFileContent(owner, repo, path, branch);

  //   // Send the content to the summarize API
  //   const summary = await summarizeContent(content, branch);


  //   // Return both the file content and the summary
  //   return NextResponse.json({summary });
  // } catch (error: any) {
  //   return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  // }

  async function summarizeContent(content: string, branch: string | null) {
    const summarizeApiUrl = "http://localhost:3000/api/summarize";

    const response = await fetch(summarizeApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content, branch }),
    });

    if (!response.ok) {
      throw new Error(`Summarize API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Extract the actual text content from the Gemini response
    if (data.summary?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const markdownContent = data.summary.candidates[0].content.parts[0].text;
      return markdownContent;
    } else {
      throw new Error('Invalid summary format received');
    }
  }

  try {
    const { owner, repo, path, branch } = await request.json();

    if (!owner || !repo || !path) {
      return NextResponse.json({ error: "Missing required params" }, { status: 400 });
    }

    const content = await fetchFileContent(owner, repo, path, branch);
    const summaryText = await summarizeContent(content, branch);

    // Return just the text content
    return NextResponse.json({
      summary: summaryText
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message || "Unknown error"
    }, { status: 500 });
  }
}