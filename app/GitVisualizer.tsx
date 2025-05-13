'use client'
'usestate'
import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), { ssr: false });
import { Octokit } from "@octokit/rest";

import GitCommitHistory from "./components/GitCommitHistory";
import GitDependencyGraph from "./components/GitDependencyGraph";
import GitFilePreview from "./components/GitFilePreview";
import GitContributorInsights from "./components/GitContributorInsights";
import GitBranchTagSelector from "./components/GitBranchTagSelector";
import GitSearchFilter from "./components/GitSearchFilter";
import GitExportShare from "./components/GitExportShare";
import GitCodeMetrics from "./components/GitCodeMetrics";
import GitIssuesPRs from "./components/GitIssuesPRs";

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".bmp", ".webp"];

function isImageFile(filename: string) {
  return IMAGE_EXTENSIONS.some(ext => filename.toLowerCase().endsWith(ext));
}

function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  // Supports https://github.com/owner/repo or git@github.com:owner/repo.git
  const httpsMatch = url.match(/github.com\/(.+?)\/(.+?)(.git)?$/);
  if (httpsMatch) {
    return { owner: httpsMatch[1], repo: httpsMatch[2].replace(/.git$/, "") };
  }
  const sshMatch = url.match(/git@github.com:(.+?)\/(.+?)(.git)?$/);
  if (sshMatch) {
    return { owner: sshMatch[1], repo: sshMatch[2].replace(/.git$/, "") };
  }
  return null;
}

const octokit = new Octokit({
  auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN || undefined
});

