import { FileManager } from './file';
import { IFileSystem } from './fs.interface';
import { IRandomNameGenerator } from './random-name-generator.interface';
import { Stats } from 'fs';

class MockFileSystem implements IFileSystem {
    public files: { [key: string]: string[] } = {};
    public content: { [key: string]: string } = {};
    public failOn: { [key: string]: Error } = {};

    constructor(initialFiles: { [key: string]: string[] }) {
        this.files = JSON.parse(JSON.stringify(initialFiles));
    }

    readdirSync(path: string): string[] {
        return this.files[path] || [];
    }

    copyFileSync(source: string, destination: string): void {
        if (this.failOn[source]) {
            throw this.failOn[source];
        }
        this.content[destination] = this.content[source];
    }

    renameSync(oldPath: string, newPath: string): void {
        if (this.failOn[oldPath]) {
            throw this.failOn[oldPath];
        }
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
        if (this.failOn[path]) {
            throw this.failOn[path];
        }
        const dir = path.substring(0, path.lastIndexOf('/'));
        const fileName = path.substring(path.lastIndexOf('/') + 1)
        if (this.files[dir]) {
            this.files[dir] = this.files[dir].filter(f => f !== fileName);
        }
        delete this.content[path];
    }

    rmSync(path: string, options?: { recursive?: boolean; force?: boolean }): void {
        if (this.failOn[path]) {
            throw this.failOn[path];
        }
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

    it('devrait lister les entrées dans le répertoire', () => {
        const entries = fileManager.listEntries();
        expect(entries).toEqual([FILE1, FILE2, SUB_DIR]);
    });

    it('devrait sélectionner toutes les entrées', () => {
        fileManager.selectEntries('all');
        expect((fileManager as any).selectedEntries).toEqual([FILE1, FILE2, SUB_DIR]);
    });

    it('devrait sélectionner les entrées spécifiées', () => {
        fileManager.selectEntries([FILE1, SUB_DIR]);
        expect((fileManager as any).selectedEntries).toEqual([FILE1, SUB_DIR]);
    });

    it('devrait copier les entrées sélectionnées dans un nouveau répertoire', () => {
        fileManager.selectEntries([FILE1]);
        fileManager.copy('copy_dest');
        expect(mockFs.existsSync(`${TEST_DIR}/copy_dest`)).toBe(true);
        expect(mockFs.content[`${TEST_DIR}/copy_dest/${FILE1}`]).toBe('file1 content');
    });

    it('devrait déplacer les entrées sélectionnées vers un nouveau répertoire', () => {
        fileManager.selectEntries([FILE1]);
        fileManager.move('move_dest');
        expect(mockFs.existsSync(`${TEST_DIR}/move_dest`)).toBe(true);
        expect(mockFs.content[`${TEST_DIR}/move_dest/${FILE1}`]).toBe('file1 content');
        expect(mockFs.content[`${TEST_DIR}/${FILE1}`]).toBeUndefined();
        expect(mockFs.files[TEST_DIR]).not.toContain(FILE1);
    });

    it('devrait supprimer les fichiers sélectionnés', () => {
        fileManager.selectEntries([FILE1]);
        fileManager.delete();
        expect(mockFs.content[`${TEST_DIR}/${FILE1}`]).toBeUndefined();
        expect(mockFs.files[TEST_DIR]).not.toContain(FILE1);
    });

    it('devrait supprimer les répertoires sélectionnés', () => {
        fileManager.selectEntries([SUB_DIR]);
        fileManager.delete();
        expect(mockFs.files[`${TEST_DIR}/${SUB_DIR}`]).toBeUndefined();
        expect(mockFs.files[TEST_DIR]).not.toContain(SUB_DIR);
    });

    it('devrait utiliser le générateur de noms aléatoires si aucune destination n\'est fournie pour la copie', () => {
        fileManager.selectEntries([FILE1]);
        fileManager.copy();
        expect(mockFs.existsSync(`${TEST_DIR}/random-name`)).toBe(true);
        expect(mockFs.content[`${TEST_DIR}/random-name/${FILE1}`]).toBe('file1 content');
    });

    it('devrait utiliser le générateur de noms aléatoires si aucune destination n\'est fournie pour le déplacement', () => {
        fileManager.selectEntries([FILE1]);
        fileManager.move();
        expect(mockFs.existsSync(`${TEST_DIR}/random-name`)).toBe(true);
        expect(mockFs.content[`${TEST_DIR}/random-name/${FILE1}`]).toBe('file1 content');
        expect(mockFs.content[`${TEST_DIR}/${FILE1}`]).toBeUndefined();
        expect(mockFs.files[TEST_DIR]).not.toContain(FILE1);
    });

    it('devrait lancer une erreur si le répertoire n\'existe pas', () => {
        expect(() => new FileManager('/non_existent_dir', mockFs, mockRandomNameGenerator)).toThrow('Directory not found: /non_existent_dir');
    });
});

