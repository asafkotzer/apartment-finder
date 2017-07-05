const moment = require('moment');
const he = require('he');

const log = message => console.log('[' + moment().format('HH:mm') + '] ' + message);
const decodeIfExist = (o) => o ? he.decode(o) : '';

const getAdSource = (subcat_id) => {
  switch (subcat_id) {
    case (6):
      return 'agent';
    case (2):
    default:
      return 'private';
  }
}

module.exports = rawJson => {
  //log('raw jason: ' + rawJson.Line6)

  let [aparttype = '', roomCount = '', floor = ''] = decodeIfExist(rawJson.line_1).split('·').map(x => x.trim().replace('\"', '').replace(/'/g, ''));

  return {
    id: rawJson.id,
    source: getAdSource(rawJson.subcat_id),
    city: decodeIfExist(rawJson.title_1).replace('\"', '').replace(/'/g, ''),
    address: (decodeIfExist(rawJson.title_2).split(',')[0] || '').trim().replace('\"', '').replace(/'/g, ''),
    roomCount,
    aparttype,
    floor,
    price: (rawJson.price.match(/\d+/g) || []).join(''),
    publishDate: moment(rawJson.date, 'YYYY-MM-DD HH:mm:ss'),
    picture: decodeIfExist(rawJson.img_url).replace('//', ''),
    location: {
      latitude: rawJson.coordinates ? rawJson.coordinates.latitude : undefined,
      longitude: rawJson.coordinates ? rawJson.coordinates.longitude : undefined,
    },
    originalAdUrl: `http://yad2.co.il/s/c/${rawJson.id}`
  }
};