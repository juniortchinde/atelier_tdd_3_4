import { FileManager } from './file';
import { IFileSystem } from './fs.interface';
import { IRandomNameGenerator } from './random-name-generator.interface';
import { Stats } from 'fs';

class MockFileSystem implements IFileSystem {
    public files: { [key: string]: string[] } = {};
    public content: { [key: string]: string } = {};

    constructor(initialFiles: { [key: string]: string[] }) {
        this.files = JSON.parse(JSON.stringify(initialFiles));
    }

    readdirSync(path: string): string[] {
        return this.files[path] || [];
    }

    copyFileSync(source: string, destination: string): void {
        this.content[destination] = this.content[source];
    }

    renameSync(oldPath: string, newPath: string): void {
        const newPathDir = newPath.substring(0, newPath.lastIndexOf('/'));
        if (!this.files[newPathDir]) {
            this.files[newPathDir] = [];
        }
        this.files[newPathDir].push(newPath.substring(newPath.lastIndexOf('/') + 1));


        const oldPathDir = oldPath.substring(0, oldPath.lastIndexOf('/'));
        const oldFileName = oldPath.substring(oldPath.lastIndexOf('/') + 1)
        this.files[oldPathDir] = this.files[oldPathDir].filter(f => f !== oldFileName);


        this.content[newPath] = this.content[oldPath];
        delete this.content[oldPath];
    }

    unlinkSync(path: string): void {
        const dir = path.substring(0, path.lastIndexOf('/'));
        const fileName = path.substring(path.lastIndexOf('/') + 1)
        if (this.files[dir]) {
            this.files[dir] = this.files[dir].filter(f => f !== fileName);
        }
        delete this.content[path];
    }

    rmSync(path: string, options?: { recursive?: boolean; force?: boolean }): void {
        if (options?.recursive && this.files[path]) {
            const entries = [...this.files[path]];
            entries.forEach(entry => {
                const entryPath = `${path}/${entry}`;
                if (this.lstatSync(entryPath).isDirectory()) {
                    this.rmSync(entryPath, { recursive: true });
                } else {
                    this.unlinkSync(entryPath);
                }
            });
        }
        const parentDir = Object.keys(this.files).find(dir => this.files[dir].includes(path.replace(dir + '/', '')));
        if (parentDir) {
            this.files[parentDir] = this.files[parentDir].filter(f => f !== path.replace(parentDir + '/', ''));
        }
        delete this.files[path];
    }

    lstatSync(path: string): Stats {
        return { isDirectory: () => this.files[path] !== undefined } as Stats;
    }

    existsSync(path: string): boolean {
        return this.files[path] !== undefined || this.content[path] !== undefined;
    }

    mkdirSync(path: string, options?: { recursive?: boolean }): void {
        this.files[path] = [];
    }
}

class MockRandomNameGenerator implements IRandomNameGenerator {
    constructor(private name: string) {}

    generate(): string {
        return this.name;
    }
}

describe('FileManager', () => {
    const TEST_DIR = '/test_dir';
    const FILE1 = 'file1.txt';
    const FILE2 = 'file2.txt';
    const SUB_DIR = 'sub_dir';
    const FILE_IN_SUB_DIR = 'file3.txt';

    let fileManager: FileManager;
    let mockFs: MockFileSystem;
    let mockRandomNameGenerator: MockRandomNameGenerator;

    beforeEach(() => {
        const initialFiles = {
            [TEST_DIR]: [FILE1, FILE2, SUB_DIR],
            [`${TEST_DIR}/${SUB_DIR}`]: [FILE_IN_SUB_DIR],
        };
        mockFs = new MockFileSystem(initialFiles);
        mockFs.content[`${TEST_DIR}/${FILE1}`] = 'file1 content';
        mockFs.content[`${TEST_DIR}/${FILE2}`] = 'file2 content';
        mockFs.content[`${TEST_DIR}/${SUB_DIR}/${FILE_IN_SUB_DIR}`] = 'file3 content';
        mockRandomNameGenerator = new MockRandomNameGenerator('random-name');
        fileManager = new FileManager(TEST_DIR, mockFs, mockRandomNameGenerator);
    });

    it('should list entries in the directory', () => {
        const entries = fileManager.listEntries();
        expect(entries).toEqual([FILE1, FILE2, SUB_DIR]);
    });

    it('should select all entries', () => {
        fileManager.selectEntries('all');
        expect((fileManager as any).selectedEntries).toEqual([FILE1, FILE2, SUB_DIR]);
    });

    it('should select specified entries', () => {
        fileManager.selectEntries([FILE1, SUB_DIR]);
        expect((fileManager as any).selectedEntries).toEqual([FILE1, SUB_DIR]);
    });

    it('should copy selected entries to a new directory', () => {
        fileManager.selectEntries([FILE1]);
        fileManager.copy('copy_dest');
        expect(mockFs.existsSync(`${TEST_DIR}/copy_dest`)).toBe(true);
        expect(mockFs.content[`${TEST_DIR}/copy_dest/${FILE1}`]).toBe('file1 content');
    });

    it('should move selected entries to a new directory', () => {
        fileManager.selectEntries([FILE1]);
        fileManager.move('move_dest');
        expect(mockFs.existsSync(`${TEST_DIR}/move_dest`)).toBe(true);
        expect(mockFs.content[`${TEST_DIR}/move_dest/${FILE1}`]).toBe('file1 content');
        expect(mockFs.content[`${TEST_DIR}/${FILE1}`]).toBeUndefined();
        expect(mockFs.files[TEST_DIR]).not.toContain(FILE1);
    });

    it('should delete selected files', () => {
        fileManager.selectEntries([FILE1]);
        fileManager.delete();
        expect(mockFs.content[`${TEST_DIR}/${FILE1}`]).toBeUndefined();
        expect(mockFs.files[TEST_DIR]).not.toContain(FILE1);
    });

    it('should delete selected directories', () => {
        fileManager.selectEntries([SUB_DIR]);
        fileManager.delete();
        expect(mockFs.files[`${TEST_DIR}/${SUB_DIR}`]).toBeUndefined();
        expect(mockFs.files[TEST_DIR]).not.toContain(SUB_DIR);
    });

    it('should use random name generator when no destination is provided for copy', () => {
        fileManager.selectEntries([FILE1]);
        fileManager.copy();
        expect(mockFs.existsSync(`${TEST_DIR}/random-name`)).toBe(true);
        expect(mockFs.content[`${TEST_DIR}/random-name/${FILE1}`]).toBe('file1 content');
    });

    it('should use random name generator when no destination is provided for move', () => {
        fileManager.selectEntries([FILE1]);
        fileManager.move();
        expect(mockFs.existsSync(`${TEST_DIR}/random-name`)).toBe(true);
        expect(mockFs.content[`${TEST_DIR}/random-name/${FILE1}`]).toBe('file1 content');
        expect(mockFs.content[`${TEST_DIR}/${FILE1}`]).toBeUndefined();
        expect(mockFs.files[TEST_DIR]).not.toContain(FILE1);
    });

    it('should throw an error if the directory does not exist', () => {
        expect(() => new FileManager('/non_existent_dir', mockFs, mockRandomNameGenerator)).toThrow('Directory not found: /non_existent_dir');
    });
});