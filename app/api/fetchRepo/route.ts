import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";
import pLimit from "p-limit";

const limit = pLimit(5); // Limit concurrent GitHub API calls


export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");
    const branch = searchParams.get("branch");
    const depth = Math.min(parseInt(searchParams.get("depth") || "2"), 5); // cap depth
    const path = searchParams.get("path") || ""; // allow targeting specific path

    if (!owner || !repo) {
        return NextResponse.json({ error: "Missing owner or repo" }, { status: 400 });
    }

    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN || undefined,
    });

    try {
        // Fetch repo contents
        const repoContents = await fetchRepoContentsRecursively(
            octokit,
            owner,
            repo,
            branch,
            path,
            depth
        );

        // Fetch README from root
        let readmeText = "";
        try {
            const readmeOptions: any = { owner, repo };
            if (branch) readmeOptions.ref = branch;
            const readme = await octokit.repos.getReadme(readmeOptions);
            readmeText = Buffer.from(readme.data.content, "base64").toString("utf-8");
        } catch (error) {
            console.warn("README not found or error fetching it:", error);
        }

        return NextResponse.json({
            readme: readmeText,
            files: repoContents,
            branch: branch || "default",
        });
    } catch (e: any) {
        console.error("Fetch failed:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
// Recursive function to fetch repository contents including subdirectories
async function fetchRepoContentsRecursively(
    octokit: Octokit,
    owner: string,
    repo: string,
    branch: string | null,
    path: string = '',
    depth: number = 2,
    currentDepth: number = 0
): Promise<any[]> {
    // Stop recursion if we've reached max depth
    if (currentDepth >= depth) {
        return [];
    }
    
    // Build request options
    const options: any = { owner, repo, path };
    if (branch) {
        options.ref = branch;
    }
    
    try {
        // Fetch content at current path
        const { data } = await octokit.repos.getContent(options);
        const contents = Array.isArray(data) ? data : [data];
        
        // For each directory, recursively fetch its contents
        for (let i = 0; i < contents.length; i++) {
            const item = contents[i];
            if (item.type === 'dir') {
                const subDirContents = await fetchRepoContentsRecursively(
                    octokit,
                    owner,
                    repo,
                    branch,
                    item.path,
                    depth,
                    currentDepth + 1
                );
                // Add children property to the directory
                (item as any).children = subDirContents;
            }
        }        
        return contents;
    } catch (error) {
        console.error(`Error fetching contents at path ${path}:`, error);
        return [];
    }
}