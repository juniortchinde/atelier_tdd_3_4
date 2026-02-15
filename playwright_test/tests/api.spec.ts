import { test, expect } from '@playwright/test';

test('should list files in the managed directory', async ({ request }) => {
  const response = await request.get('http://localhost:3000/entries');
  const files = await response.json();
  
  // This will fail because we expect a file that doesn't exist.
  expect(files).toContain('non_existent_file.txt');
});
