"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Rocket, Code, Star, Brain, Import, Sparkles,  Github, Boxes } from "lucide-react"

export default function Home() {
  const [url, setUrl] = useState("")
  const [branch, setBranch] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [stars, setStars] = useState<{ top: number; left: number; size: number; delay: number; opacity: number }[]>([])

  // Generate random stars for the background
  useEffect(() => {
    const generateStars = () => {
      const newStars = []
      for (let i = 0; i < 150; i++) {
        newStars.push({
          top: Math.random() * 100,
          left: Math.random() * 100,
          size: Math.random() * 2 + 1,
          delay: Math.random() * 5,
          opacity: Math.random() * 0.7 + 0.3,
        })
      }
      setStars(newStars)
    }

    generateStars()
  }, [])

  const handleSubmit = () => {
    if (!url.trim()) {
      return
    }

    const match = url.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([\w-]+)\/([\w.-]+)/)
    if (!match) {
      return alert("Invalid GitHub URL")
    }

    const [, owner, repo] = match

    // Remove ".git" from repo name if present
    const sanitizedRepo = repo.replace(/\.git$/, "")

    setIsLoading(true)

    // Include branch parameter if provided
    const branchParam = branch.trim() ? `&branch=${encodeURIComponent(branch.trim())}` : ""

    // Redirect to visualization page with parameters
    window.location.href = `/visualization?owner=${owner}&repo=${sanitizedRepo}${branchParam}`
  }

  // Example repositories - placeholders for the user to replace
  const exampleRepos = [
    {
      name: "Astro - Withastro",
      description: "A sample repository to demonstrate the visualization capabilities",
      url: "/visualization?owner=withastro&repo=astro",
      stars: "1.2k",
      language: "TypeScript",
    },
    {
      name: "Recharts",
      description: "Another interesting codebase to explore in 3D space",
      url: "/visualization?owner=recharts&repo=recharts&branch=3.x",
      stars: "3.4k",
      language: "Typescript",
    },
    {
      name: "Gource - Acaudwell ",
      description: "Complex project structure visualized as a galaxy",
      url: "/visualization?owner=acaudwell&repo=Gource&branch=master",
      stars: "5.6k",
      language: "C++",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1f] via-[#121232] to-[#1a1a3a] text-white relative overflow-hidden">
      {/* Stars background */}
      {stars.map((star, index) => (
        <div
          key={index}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
            animationDuration: `${3 + star.delay}s`,
          }}
        />
      ))}

      {/* Nebula effects */}
      <div
        className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-purple-900/20 rounded-full blur-[100px] animate-pulse"
        style={{ animationDuration: "15s" }}
      ></div>
      <div
        className="absolute bottom-1/3 -right-1/4 w-1/2 h-1/2 bg-blue-900/20 rounded-full blur-[100px] animate-pulse"
        style={{ animationDuration: "20s" }}
      ></div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-6">
            Explain My Shit
          </h1>
          <p className="text-md md:text-md font-extralight text-blue-200 max-w-3xl mx-auto leading-relaxed">
            Astro Repo | Visualize GitHub repositories as interactive 3D galaxies
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="bg-[rgba(13,13,50,0.5)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-white">Enter Repository Details</CardTitle>
              <CardDescription className="text-center text-blue-300">
                Transform any GitHub repository into an interactive 3D visualization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-[#0d0d2b]/80 rounded-lg p-6 space-y-4">
                  <Input
                    type="text"
                    placeholder="Paste GitHub repo URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="bg-[#1a1a4a]/70 border-[rgba(255,255,255,0.1)] text-white placeholder:text-blue-300/70 h-12 focus-visible:ring-purple-500"
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                  <Input
                    type="text"
                    placeholder="Branch name (optional, defaults to main)"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="bg-[#1a1a4a]/70 border-[rgba(255,255,255,0.1)] text-white placeholder:text-blue-300/70 h-12 focus-visible:ring-purple-500"
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Loading
                      </div>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Rocket className="mr-2 h-5 w-5" /> Visualize
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-xs text-blue-300 opacity-80 justify-center">
              Enter a GitHub repository URL (e.g., https://github.com/username/repo) and optionally specify a branch
            </CardFooter>
          </Card>
        </motion.div>

        {/* Example Repositories Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-24 max-w-6xl mx-auto"
        >
          <div className="flex items-center justify-center mb-10">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-purple-500/50"></div>
            <h2 className="text-3xl font-bold text-center px-4">Example Repositories</h2>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-purple-500/50"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exampleRepos.map((repo, index) => (
              <Card
                key={index}
                className="bg-[rgba(13,13,50,0.4)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)] transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/20 group"
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Github className="mr-2 h-5 w-5 text-blue-300" />
                    <span className="text-white group-hover:text-purple-300 transition-colors">{repo.name}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-yellow-300 border-yellow-300/30">
                      <Star className="h-3 w-3 mr-1" /> {repo.stars}
                    </Badge>
                    <Badge variant="outline" className="text-blue-300 border-blue-300/30">
                      <Code className="h-3 w-3 mr-1" /> {repo.language}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-200/80">{repo.description}</p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-purple-300 hover:text-purple-200 hover:bg-purple-900/20"
                    onClick={() => window.location.href = repo.url}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Visualization
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8 text-blue-300/70">
            <p>Browse sample repositories to see a variety of visualization styles in action.</p>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-24 max-w-5xl mx-auto"
        >
          <div className="flex items-center justify-center mb-10">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-slate-500/50"></div>
            <h2 className="text-3xl font-light text-center px-4">Core Features</h2>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-slate-500/50"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GitHub Import */}
            <Card className="bg-[rgba(0,10,30,0.5)] backdrop-blur-sm border border-[rgba(255,255,255,0.05)] group hover:border-[rgba(255,255,255,0.1)] transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-slate-800/50 group-hover:bg-slate-800 transition-colors">
                    <Import className="h-6 w-6 text-slate-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-light mb-2 text-slate-200">GitHub Repo Import</h3>
                    <p className="text-slate-400 text-sm mb-2">
                      Enter any public GitHub URL and instantly fetch its real-time file structure
                    </p>
                    <p className="text-slate-500 text-xs">Uses GitHub API securely via Octokit</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Summaries */}
            <Card className="bg-[rgba(0,10,30,0.5)] backdrop-blur-sm border border-[rgba(255,255,255,0.05)] group hover:border-[rgba(255,255,255,0.1)] transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-slate-800/50 group-hover:bg-slate-800 transition-colors">
                    <Brain className="h-6 w-6 text-slate-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-light mb-2 text-slate-200">AI-Powered File Summaries</h3>
                    <p className="text-slate-400 text-sm mb-2">
                      Click any file node to get a quick summary powered by LLMs (Gemini or Groq)
                    </p>
                    <p className="text-slate-500 text-xs">Perfect for understanding unknown or legacy codebases</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3D View */}
            <Card className="bg-[rgba(0,10,30,0.5)] backdrop-blur-sm border border-[rgba(255,255,255,0.05)] group hover:border-[rgba(255,255,255,0.1)] transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-slate-800/50 group-hover:bg-slate-800 transition-colors">
                    {/* <Box3d className="h-6 w-6 text-slate-300" /> */}
                    <Boxes className="h-6 w-6 text-slate-300" />

                  </div>
                  <div>
                    <h3 className="text-xl font-light mb-2 text-slate-200">3D Force-Directed Graph</h3>
                    <p className="text-slate-400 text-sm mb-2">
                      Visualize the repo as an interactive 3D structure
                    </p>
                    <p className="text-slate-500 text-xs">Click, drag, zoom — like flying through your project&apos;s architecture</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Context-Aware */}
            <Card className="bg-[rgba(0,10,30,0.5)] backdrop-blur-sm border border-[rgba(255,255,255,0.05)] group hover:border-[rgba(255,255,255,0.1)] transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-slate-800/50 group-hover:bg-slate-800 transition-colors">
                    <Sparkles className="h-6 w-6 text-slate-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-light mb-2 text-slate-200">Context-Aware Prompting</h3>
                    <p className="text-slate-400 text-sm mb-2">
                      Custom prompts sent to LLMs based on file name, path, and type
                    </p>
                    <p className="text-slate-500 text-xs">Enhances accuracy of code understanding</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </motion.div>

        <Separator className="max-w-md mx-auto my-16 bg-white/10" />

        <div className="text-center text-sm text-blue-300/60">
          <p>© {new Date().getFullYear()} Astro Repo | Visualize repositories in 3D space</p>
        </div>
      </div>
    </div>
  )
}
