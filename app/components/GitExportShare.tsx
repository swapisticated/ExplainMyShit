import React from "react";

export default function GitExportShare({ onExport, onShare }: { onExport: () => void; onShare: () => void }) {
  // Placeholder for export/share UI
  return (
    <div className="w-full bg-white rounded-xl shadow p-4 mb-6 flex gap-4 items-center">
      <button
        className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded shadow font-semibold transition-transform focus:outline-none focus:ring-2 focus:ring-accent"
        onClick={onExport}
      >
        Export as Image
      </button>
      <button
        className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded shadow font-semibold transition-transform focus:outline-none focus:ring-2 focus:ring-accent"
        onClick={onShare}
      >
        Share Link
      </button>
    </div>
  );
}