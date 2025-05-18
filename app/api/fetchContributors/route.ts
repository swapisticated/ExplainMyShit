import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');

    if (!owner || !repo) {
        return NextResponse.json({ error: 'Missing owner or repo' }, { status: 400 });
    }

    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN || undefined
    });

    try {
        const response = await octokit.repos.listContributors({
            owner,
            repo,
            per_page: 100
        });

        const contributors = response.data.map((contributor) => ({
            login: contributor.login,
            avatar_url: contributor.avatar_url,
            contributions: contributor.contributions,
            html_url: contributor.html_url,
        }));

        return NextResponse.json({ contributors });
    } 
     catch (e: unknown) {
        console.error("Error fetching commits:", e);
        if (e instanceof Error) {
            return NextResponse.json({ error: e.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Unknown error" }, { status: 500 });
    }
}