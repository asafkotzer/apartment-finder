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

const incrementCounter = (summary, counterName, addition) => summary[counterName] = (summary[counterName] + (addition || 1)) || (addition || 1);

const getAdsFromPage = (url, summary) => {
  if (!url) {
    log('Recursion complete: ' + JSON.stringify(summary))
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
        .do(x => incrementCounter(summary, 'retrieved', x.length))
        .filter(x => !adsRepository.wasAlreadySent(x.id))
        .do(x => incrementCounter(summary, 'not_already_handled', x.length))
        .filter(x => x.location.latitude && x.location.longitude)
        .filter(x => geolib.isPointInside(x.location, query.searchArea))
        .do(x => incrementCounter(summary, 'within_polygon', x.length))
        .filter(x => x.publishDate.isAfter(query.minimumPublishDate))
        .do(x => incrementCounter(summary, 'after_min_publish_date', x.length))
        .do(x => adsRepository.updateSent(x.id))
        .map(x => {
          if (query.scrape) {
            return adScraper.scrape(x.originalAdUrl, x.id, x.source)
              .then(scraped => Object.assign(x, scraped))
              .then(x => {
                if (checkForTraits(x, query.requiredTraits)) {
                  incrementCounter(summary, 'passed_advanced_filter');
                  log('Sending email for ad: ' + x.originalAdUrl);
                  return sendEmail(x);
                }
                return Promise.resolve('did not send email');
              })
          }
          incrementCounter(summary, 'skipped_advanced_filter');
          return sendEmail(x);
        });

        return Promise.all(operations)
          .then(() => adsRepository.flush())
          .then(() => json.NextPageURL);
    })
    .then(nextPageUrl => getAdsFromPage(nextPageUrl, summary))
    .catch(err => log(err));
};

const fetchAds = () => {
  log('Starting recursion');
  getAdsFromPage(buildUrl(query.apartment), {});
};

server();

fetchAds();
setInterval(() => fetchAds(), 60*60*1000);
