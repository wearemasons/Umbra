"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import {
  mockResearchPaperNodes,
  mockResearchPaperEdges,
} from "./research-paper-mock-data";

// Define basic Id type for mock data
type Id<T extends string = string> = string & { __brand: T };

// Define TypeScript interfaces for our data
interface ResearchPaperNode {
  _id: Id<"knowledgeGraphNodes">;
  title: string;
  authors: string[];
  summary: string;
  publicationYear: number;
  citationCount: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface ResearchPaperEdge {
  _id: Id<"knowledgeGraphEdges">;
  sourceNodeId: Id<"knowledgeGraphNodes">;
  targetNodeId: Id<"knowledgeGraphNodes">;
  relationshipType:
    | "cites"
    | "references"
    | "similar"
    | "follows"
    | "builds-on"
    | "relates-to"
    | "enables"
    | "contributes-to";
  strength: number; // 0-1 confidence/similarity score
}

interface GraphEdge extends ResearchPaperEdge {
  source: ResearchPaperNode;
  target: ResearchPaperNode;
}

interface ResearchPaperGraphProps {
  nodes?: ResearchPaperNode[];
  edges?: ResearchPaperEdge[];
}

// Drag behavior implementation for nodes
function drag(
  simulation: d3.Simulation<ResearchPaperNode, undefined>,
  updateNodePosition: (
    nodeId: Id<"knowledgeGraphNodes">,
    x: number,
    y: number,
  ) => void,
) {
  function dragstarted(
    event: d3.D3DragEvent<
      SVGCircleElement,
      ResearchPaperNode,
      ResearchPaperNode
    >,
  ) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    // Fix node position when drag starts to prevent "jitter"
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(
    event: d3.D3DragEvent<
      SVGCircleElement,
      ResearchPaperNode,
      ResearchPaperNode
    >,
  ) {
    // Update node position during drag
    event.subject.fx = event.x;
    event.subject.fy = event.y;
    // Update position in state so it persists
    updateNodePosition(event.subject._id, event.x, event.y);
  }

  function dragended(
    event: d3.D3DragEvent<
      SVGCircleElement,
      ResearchPaperNode,
      ResearchPaperNode
    >,
  ) {
    if (!event.active) simulation.alphaTarget(0);
    // Release the fixed position when drag ends
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3
    .drag<SVGCircleElement, ResearchPaperNode>()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}

// Tooltip component that appears on hover
const Tooltip: React.FC<{
  paper: ResearchPaperNode | null;
  position: { x: number; y: number };
}> = ({ paper, position }) => {
  if (!paper) return null;

  return (
    <div
      className="absolute bg-gray-800 text-white p-3 rounded-md shadow-2xl max-w-xs z-50 border border-gray-600 backdrop-blur-sm"
      style={{
        left: position.x,
        top: position.y,
        pointerEvents: "none",
        fontSize: "14px",
        fontWeight: "normal",
      }}
    >
      <div className="font-bold mb-1 truncate text-blue-300">{paper.title}</div>
      <div className="text-sm text-gray-300 mb-1">
        Authors: {paper.authors.join(", ")}
      </div>
      <div className="text-sm text-cyan-300 mb-1">
        Year: {paper.publicationYear} | Citations: {paper.citationCount}
      </div>
      <div className="text-xs text-gray-400 italic">{paper.summary}</div>
    </div>
  );
};

const ResearchPaperGraph: React.FC<ResearchPaperGraphProps> = ({
  nodes: propNodes,
  edges: propEdges,
}) => {
  // Use default mock data if no data is provided
  const nodes = propNodes || mockResearchPaperNodes;
  const edges = propEdges || mockResearchPaperEdges;

  // Refs for DOM elements and D3 objects
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<
    ResearchPaperNode,
    undefined
  > | null>(null);
  const d3ContainerRef = useRef<d3.Selection<
    SVGSVGElement,
    unknown,
    null,
    undefined
  > | null>(null);

  // State for graph dimensions and UI elements
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [tooltip, setTooltip] = useState<{
    paper: ResearchPaperNode | null;
    position: { x: number; y: number };
  }>({
    paper: null,
    position: { x: 0, y: 0 },
  });
  const [fixedPositions, setFixedPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});

  // Container ref for measuring dimensions
  const containerRef = useRef<HTMLDivElement>(null);

  // Update dimensions when component mounts and when window resizes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.clientWidth;
        const newHeight = containerRef.current.clientHeight;
        // Ensure we have valid dimensions (not 0)
        setWidth(newWidth > 0 ? newWidth : 800);
        setHeight(newHeight > 0 ? newHeight : 600);
      }
    };

    // Initial call
    updateDimensions();

    // Add a small delay to ensure container is fully rendered
    const timeoutId = setTimeout(updateDimensions, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.clientWidth);
        setHeight(containerRef.current.clientHeight);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update node position in state when dragged
  const updateNodePosition = useCallback(
    (nodeId: Id<"knowledgeGraphNodes">, x: number, y: number) => {
      setFixedPositions((prev) => ({
        ...prev,
        [nodeId]: { x, y },
      }));
    },
    [],
  );

  // Initialize the graph
  useEffect(() => {
    if (!svgRef.current) return;

    // Create D3 SVG container
    const svg = d3.select(svgRef.current);
    d3ContainerRef.current = svg;

    // Clear previous content
    svg.selectAll("*").remove();

    // Define arrow marker for directed edges (for citation relationships)
    const defs = svg.append("defs");
    defs
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "-0 -5 10 10")
      .attr("refX", 13)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("xoverflow", "visible")
      .append("svg:path")
      .attr("d", "M 0,-5 L 10,0 L 0,5")
      .attr("fill", "#999")
      .style("stroke", "none");

    // Create force simulation with multiple physics forces
    const simulation = d3
      .forceSimulation<ResearchPaperNode>()
      // Link force: keeps connected nodes at a distance based on relationship strength
      .force(
        "link",
        d3
          .forceLink<ResearchPaperNode, GraphEdge>()
          .id((d) => d._id)
          .distance((d) => 100 * (2 - d.strength)) // Closer for stronger relationships
          .strength((d) => d.strength), // Apply relationship strength to link force
      )
      // Charge force: creates repulsion between nodes (negative value)
      .force("charge", d3.forceManyBody().strength(-300))
      // Center force: pulls nodes towards the center of the visualization
      .force("center", d3.forceCenter(width / 2, height / 2))
      // Collision force: prevents nodes from overlapping by maintaining minimum distance
      .force("collision", d3.forceCollide().radius(40));

    simulationRef.current = simulation;

    // Only restart if we have valid dimensions
    if (width > 50 && height > 50) {
      simulation.alpha(1).restart();
    }

    // Cleanup on unmount
    return () => {
      simulation.stop();
    };
  }, [width, height]);

  // Update simulation nodes and edges when data changes
  useEffect(() => {
    if (!simulationRef.current || !d3ContainerRef.current || nodes.length === 0)
      return;

    const simulation = simulationRef.current;
    const svg = d3ContainerRef.current;

    // Create a mapping from node IDs to node objects for linking edges
    const nodeMap = new Map(nodes.map((node) => [node._id, node]));

    // Extend edges with references to source and target node objects for visualization
    const extendedEdges: GraphEdge[] = edges.map((edge) => ({
      ...edge,
      source: nodeMap.get(edge.sourceNodeId) as ResearchPaperNode,
      target: nodeMap.get(edge.targetNodeId) as ResearchPaperNode,
    }));

    // Apply fixed positions if they exist (for nodes that have been dragged)
    // Otherwise, give nodes initial positions within the viewable area
    nodes.forEach((node) => {
      if (fixedPositions[node._id]) {
        node.x = fixedPositions[node._id].x;
        node.y = fixedPositions[node._id].y;
        node.fx = fixedPositions[node._id].x;
        node.fy = fixedPositions[node._id].y;
      } else if (node.x === undefined || node.y === undefined) {
        // Give initial positions within the SVG bounds to ensure they're visible
        node.x =
          width / 2 + (Math.random() - 0.5) * Math.min(width, height) * 0.5;
        node.y =
          height / 2 + (Math.random() - 0.5) * Math.min(width, height) * 0.5;
        node.fx = null;
        node.fy = null;
      }
    });

    // Update the simulation with current nodes and edges to recalculate physics
    simulation.nodes(nodes);
    (
      simulation.force("link") as d3.ForceLink<ResearchPaperNode, GraphEdge>
    ).links(extendedEdges);

    // Create groups for links and nodes so they can be transformed independently for zoom/pan
    const linkGroup = svg.selectAll(".link-group").data([null]);
    const linkGroupEnter = linkGroup
      .enter()
      .append("g")
      .attr("class", "link-group");
    // @ts-expect-error D3 typing issue with selection merge
    linkGroupEnter.merge(linkGroup);

    const nodeGroup = svg.selectAll(".node-group").data([null]);
    const nodeGroupEnter = nodeGroup
      .enter()
      .append("g")
      .attr("class", "node-group");
    // @ts-expect-error D3 typing issue with selection merge
    nodeGroupEnter.merge(nodeGroup);

    // Update links (edges) in the visualization
    const links = svg
      .select(".link-group")
      .selectAll<SVGPathElement, GraphEdge>(".link")
      .data(extendedEdges, (d: GraphEdge) => d._id);

    // Remove old links that are no longer in the data
    links.exit().remove();

    // Add new links with curved paths and relationship-specific styling
    const linkEnter = links
      .enter()
      .append("path") // Using path for curved lines instead of straight lines
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", (d) => {
        // Color code edges based on relationship type for better visual distinction
        switch (d.relationshipType) {
          case "cites":
            return "#7D3C98"; // Purple for citation relationships
          case "references":
            return "#2874A6"; // Dark blue for reference relationships
          case "similar":
            return "#D68910"; // Amber for similarity relationships
          case "follows":
            return "#1D8348"; // Green for sequential relationships
          case "builds-on":
            return "#CB4335"; // Red for building-on relationships
          default:
            return "#5D6D7E"; // Gray for default
        }
      })
      .attr("stroke-width", (d) => Math.max(1, d.strength * 3)) // Thicker for stronger relationships
      .attr("stroke-opacity", 0.6)
      .attr("marker-end", (d) =>
        d.relationshipType === "cites" || d.relationshipType === "references"
          ? "url(#arrowhead)" // Add arrowheads for citation/reference relationships
          : null,
      );

    const allLinks = linkEnter.merge(links);

    // Function to create curved path between nodes for more visually appealing edges
    const curvePath = (
      source: ResearchPaperNode,
      target: ResearchPaperNode,
    ) => {
      if (!source.x || !source.y || !target.x || !target.y) return "";

      // Calculate control point for the quadratic Bézier curve
      const midX = (source.x + target.x) / 2;
      const midY = (source.y + target.y) / 2;

      // Create a perpendicular offset for the curve to avoid overlapping straight lines
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Calculate perpendicular offset for the control point
      const offset = 30; // Fixed offset for curve intensity
      // Normalize the perpendicular vector and scale by offset
      const offsetX = (-dy * offset) / distance;
      const offsetY = (dx * offset) / distance;

      return `M${source.x},${source.y} Q${midX + offsetX},${midY + offsetY} ${target.x},${target.y}`;
    };

    // Update link positions with curved paths (for both new and existing links)
    allLinks.attr("d", (d) => {
      if (!d.source || !d.target) return "";
      return curvePath(d.source, d.target);
    });

    // Create node elements and update them based on data changes
    const nodesSelection = svg
      .select(".node-group")
      .selectAll<SVGGElement, ResearchPaperNode>(".node")
      .data(nodes, (d: ResearchPaperNode) => d._id);

    // Remove old nodes that are no longer in the data
    nodesSelection.exit().remove();

    // Add new nodes with drag behavior and interactivity
    const nodeEnter = nodesSelection
      .enter()
      .append("g")
      .attr("class", "node")
      // @ts-expect-error D3 typing mismatch for drag behavior
      .call(drag(simulation, updateNodePosition)); // Add drag behavior

    // Add circle for each node with size based on citation count
    nodeEnter
      .append("circle")
      .attr("r", (d) => Math.max(12, Math.min(24, 8 + d.citationCount / 10))) // Size based on citation count (min 12px, max 24px)
      .attr("fill", (d) => {
        // Color code nodes based on publication year for temporal visualization
        const yearDiff = new Date().getFullYear() - d.publicationYear;
        if (yearDiff <= 1) return "#FF6B6B"; // Red for recent papers (last year)
        if (yearDiff <= 3) return "#4ECDC4"; // Teal for papers from last 3 years
        if (yearDiff <= 5) return "#45B7D1"; // Blue for papers from last 5 years
        return "#96CEB4"; // Green for older papers
      })
      .attr("stroke", "#fff") // White stroke for better visibility
      .attr("stroke-width", 1.5)
      .on("mouseover", (event, d) => {
        // Show tooltip on hover with paper details
        const [x, y] = d3.pointer(event, svg.node());
        setTooltip({
          paper: d,
          position: { x: x + 10, y: y - 30 }, // Position tooltip near cursor
        });
      })
      .on("mouseout", () => {
        // Hide tooltip when mouse leaves
        setTooltip({ paper: null, position: { x: 0, y: 0 } });
      })
      .on("click", (event, d) => {
        // Log paper ID to console when clicked (as requested)
        console.log("Paper clicked:", d._id);
        // In a real application, you would navigate to the paper details page here
        // Example: router.push(`/papers/${d._id}`);
      });

    // Add text label for each node showing truncated title
    nodeEnter
      .append("text")
      .attr("dx", 15) // Position text to the right of the circle
      .attr("dy", ".35em") // Vertically center the text
      .text((d) =>
        d.title.length > 20 ? d.title.substring(0, 20) + "..." : d.title,
      ) // Truncate long titles
      .attr("font-size", "12px")
      .attr("fill", "#fff") // White text for contrast on dark background
      .attr("pointer-events", "none"); // Make text not interfere with mouse events

    const allNodes = nodeEnter.merge(nodesSelection);

    // Update node positions during simulation tick (for animation and physics)
    simulation.on("tick", () => {
      // Update link positions with curved paths during simulation
      allLinks.attr("d", (d) => {
        if (!d.source?.x || !d.source?.y || !d.target?.x || !d.target?.y)
          return "";
        return curvePath(d.source, d.target);
      });

      // Update node positions during simulation with proper coordinate checks
      allNodes.attr("transform", (d) => {
        // Ensure coordinates are valid numbers before applying transform
        const x = d.x ?? width / 2;
        const y = d.y ?? height / 2;
        return `translate(${x},${y})`;
      });
    });

    // Restart simulation to apply changes and create animation - with higher alpha for better visibility
    simulation.alpha(1).restart();

    // Cleanup function to remove event listeners
    return () => {
      simulation.on("tick", null);
    };
  }, [nodes, edges, fixedPositions, width, height, updateNodePosition]);

  // Update center force when dimensions change
  useEffect(() => {
    if (simulationRef.current) {
      const simulation = simulationRef.current;
      simulation.force("center", d3.forceCenter(width / 2, height / 2));
      simulation.alpha(1).restart(); // Restart with good alpha to adjust to new center
    }
  }, [width, height]);

  // Add zoom and pan functionality
  useEffect(() => {
    if (!svgRef.current || !d3ContainerRef.current) return;

    const svg = d3ContainerRef.current;

    // Create zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8]) // Limit zoom range
      .on("zoom", (event) => {
        // Apply zoom transformation to the main groups
        svg.select(".link-group").attr("transform", event.transform);
        svg.select(".node-group").attr("transform", event.transform);
      });

    // Apply zoom behavior to the SVG with initial transform reset
    d3.select(svgRef.current).call(zoom);

    // Cleanup
    return () => {
      d3.select(svgRef.current).on(".zoom", null);
    };
  }, []);

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden">
      {/* Tooltip component */}
      <Tooltip paper={tooltip.paper} position={tooltip.position} />

      {/* Debug info */}
      <div className="absolute top-2 left-2 text-white text-xs z-10 bg-black bg-opacity-50 p-1 rounded">
        Nodes: {nodes.length}, Edges: {edges.length}, Width: {width}, Height:{" "}
        {height}
      </div>

      {/* Graph container */}
      <div ref={containerRef} className="w-full h-full">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default ResearchPaperGraph;
