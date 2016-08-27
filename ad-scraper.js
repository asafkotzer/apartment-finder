const webdriverio = require('webdriverio')
const Promise = require('bluebird');

const options = {
    desiredCapabilities: {
        browserName: 'chrome'
    }
};

const client = webdriverio.remote(options);

const scrape = (url, id, source) => {
  return new Promise((resolve, reject) => 
    {
      const subCatId = source === 'agent' ? 5 : 1;
      const res = {};
      client
        .init()
        .url(url)
        .waitForVisible('.v_checked', 5000)
        .execute(() => Array.prototype.map.call(document.getElementsByClassName('v_checked'), el => el.parentElement)
          .filter(x => !!x)
          .map(x => x.innerText))
        .then(result => res.traits = result.value)
        .execute(() => Array.prototype.map.call(document.querySelectorAll('.details_block_info > div > div'), el => el.innerText).join())
        .then(result => res.customText = result.value)
        .url(`http://www.yad2.co.il/Nadlan/ViewImage.php?CatID=2&SubCatID=${subCatId}&RecordID=${id}`)
        .execute(() => Array.prototype.map.call(document.querySelectorAll('.imgesMuff img'), el => el.src).map(x => x.replace('/s/', '/o/').replace('-s.jpg','.jpg')))
        .then(result => {
          console.log(result);
          res.images = result.value;
        })
        .then(() => resolve(res))
        .end()
    }
  );
}

module.exports = {scrape};
