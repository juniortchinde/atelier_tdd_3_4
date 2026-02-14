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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path = __importStar(require("path"));
const file_1 = require("./file_manager/file");
const fs_adapter_1 = require("./file_manager/fs.adapter");
const random_name_generator_adapter_1 = require("./file_manager/random-name-generator.adapter");
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
const managedFilesDir = path.join(__dirname, '..', 'managed_files');
const fsAdapter = new fs_adapter_1.FileSystemAdapter();
if (!fsAdapter.existsSync(managedFilesDir)) {
    fsAdapter.mkdirSync(managedFilesDir);
}
const fileManager = new file_1.FileManager(managedFilesDir, fsAdapter, new random_name_generator_adapter_1.RandomNameGeneratorAdapter());
app.get('/entries', (req, res) => {
    try {
        const entries = fileManager.listEntries();
        res.json(entries);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.post('/copy', (req, res) => {
    try {
        const { destination } = req.body;
        const result = fileManager.copy(destination);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.post('/move', (req, res) => {
    try {
        const { destination } = req.body;
        const result = fileManager.move(destination);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.post('/delete', (req, res) => {
    try {
        const result = fileManager.delete();
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
//# sourceMappingURL=app.js.map