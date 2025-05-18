"use client"
import { motion } from "framer-motion"
import { FileText, Folder, Info } from "lucide-react"
import ReactMarkdown from "react-markdown"
import type { RepoData } from "@/utils/graphData"

interface RepoSummaryProps {
  repoData: RepoData
  repoUrl: string
}

const RepoSummary = ({ repoData, repoUrl }: RepoSummaryProps) => {
  // Extract repository name from URL
  const repoName = repoUrl.split("/").pop() || "Repository"

  // Count files by type
  const fileTypes = repoData.files.reduce((acc: Record<string, number>, file) => {
    if (file.type === "dir") {
      acc["Directories"] = (acc["Directories"] || 0) + 1
    } else {
      const ext = file.name.split(".").pop() || "Other"
      acc[ext] = (acc[ext] || 0) + 1
    }
    return acc
  }, {})

  // Get total size
  const totalSize = repoData.files.reduce((sum, file) => sum + file.size, 0)

  // Format size
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="bg-[rgba(0,10,30,0.4)] backdrop-blur-md rounded-lg p-6 border border-[rgba(255,255,255,0.05)] shadow-lg"
    >
      <h2 className="text-xl font-light tracking-wide mb-4 text-slate-100 flex items-center">
        <Info className="w-5 h-5 mr-2 text-slate-300" />
        Repository Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-light mb-3 text-slate-200">Summary</h3>
          <div className="space-y-3 text-sm">
            <p className="text-slate-300 flex justify-between">
              <span className="text-slate-400">Repository:</span>
              <span>{repoName}</span>
            </p>
            <p className="text-slate-300 flex justify-between">
              <span className="text-slate-400">Branch:</span>
              <span>{repoData.branch || "default"}</span>
            </p>
            <p className="text-slate-300 flex justify-between">
              <span className="text-slate-400">Files:</span>
              <span>{repoData.files.filter((f) => f.type === "file").length}</span>
            </p>
            <p className="text-slate-300 flex justify-between">
              <span className="text-slate-400">Directories:</span>
              <span>{repoData.files.filter((f) => f.type === "dir").length}</span>
            </p>
            <p className="text-slate-300 flex justify-between">
              <span className="text-slate-400">Total Size:</span>
              <span>{formatSize(totalSize)}</span>
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-light mb-3 text-slate-200">File Types</h3>
          <div className="space-y-3">
            {Object.entries(fileTypes)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm flex items-center">
                    {type === "Directories" ? (
                      <Folder className="w-4 h-4 mr-2 text-slate-400" />
                    ) : (
                      <FileText className="w-4 h-4 mr-2 text-slate-400" />
                    )}
                    {type}
                  </span>
                  <span className="text-slate-200 font-light">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {repoData.readme && (
        <div className="mt-6">
          <h3 className="text-lg font-light mb-3 text-slate-200">README Preview</h3>
          <div className="bg-[rgba(0,5,20,0.5)] rounded-md p-4 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>
                {`${repoData.readme.slice(0, 500)}${repoData.readme.length > 500 ? "..." : ""}`}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default RepoSummary
