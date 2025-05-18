"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { GitCommit, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
type Commit = {
  sha: string
  message: string
  author: string
  date: string
  url: string
  avatar: string
}

type Props = {
  owner: string
  repo: string
  branch?: string
  perPage?: number
}

interface CommitResponse {
  commits: Commit[]
  page: number
  per_page: number
  hasNextPage: boolean
}

const CommitHistory: React.FC<Props> = ({ owner, repo, branch = "", perPage = 5 }) => {
  const [commits, setCommits] = useState<Commit[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchCommits = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await axios.get<CommitResponse>("/api/fetchCommits", {
          params: {
            owner,
            repo,
            branch,
            page,
            per_page: perPage,
          },
        })
        setCommits(res.data.commits)
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch commits"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }
    fetchCommits()
  }, [page, owner, repo, branch, perPage])

  return (
    <div className="bg-[rgba(0,10,30,0.4)] custom-scrollbar backdrop-blur-md rounded-lg p-4 border border-[rgba(255,255,255,0.05)] h-full">
      <h2 className="text-lg font-light tracking-wide mb-4 text-slate-100 flex items-center">
        <GitCommit className="w-5 h-5 mr-2 text-slate-300" />
        Commit History
      </h2>

      <div className="min-h-[300px]">
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0">
                  <div className="w-8 h-8 border-2 border-slate-700 border-t-slate-300 rounded-full animate-spin"></div>
                </div>
              </div>
              <span className="text-sm text-slate-400 animate-pulse">Loading commits...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-sm text-red-300">{error}</div>
        ) : commits.length === 0 ? (
          <div className="text-center py-8 text-slate-400">No commits found</div>
        ) : (
          <ul className="space-y-2 custom-scrollbar max-h-[300px] overflow-y-auto ">
            {commits.map((commit) => (
              <li
                key={commit.sha}
                className="flex items-start gap-3 p-3 rounded-md bg-[rgba(0,5,20,0.5)] border border-[rgba(255,255,255,0.03)] 
                hover:border-[rgba(255,255,255,0.1)] transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <div className="relative w-8 h-8">
                  <Image
                    src={commit.avatar || "/default-avatar.png"}
                    alt={commit.author}
                    width={32}
                    height={32}
                    className="rounded-full border border-[rgba(255,255,255,0.1)]"
                    unoptimized // Add this if the avatars are from GitHub's CDN
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-light text-slate-200 text-sm truncate">{commit.author}</span>
                    <span className="text-slate-400 text-xs">{new Date(commit.date).toLocaleDateString()}</span>
                  </div>
                  <a
                    href={commit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-white transition-colors duration-200 text-sm 
                    truncate block mt-0.5"
                  >
                    {commit.message}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-between items-center mt-3 pt-2 border-t border-[rgba(255,255,255,0.05)]">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          className="px-3 py-1.5 text-sm rounded-md bg-[rgba(0,5,20,0.5)] text-slate-300 
          border border-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.1)] disabled:opacity-40 
          disabled:cursor-not-allowed transition-all duration-200 flex items-center"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>
        <span className="text-xs text-slate-400">Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1.5 text-sm rounded-md bg-[rgba(0,5,20,0.5)] text-slate-300 
          border border-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.1)] transition-all duration-200 flex items-center"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  )
}

export default CommitHistory
