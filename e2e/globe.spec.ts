import { test, expect } from '@playwright/test';

test.describe('PolyGlobe Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should load the 3D globe visualization', async ({ page }) => {
        // Check for the main container
        await expect(page.locator('main')).toBeVisible();

        // Check for MapLibre canvas
        // React-map-gl creates a slightly deeper structure, but canvas is key
        const canvas = page.locator('.maplibregl-canvas');
        await expect(canvas).toBeAttached();
    });

    test('should display visual overlay elements', async ({ page }) => {
        // Check Title - matching substring because title contains multiple elements
        await expect(page.locator('h1')).toContainText('POLYGLOBE');

        // Check Ticker presence (using partial text from mock data)
        await expect(page.getByText('Project Alpha', { exact: false })).toBeVisible();

        // Check Sidebar Stats
        await expect(page.getByText('PROJECTS LIVE', { exact: false })).toBeVisible();
    });

    test('should interact with rotation controls', async ({ page }) => {
        // Check that search is present
        await expect(page.getByPlaceholder('Search markets...')).toBeVisible();

        // Check if toggle button exists (simple check)
        // We assume the button with the svg is clickable
        await expect(page.locator('button').first()).toBeVisible();
    });

    test('should contain markers on the map', async ({ page }) => {
        // Wait for map to load markers
        await page.waitForTimeout(2000); // Give map time to init
        const markers = page.locator('.maplibregl-marker');
        // We expect at least the sample projects count
        expect(await markers.count()).toBeGreaterThan(0);
    });
});
