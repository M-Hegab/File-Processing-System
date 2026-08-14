import * as fs from 'node:fs/promises';
import path from 'node:path';
import { incomingFiles, countFiles, moveFiles, createJsonFile } from './helpers.js'

const INCOMING_FOLDER: string = './incomingFiles';
const PROCESSING_FOLDER: string = path.join(INCOMING_FOLDER, '/processing')
const PROCESSED_FOLDER: string = path.join(INCOMING_FOLDER, '/processed')
const JSON_FOLDER: string = path.join(INCOMING_FOLDER, '/json')
interface processingResult {
    id: number;
    name: string;
    size: string;
    characters: number;
    words: number;
    lines: number;
    processedAt: string;
}

async function readFiles(dirPath: string): Promise<void> {
    const ProcessingFiles: string[] = await incomingFiles(dirPath);
    for (const [index, file] of ProcessingFiles.entries()) {
        const content: string = await fs.readFile(file, 'utf-8');
        if (content && content.length !== 0) {
            const processingResult: processingResult = {
                id: index + 1,
                name: path.basename(file),
                size: (await fs.stat(file)).size + " bytes",
                characters: content.length,
                words: content.trim().split(/\s+/).length,
                lines: content.split(/\r?\n/).length,
                processedAt: new Date().toISOString()
            }
            await createJsonFile(JSON_FOLDER, file, processingResult);
        }
    }
}

async function processingFiles(): Promise<void> {
    const processingFiles: number = await countFiles(INCOMING_FOLDER);
    console.log((processingFiles), "Files waiting for processing");
    if (processingFiles !== 0) {
        console.log(await moveFiles(INCOMING_FOLDER, PROCESSING_FOLDER), "Files processing now");
        await readFiles(PROCESSING_FOLDER);
        console.log(await moveFiles(PROCESSING_FOLDER, PROCESSED_FOLDER), "Files Processed Sucessfully");
    }
}

export {
    processingFiles,
}