import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import fs from "fs";
import path from "path";

// Define the structure of each row in the CSV
interface CsvRow {
  Title: string;
  Link: string;
  [key: string]: string; // Allow for additional columns
}

// Cache for storing parsed CSV data
let csvCache: CsvRow[] | null = null;

// Function to fetch and parse the CSV file
async function fetchAndParseCsv(): Promise<CsvRow[]> {
  if (csvCache) {
    return csvCache;
  }

  try {
    // Read the CSV file directly from the public directory
    const csvPath = path.join(process.cwd(), "public", "sources.csv");
    const csvText = fs.readFileSync(csvPath, "utf8");

    // Parse the CSV
    const parsed = Papa.parse<CsvRow>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    csvCache = parsed.data;
    return parsed.data;
  } catch (error) {
    console.error("Error parsing CSV:", error);
    throw new Error("Could not parse the sources.csv file");
  }
}

// Function to search the CSV for relevant information based on a query
async function searchCsvData(query: string): Promise<CsvRow[]> {
  const csvData = await fetchAndParseCsv();

  // Simple search that looks for query terms in the Title field
  const queryTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 0);

  if (queryTerms.length === 0) {
    return [];
  }

  // Filter rows that contain any of the query terms in the title
  const results = csvData.filter((row) => {
    if (!row.Title) return false;

    const title = row.Title.toLowerCase();
    return queryTerms.some((term) => title.includes(term));
  });

  return results;
}

// Function to extract information from a URL (simulated - in a real implementation,
// you would need to implement web scraping or some other method to extract content)
async function extractFromUrl(url: string): Promise<string> {
  // In this implementation, we'll return a placeholder indicating that we would extract content
  // In a more advanced implementation, you could use a service like JSDOM or similar to extract content
  return `Content from: ${url}`;
}

// Function to build a context from CSV and linked sources for the Gemini API
async function buildContextFromCsvAndSources(query: string): Promise<{
  csvResults: CsvRow[];
  sourceContents: string[];
  contextString: string;
}> {
  // First, search the CSV for relevant entries
  const csvResults = await searchCsvData(query);

  // Then, extract content from the linked sources
  const sourcePromises = csvResults.map((row) =>
    row.Link ? extractFromUrl(row.Link) : Promise.resolve(""),
  );

  const sourceContents = await Promise.all(sourcePromises);

  // Build a context string combining CSV data and source content
  let contextString = "CSV Data:\n";
  csvResults.forEach((row, index) => {
    contextString += `Title: ${row.Title}\n`;
    if (row.Link) {
      contextString += `Link: ${row.Link}\n`;
    }
    contextString += `Extracted Content: ${sourceContents[index]}\n\n`;
  });

  return {
    csvResults,
    sourceContents,
    contextString,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY environment variable is not set" },
        { status: 500 },
      );
    }

    // Build context from CSV and sources
    const { contextString } = await buildContextFromCsvAndSources(prompt);

    // Prepare the system prompt with CSV context
    const systemPrompt = `You are Umbra's Research Assistant: A space biology knowledge engine.

Your primary knowledge source is the CSV containing space biology research papers.

If a question cannot be fully answered from the CSV alone, you are allowed to follow and browse the URLs listed in the CSV rows.

Use the contents of those linked sources strictly to complement the CSV data.

If both CSV and linked sources do not provide enough information, respond with: "Not available in dataset or linked sources."

Always prioritize CSV values first, then add insights from the linked sources if relevant.

Provide clear, accurate, and concise answers.

When using linked sources, clearly indicate which URL the information came from.

Do not use external knowledge outside of the CSV and its links.

Here is the relevant CSV data for your reference:
${contextString}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-lite-latest",
    });

    // Prepare the content for the model
    const content = [{ text: systemPrompt }, { text: prompt }];

    const result = await model.generateContent(content);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
