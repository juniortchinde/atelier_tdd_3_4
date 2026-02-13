import * as fs from 'fs';
import * as path from 'path';

const adjectives = [
    "happy",
    "silly",
    "bumpy",
    "grumpy",
    "fluffy",
    "scary",
    "tiny",
    "giant",
    "red",
    "blue",
    "green",
    "yellow",
    "purple",
    "orange",
    "black",
    "white",
    "brown",
    "pink",
    "gray",
    "silver",
];

const nouns = [
    "cat",
    "dog",
    "house",
    "car",
    "tree",
    "flower",
    "book",
    "computer",
    "phone",
    "table",
    "chair",
    "sun",
    "moon",
    "star",
    "cloud",
    "water",
    "fire",
    "earth",
    "air",
    "love",
];

export class FileManager {
    private selectedEntries: string[] = [];

    constructor(private directoryPath: string) {
        if (!fs.existsSync(directoryPath)) {
            throw new Error(`Directory not found: ${directoryPath}`);
        }
    }

    listEntries(): string[] {
        return fs.readdirSync(this.directoryPath);
    }

    selectEntries(entries: string[] | 'all') {
        if (entries === 'all') {
            this.selectedEntries = this.listEntries();
        } else {
            this.selectedEntries = entries;
        }
    }

    copy(destination?: string) {
        const dest = destination || this.generateRandomDirectoryName();
        const destPath = path.join(this.directoryPath, dest);
        if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, { recursive: true });
        }
        this.selectedEntries.forEach(entry => {
            const sourcePath = path.join(this.directoryPath, entry);
            const targetPath = path.join(destPath, entry);
            fs.copyFileSync(sourcePath, targetPath);
        });
    }

    move(destination?: string) {
        const dest = destination || this.generateRandomDirectoryName();
        const destPath = path.join(this.directoryPath, dest);
        if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, { recursive: true });
        }
        this.selectedEntries.forEach(entry => {
            const sourcePath = path.join(this.directoryPath, entry);
            const targetPath = path.join(destPath, entry);
            fs.renameSync(sourcePath, targetPath);
        });
    }

    delete() {
        this.selectedEntries.forEach(entry => {
            const entryPath = path.join(this.directoryPath, entry);
            if (fs.lstatSync(entryPath).isDirectory()) {
                fs.rmSync(entryPath, { recursive: true });
            } else {
                fs.unlinkSync(entryPath);
            }
        });
    }

    private generateRandomDirectoryName(): string {
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        return `${adjective}-${noun}`;
    }
}
