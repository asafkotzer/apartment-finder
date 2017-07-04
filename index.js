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

const log = message => console.log('[' + moment().format('HH:mm') + '] ' + message);

Object.defineProperty(Array.prototype, 'do', { value: function (f) { for (var item of this) f(item); return this; } });

const incrementCounter = (summary, counterName, addition) => summary[counterName] = (summary[counterName] + (addition || 1)) || (addition || 1);

const getAdsFromPage = (url, summary) => {

  fetch(url)
    .then(response => response.json())
    .then(json => {
           const results = (json.data || {}).feed_items || [];

      let operations = results
        .filter(x => x.type === 'ad')
        .map(x => parseAd(x))
        .do(x => incrementCounter(summary, 'retrieved', x.length))
        .filter(x => !adsRepository.wasAlreadySent(x.id))
        .do(x => incrementCounter(summary, 'not_already_handled', x.length));

      if (query.appartmentTypes) {
        operations = operations
          .filter(x => query.appartmentTypes.includes(x.aparttype))
          .do(x => incrementCounter(summary, 'within_apartments_types', x.length));
      }

      operations = operations
        .filter(x => x.location.latitude && x.location.longitude)
        .filter(x => geolib.isPointInside(x.location, query.searchArea))
        .do(x => incrementCounter(summary, 'within_polygon', x.length))
        .filter(x => x.publishDate.isAfter(query.minimumPublishDate))
        .do(x => incrementCounter(summary, 'after_min_publish_date', x.length))
        .do(x => adsRepository.updateSent(x.id))
        .do(x => log(x.id))
        .map(x => {
          if (query.scrape) {
            return adScraper.scrape(x.originalAdUrl, x.id, x.source)
              .then(scraped => Object.assign(x, scraped))
              .then(x => {
                log('Sending email for ad: ' + x.originalAdUrl);
                return sendEmail(x);
              })
          }
          incrementCounter(summary, 'skipped_advanced_filter');
          return sendEmail(x);
        });

      return Promise.all(operations)
        .then(() => adsRepository.flush())
        .then(() => ({ totalPages: json.data.total_pages, currentPage: json.data.current_page }));
    })
    .then(({ totalPages, currentPage }) => {
      if (totalPages == currentPage) {
        log('Recursion complete: ' + JSON.stringify(summary))
        return;
      }
      else {
        //console.log(`another page ${currentPage + 1} from ${totalPages}`)
        getAdsFromPage(buildUrl(query.apartment, currentPage + 1), summary)
      }
    })
    .catch(err => log(err));
};

const fetchAds = () => {
  log('Starting recursion');
  //console.log(buildUrl(query.apartment));
  getAdsFromPage(buildUrl(query.apartment), {});
};

server();

fetchAds();
setInterval(() => fetchAds(), 60 * 60 * 1000);
