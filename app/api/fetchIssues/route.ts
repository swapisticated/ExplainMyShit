import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const stateParam = searchParams.get("state");
  const state: "all" | "open" | "closed" = (stateParam === "open" || stateParam === "closed" || stateParam === "all") ? stateParam : "all";
  const page = parseInt(searchParams.get("page") || "1");
  const per_page = parseInt(searchParams.get("per_page") || "10");

  if (!owner || !repo) {
    return NextResponse.json({ error: "Missing owner or repo" }, { status: 400 });
  }

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  try {
    const { data } = await octokit.issues.listForRepo({
      owner,
      repo,
      state,
      page,
      per_page,
    });

    const issues = data.map((issue) => ({
      id: issue.id,
      number: issue.number,
      title: issue.title,
      state: issue.state,
      created_at: issue.created_at,
      user: {
        login: issue.user?.login,
        avatar_url: issue.user?.avatar_url,
      },
      comments: issue.comments,
      url: issue.html_url,
      labels: issue.labels,
    }));

    return NextResponse.json({ issues });
  } 
   catch (e: unknown) {
        console.error("Error fetching commits:", e);
        if (e instanceof Error) {
            return NextResponse.json({ error: e.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Unknown error" }, { status: 500 });
    }
}