export default function GitVisualizer() {
  const [repoUrl, setRepoUrl] = useState("");
  const [graphData, setGraphData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Advanced feature states
  const [commits, setCommits] = useState<any[]>([]);
  const [contributors, setContributors] = useState<any[]>([]);
  const [activityHeatmap, setActivityHeatmap] = useState<any>(null);
  const [dependencies, setDependencies] = useState<any>(null);
  const [filePreview, setFilePreview] = useState<any>(null);
  const [fileMetadata, setFileMetadata] = useState<any>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [fileTypes, setFileTypes] = useState<string[]>([]);
  const [filteredType, setFilteredType] = useState<string>("");
  const [metrics, setMetrics] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [pullRequests, setPullRequests] = useState<any[]>([]);
  // Theme state
  const themes = [
    "light",
    "dark",
    "solarized",
    "dracula",
    "nord",
    "gruvbox",
    "monokai"
  ];
  const [theme, setTheme] = useState<string>(themes[0]);
  const [themeSwitcherOpen, setThemeSwitcherOpen] = useState(false);
  const themeSwitcherRef = useRef<HTMLDivElement>(null);
  // Contributor popover state
  const [hoveredContributor, setHoveredContributor] = useState<any | null>(null);
  const [popoverPos, setPopoverPos] = useState<{x: number, y: number} | null>(null);
  // Show more state for contributors and commits
  const [showAllContributors, setShowAllContributors] = useState(false);
  const [showAllCommits, setShowAllCommits] = useState(false);

  function handleContributorMouseEnter(contributor: any, e: React.MouseEvent) {
    setHoveredContributor(contributor);
    setPopoverPos({ x: e.clientX, y: e.clientY });
  }
  function handleContributorMouseLeave() {
    setHoveredContributor(null);
    setPopoverPos(null);
  }

  async function fetchRepoTree(owner: string, repo: string) {
    setLoading(true);
    setError("");
    try {
      const { data: repoData } = await octokit.repos.get({ owner, repo });
      const { data: refData } = await octokit.git.getRef({ owner, repo, ref: "heads/" + repoData.default_branch });
      const sha = refData.object.sha;
      const { data: treeData } = await octokit.git.getTree({ owner, repo, tree_sha: sha, recursive: "1" });
      return treeData.tree;
    } catch (e: any) {
      setError("Failed to fetch repo: " + (e.message || e.toString()));
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function fetchRepoMetrics(owner: string, repo: string) {
    try {
      const { data: repoData } = await octokit.repos.get({ owner, repo });
      const { data: refData } = await octokit.git.getRef({ owner, repo, ref: "heads/" + repoData.default_branch });
      const sha = refData.object.sha;
      const { data: treeData } = await octokit.git.getTree({ owner, repo, tree_sha: sha, recursive: "1" });
      let totalFiles = 0, totalLines = 0, totalSize = 0;
      const langStats: any = {};
      for (const item of treeData.tree) {
        if (item.type === "blob") {
          totalFiles++;
          totalSize += item.size || 0;
          let ext = '';
          if (item.path && typeof item.path === 'string') {
            const parts = item.path.split('/').pop()?.split('.') || [];
            if (parts.length > 1) {
              ext = parts.pop() || '';
            } else {
              ext = '';
            }
          }
          let lang = ext || 'Unknown';
          // Simple extension to language mapping
          if (["js", "jsx", "ts", "tsx"].includes(ext)) lang = "JavaScript/TypeScript";
          else if (["py"].includes(ext)) lang = "Python";
          else if (["java"].includes(ext)) lang = "Java";
          else if (["go"].includes(ext)) lang = "Go";
          else if (["rb"].includes(ext)) lang = "Ruby";
          else if (!ext) lang = "Unknown";
          if (!langStats[lang]) langStats[lang] = { files: 0, lines: 0, size: 0 };
          langStats[lang].files++;
          langStats[lang].size += item.size || 0;
        }
      }
      // Fetch lines for each file (limit for demo)
      let counted = 0;
      for (const item of treeData.tree) {
        if (item.type === "blob" && counted < 100) {
          try {
            // Skip likely binary files (images, etc.)
            if (!item.path || typeof item.path !== "string") {
              counted++;
              continue;
            }
            const lowerPath = item.path.toLowerCase();
            if ([".png", ".jpg", ".jpeg", ".gif", ".svg", ".bmp", ".webp", ".ico", ".pdf", ".zip", ".tar", ".gz", ".rar", ".7z", ".exe", ".dll", ".so", ".bin"].some(ext => lowerPath.endsWith(ext))) {
              counted++;
              continue;
            }
            const { data: fileData } = await octokit.repos.getContent({ owner, repo, path: item.path });
            let content = "";
            // Only proceed if fileData is an object and has a 'content' property
            if (
              fileData &&
              !Array.isArray(fileData) &&
              typeof fileData === "object" &&
              "content" in fileData &&
              typeof fileData.content === "string" &&
              /^[A-Za-z0-9+/=\r\n]+$/.test(fileData.content)
            ) {
              try {
                // Attempt to decode base64 content only if it looks valid
                content = "";
                try {
                  content = atob(fileData.content.replace(/\n/g, ""));
                } catch (decodeErr) {
                  counted++;
                  continue;
                }
                // Heuristic: skip if content has too many non-printable chars (binary)
                const nonPrintable = content.replace(/[\x20-\x7E\r\n\t]/g, "").length;
                if (nonPrintable > content.length * 0.2) {
                  counted++;
                  continue;
                }
                const lines = content.split("\n").length;
                totalLines += lines;
                let ext = '';
                if (item.path && typeof item.path === 'string') {
                  const parts = item.path.split('/').pop()?.split('.') || [];
                  if (parts.length > 1) {
                    ext = parts.pop() || '';
                  } else {
                    ext = '';
                  }
                }
                let lang = ext || 'Unknown';
                if (["js", "jsx", "ts", "tsx"].includes(ext)) lang = "JavaScript/TypeScript";
                else if (["py"].includes(ext)) lang = "Python";
                else if (["java"].includes(ext)) lang = "Java";
                else if (["go"].includes(ext)) lang = "Go";
                else if (["rb"].includes(ext)) lang = "Ruby";
                else if (!ext) lang = "Unknown";
                if (!langStats[lang]) langStats[lang] = { files: 0, lines: 0, size: 0 };
                langStats[lang].lines += lines;
              } catch {
                counted++;
                continue;
              }
            }
          } catch {}
          counted++;
        }
      }
      return { totalFiles, totalLines, totalSize, languages: langStats };
    } catch {
      return null;
    }
  }

  async function fetchIssues(owner: string, repo: string) {
    try {
      const { data } = await octokit.issues.listForRepo({ owner, repo, state: "open" });
      return data;
    } catch {
      return [];
    }
  }

  async function fetchPullRequests(owner: string, repo: string) {
    try {
      const { data } = await octokit.pulls.list({ owner, repo, state: "open" });
      return data;
    } catch {
      return [];
    }
  }

  async function fetchBranches(owner: string, repo: string) {
    try {
      const { data } = await octokit.repos.listBranches({ owner, repo });
      return data.map((branch: any) => branch.name);
    } catch {
      return [];
    }
  }

  async function fetchTags(owner: string, repo: string) {
    try {
      const { data } = await octokit.repos.listTags({ owner, repo });
      return data.map((tag: any) => tag.name);
    } catch {
      return [];
    }
  }

  async function fetchContributors(owner: string, repo: string) {
    try {
      const { data } = await octokit.repos.listContributors({ owner, repo });
      return data;
    } catch {
      return [];
    }
  }

  async function fetchCommits(owner: string, repo: string, branch: string) {
    try {
      const { data } = await octokit.repos.listCommits({ owner, repo, sha: branch });
      return data;
    } catch {
      return [];
    }
  }

  async function handleVisualize() {
    const parsed = parseRepoUrl(repoUrl);
    if (!parsed) {
      setError("Invalid GitHub repo URL");
      return;
    }
    setLoading(true);
    const tree = await fetchRepoTree(parsed.owner, parsed.repo);
    if (tree) {
      setGraphData(buildGraph(tree));
      fetchRepoMetrics(parsed.owner, parsed.repo).then(setMetrics);
      fetchDependencies(parsed.owner, parsed.repo).then(setDependencies);
      fetchIssues(parsed.owner, parsed.repo).then(setIssues);
      fetchPullRequests(parsed.owner, parsed.repo).then(setPullRequests);
      fetchBranches(parsed.owner, parsed.repo).then(branches => {
        setBranches(branches);
        setSelectedBranch(branches[0] || "");
        if (branches[0]) {
          fetchCommits(parsed.owner, parsed.repo, branches[0]).then(setCommits);
        }
      });
      fetchTags(parsed.owner, parsed.repo).then(setTags);
      fetchContributors(parsed.owner, parsed.repo).then(setContributors);
    }
    setLoading(false);
  }

  function buildGraph(tree: any[]) {
    // Build nodes and links for force-graph
    const nodes: any[] = [];
    const links: any[] = [];
    const nodeMap: Record<string, any> = {};
    // Always add root node
    nodes.push({ id: "root", name: repoUrl, group: "root" });
    nodeMap["root"] = nodes[0];
    tree.forEach(item => {
      const id = item.path;
      const parent = id.includes("/") ? id.substring(0, id.lastIndexOf("/")) : "root";
      if (!nodeMap[id]) {
        nodeMap[id] = { id, name: item.path.split("/").pop(), group: item.type };
        nodes.push(nodeMap[id]);
      }
      if (!nodeMap[parent]) {
        nodeMap[parent] = { id: parent, name: parent, group: "folder" };
        nodes.push(nodeMap[parent]);
      }
      links.push({ source: parent, target: id });
    });
    return { nodes, links };
  }

  return (
    <main className={`min-h-screen w-full bg-gradient-to-br from-[#0d1117] to-[#23272e] font-sans theme-${theme} flex flex-col items-center`} aria-label="GitHub Dashboard" role="main">
      {/* Repo Header */}
      <section className="w-full max-w-4xl mt-8 px-4">
        <div className="bg-[#181c23] border border-[#23272e] rounded-2xl shadow-2xl p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <svg width="44" height="44" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path fill="#6e40c9" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg>
            <div>
              <div className="text-white text-3xl font-bold tracking-tight flex items-center gap-2"><span className="material-icons text-[#6e40c9] text-2xl">dashboard</span>ExplainMyShit</div>
              <div className="text-gray-400 text-base mt-1">Visualize and explore any public GitHub repository</div>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <input
              className="w-full md:w-80 px-4 py-2 rounded border border-[#30363d] focus:outline-none focus:ring-2 focus:ring-[#6e40c9] shadow bg-[#23272e] text-gray-100 placeholder-gray-400"
              type="text"
              placeholder="Enter public GitHub repo URL"
              value={repoUrl}
              aria-label="GitHub repository URL"
              onChange={e => setRepoUrl(e.target.value)}
            />
            <button
              className="bg-[#6e40c9] hover:bg-[#8f5fff] text-white px-6 py-2 rounded shadow font-semibold transition-transform focus:outline-none focus:ring-2 focus:ring-[#6e40c9] mt-2"
              onClick={handleVisualize}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "Loading..." : "Visualize"}
            </button>
            {error && <div className="text-red-400 font-semibold mt-2">{error}</div>}
          </div>
        </div>
      </section>
      {/* Divider */}
      <div className="w-full max-w-4xl h-px bg-[#23272e] my-10" />
      {/* Metrics Summary */}
      <section className="w-full max-w-4xl px-4 mb-10">
        <div className="bg-[#181c23] border border-[#23272e] rounded-2xl shadow-xl p-6 flex flex-wrap gap-6 justify-between items-center">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="flex items-center gap-1 bg-[#23272e] text-[#6e40c9] px-4 py-2 rounded-lg text-base font-semibold"><span className="material-icons text-lg">insert_drive_file</span>Files: <span className="font-bold text-white ml-1">{metrics?.totalFiles ?? '-'}</span></span>
            <span className="flex items-center gap-1 bg-[#23272e] text-[#6e40c9] px-4 py-2 rounded-lg text-base font-semibold"><span className="material-icons text-lg">format_align_left</span>Lines: <span className="font-bold text-white ml-1">{metrics?.totalLines ?? '-'}</span></span>
            <span className="flex items-center gap-1 bg-[#23272e] text-[#6e40c9] px-4 py-2 rounded-lg text-base font-semibold"><span className="material-icons text-lg">storage</span>Size: <span className="font-bold text-white ml-1">{metrics?.totalSize ? (metrics.totalSize / 1024).toFixed(1) + ' KB' : '-'}</span></span>
          </div>
          <div className="flex flex-wrap gap-2">
            {metrics && metrics.languages && Object.keys(metrics.languages).map(lang => (
              <span key={lang} className="bg-[#6e40c9]/20 text-[#6e40c9] px-3 py-1 rounded-full text-xs font-semibold mr-2 mb-2 border border-[#6e40c9]">{lang}</span>
            ))}
          </div>
        </div>
      </section>
      {/* Divider */}
      <div className="w-full max-w-4xl h-px bg-[#23272e] my-10" />
      {/* Graph Visualization */}
      <section className="w-full max-w-4xl px-4 mb-10">
        <div className="bg-[#181c23] border border-[#23272e] rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2"><span className="material-icons text-[#6e40c9]">account_tree</span>Repository Structure</h2>
          <div className="w-full overflow-x-auto">
            <div className="min-w-[350px] h-[400px] bg-[#0d1117] rounded-xl shadow-inner flex items-center justify-center border border-[#23272e]">
              {graphData ? (
                <ForceGraph3D
                  graphData={graphData}
                  nodeLabel={node => node.name}
                  nodeAutoColorBy="group"
                  linkDirectionalParticles={2}
                  linkDirectionalParticleSpeed={0.005}
                  width={700}
                  height={400}
                  onNodeClick={handleNodeClick}
                />
              ) : (
                <span className="text-gray-500">No visualization yet. Enter a repo URL and click Visualize.</span>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* Divider */}
      <div className="w-full max-w-4xl h-px bg-[#23272e] my-10" />
      {/* Commits & Contributors */}
      <section className="w-full max-w-4xl px-4 mb-10 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-[#181c23] border border-[#23272e] rounded-2xl shadow-xl p-6 flex flex-col">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2"><span className="material-icons text-[#6e40c9]">history</span>Commits</h2>
          <div className="flex-1">
            <GitCommitHistory commits={showAllCommits ? commits : commits.slice(0, 10)} contributors={contributors} activityHeatmap={activityHeatmap} />
          </div>
          {commits.length > 10 && (
            <button className="mt-4 self-center text-[#6e40c9] hover:underline text-sm font-semibold" onClick={() => setShowAllCommits(v => !v)}>
              {showAllCommits ? 'Show Less' : 'Show More'}
            </button>
          )}
        </div>
        <div className="bg-[#181c23] border border-[#23272e] rounded-2xl shadow-xl p-6 flex flex-col">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2"><span className="material-icons text-[#6e40c9]">group</span>Contributors</h2>
          <div className="flex flex-wrap gap-4">
            {(contributors && contributors.length > 0 ? (showAllContributors ? contributors : contributors.slice(0, 12)) : []).map((c, i) => (
              <a
                key={c.id || i}
                href={c.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center group"
                title={c.login}
              >
                <img src={c.avatar_url} alt={c.login} className="w-12 h-12 rounded-full border-2 border-[#6e40c9] shadow group-hover:scale-110 transition-all" />
                <span className="text-xs text-gray-300 mt-1 group-hover:text-white transition-all">{c.login}</span>
              </a>
            ))}
            {(!contributors || contributors.length === 0) && <span className="text-gray-400 text-xs">No contributors</span>}
          </div>
          {contributors.length > 12 && (
            <button className="mt-4 self-center text-[#6e40c9] hover:underline text-sm font-semibold" onClick={() => setShowAllContributors(v => !v)}>
              {showAllContributors ? 'Show Less' : 'Show More'}
            </button>
          )}
        </div>
      </section>
      {/* Divider */}
      <div className="w-full max-w-4xl h-px bg-[#23272e] my-10" />
      {/* Dependencies */}
      <section className="w-full max-w-4xl px-4 mb-10">
        <div className="bg-[#181c23] border border-[#23272e] rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2"><span className="material-icons text-[#6e40c9]">device_hub</span>Dependencies</h2>
          <GitDependencyGraph dependencies={dependencies} />
        </div>
      </section>
      {/* Divider */}
      <div className="w-full max-w-4xl h-px bg-[#23272e] my-10" />
      {/* Issues & PRs */}
      <section className="w-full max-w-4xl px-4 mb-10">
        <div className="bg-[#181c23] border border-[#23272e] rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2"><span className="material-icons text-[#6e40c9]">bug_report</span>Issues & Pull Requests</h2>
          <GitIssuesPRs issues={issues} pullRequests={pullRequests} />
        </div>
      </section>
      {/* Floating Theme Switcher */}
      <div
        className="fixed bottom-8 right-8 z-50"
      >
        <button
          className="bg-[#6e40c9] hover:bg-[#8f5fff] text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-2xl focus:outline-none focus:ring-4 focus:ring-[#6e40c9]/40 transition-all duration-200"
          onClick={() => setThemeSwitcherOpen(v => !v)}
          aria-label="Switch Theme"
        >
          <span className="material-icons">palette</span>
        </button>
        {themeSwitcherOpen && (
          <div className="absolute bottom-16 right-0 bg-[#23272e] border border-[#6e40c9] rounded-xl shadow-2xl p-4 flex flex-col gap-2 animate-fade-in">
            {themes.map(t => (
              <button
                key={t}
                className={`px-4 py-2 rounded text-left text-sm font-medium transition-colors ${theme === t ? 'bg-[#6e40c9] text-white' : 'bg-[#21262d] text-gray-200 hover:bg-[#6e40c9]/30'}`}
                onClick={() => { setTheme(t); setThemeSwitcherOpen(false); }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>
      <footer className="w-full text-center py-6 text-gray-400 bg-[#161b22] border-t border-[#23262d] z-10 mt-10">
        <span>Made with ❤️ | Inspired by GitHub | ExplainMyShit &copy; {new Date().getFullYear()}</span>
      </footer>
    </main>
  );
}

function handleNodeClick(node: any) {
  // Placeholder: implement node click logic if needed
  // For now, just log the node
  console.log("Node clicked:", node);
}

async function fetchDependencies(owner: string, repo: string) {
  // Placeholder: implement actual dependency fetching logic
  // For now, return a mock structure
  return { nodes: [], links: [] };
}