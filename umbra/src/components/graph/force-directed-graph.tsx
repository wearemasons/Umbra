'use client';

import React, { useRef, useEffect, useState, useLayoutEffect, useCallback } from 'react';
import * as d3 from 'd3';
import { Id } from '../../../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface KnowledgeGraphNode {
  _id: Id<'knowledgeGraphNodes'>;
  label: string;
  type: string;
  importance: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface KnowledgeGraphEdge {
  _id: Id<'knowledgeGraphEdges'>;
  sourceNodeId: Id<'knowledgeGraphNodes'>;
  targetNodeId: Id<'knowledgeGraphNodes'>;
  relationshipType: string;
  confidence: number;
  publicationIds: Id<'publications'>[];
}

interface GraphEdge extends KnowledgeGraphEdge {
  source: KnowledgeGraphNode;
  target: KnowledgeGraphNode;
}

interface PublicationDateMap {
  [id: string]: string;
}

interface ForceDirectedGraphProps {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  publications: PublicationDateMap;
}

function drag(simulation: d3.Simulation<KnowledgeGraphNode, undefined>) {
  function dragstarted(event: d3.D3DragEvent<SVGCircleElement, KnowledgeGraphNode, KnowledgeGraphNode>) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event: d3.D3DragEvent<SVGCircleElement, KnowledgeGraphNode, KnowledgeGraphNode>) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event: d3.D3DragEvent<SVGCircleElement, KnowledgeGraphNode, KnowledgeGraphNode>) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3.drag<SVGCircleElement, KnowledgeGraphNode>()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
}

