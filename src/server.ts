const dotenv = require('dotenv');
const { app } = require('./app.js');

dotenv.config({debug: true});

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`File Processing System listening on port ${port}`);
});