const dispatchConfig = require('./nconf').get('dispatcher');

switch(dispatchConfig.type) {
  case 'email':
    module.exports = require('./dispatchers/email');
    break; 
  case 'github':
    module.exports = require('./dispatchers/github');
    break;
  default:
    throw new Error("No dispatcher configured");
}