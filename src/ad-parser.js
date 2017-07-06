const _ = require('lodash');
const os = require('os');

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

function parseInnerDetail(str) {
    try {
        return str.replace(/\D/g, '');
    } catch (_) {
        return str;
    }
}

function parseEntrance(str) {
    try {
        return {
            value: moment(str, 'DD/MM/YYYY'),
            success: true,
        };
    } catch (_) {
        return {
            value: str,
            success: false,
        };
    }
}

class Ad {
    constructor(apiResponse) {
        this.coordinates = _.mapValues(apiResponse.coordinates, parseFloat);
        this.images = [apiResponse.img_url].filter(Boolean);
        this.text = joinTextLines(apiResponse.line_1, apiResponse.line_2, apiResponse.line_3);
        this.title = joinTextLines(apiResponse.title_1, apiResponse.title_2);
        this.price = apiResponse.price;
        this.id = apiResponse.id;
        this.url = `http://yad2.co.il/s/c/${apiResponse.link_token}`;
        this.merchant = apiResponse.merchant;
    }

    addSingleAdApi(apiResponse) {
        const apartmentInnerDetails = _.chain(apiResponse)
            .get('data.info_bar_items', [])
            .keyBy('key')
            .mapValues('title')
            .value();
        const parsedEntrance = parseEntrance(apartmentInnerDetails.entrance);
        this.entrance = parsedEntrance.value;
        this.isInstantEntrance = !parsedEntrance.success;
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
            .value();
        this.adNumber = _.get(apiResponse, 'data.ad_number', 'unknown');
        this.url = _.get(apiResponse, 'data.canonical_url');
    }
}

function parseAds(apiResponse) {
    return apiResponse.data.feed_items.filter(item => item.id).filter(item => item.type === 'ad').map(item => new Ad(item));
}

module.exports = {
    parseAds,
    Ad,
};
