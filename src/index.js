const os = require('os');
const geolib = require('geolib');
const moment = require('moment');
const _ = require('lodash');
const co = require('co');

const fetcher = require('./fetcher');
const dispatcher = require('./dispatcher');
const {EnhancedAd, parseAds} = require('./ad-parser');
const adsRepository = require('./ads-repository');
const management = require('./management');
const Stats = require('./stats');

const query = require('../config/query');

const log = message => console.log('[' + moment().format('HH:mm') + '] ' + message);

const processAds = co.wrap(function*() {
    const summary = new Stats();

    const processPage = function*(pageNumber) {
        const page = yield fetcher.fetchPage({page: currentPage});
        const ads = parseAds(page);

        summary.increment('retrieved', ads.length);

        const enhancedAds = yield _.chain(ads)
            .filter(ad => !adsRepository.wasAlreadySent(ad.id))
            .forEach(ad => summary.increment('not_already_handled'))
            .filter(ad => ad.coordinates.latitude && ad.coordinates.longitude)
            .forEach(ad => summary.increment('has_coordinates'))
            .filter(ad => geolib.isPointInside(ad.coordinates, query.searchArea))
            .forEach(ad => summary.increment('within_polygon'))
            .map(ad => fetcher.fetchAd(ad).then(extraAdData => new EnhancedAd(ad, extraAdData)))
            .value();

        yield _.chain(enhancedAds)
            .filter(ad => ad.isEntranceKnown) // If you want instant entrance you need to modify this
            .forEach(ad => summary.increment('has_known_entrance_date'))
            .filter(ad => ad.entrance >= query.minimumEntranceDate)
            .forEach(ad => summary.increment('after_minimal_entrance_date'))
            .map(ad => {
                dispatcher(ad)
                    .then(() => adsRepository.updateSent(ad.id))
                    .then(() => summary.increment('dispatched'))
            })
            .value();

        yield adsRepository.flush();
        management.updateStats(summary.toHtml());

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
setInterval(processAds, 60 * 60 * 1000);
