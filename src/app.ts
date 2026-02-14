import express from 'express';
import * as path from 'path';
import { FileManager } from './file_manager/file';
import { FileSystemAdapter } from './file_manager/fs.adapter';
import { RandomNameGeneratorAdapter } from './file_manager/random-name-generator.adapter';

const app = express();
const port = 3000;

app.use(express.json());

const managedFilesDir = path.join(__dirname, '..', 'managed_files');
const fsAdapter = new FileSystemAdapter();
if (!fsAdapter.existsSync(managedFilesDir)) {
    fsAdapter.mkdirSync(managedFilesDir);
}

const fileManager = new FileManager(
    managedFilesDir,
    fsAdapter,
    new RandomNameGeneratorAdapter()
);

app.get('/entries', (req, res) => {
    try {
        const entries = fileManager.listEntries();
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
});

app.post('/select', (req, res) => {
    try {
        const { entries } = req.body;
        if (!entries) {
            return res.status(400).json({ message: 'Entries are required' });
        }
        fileManager.selectEntries(entries);
        res.json({ message: 'Entries selected' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
});

app.post('/copy', (req, res) => {
    try {
        const { destination } = req.body;
        const result = fileManager.copy(destination);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
});

app.post('/move', (req, res) => {
    try {
        const { destination } = req.body;
        const result = fileManager.move(destination);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
});

app.post('/delete', (req, res) => {
    try {
        const result = fileManager.delete();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
