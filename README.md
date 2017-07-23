# apartment-finder


## Usage
* Create a config.json and put it in the `config` folder
```
{
  "dispatcher": {
    "type": "email",
    "email": {
      "from": "your-replyto-address",
      "to": ["your-email-address"],
      "sendgridApiKey": "your-sendgrid-api-key"
    }
  }
}

OR

{
  "dispatcher": {
    "type": "github",
    "github": {
      "authentication": {
        // Any of the options in https://github.com/mikedeboer/node-github#authentication
      }
      "repoOwner": "github-username",
      "repoName": "repo-name",
      "labels": ["labels to label your new issues with", "can be a few labels"]
    }
  }
}

```

* Edit query.js
* Install dependencies:
```
npm install
```
* Run
```
node index.js
```
