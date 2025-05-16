"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { Users } from "lucide-react"

type Contributor = {
  login: string
  avatar_url: string
  contributions: number
  html_url: string
}

type Props = {
  owner: string
  repo: string
}

const TopContributors: React.FC<Props> = ({ owner, repo }) => {
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchContributors = async () => {
      setLoading(true)
      try {
        const res = await axios.get("/api/fetchContributors", {
          params: { owner, repo },
        })
        // Sort by number of contributions
        const sortedContributors = res.data.contributors
          .sort((a: Contributor, b: Contributor) => b.contributions - a.contributions)
          .slice(0, 10) // Get top 10 contributors
        setContributors(sortedContributors)
      } catch (err: any) {
        setError(err.message || "Failed to fetch contributors")
      } finally {
        setLoading(false)
      }
    }

    fetchContributors()
  }, [owner, repo])

  return (
    <div className="bg-[rgba(0,10,30,0.4)] backdrop-blur-md rounded-lg p-4 border border-[rgba(255,255,255,0.05)] h-full">
      <h2 className="text-lg font-light tracking-wide mb-4 text-slate-100 flex items-center">
        <Users className="w-5 h-5 mr-2 text-slate-300" />
        Top Contributors
      </h2>

      {loading ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-slate-700 border-t-slate-300 rounded-full animate-spin"></div>
          </div>
        </div>
      ) : error ? (
        <div className="text-sm text-red-300">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {contributors.map((contributor, index) => (
            <a
              key={contributor.login}
              href={contributor.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 p-3 rounded-md ${
                index < 3 ? "bg-[rgba(0,20,60,0.4)]" : "bg-[rgba(0,5,20,0.5)]"
              } border border-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.1)] transition-all duration-200`}
            >
              <div className="relative">
                <img
                  src={contributor.avatar_url || "/placeholder.svg"}
                  alt={contributor.login}
                  className="w-10 h-10 rounded-full border border-[rgba(255,255,255,0.1)]"
                />
                {index < 3 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-slate-800 text-xs font-medium text-white border border-[rgba(255,255,255,0.1)]">
                    {index + 1}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-light text-slate-200 text-sm truncate">{contributor.login}</p>
                <p className="text-xs text-slate-400">{contributor.contributions} commits</p>
              </div>
            </a>
          ))}

          {contributors.length === 0 && (
            <div className="col-span-2 text-center py-8 text-slate-400">No contributors found</div>
          )}
        </div>
      )}
    </div>
  )
}

export default TopContributors
