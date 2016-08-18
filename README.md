# apartment-finder


## Usage
* Create a config.json and put it in the root folder
```
{
  "email": {
    "from": "your-replyto-address",
    "to": ["your-email-address"],
    "sendgridApiKey": "your-sendgrid-api-key"
  }
}
```

* Edit query.js
* Install dependencies:
```
npm install
```
* Download and install selenium standalone server:
```
curl -O http://selenium-release.storage.googleapis.com/2.53/selenium-server-standalone-2.53.1.jar
```
* Download the Chrome WebDriver from: https://sites.google.com/a/chromium.org/chromedriver/downloads
* Start selenium standalone server with Chrome webdriver.
```
java -jar -Dwebdriver.chrome.driver=$(pwd)/chromedriver selenium-server-standalone-2.53.1.jar
```
* Run
```
node index.js
```
