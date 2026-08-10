import dotenv from 'dotenv';
import { app } from './app.js';
import { countFiles } from './filesScan.js';
dotenv.config({debug: true});
const port = process.env.PORT || 3000;
const incomingFolder: string = './incoming';

console.log(countFiles(incomingFolder));

app.listen(port, () => {
  console.log(`File Processing System listening on port ${port}`);
});