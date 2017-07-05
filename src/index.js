const fetch = require('node-fetch');
const geolib = require('geolib');
const query = require('../config/query');
const buildUrl = require('./url-builder');
const sendEmail = require('./dispatcher');
const parseAd = require('./ad-parser');
const adsRepository = require('./ads-repository');
const moment = require('moment');
const _ = require('lodash');

const log = message => console.log('[' + moment().format('HH:mm') + '] ' + message);

Object.defineProperty(Array.prototype, 'do', {
	value: function(f) {
		for (var item of this) f(item);
		return this;
	},
});

const incrementCounter = (summary, counterName, addition) =>
	(summary[counterName] = summary[counterName] + (addition || 1) || (addition || 1));

const getAdsFromPage = (url, summary) => {
	if (!url) {
		log('Recursion complete: ' + JSON.stringify(summary));
		return;
	}
	fetch(url)
		.then(response => response.json())
		.then(json => {
			const results = ((json.Private || {}).Results || [])
				.map(x => Object.assign(x, {source: 'private'}))
				.concat(((json.Trade || {}).Results || []).map(x => Object.assign(x, {source: 'agent'})));

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
				.do(x => log(x.id))
				.map(x => sendEmail(x));

			return Promise.all(operations).then(() => adsRepository.flush()).then(() => json.NextPageURL);
		})
		.then(nextPageUrl => getAdsFromPage(nextPageUrl, summary))
		.catch(err => log(err));
};

const fetchAds = () => {
	log('Starting recursion');
	getAdsFromPage(buildUrl(query.apartment), {});
};

fetchAds();
setInterval(() => fetchAds(), 60 * 60 * 1000);
