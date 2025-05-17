import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const {searchParams} = new URL(req.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const branch = searchParams.get('branch');
    const depth = parseInt(searchParams.get('depth') || '4'); // Control recursion depth

    if (!owner || !repo) {
        return NextResponse.json({ error: 'Missing owner or repo' }, { status: 400 });
    }

    // Use GitHub token from environment variables if available
    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN || undefined
    })

    try {
        // Fetch the repo contents recursively
        const repoContents = await fetchRepoContentsRecursively(octokit, owner, repo, branch, '', depth);
        
        // Only fetch readme at the root level
        let readmeText = '';
        try {
            const readmeOptions = { owner, repo };
            if (branch) {
                Object.assign(readmeOptions, { ref: branch });
            }
            const readme = await octokit.repos.getReadme(readmeOptions);
            readmeText = Buffer.from(readme.data.content, 'base64').toString('utf-8');
        } catch (error) {
            console.error('Error fetching README:', error);
        }
        
        return NextResponse.json({
            readme: readmeText,
            files: repoContents,
            branch: branch || 'default'
        });
    }
    catch (e: any) {
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