const incomingFolder: string = './incoming';
const dotenv = require('dotenv');
dotenv.config({debug: true});
const { app } = require('./app.js');
const { CountFiles } = require('./filesScan');
const port = process.env.PORT;

console.log(CountFiles(incomingFolder));

app.listen(port, () => {
  console.log(`File Processing System listening on port ${port}`);
});