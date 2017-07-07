const promisify = require("promisify-node");
const jsonfile = promisify('jsonfile');
const path = require('path');

const previousAdsFilename = path.join(__dirname, '..', 'previous-ads.json');
const previousAds = (jsonfile.readFileSync(previousAdsFilename) || {}).ads || [];

module.exports = {
	wasAlreadySent: id => previousAds.includes(id),
	updateSent: id => previousAds.push(id),
	flush: () => jsonfile.writeFile(previousAdsFilename, {ads: previousAds}),
};
