'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import ResearchPaperGraph from '@/components/graph/research-paper-graph';
import { Skeleton } from '@/components/ui/skeleton';
import { mockResearchPaperNodes, mockResearchPaperEdges } from '@/components/graph/research-paper-mock-data';

const GraphClient = () => {
  // For now, we'll use mock data for the research paper visualization
  // In the future, you can fetch real research papers from your data source
  const isLoading = false; // No loading state for mock data
  
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
      <ResearchPaperGraph 
        nodes={mockResearchPaperNodes} 
        edges={mockResearchPaperEdges} 
      />
    </div>
  );
};

export default GraphClient;