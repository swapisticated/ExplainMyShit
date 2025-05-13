import React, { useEffect, useState } from "react";

export default function GitCommitHistory({ commits, contributors, activityHeatmap }: { commits: any[]; contributors: any[]; activityHeatmap: any }) {
  const [showHeatmap, setShowHeatmap] = useState(true);

  return (
    <div className="w-full bg-white rounded-xl shadow p-4 mb-6">
      <h3 className="text-xl font-semibold mb-2">Commit History & Activity</h3>
      <div className="flex flex-col gap-4">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left">Hash</th>
                <th className="px-2 py-1 text-left">Message</th>
                <th className="px-2 py-1 text-left">Author</th>
                <th className="px-2 py-1 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {commits && commits.length > 0 ? (
                commits.slice(0, 20).map((commit: any) => (
                  <tr key={commit.sha} className="border-b">
                    <td className="px-2 py-1 font-mono">{commit.sha.substring(0, 7)}</td>
                    <td className="px-2 py-1">{commit.commit.message.split("\n")[0]}</td>
                    <td className="px-2 py-1">{commit.commit.author.name}</td>
                    <td className="px-2 py-1">{new Date(commit.commit.author.date).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="text-gray-400 px-2 py-2">No commits found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div>
          <button className="px-3 py-1 rounded bg-accent text-white mr-2" onClick={() => setShowHeatmap(!showHeatmap)}>
            {showHeatmap ? "Hide" : "Show"} Activity Heatmap
          </button>
        </div>
        {showHeatmap && activityHeatmap && (
          <div className="mt-2">
            {/* Render activity heatmap here, e.g. as SVG or using a library */}
            <img src={activityHeatmap} alt="Activity Heatmap" className="w-full max-w-lg mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
}