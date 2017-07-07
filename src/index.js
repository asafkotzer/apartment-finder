const os = require('os');
const geolib = require('geolib');
const moment = require('moment');
const geolib = require('geolib');
const _ = require('lodash');
const co = require('co');

const fetcher = require('./fetcher');
const buildUrl = require('./url-builder');
const dispatcher = require('./dispatcher');
const {Ad, parseAds} = require('./ad-parser');
const adsRepository = require('./ads-repository');
const Stats = require('./stats');

const query = require('../config/query');

const log = message => console.log('[' + moment().format('HH:mm') + '] ' + message);

const processAds = co.wrap(function*() {
    const summary = new Stats();

    const processPage = function*(pageNumber) {
        const page = yield fetcher.fetchPage({page: currentPage});
        const ads = parseAds(page);

        summary.increment('retrieved', ads.length);

        yield _.chain(ads)
            .filter(ad => !adsRepository.wasAlreadySent(ad.id))
            .forEach(ad => summary.increment('not_already_handled'))
            .filter(ad => geolib.isPointInside(ad.coordinates, query.searchArea))
            .forEach(ad => summary.increment('within_polygon'))
            .map(ad => fetcher.fetchAd(ad).then(extraAdData => ad.addSingleAdApi(extraAdData)))
            .value();

        yield _.chain(ads)
            .filter(ad => ad.entrance >= query.minimumEntranceDate)
            .forEach(ad => summary.increment('after_minimal_entrance_date'))
            .map(ad => dispatcher(ad).then(() => adsRepository.updateSent(ad.id)))
            .value();

        yield adsRepository.flush();

        return {
            done: page.data.current_page === page.data.total_pages,
        };
    };

    let currentPage = 1;
    while (true) {
        try {
            const result = yield processPage(currentPage++);

            if (result.done) {
                break;
            }
        } catch (error) {
            log(error);
        }
    }

    log('Done with run!');
    log(summary.toString() + os.EOL + os.EOL);
});

processAds();
//setInterval(processAds, 60 * 60 * 1000);