const ForceDirectedGraph: React.FC<ForceDirectedGraphProps> = ({ nodes, edges, publications }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<KnowledgeGraphNode, undefined> | null>(null);
  const svgRefD3 = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const containerRef = useRef<HTMLDivElement>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filteredNodes, setFilteredNodes] = useState<KnowledgeGraphNode[]>(nodes);
  const [filteredEdges, setFilteredEdges] = useState<KnowledgeGraphEdge[]>(edges);

  useLayoutEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.clientWidth);
      setHeight(containerRef.current.clientHeight);
    }
  }, []);

  useEffect(() => {
  const handleResize = useCallback(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.clientWidth);
      setHeight(containerRef.current.clientHeight);
    }
  }, []);

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!startDate && !endDate) {
      setFilteredNodes(nodes);
      setFilteredEdges(edges);
      return;
    }

    const filteredNodeIds = new Set<Id<'knowledgeGraphNodes'>>();
    const filteredEdgeIds = new Set<Id<'knowledgeGraphEdges'>>();

    edges.forEach(edge => {
      let includeEdge = false;
      
      for (const pubId of edge.publicationIds) {
        const pubDate = publications[pubId];
        if (pubDate) {
          const pubDateObj = new Date(pubDate);
          const start = startDate ? new Date(startDate) : new Date('1900-01-01');
          const end = endDate ? new Date(endDate) : new Date('2100-12-31');
          
          if (pubDateObj >= start && pubDateObj <= end) {
            includeEdge = true;
            break;
          }
        }
      }
      
      if (includeEdge) {
        filteredEdgeIds.add(edge._id);
        filteredNodeIds.add(edge.sourceNodeId);
        filteredNodeIds.add(edge.targetNodeId);
      }
    });

    const newFilteredNodes = nodes.filter(node => filteredNodeIds.has(node._id));
    const newFilteredEdges = edges.filter(edge => filteredEdgeIds.has(edge._id));

    setFilteredNodes(newFilteredNodes);
    setFilteredEdges(newFilteredEdges);
  }, [startDate, endDate, nodes, edges, publications]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svgRefD3.current = svg;

    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 17)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('overflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', '#999')
      .style('stroke', 'none');

    const simulation = d3.forceSimulation<KnowledgeGraphNode>()
      .force('link', d3.forceLink<KnowledgeGraphNode, GraphEdge>().distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('collision', d3.forceCollide().radius(30));
    
    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, []);

  useEffect(() => {
    if (simulationRef.current) {
      simulationRef.current.force('center', d3.forceCenter(width / 2, height / 2));
      simulationRef.current.alpha(0.3).restart();
    }
  }, [width, height]);

  useEffect(() => {
    if (!svgRefD3.current || !simulationRef.current) return;

    const svg = svgRefD3.current;
    const simulation = simulationRef.current;

    const nodeMap = new Map(filteredNodes.map(node => [node._id, node]));
    
    const edgesWithNodeReferences: GraphEdge[] = filteredEdges.map(edge => ({
      ...edge,
      source: nodeMap.get(edge.sourceNodeId),
      target: nodeMap.get(edge.targetNodeId)
    })).filter((edge): edge is GraphEdge & { source: KnowledgeGraphNode; target: KnowledgeGraphNode } => edge.source !== undefined && edge.target !== undefined);

    simulation.nodes(filteredNodes);
    (simulation.force('link') as d3.ForceLink<KnowledgeGraphNode, GraphEdge>).links(edgesWithNodeReferences);
    simulation.force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.select('.links').empty() ? svg.append('g').attr('class', 'links').selectAll('line') : svg.select('.links').selectAll('line');
    const node = svg.select('.nodes').empty() ? svg.append('g').attr('class', 'nodes').selectAll('g') : svg.select('.nodes').selectAll('g');

    // Update links
    const updatedLink = link.data(edgesWithNodeReferences, (d: GraphEdge) => d._id);
    updatedLink.exit().remove();
    const enteredLink = updatedLink.enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-width', d => Math.max(1, d.confidence * 3))
      .attr('marker-end', 'url(#arrowhead)');
    
    const allLinks = enteredLink.merge(updatedLink);

    // Update nodes
    const updatedNode = node.data(filteredNodes, (d: KnowledgeGraphNode) => d._id);
    updatedNode.exit().remove();
    const enteredNode = updatedNode.enter().append('g');

    enteredNode.append('circle')
      .attr('r', d => Math.max(10, d.importance * 10))
      .attr('fill', d => {
        switch (d.type) {
          case 'organism':
            return '#FF6B6B';
          case 'condition':
            return '#4ECDC4';
          case 'biological process':
          case 'biologicalProcess':
            return '#45B7D1';
          case 'space environment':
          case 'spaceEnvironment':
            return '#96CEB4';
          case 'unknown':
          default:
            return '#FFEAA7';
        }
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .call(drag(simulation));

    enteredNode.append('text')
      .attr('dx', 12)
      .attr('dy', '.35em')
      .text(d => d.label)
      .attr('font-size', '12px')
      .attr('fill', '#333');
    
    const allNodes = enteredNode.merge(updatedNode);

    simulation.on('tick', () => {
      allLinks
        .attr('x1', d => d.source.x || 0)
        .attr('y1', d => d.source.y || 0)
        .attr('x2', d => d.target.x || 0)
        .attr('y2', d => d.target.y || 0);

      allNodes.attr('transform', d => `translate(${d.x},${d.y})`);
    });



    simulation.alphaTarget(0.3).restart();
  }, [filteredNodes, filteredEdges, width, height]);

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Temporal Filtering</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col">
            <label htmlFor="start-date" className="text-sm font-medium mb-1">Start Date</label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="end-date" className="text-sm font-medium mb-1">End Date</label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40"
            />
          </div>
          <Button onClick={resetFilters} className="mt-5">
            Reset Filters
          </Button>
          <div className="text-sm text-muted-foreground mt-5">
            Showing {filteredNodes.length} nodes and {filteredEdges.length} edges
          </div>
        </CardContent>
      </Card>
      <div ref={containerRef} className="flex-1">
        {filteredNodes.length === 0 && filteredEdges.length === 0 ? (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground">
            No graph data available.
          </div>
        ) : (
          <svg 
            ref={svgRef} 
            width={width} 
            height={height}
            className="bg-white rounded-lg border border-gray-200"
          />
        )}
      </div>
    </div>
  );
};

export default ForceDirectedGraph;