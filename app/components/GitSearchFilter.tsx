import React from "react";

export default function GitSearchFilter({ onSearch, onFilter, fileTypes }: { onSearch: (query: string) => void; onFilter: (type: string) => void; fileTypes: string[] }) {
  // Placeholder for search and filter UI
  return (
    <div className="w-full bg-white rounded-xl shadow p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center">
      <input
        className="flex-1 px-4 py-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-accent shadow bg-surface text-foreground placeholder-gray-400"
        type="text"
        placeholder="Search files..."
        onChange={e => onSearch(e.target.value)}
      />
      <select
        className="px-4 py-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-accent shadow bg-surface text-foreground"
        onChange={e => onFilter(e.target.value)}
      >
        <option value="">All Types</option>
        {fileTypes.map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
    </div>
  );
}