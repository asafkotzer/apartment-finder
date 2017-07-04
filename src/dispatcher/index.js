const dispatchConfig = require('../nconf').get('dispatcher');

switch (dispatchConfig.type) {
	case 'email':
		module.exports = require('./email');
		break;
	case 'github':
		module.exports = require('./github');
		break;
	default:
		throw new Error('No dispatcher configured');
}
