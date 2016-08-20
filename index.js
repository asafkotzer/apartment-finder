const fetch = require('node-fetch');
const geolib = require('geolib');
const query = require('./query.js');
const buildUrl = require('./url-builder.js');
const sendEmail = require('./email-sender.js');
const parseAd = require('./ad-parser.js');
const adsRepository = require('./ads-repository.js');
const browserFilter = require('./browser-filter.js')
const moment = require('moment');
const server = require('./management/server.js')

const log = message => console.log('[' + moment().format('HH:mm') + '] ' + message);

Object.defineProperty(Array.prototype, 'do', { value: function(f) { for (var item of this) f(item); return this; } });

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
        /*
        Make checking for traits configurable (config.json)

        Get the description: Array.prototype.map.call(document.querySelectorAll('.details_block_info > div > div'), el => el.innerText)

        Get the pictures:
        1. go to http://www.yad2.co.il/Nadlan/ViewImage.php?CatID=2&SubCatID={query.SubCatID}&RecordID={x.id}
        2. on that page, execute:
           Array.prototype.map.call(document.querySelectorAll('.imgesMuff img'), el => el.src).map(x => x.replace('/s/', '/o/').replace('-s.jpg','.jpg'))
        3. Follow each URL to fetch the image
        */
        .map(x => browserFilter.checkForTraits(x.originalAdUrl, query.requiredTraits)
          .then(hasTraits => {
            console.log('Does ' + x.originalAdUrl + ' have traits? ' + hasTraits);
            if (hasTraits) {
              log('Sending email for ad: ' + x.originalAdUrl);
              return sendEmail(x);
            }
            return Promise.resolve('did not send email');
        }));

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

server();

fetchAds();
setInterval(() => fetchAds(), 60*60*1000);
