const config = require('../nconf').get('dispatcher').github;
const GithubApi = require('github');
const path = require('path');
const render = require('./github-renderer');

const github = new GithubApi();

function createIssue(owner, repo, title, body, labels) {
    github.authenticate(config.authentication);

    return github.issues.create({
        owner,
        repo,
        title,
        body,
        labels,
    });
}

function dispatch(ad) {
    const rendered = render(ad);

    return createIssue(config.repoOwner, config.repoName, rendered.title, rendered.body, config.labels).catch(err =>
        console.error(err)
    );
}

module.exports = dispatch;
