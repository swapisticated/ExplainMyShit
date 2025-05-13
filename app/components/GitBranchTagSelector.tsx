import React from "react";

export default function GitBranchTagSelector({ branches, tags, onSelect }: { branches: string[]; tags: string[]; onSelect: (type: 'branch' | 'tag', name: string) => void }) {
  return (
    <div className="w-full bg-white rounded-xl shadow p-4 mb-6 flex gap-4 items-center">
      <div>
        <label className="font-semibold mr-2">Branch:</label>
        <select
          className="px-2 py-1 rounded border border-border focus:outline-none focus:ring-2 focus:ring-accent"
          onChange={e => onSelect('branch', e.target.value)}
        >
          <option value="">Select branch</option>
          {branches.map(branch => (
            <option key={branch} value={branch}>{branch}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="font-semibold mr-2">Tag:</label>
        <select
          className="px-2 py-1 rounded border border-border focus:outline-none focus:ring-2 focus:ring-accent"
          onChange={e => onSelect('tag', e.target.value)}
        >
          <option value="">Select tag</option>
          {tags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>
    </div>
  );
}