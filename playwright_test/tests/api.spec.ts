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

test.describe('API Delete Operation', () => {
    
    test('should delete an existing file successfully', async ({ request }) => {
        // Préparation : On s'assure qu'un fichier à supprimer existe physiquement
        const filePath = 'file-to-delete.txt';
        
        const response = await request.delete(`/entries?path=${filePath}`);
        
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.message).toContain('deleted successfully');
    });

    test('should return 404 when trying to delete a non-existent file', async ({ request }) => {
        const response = await request.delete('/entries?path=ghost-file.txt');
        expect(response.status()).toBe(404);
    });

    test('should return 403 when attempting path traversal deletion', async ({ request }) => {
        const response = await request.delete('/entries?path=../../etc/passwd');
        expect(response.status()).toBe(403);
    });
});