import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const {searchParams} = new URL(req.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const branch = searchParams.get('branch'); // Get branch parameter

    if (!owner || !repo) {
        return NextResponse.json({ error: 'Missing owner or repo' }, { status: 400 });
    }

    const octokit = new Octokit()

    try {
        // If branch is specified, use it for both readme and content requests
        const readmeOptions = { owner, repo };
        const contentOptions = { owner, repo, path: '' };
        
        if (branch) {
            Object.assign(readmeOptions, { ref: branch });
            Object.assign(contentOptions, { ref: branch });
        }

        const readme = await octokit.repos.getReadme(readmeOptions);
        const files = await octokit.repos.getContent(contentOptions);

        const readmeText = Buffer.from(
            readme.data.content,
            'base64'
        ).toString('utf-8');
      
        return NextResponse.json({
            readme: readmeText,
            files: files.data,
            branch: branch || 'default'
        });
    }
    catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
