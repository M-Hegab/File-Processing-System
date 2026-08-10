const incomingFolder = '../incoming';
const fs = require('fs');

function readDir(): void {
    fs.readdir(incomingFolder, (err: Error | null, files: string[]) => {
        if (err) {
            console.log(err);
            return;
        }

        files.forEach(file => {
            console.log(file);
        });
    });
}


module.exports = {
    readDir,
}
