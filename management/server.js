const path = require('path');
const express = require('express');
const app = express();

app.set('port', (process.env.PORT || 3000));
app.use('/', express.static(path.join(__dirname, 'public')));
process.on('uncaughtException', err => console.log(err));

module.exports = () => {
  app.listen(app.get('port'), () => console.log('Management server started: http://localhost:' + app.get('port') + '/'));
};