// Ajout des nouveaux tests pour la gestion des conflits de noms de répertoire lors de la copie
describe('FileManager copy with random name conflict', () => {
    const TEST_DIR = '/test_dir';
    let fileManager: FileManager;
    let fsMock: IFileSystem;
    let nameGeneratorMock: IRandomNameGenerator;

    beforeEach(() => {
        // Mock complet pour l'interface IFileSystem avec jest.fn()
        fsMock = {
            readdirSync: jest.fn().mockReturnValue([]),
            copyFileSync: jest.fn(),
            renameSync: jest.fn(),
            unlinkSync: jest.fn(),
            rmSync: jest.fn(),
            lstatSync: jest.fn().mockReturnValue({ isDirectory: () => false } as Stats),
            existsSync: jest.fn().mockReturnValue(true), // Le répertoire de base existe toujours
            mkdirSync: jest.fn(),
        };

        // Mock pour le générateur de noms
        nameGeneratorMock = {
            generate: jest.fn(),
        };

        fileManager = new FileManager(TEST_DIR, fsMock, nameGeneratorMock);
        fileManager.selectEntries(['file1.txt']); // Sélectionner un fichier pour que la copie s'exécute
    });

    // Test 1: Le générateur de nom produit un nom qui existe déjà une fois,
    // puis un nom valide. Le système doit réessayer et utiliser le deuxième nom.
    it('devrait réessayer avec un nouveau nom si le premier nom aléatoire existe déjà', () => {
        const existingName = 'existing-name';
        const newName = 'new-name';
        (nameGeneratorMock.generate as jest.Mock).mockReturnValueOnce(existingName).mockReturnValueOnce(newName);

        // Simule l'existence du premier répertoire mais pas du second
        (fsMock.existsSync as jest.Mock).mockImplementation((p: string) => {
            if (p === TEST_DIR) return true; // le répertoire de base
            return p.endsWith(existingName);
        });

        fileManager.copy(); // Appel sans destination pour déclencher la logique de nom aléatoire

        // Vérifie que le générateur a été appelé 2 fois
        expect(nameGeneratorMock.generate).toHaveBeenCalledTimes(2);
        // Vérifie que la création de répertoire a été faite avec le nom non conflictuel
        expect(fsMock.mkdirSync).toHaveBeenCalledWith(expect.stringContaining(newName), expect.anything());
    });

    // Test 2: Le générateur produit le même nom conflictuel 10 fois.
    // Le système doit alors commencer à numéroter le nom jusqu'à en trouver un qui n'existe pas.
    // Ici, 'conflict' et 'conflict-1' existent, mais 'conflict-2' est libre.
    it('devrait ajouter un numéro au nom après 10 tentatives échouées', () => {
        const conflictingName = 'conflict';
        (nameGeneratorMock.generate as jest.Mock).mockReturnValue(conflictingName);

        (fsMock.existsSync as jest.Mock).mockImplementation((p: string) => {
            if (p === TEST_DIR) return true;
            // 'conflict' et 'conflict-1' existent
            return p.endsWith(conflictingName) || p.endsWith(`${conflictingName}-1`);
        });

        fileManager.copy();

        // Le générateur est appelé 10 fois pour le nom de base
        expect(nameGeneratorMock.generate).toHaveBeenCalledTimes(10);
        // mkdirSync doit être appelé avec le premier nom numéroté disponible, soit 'conflict-2'
        expect(fsMock.mkdirSync).toHaveBeenCalledWith(expect.stringContaining(`${conflictingName}-2`), expect.anything());
    });

    // Test 3: Cas limite où le premier nom numéroté ('conflict-1') est disponible.
    it('devrait utiliser le premier nom numéroté disponible après 10 tentatives', () => {
        const conflictingName = 'conflict';
        (nameGeneratorMock.generate as jest.Mock).mockReturnValue(conflictingName);

        (fsMock.existsSync as jest.Mock).mockImplementation((p: string) => {
            if (p === TEST_DIR) return true;
            // Seul le nom de base 'conflict' existe
            return p.endsWith(conflictingName);
        });

        fileManager.copy();

        // Le générateur est appelé 10 fois
        expect(nameGeneratorMock.generate).toHaveBeenCalledTimes(10);
                // mkdirSync doit être appelé avec le premier nom numéroté disponible, soit 'conflict-1'
                expect(fsMock.mkdirSync).toHaveBeenCalledWith(expect.stringContaining(`${conflictingName}-1`), expect.anything());
            });
        });
        
        describe('FileManager error handling', () => {
            const TEST_DIR = '/test_dir';
            const FILE1 = 'file1.txt';
            const FILE2 = 'file2.txt';
            const FILE_TO_FAIL = 'file_to_fail.txt';
        
            let fileManager: FileManager;
            let mockFs: MockFileSystem;
            let mockRandomNameGenerator: MockRandomNameGenerator;
        
            beforeEach(() => {
                const initialFiles = {
                    [TEST_DIR]: [FILE1, FILE2, FILE_TO_FAIL],
                };
                mockFs = new MockFileSystem(initialFiles);
                mockFs.content[`${TEST_DIR}/${FILE1}`] = 'file1 content';
                mockFs.content[`${TEST_DIR}/${FILE2}`] = 'file2 content';
                mockFs.content[`${TEST_DIR}/${FILE_TO_FAIL}`] = 'file_to_fail content';
                mockRandomNameGenerator = new MockRandomNameGenerator('random-name');
                fileManager = new FileManager(TEST_DIR, mockFs, mockRandomNameGenerator);
            });
        
            it('devrait retourner une liste de fichiers échoués pendant la copie et les garder sélectionnés', () => {
                const error = new Error('Disk is full');
                mockFs.failOn[`${TEST_DIR}/${FILE_TO_FAIL}`] = error;
        
                fileManager.selectEntries([FILE1, FILE_TO_FAIL]);
                const result = fileManager.copy('destination');
        
                expect(result).toEqual([{ file: FILE_TO_FAIL, error: error }]);
                expect((fileManager as any).selectedEntries).toEqual([FILE_TO_FAIL]);
                        expect(mockFs.content[`${TEST_DIR}/destination/${FILE1}`]).toBe('file1 content');
                        expect(mockFs.content[`${TEST_DIR}/destination/${FILE_TO_FAIL}`]).toBeUndefined();
                    });
                
                    test('devrait retourner une liste de fichiers échoués pendant le déplacement et les garder sélectionnés', () => {
                        const error = new Error('Cannot move file');
                        mockFs.failOn[`${TEST_DIR}/${FILE_TO_FAIL}`] = error;
                
                        fileManager.selectEntries([FILE1, FILE_TO_FAIL]);
                        const result = fileManager.move('destination');
                
                        expect(result).toEqual([{ file: FILE_TO_FAIL, error: error }]);
                        expect((fileManager as any).selectedEntries).toEqual([FILE_TO_FAIL]);
                        expect(mockFs.content[`${TEST_DIR}/destination/${FILE1}`]).toBe('file1 content');
                        expect(mockFs.existsSync(`${TEST_DIR}/${FILE_TO_FAIL}`)).toBe(true);
                    });
                
                    test('devrait retourner une liste de fichiers échoués pendant la suppression et les garder sélectionnés', () => {
                        const error = new Error('Cannot delete file');
                        mockFs.failOn[`${TEST_DIR}/${FILE_TO_FAIL}`] = error;
                
                        fileManager.selectEntries([FILE1, FILE_TO_FAIL]);
                        const result = fileManager.delete();
                
                        expect(result).toEqual([{ file: FILE_TO_FAIL, error: error }]);
                        expect((fileManager as any).selectedEntries).toEqual([FILE_TO_FAIL]);
                        expect(mockFs.existsSync(`${TEST_DIR}/${FILE1}`)).toBe(false);
                        expect(mockFs.existsSync(`${TEST_DIR}/${FILE_TO_FAIL}`)).toBe(true);
                    });
                });        