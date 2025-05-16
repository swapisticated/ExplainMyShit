"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { MessageSquare, Activity } from "lucide-react"

type User = {
  login: string
  avatar_url: string
}

type Issue = {
  id: number
  number: number
  title: string
  state: string
  created_at: string
  user: User
  comments: number
  url: string
}

type PullRequest = Issue & {
  merged: boolean
}

type Props = {
  owner: string
  repo: string
}

const RepoActivity: React.FC<Props> = ({ owner, repo }) => {
  const [issues, setIssues] = useState<Issue[]>([])
  const [prs, setPRs] = useState<PullRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"issues" | "prs">("issues")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [issuesRes, prsRes] = await Promise.all([
          axios.get(`/api/fetchIssues?owner=${owner}&repo=${repo}&per_page=5`),
          axios.get(`/api/fetchPullRequests?owner=${owner}&repo=${repo}&per_page=5`),
        ])
        setIssues(issuesRes.data.issues)
        setPRs(prsRes.data.pullRequests)
      } catch (err: any) {
        setError(err.message || "Failed to fetch repository activity")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [owner, repo])

  const ActivityItem = ({ item, type }: { item: Issue | PullRequest; type: "issue" | "pr" }) => (
    <div
      className="flex items-start gap-3 p-3 rounded-md bg-[rgba(0,5,20,0.5)] border border-[rgba(255,255,255,0.03)] 
                    hover:border-[rgba(255,255,255,0.1)] transition-all duration-200 transform hover:-translate-y-0.5"
    >
      <img
        src={item.user.avatar_url || "/placeholder.svg"}
        alt={item.user.login}
        className="w-8 h-8 rounded-full border border-[rgba(255,255,255,0.1)]"
      />
      <div className="flex-1 min-w-0">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-slate-200 hover:text-white truncate block transition-colors"
        >
          #{item.number} {item.title}
        </a>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              item.state === "open" ? "bg-emerald-900/20 text-emerald-300" : "bg-slate-800/40 text-slate-300"
            }`}
          >
            {item.state}
          </span>
          {"merged" in item && item.merged && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-900/20 text-indigo-300">merged</span>
          )}
          <span className="text-xs text-slate-400">
            by {item.user.login} • {new Date(item.created_at).toLocaleDateString()}
          </span>
          {item.comments > 0 && (
            <span className="text-xs text-slate-400 flex items-center">
              <MessageSquare className="w-3 h-3 mr-1" />
              {item.comments}
            </span>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-[rgba(0,10,30,0.4)] backdrop-blur-md rounded-lg p-4 border border-[rgba(255,255,255,0.05)] h-full">
      <h2 className="text-lg font-light tracking-wide mb-4 text-slate-100 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-slate-300" />
        Recent Activity
      </h2>

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setActiveTab("issues")}
          className={`text-sm px-4 py-2 rounded-md transition-all duration-200 ${
            activeTab === "issues"
              ? "bg-slate-800/50 text-slate-100 border border-slate-700/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Issues
        </button>
        <button
          onClick={() => setActiveTab("prs")}
          className={`text-sm px-4 py-2 rounded-md transition-all duration-200 ${
            activeTab === "prs"
              ? "bg-slate-800/50 text-slate-100 border border-slate-700/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Pull Requests
        </button>
      </div>

      {loading ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0">
                <div className="w-8 h-8 border-2 border-slate-700 border-t-slate-300 rounded-full animate-spin"></div>
              </div>
            </div>
            <span className="text-sm text-slate-400 animate-pulse">Loading activity...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {activeTab === "issues"
            ? issues.map((issue) => <ActivityItem key={issue.id} item={issue} type="issue" />)
            : prs.map((pr) => <ActivityItem key={pr.id} item={pr} type="pr" />)}

          {(activeTab === "issues" && issues.length === 0) || (activeTab === "prs" && prs.length === 0) ? (
            <div className="text-center py-8 text-slate-400">
              No {activeTab === "issues" ? "issues" : "pull requests"} found
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default RepoActivity
