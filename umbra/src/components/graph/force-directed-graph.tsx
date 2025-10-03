'use client';

import React, { useRef, useEffect, useState } from 'react';
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

interface PublicationDateMap {
  [id: string]: string;
}

interface ForceDirectedGraphProps {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  publications: PublicationDateMap;
}

const ForceDirectedGraph: React.FC<ForceDirectedGraphProps> = ({ nodes, edges, publications }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const containerRef = useRef<HTMLDivElement>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filteredNodes, setFilteredNodes] = useState<KnowledgeGraphNode[]>(nodes);
  const [filteredEdges, setFilteredEdges] = useState<KnowledgeGraphEdge[]>(edges);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.clientWidth);
        setHeight(containerRef.current.clientHeight);
      }
    };

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
    if (!svgRef.current || filteredNodes.length === 0 || filteredEdges.length === 0) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const nodeMap = new Map(filteredNodes.map(node => [node._id, node]));
    
    const edgesWithNodeReferences = filteredEdges.map(edge => ({
      ...edge,
      source: nodeMap.get(edge.sourceNodeId),
      target: nodeMap.get(edge.targetNodeId)
    })).filter(edge => edge.source && edge.target) as any;

    const simulation = d3.forceSimulation<KnowledgeGraphNode>(filteredNodes)
      .force('link', d3.forceLink<KnowledgeGraphNode, any>(edgesWithNodeReferences).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    const svg = d3.select(svgRef.current);
    
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 17)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', '#999')
      .style('stroke', 'none');

    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(edgesWithNodeReferences)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-width', d => Math.max(1, (d as any).confidence * 3))
      .attr('marker-end', 'url(#arrowhead)');

    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(filteredNodes)
      .enter()
      .append('g');

    node.append('circle')
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

    node.append('text')
      .attr('dx', 12)
      .attr('dy', '.35em')
      .text(d => d.label)
      .attr('font-size', '12px')
      .attr('fill', '#333');

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x || 0)
        .attr('y1', d => (d.source as any).y || 0)
        .attr('x2', d => (d.target as any).x || 0)
        .attr('y2', d => (d.target as any).y || 0);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Fix: Use event.x and event.y instead of clientX/clientY
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

    return () => {
      simulation.stop();
    };
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
        <svg 
          ref={svgRef} 
          width={width} 
          height={height}
          className="bg-white rounded-lg border border-gray-200"
        />
      </div>
    </div>
  );
};

export default ForceDirectedGraph;