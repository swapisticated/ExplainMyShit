// components/ForceGraph.tsx

'use client';
import React, { useRef, useEffect, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { GraphData, GraphNode, GraphLink } from '@/utils/graphData';
import { motion } from 'framer-motion';
import * as THREE from 'three';

interface ForceGraphProps {
  graphData: GraphData;
  repoName: string;
}

const ForceGraph = ({ graphData, repoName }: ForceGraphProps) => {
  const graphRef = useRef<any>(null);

  // State to track if auto-rotation is enabled
  const [autoRotate, setAutoRotate] = useState(true);
  const [userInteracting, setUserInteracting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const rotationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Apply force graph configurations when component mounts
  useEffect(() => {
    if (graphRef.current && graphData.nodes.length > 0) {
      // Set initial camera position
      graphRef.current.cameraPosition({ z: 300 });
      
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
    if (!graphRef.current || !autoRotate || userInteracting) return;
    
    let angle = 0;
    const interval = setInterval(() => {
      if (graphRef.current && autoRotate && !userInteracting) {
        angle += Math.PI / 2000; // Slower rotation for smoother experience
        const distance = 300;
        graphRef.current.cameraPosition({
          x: distance * Math.sin(angle),
          z: distance * Math.cos(angle)
        });
      }
    }, 50); // Slower interval for smoother rotation
    
    return () => clearInterval(interval);
  }, [autoRotate, userInteracting]);

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

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className={`${isFullscreen ? 'fixed inset-0 z-50 w-screen h-screen' : 'w-full h-[70vh]'} bg-[rgba(10,10,31,0.6)] backdrop-blur-sm ${isFullscreen ? '' : 'rounded-2xl'} overflow-hidden shadow-2xl border border-[rgba(255,255,255,0.1)] relative`}
    >
      <div className="absolute top-4 left-4 z-10 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm px-4 py-2 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-300">{repoName}</h3>
        <p className="text-xs text-gray-300">Files: {graphData.nodes.length - 1} | Connections: {graphData.links.length}</p>
      </div>
      
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
      
      <ForceGraph3D
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
        showNavInfo={false}
        controlType="orbit"
        enableNodeDrag={true}
        enableNavigationControls={true}
        nodeThreeObject={(node: GraphNode) => {
          // Make nodes interactive
          const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(node.val),
            new THREE.MeshLambertMaterial({ color: node.color, transparent: true, opacity: 0.8 })
          );
          sphere.userData = { ...node }; // Store node data for interaction
          return sphere;
        }}
      />
    </motion.div>
  );
};

export default ForceGraph;
