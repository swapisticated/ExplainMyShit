import React from "react";

export default function GitDependencyGraph({ dependencies }: { dependencies: any }) {
  return (
    <div className="w-full bg-white rounded-xl shadow p-4 mb-6">
      <h3 className="text-xl font-semibold mb-2">Dependency Graph</h3>
      {dependencies && dependencies.nodes && dependencies.links ? (
        <div className="overflow-x-auto">
          {/* Render a simple list of dependencies as a placeholder for a graph visualization */}
          <ul className="list-disc pl-6">
            {dependencies.nodes.map((node: any) => (
              <li key={node.id}>{node.name}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-gray-500">No dependency data available.</div>
      )}
    </div>
  );
}