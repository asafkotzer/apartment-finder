const fetch = require('node-fetch');
const geolib = require('geolib');
const query = require('./query.js');
const buildUrl = require('./url-builder.js');
const sendEmail = require('./email-sender.js');
const parseAd = require('./ad-parser.js');
const adsRepository = require('./ads-repository.js');
const moment = require('moment');

const log = message => console.log('[' + moment().format('HH:mm') + '] ' + message);

const getAdsFromPage = url => {
  if (!url) {
    log('Recursion complete')
    return;
  }

  fetch(url)
    .then(response => response.json())
    .then(json => {
      const results = ((json.Private || {}).Results || []).map(x => Object.assign(x, { source: 'private' }))
        .concat(((json.Trade || {}).Results || []).map(x => Object.assign(x, { source: 'agent' })));

      const operations = results
        .filter(x => x.Type === 'Ad')
        .map(x => parseAd(x))
        .filter(x => !adsRepository.wasAlreadySent(x.id))
        .filter(x => x.location.latitude && x.location.longitude)
        .filter(x => geolib.isPointInside(x.location, query.searchArea))
        .filter(x => x.publishDate.isAfter(query.minimumPublishDate))
        .map(x => {
          log('Sending email for ad: ' + x.id);
          adsRepository.updateSent(x.id);
          return sendEmail(x);
        });

        return Promise.all(operations)
          .then(() => adsRepository.flush())
          .then(() => json.NextPageURL);
    })
    .then(nextPageUrl => getAdsFromPage(nextPageUrl))
    .catch(err => log(err));
};

const fetchAds = () => {
  log('Starting recursion');
  getAdsFromPage(buildUrl(query.apartment))
};

fetchAds();
setInterval(() => fetchAds(), 60*60*1000);
