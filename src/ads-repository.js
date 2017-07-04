const jsonfile = require('jsonfile');
const _ = require('lodash');

const previousAdsFilename = './previous-ads.json';
const previousAds = (jsonfile.readFileSync(previousAdsFilename) || {}).ads || [];

module.exports = {
	wasAlreadySent: id => _.includes(previousAds, id),
	updateSent: id => previousAds.push(id),
	flush: () => jsonfile.writeFile(previousAdsFilename, {ads: previousAds}),
};
