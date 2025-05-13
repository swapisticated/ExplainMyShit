'use client'

import React from 'react';
import { RepoData } from '@/utils/graphData';
import { motion } from 'framer-motion';

interface RepoSummaryProps {
  repoData: RepoData;
  repoUrl: string;
}

const RepoSummary = ({ repoData, repoUrl }: RepoSummaryProps) => {
  // Extract repository name from URL
  const repoName = repoUrl.split('/').pop() || 'Repository';
  
  // Count files by type
  const fileTypes = repoData.files.reduce((acc: Record<string, number>, file) => {
    if (file.type === 'dir') {
      acc['Directories'] = (acc['Directories'] || 0) + 1;
    } else {
      const ext = file.name.split('.').pop() || 'Other';
      acc[ext] = (acc[ext] || 0) + 1;
    }
    return acc;
  }, {});
  
  // Get total size
  const totalSize = repoData.files.reduce((sum, file) => sum + file.size, 0);
  
  // Format size
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="bg-[rgba(13,13,50,0.7)] backdrop-blur-lg rounded-2xl p-6 border border-[rgba(255,255,255,0.1)] shadow-xl"
    >
      <h2 className="text-2xl font-bold mb-4 text-blue-300">Repository Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-purple-300">Overview</h3>
          <div className="space-y-2">
            <p className="text-white">
              <span className="text-gray-400">Repository:</span> {repoName}
            </p>
            <p className="text-white">
              <span className="text-gray-400">Branch:</span> {repoData.branch || 'default'}
            </p>
            <p className="text-white">
              <span className="text-gray-400">Total Files:</span> {repoData.files.filter(f => f.type === 'file').length}
            </p>
            <p className="text-white">
              <span className="text-gray-400">Total Directories:</span> {repoData.files.filter(f => f.type === 'dir').length}
            </p>
            <p className="text-white">
              <span className="text-gray-400">Total Size:</span> {formatSize(totalSize)}
            </p>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3 text-purple-300">File Types</h3>
          <div className="space-y-2">
            {Object.entries(fileTypes)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-white">{type}</span>
                  <span className="text-blue-300 font-medium">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3 text-purple-300">README Preview</h3>
        <div className="bg-[#0d0d2b] rounded-lg p-4 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-[#1a1a4a]">
          {repoData.readme ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <pre className="text-green-400 whitespace-pre-wrap font-mono text-xs">
                {repoData.readme.slice(0, 500)}
                {repoData.readme.length > 500 && '...'}
              </pre>
            </div>
          ) : (
            <p className="text-gray-400 italic">No README found</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RepoSummary;