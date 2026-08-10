const incomingFolder = '../incoming';
const fs = require('fs');

function readDir(): void {
    let totalFiles: number = 0;
    fs.readdir(incomingFolder, (err: Error | null, files: string[]) => {
        if (err) {
            console.log(err);
            return;
        }

        files.forEach(file => {
            totalFiles+=1;
            console.log(file);
        });
    });
}


module.exports = {
    readDir,
}
