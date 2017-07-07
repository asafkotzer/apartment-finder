const express = require('express');

const app = express();

let stats = '';

app.get('/', (req, res) => {
    res.send(stats);
});

app.listen(80, () => console.log('Started listening on port 80'));

module.exports = {
    updateStats(newStats) {
        stats = newStats;
    },
}