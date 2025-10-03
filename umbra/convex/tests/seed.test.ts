import { v } from "convex/values";
import { seedFromFile } from "../seed";
import { getPublications } from "../publications";
import { internal } from "../_generated/api";
import { expect, jest, test } from "@jest/globals";

// Mock CSV content for testing
const MOCK_CSV_CONTENT = `title,authors,abstract,publicationDate,doi,pdfUrl,keywords
"Test Publication","Smith, J.","This is a test abstract.","2023-01-01","10.1000/test","https://example.com/test.pdf","test; publication; research"`;

jest.setTimeout(30000); // Increase timeout for API calls

test("seedFromFile should successfully parse and insert publications", async () => {
  const mockCtx: any = {
    db: {
      insert: jest.fn().mockResolvedValue("publication_id_1"),
      get: jest.fn(),
      query: jest.fn(() => ({
        withSearchIndex: jest.fn(() => ({
          search: jest.fn(() => ({
            order: jest.fn(() => ({
              paginate: jest.fn(() => ({
                page: [],
                hasNext: false,
                cursor: null
              }))
            }))
          }))
        }))
      })),
      patch: jest.fn().mockResolvedValue(undefined)
    }
  };

  // Test the seedFromFile function
  const result = await seedFromFile.handler(mockCtx, { 
    csvContent: MOCK_CSV_CONTENT 
  });

  expect(result.success).toBe(true);
  expect(result.seededCount).toBeGreaterThan(0);
});

// Additional test for getPublications function
test("getPublications should return paginated results", async () => {
  const mockCtx: any = {
    db: {
      query: jest.fn(() => ({
        withSearchIndex: jest.fn(() => ({
          search: jest.fn(() => ({
            order: jest.fn(() => ({
              paginate: jest.fn(() => ({
                page: [],
                hasNext: false,
                cursor: null
              }))
            }))
          }))
        })),
        order: jest.fn(() => ({
          paginate: jest.fn(() => ({
            page: [],
            hasNext: false,
            cursor: null
          }))
        })),
        filter: jest.fn(() => ({
          order: jest.fn(() => ({
            paginate: jest.fn(() => ({
              page: [],
              hasNext: false,
              cursor: null
            }))
          }))
        }))
      }))
    }
  };

  const result = await getPublications.handler(mockCtx, { 
    paginationOpts: { numItems: 10, cursor: null } 
  });

  expect(result.page).toBeDefined();
  expect(Array.isArray(result.page)).toBe(true);
});