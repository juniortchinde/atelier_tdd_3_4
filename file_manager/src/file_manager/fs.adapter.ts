import * as fs from 'fs';
import { Stats } from 'fs';
import { IFileSystem } from './fs.interface';

export class FileSystemAdapter implements IFileSystem {
    readdirSync(path: string): string[] {
        return fs.readdirSync(path);
    }

    copyFileSync(source: string, destination: string): void {
        fs.copyFileSync(source, destination);
    }

    renameSync(oldPath: string, newPath: string): void {
        fs.renameSync(oldPath, newPath);
    }

    unlinkSync(path: string): void {
        fs.unlinkSync(path);
    }

    rmSync(path: string, options?: { recursive?: boolean; force?: boolean }): void {
        fs.rmSync(path, options);
    }

    lstatSync(path: string): Stats {
        return fs.lstatSync(path);
    }

    existsSync(path: string): boolean {
        return fs.existsSync(path);
    }

    mkdirSync(path: string, options?: { recursive?: boolean }): void {
        fs.mkdirSync(path, options);
    }
}
