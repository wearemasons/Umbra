# Research Paper Graph Component

The `ResearchPaperGraph` component provides an interactive visualization of research papers and their relationships, similar to Obsidian's graph view.

## Features

- **Force-directed layout**: Papers arrange themselves dynamically based on their relationships
- **Draggable nodes**: Click and drag papers to reposition them
- **Zoom and pan**: Use mouse wheel to zoom, click and drag the background to pan
- **Hover tooltips**: See paper details when hovering over a node
- **Click interaction**: Click on a paper to log its ID to the console
- **Curved edges**: Relationships between papers are shown with curved lines
- **Color-coded nodes**: Papers are colored based on publication year
- **Sized nodes**: Node size reflects citation count
- **Relationship visualization**: Different colors for different types of relationships

## Customization

The component can be easily customized:

- **Node styling**: Modify the `attr('fill', ...)` function to change node colors
- **Edge styling**: Update the stroke colors in the link creation section
- **Physics parameters**: Adjust force strengths in the simulation setup
- **Tooltip content**: Modify the `Tooltip` component to show different information
- **Node sizing**: Change the radius calculation for different sizing logic

## Data Structure

The component accepts two data structures:

### ResearchPaperNode
```ts
{
  _id: string;           // Unique identifier
  title: string;         // Paper title (will be truncated in visualization)
  authors: string[];     // List of authors
  summary: string;       // Brief description of the paper
  publicationYear: number; // Year of publication
  citationCount: number; // Number of citations (affects node size)
}
```

### ResearchPaperEdge
```ts
{
  _id: string;                     // Unique identifier
  sourceNodeId: string;            // Reference to source paper
  targetNodeId: string;            // Reference to target paper
  relationshipType: 'cites' | 'references' | 'similar' | 'follows' | 'builds-on'; // Type of relationship
  strength: number;                // Relationship strength (0-1)
}
```

## Usage

```tsx
import ResearchPaperGraph from '@/components/graph/research-paper-graph';

const MyComponent = () => {
  return (
    <div className="h-[500px] w-full">
      <ResearchPaperGraph 
        nodes={myPaperData}
        edges={myRelationshipData}
      />
    </div>
  );
};
```

## Dependencies

- D3.js: For the force-directed graph and visualization
- React: For component architecture