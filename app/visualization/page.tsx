'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

const VisualizationPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stars, setStars] = useState<{ top: number; left: number; size: number; delay: number }[]>([])

  // Get parameters from URL
  const owner = searchParams.get('owner')
  const repo = searchParams.get('repo')
  const branch = searchParams.get('branch')

  // Generate random stars for the background
  useEffect(() => {
    const generateStars = () => {
      const newStars = []
      for (let i = 0; i < 100; i++) {
        newStars.push({
          top: Math.random() * 100,
          left: Math.random() * 100,
          size: Math.random() * 2 + 1,
          delay: Math.random() * 5
        })
      }
      setStars(newStars)
    }

    generateStars()
  }, [])

  // Fetch repository data
  useEffect(() => {
    const fetchData = async () => {
      if (!owner || !repo) {
        setError('Missing repository information')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const branchParam = branch ? `&branch=${encodeURIComponent(branch)}` : ''
        const res = await fetch(`/api/fetchRepo?owner=${owner}&repo=${repo}${branchParam}`)
        
        if (!res.ok) {
          throw new Error(`Failed to fetch repository: ${res.status} ${res.statusText}`)
        }
        
        const repoData = await res.json()
        setData(repoData)
      } catch (error) {
        console.error('Error fetching repository:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch repository data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [owner, repo, branch])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1f] to-[#1a1a3a] text-white relative overflow-hidden">
      {/* Stars background */}
      {stars.map((star, index) => (
        <div
          key={index}
          className="absolute rounded-full bg-white opacity-70 animate-pulse"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="text-blue-300 hover:text-blue-200 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Home
            </Link>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
          >
            Explain My Shit
          </motion.h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-[70vh]">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-12 w-12 text-purple-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-xl text-blue-300">Loading repository visualization...</p>
            </div>
          </div>
        ) : error ? (
          <div className="max-w-2xl mx-auto bg-[rgba(13,13,50,0.7)] backdrop-blur-lg rounded-2xl p-8 border border-red-500 shadow-2xl">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
            <p className="text-white mb-6">{error}</p>
            <Link href="/" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300">
              Try Again
            </Link>
          </div>
        ) : data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-300">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                {owner}/{repo}{branch ? ` (${branch})` : ''}
              </span>
            </h2>
            
            {/* Components for visualization */}
            <div className="flex flex-col space-y-8">
              {/* 3D Visualization */}
              <div className="w-full">
                {(() => {
                  // Import and use components directly
                  const { transformRepoToGraph } = require('@/utils/graphData')
                  const ForceGraph = require('@/components/ForceGraph').default
                  const graphData = transformRepoToGraph(data)
                  return <ForceGraph graphData={graphData} repoName={`${owner}/${repo}`} />
                })()}
              </div>
              
              {/* Repository Summary */}
              <div className="w-full">
                {(() => {
                  const RepoSummary = require('@/components/RepoSummary').default
                  return <RepoSummary repoData={data} repoUrl={`https://github.com/${owner}/${repo}`} />
                })()}
              </div>
            </div>
          </motion.div>
        )}
        
        <div className="mt-16 text-center text-sm text-blue-300 opacity-70">
          <p>© {new Date().getFullYear()} Explain My Shit | Visualize repositories in 3D space</p>
        </div>
      </div>
    </div>
  )
}

export default VisualizationPage
