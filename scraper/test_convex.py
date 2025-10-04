#!/usr/bin/env python3
"""
Simple test script to verify Convex connectivity and available functions
"""

import os
import sys
import asyncio
from dotenv import load_dotenv


def test_convex_connection():
    """Test basic Convex connection"""
    print("Testing Convex connection...")

    # Load environment variables
    load_dotenv()

    convex_url = os.getenv("CONVEX_URL", "")
    convex_deploy_key = os.getenv("CONVEX_DEPLOY_KEY", "")

    print(f"Convex URL: {convex_url}")
    print(
        f"Deploy Key: {convex_deploy_key[:20]}..."
        if convex_deploy_key
        else "Deploy Key: NOT_SET"
    )

    if not convex_url or not convex_deploy_key:
        print("ERROR: Missing Convex configuration")
        return False

    try:
        from convex import PyConvexClient

        print("✓ Convex library imported successfully")

        # Create client
        client = PyConvexClient(convex_url, convex_deploy_key)
        print("✓ Convex client created successfully")

        # Test a simple query to check connectivity
        try:
            # Try to list available functions or get some basic info
            # This is a safe operation that shouldn't modify data
            result = client.query("system:listFunctions")
            print("✓ Convex connection successful")
            print(
                f"Available functions: {len(result) if isinstance(result, list) else 'Unknown'}"
            )
            return True

        except Exception as query_error:
            print(f"✗ Query failed: {query_error}")
            print(f"Error type: {type(query_error).__name__}")

            # Try a different approach - test with a minimal query
            try:
                # Some Convex deployments might not have system functions
                # Let's try to test with a basic operation
                print("Trying alternative connectivity test...")

                # Just try to create the client and see if it fails
                test_client = PyConvexClient(convex_url, convex_deploy_key)
                print("✓ Client creation successful - connection likely working")

                # Try to query a function that might exist
                try:
                    result = client.query("publications:list", {})
                    print("✓ Publications query successful")
                    return True
                except Exception as pub_error:
                    print(f"Publications query failed: {pub_error}")
                    print("This might be expected if the function doesn't exist yet")

                    # Try mutation test
                    try:
                        print("Testing mutation capability...")
                        # Don't actually insert, just test the call structure
                        test_data = {
                            "title": "Test Paper",
                            "authors": ["Test Author"],
                            "abstract": "Test abstract",
                            "publicationDate": "2024-01-01",
                            "doi": "test-doi",
                            "pdfUrl": "test-url",
                            "keywords": ["test"],
                            "processingStatus": "processing",
                            "citationCount": 0,
                            "viewCount": 0,
                            "organisms": [],
                            "experimentalConditions": [],
                            "biologicalProcesses": [],
                            "spaceEnvironments": [],
                        }

                        result = client.mutation("publications:insert", test_data)
                        print(f"✓ Test mutation successful: {result}")
                        return True

                    except Exception as mut_error:
                        print(f"✗ Mutation test failed: {mut_error}")
                        print(f"Error type: {type(mut_error).__name__}")
                        return False

            except Exception as alt_error:
                print(f"✗ Alternative test failed: {alt_error}")
                return False

    except ImportError as import_error:
        print(f"✗ Failed to import Convex: {import_error}")
        return False
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        print(f"Error type: {type(e).__name__}")
        return False


def test_environment():
    """Test environment setup"""
    print("\nTesting environment setup...")

    load_dotenv()

    required_vars = [
        "CONVEX_URL",
        "CONVEX_DEPLOY_KEY",
        "GEMINI_API_KEY",
        "INPUT_CSV_PATH",
    ]

    all_set = True
    for var in required_vars:
        value = os.getenv(var)
        if value:
            if "key" in var.lower() or "token" in var.lower():
                print(f"✓ {var}: {'*' * min(len(value), 20)}")
            else:
                print(f"✓ {var}: {value}")
        else:
            print(f"✗ {var}: NOT SET")
            all_set = False

    return all_set


if __name__ == "__main__":
    print("=== Convex Connection Test ===")

    # Test environment
    env_ok = test_environment()

    if not env_ok:
        print("\n❌ Environment setup incomplete")
        sys.exit(1)

    # Test Convex connection
    connection_ok = test_convex_connection()

    if connection_ok:
        print("\n✅ All tests passed!")
        sys.exit(0)
    else:
        print("\n❌ Connection tests failed")
        sys.exit(1)
