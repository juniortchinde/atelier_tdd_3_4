import { Stats } from 'fs';

export interface IFileSystem {
    readdirSync(path: string): string[];
    copyFileSync(source: string, destination: string): void;
    renameSync(oldPath: string, newPath: string): void;
    unlinkSync(path: string): void;
    rmSync(path: string, options?: { recursive?: boolean; force?: boolean }): void;
    lstatSync(path: string): Stats;
    existsSync(path: string): boolean;
    mkdirSync(path: string, options?: { recursive?: boolean }): void;
}
