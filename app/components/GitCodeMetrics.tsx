import React from "react";

export default function GitCodeMetrics({ metrics }: { metrics: any }) {
  return (
    <div className="w-full bg-white rounded-xl shadow p-4 mb-6">
      <h3 className="text-xl font-semibold mb-2">Code Metrics</h3>
      {metrics ? (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-4">
            <div className="bg-gray-100 rounded p-2">
              <span className="font-semibold">Total Files:</span> {metrics.totalFiles}
            </div>
            <div className="bg-gray-100 rounded p-2">
              <span className="font-semibold">Total Lines:</span> {metrics.totalLines}
            </div>
            <div className="bg-gray-100 rounded p-2">
              <span className="font-semibold">Total Size:</span> {metrics.totalSize} bytes
            </div>
          </div>
          <div className="mt-2">
            <h4 className="font-semibold mb-1">Language Breakdown</h4>
            <ul className="list-disc pl-6">
              {metrics.languages && Object.entries(metrics.languages).map(([lang, info]: [string, any]) => (
                <li key={lang}>
                  <span className="font-semibold">{lang}:</span> {info.files} files, {info.lines} lines, {info.size} bytes
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-gray-400">No code metrics available.</div>
      )}
    </div>
  );
}