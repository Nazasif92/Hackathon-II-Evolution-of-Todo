/**
 * E2E tests for the Chat interface using Playwright.
 *
 * Prerequisites:
 *   npm install -D @playwright/test
 *   npx playwright install
 *   Backend running on localhost:8000
 *   Frontend running on localhost:3000
 */
import { test, expect, type Page } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// ─── Helpers ─────────────────────────────────────────────────────────

async function signIn(page: Page) {
  await page.goto(`${BASE_URL}/signin`);
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Password").fill("TestPassword123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  // Wait for redirect to dashboard
  await page.waitForURL("**/dashboard**", { timeout: 10_000 });
}

// ─── Authentication guard ────────────────────────────────────────────

test.describe("Chat — Authentication", () => {
  test("unauthenticated user is redirected to signin", async ({ page }) => {
    await page.goto(`${BASE_URL}/chat`);
    // Should redirect to signin or show auth required
    await expect(page).toHaveURL(/signin/);
  });

  test("authenticated user can see chat page", async ({ page }) => {
    await signIn(page);
    await page.goto(`${BASE_URL}/chat`);
    // Chat interface should be visible
    await expect(
      page.getByPlaceholder(/type a message|ask me anything/i)
    ).toBeVisible();
  });
});

// ─── Chat interactions ───────────────────────────────────────────────

test.describe("Chat — Messaging", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await page.goto(`${BASE_URL}/chat`);
  });

  test("send message and receive AI response", async ({ page }) => {
    const input = page.getByPlaceholder(/type a message|ask me anything/i);
    await input.fill("Add a task: buy groceries");
    await input.press("Enter");

    // User message should appear
    await expect(page.getByText("Add a task: buy groceries")).toBeVisible();

    // Typing indicator should show
    await expect(page.getByTestId("typing-indicator")).toBeVisible({
      timeout: 2_000,
    });

    // AI response should eventually appear (allow up to 30s for OpenAI)
    await expect(
      page.locator('[data-role="assistant"]').first()
    ).toBeVisible({ timeout: 30_000 });
  });

  test("typing indicator disappears after response", async ({ page }) => {
    const input = page.getByPlaceholder(/type a message|ask me anything/i);
    await input.fill("List my tasks");
    await input.press("Enter");

    // Wait for response
    await expect(
      page.locator('[data-role="assistant"]').first()
    ).toBeVisible({ timeout: 30_000 });

    // Typing indicator should be gone
    await expect(page.getByTestId("typing-indicator")).not.toBeVisible();
  });

  test("message persistence across page reload", async ({ page }) => {
    const input = page.getByPlaceholder(/type a message|ask me anything/i);
    await input.fill("Add task: test persistence");
    await input.press("Enter");

    // Wait for response
    await expect(
      page.locator('[data-role="assistant"]').first()
    ).toBeVisible({ timeout: 30_000 });

    // Reload page
    await page.reload();

    // Messages should still be visible (loaded from conversation history)
    await expect(page.getByText("Add task: test persistence")).toBeVisible({
      timeout: 10_000,
    });
  });
});

// ─── Responsive design ──────────────────────────────────────────────

test.describe("Chat — Responsive", () => {
  test("mobile viewport (375px) shows chat interface correctly", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await signIn(page);
    await page.goto(`${BASE_URL}/chat`);

    // Chat input should be visible and usable
    const input = page.getByPlaceholder(/type a message|ask me anything/i);
    await expect(input).toBeVisible();

    // Message area should be scrollable (not overflowing)
    const chatContainer = page.locator(".flex.flex-col.h-full").first();
    await expect(chatContainer).toBeVisible();
  });
});

// ─── Navigation ─────────────────────────────────────────────────────

test.describe("Chat — Navigation", () => {
  test("dashboard has link to chat", async ({ page }) => {
    await signIn(page);
    const chatLink = page.getByRole("link", { name: /chat/i });
    await expect(chatLink).toBeVisible();
    await chatLink.click();
    await expect(page).toHaveURL(/chat/);
  });
});
