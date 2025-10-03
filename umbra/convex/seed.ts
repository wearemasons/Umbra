
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { parseCSV } from "./utils";

// Pre-defined lists for simple entity extraction during seeding.
// This provides a baseline before more advanced NLP processing.
const ORGANISMS = ["Arabidopsis thaliana", "wheat", "lettuce", "mice", "C. elegans", "fruit flies", "E. coli", "yeast", "bacteria", "human", "rodent"];
const CONDITIONS = ["microgravity", "radiation", "temperature", "hypergravity", "cosmic radiation", "ionizing radiation", "altered gravity", "hypoxia"];
const ENVIRONMENTS = ["ISS", "International Space Station", "simulated Mars", "LEO", "Low Earth Orbit", "parabolic flight", "spaceflight"];
const PROCESSES = ["gene expression", "protein synthesis", "cell division", "cell differentiation", "bone density", "muscle atrophy", "circadian rhythms", "stress response", "DNA repair"];

/**
 * Extracts entities from text based on a predefined list.
 * @param text The text to search within.
 * @param entityList A list of entities to look for.
 * @returns A unique array of found entities.
 */
function extractEntities(text: string, entityList: string[]): string[] {
    const foundEntities = new Set<string>();
    const lowerText = text.toLowerCase();
    for (const entity of entityList) {
        if (lowerText.includes(entity.toLowerCase())) {
            foundEntities.add(entity);
        }
    }
    return Array.from(foundEntities);
}

/**
 * Seeds the database from a provided CSV string.
 * This mutation should be called with the content of the `sources.csv` file.
 */
export const seedFromFile = mutation({
  args: { csvContent: v.string() },
  handler: async (ctx, { csvContent }) => {
    console.log("Starting to seed database from CSV content...");
    
    try {
      const publications = parseCSV(csvContent);
      if (publications.length === 0) {
        console.warn("CSV content was empty or failed to parse.");
        return { success: false, seededCount: 0, error: "Empty or invalid CSV." };
      }

      let seededCount = 0;
      
      // Process all records within a single mutation.
      // Convex ensures this operation is atomic.
      for (const pub of publications) {
        // Skip if essential data like title is missing.
        if (!pub.title) {
          console.warn("Skipping record with no title.", pub);
          continue;
        }

        try {
          const combinedText = `${pub.title || ''} ${pub.abstract || ''} ${pub.keywords || ''}`;

          await ctx.db.insert("publications", {
            title: pub.title,
            authors: pub.authors ? pub.authors.split(';').map(a => a.trim()) : [],
            abstract: pub.abstract || "",
            publicationDate: pub.publicationDate || new Date(0).toISOString(), // Default to epoch if missing
            doi: pub.doi || "",
            pdfUrl: pub.pdfUrl || "",
            keywords: pub.keywords ? pub.keywords.split(';').map(k => k.trim()) : [],
            
            // Set initial values
            processingStatus: "pending",
            citationCount: 0,
            viewCount: 0,

            // Perform simple, initial entity extraction
            organisms: extractEntities(combinedText, ORGANISMS),
            experimentalConditions: extractEntities(combinedText, CONDITIONS),
            biologicalProcesses: extractEntities(combinedText, PROCESSES),
            spaceEnvironments: extractEntities(combinedText, ENVIRONMENTS),
          });
          seededCount++;
        } catch (e: any) {
          console.error(`Failed to insert publication: "${pub.title}"`, e.message);
        }
      }

      const message = `Successfully seeded ${seededCount} of ${publications.length} publications.`;
      console.log(message);
      return { success: true, seededCount, totalRecords: publications.length };

    } catch (error: any) {
      console.error("Failed to parse CSV and seed database:", error.message);
      // Throwing an error will cause the entire mutation to fail and roll back.
      throw new Error(`CSV seeding failed: ${error.message}`);
    }
  },
});
