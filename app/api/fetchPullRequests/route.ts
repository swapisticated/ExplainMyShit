import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const state = (["all", "open", "closed"].includes(searchParams.get("state") || "")
    ? (searchParams.get("state") as "all" | "open" | "closed")
    : "all");
  const page = parseInt(searchParams.get("page") || "1");
  const per_page = parseInt(searchParams.get("per_page") || "10");

  if (!owner || !repo) {
    return NextResponse.json({ error: "Missing owner or repo" }, { status: 400 });
  }

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  try {
    const { data } = await octokit.pulls.list({
      owner,
      repo,
      state,
      page,
      per_page,
    });

    const pullRequests = data.map((pr) => ({
      id: pr.id,
      number: pr.number,
      title: pr.title,
      state: pr.state,
      created_at: pr.created_at,
      user: {
        login: pr.user?.login,
        avatar_url: pr.user?.avatar_url,
      },
      // comments: pr.comments, // Removed because 'comments' does not exist on the PR object
      url: pr.html_url,
      merged: pr.merged_at ? true : false,
      labels: pr.labels,
      draft: pr.draft,
    }));

    return NextResponse.json({ pullRequests });
  }  catch (e: unknown) {
        console.error("Error fetching commits:", e);
        if (e instanceof Error) {
            return NextResponse.json({ error: e.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Unknown error" }, { status: 500 });
    }
}