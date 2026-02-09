/**
 * Simple test script to verify Better Auth endpoints are responding correctly
 * Tests the signup, signin, and session endpoints
 */

import { config } from "dotenv";

// Load environment variables
config();

const BASE_URL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";
const API_BASE = `${BASE_URL}/api/auth`;

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

async function testEndpoint(name: string, endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const passed = response.status !== 404;
    results.push({
      test: name,
      passed,
      message: passed
        ? `✅ ${response.status} ${response.statusText}`
        : `❌ Endpoint returned 404`,
    });

    return response;
  } catch (error) {
    results.push({
      test: name,
      passed: false,
      message: `❌ Request failed: ${error instanceof Error ? error.message : String(error)}`,
    });
    return null;
  }
}

async function runTests() {
  console.log("Testing Better Auth endpoints...\n");

  // Wait for server to be ready
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Test 1: Check signup endpoint exists
  await testEndpoint("Signup endpoint (POST)", "/signup", {
    method: "POST",
    body: JSON.stringify({
      email: "test@example.com",
      password: "test123456",
      name: "Test User",
    }),
  });

  // Test 2: Check signin endpoint exists
  await testEndpoint("Signin endpoint (POST)", "/sign-in", {
    method: "POST",
    body: JSON.stringify({
      email: "test@example.com",
      password: "test123456",
    }),
  });

  // Test 3: Check session endpoint exists
  await testEndpoint("Session endpoint (GET)", "/get-session", {
    method: "GET",
  });

  // Print results
  console.log("\n=== Test Results ===\n");
  results.forEach((result) => {
    console.log(`${result.test}: ${result.message}`);
  });

  const allPassed = results.every((r) => r.passed);
  console.log(
    `\n${allPassed ? "✅ All tests passed!" : "❌ Some tests failed"}`
  );
  console.log(`\nEndpoint base URL: ${API_BASE}`);

  process.exit(allPassed ? 0 : 1);
}

runTests();
