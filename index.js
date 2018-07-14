"use strict";

const _ = require('lodash');
const Octokit = require('@octokit/rest');

class Bugspots {
  constructor(oganization, repository, token) {
    this.organization = oganization;
    this.repository = repository;
    // Set up Octokit.
    this.octokit = Octokit();
    this.octokit.authenticate({
      type: 'token',
      token: token
    })
  }
  
  async analyze(branch = 'master', regex = /\b(fix(es|ed)?|close(s|d)?)\b/i) {
    let fixes = [];
    let spots = [];

    let commits = await this._paginate(this.octokit.repos.getCommits, {
      owner: this.organization,
      repo: this.repository,
      sha: branch
    });
  
    for (let commit of commits) {
      if (regex.test(commit.commit.message)) {
        let detail = await this.octokit.repos.getCommit({
          owner: this.organization,
          repo: this.repository,
          sha: commit.sha
        });
    
        log(detail);

        fixes.push({
          message: commit.commit.message.split('\n')[0],
          date: new Date(commit.commit.committer.date).getTime() / 1000,
          files: detail.data.files.map(file => file.filename)
        });
      }
    }

    if(fixes.length === 0) {
      return {
        fixes: fixes,
        spots: spots
      };
    }

    fixes = _.sortBy(fixes, ['date']);

    const currentTime = _.now() / 1000;
    const oldest_fix_date = _.first(fixes).date;
    fixes.forEach(fix => {
      fix.files.forEach(file => {
        const t = 1 - ((currentTime - fix.date) / (currentTime - oldest_fix_date));
        let target = _.find(spots, {file: file});
        if (!target) {
          spots.push({file: file, score: 0});
          target = _.find(spots, {file: file});
        }
        target.score += 1 / (1 + Math.exp((-12 * t) + 12));
      })
    });
  
    spots = _.reverse(_.sortBy(spots, ['score', 'file']));
  
    return {
      fixes: fixes,
      spots: spots
    };
  }
  
  async _paginate(method, param) {
    let response = await method(Object.assign(param, {per_page: 100}));
    let {data} = response;
    while (this.octokit.hasNextPage(response)) {
      response = await this.octokit.getNextPage(response);
      data = data.concat(response.data)
    }
    return data
  }
}

const debug = process.env.NODE_DEBUG && /\bgithub-bugspots\b/.test(process.env.NODE_DEBUG);
function log(text) {
  if(debug) {
    console.log(text);
  }
}

module.exports = Bugspots;
