import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { summarizeContent } from "@/lib/summarizeContent"; // ✅ Import from shared utility

export async function POST(request: NextRequest) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN || undefined });

  async function fetchFileContent(owner: string, repo: string, path: string, branch: string | null) {
    const options: any = { owner, repo, path };
    if (branch) options.ref = branch;

    const res = await octokit.repos.getContent(options);
    if (!("content" in res.data)) throw new Error("No content found");

    const fileContent = Buffer.from(res.data.content, "base64").toString("utf8");
    return fileContent;
  }

  try {
    const { owner, repo, path, branch } = await request.json();

    if (!owner || !repo || !path) {
      return NextResponse.json({ error: "Missing required params" }, { status: 400 });
    }

    const content = await fetchFileContent(owner, repo, path, branch);
    const summaryText = await summarizeContent(content, branch); // ✅ Direct function call

    return NextResponse.json({ summary: summaryText });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
