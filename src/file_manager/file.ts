import * as path from 'path';
import { IFileSystem } from './fs.interface';
import { IRandomNameGenerator } from './random-name-generator.interface';

export class FileManager {
    private selectedEntries: string[] = [];

    constructor(
        private directoryPath: string,
        private fs: IFileSystem,
        private randomNameGenerator: IRandomNameGenerator
    ) {
        if (!this.fs.existsSync(directoryPath)) {
            throw new Error(`Directory not found: ${directoryPath}`);
        }
    }

    listEntries(): string[] {
        return this.fs.readdirSync(this.directoryPath);
    }

    selectEntries(entries: string[] | 'all') {
        if (entries === 'all') {
            this.selectedEntries = this.listEntries();
        } else {
            this.selectedEntries = entries;
        }
    }

    copy(destination?: string) {
        const dest = destination || this._findUniqueDirectoryName();
        const destPath = path.join(this.directoryPath, dest);
        if (!this.fs.existsSync(destPath)) {
            this.fs.mkdirSync(destPath, { recursive: true });
        }
        this.selectedEntries.forEach(entry => {
            const sourcePath = path.join(this.directoryPath, entry);
            const targetPath = path.join(destPath, entry);
            this.fs.copyFileSync(sourcePath, targetPath);
        });
    }

    move(destination?: string) {
        const dest = destination || this._findUniqueDirectoryName();
        const destPath = path.join(this.directoryPath, dest);
        if (!this.fs.existsSync(destPath)) {
            this.fs.mkdirSync(destPath, { recursive: true });
        }
        this.selectedEntries.forEach(entry => {
            const sourcePath = path.join(this.directoryPath, entry);
            const targetPath = path.join(destPath, entry);
            this.fs.renameSync(sourcePath, targetPath);
        });
    }

    delete() {
        this.selectedEntries.forEach(entry => {
            const entryPath = path.join(this.directoryPath, entry);
            if (this.fs.lstatSync(entryPath).isDirectory()) {
                this.fs.rmSync(entryPath, { recursive: true });
            } else {
                this.fs.unlinkSync(entryPath);
            }
        });
    }

    private _findUniqueDirectoryName(): string {
        let name = this.randomNameGenerator.generate();
        let attempts = 1;
        const maxAttempts = 10;

        while (this.fs.existsSync(path.join(this.directoryPath, name)) && attempts < maxAttempts) {
            name = this.randomNameGenerator.generate();
            attempts++;
        }

        if (this.fs.existsSync(path.join(this.directoryPath, name))) {
            let suffix = 1;
            let numberedName = `${name}-${suffix}`;
            while (this.fs.existsSync(path.join(this.directoryPath, numberedName))) {
                suffix++;
                numberedName = `${name}-${suffix}`;
            }
            name = numberedName;
        }

        return name;
    }
}