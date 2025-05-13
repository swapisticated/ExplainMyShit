import React from "react";

export default function GitFilePreview({ file, metadata }: { file: any; metadata: any }) {
  return (
    <div className="w-full bg-white rounded-xl shadow p-4 mb-6">
      <h3 className="text-xl font-semibold mb-2">File Preview</h3>
      {file ? (
        <div>
          <div className="mb-2 font-mono text-sm text-gray-700">{file.path}</div>
          {file.content ? (
            file.isImage ? (
              <img src={file.content} alt={file.path} className="max-w-full rounded border" />
            ) : (
              <pre className="bg-gray-100 rounded p-2 overflow-x-auto text-xs max-h-64 whitespace-pre-wrap">{file.content}</pre>
            )
          ) : (
            <div className="text-gray-400">No file content available.</div>
          )}
          {metadata && (
            <div className="mt-2 text-xs text-gray-500">
              <div>Size: {metadata.size} bytes</div>
              <div>Last Modified: {metadata.lastModified ? new Date(metadata.lastModified).toLocaleString() : "-"}</div>
              <div>Type: {metadata.type || "-"}</div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-400">No file selected.</div>
      )}
    </div>
  );
}