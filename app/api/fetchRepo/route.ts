import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";

export async function GET(req: Request) {

    const {searchParams} = new URL(req.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');


    if (!owner || !repo) {
        return NextResponse.json({ error: 'Missing owner or repo' }, { status: 400 });
    }

    const octokit = new Octokit()

    try{
        const readme = await octokit.repos.getReadme({ owner, repo })
        const files = await octokit.repos.getContent({ owner, repo, path: '' })

        const readmeText = Buffer.from(
            readme.data.content,
            'base64'
          ).toString('utf-8')
      
        return NextResponse.json({
            readme: readmeText,
            files: files.data,
          })
    }
    catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
