const _ = require('lodash');
const uuid = require('node-uuid');

module.exports = (options) => {
  const base = "http://m.yad2.co.il/API/MadorResults.php?";
  const defaults = {
    CatID:2,    //cars=1,apartments=2
    SubCatID:1, //sell=1,rent=2
    PriceType:'0.0',
    AppType:'Android',
    AppVersion:'2.4',
    DeviceType:'GT-I9300',
    udid:uuid.v1()
  }

  return base + _.toPairs(Object.assign(options, defaults)).map(x => x.join('=')).join('&');
}