import { Id } from '@/convex/_generated/dataModel';

// Mock data for knowledge graph visualization

export interface MockKnowledgeGraphNode {
  _id: Id<'knowledgeGraphNodes'>;
  label: string;
  type: string;
  importance: number;
}

export interface MockKnowledgeGraphEdge {
  _id: Id<'knowledgeGraphEdges'>;
  sourceNodeId: Id<'knowledgeGraphNodes'>;
  targetNodeId: Id<'knowledgeGraphNodes'>;
  relationshipType: string;
  confidence: number;
  publicationIds: Id<'publications'>[];
}

export interface MockPublicationDateMap {
  [id: string]: string;
}

// Mock nodes data
export const mockNodes: MockKnowledgeGraphNode[] = [
  { _id: 'node1' as Id<'knowledgeGraphNodes'>, label: 'Human', type: 'organism', importance: 5 },
  { _id: 'node2' as Id<'knowledgeGraphNodes'>, label: 'Mouse', type: 'organism', importance: 4 },
  { _id: 'node3' as Id<'knowledgeGraphNodes'>, label: 'Space Flight', type: 'condition', importance: 5 },
  { _id: 'node4' as Id<'knowledgeGraphNodes'>, label: 'Microgravity', type: 'condition', importance: 4 },
  { _id: 'node5' as Id<'knowledgeGraphNodes'>, label: 'Bone Density Loss', type: 'biologicalProcess', importance: 4 },
  { _id: 'node6' as Id<'knowledgeGraphNodes'>, label: 'Muscle Atrophy', type: 'biologicalProcess', importance: 4 },
  { _id: 'node7' as Id<'knowledgeGraphNodes'>, label: 'ISS', type: 'spaceEnvironment', importance: 3 },
  { _id: 'node8' as Id<'knowledgeGraphNodes'>, label: 'Mars Mission', type: 'spaceEnvironment', importance: 3 },
  { _id: 'node9' as Id<'knowledgeGraphNodes'>, label: 'Yeast', type: 'organism', importance: 3 },
  { _id: 'node10' as Id<'knowledgeGraphNodes'>, label: 'Radiation Exposure', type: 'condition', importance: 4 },
  { _id: 'node11' as Id<'knowledgeGraphNodes'>, label: 'Cardiovascular Changes', type: 'biologicalProcess', importance: 3 },
  { _id: 'node12' as Id<'knowledgeGraphNodes'>, label: 'Moon Base', type: 'spaceEnvironment', importance: 2 },
  { _id: 'node13' as Id<'knowledgeGraphNodes'>, label: 'Cell Cultures', type: 'organism', importance: 3 },
  { _id: 'node14' as Id<'knowledgeGraphNodes'>, label: 'Immune System Suppression', type: 'biologicalProcess', importance: 3 },
];

