const _ = require('lodash');
const os = require('os');
const moment = require('moment');

function isNullOrWhitespace(string) {
    return !string || string.trim().length === 0;
}

function joinTextLines(...args) {
    return _.chain(args)
        .filter(_.negate(isNullOrWhitespace))
        .map(str => str.replace(/\u00a0/g, ' '))
        .join(os.EOL)
        .value();
}

function parseInnerDetail(str = '') {
    try {
        return str.replace(/\D/g, '');
    } catch (_) {
        return str;
    }
}

function parseEntrance(str = '') {
    const parsed = moment(str, 'DD/MM/YYYY');

    return {
        value: parsed.isValid() ? parsed : str,
        success: parsed.isValid(),
    };
}

class EnhancedAd {
    constructor(ad, apiResponse) {
        Object.assign(this, ad);

        const apartmentInnerDetails = _.chain(apiResponse)
            .get('data.info_bar_items', [])
            .keyBy('key')
            .mapValues('title')
            .value();
        const parsedEntrance = parseEntrance(apartmentInnerDetails.entrance);
        this.entrance = parsedEntrance.value;
        this.isEntranceKnown = parsedEntrance.success;
        this.floor = parseInnerDetail(apartmentInnerDetails.floor);
        this.rooms = parseInnerDetail(apartmentInnerDetails.rooms);
        this.meter = parseInnerDetail(apartmentInnerDetails.meter);

        this.extraInfo = _.chain(apiResponse)
            .get('data.additional_info', {})
            .values()
            .filter(_.negate(isNullOrWhitespace))
            .join(os.EOL)
            .value();
        this.traits = _.chain(apiResponse)
            .get('data.additional_info_items_v2', [])
            .keyBy('key')
            .mapValues('value')
            .value();
        this.extraData = _.chain(apiResponse)
            .get('data.important_info_items', [])
            .keyBy('key')
            .mapValues('value')
            .value();
        this.images = _.chain(apiResponse)
            .get('data.images', [])
            .concat(this.images)
            .compact()
            .map(str => str.trim())
            .uniq()
            .map(str => str.startsWith('//') ? 'http:' + str : str)
            .value();
        this.adNumber = _.get(apiResponse, 'data.ad_number', 'unknown');
        this.url = _.get(apiResponse, 'data.canonical_url');
    }
}

class BasicAd {
    constructor(apiResponse) {
        this.coordinates = _.mapValues(apiResponse.coordinates, parseFloat);
        this.images = [apiResponse.img_url].filter(Boolean);
        this.text = joinTextLines(apiResponse.line_1, apiResponse.line_2, apiResponse.line_3);
        this.title = joinTextLines(apiResponse.title_1, apiResponse.title_2);
        this.price = apiResponse.price;
        this.id = apiResponse.id;
        this.url = `http://yad2.co.il/s/c/${apiResponse.link_token}`;
        this.merchant = apiResponse.merchant === true;
        this.matchingAreas = [];
    }

    setMatchingAreas(areas) {
        this.matchingAreas = areas;
    }
}

function parseAds(apiResponse) {
    return _.chain(apiResponse)
        .get('data.feed_items', [])
        .filter(item => item.id)
        .filter(item => item.type === 'ad')
        .map(item => new BasicAd(item))
        .value();
}

module.exports = {
    parseAds,
    EnhancedAd,
    BasicAd,
};
