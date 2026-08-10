const dotenv = require('dotenv');
dotenv.config({debug: true});
const { app } = require('./app.js');
const { readDir } = require('./filesScan');
const port = process.env.PORT;

readDir;

app.listen(port, () => {
  console.log(`File Processing System listening on port ${port}`);
});