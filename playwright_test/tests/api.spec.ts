import { test, expect } from '@playwright/test';


test.describe('API File Explorer', () => {
  
  test('should return entries with metadata (name and type)', async ({ request }) => {
    const response = await request.get('http://localhost:3000/entries');
    const body = await response.json();

    expect(response.ok()).toBeTruthy();
    // On s'attend à un objet riche, pas juste un string
    expect(body[0]).toHaveProperty('name');
    expect(body[0]).toHaveProperty('isDirectory');
  });
});