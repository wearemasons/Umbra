
import { Doc } from "./_generated/dataModel";

/**
 * A simple CSV parser. This implementation is basic and does not handle
 * commas within quoted fields. For production use, a more robust library
 * is recommended.
 * @param fileContent The string content of the CSV file.
 * @returns An array of objects, where each object represents a row.
 */
export function parseCSV(fileContent: string): Array<Record<string, string>> {
  const lines = fileContent.trim().split('\n');
  if (lines.length < 2) {
    return [];
  }

  const header = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const values = line.split(',');
    const row: Record<string, string> = {};
    header.forEach((h, i) => {
      row[h] = values[i]?.trim() ?? '';
    });
    return row;
  });

  return rows;
}

/**
 * Extracts simple keywords from a text. This is a placeholder and can be
 * replaced with a more sophisticated NLP library.
 * @param text The text to extract keywords from.
 * @returns An array of keywords.
 */
export function extractKeywords(text: string): string[] {
    const commonWords = new Set(['the', 'a', 'an', 'in', 'on', 'of', 'for', 'to', 'and', 'is', 'with', 'as', 'were', 'was']);
    return text.toLowerCase()
        .replace(/[^\\w\s]/g, '') // remove punctuation
        .split(/\s+/)
        .filter(word => word.length > 3 && !commonWords.has(word));
}

/**
 * Placeholder for a relevance scoring function.
 * @param query The user's query.
 * @param document The document to score.
 * @returns A relevance score.
 */
export function calculateRelevanceScore(query: string, document: string): number {
    // In a real implementation, this would use a more complex algorithm
    // like cosine similarity on embeddings.
    const queryWords = new Set(query.toLowerCase().split(' '));
    const docWords = document.toLowerCase().split(' ');
    const intersection = docWords.filter(word => queryWords.has(word));
    return intersection.length / docWords.length;
}

/**
 * Formats a publication document into a standard citation format.
 * @param publication The publication document from Convex.
 * @returns A formatted citation string.
 */
export function formatCitation(publication: Doc<"publications">): string {
    const authors = publication.authors.length > 1 ? `${publication.authors[0]} et al.` : publication.authors[0];
    const year = new Date(publication.publicationDate).getFullYear();
    return `${authors} (${year}). "${publication.title}". *NASA Technical Reports Server*. DOI: ${publication.doi}`;
}

/**
 * Validates a DOI string using a regular expression.
 * @param doi The DOI string to validate.
 * @returns True if the DOI is valid, false otherwise.
 */
export function validateDOI(doi: string): boolean {
    // Regex to match a DOI string.
    const doiRegex = /^10.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;
    return doiRegex.test(doi);
}
