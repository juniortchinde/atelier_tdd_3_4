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
const fs_adapter_1 = require("./fs.adapter");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
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
        const adapter = new fs_adapter_1.FileSystemAdapter();
        const entries = adapter.readdirSync(TEST_DIR);
        expect(entries).toEqual(expect.arrayContaining([FILE1, SUB_DIR]));
    });
    it('should check if a file exists', () => {
        const adapter = new fs_adapter_1.FileSystemAdapter();
        expect(adapter.existsSync(path.join(TEST_DIR, FILE1))).toBe(true);
        expect(adapter.existsSync(path.join(TEST_DIR, 'non_existent_file'))).toBe(false);
    });
    it('should create a directory', () => {
        const adapter = new fs_adapter_1.FileSystemAdapter();
        const newDir = path.join(TEST_DIR, 'new_dir');
        adapter.mkdirSync(newDir);
        expect(fs.existsSync(newDir)).toBe(true);
    });
    it('should copy a file', () => {
        const adapter = new fs_adapter_1.FileSystemAdapter();
        const source = path.join(TEST_DIR, FILE1);
        const destination = path.join(TEST_DIR, 'file1_copy.txt');
        adapter.copyFileSync(source, destination);
        expect(fs.existsSync(destination)).toBe(true);
    });
    it('should rename a file', () => {
        const adapter = new fs_adapter_1.FileSystemAdapter();
        const oldPath = path.join(TEST_DIR, FILE1);
        const newPath = path.join(TEST_DIR, 'file1_renamed.txt');
        adapter.renameSync(oldPath, newPath);
        expect(fs.existsSync(oldPath)).toBe(false);
        expect(fs.existsSync(newPath)).toBe(true);
    });
    it('should delete a file', () => {
        const adapter = new fs_adapter_1.FileSystemAdapter();
        const filePath = path.join(TEST_DIR, FILE1);
        adapter.unlinkSync(filePath);
        expect(fs.existsSync(filePath)).toBe(false);
    });
    it('should delete a directory', () => {
        const adapter = new fs_adapter_1.FileSystemAdapter();
        const dirPath = path.join(TEST_DIR, SUB_DIR);
        adapter.rmSync(dirPath, { recursive: true });
        expect(fs.existsSync(dirPath)).toBe(false);
    });
    it('should get file stats', () => {
        const adapter = new fs_adapter_1.FileSystemAdapter();
        const stats = adapter.lstatSync(path.join(TEST_DIR, FILE1));
        expect(stats.isDirectory()).toBe(false);
    });
});
//# sourceMappingURL=fs.adapter.test.js.map