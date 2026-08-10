import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

async function createFolder(dirPath: string): Promise<void> {
    try {
        await mkdir(dirPath, { recursive: true });
    } catch (err) {
        console.error('Error creating folder:', err);
    }
}

export async function countFiles(dirPath: string): Promise<number> {
    await createFolder(dirPath);

    const items = await readdir(dirPath);
    let totalFiles = 0;

    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stats = await stat(fullPath);
        
        if (stats.isFile()) {
            totalFiles += 1;
            console.log(item);
        }
    }
    return totalFiles;
}
