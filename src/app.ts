const { readDir } = require('./filesScan');
const express = require('express');
const app = express();

app.use(readDir);

module.exports = {
    app,
}