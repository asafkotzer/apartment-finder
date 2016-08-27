const fetch = require('node-fetch');
const geolib = require('geolib');
const query = require('./query.js');
const buildUrl = require('./url-builder.js');
const sendEmail = require('./email-sender.js');
const parseAd = require('./ad-parser.js');
const adsRepository = require('./ads-repository.js');
const adScraper = require('./ad-scraper.js')
const moment = require('moment');
const server = require('./management/server.js')
const _ = require('lodash');

const log = message => console.log('[' + moment().format('HH:mm') + '] ' + message);

Object.defineProperty(Array.prototype, 'do', { value: function(f) { for (var item of this) f(item); return this; } });

const checkForTraits = (ad, requiredTraits) => _.intersection(requiredTraits, ad.traits).length === requiredTraits.length;

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
        .do(x => adsRepository.updateSent(x.id))
        .map(x => {
          console.log('pre-scraping');
          if (query.scrape) {
            return adScraper.scrape(x.originalAdUrl, x.id, x.source)
              .then(scraped => Object.assign(x, scraped))
              .then(x => {
                console.log('Last filter:');
                console.log(x);
                if (checkForTraits(x, query.requiredTraits)) {
                  log('Sending email for ad: ' + x.originalAdUrl);
                  return sendEmail(x);
                }
                return Promise.resolve('did not send email');
              })
          }
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
  getAdsFromPage(buildUrl(query.apartment));
};

server();

fetchAds();
setInterval(() => fetchAds(), 60*60*1000);
