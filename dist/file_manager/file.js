"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileManager = void 0;
const path = __importStar(require("path"));
class FileManager {
    constructor(directoryPath, fs, randomNameGenerator) {
        this.directoryPath = directoryPath;
        this.fs = fs;
        this.randomNameGenerator = randomNameGenerator;
        this.selectedEntries = [];
        if (!this.fs.existsSync(directoryPath)) {
            throw new Error(`Directory not found: ${directoryPath}`);
        }
    }
    listEntries() {
        return this.fs.readdirSync(this.directoryPath);
    }
    selectEntries(entries) {
        if (entries === 'all') {
            this.selectedEntries = this.listEntries();
        }
        else {
            this.selectedEntries = entries;
        }
    }
    copy(destination) {
        const dest = destination || this._findUniqueDirectoryName();
        const destPath = path.join(this.directoryPath, dest);
        if (!this.fs.existsSync(destPath)) {
            this.fs.mkdirSync(destPath, { recursive: true });
        }
        const failedFiles = [];
        const successfullyCopied = [];
        this.selectedEntries.forEach(entry => {
            const sourcePath = path.join(this.directoryPath, entry);
            const targetPath = path.join(destPath, entry);
            try {
                this.fs.copyFileSync(sourcePath, targetPath);
                successfullyCopied.push(entry);
            }
            catch (error) {
                failedFiles.push({ file: entry, error: error });
            }
        });
        this.selectedEntries = this.selectedEntries.filter(entry => !successfullyCopied.includes(entry));
        return failedFiles;
    }
    move(destination) {
        const dest = destination || this._findUniqueDirectoryName();
        const destPath = path.join(this.directoryPath, dest);
        if (!this.fs.existsSync(destPath)) {
            this.fs.mkdirSync(destPath, { recursive: true });
        }
        const failedFiles = [];
        const successfullyMoved = [];
        this.selectedEntries.forEach(entry => {
            const sourcePath = path.join(this.directoryPath, entry);
            const targetPath = path.join(destPath, entry);
            try {
                this.fs.renameSync(sourcePath, targetPath);
                successfullyMoved.push(entry);
            }
            catch (error) {
                failedFiles.push({ file: entry, error: error });
            }
        });
        this.selectedEntries = this.selectedEntries.filter(entry => !successfullyMoved.includes(entry));
        return failedFiles;
    }
    delete() {
        const failedFiles = [];
        const successfullyDeleted = [];
        this.selectedEntries.forEach(entry => {
            const entryPath = path.join(this.directoryPath, entry);
            try {
                if (this.fs.lstatSync(entryPath).isDirectory()) {
                    this.fs.rmSync(entryPath, { recursive: true });
                }
                else {
                    this.fs.unlinkSync(entryPath);
                }
                successfullyDeleted.push(entry);
            }
            catch (error) {
                failedFiles.push({ file: entry, error: error });
            }
        });
        this.selectedEntries = this.selectedEntries.filter(entry => !successfullyDeleted.includes(entry));
        return failedFiles;
    }
    _findUniqueDirectoryName() {
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
exports.FileManager = FileManager;
//# sourceMappingURL=file.js.map