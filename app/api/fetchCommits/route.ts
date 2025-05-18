import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");
    const branch = searchParams.get("branch");
    const per_page = parseInt(searchParams.get("per_page") || "5");
    const page = parseInt(searchParams.get("page") || "1");

    if (!owner || !repo) {
        return NextResponse.json({ error: "Missing owner or repo" }, { status: 400 });
    }

    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN || undefined,
    });

    try {
        const response = await octokit.repos.listCommits({
            owner,
            repo,
            sha: branch || undefined,
            per_page,
            page,
        });

        const commits = response.data.map((commit) => ({
            sha: commit.sha,
            message: commit.commit.message,
            author: commit.commit.author?.name,
            date: commit.commit.author?.date,
            url: commit.html_url,
            avatar: commit.author?.avatar_url,
        }));

        return NextResponse.json({
            commits,
            page,
            per_page,
            hasNextPage: response.data.length === per_page, // crude next page check
        });
        // ...existing code...
    } catch (e: unknown) {
        console.error("Error fetching commits:", e);
        if (e instanceof Error) {
            return NextResponse.json({ error: e.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Unknown error" }, { status: 500 });
    }
}
