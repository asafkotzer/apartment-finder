const fetch = require('node-fetch');
const geolib = require('geolib');
const sendgrid = require('sendgrid')('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');
const EmailTemplate = require('email-templates').EmailTemplate
const path = require('path')
const query = require('./query.js');
const buildUrl = require('./url-builder.js');
const sendEmail = require('./email-sender.js');
const parseAd = require('./ad-parser.js');
const jsonfile = require('jsonfile');
const util = require('util')
const _ = require('lodash');

const templateDir = path.join(__dirname, 'new-ad-email')
const emailTemplate = new EmailTemplate(templateDir)

const url = buildUrl(query.apartment);
console.log(url)

const previousAdsFilename = './previous-ads.json';
const previousAds = (jsonfile.readFileSync(previousAdsFilename) || {}).ads || [];
console.log(previousAds)

fetch(url)
  .then(response => response.json())
  .then(json => {
    const results = ((json.Private || {}).Results || []).map(x => Object.assign(x, { source: 'private' }))
      .concat(((json.Trade || {}).Results || []).map(x => Object.assign(x, { source: 'agent' })));

    results
      .filter(x => x.Type === 'Ad')
      .map(x => parseAd(x))
      .filter(x => !_.includes(previousAds, x.id))
      .filter(x => x.location.latitude && x.location.longitude)
      .filter(x => geolib.isPointInside(x.location, query.searchArea))
      .filter(x => x.publishDate.isAfter(query.minimumPublishDate))
      .forEach(x => {
        previousAds.push(x.id);
        console.log(x.id);
        // emailTemplate.render(queryResult[0], (err, results) => {
        //   sendEmail({ 
        //     to: 'asafkotzer@gmail.com',
        //     subject: results.text,
        //     body: results.html
        //   })
        // })
      });
  })
  .then(() => jsonfile.writeFile(previousAdsFilename, { ads: previousAds }))
  .catch(err => console.error(err));

console.log("waiting 10 seconds");
setTimeout(function() { }, 10000);