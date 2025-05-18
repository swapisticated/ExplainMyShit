//components/ForceGraph.tsx
/* eslint-disable */
// @ts-nocheck
'use client';
import React, { useRef, useEffect, useState } from 'react';
import ForceGraph3D, { NodeObject } from 'react-force-graph-3d';
import { GraphData, GraphNode } from '@/utils/graphData';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { GeminiSidebar } from './SideBar';
import { setCache, getCache, generateCacheKey } from '@/utils/cache';
import { Info, InfoIcon } from 'lucide-react';
import { fileTypeColors } from '@/utils/graphData';

// import dynamic from 'next/dynamic';


interface ForceGraphProps {
  graphData: GraphData;
  repoName: string;
  owner: string;
  repo: string;
  branch: string;
}

const ForceGraph = ({ graphData, repoName, owner, repo, branch }: ForceGraphProps) => {
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Core state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [fileSummary, setFileSummary] = useState<string | null>(null);
  const [isCacheEnabled, setIsCacheEnabled] = useState(true);

  // Auto-rotation state
  const [autoRotate, setAutoRotate] = useState(true);
  const [userInteracting, setUserInteracting] = useState(false);
  const rotationTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  // Apply force graph configurations when component mounts
  useEffect(() => {
    if (graphRef.current && graphData.nodes.length > 0) {
      // Set initial camera position
      graphRef.current.cameraPosition({ z: 300 });

      // Initialize hierarchical layout
      const initializeHierarchicalLayout = () => {
        if (!graphRef.current) return;

        // Get the force simulation
        const forceEngine = graphRef.current.d3Force();
        if (!forceEngine) return;

        // Configure link distances based on node types
        forceEngine.link().distance((link: any) => {
          // Calculate distance based on source node type and target depth
          const sourceNode = graphData.nodes.find(n => n.id === link.source.id || n.id === link.source);
          const targetNode = graphData.nodes.find(n => n.id === link.target.id || n.id === link.target);

          if (!sourceNode || !targetNode) return 50;

          // Root connections get more space
          if (sourceNode.id === 'root') return 80;

          // Directory to directory connections
          if (sourceNode.type === 'dir' && targetNode.type === 'dir') {
            return 60;
          }

          // Directory to file connections
          if (sourceNode.type === 'dir' && targetNode.type === 'file') {
            return 40;
          }

          return 50; // Default distance
        }).strength(0.3); // Slightly stronger links for stability

        // Enhance charge force for better spacing
        forceEngine.charge()
          .strength((node: any) => node.id === 'root' ? -150 : node.type === 'dir' ? -100 : -30)
          .distanceMax(300);

        // Add radial force to create layers based on path depth
        forceEngine.radial((node: any) => {
          if (node.id === 'root') return 0; // Root at center

          // Calculate depth based on path segments
          const depth = node.path.split('/').filter(Boolean).length;
          return depth * 60; // Radial distance increases with depth
        }).strength(0.15); // Gentle force to maintain layers

        // Restart the simulation with new parameters
        graphRef.current.d3ReheatSimulation();
      };

      // Initialize after a short delay to ensure the graph is rendered
      setTimeout(initializeHierarchicalLayout, 100);

      // Add event listeners to detect user interaction
      const handleUserInteraction = () => {
        setUserInteracting(true);
        setAutoRotate(false);
        // Reset after some time of inactivity
        if (rotationTimeoutRef.current) {
          clearTimeout(rotationTimeoutRef.current);
        }
        rotationTimeoutRef.current = setTimeout(() => {
          setUserInteracting(false);
          setAutoRotate(true);
        }, 5000);
      };

      // Add event listeners to the graph container
      const graphContainer = graphRef.current.renderer().domElement.parentElement;
      if (graphContainer) {
        graphContainer.addEventListener('mousedown', handleUserInteraction);
        graphContainer.addEventListener('wheel', handleUserInteraction);
        graphContainer.addEventListener('touchstart', handleUserInteraction);
      }

      // Cleanup event listeners
      return () => {
        if (graphContainer) {
          graphContainer.removeEventListener('mousedown', handleUserInteraction);
          graphContainer.removeEventListener('wheel', handleUserInteraction);
          graphContainer.removeEventListener('touchstart', handleUserInteraction);
        }
        if (rotationTimeoutRef.current) {
          clearTimeout(rotationTimeoutRef.current);
        }
      };
    }
  }, [graphData]);

  // Handle auto-rotation separately
  useEffect(() => {
    if (!graphRef.current) return;

    const fgControls = graphRef.current.controls(); // Access OrbitControls

    let animationFrameId: number;

    const animate = () => {
      if (autoRotate && !userInteracting) {
        fgControls.autoRotate = true;
        fgControls.autoRotateSpeed = 0.5; // Adjust for smoothness
        fgControls.update();
      } else {
        fgControls.autoRotate = false;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [autoRotate, userInteracting]);

  // Add starfield background effect
  useEffect(() => {
    if (graphRef.current) {
      const scene = graphRef.current.scene();
      const starGeometry = new THREE.BufferGeometry();
      const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const starVertices = [];
      for (let i = 0; i < 500; i++) {
        const x = THREE.MathUtils.randFloatSpread(1000);
        const y = THREE.MathUtils.randFloatSpread(1000);
        const z = THREE.MathUtils.randFloatSpread(1000);
        starVertices.push(x, y, z);
      }

      starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

      const starField = new THREE.Points(starGeometry, starMaterial);
      scene.add(starField);
    }
  }, []);

  // Handle node hover
  const handleNodeHover = (node: GraphNode | null) => {
    setHoveredNode(node);

    if (graphRef.current) {
      graphRef.current.renderer().domElement.style.cursor = node ? 'pointer' : 'default';
    }
  };

  // Function to toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      // First approach: Try to make the container element fullscreen
      try {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).mozRequestFullScreen) { /* Firefox */
          (containerRef.current as any).mozRequestFullScreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) { /* Chrome, Safari & Opera */
          (containerRef.current as any).webkitRequestFullscreen();
        } else if ((containerRef.current as any).msRequestFullscreen) { /* IE/Edge */
          (containerRef.current as any).msRequestFullscreen();
        }
        // Even if the API call succeeds, we'll set our own state
        setIsFullscreen(true);
      } catch (error) {
        console.error('Error entering fullscreen:', error);
        // Fallback to CSS-based fullscreen
        setIsFullscreen(true);
      }
    } else {
      // Exit fullscreen
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).mozCancelFullScreen) { /* Firefox */
          (document as any).mozCancelFullScreen();
        } else if ((document as any).webkitExitFullscreen) { /* Chrome, Safari & Opera */
          (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) { /* IE/Edge */
          (document as any).msExitFullscreen();
        }
      } catch (error) {
        console.error('Error exiting fullscreen:', error);
      }
      // Always update our own state
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Simplified node click handler - directly opens sidebar with summary
  async function handleNodeClick(node: NodeObject<GraphNode>) {
    // Only handle file nodes
    if (node.type !== 'file') return;

    // Set selected node and show sidebar
    setSelectedNode(node);

    // Fetch and display the summary
    await fetchAndShowSummary(node);
  }

  // Handle click outside to close sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if clicking inside the sidebar or on a node
      if (
        event.target instanceof Element && (
          event.target.closest('.sidebar-container') || // For clicking in sidebar
          event.target.closest('canvas') // For clicking on canvas (we'll handle node clicks separately)
        )
      ) {
        return;
      }

      // Close sidebar when clicking elsewhere
      setShowSidebar(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Function to fetch file summary with caching
  async function fetchAndShowSummary(node: GraphNode) {
    try {
      setShowSidebar(true);
      setFileSummary('Loading summary...');

      // Generate cache key for this file
      const cacheKey = generateCacheKey('summary', {
        owner,
        repo,
        path: node.path,
        branch,
        version: '1' // Add version to help with cache busting if needed
      });

      // Check cache first if enabled
      if (isCacheEnabled) {
        const cachedSummary = getCache<string>(cacheKey);
        if (cachedSummary) {
          console.log('Using cached summary for:', node.path);
          setFileSummary(cachedSummary);
          return;
        }
      }

      // If no cache or disabled, fetch from API
      const response = await fetch('/api/fileContents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner,
          repo,
          path: node.path,
          branch
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const data = await response.json();

      if (data.summary) {
        // Cache the new summary if caching is enabled
        if (isCacheEnabled) {
          setCache(cacheKey, data.summary);
          console.log('Cached summary for:', node.path);
        }
        setFileSummary(data.summary);
      } else {
        setFileSummary('Failed to generate summary');
      }
    } catch (error) {
      console.error('Error:', error);
      setFileSummary('Error: Failed to fetch file content');
    }
  }

  const getUniqueFileTypes = () => {
    const fileTypes = new Set<string>();
    graphData.nodes.forEach(node => {
      if (node.type === 'file') {
        const extension = node.name.split('.').pop()?.toLowerCase();
        if (extension && fileTypeColors[extension]) {
          fileTypes.add(extension);
        }
      }
    });
    return Array.from(fileTypes);
  };


  const Legend = () => {
    const uniqueFileTypes = getUniqueFileTypes();

    return (
      <div className="absolute top-16 right-4 z-10 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm p-4 rounded-lg border border-[rgba(255,255,255,0.1)]">
        <h3 className="text-sm font-medium text-slate-200 mb-3">File Types</h3>
        <div className="space-y-2">
          {/* Always show directory */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fileTypeColors.dir }}></div>
            <span className="text-xs text-slate-300">Directory</span>
          </div>

          {/* Show only file types that exist in the repo */}
          {uniqueFileTypes.map(type => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: fileTypeColors[type] }}
              ></div>
              <span className="text-xs text-slate-300">
                {type.toUpperCase()} {/* Show file extension in uppercase */}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };


  const Instructions = () => (
    <div className="absolute bottom-4 left-4 z-10 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] flex items-center gap-2">
      <InfoIcon className="w-4 h-4 text-slate-300" />
      <p className="text-xs text-slate-300">Click files in fullscreen mode for AI summaries</p>
    </div>
  );

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className={`${isFullscreen ? 'fixed inset-0 z-50 ' : 'h-[70vh]'}  backdrop-blur-sm ${isFullscreen ? ' rounded-4xl' : 'rounded-2xl'}  overflow-hidden shadow-2xl border border-[rgba(255,255,255,0.1)] relative`}
    >
      {/* Sidebar (always in the DOM, positioned via CSS) */}
      {isFullscreen && (
        <div className="fixed top-0 right-0 z-50 sidebar-container">
          <GeminiSidebar
            defaultOpen={showSidebar}
            position="left"
            summary={fileSummary}
            fileName={selectedNode?.name}
            onClose={() => {
              setShowSidebar(false);
              setFileSummary(null);
              setSelectedNode(null);
            }}
          />
        </div>
      )}

      {/* Background stars */}

      {/* Repository info box */}
      <div className="absolute top-4 left-4 z-10 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.1)]">
        <h3 className="text-lg font-semibold text-blue-300">{repoName}</h3>
        <p className="text-xs text-gray-300">Files: {graphData.nodes.length - 1} | Connections: {graphData.links.length}</p>
      </div>

      {/* Add Legend */}
      <Legend />

      {/* Add Instructions */}
      <Instructions />

      {/* Hovered node info */}
      {hoveredNode && (
        <div className="absolute bottom-16 left-4 z-10 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.1)]">
          <p className="text-sm text-blue-300">{hoveredNode.name}</p>
          <p className="text-xs text-gray-300">{hoveredNode.path} ({hoveredNode.type})</p>
        </div>
      )}

      {/* Fullscreen toggle button */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-10 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm p-2 rounded-lg text-blue-300 hover:text-blue-100 transition-colors duration-200 flex items-center justify-center"
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      >
        {isFullscreen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a2 2 0 012-2h2v2H7v2H5zm10 0V7a2 2 0 00-2-2h-2v2h2v2h2zm0 2v2a2 2 0 01-2 2h-2v-2h2v-2h2zm-10 0v2a2 2 0 002 2h2v-2H7v-2H5z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Cache clear button */}
      <button
        onClick={() => {
          localStorage.clear();
          setIsCacheEnabled(false);
          setTimeout(() => setIsCacheEnabled(true), 1000);
        }}
        className="absolute top-4 right-16 z-10 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm p-2 rounded-lg text-blue-300 hover:text-blue-100 transition-colors duration-200 flex items-center justify-center"
        title="Clear Cache"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
      </button>


      {/* Main Force Graph component */}
      {/* <ForceGraph3D
        ref={graphRef}
        graphData={graphData}
        nodeLabel={(node: GraphNode) => `${node.name} (${node.type})`}
        nodeColor={(node: GraphNode) => node.color}
        nodeVal={(node: GraphNode) => node.val}
        linkDirectionalParticles={1}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkWidth={0.8}
        linkOpacity={0.5}
        backgroundColor="#0a0a1f"
        width={screen.width}
        height={screen.height}
        showNavInfo={false}
        controlType="orbit"
        enableNodeDrag={true}
        enableNavigationControls={true}
        onNodeHover={handleNodeHover}
        cooldownTime={5000}
        forceEngine={'d3'}
        onNodeClick={handleNodeClick}
        nodeThreeObject={(node: GraphNode) => {
          // Make nodes interactive
          const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(node.val),
            new THREE.MeshLambertMaterial({
              color: node.color,
              transparent: true,
              opacity: 0.8,
              emissive: node.type === 'dir' && node.id !== 'root' ? 0x292626 : 0x3a2b42 // Slight glow for directories
            })
          );
          sphere.userData = { ...node }; // Store node data for interaction
          return sphere;
        }}
      /> */}
      <ForceGraph3D
        ref={graphRef}
        graphData={graphData}
        nodeLabel={(node) => {
          const depth = node.path?.split('/')?.length || 0;
          return depth <= 3 ? `${node.name} (${node.type})` : '';
        }}
        nodeColor={(node: GraphNode) => node.color}
        nodeVal={(node: GraphNode) => node.val}
        linkDirectionalParticles={2}  // Reduced
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={1}
        linkDirectionalArrowLength={2}
        linkDirectionalArrowRelPos={1}
        linkWidth={0.3}
        linkOpacity={0.5}
        linkMaterial={() => {
          const material = new THREE.MeshBasicMaterial({ color: 0x999999 });
          material.transparent = true;
          material.opacity = 0.4;
          return material;
        }}

        backgroundColor="#0a0a1f"
        width={screen.width}
        height={screen.height}
        showNavInfo={true}
        controlType="orbit"
        enableNodeDrag={true}
        enableNavigationControls={true}
        onNodeHover={handleNodeHover}
        cooldownTime={5000}
        forceEngine={'d3'}
        onNodeClick={handleNodeClick}
        nodeThreeObject={(node: GraphNode) => {
          // Make nodes interactive
          const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(node.val),
            new THREE.MeshLambertMaterial({
              color: node.color,
              transparent: true,
              opacity: 0.8,
              emissive: node.type === 'dir' && node.id !== 'root' ? 0x292626 : 0x3a2b42 // Slight glow for directories
            })
          );
          sphere.userData = { ...node }; // Store node data for interaction
          return sphere;
        }}
      />
    </motion.div>
  );
};

export default ForceGraph;