// Define basic Id type for mock data
type Id<T extends string = string> = string & { __brand: T };

// Define interfaces for research paper graph data
export interface ResearchPaperNode {
  _id: Id<'knowledgeGraphNodes'>;
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

export interface ResearchPaperEdge {
  _id: Id<'knowledgeGraphEdges'>;
  sourceNodeId: Id<'knowledgeGraphNodes'>;
  targetNodeId: Id<'knowledgeGraphNodes'>;
  relationshipType: 'cites' | 'references' | 'similar' | 'follows' | 'builds-on';
  strength: number; // 0-1 confidence/similarity score
}

export interface ResearchPaperGraphData {
  nodes: ResearchPaperNode[];
  edges: ResearchPaperEdge[];
}

// Generate mock research paper data
export const mockResearchPaperNodes: ResearchPaperNode[] = [
  {
    _id: 'paper1' as Id<'knowledgeGraphNodes'>,
    title: 'Transformers in Natural Language Processing: A Comprehensive Survey',
    authors: ['Vaswani, A.', 'Shazeer, N.', 'Parmar, N.', 'Uszkoreit, J.'],
    summary: 'This paper introduces the Transformer model, a novel architecture that uses self-attention mechanisms to parallelize computation and achieve superior performance on various NLP tasks.',
    publicationYear: 2020,
    citationCount: 3500
  },
  {
    _id: 'paper2' as Id<'knowledgeGraphNodes'>,
    title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
    authors: ['Devlin, J.', 'Chang, M.W.', 'Lee, K.', 'Toutanova, K.'],
    summary: 'BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers.',
    publicationYear: 2019,
    citationCount: 4200
  },
  {
    _id: 'paper3' as Id<'knowledgeGraphNodes'>,
    title: 'GPT-3: Language Models are Few-Shot Learners',
    authors: ['Brown, T.', 'Mann, B.', 'Ryder, N.', 'Subbiah, M.', 'Kaplan, J.D.'],
    summary: 'Systematic study of transfer learning with language models scaled to 175 billion parameters, demonstrating that large-scale language models can achieve strong performance on many NLP tasks without task-specific training.',
    publicationYear: 2020,
    citationCount: 2800
  },
  {
    _id: 'paper4' as Id<'knowledgeGraphNodes'>,
    title: 'Attention Is All You Need: The Foundation of Modern AI',
    authors: ['Vaswani, A.', 'Shazeer, N.', 'Parmar, N.', 'Uszkoreit, J.', 'Jones, L.', 'Gomez, A.N.', 'Kaiser, L.', 'Polosukhin, I.'],
    summary: 'Introduces the attention mechanism as a fundamental building block for sequence-to-sequence models, replacing recurrence and convolutions entirely.',
    publicationYear: 2017,
    citationCount: 5600
  },
  {
    _id: 'paper5' as Id<'knowledgeGraphNodes'>,
    title: 'Deep Residual Learning for Image Recognition',
    authors: ['He, K.', 'Zhang, X.', 'Ren, S.', 'Sun, J.'],
    summary: 'Introduces residual networks that ease the training of networks that are substantially deeper than those used previously by using shortcut connections.',
    publicationYear: 2016,
    citationCount: 4800
  },
  {
    _id: 'paper6' as Id<'knowledgeGraphNodes'>,
    title: 'ImageNet Classification with Deep Convolutional Neural Networks',
    authors: ['Krizhevsky, A.', 'Sutskever, I.', 'Hinton, G.E.'],
    summary: 'First deep learning model to achieve breakthrough performance on ImageNet, introducing techniques like ReLU activation, dropout, and data augmentation.',
    publicationYear: 2012,
    citationCount: 6200
  },
  {
    _id: 'paper7' as Id<'knowledgeGraphNodes'>,
    title: 'A Few Useful Things to Know about Machine Learning',
    authors: ['Domingos, P.'],
    summary: 'An overview of fundamental principles in machine learning, including the bias-variance tradeoff, the importance of feature engineering, and common pitfalls.',
    publicationYear: 2012,
    citationCount: 1200
  },
  {
    _id: 'paper8' as Id<'knowledgeGraphNodes'>,
    title: 'Generative Adversarial Networks',
    authors: ['Goodfellow, I.', 'Pouget-Abadie, J.', 'Mirza, M.', 'Xu, B.', 'Warde-Farley, D.', 'Ozair, S.', 'Courville, A.', 'Bengio, Y.'],
    summary: 'Introduces GANs, a framework for estimating generative models via an adversarial process, where two models are trained simultaneously: a generative model and a discriminative model.',
    publicationYear: 2014,
    citationCount: 3900
  },
  {
    _id: 'paper9' as Id<'knowledgeGraphNodes'>,
    title: 'Reinforcement Learning: An Introduction',
    authors: ['Sutton, R.S.', 'Barto, A.G.'],
    summary: 'Comprehensive introduction to reinforcement learning, covering both foundational concepts and modern approaches including deep reinforcement learning.',
    publicationYear: 2018,
    citationCount: 2100
  },
  {
    _id: 'paper10' as Id<'knowledgeGraphNodes'>,
    title: 'The Elements of Statistical Learning: Data Mining, Inference, and Prediction',
    authors: ['Hastie, T.', 'Tibshirani, R.', 'Friedman, J.'],
    summary: 'Comprehensive overview of statistical learning techniques, including supervised and unsupervised learning, and the fundamental concepts underlying these methods.',
    publicationYear: 2009,
    citationCount: 3200
  },
  {
    _id: 'paper11' as Id<'knowledgeGraphNodes'>,
    title: 'YOLO: Real-Time Object Detection',
    authors: ['Redmon, J.', 'Divvala, S.', 'Girshick, R.', 'Farhadi, A.'],
    summary: 'You Only Look Once (YOLO) is a real-time object detection system that achieves state-of-the-art performance while running significantly faster than other detection methods.',
    publicationYear: 2016,
    citationCount: 1800
  },
  {
    _id: 'paper12' as Id<'knowledgeGraphNodes'>,
    title: 'Longformer: The Long-Document Transformer',
    authors: ['Beltagy, I.', 'Peters, M.E.', 'Cohan, A.'],
    summary: 'Introduces Longformer, a transformer model that can handle long documents efficiently by using a combination of local and global attention mechanisms.',
    publicationYear: 2020,
    citationCount: 750
  }
];

export const mockResearchPaperEdges: ResearchPaperEdge[] = [
  {
    _id: 'edge1' as Id<'knowledgeGraphEdges'>,
    sourceNodeId: 'paper1' as Id<'knowledgeGraphNodes'>,
    targetNodeId: 'paper4' as Id<'knowledgeGraphNodes'>,
    relationshipType: 'builds-on',
    strength: 0.95
  },
  {
    _id: 'edge2' as Id<'knowledgeGraphEdges'>,
    sourceNodeId: 'paper2' as Id<'knowledgeGraphNodes'>,
    targetNodeId: 'paper1' as Id<'knowledgeGraphNodes'>,
    relationshipType: 'cites',
    strength: 0.92
  },
  {
    _id: 'edge3' as Id<'knowledgeGraphEdges'>,
    sourceNodeId: 'paper3' as Id<'knowledgeGraphNodes'>,
    targetNodeId: 'paper1' as Id<'knowledgeGraphNodes'>,
    relationshipType: 'cites',
    strength: 0.88
  },
  {
    _id: 'edge4' as Id<'knowledgeGraphEdges'>,
    sourceNodeId: 'paper6' as Id<'knowledgeGraphNodes'>,
    targetNodeId: 'paper5' as Id<'knowledgeGraphNodes'>,
    relationshipType: 'similar',
    strength: 0.75
  },
  {
    _id: 'edge5' as Id<'knowledgeGraphEdges'>,
    sourceNodeId: 'paper7' as Id<'knowledgeGraphNodes'>,
    targetNodeId: 'paper6' as Id<'knowledgeGraphNodes'>,
    relationshipType: 'cites',
    strength: 0.80
  },
  {
    _id: 'edge6' as Id<'knowledgeGraphEdges'>,
    sourceNodeId: 'paper8' as Id<'knowledgeGraphNodes'>,
    targetNodeId: 'paper4' as Id<'knowledgeGraphNodes'>,
    relationshipType: 'builds-on',
    strength: 0.85
  },
  {
    _id: 'edge7' as Id<'knowledgeGraphEdges'>,
    sourceNodeId: 'paper9' as Id<'knowledgeGraphNodes'>,
    targetNodeId: 'paper7' as Id<'knowledgeGraphNodes'>,
    relationshipType: 'cites',
    strength: 0.72
  },
  {
    _id: 'edge8' as Id<'knowledgeGraphEdges'>,
    sourceNodeId: 'paper10' as Id<'knowledgeGraphNodes'>,
    targetNodeId: 'paper7' as Id<'knowledgeGraphNodes'>,
    relationshipType: 'similar',
    strength: 0.85
  },
  {
    _id: 'edge9' as Id<'knowledgeGraphEdges'>,
    sourceNodeId: 'paper11' as Id<'knowledgeGraphNodes'>,
    targetNodeId: 'paper5' as Id<'knowledgeGraphNodes'>,
    relationshipType: 'builds-on',
    strength: 0.90
  },
  {
    _id: 'edge10' as Id<'knowledgeGraphEdges'>,
    sourceNodeId: 'paper12' as Id<'knowledgeGraphNodes'>,
    targetNodeId: 'paper1' as Id<'knowledgeGraphNodes'>,
    relationshipType: 'cites',
    strength: 0.78
  },
  {
    _id: 'edge11' as Id<'knowledgeGraphEdges'>,
    sourceNodeId: 'paper3' as Id<'knowledgeGraphNodes'>,
    targetNodeId: 'paper2' as Id<'knowledgeGraphNodes'>,
    relationshipType: 'similar',
    strength: 0.82
  },
  {
    _id: 'edge12' as Id<'knowledgeGraphEdges'>,
    sourceNodeId: 'paper8' as Id<'knowledgeGraphNodes'>,
    targetNodeId: 'paper2' as Id<'knowledgeGraphNodes'>,
    relationshipType: 'similar',
    strength: 0.74
  },
  {
    _id: 'edge13' as Id<'knowledgeGraphEdges'>,
    sourceNodeId: 'paper5' as Id<'knowledgeGraphNodes'>,
    targetNodeId: 'paper6' as Id<'knowledgeGraphNodes'>,
    relationshipType: 'cites',
    strength: 0.91
  },
  {
    _id: 'edge14' as Id<'knowledgeGraphEdges'>,
    sourceNodeId: 'paper9' as Id<'knowledgeGraphNodes'>,
    targetNodeId: 'paper8' as Id<'knowledgeGraphNodes'>,
    relationshipType: 'similar',
    strength: 0.68
  },
  {
    _id: 'edge15' as Id<'knowledgeGraphEdges'>,
    sourceNodeId: 'paper12' as Id<'knowledgeGraphNodes'>,
    targetNodeId: 'paper3' as Id<'knowledgeGraphNodes'>,
    relationshipType: 'similar',
    strength: 0.70
  }
];