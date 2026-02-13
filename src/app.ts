import { FileManager } from './file_manager/file';
import { FileSystemAdapter } from './file_manager/fs.adapter';
import { RandomNameGeneratorAdapter } from './file_manager/random-name-generator.adapter';

const fileManager = new FileManager(
    __dirname,
    new FileSystemAdapter(),
    new RandomNameGeneratorAdapter()
);

// Example usage:
fileManager.selectEntries('all');
fileManager.copy('new-directory');
