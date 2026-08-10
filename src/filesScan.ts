const fs = require('fs');
const path = require('path')

async function createFolder(dirPath: string) {
    try{
        fs.mkdirSync(dirPath, { recursive: true });
    }catch(err){
        console.error('Error creating folder:', err);
    }
}

function CountFiles(dirPath: string): number {
    createFolder(dirPath);

    const items = fs.readdirSync(dirPath);
    let totalFiles = 0;

    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            totalFiles += CountFiles(fullPath);
        } else if (stats.isFile()) {
            totalFiles += 1;
        }
    }
    return totalFiles;
}


module.exports = {
    CountFiles,
}
