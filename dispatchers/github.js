const config = require("../nconf").get("dispatcher").github;
const GithubApi = require("github");
const path = require('path');
const EmailTemplate = require('email-templates').EmailTemplate
const templateDir = path.join(__dirname, '..', 'new-ad-email')
const emailTemplate = new EmailTemplate(templateDir)

const Handlebars = require('handlebars');
Handlebars.registerHelper('formatSource', function(source) {
  return source === 'agent' ? 'תיווך' : 'פרטי';
});

const github = new GithubApi();

function createIssue(owner, repo, title, body, labels) {
  github.authenticate(config.authentication);

  return github.issues.create({
    owner,
    repo,
    title,
    body,
    labels
  });
}

function dispatch(model) {
    return emailTemplate
        .render(model)
        .then(results =>
            createIssue(config.repoOwner, config.repoName, results.text, results.html, config.labels)
        )
        .catch(err => console.error(err));
}

module.exports = dispatch;