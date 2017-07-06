const geolib = require('geolib');
const moment = require('moment');
const geolib = require('geolib');
const _ = require('lodash');
const co = require('co');

const fetcher = require('./fetcher')
const buildUrl = require('./url-builder');
const dispatcher = require('./dispatcher');
const {Ad, parseAds} = require('./ad-parser');
const adsRepository = require('./ads-repository');

const query = require('../config/query');

const processAds = co.wrap(function* () {
    const summary = {};
    
    const processPage = co.wrap(function* (pageNumber) {
        const page = yield fetcher.fetchPage({page: currentPage});
        const ads = parseAds(page);

        yield _.chain(ads)
            .filter(ad => !adsRepository.wasAlreadySent(ad.id))
            .filter(ad => geolib.isPointInside(ad.coordinates, query.searchArea))
            .map(ad => fetcher.fetchAd(ad).then(extraAdData => ad.addSingleAdApi(extraAdData)))
            .value();
        
        yield _.chain(ads)
            .filter(ad => ad.entrance >= query.minimumEntranceDate)
            .map(ad => dispatcher(ad).then(() => adsRepository.updateSent(ad.id)))
            .value();
        
        yield adsRepository.flush();

        return {
            done: page.data.current_page === page.data.total_pages
        }
    });

    let currentPage = 1;
    while(true) {
        const result = yield processPage(currentPage++);

        if (result.done) {
            break;
        }
    }
}