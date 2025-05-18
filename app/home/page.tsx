"use client"
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const Home = () => {
  const [url, setUrl] = useState('');
  const [branch, setBranch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stars, setStars] = useState<{ top: number; left: number; size: number; delay: number }[]>([]);

  // Generate random stars for the background
  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 100; i++) {
        newStars.push({
          top: Math.random() * 100,
          left: Math.random() * 100,
          size: Math.random() * 2 + 1,
          delay: Math.random() * 5
        });
      }
      setStars(newStars);
    };

    generateStars();
  }, []);

  const handleSubmit = () => {
    if (!url.trim()) {
      return;
    }
    
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([\w-]+)\/([\w.-]+)/);
    if (!match) {
      return alert('Invalid GitHub URL');
    }
  
    const [, owner, repo] = match;
  
    // Remove ".git" from repo name if present
    const sanitizedRepo = repo.replace(/\.git$/, '');
    
    setIsLoading(true);
    
    // Include branch parameter if provided
    const branchParam = branch.trim() ? `&branch=${encodeURIComponent(branch.trim())}` : '';
    
    // Redirect to visualization page with parameters
    window.location.href = `/visualization?owner=${owner}&repo=${sanitizedRepo}${branchParam}`;
  }
  
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
      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-4">
            Explain My Shit
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Visualize GitHub repositories as interactive 3D galaxies
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="max-w-2xl mx-auto bg-[rgba(13,13,50,0.7)] backdrop-blur-lg rounded-2xl p-8 border border-[rgba(255,255,255,0.1)] shadow-2xl"
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-[#0d0d2b] rounded-lg p-6">
              <div className="flex flex-col space-y-4">
                <input
                  type="text"
                  placeholder="Paste GitHub repo URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-[#1a1a4a] border border-[rgba(255,255,255,0.1)] text-white placeholder-blue-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <input
                  type="text"
                  placeholder="Branch name (optional, defaults to main)"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-[#1a1a4a] border border-[rgba(255,255,255,0.1)] text-white placeholder-blue-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium px-8 py-4 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading
                    </div>
                  ) : 'Visualize'}
                </motion.button>
              </div>
              <p className="text-xs text-blue-300 mt-3 opacity-80">Enter a GitHub repository URL (e.g., https://github.com/username/repo) and optionally specify a branch</p>
            </div>
          </div>
        </motion.div>
        

        
        <div className="mt-16 text-center text-sm text-blue-300 opacity-70">
          <p>© {new Date().getFullYear()} Explain My Shit | Visualize repositories in 3D space</p>
        </div>
      </div>
    </div>
  )
}

export default Home