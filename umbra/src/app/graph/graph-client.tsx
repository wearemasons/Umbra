'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import ForceDirectedGraph from '@/components/graph/force-directed-graph';
import { Skeleton } from '@/components/ui/skeleton';
import { mockNodes, mockEdges, mockPublicationDates } from '@/components/graph/mock-data';

const GraphClient = () => {
  // Fix: useQuery returns data directly or undefined, not an object with properties
  const data = useQuery(api.knowledgeGraph.getKnowledgeGraphWithTemporalData);
  
  const isLoading = data === undefined;
  
  // Use real data if available, otherwise use mock data
  const hasRealData = data && data.nodes.length > 0 && data.edges.length > 0;
  const displayNodes = hasRealData ? data.nodes : mockNodes;
  const displayEdges = hasRealData ? data.edges : mockEdges;
  const displayPublications = hasRealData ? data.publicationDates : mockPublicationDates;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ForceDirectedGraph 
        nodes={displayNodes} 
        edges={displayEdges} 
        publications={displayPublications} 
      />
    </div>
  );
};

export default GraphClient;