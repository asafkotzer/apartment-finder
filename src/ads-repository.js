const promisify = require("promisify-node");
const jsonfile = promisify('jsonfile');

const previousAdsFilename = './previous-ads.json';
const previousAds = (jsonfile.readFileSync(previousAdsFilename) || {}).ads || [];

module.exports = {
	wasAlreadySent: id => previousAds.includes(id),
	updateSent: id => previousAds.push(id),
	flush: () => jsonfile.writeFile(previousAdsFilename, {ads: previousAds}),
};
