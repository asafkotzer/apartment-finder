const webdriverio = require('webdriverio')
const Promise = require('bluebird');
const _ = require('lodash');

const options = {
    desiredCapabilities: {
        browserName: 'chrome'
    }
};

const client = webdriverio.remote(options);

const getTraits = url => {
  return new Promise((resolve, reject) => 
    {
      client
        .init()
        .url(url)
        .waitForVisible('.v_checked', 5000)
        .execute(() => Array.prototype.map.call(document.getElementsByClassName('v_checked'), el => el.parentElement)
          .filter(x => !!x)
          .map(x => x.innerText))
        .then(result => resolve(result.value))
        .end()
    }
  );
}

const checkForTraits = (url, requiredTraits) => getTraits(url)
    .then(existingTraits => _.intersection(requiredTraits, existingTraits).length === requiredTraits.length);

module.exports = {checkForTraits};


