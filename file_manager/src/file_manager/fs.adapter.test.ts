import { FileSystemAdapter } from './fs.adapter';
import * as fs from 'fs';
import * as path from 'path';

describe('FileSystemAdapter', () => {
    const TEST_DIR = path.join(__dirname, 'test_dir_adapter');
    const FILE1 = 'file1.txt';
    const SUB_DIR = 'sub_dir';

    beforeEach(() => {
        fs.mkdirSync(TEST_DIR, { recursive: true });
        fs.writeFileSync(path.join(TEST_DIR, FILE1), 'file1 content');
        fs.mkdirSync(path.join(TEST_DIR, SUB_DIR));
    });

    afterEach(() => {
        fs.rmSync(TEST_DIR, { recursive: true, force: true });
    });

    it('should list entries in the directory', () => {
        const adapter = new FileSystemAdapter();
        const entries = adapter.readdirSync(TEST_DIR);
        expect(entries).toEqual(expect.arrayContaining([FILE1, SUB_DIR]));
    });

    it('should check if a file exists', () => {
        const adapter = new FileSystemAdapter();
        expect(adapter.existsSync(path.join(TEST_DIR, FILE1))).toBe(true);
        expect(adapter.existsSync(path.join(TEST_DIR, 'non_existent_file'))).toBe(false);
    });

    it('should create a directory', () => {
        const adapter = new FileSystemAdapter();
        const newDir = path.join(TEST_DIR, 'new_dir');
        adapter.mkdirSync(newDir);
        expect(fs.existsSync(newDir)).toBe(true);
    });

    it('should copy a file', () => {
        const adapter = new FileSystemAdapter();
        const source = path.join(TEST_DIR, FILE1);
        const destination = path.join(TEST_DIR, 'file1_copy.txt');
        adapter.copyFileSync(source, destination);
        expect(fs.existsSync(destination)).toBe(true);
    });

    it('should rename a file', () => {
        const adapter = new FileSystemAdapter();
        const oldPath = path.join(TEST_DIR, FILE1);
        const newPath = path.join(TEST_DIR, 'file1_renamed.txt');
        adapter.renameSync(oldPath, newPath);
        expect(fs.existsSync(oldPath)).toBe(false);
        expect(fs.existsSync(newPath)).toBe(true);
    });

    it('should delete a file', () => {
        const adapter = new FileSystemAdapter();
        const filePath = path.join(TEST_DIR, FILE1);
        adapter.unlinkSync(filePath);
        expect(fs.existsSync(filePath)).toBe(false);
    });

    it('should delete a directory', () => {
        const adapter = new FileSystemAdapter();
        const dirPath = path.join(TEST_DIR, SUB_DIR);
        adapter.rmSync(dirPath, { recursive: true });
        expect(fs.existsSync(dirPath)).toBe(false);
    });

    it('should get file stats', () => {
        const adapter = new FileSystemAdapter();
        const stats = adapter.lstatSync(path.join(TEST_DIR, FILE1));
        expect(stats.isDirectory()).toBe(false);
    });
});