// Mock edges data
export const mockEdges: MockKnowledgeGraphEdge[] = [
  { _id: 'edge1' as Id<'knowledgeGraphEdges'>, sourceNodeId: 'node1' as Id<'knowledgeGraphNodes'>, targetNodeId: 'node5' as Id<'knowledgeGraphNodes'>, relationshipType: 'experiences', confidence: 0.9, publicationIds: ['pub1' as Id<'publications'>, 'pub2' as Id<'publications'>] },
  { _id: 'edge2' as Id<'knowledgeGraphEdges'>, sourceNodeId: 'node1' as Id<'knowledgeGraphNodes'>, targetNodeId: 'node6' as Id<'knowledgeGraphNodes'>, relationshipType: 'experiences', confidence: 0.85, publicationIds: ['pub1' as Id<'publications'>, 'pub3' as Id<'publications'>] },
  { _id: 'edge3' as Id<'knowledgeGraphEdges'>, sourceNodeId: 'node3' as Id<'knowledgeGraphNodes'>, targetNodeId: 'node5' as Id<'knowledgeGraphNodes'>, relationshipType: 'causes', confidence: 0.95, publicationIds: ['pub2' as Id<'publications'>, 'pub4' as Id<'publications'>] },
  { _id: 'edge4' as Id<'knowledgeGraphEdges'>, sourceNodeId: 'node3' as Id<'knowledgeGraphNodes'>, targetNodeId: 'node6' as Id<'knowledgeGraphNodes'>, relationshipType: 'causes', confidence: 0.9, publicationIds: ['pub3' as Id<'publications'>, 'pub5' as Id<'publications'>] },
  { _id: 'edge5' as Id<'knowledgeGraphEdges'>, sourceNodeId: 'node4' as Id<'knowledgeGraphNodes'>, targetNodeId: 'node5' as Id<'knowledgeGraphNodes'>, relationshipType: 'causes', confidence: 0.88, publicationIds: ['pub4' as Id<'publications'>, 'pub6' as Id<'publications'>] },
  { _id: 'edge6' as Id<'knowledgeGraphEdges'>, sourceNodeId: 'node4' as Id<'knowledgeGraphNodes'>, targetNodeId: 'node6' as Id<'knowledgeGraphNodes'>, relationshipType: 'causes', confidence: 0.82, publicationIds: ['pub5' as Id<'publications'>, 'pub6' as Id<'publications'>] },
  { _id: 'edge7' as Id<'knowledgeGraphEdges'>, sourceNodeId: 'node2' as Id<'knowledgeGraphNodes'>, targetNodeId: 'node5' as Id<'knowledgeGraphNodes'>, relationshipType: 'models', confidence: 0.75, publicationIds: ['pub7' as Id<'publications'>] },
  { _id: 'edge8' as Id<'knowledgeGraphEdges'>, sourceNodeId: 'node2' as Id<'knowledgeGraphNodes'>, targetNodeId: 'node6' as Id<'knowledgeGraphNodes'>, relationshipType: 'models', confidence: 0.72, publicationIds: ['pub8' as Id<'publications'>] },
  { _id: 'edge9' as Id<'knowledgeGraphEdges'>, sourceNodeId: 'node7' as Id<'knowledgeGraphNodes'>, targetNodeId: 'node3' as Id<'knowledgeGraphNodes'>, relationshipType: 'enables', confidence: 0.92, publicationIds: ['pub9' as Id<'publications'>] },
  { _id: 'edge10' as Id<'knowledgeGraphEdges'>, sourceNodeId: 'node8' as Id<'knowledgeGraphNodes'>, targetNodeId: 'node10' as Id<'knowledgeGraphNodes'>, relationshipType: 'exposes to', confidence: 0.87, publicationIds: ['pub10' as Id<'publications'>] },
  { _id: 'edge11' as Id<'knowledgeGraphEdges'>, sourceNodeId: 'node1' as Id<'knowledgeGraphNodes'>, targetNodeId: 'node11' as Id<'knowledgeGraphNodes'>, relationshipType: 'experiences', confidence: 0.78, publicationIds: ['pub11' as Id<'publications'>] },
  { _id: 'edge12' as Id<'knowledgeGraphEdges'>, sourceNodeId: 'node3' as Id<'knowledgeGraphNodes'>, targetNodeId: 'node11' as Id<'knowledgeGraphNodes'>, relationshipType: 'causes', confidence: 0.8, publicationIds: ['pub11' as Id<'publications'>, 'pub12' as Id<'publications'>] },
  { _id: 'edge13' as Id<'knowledgeGraphEdges'>, sourceNodeId: 'node9' as Id<'knowledgeGraphNodes'>, targetNodeId: 'node10' as Id<'knowledgeGraphNodes'>, relationshipType: 'experiences', confidence: 0.6, publicationIds: ['pub13' as Id<'publications'>] },
  { _id: 'edge14' as Id<'knowledgeGraphEdges'>, sourceNodeId: 'node1' as Id<'knowledgeGraphNodes'>, targetNodeId: 'node14' as Id<'knowledgeGraphNodes'>, relationshipType: 'experiences', confidence: 0.7, publicationIds: ['pub14' as Id<'publications'>] },
  { _id: 'edge15' as Id<'knowledgeGraphEdges'>, sourceNodeId: 'node3' as Id<'knowledgeGraphNodes'>, targetNodeId: 'node14' as Id<'knowledgeGraphNodes'>, relationshipType: 'causes', confidence: 0.7, publicationIds: ['pub14' as Id<'publications'>, 'pub15' as Id<'publications'>] },
  { _id: 'edge16' as Id<'knowledgeGraphEdges'>, sourceNodeId: 'node13' as Id<'knowledgeGraphNodes'>, targetNodeId: 'node10' as Id<'knowledgeGraphNodes'>, relationshipType: 'studies', confidence: 0.65, publicationIds: ['pub16' as Id<'publications'>] },
];

// Mock publication dates
export const mockPublicationDates: MockPublicationDateMap = {
  'pub1': '2021-05-15',
  'pub2': '2022-01-20',
  'pub3': '2021-11-10',
  'pub4': '2022-03-05',
  'pub5': '2022-07-12',
  'pub6': '2021-09-18',
  'pub7': '2020-12-03',
  'pub8': '2021-02-28',
  'pub9': '2020-06-22',
  'pub10': '2023-04-14',
  'pub11': '2022-10-30',
  'pub12': '2023-01-08',
  'pub13': '2021-07-25',
  'pub14': '2022-12-01',
  'pub15': '2023-03-17',
  'pub16': '2021-04-09',
};