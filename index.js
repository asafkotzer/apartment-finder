const fetch = require('node-fetch');
const geolib = require('geolib');
const EmailTemplate = require('email-templates').EmailTemplate
const path = require('path')
const query = require('./query.js');
const buildUrl = require('./url-builder.js');
const sendEmail = require('./email-sender.js');
const parseAd = require('./ad-parser.js');
const jsonfile = require('jsonfile');
const util = require('util')
const blue
const _ = require('lodash');
const Handlebars = require('handlebars');

const templateDir = path.join(__dirname, 'new-ad-email')
const emailTemplate = new EmailTemplate(templateDir)
Handlebars.registerHelper('foo', function(source) {
  return source === 'agent' ? 'תיווך' : 'פרטי';
});

const previousAdsFilename = './previous-ads.json';
const previousAds = (jsonfile.readFileSync(previousAdsFilename) || {}).ads || [];

const getAdsFromPage = url => {
  if (!url) {
    console.log('Recursion complete')
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
        .filter(x => !_.includes(previousAds, x.id))
        .filter(x => x.location.latitude && x.location.longitude)
        .filter(x => geolib.isPointInside(x.location, query.searchArea))
        .filter(x => x.publishDate.isAfter(query.minimumPublishDate))
        .map(x => {
          previousAds.push(x.id);
          console.log('Sending email for ad: ' + x.originalAdUrl);

          return emailTemplate.render(x)
            .then(results => sendEmail({ to: query.emailAddresses, subject: results.text, body: results.html }));
        });

        return Promise.all(operations)
          .then(() => jsonfile.writeFile(previousAdsFilename, { ads: previousAds }))
          .then(() => json.NextPageURL);
    })
    .then(nextPageUrl => getAdsFromPage(nextPageUrl))
    .catch(err => console.error(err));
};

const fetchAds = () => {
  console.log('Starting recursion');
  getAdsFromPage(buildUrl(query.apartment))
};

fetchAds();
setInterval(() => fetchAds(), 60*60*1000);
