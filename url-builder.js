const _ = require('lodash');

module.exports = (options, page = 1) => {
  const base = "https://app.yad2.co.il/api/v1.0/feed/feed.php?";
  const defaults = {
    cat: 2,    //cars=1,apartments=2
    subcat: 2, //buy=1,rent=2, tivuc rent=6
    feedtype: 'search',
    sort: 0,
    location_type: 3,
    page
  }

  return base + _.toPairs(Object.assign(defaults, options)).map(x => x.join('=')).join('&');
}