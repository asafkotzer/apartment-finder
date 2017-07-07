const os = require('os');

class Stats {
    constructor() {
        this.stats = new Map();
    }

    increment(stat, count = 1) {
        let currentStat = this.stats.get(stat)

        if (typeof currentStat === 'undefined') {
            currentStat = 0;
        }

        this.stats.set(stat, currentStat + count);
    }

    toHtml() {
        return Array.from(this.stats.entries())
            .map(([key, value]) => `${key}: ${value}`)
            .join('<br />');
    }

    toString() {
        return Array.from(this.stats.entries()).map(([key, value]) => `${key}: ${value}`).join(os.EOL);
    }
}

module.exports = Stats;