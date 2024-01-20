const path = require('path');

module.exports = {
  port: process.env.PORT || 5000,
  labelName: 'Vacation',
  credentialsPath: path.join(__dirname, 'credentials.json'),
  scopes: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.labels',
    'https://mail.google.com/'
  ],
};