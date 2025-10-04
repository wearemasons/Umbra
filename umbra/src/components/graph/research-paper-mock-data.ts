// Define basic Id type for mock data
type Id<T extends string = string> = string & { __brand: T };

// Define interfaces for research paper graph data
export interface ResearchPaperNode {
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

export interface ResearchPaperEdge {
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

export interface ResearchPaperGraphData {
  nodes: ResearchPaperNode[];
  edges: ResearchPaperEdge[];
}

// Generate mock research paper data
export const mockResearchPaperNodes: ResearchPaperNode[] = [
  {
    _id: "paper1" as Id<"knowledgeGraphNodes">,
    title: "Mice in Bion-M 1 space mission: training and selection",
    authors: ["Shtemberg, A.S.", "Matveeva, M.I.", "Zhdankina, Y.S."],
    summary:
      "This paper describes the training protocols and selection criteria for mice used in the Bion-M 1 biosatellite mission, detailing preparation procedures for spaceflight experiments.",
    publicationYear: 2014,
    citationCount: 0,
  },
  {
    _id: "paper2" as Id<"knowledgeGraphNodes">,
    title:
      "Microgravity induces pelvic bone loss through osteoclastic activity, osteocytic osteolysis, and osteoblastic cell cycle inhibition by CDKN1a/p21",
    authors: [
      "Blaber, E.A.",
      "Dvorochkin, N.",
      "Torres, M.L.",
      "Yousuf, R.",
      "Burns, B.P.",
      "Globus, R.K.",
      "Almeida, E.A.C.",
    ],
    summary:
      "This study demonstrates that microgravity-induced bone loss occurs through multiple mechanisms including increased osteoclastic activity, osteocytic osteolysis, and inhibition of osteoblast cell cycle via CDKN1a/p21 pathway.",
    publicationYear: 2013,
    citationCount: 0,
  },
  {
    _id: "paper3" as Id<"knowledgeGraphNodes">,
    title: "Stem Cell Health and Tissue Regeneration in Microgravity",
    authors: ["Monticone, M.", "Tahir, F.", "Sensebé, L.", "Ricco, J.M."],
    summary:
      "This comprehensive review examines how microgravity affects stem cell behavior, differentiation potential, and tissue regeneration capabilities, with implications for long-duration space missions.",
    publicationYear: 2024,
    citationCount: 0,
  },
  {
    _id: "paper4" as Id<"knowledgeGraphNodes">,
    title:
      "Microgravity Reduces the Differentiation and Regenerative Potential of Embryonic Stem Cells",
    authors: [
      "Blaber, E.A.",
      "Finkelstein, H.",
      "Dvorochkin, N.",
      "Sato, K.Y.",
      "Yousuf, R.",
      "Burns, B.P.",
      "Globus, R.K.",
      "Almeida, E.A.C.",
    ],
    summary:
      "This research demonstrates that microgravity exposure impairs embryonic stem cell differentiation and reduces their regenerative capacity, raising concerns for tissue repair during spaceflight.",
    publicationYear: 2021,
    citationCount: 0,
  },
  {
    _id: "paper5" as Id<"knowledgeGraphNodes">,
    title:
      "Microgravity validation of a novel system for RNA isolation and multiplex quantitative real time PCR analysis of gene expression on the International Space Station",
    authors: [
      "Parra, M.",
      "Jung, J.",
      "Boone, T.D.",
      "Tran, L.",
      "Blaber, E.A.",
      "Brown, M.",
      "Chin, M.",
      "Chinn, T.",
      "Cohen, J.",
      "Hartman, C.",
      "Hoehn, A.",
      "Moed, S.",
      "Nelman-Gonzalez, M.",
      "Prasad, N.",
      "Pyle, M.",
      "Sriram, S.",
      "Suresh, S.",
      "Tahimic, C.G.T.",
      "Zhou, J.",
      "Globus, R.K.",
      "Almeida, E.A.C.",
    ],
    summary:
      "This paper validates a novel automated system capable of performing RNA isolation and multiplex qRT-PCR analysis aboard the ISS, enabling real-time gene expression studies in microgravity.",
    publicationYear: 2017,
    citationCount: 0,
  },
  {
    _id: "paper6" as Id<"knowledgeGraphNodes">,
    title:
      "Spaceflight Modulates the Expression of Key Oxidative Stress and Cell Cycle Related Genes in Heart",
    authors: [
      "Beheshti, A.",
      "Ray, S.",
      "Fogle, H.",
      "Berrios, D.",
      "Costes, S.V.",
    ],
    summary:
      "This study reveals that spaceflight significantly alters gene expression patterns related to oxidative stress and cell cycle regulation in cardiac tissue, with implications for cardiovascular health during space missions.",
    publicationYear: 2021,
    citationCount: 0,
  },
  {
    _id: "paper7" as Id<"knowledgeGraphNodes">,
    title:
      "Dose- and Ion-Dependent Effects in the Oxidative Stress Response to Space-Like Radiation Exposure in the Skeletal System",
    authors: [
      "Yumoto, K.",
      "Globus, R.K.",
      "Mojarrab, R.",
      "Arakaki, J.",
      "Wang, A.",
      "Searby, N.D.",
      "Almeida, E.A.C.",
      "Limoli, C.L.",
    ],
    summary:
      "This research characterizes dose- and ion-dependent oxidative stress responses in skeletal tissue following space radiation exposure, demonstrating differential effects of various radiation types on bone health.",
    publicationYear: 2017,
    citationCount: 0,
  },
  {
    _id: "paper8" as Id<"knowledgeGraphNodes">,
    title:
      "From the bench to exploration medicine: NASA life sciences translational research for human exploration and habitation missions",
    authors: [
      "Ronca, A.E.",
      "Moyer, E.L.",
      "Talyansky, Y.",
      "Lowe, M.",
      "Padmanabhan, S.",
      "Choi, S.",
      "Gong, C.",
      "Cadena, S.M.",
      "Stodieck, L.",
      "Globus, R.K.",
    ],
    summary:
      "This paper outlines NASA's translational research framework for converting basic space biology findings into practical countermeasures and medical interventions for long-duration space exploration missions.",
    publicationYear: 2017,
    citationCount: 0,
  },
  {
    _id: "paper9" as Id<"knowledgeGraphNodes">,
    title:
      "High-precision method for cyclic loading of small-animal vertebrae to assess bone quality",
    authors: ["Keune, J.A.", "Branscum, A.J.", "Iwaniec, U.T.", "Turner, R.T."],
    summary:
      "This methodological paper presents a high-precision technique for applying cyclic loading to small animal vertebrae, enabling accurate assessment of bone quality and mechanical properties.",
    publicationYear: 2018,
    citationCount: 0,
  },
  {
    _id: "paper10" as Id<"knowledgeGraphNodes">,
    title:
      "Effects of ex vivo ionizing radiation on collagen structure and whole-bone mechanical properties of mouse vertebrae",
    authors: ["Keenawinna, L.", "Yao, H.", "Kacena, M.A.", "Oest, M.E."],
    summary:
      "This study examines how ionizing radiation affects collagen structure and mechanical properties of vertebrae, demonstrating radiation-induced changes in bone composition and strength.",
    publicationYear: 2019,
    citationCount: 0,
  },
  {
    _id: "paper11" as Id<"knowledgeGraphNodes">,
    title:
      "Absence of gamma-sarcoglycan alters the response of p70S6 kinase to mechanical perturbation in murine skeletal muscle",
    authors: [
      "Fluckey, J.D.",
      "Knox, M.",
      "Smith, L.",
      "Dupont-Versteegden, E.E.",
      "Gaddy, D.",
      "Tesch, P.A.",
      "Peterson, C.A.",
    ],
    summary:
      "This research demonstrates that gamma-sarcoglycan deficiency alters mechanotransduction signaling through p70S6 kinase in skeletal muscle, affecting the muscle's response to mechanical stimuli.",
    publicationYear: 2014,
    citationCount: 0,
  },
  {
    _id: "paper12" as Id<"knowledgeGraphNodes">,
    title:
      "AtRabD2b and AtRabD2c have overlapping functions in pollen development and pollen tube growth",
    authors: ["Peng, J.", "Ilarslan, H.", "Wurtele, E.S.", "Bassham, D.C."],
    summary:
      "This study reveals functional redundancy between AtRabD2b and AtRabD2c proteins in Arabidopsis, showing their overlapping roles in pollen development and pollen tube elongation.",
    publicationYear: 2011,
    citationCount: 0,
  },
  {
    _id: "paper13" as Id<"knowledgeGraphNodes">,
    title:
      "TNO1 is involved in salt tolerance and vacuolar trafficking in Arabidopsis",
    authors: ["Larson, E.R.", "Domozych, D.S.", "Tierney, M.L."],
    summary:
      "This research identifies TNO1's role in salt stress tolerance and vacuolar trafficking pathways in Arabidopsis, linking membrane trafficking to stress response mechanisms.",
    publicationYear: 2011,
    citationCount: 0,
  },
  {
    _id: "paper14" as Id<"knowledgeGraphNodes">,
    title:
      "Functional redundancy between trans-Golgi network SNARE family members in Arabidopsis thaliana",
    authors: [
      "Larson, E.R.",
      "Karnik, R.",
      "Yalamanchili, M.",
      "Geisler, M.",
      "Blakeslee, J.J.",
      "Bassham, D.C.",
    ],
    summary:
      "This study demonstrates functional redundancy among trans-Golgi network SNARE proteins in Arabidopsis, revealing compensatory mechanisms in vesicle trafficking and membrane fusion.",
    publicationYear: 2024,
    citationCount: 0,
  },
  {
    _id: "paper15" as Id<"knowledgeGraphNodes">,
    title: "Root growth movements: Waving and skewing",
    authors: [
      "Schultz, E.R.",
      "Zupanic, A.",
      "Samuels, T.",
      "Esmon, C.A.",
      "Gilroy, S.",
      "Symons, G.M.",
    ],
    summary:
      "This review examines the mechanisms underlying root waving and skewing behaviors in plants, exploring the genetic and environmental factors controlling these directional growth movements.",
    publicationYear: 2017,
    citationCount: 0,
  },
  {
    _id: "paper16" as Id<"knowledgeGraphNodes">,
    title:
      "Gravitropism and lateral root emergence are dependent on the trans-Golgi network protein TNO1",
    authors: [
      "Gendre, D.",
      "Oh, J.",
      "Boutté, Y.",
      "Best, J.G.",
      "Samuels, T.",
      "Nilsson, R.",
      "Uemura, T.",
      "Marchant, A.",
      "Bennett, M.J.",
      "Grebe, M.",
      "Bhalerao, R.P.",
    ],
    summary:
      "This research establishes that TNO1, a trans-Golgi network protein, is essential for both gravitropic responses and lateral root emergence in Arabidopsis through its role in membrane trafficking.",
    publicationYear: 2015,
    citationCount: 0,
  },
  {
    _id: "paper17" as Id<"knowledgeGraphNodes">,
    title:
      "TNO1, a TGN-localized SNARE-interacting protein, modulates root skewing in Arabidopsis thaliana",
    authors: ["Samuels, T.", "嘉宾, N."],
    summary:
      "This study identifies TNO1 as a TGN-localized SNARE-interacting protein that modulates root skewing behavior in Arabidopsis through its effects on vesicle trafficking and cell wall modification.",
    publicationYear: 2017,
    citationCount: 0,
  },
  {
    _id: "paper18" as Id<"knowledgeGraphNodes">,
    title:
      "The Drosophila SUN protein Spag4 cooperates with the coiled-coil protein Yuri Gagarin to maintain association of the basal body and spermatid nucleus",
    authors: [
      "Kracklauer, M.P.",
      "Wiora, H.M.",
      "Deery, W.J.",
      "Chen, X.",
      "Bolival, B.",
      "Romanek, L.",
      "Simonette, R.A.",
      "Fuller, M.T.",
    ],
    summary:
      "This research reveals the cooperation between SUN domain protein Spag4 and coiled-coil protein Yuri Gagarin in maintaining the critical connection between basal body and nucleus during Drosophila spermatid development.",
    publicationYear: 2010,
    citationCount: 0,
  },
];

export const mockResearchPaperEdges: ResearchPaperEdge[] = [
  {
    _id: "edge1" as Id<"knowledgeGraphEdges">,
    sourceNodeId: "paper1" as Id<"knowledgeGraphNodes">,
    targetNodeId: "paper2" as Id<"knowledgeGraphNodes">,
    relationshipType: "relates-to",
    strength: 0.85,
  },
  {
    _id: "edge2" as Id<"knowledgeGraphEdges">,
    sourceNodeId: "paper2" as Id<"knowledgeGraphNodes">,
    targetNodeId: "paper3" as Id<"knowledgeGraphNodes">,
    relationshipType: "relates-to",
    strength: 0.8,
  },
  {
    _id: "edge3" as Id<"knowledgeGraphEdges">,
    sourceNodeId: "paper3" as Id<"knowledgeGraphNodes">,
    targetNodeId: "paper4" as Id<"knowledgeGraphNodes">,
    relationshipType: "builds-on",
    strength: 0.9,
  },
  {
    _id: "edge4" as Id<"knowledgeGraphEdges">,
    sourceNodeId: "paper4" as Id<"knowledgeGraphNodes">,
    targetNodeId: "paper5" as Id<"knowledgeGraphNodes">,
    relationshipType: "enables",
    strength: 0.75,
  },
  {
    _id: "edge5" as Id<"knowledgeGraphEdges">,
    sourceNodeId: "paper2" as Id<"knowledgeGraphNodes">,
    targetNodeId: "paper7" as Id<"knowledgeGraphNodes">,
    relationshipType: "relates-to",
    strength: 0.82,
  },
  {
    _id: "edge6" as Id<"knowledgeGraphEdges">,
    sourceNodeId: "paper7" as Id<"knowledgeGraphNodes">,
    targetNodeId: "paper10" as Id<"knowledgeGraphNodes">,
    relationshipType: "builds-on",
    strength: 0.88,
  },
  {
    _id: "edge7" as Id<"knowledgeGraphEdges">,
    sourceNodeId: "paper2" as Id<"knowledgeGraphNodes">,
    targetNodeId: "paper9" as Id<"knowledgeGraphNodes">,
    relationshipType: "enables",
    strength: 0.7,
  },
  {
    _id: "edge8" as Id<"knowledgeGraphEdges">,
    sourceNodeId: "paper9" as Id<"knowledgeGraphNodes">,
    targetNodeId: "paper10" as Id<"knowledgeGraphNodes">,
    relationshipType: "enables",
    strength: 0.85,
  },
  {
    _id: "edge9" as Id<"knowledgeGraphEdges">,
    sourceNodeId: "paper1" as Id<"knowledgeGraphNodes">,
    targetNodeId: "paper8" as Id<"knowledgeGraphNodes">,
    relationshipType: "contributes-to",
    strength: 0.78,
  },
  {
    _id: "edge10" as Id<"knowledgeGraphEdges">,
    sourceNodeId: "paper2" as Id<"knowledgeGraphNodes">,
    targetNodeId: "paper8" as Id<"knowledgeGraphNodes">,
    relationshipType: "contributes-to",
    strength: 0.8,
  },
  {
    _id: "edge11" as Id<"knowledgeGraphEdges">,
    sourceNodeId: "paper3" as Id<"knowledgeGraphNodes">,
    targetNodeId: "paper8" as Id<"knowledgeGraphNodes">,
    relationshipType: "contributes-to",
    strength: 0.82,
  },
  {
    _id: "edge12" as Id<"knowledgeGraphEdges">,
    sourceNodeId: "paper4" as Id<"knowledgeGraphNodes">,
    targetNodeId: "paper8" as Id<"knowledgeGraphNodes">,
    relationshipType: "contributes-to",
    strength: 0.83,
  },
  {
    _id: "edge13" as Id<"knowledgeGraphEdges">,
    sourceNodeId: "paper5" as Id<"knowledgeGraphNodes">,
    targetNodeId: "paper8" as Id<"knowledgeGraphNodes">,
    relationshipType: "contributes-to",
    strength: 0.85,
  },
  {
    _id: "edge14" as Id<"knowledgeGraphEdges">,
    sourceNodeId: "paper6" as Id<"knowledgeGraphNodes">,
    targetNodeId: "paper8" as Id<"knowledgeGraphNodes">,
    relationshipType: "contributes-to",
    strength: 0.8,
  },
  {
    _id: "edge15" as Id<"knowledgeGraphEdges">,
    sourceNodeId: "paper7" as Id<"knowledgeGraphNodes">,
    targetNodeId: "paper8" as Id<"knowledgeGraphNodes">,
    relationshipType: "contributes-to",
    strength: 0.81,
  },
  {
    _id: "edge16" as Id<"knowledgeGraphEdges">,
    sourceNodeId: "paper1" as Id<"knowledgeGraphNodes">,
    targetNodeId: "paper6" as Id<"knowledgeGraphNodes">,
    relationshipType: "relates-to",
    strength: 0.75,
  },
  {
    _id: "edge17" as Id<"knowledgeGraphEdges">,
    sourceNodeId: "paper12" as Id<"knowledgeGraphNodes">,
    targetNodeId: "paper14" as Id<"knowledgeGraphNodes">,
    relationshipType: "relates-to",
    strength: 0.88,
  },
  {
    _id: "edge18" as Id<"knowledgeGraphEdges">,
    sourceNodeId: "paper13" as Id<"knowledgeGraphNodes">,
    targetNodeId: "paper14" as Id<"knowledgeGraphNodes">,
    relationshipType: "builds-on",
    strength: 0.9,
  },
  {
    _id: "edge19" as Id<"knowledgeGraphEdges">,
    sourceNodeId: "paper13" as Id<"knowledgeGraphNodes">,
    targetNodeId: "paper16" as Id<"knowledgeGraphNodes">,
    relationshipType: "builds-on",
    strength: 0.92,
  },
  {
    _id: "edge20" as Id<"knowledgeGraphEdges">,
    sourceNodeId: "paper16" as Id<"knowledgeGraphNodes">,
    targetNodeId: "paper17" as Id<"knowledgeGraphNodes">,
    relationshipType: "builds-on",
    strength: 0.95,
  },
  {
    _id: "edge21" as Id<"knowledgeGraphEdges">,
    sourceNodeId: "paper15" as Id<"knowledgeGraphNodes">,
    targetNodeId: "paper17" as Id<"knowledgeGraphNodes">,
    relationshipType: "relates-to",
    strength: 0.87,
  },
  {
    _id: "edge22" as Id<"knowledgeGraphEdges">,
    sourceNodeId: "paper14" as Id<"knowledgeGraphNodes">,
    targetNodeId: "paper16" as Id<"knowledgeGraphNodes">,
    relationshipType: "relates-to",
    strength: 0.85,
  },
  {
    _id: "edge23" as Id<"knowledgeGraphEdges">,
    sourceNodeId: "paper11" as Id<"knowledgeGraphNodes">,
    targetNodeId: "paper1" as Id<"knowledgeGraphNodes">,
    relationshipType: "relates-to",
    strength: 0.65,
  },
];
