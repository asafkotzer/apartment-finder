const fetch = require('node-fetch');
const FormData = require('form-data');
const query = require('../config/query');

const BASE_URL = 'https://app.yad2.co.il/api/v1.0/';
const BASE_PAGE_URL = BASE_URL + 'feed/feed.php';
const BASE_AD_URL = BASE_URL + 'ad/ad.php';

function fetchPage(options) {
	const queryParams = Object.assign({}, query.apartment, options);
	const formData = new FormData();

	Object.keys(queryParams).forEach(key => {
		formData.append(key, query.apartment[key]);
	});

	return fetch(BASE_PAGE_URL, {
		method: 'post',
		body: formData,
	}).then(r => r.json());
}

function fetchAd(ad) {
	const adUrl = BASE_AD_URL + '?id=' + ad.id;
	return fetch(adUrl).then(r => r.json());
}

module.exports = {
	fetchPage,
	fetchAd,
};
