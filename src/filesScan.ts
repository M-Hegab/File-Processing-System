import fs from 'fs';
import path from 'path';

async function createFolder(dirPath: string) {
    try {
        await fs.mkdirSync(dirPath, { recursive: true });
    } catch (err) {
        console.error('Error creating folder:', err);
    }
}

export function countFiles(dirPath: string): number {
    createFolder(dirPath);

    const items = fs.readdirSync(dirPath);
    let totalFiles = 0;

    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stats = fs.statSync(fullPath);

        // if (stats.isDirectory()) {
        //     totalFiles += countFiles(fullPath);
        // } 
        if (stats.isFile()) {
            totalFiles += 1;
            console.log(item);
        }
    }
    return totalFiles;
}
