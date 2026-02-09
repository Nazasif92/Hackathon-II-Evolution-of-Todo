"use client";

/**
 * Auth Test Page
 * Simple page to test Better Auth endpoints and JWT integration
 * Navigate to /test-auth to use this page
 */

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function TestAuthPage() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("Test@12345");
  const [name, setName] = useState("Test User");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const { data: session } = authClient.useSession();

  const testSignup = async () => {
    setLoading(true);
    setResult("Testing signup...");
    try {
      const response = await authClient.signUp.email({
        email,
        password,
        name,
      });

      setResult(
        `✅ Signup successful!\nUser ID: ${response.data?.user?.id}\nEmail: ${response.data?.user?.email}`
      );
    } catch (error: any) {
      setResult(`❌ Signup failed: ${error.message || JSON.stringify(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const testSignin = async () => {
    setLoading(true);
    setResult("Testing signin...");
    try {
      const response = await authClient.signIn.email({
        email,
        password,
      });

      // Use token instead of session
      setResult(
        `✅ Signin successful!\nUser ID: ${response.data?.user?.id}\nToken: ${response.data?.token?.substring(0, 20)}...`
      );
    } catch (error: any) {
      setResult(`❌ Signin failed: ${error.message || JSON.stringify(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const testSignout = async () => {
    setLoading(true);
    setResult("Testing signout...");
    try {
      await authClient.signOut();
      setResult("✅ Signout successful!");
    } catch (error: any) {
      setResult(`❌ Signout failed: ${error.message || JSON.stringify(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Better Auth Test Page
        </h1>

        {/* Session Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Session</h2>
          {session ? (
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500">No active session</p>
          )}
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Credentials</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <button
              onClick={testSignup}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              Test Signup
            </button>
            <button
              onClick={testSignin}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              Test Signin
            </button>
            <button
              onClick={testSignout}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
            >
              Test Signout
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          {result ? (
            <pre className="bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap">
              {result}
            </pre>
          ) : (
            <p className="text-gray-500">
              Click a button above to test auth endpoints
            </p>
          )}
        </div>

        {/* Endpoint Status */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Configuration</h3>
          <p className="text-sm">
            <strong>Auth Base URL:</strong>{" "}
            {process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000"}
          </p>
          <p className="text-sm mt-1">
            <strong>API Endpoint:</strong> /api/auth/*
          </p>
        </div>
      </div>
    </div>
  );
}
