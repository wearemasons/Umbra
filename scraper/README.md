# Research Paper Automation Bot

This project automates the process of extracting research papers from NCBI PubMed, analyzing their content, and storing structured data in a Convex database.

## Features

- Fetches research papers from NCBI PubMed URLs
- Extracts structured data (title, authors, abstract, etc.)
- Performs entity extraction using Gemini API
- Generates embeddings for different sections of papers
- Stores data in Convex database
- Progress tracking with resume capability
- Comprehensive error handling and logging

## Requirements

- Python 3.9+
- Convex account and deployment
- Google Gemini API key

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd scraper
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. Prepare your input CSV file with columns `title` and `link` containing NCBI PubMed URLs.

## Configuration

Create a `.env` file with the following values:

```env
CONVEX_URL=your_convex_deployment_url
CONVEX_DEPLOY_KEY=your_deploy_key
GEMINI_API_KEY=your_gemini_api_key
INPUT_CSV_PATH=papers.csv
```

## Usage

1. Prepare your CSV file with paper titles and links
2. Run the automation bot:
   ```bash
   python main.py
   ```

The bot will:
- Read your CSV file
- Process each paper, extracting relevant information
- Generate embeddings using the Gemini API
- Store the data in your Convex database
- Track progress in `progress.json` for resume capability

## Output

- Database entries in your Convex tables (publications and embeddings)
- `progress.json` - tracks processing progress
- `automation.log` - comprehensive logging of the process

## Schema

### Publications Table
- `title`: string
- `authors`: array of strings
- `abstract`: string
- `publicationDate`: string (ISO format)
- `doi`: string
- `pdfUrl`: string
- `keywords`: array of strings
- `processingStatus`: "pending" | "processing" | "completed" | "failed"
- `citationCount`: number
- `viewCount`: number
- `organisms`: optional array of strings (extracted entities)
- `experimentalConditions`: optional array of strings
- `biologicalProcesses`: optional array of strings
- `spaceEnvironments`: optional array of strings

### Embeddings Table
- `publicationId`: reference to publications table
- `section`: string (e.g., "title", "abstract", "methods", "results", "discussion")
- `embedding`: array of float64 (768 dimensions)

## Error Handling

The bot includes robust error handling:
- Network errors: Retries with exponential backoff
- API rate limits: Respects limits with appropriate delays
- Parsing errors: Logs failure and continues processing
- Database errors: Updates status appropriately
- Resume capability: Continues from last successful paper

## Rate Limiting

- 1 second delay between papers
- 0.5 second delay between API calls
- Respects NCBI's usage guidelines

## Convex Schema Setup

For the bot to work, you need to set up the following tables in your Convex deployment:

```javascript
// convex/schemas.js
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  publications: defineTable({
    title: v.string(),
    authors: v.array(v.string()),
    abstract: v.string(),
    publicationDate: v.string(),
    doi: v.string(),
    pdfUrl: v.string(),
    keywords: v.array(v.string()),
    processingStatus: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    citationCount: v.number(),
    viewCount: v.number(),
    organisms: v.optional(v.array(v.string())),
    experimentalConditions: v.optional(v.array(v.string())),
    biologicalProcesses: v.optional(v.array(v.string())),
    spaceEnvironments: v.optional(v.array(v.string())),
  }),
  embeddings: defineTable({
    publicationId: v.id("publications"),
    section: v.string(),
    embedding: v.array(v.float64()),
  }).index("by_publication", ["publicationId"]),
});
```

## Testing

Run the test implementation to validate your setup:
```bash
python test_implementation.py
```