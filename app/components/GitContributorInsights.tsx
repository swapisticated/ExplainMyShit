import React from "react";

export default function GitContributorInsights({ contributors }: { contributors: any[] }) {
  return (
    <div className="w-full bg-white rounded-xl shadow p-4 mb-6">
      <h3 className="text-xl font-semibold mb-2">Contributor Insights</h3>
      <div className="flex flex-col gap-2">
        {contributors && contributors.length > 0 ? (
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left">Name</th>
                <th className="px-2 py-1 text-left">Commits</th>
                <th className="px-2 py-1 text-left">Last Commit</th>
              </tr>
            </thead>
            <tbody>
              {contributors.map((contributor: any) => (
                <tr key={contributor.login} className="border-b">
                  <td className="px-2 py-1 flex items-center gap-2">
                    <img src={contributor.avatar_url} alt={contributor.login} className="w-6 h-6 rounded-full" />
                    <span>{contributor.login}</span>
                  </td>
                  <td className="px-2 py-1">{contributor.contributions}</td>
                  <td className="px-2 py-1">{contributor.lastCommit ? new Date(contributor.lastCommit).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-gray-400">No contributor data found.</div>
        )}
      </div>
    </div>
  );
}