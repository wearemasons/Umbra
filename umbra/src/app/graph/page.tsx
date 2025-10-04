'use client';

import React from 'react';
import { AppLayout } from '@/components/app-layout';
import GraphClient from './graph-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GraphPage() {
  return (
    <AppLayout>
      <div className="p-6">
        <Card className="h-[calc(100vh-60px)]">
          <CardHeader>
            <CardTitle>Knowledge Graph Visualization</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-50px)]">
            <GraphClient />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}